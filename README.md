# wordle-helper
A web application to assist in playing the New York Times Wordle game.

## How to Run Locally
To run the application locally, simply type the following command in the terminal after connecting to MongoDB:
npm start

The application will run on port 3000 unless a different port is defined in the environment variables.

Connecting to MongoDB
Wordle Helper uses MongoDB for data storage. To connect, create your MongoDB account and replace the connection string in server/mongo.js with your own.

## Content
-index.js: this file handles the different routes, starts a node server, and configures middleware for express application 
-mongo.js: this file connects to the specified MongoDB database and exports a function that allows connection to the database from index.js
-index.html: basic html structure of the application
-main.css: styling rules for the application
-wordleHelper.js: this is the file that includes most of the logic and implements most of the functionalities of this application.
  -State Management: 
    -Saves and retrieves the game state (correct letters, valid letters, absent letters) in the local storage.
  -User Input Handling: Manages input validation for correct and valid letters, preventing conflicts with absent letters. Dynamically generates absent letter     
   buttons (A-Z) and handles their selection.
  -Word Filtering: Filters a list of valid words based on the current game state, considering correct, valid, and absent letters.
  -Word Frequency: Fetches word frequencies and determines the frequency of words for sorting.
  -UI Display: Displays a list of possible words on the UI.
Displays game history on the UI.
  -Server Interaction:
Sends and receives data to/from the server for saving game state and retrieving game history.
Initialization and Event Handling:
Initializes styles, event listeners, and restores the game state on page load.
Handles focus navigation and updates the UI dynamically based on user input.
Server Communication:
Utilizes fetch API to communicate with the server for saving game state and retrieving history.
Dynamic UI Elements:
Dynamically generates absent letter buttons and adjusts UI elements based on user input.
Server Endpoints:
Assumes the presence of server-side endpoints for saving game state, retrieving history, and clearing history.

