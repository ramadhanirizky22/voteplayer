import { LoginForm } from '@/features/auth';

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          VotePlay Next.js Boilerplate
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Production-grade Next.js App Router, TypeScript (Strict), Feature-Based Architecture,
          and Automated CI/CD.
        </p>
      </div>

      <div className="w-full flex justify-center pt-4">
        <LoginForm />
      </div>
    </main>
  );
}
