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
const count = '3';

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

Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('-');
};
var c = parseInt(count, 10);
var newdate = new Date(start);
for (var i = 0; i < c; i++) {
    var days = 7 * (i + 1);
    newdate.setDate(newdate.getDate() + days);
    var edate = newdate.yyyymmdd();
    console.log(edate);
}
