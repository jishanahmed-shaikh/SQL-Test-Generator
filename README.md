
# 🧠 SQL Query Test Cases Generator

A modern web application that generates natural language questions for SQL testing across different difficulty levels.

---

## ✨ Features

- ⭐ **Multi-level Question Generation**: Basic, Intermediate, and Advanced SQL questions  
- 🔢 **Customizable Quantity**: Generate 1–10 questions at a time  
- 📋 **One-Click Copy**: Copy individual questions or all questions at once  
- 🗑️ **Clear Results**: Reset generated questions with a single click
- 🔐 **Secure API Key Management**: No API keys exposed in code
- 👍 **Feedback System**: Rate questions with thumbs up/down  
- 📈 **Progress Tracking**: Track total generated questions and user feedback  
- 📱 **Responsive Design**: Works on desktop and mobile devices without scrolling
- 🎨 **Modern UI**: Clean, professional interface with smooth animations  
- ⚡ **Powered by Groq API**: Fast and reliable question generation  

---

## 🗂️ Project Structure

```
sql-query-generator/
├── index.html          # Main HTML file
├── styles.css          # CSS styling (compact, no scrolling)
├── script.js           # JavaScript logic
├── config.js           # Configuration file (secure API management)
├── README.md           # Project documentation
└── .github/
    └── workflows/
        └── deploy.yml   # GitHub Actions deployment
```

---

## ⚙️ Setup Instructions

### 📥 Step 1: Clone the Repository

```bash
git clone https://github.com/jishanahmed-shaikh/SQL-TestCases-Generator.git
cd SQL-TestCases-Generator
```

### 🔐 Step 2: Configure GROQ API Key (Secure Method)

#### Option A: User-Friendly Setup (Recommended)
1. **No setup required!** The app will prompt users to enter their API key when they first try to generate questions
2. Users can get a free API key from [https://console.groq.com/](https://console.groq.com/)
3. The API key is stored securely in the user's browser localStorage
4. **No API keys are exposed in the code or GitHub repository**

#### Option B: GitHub Pages with Environment Variables
1. Go to your GitHub repository  
2. Navigate to ⚙️ **Settings** → 🔒 **Secrets and variables** → 🧩 **Actions**  
3. Click **"New repository secret"**  
4. Name: `GROQ_API_KEY`  
5. Value: *Your Groq API key*  
6. The GitHub Actions workflow will automatically use this key during deployment

### 🔑 Getting a GROQ API Key
1. Visit [https://console.groq.com/](https://console.groq.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (you'll enter it in the app when prompted)

### 💻 Step 3: Local Development

#### 🧪 Option A: Direct File Opening
Simply open `index.html` in your browser. The app will work immediately with demo questions, and users can add their API key when needed.

#### 🖥 Option B: Use a local server
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

### 🚀 Step 4: Deploy to GitHub Pages

1. Push your code to GitHub  
2. Go to **Settings → Pages**  
3. **Source**: Deploy from a branch  
4. **Branch**: `gh-pages` (created automatically by GitHub Actions)
5. Your site will be live at:  
   `https://yourusername.github.io/sql-query-generator`  

---

## 🧪 Question Examples

### 🔹 Basic Level

- "What is the total number of customers in the database?"  
- "How many orders were placed last month?"  
- "What is the average order value?"  

### 🔸 Intermediate Level

- "Which customers have placed more than 5 orders in the last year?"  
- "What is the monthly revenue trend for the past 6 months?"  
- "Which products have the highest profit margins?"  

### 🔺 Advanced Level

- "Calculate the customer lifetime value for each customer segment"  
- "Identify the top 10% of customers by revenue contribution and their purchasing patterns"  
- "Create a cohort analysis showing customer retention rates over time"  

---

## 🧑‍💻 Usage Guide

### 1️⃣ Select Difficulty Level  
Choose from Basic, Intermediate, or Advanced based on your needs.

### 2️⃣ Set Question Count  
Use the number input to specify how many questions (1–10).

### 3️⃣ Generate Questions  
Click the **"Generate Questions"** button.

### 4️⃣ API Key Setup (First Time Only)
- If you haven't set up an API key, a modal will appear
- Enter your GROQ API key or choose to use demo questions
- Your key is stored securely in your browser

### 5️⃣ Copy and Use  
- 📎 Copy individual questions  
- 📋 Copy all questions at once  
- 🗑️ Clear results to start fresh
- 🧪 Use them to test your SQL system

### 6️⃣ Provide Feedback  
👍 Thumbs up or 👎 thumbs down to rate questions.

---

## 🔌 API Integration

The application uses the **Groq API** for question generation with secure key management:

### 🔐 Security Features
- ✅ **No API keys in code** - Keys are never committed to GitHub
- ✅ **User-controlled** - Users enter their own API keys
- ✅ **Local storage** - Keys stored securely in user's browser
- ✅ **Environment variables** - Optional GitHub Secrets support
- ✅ **Fallback mode** - Works with demo questions if no API key

### 🔧 Configuration Options

You can customize the API settings in `config.js`:

```javascript
const CONFIG = {
    API_BASE_URL: 'https://api.groq.com/openai/v1/chat/completions',
    MODEL: 'mixtral-8x7b-32768',  // You can change the model
    MAX_TOKENS: 1000,             // Adjust response length
    TEMPERATURE: 0.7              // Adjust creativity (0.0-1.0)
};
```

---

## 🧩 Customization

### ➕ Adding New Question Types

Modify the `prompts` object in `script.js`:

```javascript
const prompts = {
    basic: "Your basic prompt here...",
    intermediate: "Your intermediate prompt here...",
    advanced: "Your advanced prompt here...",
    expert: "Your expert level prompt here..."
};
```

### 🎨 Styling

Modify `styles.css` for:

- 🎨 Color scheme  
- 🧱 Layout (currently optimized for no scrolling)
- ✨ Animations  

### 🧠 Add Features

Examples:

- 💾 Save/export questions  
- 🕓 Question history  
- 🧠 Custom prompt templates  
- 🔗 Integration with other APIs  

---

## 🌐 Browser Compatibility

- ✅ Chrome 90+  
- ✅ Firefox 88+  
- ✅ Safari 14+  
- ✅ Edge 90+  

---

## 🤝 Contributing

1. 🍴 Fork the repo  
2. 🌿 Create a feature branch  
3. 🛠 Make changes  
4. 🧪 Test  
5. 📬 Submit pull request  

---

## 📜 License

**MIT License** – Use, modify, and share freely. 🧑‍🎓

---

## 🛟 Support

For help:

1. 🔄 Check if you're using demo questions (API key not set)
2. 🔑 Verify your GROQ API key is correct
3. 💰 Ensure you have sufficient API credits
4. 🌐 Check your internet connection

### 🚨 Troubleshooting

**"API key not set" modal appears:**
- Enter your GROQ API key in the modal
- Or click "Use Demo Questions" to continue without API

**API errors:**
- Check your API key is valid
- Ensure you have credits in your GROQ account
- Verify the API endpoint is accessible

**Layout issues:**
- The app is now fully responsive and compact
- No vertical or horizontal scrolling required
- Try refreshing the page if you see layout problems

### 🔐 Security Notes

- 🗝 API keys are never stored in the code repository
- 🔒 Keys are stored securely in user's browser localStorage
- 🔐 All API calls use HTTPS
- 🧼 Input validation guards against injection
- 🛡️ Environment variables supported for GitHub deployment
