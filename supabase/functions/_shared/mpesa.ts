import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { nairobiTransactionDay } from './mpesa-date.ts';
export { parseDarajaTransactionDate } from './mpesa-date.ts';

type AdminClient = SupabaseClient<any, 'public', any>;
export type MpesaConfig={key:string;secret:string;passkey:string;shortcode:string;environment:'sandbox'|'production';transactionType:string;accountReference:string;initiatorName:string;securityCredential:string};
const digest=async(value:string)=>{const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(hash)].map(v=>v.toString(16).padStart(2,'0')).join('');};
export {digest};

export async function loadProviderConfig(admin:AdminClient,scope:'church'|'platform',churchId:string|null,provider:'mpesa'|'mobiwave'){
 const {data,error}=await admin.rpc('integration_config_get',{p_scope:scope,p_church_id:churchId,p_provider:provider});if(error)throw error;
 const row=Array.isArray(data)?data[0]:data;if(!row||!row.secret||typeof row.secret!=='object')return null;
 return {settings:row.settings as Record<string,unknown>,secrets:row.secret as Record<string,unknown>};
}
export async function loadEffectiveMpesa(admin:AdminClient,churchId:string):Promise<MpesaConfig|null>{
 const local=await loadProviderConfig(admin,'church',churchId,'mpesa');const config=local||await loadProviderConfig(admin,'platform',null,'mpesa');if(!config)return null;
 const s=config.settings,c=config.secrets;return {key:String(c.consumerKey||''),secret:String(c.consumerSecret||''),passkey:String(c.passkey||''),shortcode:String(s.shortcode||''),environment:s.environment==='sandbox'?'sandbox':'production',transactionType:String(s.transactionType||'CustomerPayBillOnline'),accountReference:String(s.accountReference||'IMANI'),initiatorName:String(c.initiatorName||''),securityCredential:String(c.securityCredential||'')};
}
async function getDarajaAccess(config:Pick<MpesaConfig,'key'|'secret'|'environment'>){
 const host=config.environment==='sandbox'?'https://sandbox.safaricom.co.ke':'https://api.safaricom.co.ke';
 const response=await fetch(host+'/oauth/v1/generate?grant_type=client_credentials',{headers:{Authorization:'Basic '+btoa(config.key+':'+config.secret),Accept:'application/json'},signal:AbortSignal.timeout(12000)});
 const data=await response.json().catch(()=>null);if(!response.ok||!data||typeof data.access_token!=='string')throw new Error('Daraja authentication failed.');
 return {host,accessToken:data.access_token as string};
}
export async function requestTransactionStatus(admin:AdminClient,supabaseUrl:string,intent:Record<string,any>,config:MpesaConfig){
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
   await admin.from('mpesa_payment_intents').update({status:'verification_required',reconciliation_status:'rejected',reconcile_token_hash:null,result_description:message}).eq('id',intent.id).eq('status','reconciliation_pending').eq('reconciliation_status','requesting');
   return {status:'verification_required',message};
  }
  const {error}=await admin.from('mpesa_payment_intents').update({status:'reconciliation_pending',reconciliation_status:'requested',reconciliation_conversation_id:data.ConversationID||null,result_description:'Safaricom accepted the transaction-status query. Waiting for its result callback.'}).eq('id',intent.id).eq('status','reconciliation_pending').eq('reconciliation_status','requesting');
  if(error)throw error;return {status:'reconciliation_pending',message:'Safaricom accepted the reconciliation query. Waiting for the result callback.'};
 }catch(error){await admin.from('mpesa_payment_intents').update({status:'verification_required',reconciliation_status:'request_failed',reconcile_token_hash:null}).eq('id',intent.id).eq('status','reconciliation_pending').eq('reconciliation_status','requesting');throw error;}
}
async function sendReceiptSms(admin:AdminClient,churchId:string,intent:Record<string,any>,receipt:string){
 const {data:churchSettings,error:settingsError}=await admin.from('church_settings')
  .select('notification_preferences').eq('church_id',churchId).maybeSingle();
 if(settingsError)return {status:'failed' as const,error:'Church SMS preferences could not be loaded.'};
 const preferences=churchSettings?.notification_preferences as Record<string,unknown>|undefined;
 if(preferences?.mpesaConfirmationsSMS===false)return {status:'not_sent' as const};
 const config=await loadProviderConfig(admin,'church',churchId,'mobiwave')||await loadProviderConfig(admin,'platform',null,'mobiwave');if(!config)return {status:'not_configured' as const};
 const token=String(config.secrets.apiToken||''),sender=String(config.settings.senderId||'');if(!token||!sender)return {status:'not_configured' as const};
 const name=String(intent.payer_name||'').trim(),amount=Number(intent.amount).toLocaleString('en-KE');
 const message='Imani: Thank you'+(name?', '+name:'')+'. We have received KES '+amount+' via M-Pesa. Receipt: '+receipt+'.';
 const response=await fetch('https://sms.mobiwave.co.ke/api/v3/sms/send',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({recipient:String(intent.phone_number),sender_id:sender,type:'plain',message}),signal:AbortSignal.timeout(12000)});
 const data=await response.json().catch(()=>null);if(!response.ok||data?.status!=='success')return {status:'failed' as const,error:String(data?.message||'MobiWave rejected the receipt SMS.').slice(0,300)};
 return {status:'sent' as const,messageId:String(data?.data?.uid||data?.data?.id||data?.uid||data?.id||data?.message_id||'')};
}
export async function postConfirmedPayment(admin:AdminClient,intent:Record<string,any>,receipt:string){
 const transactionDay=nairobiTransactionDay(intent.transaction_date);
 const {error}=await admin.from('transactions').insert({
  church_id:intent.church_id,member_id:null,member_name:intent.payer_name||null,
  amount:intent.amount,type:intent.purpose,payment_method:'M-Pesa',date:transactionDay,
  reference:receipt,category:'Income',notes:'Confirmed by Safaricom transaction-status API',
  phone_number:intent.phone_number,source:'INTEGRATED'
 });
 if(error&&error.code==='23505'){
  const {data:existing,error:lookupError}=await admin.from('transactions')
   .select('id,church_id,amount,type,payment_method,reference,source')
   .eq('church_id',intent.church_id).eq('reference',receipt)
   .eq('payment_method','M-Pesa').eq('source','INTEGRATED').maybeSingle();
  const matches=!lookupError&&existing&&Number(existing.amount)===Number(intent.amount)
   &&String(existing.type)===String(intent.purpose)&&String(existing.reference)===receipt;
  if(!matches){
   await admin.from('mpesa_payment_intents').update({
    status:'verification_required',reconciliation_status:'ledger_post_conflict',
    result_description:'Safaricom confirmed this payment, but the receipt conflicts with an existing ledger entry. Manual review is required.'
   }).eq('id',intent.id);
   throw new Error('Confirmed M-Pesa receipt conflicts with an existing ledger entry.');
  }
  await admin.from('mpesa_payment_intents').update({
   status:'succeeded',sms_status:'not_sent',reconciliation_status:'confirmed',
   result_description:'Payment was already present in the church ledger; duplicate posting was prevented.'
  }).eq('id',intent.id);
  return {duplicate:true};
 }
 if(error){
  await admin.from('mpesa_payment_intents').update({
   status:'verification_required',reconciliation_status:'ledger_post_failed',
   result_description:'Safaricom confirmed the payment, but ledger posting failed. Reconcile before retrying.'
  }).eq('id',intent.id);
  throw error;
 }
 try{
  const sms=await sendReceiptSms(admin,intent.church_id,intent,receipt);
  const {error:updateError}=await admin.from('mpesa_payment_intents').update({
   status:'succeeded',sms_status:sms.status,
   sms_provider_message_id:'messageId' in sms?sms.messageId:null,
   sms_error:'error' in sms?sms.error:null,
   receipt_sms_sent_at:sms.status==='sent'?new Date().toISOString():null,
   sms_provider_status:sms.status==='sent'?'accepted':null,
   reconciliation_status:'confirmed',
   result_description:'Payment confirmed by Safaricom and posted to the church ledger.'
  }).eq('id',intent.id);
  if(updateError)throw updateError;
 }catch{
  await admin.from('mpesa_payment_intents').update({
   status:'succeeded',sms_status:'failed',sms_error:'Receipt SMS request failed.',
   reconciliation_status:'confirmed',
   result_description:'Payment confirmed by Safaricom and posted to the church ledger. Receipt SMS failed.'
  }).eq('id',intent.id);
 }
 return {duplicate:false};
}

export async function refreshReceiptSmsStatus(admin:AdminClient,intent:Record<string,any>){
 if(intent.sms_status!=='sent'||!intent.sms_provider_message_id)return intent;
 if(intent.sms_last_checked_at&&Date.now()-Date.parse(intent.sms_last_checked_at)<15000)return intent;
 const config=await loadProviderConfig(admin,'church',String(intent.church_id),'mobiwave').catch(()=>null)||await loadProviderConfig(admin,'platform',null,'mobiwave').catch(()=>null);
 if(!config||!config.secrets.apiToken)return intent;
 const checkedAt=new Date().toISOString();
 try{
  const response=await fetch('https://sms.mobiwave.co.ke/api/v3/sms/'+encodeURIComponent(String(intent.sms_provider_message_id)),{
   headers:{Authorization:'Bearer '+String(config.secrets.apiToken),Accept:'application/json'},
   signal:AbortSignal.timeout(10000)
  });
  const data=await response.json().catch(()=>null);
  if(!response.ok||data?.status!=='success'){
   await admin.from('mpesa_payment_intents').update({sms_last_checked_at:checkedAt}).eq('id',intent.id);
   return {...intent,sms_last_checked_at:checkedAt};
  }
  const report=Array.isArray(data.data)?data.data[0]:(data.data||{});
  const raw=String(report.status||report.delivery_status||report.deliveryStatus||report.state||'');
  const normalized=raw.toLowerCase().replace(/[^a-z]/g,'');
  const delivered=normalized.includes('deliver')||['completed','success'].includes(normalized);
  const failed=normalized.includes('fail')||normalized.includes('undeliver')||normalized.includes('reject')||normalized.includes('expire');
  const next=delivered?'delivered':failed?'failed':'sent';
  await admin.from('mpesa_payment_intents').update({sms_status:next,sms_provider_status:raw||'accepted',sms_last_checked_at:checkedAt}).eq('id',intent.id);
  return {...intent,sms_status:next,sms_provider_status:raw||'accepted',sms_last_checked_at:checkedAt};
 }catch{
  await admin.from('mpesa_payment_intents').update({sms_last_checked_at:checkedAt}).eq('id',intent.id);
  return {...intent,sms_last_checked_at:checkedAt};
 }
}
