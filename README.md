# 🎓 Campus Biometric — Student Face Sample Collection Portal

A modern, standalone, mobile-responsive web portal built with **Next.js 14**, **Tailwind CSS**, and **Supabase / Serverless DB** for collecting student face biometric datasets in classroom lectures.

---

## 🚀 Key Features

1. **Student Self-Enrollment (`/`):**
   - Clean mobile-first interface optimized for iOS Safari & Android Chrome.
   - Enter **Full Name**, **Computer Code**, and **Enrollment Number**.
   - Live guided camera viewfinder with a glowing oval face mask.
   - 1-tap capture with instant photo review and confetti celebration badge.

2. **Faculty Admin & Export Dashboard (`/admin`):**
   - Passcode protected (Default passcode: `admin123`).
   - Live roster showing all enrolled students with high-resolution photo thumbnails.
   - **1-Click CSV Export:** Download clean `.csv` student roster.
   - **1-Click ZIP Photos Export:** Download all registered student face images packaged as `[ComputerCode]_[Name].jpg` inside a `.zip` archive.
   - **Classroom Photo Tester:** Upload group classroom photos to tally against the collected dataset.

---

## 📦 How to Run Locally

```bash
# 1. Navigate to the project
cd C:\Users\kusha\OneDrive\Desktop\sample_face_portal

# 2. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your browser.

---

## ⚡ 1-Click Deployment to Vercel

1. **Create a GitHub Repository:**
   - Push this folder to a new private or public GitHub repository.

2. **Deploy on Vercel:**
   - Go to [Vercel](https://vercel.com) and click **Add New Project**.
   - Select your repository and click **Deploy**.

3. **(Optional) Connect Supabase Database for Persistent Cloud Storage:**
   - Create a free project at [Supabase](https://supabase.com).
   - In Supabase SQL Editor, run the SQL query from `schema.sql`:
     ```sql
     CREATE TABLE IF NOT EXISTS sample_face_data (
         id BIGSERIAL PRIMARY KEY,
         name VARCHAR(150) NOT NULL,
         computer_code VARCHAR(50) NOT NULL,
         enrollment_no VARCHAR(50) NOT NULL,
         image_data TEXT NOT NULL,
         ip_address VARCHAR(50),
         user_agent TEXT,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
         updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );
     ```
   - In Vercel Project Settings > **Environment Variables**, add:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon Key
     - `ADMIN_PASSCODE` = your custom faculty admin passcode (e.g. `admin123`)

---

## 🔒 Security & Privacy
- Zero modifications to your production CMS codebase.
- Passcode protection on `/admin` to prevent students from viewing other peers' submissions.
