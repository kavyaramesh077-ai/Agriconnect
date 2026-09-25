import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { FarmerHome } from './components/FarmerHome';
import { MarketPricesView } from './components/MarketPricesView';
import { PriceTrendsView } from './components/PriceTrendsView';
import { FindBuyersView } from './components/FindBuyersView';
import { MyProduceView } from './components/MyProduceView';
import { OffersView } from './components/OffersView';
import { TransportView } from './components/TransportView';
import { PaymentsView } from './components/PaymentsView';
import { AlertsSubscriptionView } from './components/AlertsSubscriptionView';
import { HelpView } from './components/HelpView';
import { AdminPortal } from './components/AdminPortal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { FarmerAuthModal } from './components/FarmerAuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { LanguageCode, FarmerProfile } from './types';
import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);

  // Modals
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAddProduceOpen, setIsAddProduceOpen] = useState(false);
  const [alertTarget, setAlertTarget] = useState<{ crop?: string; market?: string }>({});

  // Load language preference and farmer profile on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('agriconnect_lang') as LanguageCode;
    if (savedLang) {
      setLanguage(savedLang);
    }

    const savedToken = localStorage.getItem('agriconnect_token');
    api.getFarmerProfile(savedToken || undefined).then((res) => {
      if (res.success && res.profile) {
        setFarmer(res.profile);
        if (res.profile.language) {
          setLanguage(res.profile.language);
        }
      }
    });
  }, []);

  const handleSelectLanguage = (newLang: LanguageCode) => {
    setLanguage(newLang);
    localStorage.setItem('agriconnect_lang', newLang);
  };

  const handleLoginSuccess = (profile: FarmerProfile, token: string) => {
    setFarmer(profile);
    localStorage.setItem('agriconnect_token', token);
    if (profile.language) {
      handleSelectLanguage(profile.language);
    }
  };

  const handleLogout = () => {
    setFarmer(null);
    localStorage.removeItem('agriconnect_token');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Header / Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={handleSelectLanguage}
        farmer={farmer}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenAdmin={() => setCurrentTab('admin')}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-20 lg:pb-12">
        {currentTab === 'home' && (
          <FarmerHome
            farmer={farmer}
            language={language}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenProduceModal={() => {
              setCurrentTab('produce');
              setIsAddProduceOpen(true);
            }}
          />
        )}

        {currentTab === 'prices' && (
          <MarketPricesView
            language={language}
            onSubscribeAlert={(crop, market) => {
              setAlertTarget({ crop, market });
              setCurrentTab('alerts');
            }}
          />
        )}

        {currentTab === 'trends' && <PriceTrendsView language={language} />}

        {currentTab === 'buyers' && <FindBuyersView language={language} farmer={farmer} />}

        {currentTab === 'produce' && (
          <MyProduceView
            language={language}
            farmer={farmer}
            isOpenAddModal={isAddProduceOpen}
            onCloseAddModal={() => setIsAddProduceOpen(false)}
          />
        )}

        {currentTab === 'offers' && <OffersView language={language} farmer={farmer} />}

        {currentTab === 'transport' && <TransportView language={language} />}

        {currentTab === 'payments' && <PaymentsView language={language} />}

        {currentTab === 'alerts' && (
          <AlertsSubscriptionView
            language={language}
            farmer={farmer}
            initialCrop={alertTarget.crop}
            initialMarket={alertTarget.market}
          />
        )}

        {currentTab === 'admin' && <AdminPortal />}

        {currentTab === 'help' && <HelpView language={language} />}
      </main>

      {/* 3. Mobile Bottom Navigation Anchor */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
      />

      {/* 4. Modals */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        language={language}
      />

      <FarmerAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        language={language}
        onLoginSuccess={handleLoginSuccess}
        existingFarmer={farmer}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* 5. Minimal, quiet footer */}
      <footer className="hidden lg:block border-t border-stone-200 py-6 text-xs text-stone-500 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-900">AgriConnect</span>
            <span aria-hidden="true">·</span>
            <span>From Farm to the Right Market</span>
            <span aria-hidden="true">·</span>
            <span>Open Government Data Platform Linked</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>Kisan Helpline: 1800-180-1551</span>
            <span aria-hidden="true">·</span>
            <span>Directorate of Marketing & Inspection</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
