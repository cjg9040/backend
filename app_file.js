var express = require('express')
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var multer = require('multer');
var _storage = multer.diskStorage({
    destination: function(req, file, cb) {
       	cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        
        cb(null, file.originalname)
    }
})
var upload = multer({ storage: _storage });

app.use(bodyParser.urlencoded({ extend: false }));
app.locals.pretty = true;
app.use('/user',express.static('uploads'));
app.set('views', './views_file');
app.set('view engine', 'pug');
app.get('/upload', function(req, res) {
    res.render('upload');
})
app.post('/upload', upload.single('userfile'), function(req, res) {
    console.log(req.file);
    res.send('Uploaded : ' + req.file.filename);
})
app.listen(3000, function() {
    console.log("3000포트 연결 성공");
});

app.get('/topic', function(req, res) {
    fs.readdir('data', function(err, files) {
        if (err) {
            console.log(err);
            res.status(500).send('내부 에러');
        }
        res.render('view', { topics: files });
    });

});
app.get('/topic/new', function(req, res) {
    res.render('new');
});
app.get('/topic/:id', function(req, res) {
    var id = req.params.id;
    fs.readdir('data', function(err, files) {
        if (err) {
            console.log(err);
            res.status(500).send('내부 에러');
        }
        fs.readFile('data/' + id, 'utf8', function(err, data) {
            if (err) {
                console.log(err);
                res.status(500).send('내부 에러');
            }
            res.render('view', { topics: files, title: id, description: data });
        });
    });
})
app.post('/topic', function(req, res) {
    var title = req.body.title;
    var description = req.body.description;
    fs.writeFile('data/' + title, description, function(err) {
        if (err) {
            console.log(err);
            res.status(500).send('서버 에러');
        }
        res.send('연결 성공');
    })

});