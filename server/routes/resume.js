import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { storageService, validateFileSignature } from '../services/storage.js';
import { aiClient } from '../services/aiClient.js';
import { supabaseAdmin, localStore } from '../services/supabase.js';

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx|txt)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF, DOCX, and TXT are supported.'));
    }
  }
});

const router = express.Router();

router.post('/upload', requireAuth, upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No file uploaded.' } });
    }

    const { originalname, buffer, mimetype, size } = req.file;
    const userId = req.user.id;

    // Validate magic bytes
    if (!validateFileSignature(buffer, mimetype)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid file signature. File contents do not match accepted PDF/DOCX format.' }
      });
    }

    // Upload to storage
    const uploadResult = await storageService.uploadResume({
      userId,
      fileBuffer: buffer,
      filename: originalname,
      mimetype
    });

    // Parse resume via FastAPI AI Service
    let parsedData = null;
    let parseStatus = 'parsed';
    try {
      parsedData = await aiClient.parseResume(buffer, originalname);
    } catch (parseErr) {
      console.warn('AI Parsing failed, saving in pending state:', parseErr.message);
      parseStatus = 'failed';
    }

    const resumeId = uuidv4();
    const resumeRecord = {
      id: resumeId,
      user_id: userId,
      title: req.body.title || originalname.replace(/\.[^/.]+$/, ""),
      file_path: uploadResult.storagePath,
      file_type: originalname.split('.').pop().toLowerCase(),
      file_size: size,
      target_role: req.body.target_role || 'Software Engineer',
      status: parseStatus,
      parsed_data: parsedData,
      is_primary: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabaseAdmin) {
      await supabaseAdmin.from('resumes').insert(resumeRecord);
    }
    localStore.resumes.set(resumeId, resumeRecord);

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and analyzed successfully.',
      resume: resumeRecord
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return res.json({ success: true, resumes: data });
      }
    }

    const resumes = Array.from(localStore.resumes.values())
      .filter(r => r.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, resumes });
  } catch (err) {
    next(err);
  }
});

router.get('/:resumeId', requireAuth, async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user.id;

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        return res.json({ success: true, resume: data });
      }
    }

    const resume = localStore.resumes.get(resumeId);
    if (!resume || resume.user_id !== userId) {
      return res.status(404).json({ success: false, error: { message: 'Resume not found.' } });
    }

    res.json({ success: true, resume });
  } catch (err) {
    next(err);
  }
});

router.patch('/:resumeId', requireAuth, async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user.id;
    const updates = req.body;
    delete updates.id;
    delete updates.user_id;

    let resume = localStore.resumes.get(resumeId);
    if (!resume || resume.user_id !== userId) {
      return res.status(404).json({ success: false, error: { message: 'Resume not found.' } });
    }

    resume = { ...resume, ...updates, updated_at: new Date().toISOString() };
    localStore.resumes.set(resumeId, resume);

    if (supabaseAdmin) {
      await supabaseAdmin.from('resumes').update(updates).eq('id', resumeId).eq('user_id', userId);
    }

    res.json({ success: true, resume });
  } catch (err) {
    next(err);
  }
});

router.delete('/:resumeId', requireAuth, async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user.id;

    if (supabaseAdmin) {
      await supabaseAdmin.from('resumes').delete().eq('id', resumeId).eq('user_id', userId);
    }
    localStore.resumes.delete(resumeId);

    res.json({ success: true, message: 'Resume deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

router.post('/:resumeId/versions', requireAuth, async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user.id;
    const { data, changeSummary } = req.body;

    const versionId = uuidv4();
    const versionRecord = {
      id: versionId,
      resume_id: resumeId,
      user_id: userId,
      version_number: Date.now(),
      data: data || {},
      change_summary: changeSummary || 'Edited resume sections',
      created_at: new Date().toISOString()
    };

    localStore.resumeVersions.set(versionId, versionRecord);
    res.status(201).json({ success: true, version: versionRecord });
  } catch (err) {
    next(err);
  }
});

router.get('/:resumeId/versions', requireAuth, async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const versions = Array.from(localStore.resumeVersions.values())
      .filter(v => v.resume_id === resumeId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, versions });
  } catch (err) {
    next(err);
  }
});

export default router;
