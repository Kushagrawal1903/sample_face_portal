"use client";

import React, { useState } from "react";
import { CameraScanner, MultiPoseImages } from "@/components/CameraScanner";
import { SuccessBadge } from "@/components/SuccessBadge";
import { User, Hash, FileText, Sparkles, ShieldCheck, Loader2, AlertCircle, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

export default function StudentEnrollmentPage() {
  const [name, setName] = useState("");
  const [computerCode, setComputerCode] = useState("");
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [multiPoses, setMultiPoses] = useState<MultiPoseImages | null>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate form details
  const handleProceedToCamera = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!computerCode.trim()) {
      setErrorMessage("Please enter your computer code.");
      return;
    }
    if (!enrollmentNo.trim()) {
      setErrorMessage("Please enter your enrollment number.");
      return;
    }

    setStep(2);
  };

  // Submit to API
  const handleSubmitEnrollment = async () => {
    if (!multiPoses) {
      setErrorMessage("Please complete all 4 face scan angles.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          computer_code: computerCode.trim().toUpperCase(),
          enrollment_no: enrollmentNo.trim().toUpperCase(),
          sample_images: multiPoses,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(data.message || "Failed to submit biometric scan. Please try again.");
      }
    } catch (err: any) {
      console.error("[Submission error]", err);
      setErrorMessage("Network error connecting to the server. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setComputerCode("");
    setEnrollmentNo("");
    setMultiPoses(null);
    setStep(1);
    setIsSuccess(false);
    setErrorMessage(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#090d16] to-[#04070d]">
      {/* Header */}
      <header className="w-full max-w-xl flex items-center justify-between py-3 border-b border-slate-800/80 mb-5 sm:mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide">Campus Active</h1>
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full tracking-wider">
                BETA
              </span>
            </div>
            <p className="text-[10px] text-emerald-400 font-medium">Face Biometrics Portal</p>
          </div>
        </div>

        <Link
          href="/admin"
          className="text-xs text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
        >
          <Lock className="w-3.5 h-3.5" /> Faculty
        </Link>
      </header>

      {/* Beta Testing Hero Heading */}
      <div className="w-full max-w-xl flex flex-col items-center text-center mb-5 sm:mb-6 px-3">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] sm:text-xs font-semibold tracking-wide mb-2 sm:mb-3 shadow-sm backdrop-blur-md">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
          <span>Campus Active App • Beta Testing</span>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight leading-tight">
          New Campus Active Beta Testing Portal
        </h2>

        <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 mt-1 sm:mt-1.5 max-w-sm sm:max-w-md mx-auto leading-relaxed">
          Welcome to the new Campus Active biometric attendance beta. Register your 4-angle facial scan for automated classroom verification.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center">
        {isSuccess ? (
          <SuccessBadge
            student={{
              name: name.trim(),
              computer_code: computerCode.trim().toUpperCase(),
              enrollment_no: enrollmentNo.trim().toUpperCase(),
            }}
            sampleImages={multiPoses}
            onReset={handleReset}
          />
        ) : (
          <div className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl">
            {/* Step Pills */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    step === 1 ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-emerald-400"
                  }`}
                >
                  1
                </span>
                <span className={`text-xs font-semibold ${step === 1 ? "text-white" : "text-slate-400"}`}>
                  Student Info
                </span>
              </div>

              <div className="w-8 h-[1px] bg-slate-800" />

              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    step === 2 ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  2
                </span>
                <span className={`text-xs font-semibold ${step === 2 ? "text-white" : "text-slate-400"}`}>
                  4-Angle Scan
                </span>
              </div>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {step === 1 ? (
              // Step 1: Student Information Form
              <form onSubmit={handleProceedToCamera} className="space-y-4">
                <div className="text-left">
                  <h2 className="text-lg font-bold text-white tracking-tight">Enter Your Details</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Please provide your official college credentials before scanning.
                  </p>
                </div>

                {/* Name */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>

                {/* Computer Code */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-emerald-400" /> Computer Code
                  </label>
                  <input
                    type="text"
                    required
                    value={computerCode}
                    onChange={(e) => setComputerCode(e.target.value)}
                    placeholder="e.g. 45912 or CS2104"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white uppercase placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>

                {/* Enrollment Number */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" /> Enrollment Number
                  </label>
                  <input
                    type="text"
                    required
                    value={enrollmentNo}
                    onChange={(e) => setEnrollmentNo(e.target.value)}
                    placeholder="e.g. 0827CS211045"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white uppercase placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>

                {/* Next Step Button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-98 text-slate-950 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                >
                  Proceed to 4-Angle Face Scan <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>
            ) : (
              // Step 2: 4-Angle Camera Viewfinder
              <div className="flex flex-col items-center space-y-4">
                <div className="w-full flex items-center justify-between text-left">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">4-Pose Verification</h2>
                    <p className="text-[11px] text-slate-400">Student: <span className="text-emerald-400 font-bold">{name}</span> ({computerCode})</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-slate-400 hover:text-slate-200 underline"
                  >
                    Edit Info
                  </button>
                </div>

                {/* Camera Viewfinder */}
                <CameraScanner onComplete={(poses) => setMultiPoses(poses)} />

                {/* Submit Button */}
                {multiPoses && (
                  <button
                    type="button"
                    onClick={handleSubmitEnrollment}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-98 text-slate-950 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:pointer-events-none transition"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving 4-Angle Face Scans...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 stroke-[2.5]" /> Submit All 4 Biometric Scans
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full max-w-xl text-center py-4 text-[11px] text-slate-500 border-t border-slate-900/80 mt-6">
        Campus Active App Beta • 4-Pose Centroid Biometric Collection
      </footer>
    </main>
  );
}
