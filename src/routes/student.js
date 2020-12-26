
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router()
const {mysql} = require("../db/mysql");
const auth = require("../middleware/auth");
const generateAuthToken = require("../token/generateAuthToken")


//Student Login


router.post("/login",async (req,res)=>{
    try {
        const [results,fields] =  await mysql.query("SELECT usn,studentpass FROM student WHERE usn = ?",[req.body.usn]);
        if(results.length==0){
            return res.status(400).json({msg:"Authentication Error!"});
        }
        const userString = JSON.stringify(results[0]);
        const user_data = JSON.parse(userString);
        const user = {usn:user_data.usn,userType: "student"}
        const str = user_data.studentpass
        const isMatch = str.localeCompare(req.body.studentpass);
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

router.put("/login",auth('student'), async (req,res)=>{
    try {
        const data = req.body
        
        const [results2] = await mysql.query("UPDATE student SET studentpass = (?) WHERE usn = (?)", [data.studentpass,data.usn])
    
    res.json({"msg":"password updated"})
    } catch (error) {
        console.log(error);
        res.status(500).send(error);           
    }
   
})

module.exports = router;
