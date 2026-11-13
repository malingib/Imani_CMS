import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCors, corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { digest, loadEffectiveMpesa, parseDarajaTransactionDate, postConfirmedPayment, refreshReceiptSmsStatus, requestTransactionStatus } from '../_shared/mpesa.ts';
const SUPABASE_URL=Deno.env.get('SUPABASE_URL')||'',SERVICE_KEY=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',ANON_KEY=Deno.env.get('SUPABASE_ANON_KEY')||'';
const json=(status:number,body:Record<string,unknown>)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,'Content-Type':'application/json'}});
Deno.serve(async(req:Request)=>{
 const cors=handleCors(req);if(cors)return cors;if(req.method!=='POST')return json(405,{error:'Method not allowed.'});
 if(!SUPABASE_URL||!SERVICE_KEY||!ANON_KEY)return json(500,{error:'Payment service is not configured.'});
 const admin=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false}});
 let body:Record<string,any>;try{body=await req.json();}catch{return json(400,{error:'Invalid JSON.'});}
 if(body?.Result){
  const query=new URL(req.url).searchParams,paymentId=query.get('payment_id')||'',token=query.get('token')||'';
  if(!/^[0-9a-f-]{36}$/i.test(paymentId)||token.length<32)return json(401,{ResultCode:1,ResultDesc:'Invalid callback token.'});
  const {data:intent,error}=await admin.from('mpesa_payment_intents').select('id,church_id,amount,phone_number,payer_name,purpose,status,reconciliation_status,mpesa_receipt_number,reconcile_token_hash,transaction_date').eq('id',paymentId).maybeSingle();
  if(error||!intent)return json(401,{ResultCode:1,ResultDesc:'Invalid callback token.'});
  if(intent.status==='succeeded'||(!intent.reconcile_token_hash&&intent.reconciliation_status&&intent.reconciliation_status!=='requested'&&intent.reconciliation_status!=='requesting'))return json(200,{ResultCode:0,ResultDesc:'Reconciliation callback already processed.'});
  if(!intent.reconcile_token_hash||await digest(token)!==intent.reconcile_token_hash)return json(401,{ResultCode:1,ResultDesc:'Invalid callback token.'});
  const result=body.Result,params=Array.isArray(result.ResultParameters?.ResultParameter)?result.ResultParameters.ResultParameter:[];
  const value=(key:string)=>params.find((p:any)=>p.Key===key)?.Value;
  const receipt=String(value('ReceiptNo')||result.TransactionID||''),amount=Number(value('Amount')),txStatus=String(value('TransactionStatus')||'').toLowerCase(),resultCode=Number(result.ResultCode);
  const confirmed=resultCode===0&&txStatus==='completed'&&receipt===String(intent.mpesa_receipt_number||'')&&Number.isFinite(amount)&&amount===Number(intent.amount);
  const failed=resultCode===0&&['cancelled','declined','expired','reversed','failed'].includes(txStatus);
  const confirmedDate=parseDarajaTransactionDate(value('TransactionDate'))||intent.transaction_date;
  const nextStatus=confirmed?'reconciliation_pending':failed?'failed':'verification_required';
  const {data:claimed,error:updateError}=await admin.from('mpesa_payment_intents').update({status:nextStatus,reconciliation_status:confirmed?'posting':failed?'failed':'mismatch',result_code:Number.isFinite(resultCode)?resultCode:null,result_description:confirmed?'Safaricom transaction status confirmed the receipt.':String(result.ResultDesc||'Transaction status requires manual review.').slice(0,500),transaction_date:confirmedDate,reconcile_token_hash:null}).eq('id',paymentId).eq('reconcile_token_hash',intent.reconcile_token_hash).in('reconciliation_status',['requested','requesting']).neq('status','succeeded').select('id').maybeSingle();
  if(updateError)return json(500,{ResultCode:1,ResultDesc:'Reconciliation callback could not be saved.'});
  if(!claimed)return json(200,{ResultCode:0,ResultDesc:'Reconciliation callback already processed.'});
  if(confirmed){try{await postConfirmedPayment(admin,{...intent,transaction_date:confirmedDate},receipt);}catch{return json(500,{ResultCode:1,ResultDesc:'Confirmed payment could not be posted to the ledger.'});}}
  return json(200,{ResultCode:0,ResultDesc:'Reconciliation callback acknowledged.'});
 }
 const authorization=req.headers.get('Authorization');if(!authorization?.startsWith('Bearer '))return json(401,{error:'Sign in required.'});
 const userClient=createClient(SUPABASE_URL,ANON_KEY,{global:{headers:{Authorization:authorization}},auth:{persistSession:false}});
 const {data:userData,error:userError}=await userClient.auth.getUser();if(userError||!userData.user)return json(401,{error:'Invalid session.'});
 const paymentId=String(body.payment_id||'');if(!/^[0-9a-f-]{36}$/i.test(paymentId))return json(400,{error:'Valid payment ID is required.'});
 const {data:intent,error}=await admin.from('mpesa_payment_intents').select('id,church_id,created_by,status,amount,purpose,phone_number,payer_name,mpesa_receipt_number,result_description,sms_status,sms_provider_status,sms_provider_message_id,sms_last_checked_at,receipt_sms_sent_at,created_at,updated_at').eq('id',paymentId).maybeSingle();
 if(error||!intent)return json(404,{error:'Payment request not found.'});
 const platformOwner=userData.user.app_metadata?.role==='SUPER_ADMIN';
 if(!platformOwner){const {data:membership,error:membershipError}=await admin.from('church_memberships').select('role').eq('church_id',intent.church_id).eq('user_id',userData.user.id).eq('status','active').maybeSingle();if(membershipError||!['ADMIN','TREASURER'].includes(String(membership?.role||'')))return json(403,{error:'You cannot view this payment request.'});}
 if(body.action==='reconcile'){
  if(intent.status==='succeeded')return json(200,{status:'succeeded',message:'This payment is already reconciled.'});
  if(!intent.mpesa_receipt_number)return json(400,{error:'A Safaricom receipt is required before transaction-status reconciliation.'});
  let config;try{config=await loadEffectiveMpesa(admin,intent.church_id);}catch{return json(500,{error:'Daraja configuration could not be loaded.'});}
  if(!config)return json(503,{error:'Daraja configuration is not available.'});
  try{return json(200,await requestTransactionStatus(admin,SUPABASE_URL,intent,config));}catch{return json(502,{error:'Safaricom transaction-status query failed. Check Daraja configuration and retry.'});}
 }
 const refreshed=await refreshReceiptSmsStatus(admin,intent);
 return json(200,{payment_id:intent.id,status:intent.status,amount:intent.amount,purpose:intent.purpose,phone_number:intent.phone_number,payer_name:intent.payer_name,receipt_number:intent.mpesa_receipt_number,sms_status:refreshed.sms_status,sms_provider_status:refreshed.sms_provider_status,sms_last_checked_at:refreshed.sms_last_checked_at,receipt_sms_sent_at:refreshed.receipt_sms_sent_at,message:intent.result_description,created_at:intent.created_at,updated_at:intent.updated_at});
});
