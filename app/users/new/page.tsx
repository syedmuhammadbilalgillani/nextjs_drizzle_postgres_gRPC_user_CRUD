"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewUserPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    phone_number: "",
    email: "",
    full_name: "",
    profile_image: "",
    user_type: "user",
    is_verified: false,
    password: "",
    is_active: true,
    language_preference: "en",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      router.push("/users");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link
            href="/users"
            className="text-sm font-medium text-stone-500 transition hover:text-stone-700"
          >
            ← Users
          </Link>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-stone-800">
            New user
          </h1>
          <span />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-stone-600">
                Full name *
              </label>
              <input
                id="full_name"
                required
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-800 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
            <div>
              <label htmlFor="phone_number" className="mb-1 block text-sm font-medium text-stone-600">
                Phone number *
              </label>
              <input
                id="phone_number"
                required
                type="tel"
                value={form.phone_number}
                onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-800 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-600">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-800 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-stone-600">
                Password *
              </label>
              <input
                id="password"
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-800 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
            <div>
              <label htmlFor="user_type" className="mb-1 block text-sm font-medium text-stone-600">
                Role
              </label>
              <select
                id="user_type"
                value={form.user_type}
                onChange={(e) => setForm((f) => ({ ...f, user_type: e.target.value }))}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-800 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="language_preference" className="mb-1 block text-sm font-medium text-stone-600">
                Language
              </label>
              <select
                id="language_preference"
                value={form.language_preference}
                onChange={(e) => setForm((f) => ({ ...f, language_preference: e.target.value }))}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-800 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
              >
                <option value="en">English</option>
                <option value="ur">Urdu</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="h-4 w-4 rounded border-stone-300 text-stone-700 focus:ring-stone-400"
              />
              <label htmlFor="is_active" className="text-sm text-stone-600">
                Active
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_verified"
                type="checkbox"
                checked={form.is_verified}
                onChange={(e) => setForm((f) => ({ ...f, is_verified: e.target.checked }))}
                className="h-4 w-4 rounded border-stone-300 text-stone-700 focus:ring-stone-400"
              />
              <label htmlFor="is_verified" className="text-sm text-stone-600">
                Verified
              </label>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create user"}
            </button>
            <Link
              href="/users"
              className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
