var express = require('express');
var app = express();
const port = 3000;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
app.use(cookieParser('23143453546ASZXCV4'));

var mongoose = require('mongoose');
var TodoSchema;
var TodoModel = null;
var ejs = require('ejs');
var _number = 0;
var _correct = true;
app.set('view engine','ejs');
app.set('views','./views');
app.use(bodyParser.urlencoded({extended:false}));
var over;
var todoArray = [];
var now = new Date;
var time;
var modify_check;
var delete_check;
function format_date(){
    time = now.getFullYear();
    if(Number(now.getMonth())+1 < 10)
        time += '-0'+(Number(now.getMonth())+1);
    else time += '-' +(Number(now.getMonth())+1);
    if(Number(now.getDate()) < 10)
        time += '-0'+(Number(now.getDate()));
    else time += '-' +(Number(now.getDate()))

}
function todolist_fill(){
    format_date();
    TodoModel.find().sort({priority:-1,date:1}).exec((err,result)=>{
        todoArray = [];
        _number = 0;
        over = false;
        for (var i=0;i<result.length;i++)
        {
            todoArray.push({title:result[i]._doc.title,content:result[i]._doc.content,date:result[i]._doc.date,priority:result[i]._doc.priority,finish:result[i]._doc.finish});
    	    if(todoArray[i]["date"] < time && todoArray[i]["date"] != "" && todoArray[i]["finish"] != true) {
                over = true;
                _number += 1;
                if(todoArray[i]["priority"]<100000) {
                    todoArray[i]["priority"] += 100000;
                    TodoModel.update({
                        title: todoArray[i]["title"],
                        date: todoArray[i]["date"]
                    }, {$set: todoArray[i]}, (err, out) => {});
                }
            }
        }
    });
}
function connectDB(){
    var dbUrl = "mongodb://localhost:27017/WC";

    mongoose.connect(dbUrl);
    db = mongoose.connection;

    db.on('error', console.error.bind(console,'mongoose connection err'));
    db.on('open',() => {
        TodoSchema = mongoose.Schema({
            title: String,
            content: String,
            priority: Number,
            date: String,
            finish: Boolean
        });
        TodoModel = mongoose.model("TodoList",TodoSchema);
        console.log(`Database ${dbUrl} connect`);
        todolist_fill()
    });
    db.on('disconnected', connectDB);
}
app.post('/todo_modify',(req,res)=> {
    if (req.signedCookies.idx) {
        var idx = Number(req.signedCookies.idx);
        modify_check = true;
        if(req.body.title != "")
            var _title = req.body.title;
        else var _title = todoArray[idx]["title"];
        if(req.body.content != "")
            var _content = req.body.content;
        else var _content = todoArray[idx]["content"];
        if(req.body.limit != "")
            var _date = req.body.limit;
        else var _date = todoArray[idx]["date"];
        var temp_arr = {title: _title, content: _content,priority:todoArray[idx]["priority"] ,date: _date,finish:false};
        TodoModel.update({
            title: todoArray[idx]["title"],
            date: todoArray[idx]["date"]
        }, {$set: temp_arr}, (err, out) => {
            if (err) modify_check = false;
            todolist_fill();
        });
        res.redirect('/todo/'+idx);
    }
});
app.get('/todo_finish',(req,res)=> {
    if (req.signedCookies.idx) {
        var idx = Number(req.signedCookies.idx);
        if(todoArray[idx]["finish"] == false) {
            todoArray[idx]["finish"] = true;
            todoArray[idx]["priority"] = -10000;
            TodoModel.update({
                title: todoArray[idx]["title"],
                date: todoArray[idx]["date"]
            }, {$set: todoArray[idx]}, (err, out) => {
            });
        }
    }
    res.redirect('/todo/'+idx);
});

app.get('/todo_modify/:id',(req,res)=>{
    var idx = req.params.id;
    res.render('todo_modify',{object_arr:todoArray[idx],idx:idx});
});
app.post('/todo_add',(req,res)=>{
    _correct = true;
    var _title = req.body.title;
    var _content = req.body.content;
    var _date = req.body.limit;
    var newTodo = new TodoModel({title:_title,content:_content,priority:0,date:_date,finish:false});
    newTodo.save(err=>{
        if(err) {
            console.log("DB save error.");
            _correct = false
        }
        todolist_fill();
    });
    res.render('todo_add',{correct:_correct});
});

app.get('/todo_delete',(req,res)=>{
    if (req.signedCookies.idx) {
        delete_check=true;
        idx = Number(req.signedCookies.idx);
        TodoModel.remove({
            title: todoArray[idx]["title"],
            date: todoArray[idx]["date"]
        }, (err, out) => {
            if(err) delete_check = false;
            todolist_fill();
        });

    }
    res.redirect('/todo');

});

app.get(['/todo','/todo/:id'],(req,res)=>{
    var idx = req.params.id;
    todolist_fill();
    if(idx){
        res.cookie('idx', idx,{signed:true});
        idx = Number(idx);
        if(todoArray[idx]["finish"] == false){
        todoArray[idx].priority += 1;
            TodoModel.update({
                title: todoArray[idx]["title"],
                date: todoArray[idx]["date"]
            }, {$set: todoArray[idx]}, (err, out) => {todolist_fill()});
        }
        res.render("todo_watch",{object_arr:todoArray[idx],correct:modify_check,idx:idx});
    }
    else{
        modify_check = null
        res.cookie('idx', null,{signed:true});
        res.render('todo',{object_arr:todoArray, overcheck: over,number:_number});
    }

});
app.get('/todo_add',(req,res)=>{
    res.render('todo_add',{correct:null});
});

app.get('/', (req,res)=>{
    res.redirect('/todo');
});
app.listen(port,()=>{
    console.log(`${port} connected.`);
    connectDB();
});