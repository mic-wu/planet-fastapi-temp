# GitHub Copilot Instructions for Planet Story Explorer

## Project Overview

Planet Story Explorer is an interactive web portal that transforms a static gallery of stories into a living, intelligent, and contextualized atlas of global change. The application provides a dynamic resource that updates daily with AI-generated captions and geospatial context.

## Technical Stack

### Frontend
- **Framework**: React
- **Language**: JavaScript/TypeScript
- Use modern React practices (hooks, functional components)
- Follow React best practices for component structure and state management

### Backend
- **Framework**: FastAPI
- **Language**: Python
- Use Python 3.8+ features
- Follow PEP 8 style guidelines
- Implement async/await patterns for API endpoints
- Use type hints for function signatures

### AI/ML Components
- **Visual Large Language Model (VLLM)**: For image analysis and caption generation
- **Gemini Deep Research**: For contextual enrichment
- Handle AI model responses gracefully with error handling
- Implement retry logic for external API calls

## Coding Standards

### General Guidelines
- Write clean, maintainable, and well-documented code
- Add docstrings for all functions, classes, and modules
- Include type annotations where applicable
- Use meaningful variable and function names

### Frontend (React)
- Component files should be organized by feature
- Use PropTypes or TypeScript interfaces for component props
- Keep components small and focused on a single responsibility
- Extract reusable logic into custom hooks
- Use CSS modules or styled-components for styling

### Backend (Python/FastAPI)
- Organize code into clear modules (routes, models, services, utils)
- Use Pydantic models for request/response validation
- Implement proper error handling with appropriate HTTP status codes
- Write async functions for I/O-bound operations
- Use environment variables for configuration
- Follow RESTful API design principles

### API Design
- Use clear and consistent endpoint naming (e.g., `/api/v1/stories`)
- Return appropriate HTTP status codes
- Include comprehensive error messages in responses
- Implement pagination for list endpoints
- Add API documentation using FastAPI's automatic OpenAPI generation

### Testing
- Write unit tests for business logic
- Write integration tests for API endpoints
- Aim for high test coverage (80%+)
- Use pytest for Python tests
- Use Jest and React Testing Library for frontend tests

### Security
- Never commit API keys, credentials, or secrets
- Use environment variables for sensitive configuration
- Validate and sanitize all user inputs
- Implement rate limiting for API endpoints
- Use HTTPS for all external communications

### Performance
- Optimize database queries to avoid N+1 problems
- Implement caching for frequently accessed data
- Use pagination for large datasets
- Optimize images and assets for web delivery
- Monitor and log performance metrics

## Data Pipeline

The automated content enrichment pipeline:
1. Daily ingests new stories
2. Enriches content with AI-generated captions
3. Adds geospatial context
4. Updates the data store

When working on the pipeline:
- Ensure idempotent operations
- Implement proper logging
- Handle failures gracefully with retry mechanisms
- Monitor data quality

## Team Collaboration

Team members:
- Andrew Zhang
- Michael Wu
- Junjie Liu
- Yixuan Wong
- Shiyuan Wang

When contributing:
- Create feature branches from main
- Write descriptive commit messages
- Keep pull requests focused and small
- Request reviews from team members
- Update documentation with code changes

## Dependencies

- Keep dependencies up to date but test thoroughly before updating
- Document the purpose of new dependencies
- Use virtual environments for Python development
- Lock dependency versions in requirements.txt or package.json

## Documentation

- Update README.md when adding new features
- Document API endpoints thoroughly
- Include setup instructions for new developers
- Add inline comments for complex logic
- Maintain a CHANGELOG for version tracking
