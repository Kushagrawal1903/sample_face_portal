-- Run this SQL in your Supabase SQL Editor or PostgreSQL Database:

CREATE TABLE IF NOT EXISTS sample_face_data (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    computer_code VARCHAR(50) NOT NULL UNIQUE,
    enrollment_no VARCHAR(50) NOT NULL,
    image_data TEXT NOT NULL, -- Primary frontal image
    sample_images JSONB DEFAULT '{}'::jsonb, -- 4 multi-angle poses: {"front": "...", "left": "...", "right": "...", "tilt": "..."}
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by computer code or enrollment number
CREATE INDEX IF NOT EXISTS idx_sample_face_comp_code ON sample_face_data(computer_code);
CREATE INDEX IF NOT EXISTS idx_sample_face_enrollment_no ON sample_face_data(enrollment_no);
