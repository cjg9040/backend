var express = require('express');
var session = require('express-session');
var app =express();
bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

app.use(session({
	secret :'keyboard cat',
	resave : false,
	saveUninitialized :true
}))

app.get('/count',function(req,res){
	if(req.session.count){
		req.session.count++;
	}
	else{
		req.session.count =1;
	}
	res.send('result : '+req.session.count);
	//res.send('hi session!');
})

app.get('/welcome',function(req,res){
	if(req.session.displayName){
		res.send(`
				<h1>login, ${req.session.displayName}</h1>
				<a href="/auth/logout">logout</a>

			`);
	} else{
		res.send(`
			<h1>welcome</h1>
			<a href="/auth/login">Login</a>
			`);
	}
	
})
app.get('/auth/logout',function(req,res){
	delete req.session.displayName;
	res.redirect('/welcome');
})
app.post('/auth/login',function(req,res){
	var user ={
		username:'jg',
		password:'1',
		displayName:'jg'
	};

	var uname = req.body.username;
	var pwd =req.body.password;
	if(uname == user.username && pwd === user.password){
		req.session.displayName = user.displayName;
		res.redirect('/welcome');
	}
	else{
		res.send('누구세요? <a href ="/auth/login">login page</a>');
	}
	//res.send(uname);
})
app.get('/auth/login',function(req,res){
	var output =`
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
	</form>
	`;
	res.send(output);
})
app.listen(3000, function() {
    console.log("3000포트 연결 성공");
});