// Application State
let currentLevel = null;
let totalGenerated = 0;
let feedbackCounts = { good: 0, bad: 0 };

// DOM Elements
const levelButtons = document.querySelectorAll('.level-btn');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const testCaseCount = document.getElementById('testCaseCount');
const questionsContainer = document.getElementById('questionsContainer');
const loadingOverlay = document.getElementById('loadingOverlay');
const goodFeedback = document.getElementById('goodFeedback');
const badFeedback = document.getElementById('badFeedback');
const goodCount = document.getElementById('goodCount');
const badCount = document.getElementById('badCount');
const totalGeneratedSpan = document.getElementById('totalGenerated');
const copyAllBtn = document.getElementById('copyAllBtn');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load saved data from localStorage
    loadSavedData();
    
    // Add event listeners
    levelButtons.forEach(btn => {
        btn.addEventListener('click', () => selectLevel(btn.dataset.level));
    });
    
    generateBtn.addEventListener('click', generateQuestions);
    clearBtn.addEventListener('click', clearResults);
    goodFeedback.addEventListener('click', () => provideFeedback('good'));
    badFeedback.addEventListener('click', () => provideFeedback('bad'));
    copyAllBtn.addEventListener('click', copyAllQuestions);
    
    // Update UI
    updateUI();
}

function selectLevel(level) {
    currentLevel = level;
    
    // Update button states
    levelButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.level === level) {
            btn.classList.add('active');
        }
    });
    
    // Enable generate button
    generateBtn.disabled = false;
}

async function generateQuestions() {
    if (!currentLevel) {
        alert('Please select a difficulty level first!');
        return;
    }
    
    const count = parseInt(testCaseCount.value);
    if (count < 1 || count > 10) {
        alert('Please select between 1 and 10 test cases!');
        return;
    }
    
    showLoading(true);
    generateBtn.disabled = true;
    
    try {
        const questions = await generateQuestionsWithAPI();
        displayQuestions(questions);
        totalGenerated += questions.length;
        updateUI();
        saveData();
    } catch (error) {
        console.error('Error generating questions:', error);
        alert('Error generating questions. Please check your API key and try again.');
    } finally {
        showLoading(false);
        generateBtn.disabled = false;
    }
}

function clearResults() {
    questionsContainer.innerHTML = `
        <div class="placeholder">
            <i class="fas fa-lightbulb"></i>
            <p>Select a level and click Generate to see questions</p>
        </div>
    `;
    copyAllBtn.style.display = 'none';
    
    // Show feedback
    const event = new CustomEvent('show-toast', {
        detail: { message: 'Results cleared!', type: 'success' }
    });
    document.dispatchEvent(event);
}

async function callGroqAPI(level, count) {
    const apiKey = getApiKey();
    
    if (!apiKey) {
        // Show API key setup modal
        showApiKeyModal();
        throw new Error('API key not set');
    }
    
    const prompts = {
        basic: `Generate ${count} basic SQL natural language questions for testing. These should be simple queries like counting, basic filtering, or simple aggregations. Focus on common business scenarios like customers, orders, products, sales, etc. Return only the questions, one per line.`,
        intermediate: `Generate ${count} intermediate SQL natural language questions for testing. These should involve JOINs, GROUP BY, subqueries, and more complex filtering. Include scenarios with multiple tables and conditional logic. Return only the questions, one per line.`,
        advanced: `Generate ${count} advanced SQL natural language questions for testing. These should involve complex JOINs, window functions, CTEs, nested subqueries, and advanced analytics. Include time-series analysis, ranking, and complex business logic. Return only the questions, one per line.`
    };
    
    const response = await fetch(CONFIG.API_BASE_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: CONFIG.MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are a SQL expert who creates natural language questions that would typically be converted to SQL queries. Focus on real business scenarios and practical use cases.'
                },
                {
                    role: 'user',
                    content: prompts[level]
                }
            ],
            max_tokens: CONFIG.MAX_TOKENS,
            temperature: CONFIG.TEMPERATURE
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const questionsText = data.choices[0].message.content;
    
    // Parse questions from response
    const questions = questionsText
        .split('\n')
        .filter(q => q.trim())
        .map(q => q.replace(/^\d+\.\s*/, '').trim())
        .filter(q => q.length > 0);
    
    return questions;
}

function displayQuestions(questions) {
    questionsContainer.innerHTML = '';
    
    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
            <div class="question-number">Question ${index + 1} (${currentLevel.toUpperCase()})</div>
            <div class="question-text">${question}</div>
            <button class="copy-btn" onclick="copyQuestion('${question.replace(/'/g, "\\'")}')">
                <i class="fas fa-copy"></i> Copy
            </button>
        `;
        questionsContainer.appendChild(questionDiv);
    });
    
    copyAllBtn.style.display = questions.length > 0 ? 'block' : 'none';
}

function copyQuestion(question) {
    navigator.clipboard.writeText(question).then(() => {
        // Show temporary feedback
        const event = new CustomEvent('show-toast', {
            detail: { message: 'Question copied!', type: 'success' }
        });
        document.dispatchEvent(event);
    });
}

function copyAllQuestions() {
    const questions = Array.from(document.querySelectorAll('.question-text'))
        .map(el => el.textContent)
        .join('\n\n');
    
    navigator.clipboard.writeText(questions).then(() => {
        const event = new CustomEvent('show-toast', {
            detail: { message: 'All questions copied!', type: 'success' }
        });
        document.dispatchEvent(event);
    });
}

function provideFeedback(type) {
    feedbackCounts[type]++;
    updateUI();
    saveData();
    
    // Show feedback animation
    const button = type === 'good' ? goodFeedback : badFeedback;
    button.style.transform = 'scale(1.1)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
}

function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

function updateUI() {
    goodCount.textContent = feedbackCounts.good;
    badCount.textContent = feedbackCounts.bad;
    totalGeneratedSpan.textContent = totalGenerated;
}

function saveData() {
    const data = {
        totalGenerated,
        feedbackCounts,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('sqlGeneratorData', JSON.stringify(data));
}

function loadSavedData() {
    const saved = localStorage.getItem('sqlGeneratorData');
    if (saved) {
        const data = JSON.parse(saved);
        totalGenerated = data.totalGenerated || 0;
        feedbackCounts = data.feedbackCounts || { good: 0, bad: 0 };
    }
}

// Toast notification system
document.addEventListener('show-toast', function(event) {
    const { message, type } = event.detail;
    showToast(message, type);
});

function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Add toast styles
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#48bb78' : '#667eea',
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
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Fallback questions for demo/testing purposes
const fallbackQuestions = {
    basic: [
        "What is the total number of customers in the database?",
        "How many orders were placed last month?",
        "What is the average order value?",
        "List all products that are currently out of stock",
        "How many employees work in the sales department?"
    ],
    intermediate: [
        "Which customers have placed more than 5 orders in the last year?",
        "What is the monthly revenue trend for the past 6 months?",
        "Which products have the highest profit margins?",
        "How many customers have not placed any orders in the last 3 months?",
        "What is the average time between order placement and shipment?"
    ],
    advanced: [
        "Calculate the customer lifetime value for each customer segment",
        "Identify the top 10% of customers by revenue contribution and their purchasing patterns",
        "Analyze the correlation between product categories and seasonal sales trends",
        "Create a cohort analysis showing customer retention rates over time",
        "Determine the optimal inventory levels based on demand forecasting"
    ]
};

// API Key management - Get from secure storage
function getApiKey() {
    // Use the secure API key management from config.js
    return window.getApiKey ? window.getApiKey() : null;
}

// API Key Modal Functions
function showApiKeyModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('apiKeyModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'apiKeyModal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h3><i class="fas fa-key"></i> Setup GROQ API Key</h3>
                <p>To generate real questions, you need a GROQ API key. Get one for free at <a href="https://console.groq.com/" target="_blank">console.groq.com</a></p>
                <div class="api-key-input">
                    <input type="password" id="apiKeyInput" placeholder="Enter your GROQ API key">
                    <button id="saveApiKey" class="save-btn">
                        <i class="fas fa-save"></i> Save Key
                    </button>
                </div>
                <div class="modal-buttons">
                    <button id="useDemo" class="demo-btn">
                        <i class="fas fa-play"></i> Use Demo Questions
                    </button>
                    <button id="closeModal" class="close-btn">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('saveApiKey').addEventListener('click', saveApiKey);
    document.getElementById('useDemo').addEventListener('click', useDemoQuestions);
    document.getElementById('closeModal').addEventListener('click', closeApiKeyModal);
    document.getElementById('apiKeyInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveApiKey();
        }
    });
    
    // Focus on input
    document.getElementById('apiKeyInput').focus();
}

function saveApiKey() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    if (apiKey) {
        if (window.setApiKey && window.setApiKey(apiKey)) {
            closeApiKeyModal();
            const event = new CustomEvent('show-toast', {
                detail: { message: 'API key saved successfully!', type: 'success' }
            });
            document.dispatchEvent(event);
            // Retry generating questions
            setTimeout(() => generateQuestions(), 500);
        } else {
            const event = new CustomEvent('show-toast', {
                detail: { message: 'Failed to save API key', type: 'error' }
            });
            document.dispatchEvent(event);
        }
    } else {
        const event = new CustomEvent('show-toast', {
            detail: { message: 'Please enter a valid API key', type: 'error' }
        });
        document.dispatchEvent(event);
    }
}

function useDemoQuestions() {
    closeApiKeyModal();
    const event = new CustomEvent('show-toast', {
        detail: { message: 'Using demo questions', type: 'info' }
    });
    document.dispatchEvent(event);
    
    // Generate demo questions
    const questions = fallbackQuestions[currentLevel];
    const count = parseInt(testCaseCount.value);
    const demoQuestions = questions.slice(0, count);
    displayQuestions(demoQuestions);
    totalGenerated += demoQuestions.length;
    updateUI();
    saveData();
}

function closeApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    if (modal) {
        modal.remove();
    }
}

// Use API with fallback to hardcoded questions
async function generateQuestionsWithAPI() {
    try {
        return await callGroqAPI(currentLevel, parseInt(testCaseCount.value));
    } catch (error) {
        console.log('Using fallback questions due to API error:', error.message);
        
        if (error.message === 'API key not set') {
            return; // Modal is already shown
        }
        
        // Show error message to user
        const event = new CustomEvent('show-toast', {
            detail: { message: 'API error. Using demo questions.', type: 'info' }
        });
        document.dispatchEvent(event);
        
        // Return fallback questions
        const questions = fallbackQuestions[currentLevel];
        const count = parseInt(testCaseCount.value);
        return questions.slice(0, count);
    }
}