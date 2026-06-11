import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Thermometer,
  Droplets,
  Sun,
  Sprout,
  Activity,
} from "lucide-react";
import AreaHealthSummary from "./responses/AreaHealthSummary";
import BiodiversitySummary from "./responses/BiodiversitySummary";
import MaintenanceAdvice from "./responses/MaintenanceAdvise";
import SensorCard from "./responses/SensorCard";

export default function DashboardChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const buttonRef = useRef(null);
  const [panelStyle, setPanelStyle] = useState({});

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      response: {
        category: "general_answer",
        title: "AI Sustainability Assistant",
        message:
          "Hi, I can help you understand sensor data, landscape health and maintenance advice.",
        payload: {},
        suggestedQuestions: [
          "Show me the sensor details of sensor 60",
          "Which sensor has the lowest health score?",
          "What maintenance action is needed?",
        ],
      },
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(customQuestion) {
    const userQuestion = customQuestion || question;
    if (!userQuestion.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: userQuestion }]);
    setQuestion("");
    setLoading(true);

    try {
      const headers = {
          "Authorization": `Bearer ${sessionStorage.getItem("token") ?? ""}`,
          "Content-Type": "application/json",
      }

      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ question: userQuestion }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          response: data,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          response: {
            category: "unknown",
            title: "Connection error",
            message:
              "I could not connect to the AI service. Please check your connection and try again.",
            payload: {},
            suggestedQuestions: [],
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleToggle() {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const panelW = Math.min(420, vw - 16);
      const panelH = Math.min(560, rect.top - 16);
      // Anchor left to the button, then clamp so it never overflows either edge
      const rawLeft = rect.left;
      const left = Math.max(8, Math.min(rawLeft, vw - panelW - 8));
      setPanelStyle({
        left,
        bottom: vh - rect.top + 8,
        width: panelW,
        height: panelH,
      });
    }
    setIsOpen(v => !v);
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#14243b] text-white transition cursor-pointer hover:bg-[#1d3352]"
      >
        <MessageCircle size={16} />
      </button>

      {isOpen && createPortal(
        <div
          className="fixed z-[1200] flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          style={panelStyle}
        >
          <div className="flex items-center justify-between bg-[#14243b] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Bot size={22} />
              </div>

              <div>
                <h2 className="font-bold">AI Assistant</h2>
                <p className="text-xs text-slate-300">
                  Office of Sustainability
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 transition hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index}>
                  {message.role === "user" ? (
                    <UserMessage content={message.content || ""} />
                  ) : (
                    <AssistantMessage
                      response={message.response}
                      onSuggestedQuestionClick={sendMessage}
                    />
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Bot size={18} />
                  <span>AI is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="Ask about sensor data..."
                className="flex-1 bg-transparent text-sm outline-none"
              />

              <button
                onClick={() => sendMessage()}
                disabled={loading}
                className="rounded-xl bg-[#14243b] p-2 text-white transition hover:bg-[#1d3352] disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}

function UserMessage({ content }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#14243b] px-4 py-3 text-sm text-white">
        <div className="mb-1 flex items-center justify-end gap-2 text-xs text-slate-300">
          <span>You</span>
          <User size={14} />
        </div>
        {content}
      </div>
    </div>
  );
}

function AssistantMessage({ response, onSuggestedQuestionClick }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-[#14243b]">
          <Bot size={16} />
          <h3 className="font-bold">{response.title}</h3>
        </div>

        <p className="mb-3 text-slate-600">{response.message}</p>

        <ResponseRenderer response={response} />

        {response.suggestedQuestions?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {response.suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => onSuggestedQuestionClick(question)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-100"
              >
                {question}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResponseRenderer({ response }) {
  switch (response.category) {
    case "sensor_details":
      return <SensorDetails payload={response.payload} />;

    case "area_health_summary":
      return <AreaHealthSummary payload={response.payload} />;

    case "biodiversity_summary":
      return <BiodiversitySummary payload={response.payload} />;

    case "maintenance_advice":
      return <MaintenanceAdvice payload={response.payload} />;

    case "unknown":
      return (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {response.payload?.reason || "No available data found."}
        </div>
      );

    default:
      return null;
  }
}

function SensorDetails({ payload }) {
  const sensors = payload?.sensors || [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {sensors.map((sensor, index) => (
          <SensorCard key={index} sensor={sensor} />
        ))}
      </div>
    </div>
  );
}