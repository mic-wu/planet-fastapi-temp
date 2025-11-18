"""Chatbot API routes using FastMCP."""

from fastapi import APIRouter, HTTPException
from app.schemas import ChatRequest, ChatResponse
from app.mcp_server import (
    get_current_time_impl,
    get_app_info_impl,
    search_help_impl,
    calculate_impl
)

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Process a chat message and return a response.

    This endpoint processes user messages and uses FastMCP tools to provide
    intelligent responses.
    """
    user_message = request.message.lower().strip()

    # Simple intent detection and tool routing
    try:
        # Check for time-related queries
        if any(keyword in user_message for keyword in ["time", "clock", "what time"]):
            result = get_current_time_impl()
            return ChatResponse(
                response=f"The current time is: {result}",
                tool_used="get_current_time"
            )

        # Check for app info queries
        elif any(keyword in user_message for keyword in ["app info", "about", "features", "what is this"]):
            result = get_app_info_impl()
            features = "\n".join([f"- {feature}" for feature in result["features"]])
            response_text = f"{result['description']}\n\nFeatures:\n{features}"
            return ChatResponse(
                response=response_text,
                tool_used="get_app_info",
                metadata=result
            )

        # Check for help queries
        elif any(keyword in user_message for keyword in ["help", "how to", "how do i"]):
            # Extract topic from message
            topic = user_message
            for prefix in ["help with", "help on", "how to", "how do i"]:
                if prefix in topic:
                    topic = topic.split(prefix)[-1].strip()
                    break

            result = search_help_impl(topic)
            return ChatResponse(
                response=result,
                tool_used="search_help"
            )

        # Check for calculation queries
        elif any(keyword in user_message for keyword in ["calculate", "compute", "="]) or \
                any(op in user_message for op in ["+", "-", "*", "/"]):
            # Extract the mathematical expression
            expression = user_message
            for prefix in ["calculate", "compute", "what is"]:
                if prefix in expression:
                    expression = expression.replace(prefix, "").strip()
            expression = expression.replace("=", "").replace("?", "").strip()

            result = calculate_impl(expression)
            return ChatResponse(
                response=result,
                tool_used="calculate"
            )

        # Default greeting and general responses
        elif any(keyword in user_message for keyword in ["hello", "hi", "hey"]):
            return ChatResponse(
                response="Hello! I'm the Planet Story Explorer assistant. I can help you with information about the app, navigation, and answer your questions. What would you like to know?"
            )

        elif any(keyword in user_message for keyword in ["thanks", "thank you"]):
            return ChatResponse(
                response="You're welcome! Feel free to ask if you need anything else."
            )

        else:
            # Default response with suggestions
            return ChatResponse(
                response="I'm here to help! You can ask me about:\n"
                        "- App features and information\n"
                        "- How to use different sections (login, gallery, dashboard)\n"
                        "- The current time\n"
                        "- Simple calculations\n\n"
                        "What would you like to know?"
            )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat message: {str(e)}"
        )


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint for the chatbot service."""
    return {"status": "healthy", "service": "chatbot"}
