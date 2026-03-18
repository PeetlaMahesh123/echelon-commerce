# Echelon Commerce

A modern e-commerce website built with React, Vite, TypeScript, and Tailwind CSS.

---
## Live Demo Images:
<img width="1923" height="755" alt="Screenshot 2026-03-18 222242" src="https://github.com/user-attachments/assets/dd26dc86-7af6-4482-bdef-70536129ee30" />
<img width="1923" height="827" alt="Screenshot 2026-03-18 222639" src="https://github.com/user-attachments/assets/5b2f353e-9faf-4cb6-a7e0-164b57d0fc79" />
<img width="1923" height="685" alt="Screenshot 2026-03-18 222506" src="https://github.com/user-attachments/assets/472c725a-8001-4151-8207-4e77c095c76e" />
<img width="1923" height="862" alt="Screenshot 2026-03-18 222814" src="https://github.com/user-attachments/assets/1d2ae2bf-de06-40f6-8a64-3c428bbe68ba" />
<img width="1923" height="856" alt="Screenshot 2026-03-18 222824" src="https://github.com/user-attachments/assets/6765ad2a-bd80-49db-a9c1-8179289eb17c" />
<img width="638" height="990" alt="Screenshot 2026-03-18 222857" src="https://github.com/user-attachments/assets/a4ccce1b-1947-4e4e-ac10-b93b4cd2abed" />
<img width="1923" height="860" alt="Screenshot 2026-03-18 223006" src="https://github.com/user-attachments/assets/f912f145-a88b-4286-9d11-6c62f72c66cc" />

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
