import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from './supabase.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const validateFileSignature = (buffer, mimetype) => {
  if (!buffer || buffer.length < 4) return false;

  // PDF signature: %PDF (25 50 44 46)
  if (mimetype === 'application/pdf') {
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }

  // DOCX signature: PK.. (50 4B 03 04)
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
  }

  // Plain text accepted
  if (mimetype === 'text/plain') return true;

  return false;
};

export const storageService = {
  async uploadResume({ userId, fileBuffer, filename, mimetype }) {
    const fileExt = path.extname(filename).toLowerCase();
    const storagePath = `${userId}/${Date.now()}_${path.basename(filename)}`;

    // If Supabase Storage is available, upload to 'resumes' bucket
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.storage
          .from('resumes')
          .upload(storagePath, fileBuffer, {
            contentType: mimetype,
            upsert: false
          });

        if (!error && data) {
          return {
            storagePath: data.path,
            publicUrl: null, // private storage
            provider: 'supabase'
          };
        }
      } catch (e) {
        console.warn('Supabase storage upload error, using local storage fallback:', e.message);
      }
    }

    // Local secure disk storage fallback
    const localUserDir = path.join(UPLOAD_DIR, userId);
    if (!fs.existsSync(localUserDir)) {
      fs.mkdirSync(localUserDir, { recursive: true });
    }
    const localFilePath = path.join(localUserDir, `${Date.now()}_${path.basename(filename)}`);
    fs.writeFileSync(localFilePath, fileBuffer);

    return {
      storagePath: localFilePath,
      provider: 'local'
    };
  }
};
