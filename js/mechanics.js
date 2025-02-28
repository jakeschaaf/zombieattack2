// Core game mechanics functions

function checkWaveCompletion() {
    // Check if we've killed enough zombies and there are no more to spawn
    if (zombiesKilled >= zombiesPerWave * wave && zombies.length === 0 && zombiesSpawnedThisWave >= zombiesPerWave * wave) {
        // Only trigger next wave if one is not already scheduled
        if (waveInProgress) {
            waveInProgress = false;
            
            // Add a small delay before starting the next wave for dramatic effect
            setTimeout(() => {
                nextWave();
            }, 2000);
        }
    }
}

function nextWave() {
    wave++;
    zombiesKilled = 0;
    zombiesSpawnedThisWave = 0;
    waveInProgress = true;
    
    // Add new blood splats
    for (let i = 0; i < 10; i++) {
        bloodSplats.push({
            x: p5Instance.random(p5Instance.width),
            y: p5Instance.random(p5Instance.height),
            size: p5Instance.random(10, 50),
            alpha: p5Instance.random(50, 150)
        });
    }
    
    // Give player bonus
    player.ammo += 5;
    player.health = p5Instance.min(player.health + 10, 100);
    score += 500;
    
    // Update UI immediately
    updateUI();
    
    // Show wave notification
    showWaveNotification();
}

function drawBloodSplats() {
    p5Instance.noStroke();
    for (let splat of bloodSplats) {
        p5Instance.fill(COLORS.blood[0], COLORS.blood[1], COLORS.blood[2], splat.alpha);
        p5Instance.ellipse(splat.x, splat.y, splat.size, splat.size * 0.7);
    }
}

function updateEntities() {
    // Update player movement based on touch states for mobile
    if (isMobile) {
        player.keys[87] = touchStates.up;    // W key
        player.keys[83] = touchStates.down;  // S key
        player.keys[65] = touchStates.left;  // A key
        player.keys[68] = touchStates.right; // D key
    }
    
    // Draw and update player
    player.update();
    player.draw();
    
    // Draw and update zombies
    for (let i = zombies.length - 1; i >= 0; i--) {
        zombies[i].update();
        zombies[i].draw();
        
        // Remove dead zombies
        if (zombies[i].health <= 0) {
            createParticles(zombies[i].x, zombies[i].y, COLORS.blood, 15);
            zombies.splice(i, 1);
            zombiesKilled++;
            score += 100;
            
            // Update UI immediately when a zombie is killed
            updateUI();
        }
    }
    
    // Draw and update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        bullets[i].draw();
        
        // Remove bullets that are out of bounds
        if (bullets[i].isOffScreen()) {
            bullets.splice(i, 1);
        }
    }
    
    // Draw and update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        
        // Remove particles that have faded
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }
    
    // Draw and update powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
        powerups[i].update();
        powerups[i].draw();
    }
}

function spawnZombie() {
    // Spawn zombie from edge of screen
    let x, y;
    if (p5Instance.random() < 0.5) {
        // Spawn from left or right
        x = p5Instance.random() < 0.5 ? -30 : p5Instance.width + 30;
        y = p5Instance.random(p5Instance.height);
    } else {
        // Spawn from top or bottom
        x = p5Instance.random(p5Instance.width);
        y = p5Instance.random() < 0.5 ? -30 : p5Instance.height + 30;
    }
    
    // Slightly randomize zombie attributes based on wave
    const speed = p5Instance.random(0.44, 0.88) * (1 + wave * 0.1);
    const health = 100 * (1 + (wave - 1) * 0.2);
    
    zombies.push(new Zombie(x, y, speed, health));
}

function spawnPowerup() {
    const type = p5Instance.random() < 0.7 ? "ammo" : "health";
    const x = p5Instance.random(50, p5Instance.width - 50);
    const y = p5Instance.random(50, p5Instance.height - 50);
    
    powerups.push(new Powerup(x, y, type));
}

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function checkCollisions() {
    // Check bullet collisions with zombies
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = zombies.length - 1; j >= 0; j--) {
            if (p5Instance.dist(bullets[i].x, bullets[i].y, zombies[j].x, zombies[j].y) < zombies[j].radius) {
                // Bullet hit zombie
                zombies[j].health -= bullets[i].damage;
                createParticles(bullets[i].x, bullets[i].y, COLORS.blood, 5);
                bullets.splice(i, 1);
                break;
            }
        }
    }
    
    // Check zombie collisions with player
    for (let zombie of zombies) {
        if (p5Instance.dist(zombie.x, zombie.y, player.x, player.y) < player.radius + zombie.radius) {
            player.health -= 0.5; // Zombie deals damage over time when touching
            createParticles(player.x, player.y, COLORS.blood, 1);
        }
    }
    
    // Check player collision with powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
        if (p5Instance.dist(powerups[i].x, powerups[i].y, player.x, player.y) < player.radius + powerups[i].radius) {
            if (powerups[i].type === "health") {
                player.health = p5Instance.min(player.health + 25, 100);
            } else if (powerups[i].type === "ammo") {
                player.ammo += 10;
            }
            createParticles(powerups[i].x, powerups[i].y, [255, 255, 255], 10);
            powerups.splice(i, 1);
        }
    }
    
    // Check for player death
    if (player.health <= 0) {
        gameOver();
    }
