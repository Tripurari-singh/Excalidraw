import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";
import {Request,Response,NextFunction } from "express";

export function middleware( req : Request , res : Response , next : NextFunction){
    const token = req.headers["authorization"] ?? "";
    const decoded = jwt.verify(token , JWT_SECRET);
    if(decoded){
        //@ts-ignore
        req.userId =  decoded.userId;
        next();
    }else{
        res.status(403).json({
            message : "UnAuthorised"
        })
    }
}