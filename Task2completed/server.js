// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
require('dotenv').config();  // Load environment variables

// Initialize Express
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Twilio Credentials from Environment Variables
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Interview link
const interviewLink = "https://v.personaliz.ai/?id=9b697c1a&uid=fe141702f66c760d85ab&mode=test";

// Function to send IVR call
function sendIVRCall(toPhoneNumber) {
  client.calls
    .create({
      url: 'https://a0dd-2401-4900-1c45-cd8f-c91a-a6b0-4004-fe49.ngrok-free.app/ivr',  // Webhook for IVR menu
      to: toPhoneNumber,
      from: '+18566660253'
    })
    .then(call => console.log(`Call initiated: ${call.sid}`))
    .catch(error => console.error(`Error making call: ${error}`));
}

// Twilio Webhook: Handle IVR call
app.post('/ivr', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  // Add instructions for the user
  twiml.say('Welcome to the interview process.');
  twiml.gather({
    input: 'dtmf',
    numDigits: 1,
    action: '/handle-gather', // Webhook to process user input
    method: 'POST'
  }).say('If you are interested in the interview, press 1, and press 2 to cancel');

  res.type('text/xml');
  res.send(twiml.toString());
});

// Handle the response from user input
app.post('/handle-gather', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const digits = req.body.Digits;

  if (digits === '1') {
    // If the user presses 1, send them the interview link
    twiml.say(`Thank you! You will receive an SMS with the interview link shortly.`);

    // Send an SMS with the interview link
    client.messages
      .create({
        body: `Thank you for your interest! Here is your personalized interview link: ${interviewLink}`,
        to: req.body.To, // Send to the number from which the call came
        from: '+18566660253'
      })
      .then(message => console.log(`SMS sent: ${message.sid}`))
      .catch(error => console.error(`Error sending SMS: ${error}`));
  } else if (digits === '2') {
    // If the user presses 2, cancel the process
    twiml.say(`Thank you for your time. The interview process has been canceled.`);
  } else {
    // Handle invalid input
    twiml.say(`Invalid input. Please try again.`);
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

// Start Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Example: sendIVRCall('+1234567890');

sendIVRCall('+917020667432');
