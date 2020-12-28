require('dotenv').config();
const express = require('express');
const app = express();
const { mysql } = require('./db/mysql');

const port = 5000;
app.use(express.json());
app.use('/student', require('./routes/student'));
app.use('/teacher', require('./routes/teacher'));
app.use('/auth', require('./routes/auth'));

app.get('/:id', async (req, res) => {
    //res.send('Hello World!')
    const [
        results,
        fields,
    ] = await mysql.query('SELECT * FROM department WHERE deptid=?', [
        req.params.id,
    ]);
    const deptString = JSON.stringify(results[0]);
    const dept = JSON.parse(deptString);
    res.json(dept);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
