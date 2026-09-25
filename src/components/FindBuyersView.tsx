import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Phone, Mail, Send, CheckCircle2, X } from 'lucide-react';
import { LanguageCode, Buyer, FarmerProfile } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { api } from '../services/api';

interface FindBuyersViewProps {
  language: LanguageCode;
  farmer: FarmerProfile | null;
}

export const FindBuyersView: React.FC<FindBuyersViewProps> = ({
  language,
  farmer,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState('All');
  const [loading, setLoading] = useState(true);

  // Send Offer Modal state
  const [activeBuyer, setActiveBuyer] = useState<Buyer | null>(null);
  const [offerCrop, setOfferCrop] = useState('Tomato');
  const [offerQty, setOfferQty] = useState('20');
  const [offerPrice, setOfferPrice] = useState('1900');
  const [offerDate, setOfferDate] = useState('2026-09-26');
  const [offerNotes, setOfferNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadBuyers() {
      try {
        setLoading(true);
        const res = await api.getBuyers(selectedCommodity);
        if (isMounted) {
          setBuyers(res.buyers || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadBuyers();
    return () => {
      isMounted = false;
    };
  }, [selectedCommodity]);

  const handleOpenOfferModal = (buyer: Buyer, defaultCrop?: string, targetPrice?: number) => {
    setActiveBuyer(buyer);
    setOfferCrop(defaultCrop || buyer.commoditiesWanted[0]?.commodity || 'Tomato');
    setOfferPrice(targetPrice ? targetPrice.toString() : '1900');
    setSuccessMsg('');
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBuyer) return;

    setIsSubmitting(true);
    try {
      await api.createOffer({
        farmerId: farmer?.id || 'farmer-default',
        farmerName: farmer?.name || 'Ramasamy Kounder',
        buyerId: activeBuyer.id,
        buyerName: activeBuyer.contactPerson,
        buyerCompany: activeBuyer.companyName,
        crop: offerCrop,
        quantityQuintals: parseFloat(offerQty),
        offeredPricePerQuintal: parseFloat(offerPrice),
        proposedDeliveryDate: offerDate,
        notes: offerNotes,
      });

      setSuccessMsg(t.offerSentSuccess);
      setTimeout(() => {
        setActiveBuyer(null);
        setSuccessMsg('');
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const crops = ['All', 'Tomato', 'Onion', 'Potato', 'Wheat', 'Paddy (Dhan)', 'Cotton', 'Turmeric'];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-display">
          {t.findBuyersTitle}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          Connect directly with verified agribusiness aggregators, food processors, and wholesale procurement hubs
        </p>
      </div>

      {/* Commodity Filters */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-100 rounded-2xl w-fit">
        {crops.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCommodity(c)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCommodity === c
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {c === 'All' ? t.allCrops : c}
          </button>
        ))}
      </div>

      {/* Buyers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {buyers.map((buyer) => (
          <div
            key={buyer.id}
            className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                    {buyer.buyerType}
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 leading-tight">
                    {buyer.companyName}
                  </h3>
                </div>

                {buyer.verified && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-stone-500 mb-4">
                Lead: <strong>{buyer.contactPerson}</strong> · {buyer.district}, {buyer.state}
              </p>

              {/* Commodities Demand Box */}
              <div className="mb-4 space-y-2">
                <span className="text-xs font-bold text-stone-700 block">
                  Commodities Procuring Now:
                </span>
                <div className="space-y-1.5">
                  {buyer.commoditiesWanted.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-stone-900">{c.commodity}</strong>
                        <span className="text-stone-500 ml-2">Min {c.minQuantityQuintals} quintals</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-800 tabular-nums block text-sm">
                          ₹{(c.targetPricePerQuintal / 100).toFixed(2)} / kg
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          ₹{c.targetPricePerQuintal} / quintal
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Terms */}
              <div className="text-xs text-stone-600 mb-5 p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                <strong className="text-amber-900 block mb-0.5">Payment Terms:</strong>
                {buyer.paymentTerms}
              </div>
            </div>

            {/* Actions: Send Quote */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
              <div className="text-xs text-stone-500">
                <span className="block">{buyer.phone}</span>
              </div>

              <button
                onClick={() => handleOpenOfferModal(buyer)}
                className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.sendOffer}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Send Offer Modal */}
      {activeBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  Direct Harvest Quote
                </span>
                <h3 className="text-lg font-bold text-stone-900">{activeBuyer.companyName}</h3>
              </div>
              <button
                onClick={() => setActiveBuyer(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-stone-900">{successMsg}</h4>
                <p className="text-xs text-stone-500 mt-1">
                  The buyer has been notified and can review or accept your quote.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitOffer} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Select Crop</label>
                  <select
                    value={offerCrop}
                    onChange={(e) => setOfferCrop(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                  >
                    {activeBuyer.commoditiesWanted.map((c) => (
                      <option key={c.commodity} value={c.commodity}>
                        {c.commodity} (Buyer Target: ₹{c.targetPricePerQuintal}/q)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      {t.quantityQuintals}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={offerQty}
                      onChange={(e) => setOfferQty(e.target.value)}
                      className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      {t.offerPrice}
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Proposed Delivery / Ready Date
                  </label>
                  <input
                    type="date"
                    required
                    value={offerDate}
                    onChange={(e) => setOfferDate(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Quality & Lot Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={offerNotes}
                    onChange={(e) => setOfferNotes(e.target.value)}
                    placeholder="e.g. Graded red round harvest, packed in plastic crates, moisture 12%"
                    className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm transition-colors shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending Offer...' : 'Submit Harvest Quote to Buyer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
