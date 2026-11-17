"use client";

import Link from "next/link";

import { useSplit } from "@/context/SplitContext";

export default function AssignPage() {
  const {
    receipt,
    items,
    people,
    assignments,
    setAssignments,
  } = useSplit();

  function togglePerson(itemIndex: number, personId: number) {
    const currentAssignments = assignments[itemIndex] || [];

    const isAssigned = currentAssignments.includes(personId);

    const updatedAssignments = isAssigned
      ? currentAssignments.filter((id) => id !== personId)
      : [...currentAssignments, personId];

    setAssignments({
      ...assignments,
      [itemIndex]: updatedAssignments,
    });
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: receipt.transaction_currency,
    }).format(amount);
  }

  const assignedCount = items.filter(
    (_, index) => (assignments[index] || []).length > 0
  ).length;

  const allItemsAssigned =
    items.length > 0 && assignedCount === items.length;

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900">
      <div className="mx-auto max-w-lg">
        {/* Back Button */}
        <Link
          href="/people"
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
            Assign Items
          </h1>

          <p className="mt-2 text-zinc-500">
            Select who had each item. Shared items can be assigned to multiple people.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-600">
              Progress
            </span>

            <span className="text-sm font-semibold">
              {assignedCount} / {items.length} assigned
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-black transition-all"
              style={{
                width:
                  items.length === 0
                    ? "0%"
                    : `${(assignedCount / items.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-4">
          {items.map((item, itemIndex) => {
            const selectedPeople = assignments[itemIndex] || [];
            const itemTotal =
              item.item_price * item.item_quantity;

            const splitAmount =
              selectedPeople.length > 0
                ? itemTotal / selectedPeople.length
                : 0;

            return (
              <div
                key={itemIndex}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">
                      {item.item_name}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Quantity: {item.item_quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    {formatCurrency(itemTotal)}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="mb-3 text-sm font-medium text-zinc-600">
                    Who had this?
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {people.map((person) => {
                      const selected =
                        selectedPeople.includes(person.id);

                      return (
                        <button
                          key={person.id}
                          type="button"
                          onClick={() =>
                            togglePerson(
                              itemIndex,
                              person.id
                            )
                          }
                          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            selected
                              ? "bg-black text-white"
                              : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                          }`}
                        >
                          {person.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedPeople.length > 1 && (
                  <div className="mt-4 rounded-xl bg-zinc-100 px-4 py-3">
                    <p className="text-sm text-zinc-600">
                      Split between{" "}
                      <span className="font-semibold text-zinc-900">
                        {selectedPeople.length} people
                      </span>
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {formatCurrency(splitAmount)} each
                    </p>
                  </div>
                )}

                {selectedPeople.length === 0 && (
                  <p className="mt-4 text-sm font-medium text-amber-600">
                    This item still needs to be assigned.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Continue */}
        {allItemsAssigned ? (
          <Link
            href="/results"
            className="mt-8 block w-full rounded-2xl bg-black px-5 py-4 text-center font-semibold text-white hover:bg-zinc-800"
          >
            See Results →
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="mt-8 w-full cursor-not-allowed rounded-2xl bg-zinc-300 px-5 py-4 font-semibold text-zinc-500"
          >
            Assign every item to continue
          </button>
        )}
      </div>
    </main>
  );
}