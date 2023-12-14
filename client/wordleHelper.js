function saveToLocalStorage() {
    const correctLetters = document.querySelectorAll('.correctInput');
    const validLetters = document.querySelectorAll('.validInput');
    const selectedAbsentLetters = document.querySelectorAll('.absentButton.selected');

    const correctLettersValues = Array.from(correctLetters, input => input.value.toUpperCase());
    const validLettersValues = Array.from(validLetters, input => input.value.toUpperCase());
    const selectedAbsentLettersValues = Array.from(selectedAbsentLetters).map(button => button.dataset.letter);

    const gameState = {
        correctLetters: correctLettersValues,
        validLetters: validLettersValues,
        selectedAbsentLetters: selectedAbsentLettersValues,
    };

    localStorage.setItem('wordleGameState', JSON.stringify(gameState));
}

// Function to toggle absent letters
function toggleAbsentLetter(letter) {
    const button = document.querySelector(`.absentButton[data-letter="${letter}"]`);

    const correctLetters = document.querySelectorAll('.correctInput');
    const validLetters = document.querySelectorAll('.validInput');

    const correctLettersValues = Array.from(correctLetters, input => input.value.toUpperCase());
    const validLettersValues = Array.from(validLetters, input => input.value.toUpperCase());

    // Check if the letter is present in correctLetters or validLetters
    if (correctLettersValues.includes(letter) || validLettersValues.includes(letter)) {
        alert(`You cannot toggle the absent letter for '${letter}' as it is already in correct or valid letters.`);
        return;
    }
    
    // Toggle the button if all checks pass
    button.classList.toggle('selected');
    saveToLocalStorage();

    console.log('Absent letters after toggling:', document.querySelectorAll('.absentButton.selected'));
}


// Function to generate absent letter buttons
function generateAbsentLetterButtons() {
    const absentButtonsContainer = document.querySelector('.absentButtons');

    for (let charCode = 65; charCode <= 90; charCode++) {
        const letter = String.fromCharCode(charCode);
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('absentButton');
        button.textContent = letter;
        button.dataset.letter = letter;
        button.addEventListener('click', () => toggleAbsentLetter(letter));
        absentButtonsContainer.appendChild(button);
    }
}

async function filterWords(correctLetters, validLetters, selectedAbsentLetters) {
    const validWordsFile = '/public/validWords.txt';
    const validWords = await fetchValidWords(validWordsFile);

    // Read word frequencies
    const wordFrequenciesFile = '/public/wordFrequenciesFiveLetter.txt';
    const wordFrequencies = await fetchWordFrequencies(wordFrequenciesFile);

    const sortedWords = validWords
        .filter(word => {
            const correctLettersValues = Array.from(correctLetters, input => input.value || '');
            const validLettersValues = Array.from(validLetters).map(input => input.value).filter(value => value !== '');
            const selectedAbsentLettersValues = Array.from(selectedAbsentLetters).map(button => button.dataset.letter);

            const correctLettersMatch = correctLettersValues.every((value, index) => {
                return value === '' || (value && word[index].toUpperCase() === value);
            });

            const validLettersMatch = validLettersValues.every(value => value && word.includes(value.toLowerCase()));
            const absentLettersMatch = selectedAbsentLettersValues.every(letter => !word.includes(letter.toLowerCase()));

            return correctLettersMatch && validLettersMatch && absentLettersMatch;
        })
        .sort((wordA, wordB) => {
            // Compare word frequencies to sort in ascending order
            const frequencyA = getWordFrequency(wordFrequencies, wordA);
            const frequencyB = getWordFrequency(wordFrequencies, wordB);

            return frequencyB - frequencyA;
        });

    // Return only the first 25 words
    return sortedWords.slice(0, 25);
}

async function fetchWordFrequencies(filePath) {
    try {
        const response = await fetch(filePath);
        const data = await response.text();

        // Parse word frequencies from the text file
        const wordFrequencies = data.split('\n')
            .map(line => {
                const [rank, word, frequency] = line.split('\t');
                return { word, frequency: parseInt(frequency) };
            });

        return wordFrequencies;
    } catch (error) {
        console.error('Error fetching word frequencies:', error);
        return [];
    }
}

function getWordFrequency(wordFrequencies, targetWord) {
    const foundWord = wordFrequencies.find(entry => entry.word === targetWord);
    return foundWord ? foundWord.frequency : 0;
}


function displayWordList(words) {
    const wordListContainer = document.getElementById('wordList');
    wordListContainer.innerHTML = '';

    if (words.length === 0) {
        wordListContainer.textContent = 'No matching words.';
        wordListContainer.setAttribute('style', 'font-family: "Merriweather"; margin-top: 145px;');
        return;
    }

    const wordListGrid = document.createElement('div'); // Create a new container for the grid
    wordListGrid.classList.add('right-third'); // Apply the same class as the right-third div for styling

    // Container for the heading and line
    const headerContainer = document.createElement('div');

    // Add a horizontal line before the header
    const hrBeforeHeader = document.createElement('hr');
    hrBeforeHeader.setAttribute('style', 'width: 100%; margin-right: 0; margin-bottom: 42px;');
    headerContainer.appendChild(hrBeforeHeader);

    // Add heading for possible words with stars
    const heading = document.createElement('h2');

    // Add star before heading
    const starBefore = document.createElement('span');
    starBefore.innerHTML = '&#9733;'; // Unicode character for a star
    starBefore.setAttribute('style', 'margin-right: 5px;');
    heading.appendChild(starBefore);

    heading.innerHTML += 'Possible Words';

    // Add star after heading
    const starAfter = document.createElement('span');
    starAfter.innerHTML = '&#9733;'; // Unicode character for a star
    starAfter.setAttribute('style', 'margin-left: 5px;');
    heading.appendChild(starAfter);

    heading.setAttribute('style', 'white-space: nowrap; font-family: "Merriweather", serif; font-size: 28px;');
    headerContainer.appendChild(heading);

    headerContainer.setAttribute('style', 'margin-top: 124px;');

    // Append the header container to the wordListGrid
    wordListGrid.appendChild(headerContainer);

    // Add a horizontal line after the header
    const hrAfterHeader = document.createElement('hr');
    hrAfterHeader.setAttribute('style', 'width: 100%; margin-right: 0; margin-top: 42px;');
    wordListGrid.appendChild(hrAfterHeader);

    const ul = document.createElement('ul');

    for (let i = 0; i < words.length; i++) {
        const div = document.createElement('div');
        div.textContent = words[i];
        div.setAttribute('style', 'font-family: "Merriweather"');
        ul.appendChild(div);
    }

    // Append the created ul to the new container
    wordListGrid.appendChild(ul);

    // Append the container to the #wordList element
    wordListContainer.appendChild(wordListGrid);
}



// Function to update the word list based on user input
window.updateWordList = async function updateWordList() {
    const correctLetters = document.querySelectorAll('.correctInput');
    const validLetters = document.querySelectorAll('.validInput');
    const selectedAbsentLetters = document.querySelectorAll('.absentButton.selected');

    const correctLettersValues = Array.from(correctLetters, input => input.value.toUpperCase());
    const validLettersValues = Array.from(validLetters, input => input.value.toUpperCase());
    const selectedAbsentLettersValues = Array.from(selectedAbsentLetters).map(button => button.dataset.letter);

    const gameState = {
        correctLetters: correctLettersValues,
        validLetters: validLettersValues,
        selectedAbsentLetters: selectedAbsentLettersValues,
    };

    localStorage.setItem('wordleGameState', JSON.stringify(gameState));

    await saveToDatabase(gameState);

    const filteredWords = await filterWords(correctLetters, validLetters, selectedAbsentLetters);
    console.log(filteredWords);
    displayWordList(filteredWords);

    //display updated history
    const data = await readHistory();
    displayHistory(data);
}

//fetches the possible words in wordle
async function fetchValidWords(filePath) {
    try {
        const response = await fetch(filePath);
        const data = await response.text();
        return data.split('\n').filter(word => word.trim() !== ''); // Split by lines and remove empty lines
    } catch (error) {
        console.error('Error fetching valid words:', error);
        return [];
    }
}

function handleCorrectLetterInput(input) {
    const letter = input.value.toUpperCase();
    const absentButton = document.querySelector(`.absentButton[data-letter="${letter}"]`);

    // Check if the corresponding absent letter button is selected
    if (absentButton && absentButton.classList.contains('selected')) {
        alert(`You cannot enter '${letter}' as a correct letter when the absent letter is already selected.`);
        input.value = '';  // Clear the input field
    }
}

// Function to handle input in valid letters field
function handleValidLetterInput(input) {
    const letter = input.value.toUpperCase();
    const absentButton = document.querySelector(`.absentButton[data-letter="${letter}"]`);

    // Check if the corresponding absent letter button is selected
    if (absentButton && absentButton.classList.contains('selected')) {
        alert(`You cannot enter '${letter}' as a valid letter when the absent letter is already selected.`);
        input.value = '';  // Clear the input field
    }
}

const correctLettersArray = Array.from(document.querySelectorAll('.correctInput'));
const validLettersArray = Array.from(document.querySelectorAll('.validInput'));

correctLettersArray.forEach(input => {
    input.addEventListener('input', () => {
        handleCorrectLetterInput(input);
        input.value = input.value.toUpperCase();
        saveToLocalStorage();
    });
});

validLettersArray.forEach(input => {
    input.addEventListener('input', () => {
        handleValidLetterInput(input);
        input.value = input.value.toUpperCase();
        saveToLocalStorage();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('enterButton');
    button.addEventListener('click', showHelperPage);
});

function handleInputFocus(currentInput, nextInput) {
    currentInput.addEventListener('input', () => {
        const inputValue = currentInput.value.trim();
        if (inputValue.length === 1) {
            nextInput.focus();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM is ready');
    generateAbsentLetterButtons();

    const correctInputs = document.querySelectorAll('.correctInput');
    const validInputs = document.querySelectorAll('.validInput');

    function initializeInputStyles(inputs) {
        inputs.forEach(input => {
            const inputValue = input.value.trim();
            input.style.borderColor = inputValue === '' ? '' : (input.dataset.type === 'correct' ? 'green' : 'darkgoldenrod');
            input.style.backgroundColor = inputValue === '' ? '' : (input.dataset.type === 'correct' ? 'green' : 'darkgoldenrod');
            input.style.color = inputValue === '' ? '' : 'black';
        });
    }

    // Initialize styles for correct letters
    initializeInputStyles(correctInputs);
    
    // Initialize styles for valid letters
    initializeInputStyles(validInputs);



    // Function to handle input focus and border color change
    function handleInputFocus(currentInput, nextInput, prevInput) {
        currentInput.addEventListener('input', function () {
            const inputValue = this.value.trim();
    
            if (this && this.style) {
                this.style.borderColor = inputValue === '' ? '' : (this.dataset.type === 'correct' ? 'green' : 'darkgoldenrod');
            }
    
            if (this && this.style) {
                this.style.borderColor = inputValue === '' ? '' : (this.dataset.type === 'correct' ? 'green' : 'darkgoldenrod');
            }
    
            if (inputValue !== '') {
                // Shift focus to the next input when a letter is entered
                if (nextInput) {
                    nextInput.focus();
                }
                saveToLocalStorage();
            }
    
            // Change background color and text color for correct letter square
            if (this && this.style && this.dataset.type === 'correct') {
                this.style.backgroundColor = inputValue === '' ? '' : 'green';
                this.style.color = inputValue === '' ? '' : 'black';
            }
    
            // Change background color and text color for valid letter square
            if (this && this.style && this.dataset.type === 'valid') {
                this.style.backgroundColor = inputValue === '' ? '' : 'darkgoldenrod';
                this.style.color = inputValue === '' ? '' : 'black';
            }
        });
    
        currentInput.addEventListener('focus', function () {
            if (nextInput && nextInput.style) {
                nextInput.style.borderColor = ''; // Reset next input's border color on focus
            }
        });
    
        currentInput.addEventListener('keydown', function (event) {
            if (event.key === 'Backspace' && this.value.trim() === '') {
                // Move focus to the previous input when backspace is pressed and the input is empty
                if (prevInput) {
                    prevInput.focus();
                }
            }
        });
    }

    // Set up event listeners for correct letters
    correctInputs.forEach((input, index, array) => {
        const nextInput = array[index + 1];
        const prevInput = array[index - 1];
        handleInputFocus(input, nextInput, prevInput);
    });

    // Set up event listeners for valid letters
    validInputs.forEach((input, index, array) => {
        const nextInput = array[index + 1];
        const prevInput = array[index - 1];
        handleInputFocus(input, nextInput, prevInput);
    });

    const button = document.getElementById('enterButton');
    button.addEventListener('click', showHelperPage);

    const savedGameState = localStorage.getItem('wordleGameState');
    if (savedGameState) {
        const parsedGameState = JSON.parse(savedGameState);

        // Restore correct letters
        const correctInputs = document.querySelectorAll('.correctInput');
        parsedGameState.correctLetters.forEach((letter, index) => {
            correctInputs[index].value = letter;
        });

        // Restore valid letters
        const validInputs = document.querySelectorAll('.validInput');
        parsedGameState.validLetters.forEach((letter, index) => {
            validInputs[index].value = letter;
        });

        initializeInputStyles(correctInputs);
        initializeInputStyles(validInputs);

        // Restore selected absent letters
        // parsedGameState.selectedAbsentLetters.forEach(letter => {
        //     console.log("toggling letter: " + typeof(letter));
        //     toggleAbsentLetter(letter);
        // });
        const selectedAbsentLetters = document.querySelectorAll('.absentButton.selected');
        selectedAbsentLetters.forEach(button => {
            const letter = button.dataset.letter;
            button.classList.add('selected'); // Ensure the button is visually marked as selected
            console.log("toggling letter: " + typeof(letter));
            toggleAbsentLetter(letter);
        });
    }
});

const handleInput = (input, nextInput, prevInput) => {
    input.addEventListener('input', function () {
        const inputValue = this.value.trim();

        if (inputValue.length > 1) {
            // Truncate the value to only include the first character
            this.value = inputValue.charAt(0);
        }

        if (this && this.style) {
            this.style.borderColor = inputValue === '' ? '' : (this.dataset.type === 'correct' ? 'green' : 'darkgoldenrod');
        }

        if (inputValue !== '') {
            // Shift focus to the next input when a letter is entered
            if (nextInput) {
                nextInput.focus();
            }
            saveToLocalStorage();
        }

        // Change background color and text color for correct letter square
        if (this && this.style && this.dataset.type === 'correct') {
            this.style.backgroundColor = inputValue === '' ? '' : 'green';
            this.style.color = inputValue === '' ? '' : 'black';
        }

        // Change background color and text color for valid letter square
        if (this && this.style && this.dataset.type === 'valid') {
            this.style.backgroundColor = inputValue === '' ? '' : 'darkgoldenrod';
            this.style.color = inputValue === '' ? '' : 'black';
        }
    });

    input.addEventListener('focus', function () {
        if (nextInput && nextInput.style) {
            nextInput.style.borderColor = ''; // Reset next input's border color on focus
        }
    });

    input.addEventListener('keydown', function (event) {
        if (event.key === 'Backspace' && this.value.trim() === '') {
            // Move focus to the previous input when backspace is pressed and the input is empty
            if (prevInput) {
                prevInput.focus();
            }
        }
    });
};

const correctInputs = document.querySelectorAll('.correctInput');
const validInputs = document.querySelectorAll('.validInput');

correctInputs.forEach((input, index, array) => {
    const nextInput = array[index + 1];
    const prevInput = array[index - 1];
    handleInput(input, nextInput, prevInput);
});

// Set up event listeners for valid letters
validInputs.forEach((input, index, array) => {
    const nextInput = array[index + 1];
    const prevInput = array[index - 1];
    handleInput(input, nextInput, prevInput);
});


async function saveToDatabase(gameState) {
    console.log("in saveToDataBase function");
    try {
      const response = await fetch('http://localhost:3000/saveGameState', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameState),
      });
  
      if (response.ok) {
        console.log('Game state saved to the database successfully');
      } else {
        console.error('Error saving game state to the database');
      }
    } catch (error) {
      console.error('Error saving game state to the database', error);
    }
}

async function readHistory() {
    console.log("in readHistory");
    try {
        const response = await fetch('http://localhost:3000/history');
        const data = await response.json();
        console.log(data);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching history data:', error);
        return [];
    }
}

function displayHistory(historyData) {

    const historyContainer = document.getElementById('history');
    historyContainer.innerHTML = ''; // Clear previous history
    historyContainer.setAttribute('style', 'margin-top: 135px; font-family: "Merriweather", serif;');

    // Add a horizontal line before the header
    const hrBeforeHeader = document.createElement('hr');
    hrBeforeHeader.setAttribute('style', 'width: 90%; margin-right: 0;');
    historyContainer.appendChild(hrBeforeHeader);

    // Add heading for recent inputs with stars
    const heading = document.createElement('h2');

    // Add star before heading
    const starBefore = document.createElement('span');
    starBefore.innerHTML = '&#9733;'; // Unicode character for a star
    starBefore.setAttribute('style', 'margin-right: 5px;');
    heading.appendChild(starBefore);

    heading.innerHTML += 'Recent Inputs';

    // Add star after heading
    const starAfter = document.createElement('span');
    starAfter.innerHTML = '&#9733;'; // Unicode character for a star
    starAfter.setAttribute('style', 'margin-left: 5px;');
    heading.appendChild(starAfter);

    heading.setAttribute('style', 'margin-left: 35px; white-space: nowrap; margin-bottom: 5px; font-family: "Merriweather", serif; font-size: 28px;');
    historyContainer.appendChild(heading);

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear History';
    clearButton.addEventListener('click', clearHistory);
    clearButton.setAttribute('style', 'margin-left: 35px; margin-top: 5px; font-size: 14px; padding: 5px 10px; font-family: "Merriweather", serif; margin-bottom: 7px;');
    historyContainer.appendChild(clearButton);

    if (!Array.isArray(historyData) || historyData.length === 0) {
        const noHistoryMessage = document.createElement('p');
        noHistoryMessage.textContent = 'No history available.';
        noHistoryMessage.setAttribute('style', 'margin-left: 35px; font-family: "Merriweather", serif;');
        historyContainer.appendChild(noHistoryMessage);
        return;
    }

    const ul = document.createElement('ul');
    ul.style.listStyleType = 'none'; // Remove bullet points

    // Add a horizontal line before the history
    const hrStart = document.createElement('hr');
    ul.appendChild(hrStart);

    historyData.forEach((entry, index) => {
        const li = document.createElement('li');

        // Display entry number
        const entryNumberDiv = document.createElement('div');
        entryNumberDiv.textContent = `Input ${index + 1}:`;
        li.appendChild(entryNumberDiv);

        // Filter out leading empty strings in correct letters
        const nonEmptyCorrectLetters = entry.correctLetters.slice(entry.correctLetters.findIndex(letter => letter.trim() !== ''));
        if (nonEmptyCorrectLetters.length > 0) {
            const correctDiv = document.createElement('div');
            correctDiv.textContent = `Correct: ${nonEmptyCorrectLetters.join(', ')}`;
            correctDiv.setAttribute('style', 'font-family: "Merriweather", serif;');
            li.appendChild(correctDiv);
        }

        // Add valid letters if present
        const nonEmptyValidLetters = entry.validLetters.filter(letter => letter.trim() !== '');
        if (nonEmptyValidLetters.length > 0) {
            const validDiv = document.createElement('div');
            validDiv.textContent = `Valid: ${nonEmptyValidLetters.join(', ')}`;
            validDiv.setAttribute('style', 'font-family: "Merriweather", serif;');
            li.appendChild(validDiv);
        }

        // Add absent letters if present
        if (entry.selectedAbsentLetters.some(letter => letter.trim() !== '')) {
            const absentDiv = document.createElement('div');
            absentDiv.textContent = `Absent: ${entry.selectedAbsentLetters.join(', ')}`;
            absentDiv.setAttribute('style', 'font-family: "Merriweather", serif;');
            li.appendChild(absentDiv);
        }

        ul.appendChild(li);

        // Add a horizontal line after each entry except the last one
        if (index < historyData.length - 1) {
            const hr = document.createElement('hr');
            ul.appendChild(hr);
        }
    });

    // Add a horizontal line after the history
    const hrEnd = document.createElement('hr');
    ul.appendChild(hrEnd);

    // Add the ul to the history container
    historyContainer.appendChild(ul);
}



function formatHistoryEntry(entry) {
    const formattedCorrectLetters = entry.correctLetters.filter(Boolean).join(', ');
    const formattedValidLetters = entry.validLetters.filter(Boolean).join(', ');
    const formattedAbsentLetters = entry.selectedAbsentLetters.join(', ');

    return `Correct: ${formattedCorrectLetters} | Valid: ${formattedValidLetters} | Absent: ${formattedAbsentLetters}`;
}

async function clearHistory() {
    try {
        const response = await fetch('http://localhost:3000/clearHistory', { method: 'POST' });
        const data = await response.json();
        console.log('History cleared:', data.message); // Log the server response
        displayHistory(); // Refresh the displayed history
    } catch (error) {
        console.error('Error clearing history:', error);
    }
}

async function initializePage() {
    console.log('Initializing page2'); // Log to see if initializePage is being called

    await new Promise(resolve => setTimeout(resolve, 100));

    const savedGameState = localStorage.getItem('wordleGameState');
    if (savedGameState) {
        const parsedGameState = JSON.parse(savedGameState);
        console.log(parsedGameState);
        // Restore selected absent letters from local storage
        const selectedAbsentLetters = parsedGameState.selectedAbsentLetters || [];
        console.log('Selected absent letters from localStorage2:', selectedAbsentLetters);

        selectedAbsentLetters.forEach(letter => {
            console.log('Toggling absent letter2:', letter);
            toggleAbsentLetter(letter);
        });
    }
}

async function showHelperPage() {
    document.getElementById('enterPage').style.display = 'none';
    document.getElementById('helperPage').style.display = 'block';

    // Ensure that the initialization logic is called when showing the helper page
    await initializePage();
}


window.generateAbsentLetterButtons = generateAbsentLetterButtons;
window.readHistory = readHistory;
window.displayHistory = displayHistory;
window.clearHistory = clearHistory;

// document.addEventListener('DOMContentLoaded', async () => {
//     const historyData = await readHistory();
//     displayHistory(historyData);
// });
