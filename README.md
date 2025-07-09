# SQL Query Test Cases Generator

A modern web application that generates natural language questions for SQL testing across different difficulty levels.

## Features

- **Multi-level Question Generation**: Basic, Intermediate, and Advanced SQL questions
- **Customizable Quantity**: Generate 1-10 questions at a time
- **One-Click Copy**: Copy individual questions or all questions at once
- **Feedback System**: Rate questions with thumbs up/down
- **Progress Tracking**: Track total generated questions and user feedback
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations
- **Powered by Groq API**: Fast and reliable question generation

## Project Structure

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

## Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/sql-query-generator.git
cd sql-query-generator
```

### Step 2: Configure Environment Variables

For GitHub Pages deployment, you'll need to set up your Groq API key as a repository secret:

1. Go to your GitHub repository
2. Click on Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `GROQ_API_KEY`
5. Value: Your Groq API key

### Step 3: Local Development

For local development, you can either:

**Option A: Direct API Key (for testing only)**
```javascript
// In script.js, replace this line:
const apiKey = process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE';
// With your actual API key (remember to remove before committing):
const apiKey = 'your-actual-api-key-here';
```

**Option B: Use a local server with environment variables**
```bash
# Install a simple HTTP server
npm install -g http-server

# Set environment variable and start server
export GROQ_API_KEY="your-api-key-here"
http-server -p 8080
```

### Step 4: Deploy to GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Source: Deploy from a branch
4. Branch: `main` or `gh-pages`
5. Your site will be available at `https://yourusername.github.io/sql-query-generator`

## Question Examples

### Basic Level
- "What is the total number of customers in the database?"
- "How many orders were placed last month?"
- "What is the average order value?"

### Intermediate Level
- "Which customers have placed more than 5 orders in the last year?"
- "What is the monthly revenue trend for the past 6 months?"
- "Which products have the highest profit margins?"

### Advanced Level
- "Calculate the customer lifetime value for each customer segment"
- "Identify the top 10% of customers by revenue contribution and their purchasing patterns"
- "Create a cohort analysis showing customer retention rates over time"

## Usage Guide

### Step 1: Select Difficulty Level
Choose from Basic, Intermediate, or Advanced based on your team's needs.

### Step 2: Set Question Count
Use the number input to specify how many questions you want (1-10).

### Step 3: Generate Questions
Click the "Generate Questions" button to create your test cases.

### Step 4: Copy and Use
- Copy individual questions using the copy button
- Copy all questions at once using "Copy All"
- Use the questions to test your SQL query system

### Step 5: Provide Feedback
Rate the quality of generated questions using the thumbs up/down buttons.

## API Integration

The application uses the Groq API for question generation. Make sure you have:

1. A valid Groq API key
2. Sufficient API credits
3. Proper error handling for API failures

## Customization

### Adding New Question Types
Modify the `prompts` object in `script.js`:

```javascript
const prompts = {
    basic: "Your basic prompt here...",
    intermediate: "Your intermediate prompt here...",
    advanced: "Your advanced prompt here...",
    // Add new levels here
    expert: "Your expert level prompt here..."
};
```

### Styling Modifications
All styles are in `styles.css`. Key areas to customize:
- Color scheme: Modify CSS variables
- Layout: Adjust grid and flexbox properties
- Animations: Update transition and transform properties

### Adding New Features
Common extensions:
- Save/export questions to file
- Question history
- Custom prompt templates
- Integration with other APIs

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use and modify as needed.

## Support

For issues or questions:
1. Check the fallback questions if API fails
2. Verify your API key is correctly set
3. Check browser console for errors
4. Ensure you're using HTTPS for API calls

## Troubleshooting

### Common Issues

**API Key Not Working:**
- Verify the key is correctly set in repository secrets
- Check if the key has sufficient credits
- Ensure the key has the correct permissions

**Questions Not Generating:**
- Check browser console for errors
- Verify internet connection
- Try with a smaller number of questions

**Copy Function Not Working:**
- Ensure you're using HTTPS (required for clipboard API)
- Check if clipboard permissions are granted
- Try using a different browser

### Fallback Mode

If the API fails, the application will use pre-defined fallback questions to ensure functionality continues.

## Performance Optimization

- Questions are cached in localStorage
- Lazy loading for better performance
- Optimized CSS animations
- Minimal API calls

## Security Notes

- API keys are handled securely through environment variables
- No sensitive data is stored in localStorage
- All API calls are made over HTTPS
- Input validation prevents injection attacks