import React, { useState } from 'react';
import {
  Mic,
  Globe,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Home,
  TrendingUp,
  LineChart,
  Users,
  Sprout,
  Truck,
  CreditCard,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Bell,
} from 'lucide-react';
import { LanguageCode, FarmerProfile } from '../types';
import { LANGUAGES, TRANSLATIONS } from '../i18n/translations';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  farmer: FarmerProfile | null;
  onOpenAuth: () => void;
  onOpenVoice: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  farmer,
  onOpenAuth,
  onOpenVoice,
  onOpenAdmin,
  onLogout,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showWebsiteDrawer, setShowWebsiteDrawer] = useState(false);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const websiteSections = [
    {
      id: 'home',
      label: t.navHome,
      desc: 'Farm Dashboard & Daily Overview',
      icon: Home,
      badge: 'Main',
    },
    {
      id: 'prices',
      label: t.navPrices,
      desc: 'Live Mandi Daily Rates (data.gov.in)',
      icon: TrendingUp,
      badge: 'Live Data',
    },
    {
      id: 'trends',
      label: t.navTrends,
      desc: 'Price History & Agmarknet Curves',
      icon: LineChart,
      badge: 'Verified',
    },
    {
      id: 'buyers',
      label: t.navBuyers,
      desc: 'Verified Agribusinesses & Processors',
      icon: Users,
      badge: 'Direct Connect',
    },
    {
      id: 'produce',
      label: t.navProduce,
      desc: 'Manage Harvest Lots & Listings',
      icon: Sprout,
      badge: 'Listing',
    },
    {
      id: 'transport',
      label: t.navTransport,
      desc: 'Kisan Rath Freight & Cost Calculator',
      icon: Truck,
      badge: 'Logistics',
    },
    {
      id: 'payments',
      label: t.navPayments,
      desc: 'e-NAM Settlements & Payment Operations',
      icon: CreditCard,
      badge: 'Escrow / Pay',
    },
    {
      id: 'alerts',
      label: 'Price Alerts & SMS',
      desc: 'Daily SMS & In-App Mandi Rate Subscriptions',
      icon: Bell,
      badge: 'SMS Daily',
    },
    {
      id: 'admin',
      label: t.navAdmin,
      desc: 'SuperAdmin Diagnostics & Mandi Management',
      icon: ShieldCheck,
      badge: 'Admin Panel',
    },
    {
      id: 'help',
      label: t.navHelp,
      desc: 'Kisan Call Center: 1800-180-1551',
      icon: HelpCircle,
      badge: '24/7 Helpline',
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Zone 1: Brand Wordmark (Left) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('home')}
              className="text-left group flex items-baseline gap-2 focus:outline-none"
            >
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-800 font-display">
                AgriConnect
              </span>
              <span className="hidden xl:inline text-xs font-medium text-stone-500 tracking-normal">
                {t.tagline}
              </span>
            </button>
          </div>

          {/* Zone 2 & 3: Website List AND Controls Aligned to the RIGHT */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3 xl:gap-4">
            {/* Website Pages List (Desktop - positioned on the RIGHT side) */}
            <nav className="hidden lg:flex items-center gap-3 xl:gap-4 text-xs xl:text-sm font-medium text-stone-600 border-r border-stone-200 pr-3 mr-1">
              {websiteSections.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`py-1 transition-colors whitespace-nowrap focus:outline-none ${
                      isActive
                        ? 'text-emerald-800 font-bold border-b-2 border-emerald-700'
                        : 'hover:text-stone-900'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Voice Assistant Trigger */}
            <button
              onClick={onOpenVoice}
              aria-label="Voice Search"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors text-xs font-semibold"
            >
              <Mic className="w-4 h-4 text-emerald-700 animate-pulse" />
              <span className="hidden sm:inline">{t.btnAskVoice}</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors"
                title="Select Language / भाषा चुनें"
              >
                <Globe className="w-4 h-4 text-stone-600" />
                <span className="font-semibold">
                  {LANGUAGES.find((l) => l.code === language)?.nativeLabel || 'English'}
                </span>
              </button>

              {showLangMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-xl py-2 z-50 max-h-80 overflow-y-auto"
                  onMouseLeave={() => setShowLangMenu(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100">
                    Select Language / மொழி
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-stone-50 transition-colors ${
                        language === lang.code ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-stone-700'
                      }`}
                    >
                      <span>{lang.nativeLabel}</span>
                      <span className="text-[11px] text-stone-400">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Daily Price Alerts Button */}
            <button
              onClick={() => setCurrentTab('alerts')}
              aria-label="Daily Price Alerts & SMS"
              title="Daily Price Alerts & SMS Subscriptions"
              className={`p-2 rounded-lg transition-colors relative ${
                currentTab === 'alerts'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white animate-pulse" />
            </button>

            {/* Admin Panel Direct Shortcut */}
            <button
              onClick={onOpenAdmin}
              title={t.navAdmin}
              className={`p-2 rounded-lg transition-colors ${
                currentTab === 'admin'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
              }`}
            >
              <Shield className="w-4 h-4" />
            </button>

            {/* Farmer Auth / Profile */}
            {farmer ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium"
                >
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="max-w-[70px] sm:max-w-[120px] truncate">{farmer.name}</span>
                </button>
                <button
                  onClick={onLogout}
                  title={t.logout}
                  className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors whitespace-nowrap shadow-sm"
              >
                {t.loginTitle}
              </button>
            )}

            {/* Website List Menu Button (Right Side) */}
            <button
              onClick={() => setShowWebsiteDrawer(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors text-xs font-bold shadow-sm"
              title="Website Sections / All Pages"
            >
              <Menu className="w-4 h-4" />
              <span className="hidden md:inline">Website Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* RIGHT SIDEBAR: COMPLETE WEBSITE DIRECTORY & NAVIGATION DRAWER */}
      {showWebsiteDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/50 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-white w-full max-w-sm sm:max-w-md h-full shadow-2xl border-l border-stone-200 flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 block">
                  AgriConnect Portal
                </span>
                <h3 className="text-base font-extrabold text-stone-900">
                  Website Pages & Services
                </h3>
              </div>
              <button
                onClick={() => setShowWebsiteDrawer(false)}
                className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Website Links List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {websiteSections.map((sec) => {
                const Icon = sec.icon;
                const isActive = currentTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setCurrentTab(sec.id);
                      setShowWebsiteDrawer(false);
                    }}
                    className={`w-full p-3 rounded-2xl text-left flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isActive
                            ? 'bg-emerald-800 text-white'
                            : 'bg-white text-stone-700 shadow-xs'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold block">{sec.label}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isActive
                                ? 'bg-emerald-200 text-emerald-900'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {sec.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500 block">{sec.desc}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer Information */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 text-xs text-stone-500 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Live Government Open Data Platform Linked</span>
              </div>
              <div className="text-[10px] text-stone-400">
                Kisan Call Center: 1800-180-1551 (Toll-Free, 22 Languages)
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
