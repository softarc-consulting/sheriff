# Module Boundaries in Next.js

This project demonstrates how Sheriff enforces module boundaries in a Next.js application:

- Through editor intellisense, you'll get immediate feedback if you try to import from a restricted module
- Running `pnpm lint` will catch any violations of the module boundaries defined below

This is a [Next.js](https://nextjs.org) project bootstrapped with [`pnpm dlx create-next-app@latest`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) with the following settings:

```
✔ What is your project named? `nextjs-i`
✔ Would you like to use TypeScript? - Yes
✔ Would you like to use ESLint? - Yes
✔ Would you like to use Tailwind CSS? - Yes
✔ Would you like your code inside a `src/` directory? - No
✔ Would you like to use App Router? (recommended) - Yes
✔ Would you like to use Turbopack for `next dev`? - Yes
✔ Would you like to customize the import alias (`@/*` by default)? - No
```

## Example modules

1. `app` directory contains Next.js App Router pages and layouts
2. Feature modules like `shell` encapsulate business logic
3. Both `app` and feature modules can import from `shared/ui` (including `IconLink` component, etc.)
4. `app` focuses on page composition, importing from `shell` and `shared`
5. `shell` can also import UI components from `shared/ui`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
