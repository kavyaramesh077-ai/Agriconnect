import React from 'react';
import { Home, TrendingUp, Users, Sprout, HelpCircle } from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: LanguageCode;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const tabs = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'prices', label: t.navPrices, icon: TrendingUp },
    { id: 'buyers', label: t.navBuyers, icon: Users },
    { id: 'produce', label: t.navProduce, icon: Sprout },
    { id: 'help', label: t.navHelp, icon: HelpCircle },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg pb-safe">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
                isActive
                  ? 'text-emerald-800 font-bold'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[64px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
