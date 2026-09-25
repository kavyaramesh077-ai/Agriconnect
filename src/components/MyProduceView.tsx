import React, { useState, useEffect } from 'react';
import { Sprout, Plus, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';
import { LanguageCode, ProduceListing, FarmerProfile } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { api } from '../services/api';

const PRODUCE_IMAGE_URL = '/src/assets/images/produce_harvest_fresh_1790261635195.jpg';

interface MyProduceViewProps {
  language: LanguageCode;
  farmer: FarmerProfile | null;
  isOpenAddModal: boolean;
  onCloseAddModal: () => void;
}

export const MyProduceView: React.FC<MyProduceViewProps> = ({
  language,
  farmer,
  isOpenAddModal,
  onCloseAddModal,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [produceList, setProduceList] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [crop, setCrop] = useState('Tomato');
  const [variety, setVariety] = useState('Hybrid Shivam');
  const [qty, setQty] = useState('25');
  const [askingPrice, setAskingPrice] = useState('1950');
  const [harvestDate, setHarvestDate] = useState('2026-09-26');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProduce = async () => {
    try {
      setLoading(true);
      const res = await api.getProduce();
      setProduceList(res.produce || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduce();
  }, []);

  const handleAddProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.addProduce({
        farmerId: farmer?.id || 'farmer-default',
        farmerName: farmer?.name || 'Ramasamy Kounder',
        farmerMobile: farmer?.mobile || '9842109876',
        crop,
        variety,
        quantityQuintals: parseFloat(qty),
        askingPricePerQuintal: parseFloat(askingPrice),
        harvestDate,
        state: farmer?.state || 'Tamil Nadu',
        district: farmer?.district || 'Krishnagiri',
        village: farmer?.village || 'Rayakottai',
        notes,
      });

      onCloseAddModal();
      await loadProduce();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-display">
            {t.navProduce}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Manage your harvested lots, check status, and receive buyer bids
          </p>
        </div>

        <button
          onClick={onCloseAddModal} // Toggles the modal
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addProduce}</span>
        </button>
      </div>

      {/* Produce Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {produceList.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              {/* Card visual banner */}
              <div className="h-40 relative bg-stone-100 overflow-hidden">
                <img
                  src={PRODUCE_IMAGE_URL}
                  alt={item.crop}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-emerald-800 shadow-sm">
                  {item.status}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="text-xl font-bold text-stone-900">{item.crop}</h3>
                  <span className="text-xs text-stone-500">Variety: {item.variety}</span>
                </div>

                <div className="mt-3 p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-stone-500 block">Lot Quantity</span>
                    <span className="text-base font-bold text-stone-900 tabular-nums">
                      {item.quantityQuintals} Quintals
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      ({item.quantityQuintals * 100} kg / {Math.round(item.quantityQuintals * 4)} crates)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-stone-500 block">{t.expectedPrice}</span>
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-lg font-black text-emerald-800 tabular-nums">
                        ₹{(item.askingPricePerQuintal / 100).toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-stone-600">/ kg</span>
                    </div>
                    <span className="text-[10px] text-stone-400 block">
                      (₹{item.askingPricePerQuintal} / Quintal)
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>Harvest Date: {item.harvestDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      {item.village}, {item.district}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="pt-2 text-stone-500 text-[11px] border-t border-stone-100 italic">
                      "{item.notes}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50/50 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-400">Listed on {new Date(item.createdAt).toLocaleDateString('en-IN')}</span>
              <span className="text-emerald-700 font-bold">Active in Market</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Produce Modal */}
      {isOpenAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative">
            <h3 className="text-lg font-bold text-stone-900 pb-3 border-b border-stone-100 mb-4">
              {t.addProduce}
            </h3>

            <form onSubmit={handleAddProduce} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
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
                    <option value="Maize">Maize</option>
                    <option value="Turmeric">Turmeric</option>
                    <option value="Green Chilli">Green Chilli</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Variety</label>
                  <input
                    type="text"
                    required
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. Hybrid Shivam / Desi"
                    className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
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
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50 tabular-nums font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    {t.expectedPrice}
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50 tabular-nums font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {t.harvestDate}
                </label>
                <input
                  type="date"
                  required
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Lot Notes & Grading Details
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Graded red round harvest, packed in 25kg crates"
                  className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onCloseAddModal}
                  className="w-1/2 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-800 text-white font-bold hover:bg-emerald-900 shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'List Produce'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
