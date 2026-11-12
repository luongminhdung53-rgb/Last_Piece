import { requireAuth } from './firebase-config.js';

const API_KEY = "f7621194aa6137394a5d542626439a34";

requireAuth();

const weatherForm = document.getElementById("weather-form");
const locationInput = document.getElementById("location-input");
const deviceLocationBtn = document.getElementById("device-location-btn");

const weatherResult = document.getElementById("weather-result");
const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const weatherDesc = document.getElementById("weather-desc");

weatherForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const location = locationInput.value.trim();
  if (location) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${API_KEY}`;
    fetchWeatherData(url);
  }
});

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

function displayWeather(data) {
  cityName.innerText = `${data.name}, ${data.sys.country}`;
  temperature.innerText = `${Math.round(data.main.temp)}°C`;
  weatherDesc.innerText = data.weather[0].description;
  weatherResult.classList.remove("hidden");
}