"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function AccountButton() {
  const [supabase] = useState(() => createClient());
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setLoggedIn(!!user);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (loggedIn === null) {
    return null;
  }

  return (
    <Link
      href={loggedIn ? "/profile" : "/auth"}
      className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-zinc-100"
    >
      {loggedIn ? "Account" : "Sign In"}
    </Link>
  );
}