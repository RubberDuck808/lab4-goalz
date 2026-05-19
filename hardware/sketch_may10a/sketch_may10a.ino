#include "secrets.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include "Adafruit_SHTC3.h"
#include <APDS9250.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define MOISTURE_PIN 35
#define WIND_RV_PIN  32
#define WIND_TMP_PIN 33
#define LED_PIN      2
// SHTC3 uses I2C: SDA → GPIO 21, SCL → GPIO 22
// APDS9250 uses I2C: SDA → GPIO 21, SCL → GPIO 22

// BLE UUIDs — match these exactly in the dashboard BLEScanner page
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

const int dryValue = 3500;
const int wetValue  = 1200;

Adafruit_SHTC3 shtc3;
APDS9250 lightSensor;
BLECharacteristic *pCharacteristic;
bool deviceConnected = false;

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

  if (lightSensor.begin()) {
    Serial.println("APDS9250 found");
  } else {
    Serial.println("APDS9250 not found — light readings will be 0");
  }
  lightSensor.enable();
  lightSensor.setModeRGB();

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

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost, reconnecting...");
    connectToWiFi();
  }

  if (WiFi.status() == WL_CONNECTED) {
    sendSensorData(data);
  }

  Serial.println("----------------");
  waitWithLed(2000);
}

// ── Sensor reading ────────────────────────────────────────────────────────────

void readLightSensor(SensorData &data) {
  data.rawRed   = lightSensor.getRawRedData();
  data.rawGreen = lightSensor.getRawGreenData();
  data.rawBlue  = lightSensor.getRawBlueData();
  data.rawIR    = lightSensor.getRawIRData();
}

bool readSensors(SensorData &data) {
  sensors_event_t humidity, temp;
  shtc3.getEvent(&humidity, &temp);

  if (isnan(temp.temperature) || isnan(humidity.relative_humidity)) {
    Serial.println("SHTC3 read error!");
    return false;
  }

  data.temperature = temp.temperature;
  data.humidity    = humidity.relative_humidity;
  data.rawMoisture = analogRead(MOISTURE_PIN);

  readLightSensor(data);

  data.rawWindRv  = analogRead(WIND_RV_PIN);
  data.rawWindTmp = analogRead(WIND_TMP_PIN);

  return true;
}

// ── JSON builders ─────────────────────────────────────────────────────────────

String createBleJson(SensorData data) {
  long lux = (long)(0.2126 * data.rawRed + 0.7152 * data.rawGreen + 0.0722 * data.rawBlue);
  String json = "{\"id\":";
  json += SENSOR_ID;
  json += ",\"t\":";
  json += data.temperature;
  json += ",\"h\":";
  json += data.humidity;
  json += ",\"r\":";
  json += data.rawMoisture;
  json += ",\"l\":";
  json += lux;
  json += "}";
  return json;
}

String createJson(SensorData data) {
  String json = "{";
  json += "\"sensorId\":"    + String(SENSOR_ID)          + ",";
  json += "\"temperature\":" + String(data.temperature)   + ",";
  json += "\"humidity\":"    + String(data.humidity)      + ",";
  json += "\"rawMoisture\":" + String(data.rawMoisture)   + ",";
  json += "\"rawRed\":"      + String(data.rawRed)        + ",";
  json += "\"rawGreen\":"    + String(data.rawGreen)      + ",";
  json += "\"rawBlue\":"     + String(data.rawBlue)       + ",";
  json += "\"rawIR\":"       + String(data.rawIR)         + ",";
  json += "\"rawWindRv\":"   + String(data.rawWindRv)     + ",";
  json += "\"rawWindTmp\":"  + String(data.rawWindTmp);
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
