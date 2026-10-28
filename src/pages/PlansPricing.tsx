import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export const PlansPricing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PLANS' | 'FEATURES' | 'ADDONS' | 'CREDITS' | 'ASSIGNED PLANS'>('PLANS');
  const [plans, setPlans] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('99');
  const [newPlanInterval, setNewPlanInterval] = useState('Monthly');

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;
    setPlans(prev => [
      ...prev,
      {
        id: Date.now(),
        name: newPlanName,
        price: `$${newPlanPrice}`,
        interval: newPlanInterval,
        status: 'ACTIVE'
      }
    ]);
    setNewPlanName('');
    setIsModalOpen(false);
  };

  const tabs = ['PLANS', 'FEATURES', 'ADDONS', 'CREDITS', 'ASSIGNED PLANS'] as const;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Plans & Features
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage system plans, pricing tiers, capabilities, and add-on services.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-8 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold tracking-wider transition-all cursor-pointer relative ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'PLANS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Subscription Plans
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage tiers, regional pricing, and attached capabilities.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={15} />
              New Plan
            </button>
          </div>

          {plans.length === 0 ? (
            /* Empty State matching image 6 */
            <div className="bg-white rounded-2xl border border-dashed border-slate-300/80 p-24 text-center">
              <p className="text-sm text-slate-400 font-medium">
                No subscription plans found. Create one to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => (
                <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {p.interval}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{p.name}</h3>
                    <div className="text-2xl font-bold text-slate-800 mt-1">{p.price} <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 mt-6 flex justify-between items-center text-xs">
                    <span className="text-emerald-600 font-semibold">{p.status}</span>
                    <button 
                      onClick={() => setPlans(plans.filter(x => x.id !== p.id))}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub tabs preview for other options */}
      {activeTab !== 'PLANS' && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300/80 p-20 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            {activeTab} Management
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Configurable parameters, entitlement switches, and credit rate allocations for {activeTab.toLowerCase()}.
          </p>
        </div>
      )}

      {/* New Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">Create New Subscription Plan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Professional Provider Tier"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    value={newPlanPrice}
                    onChange={(e) => setNewPlanPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Billing Interval
                  </label>
                  <select
                    value={newPlanInterval}
                    onChange={(e) => setNewPlanInterval(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
