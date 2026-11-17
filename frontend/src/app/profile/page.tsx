"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [venmoUsername, setVenmoUsername] = useState("");
  const [zelleContact, setZelleContact] = useState("");

  const [preferredPayment, setPreferredPayment] = useState<
    "venmo" | "zelle" | "either"
  >("venmo");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth");
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "full_name, venmo_username, zelle_contact, preferred_payment_method"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
      }

      setFullName(
        data?.full_name ??
          user.user_metadata?.full_name ??
          ""
      );

      setVenmoUsername(
        data?.venmo_username ?? ""
      );

      setZelleContact(
        data?.zelle_contact ?? ""
      );

      setPreferredPayment(
        data?.preferred_payment_method ?? "venmo"
      );

      setLoading(false);
    }

    loadProfile();
  }, [router, supabase]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/auth");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName.trim(),
        venmo_username:
          venmoUsername.trim() || null,
        zelle_contact:
          zelleContact.trim() || null,
        preferred_payment_method:
          preferredPayment,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile saved!");
    }

    setSaving(false);
  }

  async function logout() {
    await supabase.auth.signOut();

    router.push("/auth");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-500">
          Loading profile...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900">
      <div className="mx-auto max-w-lg">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-500 hover:text-black"
        >
          ← Back
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium text-zinc-500">
            Moses
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Your Profile
          </h1>

          <p className="mt-2 text-zinc-500">
            Save how your friends should pay you.
          </p>
        </div>

        <form
          onSubmit={saveProfile}
          className="mt-8 space-y-5 rounded-3xl bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>

            <input
              disabled
              value={email}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-zinc-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Name
            </label>

            <input
              required
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Venmo username
            </label>

            <input
              value={venmoUsername}
              onChange={(event) =>
                setVenmoUsername(
                  event.target.value
                )
              }
              placeholder="@imran"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Zelle email or phone
            </label>

            <input
              value={zelleContact}
              onChange={(event) =>
                setZelleContact(
                  event.target.value
                )
              }
              placeholder="email@example.com"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Preferred payment method
            </label>

            <select
              value={preferredPayment}
              onChange={(event) =>
                setPreferredPayment(
                  event.target.value as
                    | "venmo"
                    | "zelle"
                    | "either"
                )
              }
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
            >
              <option value="venmo">
                Venmo
              </option>

              <option value="zelle">
                Zelle
              </option>

              <option value="either">
                Either
              </option>
            </select>
          </div>

          {message && (
            <div className="rounded-xl bg-zinc-100 px-4 py-3 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-black px-5 py-4 font-semibold text-white hover:bg-zinc-800 disabled:bg-zinc-400"
          >
            {saving
              ? "Saving..."
              : "Save Profile"}
          </button>
        </form>

        <button
          type="button"
          onClick={logout}
          className="mt-4 w-full rounded-2xl border border-red-200 bg-white px-5 py-4 font-semibold text-red-600 hover:bg-red-50"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}