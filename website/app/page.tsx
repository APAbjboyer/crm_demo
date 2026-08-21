import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center gap-8 px-6 py-24 sm:px-16">
        <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium tracking-wide text-zinc-600 dark:border-white/15 dark:text-zinc-400">
          Consulting Hub
        </span>

        <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50">
          Payroll compliance backup, for payroll and HR professionals
        </h1>

        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Ask a specific compliance or audit question and get a straight answer &mdash;
          built for people who already know payroll and just need a second set of
          eyes, not a training course.
        </p>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            href="/signup"
          >
            Sign up
          </Link>
          <Link
            className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-6 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            href="/login"
          >
            Sign in
          </Link>
        </div>

        <div className="mt-8 grid w-full gap-6 border-t border-black/10 pt-8 dark:border-white/10 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-black dark:text-zinc-50">
              Compliance &amp; audits
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Ask about a specific award, Fair Work obligation, STP requirement,
              or super calculation and work through it in a running conversation.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-black dark:text-zinc-50">
              Built for professionals
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              For in-house payroll teams and peer consultants who want specialist
              backup on a specific case, not general payroll education.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
