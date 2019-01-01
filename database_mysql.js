var mysql = require('mysql');
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'chlworkd13',
    database: 'o2'
});
console.log("Mysql 연결 성공!");
conn.connect();

// var sql = 'SELECT * FROM topic';
// conn.query(sql, function(err,rows,fields){
// 	if(err){
// 		console.log(err);
// 	}
// 	else{
// 		for(var i=0;i<rows.length;i++){
// 			console.log(rows[i].title);
// 		}
// 	}
// });
            //아이디에 값을 	바꾸기
// var sql = 'UPDATE topic SET title=?,author=? WHERE id=?';
// var params = ['NPM', 'leezche', 2];
// conn.query(sql, params, function(err, rows, fields) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(rows.insertId);
//     }
// });
          //삭제하기
// var sql = 'DELETE FROM topic WHERE id=?';
// var params = [1];
// conn.query(sql, params, function(err, rows, fields) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(rows);
//     }
// });

// var sql = 'INSERT INTO topic (title,description,author) VALUES(?,?,?)';
// var params = ['Supervisor','Watcher','graphittie'];
// conn.query(sql,params,function(err,rows,fields){
// 	if(err){
// 		console.log(err);
// 	}
// 	else{
// 		console.log(rows.insertId);
// 	}
// })
conn.end();