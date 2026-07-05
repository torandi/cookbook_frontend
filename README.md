Cookbook frontend

## Technologies
* React
* Next.js
* Material UI (Mui) for ui components
* Tailwind css for css classes
* zustand for complex state management

## Getting Started

Install pnpm, and run

```
pnpm install
```

Then run the following to start the development server

```
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Config
Create .env to setup configuration, see config.ts for available environment variables

## Structure / Code overview

Using the "app router" version of next.js, see
https://nextjs.org/docs/15/app/getting-started/project-structure

layout.ts is the root layout and main entrypoint. Wraps all other pages


