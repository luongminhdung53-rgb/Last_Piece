import { requireAuth } from './firebase-config.js';

// OpenWeatherMap API key used to request live weather data
const API_KEY = "f7621194aa6137394a5d542626439a34";

// Redirects to Sign_in.html if no user is logged in
requireAuth();

// Grab the form, search input, GPS button, and result display elements from weather.html
const weatherForm = document.getElementById("weather-form");
const locationInput = document.getElementById("location-input");
const deviceLocationBtn = document.getElementById("device-location-btn");

const weatherResult = document.getElementById("weather-result");
const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const weatherDesc = document.getElementById("weather-desc");

// When the user types a city name and submits, build the API URL and fetch weather
weatherForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const location = locationInput.value.trim();
  if (location) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${API_KEY}`;
    fetchWeatherData(url);
  }
});

// When the user clicks "Use My Location", get GPS coordinates and fetch weather for them
deviceLocationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
        fetchWeatherData(url);
      },
      () => {
        alert("Unable to retrieve your location. Please allow location access.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});

// ============================================================================
// [GETS DATA FROM WEATHER API] Sends HTTP request and parses JSON response
// ============================================================================
function fetchWeatherData(url) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Location not found or API request failed");
      }
      return response.json();
    })
    .then((data) => displayWeather(data))
    .catch((error) => alert(error.message));
}

// ============================================================================
// [PUTS DATA OUT TO WEBSITE] Displays city, temperature, and condition on page
// ============================================================================
function displayWeather(data) {
  cityName.innerText = `${data.name}, ${data.sys.country}`;
  temperature.innerText = `${Math.round(data.main.temp)}°C`;
  weatherDesc.innerText = data.weather[0].description;
  weatherResult.classList.remove("hidden");
}