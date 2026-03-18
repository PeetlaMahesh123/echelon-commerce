# Echelon Commerce

A modern e-commerce website built with React, Vite, TypeScript, and Tailwind CSS.

---
## Live Demo Images:
<img width="1923" height="755" alt="Screenshot 2026-03-18 222242" src="https://github.com/user-attachments/assets/dd26dc86-7af6-4482-bdef-70536129ee30" />



## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase
- **State Management**: React Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd echelon-commerce

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── context/       # React context providers
└── assets/        # Static assets
```

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

Build the project for production:

```bash
npm run build
```

The build files will be in the `dist` directory, ready for deployment.
