const express = require('express')
const app = express()
const { pool } = require('./dbConfig')

const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('express-flash')
const passport = require('passport')

const initializePassport = require('./passportConfig')

initializePassport(passport)

const PORT = process.env.PORT || 4000

require('dotenv')

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
    })
)

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/register', (req, res) => {
    if (!req.isAuthenticated()) {
        res.render('register')
    } else {
        res.redirect('/dashboard')
    }
})

app.post('/register', async (req, res) => {
    // this manages the registration form functionalities
    let { name, email, password, password2 } = req.body
    console.log({
        name,
        email,
        password,
        password2,
    })

    let errors = []

    if (!name || !email || !password || !password2) {
        errors.push({ message: 'Please fill up all fields' })
    }
    if (password.length < 6) {
        errors.push({ message: 'Password must be at least 6 characters' })
    }
    if (password2 !== password) {
        errors.push({ message: 'Password does not match' })
    }

    if (errors.length > 0) {
        res.render('register', { errors })
    } else {
        // form validation successful

        const hashedPassword = await bcrypt.hash(password, 10)
        pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email],
            (err, result) => {
                if (err) {
                    throw err
                }
                if (result.rows.length > 0) {
                    errors.push('Email already registered')
                    res.render('register', { errors })
                } else {
                    pool.query(
                        `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`,
                        [name, email, hashedPassword],
                        (err, result) => {
                            if (err) {
                                throw err
                            }
                            console.log(
                                'saved user login',
                                name,
                                email,
                                hashedPassword
                            )
                            req.flash(
                                'success_msg',
                                'You are now registered. Please login'
                            )
                            res.redirect('login')
                        }
                    )
                }
            }
        )
    }
})

app.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true,
    })
)

app.get('/login', (req, res) => {
    if (!req.isAuthenticated()) {
        res.render('login')
    } else {
        res.redirect('dashboard')
    }
})

app.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('dashboard')
    } else {
        res.redirect('login')
    }
})

app.get('/logout', (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
    } else {
        req.logout((err) => {
            if (err) return next(err)

            req.flash('success_msg', 'You are now logged out')
            res.redirect('/login')
        })
    }
})

app.listen(PORT, (err, res) => {
    console.log('listening on port ' + PORT)
})
