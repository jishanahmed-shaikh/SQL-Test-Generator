// Configuration file for SQL Test Cases Generator
const CONFIG = {
    // IMPORTANT: Replace 'YOUR_DEPLOYED_BACKEND_URL_HERE' with the actual URL of your deployed backend proxy.
    // Example: 'https://your-app-name.onrender.com/api/groq' or 'https://your-custom-domain.com/api/groq'
    API_BASE_URL: 'YOUR_DEPLOYED_BACKEND_URL_HERE/api/groq', 
    MODEL: 'qwen/qwen3-32b',
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.6,
    TOP_P: 0.95,
    REASONING_EFFORT: 'default'
};

window.getApiKey = () => null; // Not needed, backend handles the key
