const express = require('express');
const router = express.Router();
const { mysql } = require('../db/mysql');

//show all feedback
router.get('/', async (req, res) => {
    try {
        const [results] = await mysql.query('SELECT * from feedback');

        const feedbackString = JSON.stringify(results);
        const feedbacklist = JSON.parse(feedbackString);
        res.json({ ok: true, sections: feedbacklist });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//get feedback for event by id
router.get('/:id', async (req, res) => {
    try {
        const [results] = await mysql.query('SELECT * from feedback where eventid=(?)', [req.params.id]);

        const eventString = JSON.stringify(results);
        const events = JSON.parse(eventString);
        res.json({ ok: true, sections: events });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = router;
