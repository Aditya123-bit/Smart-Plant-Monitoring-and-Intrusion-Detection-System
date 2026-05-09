#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Replace with your network credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Replace with your server URL (e.g., your render backend URL)
// If testing locally, use your computer's IP address (e.g., http://192.168.1.5:3000/api/update)
const String serverName = "http://YOUR_SERVER_IP:3000/api/update";

// Define Sensor Pins
#define SOIL_PIN A0     // Analog pin for Soil Moisture Sensor
#define IR_PIN D1       // Digital pin for IR Obstacle Sensor

// Initialize the LCD display (I2C address 0x27, 16 columns and 2 rows)
// Note: If 0x27 doesn't work, try 0x3F. Connect SDA to D2 and SCL to D1 (or D4/D5 depending on Wemos D1 Mini pinout)
// Standard Wemos D1 mini I2C: SDA=D2, SCL=D1. However IR_PIN is D1. Let's use standard default or specify pins.
// By default Wire.begin() on ESP8266 uses SDA=D2, SCL=D1. If IR is D1, we should change IR_PIN to D5.
#define IR_PIN D5

LiquidCrystal_I2C lcd(0x27, 16, 2);

// Variables to store sensor values
int soilMoistureValue = 0;
int irSensorValue = 0;

void setup() {
  Serial.begin(115200);
  
  // Setup Sensors
  pinMode(IR_PIN, INPUT);

  // Setup LCD
  Wire.begin(); // Initiates I2C
  lcd.init();   // Initialize the lcd 
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("System Init...");

  // Setup WiFi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi");
  
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi");
  
  while(WiFi.status() != WL_CONNECTED) { 
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi Connected!");
  delay(2000);
}

void loop() {
  // Check WiFi connection status
  if(WiFi.status() == WL_CONNECTED){
    WiFiClient client;
    HTTPClient http;
    
    // Read sensor data
    soilMoistureValue = analogRead(SOIL_PIN);
    irSensorValue = digitalRead(IR_PIN);
    
    // Process Soil Moisture (Assuming standard 0-1024, adjust threshold as needed)
    // Often dry soil > 600, wet soil < 600 for typical sensors
    String soilStatus = "Wet";
    if (soilMoistureValue > 600) {
      soilStatus = "Dry";
    }

    // Process IR Sensor (Usually LOW when obstacle detected)
    bool intruderDetected = false;
    if (irSensorValue == LOW) {
      intruderDetected = true;
    }

    Serial.print("Soil: "); Serial.print(soilStatus);
    Serial.print(" | Intruder: "); Serial.println(intruderDetected ? "Yes" : "No");

    // Update LCD
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Soil: ");
    lcd.print(soilStatus);
    
    lcd.setCursor(0, 1);
    if (intruderDetected) {
      lcd.print("ALERT: INTRUDER!");
    } else {
      lcd.print("Area: Safe");
    }

    // Initialize HTTP connection
    http.begin(client, serverName.c_str());
    
    // Specify content-type header
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["soil"] = soilStatus;
    doc["intruder"] = intruderDetected;
    doc["status"] = "Online";
    
    String httpRequestData;
    serializeJson(doc, httpRequestData);
    
    // Send HTTP POST request
    int httpResponseCode = http.POST(httpRequestData);
    
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
    }
    else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    
    // Free resources
    http.end();
  }
  else {
    Serial.println("WiFi Disconnected");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Offline!");
  }
  
  // Send data every 2 seconds
  delay(2000);
}
