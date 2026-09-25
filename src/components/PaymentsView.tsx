import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Download,
  Plus,
  ArrowRight,
  Printer,
  X,
  QrCode,
  Building,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { LanguageCode, PaymentRecord } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { api } from '../services/api';

interface PaymentsViewProps {
  language: LanguageCode;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<PaymentRecord | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ESCROW_HELD' | 'COMPLETED' | 'PROCESSING'>('ALL');
  const [isProcessingEscrow, setIsProcessingEscrow] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Payment Operation Modal State
  const [isOpenNewPayment, setIsOpenNewPayment] = useState(false);
  const [farmerName, setFarmerName] = useState('Ramasamy Kounder');
  const [buyerName, setBuyerName] = useState('Sahyadri Agro Processing Ltd');
  const [crop, setCrop] = useState('Tomato');
  const [quantity, setQuantity] = useState('20');
  const [ratePerQuintal, setRatePerQuintal] = useState('1900');
  const [paymentMode, setPaymentMode] = useState<string>('e-NAM Settlement');
  const [paymentOption, setPaymentOption] = useState<'ESCROW' | 'INSTANT'>('ESCROW');
  const [bankAccount, setBankAccount] = useState('30981123456');
  const [ifscCode, setIfscCode] = useState('SBIN0001234');
  const [upiId, setUpiId] = useState('9842109876@kisan');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPayments = async () => {
    try {
      const res = await api.getPayments();
      setPayments(res.payments || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const totalAmount = Math.round((parseFloat(quantity) || 0) * (parseFloat(ratePerQuintal) || 0));

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const res = await api.createPayment({
        farmerName,
        buyerName,
        crop,
        quantityQuintals: parseFloat(quantity),
        amount: totalAmount,
        paymentMode,
        status: paymentOption === 'ESCROW' ? 'ESCROW_HELD' : 'COMPLETED',
        bankAccount: paymentMode.includes('Bank') ? bankAccount : undefined,
        ifscCode: paymentMode.includes('Bank') ? ifscCode : undefined,
        upiId: paymentMode.includes('UPI') ? upiId : undefined,
        notes: `APMC Mandi weighment verified lot. Settlement initiated by ${buyerName}.`,
      });

      if (res.success) {
        setStatusMessage(res.message);
        setIsOpenNewPayment(false);
        await loadPayments();
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReleaseEscrow = async (id: string) => {
    setIsProcessingEscrow(id);
    try {
      const res = await api.releaseEscrow(id);
      if (res.success) {
        setStatusMessage(res.message);
        await loadPayments();
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingEscrow(null);
    }
  };

  const totalReceived = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingEscrow = payments
    .filter((p) => p.status !== 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = filter === 'ALL'
    ? payments
    : payments.filter((p) => p.status === filter);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-display">
            {t.navPayments} & Agricultural Escrow
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            e-NAM electronic settlements, weighbridge vouchers, escrow releases, and DBT payouts
          </p>
        </div>

        {/* Action Button: Initiate Payment */}
        <button
          onClick={() => setIsOpenNewPayment(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Settlement / Make Payment</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
          <span className="text-xs text-stone-500 font-medium block">Total Payouts Settled</span>
          <span className="text-3xl font-black text-emerald-800 tabular-nums block mt-1">
            ₹{totalReceived.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-emerald-700 font-semibold block mt-1">
            ✓ 100% credited to registered farmer bank DBT accounts
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
          <span className="text-xs text-stone-500 font-medium block">Secured in Agricultural Escrow</span>
          <span className="text-3xl font-black text-amber-700 tabular-nums block mt-1">
            ₹{pendingEscrow.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-amber-800 font-semibold block mt-1">
            ⏳ Released automatically upon weighbridge & moisture verification
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-100 rounded-2xl w-fit">
        {[
          { id: 'ALL', label: 'All Transactions' },
          { id: 'ESCROW_HELD', label: 'In Escrow (Held)' },
          { id: 'COMPLETED', label: 'Settled & Paid' },
          { id: 'PROCESSING', label: 'Processing' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === tab.id
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payment Records Table with Active Operation Controls */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 font-bold text-sm text-stone-800 flex items-center justify-between">
          <span>Official Settlement Records & Mandi Receipts</span>
          <span className="text-xs text-stone-400 font-normal">
            Showing {filteredPayments.length} records
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {filteredPayments.map((p) => (
            <div
              key={p.id}
              className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-stone-50/50 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-stone-900">{p.buyerName}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'ESCROW_HELD'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {p.status === 'ESCROW_HELD' ? '🛡️ Escrow Held' : p.status}
                  </span>
                </div>

                <p className="text-xs text-stone-500 mt-1">
                  Recipient: <strong className="text-stone-800">{p.farmerName || 'Ramasamy Kounder'}</strong> · Lot: <strong>{p.crop}</strong> ({p.quantityQuintals}q / {p.quantityQuintals * 100} kg @ ₹{(p.amount / (p.quantityQuintals * 100)).toFixed(2)}/kg) · Slip #{p.mandiSlipNo}
                </p>

                <p className="text-[11px] text-stone-400 mt-0.5">
                  Ref: {p.transactionRef} · Mode: {p.paymentMode} · Date: {p.paymentDate}
                  {p.settledAt && ` · Settled: ${new Date(p.settledAt).toLocaleTimeString('en-IN')}`}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
                <div className="text-left lg:text-right">
                  <span className="text-lg font-black text-stone-900 tabular-nums block">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {p.status === 'COMPLETED' ? 'Direct Payout Settled' : 'Guaranteed by Escrow'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Action 1: Release Escrow if held */}
                  {p.status === 'ESCROW_HELD' && (
                    <button
                      onClick={() => handleReleaseEscrow(p.id)}
                      disabled={isProcessingEscrow === p.id}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isProcessingEscrow === p.id ? 'Releasing...' : 'Release Escrow'}
                    </button>
                  )}

                  {/* Action 2: View Official Mandi Slip */}
                  <button
                    onClick={() => setSelectedSlip(p)}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                  >
                    View Slip
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INITIATE NEW PAYMENT OPERATION MODAL */}
      {isOpenNewPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative my-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  e-NAM / Mandi Payment Operation
                </span>
                <h3 className="text-lg font-bold text-stone-900">Initiate Produce Settlement</h3>
              </div>
              <button
                onClick={() => setIsOpenNewPayment(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiatePayment} className="space-y-4 text-xs">
              {/* Buyer & Farmer Parties */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Paying Buyer / Organization</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Beneficiary Farmer</label>
                  <input
                    type="text"
                    required
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
              </div>

              {/* Crop & Quantity & Unit Rate */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Crop</label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Onion">Onion</option>
                    <option value="Potato">Potato</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Paddy (Dhan)">Paddy (Dhan)</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Turmeric">Turmeric</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Quantity (q)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50 tabular-nums font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Price (₹/q)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={ratePerQuintal}
                    onChange={(e) => setRatePerQuintal(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50 tabular-nums font-bold"
                  />
                </div>
              </div>

              {/* Computed Gross Amount Box */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-600 block">Calculated Total Payout:</span>
                  <span className="text-2xl font-black text-emerald-800 tabular-nums">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right text-[11px] text-stone-500">
                  <span>Mandi Cess (1%): ₹{Math.round(totalAmount * 0.01)}</span>
                  <span className="block font-bold text-emerald-900">Net Farmer DBT: ₹{totalAmount}</span>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label className="font-bold text-stone-700 block mb-1.5">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'e-NAM Settlement', label: 'e-NAM Escrow', icon: Wallet },
                    { id: 'Direct Bank Transfer (NEFT/RTGS)', label: 'Bank RTGS/DBT', icon: Building },
                    { id: 'UPI (Kisan Pay)', label: 'Kisan UPI', icon: Smartphone },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSel = paymentMode === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setPaymentMode(m.id)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center text-center transition-all ${
                          isSel
                            ? 'border-emerald-700 bg-emerald-50/70 text-emerald-900 font-bold'
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1 text-emerald-800" />
                        <span className="text-[11px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Account Details Input */}
              {paymentMode.includes('UPI') ? (
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Farmer UPI ID / VPA</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. 9842109876@kisan or farmer@sbi"
                    className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      required
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Bank IFSC Code</label>
                    <input
                      type="text"
                      required
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                    />
                  </div>
                </div>
              )}

              {/* Settlement Type (Escrow vs Instant) */}
              <div>
                <label className="font-bold text-stone-700 block mb-1.5">Settlement Protection</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentOption('ESCROW')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      paymentOption === 'ESCROW'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    <span className="block text-xs">🛡️ Mandi Escrow (Recommended)</span>
                    <span className="text-[10px] text-stone-500 font-normal">
                      Funds held safely until weighment & moisture tests pass
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentOption('INSTANT')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      paymentOption === 'INSTANT'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    <span className="block text-xs">⚡ Instant DBT Credit</span>
                    <span className="text-[10px] text-stone-500 font-normal">
                      Immediate transfer directly into farmer bank account
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpenNewPayment(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold shadow-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Authorize & Execute Settlement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL MANDI PAYMENT VOUCHER MODAL */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-6">
            <div className="text-center pb-4 border-b-2 border-stone-900">
              <div className="flex items-center justify-center gap-1.5 text-emerald-800 text-xs font-black tracking-widest uppercase mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>DIRECTORATE OF AGRICULTURAL MARKETING</span>
              </div>
              <h3 className="text-xl font-black text-stone-900">APMC Mandi Settlement Voucher</h3>
              <p className="text-xs text-stone-500">
                National Electronic Agricultural Market (e-NAM) Gateway
              </p>
            </div>

            <div className="py-4 space-y-2.5 text-xs text-stone-700">
              <div className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl">
                <span>Voucher Slip Number:</span>
                <strong className="text-stone-900 font-mono text-sm">{selectedSlip.mandiSlipNo}</strong>
              </div>

              <div className="flex justify-between">
                <span>Transaction Reference:</span>
                <strong className="text-stone-900 font-mono">{selectedSlip.transactionRef}</strong>
              </div>

              <div className="flex justify-between">
                <span>Beneficiary Farmer:</span>
                <strong className="text-stone-900">{selectedSlip.farmerName || 'Ramasamy Kounder'}</strong>
              </div>

              <div className="flex justify-between">
                <span>Procuring Buyer / Entity:</span>
                <strong className="text-stone-900">{selectedSlip.buyerName}</strong>
              </div>

              <div className="flex justify-between">
                <span>Commodity & Quantity:</span>
                <strong className="text-stone-900">{selectedSlip.crop} · {selectedSlip.quantityQuintals} Quintals ({selectedSlip.quantityQuintals * 100} kg)</strong>
              </div>

              <div className="flex justify-between">
                <span>Rate per Kilogram (kg):</span>
                <strong className="text-emerald-800 font-bold">
                  ₹{(selectedSlip.amount / (selectedSlip.quantityQuintals * 100)).toFixed(2)} / kg (₹{(selectedSlip.amount / selectedSlip.quantityQuintals).toFixed(0)} / Quintal)
                </strong>
              </div>

              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <strong className="text-stone-900">{selectedSlip.paymentMode}</strong>
              </div>

              <div className="flex justify-between">
                <span>Settlement Date:</span>
                <strong className="text-stone-900">{selectedSlip.paymentDate}</strong>
              </div>

              <div className="flex justify-between">
                <span>Payment Status:</span>
                <strong className={`font-bold ${selectedSlip.status === 'COMPLETED' ? 'text-emerald-700' : 'text-amber-800'}`}>
                  {selectedSlip.status}
                </strong>
              </div>

              {/* Amount Breakdown */}
              <div className="pt-3 border-t border-stone-200 space-y-1">
                <div className="flex justify-between text-stone-500">
                  <span>Gross Lot Value:</span>
                  <span className="tabular-nums">₹{selectedSlip.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>APMC Mandi Cess (Exempted):</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between pt-1 text-base font-black text-emerald-900">
                  <span>Net Disbursed Amount:</span>
                  <span className="text-xl tabular-nums">₹{selectedSlip.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* QR Verification Seal */}
              <div className="mt-4 p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-10 h-10 text-stone-800" />
                  <div className="text-[11px] text-stone-600">
                    <span className="font-bold text-stone-900 block">Cryptographic Mandi Seal</span>
                    <span>Digitally certified by APMC Gateway</span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-stone-400">
                  <span>Audit Code: {selectedSlip.transactionRef.slice(-6)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex gap-2">
              <button
                onClick={() => window.print()}
                className="w-1/2 py-2.5 rounded-xl border border-stone-300 text-stone-800 font-bold hover:bg-stone-50 flex items-center justify-center gap-1.5 text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher</span>
              </button>
              <button
                onClick={() => setSelectedSlip(null)}
                className="w-1/2 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
