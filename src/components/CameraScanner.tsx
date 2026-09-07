"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, RefreshCw, FlipHorizontal, Check, AlertCircle, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export type PoseKey = "front" | "left" | "right" | "tilt";

export interface PoseInfo {
  key: PoseKey;
  title: string;
  instruction: string;
  iconText: string;
}

export const POSES: PoseInfo[] = [
  { key: "front", title: "Look Straight", instruction: "Keep your face centered & look directly into camera", iconText: "1/4" },
  { key: "left", title: "Turn Left", instruction: "Gently turn your head ~20° to the left", iconText: "2/4" },
  { key: "right", title: "Turn Right", instruction: "Gently turn your head ~20° to the right", iconText: "3/4" },
  { key: "tilt", title: "Tilt Up", instruction: "Gently raise your chin slightly upward", iconText: "4/4" },
];

export interface MultiPoseImages {
  front: string;
  left: string;
  right: string;
  tilt: string;
}

interface CameraScannerProps {
  onComplete: (images: MultiPoseImages) => void;
  disabled?: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onComplete, disabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [capturedPoses, setCapturedPoses] = useState<Partial<Record<PoseKey, string>>>({});
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(true);
  const [isAllCaptured, setIsAllCaptured] = useState(false);

  const currentPose = POSES[currentPoseIndex];

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    setIsStartingCamera(true);
    setCameraError(null);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 720 },
          height: { ideal: 960 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("[Camera Error]", err);
      let msg = "Could not access camera. Please allow camera permissions in your browser settings.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Camera permission was denied. Please enable camera access in your browser.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "No camera found on this device.";
      }
      setCameraError(msg);
    } finally {
      setIsStartingCamera(false);
    }
  }, [facingMode]);

  useEffect(() => {
    if (!isAllCaptured) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, isAllCaptured]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Capture current pose
  const handleCaptureCurrentPose = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Trigger flash animation
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const updatedPoses = { ...capturedPoses, [currentPose.key]: dataUrl };
    setCapturedPoses(updatedPoses);

    // Check if we still have more poses
    if (currentPoseIndex < POSES.length - 1) {
      setCurrentPoseIndex((prev) => prev + 1);
    } else {
      // Finished all 4 poses!
      setIsAllCaptured(true);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }

      onComplete({
        front: updatedPoses.front || dataUrl,
        left: updatedPoses.left || dataUrl,
        right: updatedPoses.right || dataUrl,
        tilt: updatedPoses.tilt || dataUrl,
      });
    }
  };

  // Retake all 4 poses
  const handleRetakeAll = () => {
    setCapturedPoses({});
    setCurrentPoseIndex(0);
    setIsAllCaptured(false);
    startCamera();
  };

  return (
    <div className="w-full flex flex-col items-center">
      <canvas ref={canvasRef} className="hidden" />

      {/* 4-Pose Progress Stepper */}
      <div className="w-full max-w-sm grid grid-cols-4 gap-1.5 mb-3">
        {POSES.map((pose, idx) => {
          const isDone = !!capturedPoses[pose.key];
          const isCurrent = idx === currentPoseIndex && !isAllCaptured;
          return (
            <div
              key={pose.key}
              className={`py-1.5 px-2 rounded-xl text-center border transition ${
                isDone
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  : isCurrent
                  ? "bg-slate-800 border-emerald-400 text-white shadow-md shadow-emerald-500/10"
                  : "bg-slate-950/60 border-slate-800 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                {isDone ? (
                  <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                ) : (
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                )}
                <span className="text-[10px] font-bold capitalize">{pose.key}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Viewfinder Container */}
      <div className="relative w-full max-w-sm aspect-[3/4] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
        {isFlashActive && <div className="absolute inset-0 bg-white z-50 transition-opacity duration-200" />}

        {isAllCaptured ? (
          // Review Mode: 4-Grid Preview
          <div className="w-full h-full p-3 grid grid-cols-2 gap-2 bg-slate-950">
            {POSES.map((pose) => (
              <div key={pose.key} className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-900 shadow-lg">
                <img
                  src={capturedPoses[pose.key]}
                  alt={pose.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 left-1.5 right-1.5 bg-slate-950/80 backdrop-blur-md rounded-lg py-0.5 px-1.5 text-center flex items-center justify-center gap-1 border border-slate-800">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-200">{pose.title}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Live Camera Stream
          <>
            {cameraError ? (
              <div className="p-6 text-center flex flex-col items-center gap-3">
                <AlertCircle className="w-12 h-12 text-rose-400" />
                <p className="text-sm text-slate-300 font-medium">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Try Again
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                />

                {/* Oval Mask Guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[68%] h-[68%] scanner-oval border-2 border-dashed border-emerald-400/80 flex items-center justify-center relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-[10px] font-black tracking-wider text-slate-950 uppercase px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Step {currentPose.iconText}: {currentPose.title}
                    </div>

                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-400 rounded-br" />
                  </div>
                </div>

                {/* Flip Camera Button */}
                <button
                  type="button"
                  onClick={toggleCamera}
                  className="absolute top-4 right-4 p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded-full backdrop-blur-md border border-slate-700 shadow-lg active:scale-95 transition"
                  title="Switch Camera"
                >
                  <FlipHorizontal className="w-5 h-5" />
                </button>

                {/* Instruction Banner at Bottom */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md rounded-2xl p-2.5 border border-slate-700 text-center shadow-lg">
                  <p className="text-xs text-emerald-300 font-bold mb-0.5">{currentPose.title}</p>
                  <p className="text-[11px] text-slate-300 font-medium">{currentPose.instruction}</p>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center gap-3">
        {isAllCaptured ? (
          <button
            type="button"
            onClick={handleRetakeAll}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-sm font-semibold rounded-2xl flex items-center gap-2 border border-slate-700 shadow-md transition"
          >
            <RefreshCw className="w-4 h-4" /> Retake All 4 Angles
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCaptureCurrentPose}
            disabled={disabled || isStartingCamera || !!cameraError}
            className="px-7 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-bold text-sm rounded-2xl flex items-center gap-2.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:pointer-events-none transition"
          >
            <Camera className="w-5 h-5 stroke-[2.5]" /> Capture Pose {currentPoseIndex + 1}/4
          </button>
        )}
      </div>
    </div>
  );
};
