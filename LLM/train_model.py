import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import joblib

data = [
    # soil_moisture, temperature, humidity, biodiversity_score, risk
    [31, 22.4, 45, 49, "high"],
    [38, 21.5, 50, 65, "medium"],
    [55, 20.1, 62, 78, "low"],
    [28, 25.0, 40, 45, "high"],
    [42, 23.0, 55, 60, "medium"],
    [65, 19.0, 70, 82, "low"],
]

df = pd.DataFrame(
    data,
    columns=[
        "soil_moisture",
        "temperature",
        "humidity",
        "biodiversity_score",
        "risk",
    ],
)

X = df[
    [
        "soil_moisture",
        "temperature",
        "humidity",
        "biodiversity_score",
    ]
]

y = df["risk"]

model = DecisionTreeClassifier(random_state=42)
model.fit(X, y)

joblib.dump(model, "health_risk_model.joblib")

print("Model trained and saved.")