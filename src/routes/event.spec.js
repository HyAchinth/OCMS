//@ts-check
const event = require('./event');

const mails = [
    { email: 'achinthyas.cs18@rvce.edu.in' },
    { email: 'ambukarthik.cs18@rvce.edu.in' },
    { email: 'aravinda.cs18@rvce.edu.in' },
];

// let a = {};
// const mails = mails;
const eid = 'ocms09';
const summary = 'DMS2 class';
const desc = 'Teacher: HKK';
const start = '2021-3-25T01:00:00';
const end = '2021-3-25T02:00:00';
const freq = 'DAILY'; //can be WEEKLY
const count = '1';

// console.log(JSON.stringify(a));

(async function () {
    try {
        await event(mails, eid, summary, desc, start, end, freq, count);
    } catch (e) {
        console.log(e);
    }
})();
