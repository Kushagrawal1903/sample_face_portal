"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Download, 
  RefreshCw, 
  Search, 
  Users, 
  Trash2, 
  FileSpreadsheet, 
  FolderArchive, 
  Camera, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  ExternalLink,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { StudentSampleRecord } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default function FacultyAdminDashboard() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [students, setStudents] = useState<StudentSampleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"roster" | "tester">("roster");

  // Preview Modal
  const [previewStudent, setPreviewStudent] = useState<StudentSampleRecord | null>(null);

  // Classroom Tester State
  const [classPhoto, setClassPhoto] = useState<string | null>(null);

  // Fetch students
  const fetchStudents = async (code: string) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await fetch(`/api/students?passcode=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setStudents(data.students || []);
        setIsAuthenticated(true);
      } else {
        setAuthError(data.message || "Invalid passcode.");
      }
    } catch (err: any) {
      setAuthError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    fetchStudents(passcode.trim());
  };

  // Delete student record
  const handleDelete = async (compCode: string) => {
    if (!confirm(`Are you sure you want to remove student with Computer Code: ${compCode}?`)) {
      return;
    }

    try {
      const res = await fetch(
        `/api/students?passcode=${encodeURIComponent(passcode)}&computer_code=${encodeURIComponent(compCode)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.computer_code !== compCode));
      }
    } catch (err) {
      alert("Failed to delete record.");
    }
  };

  // 1. Export Dataset as CSV
  const handleExportCSV = () => {
    if (students.length === 0) {
      alert("No students registered yet to export.");
      return;
    }

    const headers = ["ID", "Name", "Computer Code", "Enrollment No", "Registration Date", "IP Address"];
    const rows = students.map((s, idx) => [
      idx + 1,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.computer_code}"`,
      `"${s.enrollment_no}"`,
      `"${s.created_at || ""}"`,
      `"${s.ip_address || ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student_face_dataset_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 2. Export All 4 Photos per Student as ZIP
  const handleExportZIP = async () => {
    if (students.length === 0) {
      alert("No student photos to export.");
      return;
    }

    setIsLoading(true);
    try {
      const JSZipModule = (await import("jszip")).default;
      const zip = new JSZipModule();
      const mainFolder = zip.folder("student_4angle_face_dataset");

      students.forEach((s) => {
        const studentCleanName = s.name.replace(/[^a-zA-Z0-9_-]/g, "_");
        const studentFolder = mainFolder?.folder(`${s.computer_code}_${studentCleanName}`);

        const poses = s.sample_images || {
          front: s.image_data || "",
          left: s.image_data || "",
          right: s.image_data || "",
          tilt: s.image_data || "",
        };

        (["front", "left", "right", "tilt"] as const).forEach((poseKey) => {
          const imgData = poses[poseKey];
          if (imgData && imgData.includes(",")) {
            const base64Data = imgData.split(",")[1];
            studentFolder?.file(`${poseKey}.jpg`, base64Data, { base64: true });
          }
        });
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `student_4angle_face_photos_${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[ZIP Export Error]", err);
      alert("Error packaging photos into ZIP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.computer_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.enrollment_no.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Classroom photo upload
  const handleClassPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setClassPhoto(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#090d16]">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white mb-1">Faculty Access</h2>
          <p className="text-xs text-slate-400 mb-6">Enter admin passcode to view & export student 4-angle face dataset</p>

          {authError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Passcode (default: admin123)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition text-center tracking-widest"
              autoFocus
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Access Dashboard"}
            </button>
          </form>

          <Link href="/" className="inline-block mt-6 text-xs text-slate-500 hover:text-slate-300">
            ← Back to Student Face Scanner
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Faculty Dataset Management</h1>
              <p className="text-xs text-slate-400">4-Pose Classroom Face Biometrics & Accuracy Benchmark</p>
            </div>
          </div>

          {/* Action Tabs & Links */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("roster")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "roster"
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Enrolled Roster ({students.length})
            </button>

            <button
              onClick={() => setActiveTab("tester")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "tester"
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Classroom Photo Tester
            </button>

            <Link
              href="/"
              target="_blank"
              className="px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs rounded-xl flex items-center gap-1 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Student Link
            </Link>
          </div>
        </header>

        {activeTab === "roster" ? (
          // TAB 1: Enrolled Student Roster
          <div className="mt-6 space-y-6">
            {/* Top Bar: Stats & Export Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Registered Stat */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Total Enrolled Students</p>
                  <p className="text-2xl font-black text-emerald-400">{students.length} <span className="text-xs text-slate-400 font-normal">(4 poses each)</span></p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              {/* 1-Click CSV Export */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 flex items-center justify-between text-left transition group shadow-lg"
              >
                <div>
                  <p className="text-xs text-slate-400">Export Student List</p>
                  <p className="text-sm font-bold text-white group-hover:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Download CSV
                  </p>
                </div>
                <Download className="w-5 h-5 text-slate-500 group-hover:text-emerald-400" />
              </button>

              {/* 1-Click 4-Angle ZIP Photos Export */}
              <button
                type="button"
                onClick={handleExportZIP}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 flex items-center justify-between text-left transition group shadow-lg"
              >
                <div>
                  <p className="text-xs text-slate-400">Export 4-Angle Photos Dataset</p>
                  <p className="text-sm font-bold text-white group-hover:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <FolderArchive className="w-4 h-4 text-emerald-400" /> Download All ZIP
                  </p>
                </div>
                <Download className="w-5 h-5 text-slate-500 group-hover:text-emerald-400" />
              </button>
            </div>

            {/* Search & Refresh */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, computer code, enrollment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <button
                type="button"
                onClick={() => fetchStudents(passcode)}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh List
              </button>
            </div>

            {/* Students Grid */}
            {filteredStudents.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">No student face registrations found.</p>
                <p className="text-xs text-slate-600 mt-1">Share the portal link with students to begin collecting data.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((s) => {
                  const frontImg = s.sample_images?.front || s.image_data || "";
                  return (
                    <div
                      key={s.computer_code}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center gap-3.5 transition group"
                    >
                      {/* Face Photo Thumbnail */}
                      <div
                        className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 cursor-pointer relative"
                        onClick={() => setPreviewStudent(s)}
                      >
                        <img src={frontImg} alt={s.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                        <span className="absolute bottom-0 right-0 bg-emerald-500 text-[8px] font-black text-slate-950 px-1 rounded-tl">
                          4x
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{s.name}</h3>
                        <p className="text-xs font-mono font-bold text-emerald-400">{s.computer_code}</p>
                        <p className="text-[11px] text-slate-400 truncate">{s.enrollment_no}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(s.created_at || "")}</p>
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(s.computer_code)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                        title="Remove Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // TAB 2: Classroom Photo Tester
          <div className="mt-6 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-1">Classroom Photo Accuracy Tester</h2>
              <p className="text-xs text-slate-400 mb-6">
                Upload a group photograph taken during class to tally against the {students.length} enrolled student faces.
              </p>

              {/* Upload Box */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-3xl p-8 bg-slate-950/50 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleClassPhotoUpload}
                  className="hidden"
                  id="classroom-upload"
                />
                <label
                  htmlFor="classroom-upload"
                  className="cursor-pointer flex flex-col items-center justify-center text-center"
                >
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-3">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-white">Click to Upload Classroom Photo</span>
                  <span className="text-xs text-slate-500 mt-1">Supports High-Res JPG, PNG from phone cameras</span>
                </label>
              </div>

              {/* Uploaded Image Preview & Tally */}
              {classPhoto && (
                <div className="mt-6 space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 max-h-[500px]">
                    <img src={classPhoto} alt="Classroom Capture" className="w-full object-contain max-h-[500px] bg-slate-950" />
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                    <h3 className="text-sm font-bold text-white mb-2">Evaluation Summary</h3>
                    <p className="text-xs text-slate-400">
                      You can use this high-resolution photo with your ArcFace/YuNet python evaluation script (`test_arcface_accuracy.py`) to benchmark multi-face detections against the {students.length} registered students (using their 4 multi-angle centroids).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4-Pose Image Preview Modal */}
      {previewStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setPreviewStudent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <h3 className="text-base font-bold text-white">{previewStudent.name}</h3>
              <p className="text-xs font-mono font-bold text-emerald-400">{previewStudent.computer_code}</p>
              <p className="text-xs text-slate-400">{previewStudent.enrollment_no}</p>
            </div>

            {/* 4-Pose Thumbnails in Modal */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {[
                { title: "Frontal View", img: previewStudent.sample_images?.front || previewStudent.image_data },
                { title: "Left 20°", img: previewStudent.sample_images?.left || previewStudent.image_data },
                { title: "Right 20°", img: previewStudent.sample_images?.right || previewStudent.image_data },
                { title: "Chin Tilt Up", img: previewStudent.sample_images?.tilt || previewStudent.image_data },
              ].map((pose, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative aspect-[4/3]">
                  {pose.img ? (
                    <img src={pose.img} alt={pose.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">No Image</div>
                  )}
                  <div className="absolute bottom-1 left-1.5 right-1.5 bg-slate-950/80 backdrop-blur-sm rounded py-0.5 text-center">
                    <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider">{pose.title}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center text-[10px] text-slate-500 border-t border-slate-800 pt-3">
              Enrolled on: {formatDate(previewStudent.created_at || "")}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
