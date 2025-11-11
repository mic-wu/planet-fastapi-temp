"""FastMCP server for chatbot functionality."""

from fastmcp import FastMCP
from datetime import datetime
from typing import Any

# Initialize FastMCP server
mcp = FastMCP("Planet Story Explorer Chatbot")


# Define the actual functions first (without decorators)
def get_current_time_impl() -> str:
    """Get the current server time."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def get_app_info_impl() -> dict[str, Any]:
    """Get information about the Planet Story Explorer application."""
    return {
        "name": "Planet Story Explorer",
        "description": "An application for exploring satellite imagery and stories",
        "version": "0.0.6",
        "features": [
            "User authentication and management",
            "Gallery of satellite images",
            "Story exploration",
            "Interactive dashboard"
        ]
    }


def search_help_impl(topic: str) -> str:
    """
    Search for help on a specific topic.

    Args:
        topic: The topic to search for help on
    """
    help_topics = {
        "login": "To log in, click on the 'Login' button in the navigation bar and enter your credentials.",
        "register": "To create an account, click on 'Register' and fill in your details including email and password.",
        "gallery": "The gallery shows satellite imagery. You can browse through different images and view details.",
        "dashboard": "The dashboard provides an overview of your account and recent activities.",
        "navigation": "Use the navigation bar at the top to access different sections of the application."
    }

    topic_lower = topic.lower()
    for key, value in help_topics.items():
        if key in topic_lower:
            return value

    return f"I don't have specific help for '{topic}'. Please try asking about: login, register, gallery, dashboard, or navigation."


def calculate_impl(expression: str) -> str:
    """
    Safely calculate a mathematical expression.

    Args:
        expression: A mathematical expression to evaluate (e.g., "2 + 2", "10 * 5")
    """
    try:
        # Only allow basic math operations for safety
        allowed_chars = set("0123456789+-*/(). ")
        if not all(c in allowed_chars for c in expression):
            return "Error: Only basic mathematical operations are allowed (+, -, *, /, parentheses)"

        result = eval(expression, {"__builtins__": {}}, {})
        return f"Result: {result}"
    except Exception as e:
        return f"Error calculating expression: {str(e)}"


# Now register them with MCP (for MCP protocol usage)
@mcp.tool()
def get_current_time() -> str:
    """Get the current server time."""
    return get_current_time_impl()


@mcp.tool()
def get_app_info() -> dict[str, Any]:
    """Get information about the Planet Story Explorer application."""
    return get_app_info_impl()


@mcp.tool()
def search_help(topic: str) -> str:
    """Search for help on a specific topic."""
    return search_help_impl(topic)


@mcp.tool()
def calculate(expression: str) -> str:
    """Safely calculate a mathematical expression."""
    return calculate_impl(expression)


@mcp.resource("app://info")
def get_app_resource() -> str:
    """Resource containing application information."""
    return """
    Planet Story Explorer

    This application allows users to:
    - View satellite imagery from various missions
    - Explore stories related to locations
    - Manage their account and preferences
    - Access a personalized dashboard

    For help with specific features, ask the chatbot!
    """


# Export the implementation functions for direct use
__all__ = ['mcp', 'get_current_time_impl', 'get_app_info_impl', 'search_help_impl', 'calculate_impl']
