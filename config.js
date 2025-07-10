// Configuration file for SQL Test Cases Generator
// This file handles API key management securely

const CONFIG = {
    // API Configuration
    API_BASE_URL: 'https://api.groq.com/openai/v1/chat/completions',
    MODEL: 'mixtral-8x7b-32768',
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7
};

// Secure API key management
function getApiKey() {
    // For GitHub Pages deployment - check for environment variable
    if (typeof process !== 'undefined' && process.env && process.env.GROQ_API_KEY) {
        return process.env.GROQ_API_KEY;
    }
    
    // For local development - check localStorage first
    const localKey = localStorage.getItem('GROQ_API_KEY');
    if (localKey) {
        return localKey;
    }
    
    // Fallback - prompt user to enter key
    return null;
}

// Function to set API key securely
function setApiKey(apiKey) {
    if (apiKey && apiKey.trim()) {
        localStorage.setItem('GROQ_API_KEY', apiKey.trim());
        return true;
    }
    return false;
}

// Function to check if API key is set
function hasApiKey() {
    const key = getApiKey();
    return key && key !== 'YOUR_GROQ_API_KEY_HERE' && key !== 'GROQ_API_KEY_PLACEHOLDER';
}

// Make functions available globally for browser use
if (typeof window !== 'undefined') {
    window.getApiKey = getApiKey;
    window.setApiKey = setApiKey;
    window.hasApiKey = hasApiKey;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getApiKey, setApiKey, hasApiKey };
} 