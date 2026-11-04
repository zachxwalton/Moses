"use client";

import { useState } from "react";
import { mockReceipt } from "@/data/mockReceipt";
import type { ReceiptLineItem } from "@/types/receipt";

export default function ReviewReceiptPage() {
  const receipt = mockReceipt.receipt;

  const [items, setItems] = useState<ReceiptLineItem[]>(
    receipt.line_items
  );

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [editItem, setEditItem] = useState<ReceiptLineItem>({
    item_name: "",
    item_quantity: 1,
    item_price: 0,
  });

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: receipt.transaction_currency,
    }).format(amount);
  }

  function startEditing(index: number) {
    setEditingIndex(index);
    setEditItem({ ...items[index] });
  }

  function cancelEditing() {
    setEditingIndex(null);
  }

  function saveEdit() {
    if (editingIndex === null) return;

    const updatedItems = [...items];
    updatedItems[editingIndex] = editItem;

    setItems(updatedItems);
    setEditingIndex(null);
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
            Review Receipt
          </h1>

          <p className="mt-2 text-zinc-500">
            Make sure everything looks right before splitting.
          </p>
        </div>

        {/* Merchant */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">
            Merchant
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            {receipt.merchant_name}
          </h2>
        </div>

        {/* Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Items
            </h2>

            <span className="text-sm text-zinc-500">
              {items.length} items
            </span>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
              {editingIndex === index ? (
                <div className="space-y-4">

                  {/* Item Name */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-600">
                      Item name
                    </label>

                    <input
                      type="text"
                      value={editItem.item_name}
                      onChange={(event) =>
                        setEditItem({
                          ...editItem,
                          item_name: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-black"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-600">
                      Quantity
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={editItem.item_quantity}
                      onChange={(event) =>
                        setEditItem({
                          ...editItem,
                          item_quantity: Number(event.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-black"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-600">
                      Price
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editItem.item_price}
                      onChange={(event) =>
                        setEditItem({
                          ...editItem,
                          item_price: Number(event.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-black"
                    />
                  </div>

                  {/* Edit Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="flex-1 rounded-xl bg-black px-4 py-2 font-medium text-white hover:bg-zinc-800"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="flex-1 rounded-xl border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">

                  <div>
                    <p className="font-medium">
                      {item.item_name}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Quantity: {item.item_quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(item.item_price)}
                    </p>

                    <button
                      type="button"
                      onClick={() => startEditing(index)}
                      className="mt-1 text-sm font-medium text-zinc-500 hover:text-zinc-900"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Item */}
        <button
          type="button"
          className="mt-4 w-full rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-4 font-medium text-zinc-600 hover:bg-zinc-100"
        >
          + Add Item
        </button>

        {/* Total */}
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">
              Total
            </span>

            <span className="text-2xl font-bold">
              {formatCurrency(receipt.total_amount)}
            </span>
          </div>
        </div>

        {/* Continue */}
        <button
          type="button"
          className="mt-6 w-full rounded-2xl bg-black px-5 py-4 font-semibold text-white hover:bg-zinc-800"
        >
          Looks Good →
        </button>

      </div>
    </main>
  );
}