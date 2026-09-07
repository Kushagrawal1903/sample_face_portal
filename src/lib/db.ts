import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export interface MultiPoseImages {
  front: string;
  left: string;
  right: string;
  tilt: string;
}

export interface StudentSampleRecord {
  id?: number | string;
  name: string;
  computer_code: string;
  enrollment_no: string;
  image_data?: string; // Primary frontal image
  sample_images?: MultiPoseImages; // All 4 poses (front, left, right, tilt)
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

// Global in-memory fallback for zero-config mode
declare global {
  // eslint-disable-next-line no-var
  var __sampleFaceStore: StudentSampleRecord[] | undefined;
}

let supabase: SupabaseClient | null = null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.warn('[DB] Supabase init warning, using fallback store:', err);
  }
}

const LOCAL_STORAGE_DIR = path.join(process.cwd(), '.data');
const LOCAL_STORAGE_FILE = path.join(LOCAL_STORAGE_DIR, 'sample_faces.json');

function getLocalStore(): StudentSampleRecord[] {
  if (global.__sampleFaceStore) {
    return global.__sampleFaceStore;
  }
  try {
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const data = fs.readFileSync(LOCAL_STORAGE_FILE, 'utf-8');
      global.__sampleFaceStore = JSON.parse(data);
      return global.__sampleFaceStore || [];
    }
  } catch {
    // ignore
  }
  global.__sampleFaceStore = [];
  return global.__sampleFaceStore;
}

function saveLocalStore(records: StudentSampleRecord[]) {
  global.__sampleFaceStore = records;
  try {
    if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
      fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch {
    // Vercel serverless /tmp or read-only filesystem fallback
  }
}

export async function saveStudentFace(record: StudentSampleRecord): Promise<{ success: boolean; id: string | number; message?: string }> {
  const frontImage = record.sample_images?.front || record.image_data || '';

  const cleanRecord: StudentSampleRecord = {
    name: record.name.trim(),
    computer_code: record.computer_code.trim().toUpperCase(),
    enrollment_no: record.enrollment_no.trim().toUpperCase(),
    image_data: frontImage,
    sample_images: record.sample_images || {
      front: frontImage,
      left: frontImage,
      right: frontImage,
      tilt: frontImage,
    },
    ip_address: record.ip_address || '',
    user_agent: record.user_agent || '',
    created_at: new Date().toISOString(),
  };

  // 1. Try Supabase if configured
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('sample_face_data')
        .upsert(
          {
            name: cleanRecord.name,
            computer_code: cleanRecord.computer_code,
            enrollment_no: cleanRecord.enrollment_no,
            image_data: cleanRecord.image_data,
            sample_images: cleanRecord.sample_images,
            ip_address: cleanRecord.ip_address,
            user_agent: cleanRecord.user_agent,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'computer_code' }
        )
        .select('id')
        .single();

      if (!error && data) {
        return { success: true, id: data.id };
      }
      if (error) {
        console.error('[Supabase Error]', error);
      }
    } catch (e) {
      console.error('[Supabase Exception]', e);
    }
  }

  // 2. Fallback to Local/Memory Store
  const store = getLocalStore();
  const existingIndex = store.findIndex(
    (s) => s.computer_code.toUpperCase() === cleanRecord.computer_code.toUpperCase()
  );

  const id = existingIndex >= 0 ? store[existingIndex].id || Date.now() : Date.now();
  cleanRecord.id = id;

  if (existingIndex >= 0) {
    store[existingIndex] = cleanRecord;
  } else {
    store.unshift(cleanRecord);
  }

  saveLocalStore(store);
  return { success: true, id };
}

export async function getAllStudentFaces(): Promise<StudentSampleRecord[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('sample_face_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as StudentSampleRecord[];
      }
    } catch (e) {
      console.error('[Supabase Fetch Error]', e);
    }
  }

  return getLocalStore();
}

export async function deleteStudentFace(computer_code: string): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('sample_face_data').delete().eq('computer_code', computer_code);
    } catch (e) {
      console.error('[Supabase Delete Error]', e);
    }
  }

  const store = getLocalStore();
  const filtered = store.filter((s) => s.computer_code.toUpperCase() !== computer_code.toUpperCase());
  saveLocalStore(filtered);
  return true;
}
