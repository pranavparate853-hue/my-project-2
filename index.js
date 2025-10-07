const express = require('express')
const Collection = require('./mongo')

const app = express()
const path = require('path')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs')

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))

// FIX: Correct folder name to 'templates'
const tamplatesPath = path.join(__dirname, "../tamplates")
const publicPath = path.join(__dirname, "../public")

app.set("view engine", "hbs")
app.set("views", tamplatesPath)
app.use(express.static(publicPath))

async function hashpass(password) {
    return await bcrypt.hash(password, 10)
}
async function comparepass(password, hash) {
    return await bcrypt.compare(password, hash)
}

// Show login page (always available)
app.get("/login", (req, res) => {
    res.render("login")
})

// Home route: show welcome if logged in, else login
app.get("/", (req, res) => {
    if (req.cookies.jwt) {
        try {
            const user = jwt.verify(req.cookies.jwt, "ihadoneofthesetoughestchildhoodanyonecanimagine")
            res.render("welcome", { username: user.username })
        } catch (e) {
            res.clearCookie("jwt")
            res.render("login")
        }
    } else {
        res.render("login")
    }
})

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.post("/signup", async (req, res) => {
    try {
        const checkUser = await Collection.findOne({ username: req.body.username })
        if (checkUser) {
            return res.send("user already exists")
        }

        const token = jwt.sign(
            { username: req.body.username },
            "ihadoneofthesetoughestchildhoodanyonecanimagine"
        )
        const data = {
            username: req.body.username,
            password: await hashpass(req.body.password),
            token: token
        }

        await Collection.insertMany([data])

        res.cookie("jwt", token, {
            maxAge: 600000,
            httpOnly: true
        })

        // Redirect to home after signup
        res.redirect("/")
    } catch (e) {
        res.send("wrong details")
    }
})

app.post("/login", async (req, res) => {
    try {
        const checkUser = await Collection.findOne({ username: req.body.username })
        if (!checkUser) {
            return res.send("wrong details")
        }

        const passcheck = await comparepass(req.body.password, checkUser.password)
        if (!passcheck) {
            return res.send("wrong details")
        }

        res.cookie("jwt", checkUser.token, {
            maxAge: 600000,
            httpOnly: true
        })

        // Redirect to home after login
        res.redirect("/")
    } catch (e) {
        res.send("wrong details")
    }
})

app.get("/logout", (req, res) => {
    res.clearCookie("jwt")
    res.redirect("/")
})

app.listen(3000, () => {
    console.log("port connected")
})
