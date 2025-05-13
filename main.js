// This file serves as the main entry point for the application.
// It initializes the application and may include event listeners or function calls to set up the user interface.

document.addEventListener('DOMContentLoaded', () => {
    console.log('Sudoku game initialized');
    
    // Game state
    let gameBoard = [];
    let solution = [];
    let difficulty = 'medium'; // default difficulty
    
    // Set up difficulty selection
    const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');
    difficultyInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.checked) {
                difficulty = e.target.value;
                console.log(`Difficulty changed to ${difficulty}`);
                
                // Optionally generate a new game immediately when difficulty changes
                generatePuzzle();
            }
        });
    });
    
    // Create the Sudoku board
    function createBoard() {
        const board = document.getElementById('sudoku-board');
        board.innerHTML = '';
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                
                // Add borders for 3x3 boxes
                if (col === 2 || col === 5) {
                    cell.classList.add('border-right');
                }
                if (row === 2 || row === 5) {
                    cell.classList.add('border-bottom');
                }
                
                const value = gameBoard[row][col];
                
                if (value !== 0) {
                    // Fixed cell (pre-filled)
                    cell.textContent = value;
                    cell.classList.add('cell-fixed');
                } else {
                    // Empty cell (user input)
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.dataset.row = row;
                    input.dataset.col = col;
                    
                    // Validate user input
                    input.addEventListener('input', (e) => {
                        const value = e.target.value;
                        if (value && (isNaN(value) || value < 1 || value > 9)) {
                            e.target.value = '';
                        }
                    });
                    
                    // Highlight related cells
                    input.addEventListener('focus', (e) => {
                        highlightRelatedCells(row, col);
                    });
                    
                    input.addEventListener('blur', () => {
                        clearHighlights();
                    });
                    
                    cell.appendChild(input);
                }
                
                board.appendChild(cell);
            }
        }
    }
    
    // Generate a Sudoku puzzle
    function generatePuzzle() {
        // First generate a valid solution
        solution = generateSolution();
        
        // Then create a puzzle by removing numbers
        gameBoard = JSON.parse(JSON.stringify(solution));
        
        const cellsToRemove = getDifficultySettings();
        let removed = 0;
        
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (gameBoard[row][col] !== 0) {
                gameBoard[row][col] = 0;
                removed++;
            }
        }
        
        createBoard();
    }
    
    // Get number of cells to remove based on difficulty
    function getDifficultySettings() {
        switch(difficulty) {
            case 'easy':
                return 35; // Fewer empty cells (more filled)
            case 'hard':
                return 55; // More empty cells (fewer filled)
            case 'medium':
            default:
                return 45;
        }
    }
    
    // Generate a solved Sudoku board
    function generateSolution() {
        // Initialize empty 9x9 grid
        const grid = Array(9).fill().map(() => Array(9).fill(0));
        
        // Fill the diagonal 3x3 boxes first (these can be filled independently)
        fillDiagonalBoxes(grid);
        
        // Fill the rest using backtracking
        solveSudoku(grid);
        
        return grid;
    }
    
    // Fill the three diagonal 3x3 boxes
    function fillDiagonalBoxes(grid) {
        for (let box = 0; box < 9; box += 3) {
            fillBox(grid, box, box);
        }
    }
    
    // Fill a 3x3 box starting at the given position
    function fillBox(grid, startRow, startCol) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        shuffleArray(numbers);
        
        let numIndex = 0;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                grid[startRow + row][startCol + col] = numbers[numIndex++];
            }
        }
    }
    
    // Solve the Sudoku puzzle using backtracking
    function solveSudoku(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    const shuffledNums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                    shuffleArray(shuffledNums);
                    
                    for (let num of shuffledNums) {
                        if (isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            
                            if (solveSudoku(grid)) {
                                return true;
                            }
                            
                            grid[row][col] = 0;
                        }
                    }
                    
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Check if a number can be placed at the given position
    function isValid(grid, row, col, num) {
        // Check row
        for (let i = 0; i < 9; i++) {
            if (grid[row][i] === num) return false;
        }
        
        // Check column
        for (let i = 0; i < 9; i++) {
            if (grid[i][col] === num) return false;
        }
        
        // Check 3x3 box
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[startRow + i][startCol + j] === num) return false;
            }
        }
        
        return true;
    }
    
    // Highlight related cells (same row, column, and 3x3 box)
    function highlightRelatedCells(row, col) {
        const cells = document.querySelectorAll('.cell');
        const boxStartRow = Math.floor(row / 3) * 3;
        const boxStartCol = Math.floor(col / 3) * 3;
        
        cells.forEach((cell, index) => {
            const cellRow = Math.floor(index / 9);
            const cellCol = index % 9;
            
            if (cellRow === row || cellCol === col || 
                (cellRow >= boxStartRow && cellRow < boxStartRow + 3 && 
                 cellCol >= boxStartCol && cellCol < boxStartCol + 3)) {
                cell.classList.add('cell-highlight');
            }
        });
    }
    
    // Clear all highlights
    function clearHighlights() {
        document.querySelectorAll('.cell-highlight').forEach(cell => {
            cell.classList.remove('cell-highlight');
        });
    }
    
    // Check if the current board state is valid
    function checkSolution() {
        const messageEl = document.getElementById('message');
        const currentBoard = getCurrentBoardState();
        
        // Check if all cells are filled
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (currentBoard[row][col] === 0) {
                    messageEl.textContent = 'Board is not complete!';
                    messageEl.className = 'message-error';
                    return;
                }
            }
        }
        
        // Check if the solution is correct
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const num = currentBoard[row][col];
                
                // Temporarily clear the cell to check if the number is valid
                currentBoard[row][col] = 0;
                if (!isValid(currentBoard, row, col, num)) {
                    messageEl.textContent = 'Solution is incorrect!';
                    messageEl.className = 'message-error';
                    return;
                }
                currentBoard[row][col] = num;
            }
        }
        
        messageEl.textContent = 'Congratulations! Your solution is correct!';
        messageEl.className = 'message-success';
    }
    
    // Get the current state of the board including user inputs
    function getCurrentBoardState() {
        const board = Array(9).fill().map(() => Array(9).fill(0));
        
        document.querySelectorAll('.cell').forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            
            if (cell.classList.contains('cell-fixed')) {
                board[row][col] = parseInt(cell.textContent);
            } else {
                const input = cell.querySelector('input');
                board[row][col] = input.value ? parseInt(input.value) : 0;
            }
        });
        
        return board;
    }
    
    // Show the solution
    function showSolution() {
        document.querySelectorAll('.cell').forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            
            if (!cell.classList.contains('cell-fixed')) {
                const input = cell.querySelector('input');
                input.value = solution[row][col];
            }
        });
    }
    
    // Utility function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Event listeners for buttons
    document.getElementById('new-game').addEventListener('click', generatePuzzle);
    document.getElementById('check-solution').addEventListener('click', checkSolution);
    document.getElementById('solve').addEventListener('click', showSolution);
    
    // Initialize the game
    generatePuzzle();
});