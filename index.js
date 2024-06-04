import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";
const app = express();
const port = 3000;
const saltRounds=10;
env.config();
const db = new pg.Client({
  user:process.env.PG_USER,
  host:process.env.PG_HOST,
  database:process.env.PG_DATABASE,
  password:process.env.PG_PASSWORD,
  port:process.env.PG_PORT
 });
 db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  // console.log(email);
  try{
  const checkResult = await db.query("SELECT * FROM users WHERE email=$1",[email]);
  if(checkResult.rows.length>0)
  {
    res.send("User already exist try log in");
  }else{
    //password hashing
    bcrypt.hash(password,saltRounds,async(err,hash)=>{
      if(err){
        console.log(err);
      }
      else{
        try{
          await db.query("INSERT INTO users (email,password) values ($1 , $2)",[email, hash]);
          res.render("secrets.ejs");
        }catch(err){
          console.log(err);
        }
      }
    })
  }
}catch(err){
  console.log(err);
}
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const loginpassword = req.body.password;
  // console.log(password);
  try{
    const results = await db.query("SELECT * FROM users WHERE email=$1",[email]);
    if(results.rows.length>0)
    {
      console.log(results.rows);
      const user = results.rows[0];
      console.log(user);
      // storedhashpassword id database stored pwd
      const storedhashpassword=user.password; 
      bcrypt.compare(loginpassword,storedhashpassword,(err,results)=>{
        if(err){
          console.log(err);
        }
        else{
          if(results){
            res.render("book.ejs");
          }
          else{ 
            res.send("Incorrect password");
          }
          console.log(results);
        }
      });
    }else{
      res.send("user not found");
    }
  }catch(err){
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
