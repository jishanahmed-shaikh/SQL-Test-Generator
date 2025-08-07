# 🗄️ SQL Test Cases Generator

A powerful web application that generates natural language SQL test questions using AI, with global statistics tracking and fallback predefined questions.

## ✨ Features

- 🤖 **AI-Powered Generation**: Uses Groq API to generate contextual SQL questions
- 📊 **Three Difficulty Levels**: Basic, Intermediate, and Advanced questions
- 📁 **Schema Upload**: Upload CSV/JSON files for context-aware question generation
- 🔄 **Smart Fallback**: 60+ predefined questions when AI is unavailable
- 🌍 **Global Statistics**: Real-time tracking across all users worldwide
- 👍 **Feedback System**: Rate questions with thumbs up/down
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- 🔒 **Secure**: API keys protected on server-side
- ⚡ **Fast**: Deployed on Vercel with global CDN

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone <your-repo-url>
cd sql-testcases-generator

# Install Vercel CLI
npm install -g vercel

# Set up environment variable
echo "GROQ_API_KEY=your_api_key_here" > .env

# Start development server
vercel dev
```

### Production Deployment
```bash
# Deploy to Vercel
vercel --prod

# Set environment variable in Vercel dashboard
# GROQ_API_KEY = your_api_key_here
```

## 📋 How to Use

1. **Select Difficulty**: Choose Basic, Intermediate, or Advanced
2. **Upload Schema** (Optional): Upload CSV/JSON for context
3. **Set Quantity**: Choose 1-10 questions
4. **Generate**: Click generate to create questions
5. **Copy & Use**: Copy individual questions or all at once
6. **Provide Feedback**: Rate the quality with thumbs up/down

## 🏗️ Architecture

### Frontend
- **Pure JavaScript**: No frameworks, fast loading
- **Responsive CSS**: Modern, clean interface
- **Local Storage**: Persistent user identification

### Backend (Vercel Serverless)
- **API Proxy**: Secure Groq API integration
- **Global Stats**: File-based statistics storage
- **CORS Enabled**: Cross-origin request support

### Features
- **Smart Fallback**: 20 questions per difficulty level
- **Global Tracking**: Real-time user statistics
- **Admin Controls**: Passcode-protected stats clearing

## 📊 Question Categories

### Basic (20 questions)
- Simple SELECT queries
- Basic filtering and counting
- Single table operations

### Intermediate (20 questions)
- JOINs and GROUP BY
- Subqueries and aggregations
- Multi-table scenarios

### Advanced (20 questions)
- Window functions and CTEs
- Complex analytics
- Performance optimization scenarios

## 🔧 Configuration

### Environment Variables
```bash
GROQ_API_KEY=your_groq_api_key_here
```

### API Endpoints
- `GET /api/stats` - Get global statistics
- `POST /api/stats` - Update statistics
- `POST /api/groq` - Groq API proxy

## 📈 Global Statistics

The app tracks:
- **Total Questions Generated** across all users
- **Positive Feedback** (thumbs up)
- **Negative Feedback** (thumbs down)
- **Total Users** who have used the app

## 🔒 Security

- ✅ API keys never exposed to frontend
- ✅ Serverless functions for secure API calls
- ✅ User privacy with anonymous IDs
- ✅ Admin controls with passcode protection

## 🌐 Live Demo

After deployment, your app will be available at:
`https://your-app-name.vercel.app`

## 📝 License

MIT License - feel free to use and modify!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ using Groq AI, Vercel, and modern web technologies**