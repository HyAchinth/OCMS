const express = require("express");
const app = express();

const port = 3000;
app.use(express.json());

app.get('/', (req, res) => {
    //res.send('Hello World!')
    res.json({ "ok": "not ok" })
})

app.post('/:id', (req, res) => {
    const data = req.body
    const num = req.params.id
    console.log(data)
    console.log(num)
    return res.json({"message":"recieved"})
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

