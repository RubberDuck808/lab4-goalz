# ML Image Analysis Pipeline

Read this file when working on:
- The ML microservice (`ml/serve/app.py`)
- `ImageAnalysisService`, `AnalysisRetryService`, or `ElementService` AI logic
- The dashboard pending-elements AI UX
- Retraining or evaluating the ONNX model

---

## Overview

When a player submits a nature element photo the backend fires a background call to a Cloud Run Python microservice that runs an EfficientNetB0 binary classifier. The result is written back to the element and surfaced as a badge in the staff dashboard.

---

## End-to-End Flow

```mermaid
sequenceDiagram
    actor Player
    participant API as ASP.NET Core API
    participant ES as ElementService
    participant ML as Cloud Run<br/>(FastAPI + ONNX)
    participant DB as PostgreSQL
    participant Dash as Staff Dashboard

    Player->>API: POST /api/elements (photo URL)
    API->>ES: CreateAsync(request)
    ES->>DB: INSERT Element (IsApproved=false)
    ES-->>API: 200 OK (returns immediately)
    API-->>Player: 200 OK

    Note over ES: FireAnalysis() → Task.Run (background)

    ES->>ML: POST /analyse {imageUrl, elementName, elementType}
    ML->>ML: Download image → resize 224×224<br/>EfficientNet preprocess → ONNX inference
    ML-->>ES: {confidence, recommendation, summary}

    ES->>DB: UPDATE Element SET AiConfidence, AiSummary, AiResult

    alt recommendation == AutoApprove
        ES->>DB: UPDATE Element SET IsApproved=true
        Note over DB: Element live in game
    else NeedsReview / AutoReject
        Note over DB: Element stays pending
    end

    Dash->>API: GET /api/dashboard/elements/pending
    API-->>Dash: PendingElementDto (includes AI fields)
    Note over Dash: Staff see badge + summary
```

---

## Confidence Thresholds

| Score | Recommendation | Dashboard Badge | Auto-action |
|---|---|---|---|
| ≥ 0.85 | `AutoApprove` | 🟢 Likely valid | Element auto-approved |
| 0.45 – 0.84 | `NeedsReview` | 🟡 Needs review | None — staff decide |
| < 0.45 | `AutoReject` | 🔴 Suspicious | None — staff decide |

> AutoReject is **advisory only**. Staff always have final say on rejections.

---

## Component Map

```mermaid
graph TD
    subgraph Mobile["Mobile App (Expo)"]
        A[Player submits photo]
    end

    subgraph API["ASP.NET Core API"]
        B[ElementController]
        C[ElementService]
        D[ImageAnalysisService]
        E[AnalysisRetryService<br/>every 2 min]
    end

    subgraph CloudRun["Cloud Run — goalz-ml-service"]
        F[FastAPI app.py]
        G[ONNX Runtime]
        H[nature_classifier.onnx<br/>EfficientNetB0]
    end

    subgraph DB["PostgreSQL"]
        I[(Element table<br/>AiConfidence / AiSummary / AiResult)]
    end

    subgraph Dashboard["Staff Dashboard"]
        J[ElementsPanel<br/>card view]
        K[ElementManagement<br/>table view]
    end

    A -->|POST /api/elements| B
    B --> C
    C -->|fire-and-forget| D
    E -->|retry missed| D
    D -->|POST /analyse| F
    F --> G
    G --> H
    H -->|confidence 0–1| G
    G -->|recommendation + summary| F
    F -->|JSON response| D
    D --> C
    C -->|UPDATE| I
    I -->|GET /pending| J
    I -->|GET /pending| K
```

---

## Retry & Deduplication

```mermaid
flowchart LR
    A[FireAnalysis called] --> B{ID in _inFlightIds?}
    B -- Yes --> C[Return — skip duplicate]
    B -- No --> D[Add ID to _inFlightIds]
    D --> E[Acquire SemaphoreSlim\nmax 10 concurrent]
    E --> F[Call ML service]
    F --> G{Result?}
    G -- null/error --> H[Log warning]
    G -- success --> I[Update Element in DB]
    I --> J{AutoApprove?}
    J -- Yes --> K[ApproveAsync]
    J -- No --> L[Leave pending for staff]
    H --> M[Release semaphore\nRemove from _inFlightIds]
    K --> M
    L --> M

    subgraph Retry["AnalysisRetryService (every 2 min)"]
        N[GetPendingWithoutAiAsync\nlimit 50] --> O[FireAnalysis for each]
    end
```

---

## Dashboard Polling (Frontend)

After staff click **Check with AI**, the frontend keeps the spinner alive and polls `/pending` until the result appears:

```mermaid
sequenceDiagram
    participant Staff
    participant Panel as ElementsPanel / ElementManagement
    participant API as ASP.NET Core API

    Staff->>Panel: Click "Check with AI"
    Panel->>API: POST /elements/{id}/analyse
    API-->>Panel: 202 Accepted (fire-and-forget)
    Note over Panel: Spinner stays on (analysingIds)

    loop Every 2 s — up to 20 s
        Panel->>API: GET /elements/pending
        API-->>Panel: PendingElementDto[]
        alt element.aiResult != null
            Panel->>Panel: Update card in-place, stop polling
        else element gone (auto-approved)
            Panel->>Panel: fetchData(), stop polling
        else 20 s timeout
            Panel->>Panel: Show "Analysis failed" badge
        end
    end
```

---

## Neural Network Architecture

```
Input image (any size)
    ↓
Resize → 224 × 224 × 3
    ↓
EfficientNet preprocess_input  (scale pixels to [-1, 1])
    ↓
EfficientNetB0 base
│  ├─ Stem conv 3×3
│  ├─ MBConv blocks × 16  (depthwise separable convolutions)
│  └─ Top conv 1×1
    ↓
Global Average Pooling 2D  (1280-dim vector)
    ↓
Dense(1) + Sigmoid
    ↓
confidence ∈ [0.0, 1.0]
```

**Parameters:** ~5.3 M total, ~4 M frozen during phase-1 fine-tuning  
**Training platform:** Kaggle Notebooks (T4 GPU, ~3.5–4 hrs full run)  
**Export:** TensorFlow → tf2onnx → `nature_classifier.onnx`

---

## Key Files

| File | Purpose |
|---|---|
| `ml/serve/app.py` | FastAPI inference server |
| `ml/serve/model/nature_classifier.onnx` | Trained ONNX model |
| `ml/notebooks/03_training.ipynb` | Training pipeline |
| `ml/notebooks/04_evaluation.ipynb` | Eval metrics |
| `backend/Goalz/Goalz.API/Services/ImageAnalysisService.cs` | HTTP client to ML service |
| `backend/Goalz/Goalz.API/Services/AnalysisRetryService.cs` | Background retry loop |
| `backend/Goalz/Goalz.Application/Services/ElementService.cs` | Fire-and-forget + dedup logic |
| `backend/Goalz/Goalz.Domain/Entities/AiRecommendation.cs` | Enum: AutoApprove / NeedsReview / AutoReject |
| `frontend/dashboard/src/components/dashboard/elements/ElementsPanel.jsx` | Card-based pending view with AI UX |
| `frontend/dashboard/src/components/dashboard/elements/ElementManagement.jsx` | Table-based pending view with AI UX |

---

## Critical Implementation Notes

- **Preprocessing must match training**: `efficientnet.preprocess_input` scales to `[-1, 1]`. Using standard `[0, 1]` normalisation in `app.py` will produce garbage predictions.
- **AutoReject never auto-acts**: only `AutoApprove` triggers `ApproveAsync`. Rejections are always staff-confirmed.
- **Soft-delete on rejection**: `Element.IsRejected = true` keeps rejected submissions as negative training data.
- **`AnalyseAndActAsync` checks `IsRejected`** before approving — prevents AI overwriting a concurrent staff rejection.
- **OIDC token auth**: on GCP, `ImageAnalysisService` fetches a Google identity token from the metadata server and attaches it as a Bearer token. Locally this is skipped (metadata server unreachable → `null` token → no auth header).
