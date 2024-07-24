import {
  removeAndAdd, // Function to remove an item from a list and add a new item
  addClass, // Function to add a CSS class to an element
  removeClass, // Function to remove a CSS class from an element
  addMarkup, // Function to add HTML markup to an element
  getDayOfWeek, // Function to get the day of the week for a given date
  formatTo12Hour, // Function to format a time in 12-hour format
  visibilityCategory, // Function to determine the visibility category based on certain conditions
  getDescriptionForCode, // Function to get a description for a specific code
  degreeToDirection, // Function to convert a degree value to its corresponding cardinal direction
  getAQILevel, // Function to determine the Air Quality Index (AQI) level
  generateWeatherUrl, // Function to generate a URL for weather information
  generateAqiUrl, // Function to generate a URL for AQI information
  addToLocalStorage, // Function to add an item to local storage
  getFromLocalStorage, // Function to retrieve an item from local storage
  changeReadingUnit, // Function to change the reading unit (e.g., from Celsius to Fahrenheit)
  celsiusToFahrenheit, // Function to convert Celsius to Fahrenheit
  shownotif, // Function to display a notification
} from "./helpers.js";
//Global Variables

/////////////////////////////////
// Variable to store the temperature format (e.g., Celsius or Fahrenheit)
let hourTempMod;
// Boolean flag indicating whether the temperature is in Fahrenheit
let isFahrenheit = false;
// Chart instance for displaying data (e.g., weather chart)
let myChart;
// Array to hold the list of saved cities
let savedCities = [];
// Default Object representing the current city with its details
let currentCityObj = {
  name: "New York", // Name of the city
  latitude: 40.71427, // Latitude of the city
  longitude: -74.00597, // Longitude of the city
  country: "United States", // Country where the city is located
  country_code: "usa", // Country code for the city
};
// Parameters for requesting daily weather data
const dailyParams =
  "daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,apparent_temperature_min";

// Parameters for requesting hourly weather data
const hourlyParams =
  "hourly=temperature_2m,dew_point_2m,weather_code,visibility,wind_speed_10m,wind_direction_10m,apparent_temperature,relative_humidity_2m";
let reading=[]
//Mapped weather codes
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
//Mapped weather icons

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
};
//AQI API KEY
const API_KEY_AQI = "4697b8a01a373672a8d9e6b8c9c3ac7d6ec8ba9e";

//init function

(function () {
  // Check local storage for saved data related to the current city and run the appropriate function
  checkLocalStorageAndRun("savedCurrentCity");
  // Create a chart with initial empty data
  createChart([]);
  // Change the active state, passing current temperature unit (Fahrenheit),
  // function to get location data, and the current city object
  changeActive(isFahrenheit, getLocationData, currentCityObj);
})();

///////////////////////

//theme switcher
function toggleTheme() {
  // Select the currently active icon element
  const active = document.querySelector("i.active");
  // Select the currently inactive icon element
  const inactive = document.querySelector("i.inactive");
  // Toggle the "active" and "inactive" classes between the active and inactive icons
  removeAndAdd(active, "active", "inactive");
  removeAndAdd(inactive, "inactive", "active");
  // Select the element with the class "mask"
  const mask = document.querySelector(".mask");
  // Toggle the animation classes on the mask element
  mask.classList.contains("animate")
    ? // If the mask has the "animate" class, replace it with "backAnimate"
      removeAndAdd(mask, "animate", "backAnimate")
    : // Otherwise, replace the "backAnimate" class with "animate"
      removeAndAdd(mask, "backAnimate", "animate");
}
///////////////////////////////////////
//Attaching Event Handler to the wrapper
///////////////////////////////////////
// Select the element that wraps the theme switch
const themeEl = document.querySelector(".theme-switch-wrapper");
// Add a click event listener to the theme switch element, which triggers the toggleTheme function
themeEl.addEventListener("click", toggleTheme);
// Wait until the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Select the theme toggle element
  const themeToggle = document.getElementById("theme");
  // Add a click event listener to the theme toggle element
  themeToggle.addEventListener("click", function () {
    // Check the current theme set on the theme toggle element (data attribute)
    const currentTheme = themeToggle.dataset.theme;
    // Toggle the theme based on the current value
    if (currentTheme === "light") {
      // If the current theme is light, switch to dark
      themeToggle.dataset.theme = "dark";
      document.body.setAttribute("data-theme", "dark");
    } else if (currentTheme === "dark") {
      // If the current theme is dark, switch to light
      themeToggle.dataset.theme = "light";
      document.body.setAttribute("data-theme", "light");
    }
    // Save the current theme to local storage
    addToLocalStorage("theme", themeToggle.dataset.theme);
  });
});

// Load a saved theme (dark/light) from local storage and apply it
function savedThemeLoader() {
  // Select the theme toggle element
  const themeToggle = document.getElementById("theme");
  // Retrieve the saved theme from local storage or default to "light" if not found
  const theme = getFromLocalStorage("theme") || "light";
  // Get the current theme from the data attribute of the theme toggle element or default to "light"
  const currentTheme = themeToggle.dataset.theme || "light";

  // If the saved theme is different from the current theme
  if (currentTheme !== theme) {
    // Set the theme on the document body
    document.body.setAttribute("data-theme", theme);

    // Update the data attribute of the theme toggle element to reflect the saved theme
    themeToggle.dataset.theme = theme;
    // Call the toggleTheme function to switch the active state on readings
    toggleTheme();
  }
}

/////////////////////////
function changeActive(variable, getLocationData, currentCityObj) {
  // Select all elements with the class "temperature"
  const tempEl = document.querySelectorAll(".temperature");

  // Add a click event listener to each temperature element
  tempEl.forEach((temp) => {
    return temp.addEventListener("click", changeActiveVal);
  });

  // Function to handle the change of active temperature unit
  function changeActiveVal(e) {
    // Remove the "current" class from all temperature elements
    tempEl.forEach((temp) => {
      removeClass(temp, "current");
    });

    // Add the "current" class to the clicked temperature element
    addClass(e.target, "current");

    // Update the `variable` based on the clicked element's ID
    e.target.id === "Fahrenheit" ? (variable = true) : (variable = false);

    // If the selected temperature unit is Fahrenheit
    if (variable) {
      // Save the selection to local storage
      addToLocalStorage("isFahrenheit", variable);

      // Retrieve the saved Celsius reading from local storage
      const savedReading = getFromLocalStorage("celsiusReading");

      // Select all elements with the class "reading"
      const readingEl = document.querySelectorAll(".reading");

      // Update the text content of each reading element with Fahrenheit values
      readingEl.forEach((reading, index) => {
        reading.textContent = `${celsiusToFahrenheit(savedReading[index])} °F`;
      });

      // Destroy the existing chart instance
      myChart.destroy();

      // Create a new chart with Fahrenheit temperature data
      createChart(hourTempMod.map((temp) => celsiusToFahrenheit(temp)));
    } else {
      // If the selected temperature unit is Celsius
      let isFahrenheit = getFromLocalStorage("isFahrenheit");
      isFahrenheit = false;
      // Save the updated temperature unit to local storage
      addToLocalStorage("isFahrenheit", isFahrenheit);

      // Fetch location data for the currently saved city to render HTML
      getLocationData(getFromLocalStorage("savedCurrentCity"));
    }
  }
}

/////////////////////////////////

// Get and display the current date and time
function getDateAndTime() {
  // Select the elements where date and time will be displayed
  const dateEl = document.querySelector(".date");
  const timeEl = document.querySelector(".time");

  // Get the current date
  const date = new Date();

  // Format the day, month, date, and year
  const day = date.toLocaleString("default", { weekday: "long" });
  const todaysDate = date.getDate();
  const year = date.getFullYear();
  const month = date.toLocaleString("default", { month: "long" });

  // Update the date element with the formatted date
  dateEl.textContent = `${day}, ${month} ${todaysDate}, ${year}`;

  // Update the time element every second
  setInterval(() => {
    const now = new Date();
    const time = now.toLocaleTimeString();
    timeEl.textContent = time;
  }, 1000);
}

// Call the function to initialize date and time display
getDateAndTime();
/////////////////////////////////
//Search Input Logic
(function () {
  // Cache DOM elements
  const list = document.querySelector(".search-results");
  const closeBtn = document.querySelector(".fa-xmark");
  const searchInput = document.querySelector(".search");
  const locationIcon = document.querySelector(".location-icon");
  let cityObj;

  // Event listeners
  locationIcon.addEventListener("click", () =>
    requestLocationPermission(getLocationData)
  );
  searchInput.addEventListener("input", handleInput);
  searchInput.addEventListener("blur", handleBlur);
  searchInput.addEventListener("focus", handleFocus);
  document.addEventListener("mousedown", handleMouseDown);
  closeBtn.addEventListener("click", clearInput);
  document.addEventListener("keydown", handleKeyDown);

  // Handle Enter key press to blur the search input
  function handleKeyDown(e) {
    if (e.key === "Enter") searchInput.blur();
  }

  // Clear the search input and hide the close button
  function clearInput() {
    searchInput.value = "";
    toggleVisibility();
  }

  // Toggle visibility of the close button based on input value
  function toggleVisibility() {
    searchInput.value.trim().length > 0
      ? removeClass(closeBtn, "hidden")
      : addClass(closeBtn, "hidden");
  }

  // Hide the search results list if the click is outside of result items
  function handleMouseDown(event) {
    if (!event.target.classList.contains("result")) {
      hideList();
    }
  }

  // Hide the results list and update close button visibility on input blur
  function handleBlur(e) {
    if (!e.target.classList.contains("result")) {
      hideList();
    }
    toggleVisibility();
  }

  // Show the results list and manage close button visibility on input focus
  function handleFocus(event) {
    if (event.target.value.trim().length === 0) {
      hideList();
      return;
    }
    removeClass(closeBtn, "hidden");
    list.style.display = "flex";
  }

  // Hide the search results list
  function hideList() {
    list.style.display = "none";
  }

  // Handle input changes with debouncing
  async function handleInput(event) {
    toggleVisibility();
    const cityName = event.target.value.trim();

    if (cityName.length >= 3) {
      clearTimeout(handleInput.timeoutId);
      handleInput.timeoutId = setTimeout(async () => {
        const resultArr = await getResults(cityName);
        renderList(resultArr?.results);
      }, 300);
    } else if (cityName.length === 0) {
      hideList();
      list.innerHTML = "";
    }
  }
  //Var for results per search count
  const resultsPerSearch = 10;
  // Fetch search results from the API
  async function getResults(cityName) {
    const URL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cityName
    )}&count=${count}&language=en&format=json`;

    try {
      const response = await fetch(URL);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // Render the search results in the list
  function renderList(data) {
    list.innerHTML = ""; // Clear previous results
    list.style.display = "flex";

    if (!data || data.length === 0) {
      addMarkup('<li class="result">No city found</li>', list);
    } else {
      data.forEach((city) => {
        const markup = `
          <li class="result">
            <i class="fa-solid fa-location-dot result-icon"></i>${city.name}, ${city.country}
          </li>`;
        list.insertAdjacentHTML("beforeend", markup);
      });
    }

    // Add click event listeners to result items
    const resultArr = [...document.querySelectorAll(".result")];
    resultArr.forEach((result) => {
      result.addEventListener("click", getCityInfo);
    });

    // Remove the blur event listener after focusing
    searchInput.removeEventListener("blur", handleBlur);

    // Handle selection of a city from the search results
    function getCityInfo(e) {
      const index = resultArr.indexOf(e.target);
      cityObj = data[index];
      searchInput.value = "";
      addClass(closeBtn, "hidden");
      currentCityObj = cityObj;
      getLocationData(currentCityObj);
      addToLocalStorage("savedCurrentCity", currentCityObj);
      hideList();
    }
  }
})();

/////////////////////////
//For the uV index chart
(function () {
  let styleElement =
    document.querySelector("style") || document.createElement("style");
  document.head.appendChild(styleElement);
})();
// Create a line chart with temperature data
function createChart(data) {
  // Select the container element for the chart and clear its content
  const container = document.querySelector(".graph-card");
  container.innerHTML = '<canvas id="my-chart" width="200px" height="100px"></canvas>';

  // Get the 2D rendering context of the canvas element
  const ctx = document.getElementById("my-chart").getContext("2d");

  // Define the chart configuration
  const config = {
    type: "line", // Type of chart
    data: {
      // Labels for the x-axis
      labels: ["12AM", "6AM", "12PM", "6PM", "12AM"],
      datasets: [
        {
          label: "Temperature", // Dataset label
          data: data, // Data points for the chart
          borderColor: "#e69a0a", // Line color
          tension: 0.5, // Line tension (smoothness)
          backgroundColor: "#e69a0a", // Background color of the line
          pointHoverBorderColor: "white", // Border color of points on hover
        },
      ],
    },
    options: {
      scales: {
        x: {
          grid: {
            display: false, // Hide x-axis gridlines
            color: "red", // Gridline color (set to red for demonstration, can be removed or adjusted)
          },
        },
        y: {
          grid: {
            display: false, // Hide y-axis gridlines
          },
          ticks: {
            // Display of y-axis ticks (commented out, can be enabled if needed)
          },
        },
      },
      plugins: {
        tooltip: {
          backgroundColor: "black", // Tooltip background color
        },
      },
    },
  };

  // Create a new chart instance
  myChart = new Chart(ctx, config);
}

//Renders weather currentCity

async function getLocationData(cityObj) {
  let dataReceived, secondaryDataRec, aqiDataRec;

  try {
    // Construct URLs
    const weatherUrl = generateWeatherUrl(
      cityObj.latitude,
      cityObj.longitude,
      dailyParams
    );

    const secondaryUrl = generateWeatherUrl(
      cityObj.latitude,
      cityObj.longitude,
      hourlyParams
    );
    const aqiUrl = generateAqiUrl(cityObj.name, API_KEY_AQI);

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
  } catch (error) {
    console.error("Error fetching weather data:", error);
    // Handle the error appropriately
    throw error;
  }

  const currentTimeZone = cityObj.timezone;
  const hourlyData = secondaryDataRec.hourly;
  const dailyData = dataReceived.daily;
  const aqiValue = aqiDataRec.data.aqi || "N/A";

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
              <div class="daily-weather-temp reading">${Math.floor(
                card
              )} °C</div>
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
    ".uv-card",
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
        <p class="city-name">${cityObj.name},${cityObj.country}</p>
        <p class="weather-type">${getDescriptionForCode(currentWeatherCode)}</p>
        <p class="feels-like">Feels Like <span class="reading">  ${Math.floor(
          feelsLike
        )} °C</span></p>
      </div>
      <p class="weather-reading reading">${Math.floor(currentTemp)} ${
      isFahrenheit ? "°F" : "°C"
    }
    `,
    ` <div class="status-card-title">UV Index</div>
              <div
                class="uv"
                role="progressbar"
                aria-valuenow="33"
                aria-valuemin="0"
                aria-valuemax="100"
                style="--value: "
              ></div>`,
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
      <p >The dew point is 
      <span class='reading'> ${Math.floor(duePoint)} °C</span></p>
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
  hourTempMod = hourTemp.slice(0, 25).filter((_, i) => i % 6 === 0);
  myChart.destroy();
  createChart(hourTempMod);
  async function fetchData() {
    savedCities = getFromLocalStorage("savedCityData") || savedCities;
    if (savedCities.length === 0) return;
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
    if (!data) {
      document.querySelector(".saved-cities").classList.add("hidden");
      return;
    }
    const cityCardsHTML = data
      .map(
        ({
          hourly: {
            weather_code: [weather],
            temperature_2m: [temperature],
          },
          city,
        }) => {
          const weatherCodeDesc = getDescriptionForCode(weather);
          const weatherIcon = weatherIcons[weather];

          return `
        <div class="cities-card shadow flex jc-sb ai-c">
          <img class="weather-icon" src="./WeatherIcons/${weatherIcon}" alt="Weather icon for ${city}" />
          <div class="container">
            <p class="city name">${city}</p>
            <p class="weather-type">${weatherCodeDesc}</p>
          </div>
          <div class="weather-reading reading">${Math.floor(
            temperature
          )} °C</div>
          <i class="fa-solid fa-trash delete-icon pointer"></i>
        </div>
      `;
        }
      )
      .join("");

    citiesContainer.innerHTML = cityCardsHTML;
    const citesCard = document.querySelectorAll(".cities-card");
    citesCard.forEach((card) =>
      card.addEventListener("click", renderSavedCityInfo)
    );

    function renderSavedCityInfo(e) {
      let container = e.target.closest(".cities-card").children[1];
      let cityName = container.querySelector(".city").textContent;
      const savedArr = getFromLocalStorage("savedCityData");
      const matchedCity = savedArr.find((city) => {
        return city.cityName === cityName;
      });
      getLocationData(matchedCity);
      addToLocalStorage("savedCurrentCity", matchedCity);
    }

    const deleteBtns = document.querySelectorAll(".delete-icon");
    deleteBtns.forEach((btn) =>
      btn.addEventListener("click", deleteAndRenderSavedCity)
    );

    function deleteAndRenderSavedCity(e) {
      e.stopPropagation();
      const cityName = e.target.parentElement.querySelector(".city")
        .textContent;
      const savedArr = getFromLocalStorage("savedCityData");
      const matchedCityIndex = savedArr.findIndex(
        (city) => city.cityName === cityName
      );

      if (matchedCityIndex !== -1) {
        e.target.parentElement.classList.add("delete");
        savedArr.splice(matchedCityIndex, 1); // This modifies savedArr in place
        addToLocalStorage("savedCityData", savedArr);
      }

      setTimeout(async function () {
        try {
          const response = await fetchData(); // Fetch the data
          renderSavedCities(response); // Render the saved cities
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }, 2000); // Delay in milliseconds (1000ms = 1 second)
    }
  }
  renderSavedCities(await fetchData());

  reading = document.querySelectorAll(".reading");

  const readingValue = [...reading].map((reading) =>
    parseInt(reading.textContent.replace(/[^\d]/g, ""))
  );
  addToLocalStorage("celsiusReading", readingValue);

  if (getFromLocalStorage("isFahrenheit")) {
    changeReadingUnit();
    myChart.destroy();
    createChart(hourTempMod.map((temp) => celsiusToFahrenheit(temp)));

    const celsius = document.getElementById("celsius");
    const fahrenheit = document.getElementById("Fahrenheit");
    removeClass(celsius, "current");
    addClass(fahrenheit, "current");
  }
  savedThemeLoader();
}
////////////////////
//Fn for requesting location permission as the app loads
async function requestLocationPermission() {
  // Check if geolocation is supported by the browser
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // On success, extract latitude and longitude from the position object
        const { latitude, longitude } = position.coords;
        // Process the location data
        await processLocation({ latitude, longitude });
      },
      (error) => {
        // On error, use default data and create a sample chart
        getLocationData(currentCityObj);
        createChart([29.8, 23.4, 23.5, 30.2, 28.2]);

        // Handle cases where permission is denied or an error occurs
      }
    );
  } else {
    // Handle the case where geolocation is not supported
    console.error("Geolocation is not supported by this browser.");
  }

  // Function to process the location data
  async function processLocation({ latitude, longitude }) {
    // Fetch location information using OpenStreetMap Nominatim API
    const countryInfo = await (
      await fetch(
        `https://nominatim.openstreetmap.org/reverse.php?lat=${latitude}&lon=${longitude}8&zoom=10&format=jsonv2`
      )
    ).json();
    
    // Extract city, country, and country code from the fetched data
    const { city, country, country_code } = countryInfo.address;

    // Update the current city object with the new location data
    currentCityObj = {
      ...currentCityObj,
      name: city,
      country,
      longitude,
      latitude,
      country_code,
    };

    // Save the updated city object to local storage
    addToLocalStorage("savedCurrentCity", currentCityObj);
    
    // Fetch and render the location data
    getLocationData(currentCityObj);
    renderSavedCities(await fetchData());
  }
}

//Fn to check local storage for a saved key(in our case if any savedCurrentCity)
function checkLocalStorageAndRun(key) {
  const dataKey = key; // Use the provided key to access local storage
  const storedData = localStorage.getItem(dataKey); // Retrieve data from local storage using the key
  
  if (storedData !== null) {
    // If data is found in local storage, run this function
    getLocationData(getFromLocalStorage("savedCurrentCity"));
  } else {
    // If no data is found, request location permission from the user
    requestLocationPermission();
  }
}

//For Storing cities to favorite and local storage
function addCityToSaved() {
  // Check if there is no saved city data in local storage
  if (!getFromLocalStorage("savedCityData")) {
    // Add the current city to local storage
    addToLocalStorage("savedCurrentCity", currentCityObj);
    
    // Initialize saved cities in local storage
    addToLocalStorage("savedCityData", savedCities);
  }

  // Destructure the necessary properties from the saved current city object
  const {
    name,
    country_code,
    longitude,
    latitude,
    country,
  } = getFromLocalStorage("savedCurrentCity");

  // Create a data object for the city to be added
  const data = {
    name,
    cityName: `${name}, ${country_code.toUpperCase()}`, // Format the city name with country code
    longitude,
    latitude,
    country,
    country_code,
  };

  // Check if there are already saved cities
  if (savedCities.length > 0) {
    // Check if the city is already present in the saved cities
    const cityAlreadyPresent = savedCities.some(
      (city) => city.cityName === data.cityName
    );

    // Show a notification based on whether the city is already added or not
    cityAlreadyPresent
      ? shownotif("warn", "City already added")
      : shownotif("success", "City added to favorites");

    // Update the list of saved cities, ensuring no duplicates
    savedCities = Array.from(
      new Set([...savedCities, data].map(JSON.stringify))
    ).map(JSON.parse);
  } else {
    // If no cities are saved yet, add the new city to the list
    savedCities.push(data);
  }

  // Save the updated list of cities to local storage
  addToLocalStorage("savedCityData", [...savedCities]);

  // Fetch data for the newly added city
  getLocationData(getFromLocalStorage("savedCurrentCity"));
}

//adding the addcityToSavedFn to the addbtn
(function () {
  const saveCityBtn = document.querySelector(".add-city-btn");
  saveCityBtn.addEventListener("click", addCityToSaved);
})();
//
