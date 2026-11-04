"use client";

import { useState } from "react";
import { mockReceipt } from "@/data/mockReceipt";
import type { ReceiptLineItem } from "@/types/receipt";

export default function ReviewReceiptPage() {
  const [items, setItems] = useState<ReceiptLineItem[]>(
    mockReceipt.receipt.line_items
  );

  const receipt = mockReceipt.receipt;

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: receipt.transaction_currency,
    }).format(amount);
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
                    className="mt-1 text-sm font-medium text-zinc-500 hover:text-zinc-900"
                  >
                    Edit
                  </button>
                </div>
              </div>
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