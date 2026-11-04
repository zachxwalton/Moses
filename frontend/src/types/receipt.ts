export interface ReceiptLineItem {
  item_name: string;
  item_quantity: number;
  item_price: number;
}

export interface Receipt {
  merchant_name: string;
  transaction_currency: string;
  total_amount: number;
  line_items: ReceiptLineItem[];
}

export interface ScanResponse {
  receipt: Receipt;
  model: string;
}