import express from "express";
import z from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "./config";
import { middleware } from "./middleware";

const app = express();

app.get("/signup" , (req  , res) => {
    try{
        const signupschema = z.object({
        username : z.string().max(20 , "username must be atmax 20 characters").min(3 , "username must be atleast 3 characters"),
        password : z.string().max(20 , "password must be atmax 20 characters").min(3 , "password must be atleast 3 characters"),
        email : z.string().email(),
    })
     
    const data = signupschema.parse(req.body);
    
    if(!data){
        res.status(400).json({
            message : "Data Not found"
        })
    }

    // DB call to get check use already exist...

    // DB call to add user to data

    res.status(200).json({
        message : "user added successfully !"
    })
    }catch(error){
        res.status(500).json({
            message : "Internal server Error",
            error  : error
        })
    }
})
app.post("/signup" , (req , res) => {
    try{
            const signinschema = z.object({
        username : z.string().max(20 , "username must be atmax 20 characters").min(3 , "username must be atleast 3 characters"),
        password : z.string().max(20 , "password must be atmax 20 characters").min(3 , "password must be atleast 3 characters"),
    })

    const data = signinschema.parse(req.body);
    
    if(!data){
        res.status(400).json({
            message : "Data Not found"
        })
    }

    //DB call to get the user
    const userId = 1
    const token = jwt.sign({userId} , JWT_SECRET)

    res.status(200).json({
        message : "SignIn Successfully",
        token : token
    })
    }catch(error){
            res.status(500).json({
            message : "Internal server Error",
            error  : error
        })
    }
})

app.post("/room", middleware , (req , res) => {
    //Db call
})

app.listen(3000 , () => {
    console.log("server is listening on port 3000 !!")
})
