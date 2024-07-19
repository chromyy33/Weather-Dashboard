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

//Helper export functions
export function removeAndAdd(element, prop, prop2) {
  element.classList.remove(prop);
  element.classList.add(prop2);
}
export function addClass(element, classToAdd) {
  element.classList.add(classToAdd);
}
export function removeClass(element, classToRemove) {
  element.classList.remove(classToRemove);
}

export function addMarkup(markup, elem) {
  elem.insertAdjacentHTML("beforeEnd", markup);
}
function dateChanger(dateStr) {
  const isoDateString = dateStr;
  const date = new Date(isoDateString);
  const localeDateString = date.toLocaleDateString();
  return localeDateString;
}
export function getDayOfWeek(dateString) {
  const date = new Date(dateString);
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const dayOfWeekNumber = date.getDay();
  return daysOfWeek[dayOfWeekNumber];
}
export function formatTo12Hour(dateString, timeZone) {
  // Parse the date string as UTC
  const date = new Date(dateString + "Z"); // Adding 'Z' indicates UTC time

  // Get the local time in the specified time zone
  const options = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: timeZone,
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}
export function visibilityCategory(visibility) {
  const category =
    visibility >= 10 ? "Good" : visibility >= 4 ? "Moderate" : "Bad";
  return `The visibility is ${category}.`;
}

// export function to get the description for a given code
export function getDescriptionForCode(code) {
  const item = weatherCodes.find((item) => item.code === code);
  return item ? item.description : "Unknown code";
}
export function degreeToDirection(degree) {
  const directions = [
    "North",
    "North-North-East",
    "North-East",
    "East-North-East",
    "East",
    "East-South-East",
    "South-East",
    "South-South-East",
    "South",
    "South-South-West",
    "South-West",
    "West-South-West",
    "West",
    "West-North-West",
    "North-West",
    "North-North-West",
    "North",
  ];

  const index = Math.round(degree / 22.5) % 16;
  return `${directions[index]}`;
}
export function getAQILevel(aqi) {
  return aqi <= 50
    ? "Good"
    : aqi <= 100
    ? "Moderate"
    : aqi <= 150
    ? "Bad"
    : aqi <= 200
    ? "Unhealthy"
    : aqi <= 300
    ? "Very Unhealthy"
    : "Hazardous";
}
//Change active states for C and F
export function changeActive(variable) {
  const tempEl = document.querySelectorAll(".temperature");
  tempEl.forEach((temp) => {
    return temp.addEventListener("click", changeActive);
  });
  function changeActive(e) {
    tempEl.forEach((temp) => {
      removeClass(temp, "current");
    });
    addClass(e.target, "current");
    variable = e.target.textContent === "F" ? true : false;
  }
}

// Utility function to generate weather URLs
export function generateWeatherUrl(latitude, longitude, parameters) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&${parameters}`;
}

// Utility function to generate AQI URLs
export function generateAqiUrl(cityName, apiKey) {
  return `http://api.waqi.info/feed/${cityName}?token=${apiKey}`;
}

//Add to Local Storage

export function addToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getFromLocalStorage(key) {
  const storedValue = localStorage.getItem(key);
  if (storedValue) {
    return JSON.parse(storedValue);
  }
  return null;
}


