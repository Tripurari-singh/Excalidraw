import express from "express";
import z from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { middleware } from "./middleware";
import {JWT_SECRET} from "@repo/backend-common/config"
import { CreateUserSchema , SigninSchema , CreateRoomSchema } from "@repo/common/types";

const app = express();

app.get("/signup" , (req  , res) => {
    try{
     
    const data = CreateUserSchema.parse(req.body);
    
    if(!data){
        res.status(400).json({
            message : "Invalid crediantials"
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

    const data = SigninSchema.parse(req.body);
    
    if(!data){
        res.status(400).json({
            message : "Invalid crediantials"
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
    try{
        const data = CreateRoomSchema.parse(req.body);

        if(!data){
            res.status(400).json({
                message : "Invalid crediantials"
            })
        }

        
    }catch(error){
        res.status(500).json({
            message : "Internal server Error"
        })
    }
})

app.listen(3000 , () => {
    console.log("server is listening on port 3000 !!")
})
