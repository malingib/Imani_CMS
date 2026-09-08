import { supabase } from './supabase-auth';
import { mapAttendanceSummary, mapExpense, mapFollowUp, mapFund, mapHousehold, mapProject, mapStatusHistory } from './mappers';

export async function searchMembers(churchId:string, query:string, page=1, pageSize=50){
  const safePage=Math.max(1,page), safeSize=Math.min(100,Math.max(10,pageSize)), from=(safePage-1)*safeSize;
  let request=supabase.from('members').select('*',{count:'exact'}).eq('church_id',churchId).is('deleted_at',null).order('last_name').order('first_name').range(from,from+safeSize-1);
  const term=query.trim();
  if(term) request=request.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`);
  const {data,error,count}=await request;
  if(error) throw new Error(error.message);
  return {items:(data||[]).map((row:any)=>({id:row.id,firstName:row.first_name,lastName:row.last_name,phone:row.phone||'',email:row.email||'',location:row.location||'',groups:row.groups||[],status:row.status,joinDate:row.join_date||'',birthday:row.birthday||undefined,age:row.age||undefined,gender:row.gender||undefined,maritalStatus:row.marital_status||undefined,membershipType:row.membership_type||undefined,photo:row.photo||undefined,stewardshipScore:row.stewardship_score||undefined})),total:count||0,page:safePage,pageSize:safeSize};
}

export async function getMemberAttendanceSummary(churchId:string,memberId:string){
  const {data,error}=await supabase.from('member_attendance_summary').select('*').eq('church_id',churchId).eq('member_id',memberId).single();
  if(error) throw new Error(error.message); return mapAttendanceSummary(data);
}
export async function listMemberFollowUps(churchId:string,memberId?:string){
  let q=supabase.from('member_follow_ups').select('*').eq('church_id',churchId).order('due_date',{ascending:true});
  if(memberId) q=q.eq('member_id',memberId); const {data,error}=await q; if(error) throw new Error(error.message); return (data||[]).map(mapFollowUp);
}
export async function listMemberStatusHistory(churchId:string,memberId:string){
  const {data,error}=await supabase.from('member_status_history').select('*').eq('church_id',churchId).eq('member_id',memberId).order('changed_at',{ascending:false});
  if(error) throw new Error(error.message); return (data||[]).map(mapStatusHistory);
}
export async function listHouseholds(churchId:string){
  const {data,error}=await supabase.from('households').select('*').eq('church_id',churchId).order('name'); if(error) throw new Error(error.message); return (data||[]).map(mapHousehold);
}
export async function listFunds(churchId:string){
  const {data,error}=await supabase.from('funds').select('*').eq('church_id',churchId).order('name'); if(error) throw new Error(error.message); return (data||[]).map(mapFund);
}
export async function listProjects(churchId:string){
  const {data,error}=await supabase.from('church_projects').select('*').eq('church_id',churchId).order('name'); if(error) throw new Error(error.message); return (data||[]).map(mapProject);
}
export async function listExpenses(churchId:string,limit=100){
  const {data,error}=await supabase.from('expenses').select('*').eq('church_id',churchId).order('expense_date',{ascending:false}).limit(Math.min(500,Math.max(1,limit))); if(error) throw new Error(error.message); return (data||[]).map(mapExpense);
}
export async function getFinanceSummary(churchId:string){
  const [{data:tx,error:txError},{data:budgets,error:budgetError},{data:expenses,error:expenseError}]=await Promise.all([
    supabase.from('transactions').select('amount,category,type,date,fund_id,project_id').eq('church_id',churchId).is('deleted_at',null),
    supabase.from('budgets').select('amount,spent,month').eq('church_id',churchId),
    supabase.from('expenses').select('amount,status,expense_date,category').eq('church_id',churchId).neq('status','VOID')
  ]);
  if(txError||budgetError||expenseError) throw new Error(txError?.message||budgetError?.message||expenseError?.message||'Finance query failed');
  const income=(tx||[]).filter((r:any)=>r.category==='Income').reduce((s:number,r:any)=>s+Number(r.amount||0),0);
  const transactionExpenses=(tx||[]).filter((r:any)=>r.category==='Expense').reduce((s:number,r:any)=>s+Number(r.amount||0),0);
  const expenseRecords=(expenses||[]).reduce((s:number,r:any)=>s+Number(r.amount||0),0);
  return {income,expenses:Math.max(transactionExpenses,expenseRecords),net:income-Math.max(transactionExpenses,expenseRecords),transactionCount:(tx||[]).length,budgetCount:(budgets||[]).length};
}
