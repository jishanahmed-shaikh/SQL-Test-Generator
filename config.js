// Configuration file for SQL Test Cases Generator
const CONFIG = {
    API_BASE_URL: 'http://localhost:3001/api/groq', // Use the backend proxy
    MODEL: 'qwen/qwen3-32b',
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.6,
    TOP_P: 0.95,
    REASONING_EFFORT: 'default'
};

window.getApiKey = () => null; // Not needed, backend handles the key 