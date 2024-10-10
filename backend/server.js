       
                  const fs=require('fs');
                  const path = require('path');
              
let express=require("express");
let app=express();
app.use(express.json());
app.set('views', path.join(__dirname, '../frontend/views'));
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.set('view engine', 'ejs');
app.get("/",(req,res)=>{
  res.render("index")
})
app.get("/login",function(request,response){

     response.end("this is the login page");
      });
 
 

app.listen(80,()=>{

  console.log("app is running")
});


 
 