
import React, { useState } from 'react';
import { ShieldCheck, Zap, Package, Calendar, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
import { mpesa, pollMpesaStatus } from '@/lib/mpesa';

interface Invoice {
  id: string;
  churchId: string;
  amount: number;
  status: string;
  dueDate?: string;
}

interface BillingProps {
  tier?: string;
  churchName?: string;
  monthlyAmount?: number;
  paidUntil?: string | null;
  billingPhone?: string | null;
  subscriptionStatus?: string;
  pendingInvoices?: Invoice[];
  onPaymentComplete?: () => void;
}

const Billing: React.FC<BillingProps> = ({
  tier = 'basic',
  churchName = '',
  monthlyAmount = 4500,
  paidUntil,
  billingPhone,
  subscriptionStatus = 'pending',
  pendingInvoices = [],
  onPaymentComplete,
}) => {
  const [phone, setPhone] = useState(billingPhone ?? '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isActive = subscriptionStatus === 'active';

  const handlePaySubscription = async () => {
    if (!phone.trim()) {
      setMessage('Enter the M-Pesa phone number for billing.');
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const { checkoutRequestId, message: stkMessage } = await mpesa.stkPushSubscription(phone);
      setMessage(stkMessage);
      const result = await pollMpesaStatus(checkoutRequestId);

      if (result.status === 'completed') {
        setMessage('Subscription payment received. Thank you!');
        onPaymentComplete?.();
      } else {
        setMessage('Payment was not completed. Try again or check your phone.');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Payment failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayInvoice = async (invoiceId: string, amount: number) => {
    if (!phone.trim()) {
      setMessage('Enter the M-Pesa phone number for billing.');
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const { checkoutRequestId, message: stkMessage } = await mpesa.stkPushInvoice(invoiceId, phone);
      setMessage(stkMessage);
      const result = await pollMpesaStatus(checkoutRequestId);

      if (result.status === 'completed') {
        setMessage(`Invoice payment of KES ${amount} received.`);
        onPaymentComplete?.();
      } else {
        setMessage('Invoice payment was not completed.');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Payment failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-brand-primary tracking-tight uppercase">Subscription & Billing</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">{churchName || 'Manage your subscription via M-Pesa.'}</p>
        </div>
        <div className={`px-6 py-2 rounded-full border flex items-center gap-2 ${isActive ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
          <ShieldCheck size={16}/>
          <span className="text-[10px] font-black uppercase tracking-widest">{isActive ? 'Active Plan' : 'Payment Due'}</span>
        </div>
      </header>

      {message && (
        <div className="p-4 bg-brand-indigo/5 border border-brand-indigo/20 rounded-2xl text-sm font-medium text-slate-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-50 pb-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-brand-primary text-white rounded-[1.5rem] shadow-xl">
                <Package size={32}/>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{tier} Plan</h3>
                <p className="text-slate-400 font-medium mt-1">Unlimited Members • All Modules Enabled</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-slate-800 tracking-tighter">
                KES {monthlyAmount.toLocaleString()} <span className="text-sm font-bold text-slate-400">/mo</span>
              </p>
              {paidUntil && (
                <p className="text-[10px] font-black uppercase text-brand-indigo mt-1">Renews on {paidUntil}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-3">
              <Zap size={16} className="text-brand-gold"/> SMS Credits
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase">SMS Balance</p>
                <h5 className="text-4xl font-black text-slate-800">4,280 <span className="text-xs font-bold text-slate-400">Units</span></h5>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase">AI Credits</p>
                <h5 className="text-4xl font-black text-slate-800">Unlimited <span className="text-xs font-bold text-slate-400">GenAI</span></h5>
                <p className="text-[10px] text-brand-emerald font-black uppercase">Included in Plan</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-brand-primary p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <h4 className="text-xl font-black uppercase tracking-tight">M-Pesa Billing</h4>
              <div className="p-6 bg-white/10 rounded-2xl border border-white/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold opacity-60">Primary Handset</span>
                  {billingPhone && <CheckCircle2 size={16} className="text-brand-gold"/>}
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XX XXX XXX"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-lg font-black tracking-widest placeholder:opacity-40 outline-none focus:ring-2 focus:ring-brand-gold/50"
                />
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className="text-brand-gold"/>
                  <span className="text-[10px] font-black uppercase">STK Push — Lipa Na M-Pesa</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePaySubscription}
                disabled={isProcessing}
                className="w-full py-4 bg-white text-brand-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-gold hover:text-brand-primary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin"/> : null}
                Pay KES {monthlyAmount.toLocaleString()} Now
              </button>
            </div>
            <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20" />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h4 className="text-lg font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
              <Calendar size={20} className="text-brand-indigo"/> Pending Invoices
            </h4>
            <div className="space-y-4">
              {pendingInvoices.length === 0 ? (
                <p className="text-sm text-slate-400 font-medium">No pending invoices.</p>
              ) : (
                pendingInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-700">Due {inv.dueDate ?? '—'}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{inv.status}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-sm font-black text-slate-800">KES {inv.amount.toLocaleString()}</p>
                      <button
                        type="button"
                        onClick={() => handlePayInvoice(inv.id, inv.amount)}
                        disabled={isProcessing}
                        className="text-[9px] font-black uppercase text-brand-indigo hover:text-brand-primary disabled:opacity-50"
                      >
                        Pay via M-Pesa
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
