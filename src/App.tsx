import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Heart, 
  User, 
  Cigarette, 
  Scale, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  ChevronRight,
  ArrowLeft,
  Loader2,
  History,
  TrendingUp,
  Clock,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ReactMarkdown from "react-markdown";
import { GoogleGenAI } from "@google/genai";
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
import { format } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PredictionResult {
  probability: number;
  riskLevel: string;
  insight: string;
  modelUsed?: string;
}

interface HistoryItem extends PredictionResult {
  id: string;
  timestamp: number;
  data: any;
  modelUsed?: string;
}

const CP_OPTIONS = [
  { value: 1, label: "Severe heart-related pain" },
  { value: 2, label: "Mild chest discomfort" },
  { value: 3, label: "Sharp pain (likely not heart-related)" },
  { value: 4, label: "No pain at all" },
];

const SLOPE_OPTIONS = [
  { value: 1, label: "Normal heart recovery" },
  { value: 2, label: "Moderate recovery" },
  { value: 3, label: "Poor heart recovery" },
];

const THAL_OPTIONS = [
  { value: 3, label: "Healthy blood flow" },
  { value: 6, label: "Permanent reduced flow" },
  { value: 7, label: "Temporary reduced flow" },
];

const RESTECG_OPTIONS = [
  { value: 0, label: "Normal heart rhythm" },
  { value: 1, label: "Slightly irregular rhythm" },
  { value: 2, label: "Enlarged heart muscle" },
];

export default function App() {
  const [view, setView] = useState<"form" | "history">("form");
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [formData, setFormData] = useState({
    age: 45,
    sex: 1, // 1=Male, 0=Female
    cp: 1,
    trestbps: 120,
    chol: 200,
    fbs: 0,
    restecg: 0,
    thalach: 150,
    exang: 0,
    oldpeak: 1.2,
    slope: 1,
    ca: 1,
    thal: 3,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/history");
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (e) {
        console.error("Failed to load history", e);
      }
    };
    fetchHistory();
  }, []);

  const saveToHistory = async (prediction: PredictionResult) => {
    const newItem: HistoryItem = {
      ...prediction,
      probability: isNaN(prediction.probability) ? 0 : prediction.probability,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      data: { ...formData }
    };
    
    try {
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem)
      });
      setHistory([newItem, ...history]);
    } catch (e) {
      console.error("Failed to save history to server", e);
      // Fallback to local state if server fails
      setHistory([newItem, ...history]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let val: any = value;
    if (type === "number") {
      val = value === "" ? "" : parseFloat(value);
      if (typeof val === "number" && isNaN(val)) val = 0;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleValueChange = (name: string, value: any) => {
    let val = value;
    if (typeof val === "number" && isNaN(val)) val = 0;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to get prediction");
      const prediction = await response.json();

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const modelResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `As a medical AI assistant, analyze this heart disease risk prediction:
        Patient Data: ${JSON.stringify(formData)}
        Predicted Probability: ${(prediction.probability * 100).toFixed(2)}%
        Risk Level: ${prediction.riskLevel}

        Provide a brief, professional health insight (2-3 sentences) explaining the main risk factors for this specific patient and suggesting general preventive measures. Start with "Insight:".`,
      });

      const insight = modelResponse.text?.replace("Insight:", "").trim() || "Consult a cardiologist for a professional medical evaluation.";

      const finalResult = {
        ...prediction,
        insight
      };
      
      setResult(finalResult);
      saveToHistory(finalResult);
      
      setTimeout(() => {
        document.getElementById("prediction-result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("Prediction error:", err);
      setError("An error occurred while calculating risk. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const DID_YOU_KNOW_POOL = [
    "Walking just 30 minutes a day can reduce your risk of heart disease by 19%.",
    "Your heart beats about 100,000 times in one day and about 35 million times in a year.",
    "Laughter is good for your heart. it reduces stress and gives a boost to your immune system.",
    "A woman's heart typically beats faster than a man's heart.",
    "The heart is the only muscle that doesn't get tired."
  ];

  const PREVENTION_TIPS_POOL = [
    "Reducing your daily salt intake to less than 5g helps lower blood pressure significantly.",
    "Eating a diet rich in fruits, vegetables, and whole grains supports heart health.",
    "Manage stress through meditation, deep breathing, or hobbies you enjoy.",
    "Avoid smoking and second-hand smoke to protect your arteries.",
    "Get at least 7-8 hours of quality sleep every night for optimal heart recovery."
  ];

  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % DID_YOU_KNOW_POOL.length);
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] font-sans selection:bg-rose-100 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView("form"); resetForm(); }}>
            <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center">
              <Heart className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">HeartGuard AI</span>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setView("form")}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                  view === "form" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Activity className="w-4 h-4" /> Assessment
              </button>
              <button 
                onClick={() => setView("history")}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                  view === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <History className="w-4 h-4" /> History
              </button>
            </nav>

            <div className="hidden sm:flex items-center gap-4">
              {view === "form" && [1, 2, 3].map((s) => (
                <div 
                  key={s}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                    step === s ? "bg-rose-600 text-white shadow-lg shadow-rose-200" : 
                    step > s ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                  )}
                >
                  {step > s ? "✓" : s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Multi-step Form or History */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              {view === "history" ? (
                <motion.div
                  key="history-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Health Journey</h2>
                      <p className="text-slate-500 font-bold">Track your heart health progress over time</p>
                    </div>
                    <button 
                      onClick={() => setView("form")}
                      className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-100"
                    >
                      New Assessment
                    </button>
                  </div>

                  {history.length > 0 ? (
                    <>
                      {/* Trend Chart */}
                      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <TrendingUp className="text-indigo-600 w-5 h-5" />
                          </div>
                          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Risk Trend</h3>
                        </div>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[...history].reverse()}>
                              <defs>
                                <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis 
                                dataKey="timestamp" 
                                tickFormatter={(ts) => format(ts, 'MMM d')}
                                stroke="#94a3b8"
                                fontSize={12}
                                fontWeight={600}
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis 
                                domain={[0, 100]} 
                                stroke="#94a3b8"
                                fontSize={12}
                                fontWeight={600}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `${val}%`}
                              />
                              <Tooltip 
                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                labelFormatter={(ts) => format(ts, 'PPpp')}
                                formatter={(val: number) => [`${(val * 100).toFixed(1)}%`, 'Risk Probability']}
                              />
                              <Area 
                                type="monotone" 
                                dataKey={(item) => item.probability * 100} 
                                stroke="#e11d48" 
                                strokeWidth={4}
                                fillOpacity={1} 
                                fill="url(#colorProb)" 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* History List */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-2">Past Records</h3>
                        {history.map((item) => (
                          <div 
                            key={item.id}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-rose-200 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl",
                                item.riskLevel === "High" ? "bg-rose-50 text-rose-600" :
                                item.riskLevel === "Medium" ? "bg-amber-50 text-amber-600" :
                                "bg-emerald-50 text-emerald-600"
                              )}>
                                {(item.probability * 100).toFixed(0)}%
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-slate-900 uppercase tracking-tight">{item.riskLevel} Risk</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {format(item.timestamp, 'PPp')}
                                  </span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-full">
                                    {item.modelUsed?.replace('_', ' ') || 'Logistic Regression'}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-500 font-medium line-clamp-1 mt-1">{item.insight}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="hidden md:flex items-center gap-4 border-l border-slate-100 pl-4">
                                <div className="text-center">
                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">BP</div>
                                  <div className="text-sm font-bold text-slate-700">{item.data.trestbps}</div>
                                </div>
                                <div className="w-px h-6 bg-slate-100" />
                                <div className="text-center">
                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Chol</div>
                                  <div className="text-sm font-bold text-slate-700">{item.data.chol}</div>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  setResult(item);
                                  setView("form");
                                }}
                                className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-[2.5rem] p-20 shadow-sm border border-slate-200 flex flex-col items-center text-center space-y-6">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center">
                        <History className="text-slate-300 w-10 h-10" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No History Yet</h3>
                        <p className="text-slate-500 font-bold max-w-xs mx-auto mt-2">Complete your first heart health assessment to start tracking your journey.</p>
                      </div>
                      <button 
                        onClick={() => setView("form")}
                        className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100"
                      >
                        Start Assessment
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : !result ? (
                <motion.div
                  key={`step-${step}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200 min-h-[500px] flex flex-col"
                >
                  {step === 1 && (
                    <div className="space-y-8 flex-1">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                          <User className="text-indigo-600 w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Section 1</h2>
                          <p className="text-slate-500 font-bold text-sm">Patient Information</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Age</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              name="age"
                              value={formData.age}
                              onChange={handleInputChange}
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-lg"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Years</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Gender</label>
                          <div className="flex gap-4">
                            {[
                              { label: "Male", value: 1 },
                              { label: "Female", value: 0 }
                            ].map(opt => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleValueChange("sex", opt.value)}
                                className={cn(
                                  "flex-1 py-4 rounded-2xl border transition-all font-bold flex items-center justify-center gap-3",
                                  formData.sex === opt.value 
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Type of Chest Discomfort</label>
                          <select 
                            name="cp"
                            value={formData.cp}
                            onChange={(e) => handleValueChange("cp", parseInt(e.target.value))}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-lg appearance-none cursor-pointer"
                          >
                            {CP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-8 flex-1">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                          <Activity className="text-rose-600 w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Section 2</h2>
                          <p className="text-slate-500 font-bold text-sm">Medical Measurements</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Resting Blood Pressure (mmHg)</label>
                          <input 
                            type="number" 
                            name="trestbps"
                            value={formData.trestbps}
                            onChange={handleInputChange}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-lg"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Total Cholesterol (mg/dl)</label>
                          <input 
                            type="number" 
                            name="chol"
                            value={formData.chol}
                            onChange={handleInputChange}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-lg"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">High Blood Sugar? ({">"}120 mg/dl)</label>
                          <div className="flex gap-4">
                            {[
                              { label: "Yes", value: 1 },
                              { label: "No", value: 0 }
                            ].map(opt => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleValueChange("fbs", opt.value)}
                                className={cn(
                                  "flex-1 py-4 rounded-2xl border transition-all font-bold flex items-center justify-center gap-3",
                                  formData.fbs === opt.value 
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Max Heart Rate Achieved</label>
                          <input 
                            type="number" 
                            name="thalach"
                            value={formData.thalach}
                            onChange={handleInputChange}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-8 flex-1">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                          <Droplets className="text-amber-600 w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Section 3</h2>
                          <p className="text-slate-500 font-bold text-sm">Clinical Test Results (Optional)</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Heart Rhythm Test (ECG)</label>
                          <select 
                            name="restecg"
                            value={formData.restecg}
                            onChange={(e) => handleValueChange("restecg", parseInt(e.target.value))}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-lg appearance-none cursor-pointer"
                          >
                            {RESTECG_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Heart Stress Level (ST Depression)</label>
                          <input 
                            type="number" 
                            step="0.1"
                            name="oldpeak"
                            value={formData.oldpeak}
                            onChange={handleInputChange}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-lg"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Heart Recovery Pattern (Slope)</label>
                          <select 
                            name="slope"
                            value={formData.slope}
                            onChange={(e) => handleValueChange("slope", parseInt(e.target.value))}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-lg appearance-none cursor-pointer"
                          >
                            {SLOPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Clear Arteries Count (0-3)</label>
                          <input 
                            type="number" 
                            min="0"
                            max="3"
                            name="ca"
                            value={formData.ca}
                            onChange={handleInputChange}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-lg"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Blood Flow Status (Thalassemia)</label>
                          <select 
                            name="thal"
                            value={formData.thal}
                            onChange={(e) => handleValueChange("thal", parseInt(e.target.value))}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-lg appearance-none cursor-pointer"
                          >
                            {THAL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-10 flex items-center justify-between mt-auto border-t border-slate-100">
                    {step > 1 ? (
                      <button 
                        onClick={() => setStep(s => s - 1)}
                        className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all"
                      >
                        <ArrowLeft className="w-5 h-5" /> Back
                      </button>
                    ) : <div />}

                    {step < 3 ? (
                      <button 
                        onClick={() => setStep(s => s + 1)}
                        className="px-10 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 flex items-center gap-2"
                      >
                        Next Step <ChevronRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleSubmit()}
                        disabled={loading}
                        className="px-10 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading ? "Analyzing..." : "Predict Risk"} <Activity className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  id="prediction-result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-10"
                >
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-widest">Prediction Dashboard</h2>
                      <div className="h-1.5 w-20 bg-rose-600 mt-3 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600">
                      <Activity className="w-3 h-3" />
                      Logistic Regression Model v1.0
                    </div>
                  </div>

                  <div className={cn(
                    "rounded-[3.5rem] p-10 md:p-16 shadow-2xl border-4 transition-all relative overflow-hidden",
                    result.riskLevel === "High" ? "bg-rose-50 border-rose-200 shadow-rose-100" :
                    result.riskLevel === "Medium" ? "bg-amber-50 border-amber-200 shadow-amber-100" :
                    "bg-emerald-50 border-emerald-200 shadow-emerald-100"
                  )}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                      <div className="lg:col-span-5 space-y-10">
                        <div>
                          <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 block mb-2">Risk Level</span>
                          <h3 className={cn(
                            "text-7xl font-black uppercase italic tracking-tighter",
                            result.riskLevel === "High" ? "text-rose-600" :
                            result.riskLevel === "Medium" ? "text-amber-600" :
                            "text-emerald-600"
                          )}>
                            {result.riskLevel}
                          </h3>
                        </div>

                        <div>
                          <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 block mb-2">Probability</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-8xl font-black text-slate-900 leading-none">{(result.probability * 100).toFixed(0)}</span>
                            <span className="text-4xl font-black text-slate-400">%</span>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-7 bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-white/50 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className={cn(
                            "w-6 h-6",
                            result.riskLevel === "High" ? "text-rose-600" :
                            result.riskLevel === "Medium" ? "text-amber-600" :
                            "text-emerald-600"
                          )} />
                          <h4 className="font-black text-slate-900 uppercase tracking-wider text-lg">
                            AI Health Insight
                          </h4>
                        </div>
                        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-bold text-lg">
                          <ReactMarkdown>{result.insight}</ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    <div className="mt-16 space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">
                        <span>Low Risk</span>
                        <span>Moderate</span>
                        <span>High Risk</span>
                      </div>
                      <div className="h-4 bg-white/40 rounded-full overflow-hidden flex p-1">
                        <div className={cn("h-full transition-all duration-1000 rounded-full", result.riskLevel === "Low" ? "bg-emerald-500 w-full" : "bg-emerald-200 w-1/3")} />
                        <div className={cn("h-full transition-all duration-1000 rounded-full mx-1", result.riskLevel === "Medium" ? "bg-amber-500 w-full" : "bg-amber-200 w-1/3")} />
                        <div className={cn("h-full transition-all duration-1000 rounded-full", result.riskLevel === "High" ? "bg-rose-500 w-full" : "bg-rose-200 w-1/3")} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button 
                      onClick={resetForm}
                      className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-3 shadow-xl shadow-slate-200"
                    >
                      <ArrowLeft className="w-5 h-5" /> Start New Assessment
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Sidebar Health Tips / Ad Space */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 space-y-8">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Prevention Center</h3>
              
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={`did-you-know-${tipIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 hover:bg-white hover:shadow-md transition-all cursor-default group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                        <Activity className="w-5 h-5 text-rose-500" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Did you know?</span>
                    </div>
                    <p className="text-sm text-slate-600 font-bold leading-relaxed">
                      {DID_YOU_KNOW_POOL[tipIndex]}
                    </p>
                  </motion.div>

                  <motion.div 
                    key={`prevention-tip-${tipIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 hover:bg-white hover:shadow-md transition-all cursor-default group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                        <Droplets className="w-5 h-5 text-indigo-500" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Prevention Tip</span>
                    </div>
                    <p className="text-sm text-slate-600 font-bold leading-relaxed">
                      {PREVENTION_TIPS_POOL[tipIndex]}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>

            <div className="p-8 bg-slate-900 rounded-[2rem] text-white space-y-4">
              <h4 className="font-black uppercase tracking-widest text-xs text-slate-500">Emergency Contact</h4>
              <p className="text-lg font-bold leading-tight">If you are experiencing chest pain or shortness of breath, call emergency services immediately.</p>
              <div className="flex items-center gap-2 text-rose-500 font-black text-2xl">
                <Activity className="w-6 h-6" /> 911 / 112
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 z-50 border-2 border-white/20"
          >
            <AlertTriangle className="w-6 h-6" />
            <span className="font-bold">{error}</span>
            <button onClick={() => setError(null)} className="ml-4 hover:opacity-70 font-black">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
