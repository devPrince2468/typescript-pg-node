# typescript-pg-node

This project serves as a robust starting point for developing Node.js applications using TypeScript and PostgreSQL. It provides a basic setup to quickly get you started with building scalable and maintainable backend services.

## Features

- **TypeScript**: For static typing and improved developer experience.
- **Node.js**: For building fast and scalable server-side applications.
- **PostgreSQL**: As the relational database. (Assumes integration setup is part of the project)
- **ESLint/Prettier**: (Optional, but good to mention if planned) For code linting and formatting.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended, e.g., v18.x or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/download/)
- A code editor, like [VS Code](https://code.visualstudio.com/)

## Getting Started

Follow these steps to set up and run the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/devPrince2468/typescript-pg-node
cd typescript-pg-node
```

### 2. Install Dependencies

Install the project dependencies using npm (or yarn):

```bash
npm install
```

Alternatively, if you use Yarn:

```bash
yarn install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory of the project. This file will store your database connection string and other environment-specific configurations.

If an example file (e.g., `.env.example`) is provided in the repository, you can copy it to create your `.env` file:

```bash
cp .env.example .env
```

Then, open the `.env` file and update it with your actual credentials and settings. At a minimum, you'll likely need to configure your PostgreSQL database connection:

```env
# .env
DATABASE_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_DB_HOST:YOUR_DB_PORT/YOUR_DB_NAME"
PORT=3000 # Example port, adjust if needed

# Add other environment variables as required by the application
```

Ensure your PostgreSQL server is running and accessible with the credentials you provide.

### 4. Build the Project

Compile the TypeScript code into JavaScript. The `tsconfig.json` specifies the output directory as `./build`.

```bash
npm run build
```

This command will transpile your TypeScript files (usually from an `src` directory) into JavaScript files in the `build` directory.

### 5. Run the Application

Once the project is built, you can start the application:

```bash
npm start
```

This command typically executes the main file of your compiled application (e.g., `build/index.js` or `build/server.js`).

For development, there might be a script that uses `ts-node` or `nodemon` to run the TypeScript code directly and watch for changes:

```bash
npm run dev
```

(Check your `package.json` for the specific script names available, as `dev` is a common convention but not guaranteed.)

The application should now be running. You can typically access it at `http://localhost:PORT` (e.g., `http://localhost:3000` if `PORT` is set to 3000 in your `.env` file).
