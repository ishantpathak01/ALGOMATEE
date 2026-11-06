import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Aurora from "./../animations/aurora.js";
import { analyseResume as analyseResumeAPI } from "./../APIs/resumeAnalyzer.js";
import toast from "react-hot-toast";
import {
  FileText,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Target,
  Award,
  TrendingUp,
  Trash2,
  Sparkles,
  ChevronRight,
  BarChart2,
  Shield,
  Star,
  Clock,
  Briefcase,
  BookOpen,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

/* ─────────────────────────────────────────────
   Score Ring
───────────────────────────────────────────── */
function ScoreRing({ score, size = 160, stroke = 12 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 80 ? "#22c55e" : score >= 55 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-4xl font-extrabold text-white"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-slate-400 tracking-widest uppercase">Score</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Metric Card
───────────────────────────────────────────── */
function MetricCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-gray-800/60 border border-slate-700 rounded-2xl p-5 flex flex-col gap-3 backdrop-blur-sm"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-white font-bold text-xl mt-0.5">{value}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Suggestion Item
───────────────────────────────────────────── */
function SuggestionItem({ type, text, delay = 0 }) {
  const cfg = {
    success: { Icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10 border-green-500/30" },
    warning: { Icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-500/30" },
    error:   { Icon: XCircle,    color: "text-red-400",    bg: "bg-red-400/10 border-red-500/30" },
  };
  const { Icon, color, bg } = cfg[type] || cfg.warning;
  return (
    <motion.li
      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`flex items-start gap-3 rounded-xl border p-3 ${bg}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${color}`} />
      <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
    </motion.li>
  );
}

/* ─────────────────────────────────────────────
   Tip Card
───────────────────────────────────────────── */
function TipCard({ icon: Icon, title, desc, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay, duration: 0.55 }}
      className="bg-gray-800/50 border border-slate-700 hover:border-blue-500/60 rounded-2xl p-6 group transition-all duration-300"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${gradient}`}>
        <Icon size={22} className="text-white" />
      </div>
      <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* icon map injected by server metrics (by label) */
const METRIC_META = {
  "ATS Compatibility": { color: "bg-blue-500/80",   icon: Shield },
  "Keyword Match":     { color: "bg-purple-500/80", icon: Target },
  "Skills Coverage":   { color: "bg-green-500/80",  icon: Star },
  "Formatting":        { color: "bg-yellow-500/80", icon: BarChart2 },
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function ResumeAnalyzer() {
  const [file, setFile]           = useState(null);
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");
  const [jobDetails, setJobDetails] = useState({ company: "", role: "", experience: "", skills: "" });
  const fileInputRef              = useRef(null);
  const progressRef               = useRef(null);

  const setJob = (key, val) => setJobDetails((prev) => ({ ...prev, [key]: val }));

  /* ── file validation ── */
  const handleFile = useCallback((f) => {
    setError("");
    setResult(null);
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Only PDF files are accepted. Please upload a valid resume.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10 MB limit.");
      return;
    }
    setFile(f);
  }, []);

  /* ── drag handlers ── */
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };
  const onFileChange = (e) => handleFile(e.target.files[0]);

  /* ── remove file ── */
  const removeFile = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setError("");
    setJobDetails({ company: "", role: "", experience: "", skills: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── analyse ── */
  const analyse = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setResult(null);
    setError("");

    try {
      const res = await analyseResumeAPI(file, jobDetails, (pct) => {
        // Upload phase: 0-40%
        setProgress(Math.round(pct * 0.4));
      });

      // Simulate AI thinking phase: 40-95%
      let p = 40;
      progressRef.current = setInterval(() => {
        p += Math.random() * 10;
        if (p >= 95) { clearInterval(progressRef.current); p = 95; }
        setProgress(Math.round(p));
      }, 300);

      if (res.status !== 200) {
        clearInterval(progressRef.current);
        setError(res.message || "Analysis failed. Please try again.");
        setUploading(false);
        return;
      }

      // Hydrate icon/color metadata for metrics
      const enriched = {
        ...res.data,
        metrics: (res.data.metrics || []).map((m) => ({
          ...m,
          ...(METRIC_META[m.label] || { color: "bg-slate-500/80", icon: BarChart2 }),
        })),
      };

      clearInterval(progressRef.current);
      setProgress(100);
      setTimeout(() => { setResult(enriched); setUploading(false); }, 400);

    } catch (err) {
      clearInterval(progressRef.current);
      toast.error("Something went wrong. Please try again.");
      setError("Analysis failed. Please try again.");
      setUploading(false);
    }
  };

  /* ─────────────── render ─────────────── */
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0d1117] via-[#111726] to-black_A text-white overflow-x-hidden">
      <Aurora />

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 mb-6 text-blue-400 text-sm font-medium"
        >
          <Sparkles size={14} /> AI-Powered Resume Analysis
        </motion.div>

        <motion.h1
          className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
        >
          Supercharge Your Resume
        </motion.h1>

        <motion.p
          className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Upload your resume and get instant AI feedback on ATS compatibility,
          keywords, formatting, and actionable suggestions to land more interviews.
        </motion.p>
      </section>

      {/* ── Upload + Results ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24 relative z-10 space-y-8">

        {/* Drop Zone */}
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4 }}
              onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-3xl p-16 flex flex-col items-center gap-5 transition-all duration-300
                ${dragging
                  ? "border-blue-400 bg-blue-500/10 scale-[1.02]"
                  : "border-slate-600 bg-gray-800/40 hover:border-blue-500/70 hover:bg-gray-800/60"
                }`}
            >
              <motion.div
                animate={dragging ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-500/40 flex items-center justify-center"
              >
                <Upload size={36} className="text-blue-400" />
              </motion.div>

              <div className="text-center">
                <p className="text-xl font-semibold text-white">
                  {dragging ? "Drop it here!" : "Drag & drop your resume"}
                </p>
                <p className="text-slate-400 mt-1 text-sm">
                  or <span className="text-blue-400 underline underline-offset-2">browse files</span> &nbsp;·&nbsp; PDF only &nbsp;·&nbsp; max 10 MB
                </p>
              </div>

              <input
                ref={fileInputRef} type="file" accept=".pdf"
                className="hidden" onChange={onFileChange}
              />
            </motion.div>
          ) : (
            /* File Selected Card */
            <motion.div
              key="file-card"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}
              className="bg-gray-800/60 border border-slate-700 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 backdrop-blur-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/30 to-orange-500/30 border border-red-500/40 flex items-center justify-center shrink-0">
                <FileText size={28} className="text-red-400" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{file.name}</p>
                <p className="text-slate-400 text-sm mt-0.5">{formatBytes(file.size)}</p>

                {/* Progress bar */}
                {uploading && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Analysing…</span><span>{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear", duration: 0.2 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {!uploading && !result && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                    <CheckCircle size={15} className="text-green-400" />
                    <span>Ready</span>
                  </div>
                )}
                {result && (
                  <div className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                    <CheckCircle size={16} /> Done
                  </div>
                )}
                <button
                  onClick={removeFile}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-700/60 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Job Details Form ── */}
        <AnimatePresence>
          {file && !uploading && !result && (
            <motion.div
              key="job-form"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}
              className="bg-gray-800/50 border border-slate-700 rounded-3xl p-6 backdrop-blur-sm"
            >
              <h3 className="text-white font-bold text-base mb-1 flex items-center gap-2">
                <Briefcase size={17} className="text-blue-400" /> Target Job Details
                <span className="text-slate-500 font-normal text-sm">(optional — improves analysis quality)</span>
              </h3>
              <p className="text-slate-500 text-sm mb-5">Tell us what role you're applying for and we'll give you targeted feedback.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Target Company</label>
                  <input
                    type="text"
                    value={jobDetails.company}
                    onChange={(e) => setJob("company", e.target.value)}
                    placeholder="e.g. Google, Amazon, Startup..."
                    className="bg-slate-900/60 border border-slate-600 focus:border-blue-500/70 text-white text-sm rounded-xl px-4 py-2.5 outline-none placeholder-slate-600 transition-colors"
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Job Position / Role</label>
                  <input
                    type="text"
                    value={jobDetails.role}
                    onChange={(e) => setJob("role", e.target.value)}
                    placeholder="e.g. Backend Engineer, SDE-2..."
                    className="bg-slate-900/60 border border-slate-600 focus:border-blue-500/70 text-white text-sm rounded-xl px-4 py-2.5 outline-none placeholder-slate-600 transition-colors"
                  />
                </div>

                {/* Experience */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Your Experience Level</label>
                  <select
                    value={jobDetails.experience}
                    onChange={(e) => setJob("experience", e.target.value)}
                    className="bg-slate-900/60 border border-slate-600 focus:border-blue-500/70 text-white text-sm rounded-xl px-4 py-2.5 outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select level…</option>
                    <option value="Fresher / 0 years">Fresher / 0 years</option>
                    <option value="0-1 year">0–1 year</option>
                    <option value="1-2 years">1–2 years</option>
                    <option value="3-5 years">3–5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>

                {/* Skills */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Key Skills to Highlight</label>
                  <input
                    type="text"
                    value={jobDetails.skills}
                    onChange={(e) => setJob("skills", e.target.value)}
                    placeholder="e.g. React, Node.js, System Design"
                    className="bg-slate-900/60 border border-slate-600 focus:border-blue-500/70 text-white text-sm rounded-xl px-4 py-2.5 outline-none placeholder-slate-600 transition-colors"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={analyse}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-7 py-2.5 rounded-xl shadow-lg shadow-blue-900/40 transition-all"
                >
                  <Zap size={16} /> Analyse Resume
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 rounded-2xl p-4 text-red-400"
            >
              <XCircle size={18} className="shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Skeleton */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 border border-slate-700/50 rounded-2xl p-5 h-28 animate-pulse" />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Score + Metrics */}
              <div className="bg-gray-800/50 border border-slate-700 rounded-3xl p-8 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Award size={20} className="text-yellow-400" /> Overall Score
                </h2>

                <div className="flex flex-col md:flex-row items-center gap-10">
                  {/* Overall Ring */}
                  <div className="flex flex-col items-center gap-3">
                    <ScoreRing score={result.score} />
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      result.score >= 80
                        ? "bg-green-500/20 text-green-400"
                        : result.score >= 55
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {result.score >= 80 ? "Excellent" : result.score >= 55 ? "Good — Needs Work" : "Needs Major Improvement"}
                    </span>
                  </div>

                  <div className="flex-1 w-full flex flex-col gap-5">
                    {/* Role Match Ring (only if returned) */}
                    {result.roleMatch != null && (
                      <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-700/60 rounded-2xl px-5 py-4">
                        <div className="relative w-14 h-14 shrink-0">
                          <svg width="56" height="56" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="28" cy="28" r="22" fill="none" stroke="#1e293b" strokeWidth="6" />
                            <motion.circle
                              cx="28" cy="28" r="22" fill="none"
                              stroke={result.roleMatch >= 70 ? "#22c55e" : result.roleMatch >= 45 ? "#f59e0b" : "#ef4444"}
                              strokeWidth="6" strokeLinecap="round"
                              strokeDasharray={2 * Math.PI * 22}
                              initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                              animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - result.roleMatch / 100) }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">{result.roleMatch}%</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">Role Match</p>
                          <p className="text-slate-400 text-xs mt-0.5">
                            {jobDetails.role || jobDetails.company
                              ? `How well your resume aligns with ${jobDetails.role || "this role"} at ${jobDetails.company || "the company"}`
                              : "How well your resume matches a typical software role"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {result.metrics.map((m, i) => (
                        <MetricCard key={m.label} icon={m.icon} label={m.label} value={m.value} color={m.color} delay={0.1 * i} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Role-Specific Feedback */}
              {result.roleSpecificFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-blue-500/5 border border-blue-500/25 rounded-3xl p-7"
                >
                  <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <Briefcase size={20} className="text-blue-400" />
                    {jobDetails.role || jobDetails.company
                      ? `Targeted Feedback for ${jobDetails.role || "your role"}${jobDetails.company ? " at " + jobDetails.company : ""}`
                      : "AI Career Feedback"}
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.roleSpecificFeedback}</p>
                </motion.div>
              )}

              {/* Suggestions */}
              <div className="bg-gray-800/50 border border-slate-700 rounded-3xl p-8 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-400" /> Suggestions & Feedback
                </h2>
                <ul className="space-y-3">
                  {result.suggestions.map((s, i) => (
                    <SuggestionItem key={i} type={s.type} text={s.text} delay={0.06 * i} />
                  ))}
                </ul>
              </div>

              {/* Learning Roadmap */}
              {result.missingSkills?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-gray-800/50 border border-slate-700 rounded-3xl p-8 backdrop-blur-sm"
                >
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <BookOpen size={20} className="text-purple-400" /> Learning Roadmap
                  </h2>
                  <p className="text-slate-400 text-sm mb-5">Skills to acquire or strengthen for your target role, with estimated learning time.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.missingSkills.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.07 * i, duration: 0.4 }}
                        className={`flex items-start gap-3 rounded-2xl border p-4 ${
                          item.importance === "high"
                            ? "bg-red-500/5 border-red-500/25"
                            : item.importance === "medium"
                            ? "bg-yellow-500/5 border-yellow-500/25"
                            : "bg-slate-700/30 border-slate-600/40"
                        }`}
                      >
                        <div className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${
                          item.importance === "high" ? "bg-red-400" :
                          item.importance === "medium" ? "bg-yellow-400" : "bg-slate-400"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm">{item.skill}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Clock size={12} className="text-slate-500 shrink-0" />
                            <span className="text-slate-400 text-xs">{item.estimatedTime}</span>
                            <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
                              item.importance === "high" ? "bg-red-500/15 text-red-400" :
                              item.importance === "medium" ? "bg-yellow-500/15 text-yellow-400" :
                              "bg-slate-600/40 text-slate-400"
                            }`}>
                              {item.importance} priority
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Re-analyse CTA */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={removeFile}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg shadow-blue-900/40 transition-all"
                >
                  <Upload size={16} /> Analyse Another Resume
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Tips Section ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Resume Tips to Stand Out
          </h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm">
            Follow these best practices to ensure your resume passes ATS filters and impresses hiring managers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <TipCard
            icon={Target} title="Target Key Keywords"
            gradient="bg-gradient-to-br from-blue-500 to-blue-700"
            desc="Mirror keywords from the job description in your resume. ATS systems rank resumes based on keyword density and relevance."
            delay={0}
          />
          <TipCard
            icon={BarChart2} title="Quantify Achievements"
            gradient="bg-gradient-to-br from-green-500 to-emerald-700"
            desc='Numbers speak louder than words. Replace "improved performance" with "improved API response time by 40%".'
            delay={0.1}
          />
          <TipCard
            icon={Shield} title="Keep It ATS-Friendly"
            gradient="bg-gradient-to-br from-purple-500 to-purple-700"
            desc="Avoid tables, images, or fancy fonts. Use clean, single-column layouts that ATS parsers can read easily."
            delay={0.2}
          />
          <TipCard
            icon={Zap} title="Strong Action Verbs"
            gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
            desc='Begin each bullet with powerful verbs: "Engineered", "Architected", "Delivered", "Reduced", "Optimized".'
            delay={0.3}
          />
          <TipCard
            icon={Star} title="Tailor Every Application"
            gradient="bg-gradient-to-br from-pink-500 to-rose-600"
            desc="A generic resume rarely works. Customise your skills and summary for every role you apply to."
            delay={0.4}
          />
          <TipCard
            icon={ChevronRight} title="One Page Rule"
            gradient="bg-gradient-to-br from-teal-500 to-cyan-700"
            desc="Unless you have 10+ years of experience, keep it to one page. Recruiters spend an average of 7 seconds scanning."
            delay={0.5}
          />
        </div>
      </section>
    </div>
  );
}
