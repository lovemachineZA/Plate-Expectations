'use client';

import React from 'react';
import { Calendar, BookOpen, ShoppingBag, PieChart } from 'lucide-react';

export type TabType = 'plan' | 'recipes' | 'groceries' | 'stats';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  groceryCount: number;
}

export function Navbar({ activeTab, setActiveTab, groceryCount }: NavbarProps) {
  const tabs = [
    { id: 'plan' as TabType, label: 'PLAN', icon: Calendar },
    { id: 'recipes' as TabType, label: 'RECIPES', icon: BookOpen },
    { id: 'groceries' as TabType, label: 'GROCERIES', icon: ShoppingBag, badge: groceryCount },
    { id: 'stats' as TabType, label: 'STATS', icon: PieChart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E5E4DE] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center pt-1.5 pb-2 transition-all group"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform group-active:scale-90 ${
                    isActive ? 'text-[#4A6B5D] stroke-[2.2]' : 'text-[#8E8E93] stroke-[1.8]'
                  }`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#4A6B5D] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-wider font-semibold mt-1 transition-colors ${
                  isActive ? 'text-[#4A6B5D]' : 'text-[#8E8E93]'
                }`}
              >
                {tab.label}
              </span>
              {/* Active Green Indicator Line */}
              {isActive && (
                <div className="absolute bottom-1 w-5 h-1 bg-[#4A6B5D] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
