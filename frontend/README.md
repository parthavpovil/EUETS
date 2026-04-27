# FuelEU Maritime Penalty Calculator - Frontend

React + TypeScript + Vite frontend for the FuelEU Maritime Penalty Calculator.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Testing Library** - Component testing
- **Jest** - Test runner

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Code Quality

### Linting

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

### Formatting

```bash
npm run format        # Format code
npm run format:check  # Check formatting
```

### Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Project Structure

```
src/
├── api/          # API client and types
├── components/   # React components
├── types/        # TypeScript type definitions
├── utils/        # Utility functions
├── App.tsx       # Root component
└── main.tsx      # Entry point
```

## API Integration

The frontend connects to the backend API at `http://localhost:8000`. The Vite dev server proxies `/api` requests to the backend.

## Environment Variables

Create a `.env.local` file for local configuration:

```
VITE_API_BASE_URL=http://localhost:8000
```
