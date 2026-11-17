"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSplit } from "@/context/SplitContext";

const GBP_TO_USD_RATE = 1.35;

export default function ResultsPage() {
  const router = useRouter();

  const {
    receipt,
    items,
    people,
    assignments,
    resetSplit,
  } = useSplit();

  const [shareStatus, setShareStatus] = useState("");
  
  const allItemsAssigned =
  items.length > 0 &&
  items.every(
    (_, index) => (assignments[index] || []).length > 0
  );

useEffect(() => {
  if (people.length === 0) {
    router.replace("/people");
    return;
  }

  if (!allItemsAssigned) {
    router.replace("/assign");
  }
}, [allItemsAssigned, people.length, router]);

if (people.length === 0 || !allItemsAssigned) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50">
      <p className="text-zinc-500">Redirecting...</p>
    </main>
  );
}

  function formatGBP(amount: number) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  }

  function formatUSD(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  const results = people.map((person) => {
    const personItems: {
      name: string;
      amount: number;
    }[] = [];

    items.forEach((item, itemIndex) => {
      const assignedPeople = assignments[itemIndex] || [];

      if (!assignedPeople.includes(person.id)) {
        return;
      }

      const itemTotal =
        item.item_price * item.item_quantity;

      const splitAmount =
        itemTotal / assignedPeople.length;

      personItems.push({
        name:
          assignedPeople.length > 1
            ? `${item.item_name} (1/${assignedPeople.length})`
            : item.item_name,
        amount: splitAmount,
      });
    });

    const total = personItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    return {
      ...person,
      items: personItems,
      total,
    };
  });

  const receiptTotal = results.reduce(
    (sum, person) => sum + person.total,
    0
  );

  function createShareText() {
    let text = `Moses Split — ${receipt.merchant_name}\n\n`;

    results.forEach((person) => {
      text += `${person.name}: ${formatGBP(person.total)} (${formatUSD(
        person.total * GBP_TO_USD_RATE
      )})\n`;

      person.items.forEach((item) => {
        text += `  • ${item.name}: ${formatGBP(item.amount)}\n`;
      });

      text += "\n";
    });

    text += `Total: ${formatGBP(receiptTotal)}\n`;
    text += `Exchange rate: £1 = $${GBP_TO_USD_RATE.toFixed(2)}`;

    return text;
  }

  async function shareBreakdown() {
    const text = createShareText();

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Moses Split",
          text,
        });

        setShareStatus("Shared!");
      } else {
        await navigator.clipboard.writeText(text);
        setShareStatus("Copied!");
      }

      setTimeout(() => {
        setShareStatus("");
      }, 2000);
    } catch {
      setShareStatus("");
    }
  }

  function startNewSplit() {
    resetSplit();
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900">
      <div className="mx-auto max-w-lg">
        {/* Back Button */}
        <Link
          href="/assign"
          className="mb-5 inline-flex items-center text-sm font-medium text-zinc-500 hover:text-black"
        >
          ← Back
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-zinc-500">
            Moses
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Split Results
          </h1>

          <p className="mt-2 text-zinc-500">
            Here&apos;s what everyone owes.
          </p>
        </div>

        {/* Merchant */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">
            Receipt
          </p>

          <div className="mt-1 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {receipt.merchant_name}
            </h2>

            <span className="font-semibold">
              {formatGBP(receiptTotal)}
            </span>
          </div>
        </div>

        {/* Person Results */}
        <div className="space-y-4">
          {results.map((person) => (
            <div
              key={person.id}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {person.name}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    {person.items.length}{" "}
                    {person.items.length === 1
                      ? "item"
                      : "items"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold">
                    {formatGBP(person.total)}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    {formatUSD(
                      person.total * GBP_TO_USD_RATE
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-100 pt-4">
                {person.items.length > 0 ? (
                  <div className="space-y-2">
                    {person.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <span className="text-zinc-600">
                          {item.name}
                        </span>

                        <span className="font-medium">
                          {formatGBP(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    No items assigned.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-6 rounded-2xl bg-black p-5 text-white">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">
              Receipt Total
            </span>

            <div className="text-right">
              <p className="text-2xl font-bold">
                {formatGBP(receiptTotal)}
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                {formatUSD(
                  receiptTotal * GBP_TO_USD_RATE
                )}
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs text-zinc-400">
            Demo exchange rate: £1 = $
            {GBP_TO_USD_RATE.toFixed(2)}
          </p>
        </div>

        {/* Share */}
        <button
          type="button"
          onClick={shareBreakdown}
          className="mt-6 w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 font-semibold hover:bg-zinc-100"
        >
          {shareStatus || "Share Breakdown"}
        </button>

        {/* New Split */}
        <button
          type="button"
          onClick={startNewSplit}
          className="mt-3 w-full rounded-2xl bg-black px-5 py-4 font-semibold text-white hover:bg-zinc-800"
        >
          Start New Split
        </button>
      </div>
    </main>
  );
}