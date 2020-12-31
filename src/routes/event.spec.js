//@ts-check
const event = require('./addevent');

const mails = [
    { email: 'achinthyas.cs18@rvce.edu.in' },
    { email: 'ambukarthik.cs18@rvce.edu.in' },
    { email: 'aravinda.cs18@rvce.edu.in' },
];

// let a = {};
// const mails = mails;
const eid = 'ocms69';
const summary = 'DMS2 class';
const desc = 'Teacher: HKK';
const start = '2021-12-31T16:20:02.292Z';
const end = '2021-12-31T17:20:02.292Z';
const freq = 'DAILY'; //can be WEEKLY
const count = '1';

// console.log(JSON.stringify(a));
/*
(async function () {
    try {
        await event(mails, eid, summary, desc, start, end, freq, count);
    } catch (e) {
        console.log(e);
    }
})();
*/
const split = end.split('T');

console.log('date=' + split[0] + ' time=' + split[1]);
