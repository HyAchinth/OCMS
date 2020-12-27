const jwt = require("jsonwebtoken");
const express = require("express");
/**
 * 
 * @param {express.Request} req 
 * @param {*} res 
 * @param {*} next 
 */
const auth = (role)=>async (req,res,next)=>{
    try {
        const token = req.header("x-auth-token");
        console.log(req.headers)
        jwt.verify(token,process.env.ACCESS_TOKEN,(error,decoded)=>{
            if(error) throw error;
            req.user=decoded.user;
            req.token=token;
            if(req.user.userType!=role){
                throw new Error("Wrong Role!")
            }

            next();
        });
    } catch (error) {
        res.status(401).json({error:"Invalid Token!"});
    }
};

module.exports = auth;
