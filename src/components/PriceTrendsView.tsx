import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Calendar,
  Layers,
  Activity,
} from 'lucide-react';
import { LanguageCode, PriceTrendPoint } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { api } from '../services/api';

interface PriceTrendsViewProps {
  language: LanguageCode;
}

const TREND_COMMODITIES = ['Tomato', 'Onion', 'Wheat', 'Potato', 'Paddy (Dhan)'];

export const PriceTrendsView: React.FC<PriceTrendsViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [selectedCommodity, setSelectedCommodity] = useState('Tomato');
  const [unitMode, setUnitMode] = useState<'KG' | 'QUINTAL'>('KG');
  const [trends, setTrends] = useState<PriceTrendPoint[]>([]);
  const [meta, setMeta] = useState({
    source: '',
    sourceUrl: '',
    retrievedAt: '',
    status: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTrends() {
      try {
        setLoading(true);
        const res = await api.getPriceTrends(selectedCommodity);
        if (isMounted) {
          setTrends(res.trends || []);
          setMeta({
            source: res.source,
            sourceUrl: res.sourceUrl,
            retrievedAt: res.retrievedAt,
            status: res.status,
          });
        }
      } catch (err) {
        console.error('Failed to load trends:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTrends();
    return () => {
      isMounted = false;
    };
  }, [selectedCommodity]);

  const latest = trends[trends.length - 1];
  const earliest = trends[0];

  const priceDiffQuintal = latest && earliest ? latest.modalPrice - earliest.modalPrice : 0;
  const priceDiffKg = parseFloat((priceDiffQuintal / 100).toFixed(2));
  const isUp = priceDiffQuintal >= 0;

  // Compute 7-day average in kg and quintal
  const avgModalQuintal = trends.length > 0
    ? Math.round(trends.reduce((s, p) => s + p.modalPrice, 0) / trends.length)
    : 0;
  const avgModalKg = parseFloat((avgModalQuintal / 100).toFixed(2));

  // Highest and lowest
  const highestKg = trends.length > 0
    ? Math.max(...trends.map((t) => t.maxPricePerKg || t.maxPrice / 100)).toFixed(2)
    : '0';
  const lowestKg = trends.length > 0
    ? Math.min(...trends.map((t) => t.minPricePerKg || t.minPrice / 100)).toFixed(2)
    : '0';

  // Max price for scale rendering
  const maxInSeries = trends.length > 0
    ? Math.max(...trends.map((t) => (unitMode === 'KG' ? (t.maxPricePerKg || t.maxPrice / 100) : t.maxPrice)))
    : 30;

  return (
    <div className="space-y-6 pb-16">
      {/* Title & Unit Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-display flex items-center gap-2">
            <span>{t.navTrends}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold">
              ₹ / kg & ₹ / Quintal
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Verified Agmarknet daily price progression, arrival volume correlation, and volatility index
          </p>
        </div>

        {/* Unit Selector */}
        <div className="flex items-center p-1 bg-stone-100 rounded-xl text-xs font-bold border border-stone-200 self-start sm:self-auto">
          <button
            onClick={() => setUnitMode('KG')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              unitMode === 'KG'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Show in ₹ / kg
          </button>
          <button
            onClick={() => setUnitMode('QUINTAL')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              unitMode === 'QUINTAL'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Show in ₹ / Quintal
          </button>
        </div>
      </div>

      {/* Commodity Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-100 rounded-2xl w-fit">
        {TREND_COMMODITIES.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCommodity(c)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCommodity === c
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Overview Stat Cards with KG and Quintal Details */}
      {latest && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
            <span className="text-xs text-stone-500 block">Current Modal Rate</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-emerald-800 tabular-nums">
                ₹{unitMode === 'KG' ? (latest.modalPrice / 100).toFixed(2) : latest.modalPrice}
              </span>
              <span className="text-xs font-bold text-stone-600">
                {unitMode === 'KG' ? '/ kg' : '/ Quintal'}
              </span>
            </div>
            <span className="text-xs text-stone-400 block mt-1">
              Equivalent: ₹{latest.modalPrice}/q (₹{(latest.modalPrice / 100).toFixed(2)}/kg)
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
            <span className="text-xs text-stone-500 block">7-Day Price Movement</span>
            <div className="flex items-center gap-1.5 mt-1">
              {isUp ? (
                <ArrowUpRight className="w-5 h-5 text-emerald-600" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-rose-600" />
              )}
              <span
                className={`text-2xl font-black tabular-nums ${
                  isUp ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isUp ? '+' : ''}₹{unitMode === 'KG' ? priceDiffKg.toFixed(2) : priceDiffQuintal}
              </span>
              <span className="text-xs font-bold text-stone-600">
                {unitMode === 'KG' ? '/ kg' : '/ q'}
              </span>
            </div>
            <span className="text-xs text-stone-400 block mt-1">
              Started at ₹{(earliest?.modalPrice / 100).toFixed(2)}/kg on {earliest?.date}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
            <span className="text-xs text-stone-500 block">7-Day Average Price</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-stone-900 tabular-nums">
                ₹{unitMode === 'KG' ? avgModalKg.toFixed(2) : avgModalQuintal}
              </span>
              <span className="text-xs font-bold text-stone-600">
                {unitMode === 'KG' ? '/ kg' : '/ q'}
              </span>
            </div>
            <span className="text-xs text-stone-400 block mt-1">
              Low: ₹{lowestKg}/kg · High: ₹{highestKg}/kg
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
            <span className="text-xs text-stone-500 block">Benchmark Mandi & Arrivals</span>
            <span className="text-sm font-bold text-stone-900 block mt-1 truncate" title={latest.market}>
              {latest.market}
            </span>
            <span className="text-xs text-emerald-800 font-semibold block mt-1 tabular-nums">
              {latest.arrivalQuantity} Tonnes ({latest.arrivalQuantity * 10} Quintals)
            </span>
          </div>
        </div>
      )}

      {/* Visual Progression Chart */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-stone-900">
            Daily Price Progression ({unitMode === 'KG' ? '₹ / Kilogram' : '₹ / Quintal'})
          </h3>
          <span className="text-xs text-stone-500">Agmarknet Official Recordings</span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-52 pt-8 pb-2 border-b border-stone-200">
          {trends.map((pt, i) => {
            const displayVal = unitMode === 'KG'
              ? (pt.modalPricePerKg || parseFloat((pt.modalPrice / 100).toFixed(2)))
              : pt.modalPrice;
            const heightPercent = Math.min(100, Math.max(15, Math.round((displayVal / (maxInSeries * 1.15)) * 100)));

            return (
              <div key={i} className="flex flex-col items-center h-full justify-end group">
                <span className="text-xs font-bold text-stone-800 tabular-nums mb-1 group-hover:text-emerald-800 transition-colors">
                  ₹{unitMode === 'KG' ? displayVal.toFixed(2) : displayVal}
                </span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[44px] bg-emerald-700 hover:bg-emerald-800 rounded-t-xl transition-all relative"
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap pointer-events-none transition-opacity shadow-lg z-10">
                    Min: ₹{(pt.minPrice / 100).toFixed(2)}/kg · Max: ₹{(pt.maxPrice / 100).toFixed(2)}/kg
                    <br />
                    Arrivals: {pt.arrivalQuantity} Tonnes
                  </div>
                </div>
                <span className="text-[10px] text-stone-500 mt-2 tracking-tight">
                  {pt.date.split('-').slice(0, 2).join('/')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Source metadata */}
        <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
          <div>
            <span>SOURCE: </span>
            <strong className="text-stone-700">{meta.source}</strong>
          </div>
          <div>
            <span>STATUS: </span>
            <strong className="text-emerald-800">{meta.status}</strong>
          </div>
        </div>
      </div>

      {/* Comprehensive Data Table with Dual Units */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 font-bold text-sm text-stone-800 flex justify-between items-center">
          <span>Official Recorded Bulletin Entries (Dual Units)</span>
          <span className="text-xs text-stone-400 font-normal">7-Day Agmarknet History</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Market</th>
                <th className="py-3 px-4 text-right">Rate in ₹ / kg</th>
                <th className="py-3 px-4 text-right">Min Rate (/kg)</th>
                <th className="py-3 px-4 text-right">Max Rate (/kg)</th>
                <th className="py-3 px-4 text-right">Rate in ₹ / Quintal</th>
                <th className="py-3 px-4 text-right">Arrivals (Tonnes)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {trends.map((pt, i) => (
                <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-stone-900 tabular-nums">{pt.date}</td>
                  <td className="py-3 px-4 text-stone-600">{pt.market}</td>
                  <td className="py-3 px-4 text-right tabular-nums font-black text-emerald-800 text-sm">
                    ₹{(pt.modalPrice / 100).toFixed(2)}/kg
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-stone-600">
                    ₹{(pt.minPrice / 100).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-stone-600">
                    ₹{(pt.maxPrice / 100).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-semibold text-stone-800">
                    ₹{pt.modalPrice}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-stone-700">
                    {pt.arrivalQuantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
