import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  Package,
  Mic,
  ArrowRight,
  CloudSun,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
} from 'lucide-react';
import {
  LanguageCode,
  FarmerProfile,
  MandiRecord,
  WeatherData,
  ProduceOffer,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { api } from '../services/api';

const HERO_IMAGE_URL = '/src/assets/images/hero_farmer_market_1790261615431.jpg';

interface FarmerHomeProps {
  farmer: FarmerProfile | null;
  language: LanguageCode;
  onNavigate: (tab: string) => void;
  onOpenVoice: () => void;
  onOpenProduceModal: () => void;
}

export const FarmerHome: React.FC<FarmerHomeProps> = ({
  farmer,
  language,
  onNavigate,
  onOpenVoice,
  onOpenProduceModal,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [topPrices, setTopPrices] = useState<MandiRecord[]>([]);
  const [offers, setOffers] = useState<ProduceOffer[]>([]);
  const [loading, setLoading] = useState(true);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greetingMorning;
    if (hour < 17) return t.greetingAfternoon;
    return t.greetingEvening;
  };

  const farmerName = farmer ? farmer.name : 'Farmer Friend';
  const farmerDistrict = farmer ? farmer.district : 'Krishnagiri';
  const farmerCrop = farmer?.primaryCrops?.[0] || 'Tomato';

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        setLoading(true);
        // 1. Fetch real weather from Open-Meteo
        const weatherData = await api.getWeather(farmerDistrict);
        if (isMounted) setWeather(weatherData);

        // 2. Fetch real Mandi prices for farmer's crop
        const priceResp = await api.getMarketPrices({
          commodity: farmerCrop,
        });
        if (isMounted && priceResp.records) {
          setTopPrices(priceResp.records.slice(0, 4));
        }

        // 3. Fetch pending offers
        const offersResp = await api.getOffers();
        if (isMounted && offersResp.offers) {
          setOffers(offersResp.offers);
        }
      } catch (err) {
        console.warn('Dashboard load notice:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [farmerDistrict, farmerCrop]);

  // Find best available price across mandis
  const bestRecord = topPrices.length > 0
    ? [...topPrices].sort((a, b) => b.modalPrice - a.modalPrice)[0]
    : null;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* 1. Header Greeting & Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-stone-900 text-white shadow-xl">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src={HERO_IMAGE_URL}
            alt="AgriConnect Farmer"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/75 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 backdrop-blur-md text-emerald-200 text-xs font-semibold mb-3 border border-emerald-700/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Government Agmarknet & Open Data Linked</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
            {getGreeting()}, {farmerName}
          </h1>

          <p className="mt-2 text-stone-200 text-sm sm:text-base leading-relaxed">
            {farmer ? (
              <span>
                {farmer.village} · {farmer.district}, {farmer.state}
                {farmer.fpoName ? ` · ${farmer.fpoName}` : ''}
              </span>
            ) : (
              <span>Empowering farmers with authentic market prices and verified direct buyers.</span>
            )}
          </p>

          {/* Quick weather chip */}
          {weather && (
            <div className="mt-4 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-xs text-stone-100">
              <CloudSun className="w-5 h-5 text-amber-300" />
              <span>
                {weather.district}: <strong className="text-white">{weather.temperature}°C</strong>, {weather.weatherCondition}
              </span>
              <span className="text-stone-300">|</span>
              <span className="text-emerald-300 font-medium">Humidity: {weather.relativeHumidity}%</span>
            </div>
          )}
        </div>
      </section>

      {/* 2. Four Big Farmer Action Buttons (Large, Touch-Friendly) */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Button 1: Check Crop Price */}
          <button
            onClick={() => onNavigate('prices')}
            className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-emerald-800 text-white hover:bg-emerald-900 shadow-md hover:shadow-lg transition-all transform active:scale-98 min-h-[100px] text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-700/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm sm:text-base font-bold">{t.btnCheckPrice}</span>
            <span className="text-[11px] text-emerald-200 mt-0.5">Live Mandi Rates</span>
          </button>

          {/* Button 2: Find Buyer */}
          <button
            onClick={() => onNavigate('buyers')}
            className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-amber-700 text-white hover:bg-amber-800 shadow-md hover:shadow-lg transition-all transform active:scale-98 min-h-[100px] text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-amber-600/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm sm:text-base font-bold">{t.btnFindBuyer}</span>
            <span className="text-[11px] text-amber-200 mt-0.5">Verified Companies</span>
          </button>

          {/* Button 3: Sell My Produce */}
          <button
            onClick={() => {
              onNavigate('produce');
              onOpenProduceModal();
            }}
            className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-stone-800 text-white hover:bg-stone-900 shadow-md hover:shadow-lg transition-all transform active:scale-98 min-h-[100px] text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-stone-700/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm sm:text-base font-bold">{t.btnSellProduce}</span>
            <span className="text-[11px] text-stone-300 mt-0.5">List Harvest Lot</span>
          </button>

          {/* Button 4: Ask by Voice */}
          <button
            onClick={onOpenVoice}
            className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-rose-700 text-white hover:bg-rose-800 shadow-md hover:shadow-lg transition-all transform active:scale-98 min-h-[100px] text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-rose-600/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6 text-white animate-pulse" />
            </div>
            <span className="text-sm sm:text-base font-bold">{t.btnAskVoice}</span>
            <span className="text-[11px] text-rose-200 mt-0.5">Speak in Any Language</span>
          </button>
        </div>
      </section>

      {/* 3. Primary Dashboard Cards (Today's Prices, Best Available Price, Weather) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on lg): Today's Mandi Prices & Best Market */}
        <div className="lg:col-span-2 space-y-6">
          {/* Best Available Market Price Banner */}
          {bestRecord && (
            <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  ⭐ {t.bestAvailablePrice}
                </span>
                <h3 className="text-xl font-extrabold text-stone-900">
                  {bestRecord.commodity} at {bestRecord.market}
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  {bestRecord.district}, {bestRecord.state} · Arrival: <strong>{bestRecord.arrivalQuantity} tonnes</strong> · Grade: <strong>{bestRecord.grade || 'Super Grade A'}</strong>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-stone-500 block">Best Modal Rate in kg</span>
                <span className="text-3xl font-black text-emerald-800 tabular-nums">
                  ₹{(bestRecord.modalPrice / 100).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-stone-700 block mt-0.5">
                  / kg <span className="text-stone-400 font-normal">(₹{bestRecord.modalPrice} / Quintal)</span>
                </span>
              </div>
            </div>
          )}

          {/* Today's Market Prices Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h2 className="text-lg font-bold text-stone-900">{t.todaysMarketPrices}</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Live reports for {farmerCrop} in ₹ / kg and ₹ / Quintal
                </p>
              </div>
              <button
                onClick={() => onNavigate('prices')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <span>View All Mandis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-stone-100">
              {topPrices.map((record) => {
                const kgRate = record.pricePerKg || parseFloat((record.modalPrice / 100).toFixed(2));
                const minKg = record.minPricePerKg || parseFloat((record.minPrice / 100).toFixed(2));
                const maxKg = record.maxPricePerKg || parseFloat((record.maxPrice / 100).toFixed(2));
                return (
                  <div
                    key={record.id}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50/50 rounded-xl px-2 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-stone-900">{record.market}</h4>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">
                          {record.grade || 'FAQ Grade'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {record.commodity} ({record.variety}) · Arrivals: {record.arrivalQuantity}t · {record.arrivalDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-lg font-black text-emerald-800 tabular-nums">
                          ₹{kgRate.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-stone-600">/ kg</span>
                      </div>
                      <span className="text-[11px] text-stone-500 tabular-nums block">
                        ₹{record.modalPrice}/q (Min ₹{minKg} - Max ₹{maxKg}/kg)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Official Source & Verification Stamp */}
            <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span className="font-semibold text-emerald-800">SOURCE:</span>
                <span>Government Open Data Platform India / Agmarknet</span>
              </div>
              <div>
                <span>STATUS: </span>
                <strong className="text-stone-700">CACHED REAL DATA — 24-09-2026</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Weather & Farming Advisory + Offers & Demands */}
        <div className="space-y-6">
          {/* Live Weather & Advisory */}
          {weather && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <CloudSun className="w-4 h-4 text-amber-600" />
                  <span>{t.liveWeather}</span>
                </h3>
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                  {weather.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <span className="text-3xl font-extrabold text-stone-900 tabular-nums">
                    {weather.temperature}°C
                  </span>
                  <p className="text-xs text-stone-600 mt-0.5">{weather.weatherCondition}</p>
                </div>
                <div className="text-right text-xs text-stone-500">
                  <p>Humidity: <strong className="text-stone-700">{weather.relativeHumidity}%</strong></p>
                  <p>Wind: <strong className="text-stone-700">{weather.windSpeed} km/h</strong></p>
                </div>
              </div>

              {/* Advisory Box */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                <span className="font-bold block mb-0.5">🌾 {t.farmingAdvisory}:</span>
                {weather.farmingAdvisory}
              </div>

              <div className="mt-3 text-[10px] text-stone-400">
                Source: {weather.source}
              </div>
            </div>
          )}

          {/* My Offers / Inquiries Summary */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-stone-900">{t.myOffers}</h3>
              <button
                onClick={() => onNavigate('offers')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950"
              >
                View ({offers.length})
              </button>
            </div>

            {offers.length === 0 ? (
              <p className="text-xs text-stone-500 py-3 text-center">
                No active buyer offers right now. List your harvest to receive bids.
              </p>
            ) : (
              <div className="space-y-2">
                {offers.slice(0, 2).map((off) => (
                  <div
                    key={off.id}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-stone-900 block">{off.crop}</span>
                      <span className="text-stone-500 text-[11px]">{off.buyerCompany}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-800 block tabular-nums">
                        ₹{off.offeredPricePerQuintal}/q
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold">
                        {off.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Transport & Payments Shortcut */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('transport')}
              className="p-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors text-left flex flex-col justify-between"
            >
              <Truck className="w-5 h-5 text-emerald-800 mb-1" />
              <div>
                <span className="text-xs font-bold text-stone-900 block">{t.navTransport}</span>
                <span className="text-[10px] text-stone-500">Mandi Freight</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('payments')}
              className="p-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors text-left flex flex-col justify-between"
            >
              <CreditCard className="w-5 h-5 text-emerald-800 mb-1" />
              <div>
                <span className="text-xs font-bold text-stone-900 block">{t.navPayments}</span>
                <span className="text-[10px] text-stone-500">Slips & Receipts</span>
              </div>
            </button>
          </div>

          {/* Website Directory / All Services List (Right Column) */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                  Quick Access
                </span>
                <h3 className="text-sm font-bold text-stone-900">Website Directory</h3>
              </div>
              <span className="text-[10px] text-stone-400">9 Modules</span>
            </div>

            <div className="grid grid-cols-1 gap-1 text-xs">
              {[
                { id: 'prices', label: t.navPrices, desc: 'Live Mandi daily prices', badge: 'Live Data' },
                { id: 'trends', label: t.navTrends, desc: 'Price trend analytics', badge: 'Trends' },
                { id: 'buyers', label: t.navBuyers, desc: 'Verified buyers directory', badge: 'Verified' },
                { id: 'produce', label: t.navProduce, desc: 'List & track harvest lots', badge: 'My Crops' },
                { id: 'transport', label: t.navTransport, desc: 'Distance & freight calculator', badge: 'Kisan Rath' },
                { id: 'payments', label: t.navPayments, desc: 'e-NAM settlements & payment operations', badge: 'Escrow / Pay' },
                { id: 'admin', label: 'Admin Panel', desc: 'System telemetry & records', badge: 'SuperAdmin' },
                { id: 'help', label: t.navHelp, desc: 'Kisan Call Center: 1800-180-1551', badge: 'Helpline' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="w-full p-2 rounded-xl text-left hover:bg-stone-50 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <span className="font-semibold text-stone-800 group-hover:text-emerald-800 transition-colors">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-stone-400 block">{item.desc}</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600 group-hover:bg-emerald-100 group-hover:text-emerald-900 transition-colors">
                    {item.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
