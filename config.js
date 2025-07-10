// Configuration file for SQL Test Cases Generator
const CONFIG = {
    GROQ_API_KEY: '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', // <--- PUT YOUR KEY HERE
    API_BASE_URL: 'https://api.groq.com/openai/v1/chat/completions',
    MODEL: 'qwen/qwen3-32b',
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.6,
    TOP_P: 0.95,
    REASONING_EFFORT: 'default'
};

// For browser use
window.getApiKey = () => CONFIG.GROQ_API_KEY; 