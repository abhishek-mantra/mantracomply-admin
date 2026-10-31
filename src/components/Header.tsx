import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Shield, LogOut, Check, ArrowLeftRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { currentPersona, personas, switchPersona } = useApp();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const personaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (personaRef.current && !personaRef.current.contains(event.target as Node)) {
        setPersonaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ADMIN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CREDENTIALING_SPECIALIST':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="h-16 px-6 md:px-8 flex items-center justify-between bg-transparent select-none relative z-30">
      {/* Left / Center: Interactive Prototype Persona Switcher */}
      <div className="relative" ref={personaRef}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:inline">
            Prototype Persona:
          </span>
          <button
            onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all text-xs font-semibold text-slate-800 cursor-pointer"
          >
            <div className={`w-5 h-5 rounded-full ${currentPersona.avatarColor} text-white flex items-center justify-center text-[10px] font-bold`}>
              {currentPersona.avatarText}
            </div>
            <span>{currentPersona.name}</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getRoleBadgeStyle(currentPersona.role)}`}>
              {currentPersona.role}
            </span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </div>

        {/* Persona Dropdown Menu */}
        {personaMenuOpen && (
          <div className="absolute left-0 sm:left-24 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Switch Test Role & View
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate role-based access control and specialist data isolation.
              </p>
            </div>
            
            <div className="p-1 space-y-1">
              {personas.map((persona) => {
                const isSelected = persona.id === currentPersona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => {
                      switchPersona(persona.id);
                      setPersonaMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/80 border border-blue-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full ${persona.avatarColor} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                        {persona.avatarText}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 leading-tight">
                          {persona.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {persona.role}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check size={15} className="text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right: User Profile Menu */}
      <div className="relative" ref={profileRef}>
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
        >
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-800 leading-tight">
              {currentPersona.name}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider">
              {currentPersona.role}
            </div>
          </div>
          <div className={`w-9 h-9 rounded-full ${currentPersona.avatarColor} flex items-center justify-center text-white font-semibold text-sm shadow-xs`}>
            {currentPersona.avatarText}
          </div>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>

        {profileMenuOpen && (
          <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-sm animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-2.5 border-b border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                SIGNED IN AS
              </div>
              <p className="font-bold text-slate-900 text-xs truncate" title={currentPersona.email}>
                {currentPersona.email}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-slate-700">{currentPersona.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeStyle(currentPersona.role)}`}>
                  {currentPersona.role}
                </span>
              </div>
            </div>

            <div className="p-1 space-y-0.5">
              <button 
                className="w-full px-3 py-2 text-left text-xs font-medium text-blue-600 hover:bg-blue-50/70 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors"
                onClick={() => {
                  setProfileMenuOpen(false);
                  window.location.href = '/admin/overview';
                }}
              >
                <ArrowLeftRight size={14} className="text-blue-600" />
                <span>Switch to Client / Org Admin View</span>
              </button>

              <button 
                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors"
                onClick={() => { setProfileMenuOpen(false); }}
              >
                <User size={14} /> Profile Settings
              </button>

              <button 
                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors"
                onClick={() => { setProfileMenuOpen(false); }}
              >
                <Shield size={14} /> Permissions Matrix
              </button>
            </div>

            <div className="border-t border-slate-100 my-1"></div>

            <div className="p-1">
              <button 
                className="w-full px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors"
                onClick={() => { setProfileMenuOpen(false); }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
