# Cloud Prompt Web Application

A Node.js TypeScript application that generates web page content by sending requests to OpenAI's cloud API using a prompt stored in a file, concatenated with the current date.

## Features

- Single web page that displays AI-generated content
- Reads prompt from `prompt.txt` file
- Automatically appends current date to the prompt
- Uses OpenAI API to generate content
- Modern, responsive UI

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API key:**
   - Copy `.env.example` to `.env`
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```

3. **Customize the prompt:**
   - Edit `prompt.txt` to change the prompt that will be sent to the API
   - The current date will be automatically appended to your prompt

## Running the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## How It Works

1. When you visit the web page, the server:
   - Reads the prompt from `prompt.txt`
   - Appends the current date to the prompt
   - Sends the combined prompt to OpenAI API
   - Displays the generated content on the web page

2. You can refresh the page to generate new content (the date will update automatically)

## File Structure

```
.
├── src/
│   └── server.ts          # Main server file
├── prompt.txt             # Prompt template file
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── .env.example           # Environment variables template
└── README.md             # This file
```

## Requirements

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

