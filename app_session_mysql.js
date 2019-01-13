var express = require('express');
var session = require('express-session');
var app = express();
bodyParser = require('body-parser');
var MySQLStore = require('express-mysql-session')(session);
//var sha256 = require('sha256');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
app.use(bodyParser.urlencoded({ extended: false }));
//var salt ='@!#@!#@!#@!#!1232#@!#!#1321';//md5
//var md5 = require('md5');
var users = [];

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

app.post('/auth/register', function(req, res) {
    //req.body.password = sha256(req.body.password+salt);
    hasher({password:req.body.password},function(err,pass,salt,hash){
    	var user = {
        username: req.body.username,
        password: hash,
        salt:salt,
        displayName: req.body.displayName
    };
    users.push(user);
    console.log(users);
    req.session.displayName = req.body.displayName;
    req.session.save(function(){
    	res.redirect('welcome');
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
    if (req.session.displayName) {
        res.send(`
				<h1>login, ${req.session.displayName}</h1>
				<a href="/auth/logout">logout</a>

			`);
    } else {
        res.send(`
			<h1>Welcome</h1>
			<li><a href="/auth/login">Login</a></li><br>
			<li><a href="/auth/register">Register</a></li>
			`);
    }

});
app.get('/auth/logout', function(req, res) {
    delete req.session.displayName;
    req.session.save(function() {
        res.redirect('/welcome');
    });

});
app.post('/auth/login', function(req, res) {

    var uname = req.body.username;
    var pwd = req.body.password;

    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        console.log(user);
        if(uname === user.username){
        	return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){
        		if(hash === user.password){
        			req.session.displayName = user.displayName;
        			req.session.save(function(){
        				res.redirect('/welcome');
        			})
        		} else{
        			res.send('누구세요? <a href ="/auth/login">login page</a>');
        		}
        	});
        }
    }
});
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
	`;
    res.send(output);
});
app.listen(3001, function() {
    console.log("3001포트 연결 성공");
});