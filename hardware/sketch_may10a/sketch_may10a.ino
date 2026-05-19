#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include "Adafruit_SHTC3.h"
#include "secrets.h"
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SHTC3_SDA 25
#define SHTC3_SCL 26
#define MOISTURE_PIN 35
#define LED_PIN 2

// BLE UUIDs — match these exactly in the dashboard BLEScanner page
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

Adafruit_SHTC3 shtc3;
BLECharacteristic *pCharacteristic;
bool deviceConnected = false;

const int dryValue = 3500;
const int wetValue  = 1200;

struct SensorData {
  float temperature;
  float humidity;
  int   rawMoisture;
  int   soilMoisture;
};

// ── BLE server callbacks ──────────────────────────────────────────────────────

class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *pServer) override {
    deviceConnected = true;
    digitalWrite(LED_PIN, HIGH);
    Serial.println("BLE client connected");
  }
  void onDisconnect(BLEServer *pServer) override {
    deviceConnected = false;
    Serial.println("BLE client disconnected, restarting advertising");
    BLEDevice::startAdvertising();
  }
};

// ── Setup helpers ─────────────────────────────────────────────────────────────

void setupBLE() {
  BLEDevice::init("Goalz-Sensor");
  BLEServer  *pServer  = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pCharacteristic->addDescriptor(new BLE2902());
  pCharacteristic->setValue("{}");

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  BLEDevice::startAdvertising();

  Serial.println("BLE advertising as 'Goalz-Sensor'");
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected! IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nWiFi unavailable — running BLE-only mode");
  }
}

// ── LED helper ────────────────────────────────────────────────────────────────
// Blinks LED while waiting if no BLE client; solid if connected.
void waitWithLed(int ms) {
  int elapsed = 0;
  while (elapsed < ms) {
    if (deviceConnected) {
      digitalWrite(LED_PIN, HIGH);
    } else {
      digitalWrite(LED_PIN, (elapsed / 500) % 2 == 0 ? HIGH : LOW);
    }
    delay(100);
    elapsed += 100;
  }
  if (!deviceConnected) digitalWrite(LED_PIN, LOW);
}

// ── setup / loop ──────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  Wire.begin();
  if (!shtc3.begin()) {
    Serial.println("SHTC3 not found! Check wiring.");
    while (true) delay(10);
  }
  Serial.println("SHTC3 ready");
  setupBLE();
  connectToWiFi();
}

void loop() {
  SensorData data;

  if (!readSensors(data)) {
    Serial.println("Sensor read failed");
    waitWithLed(2000);
    return;
  }

  printSensorData(data);

  if (deviceConnected) {
    String bleJson = createBleJson(data);
    pCharacteristic->setValue(bleJson.c_str());
    pCharacteristic->notify();
    Serial.println("BLE notified: " + bleJson);
  }

  if (WiFi.status() == WL_CONNECTED) {
    sendSensorData(data);
  }

  Serial.println("----------------");
  waitWithLed(2000);
}

// ── Sensor reading ────────────────────────────────────────────────────────────

bool readSensors(SensorData &data) {
  sensors_event_t humidity, temp;
  shtc3.getEvent(&humidity, &temp);

  if (isnan(temp.temperature) || isnan(humidity.relative_humidity)) {
    Serial.println("SHTC3 read error!");
    return false;
  }

  data.temperature = temp.temperature;
  data.humidity    = humidity.relative_humidity;
  data.rawMoisture  = analogRead(MOISTURE_PIN);
  data.soilMoisture = map(data.rawMoisture, dryValue, wetValue, 0, 100);
  data.soilMoisture = constrain(data.soilMoisture, 0, 100);

  return true;
}

// ── JSON builders ─────────────────────────────────────────────────────────────

String createBleJson(SensorData data) {
  String json = "{\"id\":";
  json += SENSOR_ID;
  json += ",\"t\":";
  json += data.temperature;
  json += ",\"h\":";
  json += data.humidity;
  json += ",\"m\":";
  json += data.soilMoisture;
  json += ",\"r\":";
  json += data.rawMoisture;
  json += "}";
  return json;
}

String createJson(SensorData data) {
  String json = "{";
  json += "\"sensorId\":";     json += SENSOR_ID;
  json += ",\"temperature\":"; json += data.temperature;
  json += ",\"light\":0";
  json += ",\"humidity\":";    json += data.humidity;
  json += ",\"soilMoisture\":"; json += data.soilMoisture;
  json += ",\"rawMoisture\":";  json += data.rawMoisture;
  json += "}";
  return json;
}

// ── HTTP send ─────────────────────────────────────────────────────────────────

void sendSensorData(SensorData data) {
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

// ── Debug print ───────────────────────────────────────────────────────────────

void printSensorData(SensorData data) {
  Serial.print("Raw moisture: ");   Serial.println(data.rawMoisture);
  Serial.print("Soil moisture: "); Serial.print(data.soilMoisture); Serial.println("%");
  Serial.print("Temperature: ");   Serial.print(data.temperature);  Serial.println(" °C");
  Serial.print("Humidity: ");      Serial.print(data.humidity);     Serial.println(" %");
}
