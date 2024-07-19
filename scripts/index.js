import {
  removeAndAdd,
  addClass,
  removeClass,
  addMarkup,
  getDayOfWeek,
  formatTo12Hour,
  visibilityCategory,
  getDescriptionForCode,
  degreeToDirection,
  getAQILevel,
  changeActive,
  generateWeatherUrl,
  generateAqiUrl,
  addToLocalStorage,
  getFromLocalStorage,
} from "./helpers.js";
//Global Variables

/////////////////////////////////
let isFahrenheit = false;

let currentCity = {
  id: 5128581,
  name: "New York",
  latitude: 40.71427,
  longitude: -74.00597,
  country_id: 6252001,
  country: "United States",
  admin1: "New York",
};
const dailyParams =
  "daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,apparent_temperature_min";
const hourlyParams =
  "hourly=temperature_2m,dew_point_2m,weather_code,visibility,wind_speed_10m,wind_direction_10m,apparent_temperature,relative_humidity_2m";
const savedCities = [
  { latitude: 53.900345, longitude: 27.561417, cityName: "Minsk,Belarus" },
];
const weatherCodes = [
  { code: 0, description: "Clear Sky" },
  { code: 1, description: "Clear" },
  { code: 2, description: "Partly Cloudy" },
  { code: 3, description: "Overcast" },
  { code: 45, description: "Fog" },
  { code: 48, description: "Rime fog" },
  { code: 51, description: "Light drizzle" },
  { code: 53, description: "Moderate drizzle" },
  { code: 55, description: "Dense drizzle" },
  { code: 56, description: "Light freezing drizzle" },
  { code: 57, description: "Dense freezing drizzle" },
  { code: 61, description: "Light rain" },
  { code: 63, description: "Moderate rain" },
  { code: 65, description: "Heavy rain" },
  { code: 66, description: "Light freezing rain" },
  { code: 67, description: "Heavy freezing rain" },
  { code: 71, description: "Light snow" },
  { code: 73, description: "Moderate snow" },
  { code: 75, description: "Heavy snow" },
  { code: 77, description: "Snow grains" },
  { code: 80, description: "Light showers" },
  { code: 81, description: "Moderate showers" },
  { code: 82, description: "Violent showers" },
  { code: 85, description: "Light snow showers" },
  { code: 86, description: "Heavy snow showers" },
  { code: 95, description: "Thunderstorm" },
  { code: 96, description: "Thunderstorm with light hail" },
  { code: 99, description: "Thunderstorm with heavy hail" },
];
const weatherIcons = {
  "0": "Smiling Sun.svg",
  "1": "Sun.svg",
  "2": "Partly cloudy day.svg",
  "3": "Clouds.svg",
  "45": "Fog.svg",
  "48": "Haze.svg",
  "51": "Light Rain.svg",
  "53": "Moderate Rain.svg",
  "55": "Heavy Rain.svg",
  "56": "Sleet.svg",
  "57": "Sleet.svg",
  "61": "Light Rain.svg",
  "63": "Moderate Rain.svg",
  "65": "Heavy Rain.svg",
  "66": "Sleet.svg",
  "67": "Sleet.svg",
  "71": "Light Snow.svg",
  "73": "Snow.svg",
  "75": "Snow Storm.svg",
  "77": "Hail.svg",
  "80": "Rain Cloud.svg",
  "81": "Rain.svg",
  "82": "Storm With Heavy Rain.svg",
  "85": "Snow.svg",
  "86": "Snow Storm.svg",
  "95": "Storm.svg",
  "96": "Rainfall.svg",
  "99": "Stormy Weather.svg",
  // Add more mappings as needed
};
let hourTemp;
let myChart;
const API_KEY_AQI = "4697b8a01a373672a8d9e6b8c9c3ac7d6ec8ba9e";

//init function
(function () {
  changeActive(isFahrenheit);
  createChart([29.8, 23.4, 23.5, 30.2, 28.2]);
  getLocationData();
})();
renderSavedCities(await fetchData());
///////////////////////

//theme switcher

(function () {
  const themeEl = document.querySelector(".theme-switch-wrapper");
  themeEl.addEventListener("click", toggleTheme);

  function toggleTheme() {
    const active = document.querySelector("i.active");
    const inactive = document.querySelector("i.inactive");
    removeAndAdd(active, "active", "inactive");
    removeAndAdd(inactive, "inactive", "active");
    const mask = document.querySelector(".mask");
    mask.classList.contains("animate")
      ? removeAndAdd(mask, "animate", "backAnimate")
      : removeAndAdd(mask, "backAnimate", "animate");
  }
  document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.getElementById("theme");

    themeToggle.addEventListener("click", function () {
      // Check current theme set on the body
      const currentTheme = document.body.getAttribute("data-theme");

      // Toggle the theme
      if (currentTheme === "dark") {
        document.body.setAttribute("data-theme", "light");
      } else {
        document.body.setAttribute("data-theme", "dark");
      }
    });
  });
})();

/////////////////////////////////

//Get Current date and time

function getDateAndTime() {
  const dateEl = document.querySelector(".date");
  const timeEl = document.querySelector(".time");

  const date = new Date();
  const day = date.toLocaleString("default", { weekday: "long" });
  const todaysDate = date.getDate();
  const year = date.getFullYear();
  const month = date.toDateString("default", { month: "long" }).slice(4, -8);
  setInterval(() => {
    const date = new Date();
    const time = date.toLocaleTimeString();

    timeEl.textContent = time;
  }, 1000);

  dateEl.textContent = `${day}, ${month} ${todaysDate}, ${year}`;
}
getDateAndTime();
/////////////////////////////////
//Search Input Logic
(function () {
  const list = document.querySelector(".search-results");
  const closeBtn = document.querySelector(".fa-xmark");
  const searchInput = document.querySelector(".search");
  let cityObj;

  searchInput.addEventListener("input", handleInput);
  searchInput.addEventListener("blur", handleBlur);
  searchInput.addEventListener("focus", handleFocus);
  document.addEventListener("mousedown", handleMouseDown);
  closeBtn.addEventListener("click", clearInput);
  document.addEventListener("keydown", handleKeyDown);
  function handleKeyDown(e) {
    e.key === "Enter" ? searchInput.blur() : "";
  }
  function clearInput() {
    searchInput.value = "";
    toggleVisibility();
  }
  function toggleVisibility() {
    if (searchInput.value.trim().length > 0) removeClass(closeBtn, "hidden");
    else {
      addClass(closeBtn, "hidden");
    }
  }
  function handleMouseDown(event) {
    // Check if the target of the mousedown event is not a result item
    if (!event.target.classList.contains("result")) {
      // Hide the list
      hideList();
    }
  }
  function handleBlur(e) {
    if (!e.target.classList.contains("result")) {
      hideList();
    }
    toggleVisibility();
  }
  function handleFocus(event) {
    if (event.target.value.trim().length === 0) {
      hideList();
      return;
    }
    removeClass(closeBtn, "hidden");

    const list = document.querySelector(".search-results");
    list.style.display = "flex";
  }
  function hideList() {
    const list = document.querySelector(".search-results");
    list.style.display = "none";
  }
  async function handleInput(event) {
    toggleVisibility();

    const cityName = event.target.value.trim();

    if (cityName.length >= 3) {
      clearTimeout(handleInput.timeoutId);
      handleInput.timeoutId = setTimeout(async () => {
        const resultArr = await getResults(cityName);
        renderList(resultArr.results);
      }, 300);
    }
    if (cityName.length === 0) {
      list.style.display = "none";
      list.innerHTML = "";
    }
  }

  async function getResults(cityName) {
    const URL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cityName
    )}&count=10&language=en&format=json`;

    try {
      const response = await fetch(URL);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  function renderList(data) {
    list.innerHTML = ""; // Clear previous results
    list.style.display = "flex";
    if (!data) {
      addMarkup(
        `<li class="result">
   No city found
 </li>
 `,
        list
      );
    } else {
      data.forEach((city) => {
        const markup = `<li class="result">
      <i class="fa-solid fa-location-dot result-icon"></i>${city.name}, ${city.country}
    </li>`;
        list.insertAdjacentHTML("beforeend", markup);
      });
    }
    const resultArr = [...document.querySelectorAll(".result")];
    resultArr.forEach((result) => {
      result.addEventListener("click", getCityInfo);
    });
    searchInput.removeEventListener("blur", handleBlur);

    function getCityInfo(e) {
      const index = resultArr.indexOf(e.target);
      cityObj = data[index];
      searchInput.value = cityObj.name;
      addClass(closeBtn, "hidden");
      currentCity = cityObj;
      console.log(currentCity);
      getLocationData();
      hideList();
    }
  }
})();
/////////////////////////
//For the uV index chart
(function () {
  var styleElement =
    document.querySelector("style") || document.createElement("style");
  document.head.appendChild(styleElement);

  // Define the content value
  var progressBar = document.querySelector('[role="progressbar"]');
  var progressBarStyles = getComputedStyle(progressBar);
  var value = progressBarStyles.getPropertyValue("--value");

  // Append a new CSS rule targeting the ::after pseudo-element
  styleElement.sheet.insertRule(
    '[role="progressbar"]::after { content: "' + value + '"; }',
    0
  );
})();
//Create Chart function
function createChart(data) {
  const ctx = document.getElementById("my-chart").getContext("2d");

  const config = {
    type: "line",
    data: {
      labels: ["12AM", "6AM", "12PM", "6PM", "12AM"],
      datasets: [
        {
          label: "Temperature",
          data: data,
          borderColor: "#e69a0a",
          tension: 0.5,
          backgroundColor: "#e69a0a",
          pointHoverBorderColor: "white",
        },
      ],
    },
    options: {
      scales: {
        x: {
          grid: {
            display: false, // Hide x-axis gridlines
            color: "red",
          },
        },
        y: {
          grid: {
            display: false, // Hide y-axis gridlines
          },
          ticks: {
            // display: false, // Hide y-axis ticks
          },
        },
      },
      plugins: {
        tooltip: {
          backgroundColor: "red", // Tooltip background color
        },
      },
    },
  };

  // Create a new chart instance
  myChart = new Chart(ctx, config);
}

async function getLocationData() {
  let dataReceived, secondaryDataRec, aqiDataRec;

  async function fetchWeatherData(currentCity) {
    try {
      // Construct URLs
      const weatherUrl = generateWeatherUrl(
        currentCity.latitude,
        currentCity.longitude,
        dailyParams
      );

      const secondaryUrl = generateWeatherUrl(
        currentCity.latitude,
        currentCity.longitude,
        hourlyParams
      );
      const aqiUrl = generateAqiUrl(currentCity.name, API_KEY_AQI);

      // Fetch data from all endpoints concurrently
      const [
        weatherResponse,
        secondaryResponse,
        aqiResponse,
      ] = await Promise.all([
        fetch(weatherUrl),
        fetch(secondaryUrl),
        fetch(aqiUrl),
      ]);

      // Check if responses are OK
      if (!weatherResponse.ok || !secondaryResponse.ok || !aqiResponse.ok) {
        throw new Error("Failed to fetch one or more API endpoints");
      }

      // Parse JSON data
      dataReceived = await weatherResponse.json();
      secondaryDataRec = await secondaryResponse.json();
      aqiDataRec = await aqiResponse.json();
      return dataReceived, secondaryDataRec, aqiDataRec;
      // Return or process the data as needed
    } catch (error) {
      console.error("Error fetching weather data:", error);
      // Handle the error appropriately
      throw error;
    }
  }
  await fetchWeatherData(currentCity);
  console.log(dataReceived);
  const currentTimeZone = currentCity.timezone;
  const hourlyData = secondaryDataRec.hourly;
  const dailyData = dataReceived.daily;
  const aqiValue = aqiDataRec.data.aqi;

  ///////////////////////////////
  const weekArr = dailyData.time;
  const dailyTempCodesArr = dailyData.temperature_2m_max;
  const dailyWeatherCodesArr = dailyData.weather_code;
  /////////////////////////////
  const {
    sunrise: [sunriseTime],
    sunset: [sunsetTime],
  } = dailyData;

  const {
    weather_code: [currentWeatherCode],
    temperature_2m: [currentTemp],
    apparent_temperature: [feelsLike],
    wind_speed_10m: [windSpeed],
    wind_direction_10m: [windDirection],
    relative_humidity_2m: [humidity],
    dew_point_2m: [duePoint],
    visibility: [visibility],
    temperature_2m: hourTemp,
  } = hourlyData;
  /////////////////////////////
  // Prediction for the next 7 days
  const weatherContainer = document.querySelector(".weekly-weather");
  weatherContainer.innerHTML = "";
  for (const [index, card] of dailyTempCodesArr.entries()) {
    const html = `<div class="daily-card shadow flex ai-c jc-c column">
              <div class="day">${getDayOfWeek(weekArr[index]).slice(0, 3)}</div>
              <img src="./WeatherIcons/${
                weatherIcons[dailyWeatherCodesArr[index]]
              }" alt="" class="daily-weather-icon">
              <div class="daily-weather-temp">${Math.floor(card)} °C</div>
            </div>`;
    weatherContainer.insertAdjacentHTML("beforeEnd", html);
  }
  /////////////////////////////

  function updateSections(containers, htmls) {
    if (containers.length !== htmls.length) {
      console.error("Containers and HTMLs arrays must have the same length.");
      return;
    }

    containers.forEach((container, index) => {
      const element = document.querySelector(container);
      if (element) {
        element.innerHTML = htmls[index];
      } else {
        console.warn(`Element with selector "${container}" not found.`);
      }
    });
  }

  // Usage Example

  const containers = [
    ".weather-card",
    ".wind",
    ".sun",
    ".humidityBox",
    ".visibilityBox",
    ".aqi",
  ];

  const htmls = [
    `
      <div class="image-container flex ai-c jc-sb">
      <img class="weather-icon" src="./WeatherIcons/${
        weatherIcons[currentWeatherCode]
      }" alt="">
    
      </div>
      <div class="weather-info flex">
        <p class="city-name">${currentCity.name},${currentCity.country}</p>
        <p class="weather-type">${getDescriptionForCode(currentWeatherCode)}</p>
        <p class="feels-like">Feels Like ${Math.floor(feelsLike)} ° C</p>
      </div>
      <p class="weather-reading">${Math.floor(
        currentTemp
      )}<span class="weather-unit">°C</span></p>
    `,

    `
      <div class="status-card-title">Wind Status</div>
      <div class="wind-value">${windSpeed} <span>km/h</span></div>
      <p class="wind-info">${degreeToDirection(windDirection)}</p>
    `,
    `
      <div class="status-card-title">Sunset and Sunrise</div>
      <div class="sun-container flex column">
        <div class="sunrise flex ai-c">
          <div class="sunrise-icon">
            <i class="fa-solid fa-arrow-up"></i>
          </div>
          <p class="sunrise-time">${formatTo12Hour(
            sunriseTime,
            currentTimeZone
          )}</p>
        </div>
        <div class="sundown flex ai-c">
          <div class="sundown-icon">
            <i class="fa-solid fa-arrow-down"></i>
          </div>
          <p class="sundown-time">${formatTo12Hour(
            sunsetTime,
            currentTimeZone
          )}</p>
        </div>
      </div>
    `,
    `
      <div class="status-card-title">Humidity</div>
      <p class="humidity">${humidity}<span>%</span></p>
      <p>The dew point is ${Math.floor(duePoint)}°C</p>
    `,
    `
      <div class="status-card-title">Visibility</div>
      <p class="visibility">${visibility / 1000} <span>km</span></p>
      <p>${visibilityCategory(visibility / 1000)}</p>
    `,
    `
      <div class="status-card-title">Air Quality Index</div>
      <p class="air-quality">${aqiValue}</p>
      <p>Air Quality is ${getAQILevel(aqiValue)}.</p>
    `,
  ];

  updateSections(containers, htmls);
  ////////////////////////////////////////////////////
  // Select the element with class 'uv'
  const uvElement = document.querySelector(".uv");

  // Function to update the value of '--value'
  function updateValue(value) {
    uvElement.style.setProperty("--value", value);

    // Optionally update aria attributes and inner text based on the value
    uvElement.setAttribute("aria-valuenow", value);
    uvElement.innerText = value; // Update inner text with value
  }

  updateValue(dataReceived.daily.uv_index_max[0]);

  ////////////////////////////////////////////
  const hourTempMod = hourTemp.slice(0, 25).filter((_, i) => i % 6 === 0);
  myChart.destroy();
  createChart(hourTempMod);
}
////////////////////

async function fetchData() {
  let urls = [...savedCities];
  const citiesName = urls.map(({ cityName: city }) => city);
  urls = urls.map(({ latitude: lat, longitude: lon }) => {
    return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code`;
  });
  try {
    // Create an array of fetch promises
    const fetchPromises = urls.map((url) => fetch(url));

    // Use Promise.all to run them in parallel
    const responses = await Promise.all(fetchPromises);

    // Check if all responses are ok
    const jsonPromises = responses.map((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });

    // Wait for all JSON promises to resolve
    let data = await Promise.all(jsonPromises);
    data = data.map((data, i) => {
      return { ...data, city: citiesName[i] };
    });

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}


function renderSavedCities(data) {
  const citiesContainer = document.querySelector(".cities-container");
  citiesContainer.innerHTML = "";

  const cityCardsHTML = data
    .map(
      ({
        hourly: {
          weather_code: [weather],
          temperature_2m: [temperature],
        },
        city,
      }) => {
        const weatherCodeDesc = weatherCodes[weather];
        const weatherIcon = weatherIcons[weather];

        return `
      <div class="cities-card flex jc-sb ai-c">
        <img class="weather-icon" src="./WeatherIcons/${weatherIcon}" alt="Weather icon for ${city}" />
        <div class="container">
          <p class="city name">${city}</p>
          <p class="weather-type">${weatherCodeDesc.description}</p>
        </div>
        <div class="weather-reading">${temperature}°</div>
      </div>
    `;
      }
    )
    .join("");

  citiesContainer.innerHTML = cityCardsHTML;
}
