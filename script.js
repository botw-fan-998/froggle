const gridContainer = document.getElementById('grid-container');
const wordInput = document.getElementById('word-input');
const submitButton = document.getElementById('submit-word');
const wordList = document.getElementById('word-list');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const resetButton = document.getElementById('clear-input');

let grid = [];
let selectedLetters = [];
let selectedPositions = [];
let score = 0;
let timeLeft = 180; // 3 minutes in seconds
let wordsFound = [];
let gameOver = false;
let gridSize = 5;

// Function to generate a random grid of letters
function generateGrid(size = gridSize) {
    const letters = 'EEEEEEEEEEEEEEEEEEEETTTTTTTTTTTTTAAAAAAAAAAAARRRRRRRRRRRRIIIIIIIIIIINNNNNNNNNNNOOOOOOOOOOOSSSSSSSSSDDDDDDCCCCCHHHHHLLLLLFFFFMMMMPPPPUUUUGGGYYYWWBJKQVXZ';
    grid = [];
    for (let i = 0; i < size * size; i++) {
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        grid.push(randomLetter);
    }
    renderGrid(size);
}

// Function to display the grid
function renderGrid(size = gridSize) {
    gridContainer.innerHTML = '';
    grid.forEach((letter, index) => {
        const letterDiv = document.createElement('div');
        letterDiv.textContent = letter;
        letterDiv.classList.add('grid-cell');
        letterDiv.dataset.index = index; // Store the cell's index
        gridContainer.appendChild(letterDiv);
        
        // Add click event to select letters
        letterDiv.addEventListener('click', () => selectLetter(index, letterDiv));
    });
}

// Function to select a letter
function selectLetter(index, letterDiv) {
    let lastSelectedPosition = selectedPositions.at(-1);
    // Ensure the letter hasn't already been selected
    if (selectedPositions.includes(index)) {
        return; // Prevent re-selection
    }

    if (!(index == lastSelectedPosition + 1 ||
        index == lastSelectedPosition - 1 || 
        index == lastSelectedPosition - gridSize - 1 || 
        index == lastSelectedPosition - gridSize || 
        index == lastSelectedPosition - gridSize + 1 || 
        index == lastSelectedPosition + gridSize - 1 || 
        index == lastSelectedPosition + gridSize || 
        index == lastSelectedPosition + gridSize + 1) &&
        selectedPositions.length > 0) {
        return;
    }

    // Add the letter and position to the selected lists
    selectedLetters.push(grid[index]);
    selectedPositions.push(index);

    // Highlight the selected letter
    letterDiv.style.backgroundColor = 'yellow';

    // Update the input box to reflect the selected word
    wordInput.value = selectedLetters.join('');
}

//clear letters with a button
resetButton.addEventListener('click', function() {
    clearSelectedLetters();
});


// Function to clear selected letters (when a word is submitted or invalid)
function clearSelectedLetters() {
    selectedLetters = [];
    selectedPositions = [];

    // Clear the background of all cells
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.style.backgroundColor = 'lightgreen';
    });

    // Clear the input field
    wordInput.value = '';
}

// Timer function
function startTimer() {
    const timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

// Function to validate the word via the API
async function validateWordViaAPI(word) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    
    try {
        console.log(`Checking word: ${word}`); // Add debug log

        const response = await fetch(url);
        if (response.ok) {  // Using `response.ok` instead of checking status directly
            console.log(`Word ${word} is valid!`);  // Log success
            return true;
        } else {
            console.log(`Word ${word} is NOT valid. Response status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error("Error fetching dictionary API:", error);
        return false;
    }
}

// Function to submit a word
submitButton.addEventListener('click', async () => {
    const word = wordInput.value.trim().toUpperCase();

    // Check if the word is valid based on grid letters
    if (word && !wordsFound.includes(word) && validateWordFromGrid(word)) {
        const isValid = await validateWordViaAPI(word);
        if (isValid) {
            wordsFound.push(word);
           if (!gameOver) {
            score += word.length; // Simple scoring: 1 point per letter
        }
            scoreElement.textContent = `Score: ${score}`;

            // Add the word to the word list
            const wordDiv = document.createElement('div');
            wordDiv.textContent = word;
            wordList.appendChild(wordDiv);
        } else {
            alert(`${word} is not a valid word.`);
        }
    } else {
        alert("Invalid word. You already have this word!");
    }

    // Clear selected letters and reset
    clearSelectedLetters();
});

// Function to validate that the word uses selected grid letters
function validateWordFromGrid(word) {
    if (word.length !== selectedLetters.length) {
        return false;
    }

    // Additional validation can go here (like adjacent letter checks)

    return true; // Basic validation for now
}

// End game function
function endGame() {
    alert(`Game Over! Your score: ${score}`);
    clearSelectedLetters(); // Clear the board
    gameOver = true;
}

// Start the game
generateGrid();
startTimer();