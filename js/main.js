// Global p5 instance reference
let p5Instance;

// Initialize the game when the window loads
window.addEventListener('load', function() {
    debug("Window loaded - checking if p5 is available");
    if (typeof p5 !== 'undefined') {
        debug("p5.js is loaded properly");
        initGame();
    } else {
        console.error("p5.js is not loaded!");
        alert("Could not load p5.js library. Please check your internet connection and try again.");
    }
});

// Initialize the game
function initGame() {
    // Detect if mobile device
    isMobile = detectMobile();
    debug("Device detection: " + (isMobile ? "Mobile" : "Desktop"));
    
    // Create p5.js sketch
    new p5(function(p) {
        // Store reference to p5 instance globally
        p5Instance = p;
        
        p.setup = function() {
            debug("p5.js setup function running");
            
            try {
                // Calculate canvas size
                calculateCanvasSize();
                
                // Create canvas
                gameCanvas = p.createCanvas(canvasWidth, canvasHeight);
                gameCanvas.parent('game-container');
                debug("Canvas created with size:", canvasWidth, "x", canvasHeight);
                
                // Initialize UI
                if (!initializeUI()) {
                    console.error("Failed to initialize UI elements");
                    return;
                }
                
                // Setup mobile controls if on mobile device
                if (isMobile && !mobileControlsActive) {
                    setupMobileControls();
                }
                
                // Create blood splats for the ground
                createBloodSplats();
                
                // Handle window resize
                window.addEventListener('resize', function() {
                    p.windowResized();
                });
                
                p.noLoop(); // Don't start drawing until game starts
                debug("p5.js setup complete");
            } catch (error) {
                console.error("Error in p5.js setup:", error);
            }
        };
        
        p.windowResized = function() {
            debug("Window resized");
            calculateCanvasSize();
            p.resizeCanvas(canvasWidth, canvasHeight);
            createBloodSplats();
        };
        
        function createBloodSplats() {
            bloodSplats = [];
            for (let i = 0; i < 50; i++) {
                bloodSplats.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    size: p.random(10, 50),
                    alpha: p.random(50, 150)
                });
            }
        }
        
        // Main draw loop
        p.draw = function() {
            if (gameState !== "playing") return;
            
            // Draw background
            p.background(COLORS.background);
            
            // Draw blood splats on ground
            drawBloodSplats();
            
            // Spawn zombies for current wave
            if (waveInProgress && zombiesSpawnedThisWave < zombiesPerWave * wave) {
                if (p.millis() > nextZombieSpawn) {
                    spawnZombie();
                    zombiesSpawnedThisWave++;
                    nextZombieSpawn = p.millis() + p.random(450, 1800 / wave);
                }
            }
            
            // Randomly spawn powerups
            if (p.random() < 0.00165) {
                spawnPowerup();
            }
            
            // Update and draw entities
            updateEntities();
            
            // Check collisions
            checkCollisions();
            
            // Update UI
            updateUI();
            
            // Check for wave completion
            checkWaveCompletion();
            
            // Handle continuous firing for mobile
            if (isMobile && touchStates.fire && gameState === "playing") {
                player.shoot();
            }
        };
        
        // Mouse and touch input
        p.mousePressed = function() {
            if (gameState === "playing" && !isMobile) {
                player.shoot();
            }
        };
        
        p.touchStarted = function(event) {
            if (gameState !== 'playing') return;
            
            // Only process touches on the canvas that aren't from control buttons
            if (event.target.tagName === 'CANVAS') {
                const rect = p.canvas.getBoundingClientRect();
                let touchX, touchY;
                
                // Use the first touch that's on the canvas
                for (let i = 0; i < event.touches.length; i++) {
                    const touch = event.touches[i];
                    const elementAtTouch = document.elementFromPoint(touch.clientX, touch.clientY);
                    
                    if (elementAtTouch === p.canvas) {
                        touchX = (touch.clientX - rect.left) * (p.width / rect.width);
                        touchY = (touch.clientY - rect.top) * (p.height / rect.height);
                        
                        // Update mouse position for aiming
                        p.mouseX = touchX;
                        p.mouseY = touchY;
                        break;
                    }
                }
            }
            
            return false; // Prevent default
        };
        
        p.touchMoved = function(event) {
            if (gameState !== 'playing') return;
            
            // Update aim direction based on touch position on canvas
            if (event.target.tagName === 'CANVAS') {
                const rect = p.canvas.getBoundingClientRect();
                let touchX, touchY;
                
                // Use the first touch that's on the canvas
                for (let i = 0; i < event.touches.length; i++) {
                    const touch = event.touches[i];
                    const elementAtTouch = document.elementFromPoint(touch.clientX, touch.clientY);
                    
                    if (elementAtTouch === p.canvas) {
                        touchX = (touch.clientX - rect.left) * (p.width / rect.width);
                        touchY = (touch.clientY - rect.top) * (p.height / rect.height);
                        
                        // Update mouse position for aiming
                        p.mouseX = touchX;
                        p.mouseY = touchY;
                        break;
                    }
                }
            }
            
            return false; // Prevent default
        };
        
        // Keyboard input
        p.keyPressed = function() {
            // ESC key for pause/resume
            if (p.keyCode === 27) { // ESC key
                if (gameState === "playing") {
                    pauseGame();
                } else if (gameState === "paused") {
                    resumeGame();
                }
                return;
            }
            
            // Only process other controls if game is playing
            if (gameState === "playing") {
                // Add key to pressed keys
                player.keys[p.keyCode] = true;
                
                // R key to reload
                if (p.keyCode === 82) {
                    player.reloading = true;
                    player.reloadTime = p.millis() + 1000;
                }
            }
        };
        
        p.keyReleased = function() {
            // Only process if game is playing
            if (gameState === "playing") {
                // Remove key from pressed keys
                player.keys[p.keyCode] = false;
            }
        };
    });
}
