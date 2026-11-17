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
    if (!allItemsAssigned) {
      router.replace("/assign");
    }
  }, [allItemsAssigned, router]);

  function formatReceiptCurrency(amount: number) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: receipt.transaction_currency,
    }).format(amount);
  }

  function formatUSD(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  const itemsSubtotal = items.reduce(
    (sum, item) =>
      sum + item.item_price * item.item_quantity,
    0
  );

  const adjustment =
    receipt.total_amount - itemsSubtotal;

  const results = people.map((person) => {
    const personItems: {
      name: string;
      amount: number;
    }[] = [];

    items.forEach((item, itemIndex) => {
      const assignedPeople =
        assignments[itemIndex] || [];

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

    const baseTotal = personItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const proportion =
      itemsSubtotal > 0
        ? baseTotal / itemsSubtotal
        : 0;

    const adjustmentShare =
      adjustment * proportion;

    const finalTotal =
      baseTotal + adjustmentShare;

    return {
      ...person,
      items: personItems,
      baseTotal,
      adjustmentShare,
      finalTotal,
    };
  });

  const finalReceiptTotal = results.reduce(
    (sum, person) => sum + person.finalTotal,
    0
  );

  function createShareText() {
    let text = `Moses Split — ${receipt.merchant_name}\n\n`;

    results.forEach((person) => {
      text += `${person.name}: ${formatReceiptCurrency(
        person.finalTotal
      )} (${formatUSD(
        person.finalTotal * GBP_TO_USD_RATE
      )})\n`;

      person.items.forEach((item) => {
        text += `  • ${item.name}: ${formatReceiptCurrency(
          item.amount
        )}\n`;
      });

      if (Math.abs(adjustment) > 0.009) {
        text += `  • ${
          adjustment >= 0
            ? "Fees / service charge"
            : "Discount / adjustment"
        }: ${
          person.adjustmentShare >= 0 ? "+" : ""
        }${formatReceiptCurrency(
          person.adjustmentShare
        )}\n`;
      }

      text += "\n";
    });

    text += `Total: ${formatReceiptCurrency(
      finalReceiptTotal
    )}\n`;

    text += `Exchange rate: £1 = $${GBP_TO_USD_RATE.toFixed(
      2
    )}`;

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

  if (!allItemsAssigned) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-500">
          Redirecting...
        </p>
      </main>
    );
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

        {/* Receipt Summary */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">
            Receipt
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            {receipt.merchant_name}
          </h2>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">
                Items subtotal
              </span>

              <span className="font-medium">
                {formatReceiptCurrency(itemsSubtotal)}
              </span>
            </div>

            {Math.abs(adjustment) > 0.009 && (
              <div className="flex justify-between">
                <span className="text-zinc-500">
                  {adjustment >= 0
                    ? "Fees / service charge"
                    : "Discount / adjustment"}
                </span>

                <span className="font-medium">
                  {adjustment >= 0 ? "+" : ""}
                  {formatReceiptCurrency(adjustment)}
                </span>
              </div>
            )}

            <div className="flex justify-between border-t border-zinc-200 pt-2">
              <span className="font-semibold">
                Receipt total
              </span>

              <span className="font-semibold">
                {formatReceiptCurrency(
                  receipt.total_amount
                )}
              </span>
            </div>
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
                    {formatReceiptCurrency(
                      person.finalTotal
                    )}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    {formatUSD(
                      person.finalTotal *
                        GBP_TO_USD_RATE
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-100 pt-4">
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
                        {formatReceiptCurrency(
                          item.amount
                        )}
                      </span>
                    </div>
                  ))}

                  {Math.abs(adjustment) > 0.009 && (
                    <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-2 text-sm">
                      <span className="text-zinc-500">
                        {adjustment >= 0
                          ? "Fees / service charge"
                          : "Discount / adjustment"}
                      </span>

                      <span className="font-medium">
                        {person.adjustmentShare >= 0
                          ? "+"
                          : ""}
                        {formatReceiptCurrency(
                          person.adjustmentShare
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final Total */}
        <div className="mt-6 rounded-2xl bg-black p-5 text-white">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">
              Receipt Total
            </span>

            <div className="text-right">
              <p className="text-2xl font-bold">
                {formatReceiptCurrency(
                  finalReceiptTotal
                )}
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                {formatUSD(
                  finalReceiptTotal *
                    GBP_TO_USD_RATE
                )}
              </p>
            </div>
          </div>

          {Math.abs(adjustment) > 0.009 && (
            <p className="mt-4 text-xs text-zinc-400">
              Fees are split proportionally based on
              each person&apos;s share of the items.
            </p>
          )}

          <p className="mt-2 text-xs text-zinc-400">
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