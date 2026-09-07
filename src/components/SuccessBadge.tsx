"use client";

import React, { useEffect } from "react";
import { CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";
import confetti from "canvas-confetti";
import { MultiPoseImages } from "@/lib/db";

interface SuccessBadgeProps {
  student: {
    name: string;
    computer_code: string;
    enrollment_no: string;
  };
  sampleImages?: MultiPoseImages | null;
  onReset: () => void;
}

export const SuccessBadge: React.FC<SuccessBadgeProps> = ({ student, sampleImages, onReset }) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#06b6d4", "#f59e0b"],
      });
    } catch {
      // ignore
    }
  }, []);

  const poses = sampleImages ? [
    { key: "front", title: "Front", img: sampleImages.front },
    { key: "left", title: "Left 20°", img: sampleImages.left },
    { key: "right", title: "Right 20°", img: sampleImages.right },
    { key: "tilt", title: "Tilt Up", img: sampleImages.tilt },
  ] : [];

  return (
    <div className="w-full max-w-md bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl text-center flex flex-col items-center animate-float">
      {/* Icon Badge */}
      <div className="relative mb-4">
        <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-9 h-9 text-emerald-400 stroke-[2.5]" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-slate-950 shadow-md">
          <ShieldCheck className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      </div>

      <h2 className="text-xl font-black tracking-tight text-white mb-1">
        4-Angle Face Scan Complete!
      </h2>
      <p className="text-xs text-slate-400 mb-5">
        All 4 facial angles have been recorded and saved for biometric verification.
      </p>

      {/* 4 Poses Thumbnails Grid */}
      {poses.length > 0 && (
        <div className="w-full grid grid-cols-4 gap-2 mb-5">
          {poses.map((p) => (
            <div key={p.key} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-400/80 shadow-md bg-slate-950">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 mt-1 uppercase tracking-wider">
                {p.title}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Student Details Card */}
      <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-left space-y-2 mb-5">
        <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-2">
          <span className="text-slate-400">Student Name:</span>
          <span className="text-slate-100 font-bold">{student.name}</span>
        </div>
        <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-2">
          <span className="text-slate-400">Computer Code:</span>
          <span className="text-emerald-400 font-mono font-bold tracking-wider">{student.computer_code}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Enrollment No:</span>
          <span className="text-slate-200 font-mono font-medium">{student.enrollment_no}</span>
        </div>
      </div>

      {/* Action to Register Another */}
      <button
        type="button"
        onClick={onReset}
        className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 border border-slate-700 shadow-md transition"
      >
        <RefreshCw className="w-4 h-4" /> Register Another Student
      </button>
    </div>
  );
};
