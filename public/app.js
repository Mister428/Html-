async function register() {
  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })

  const data = await res.json()
  document.getElementById("authMsg").innerText = data.message || data.error
}

async function login() {
  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })

  const data = await res.json()

  if (data.success) {
    document.getElementById("weatherBox").classList.remove("hidden")
    document.getElementById("authMsg").innerText = "Connecté ✅"
  } else {
    document.getElementById("authMsg").innerText = data.error
  }
}

async function getWeather() {
  const city = document.getElementById("city").value

  const res = await fetch(`/weather/${city}`)
  const data = await res.json()

  if (data.error) {
    document.getElementById("result").innerText = data.message
    return
  }

  document.getElementById("result").innerHTML = `
    🌍 ${data.localisation.ville} <br>
    🌡️ ${data.temperature.actuelle} <br>
    ☁️ ${data.condition.description} <br>
    💨 ${data.vent.vitesse}
  `
}
