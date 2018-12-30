var express = require('express');
var app = express();
app.locals.pretty = true //jade 페이지 소스보기 예쁘게
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));

app.get('/template', function(req, res) {
    res.render('temp', { time: Date(), title: 'Jade' }); //temp.pug를 views라고하는 directory에서 가져옴 response해줌
});

app.get('/form_receiver',function(req,res){
	//res.send("Hello, Get")
	var title = req.query.title;
	var description = req.query.description;
	res.send(title+','+description);
});
app.post('/form_receiver',function(req,res){
	var title = req.body.title;
	var description = req.body.description;
	res.send(title+','+description);
})
app.get('/form', function(req, res) {
    res.render('form');
});
app.get('/topic/:id', function(req, res) {
    var topics = [
        'Javascript is...',
        'Nodejs is...',
        'Express is...'
    ];
    var output = `
		<a href="/topic/0">Javascript</a><br>
		<a href="/topic/1">Nodejs</a><br>
		<a href="/topic/2">Express</a><br><br>
		
		${topics[req.query.id]}
	`
    res.send(output);
});
app.get('/topic/:id/:mode', function(req, res) {
    res.send(req.query.id + ',' + req.query.mode)
})
app.get('/', function(req, res) {
    res.send('This is Home Page');
});

app.get('/dynamic', function(req, res) {
    var lis = '';
    for (var i = 0; i < 5; i++) {
        lis += '<li>coding</li>';
    }
    var time = Date();
    var output = `<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<title>dynamic post</title>
	</head>
	<body>
		<h1>dynamic page</h1>
		<ul>
		${lis}
		</ul>
		${time}
		</body>
		</html>`
    res.send(output);
});

app.get('/route', function(req, res) {
    res.send('this is route dic, <img src="/test.png">');
});

app.get('/login', function(req, res) {
    res.send('<h1>login plz</h1>');
});

app.listen(3000, function() {
    console.log('3000 connected');
});












// var express = require('express')
// var app = express()
// var bodyParser = require('body-parser')
// //port 3000(base value)
// app.listen(3000,function(){
// 	console.log("start express server on port 3000");
// });
// app.use(express.static('public'))
// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json())


// //괄호안에 디렉토리 이름 static(동적)

// //app.set('view engine', 'ejs')
// //url routing
// app.get('/', function(req,res){  
// 	res.send("<h1>hello jg!</h1>")
// 	res.sendFile(__dirname+ "/public/main.html")	 //dirname은 절대경로 포함하는거
// });
// app.get('/main', function(req,res){
// 	res.send("<h1>hi jg!</h1>")
// 	res.sendFile(__dirname+ "/public/main.html")	 //dirname은 절대경로 포함하는거
// });
// app.post('/', function(req,res){
// 	res.send('Good!');
// });