// Secure Groq API proxy using official SDK
import { Groq } from 'groq-sdk';

export default async function handler(req, res) {
    console.log(`🚀 API called: ${req.method} ${req.url}`);
    
    // Security headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        console.log('✅ CORS preflight handled');
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        console.log(`❌ Method ${req.method} not allowed`);
        return res.status(405).json({ 
            error: 'Method not allowed',
            message: 'Only POST requests are supported'
        });
    }

    try {
        // Get API key from environment (never exposed to client)
        const groqApiKey = process.env.GROQ_API_KEY;
        console.log('🔑 API Key check:', {
            exists: !!groqApiKey,
            length: groqApiKey ? groqApiKey.length : 0,
            prefix: groqApiKey ? groqApiKey.substring(0, 8) + '...' : 'none'
        });

        if (!groqApiKey) {
            console.error('❌ GROQ_API_KEY environment variable not set');
            return res.status(500).json({ 
                error: 'Server configuration error',
                message: 'API service unavailable'
            });
        }

        // Initialize Groq client with API key
        const groq = new Groq({
            apiKey: groqApiKey
        });

        // Validate request body
        if (!req.body) {
            console.error('❌ No request body');
            return res.status(400).json({
                error: 'Bad request',
                message: 'Request body is required'
            });
        }

        const { model, messages, temperature, max_tokens, top_p } = req.body;
        console.log('📝 Request data:', { model, messageCount: messages?.length });
        
        if (!model || !messages || !Array.isArray(messages)) {
            console.error('❌ Invalid request structure');
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Missing required fields: model, messages (array)'
            });
        }

        // Rate limiting - simple check
        const userAgent = req.headers['user-agent'] || '';
        if (userAgent.includes('bot') || userAgent.includes('crawler')) {
            return res.status(429).json({
                error: 'Rate limited',
                message: 'Too many requests'
            });
        }

        console.log(`🤖 Making Groq SDK request: ${model}`);

        // Make request using official Groq SDK
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: model,
            temperature: Math.min(Math.max(temperature || 0.7, 0), 2), // Clamp between 0-2
            max_tokens: Math.min(max_tokens || 1024, 4096), // Max 4096 tokens
            top_p: Math.min(Math.max(top_p || 0.9, 0), 1), // Clamp between 0-1
            stream: false,
            stop: null
        });

        console.log(`✅ Groq SDK success: ${chatCompletion.choices?.length || 0} choices`);

        // Validate response structure
        if (!chatCompletion.choices || !Array.isArray(chatCompletion.choices) || chatCompletion.choices.length === 0) {
            console.error('❌ Invalid Groq API response structure:', chatCompletion);
            return res.status(502).json({
                error: 'Invalid response',
                message: 'AI service returned invalid data'
            });
        }

        // Return successful response in OpenAI-compatible format
        return res.status(200).json({
            id: chatCompletion.id,
            object: chatCompletion.object,
            created: chatCompletion.created,
            model: chatCompletion.model,
            choices: chatCompletion.choices,
            usage: chatCompletion.usage
        });

    } catch (error) {
        console.error('💥 Groq SDK error:', error);
        
        // Handle specific error types
        if (error.name === 'AbortError') {
            return res.status(408).json({
                error: 'Request timeout',
                message: 'AI service took too long to respond'
            });
        }

        // Handle Groq SDK specific errors
        if (error.status) {
            return res.status(error.status).json({
                error: 'AI service error',
                message: error.message || 'Failed to generate content',
                details: error.error || null
            });
        }

        return res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'An unexpected error occurred'
        });
    }
}