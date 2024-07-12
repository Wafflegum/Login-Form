const express = require('express')
const app = express()
const path = require('path')

const port = process.env.PORT || 5500

let users = []

app.set('view engine', 'ejs')

app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.send('tite')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => {
    const { username, password } = req.body

    console.log(req.body.username, req.body.password)
    if (req.body.username === 'user' && req.body.password === 'pass') {
        console.log('login successful')
        res.render('login', { text: 'Login successful!' })
    } else {
        res.render('login', { text: 'Wrong email/password' })
    }
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', (req, res) => {
    res.render('login')
})

app.listen(port)
