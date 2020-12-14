const jwt = require("jsonwebtoken");
const express = require("express");
/**
 * 
 * @param {express.Request} req 
 * @param {*} res 
 * @param {*} next 
 */
const auth = async (req,res,next)=>{
    try {
        const token = req.header("x-auth-token");
        console.log(req.headers)
        jwt.verify(token,"secret",(error,decoded)=>{
            if(error) throw error;
            req.user=decoded.user;
            req.token=token;
            next();
        });
    } catch (error) {
        res.status(401).json({error:"Invalid Token!"});
    }
};

module.exports = auth;
