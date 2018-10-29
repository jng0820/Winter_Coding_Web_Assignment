var express = require('express');
var app = express();
const port = 3000;
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session')
var TodoSchema;
var TodoModel;
var ejs = require('ejs');
var _number;
require('date-utils');
var newDate = new Date();
var time = newDate.toFormat('YYYY-MM-DD');
app.set('views engine','ejs');
app.set('views','./views');
app.use(bodyParser.urlencoded({extended:false}));
var over;
var todoArray = [];
function over_check(){
    TodoModel.find({date:{$gt:time}},(err,result)=>{
        _number = result.length;
        over = true;
    })
}
function todolist_fill(){
    TodoModel.find({},(err,result)=>{
        for (var i=0;i<result.length;i++)
        {
           todoArray.push({title:result._doc.title,content:result._doc.content,date:result._doc.date,priority:result._doc.priority});
        }
    })
}
function connectDB(){
    var dbUrl = "mongodb://localhost:27017/WC_DB"
    mongoose.connect(dbUrl);
    db = mongoose.connection;
    db.on('error', console.error.bind(console,'mongoose connection err'));
    db.on('open',() => {
        TodoSchema = mongoose.Schema({
            title: String,
            content: String,
            priority: Number,
            date: String
        });
        TodoModel = mongoose.model("TodoList",TodoSchema);
        console.log(`Database ${dbUrl} connect`);
    });
    db.on('disconnected', connectDB);
}
app.post('/todo_modify',(req,res)=>{

});
app.get('/todo_modify',(req,res)=>{
    res.render('todo_modify',{object_arr:todoArray});
});

app.post('/todo',(req,res)=>{
    var _title = req.body.title;
    var _content = req.body.content;
    var _date = req.body.date;
    var newTodo = new TodoModel({title:_title,content:_content,priority:null,date:_date});
    var _correct = True
    newTodo.save(err=>{
        console.log("DB save error.");
        _correct = False
    })

    res.render('todo',{correct:_correct});
})

app.get('/todo',(req,res)=>{
    res.render('todo',{object_arr:todoArray, overcheck: over,number:_number});
})
app.get('/', (req,res)=>{
    res.redirect('/todo');
})
app.listen(port,()=>{
   console.log(`${port} connected.`);
   //connectDB();
   //todolist_fill();
   //over_check();
    console.log(time);
});