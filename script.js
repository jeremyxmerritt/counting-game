class NumberGame {
    constructor() {
        this.currentRound = 1;
        this.totalRounds = 10;
        this.correctAnswer = 0;
        this.lastAnswer = 0;
        
        this.characterArea = document.getElementById('number-character');
        this.choiceButtons = document.querySelectorAll('.choice-button');
        this.currentRoundDisplay = document.getElementById('current-round');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.playAgainBtn = document.getElementById('play-again-btn');
        
        this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        
        this.blockConfigurations = {
            1: [
                [[2, 2]] // centered
            ],
            2: [
                [[2, 1], [2, 2]], // horizontal centered
                [[1, 2], [2, 2]]  // vertical centered
            ],
            3: [
                [[2, 0], [2, 1], [2, 2]], // horizontal row centered
                [[0, 2], [1, 2], [2, 2]], // vertical stack centered
                [[1, 1], [1, 2], [2, 1]]  // L-shape centered
            ],
            4: [
                [[1, 1], [1, 2], [2, 1], [2, 2]], // square centered
                [[0, 2], [1, 2], [2, 2], [3, 2]], // vertical stack centered
                [[2, 0], [2, 1], [2, 2], [2, 3]], // horizontal row centered
                [[1, 1], [2, 0], [2, 1], [2, 2]]  // T-shape centered
            ],
            5: [
                [[1, 1], [1, 2], [1, 3], [2, 1], [2, 2]], // L-shape centered
                [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]], // vertical stack centered
                [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]], // horizontal row centered
                [[1, 2], [2, 1], [2, 2], [2, 3], [3, 2]]  // cross-like centered
            ]
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startNewRound();
    }
    
    setupEventListeners() {
        this.choiceButtons.forEach((button, index) => {
            button.addEventListener('click', () => this.handleChoice(index));
        });
        
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
    }
    
    startNewRound() {
        if (this.currentRound > this.totalRounds) {
            this.endGame();
            return;
        }
        
        do {
            this.correctAnswer = Math.floor(Math.random() * 5) + 1;
        } while (this.correctAnswer === this.lastAnswer);
        
        this.lastAnswer = this.correctAnswer;
        this.currentRoundDisplay.textContent = this.currentRound;
        
        this.createCharacter(this.correctAnswer);
        this.setupChoices();
        this.resetChoiceButtons();
    }
    
    createCharacter(number) {
        this.characterArea.innerHTML = '';
        
        const character = document.createElement('div');
        character.className = 'number-character';
        character.style.display = 'grid';
        character.style.gridTemplateColumns = 'repeat(5, 60px)';
        character.style.gridTemplateRows = 'repeat(5, 60px)';
        character.style.gap = '5px';
        character.style.justifyContent = 'center';
        
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const configurations = this.blockConfigurations[number];
        const selectedConfig = configurations[Math.floor(Math.random() * configurations.length)];
        
        selectedConfig.forEach(([row, col]) => {
            const block = document.createElement('div');
            block.className = `block ${color}`;
            block.style.gridRow = row + 1;
            block.style.gridColumn = col + 1;
            
            const face = document.createElement('div');
            face.className = 'block-face';
            
            const smile = document.createElement('div');
            smile.className = 'block-smile';
            
            block.appendChild(face);
            block.appendChild(smile);
            
            // Add tap functionality for counting feedback
            block.addEventListener('click', () => this.handleBlockTap(block, character));
            
            character.appendChild(block);
        });
        
        this.characterArea.appendChild(character);
    }
    
    setupChoices() {
        const choices = this.generateChoices(this.correctAnswer);
        
        this.choiceButtons.forEach((button, index) => {
            const numberSpan = button.querySelector('.balloon-number');
            numberSpan.textContent = choices[index];
            button.dataset.value = choices[index];
        });
    }
    
    generateChoices(correctAnswer) {
        const choices = [correctAnswer];
        
        while (choices.length < 3) {
            let randomChoice = Math.floor(Math.random() * 5) + 1;
            if (!choices.includes(randomChoice)) {
                choices.push(randomChoice);
            }
        }
        
        // Shuffle the array
        for (let i = choices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[j]] = [choices[j], choices[i]];
        }
        
        return choices;
    }
    
    handleChoice(choiceIndex) {
        const button = this.choiceButtons[choiceIndex];
        const chosenValue = parseInt(button.dataset.value);
        
        if (button.classList.contains('disabled')) {
            return;
        }
        
        if (chosenValue === this.correctAnswer) {
            this.handleCorrectChoice(button);
        } else {
            this.handleIncorrectChoice(button);
        }
    }
    
    handleCorrectChoice(button) {
        // Disable all buttons
        this.choiceButtons.forEach(btn => btn.classList.add('disabled'));
        
        button.classList.add('correct-animation');
        
        // Play correct sound
        const correctSound = new Audio('correct.wav');
        correctSound.play();
        
        // Show large number overlay
        this.showNumberOverlay(this.correctAnswer);
        
        // Move to next round after delay
        setTimeout(() => {
            this.currentRound++;
            this.startNewRound();
        }, 1500);
    }
    
    handleIncorrectChoice(button) {
        button.classList.add('shake-animation', 'disabled', 'crossed-out');
        
        // Play try again sound
        const tryAgainSound = new Audio('try-again.mp4');
        tryAgainSound.play();
    }
    
    handleBlockTap(block, character) {
        // Add bright class if not already there
        if (!block.classList.contains('bright')) {
            block.classList.add('bright');
            
            // Count how many blocks are now lit up
            const brightBlocks = character.querySelectorAll('.block.bright');
            const count = brightBlocks.length;
            
            // Show the count number
            this.showCountNumber(count, block);
        }
        
        // Check if all blocks in the character are bright
        const allBlocks = character.querySelectorAll('.block');
        const brightBlocks = character.querySelectorAll('.block.bright');
        
        if (allBlocks.length === brightBlocks.length) {
            // All blocks have been tapped, reset after a short delay
            setTimeout(() => {
                allBlocks.forEach(b => b.classList.remove('bright'));
            }, 500);
        }
    }
    
    showCountNumber(count, block) {
        // Create count display element
        const countDisplay = document.createElement('div');
        countDisplay.className = 'count-display';
        countDisplay.textContent = count;
        
        // Position it directly above the character blocks
        const character = document.querySelector('.number-character');
        const characterRect = character.getBoundingClientRect();
        
        countDisplay.style.left = '50%';
        countDisplay.style.top = (characterRect.top - 80) + 'px';
        
        document.body.appendChild(countDisplay);
        
        // Remove after animation
        setTimeout(() => {
            countDisplay.remove();
        }, 1000);
    }
    
    showNumberOverlay(number) {
        const overlay = document.createElement('div');
        overlay.className = 'number-overlay';
        overlay.textContent = number;
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.remove();
        }, 1000);
    }
    
    resetChoiceButtons() {
        this.choiceButtons.forEach(button => {
            button.classList.remove('correct-animation', 'shake-animation', 'disabled', 'crossed-out');
        });
    }
    
    endGame() {
        this.gameOverScreen.style.display = 'flex';
    }
    
    restartGame() {
        this.currentRound = 1;
        this.gameOverScreen.style.display = 'none';
        this.startNewRound();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NumberGame();
});