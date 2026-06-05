from data_service import (
    find_sensor_by_id,
    get_lowest_health_sensor
)
from ml_service import predict_health_risk
import re

def build_missing_sensor_response():
    return {
        "category": "unknown",
        "title": "Sensor id missing",
        "message": "Please specify which sensor you want to inspect.",
        "payload": {
            "reason": "No sensor id was provided in the question."
        },
        "suggestedQuestions": [
            "Show sensor details for sensor 60",
            "Predict health risk for sensor 60",
            "Which sensor needs attention?"
        ]
    }


def build_sensor_not_found_response(sensor_id):
    return {
        "category": "unknown",
        "title": "Sensor not found",
        "message": f"I could not find data for sensor {sensor_id}.",
        "payload": {
            "reason": f"No recent data was found for sensor {sensor_id}."
        },
        "suggestedQuestions": [
            "Show sensor details for sensor 60",
            "Which sensor needs attention?"
        ]
    }


def build_no_sensor_data_response():
    return {
        "category": "unknown",
        "title": "No sensor data available",
        "message": "No sensor data is currently available.",
        "payload": {
            "reason": "The API returned no sensor measurements."
        },
        "suggestedQuestions": []
    }

def build_sensor_details(sensor):
    return {
        "category": "sensor_details",
        "title": "Sensor Details",
        "message": f"Here are the latest readings for {sensor['name']}.",
        "payload": {
            "sensorId": sensor["id"],
            "sensorName": sensor["name"],
            "timestamp": sensor.get("timestamp"),

            # Latest values for current UI cards
            "sensors": sensor["readings"],

            # All historical records
            "history": sensor["history"],
            "historyCount": len(sensor["history"])
        },
        "suggestedQuestions": [
            f"What is the health risk of sensor {sensor['id']}?",
            f"What maintenance action is needed for sensor {sensor['id']}?"
        ]
    }

def build_sensor_health_summary(sensor):
    return {
        "category": "area_health_summary",
        "title": "Sensor Health Score",
        "message": f"{sensor['name']} has a health score of {sensor['healthScore']}.",
        "payload": {
            "area": sensor["name"],

            # Keep these names for your current React component
            "healthScore": sensor["healthScore"],
            "biodiversityScore": sensor.get("biodiversityScore", 0),
            "mainIssues": sensor["mainIssues"],

            # New clearer names
            "sensorId": sensor["id"],
            "sensorName": sensor["name"],
            "timestamp": sensor.get("timestamp")
        },
        "suggestedQuestions": [
            f"Show sensor details for sensor {sensor['id']}",
            f"What maintenance action is needed for sensor {sensor['id']}?"
        ]
    }


def build_attention_required(sensor):
    if sensor is None:
        return build_no_sensor_data_response()

    return {
        "category": "area_health_summary",
        "title": "Sensor Needs Attention",
        "message": f"{sensor['name']} currently needs the most attention with a health score of {sensor['healthScore']}.",
        "payload": {
            "area": sensor["name"],
            "healthScore": sensor["healthScore"],
            "biodiversityScore": sensor.get("biodiversityScore", 0),
            "mainIssues": sensor["mainIssues"],
            "sensorId": sensor["id"],
            "sensorName": sensor["name"],
            "timestamp": sensor.get("timestamp")
        },
        "suggestedQuestions": [
            f"Show sensor details for sensor {sensor['id']}",
            f"Predict health risk for sensor {sensor['id']}"
        ]
    }


def build_maintenance_advice(sensor):
    actions = []

    if sensor["healthScore"] < 60:
        actions.append("Prioritize this sensor location because the health score is low.")

    for issue in sensor["mainIssues"]:
        issue_lower = issue.lower()

        if "soil moisture" in issue_lower:
            actions.append("Check soil moisture levels and consider watering or irrigation.")
        if "humidity" in issue_lower:
            actions.append("Monitor humidity levels around this sensor location.")
        if "temperature" in issue_lower:
            actions.append("Check whether high temperature is affecting this area.")
        if "light" in issue_lower:
            actions.append("Check if the area receives enough light.")

    if not actions:
        actions.append("No urgent maintenance action is needed based on the latest sensor readings.")

    return {
        "category": "maintenance_advice",
        "title": "Maintenance Advice",
        "message": f"These are recommended actions for {sensor['name']}.",
        "payload": {
            "area": sensor["name"],
            "sensorId": sensor["id"],
            "sensorName": sensor["name"],
            "recommendedActions": actions
        },
        "suggestedQuestions": [
            f"Show sensor details for sensor {sensor['id']}",
            f"Predict health risk for sensor {sensor['id']}"
        ]
    }


def build_health_risk_prediction(sensor):
    risk = predict_health_risk(sensor)

    return {
        "category": "health_risk_prediction",
        "title": "Health Risk Prediction",
        "message": f"The ML model predicts a {risk} health risk for {sensor['name']}.",
        "payload": {
            "area": sensor["name"],
            "sensorId": sensor["id"],
            "sensorName": sensor["name"],
            "risk": risk,
            "inputData": {
                "readings": sensor["readings"],
                "healthScore": sensor["healthScore"]
            }
        },
        "suggestedQuestions": [
            f"Show sensor details for sensor {sensor['id']}",
            f"What maintenance action is needed for sensor {sensor['id']}?"
        ]
    }


def build_general_answer():
    return {
        "category": "general_answer",
        "title": "AI Sustainability Assistant",
        "message": "I can help monitor sensor readings from the Humber Arboretum.",
        "payload": {
            "answer": "Ask me about a specific sensor, sensor health, maintenance advice or which sensor needs attention."
        },
        "suggestedQuestions": [
            "Show sensor details for sensor 60",
            "Predict health risk for sensor 60",
            "Which sensor needs attention?"
        ]
    }

def extract_sensor_id_from_question(question):
    match = re.search(r"\b(?:sensor|sensor id|id)\s*(\d+)\b", question.lower())

    if match:
        return int(match.group(1))

    match = re.search(r"\b\d+\b", question)

    if match:
        return int(match.group(0))

    return None


def build_response(intent, question):
    category = intent.get("category")

    sensor_id = (
        intent.get("sensorId")
        or intent.get("sensor_id")
        or extract_sensor_id_from_question(question)
    )

    if category == "attention_required":
        sensor = get_lowest_health_sensor()
        return build_attention_required(sensor)

    if category in [
        "sensor_details",
        "area_health_summary",
        "sensor_health_summary",
        "maintenance_advice",
        "health_risk_prediction"
    ]:
        if sensor_id is None:
            return build_missing_sensor_response()

        sensor = find_sensor_by_id(sensor_id)

        if sensor is None:
            return build_sensor_not_found_response(sensor_id)

        if category == "sensor_details":
            return build_sensor_details(sensor)

        if category in ["area_health_summary", "sensor_health_summary"]:
            return build_sensor_health_summary(sensor)

        if category == "maintenance_advice":
            return build_maintenance_advice(sensor)

        if category == "health_risk_prediction":
            return build_health_risk_prediction(sensor)

    if category == "general_answer":
        return build_general_answer()

    return {
        "category": "unknown",
        "title": "Unknown question",
        "message": "I could not understand the question or link it to the available sensor data.",
        "payload": {
            "reason": "The question does not match a supported sensor monitoring category."
        },
        "suggestedQuestions": [
            "Show sensor details for sensor 60",
            "Which sensor needs attention?"
        ]
    }