import  express  from "express";
import z from "zod";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import {CreateUserSchema , SigninSchema , CreateRoomSchema , } from "@repo/common/types"

const app = express();
app.use(express.json());
app.post("/signup" , (req , res) => {
    const data = CreateUserSchema.safeParse(req.body);
    if(!data.success){
        res.json({
            message : "Incorrect Inputs"
        })
        return
    }

    //DB Call

    res.json({
        message: "User Created",
        userId : "123"
    })
    
})

app.post("/signin" , (req , res) => {
    const data = SigninSchema.safeParse(req.body)
    if(!data.success){
        res.json({
            message : "Incorrect Crediantials"
        })
        return
    }

    const userId = 1;
    const token = jwt.sign({
        userId
    } , JWT_SECRET)

    res.json({
        message : "Successfylly Signed In",
        token : token
    })
})

app.post("/room" , (req , res) => {
    const data = CreateRoomSchema.safeParse(req.body);
    if(!data.success){
        res.json({
            message : "Incorrect Crediantials"
        })
        return
    }

    //DB Call
    res.json({
        message : "Room Created",
        roomId : 123
    })


})

app.listen(3000 , () => {
    console.log("App is Listening On Port 3000")
})