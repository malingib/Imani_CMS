import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Smartphone, X } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

type Props = { churchId: string };
type PaymentStatus = 'idle' | 'initiating' | 'pending' | 'verification_required' | 'succeeded' | 'failed';

const purposes = ['Tithe', 'Offering', 'Project', 'Harambee', 'Benevolence'];

const MpesaPaymentDialog: React.FC<Props> = ({ churchId }) => {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [payerName, setPayerName] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('Tithe');
  const [paymentId, setPaymentId] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [message, setMessage] = useState('');
  const [receipt, setReceipt] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!paymentId || status === 'succeeded' || status === 'failed' || status === 'idle') return;
    let active = true;
    const poll = async () => {
      const { data, error: invokeError } = await supabase.functions.invoke('mpesa-status', {
        body: { payment_id: paymentId },
      });
      if (!active || invokeError || !data) return;
      if (data.status === 'succeeded') {
        setStatus('succeeded');
        setReceipt(String(data.receipt_number || ''));
        setMessage('Payment confirmed and posted to the church finance ledger.');
      } else if (data.status === 'failed') {
        setStatus('failed');
        setMessage(String(data.message || 'The M-Pesa request was not completed.'));
      } else if (data.status === 'verification_required') {
        setStatus('verification_required');
        setMessage(String(data.message || 'The payment needs reconciliation before it can be posted.'));
      } else {
        setStatus('pending');
        setMessage('Waiting for the payer to approve the M-Pesa prompt.');
      }
    };
    void poll();
    const timer = window.setInterval(() => { void poll(); }, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [paymentId, status]);

  const reset = () => {
    setPhone(''); setPayerName(''); setAmount(''); setPurpose('Tithe');
    setPaymentId(''); setStatus('idle'); setMessage(''); setReceipt(''); setError('');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const digits = phone.replace(/\D/g, '');
    if (!/^(\+?254|0)?[17]\d{8}$/.test(digits)) {
      setError('Enter a valid Kenyan mobile number.');
      return;
    }
    const numericAmount = Number(amount);
    if (!Number.isInteger(numericAmount) || numericAmount < 1 || numericAmount > 250000) {
      setError('Enter an amount between KES 1 and KES 250,000.');
      return;
    }
    if (!churchId) {
      setError('The church workspace is not configured.');
      return;
    }
    setStatus('initiating');
    setMessage('Submitting payment request to Safaricom…');
    try {
      const idempotencyKey = crypto.randomUUID();
      const { data, error: invokeError } = await supabase.functions.invoke('mpesa-stk', {
        body: {
          church_id: churchId,
          phone_number: phone,
          payer_name: payerName.trim() || null,
          amount: numericAmount,
          purpose,
          idempotency_key: idempotencyKey,
        },
        headers: { 'Idempotency-Key': idempotencyKey },
      });
      if (invokeError) throw new Error(invokeError.message || 'Payment request failed.');
      if (data?.error) throw new Error(String(data.error));
      if (!data?.payment_id) throw new Error('Safaricom did not return a payment reference.');
      setPaymentId(String(data.payment_id));
      setStatus(data.status === 'verification_required' ? 'verification_required' : 'pending');
      setMessage(String(data.customer_message || 'Check the phone and enter the M-Pesa PIN.'));
    } catch (e) {
      setStatus('idle');
      setMessage('');
      setError(e instanceof Error ? e.message : 'Could not initiate the M-Pesa request.');
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
        <Smartphone size={17} /> Collect with M-Pesa
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="mpesa-dialog-title" className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div><h2 id="mpesa-dialog-title" className="text-lg font-semibold text-slate-900">M-Pesa collection</h2><p className="mt-1 text-sm text-slate-500">Send an STK Push to the payer. Only confirmed payments enter the finance ledger.</p></div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
            </header>
            <div className="space-y-5 p-6">
              {status === 'idle' || status === 'initiating' ? (
                <form onSubmit={submit} className="space-y-4">
                  <label className="block space-y-1.5"><span className="text-sm font-medium text-slate-700">Payer phone number</span><input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712 345 678" inputMode="tel" autoComplete="tel" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label>
                  <label className="block space-y-1.5"><span className="text-sm font-medium text-slate-700">Payer name <span className="font-normal text-slate-400">(optional)</span></span><input value={payerName} onChange={e => setPayerName(e.target.value)} placeholder="Name for the finance record" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block space-y-1.5"><span className="text-sm font-medium text-slate-700">Amount (KES)</span><input required type="number" min="1" max="250000" step="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1000" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label>
                    <label className="block space-y-1.5"><span className="text-sm font-medium text-slate-700">Payment purpose</span><select value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500">{purposes.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
                  </div>
                  {error && <p role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</p>}
                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600">Cancel</button><button disabled={status === 'initiating'} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{status === 'initiating' ? <Loader2 size={16} className="animate-spin" /> : <Smartphone size={16} />} Send STK Push</button></div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className={'rounded-xl border p-4 ' + (status === 'succeeded' ? 'border-emerald-200 bg-emerald-50' : status === 'failed' ? 'border-rose-200 bg-rose-50' : status === 'verification_required' ? 'border-amber-200 bg-amber-50' : 'border-indigo-200 bg-indigo-50')}>
                    <div className="flex items-start gap-3">
                      {status === 'succeeded' ? <CheckCircle2 className="mt-0.5 text-emerald-700" /> : status === 'failed' ? <AlertCircle className="mt-0.5 text-rose-700" /> : <Loader2 className="mt-0.5 animate-spin text-indigo-700" />}
                      <div><p className="font-semibold text-slate-900">{status === 'succeeded' ? 'Payment confirmed' : status === 'failed' ? 'Payment not completed' : status === 'verification_required' ? 'Reconciliation required' : 'Awaiting M-Pesa approval'}</p><p className="mt-1 text-sm text-slate-600">{message}</p></div>
                    </div>
                  </div>
                  {receipt && <div className="rounded-lg bg-slate-50 p-3 text-sm"><span className="text-slate-500">M-Pesa receipt</span><strong className="ml-2 font-semibold text-slate-900">{receipt}</strong></div>}
                  <div className="flex justify-between gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => { reset(); }} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600">New request</button><button type="button" onClick={() => setOpen(false)} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Close</button></div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default MpesaPaymentDialog;
