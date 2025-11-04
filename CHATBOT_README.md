# Chatbot Feature Documentation

## Overview

The Planet Story Explorer now includes an AI-powered chatbot assistant that appears in the bottom-right corner of the website. The chatbot is built using FastMCP (Model Context Protocol) on the backend and React/Next.js on the frontend.

## Features

The chatbot can help users with:

1. **Application Information** - Learn about features and capabilities
2. **Navigation Help** - Get guidance on using different sections (login, gallery, dashboard)
3. **Current Time** - Ask for the server time
4. **Calculations** - Perform simple mathematical operations
5. **General Assistance** - Get help with common questions

## Architecture

### Backend (FastAPI + FastMCP)

- **Location**: `fastapi_backend/app/`
- **Files**:
  - `mcp_server.py` - FastMCP server with tools/resources
  - `routes/chatbot.py` - API endpoints for chat functionality
  - `main.py` - Main app with chatbot router included

#### Available MCP Tools:

1. `get_current_time()` - Returns current server time
2. `get_app_info()` - Returns application information
3. `search_help(topic)` - Searches for help on specific topics
4. `calculate(expression)` - Evaluates mathematical expressions

#### API Endpoints:

- `POST /chatbot/chat` - Send a message and get a response
- `GET /chatbot/tools` - List all available MCP tools
- `GET /chatbot/health` - Health check endpoint

### Frontend (Next.js + React)

- **Location**: `nextjs-frontend/components/ui/chatbot.tsx`
- **Features**:
  - Floating chat button in bottom-right corner
  - Expandable chat window (96x500px)
  - Message history with timestamps
  - Loading indicators
  - Responsive design
  - Keyboard support (Enter to send)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd PlanetStoryExplorer/fastapi_backend
   ```

2. Install dependencies using pip:
   ```bash
   pip install fastmcp fastapi-pagination fastapi fastapi-users[sqlalchemy] fastapi-mail asyncpg pydantic-settings
   ```

3. Start the backend server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```

   The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd PlanetStoryExplorer/nextjs-frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

   The frontend will be available at `http://localhost:3000`

## Usage

1. Open the application in your browser at `http://localhost:3000`
2. Look for the blue chat button in the bottom-right corner
3. Click the button to open the chat window
4. Type your message and press Enter or click the send button

### Example Queries:

- "What is this app about?"
- "Help with login"
- "What time is it?"
- "Calculate 15 * 8"
- "How do I use the gallery?"

## Customization

### Adding New MCP Tools

Edit `fastapi_backend/app/mcp_server.py`:

```python
@mcp.tool()
def your_new_tool(param: str) -> str:
    """Description of your tool."""
    # Your logic here
    return "result"
```

### Modifying Chat Intent Detection

Edit `fastapi_backend/app/routes/chatbot.py` to add new intents in the `chat()` function.

### Styling the Chatbot

Edit `nextjs-frontend/components/ui/chatbot.tsx` to customize colors, sizes, or behavior.

## Environment Configuration

### Backend

The chatbot uses the existing CORS settings from `app/config.py`. Make sure your frontend URL is included in `CORS_ORIGINS`.

### Frontend

By default, the chatbot connects to `http://localhost:8000`. To change this, pass the `apiUrl` prop:

```tsx
<Chatbot apiUrl="https://your-api-url.com" />
```

## API Request/Response Format

### Chat Request:
```json
{
  "message": "What is this app?",
  "context": {}
}
```

### Chat Response:
```json
{
  "response": "Planet Story Explorer is an application for exploring satellite imagery and stories",
  "tool_used": "get_app_info",
  "metadata": {
    "name": "Planet Story Explorer",
    "version": "0.0.6"
  }
}
```

## Troubleshooting

### Chatbot not connecting

1. Verify backend is running on port 8000
2. Check CORS settings in backend
3. Check browser console for errors
4. Verify the API URL in the Chatbot component

### MCP tools not working

1. Ensure fastmcp is installed: `uv sync`
2. Check backend logs for errors
3. Test endpoints directly: `curl http://localhost:8000/chatbot/health`

## Future Enhancements

Potential improvements:
- Integration with user authentication
- Persistent chat history
- More sophisticated NLP for intent detection
- Integration with database for personalized responses
- Multi-language support
- Voice input/output
- File upload support
- Integration with satellite imagery queries

## Testing

### Backend Tests

Create tests in `fastapi_backend/tests/`:

```bash
pytest tests/test_chatbot.py
```

### Frontend Tests

Create tests in `nextjs-frontend/__tests__/`:

```bash
npm test
```

## License

Same as the main project.
