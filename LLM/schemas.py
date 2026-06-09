from pydantic import BaseModel
from typing import Any, List, Dict


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    category: str
    title: str
    message: str
    payload: Dict[str, Any]
    suggestedQuestions: List[str]