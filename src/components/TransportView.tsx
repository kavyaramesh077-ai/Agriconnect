import React, { useState, useEffect } from 'react';
import { Truck, Calculator, Phone, ShieldCheck, MapPin } from 'lucide-react';
import { LanguageCode, Transporter } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { api } from '../services/api';

interface TransportViewProps {
  language: LanguageCode;
}

export const TransportView: React.FC<TransportViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [village, setVillage] = useState('Rayakottai');
  const [mandi, setMandi] = useState('Krishnagiri Market');
  const [quantity, setQuantity] = useState('25');
  const [transporters, setTransporters] = useState<(Transporter & { calculatedDistanceKm: number; calculatedFreightCost: number })[]>([]);
  const [distanceKm, setDistanceKm] = useState(26);
  const [loading, setLoading] = useState(false);

  const calculateTransport = async () => {
    try {
      setLoading(true);
      const res = await api.getTransport(village, mandi, parseFloat(quantity) || 10);
      setTransporters(res.transporters || []);
      setDistanceKm(res.distanceKm || 26);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateTransport();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-display">
          {t.navTransport}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          Government benchmark freight rates, route distance, and verified rural farm carriers
        </p>
      </div>

      {/* Estimator Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm">
        <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-800" />
          <span>{t.estimateTransport}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              {t.fromVillage}
            </label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              {t.toMandi}
            </label>
            <input
              type="text"
              value={mandi}
              onChange={(e) => setMandi(e.target.value)}
              className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              {t.quantityQuintals}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold tabular-nums"
              />
              <button
                onClick={calculateTransport}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold whitespace-nowrap"
              >
                Estimate
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-stone-50 rounded-xl text-xs text-stone-600 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>
              Route: <strong>{village}</strong> to <strong>{mandi}</strong>
            </span>
          </div>
          <span className="font-bold text-stone-900 tabular-nums">
            Distance: ~{distanceKm} km
          </span>
        </div>
      </div>

      {/* Available Transporters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {transporters.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-base font-bold text-stone-900">{t.agencyName}</h4>
                  <p className="text-xs text-stone-500">
                    Driver: <strong>{t.driverName}</strong> · Vehicle: <strong>{t.vehicleType}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified</span>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-stone-50 border border-stone-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-500 block text-[11px]">Vehicle Capacity</span>
                  <span className="font-bold text-stone-800 tabular-nums">
                    {t.capacityQuintals} Quintals
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Base Fare</span>
                  <span className="font-bold text-stone-800 tabular-nums">
                    ₹{t.baseCharge} + ₹{t.ratePerKmPerQuintal}/km/q
                  </span>
                </div>
              </div>

              {/* Estimated Trip Fare */}
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <span className="text-xs text-emerald-900 font-medium">Estimated Freight:</span>
                <span className="text-xl font-black text-emerald-800 tabular-nums">
                  ₹{t.calculatedFreightCost}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-400">Rating: ⭐ {t.rating} / 5.0</span>
              <a
                href={`tel:${t.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {t.phone}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
