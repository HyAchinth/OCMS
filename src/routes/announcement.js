const express = require('express');
const router = express.Router();
const { mysql } = require('../db/mysql');
const auth = require('../middleware/auth');

//add announcements

router.post(
    '/announcements',
    auth('teacher'), async (req, res) => {
        try {
            const { classid, announcement, dtime } = req.body;
            const [
                results,
            ] = await mysql.query(
                'INSERT INTO announcements (classid, announcement, dtime) VALUES (?)',
                [[classid, announcement, dtime]]
            );
            res.json({ Response: 'Announcement added' });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
);

//delete announcements

router.delete(
    '/announcements/:id',
    auth('teacher'), async (req, res) => {
        const aid = req.params.id;
        console.log(aid);
        try {
            const [
                result,
            ] = await mysql.query('DELETE FROM announcements where aid = (?)', [
                [aid],
            ]);
            res.json({ msg: 'deleted' });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
);

//get one announcement by aid

router.get(
    '/:id',
    /*auth('teacher'),*/ async (req, res) => {
        try {
            const [
                results,
                fields,
            ] = await mysql.query(
                'SELECT * FROM announcements WHERE aid= (?)',
                [req.params.id]
            );
            res.json({results});
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
);

//get all announcements

router.get(
    '/',
    /*auth('teacher'),*/ async (req, res) => {
        try {
            const [
                results,
                fields,
            ] = await mysql.query(
                'SELECT announcement,dtime,classid FROM announcements',
            );
            res.json({results});
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
);

//view announcements list for a class

router.get(
    '/class/:id',
    /*auth('teacher'),*/ async (req, res) => {
        try {
            const [
                results,
                fields,
            ] = await mysql.query(
                'SELECT announcement,dtime FROM announcements WHERE classid=?',
                [req.params.id]
            );
            res.json({results});
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
);


module.exports = router;