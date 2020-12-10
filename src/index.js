const express = require("express");
const app = express();
const {mysql} = require("./db/mysql");

const port = 3000;
app.use(express.json());

app.get('/:id',async (req, res) => {
    //res.send('Hello World!')
    const [results,fields] = await mysql.query("SELECT * FROM department WHERE deptid=?",[req.params.id])
    const deptString = JSON.stringify(results[0]);
    const dept = JSON.parse(deptString);
    res.json(dept);
    
})

app.post('/dept',async (req, res) => {
    const data = req.body
    const [results,fields] = await mysql.query("INSERT INTO department (deptname,adminuser,adminpass) values (?)", [[data.deptname,data.adminuser,data.adminpass]])
    res.json({"msg":"added"})
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

