Smart Plant Monitoring and Intrusion Detection System

A smart IoT-based project that combines Plant Monitoring and Intrusion Detection using the ESP8266 NodeMCU, sensors, LED/LCD display, and a modern web dashboard.
The system monitors environmental conditions for plants in real time and detects unauthorized movement or intrusion near the monitoring area.

🚀 Features
🌱 Real-time plant monitoring
💧 Soil moisture level detection
🌡️ Temperature & humidity monitoring
🚨 Intrusion detection using motion sensors
📟 Live sensor data display on LCD/LED display
🌐 Web dashboard for monitoring and control
📡 ESP8266 WiFi connectivity
🔔 Alert system for abnormal conditions
📱 Responsive frontend UI
🛠️ Tech Stack
Hardware
ESP8266 NodeMCU
Soil Moisture Sensor
PIR Motion Sensor
DHT11/DHT22 Sensor
16x2 LCD Display / LED Display
Breadboard
Jumper Wires
Power Supply / USB Cable
Software
HTML
Tailwind CSS
JavaScript
Node.js
Express.js
JSON Database / Local Storage
Arduino IDE
📷 Project Overview

The system continuously collects environmental data from connected sensors using the ESP8266 microcontroller.
Sensor data is transmitted through WiFi to a web server where users can monitor values in real time.

If:

soil moisture becomes too low,
temperature exceeds limits,
or motion is detected,

the system triggers alerts and updates the display/dashboard instantly.

⚙️ Hardware Components
Component	Purpose
ESP8266 NodeMCU	Main microcontroller
Soil Moisture Sensor	Detects soil moisture
DHT11/DHT22	Measures temperature & humidity
PIR Sensor	Detects motion/intrusion
LCD Display	Displays live sensor data
Breadboard	Circuit connections
Jumper Wires	Wiring connections
🔌 Circuit Connections
Soil Moisture Sensor
VCC → 3.3V
GND → GND
A0 → A0
DHT11 Sensor
VCC → 3.3V
GND → GND
DATA → D4
PIR Motion Sensor
VCC → 5V
GND → GND
OUT → D2
LCD Display (I2C)
VCC → 5V
GND → GND
SDA → D2
SCL → D1
🌐 Web Dashboard Features
Live sensor readings
Plant health status
Intrusion alerts
Responsive UI
Real-time updates
Device status monitoring
📂 Project Structure
Smart-Plant-Monitoring-and-Intrusion-Detection-System/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── database/
│
├── hardware/
│   ├── esp8266_code.ino
│
├── README.md
🧠 Working Principle
Sensors collect environmental data.
ESP8266 processes sensor readings.
Data is sent to the web server using WiFi.
Web dashboard displays live updates.
PIR sensor detects movement/intrusion.
LCD/LED display shows real-time values.
Alerts are generated for abnormal conditions.
▶️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/Aditya123-bit/Smart-Plant-Monitoring-and-Intrusion-Detection-System.git
2️⃣ Install Backend Dependencies
cd backend
npm install
3️⃣ Run Server
node server.js
4️⃣ Upload ESP8266 Code
Open Arduino IDE
Install ESP8266 board package
Select NodeMCU 1.0
Upload .ino file
📡 API Endpoints
Method	Endpoint	Description
GET	/api/sensors	Get sensor data
POST	/api/update	Update sensor readings
GET	/api/status	Device status
📈 Future Improvements
Cloud database integration
Mobile application support
AI-based plant health prediction
SMS/Email alerts
Camera-based intrusion detection
👨‍💻 Team Members
Aditya Yadav
Aarti Keswani
Aditya Jha
Amritanshu Tiwari
Shruti Kumari
📌 Applications
Smart agriculture
Home garden automation
Greenhouse monitoring
Security systems
Smart farming solutions
📜 License

This project is developed for educational and research purposes.
