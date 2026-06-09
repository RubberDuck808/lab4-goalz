from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import ChatRequest, ChatResponse
from ollama_client import ask_ollama_for_intent
from response_builder import build_response
from data_service import get_sensor_history, get_dashboard_data

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/debug/sensor-history")
def debug_sensor_history():
    history = get_sensor_history()

    return {
        "count": len(history),
        "firstRow": history[0] if len(history) > 0 else None,
        "data": history
    }


@app.get("/debug/dashboard-data")
def debug_dashboard_data():
    data = get_dashboard_data()

    return {
        "sensorCount": len(data["sensors"]),
        "data": data
    }

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    intent = ask_ollama_for_intent(request.question)

    print("QUESTION:", request.question)
    print("INTENT:", intent)

    response = build_response(intent, request.question)

    print("RESPONSE:", response)

    return response