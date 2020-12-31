const event = require('./event');

const mails = [
    { email: 'achinthyas.cs18@rvce.edu.in' },
    { email: 'ambukarthik.cs18@rvce.edu.in' },
    { email: 'aravinda.cs18@rvce.edu.in' },
];

let a = {};
a.mails = mails;
a.eid = 'ocms09';
a.summary = 'DMS2 class';
a.desc = 'Teacher: HKK';
a.start = '2021-3-25T01:00:00';
a.end = '2021-3-25T02:00:00';
a.freq = 'DAILY'; //can be WEEKLY
a.count = '1';

console.log(JSON.stringify(a));

// (async function () {
//     try {
//         await event(mails, eid, summary, desc, start, end, freq, count);
//     } catch (e) {
//         console.log(e);
//     }
// })();
