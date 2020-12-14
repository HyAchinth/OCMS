
const express = require("express");
const router = express.Router()
const {mysql} = require("../db/mysql");

router.post('/', async (req,res)=>{
    const data = req.body
    const [results,fields] =  await mysql.query("INSERT INTO student (usn,stname,emailid,yearno,semester,studentpass,deptid,sectionid) VALUES (?)", [[data.usn,data.stname,data.emailid,data.yearno,data.semester,data.studentpass,data.deptid,data.sectionid]])
    res.json({"msg":"student added"})
})

module.exports = router;
