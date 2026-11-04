"use client";

import { useState } from "react";
import { mockReceipt } from "@/data/mockReceipt";
import Link from "next/link";

type Person = {
  id: number;
  name: string;
};

type Assignments = {
  [itemIndex: number]: number[];
};

const people: Person[] = [
  { id: 1, name: "Imran" },
  { id: 2, name: "Zach" },
  { id: 3, name: "Niyoo" },
];

export default function AssignItemsPage() {
  const receipt = mockReceipt.receipt;

  const [assignments, setAssignments] = useState<Assignments>({});

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: receipt.transaction_currency,
    }).format(amount);
  }

  function togglePerson(itemIndex: number, personId: number) {
    const currentAssignments = assignments[itemIndex] ?? [];

    const alreadyAssigned = currentAssignments.includes(personId);

    const updatedAssignments = alreadyAssigned
      ? currentAssignments.filter((id) => id !== personId)
      : [...currentAssignments, personId];

    setAssignments({
      ...assignments,
      [itemIndex]: updatedAssignments,
    });
  }

  const assignedItemCount = receipt.line_items.filter(
    (_, index) => (assignments[index]?.length ?? 0) > 0
  ).length;

  const allItemsAssigned =
    assignedItemCount === receipt.line_items.length;

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900">
      <div className="mx-auto max-w-lg">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-zinc-500">
            Moses
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Assign Items
          </h1>

          <p className="mt-2 text-zinc-500">
            Select who had each item.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              Progress
            </span>

            <span className="text-sm text-zinc-500">
              {assignedItemCount} / {receipt.line_items.length} assigned
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-black transition-all"
              style={{
                width: `${
                  (assignedItemCount / receipt.line_items.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Receipt Items */}
        <div className="space-y-4">
          {receipt.line_items.map((item, itemIndex) => {
            const selectedPeople = assignments[itemIndex] ?? [];

            const splitAmount =
              selectedPeople.length > 0
                ? (item.item_price * item.item_quantity) /
                  selectedPeople.length
                : 0;

            return (
              <div
                key={itemIndex}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                {/* Item Info */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">
                      {item.item_name}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Quantity: {item.item_quantity}
                    </p>
                  </div>

                  <span className="font-semibold">
                    {formatCurrency(
                      item.item_price * item.item_quantity
                    )}
                  </span>
                </div>

                {/* People */}
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
                            togglePerson(itemIndex, person.id)
                          }
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                            selected
                              ? "border-black bg-black text-white"
                              : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                          }`}
                        >
                          {selected ? "✓ " : ""}
                          {person.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Shared Amount */}
                {selectedPeople.length > 1 && (
                  <div className="mt-4 rounded-xl bg-zinc-100 px-4 py-3 text-sm">
                    Split between {selectedPeople.length} people
                    <span className="ml-1 font-semibold">
                      — {formatCurrency(splitAmount)} each
                    </span>
                  </div>
                )}

                {/* Single Person */}
                {selectedPeople.length === 1 && (
                  <div className="mt-4 text-sm text-zinc-500">
                    Assigned to{" "}
                    <span className="font-medium text-zinc-900">
                      {
                        people.find(
                          (person) =>
                            person.id === selectedPeople[0]
                        )?.name
                      }
                    </span>
                  </div>
                )}

                {/* Unassigned */}
                {selectedPeople.length === 0 && (
                  <div className="mt-4 text-sm text-amber-600">
                    Not assigned yet
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Continue */}
        {allItemsAssigned ? (
  <Link
    href="/results"
    className="mt-6 block w-full rounded-2xl bg-black px-5 py-4 text-center font-semibold text-white hover:bg-zinc-800"
  >
    View Split →
  </Link>
) : (
  <button
    type="button"
    disabled
    className="mt-6 w-full rounded-2xl bg-black px-5 py-4 font-semibold text-white opacity-40"
  >
    View Split →
  </button>
)}

        {!allItemsAssigned && (
          <p className="mt-3 text-center text-sm text-zinc-500">
            Assign every item before continuing.
          </p>
        )}
      </div>
    </main>
  );
}