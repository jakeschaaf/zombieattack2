// Debug mode for troubleshooting
const DEBUG = false;

// Log function that only works in debug mode
function debug(message) {
    if (DEBUG) {
        console.log(message);
    }
}

// Device detection
let isMobile = false;
let mobileControlsActive = false;
const touchStates = {
    up: false,
    down: false,
    left: false,
    right: false,
    fire: false
};

// Game Variables
let gameCanvas;
let canvasWidth, canvasHeight;
let gameState = "start"; // start, playing, gameOver, paused
let player;
let zombies = [];
let bullets = [];
let particles = [];
let powerups = [];
let score = 0;
let wave = 1;
let zombiesKilled = 0;
let zombiesPerWave = 10;
let zombiesSpawnedThisWave = 0;
let nextZombieSpawn = 0;
let bloodSplats = [];
let pauseTime = 0; // Track time when game was paused
let waveInProgress = true; // Flag to track if current wave is still in progress

// UI Elements
let scoreUI, healthUI, ammoUI, waveUI, zombiesRemainingUI;
let startScreen, gameOverScreen, pauseScreen, waveNotification;
let startButton, restartButton, resumeButton;

// Colors
const COLORS = {
    background: [20, 20, 20],
    player: [60, 100, 200], // Blueish for player
    zombie: [100, 150, 80], // Zombie green
    blood: [150, 30, 30],
    bullet: [255, 255, 100],
    health: [100, 255, 100],
    ammo: [100, 100, 255],
    ground: [30, 30, 30]
};

// Detect mobile devices
function detectMobile() {
    return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.innerWidth <= 800 && window.innerHeight <= 900) ||
        ('ontouchstart' in window)
    );
}

// Calculate canvas size based on window dimensions
function calculateCanvasSize() {
    const maxWidth = window.innerWidth - 20; // Subtract some padding
    const maxHeight = window.innerHeight - 20;
    
    if (isMobile) {
        // For mobile devices, fill the screen but maintain a reasonable aspect ratio
        if (window.innerWidth > window.innerHeight) {
            // Landscape orientation - use height as limiting factor
            canvasHeight = maxHeight;
            canvasWidth = Math.min(maxWidth, canvasHeight * 4/3);
        } else {
            // Portrait orientation - use width as limiting factor
            canvasWidth = maxWidth;
            canvasHeight = Math.min(maxHeight, canvasWidth * 3/4);
        }
    } else {
        // For desktop, use a fixed size
        canvasWidth = Math.min(800, maxWidth);
        canvasHeight = Math.min(600, maxHeight);
    }
    
    debug(`Canvas size: ${canvasWidth} x ${canvasHeight}`);
}
