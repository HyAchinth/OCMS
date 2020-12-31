const express = require('express');
const router = express.Router();
const { mysql } = require('../db/mysql');

//get all events
router.get('/', async (req, res) => {
    try {
        const [results] = await mysql.query('SELECT * from events');

        const eventString = JSON.stringify(results);
        const events = JSON.parse(eventString);
        res.json({ ok: true, events });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//get event by id
router.get('/:id', async (req, res) => {
    try {
        const [results] = await mysql.query('SELECT * from events where eventid=(?)', [req.params.id]);

        const eventString = JSON.stringify(results);
        const events = JSON.parse(eventString);
        res.json({ ok: true, events });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//get event by sectionid or timetable
router.get('/timetable/:id', async (req, res) => {
    try {
        const [results] = await mysql.query('SELECT * from events where sectionid=(?)', [req.params.id]);

        const eventString = JSON.stringify(results);
        const events = JSON.parse(eventString);
        res.json({ ok: true, events });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//get events for a teacher by teacherid
router.get('/teacher/:id', async (req, res) => {
    try {
        const [
            results,
        ] = await mysql.query(
            'select eventid,fromtime,totime,ondate,events.classid,sectionid,description,link from teacher inner join teaches on teacher.teacherid = teaches.teacherid inner join events on teaches.classid = events.classid and teacher.teacherid = (?)',
            [req.params.id]
        );

        const eventString = JSON.stringify(results);
        const events = JSON.parse(eventString);
        res.json({ ok: true, events });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//get events for a classroom by classid
router.get('/subject/:id', async (req, res) => {
    try {
        const [results] = await mysql.query('SELECT * from events where classid=(?)', [req.params.id]);

        const eventString = JSON.stringify(results);
        const events = JSON.parse(eventString);
        res.json({ ok: true, events });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = router;
