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
var mysql = require('mysql');
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'chlworkd13',
    database: 'o2'
});
conn.connect();


app.use(bodyParser.urlencoded({ extended: false }));
//var salt ='@!#@!#@!#@!#!1232#@!#!#1321';//md5
//var md5 = require('md5');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'chlworkd13',
        database: 'o2'
    })
}));
app.use(passport.initialize());
app.use(passport.session());
var users = [];

app.post('/auth/register', function(req, res) {
    //req.body.password = sha256(req.body.password+salt);
    hasher({ password: req.body.password }, function(err, pass, salt, hash) {
     
        var user = {
            authId:'local'+req.body.username,
            username: req.body.username,
            password: hash, 
            salt: salt,
            displayName: req.body.displayName
        };
        var sql ='INSERT INTO users SET ?';
        conn.query(sql, user,function(err,results){
            if(err){
                console.log(err);
                res.status(500);
            } else{
                    
                res.redirect('/welcome');
            }
        });

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

passport.serializeUser(function(user, done) {
    //console.log('serial', user);
    //done(null, user.username);
    done(null, user.authId);
});

passport.deserializeUser(function(id, done) {
    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql,[id],function(err,results){
        console.log(sql,err,results);
    })
    // for (var i = 0; i < users.length; i++) {
    //     var user = users[i];
    //     if (user.authId === id) {
    //         //console.log('deserial',user);
    //         return done(null, user);
    //     }
    //     done('There is no users');
    // }

});

passport.use(new LocalStrategy(
    function(username, password, done) {
        var uname = username;
        var pwd = password;
        var sql ='SELECT * FROM users WHERE authId=?';
        conn.query(sql,['local:'+uname],function(err,results){
            if(err){
                return done('There is no user');
            }
            var user = results[0];
            return hasher({ password: pwd, salt: user.salt }, function(err, pass, salt, hash) {
                    if (hash === user.password) {
                        //console.log('LocalStrategy', user);
                        done(null, user);
                    } else {
                        done(null, false);
                    }
                });
        });
    }
));
 
passport.use(new FacebookStrategy({
        clientID: '1447656032038405',
        clientSecret: '1f1719f51a033403516d5f5919120f34',
        callbackURL: "auth/facebook/callback",
        profileFields:['id','email','gender','link','locale','name','timezone','updated_time','verified','displayName']
    },
    function(accessToken, refreshToken, profile, done) {
        // User.findOrCreate(..., function(err, user) {
        //     if (err) { return done(err); }
        //     done(null, user);
        // });
        console.log(profile);
        var authId = 'facebook:'+profile.id;
        for(var i=0;i<users.length;i++){
            var user =users[i];
            if(user.authId ===authId){
                return done(null,user);
            }
        }
        var newuser = {
            'authId':authId,
            'displayName':profile.displayName,
            'email':profile.emails[0].value
        };
        user.push(newuser);
        done(null,newuser);
    }
));
app.post('/auth/login', passport.authenticate(
    'local', {
        successRedirect: '/welcome',
        failureRedirect: '/auth/login',
        failureFlash: false
    }
));
app.get(
    '/auth/facebook',
    passport.authenticate(
        'facebook',
        {scope:'email'}
    )
);

app.get(
    '/auth/facebook/callback',
    passport.authenticate(
        'facebook', {
            successRedirect: '/welcome',
            failureRedirect: '/auth/login'
        }
    )
);
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