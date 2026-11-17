"use client";

import Link from "next/link";

export type PaymentProfile = {
  full_name: string;
  venmo_username: string | null;
  zelle_contact: string | null;
  preferred_payment_method: "venmo" | "zelle" | "either";
};

type Props = {
  profile: PaymentProfile | null;
  loggedIn: boolean;
  loading: boolean;
};

export default function PaymentDetailsCard({
  profile,
  loggedIn,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-zinc-500">
          Loading payment details...
        </p>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">
          Get paid
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Sign in to attach your Venmo or Zelle information to this split.
        </p>

        <Link
          href="/auth"
          className="mt-4 inline-block text-sm font-semibold underline"
        >
          Sign in →
        </Link>
      </div>
    );
  }

  if (
    !profile?.venmo_username &&
    !profile?.zelle_contact
  ) {
    return (
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">
          Payment Details
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Add Venmo or Zelle so everyone knows how to pay you.
        </p>

        <Link
          href="/profile"
          className="mt-4 inline-block text-sm font-semibold underline"
        >
          Add payment info →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-zinc-500">
        Pay
      </p>

      <h2 className="mt-1 text-lg font-semibold">
        {profile.full_name || "Receipt owner"}
      </h2>

      <div className="mt-4 space-y-3">
        {profile.venmo_username && (
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500">
              Venmo
            </span>

            <span className="font-semibold">
              {profile.venmo_username}
            </span>
          </div>
        )}

        {profile.zelle_contact && (
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500">
              Zelle
            </span>

            <span className="font-semibold">
              {profile.zelle_contact}
            </span>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        Preferred:{" "}
        {profile.preferred_payment_method === "either"
          ? "Venmo or Zelle"
          : profile.preferred_payment_method === "venmo"
            ? "Venmo"
            : "Zelle"}
      </p>
    </div>
  );
}