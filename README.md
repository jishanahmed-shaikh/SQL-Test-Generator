
# 🧠 SQL Query Test Cases Generator

A modern web application that generates natural language questions for SQL testing across different difficulty levels.

---

## ✨ Features

- ⭐ **Multi-level Question Generation**: Basic, Intermediate, and Advanced SQL questions  
- 🔢 **Customizable Quantity**: Generate 1–10 questions at a time  
- 📋 **One-Click Copy**: Copy individual questions or all questions at once  
- 👍 **Feedback System**: Rate questions with thumbs up/down  
- 📈 **Progress Tracking**: Track total generated questions and user feedback  
- 📱 **Responsive Design**: Works on desktop and mobile devices  
- 🎨 **Modern UI**: Clean, professional interface with smooth animations  
- ⚡ **Powered by Groq API**: Fast and reliable question generation  

---

## 🗂️ Project Structure

```
sql-query-generator/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript logic
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

### 🔐 Step 2: Configure Environment Variables

1. Go to your GitHub repository  
2. Navigate to ⚙️ **Settings** → 🔒 **Secrets and variables** → 🧩 **Actions**  
3. Click **“New repository secret”**  
4. Name: `GROQ_API_KEY`  
5. Value: *Your Groq API key*  

### 💻 Step 3: Local Development

#### 🧪 Option A: Direct API Key (for testing only)

```javascript
// In script.js, replace this line:
const apiKey = process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE';
// With your actual API key (remember to remove before committing):
const apiKey = 'your-actual-api-key-here';
```

#### 🖥 Option B: Use a local server with environment variables

```bash
npm install -g http-server
export GROQ_API_KEY="your-api-key-here"
http-server -p 8080
```

### 🚀 Step 4: Deploy to GitHub Pages

1. Push your code to GitHub  
2. Go to **Settings → Pages**  
3. **Source**: Deploy from a branch  
4. **Branch**: `main` or `gh-pages`  
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
Click the **“Generate Questions”** button.

### 4️⃣ Copy and Use  
- 📎 Copy individual questions  
- 📋 Copy all questions at once  
- 🧪 Use them to test your SQL system

### 5️⃣ Provide Feedback  
👍 Thumbs up or 👎 thumbs down to rate questions.

---

## 🔌 API Integration

The application uses the **Groq API** for question generation.  
Ensure:

1. ✅ Valid Groq API key  
2. 💰 Sufficient API credits  
3. 🛡 Proper error handling  

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
- 🧱 Layout  
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

1. 🔄 Check fallback questions  
2. 🔐 Verify API key in GitHub Secrets  
3. 🧰 Check browser console for errors  
4. 🔗 Ensure you're using HTTPS  

---

## 🧯 Troubleshooting

### ❌ API Key Not Working?
- Confirm key is correctly set in Secrets  
- Check for remaining credits  
- Make sure permissions are correct  

### ❓ Questions Not Generating?
- Look at browser console  
- Check internet connection  
- Try fewer questions  

### 📋 Copy Issues?
- Make sure you're on HTTPS  
- Allow clipboard access  
- Try a different browser  

### 🆘 Fallback Mode  
If API fails, fallback questions ensure continued functionality.

---

## 🚀 Performance Optimization

- 💾 Caches questions in `localStorage`  
- 🐢 Lazy loading  
- 🌀 Optimized animations  
- 🚫 Minimal API calls  

---

## 🔐 Security Notes

- 🗝 API keys are injected securely via GitHub Secrets  
- 🔒 No sensitive data stored in `localStorage`  
- 🔐 All API calls use HTTPS  
- 🧼 Input validation guards against injection
