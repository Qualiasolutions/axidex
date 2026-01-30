from pydantic import BaseModel
from typing import Literal, Any

SignalType = Literal[
    "hiring",
    "funding",
    "expansion",
    "partnership",
    "product_launch",
    "leadership_change",
]
Priority = Literal["high", "medium", "low"]


class Signal(BaseModel):
    company_name: str
    company_domain: str | None = None
    signal_type: SignalType
    title: str
    summary: str
    source_url: str
    source_name: str
    priority: Priority = "medium"
    metadata: dict[str, Any] = {}
