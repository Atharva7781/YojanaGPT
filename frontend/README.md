# Government Scheme Recommender Frontend

A responsive web application that helps users discover government schemes they're eligible for based on their profile and search query.

## Features

- Search for government schemes using natural language queries
- Filter results based on user profile (state, district, gender, income, occupation)
- View detailed scheme information including eligibility criteria
- Responsive design that works on desktop and mobile devices
- Accessible UI with keyboard navigation and screen reader support

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher) or yarn
- Backend API server running at `http://127.0.0.1:8080`

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   The application will be available at [http://localhost:5173](http://localhost:5173)

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── api/               # API client and service functions
├── components/        # Reusable UI components
├── styles/           # Global styles and Tailwind configuration
├── types/            # TypeScript type definitions
└── utils/            # Utility functions and helpers
```

## Technologies Used

- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type checking
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React Icons](https://react-icons.github.io/react-icons/) - Icon library

## Development

### Linting

```bash
npm run lint
# or
yarn lint
```

### Formatting

This project uses Prettier for code formatting. You can format your code using:

```bash
npx prettier --write .
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
