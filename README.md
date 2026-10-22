🌤️ Weather App

A modern, responsive weather application that provides real-time weather data, hourly forecasts, 5-day forecasts, air quality index (AQI), and automatic location detection using the OpenWeatherMap API.

🚀 Features
📍 Auto Location Detection (GPS)
🌍 Fallback Location: Nairobi, Kenya
🌡️ Real-time weather updates
⏰ Hourly weather forecast (next 8 hours)
📅 5-day weather forecast
🌿 Air Quality Index (AQI)
🌅 Sunrise & 🌇 Sunset times
🔍 City search functionality
🌙 Light/Dark mode toggle
📱 Fully responsive (mobile, tablet, desktop)
⚡ Fast and lightweight UI
🛠️ Technologies Used
HTML5
CSS3 (Responsive Design + Flex/Grid)
JavaScript (Vanilla JS)
OpenWeatherMap API
🔑 API Setup

This project uses the OpenWeatherMap API.

Create an account:
https://home.openweathermap.org/api_keys
Get your API key
Replace this line in script.js:
const API_KEY = "YOUR_API_KEY_HERE";

with your key:

const API_KEY = "your_api_key_here";
📂 Project Structure
weather-app/
│
├── index.html
├── style.css
├── script.js
└── README.md
⚙️ How It Works
On page load:
The app requests device location (GPS)
If allowed:
Weather is loaded for current location
If denied:
Default location = Nairobi, KE
Users can also search any city manually
📱 Responsive Design

The app is optimized for:

📱 Mobile phones
📟 Tablets
💻 Laptops
🖥️ Large desktops
🌍 API Endpoints Used
Current Weather:
/data/2.5/weather
5-Day Forecast:
/data/2.5/forecast
Air Pollution:
/data/2.5/air_pollution