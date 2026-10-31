const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

function getSessionId() {
  let sessionId = localStorage.getItem('codeprep-session-id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('codeprep-session-id', sessionId);
  }
  return sessionId;
}

async function apiRequest(endpoint, options = {}) {
  const sessionId = getSessionId();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionId,
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, { ...config, signal: AbortSignal.timeout(120000) });
  let data;
  try { data = await response.json(); } catch { throw new Error('The API is unavailable. Start the backend with npm run dev and retry.'); }

  if (!response.ok) {
    const error = new Error(data.error || data.message || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  getHealth: () => apiRequest('/health'),
  // Problems catalog
  getProblems: () => apiRequest('/problems'),
  getProblem: (id) => apiRequest(`/problems/${id}`),

  // Dashboard stats
  getStats: () => apiRequest('/stats'),

  // Interpret
  interpretText: (rawText) => apiRequest('/interpret', {
    method: 'POST',
    body: { rawText },
  }),
  interpretUrl: (url) => apiRequest('/interpret', {
    method: 'POST',
    body: { url },
  }),
  interpretCatalog: (catalogId) => apiRequest('/interpret', {
    method: 'POST',
    body: { catalogId },
  }),

  // Test cases
  generateTests: (problem) => apiRequest('/generate-tests', {
    method: 'POST',
    body: { problem },
  }),

  // Starter Code
  getStarterCode: (problem, language) => apiRequest('/starter-code', {
    method: 'POST',
    body: { problem, language },
  }),

  // Code execution
  runCode: (code, language, problem, customCases = []) => apiRequest('/run', {
    method: 'POST',
    body: { code, language, problemId: problem.id, customCases },
  }),

  // Diagnosis
  diagnose: (problem, code, language) => apiRequest('/diagnose', {
    method: 'POST',
    body: { problem, code, language, consent: true },
  }),

  // Solution (locked behind hint)
  getSolution: (problem, language, code) => apiRequest('/solution', {
    method: 'POST',
    body: { problem, language, code, consent: true },
  }),

  // Session analytics
  getSessionSummary: () => apiRequest(`/session/${getSessionId()}/summary`),
};

export { getSessionId };
