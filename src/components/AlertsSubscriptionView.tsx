import React, { useState, useEffect } from 'react';
import {
  Bell,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Pause,
  Play,
  Volume2,
  RefreshCw,
  Send,
  X,
  ExternalLink,
  MessageSquare,
  Clock,
  MapPin,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { LanguageCode, FarmerProfile, SubscriptionAlert, AlertNotification } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { api } from '../services/api';
import { speechService } from '../services/speech';

interface AlertsSubscriptionViewProps {
  language: LanguageCode;
  farmer: FarmerProfile | null;
  initialCrop?: string;
  initialMarket?: string;
}

const POPULAR_CROPS = [
  'Tomato',
  'Onion',
  'Potato',
  'Wheat',
  'Paddy (Dhan)',
  'Cotton',
  'Turmeric',
  'Green Chilli',
  'Soyabean',
  'Maize',
  'Mustard',
  'Banana',
];

const POPULAR_MARKETS = [
  { market: 'Krishnagiri Market', state: 'Tamil Nadu', district: 'Krishnagiri' },
  { market: 'Lasalgaon Mandi', state: 'Maharashtra', district: 'Nashik' },
  { market: 'Kolar APMC Market', state: 'Karnataka', district: 'Kolar' },
  { market: 'Khanna Grain Market', state: 'Punjab', district: 'Ludhiana' },
  { market: 'Agra Mandi', state: 'Uttar Pradesh', district: 'Agra' },
  { market: 'Azadpur Mandi', state: 'Delhi', district: 'North Delhi' },
  { market: 'Dindigul Market', state: 'Tamil Nadu', district: 'Dindigul' },
  { market: 'Gondal APMC Market', state: 'Gujarat', district: 'Rajkot' },
  { market: 'Guntur Mirchi Yard', state: 'Andhra Pradesh', district: 'Guntur' },
  { market: 'Warangal Enam Mandi', state: 'Telangana', district: 'Warangal' },
];

export const AlertsSubscriptionView: React.FC<AlertsSubscriptionViewProps> = ({
  language,
  farmer,
  initialCrop,
  initialMarket,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [subscriptions, setSubscriptions] = useState<SubscriptionAlert[]>([]);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'notifications'>('subscriptions');

  // Modal State for New Subscription
  const [isOpenSubscribeModal, setIsOpenSubscribeModal] = useState(false);
  const [crop, setCrop] = useState(initialCrop || 'Tomato');
  const [market, setMarket] = useState(initialMarket || 'Krishnagiri Market');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Krishnagiri');
  const [channel, setChannel] = useState<'SMS' | 'IN_APP' | 'BOTH'>('BOTH');
  const [deliveryTime, setDeliveryTime] = useState('07:00 AM');
  const [minTargetPrice, setMinTargetPrice] = useState('');
  const [mobile, setMobile] = useState(farmer ? farmer.mobile : '9842109876');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Loading state for test action
  const [testingId, setTestingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subRes, notifRes] = await Promise.all([
        api.getSubscriptions(),
        api.getNotifications(),
      ]);

      if (subRes.success) setSubscriptions(subRes.subscriptions || []);
      if (notifRes.success) setNotifications(notifRes.notifications || []);
    } catch (err) {
      console.error('Error loading subscriptions/alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialCrop) setCrop(initialCrop);
    if (initialMarket) setMarket(initialMarket);
    if (initialCrop || initialMarket) setIsOpenSubscribeModal(true);
  }, [initialCrop, initialMarket]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionNotice('');

    try {
      const res = await api.subscribeAlert({
        crop,
        market,
        state,
        district,
        channel,
        deliveryTime,
        minTargetPricePerKg: minTargetPrice ? parseFloat(minTargetPrice) : undefined,
        mobile,
        farmerId: farmer ? farmer.id : 'farmer-default',
      });

      if (res.success) {
        setActionNotice(res.message);
        setIsOpenSubscribeModal(false);
        await loadData();
        setTimeout(() => setActionNotice(''), 4500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await api.toggleSubscription(id);
      if (res.success) {
        setActionNotice(res.message);
        await loadData();
        setTimeout(() => setActionNotice(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this daily rate alert?')) return;
    try {
      const res = await api.deleteSubscription(id);
      if (res.success) {
        setActionNotice(res.message);
        await loadData();
        setTimeout(() => setActionNotice(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendTest = async (subscriptionId: string) => {
    setTestingId(subscriptionId);
    try {
      const res = await api.sendTestAlert(subscriptionId);
      if (res.success) {
        setActionNotice(res.message);
        await loadData();
        setTimeout(() => setActionNotice(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTestingId(null);
    }
  };

  const handleSpeakRate = (sub: SubscriptionAlert) => {
    const rate = sub.latestRateSnapshot;
    if (!rate) return;

    let text = '';
    let phonetic = '';

    if (language === 'ta') {
      text = `${sub.market} சந்தையில் ${sub.crop} இன்றைய சராசரி விலை கிலோவிற்கு ₹${rate.pricePerKg} (குவிண்டாலுக்கு ₹${rate.modalPrice}). குறைந்தபட்சம் ₹${rate.minPricePerKg}, அதிகபட்சம் ₹${rate.maxPricePerKg} கிலோவிற்கு.`;
      phonetic = `${sub.market} sandhaiyil ${sub.crop} indraya vilai kilovukku ${rate.pricePerKg} roobai.`;
    } else if (language === 'hi') {
      text = `${sub.market} में ${sub.crop} का आज का मॉडल भाव ₹${rate.pricePerKg} प्रति किलो (₹${rate.modalPrice} प्रति क्विंटल) है।`;
      phonetic = `${sub.market} mein ${sub.crop} ka aaj ka bhav ${rate.pricePerKg} rupaye prati kilo hai.`;
    } else {
      text = `Daily alert for ${sub.crop} at ${sub.market}: Current modal rate is ₹${rate.pricePerKg} per kg (₹${rate.modalPrice} per quintal). Range is ₹${rate.minPricePerKg} to ₹${rate.maxPricePerKg} per kg.`;
      phonetic = text;
    }

    speechService.speakText(text, language, undefined, phonetic);
  };

  const handleMarkRead = async (notifId: string) => {
    try {
      await api.markNotificationRead(notifId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearRead = async () => {
    try {
      await api.clearNotifications();
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-emerald-700" />
              <span>National DLT SMS & In-App Service</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-display mt-1 flex items-center gap-2">
            <span>Daily Mandi Price Alerts</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Subscribe to automated morning SMS and in-app alerts with live rates in ₹/kg and ₹/Quintal
          </p>
        </div>

        {/* Action Button: Subscribe New Alert */}
        <button
          onClick={() => setIsOpenSubscribeModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Subscribe New Crop Alert</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tabs: Active Subscriptions vs In-App Notifications */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'subscriptions'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>My Subscriptions ({subscriptions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative ${
              activeTab === 'notifications'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Alerts Feed & SMS Log</span>
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-1" />
            )}
          </button>
        </div>

        {activeTab === 'notifications' && notifications.length > 0 && (
          <button
            onClick={handleClearRead}
            className="text-xs text-stone-500 hover:text-stone-800 font-semibold"
          >
            Clear read alerts
          </button>
        )}
      </div>

      {/* TAB 1: ACTIVE SUBSCRIPTIONS & LATEST RATES */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-stone-600">Loading your daily rate subscriptions...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-stone-200">
              <Bell className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-stone-800">No Rate Subscriptions Active</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
                Subscribe to your harvested crops and regional mandis to receive daily morning SMS with current rates.
              </p>
              <button
                onClick={() => setIsOpenSubscribeModal(true)}
                className="px-4 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 shadow-sm"
              >
                + Subscribe Your First Crop Alert
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map((sub) => {
                const rate = sub.latestRateSnapshot;
                const isBullish = (rate?.priceChangePercent ?? 0) >= 0;

                return (
                  <div
                    key={sub.id}
                    className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                      sub.active ? 'border-stone-200' : 'border-stone-200/60 opacity-70 bg-stone-50/50'
                    }`}
                  >
                    <div>
                      {/* Subscription Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-emerald-800 uppercase tracking-wide">
                              {sub.crop}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                sub.active ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {sub.active ? 'Active Daily Alert' : 'Paused'}
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-stone-900 mt-0.5">
                            {sub.market}
                          </h3>
                        </div>

                        {/* Audio Rate Button */}
                        {rate && (
                          <button
                            onClick={() => handleSpeakRate(sub)}
                            title="Listen to today's rate in audio"
                            className="p-2 rounded-xl bg-stone-100 hover:bg-emerald-100 text-stone-600 hover:text-emerald-800 transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Location & Channel badges */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{sub.district || sub.state}, {sub.state}</span>
                        </span>
                        <span aria-hidden="true" className="text-stone-300">·</span>
                        <span className="font-semibold text-stone-700">
                          {sub.channel === 'BOTH' ? '📱 SMS + In-App' : sub.channel === 'SMS' ? '📱 SMS Alert' : '🔔 In-App Push'}
                        </span>
                        <span aria-hidden="true" className="text-stone-300">·</span>
                        <span className="text-stone-500">{sub.deliveryTime} Daily</span>
                      </div>

                      {/* LATEST MARKET RATE DISPLAY FOR THIS SELECTION (KEY REQUIREMENT) */}
                      {rate ? (
                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 mb-4">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <span className="text-[11px] font-semibold text-stone-500 block mb-0.5">
                                Latest Rate for this Selection:
                              </span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black text-emerald-800 tabular-nums">
                                  ₹{rate.pricePerKg.toFixed(2)}
                                </span>
                                <span className="text-xs font-bold text-stone-600">/ kg</span>
                                <span className="text-xs text-stone-400 font-semibold ml-1">
                                  (₹{rate.modalPrice} / Quintal)
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-stone-400 block">Day Movement</span>
                              <span
                                className={`text-xs font-bold tabular-nums flex items-center justify-end gap-0.5 ${
                                  isBullish ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                              >
                                {isBullish ? '↗ +' : '↘ '}
                                {Math.abs(rate.priceChangePercent)}%
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 mt-2.5 border-t border-stone-200">
                            <div>
                              <span className="text-stone-400 block text-[11px]">Today's Range:</span>
                              <span className="font-bold text-stone-800 tabular-nums">
                                ₹{rate.minPricePerKg.toFixed(2)} - ₹{rate.maxPricePerKg.toFixed(2)} / kg
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-stone-400 block text-[11px]">Mandi Arrivals:</span>
                              <span className="font-bold text-stone-800 tabular-nums">
                                {rate.arrivalQuantity} Tonnes
                              </span>
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-stone-200/80 text-[10px] text-stone-400 flex justify-between items-center">
                            <span>Status: <strong className="text-emerald-800 font-bold">{rate.status}</strong></span>
                            <span>Recorded: {rate.date}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-stone-50 rounded-2xl text-xs text-stone-500 mb-4">
                          Waiting for morning APMC opening bulletin...
                        </div>
                      )}

                      {/* Target Price Threshold Indicator */}
                      {sub.minTargetPricePerKg && (
                        <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mb-4 flex items-center justify-between">
                          <span>Target Alert Threshold:</span>
                          <strong className="font-bold">≥ ₹{sub.minTargetPricePerKg} / kg</strong>
                        </div>
                      )}
                    </div>

                    {/* Card Actions: Test Alert, Pause, Delete */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleSendTest(sub.id)}
                        disabled={testingId === sub.id}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3 text-emerald-700" />
                        <span>{testingId === sub.id ? 'Sending...' : 'Test Send Alert'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(sub.id)}
                          title={sub.active ? 'Pause Alerts' : 'Resume Alerts'}
                          className="p-2 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
                        >
                          {sub.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-700" />}
                        </button>

                        <button
                          onClick={() => handleDelete(sub.id)}
                          title="Delete Subscription"
                          className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: IN-APP NOTIFICATIONS & SMS PREVIEW LOG */}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-stone-200">
              <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-500">No alert notifications delivered yet.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.read && handleMarkRead(notif.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  notif.read
                    ? 'bg-white border-stone-200'
                    : 'bg-emerald-50/50 border-emerald-200 shadow-xs cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 uppercase">
                        {notif.channel === 'SMS' ? '📱 SMS Dispatched' : '🔔 In-App Push'}
                      </span>
                      <span className="text-xs font-bold text-stone-900">{notif.title}</span>
                      {!notif.read && (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-800 text-white text-[9px] font-bold">
                          NEW
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed mt-1">
                      {notif.message}
                    </p>

                    {/* Realistic National Telecom DLT SMS Preview Box */}
                    {notif.smsPreview && (
                      <div className="mt-2.5 p-3 rounded-xl bg-stone-900 text-white font-mono text-[11px] leading-relaxed shadow-inner">
                        <div className="text-[9px] text-emerald-400 font-sans font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                          <span>DLT SMS Preview (Telecom Trai Compliant)</span>
                          <span>Sender: VM-AGRCON</span>
                        </div>
                        {notif.smsPreview}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-emerald-800 tabular-nums block">
                      ₹{notif.pricePerKg.toFixed(2)}/kg
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      {new Date(notif.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: SUBSCRIBE TO NEW DAILY RATE ALERT */}
      {isOpenSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative my-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  National Mandi Network
                </span>
                <h3 className="text-lg font-bold text-stone-900">Subscribe Daily Rate Alert</h3>
              </div>
              <button
                onClick={() => setIsOpenSubscribeModal(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-4 text-xs">
              {/* Crop Selection */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Select Crop</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-900"
                >
                  {POPULAR_CROPS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Market Selection */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Select Mandi / Market</label>
                <select
                  value={market}
                  onChange={(e) => {
                    const sel = POPULAR_MARKETS.find((m) => m.market === e.target.value);
                    setMarket(e.target.value);
                    if (sel) {
                      setState(sel.state);
                      setDistrict(sel.district);
                    }
                  }}
                  className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-900"
                >
                  {POPULAR_MARKETS.map((m) => (
                    <option key={m.market} value={m.market}>
                      {m.market} ({m.district}, {m.state})
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Channel Selection */}
              <div>
                <label className="font-bold text-stone-700 block mb-1.5">Notification Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'BOTH', label: 'SMS & In-App', icon: Sparkles },
                    { id: 'SMS', label: 'Daily SMS Only', icon: Smartphone },
                    { id: 'IN_APP', label: 'In-App Only', icon: Bell },
                  ].map((ch) => {
                    const Icon = ch.icon;
                    const isSel = channel === ch.id;
                    return (
                      <button
                        type="button"
                        key={ch.id}
                        onClick={() => setChannel(ch.id as any)}
                        className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
                          isSel
                            ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1 text-emerald-800" />
                        <span className="text-[11px]">{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Number for SMS */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Farmer Mobile Number (for SMS)</label>
                <div className="flex gap-2">
                  <span className="p-2.5 rounded-xl bg-stone-100 border border-stone-300 text-stone-600 font-bold text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="flex-1 text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-900 font-mono"
                  />
                </div>
              </div>

              {/* Delivery Time & Target Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Morning Alert Time</label>
                  <select
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                  >
                    <option value="06:30 AM">06:30 AM (Opening)</option>
                    <option value="07:00 AM">07:00 AM (Recommended)</option>
                    <option value="08:00 AM">08:00 AM (Post-Auction)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Target Price (₹/kg optional)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={minTargetPrice}
                    onChange={(e) => setMinTargetPrice(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50 tabular-nums"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
                <span className="font-bold text-stone-800 block">✓ Real-time Verification Guarantee:</span>
                <p>Alerts pull verified data directly from data.gov.in and Directorate of Marketing & Inspection records.</p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpenSubscribeModal(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold shadow-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Activating...' : 'Activate Daily Rate Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
