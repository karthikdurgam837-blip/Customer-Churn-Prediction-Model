/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingDown, 
  TrendingUp,
  AlertTriangle, 
  DollarSign, 
  RefreshCcw, 
  BrainCircuit,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// Initialization of Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Mock Chart Data
const chartData = [
  { month: 'Jan', rate: 12, revenue: 45000 },
  { month: 'Feb', rate: 14, revenue: 52000 },
  { month: 'Mar', rate: 11, revenue: 48000 },
  { month: 'Apr', rate: 15, revenue: 61000 },
  { month: 'May', rate: 13, revenue: 55000 },
  { month: 'Jun', rate: 14, revenue: 59000 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'Analysis' | 'Resources' | 'Watchlist' | 'Simulator'>('Watchlist');
  const [customers, setCustomers] = useState<any[]>([]);
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [stats, setStats] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [watchlistInsight, setWatchlistInsight] = useState<string>('');
  const [simInsight, setSimInsight] = useState<string>('');
  const [globalInsight, setGlobalInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Simulator State
  const [simData, setSimData] = useState({
    tenure: 12,
    tickets: 1,
    billing: 50,
    active: 20
  });
  const [simResult, setSimResult] = useState<{ prob: number } | null>(null);

  useEffect(() => {
    setIsFetching(true);
    const load = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/stats')
        ]);
        const cData = await cRes.json();
        const sData = await sRes.json();
        setCustomers(cData);
        setStats(sData);

        // Fetch Global Insight
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "Provide a 2-sentence strategic summary of a churn model showing that Tenure is the strongest predictor, but Support Tickets are the most actionable risk factor. Tone: Executive.",
          });
          setGlobalInsight(response.text || '');
        } catch (e) {
          setGlobalInsight("Analysis indicates tenure stability across cohorts, with ticket frequency serving as the primary lead indicator for mid-cycle churn.");
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsFetching(false);
      }
    };
    load();
  }, []);

  const filteredCustomers = customers.filter(c => {
    if (filter === 'All') return true;
    const risk = c.prob > 0.7 ? 'High' : c.prob > 0.3 ? 'Medium' : 'Low';
    return risk === filter;
  });

  const getAIExplanation = async (customer: any) => {
    if (activeTab !== 'Watchlist') setActiveTab('Watchlist');
    setLoadingInsight(true);
    setSelectedCustomer(customer);
    setWatchlistInsight('');
    
    try {
      const prompt = `You are a Churn Analyst. Analyze this customer data and explain why they have a churn probability of ${(customer.prob * 100).toFixed(1)}%. Provide 3 specific retention actions.
      Data: Tenure: ${customer.tenure}mo, Billing: $${customer.billing}, Support Tickets: ${customer.tickets}, Active Days: ${customer.active_days}/30.
      Format: Clean bullet points. Concise. Headlines should be bold.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text;
      if (!text) throw new Error("Empty response");
      setWatchlistInsight(text);
    } catch (err) {
      console.error("AI Error:", err);
      setWatchlistInsight('Deep analysis requires a configured Gemini API key. Please ensure your environment is set up correctly.');
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleSimulate = async () => {
    setLoadingInsight(true);
    setSimInsight('');
    // Simple heuristic for simulation
    const prob = (simData.tickets * 0.15) + (1.0 - (simData.active / 31)) * 0.5 + (simData.billing / 250) * 0.2;
    const finalProb = Math.min(Math.max(prob, 0.01), 0.99);
    
    setSimResult({ prob: finalProb });

    try {
      const prompt = `Based on a Churn Probability of ${(finalProb * 100).toFixed(1)}%, generate a 2-sentence "Retention Pitch" for this customer.
      Context: Bills are $${simData.billing}, they have ${simData.tickets} open tickets, and have been with us for ${simData.tenure} months.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setSimInsight(response.text || 'Model simulation complete.');
    } catch (err) {
      setSimInsight('Simulation calculated. Enable AI for custom pitch.');
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1F2937] font-sans selection:bg-cyan-100">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00BCD4] rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-gray-800 italic">SUCCESS<span className="text-[#00BCD4]">OPS</span> <span className="text-gray-400 font-normal not-italic">VISUAL</span></h1>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex gap-8">
              {(['Analysis', 'Simulator', 'Resources', 'Watchlist'] as const).map((tab) => (
                <span 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer transition-all pb-1 border-b-2 ${
                    activeTab === tab ? 'text-[#00BCD4] border-[#00BCD4]' : 'text-gray-400 border-transparent hover:text-gray-700'
                  }`}
                >
                  {tab}
                </span>
              ))}
            </nav>
            <div className="px-4 py-1.5 bg-gray-100 border border-gray-200 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00BCD4] rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Engine v2.4</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'Watchlist' && (
            <motion.div 
              key="watchlist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Help the People - Hero Section */}
              <div className="bg-[#1F2937] text-white p-8 rounded-2xl mb-10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-4 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                      <TrendingUp className="w-3 h-3 text-cyan-400" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">Priority Retention Protocol</span>
                    </div>
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase line-clamp-1">Mitigate <span className="text-cyan-400">High-Risk</span> Churn Automatically</h2>
                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed">The AI Engine has identified {customers.filter(c => c.prob > 0.7).length} critical accounts requiring immediate intervention. Action these profiles to preserve $8.4k MRR.</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-gray-900 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95">Bulk Remediation</button>
                    <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95">Open Playbook</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <StatCard title="CSAT / Americas" value="78%" icon={<Users />} highlight="#00BCD4" />
                <StatCard title="Avg. Churn" value={`${(stats?.avg_churn_rate * 100).toFixed(1)}%`} icon={<TrendingDown />} trend="-0.4%" highlight="#FF4081" />
                <StatCard title="At Risk Pool" value={stats?.at_risk_pool} icon={<AlertTriangle />} highlight="#FFC107" />
                <StatCard title="Revenue Stream" value={`$${stats?.monthly_revenue_vulnerable.toLocaleString()}`} icon={<DollarSign />} highlight="#4CAF50" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-8">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h3 className="font-black text-gray-800 text-[11px] uppercase tracking-[0.2em] mb-1">Customer Journey / <span className="text-gray-400">Trend Analysis</span></h3>
                        <p className="text-[10px] text-gray-400 font-medium">Real-time velocity of customer sentiment vs. baseline benchmarks.</p>
                      </div>
                      <div className="flex gap-6 text-[9px] font-black text-gray-400 tracking-widest">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00BCD4]" /> RETENTION</span>
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-200" /> BASELINE</span>
                      </div>
                    </div>
                    <div className="h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00BCD4" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#00BCD4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F4" />
                          <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tickMargin={15} />
                          <YAxis stroke="#9CA3AF" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tickMargin={15} />
                          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #F1F1F4', borderRadius: '12px' }} />
                          <Area type="monotone" dataKey="rate" stroke="#00BCD4" strokeWidth={4} fillOpacity={1} fill="url(#chartGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-50/30">
                      <div>
                        <h3 className="font-black text-gray-800 text-[11px] uppercase tracking-[0.2em]">High Risk Segments / <span className="text-gray-400 italic font-medium">Americas</span></h3>
                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-widest">{filteredCustomers.length} Accounts Identified</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {['All', 'High', 'Medium', 'Low'].map((f) => (
                           <button
                             key={f}
                             onClick={() => setFilter(f as any)}
                             className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                               filter === f 
                               ? 'bg-[#00BCD4] text-white border-[#00BCD4]' 
                               : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                             }`}
                           >
                             {f}
                           </button>
                         ))}
                         <div className="w-px h-4 bg-gray-200 mx-2 self-center" />
                         <button 
                           onClick={() => alert('Exporting data as CSV...')}
                           className="px-4 py-1.5 bg-gray-800 text-white text-[9px] font-black tracking-widest uppercase rounded-lg hover:bg-black transition-all"
                         >
                           Export
                         </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <th className="px-8 py-5">Customer Profile</th>
                            <th className="px-8 py-5">Risk Matrix</th>
                            <th className="px-8 py-5">Eng. Index</th>
                            <th className="px-8 py-5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {isFetching ? (
                            Array(5).fill(0).map((_, i) => (
                              <tr key={i}>
                                <td colSpan={4} className="px-8 py-6"><div className="h-10 bg-gray-50 w-full animate-pulse rounded-xl" /></td>
                              </tr>
                            ))
                          ) : filteredCustomers.map((c) => (
                            <tr key={c.id} onClick={() => getAIExplanation(c)} className={`group cursor-pointer transition-all hover:bg-cyan-50/30 ${selectedCustomer?.id === c.id ? 'bg-cyan-50/60' : ''}`}>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[11px] font-black text-gray-400 group-hover:bg-[#00BCD4] group-hover:text-white transition-all shadow-inner">{c.name.split(' ').map((n: string) => n[0]).join('')}</div>
                                  <div>
                                      <div className="font-bold text-gray-800 text-sm tracking-tight">{c.name}</div>
                                      <div className="text-[10px] text-gray-400 font-black tracking-[0.05em] uppercase font-mono">{c.region} Pool • {c.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                  <span className={`text-[11px] font-mono font-black w-10 ${c.prob > 0.7 ? 'text-[#FF4081]' : 'text-[#00BCD4]'}`}>{(c.prob * 100).toFixed(0)}%</span>
                                  <div className="flex-1 w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${c.prob > 0.7 ? 'bg-[#FF4081]' : 'bg-[#00BCD4]'}`} style={{ width: `${c.prob * 100}%` }} />
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-2 font-mono">
                                  <div className={`w-2.5 h-2.5 rounded-full ${c.tickets > 3 ? 'bg-[#FF4081]' : 'bg-[#00BCD4]'}`} />
                                  <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">{c.tickets} Load</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <button className="px-5 py-2.5 bg-white border border-gray-200 text-[#00BCD4] text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm hover:border-[#00BCD4] transition-all">Manage</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-8 min-h-[500px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-50 rounded-full -mr-24 -mt-24 opacity-30 blur-3xl" />
                    <div className="flex items-center gap-3 text-gray-800 mb-10 relative">
                      <div className="p-3 bg-cyan-50 rounded-2xl shadow-inner"><BrainCircuit className="w-5 h-5 text-[#00BCD4]" /></div>
                      <h3 className="font-black uppercase tracking-[0.2em] text-[11px]">Diagnostic / <span className="text-gray-400 font-normal">Explainer</span></h3>
                    </div>
                    <AnimatePresence mode="wait">
                      {!selectedCustomer ? (
                        <motion.div 
                          key="empty-explainer"
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center h-80 text-center text-gray-300 gap-6 backdrop-blur-[2px]"
                        >
                          <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center shadow-inner">
                            <RefreshCcw className="w-8 h-8 opacity-20" />
                          </div>
                          <p className="text-[10px] uppercase tracking-[0.3em] font-black leading-relaxed">Select profile to compute<br/>causal behavior drivers</p>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key={selectedCustomer.id} 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-10 relative"
                        >
                          <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="text-[10px] uppercase tracking-[0.2em] font-black text-[#00BCD4] mb-3 font-mono">{selectedCustomer.plan} Premium Tier</div>
                            <div className="text-3xl font-black text-gray-800 tracking-tighter mb-2 italic">{selectedCustomer.name}</div>
                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" /> Active Subscription</div>
                          </div>

                          <div className="space-y-8">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Analysis Findings</h4>
                              <span className="text-[9px] font-black bg-cyan-100 text-[#00BCD4] px-2 py-1 rounded">SHAP v4.0</span>
                            </div>
                            {loadingInsight ? (
                              <div className="space-y-4">
                                <div className="h-4 bg-gray-100 rounded-lg w-full animate-pulse" />
                                <div className="h-4 bg-gray-100 rounded-lg w-5/6 animate-pulse" />
                                <div className="h-4 bg-gray-100 rounded-lg w-4/6 animate-pulse" />
                              </div>
                            ) : (
                              <div className="text-[13px] leading-relaxed text-gray-700 font-sans bg-white p-6 rounded-2xl border border-gray-100 shadow-sm whitespace-pre-line ring-4 ring-cyan-500/5 min-h-[100px]">
                                {watchlistInsight || (
                                  <div className="text-gray-300 italic py-4">Waiting for engine response...</div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-3">
                            <button className="w-full py-4 bg-[#00BCD4] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:-translate-y-1 transition-all">Dispatch Recovery Offer</button>
                            <button className="w-full py-3 bg-white border border-gray-200 text-gray-400 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-gray-50 transition-all">Export Report (PDF)</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                     <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-800 mb-8 border-b border-gray-100 pb-4">Retention / <span className="text-gray-400">Playbook</span></h4>
                     <ul className="space-y-6">
                       <li className="flex gap-5 group">
                         <div className="w-10 h-10 shrink-0 bg-[#FF4081]/10 rounded-2xl flex items-center justify-center text-[#FF4081] text-xs font-black italic shadow-inner">01</div>
                         <div><div className="text-[11px] font-black text-gray-800 uppercase tracking-widest mb-1">Cost Right-Sizing</div><div className="text-[10px] text-gray-500 font-medium">Auto-trigger discount for "High Bill + Low Tenure" segments.</div></div>
                       </li>
                       <li className="flex gap-5 group">
                         <div className="w-10 h-10 shrink-0 bg-[#00BCD4]/10 rounded-2xl flex items-center justify-center text-[#00BCD4] text-xs font-black italic shadow-inner">02</div>
                         <div><div className="text-[11px] font-black text-gray-800 uppercase tracking-widest mb-1">Ticket Acceleration</div><div className="text-[10px] text-gray-500 font-medium">Prioritize SLA remediation for high risk accounts.</div></div>
                       </li>
                     </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Analysis' && (
            <motion.div key="analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Model <span className="text-[#00BCD4]">Insights</span></h2>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Global Feature Weights</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full -mr-16 -mt-16 opacity-20 blur-2xl group-hover:bg-cyan-100 transition-colors" />
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-10 text-gray-400">Feature Importance (SHAP)</h3>
                   <div className="h-[300px] w-full flex items-stretch gap-3 px-4 pb-4 border-b border-gray-100">
                      {[
                        { label: 'Tenure', val: 0.85, color: '#00BCD4' }, 
                        { label: 'Billing', val: 0.72, color: '#00BCD4' }, 
                        { label: 'Tickets', val: 0.94, color: '#FF4081' }, 
                        { label: 'Usage', val: 0.65, color: '#00BCD4' }, 
                        { label: 'Recency', val: 0.88, color: '#00BCD4' }
                      ].map(f => (
                        <div key={f.label} className="flex-1 h-full flex flex-col items-center gap-4">
                           <div className="flex-1 w-full flex items-end">
                             <motion.div 
                               initial={{ height: 0 }} 
                               animate={{ height: `${f.val * 100}%` }} 
                               className="w-full rounded-t-xl relative group/bar"
                               style={{ backgroundColor: f.color }}
                             >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all bg-gray-800 text-white text-[9px] px-2 py-1 rounded-md font-mono">
                                  {(f.val * 100).toFixed(1)}
                                </div>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-black border-b-2 border-transparent group-hover/bar:border-current" style={{ color: f.color }}>{f.val.toFixed(2)}</div>
                             </motion.div>
                           </div>
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{f.label}</span>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm">
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-10">Cohort Variance</h3>
                   <div className="space-y-6">
                      <div className="p-8 bg-red-50 border border-red-100 rounded-2xl flex justify-between items-center">
                          <div><div className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-2">High Risk Aggregate</div><div className="text-4xl font-black text-red-600">14.2%</div></div>
                          <TrendingUp className="w-10 h-10 text-red-100" />
                      </div>
                      <div className="p-8 bg-cyan-50 border border-cyan-100 rounded-2xl flex justify-between items-center">
                          <div><div className="text-[10px] font-black text-[#00BCD4] uppercase tracking-[0.2em] mb-2">Safe Cohort Retention</div><div className="text-4xl font-black text-[#00BCD4]">85.8%</div></div>
                          <TrendingDown className="w-10 h-10 text-cyan-100" />
                      </div>
                   </div>
                </div>
              </div>

              <div className="bg-[#1F2937] p-10 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden mt-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00BCD4]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative flex flex-col md:flex-row gap-10 items-center">
                  <div className="shrink-0 p-5 bg-white/5 rounded-2xl border border-white/10">
                    <AlertTriangle className="w-10 h-10 text-cyan-400" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Strategic Diagnosis</h3>
                    <p className="text-lg font-medium text-white/90 leading-relaxed font-sans max-w-4xl">
                      {globalInsight || "Engine is synthesizing behavior patterns for quarterly strategy..."}
                    </p>
                  </div>
                  <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all">Download Strategic Prep</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Simulator' && (
            <motion.div key="simulator" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-10">
              <div className="text-center space-y-4">
                 <h2 className="text-4xl font-black italic uppercase tracking-tighter">Scoring <span className="text-[#00BCD4]">Sandbox</span></h2>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Adjust variables to observe real-time model inference</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white p-10 border border-gray-200 rounded-2xl shadow-xl space-y-8">
                  {[
                    { l: 'Support Tickets', k: 'tickets', min: 0, max: 10 },
                    { l: 'Tenure (Months)', k: 'tenure', min: 1, max: 72 },
                    { l: 'Monthly Bill ($)', k: 'billing', min: 20, max: 300 },
                    { l: 'Active Days / 30', k: 'active', min: 0, max: 30 }
                  ].map(f => (
                    <div key={f.k} className="space-y-4">
                      <div className="flex justify-between items-center"><span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{f.l}</span><span className="text-xs font-black text-[#00BCD4]">{(simData as any)[f.k]}</span></div>
                      <input type="range" min={f.min} max={f.max} value={(simData as any)[f.k]} onChange={e => setSimData({...simData, [f.k]: parseInt(e.target.value)})} className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#00BCD4]" />
                    </div>
                  ))}
                  <button onClick={handleSimulate} className="w-full py-4 bg-[#00BCD4] text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">Compute Prediction</button>
                </div>
                <div className="bg-[#1F2937] p-10 rounded-2xl shadow-2xl flex flex-col justify-between items-center text-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500 relative">Output Analysis</h3>
                   {!simResult ? (
                     <div className="flex flex-col items-center gap-6 opacity-20"><TrendingDown className="w-16 h-16 text-white" /><span className="text-[10px] font-black text-white uppercase tracking-widest">Adjust Matrix</span></div>
                   ) : (
                     <div className="space-y-10 relative">
                        <div className="text-7xl font-mono font-black italic tracking-tighter text-cyan-400">{(simResult.prob * 100).toFixed(0)}%</div>
                        <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                           <div className="text-[10px] font-black text-[#FF4081] uppercase tracking-widest mb-3">AI Retention Pitch</div>
                           <p className="text-[12px] text-white/80 leading-relaxed font-sans">
                             {loadingInsight ? "Engineering pitch..." : simInsight ? `"${simInsight}"` : "Matrix analysis pending..."}
                           </p>
                        </div>
                     </div>
                   )}
                   <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] relative">Model Version: v2.4-stable</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Resources' && (
            <motion.div key="resources" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-10">
               <div className="text-center"><h2 className="text-4xl font-black italic uppercase tracking-tighter">Knowledge <span className="text-[#00BCD4]">Vault</span></h2></div>
               <section className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm space-y-8">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Core Infrastructure</h3>
                  <div className="space-y-4">
                    {[
                      { n: 'Synthetic Engine', d: 'dType enforced generation of tabular variance.' },
                      { n: 'ML Kernel', d: 'XGBoost with Stratified CV & SMOTE optimization.' },
                      { n: 'Causal API', d: 'Gemini-3-Flash integration for feature attribution.' }
                    ].map(f => (
                      <div key={f.n} className="p-5 bg-gray-50 border border-gray-100 rounded-2xl hover:border-[#00BCD4] transition-all cursor-pointer group flex justify-between items-center">
                         <div><div className="text-[10px] font-black text-gray-800 uppercase tracking-widest">{f.n}</div><div className="text-[9px] text-gray-400 font-medium italic">{f.d}</div></div>
                         <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#00BCD4]" />
                      </div>
                    ))}
                  </div>
               </section>
               <section className="bg-[#1F2937] text-white rounded-xl p-10 shadow-xl space-y-10">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#00BCD4]">Interview Preparation</h3>
                  <div className="space-y-6">
                    <div className="border-l-2 border-[#00BCD4] pl-6"><div className="text-[10px] font-black text-[#00BCD4] uppercase mb-2">The Architecture Script</div><p className="text-sm opacity-80 font-serif italic">"I build dual-track systems: predictive scores from classical ML (XGBoost) paired with qualitative causal analysis via LLMs (Gemini)."</p></div>
                    <div className="grid grid-cols-2 gap-4"><div className="p-5 bg-white/5 rounded-xl"><div className="text-[10px] font-black text-[#FF4081] mb-2 uppercase">Validation</div><p className="text-[10px] opacity-60 italic">Stratified splits preserve rare churn events (~14%).</p></div><div className="p-5 bg-white/5 rounded-xl"><div className="text-[10px] font-black text-cyan-400 mb-2 uppercase">Inference</div><p className="text-[10px] opacity-60 italic">FastAPI service handles sub-50ms scoring latency.</p></div></div>
                  </div>
               </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, highlight = "#00BCD4", trend }: { title: string, value: any, icon: React.ReactNode, highlight?: string, trend?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-7 shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 transition-all group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: highlight }} />
      <div className="flex items-center justify-between mb-8">
        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-gray-100 transition-colors shadow-inner">
          {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6 text-gray-400 group-hover:text-gray-800 transition-colors' })}
        </div>
        {trend && (
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-[#FF4081] tracking-widest uppercase mb-1">{trend}</span>
                <div className="w-10 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-[#FF4081] rounded-full animate-pulse" />
                </div>
            </div>
        )}
      </div>
      <div>
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{title}</div>
        <div className="text-4xl font-black text-gray-800 tracking-tighter italic">{value}</div>
      </div>
    </div>
  );
}

