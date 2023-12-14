# wordle-helper
A web application to assist in playing the New York Times Wordle game.

## How to Run Locally
To run the application locally, simply type the following command in the terminal:
npm start

The application will run on port 3000 unless a different port is defined in the environment variables.

Connecting to MongoDB
Wordle Helper uses MongoDB for data storage. To connect, create your MongoDB account and replace the connection string in server/mongo.js with your own.

Usage Instructions
Enter known letters and their positions.
Input any known letters not in specified positions.
Toggle absent letters.
Click 'update' to display possible words.
Key Features
Input correct, valid, and absent letters.
Dynamic UI with toggleable absent letter buttons.
Focus navigation for fast typing.
Filtering of valid Wordle words based on user input.
Word frequency sorting for better suggestions.
Comprehensive error handling.
Architecture
The project structure includes client, node_modules, server, .env, .gitignore, package.json, and package-lock.json.

Important Files
index.js: Handles routes, starts the server, and configures middleware.
mongo.js: Connects to MongoDB and exports a connection function.
index.html: Basic HTML structure of the application.
main.css: Styling rules for the application.
wordleHelper.js: Implements most of the logic and functionalities.
State Management
Saves and retrieves game state in local storage.
User Input Handling
Manages input validation for letters.
Dynamically generates absent letter buttons.
Word Filtering
Filters valid words based on the current game state.
Word Frequency
Fetches word frequencies for sorting.
UI Display
Displays a list of possible words and game history.
Server Interaction
Communicates with the server for saving game state and retrieving history.
Initialization and Event Handling
Initializes styles, event listeners, and restores game state on page load.
Handles focus navigation and updates the UI dynamically based on user input.
Server Communication
Utilizes fetch API to communicate with the server.
Dynamic UI Elements
Dynamically generates absent letter buttons and adjusts UI elements based on user input.
Server Endpoints
Assumes server-side endpoints for saving game state, retrieving history, and clearing history.
