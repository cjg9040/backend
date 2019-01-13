var express = require('express');
var session = require('express-session');
var app = express();
bodyParser = require('body-parser');
var MySQLStore = require('express-mysql-session')(session);
//var sha256 = require('sha256');
var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
//var assert = require("assert");

app.use(bodyParser.urlencoded({ extended: false }));
//var salt ='@!#@!#@!#@!#!1232#@!#!#1321';//md5
//var md5 = require('md5');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,

}));
app.use(passport.initialize());
app.use(passport.session());
var users = [];

app.post('/auth/register', function(req, res) {
    //req.body.password = sha256(req.body.password+salt);
    hasher({ password: req.body.password }, function(err, pass, salt, hash) {
        var user = {
            username: req.body.username,
            password: hash,
            salt: salt,
            displayName: req.body.displayName
        };
        users.push(user);
        req.login(user, function(err) {
            if (err) { return next(err); }

            req.session.save(function() {
                res.redirect('/welcome');
            });
        })
        console.log(users);
        req.session.displayName = req.body.displayName;

    });

});
app.get('/auth/register', function(req, res) {
    var output = `
        <h1>Register</h1>
        <form action="/auth/register" method="post">
        <p>
            <input type="text" name="username" placeholder="username">
        </p>
        <p>
            <input type="password" name="password" placeholder="password">
        </p>
        <p>
            <input type="text" name ="displayName" placeholder ="displayName">
        </p>
        <p>
            <input type ="submit">
        </p>
        <p>
            <a href="/welcome">이전</a>
        </p>
    </form>
    `;
    res.send(output);
});
app.get('/welcome', function(req, res) {
    if (req.user && req.user.displayName) {
        console.log('success login');
        res.send(`
                <h1>Login, ${req.user.displayName}</h1>
                <a href="/auth/logout">logout</a>
            `);
    } else {
        console.log('failed');
        res.send(`
            <h1>Welcome</h1>
            <li><a href="/auth/login">Login</a></li><br>
            <li><a href="/auth/register">Register</a></li>
            `);
    }

});
app.get('/auth/logout', function(req, res) {
    req.logout();
    req.session.save(function() {
        res.redirect('/welcome');
    });
});
// app.post('/auth/login', function(req, res) {

//     var uname = req.body.username;
//     var pwd = req.body.password;

//     for (var i = 0; i < users.length; i++) {
//         var user = users[i];
//         console.log(user);
//         if(uname === user.username){
//          return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){
//              if(hash === user.password){
//                  req.session.displayName = user.displayName;
//                  req.session.save(function(){
//                      res.redirect('/welcome');
//                  })
//              } else{
//                  res.send('누구세요? <a href ="/auth/login">login page</a>');
//              }
//          });
//         }
//         // if (uname == user.username && pwd === user.password) {
//         //     req.session.displayName = user.displayName;
//         //     return req.session.save(function(){
//         //       res.redirect('/welcome');   
//         //     })
//         // }
//     }
//      //res.send('누구세요? <a href ="/auth/login">login page</a>');
//     //res.send(uname);
// });
passport.serializeUser(function(user, done) {
    console.log('serial', user);
    done(null, user.username);
});

passport.deserializeUser(function(id, done) {
    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        if (user.username === id) {
            //console.log('deserial',user);
            return done(null, user);
        }
    }

});

passport.use(new LocalStrategy(
    function(username, password, done) {
        var uname = username;
        var pwd = password;
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            //console.log(user);
            if (uname === user.username) {
                return hasher({ password: pwd, salt: user.salt }, function(err, pass, salt, hash) {
                    if (hash === user.password) {
                        console.log('LocalStrategy', user);
                        done(null, user);
                    } else {
                        done(null, false);
                    }
                });
            }
        }
        done(null, false);
    }
));
// passport.use(new FacebookStrategy({
//         clientID: '1447656032038405',
//         clientSecret: '1f1719f51a033403516d5f5919120f34',
//         callbackURL: "auth/facebook/callback"
//     },
//     function(accessToken, refreshToken, profile, done) {
//         User.findOrCreate(..., function(err, user) {
//             if (err) { return done(err); }
//             done(null, user);
//         });

//     }
// ));
app.post('/auth/login', passport.authenticate(
    'local', {
        successRedirect: '/welcome',
        failureRedirect: '/auth/login',
        failureFlash: false
    }
));
// app.get(
//     '/auth/facebook',
//     passport.authenticate(
//         'facebook'
//     )
// );

// app.get(
//     '/auth/facebook/callback',
//     passport.authenticate(
//         'facebook', {
//             successRedirect: '/welcome',
//             failureRedirect: '/auth/login'
//         }
//     )
// );
app.get('/auth/login', function(req, res) {
    var output = `
    <h1>Login</h1>
    <form action="/auth/login" method="post">
        <p>
            <input type="text" name="username" placeholder="username">
        </p>
        <p>
            <input type="password" name="password" placeholder="password">
        </p>
        <p>
            <input type ="submit">
        </p>
        <a href ="/auth/register">회원가입</a>
        <p>
            <a href="/welcome">이전</a>
        </p>
    </form>
    <a href="/auth/facebook">Facebook</a>
    `;
    res.send(output);
});
app.listen(3002, function() {
    console.log("3002포트 연결 성공");
});