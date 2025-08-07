// Secure Groq API proxy for Vercel
export default async function handler(req, res) {
    // Security headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            message: 'Only POST requests are supported'
        });
    }

    try {
        // Get API key from environment (never exposed to client)
        const groqApiKey = process.env.GROQ_API_KEY;

        if (!groqApiKey) {
            console.error('GROQ_API_KEY environment variable not set');
            return res.status(500).json({ 
                error: 'Server configuration error',
                message: 'API service unavailable'
            });
        }

        // Validate request body
        const { model, messages, temperature, max_tokens, top_p } = req.body;
        
        if (!model || !messages || !Array.isArray(messages)) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Missing required fields: model, messages'
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

        // Make request to Groq API
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'SQL-TestCases-Generator/1.0'
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: Math.min(Math.max(temperature || 0.7, 0), 2), // Clamp between 0-2
                max_tokens: Math.min(max_tokens || 2048, 4096), // Max 4096 tokens
                top_p: Math.min(Math.max(top_p || 0.9, 0), 1), // Clamp between 0-1
                stream: false
            }),
            signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        if (!groqResponse.ok) {
            const errorData = await groqResponse.json().catch(() => ({}));
            console.error('Groq API error:', groqResponse.status, errorData);
            
            return res.status(groqResponse.status).json({
                error: 'AI service error',
                message: 'Failed to generate content',
                status: groqResponse.status
            });
        }

        const data = await groqResponse.json();

        // Validate response structure
        if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
            console.error('Invalid Groq API response structure:', data);
            return res.status(502).json({
                error: 'Invalid response',
                message: 'AI service returned invalid data'
            });
        }

        // Return successful response
        return res.status(200).json(data);

    } catch (error) {
        console.error('Groq API proxy error:', error.message);
        
        // Handle specific error types
        if (error.name === 'AbortError') {
            return res.status(408).json({
                error: 'Request timeout',
                message: 'AI service took too long to respond'
            });
        }

        return res.status(500).json({
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
}