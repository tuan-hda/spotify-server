import express from "express"
import cors from "cors"
import SpotifyWebApi from "spotify-web-api-node"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
// import https from "https"
// import fs from "fs"

const app = express()
dotenv.config()

const whitelist = ["https://localhost:5173"]
app.use(
  cors({
    credentials: true,
    origin: whitelist,
  })
)
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 8888

app.post("/login", async (req, res) => {
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  })
  const { code } = req.body

  try {
    const {
      body: { access_token, refresh_token },
    } = await spotifyApi.authorizationCodeGrant(code)

    res.cookie("refresh_token", refresh_token, {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      expires: false,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    })
    res.status(200).json({ accessToken: access_token })
  } catch (err) {
    console.log(err)
    res.sendStatus(400)
  }
})

app.post("/refresh", async (req, res) => {
  try {
    const { refresh_token: refreshToken } = req.cookies
    const spotifyApi = new SpotifyWebApi({
      redirectUri: process.env.REDIRECT_URI,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken,
    })

    console.log(req.cookies)

    const {
      body: { access_token },
    } = await spotifyApi.refreshAccessToken()
    res.status(200).json({ accessToken: access_token })
  } catch (error) {
    console.log(String(error))
    res.sendStatus(400)
  }
})

app.get("/", (req, res) => {
  res.send("Hello from express server.")
})

// https
//   .createServer(
//     {
//       key: fs.readFileSync("selfsigned.key", "utf8"),
//       cert: fs.readFileSync("selfsigned.crt", "utf8"),
//     },
//     app
//   )
//   .listen(PORT, () => {
//     console.log(`Server is running at port ${PORT}`)
//   })

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`)
})
