import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <main className="mx-auto flex max-w-2xl flex-col items-center justify-center px-6 py-24">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-800">
          Next.js + gRPC + Drizzle
        </h1>
        <p className="mt-3 text-stone-600">
          User CRUD via gRPC with a REST bridge and Postgres.
        </p>
        <Link
          href="/users"
          className="mt-8 rounded-lg bg-stone-800 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
        >
          Open Users
        </Link>
      </main>
    </div>
  );
}
