const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { mysql } = require('../db/mysql');

// Get all classrooms

router.get('/', async (req, res) => {
    try {
        const [results] = await mysql.query('SELECT * from classroom');

        const classString = JSON.stringify(results);
        const classes = JSON.parse(classString);
        res.json({ ok: true, classes });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

// Get one class

router.get('/:classid', async (req, res) => {
    try {
        const data = req.params;

        const [
            results,
        ] = await mysql.query('SELECT * from classroom where classid = (?)', [
            data.classid,
        ]);
        if (results.length === 0) {
            res.json({ ok: true, classes: {} });
        } else {
            const classString = JSON.stringify(results[0]);
            const classroom = JSON.parse(classString);
            res.json({ ok: true, classroom });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = router;
