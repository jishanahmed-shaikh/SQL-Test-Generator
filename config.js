// Configuration file for SQL Test Cases Generator
const CONFIG = {
    // Use relative URLs for Vercel deployment, fallback to localhost for development
    API_BASE_URL: window.location.hostname === 'localhost' ? 'http://localhost:3000/api/groq' : '/api/groq',
    STATS_API_URL: window.location.hostname === 'localhost' ? 'http://localhost:3000/api/stats' : '/api/stats',
    MODEL: 'qwen/qwen3-32b',
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.6,
    TOP_P: 0.95,
    REASONING_EFFORT: 'default'
};
