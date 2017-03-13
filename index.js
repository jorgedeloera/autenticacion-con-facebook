const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const expressSession = require('express-session')
const passport = require('passport')
const facebookStrategy = require('passport-facebook').Strategy
const data = require('./facebook-data')
const port = process.env.PORT || 4000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(expressSession({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(express.static('public'))

passport.serializeUser(function(user, done){ done(null, user)})
passport.deserializeUser(function(user, done){ done(null, user)})

passport.use(new facebookStrategy({
    clientID: data.app_id,
    clientSecret: data.app_secret,
    callbackURL: 'http://localhost:4000/auth/facebook/callback'
}, function(accessToken, refreshToken, profile, done){
    done(null, profile)
}))

app.get('/auth/facebook', passport.authenticate('facebook'))

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/login',
    successRedirect: '/'
}))

app.get('/logout', function(req, res){
    req.logout()
    res.redirect('/login')
})

app.get('/login', function(req, res){
    res.sendfile('public/login.html')
})

app.get('/', ensure, function(req, res){
    res.send(`Bienvenido ${req.user.displayName}`)
})

function ensure(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

app.listen(port)