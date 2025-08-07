console.log('Script loaded!');

// Global variables for Firebase
let app, auth, db;
let userId = 'anonymous'; // Default until authenticated
let globalStatsRef; // Firestore document reference for global stats

// --- Firebase Initialization and Authentication ---
document.addEventListener('DOMContentLoaded', async function() {
    // Check if Firebase is available (loaded from index.html)
    if (typeof window.firebase === 'undefined') {
        console.error("Firebase SDK not loaded. Please check index.html.");
        return;
    }

    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    if (!firebaseConfig) {
        console.error("Firebase config not found. Cannot initialize Firebase.");
        return;
    }

    // Initialize Firebase App
    app = window.firebase.initializeApp(firebaseConfig);
    db = window.firebase.getFirestore(app);
    auth = window.firebase.getAuth(app);

    // Define the global stats document reference
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    globalStatsRef = window.firebase.doc(db, `artifacts/${appId}/public/data/sqlGeneratorStats`, 'global');

    // Authenticate user
    try {
        if (initialAuthToken) {
            await window.firebase.signInWithCustomToken(auth, initialAuthToken);
        } else {
            await window.firebase.signInAnonymously(auth);
        }
    } catch (error) {
        console.error("Firebase Authentication failed:", error);
    }

    // Listen for auth state changes to get the user ID
    window.firebase.onAuthStateChanged(auth, (user) => {
        if (user) {
            userId = user.uid;
            document.getElementById('userIdDisplay').textContent = userId;
            console.log("Firebase User ID:", userId);
            // Once authenticated, start listening to global stats
            listenToGlobalStats();
        } else {
            userId = 'anonymous';
            document.getElementById('userIdDisplay').textContent = 'Not Authenticated';
            console.log("No Firebase user is signed in.");
        }
    });

    // --- Main App Initialization (rest of the existing DOMContentLoaded logic) ---
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

    // --- Firebase Global Stats Listener ---
    function listenToGlobalStats() {
        if (!globalStatsRef) {
            console.error("Global stats reference not initialized.");
            return;
        }
        window.firebase.onSnapshot(globalStatsRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                totalGeneratedSpan.textContent = data.totalGenerated || 0;
                globalGoodCountSpan.textContent = data.goodFeedback || 0;
                globalBadCountSpan.textContent = data.badFeedback || 0;
            } else {
                // Document doesn't exist, create it with initial values
                window.firebase.setDoc(globalStatsRef, {
                    totalGenerated: 0,
                    goodFeedback: 0,
                    badFeedback: 0
                }, { merge: true }).catch(e => console.error("Error creating global stats doc:", e));
            }
        }, (error) => {
            console.error("Error listening to global stats:", error);
        });
    }

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
        const realPass = '1072025'; // Correct password
        passcodeModal.style.display = 'none';

        if (code === realPass) {
            console.log('Correct password entered. Clearing global stats...');
            try {
                await window.firebase.setDoc(globalStatsRef, {
                    totalGenerated: 0,
                    goodFeedback: 0,
                    badFeedback: 0
                });
                const event = new CustomEvent('show-toast', {
                    detail: { message: 'All global stats cleared!', type: 'success' }
                });
                document.dispatchEvent(event);
            } catch (error) {
                console.error("Error clearing global stats:", error);
                const event = new CustomEvent('show-toast', {
                    detail: { message: 'Failed to clear stats. Try again.', type: 'error' }
                });
                document.dispatchEvent(event);
            }
        } else {
            console.log('Wrong password entered');
            if (clearStatsBtn) {
                clearStatsBtn.classList.add('break');
                setTimeout(() => {
                    clearStatsBtn.remove();
                    console.log('Button removed after wrong password');
                }, 700);
            }
            const event = new CustomEvent('show-toast', {
                detail: { message: 'Incorrect passcode.', type: 'error' }
            });
            document.dispatchEvent(event);
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

    // --- Call Groq API (modified to include schema) ---
    async function callGroqAPI(level, count, schemaContext = '') {
        let basePrompt;
        if (schemaContext) {
            basePrompt = `Generate ${count} SQL natural language questions for testing, based on the following schema/data:\n\n${schemaContext}\n\n`;
        } else {
            basePrompt = `Generate ${count} SQL natural language questions for testing.`;
        }

        const prompts = {
            basic: `${basePrompt} These should be simple queries like counting, basic filtering, or simple aggregations. Focus on common business scenarios like customers, orders, products, sales, etc.`,
            intermediate: `${basePrompt} These should involve JOINs, GROUP BY, subqueries, and more complex filtering. Include scenarios with multiple tables and conditional logic.`,
            advanced: `${basePrompt} These should involve complex JOINs, window functions, CTEs, nested subqueries, and advanced analytics. Include time-series analysis, ranking, and complex business logic.`
        };

        const finalPrompt = `${prompts[level]}\nIMPORTANT: Output ONLY the questions, one per line, with no explanations, no commentary, no reasoning, no preamble, and no numbering. Start your response immediately with the first question.`;

        const payload = {
            model: CONFIG.MODEL,
            messages: [
                { role: 'user', content: finalPrompt }
            ],
            temperature: CONFIG.TEMPERATURE,
            max_tokens: CONFIG.MAX_TOKENS,
            top_p: CONFIG.TOP_P,
            stream: false,
            reasoning_effort: CONFIG.REASONING_EFFORT,
            stop: null
        };

        const response = await fetch(CONFIG.API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
            throw new Error("Invalid API response structure.");
        }

        const questionsText = data.choices[0].message.content;
        let questions = questionsText
            .split('\n')
            .map(q => q.trim())
            .filter(q => q.match(/^(How|What|Which|List|Show|Find|Give|Who|Where|When|Identify|Calculate|Determine|Display|Name|Count|Retrieve|Select|Provide|Return)\b/i));

        // Always return exactly 'count' questions
        if (questions.length < count) {
            for (let i = questions.length; i < count; i++) {
                questions.push('(No more questions generated by AI)');
            }
        } else if (questions.length > count) {
            questions = questions.slice(0, count);
        }
        return questions;
    }

    // --- Generate questions with retry and friendly message ---
    async function generateQuestionsWithRetry(level, count, schemaContext) {
        let questions = await callGroqAPI(level, count, schemaContext);
        if (!questions || questions.filter(q => q && q.trim() && !q.includes('No more questions generated')).length === 0) {
            // Retry once
            questions = await callGroqAPI(level, count, schemaContext);
        }
        if (!questions || questions.filter(q => q && q.trim() && !q.includes('No more questions generated')).length === 0) {
            return ["Sorry, couldn't generate questions at this time. Please try again later."];
        }
        return questions;
    }

    // --- Level selection ---
    levelButtons.forEach(btn => {
        btn.addEventListener('click', () => selectLevel(btn.dataset.level));
    });

    function selectLevel(level) {
        currentLevel = level;
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
        if (!currentLevel) {
            const event = new CustomEvent('show-toast', {
                detail: { message: 'Please select a difficulty level first!', type: 'error' }
            });
            document.dispatchEvent(event);
            return;
        }
        const count = parseInt(testCaseCount.value);
        if (count < 1 || count > 10) {
            const event = new CustomEvent('show-toast', {
                detail: { message: 'Please select between 1 and 10 test cases!', type: 'error' }
            });
            document.dispatchEvent(event);
            return;
        }
        showLoading(true);
        generateBtn.disabled = true;
        feedbackClickedForCurrentGeneration = false; // Reset feedback state for new generation
        goodFeedback.disabled = false;
        badFeedback.disabled = false;

        try {
            const questions = await generateQuestionsWithRetry(currentLevel, count, uploadedSchema);
            displayQuestions(questions);
            // Update global total generated count in Firestore
            await window.firebase.updateDoc(globalStatsRef, {
                totalGenerated: window.firebase.doc(db, `artifacts/${appId}/public/data/sqlGeneratorStats`, 'global').totalGenerated + questions.length // This line needs to be fixed. It should increment the existing value.
            });
            // Correct way to increment:
            await window.firebase.updateDoc(globalStatsRef, {
                totalGenerated: window.firebase.getFirestore(app).FieldValue.increment(questions.length)
            });


        } catch (error) {
            console.error('Error generating questions:', error);
            const event = new CustomEvent('show-toast', {
                detail: { message: 'Error generating questions. Please try again.', type: 'error' }
            });
            document.dispatchEvent(event);
        } finally {
            showLoading(false);
            generateBtn.disabled = false;
        }
    });

    // --- Display questions ---
    function displayQuestions(questions) {
        questionsContainer.innerHTML = '';
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
        if (!feedbackClickedForCurrentGeneration) {
            try {
                await window.firebase.updateDoc(globalStatsRef, {
                    goodFeedback: window.firebase.getFirestore(app).FieldValue.increment(1)
                });
                feedbackClickedForCurrentGeneration = true;
                goodFeedback.disabled = true;
                badFeedback.disabled = true;
                const event = new CustomEvent('show-toast', {
                    detail: { message: 'Thank you for your feedback!', type: 'success' }
                });
                document.dispatchEvent(event);
            } catch (error) {
                console.error("Error updating good feedback:", error);
                const event = new CustomEvent('show-toast', {
                    detail: { message: 'Failed to submit feedback. Try again.', type: 'error' }
                });
                document.dispatchEvent(event);
            }
        }
    });

    badFeedback.addEventListener('click', async function() {
        if (!feedbackClickedForCurrentGeneration) {
            try {
                await window.firebase.updateDoc(globalStatsRef, {
                    badFeedback: window.firebase.getFirestore(app).FieldValue.increment(1)
                });
                feedbackClickedForCurrentGeneration = true;
                goodFeedback.disabled = true;
                badFeedback.disabled = true;
                const event = new CustomEvent('show-toast', {
                    detail: { message: 'Thank you for your feedback!', type: 'success' }
                });
                document.dispatchEvent(event);
            } catch (error) {
                console.error("Error updating bad feedback:", error);
                const event = new CustomEvent('show-toast', {
                    detail: { message: 'Failed to submit feedback. Try again.', type: 'error' }
                });
                document.dispatchEvent(event);
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
