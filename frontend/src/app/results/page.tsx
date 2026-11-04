"use client";

import { mockReceipt } from "@/data/mockReceipt";

type PersonResult = {
  name: string;
  items: {
    name: string;
    amount: number;
  }[];
};

export default function ResultsPage() {
  const receipt = mockReceipt.receipt;

  // Temporary sample results.
  // Later this will come from the real Assign Items screen.
  const results: PersonResult[] = [
    {
      name: "Imran",
      items: [
        {
          name: "Garlic Naan (1/2)",
          amount: 4.2,
        },
        {
          name: "Mango Lassi",
          amount: 5.5,
        },
      ],
    },
    {
      name: "Zach",
      items: [
        {
          name: "Chicken Ruby",
          amount: 15.5,
        },
        {
          name: "Garlic Naan (1/2)",
          amount: 4.2,
        },
      ],
    },
    {
      name: "Niyoo",
      items: [
        {
          name: "House Chai",
          amount: 3.2,
        },
      ],
    },
  ];

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: receipt.transaction_currency,
    }).format(amount);
  }

  function getPersonTotal(person: PersonResult) {
    return person.items.reduce(
      (total, item) => total + item.amount,
      0
    );
  }

  const calculatedTotal = results.reduce(
    (total, person) => total + getPersonTotal(person),
    0
  );

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900">
      <div className="mx-auto max-w-lg">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-black text-2xl text-white">
            ✓
          </div>

          <p className="text-sm font-medium text-zinc-500">
            Moses
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            All Split!
          </h1>

          <p className="mt-2 text-zinc-500">
            Here&apos;s what everyone owes.
          </p>
        </div>

        {/* Bill Summary */}
        <div className="mb-6 rounded-2xl bg-black p-6 text-white">
          <p className="text-sm text-zinc-300">
            {receipt.merchant_name}
          </p>

          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-sm text-zinc-400">
                Total
              </p>

              <p className="text-3xl font-bold">
                {formatCurrency(calculatedTotal)}
              </p>
            </div>

            <p className="text-sm text-zinc-300">
              {results.length} people
            </p>
          </div>
        </div>

        {/* Individual Results */}
        <div className="space-y-4">
          {results.map((person) => {
            const total = getPersonTotal(person);

            return (
              <div
                key={person.name}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 font-semibold text-white">
                      {person.name.charAt(0)}
                    </div>

                    <h2 className="text-lg font-semibold">
                      {person.name}
                    </h2>
                  </div>

                  <p className="text-xl font-bold">
                    {formatCurrency(total)}
                  </p>
                </div>

                <div className="mt-4 border-t border-zinc-100 pt-4">
                  <div className="space-y-2">
                    {person.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-zinc-600">
                          {item.name}
                        </span>

                        <span className="font-medium">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Share */}
        <button
          type="button"
          className="mt-6 w-full rounded-2xl bg-black px-5 py-4 font-semibold text-white hover:bg-zinc-800"
        >
          Share Breakdown
        </button>

        <button
          type="button"
          className="mt-3 w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 font-semibold hover:bg-zinc-100"
        >
          Start New Split
        </button>

      </div>
    </main>
  );
}