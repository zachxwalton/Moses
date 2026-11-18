from __future__ import annotations
import os
from dataclasses import dataclass
from functools import lru_cache
from typing import Any
from receipt_ocr.constants import _DEFAULT_OPENAI_MODEL
from receipt_ocr.processors import ReceiptProcessor

JSON_SCHEMA: dict[str, Any] = {
    "merchant_name": "string",
    "transaction_currency": "string",
    "total_amount": "number",
    "line_items": [
        {
            "item_name": "string",
            "item_quantity": "number",
            "item_price": "number",
        }
    ],
}


class EngineNotConfigured(RuntimeError):
    """Provider credentials are missing, so no scan can run."""


@dataclass(frozen=True)
class ScanResult:
    receipt: dict[str, Any]
    model: str


def scan(frame: bytes) -> ScanResult:
    model = os.getenv("OPENAI_MODEL", _DEFAULT_OPENAI_MODEL)
    # The provider takes image bytes directly (receipt_ocr.utils.encode_image_to_base64).
    receipt = _processor().process_receipt(frame, JSON_SCHEMA, model)
    return ScanResult(receipt=receipt, model=model)


@lru_cache(maxsize=1)
def _processor() -> ReceiptProcessor:
    if not os.getenv("OPENAI_API_KEY"):
        raise EngineNotConfigured(
            "OPENAI_API_KEY is not set. Add it to .env or export it, then restart the service."
        )
    try:
        return ReceiptProcessor()
    except Exception as exc:
        raise EngineNotConfigured(f"Could not create the provider client: {exc}") from exc
