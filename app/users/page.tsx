"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id: number;
  phone_number: string;
  email: string;
  full_name: string;
  user_type: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const pageSize = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      const res = await fetch(`/api/users?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? res.statusText);
      }
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this user?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed");
      }
      await fetchUsers();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-sm font-medium text-stone-500 transition hover:text-stone-700"
          >
            ← Home
          </Link>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-stone-800">
            Users
          </h1>
          <Link
            href="/users/new"
            className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            New user
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <form
          onSubmit={handleSearchSubmit}
          className="mb-4 flex gap-2"
        >
          <input
            type="search"
            placeholder="Search by name, email, or phone…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-stone-800 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
          <button
            type="submit"
            className="rounded-lg bg-stone-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-600"
          >
            Search
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
                setPage(1);
              }}
              className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
            >
              Clear
            </button>
          )}
        </form>

        {error && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-stone-200 bg-white p-12 text-center text-stone-500">
            Loading…
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
            <p className="text-stone-500">
              {searchQuery ? "No users match your search." : "No users yet."}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setPage(1);
                }}
                className="mt-3 text-sm font-medium text-stone-700 underline hover:no-underline"
              >
                Clear search
              </button>
            ) : (
              <Link
                href="/users/new"
                className="mt-3 inline-block text-sm font-medium text-stone-700 underline hover:no-underline"
              >
                Create the first user
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80">
                  <th className="px-4 py-3 font-medium text-stone-600">Name</th>
                  <th className="px-4 py-3 font-medium text-stone-600">Phone</th>
                  <th className="px-4 py-3 font-medium text-stone-600">Email</th>
                  <th className="px-4 py-3 font-medium text-stone-600">Role</th>
                  <th className="px-4 py-3 font-medium text-stone-600">Status</th>
                  <th className="px-4 py-3 font-medium text-stone-600">Created</th>
                  <th className="w-28 px-4 py-3 font-medium text-stone-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-stone-100 transition hover:bg-stone-50/50"
                  >
                    <td className="px-4 py-3 font-medium text-stone-800">{u.full_name}</td>
                    <td className="px-4 py-3 text-stone-600">{u.phone_number}</td>
                    <td className="px-4 py-3 text-stone-600">{u.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.user_type === "admin"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {u.user_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.is_active ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/users/${u.id}/edit`}
                          className="text-stone-600 underline hover:text-stone-800"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id)}
                          disabled={deletingId === u.id}
                          className="text-red-600 underline hover:text-red-700 disabled:opacity-50"
                        >
                          {deletingId === u.id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-stone-200 px-4 py-3">
                <p className="text-xs text-stone-500">
                  {total} user{total !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded border border-stone-200 px-3 py-1 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-2 text-sm text-stone-600">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded border border-stone-200 px-3 py-1 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
