const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Calendar API.
    authorize(JSON.parse(content), addEvents);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', code => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 [
        {'email': 'achinthyas.cs18@rvce.edu.in'},
        {'email': 'ambukarthik.cs18@rvce.edu.in'},
      ]
 
 */

const mails = [
    { email: 'achinthyas.cs18@rvce.edu.in' },
    { email: 'ambukarthik.cs18@rvce.edu.in' },
    { email: 'aravinda.cs18@rvce.edu.in' },
];
const eid = 'ocms08';
const summary = 'DMS class';
const desc = 'Teacher: HKK';
const start = '2021-3-20T01:00:00';
const end = '2021-3-20T02:00:00';
const freq = 'DAILY'; //can be WEEKLY
const count = '1';

function addEvents(auth) {
    const calendar = google.calendar({ version: 'v3', auth });
    var event = {
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

    calendar.events.insert(
        {
            auth: auth,
            calendarId: 'primary',
            resource: event,
        },
        function (err, event) {
            if (err) {
                console.log(
                    'There was an error contacting the Calendar service: ' + err
                );
                return;
            }
            console.log('Event created: %s', event.htmlLink);
            var eventPatch = {
                conferenceData: {
                    createRequest: { requestId: '7qxalsvy0ewqwqwqww' },
                },
            };

            calendar.events
                .patch({
                    calendarId: 'primary',
                    eventId: eid,
                    resource: eventPatch,
                    sendNotifications: true,
                    conferenceDataVersion: 1,
                })
                .then(function (event) {
                    console.log(
                        'Conference created for event: %s',
                        event.htmlLink
                    );
                });
        }
    );

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
