#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"
#include "secrets.h"

#define DHTPIN 4
#define DHTTYPE DHT11
#define MOISTURE_PIN 35

DHT dht(DHTPIN, DHTTYPE);

const int dryValue = 3500;
const int wetValue = 1200;

struct SensorData {
  int sensorId;
  float temperature;
  float humidity;
  int rawMoisture;
  int soilMoisture;
};

void setup() {
  Serial.begin(115200);
  dht.begin();

  connectToWiFi();
}

void loop() {
  SensorData data;

  if (!readSensors(data)) {
    Serial.println("Sensor uitlezen mislukt");
    delay(2000);
    return;
  }

  printSensorData(data);

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connection failed, try again...");
    connectToWiFi();
  }

  sendSensorData(data);

  Serial.println("----------------");
  delay(10000);
}

void connectToWiFi() {
  Serial.print("Connected with WiFi");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Connected with WiFi!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

bool readSensors(SensorData &data) {
  data.temperature = dht.readTemperature();
  data.humidity = dht.readHumidity();

  if (isnan(data.temperature) || isnan(data.humidity)) {
    Serial.println("DHT sensor error!");
    return false;
  }

  data.rawMoisture = analogRead(MOISTURE_PIN);

  data.soilMoisture = map(data.rawMoisture, dryValue, wetValue, 0, 100);
  data.soilMoisture = constrain(data.soilMoisture, 0, 100);

  return true;
}

String createJson(SensorData data) {
  String json = "{";
  json += "\"sensorId\":";
  json += SENSOR_ID;
  json += ",";
  json += "\"temperature\":";
  json += data.temperature;
  json += ",";
  json += "\"light\":";
  json += 0;
  json += ",";
  json += "\"humidity\":";
  json += data.humidity;
  json += ",";
  json += "\"soilMoisture\":";
  json += data.soilMoisture;
  json += ",";
  json += "\"rawMoisture\":";
  json += data.rawMoisture;
  json += "}";

  return json;
}

void sendSensorData(SensorData data) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Failed to send data: no WiFi connection");
    return;
  }

  WiFiClient client;
  HTTPClient http;

  String json = createJson(data);

  http.begin(client, API_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);

  int responseCode = http.POST(json);

  Serial.print("POST response code: ");
  Serial.println(responseCode);

  Serial.println("Sent JSON:");
  Serial.println(json);

  if (responseCode <= 0) {
    Serial.print("HTTP error: ");
    Serial.println(http.errorToString(responseCode));
  } else {
    String response = http.getString();
    Serial.println("API response:");
    Serial.println(response);
  }

  http.end();
}

void printSensorData(SensorData data) {
  Serial.print("Raw moisture: ");
  Serial.println(data.rawMoisture);

  Serial.print("Soil moisture: ");
  Serial.print(data.soilMoisture);
  Serial.println("%");

  Serial.print("Temperature: ");
  Serial.print(data.temperature);
  Serial.println(" °C");

  Serial.print("Humidity: ");
  Serial.print(data.humidity);
  Serial.println(" %");
}