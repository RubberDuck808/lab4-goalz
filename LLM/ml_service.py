import joblib

model = joblib.load("health_risk_model.joblib")


def predict_health_risk(sensor):

    prediction = model.predict([
        [
            sensor["soilMoisture"],
            sensor["temperature"],
            sensor["humidity"],
            sensor.get("biodiversityScore", 0)
        ]
    ])

    return prediction[0]