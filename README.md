# Echelon Commerce

A modern e-commerce website built with React, Vite, TypeScript, and Tailwind CSS.

---
## Live Demo Images:
<img width="1923" height="755" alt="image" src="https://github.com/user-attachments/assets/d8fa9948-fb90-4da6-bf88-55148d36c74a" />
<img width="1923" height="827" alt="image" src="https://github.com/user-attachments/assets/69ee266b-bbd2-439c-af9b-bb1c0c2839c5" />
<img width="1923" height="685" alt="image" src="https://github.com/user-attachments/assets/41c3b48b-5f02-4d28-b5a8-c7a3d990ce6b" />


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
