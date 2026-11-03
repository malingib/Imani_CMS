import { handleCors, corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { digest, loadEffectiveMpesa, requestTransactionStatus } from '../_shared/mpesa.ts';
const SUPABASE_URL=Deno.env.get('SUPABASE_URL')||'',SERVICE_KEY=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',ANON_KEY=Deno.env.get('SUPABASE_ANON_KEY')||'';
const json=(status:number,body:Record<string,unknown>)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,'Content-Type':'application/json'}});
const normalizePhone=(value:unknown)=>{const digits=String(value||'').replace(/\D/g,'');if(/^0[17]\d{8}$/.test(digits))return '254'+digits.slice(1);if(/^[17]\d{8}$/.test(digits))return '254'+digits;if(/^254[17]\d{8}$/.test(digits))return digits;throw new Error('Enter a valid Kenyan M-Pesa phone number.');};
const nairobiTimestamp=()=>{const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Nairobi',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date());const values=Object.fromEntries(parts.map(p=>[p.type,p.value]));return String(values.year)+String(values.month)+String(values.day)+String(values.hour)+String(values.minute)+String(values.second);};
Deno.serve(async(req:Request)=>{
 const cors=handleCors(req);if(cors)return cors;if(req.method!=='POST')return json(405,{error:'Method not allowed.'});
 if(!SUPABASE_URL||!SERVICE_KEY||!ANON_KEY)return json(500,{error:'Payment service is not configured.'});
 const admin=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false}});
 let body:Record<string,any>;try{body=await req.json();}catch{return json(400,{error:'Invalid JSON.'});}
 if(body?.Body?.stkCallback){
  const query=new URL(req.url).searchParams,paymentId=query.get('payment_id')||'',callbackToken=query.get('token')||'';
  if(!/^[0-9a-f-]{36}$/i.test(paymentId)||callbackToken.length<32)return json(401,{error:'Invalid callback token.'});
  const {data:intent,error:lookupError}=await admin.from('mpesa_payment_intents').select('id,church_id,amount,phone_number,payer_name,purpose,status,checkout_request_id,callback_token_hash,mpesa_receipt_number').eq('id',paymentId).maybeSingle();
  if(lookupError||!intent||await digest(callbackToken)!==intent.callback_token_hash)return json(401,{error:'Invalid callback token.'});
  const callback=body.Body.stkCallback,receivedCheckoutId=String(callback.CheckoutRequestID||'');if(!receivedCheckoutId)return json(400,{ResultCode:1,ResultDesc:'Checkout request ID is required.'});if(intent.checkout_request_id&&receivedCheckoutId!==String(intent.checkout_request_id))return json(200,{ResultCode:0,ResultDesc:'Callback acknowledged.'});
  const items=Array.isArray(callback.CallbackMetadata?.Item)?callback.CallbackMetadata.Item:[];
  const item=(name:string)=>items.find((v:any)=>v.Name===name)?.Value;
  const receipt=String(item('MpesaReceiptNumber')||''),paidAmount=Number(item('Amount')),paidPhone=String(item('PhoneNumber')||''),resultCode=Number(callback.ResultCode);
  const matches=resultCode===0&&!!receipt&&Number.isFinite(paidAmount)&&paidAmount===Number(intent.amount)&&paidPhone===intent.phone_number;
  const status=matches?'reconciliation_pending':resultCode===0?'verification_required':'failed';
  const description=matches?'STK callback matched. Requesting Safaricom transaction-status verification.':resultCode===0?'STK callback did not match the amount or phone. Manual reconciliation is required.':String(callback.ResultDesc||'M-Pesa request failed.').slice(0,500);
  const {data:claimed,error:claimError}=await admin.from('mpesa_payment_intents').update({status,result_code:Number.isFinite(resultCode)?resultCode:null,result_description:description,callback_payload:body,checkout_request_id:intent.checkout_request_id||receivedCheckoutId,mpesa_receipt_number:matches?receipt:null,transaction_date:matches?new Date().toISOString():null}).eq('id',paymentId).is('callback_payload',null).neq('status','succeeded').select('id').maybeSingle();
  if(claimError)return json(500,{ResultCode:1,ResultDesc:'Callback processing failed.'});if(!claimed)return json(200,{ResultCode:0,ResultDesc:'Callback already processed.'});
  if(matches){try{const config=await loadEffectiveMpesa(admin,intent.church_id);if(!config)throw new Error('Daraja configuration unavailable.');const result=await requestTransactionStatus(admin,SUPABASE_URL,{...intent,mpesa_receipt_number:receipt},config);if(result.status==='verification_required')return json(200,{ResultCode:0,ResultDesc:'Callback acknowledged; manual reconciliation required.'});}catch{await admin.from('mpesa_payment_intents').update({status:'verification_required',reconciliation_status:'request_failed',result_description:'STK receipt received, but Safaricom transaction-status verification could not be requested.'}).eq('id',paymentId).eq('status','reconciliation_pending').eq('reconciliation_status','requesting');}}
  return json(200,{ResultCode:0,ResultDesc:'Callback acknowledged.'});
 }
 const authorization=req.headers.get('Authorization');if(!authorization?.startsWith('Bearer '))return json(401,{error:'Sign in required.'});
 const userClient=createClient(SUPABASE_URL,ANON_KEY,{global:{headers:{Authorization:authorization}},auth:{persistSession:false}});
 const {data:userData,error:userError}=await userClient.auth.getUser();if(userError||!userData.user)return json(401,{error:'Invalid session.'});
 const churchId=String(body.church_id||''),amount=Number(body.amount),purpose=String(body.purpose||''),payerName=String(body.payer_name||'').trim().slice(0,120);
 let phoneNumber:string;try{phoneNumber=normalizePhone(body.phone_number);}catch(e){return json(400,{error:e instanceof Error?e.message:'Invalid phone number.'});}
 if(!/^[0-9a-f-]{36}$/i.test(churchId)||!Number.isSafeInteger(amount)||amount<1||amount>250000||!['Tithe','Offering','Project','Harambee','Benevolence'].includes(purpose))return json(400,{error:'Enter a valid church, amount and contribution type.'});
 const platformOwner=userData.user.app_metadata?.role==='SUPER_ADMIN';
 if(!platformOwner){const {data:membership,error}=await admin.from('church_memberships').select('role').eq('church_id',churchId).eq('user_id',userData.user.id).eq('status','active').maybeSingle();if(error||!['ADMIN','TREASURER'].includes(String(membership?.role||'')))return json(403,{error:'You need church finance permission to request an M-Pesa payment.'});}
 let config;try{config=await loadEffectiveMpesa(admin,churchId);}catch{return json(500,{error:'Daraja configuration could not be loaded securely.'});}
 if(!config||!config.key||!config.secret||!config.passkey||!config.shortcode)return json(503,{error:'Configure M-Pesa Daraja credentials in Integrations before requesting payments.'});
 const callbackToken=crypto.randomUUID(),accountReference=(config.accountReference.slice(0,7)+crypto.randomUUID().slice(0,5)).slice(0,12);
 const {data:intent,error:insertError}=await admin.from('mpesa_payment_intents').insert({church_id:churchId,created_by:userData.user.id,payer_name:payerName,phone_number:phoneNumber,amount,purpose,account_reference:accountReference,callback_token_hash:await digest(callbackToken),status:'initiating'}).select('id').single();
 if(insertError||!intent)return json(500,{error:'Could not create the payment request.'});
 const callbackUrl=new URL(SUPABASE_URL.replace(/\/$/,'')+'/functions/v1/mpesa-stk');callbackUrl.searchParams.set('payment_id',intent.id);callbackUrl.searchParams.set('token',callbackToken);
 const host=config.environment==='sandbox'?'https://sandbox.safaricom.co.ke':'https://api.safaricom.co.ke';
 try{
  const authResponse=await fetch(host+'/oauth/v1/generate?grant_type=client_credentials',{headers:{Authorization:'Basic '+btoa(config.key+':'+config.secret),Accept:'application/json'},signal:AbortSignal.timeout(12000)});
  const authData=await authResponse.json().catch(()=>null);if(!authResponse.ok||!authData?.access_token)throw new Error('Daraja authentication failed.');
  const timestamp=nairobiTimestamp(),password=btoa(config.shortcode+config.passkey+timestamp);
  const response=await fetch(host+'/mpesa/stkpush/v1/processrequest',{method:'POST',headers:{Authorization:'Bearer '+authData.access_token,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({BusinessShortCode:config.shortcode,Password:password,Timestamp:timestamp,TransactionType:config.transactionType,Amount:amount,PartyA:phoneNumber,PartyB:config.shortcode,PhoneNumber:phoneNumber,CallBackURL:callbackUrl.toString(),AccountReference:accountReference,TransactionDesc:purpose.slice(0,13)}),signal:AbortSignal.timeout(15000)});
  const result=await response.json().catch(()=>null);
  if(!response.ok||!result||String(result.ResponseCode)!=='0'||!result.CheckoutRequestID){await admin.from('mpesa_payment_intents').update({status:'failed',result_description:String(result?.errorMessage||result?.ResponseDescription||'Daraja rejected the request.').slice(0,500)}).eq('id',intent.id);return json(502,{error:'Safaricom did not accept the STK request.'});}
  const {data:updated,error:updateError}=await admin.from('mpesa_payment_intents').update({status:'pending',merchant_request_id:result.MerchantRequestID,checkout_request_id:result.CheckoutRequestID,result_description:result.CustomerMessage||'STK prompt sent.'}).eq('id',intent.id).eq('status','initiating').select('id').maybeSingle();
  if(updateError){await admin.from('mpesa_payment_intents').update({status:'verification_required',result_description:'Safaricom accepted the request but tracking details could not be saved. Reconcile before retrying.'}).eq('id',intent.id);return json(502,{error:'Safaricom accepted the request, but tracking details could not be saved. Reconcile before retrying.'});}
  return json(200,{payment_id:intent.id,status:'pending',customer_message:result.CustomerMessage||'Check the phone and enter the M-Pesa PIN.'});
 }catch{await admin.from('mpesa_payment_intents').update({status:'verification_required',result_description:'The STK initiation result is uncertain. Reconcile before retrying.'}).eq('id',intent.id);return json(502,{error:'The STK request result is uncertain. Check payment status before retrying.'});}
});
