from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


class PredictRequest(BaseModel):
    calories_in: float
    calories_out: float


class PredictResponse(BaseModel):
    predicted_weight_change: float  # kg per day


app = FastAPI(title="Gym AI Tracker ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    """
    Simple deterministic model using 7700 kcal ≈ 1kg fat.
    We compute daily net calories and convert to daily weight change.
    """
    net = req.calories_in - req.calories_out
    daily_change_kg = net / 7700.0
    return PredictResponse(predicted_weight_change=daily_change_kg)


