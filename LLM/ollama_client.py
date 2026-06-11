import requests
import json
from templates import SYSTEM_PROMPT

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "llama3.2:3b"


def ask_ollama_for_intent(question):
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": question}
            ],
            "stream": False,
            "format": "json"
        },
        timeout=60
    )

    response.raise_for_status()

    result = response.json()
    content = result["message"]["content"]

    return json.loads(content)