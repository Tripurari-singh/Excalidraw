import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
// import bodyParser from "body-parser";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config"
import { CreateUserSchema , SigninSchema , CreateRoomSchema } from "@repo/common/types";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import dotenv from "dotenv";
dotenv.config();
import { prisma } from "@repo/db";
import { ZodError } from "zod";


app.post("/signup" , async (req  , res) => {
    console.log("Route Hit")
    try{
     
    const ParsedData = CreateUserSchema.parse(req.body);
    
    if(!ParsedData){
        res.status(400).json({
            message : "Invalid crediantials"
        })
        return; 
    }

    // DB call to get check use already exist...
    const userExist = await prisma.user.findUnique({
        where : {
            email : ParsedData.email
        }
    })

    if(userExist){
        res.status(400).json({
            message : "User Already Exist"
        })
        return;
    }

    // Hashing Password
    const HashedPassword =  await bcrypt.hash(ParsedData.password , 10);

    // DB call to add user to data
    const user =  await prisma.user.create({
        data : {
            username : ParsedData.username,
            password : HashedPassword,
            email : ParsedData.email,
            avatar : ParsedData.avatar,
        }
    })

    res.status(200).json({
        message : "user added successfully !",
        userid : user.id,
        user,
    })
    }catch(error){
         if (error instanceof ZodError) {
              return res.status(400).json({
                error : error
              });
        }
        console.log(error);
        res.status(500).json({
            message : "Internal server Error",
            error  : error
        })
    }
})
app.post("/signin" , async (req , res) => {
    try{

    const ParsedData = SigninSchema.parse(req.body);
    
    if(!ParsedData){
        res.status(400).json({
            message : "Invalid crediantials"
        })
        return;
    }

    //DB call to get the user
    const user = await prisma.user.findUnique({
        where : {
            email : ParsedData.email
        }
    });

    if(!user){
        res.status(400).json({
            message : "User Not Found in Database !"
        })
    }

    // Password Matching
    const isvalid = await bcrypt.compare(ParsedData.password , user.password);

    if(!isvalid){
        res.status(400).json({
            message : "Invalid Password"
        })
    }
    const token =  await jwt.sign({
        userId : user.id,
    }, JWT_SECRET)

    res.status(200).json({
        message : "SignIn Successfully",
        token : token
    })
    }catch(error){
        console.log(error);
            res.status(500).json({
            message : "Internal server Error",
            error  : error
        })
    }
})




app.post("/room", middleware , async (req , res) => {
    try{
        const ParsedData = CreateRoomSchema.parse(req.body);

        if(!ParsedData){
            res.status(400).json({
                message : "Invalid crediantials"
            })
        }
        
        //@ts-ignore
        const userId = req.userId;

        const room = await prisma.room.create({
            data : {
                slug : ParsedData.name,
                adminId : userId
            }
        })

        res.status(200).json({
            message : "Added To Room",
            roomId : room.id,
        })

        
    }catch(error){
        res.status(500).json({
            message : "Internal server Error"
        })
    }
})

app.listen(3000 , () => {
    console.log("server is listening on port 3000 !!")
})