import React, { useState } from 'react';
import { Search, Zap, ChevronDown, X, Check } from 'lucide-react';

export const CreditsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);
  const [rates, setRates] = useState({
    verification: 1,
    credentialCheck: 2,
    caqhSync: 3
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Organization Credits
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor credit balances, quota consumptions, and configure platform burn rates.
          </p>
        </div>

        {/* Set Burn Rates Button */}
        <button
          onClick={() => setIsBurnModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors self-start md:self-auto cursor-pointer"
        >
          <Zap size={14} className="fill-current" />
          Set Burn Rates
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Search size={18} className="text-slate-400 shrink-0" />
          
          <button className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 text-xs font-semibold text-blue-600 shrink-0 cursor-pointer flex items-center gap-1.5">
            All credits
            <ChevronDown size={13} />
          </button>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search org admins..."
            className="w-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500 whitespace-nowrap pl-4 border-l border-slate-100 hidden md:block">
          0 organizations
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#002B49] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Org Admin (Owner)</th>
                <th className="py-4 px-6">Plan Quota</th>
                <th className="py-4 px-6">Credit Addons</th>
                <th className="py-4 px-6">Used Quota</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="text-center py-24 text-slate-400 text-sm font-medium">
                  No organization credits found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Set Burn Rates Modal */}
      {isBurnModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-blue-600 fill-blue-600" />
                <h3 className="text-base font-bold text-slate-800">Configure Platform Burn Rates</h3>
              </div>
              <button
                onClick={() => setIsBurnModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Specify credits consumed per operation by organization admins and providers.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Verification Check
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={rates.verification}
                    onChange={(e) => setRates({ ...rates, verification: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                  <span className="text-xs font-bold text-slate-500">Credits</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Credential Extraction
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={rates.credentialCheck}
                    onChange={(e) => setRates({ ...rates, credentialCheck: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                  <span className="text-xs font-bold text-slate-500">Credits</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Automated CAQH / Board Sync
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={rates.caqhSync}
                    onChange={(e) => setRates({ ...rates, caqhSync: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                  <span className="text-xs font-bold text-slate-500">Credits</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  onClick={() => setIsBurnModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert("Platform burn rates saved!");
                    setIsBurnModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} /> Save Rates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

