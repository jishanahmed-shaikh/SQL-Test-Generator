// Configuration file for SQL Test Cases Generator
// All API keys are handled securely on the server side - never exposed to frontend
const CONFIG = {
    // API endpoints - always use secure proxy (NEVER direct to Groq!)
    API_BASE_URL: '/api/groq',
    STATS_API_URL: '/api/stats',
    
    // Groq API settings - using the most reliable model
    MODEL: 'llama-3.1-70b-versatile',
    MAX_TOKENS: 1024,
    TEMPERATURE: 0.7,
    TOP_P: 0.9,
    
    // App settings
    MAX_QUESTIONS: 10,
    MIN_QUESTIONS: 1,
    REQUEST_TIMEOUT: 30000
};
