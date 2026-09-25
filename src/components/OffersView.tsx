import React, { useState, useEffect } from 'react';
import { PackageCheck, Check, RotateCcw, X, MessageSquare, Clock } from 'lucide-react';
import { LanguageCode, ProduceOffer, FarmerProfile } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { api } from '../services/api';

interface OffersViewProps {
  language: LanguageCode;
  farmer: FarmerProfile | null;
}

export const OffersView: React.FC<OffersViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [offers, setOffers] = useState<ProduceOffer[]>([]);
  const [counterId, setCounterId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState('2000');
  const [loading, setLoading] = useState(true);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const res = await api.getOffers();
      setOffers(res.offers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleUpdateStatus = async (id: string, status: string, counter?: number) => {
    try {
      await api.updateOffer(id, { status, counterPrice: counter });
      setCounterId(null);
      await loadOffers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-display">
          {t.myOffers}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          Negotiate with buyers, accept procurement quotes, and finalize sale agreements
        </p>
      </div>

      <div className="space-y-4">
        {offers.length === 0 ? (
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500">
            No offers currently available.
          </div>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    {offer.crop} Lot Offer
                  </span>
                  <h3 className="text-lg font-bold text-stone-900">{offer.buyerCompany}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Buyer Rep: {offer.buyerName} · Date: {new Date(offer.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      offer.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : offer.status === 'COUNTERED'
                        ? 'bg-blue-100 text-blue-800'
                        : offer.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {offer.status}
                  </span>
                </div>
              </div>

              {/* Offer Details */}
              <div className="py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-stone-500 block">Offered Rate</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-emerald-800 tabular-nums">
                      ₹{(offer.offeredPricePerQuintal / 100).toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-stone-600">/ kg</span>
                  </div>
                  <span className="text-[10px] text-stone-400 block">
                    (₹{offer.offeredPricePerQuintal} / quintal)
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 block">Quantity Wanted</span>
                  <span className="text-lg font-bold text-stone-900 tabular-nums">
                    {offer.quantityQuintals} Quintals
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 block">Total Lot Value</span>
                  <span className="text-lg font-bold text-stone-900 tabular-nums">
                    ₹{(offer.offeredPricePerQuintal * offer.quantityQuintals).toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 block">Proposed Delivery</span>
                  <span className="text-sm font-semibold text-stone-700">
                    {offer.proposedDeliveryDate}
                  </span>
                </div>
              </div>

              {offer.notes && (
                <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 mb-4 border border-stone-100">
                  <strong className="text-stone-800 block mb-0.5">Buyer Note:</strong>
                  {offer.notes}
                </div>
              )}

              {offer.counterPrice && (
                <div className="p-3 bg-blue-50 text-blue-900 rounded-xl text-xs mb-4 border border-blue-100">
                  <strong>Counter Offer Sent:</strong> ₹{offer.counterPrice} / Quintal
                </div>
              )}

              {/* Action Buttons for Pending Offer */}
              {offer.status === 'PENDING' && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(offer.id, 'ACCEPTED')}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept Offer</span>
                  </button>

                  <button
                    onClick={() => setCounterId(offer.id)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Counter Price</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(offer.id, 'REJECTED')}
                    className="px-4 py-2 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </div>
              )}

              {/* Counter Input Box */}
              {counterId === offer.id && (
                <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-700 whitespace-nowrap">
                    Your Counter Price: ₹
                  </span>
                  <input
                    type="number"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    className="w-28 text-sm p-1.5 rounded-lg border border-stone-300 font-bold tabular-nums"
                  />
                  <button
                    onClick={() =>
                      handleUpdateStatus(offer.id, 'COUNTERED', parseFloat(counterPrice))
                    }
                    className="px-3 py-1.5 bg-blue-700 text-white text-xs font-bold rounded-lg"
                  >
                    Send Counter
                  </button>
                  <button
                    onClick={() => setCounterId(null)}
                    className="px-2 py-1 text-xs text-stone-500"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
