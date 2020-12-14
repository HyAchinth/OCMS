const express = require("express");
const app = express();
const {mysql} = require("./db/mysql");

const port = 3000;
app.use(express.json());
app.use("/student",require("./routes/student.js"));
app.use("/auth",require("./routes/auth"));

app.get('/:id',async (req, res) => {
    //res.send('Hello World!')
    const [results,fields] = await mysql.query("SELECT * FROM department WHERE deptid=?",[req.params.id])
    const deptString = JSON.stringify(results[0]);
    const dept = JSON.parse(deptString);
    res.json(dept);
    
})



app.post('/admin/timetable',async (req, res) => {
    const data = req.body
    const [results,fields] = await mysql.query("INSERT INTO timetable (sectionid,yearno,semester,deptname,deptid) values (?)", [[data.sectionid,data.yearno,data.semester,data.department,data.deptid]])
    res.json({"msg":"timetable added"})
})

app.post('/admin/student', async (req,res)=>{
    const data = req.body
    const [results,fields] =  await mysql.query("INSERT INTO student (usn,stname,emailid,yearno,semester,studentpass,deptid,sectionid) VALUES (?)", [[data.usn,data.stname,data.emailid,data.yearno,data.semester,data.studentpass,data.deptid,data.sectionid]])
    res.json({"msg":"student added"})
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

