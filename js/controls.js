// Setup mobile controls
function setupMobileControls() {
    const mobileControls = document.getElementById('mobile-controls');
    const pauseButton = document.getElementById('pause-button-mobile');
    const pauseTip = document.getElementById('pause-tip');
    const controlInstructions = document.getElementById('control-instructions');
    
    mobileControls.style.display = 'flex';
    pauseButton.style.display = 'flex';
    pauseTip.textContent = 'Tap pause button to pause';
    
    // Update control instructions for mobile
    controlInstructions.innerHTML = 
        '<p>Use the <span class="blood">left arrows</span> to move and the <span class="blood">right button</span> to shoot.</p>' +
        '<p>Tap on the screen to aim.</p>';
    
    // Setup touch listeners for D-pad
    setupDPadControls();
    
    // Setup fire button
    setupFireButton();
    
    // Setup pause button
    setupPauseButton();
    
    mobileControlsActive = true;
    debug("Mobile controls initialized");
}

function setupDPadControls() {
    const dPadButtons = document.querySelectorAll('.d-pad-button');
    
    dPadButtons.forEach(button => {
        // Handle touchstart
        button.addEventListener('touchstart', function(event) {
            event.preventDefault();
            const keyId = this.id.split('-')[1];
            
            if (keyId === 'up') touchStates.up = true;
            if (keyId === 'down') touchStates.down = true;
            if (keyId === 'left') touchStates.left = true;
            if (keyId === 'right') touchStates.right = true;
            
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        });
        
        // Handle touchend
        button.addEventListener('touchend', function(event) {
            event.preventDefault();
            const keyId = this.id.split('-')[1];
            
            if (keyId === 'up') touchStates.up = false;
            if (keyId === 'down') touchStates.down = false;
            if (keyId === 'left') touchStates.left = false;
            if (keyId === 'right') touchStates.right = false;
            
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });
        
        // Handle touch cancellation
        button.addEventListener('touchcancel', function(event) {
            event.preventDefault();
            const keyId = this.id.split('-')[1];
            
            if (keyId === 'up') touchStates.up = false;
            if (keyId === 'down') touchStates.down = false;
            if (keyId === 'left') touchStates.left = false;
            if (keyId === 'right') touchStates.right = false;
            
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });
    });
}

function setupFireButton() {
    const fireButton = document.getElementById('btn-fire');
    
    fireButton.addEventListener('touchstart', function(event) {
        event.preventDefault();
        if (gameState === 'playing') {
            touchStates.fire = true;
            this.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
        }
    });
    
    fireButton.addEventListener('touchend', function(event) {
        event.preventDefault();
        touchStates.fire = false;
        this.style.backgroundColor = 'rgba(198, 40, 40, 0.6)';
    });
    
    fireButton.addEventListener('touchcancel', function(event) {
        event.preventDefault();
        touchStates.fire = false;
        this.style.backgroundColor = 'rgba(198, 40, 40, 0.6)';
    });
}

function setupPauseButton() {
    const pauseButton = document.getElementById('pause-button-mobile');
    
    pauseButton.addEventListener('touchstart', function(event) {
        event.preventDefault();
        if (gameState === 'playing') {
            pauseGame();
        } else if (gameState === 'paused') {
            resumeGame();
        }
    });
}

// Initialize UI elements
function initializeUI() {
    try {
        // Get DOM elements
        scoreUI = document.getElementById('score');
        healthUI = document.getElementById('health');
        ammoUI = document.getElementById('ammo');
        waveUI = document.getElementById('wave');
        zombiesRemainingUI = document.getElementById('zombies-remaining');
        
        startScreen = document.getElementById('start-screen');
        gameOverScreen = document.getElementById('game-over-screen');
        pauseScreen = document.getElementById('pause-screen');
        waveNotification = document.getElementById('wave-notification');
        
        startButton = document.getElementById('start-button');
        restartButton = document.getElementById('restart-button');
        resumeButton = document.getElementById('resume-button');
        
        // Initialize button event listeners
        startButton.addEventListener('click', startGame);
        restartButton.addEventListener('click', startGame);
        resumeButton.addEventListener('click', resumeGame);
        
        // Prevent default behavior for touch events on the game container
        const gameContainer = document.getElementById('game-container');
        gameContainer.addEventListener('touchmove', function(e) {
            if (e.target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        }, { passive: false });
        
        return true;
    } catch (error) {
        console.error("Error initializing UI:", error);
        return false;
    }
}

// Game state functions
function startGame() {
    debug("startGame function called");
    
    try {
        // Reset game state
        gameState = "playing";
        zombies = [];
        bullets = [];
        particles = [];
        powerups = [];
        score = 0;
        wave = 1;
        zombiesKilled = 0;
        zombiesSpawnedThisWave = 0;
        waveInProgress = true;
        nextZombieSpawn = p5Instance.millis() + 1000; // First zombie after 1 second
        
        // Reset wave notification
        waveNotification.style.opacity = 0;
        
        // Hide UI screens
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        pauseScreen.style.display = 'none';
        
        // Create player at center of canvas
        player = new Player(p5Instance.width / 2, p5Instance.height / 2);
        debug("Player created successfully at position:", player.x, player.y);
        
        // Update UI
        updateUI();
        
        // Start the game loop
        p5Instance.loop();
        debug("Game loop started");
    } catch (error) {
        console.error("Error in startGame function:", error);
    }
}

function pauseGame() {
    if (gameState === "playing") {
        gameState = "paused";
        pauseTime = p5Instance.millis();
        p5Instance.noLoop();
        pauseScreen.style.display = 'flex';
    }
}

function resumeGame() {
    if (gameState === "paused") {
        gameState = "playing";
        pauseScreen.style.display = 'none';
        
        // Adjust the spawn timers by the pause duration
        const pauseDuration = p5Instance.millis() - pauseTime;
        nextZombieSpawn += pauseDuration;
        if (player && player.reloading) {
            player.reloadTime += pauseDuration;
        }
        
        p5Instance.loop();
    }
}

function gameOver() {
    gameState = "gameOver";
    p5Instance.noLoop();
    
    // Update final score display
    document.getElementById('final-score').textContent = `Score: ${score}`;
    document.getElementById('final-wave').textContent = `Wave: ${wave}`;
    
    // Show game over screen
    gameOverScreen.style.display = 'flex';
}

function updateUI() {
    scoreUI.textContent = `Score: ${score}`;
    healthUI.textContent = `Health: ${Math.floor(player.health)}`;
    ammoUI.textContent = `Ammo: ${player.ammo}`;
    waveUI.textContent = `Wave: ${wave}`;
    
    // Update zombies remaining indicator
    const zombiesRemaining = (zombiesPerWave * wave) - zombiesKilled;
    const totalZombies = zombiesPerWave * wave;
    zombiesRemainingUI.textContent = `Zombies: ${zombiesRemaining}/${totalZombies}`;
    
    // Change color based on remaining zombies
    if (zombiesRemaining <= totalZombies * 0.2) {
        zombiesRemainingUI.style.color = "#4CAF50"; // Green when almost done
    } else if (zombiesRemaining <= totalZombies * 0.5) {
        zombiesRemainingUI.style.color = "#FFC107"; // Yellow when halfway
    } else {
        zombiesRemainingUI.style.color = "#F44336"; // Red when many left
    }
}

function showWaveNotification() {
    // Update the wave number in the notification
    document.getElementById('wave-number').textContent = wave;
    
    // Show the notification
    waveNotification.style.opacity = 1;
    
    // Hide it after 3 seconds
    setTimeout(() => {
        waveNotification.style.opacity = 0;
    }, 3000);
}
