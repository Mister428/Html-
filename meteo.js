const axios = require("axios")

const CONFIG = {
  API_KEY: "df646e9ce9ab2cd4fc3fe7466ad4d578",
  BASE_URL: "https://api.openweathermap.org/data/2.5",
  GEO_URL: "https://api.openweathermap.org/geo/1.0/direct",
  AIR_URL: "https://api.openweathermap.org/data/2.5/air_pollution",
  LANG: "fr",
  UNITS: "metric",
  TIMEOUT: 8000
}

const instance = axios.create({ timeout: CONFIG.TIMEOUT })

async function request(url) {
  try {
    const res = await instance.get(url)
    return res.data
  } catch {
    return null
  }
}

function formatTime(ts, tz = 0) {
  return new Date((ts + tz) * 1000).toLocaleTimeString("fr-FR")
}

function formatDate(ts, tz = 0) {
  return new Date((ts + tz) * 1000).toLocaleString("fr-FR")
}

function windDirection(deg) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"]
  return dirs[Math.round(deg / 45) % 8]
}

function formatWeather(data, air = null) {
  if (!data) return { error: true, message: "Ville introuvable ❌" }

  return {
    localisation: {
      ville: data.name,
      pays: data.sys.country,
      coordonnees: { lat: data.coord.lat, lon: data.coord.lon }
    },
    temperature: {
      actuelle: `${data.main.temp}°C`,
      ressentie: `${data.main.feels_like}°C`,
      min: `${data.main.temp_min}°C`,
      max: `${data.main.temp_max}°C`
    },
    atmosphere: {
      humidite: `${data.main.humidity}%`,
      pression: `${data.main.pressure} hPa`,
      visibilite: `${data.visibility / 1000} km`
    },
    condition: {
      principale: data.weather[0].main,
      description: data.weather[0].description,
      icone: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    },
    vent: {
      vitesse: `${data.wind.speed} m/s`,
      direction: windDirection(data.wind.deg),
      degres: data.wind.deg,
      rafales: data.wind.gust ? `${data.wind.gust} m/s` : null
    },
    nuages: `${data.clouds.all}%`,
    soleil: {
      lever: formatTime(data.sys.sunrise, data.timezone),
      coucher: formatTime(data.sys.sunset, data.timezone)
    },
    date: formatDate(data.dt, data.timezone),
    qualite_air: air ? air.list[0].main.aqi : null
  }
}

async function getAirPollution(lat, lon) {
  const url = `${CONFIG.AIR_URL}?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}`
  return await request(url)
}

async function getWeather(city = "Conakry") {
  const url = `${CONFIG.BASE_URL}/weather?q=${city}&appid=${CONFIG.API_KEY}&units=${CONFIG.UNITS}&lang=${CONFIG.LANG}`
  const data = await request(url)
  if (!data) return { error: true, message: "Erreur météo ❌" }
  const air = await getAirPollution(data.coord.lat, data.coord.lon)
  return formatWeather(data, air)
}

async function getForecast(city = "Conakry") {
  const url = `${CONFIG.BASE_URL}/forecast?q=${city}&appid=${CONFIG.API_KEY}&units=${CONFIG.UNITS}&lang=${CONFIG.LANG}`
  const data = await request(url)
  if (!data) return { error: true, message: "Erreur prévisions ❌" }

  return data.list.map(item => ({
    date: formatDate(item.dt, data.city.timezone),
    temperature: `${item.main.temp}°C`,
    ressenti: `${item.main.feels_like}°C`,
    humidite: `${item.main.humidity}%`,
    condition: item.weather[0].description,
    vent: `${item.wind.speed} m/s`,
    nuages: `${item.clouds.all}%`
  }))
}

async function getWeatherByCoords(lat, lon) {
  const url = `${CONFIG.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=${CONFIG.UNITS}&lang=${CONFIG.LANG}`
  const data = await request(url)
  if (!data) return { error: true, message: "Erreur GPS ❌" }
  const air = await getAirPollution(lat, lon)
  return formatWeather(data, air)
}

async function searchCity(name) {
  const url = `${CONFIG.GEO_URL}?q=${name}&limit=5&appid=${CONFIG.API_KEY}`
  const data = await request(url)
  if (!data) return []

  return data.map(c => ({
    nom: c.name,
    pays: c.country,
    lat: c.lat,
    lon: c.lon
  }))
}

module.exports = {
  getWeather,
  getForecast,
  getWeatherByCoords,
  searchCity
}
