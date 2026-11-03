import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
export type MpesaConfig={key:string;secret:string;passkey:string;shortcode:string;environment:'sandbox'|'production';transactionType:string;accountReference:string;initiatorName:string;securityCredential:string};
const digest=async(value:string)=>{const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(hash)].map(v=>v.toString(16).padStart(2,'0')).join('');};
export {digest};
export async function loadProviderConfig(admin:ReturnType<typeof createClient>,scope:'church'|'platform',churchId:string|null,provider:'mpesa'|'mobiwave'){
 const {data,error}=await admin.rpc('integration_config_get',{p_scope:scope,p_church_id:churchId,p_provider:provider});if(error)throw error;
 const row=Array.isArray(data)?data[0]:data;if(!row||!row.secret||typeof row.secret!=='object')return null;
 return {settings:row.settings as Record<string,unknown>,secrets:row.secret as Record<string,unknown>};
}
export async function loadEffectiveMpesa(admin:ReturnType<typeof createClient>,churchId:string):Promise<MpesaConfig|null>{
 const local=await loadProviderConfig(admin,'church',churchId,'mpesa');const config=local||await loadProviderConfig(admin,'platform',null,'mpesa');if(!config)return null;
 const s=config.settings,c=config.secrets;return {key:String(c.consumerKey||''),secret:String(c.consumerSecret||''),passkey:String(c.passkey||''),shortcode:String(s.shortcode||''),environment:s.environment==='sandbox'?'sandbox':'production',transactionType:String(s.transactionType||'CustomerPayBillOnline'),accountReference:String(s.accountReference||'IMANI'),initiatorName:String(c.initiatorName||''),securityCredential:String(c.securityCredential||'')};
}
async function getDarajaAccess(config:Pick<MpesaConfig,'key'|'secret'|'environment'>){
 const host=config.environment==='sandbox'?'https://sandbox.safaricom.co.ke':'https://api.safaricom.co.ke';
 const response=await fetch(host+'/oauth/v1/generate?grant_type=client_credentials',{headers:{Authorization:'Basic '+btoa(config.key+':'+config.secret),Accept:'application/json'},signal:AbortSignal.timeout(12000)});
 const data=await response.json().catch(()=>null);if(!response.ok||!data||typeof data.access_token!=='string')throw new Error('Daraja authentication failed.');
 return {host,accessToken:data.access_token as string};
}
export async function requestTransactionStatus(admin:ReturnType<typeof createClient>,supabaseUrl:string,intent:Record<string,any>,config:MpesaConfig){
 if(!config.initiatorName||!config.securityCredential||!intent.mpesa_receipt_number){
  await admin.from('mpesa_payment_intents').update({status:'verification_required',reconciliation_status:'not_configured',result_description:'STK callback received. Add the Daraja transaction-status initiator and encrypted security credential to enable automated reconciliation.'}).eq('id',intent.id);
  return {status:'verification_required',message:'Transaction-status credentials are not configured. Add them in Integrations before reconciling.'};
 }
 const callbackToken=crypto.randomUUID(),callbackUrl=new URL(supabaseUrl.replace(/\/$/,'')+'/functions/v1/mpesa-status');
 callbackUrl.searchParams.set('payment_id',String(intent.id));callbackUrl.searchParams.set('token',callbackToken);
 const {error:saveError}=await admin.from('mpesa_payment_intents').update({status:'reconciliation_pending',reconciliation_status:'requesting',reconcile_token_hash:await digest(callbackToken),result_description:'Safaricom transaction-status query is being submitted.'}).eq('id',intent.id);
 if(saveError)throw saveError;
 try{
  const {host,accessToken}=await getDarajaAccess(config);
  const response=await fetch(host+'/mpesa/transactionstatus/v1/query',{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({Initiator:config.initiatorName,SecurityCredential:config.securityCredential,CommandID:'TransactionStatusQuery',TransactionID:String(intent.mpesa_receipt_number),PartyA:config.shortcode,IdentifierType:'4',ResultURL:callbackUrl.toString(),QueueTimeOutURL:callbackUrl.toString(),Remarks:'Imani payment reconciliation',Occasion:'STK receipt verification'}),signal:AbortSignal.timeout(15000)});
  const data=await response.json().catch(()=>null);
  if(!response.ok||!data||String(data.ResponseCode)!=='0'){
   const message=String(data?.ResponseDescription||data?.errorMessage||'Safaricom did not accept the transaction-status query.').slice(0,500);
   await admin.from('mpesa_payment_intents').update({status:'verification_required',reconciliation_status:'rejected',reconcile_token_hash:null,result_description:message}).eq('id',intent.id);
   return {status:'verification_required',message};
  }
  const {error}=await admin.from('mpesa_payment_intents').update({status:'reconciliation_pending',reconciliation_status:'requested',reconciliation_conversation_id:data.ConversationID||null,result_description:'Safaricom accepted the transaction-status query. Waiting for its result callback.'}).eq('id',intent.id);
  if(error)throw error;return {status:'reconciliation_pending',message:'Safaricom accepted the reconciliation query. Waiting for the result callback.'};
 }catch(error){await admin.from('mpesa_payment_intents').update({status:'verification_required',reconciliation_status:'request_failed',reconcile_token_hash:null}).eq('id',intent.id);throw error;}
}
async function sendReceiptSms(admin:ReturnType<typeof createClient>,churchId:string,intent:Record<string,any>,receipt:string){
 const config=await loadProviderConfig(admin,'church',churchId,'mobiwave')||await loadProviderConfig(admin,'platform',null,'mobiwave');if(!config)return {status:'not_configured' as const};
 const token=String(config.secrets.apiToken||''),sender=String(config.settings.senderId||'');if(!token||!sender)return {status:'not_configured' as const};
 const name=String(intent.payer_name||'').trim(),amount=Number(intent.amount).toLocaleString('en-KE');
 const message='Imani: Thank you'+(name?', '+name:'')+'. We have received KES '+amount+' via M-Pesa. Receipt: '+receipt+'.';
 const response=await fetch('https://sms.mobiwave.co.ke/api/v3/sms/send',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({recipient:String(intent.phone_number),sender_id:sender,type:'plain',message}),signal:AbortSignal.timeout(12000)});
 const data=await response.json().catch(()=>null);if(!response.ok||data?.status==='error')return {status:'failed' as const,error:String(data?.message||'MobiWave rejected the receipt SMS.').slice(0,300)};
 return {status:'sent' as const,messageId:String(data?.data?.id||data?.id||data?.message_id||'')};
}
export async function postConfirmedPayment(admin:ReturnType<typeof createClient>,intent:Record<string,any>,receipt:string){
 const {error}=await admin.from('transactions').insert({church_id:intent.church_id,member_id:null,member_name:intent.payer_name||null,amount:intent.amount,type:intent.purpose,payment_method:'M-Pesa',date:new Date().toISOString().slice(0,10),reference:receipt,category:'Income',notes:'Confirmed by Safaricom transaction-status API',phone_number:intent.phone_number,source:'INTEGRATED'});
 if(error&&error.code==='23505')return {duplicate:true};if(error){await admin.from('mpesa_payment_intents').update({status:'verification_required',reconciliation_status:'ledger_post_failed',result_description:'Safaricom confirmed the payment, but ledger posting failed. Reconcile before retrying.'}).eq('id',intent.id);throw error;}
 try{const sms=await sendReceiptSms(admin,intent.church_id,intent,receipt);await admin.from('mpesa_payment_intents').update({status:'succeeded',sms_status:sms.status,sms_provider_message_id:'messageId' in sms?sms.messageId:null,sms_error:'error' in sms?sms.error:null,receipt_sms_sent_at:sms.status==='sent'?new Date().toISOString():null,reconciliation_status:'confirmed',result_description:'Payment confirmed by Safaricom and posted to the church ledger.'}).eq('id',intent.id);}
 catch{await admin.from('mpesa_payment_intents').update({status:'succeeded',sms_status:'failed',sms_error:'Receipt SMS request failed.',reconciliation_status:'confirmed',result_description:'Payment confirmed by Safaricom and posted to the church ledger. Receipt SMS failed.'}).eq('id',intent.id);}
 return {duplicate:false};
}
