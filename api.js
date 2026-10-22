const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('smartplate_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('smartplate_token', token);
  } else {
    localStorage.removeItem('smartplate_token');
  }
}

async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clear token
    setAuthToken(null);
  }

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errData.message || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async register(username, email, password, fullName) {
    return fetchWithAuth(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, full_name: fullName }),
    });
  },

  async login(usernameOrEmail, password) {
    return fetchWithAuth(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username_or_email: usernameOrEmail, password }),
    });
  },

  async getMe() {
    return fetchWithAuth(`${API_BASE}/auth/me`);
  },

  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Samples
  async getSamples() {
    const res = await fetch(`${API_BASE}/recognize/samples`);
    return res.json();
  },

  // Recognition
  async recognizeImage({ file, sampleFilename }) {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    if (sampleFilename) {
      formData.append('sample_filename', sampleFilename);
    }

    return fetchWithAuth(`${API_BASE}/recognize/image`, {
      method: 'POST',
      body: formData,
    });
  },

  async recognizeWebcamFrame(base64Image) {
    return fetchWithAuth(`${API_BASE}/recognize/webcam-frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: base64Image }),
    });
  },

  async recognizeVideo(file) {
    const formData = new FormData();
    formData.append('file', file);

    return fetchWithAuth(`${API_BASE}/recognize/video`, {
      method: 'POST',
      body: formData,
    });
  },

  async saveDetection(detectionData) {
    return fetchWithAuth(`${API_BASE}/recognize/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(detectionData),
    });
  },

  // History
  async getDetections({ page = 1, pageSize = 10, search = '', sourceType = 'all', startDate = '', endDate = '' } = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (search) params.append('search', search);
    if (sourceType && sourceType !== 'all') params.append('source_type', sourceType);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    return fetchWithAuth(`${API_BASE}/detections?${params.toString()}`);
  },

  async deleteDetection(id) {
    return fetchWithAuth(`${API_BASE}/detections/${id}`, {
      method: 'DELETE',
    });
  },

  getCsvExportUrl() {
    const token = getAuthToken();
    return `${API_BASE}/detections/export/csv${token ? `?token=${token}` : ''}`;
  },

  async downloadCsv() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/detections/export/csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to export CSV');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartplate_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  // Analytics
  async getAnalytics() {
    return fetchWithAuth(`${API_BASE}/analytics`);
  },
};
