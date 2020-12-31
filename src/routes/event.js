const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { mysql } = require('../db/mysql');
const auth = require('../middleware/auth');
const generateAuthToken = require('../token/generateAuthToken');
const fsp = require('fs/promises');
const path = require('path');
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CRED_PATH = path.join(__dirname, 'credentials.json');
// const mails = [
//     { email: 'achinthyas.cs18@rvce.edu.in' },
//     { email: 'ambukarthik.cs18@rvce.edu.in' },
//     { email: 'aravinda.cs18@rvce.edu.in' },
// ];
// const eid = 'ocms08';
// const summary = 'DMS class';
// const desc = 'Teacher: HKK';
// const start = '2021-3-20T01:00:00';
// const end = '2021-3-20T02:00:00';
// const freq = 'DAILY'; //can be WEEKLY
// const count = '1';

// Load client secrets from a local file.
/**
 * wrapper function
 * @param {{email:string}[]} mails
 * @param {string} eid
 * @param {string} summary
 * @param {string} desc
 * @param {string} start
 * @param {string} end
 * @param {'DAILY'|'WEEKLY'} freq
 * @param {string} count
 */
async function generateEvent(mails, eid, summary, desc, start, end, freq, count) {
    const creds = await fsp.readFile(CRED_PATH);
    const client = await authorize(JSON.parse(creds));

    await addEvents(mails, eid, summary, desc, start, end, freq, count, client);
    // fs.readFile('credentials.json', (err, content) => {
    //     if (err) return console.log('Error loading client secret file:', err);
    //     // Authorize a client with credentials, then call the Google Calendar API.
    //     authorize(
    //         JSON.parse(content),
    //         addEvents(mails, eid, summary, desc, start, end, freq, count)
    //     );
    // });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    /**
     * @type {string} token
     */
    let token;
    try {
        token = (await fsp.readFile(TOKEN_PATH)).toString();
    } catch (e) {
        token = await getAccessToken(oAuth2Client);
    }
    // console.log(token)
    oAuth2Client.setCredentials(JSON.parse(token.toString()));
    return oAuth2Client;
    // Check if we have previously stored a token.
    // fs.readFile(TOKEN_PATH, (err, token) => {
    //     if (err) return getAccessToken(oAuth2Client, callback);
    //     oAuth2Client.setCredentials(JSON.parse(token));
    //     callback(oAuth2Client);
    // });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 * @returns {Promise<any>} oAuth2 client
 */
function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);

    return new Promise((res, rej) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', code => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return rej(err); //console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
                    if (err) return rej(err); //console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
                res(oAuth2Client);
                // callback(oAuth2Client);
            });
        });
    });
}

async function addEvents(mails, eid, summary, desc, start, end, freq, count, oclient) {
    const calendar = google.calendar({ version: 'v3', auth: oclient });
    let event = {
        id: eid,
        summary: summary,
        //"location": "800 Howard St., San Francisco, CA 94103",
        description: desc,
        start: {
            dateTime: start,
            timeZone: 'Asia/Kolkata',
        },
        end: {
            dateTime: end,
            timeZone: 'Asia/Kolkata',
        },
        attendees: mails,
        conferenceData: {
            createRequest: {
                requestId: 'abcd',
                conferenceSolutionKey: {
                    type: 'hangoutsMeet',
                },
            },
        },
        recurrence: ['RRULE:FREQ=' + freq + ';COUNT=' + count],

        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 10 },
            ],
        },
    };
    console.log(event.id);
    // FIXME REMOVE CATCH

    const eventDoc = await calendar.events.insert({
        auth: oclient,
        calendarId: 'primary',
        resource: event,
    });
    console.log('Event created: %s', eventDoc.htmlLink);
    const eventPatch = {
        conferenceData: {
            createRequest: { requestId: '7qxalsvy0ewqwqwqww' },
        },
    };

    const patchedEvent = await calendar.events.patch({
        calendarId: 'primary',
        eventId: eid,
        resource: eventPatch,
        sendNotifications: true,
        conferenceDataVersion: 1,
    });

    console.log('Conference created for event: %s', patchedEvent.htmlLink);

    // calendar.events.insert(
    //     {
    //         auth: auth,
    //         calendarId: 'primary',
    //         resource: event,
    //     },
    //     function (err, event) {
    //         if (err) {
    //             console.log(
    //                 'There was an error contacting the Calendar service: ' +
    //                     err
    //             );
    //             return;
    //         }
    //         console.log('Event created: %s', event.htmlLink);
    //         var eventPatch = {
    //             conferenceData: {
    //                 createRequest: { requestId: '7qxalsvy0ewqwqwqww' },
    //             },
    //         };

    //         calendar.events
    //             .patch({
    //                 calendarId: 'primary',
    //                 eventId: eid,
    //                 resource: eventPatch,
    //                 sendNotifications: true,
    //                 conferenceDataVersion: 1,
    //             })
    //             .then(function (event) {
    //                 console.log(
    //                     'Conference created for event: %s',
    //                     event.htmlLink
    //                 );
    //             });
    //     }
    // );

    /* 
  var eventPatch = {
    conferenceData: {
      createRequest: {requestId: "7qxalsvy0ewqwqwqww"}
    }
  };
  
    calendar.events.patch({
    calendarId: "primary",
    eventId: "aravind69",
    resource: eventPatch,
    sendNotifications: true,
    conferenceDataVersion: 1
  }).then(function(event) {
    console.log("Conference created for event: %s", event.htmlLink);
  });
*/
}

module.exports = generateEvent;
