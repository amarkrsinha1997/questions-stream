const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;
const { v4: uuidv4 } = require('uuid');
const questions = require('./questions')

function generateUniqueID() {
  const uniqueID = uuidv4();
  return uniqueID;
}

// Function to pick n random elements from an array
function getRandomQuestions(arr, n) {
  const result = [];
  for(let i = 0; i < n; i++) {
    result.push(arr.splice(Math.floor(Math.random() * arr.length), 1)[0]);
  }
  return result;
}

// Function to send Server-Sent Events
function sendSSE(res, eventName, id, data) {
  res.write(`event: ${eventName}\n`);
  if (id) res.write(`id: ${id}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

app.get('/questions', (req, res) => {

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Get the number of questions from the query parameter or default to 10
  let numQuestions = parseInt(req.query.n) || 10;

  // Validate the number of questions
  if (isNaN(numQuestions) || numQuestions < 10 || numQuestions > 100) {
    sendSSE(res, 'error', null, { error: 'Number of questions should be between 10 and 100' });
    return res.end();
  }

  // Select the specified number of random questions
  let selectedQuestions = getRandomQuestions(questions, numQuestions);

  selectedQuestions.forEach((question, index) => {
    setTimeout(() => sendSSE(res, 'question', index, {...question, id: generateUniqueID() }), index * 5000);
  });

  // End the response after all questions have been sent
  setTimeout(() => res.end(), selectedQuestions.length * 5000);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
