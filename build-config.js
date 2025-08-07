// Build script to generate config.js from .env file
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse GROQ_API_KEY from .env
const apiKeyMatch = envContent.match(/GROQ_API_KEY=['"]?([^'"\n\r]+)['"]?/);
const apiKey = apiKeyMatch ? apiKeyMatch[1] : '';

if (!apiKey) {
    console.error('GROQ_API_KEY not found in .env file');
    process.exit(1);
}

// Generate config.js content
const configContent = `// Configuration file for SQL Test Cases Generator
// This file is auto-generated from .env - do not edit manually
const CONFIG = {
    API_BASE_URL: 'https://api.groq.com/openai/v1/chat/completions',
    MODEL: 'qwen/qwen3-32b',
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.6,
    TOP_P: 0.95,
    REASONING_EFFORT: 'default',
    // WARNING: This exposes the API key in the frontend - only use for development/testing
    // API key from .env file: GROQ_API_KEY
    GROQ_API_KEY: '${apiKey}'
};
`;

// Write config.js
fs.writeFileSync(path.join(__dirname, 'config.js'), configContent);
console.log('✅ config.js generated successfully from .env file');