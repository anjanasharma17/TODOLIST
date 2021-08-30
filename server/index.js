//import required dependencies

const express = require('express')
const {Client} = require('pg')
const app= express()
const cors = require('cors')
app.use(express.json());
app.use(cors())

/*SCHEMA : 
CREATE DATABASE todo;
CREATE TABLE todos(todo_id SERIAL PRIMARY KEY, title VARCHAR(255),status VARCHAR(255));
*/

//connecting to postgres database 
const client = new Client({
    host: "localhost",
    user: "postgres",
    password: "anjana",
    port: 5432,
    database: "todo"
})
//connect
client.connect()

//middleware for auth
app.use('/api',(req,res,next)=>{
    console.log(req.body);
    console.log("middle ware")
    if(req.body.title ==='task1' ){
        next();
    }
    else{
        res.status(401).send("Error: Access Denied");
        res.end();
    }
})

//add task route
app.post('/addtodo',async(req,res)=>{
    try {
        const {title , status} = req.body
        console.log(req.body)
        const response = client.query("INSERT INTO todos(title,status) values($1,$2) returning *",[title,status])
        res.json(response)
      } catch (err) {
        console.error(err.message);
      }
    

})

//get task route
app.get('/gettodo',async (req,res)=>{
    try {
        console.log(req.query)
        if(Object.keys(req.query).length === 0){
        const allTodos = await client.query("SELECT * FROM todos");
        res.json(allTodos.rows);
        }
        else if(req.query.completed==='1'){
            const allTodos = await client.query("SELECT * FROM todos where status='complete'");
            res.json(allTodos.rows);
        }
        else{
            const allTodos = await client.query("SELECT * FROM todos where status='incomplete'");
            res.json(allTodos.rows);
        }
      } catch (err) {
        console.error(err.message);
      }

})

//delete task route
app.delete('/deletetodo/:id',async(req,res)=>{
    try {
        const { id } = req.params;
        const deleteTodo = await client.query("DELETE FROM todos WHERE todo_id = $1", [id]);
        res.json("Todo was deleted!");
      } catch (err) {
        console.log(err.message);
      }
})

//update task route
app.patch('/updatetodo/:id',async(req,res)=>{
    try {
        const { id } = req.params;
        const { title ,status} = req.body;
        if(!title){
            const updateTodo = await client.query(
                "UPDATE todos SET status = $1 WHERE todo_id = $2",
                [status, id]
              );
        }
        else if(!status){
            const updateTodo = await client.query(
                "UPDATE todos SET title = $1 WHERE todo_id = $2",
                [title, id]
              );
        }
        else{
            const updateTodo = await client.query(
                "UPDATE todos SET status = $1, title = $2 WHERE todo_id = $3",
                [status,title, id]
              );
        }
    
        res.json("Todo was updated!");
      } catch (err) {
        console.error(err.message);
      }

})


//listen on port
app.listen(3000,()=>{
    console.log("server started on port 3000")
})