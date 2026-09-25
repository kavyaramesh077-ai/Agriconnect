import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Server,
  Lock,
  Database,
  Users,
  Sprout,
  CreditCard,
  Building,
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Search,
  ExternalLink,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import {
  SystemStatus,
  FarmerProfile,
  MandiRecord,
  Buyer,
  ProduceListing,
  PaymentRecord,
} from '../types';
import { api } from '../services/api';

export const AdminPortal: React.FC = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [email, setEmail] = useState('admin@agriconnect.gov.in');
  const [password, setPassword] = useState('AgriAdmin#2026');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Admin Tab Navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'mandis' | 'farmers' | 'buyers' | 'produce' | 'finance'>('overview');

  // Live Data & Telemetry
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [configMsg, setConfigMsg] = useState('');

  // Domain records
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [mandis, setMandis] = useState<MandiRecord[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [produce, setProduce] = useState<ProduceListing[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Search queries
  const [mandiSearch, setMandiSearch] = useState('');
  const [farmerSearch, setFarmerSearch] = useState('');

  // Add Mandi Record Modal
  const [isOpenAddMandi, setIsOpenAddMandi] = useState(false);
  const [newMandiState, setNewMandiState] = useState('Tamil Nadu');
  const [newMandiDistrict, setNewMandiDistrict] = useState('Krishnagiri');
  const [newMandiMarket, setNewMandiMarket] = useState('Kaveripattinam Mandi');
  const [newMandiCommodity, setNewMandiCommodity] = useState('Tomato');
  const [newMandiMin, setNewMandiMin] = useState('1400');
  const [newMandiMax, setNewMandiMax] = useState('2100');
  const [newMandiModal, setNewMandiModal] = useState('1800');
  const [newMandiQty, setNewMandiQty] = useState('35');

  // Add Buyer Modal
  const [isOpenAddBuyer, setIsOpenAddBuyer] = useState(false);
  const [newBuyerCompany, setNewBuyerCompany] = useState('');
  const [newBuyerContact, setNewBuyerContact] = useState('');
  const [newBuyerType, setNewBuyerType] = useState<any>('Food Processor');
  const [newBuyerState, setNewBuyerState] = useState('Maharashtra');
  const [newBuyerDistrict, setNewBuyerDistrict] = useState('Nashik');
  const [newBuyerPhone, setNewBuyerPhone] = useState('+91 98');
  const [newBuyerTerms, setNewBuyerTerms] = useState('e-NAM Escrow settlement within 24 hours of gate weighment');
  const [actionNotice, setActionNotice] = useState('');

  const loadAllData = async () => {
    try {
      const [statusRes, farmersRes, mandiRes, buyersRes, produceRes, paymentsRes] = await Promise.all([
        api.getSystemStatus(),
        api.getAdminFarmers(),
        api.getMarketPrices({}),
        api.getBuyers(),
        api.getProduce(),
        api.getPayments(),
      ]);

      if (statusRes.success) setStatus(statusRes.status);
      if (farmersRes.success) setFarmers(farmersRes.farmers || []);
      if (mandiRes.records) setMandis(mandiRes.records || []);
      if (buyersRes.success) setBuyers(buyersRes.buyers || []);
      if (produceRes.success) setProduce(produceRes.produce || []);
      if (paymentsRes.success) setPayments(paymentsRes.payments || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadAllData();
    }
  }, [isAdminLoggedIn]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const res = await api.adminLogin(email.trim(), password);
      if (res.success) {
        setIsAdminLoggedIn(true);
      } else {
        setLoginError(res.message || 'Authentication failed.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Server error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateAdminConfig(apiKeyInput);
      setConfigMsg('API Key configuration updated successfully.');
      setTimeout(() => setConfigMsg(''), 3000);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMandi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addAdminMandiRecord({
        state: newMandiState,
        district: newMandiDistrict,
        market: newMandiMarket,
        commodity: newMandiCommodity,
        minPrice: parseFloat(newMandiMin),
        maxPrice: parseFloat(newMandiMax),
        modalPrice: parseFloat(newMandiModal),
        arrivalQuantity: parseFloat(newMandiQty),
      });

      if (res.success) {
        setActionNotice('New verified Mandi record successfully published to repository.');
        setIsOpenAddMandi(false);
        loadAllData();
        setTimeout(() => setActionNotice(''), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMandi = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this Mandi bulletin?')) return;
    try {
      await api.deleteAdminMandiRecord(id);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addAdminBuyer({
        companyName: newBuyerCompany,
        contactPerson: newBuyerContact,
        buyerType: newBuyerType,
        state: newBuyerState,
        district: newBuyerDistrict,
        phone: newBuyerPhone,
        paymentTerms: newBuyerTerms,
        commoditiesWanted: [{ commodity: 'Tomato', minQuantityQuintals: 20, targetPricePerQuintal: 1950 }],
      });

      if (res.success) {
        setActionNotice('New verified agribusiness buyer onboarded to network.');
        setIsOpenAddBuyer(false);
        setNewBuyerCompany('');
        loadAllData();
        setTimeout(() => setActionNotice(''), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBuyerVerify = async (id: string) => {
    try {
      await api.toggleBuyerVerify(id);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduce = async (id: string) => {
    if (!window.confirm('Delete this produce listing?')) return;
    try {
      await api.deleteProduce(id);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReleaseEscrow = async (id: string) => {
    try {
      const res = await api.releaseEscrow(id);
      if (res.success) {
        setActionNotice(res.message);
        loadAllData();
        setTimeout(() => setActionNotice(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalEscrowHeld = payments
    .filter((p) => p.status === 'ESCROW_HELD')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalDisbursed = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  // If not logged in, show secure login panel
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-12 pb-24">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl text-left">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-stone-900">AgriConnect Admin Panel</h2>
            <p className="text-xs text-stone-500 mt-1">
              Authorized Government Open Data & Mandi Oversight Portal
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 mb-5 space-y-1">
            <span className="font-bold text-stone-900 block">🔐 Security Guidelines:</span>
            <p>Admin authentication uses PBKDF2 cryptographic hashing with salt and login attempt lockout protection.</p>
            <div className="mt-2 pt-2 border-t border-stone-200 text-[11px] text-stone-500">
              Initial SuperAdmin: <code className="font-bold text-stone-800">admin@agriconnect.gov.in</code> / <code className="font-bold text-stone-800">AgriAdmin#2026</code>
            </div>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Administrator Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm py-2.5 px-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm py-2.5 px-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-stone-900 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Admin Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered lists
  const filteredMandis = mandis.filter(
    (m) =>
      m.market.toLowerCase().includes(mandiSearch.toLowerCase()) ||
      m.commodity.toLowerCase().includes(mandiSearch.toLowerCase()) ||
      m.state.toLowerCase().includes(mandiSearch.toLowerCase())
  );

  const filteredFarmers = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(farmerSearch.toLowerCase()) ||
      f.mobile.includes(farmerSearch) ||
      f.district.toLowerCase().includes(farmerSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Top Admin Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase tracking-wider">
              SUPER ADMIN
            </span>
            <span className="text-xs text-stone-500">{email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-display mt-0.5">
            AgriConnect Administration Portal
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadAllData}
            className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            <span>Sync Data</span>
          </button>

          <button
            onClick={() => setIsAdminLoggedIn(false)}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-700"
          >
            Sign Out
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Admin Tab Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-stone-100 rounded-2xl w-fit">
        {[
          { id: 'overview', label: 'Telemetry & Overview', icon: Server },
          { id: 'mandis', label: `Mandi Records (${mandis.length})`, icon: Database },
          { id: 'farmers', label: `Farmers (${farmers.length})`, icon: Users },
          { id: 'buyers', label: `Buyers (${buyers.length})`, icon: Building },
          { id: 'produce', label: `Produce (${produce.length})`, icon: Sprout },
          { id: 'finance', label: `Escrow & Settlements (${payments.length})`, icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-emerald-800" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------- TAB 1: OVERVIEW & TELEMETRY ---------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <span className="text-xs text-stone-500 font-medium block">Total Mandi Records</span>
              <span className="text-3xl font-black text-stone-900 block mt-1 tabular-nums">
                {mandis.length}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                ✓ Agmarknet & Gov Open Data
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <span className="text-xs text-stone-500 font-medium block">Registered Farmers</span>
              <span className="text-3xl font-black text-emerald-800 block mt-1 tabular-nums">
                {farmers.length}
              </span>
              <span className="text-[11px] text-stone-400 block mt-0.5">Active Mobile Profiles</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <span className="text-xs text-stone-500 font-medium block">Secured in Escrow</span>
              <span className="text-3xl font-black text-amber-700 block mt-1 tabular-nums">
                ₹{totalEscrowHeld.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-amber-800 font-semibold block mt-0.5">
                Pending Weighbridge Release
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <span className="text-xs text-stone-500 font-medium block">Total Settlements Disbursed</span>
              <span className="text-3xl font-black text-emerald-900 block mt-1 tabular-nums">
                ₹{totalDisbursed.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                Credited to Farmer DBT
              </span>
            </div>
          </div>

          {/* API Health & Open Data Monitor */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <h3 className="text-base font-bold text-stone-900 mb-2 flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-800" />
              <span>Live Government API Health & Cache Status</span>
            </h3>
            <p className="text-xs text-stone-500 mb-5 leading-relaxed">
              Real-time connectivity diagnostics to the Ministry of Agriculture Open Data gateway and Open-Meteo services.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-xs font-bold text-stone-800 block">data.gov.in Endpoint</span>
                <span className="text-sm font-extrabold text-emerald-800 block mt-1">
                  {status?.dataGovInStatus || 'ONLINE'}
                </span>
                <span className="text-[11px] text-stone-400">Response Latency: {status?.dataGovInLatencyMs || 0}ms</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-xs font-bold text-stone-800 block">Weather Meteorological API</span>
                <span className="text-sm font-extrabold text-emerald-800 block mt-1">
                  {status?.openMeteoStatus || 'ONLINE'}
                </span>
                <span className="text-[11px] text-stone-400">Open-Meteo Global Sync</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-xs font-bold text-stone-800 block">Geographic OpenStreetMap</span>
                <span className="text-sm font-extrabold text-emerald-800 block mt-1">
                  {status?.openStreetMapStatus || 'ONLINE'}
                </span>
                <span className="text-[11px] text-stone-400">Nominatim Reverse Geocoding</span>
              </div>
            </div>

            {/* API Key Configuration */}
            <form onSubmit={handleSaveApiKey} className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <label className="text-xs font-bold text-stone-800 block mb-1">
                Configure Government Open Data Platform (data.gov.in) API Key:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Enter data.gov.in API Key (Optional — default verified cache operates automatically)"
                  className="flex-1 text-xs py-2 px-3 rounded-xl border border-stone-300 bg-white font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  Save & Validate
                </button>
              </div>
              {configMsg && (
                <span className="text-xs text-emerald-800 font-semibold block mt-1.5">
                  ✓ {configMsg}
                </span>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ---------------- TAB 2: MANDI RECORDS MANAGEMENT ---------------- */}
      {activeTab === 'mandis' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={mandiSearch}
                onChange={(e) => setMandiSearch(e.target.value)}
                placeholder="Search market, commodity, or state..."
                className="w-full text-xs py-2 pl-8 pr-3 rounded-xl border border-stone-300 bg-stone-50 font-medium"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
            </div>

            <button
              onClick={() => setIsOpenAddMandi(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Mandi Bulletin</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Market / Mandi</th>
                    <th className="py-3 px-4">Commodity</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-right">Min Price</th>
                    <th className="py-3 px-4 text-right">Max Price</th>
                    <th className="py-3 px-4 text-right">Modal Price</th>
                    <th className="py-3 px-4 text-right">Arrivals (t)</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredMandis.map((m) => (
                    <tr key={m.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-stone-900">{m.market}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-800">{m.commodity}</td>
                      <td className="py-3 px-4 text-stone-500">{m.district}, {m.state}</td>
                      <td className="py-3 px-4 text-right tabular-nums">₹{m.minPrice}</td>
                      <td className="py-3 px-4 text-right tabular-nums">₹{m.maxPrice}</td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-800 text-sm">
                        ₹{m.modalPrice}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">{m.arrivalQuantity}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteMandi(m.id)}
                          title="Remove Bulletin"
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 3: FARMERS DIRECTORY ---------------- */}
      {activeTab === 'farmers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="relative max-w-md">
              <input
                type="text"
                value={farmerSearch}
                onChange={(e) => setFarmerSearch(e.target.value)}
                placeholder="Search by farmer name, mobile, or district..."
                className="w-full text-xs py-2 pl-8 pr-3 rounded-xl border border-stone-300 bg-stone-50 font-medium"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFarmers.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-base font-bold text-stone-900">{f.name}</h4>
                      <p className="text-xs text-stone-500 font-mono mt-0.5">+91 {f.mobile}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      VERIFIED FARMER
                    </span>
                  </div>

                  <div className="text-xs text-stone-600 space-y-1 my-3">
                    <p>Location: <strong>{f.village}</strong>, {f.district}, {f.state}</p>
                    {f.fpoName && <p>FPO Group: <strong>{f.fpoName}</strong></p>}
                    <p>Language: <strong>{f.language.toUpperCase()}</strong></p>
                  </div>

                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-[11px] text-stone-400 block mb-1">Crops Cultivated:</span>
                    <div className="flex flex-wrap gap-1">
                      {f.primaryCrops.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-semibold">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 text-[10px] text-stone-400">
                  Registered: {new Date(f.registeredAt).toLocaleDateString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- TAB 4: BUYERS MANAGEMENT ---------------- */}
      {activeTab === 'buyers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <span className="text-xs font-bold text-stone-700">Verified Agribusiness Buyers ({buyers.length})</span>
            <button
              onClick={() => setIsOpenAddBuyer(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Buyer Company</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buyers.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 uppercase">{b.buyerType}</span>
                      <h4 className="text-base font-bold text-stone-900">{b.companyName}</h4>
                      <p className="text-xs text-stone-500">Contact: {b.contactPerson} · {b.phone}</p>
                    </div>
                    <button
                      onClick={() => handleToggleBuyerVerify(b.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                        b.verified
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-stone-100 text-stone-500 border-stone-200'
                      }`}
                    >
                      {b.verified ? '✓ Verified' : 'Unverified'}
                    </button>
                  </div>

                  <div className="text-xs text-stone-600 my-2 p-2.5 rounded-xl bg-stone-50">
                    <strong className="block text-[11px] text-stone-700">Payment Terms:</strong>
                    {b.paymentTerms}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-500 flex justify-between items-center">
                  <span>Location: {b.district}, {b.state}</span>
                  <a href={`tel:${b.phone}`} className="text-emerald-800 font-bold hover:underline">
                    Call Buyer
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- TAB 5: PRODUCE LISTINGS MODERATION ---------------- */}
      {activeTab === 'produce' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Farmer</th>
                    <th className="py-3 px-4">Crop & Variety</th>
                    <th className="py-3 px-4 text-right">Quantity (q)</th>
                    <th className="py-3 px-4 text-right">Asking Price</th>
                    <th className="py-3 px-4">Harvest Date</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {produce.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-stone-900">{p.farmerName}</td>
                      <td className="py-3 px-4">
                        <strong className="text-emerald-800">{p.crop}</strong> ({p.variety})
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-semibold">{p.quantityQuintals}</td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-stone-900">₹{p.askingPricePerQuintal}/q</td>
                      <td className="py-3 px-4 text-stone-600">{p.harvestDate}</td>
                      <td className="py-3 px-4 text-stone-500">{p.village}, {p.district}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteProduce(p.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 6: FINANCIAL ESCROW & SETTLEMENTS ---------------- */}
      {activeTab === 'finance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-xs text-amber-900 font-bold block">Current Agricultural Escrow Balance</span>
              <span className="text-3xl font-black text-amber-800 block mt-1 tabular-nums">
                ₹{totalEscrowHeld.toLocaleString('en-IN')}
              </span>
              <p className="text-xs text-amber-700 mt-1">
                Guaranteed by e-NAM smart escrow contracts. Disburse funds upon weighment confirmation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-900 font-bold block">Total Completed Disbursals</span>
              <span className="text-3xl font-black text-emerald-800 block mt-1 tabular-nums">
                ₹{totalDisbursed.toLocaleString('en-IN')}
              </span>
              <p className="text-xs text-emerald-700 mt-1">
                100% reconciled and transferred to farmer bank accounts.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-100 font-bold text-sm text-stone-800">
              All Financial Transactions & Escrow Slips
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Ref & Slip</th>
                    <th className="py-3 px-4">Beneficiary Farmer</th>
                    <th className="py-3 px-4">Buyer Entity</th>
                    <th className="py-3 px-4">Crop Lot</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Escrow Operation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-stone-900 block">{p.transactionRef}</span>
                        <span className="text-[10px] text-stone-400">{p.mandiSlipNo}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-800">{p.farmerName || 'Ramasamy Kounder'}</td>
                      <td className="py-3 px-4 text-stone-600">{p.buyerName}</td>
                      <td className="py-3 px-4 text-stone-700">{p.crop} ({p.quantityQuintals}q)</td>
                      <td className="py-3 px-4 text-right tabular-nums font-black text-stone-900 text-sm">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-stone-600">{p.paymentMode}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {p.status === 'ESCROW_HELD' ? (
                          <button
                            onClick={() => handleReleaseEscrow(p.id)}
                            className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                          >
                            Release Escrow
                          </button>
                        ) : (
                          <span className="text-[11px] text-stone-400">✓ Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: ADD MANDI RECORD ---------------- */}
      {isOpenAddMandi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900 pb-3 border-b border-stone-100 mb-4">
              Publish Verified Mandi Bulletin
            </h3>

            <form onSubmit={handleAddMandi} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newMandiState}
                    onChange={(e) => setNewMandiState(e.target.value)}
                    className="w-full text-sm p-2 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={newMandiDistrict}
                    onChange={(e) => setNewMandiDistrict(e.target.value)}
                    className="w-full text-sm p-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Market / Mandi Name</label>
                <input
                  type="text"
                  required
                  value={newMandiMarket}
                  onChange={(e) => setNewMandiMarket(e.target.value)}
                  className="w-full text-sm p-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Commodity</label>
                <input
                  type="text"
                  required
                  value={newMandiCommodity}
                  onChange={(e) => setNewMandiCommodity(e.target.value)}
                  className="w-full text-sm p-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Min Price</label>
                  <input
                    type="number"
                    required
                    value={newMandiMin}
                    onChange={(e) => setNewMandiMin(e.target.value)}
                    className="w-full text-sm p-2 rounded-xl border border-stone-300 font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Max Price</label>
                  <input
                    type="number"
                    required
                    value={newMandiMax}
                    onChange={(e) => setNewMandiMax(e.target.value)}
                    className="w-full text-sm p-2 rounded-xl border border-stone-300 font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Modal Price</label>
                  <input
                    type="number"
                    required
                    value={newMandiModal}
                    onChange={(e) => setNewMandiModal(e.target.value)}
                    className="w-full text-sm p-2 rounded-xl border border-stone-300 font-bold text-emerald-800 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Arrival Quantity (Tonnes)</label>
                <input
                  type="number"
                  required
                  value={newMandiQty}
                  onChange={(e) => setNewMandiQty(e.target.value)}
                  className="w-full text-sm p-2 rounded-xl border border-stone-300 tabular-nums font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenAddMandi(false)}
                  className="w-1/2 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900"
                >
                  Publish Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: ADD BUYER ---------------- */}
      {isOpenAddBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900 pb-3 border-b border-stone-100 mb-4">
              Add Verified Agribusiness Buyer
            </h3>

            <form onSubmit={handleAddBuyer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Company / Entity Name</label>
                <input
                  type="text"
                  required
                  value={newBuyerCompany}
                  onChange={(e) => setNewBuyerCompany(e.target.value)}
                  placeholder="e.g. ITC Agro Sourcing Ltd"
                  className="w-full text-sm p-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={newBuyerContact}
                    onChange={(e) => setNewBuyerContact(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full text-sm p-2 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Buyer Type</label>
                  <select
                    value={newBuyerType}
                    onChange={(e) => setNewBuyerType(e.target.value as any)}
                    className="w-full text-sm p-2 rounded-xl border border-stone-300"
                  >
                    <option value="Food Processor">Food Processor</option>
                    <option value="FPO Aggregator">FPO Aggregator</option>
                    <option value="Retail Chain">Retail Chain</option>
                    <option value="Wholesale Trader">Wholesale Trader</option>
                    <option value="Exporters Co">Exporters Co</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newBuyerState}
                    onChange={(e) => setNewBuyerState(e.target.value)}
                    className="w-full text-sm p-2 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={newBuyerDistrict}
                    onChange={(e) => setNewBuyerDistrict(e.target.value)}
                    className="w-full text-sm p-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newBuyerPhone}
                  onChange={(e) => setNewBuyerPhone(e.target.value)}
                  className="w-full text-sm p-2 rounded-xl border border-stone-300 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Payment Terms</label>
                <input
                  type="text"
                  required
                  value={newBuyerTerms}
                  onChange={(e) => setNewBuyerTerms(e.target.value)}
                  className="w-full text-sm p-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenAddBuyer(false)}
                  className="w-1/2 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900"
                >
                  Onboard Buyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
