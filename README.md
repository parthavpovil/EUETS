# FuelEU Maritime Penalty Calculator

A web application that calculates greenhouse gas (GHG) compliance penalties for maritime vessels under EU Regulation 2023/1805 (FuelEU Maritime).

## Project Overview

The FuelEU Maritime Penalty Calculator implements the exact regulatory formulas from EU Regulation 2023/1805 to calculate:

- **GHG Intensity Metrics**: Well-to-Tank (WtT), Tank-to-Wheel (TtW), and Well-to-Wheel (WtW) emissions
- **Compliance Status**: Surplus or Deficit against regulatory targets
- **FuelEU Maritime Penalties**: Financial penalties for non-compliance
- **EU ETS Comparison**: Comparison with EU Emissions Trading System costs

## Architecture

The application consists of two main components:

### Backend (Python/FastAPI)
- Pure functional calculation engine implementing the 11-step regulatory algorithm
- REST API for calculation requests
- Property-based testing with Hypothesis
- Type-safe with Pydantic models

### Frontend (React/TypeScript)
- Single-page application for data input and results visualization
- Tailwind CSS for styling
- Vite for fast development and optimized builds
- Comprehensive testing with Jest and React Testing Library

## Project Structure

```
.
├── backend/                 # Python/FastAPI backend
│   ├── src/
│   │   ├── constants/      # Fuel catalog and regulatory constants
│   │   ├── validators/     # Input validation
│   │   ├── parsers/        # Fuel name resolution
│   │   ├── engine/         # Calculation engine (pure function)
│   │   └── api/            # FastAPI REST endpoints
│   ├── tests/              # Backend tests
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend documentation
│
├── frontend/               # React/TypeScript frontend
│   ├── src/
│   │   ├── api/           # API client and types
│   │   ├── components/    # React components
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── package.json       # Node.js dependencies
│   └── README.md          # Frontend documentation
│
└── .kiro/                 # Kiro spec files
    └── specs/
        └── fueleu-maritime-calculator/
            ├── requirements.md
            ├── design.md
            └── tasks.md
```

## Getting Started

### Prerequisites

- **Python 3.11+** for backend
- **Node.js 18+** and npm for frontend

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (already installed)
pip install -r requirements.txt

# Run tests
pytest

# Start development server
uvicorn src.api.main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`.

### Frontend Setup

```bash
cd frontend

# Install dependencies (already installed)
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Development Workflow

### Backend Development

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=src --cov-report=html

# Format code
black src/ tests/

# Lint code
flake8 src/ tests/
mypy src/
```

### Frontend Development

```bash
# Run development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

## Technology Stack

### Backend
- **Python 3.11+**: Core language
- **FastAPI**: Web framework
- **Pydantic**: Data validation and settings
- **Hypothesis**: Property-based testing
- **pytest**: Test framework
- **black, flake8, mypy**: Code quality tools

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Axios**: HTTP client
- **Jest**: Test runner
- **React Testing Library**: Component testing
- **ESLint & Prettier**: Code quality tools

## Key Features

- ✅ **Regulatory Compliance**: Implements exact formulas from EU Regulation 2023/1805
- ✅ **Type Safety**: Full TypeScript frontend and Pydantic backend
- ✅ **Pure Functional Core**: Stateless calculation engine with no side effects
- ✅ **Comprehensive Testing**: Unit tests, property-based tests, and integration tests
- ✅ **Modern Stack**: React 18, FastAPI, Vite for optimal developer experience
- ✅ **Clean Architecture**: Clear separation of concerns between calculation, validation, and UI

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Testing

### Backend Tests
```bash
cd backend
pytest                          # Run all tests
pytest --cov=src               # Run with coverage
pytest tests/properties/       # Run property-based tests only
```

### Frontend Tests
```bash
cd frontend
npm test                       # Run all tests
npm run test:watch            # Watch mode
npm run test:coverage         # Coverage report
```

## Contributing

This project follows the FuelEU Maritime specification located in `.kiro/specs/fueleu-maritime-calculator/`.

## License

This project implements EU Regulation 2023/1805 (FuelEU Maritime) for educational and compliance purposes.

## Status

✅ **Task 1 Complete**: Project structure and development environment fully set up
- Backend directory structure created
- Frontend directory structure created
- Python virtual environment configured with all dependencies
- Node.js project configured with all dependencies
- Linting and formatting tools configured for both backend and frontend
- `.gitignore` files created for both projects

**Next Steps**: Implement the fuel catalog and constants module (Task 2)
# EUETS
