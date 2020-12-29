const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { mysql } = require('../db/mysql');

// Get all sections/timetables by deptid

router.get('/dept/:deptid', async(req, res) => {
    try{
        const data = req.params;

        const [
            results
        ] = await mysql.query(
            'SELECT * from timetable where deptid = (?)',
            [data.deptid] 
        );

        const sectionString = JSON.stringify(results);
        const sections = JSON.parse(sectionString)
        res.json({ok: true, sections});
    } catch(error) {
        console.log(error);
        res.status(500).send(error);
    }
})

module.exports = router;