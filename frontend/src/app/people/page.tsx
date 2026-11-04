"use client";

import { useState } from "react";
import Link from "next/link";

type Person = {
  id: number;
  name: string;
};

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([
    { id: 1, name: "Imran" },
  ]);

  const [name, setName] = useState("");

  function addPerson() {
    const trimmedName = name.trim();

    if (!trimmedName) return;

    setPeople([
      ...people,
      {
        id: Date.now(),
        name: trimmedName,
      },
    ]);

    setName("");
  }

  function removePerson(id: number) {
    setPeople(people.filter((person) => person.id !== id));
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-zinc-500">
            Moses
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Who&apos;s splitting?
          </h1>

          <p className="mt-2 text-zinc-500">
            Add everyone who is part of this bill.
          </p>
        </div>

        {/* People */}
        <div className="space-y-3">
          {people.map((person) => (
            <div
              key={person.id}
              className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black font-semibold text-white">
                  {person.name.charAt(0).toUpperCase()}
                </div>

                <span className="font-medium">
                  {person.name}
                </span>
              </div>

              <button
                type="button"
                onClick={() => removePerson(person.id)}
                className="text-sm font-medium text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Add Person */}
        <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-zinc-600">
            Add a person
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  addPerson();
                }
              }}
              placeholder="Enter a name"
              className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-black"
            />

            <button
              type="button"
              onClick={addPerson}
              className="rounded-xl bg-black px-4 py-2 font-medium text-white hover:bg-zinc-800"
            >
              Add
            </button>
          </div>
        </div>

        {/* Count */}
        <p className="mt-4 text-center text-sm text-zinc-500">
          {people.length}{" "}
          {people.length === 1 ? "person" : "people"} splitting
        </p>

        {/* Continue */}
        {people.length > 0 ? (
  <Link
    href="/assign"
    className="mt-6 block w-full rounded-2xl bg-black px-5 py-4 text-center font-semibold text-white hover:bg-zinc-800"
  >
    Start Splitting →
  </Link>
) : (
  <button
    type="button"
    disabled
    className="mt-6 w-full rounded-2xl bg-black px-5 py-4 font-semibold text-white opacity-40"
  >
    Start Splitting →
  </button>
)}
      </div>
    </main>
  );
}