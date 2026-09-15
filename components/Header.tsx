'use client';

import React from 'react';
import { UserRole } from '@/lib/types';
import { RefreshCw, Cloud, CloudOff, Settings } from 'lucide-react';

interface HeaderProps {
  activeUser: UserRole;
  setActiveUser: (user: UserRole) => void;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncTime: string | null;
  onManualSync: () => void;
  onOpenSettings: () => void;
}

export function Header({
  activeUser,
  setActiveUser,
  syncStatus,
  lastSyncTime,
  onManualSync,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#F9F8F3]/95 backdrop-blur-md border-b border-[#E5E4DE] px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1C1C1E]">
                Plate Expectations
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4A6B5D] mb-1"></span>
            </div>
            <span className="text-[11px] font-medium text-[#7C7C80] -mt-1 hidden sm:inline">
              Meal Planner & Recipe Hub
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sync Status Button */}
          <button
            id="sync-status-btn"
            onClick={onManualSync}
            title={
              syncStatus === 'syncing'
                ? 'Syncing with Google Sheets...'
                : syncStatus === 'synced'
                ? `Synced ${lastSyncTime ? `(${lastSyncTime})` : 'just now'}`
                : 'Offline mode (click to sync)'
            }
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E5E4DE] text-xs font-medium text-[#2C2C2E] hover:bg-[#F2F1EA] transition-colors shadow-xs"
          >
            {syncStatus === 'syncing' ? (
              <RefreshCw className="w-3.5 h-3.5 text-[#4A6B5D] animate-spin" />
            ) : syncStatus === 'synced' ? (
              <Cloud className="w-3.5 h-3.5 text-[#4A6B5D]" />
            ) : (
              <CloudOff className="w-3.5 h-3.5 text-[#A09F99]" />
            )}
            <span className="hidden md:inline">
              {syncStatus === 'syncing'
                ? 'Syncing...'
                : syncStatus === 'synced'
                ? 'Synced'
                : 'Offline'}
            </span>
          </button>

          {/* Settings / Apps Script Modal Button */}
          <button
            id="open-settings-btn"
            onClick={onOpenSettings}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-[#E5E4DE] text-[#2C2C2E] hover:bg-[#F2F1EA] transition-colors shadow-xs"
            title="Apps Script & App Settings"
          >
            <Settings className="w-4 h-4 text-[#4A6B5D]" />
          </button>
        </div>
      </div>
    </header>
  );
}
