const express = require("express")
const bodyParser = require("body-parser")
const path = require("path")
const { getWeather } = require("./meteo")

const app = express()
const users = []

app.use(bodyParser.json())
app.use(express.static("public"))

app.post("/register", (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.json({ error: "Champs requis" })

  users.push({ username, password })
  res.json({ success: true, message: "Compte créé" })
})

app.post("/login", (req, res) => {
  const { username, password } = req.body
  const user = users.find(u => u.username === username && u.password === password)

  if (!user) return res.json({ error: "Identifiants incorrects" })
  res.json({ success: true })
})

app.get("/weather/:city", async (req, res) => {
  const data = await getWeather(req.params.city)
  res.json(data)
})

app.listen(3000, () => console.log("Serveur lancé sur http://localhost:3000"))
