console.log('SQL Test Cases Generator v2.0 - Loaded');

// Global application state
const AppState = {
    userId: localStorage.getItem('sqlGeneratorUserId') || 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 8),
    globalStats: {
        totalGenerated: 0,
        goodFeedback: 0,
        badFeedback: 0,
        totalUsers: 0
    },
    currentLevel: null,
    uploadedSchema: '',
    feedbackGiven: false,
    isGenerating: false
};

// Save user ID to localStorage
localStorage.setItem('sqlGeneratorUserId', AppState.userId);

// API utility functions with error handling and retries
const ApiUtils = {
    // Load global stats with retry logic
    async loadGlobalStats(retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                const response = await fetch(CONFIG.STATS_API_URL, {
                    signal: controller.signal,
                    headers: { 'Cache-Control': 'no-cache' }
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    AppState.globalStats = await response.json();
                    this.updateStatsDisplay();
                    return true;
                }
            } catch (error) {
                console.warn(`Stats load attempt ${i + 1} failed:`, error.message);
                if (i === retries - 1) {
                    console.error('Failed to load global stats after all retries');
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
            }
        }
        return false;
    },

    // Update stats with validation and retry
    async updateGlobalStats(action, count = 1, retries = 2) {
        // Validate inputs
        if (!['generated', 'good_feedback', 'bad_feedback'].includes(action)) {
            console.error('Invalid action:', action);
            return false;
        }

        for (let i = 0; i < retries; i++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

                const response = await fetch(CONFIG.STATS_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: action,
                        userId: AppState.userId,
                        count: Math.max(1, Math.min(count, 10)) // Clamp 1-10
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const result = await response.json();
                    AppState.globalStats = result.globalStats;
                    this.updateStatsDisplay();
                    return result;
                }
            } catch (error) {
                console.warn(`Stats update attempt ${i + 1} failed:`, error.message);
                if (i === retries - 1) {
                    console.error('Failed to update stats after all retries');
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        return false;
    },

    // Admin function to clear all stats
    async clearAllStats(passcode) {
        try {
            const response = await fetch(CONFIG.STATS_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'clear_all',
                    userId: AppState.userId,
                    passcode: passcode
                })
            });

            if (response.ok) {
                const result = await response.json();
                AppState.globalStats = result.globalStats;
                this.updateStatsDisplay();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error clearing stats:', error);
            return false;
        }
    },

    // Update UI with current stats
    updateStatsDisplay() {
        const elements = {
            totalGenerated: document.getElementById('totalGenerated'),
            globalGoodCount: document.getElementById('globalGoodCount'),
            globalBadCount: document.getElementById('globalBadCount')
        };

        Object.entries(elements).forEach(([key, element]) => {
            if (element) {
                const statKey = key === 'totalGenerated' ? 'totalGenerated' : 
                               key === 'globalGoodCount' ? 'goodFeedback' : 'badFeedback';
                element.textContent = AppState.globalStats[statKey] || 0;
            }
        });
    }
};

// Predefined questions as fallback when AI fails
const PREDEFINED_QUESTIONS = {
    basic: [
        "How many customers are in the database?",
        "What are the names of all products in the inventory?",
        "Which orders were placed in the last 30 days?",
        "What is the total revenue for this month?",
        "List all employees in the sales department.",
        "Find all customers from New York.",
        "What is the average price of products in the electronics category?",
        "Show all orders with a total amount greater than $1000.",
        "Which products are currently out of stock?",
        "List the top 5 customers by total purchase amount.",
        "What are the different product categories available?",
        "Find all orders placed by customer ID 12345.",
        "Which employees were hired in 2023?",
        "What is the minimum and maximum salary in the company?",
        "Show all products with a price between $50 and $200.",
        "List customers who have never placed an order.",
        "What is the total number of orders placed today?",
        "Find all suppliers from California.",
        "Which products have been discontinued?",
        "Show the most recent 10 customer registrations."
    ],
    intermediate: [
        "What is the total revenue generated by each product category?",
        "Which customers have placed more than 5 orders in the last year?",
        "Find the average order value for each customer segment.",
        "List products that have never been ordered.",
        "What is the monthly sales trend for the past 12 months?",
        "Which employees have the highest sales performance?",
        "Find customers who have purchased products from multiple categories.",
        "What is the inventory turnover rate for each product?",
        "Show the top 3 best-selling products in each category.",
        "Which orders contain both electronics and clothing items?",
        "Find the customer retention rate by month.",
        "What is the average time between order placement and delivery?",
        "List suppliers who provide products in more than one category.",
        "Which products have the highest profit margins?",
        "Find customers whose total purchases exceed the average customer spend.",
        "What is the seasonal sales pattern for different product categories?",
        "Show orders that were returned within 30 days of purchase.",
        "Which sales representatives have exceeded their quarterly targets?",
        "Find the correlation between customer age and purchase behavior.",
        "What is the geographic distribution of our customer base?"
    ],
    advanced: [
        "Calculate the running total of sales for each month with year-over-year comparison.",
        "Find the top 10% of customers by lifetime value and their purchasing patterns.",
        "What is the customer churn rate and which factors contribute to it most?",
        "Identify products that are frequently bought together using market basket analysis.",
        "Calculate the cohort analysis for customer retention over 24 months.",
        "Find the optimal inventory levels using ABC analysis for each product category.",
        "What is the customer acquisition cost and lifetime value ratio by marketing channel?",
        "Identify seasonal trends and forecast next quarter's sales using moving averages.",
        "Calculate the Pareto analysis (80/20 rule) for products, customers, and regions.",
        "Find the correlation between employee performance metrics and customer satisfaction scores.",
        "What is the impact of promotional campaigns on customer behavior and sales velocity?",
        "Calculate the days sales outstanding (DSO) and identify payment pattern trends.",
        "Find customers at risk of churning using RFM analysis (Recency, Frequency, Monetary).",
        "What is the cross-selling and up-selling success rate by product combinations?",
        "Calculate the inventory carrying costs and identify slow-moving stock.",
        "Find the optimal pricing strategy using price elasticity analysis.",
        "What is the customer journey analysis from first touch to conversion?",
        "Calculate the contribution margin by product line and identify profit drivers.",
        "Find the geographic expansion opportunities using market penetration analysis.",
        "What is the impact of customer service interactions on repeat purchase behavior?"
    ]
};

// Function to get random predefined questions
function getPredefinedQuestions(level, count) {
    const questions = PREDEFINED_QUESTIONS[level] || PREDEFINED_QUESTIONS.basic;
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// --- Main App Initialization ---
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing SQL Test Cases Generator...');
    
    // Initialize UI
    document.getElementById('userIdDisplay').textContent = AppState.userId;
    
    // Load global stats
    await ApiUtils.loadGlobalStats();
    
    console.log('App initialized successfully');
    // DOM elements
    const levelButtons = document.querySelectorAll('.level-btn');
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const testCaseCount = document.getElementById('testCaseCount');
    const questionsContainer = document.getElementById('questionsContainer');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const goodFeedback = document.getElementById('goodFeedback');
    const badFeedback = document.getElementById('badFeedback');
    const totalGeneratedSpan = document.getElementById('totalGenerated');
    const globalGoodCountSpan = document.getElementById('globalGoodCount'); // New span for global good count
    const globalBadCountSpan = document.getElementById('globalBadCount');   // New span for global bad count
    const copyAllBtn = document.getElementById('copyAllBtn');
    const clearStatsBtn = document.getElementById('clearStatsBtn');
    const passcodeModal = document.getElementById('passcodeModal');
    const passcodeInput = document.getElementById('passcodeInput');
    const submitPasscodeBtn = document.getElementById('submitPasscodeBtn');
    const schemaUpload = document.getElementById('schemaUpload');
    const fileStatus = document.getElementById('fileStatus');
    const clearFileBtn = document.getElementById('clearFileBtn');
    const uploadedSchemaDisplay = document.getElementById('uploadedSchemaDisplay');
    const uploadedContentPreview = document.getElementById('uploadedContentPreview');

    let currentLevel = null;
    let uploadedSchema = ''; // Stores the content of the uploaded file
    let feedbackClickedForCurrentGeneration = false; // To ensure feedback is given once per generation

    // Local stats are handled by loadLocalStats() and saveLocalStats() functions

    // --- 1. Clear Results button ---
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            questionsContainer.innerHTML = `
                <div class="placeholder">
                    <i class="fas fa-lightbulb"></i>
                    <p>Select a level and click Generate to see questions</p>
                </div>
            `;
            copyAllBtn.style.display = 'none';
            // Reset feedback buttons for a new generation
            feedbackClickedForCurrentGeneration = false;
            goodFeedback.disabled = false;
            badFeedback.disabled = false;
        });
    }

    // --- 2. Clear Global Stats button ---
    if (clearStatsBtn) {
        clearStatsBtn.addEventListener('click', () => {
            passcodeModal.style.display = 'flex';
            passcodeInput.value = '';
            setTimeout(() => passcodeInput.focus(), 100);
        });
    }
    if (submitPasscodeBtn) {
        submitPasscodeBtn.addEventListener('click', handlePasscodeSubmit);
    }
    if (passcodeInput) {
        passcodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handlePasscodeSubmit();
        });
    }

    async function handlePasscodeSubmit() {
        const code = passcodeInput.value.trim();
        passcodeModal.style.display = 'none';

        if (code === '1072025') {
            console.log('Admin access granted. Clearing global stats...');
            const success = await ApiUtils.clearAllStats(code);
            if (success) {
                showToast('All global stats cleared successfully!', 'success');
            } else {
                showToast('Failed to clear stats. Please try again.', 'error');
            }
        } else {
            console.log('Invalid admin passcode');
            if (clearStatsBtn) {
                clearStatsBtn.classList.add('break');
                setTimeout(() => {
                    clearStatsBtn.remove();
                    console.log('Admin button removed after invalid passcode');
                }, 700);
            }
            showToast('Invalid admin passcode. Access denied.', 'error');
        }
    }

    // --- File Upload Logic ---
    schemaUpload.addEventListener('change', handleFileUpload);
    clearFileBtn.addEventListener('click', clearUploadedFile);

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            fileStatus.textContent = 'No file chosen';
            clearFileBtn.style.display = 'none';
            uploadedContentPreview.style.display = 'none';
            uploadedSchema = '';
            return;
        }

        fileStatus.textContent = `File: ${file.name}`;
        clearFileBtn.style.display = 'inline-block';

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            let processedContent = '';
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                // For CSV, extract headers and maybe first few data rows
                const lines = content.split('\n').filter(line => line.trim() !== '');
                if (lines.length > 0) {
                    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '')).join(', ');
                    processedContent = `CSV Headers: ${headers}`;
                    if (lines.length > 1) {
                        processedContent += `\nSample Data: ${lines.slice(1, 3).join('\n')}`;
                    }
                }
                uploadedSchema = `CSV Schema/Data:\n${content}`; // Send full content to LLM
            } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
                try {
                    const json = JSON.parse(content);
                    processedContent = JSON.stringify(json, null, 2);
                    uploadedSchema = `JSON Schema/Data:\n${content}`; // Send full content to LLM
                } catch (e) {
                    processedContent = 'Error parsing JSON file.';
                    uploadedSchema = '';
                    const event = new CustomEvent('show-toast', {
                        detail: { message: 'Invalid JSON file.', type: 'error' }
                    });
                    document.dispatchEvent(event);
                }
            } else {
                processedContent = 'Unsupported file type. Please upload CSV or JSON.';
                uploadedSchema = '';
                const event = new CustomEvent('show-toast', {
                    detail: { message: 'Unsupported file type. Use CSV or JSON.', type: 'error' }
                });
                document.dispatchEvent(event);
            }
            uploadedSchemaDisplay.textContent = processedContent;
            uploadedContentPreview.style.display = 'block';
        };
        reader.onerror = () => {
            fileStatus.textContent = 'Error reading file.';
            clearFileBtn.style.display = 'none';
            uploadedContentPreview.style.display = 'none';
            uploadedSchema = '';
            const event = new CustomEvent('show-toast', {
                detail: { message: 'Error reading file.', type: 'error' }
            });
            document.dispatchEvent(event);
        };
        reader.readAsText(file);
    }

    function clearUploadedFile() {
        schemaUpload.value = ''; // Clear the file input
        fileStatus.textContent = 'No file chosen';
        clearFileBtn.style.display = 'none';
        uploadedContentPreview.style.display = 'none';
        uploadedSchema = '';
        const event = new CustomEvent('show-toast', {
            detail: { message: 'Uploaded file cleared.', type: 'info' }
        });
        document.dispatchEvent(event);
    }

    // --- Call Groq API directly (modified to include schema) ---
    async function callGroqAPI(level, count, schemaContext = '') {
        console.log(`🤖 Attempting AI generation: ${level} level, ${count} questions`);
        
        let basePrompt;
        if (schemaContext) {
            basePrompt = `Generate exactly ${count} SQL natural language questions for testing, based on the following schema/data:\n\n${schemaContext}\n\n`;
        } else {
            basePrompt = `Generate exactly ${count} SQL natural language questions for testing.`;
        }

        const prompts = {
            basic: `${basePrompt} These should be simple queries like counting, basic filtering, or simple aggregations. Focus on common business scenarios like customers, orders, products, sales, etc.`,
            intermediate: `${basePrompt} These should involve JOINs, GROUP BY, subqueries, and more complex filtering. Include scenarios with multiple tables and conditional logic.`,
            advanced: `${basePrompt} These should involve complex JOINs, window functions, CTEs, nested subqueries, and advanced analytics. Include time-series analysis, ranking, and complex business logic.`
        };

        const finalPrompt = `${prompts[level]}

IMPORTANT FORMATTING RULES:
- Output EXACTLY ${count} questions
- One question per line
- Start each question with: How, What, Which, List, Show, Find, Give, Who, Where, When, Identify, Calculate, Determine, Display, Name, Count, Retrieve, Select, Provide, or Return
- No explanations, commentary, reasoning, preamble, or numbering
- No empty lines between questions
- Start your response immediately with the first question

Example format:
How many customers are in the database?
What is the total revenue for this month?
Which products have the highest sales?`;

        const payload = {
            model: CONFIG.MODEL,
            messages: [
                { role: 'user', content: finalPrompt }
            ],
            temperature: CONFIG.TEMPERATURE,
            max_tokens: CONFIG.MAX_TOKENS,
            top_p: CONFIG.TOP_P,
            stream: false
        };

        console.log('🌐 Making API request to:', CONFIG.API_BASE_URL);

        const response = await fetch(CONFIG.API_BASE_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('📡 API Response status:', response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('❌ API Error Response:', errorData);
            throw new Error(`API request failed: ${response.status} - ${errorData.error || response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📦 API Response received');
        
        if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
            console.error('❌ Invalid API response structure:', data);
            throw new Error("Invalid API response structure");
        }

        const questionsText = data.choices[0].message.content.trim();
        console.log('📝 Raw AI response:', questionsText);
        
        // More flexible question parsing
        let questions = questionsText
            .split('\n')
            .map(q => q.trim())
            .filter(q => q.length > 10) // Filter out very short responses
            .filter(q => !q.match(/^(Here|Below|The following|These are|I'll|Let me)/i)) // Remove intro text
            .map(q => q.replace(/^\d+[\.\)]\s*/, '')) // Remove numbering
            .filter(q => q.length > 0);

        console.log('✅ Parsed questions:', questions);

        // Return the questions we got (don't pad with error messages)
        return questions.slice(0, count);
    }

    // --- Generate questions with retry and predefined fallback ---
    async function generateQuestionsWithRetry(level, count, schemaContext) {
        console.log(`🎯 Starting question generation: ${level} level, ${count} questions`);
        
        try {
            // First attempt with AI
            console.log('🚀 First AI attempt...');
            let questions = await callGroqAPI(level, count, schemaContext);
            
            // Check if we got any valid questions (be more lenient)
            if (questions && questions.length > 0) {
                console.log(`✅ AI Success! Got ${questions.length} questions`);
                // Pad with predefined if we didn't get enough
                if (questions.length < count) {
                    const needed = count - questions.length;
                    const predefined = getPredefinedQuestions(level, needed);
                    questions = [...questions, ...predefined];
                    console.log(`📝 Padded with ${needed} predefined questions`);
                    return { questions: questions.slice(0, count), source: 'mixed' };
                }
                return { questions: questions.slice(0, count), source: 'ai' };
            }
            
            // Second attempt with AI if first failed
            console.log('🔄 First attempt failed, retrying...');
            questions = await callGroqAPI(level, count, schemaContext);
            
            if (questions && questions.length > 0) {
                console.log(`✅ AI Retry Success! Got ${questions.length} questions`);
                // Pad with predefined if we didn't get enough
                if (questions.length < count) {
                    const needed = count - questions.length;
                    const predefined = getPredefinedQuestions(level, needed);
                    questions = [...questions, ...predefined];
                    console.log(`📝 Padded with ${needed} predefined questions`);
                    return { questions: questions.slice(0, count), source: 'mixed' };
                }
                return { questions: questions.slice(0, count), source: 'ai' };
            }
            
            // If AI completely fails, use predefined questions
            console.log('❌ AI generation failed completely, using predefined questions');
            return { questions: getPredefinedQuestions(level, count), source: 'predefined' };
            
        } catch (error) {
            console.error('💥 Error in AI generation:', error);
            // If there's an error with AI, use predefined questions
            return { questions: getPredefinedQuestions(level, count), source: 'predefined' };
        }
    }

    // --- Level selection ---
    levelButtons.forEach(btn => {
        btn.addEventListener('click', () => selectLevel(btn.dataset.level));
    });

    function selectLevel(level) {
        AppState.currentLevel = level;
        levelButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.level === level) {
                btn.classList.add('active');
            }
        });
        generateBtn.disabled = false;
    }

    // --- Generate questions ---
    generateBtn.addEventListener('click', async function() {
        if (!AppState.currentLevel) {
            showToast('Please select a difficulty level first!', 'error');
            return;
        }
        
        if (AppState.isGenerating) {
            showToast('Generation already in progress...', 'info');
            return;
        }
        const count = parseInt(testCaseCount.value);
        if (count < CONFIG.MIN_QUESTIONS || count > CONFIG.MAX_QUESTIONS) {
            showToast(`Please select between ${CONFIG.MIN_QUESTIONS} and ${CONFIG.MAX_QUESTIONS} test cases!`, 'error');
            return;
        }
        
        // Reset UI state
        showLoading(true);
        generateBtn.disabled = true;
        AppState.feedbackGiven = false;
        goodFeedback.disabled = false;
        badFeedback.disabled = false;

        try {
            AppState.isGenerating = true;
            const result = await generateQuestionsWithRetry(AppState.currentLevel, count, AppState.uploadedSchema);
            displayQuestions(result.questions, result.source);
            
            // Update global stats
            await ApiUtils.updateGlobalStats('generated', result.questions.length);

        } catch (error) {
            console.error('Error generating questions:', error);
            const event = new CustomEvent('show-toast', {
                detail: { message: 'Error generating questions. Please try again.', type: 'error' }
            });
            document.dispatchEvent(event);
        } finally {
            showLoading(false);
            generateBtn.disabled = false;
            AppState.isGenerating = false;
        }
    });

    // --- Display questions ---
    function displayQuestions(questions, source = 'ai') {
        questionsContainer.innerHTML = '';
        
        // Add source indicator
        if (source !== 'ai') {
            const sourceIndicator = document.createElement('div');
            sourceIndicator.className = 'source-indicator';
            let sourceText = '';
            let sourceIcon = '';
            
            if (source === 'predefined') {
                sourceText = 'Using predefined questions (AI unavailable)';
                sourceIcon = 'fas fa-database';
            } else if (source === 'mixed') {
                sourceText = 'Mixed: AI + predefined questions';
                sourceIcon = 'fas fa-random';
            }
            
            sourceIndicator.innerHTML = `
                <i class="${sourceIcon}"></i>
                <span>${sourceText}</span>
            `;
            sourceIndicator.style.cssText = `
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 8px 12px;
                border-radius: 6px;
                margin-bottom: 15px;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            questionsContainer.appendChild(sourceIndicator);
        }
        
        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            questionDiv.innerHTML = `
                <div class="question-number">Question ${index + 1}</div>
                <div class="question-text">${question}</div>
                <button class="copy-btn" onclick="copyQuestion('${question.replace(/'/g, "\\'")}')">
                    <i class="fas fa-copy"></i> Copy
                </button>
            `;
            questionsContainer.appendChild(questionDiv);
        });
        copyAllBtn.style.display = questions.length > 0 ? 'block' : 'none';
    }

    // --- Copy logic ---
    window.copyQuestion = function(question) {
        // Use document.execCommand('copy') for better compatibility in iframes
        const textarea = document.createElement('textarea');
        textarea.value = question;
        textarea.style.position = 'fixed'; // Avoid scrolling to bottom
        textarea.style.opacity = 0; // Hide it
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            const event = new CustomEvent('show-toast', {
                detail: { message: 'Question copied!', type: 'success' }
            });
            document.dispatchEvent(event);
        } catch (err) {
            console.error('Failed to copy text:', err);
            const event = new CustomEvent('show-toast', {
                detail: { message: 'Failed to copy question. Please copy manually.', type: 'error' }
            });
            document.dispatchEvent(event);
        } finally {
            document.body.removeChild(textarea);
        }
    };

    copyAllBtn.addEventListener('click', function() {
        const questions = Array.from(document.querySelectorAll('.question-text'))
            .map(el => el.textContent)
            .join('\n\n');
        
        const textarea = document.createElement('textarea');
        textarea.value = questions;
        textarea.style.position = 'fixed';
        textarea.style.opacity = 0;
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            const event = new CustomEvent('show-toast', {
                detail: { message: 'All questions copied!', type: 'success' }
            });
            document.dispatchEvent(event);
        } catch (err) {
            console.error('Failed to copy text:', err);
            const event = new CustomEvent('show-toast', {
                detail: { message: 'Failed to copy all questions. Please copy manually.', type: 'error' }
            });
            document.dispatchEvent(event);
        } finally {
            document.body.removeChild(textarea);
        }
    });

    // --- Loading overlay ---
    function showLoading(show) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    // --- Toast notification system ---
    document.addEventListener('show-toast', function(event) {
        const { message, type } = event.detail;
        showToast(message, type);
    });

    function showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#667eea',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: '9999',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // --- Floating background icons ---
    createFloatingDataIcons(160, 0.6); // 160 icons, 0.6x speed

    // --- Feedback button logic ---
    goodFeedback.addEventListener('click', async function() {
        if (!AppState.feedbackGiven) {
            const success = await ApiUtils.updateGlobalStats('good_feedback');
            if (success) {
                AppState.feedbackGiven = true;
                goodFeedback.disabled = true;
                badFeedback.disabled = true;
                showToast('Thank you for your positive feedback!', 'success');
            } else {
                showToast('Failed to submit feedback. Please try again.', 'error');
            }
        }
    });

    badFeedback.addEventListener('click', async function() {
        if (!AppState.feedbackGiven) {
            const success = await ApiUtils.updateGlobalStats('bad_feedback');
            if (success) {
                AppState.feedbackGiven = true;
                goodFeedback.disabled = true;
                badFeedback.disabled = true;
                showToast('Thank you for your feedback! We\'ll work to improve.', 'success');
            } else {
                showToast('Failed to submit feedback. Please try again.', 'error');
            }
        }
    });
}); // End of DOMContentLoaded

// Update createFloatingDataIcons to accept count and speedMultiplier
function createFloatingDataIcons(count = 80, speedMultiplier = 1) {
    const icons = [
        '$', '#', '{ }', 'SQL', 'DB', '<>', '||', '==', '!=', '>', '<',
        'table', 'row', 'col', 'sum()', 'avg()', 'count()', 'select', 'from', 'where', 'join', 'group', 'order', 'limit', '∑', 'π', '∩', '∪', '∈', '∉', '∅', '∃', '∀', 'λ', 'π', 'σ', 'ρ', 'δ', 'γ', 'β', 'α', 'Ω', 'Φ', 'Ψ', 'χ', 'ψ', 'ω', 'μ', 'ν', 'ξ', 'ζ', 'η', 'θ', 'κ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'λ', 'π', 'σ', 'ρ', 'δ', 'γ', 'β', 'α', 'Ω', 'Φ', 'Ψ', 'χ', 'ψ', 'ω', 'μ', 'ν', 'ξ', 'ζ', 'η', 'θ', 'κ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'λ', 'π', 'σ', 'ρ', 'δ', 'γ', 'β', 'α', 'Ω', 'Φ', 'Ψ', 'χ', 'ψ', 'ω', 'μ', 'ν', 'ξ', 'ζ', 'η', 'θ', 'κ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'
    ];
    const bg = document.querySelector('.sql-bg');
    if (!bg) return;
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'sql-float-auto';
        el.textContent = icons[Math.floor(Math.random() * icons.length)];
        const size = 18 + Math.random() * 32;
        el.style.fontSize = size + 'px';
        el.style.position = 'absolute';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = Math.random() * 100 + 'vh';
        el.style.opacity = 0.10 + Math.random() * 0.18;
        el.style.color = ['#4fd1c5', '#ecc94b', '#f56565', '#805ad5', '#fff', '#2b6cb0', '#af6f6f'][Math.floor(Math.random()*7)];
        const duration = (18 + Math.random() * 32) * speedMultiplier;
        const dir = Math.random() > 0.5 ? 1 : -1;
        el.animate([
            { transform: 'translate(0,0) scale(1)' },
            { transform: `translate(${dir*60}px,${dir*-60}px) scale(${1 + Math.random()*0.2})` },
            { transform: 'translate(0,0) scale(1)' }
        ], {
            duration: duration * 1000,
            iterations: Infinity,
            direction: 'alternate',
            easing: 'ease-in-out',
            delay: Math.random() * 10000
        });
        bg.appendChild(el);
    }
}
