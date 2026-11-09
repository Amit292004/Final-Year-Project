export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('careerfit_token') || 'demo_token_careerfit';

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  // If uploading FormData, delete Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error?.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err);
    throw err;
  }
}

export async function analyzeResumeFile(file, jobDescription = '') {
  const formData = new FormData();
  formData.append('resume', file);
  if (jobDescription) {
    formData.append('job_description', jobDescription);
  }

  // Attempt via Express Gateway first
  try {
    const res = await apiRequest('/assessments/analyze-resume', {
      method: 'POST',
      body: formData
    });
    return res.analysis || res;
  } catch (err) {
    console.warn('Express gateway analyze failed, attempting direct FastAPI fallback...', err);
    const token = localStorage.getItem('careerfit_token') || 'demo_token_careerfit';
    const directRes = await fetch('http://localhost:8000/api/v1/analyze-resume', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!directRes.ok) {
      const errData = await directRes.json().catch(() => null);
      throw new Error(errData?.detail || `FastAPI analysis failed with status ${directRes.status}`);
    }
    return await directRes.json();
  }
}

export async function fetchAtsHistory() {
  try {
    const res = await apiRequest('/assessments/history');
    return res.history || [];
  } catch (err) {
    console.warn('Express gateway history failed, trying direct FastAPI fallback...', err);
    const token = localStorage.getItem('careerfit_token') || 'demo_token_careerfit';
    const directRes = await fetch('http://localhost:8000/api/v1/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!directRes.ok) throw err;
    return await directRes.json();
  }
}

export async function deleteAtsHistory(analysisId) {
  try {
    return await apiRequest(`/assessments/history/${analysisId}`, { method: 'DELETE' });
  } catch (err) {
    const token = localStorage.getItem('careerfit_token') || 'demo_token_careerfit';
    const directRes = await fetch(`http://localhost:8000/api/v1/history/${analysisId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!directRes.ok) throw err;
    return await directRes.json();
  }
}

export async function downloadAtsReportBlob(analysisData) {
  const token = localStorage.getItem('careerfit_token') || 'demo_token_careerfit';
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/assessments/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(analysisData)
    });
    if (!response.ok) throw new Error('Express PDF failed');
  } catch (err) {
    response = await fetch('http://localhost:8000/api/v1/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(analysisData)
    });
  }
  return await response.blob();
}

export async function downloadHistoryReportBlob(analysisId) {
  const token = localStorage.getItem('careerfit_token') || 'demo_token_careerfit';
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/assessments/history/${analysisId}/pdf`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Express history PDF failed');
  } catch (err) {
    response = await fetch(`http://localhost:8000/api/v1/history/${analysisId}/pdf`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
  return await response.blob();
}
