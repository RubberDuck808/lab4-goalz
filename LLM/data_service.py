import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

API_URL = "https://localhost:7286/api/dashboard/sensors/dashboard/sensor-summary"


def get_sensor_history():
    response = requests.get(API_URL, timeout=10, verify=False)
    response.raise_for_status()

    data = response.json()

    print("Received records:", len(data))
    if data:
        print("First row:", data[0])

    return data


def get_dashboard_data():
    history = get_sensor_history()

    grouped_by_sensor = {}

    for row in history:
        sensor_id = row.get("sensorId")

        if sensor_id is None:
            print("Missing sensorId in row:", row)
            continue

        if sensor_id not in grouped_by_sensor:
            grouped_by_sensor[sensor_id] = []

        grouped_by_sensor[sensor_id].append(row)

    sensors = []

    for sensor_id, records in grouped_by_sensor.items():
        records = sorted(
            records,
            key=lambda x: x.get("timestamp") or "",
            reverse=True
        )

        latest = records[0]

        temperature = latest.get("temperature")
        humidity = latest.get("humidity")
        light = latest.get("light")
        soil_moisture = latest.get("soilMoisture")
        wind = latest.get("wind")

        sensor = {
            "id": sensor_id,
            "name": f"Sensor {sensor_id}",
            "timestamp": latest.get("timestamp"),

            "temperature": temperature,
            "humidity": humidity,
            "light": light,
            "soilMoisture": soil_moisture,
            "wind": wind,

            "healthScore": calculate_health_score(latest),
            "biodiversityScore": 0,
            "mainIssues": detect_issues(latest),

            "readings": [
                {
                    "name": "Temperature",
                    "value": temperature,
                    "unit": "°C",
                    "status": get_temperature_status(temperature)
                },
                {
                    "name": "Humidity",
                    "value": humidity,
                    "unit": "%",
                    "status": get_humidity_status(humidity)
                },
                {
                    "name": "Light",
                    "value": light,
                    "unit": "lux",
                    "status": get_light_status(light)
                },
                {
                    "name": "Soil moisture",
                    "value": soil_moisture,
                    "unit": "%",
                    "status": get_soil_status(soil_moisture)
                },
                {
                    "name": "Wind",
                    "value": wind,
                    "unit": "km/h",
                    "status": get_wind_status(wind)
                }
            ],

            "history": [
                {
                    "id": record.get("id"),
                    "timestamp": record.get("timestamp"),
                    "temperature": record.get("temperature"),
                    "humidity": record.get("humidity"),
                    "light": record.get("light"),
                    "soilMoisture": record.get("soilMoisture"),
                    "wind": record.get("wind"),
                    "healthScore": calculate_health_score(record),
                    "mainIssues": detect_issues(record)
                }
                for record in records
            ]
        }

        sensors.append(sensor)

    return {
        "sensors": sensors
    }


def find_sensor_by_id(sensor_id):
    if sensor_id is None:
        return None

    data = get_dashboard_data()

    for sensor in data["sensors"]:
        if str(sensor["id"]) == str(sensor_id):
            return sensor

    return None


def get_lowest_health_sensor():
    data = get_dashboard_data()

    if not data["sensors"]:
        return None

    return min(
        data["sensors"],
        key=lambda sensor: sensor["healthScore"]
    )


def calculate_health_score(row):
    score = 100

    humidity = row.get("humidity")
    temperature = row.get("temperature")
    light = row.get("light")
    soil_moisture = row.get("soilMoisture")
    wind = row.get("wind")

    if humidity is not None and humidity < 20:
        score -= 20

    if humidity is not None and humidity > 85:
        score -= 10

    if temperature is not None and temperature > 30:
        score -= 15

    if temperature is not None and temperature < 5:
        score -= 15

    if light is not None and light < 50:
        score -= 10

    if soil_moisture is not None and soil_moisture < 20:
        score -= 25

    if wind is not None and wind > 40:
        score -= 10

    return max(score, 0)


def detect_issues(row):
    issues = []

    humidity = row.get("humidity")
    temperature = row.get("temperature")
    light = row.get("light")
    soil_moisture = row.get("soilMoisture")
    wind = row.get("wind")

    if humidity is not None and humidity < 20:
        issues.append("Low humidity")

    if humidity is not None and humidity > 85:
        issues.append("High humidity")

    if temperature is not None and temperature > 30:
        issues.append("High temperature")

    if temperature is not None and temperature < 5:
        issues.append("Low temperature")

    if light is not None and light < 50:
        issues.append("Low light")

    if soil_moisture is not None and soil_moisture < 20:
        issues.append("Low soil moisture")

    if wind is not None and wind > 40:
        issues.append("High wind speed")

    if not issues:
        issues.append("No major issues detected")

    return issues


def get_temperature_status(value):
    if value is None:
        return "unknown"
    if value > 30:
        return "high"
    if value < 5:
        return "low"
    return "normal"


def get_humidity_status(value):
    if value is None:
        return "unknown"
    if value < 20:
        return "low"
    if value > 85:
        return "high"
    return "normal"


def get_light_status(value):
    if value is None:
        return "unknown"
    if value < 50:
        return "low"
    return "normal"


def get_soil_status(value):
    if value is None:
        return "unknown"
    if value < 20:
        return "low"
    if value > 80:
        return "high"
    return "normal"


def get_wind_status(value):
    if value is None:
        return "unknown"
    if value > 40:
        return "high"
    return "normal"