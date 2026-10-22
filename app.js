const API_KEY = 'c762fe90a48c894bea8e7a690710bb09';

/* =========================
   FETCH WEATHER DATA
========================= */

async function fetchWeatherData(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        if (!response.ok) throw new Error('City not found');
        return await response.json();
    } catch (error) {
        throw error;
    }
}

async function fetchForecastData(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        if (!response.ok) throw new Error('Forecast data unavailable');
        return await response.json();
    } catch (error) {
        throw error;
    }
}

async function fetchAirQuality(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        if (!response.ok) throw new Error('Air quality data unavailable');
        return await response.json();
    } catch (error) {
        console.error('AQI error:', error);
        return null;
    }
}

/* =========================
   HELPERS
========================= */

function getAQIStatus(aqi) {
    const statuses = {
        1: { text: 'Good', color: '#00e676' },
        2: { text: 'Fair', color: '#ffeb3b' },
        3: { text: 'Moderate', color: '#ff9800' },
        4: { text: 'Poor', color: '#ff5722' },
        5: { text: 'Very Poor', color: '#f44336' }
    };
    return statuses[aqi] || { text: 'Unknown', color: '#fff' };
}

function getWeatherIcon(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

/* =========================
   MAIN UPDATE
========================= */

async function updateWeather(city = 'Nairobi') {
    const weatherContent = document.getElementById('weatherContent');
    weatherContent.innerHTML = '<div class="loading">Loading weather data...</div>';

    try {
        const weatherData = await fetchWeatherData(city);
        const { lat, lon } = weatherData.coord;

        const [forecastData, airQualityData] = await Promise.all([
            fetchForecastData(lat, lon),
            fetchAirQuality(lat, lon)
        ]);

        displayWeather(weatherData, forecastData, airQualityData);

    } catch (error) {
        weatherContent.innerHTML = `<div class="error">❌ ${error.message}. Try again.</div>`;
    }
}

/* =========================
   DEVICE LOCATION (NEW DEFAULT)
========================= */

function getCurrentLocation() {
    const fallbackCity = "Nairobi";

    if (!navigator.geolocation) {
        updateWeather(fallbackCity);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                );

                const data = await response.json();

                updateWeather(data.name || fallbackCity);

            } catch (error) {
                console.error(error);
                updateWeather(fallbackCity);
            }
        },
        () => {
            // user denied location
            updateWeather(fallbackCity);
        },
        {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0
        }
    );
}

/* =========================
   DISPLAY UI (UNCHANGED LOGIC)
========================= */

function displayWeather(weatherData, forecastData, airQualityData) {
    const weatherContent = document.getElementById('weatherContent');

    const current = weatherData;
    const temp = Math.round(current.main.temp);
    const feelsLike = Math.round(current.main.feels_like);
    const humidity = current.main.humidity;
    const windSpeed = current.wind.speed;
    const pressure = current.main.pressure;
    const description = current.weather[0].description;
    const icon = getWeatherIcon(current.weather[0].icon);

    let aqiHtml = '';
    if (airQualityData) {
        const aqi = airQualityData.list[0].main.aqi;
        const aqiInfo = getAQIStatus(aqi);

        aqiHtml = `
            <div class="aqi-container">
                <h3>🌿 Air Quality Index</h3>
                <div class="aqi-value" style="color:${aqiInfo.color}">
                    ${aqiInfo.text}
                </div>
                <div class="aqi-status">AQI: ${aqi}/5</div>
                <div>
                    PM2.5: ${airQualityData.list[0].components.pm2_5} µg/m³ |
                    PM10: ${airQualityData.list[0].components.pm10} µg/m³
                </div>
            </div>
        `;
    }

    const hourlyList = forecastData.list.slice(0, 8);

    const hourlyHtml = `
        <div class="section-title">📊 Hourly Forecast</div>
        <div class="hourly-container">
            ${hourlyList.map(hour => `
                <div class="hourly-card">
                    <div class="hourly-time">${formatTime(hour.dt)}</div>
                    <img src="${getWeatherIcon(hour.weather[0].icon)}" width="50">
                    <div>${Math.round(hour.main.temp)}°C</div>
                </div>
            `).join('')}
        </div>
    `;

    const dailyMap = new Map();

    forecastData.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyMap.has(date)) dailyMap.set(date, item);
    });

    const dailyList = Array.from(dailyMap.values()).slice(1, 6);

    const dailyHtml = `
        <div class="section-title">📅 5-Day Forecast</div>
        <div class="daily-container">
            ${dailyList.map(day => `
                <div class="daily-card">
                    <div>${formatDate(day.dt)}</div>
                    <div>${Math.round(day.main.temp_min)}° / ${Math.round(day.main.temp_max)}°C</div>
                    <div>${day.weather[0].description}</div>
                </div>
            `).join('')}
        </div>
    `;

    const sunrise = new Date(current.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(current.sys.sunset * 1000).toLocaleTimeString();

    weatherContent.innerHTML = `
        <div class="weather-main">
            <div class="location">📍 ${current.name}, ${current.sys.country}</div>
            <img src="${icon}" width="100">
            <div class="temp">${temp}°C</div>
            <div class="feels-like">
                Feels like ${feelsLike}°C • ${description}
            </div>

            <div class="weather-details">
                <div class="detail-card">💧 ${humidity}%</div>
                <div class="detail-card">💨 ${windSpeed} m/s</div>
                <div class="detail-card">🔽 ${pressure} hPa</div>
                <div class="detail-card">🌅 ${sunrise}</div>
                <div class="detail-card">🌇 ${sunset}</div>
            </div>
        </div>

        ${hourlyHtml}
        ${dailyHtml}
        ${aqiHtml}
    `;
}

/* =========================
   SEARCH
========================= */

async function searchCity() {
    const input = document.getElementById('cityInput');
    const city = input.value.trim();

    if (city) {
        await updateWeather(city);
        input.value = '';
    }
}

/* =========================
   THEME
========================= */

function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

/* =========================
   AUTO START (UPDATED)
========================= */

window.onload = () => {
    getCurrentLocation(); // GPS first → fallback Nairobi
};