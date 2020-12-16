const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router()
const {mysql} = require("../db/mysql");
const auth = require("../middleware/auth");
const generateAuthToken = require("../token/generateAuthToken");

//Crete new department/admin

router.post('/department',async (req, res) => {
    try {
        const data = req.body
        const[results] = await mysql.query("SELECT adminuser AS adminuser FROM department WHERE adminuser = ?",[data.adminuser])
        if(results.length!==0 && results[0].adminuser===data.adminuser){
            return res.json({msg:"adminuser already registered!"});
        }
        const salt = await bcrypt.genSalt(10);
        data.adminpass = await bcrypt.hash(data.adminpass,salt);
    const [results2] = await mysql.query("INSERT INTO department (deptname,adminuser,adminpass) values (?)", [[data.deptname,data.adminuser,data.adminpass]])
    const user = {email:data.adminuser,userType: "admin"}
    generateAuthToken(user,(token)=>{        
        res.json({token});
    })
       
        
    } catch (error) {
        console.log(error);
        res.status(500).send(error);           
    }
   
})

// Get admin details

router.get("/department",auth,async (req,res)=>{
    try {
        const[results,fields] =  await mysql.query("SELECT * FROM department WHERE adminuser = ?",[req.user.email]);
            const userString = JSON.stringify(results[0]);
            const user = JSON.parse(userString);
            delete user.adminpass;
            res.json(user);
    } catch (error) {
        res.status(500).send("Server Error!");
        console.log(error);
    }
});

/*
Admin Login
*/

router.post("/admin/login",async (req,res)=>{
    try {
        const [results,fields] =  await mysql.query("SELECT adminuser,adminpass FROM department WHERE adminuser = ?",[req.body.adminuser]);
        if(results.length==0){
            return res.status(400).json({msg:"Authentication Error!"});
        }
        const userString = JSON.stringify(results[0]);
        const user_data = JSON.parse(userString);
        const user = {email:user_data.adminuser,userType: "admin"}
        const isMatch = await bcrypt.compare(req.body.adminpass,user_data.adminpass);
        if(isMatch){
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

//register student


router.post("/admin/student",auth, async (req,res)=>{
    try {
        const data = req.body
        const[results] = await mysql.query("SELECT usn AS usn FROM student WHERE usn = ?",[data.usn])
        if(results.length!==0 && results[0].usn===data.usn){
            return res.json({msg:"student already registered!"});
        }
        const salt = await bcrypt.genSalt(10);
        data.studentpass = await bcrypt.hash(data.studentpass,salt);
    const [results2] = await mysql.query("INSERT INTO student (usn,stname,emailid,yearno,semester,studentpass,deptid,sectionid) VALUES (?)", [[data.usn,data.stname,data.emailid,data.yearno,data.semester,data.studentpass,data.deptid,data.sectionid]])
    
    res.json({"msg":"student added"})
    } catch (error) {
        console.log(error);
        res.status(500).send(error);           
    }
   
})

//register teacher

router.post("/admin/teacher",auth, async (req,res)=>{
    try {
        const data = req.body
        const[results] = await mysql.query("SELECT teacherid AS teacherid FROM teacher WHERE teacherid = ?",[data.teacherid])
        if(results.length!==0 && results[0].teacherid===data.teacherid){
            return res.json({msg:"teacher already registered!"});
        }
        const salt = await bcrypt.genSalt(10);
        data.studentpass = await bcrypt.hash(data.studentpass,salt);
    const [results2] = await mysql.query("INSERT INTO teacher (teacherid,tname,emailid,pass) VALUES (?)", [[data.teacherid,data.tname,data.emailid,data.pass]])
    
    res.json({"msg":"teacher added"})
    } catch (error) {
        console.log(error);
        res.status(500).send(error);           
    }
   
})


module.exports = router;