const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router()
const {mysql} = require("../db/mysql");
const auth = require("../middleware/auth");
const generateAuthToken = require("../token/generateAuthToken")


//Teacher Login


router.post("/login",async (req,res)=>{
    try {
        const [results,fields] =  await mysql.query("SELECT teacherid,pass FROM teacher WHERE teacherid = ?",[req.body.teacherid]);
        if(results.length==0){
            return res.status(400).json({msg:"Authentication Error!"});
        }
        const userString = JSON.stringify(results[0]);
        const user_data = JSON.parse(userString);
        const user = {teacherid:user_data.teacherid,userType: "teacher"}
        const str = user_data.pass
        const isMatch = str.localeCompare(req.body.pass);
        if(!isMatch){
            generateAuthToken(user,(token)=>{
                res.json({token});
            });   
        }
        else{
            res.status(400).json({msg:"Authentication Error!"});
        }
    } catch (error) {
        res.status(500).send("Server Error!");
        console.log(error);
    }
});

//change password

router.put("/login",auth('teacher'), async (req,res)=>{
    try {
        const data = req.body
        
        const [results2] = await mysql.query("UPDATE teacher SET pass = (?) WHERE teacherid = (?)", [data.pass,data.teacherid])
    
    res.json({"msg":"password updated"})
    } catch (error) {
        console.log(error);
        res.status(500).send(error);           
    }
   
})

module.exports = router;
