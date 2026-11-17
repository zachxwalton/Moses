"use client";

import Link from "next/link";
import { useState } from "react";

import { useSplit } from "@/context/SplitContext";

export default function PeoplePage() {
  const { people, setPeople } = useSplit();

  const [name, setName] = useState("");

  function addPerson() {
    const trimmedName = name.trim();

    if (!trimmedName) return;

    const newPerson = {
      id: Date.now(),
      name: trimmedName,
    };

    setPeople([...people, newPerson]);
    setName("");
  }

  function removePerson(id: number) {
    setPeople(people.filter((person) => person.id !== id));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      addPerson();
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900">
      <div className="mx-auto max-w-lg">
        {/* Back Button */}
        <Link
          href="/review"
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
            Add People
          </h1>

          <p className="mt-2 text-zinc-500">
            Who is splitting this receipt?
          </p>
        </div>

        {/* Add Person */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-zinc-600">
            Name
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a name"
              className="min-w-0 flex-1 rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
            />

            <button
              type="button"
              onClick={addPerson}
              className="rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-zinc-800"
            >
              Add
            </button>
          </div>
        </div>

        {/* People List */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              People
            </h2>

            <span className="text-sm text-zinc-500">
              {people.length} {people.length === 1 ? "person" : "people"}
            </span>
          </div>

          <div className="space-y-3">
            {people.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                    {getInitials(person.name)}
                  </div>

                  <p className="font-medium">
                    {person.name}
                  </p>
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
        </div>

        {/* Continue */}
        {people.length > 0 ? (
          <Link
            href="/assign"
            className="mt-8 block w-full rounded-2xl bg-black px-5 py-4 text-center font-semibold text-white hover:bg-zinc-800"
          >
            Start Splitting →
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="mt-8 w-full cursor-not-allowed rounded-2xl bg-zinc-300 px-5 py-4 font-semibold text-zinc-500"
          >
            Add someone to continue
          </button>
        )}
      </div>
    </main>
  );
}