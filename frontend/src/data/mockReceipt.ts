import type { ScanResponse } from "@/types/receipt";

export const mockReceipt: ScanResponse = {
  receipt: {
    merchant_name: "Dishoom",
    transaction_currency: "GBP",
    total_amount: 48.6,
    line_items: [
      {
        item_name: "Chicken Ruby",
        item_quantity: 1,
        item_price: 15.5,
      },
      {
        item_name: "Garlic Naan",
        item_quantity: 2,
        item_price: 4.2,
      },
      {
        item_name: "Chicken Biryani",
        item_quantity: 1,
        item_price: 17.9,
      },
      {
        item_name: "Mango Lassi",
        item_quantity: 1,
        item_price: 5.5,
      },
      {
        item_name: "Coke",
        item_quantity: 1,
        item_price: 1.3,
      },
    ],
  },
  model: "mock",
};