// Player class with p5 instance references
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.speed = 2.2;
        this.health = 100;
        this.ammo = 10;
        this.reloading = false;
        this.reloadTime = 0;
        this.lastShot = 0;
        this.shotDelay = 300;
        this.keys = {};
        this.angle = 0;
        this.flashlightOn = true;
        this.flashlightAngle = p5Instance.PI/4;
    }
    
    update() {
        // Movement
        let moveX = 0;
        let moveY = 0;
        
        // Calculate direction vectors based on player's angle
        const forwardX = p5Instance.cos(this.angle);
        const forwardY = p5Instance.sin(this.angle);
        const rightX = p5Instance.cos(this.angle + p5Instance.PI/2);
        const rightY = p5Instance.sin(this.angle + p5Instance.PI/2);
        
        // WASD or Arrow keys with direction-based movement
        if (this.keys[87] || this.keys[38]) { // W or UP
            moveX += forwardX;
            moveY += forwardY;
        }
        if (this.keys[83] || this.keys[40]) { // S or DOWN
            moveX -= forwardX;
            moveY -= forwardY;
        }
        if (this.keys[65] || this.keys[37]) { // A or LEFT
            moveX -= rightX;
            moveY -= rightY;
        }
        if (this.keys[68] || this.keys[39]) { // D or RIGHT
            moveX += rightX;
            moveY += rightY;
        }
        
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            const length = p5Instance.sqrt(moveX * moveX + moveY * moveY);
            moveX /= length;
            moveY /= length;
        }
        
        // Apply movement
        this.x += moveX * this.speed;
        this.y += moveY * this.speed;
        
        // Constrain to screen
        this.x = p5Instance.constrain(this.x, this.radius, p5Instance.width - this.radius);
        this.y = p5Instance.constrain(this.y, this.radius, p5Instance.height - this.radius);
        
        // Calculate angle to mouse
        if (isMobile) {
            // On mobile, the angle may have been set by touch controls
            if (p5Instance.mouseX !== p5Instance.pmouseX || p5Instance.mouseY !== p5Instance.pmouseY) {
                this.angle = p5Instance.atan2(p5Instance.mouseY - this.y, p5Instance.mouseX - this.x);
            }
        } else {
            this.angle = p5Instance.atan2(p5Instance.mouseY - this.y, p5Instance.mouseX - this.x);
        }
        
        // Check if reloading is done
        if (this.reloading && p5Instance.millis() > this.reloadTime) {
            this.reloading = false;
        }
    }
    
    draw() {
        p5Instance.push();
        
        // Draw flashlight cone
        if (this.flashlightOn) {
            this.drawFlashlight();
        }
        
        // Draw player from true top-down perspective (arms only)
        p5Instance.translate(this.x, this.y);
        p5Instance.rotate(this.angle);
        
        // Left arm
        p5Instance.push();
        p5Instance.fill(COLORS.player);
        p5Instance.translate(0, -this.radius * 1.0);
        p5Instance.rotate(-0.2);
        p5Instance.rect(-this.radius * 0.3, -this.radius * 0.8, this.radius * 0.6, this.radius * 0.8, 5);
        p5Instance.pop();
        
        // Right arm with gun
        p5Instance.push();
        p5Instance.fill(COLORS.player);
        p5Instance.translate(0, this.radius * 1.0);
        p5Instance.rotate(0.2);
        p5Instance.rect(-this.radius * 0.3, 0, this.radius * 0.6, this.radius * 0.8, 5);
        
        // Gun - positioned in hand
        p5Instance.fill(80);
        p5Instance.rect(0, this.radius * 0.8, this.radius * 1.2, this.radius * 0.4);
        p5Instance.fill(50);
        p5Instance.rect(this.radius * 0.8, this.radius * 0.7, this.radius * 0.4, this.radius * 0.6);
        p5Instance.pop();
        
        // Torso - oval shape as seen from above
        p5Instance.fill(COLORS.player);
        p5Instance.noStroke();
        p5Instance.ellipse(0, 0, this.radius * 1.8, this.radius * 2.2);
        
        // Head - slightly smaller oval at front 
        p5Instance.ellipse(this.radius * 0.7, 0, this.radius * 1.0, this.radius * 0.9);
        
        // Health indicator around player
        p5Instance.noFill();
        p5Instance.strokeWeight(3);
        p5Instance.stroke(
            p5Instance.map(this.health, 0, 100, 255, 0), 
            p5Instance.map(this.health, 0, 100, 0, 255), 
            0
        );
        p5Instance.arc(0, 0, this.radius * 2 + 10, this.radius * 2 + 10, 0, p5Instance.TWO_PI * (this.health / 100));
        
        // Reloading indicator
        if (this.reloading) {
            p5Instance.noFill();
            p5Instance.stroke(255, 255, 255, 150);
            const reloadProgress = 1 - ((this.reloadTime - p5Instance.millis()) / 1000);
            p5Instance.arc(0, 0, this.radius * 2 + 20, this.radius * 2 + 20, 0, p5Instance.TWO_PI * reloadProgress);
        }
        
        p5Instance.pop();
    }
    
    drawFlashlight() {
        p5Instance.push();
        p5Instance.translate(this.x, this.y);
        p5Instance.rotate(this.angle);
        
        // Flashlight effect
        p5Instance.fill(255, 255, 200, 30);
        p5Instance.noStroke();
        
        p5Instance.beginShape();
        p5Instance.vertex(0, 0);
        for (let a = -this.flashlightAngle/2; a <= this.flashlightAngle/2; a += 0.1) {
            const r = 400; // flashlight range
            const x = p5Instance.cos(a) * r;
            const y = p5Instance.sin(a) * r;
            p5Instance.vertex(x, y);
        }
        p5Instance.vertex(0, 0);
        p5Instance.endShape();
        
        p5Instance.pop();
    }
    
    shoot() {
        if (this.ammo > 0 && !this.reloading && p5Instance.millis() > this.lastShot + this.shotDelay) {
            // Create new bullet
            const speed = 8.8;
            const vx = p5Instance.cos(this.angle) * speed;
            const vy = p5Instance.sin(this.angle) * speed;
            bullets.push(new Bullet(this.x + p5Instance.cos(this.angle) * 25, this.y + p5Instance.sin(this.angle) * 25, vx, vy));
            
            // Update ammo and shot time
            this.ammo--;
            this.lastShot = p5Instance.millis();
            
            // Create muzzle flash particles
            createParticles(
                this.x + p5Instance.cos(this.angle) * 25,
                this.y + p5Instance.sin(this.angle) * 25,
                [255, 255, 100],
                5
            );
            
            // Add recoil
            this.x -= p5Instance.cos(this.angle) * 3;
            this.y -= p5Instance.sin(this.angle) * 3;
        } else if (this.ammo <= 0 && !this.reloading) {
            // Auto-reload when out of ammo
            this.reloading = true;
            this.reloadTime = p5Instance.millis() + 1000;
        }
    }
}
