var express = require('express');
var app = express();
const port = 3050;
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var TodoSchema;
var TodoModel = null;
var ejs = require('ejs');
var _number;

app.set('views engine','ejs');
app.set('views','./views');
app.use(bodyParser.urlencoded({extended:false}));
var over;
var todoArray = [];
var time = new Date();
function over_check(){
    TodoModel.find({date:{$lte:time}},(err,result)=>{
        _number = result.length;
        if(_number > 0)
            over = true;
        else over = false;
    })
}
function todolist_fill(){
    TodoModel.find({},{priority:-1},(err,result)=>{
        for (var i=0;i<result.length;i++)
        {
            todoArray.push({title:result._doc.title,content:result._doc.content,date:result._doc.date,priority:result._doc.priority});
        }
        over_check();
    });

}
function connectDB(){
    var dbUrl = "mongodb://localhost:27017/WC"

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
    var newTodo = new TodoModel({title:_title,content:_content,priority:0,date:_date});
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
    todolist_fill();
    res.redirect('/todo');
})
app.listen(port,()=>{
    console.log(`${port} connected.`);
    connectDB();
});