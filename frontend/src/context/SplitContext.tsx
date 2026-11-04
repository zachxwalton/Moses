"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { mockReceipt } from "@/data/mockReceipt";
import type {
  Receipt,
  ReceiptLineItem,
} from "@/types/receipt";

type Person = {
  id: number;
  name: string;
};

type Assignments = {
  [itemIndex: number]: number[];
};

type SplitContextType = {
  receipt: Receipt;
  setReceipt: (receipt: Receipt) => void;

  items: ReceiptLineItem[];
  setItems: (items: ReceiptLineItem[]) => void;

  people: Person[];
  setPeople: (people: Person[]) => void;

  assignments: Assignments;
  setAssignments: (assignments: Assignments) => void;

  resetSplit: () => void;
};

const SplitContext = createContext<SplitContextType | undefined>(
  undefined
);

export function SplitProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [receipt, setReceipt] = useState<Receipt>(
    mockReceipt.receipt
  );

  const [items, setItems] = useState<ReceiptLineItem[]>(
    mockReceipt.receipt.line_items
  );

  const [people, setPeople] = useState<Person[]>([
    {
      id: 1,
      name: "Imran",
    },
  ]);

  const [assignments, setAssignments] =
    useState<Assignments>({});

  function resetSplit() {
    setReceipt(mockReceipt.receipt);

    setItems(mockReceipt.receipt.line_items);

    setPeople([
      {
        id: 1,
        name: "Imran",
      },
    ]);

    setAssignments({});
  }

  return (
    <SplitContext.Provider
      value={{
        receipt,
        setReceipt,

        items,
        setItems,

        people,
        setPeople,

        assignments,
        setAssignments,

        resetSplit,
      }}
    >
      {children}
    </SplitContext.Provider>
  );
}

export function useSplit() {
  const context = useContext(SplitContext);

  if (!context) {
    throw new Error(
      "useSplit must be used inside SplitProvider"
    );
  }

  return context;
}