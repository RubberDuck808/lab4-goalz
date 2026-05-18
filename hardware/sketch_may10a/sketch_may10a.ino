#include "secrets.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"  
#include <Wire.h>
#include <APDS9250.h> 

#define DHTPIN       4
#define DHTTYPE      DHT11
#define MOISTURE_PIN 35
#define WIND_RV_PIN  32
#define WIND_TMP_PIN 33
// Light sensor uses I2C: SDA → GPIO 21, SCL → GPIO 22

const char* ssid = "COSMOTE_F274";
const char* password = "17953580";

// IPv4 address of your laptop
const char* apiUrl = "http://192.168.1.116:5000/api/dashboard/sensors/data";

const int sensorId = 42;

const int dryValue = 3500;
const int wetValue = 1200;

APDS9250 sensor;

DHT dht(DHTPIN, DHTTYPE);

struct SensorData {
  float temperature;
  float humidity;
  int   rawMoisture;
  uint32_t rawRed;
  uint32_t rawGreen;
  uint32_t rawBlue;
  uint32_t rawIR;
  int rawWindRv;
  int rawWindTmp;
};

void setup() {
  Serial.begin(115200);

  dht.begin();

  if(sensor.begin()) {
    Serial.println("Sensor gevonden");
  } else {
    Serial.println("Sensor NIET gevonden");
  }

  sensor.enable();

  sensor.setModeRGB();

  connectToWiFi();
}

void loop() {
  SensorData data;

  if (!readSensors(data)) {
    Serial.println("Sensor read failed");
    delay(2000);
    return;
  }

  printSensorData(data);

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost, reconnecting...");
    connectToWiFi();
  }

  sendSensorData(data);

  Serial.println("----------------");
  delay(API_INTERVAL);
}

void connectToWiFi() {
  Serial.print("Connected with WiFi");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());
}

void readLightSensor(SensorData &data) {
  data.rawRed   = sensor.getRawRedData();
  data.rawGreen = sensor.getRawGreenData();
  data.rawBlue  = sensor.getRawBlueData();
  data.rawIR    = sensor.getRawIRData();

  Serial.print("R: ");
  Serial.print(data.rawRed);

  Serial.print(" G: ");
  Serial.print(data.rawGreen);

  Serial.print(" B: ");
  Serial.print(data.rawBlue);

  Serial.print(" IR: ");
  Serial.println(data.rawIR);
}

bool readSensors(SensorData &data) {
  // DHT11 — temperature & humidity
  data.temperature = dht.readTemperature();
  data.humidity    = dht.readHumidity();

  if (isnan(data.temperature) || isnan(data.humidity)) {
    Serial.println("DHT sensor error!");
    return false;
  }

  // Soil moisture
  data.rawMoisture = analogRead(MOISTURE_PIN);

  // Read light sensor
  readLightSensor(data);

  // Read windspeed
  data.rawWindRv = analogRead(WIND_RV_PIN);
  data.rawWindTmp = analogRead(WIND_TMP_PIN);

  Serial.print("RV: ");
  Serial.print(data.rawWindRv);

  Serial.print(" TMP: ");
  Serial.println(data.rawWindTmp);

  return true;
}

String createJson(SensorData data) {
  String json = "{";
  json += "\"sensorId\":"     + String(SENSOR_ID)          + ",";
  json += "\"temperature\":"  + String(data.temperature)  + ",";
  json += "\"humidity\":"     + String(data.humidity)     + ",";
  json += "\"rawMoisture\":"  + String(data.rawMoisture)  + ",";
  json += "\"rawRed\":"       + String(data.rawRed)       + ",";
  json += "\"rawGreen\":"     + String(data.rawGreen)     + ",";
  json += "\"rawBlue\":"      + String(data.rawBlue)      + ",";
  json += "\"rawIR\":"        + String(data.rawIR)        + ",";
  json += "\"rawWindRv\":"    + String(data.rawWindRv)    + ",";
  json += "\"rawWindTmp\":"   + String(data.rawWindTmp);
  json += "}";
  
  return json;
}

void sendSensorData(SensorData data) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Failed to send: no WiFi");
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
  Serial.println("Sent JSON: " + json);

  if (responseCode <= 0) {
    Serial.print("HTTP error: ");
    Serial.println(http.errorToString(responseCode));
  } else {
    Serial.println("API response: " + http.getString());
  }

  http.end();
}

void printSensorData(SensorData data) {
  Serial.print("Temperature:   "); Serial.print(data.temperature);  Serial.println(" °C");
  Serial.print("Humidity:      "); Serial.print(data.humidity);     Serial.println(" %");
  Serial.print("Raw moisture:  "); Serial.println(data.rawMoisture);
  Serial.print("Raw red:       "); Serial.println(data.rawRed);
  Serial.print("Raw green:     "); Serial.println(data.rawGreen);
  Serial.print("Raw blue:      "); Serial.println(data.rawBlue);
  Serial.print("Raw IR:        "); Serial.println(data.rawIR);
  Serial.print("Raw wind RV:   "); Serial.println(data.rawWindRv);
  Serial.print("Raw wind TMP:  "); Serial.println(data.rawWindTmp);
}