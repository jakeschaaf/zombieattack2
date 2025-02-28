// Zombie class
class Zombie {
    constructor(x, y, speed, health) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.speed = speed * 0.66;
        this.health = health;
        this.maxHealth = health;
        this.angle = 0;
        this.wobble = p5Instance.random(0, p5Instance.TWO_PI);
        this.wobbleSpeed = p5Instance.random(0.055, 0.11);
        
        // Scale size slightly based on device for better visibility on small screens
        if (isMobile && p5Instance.width < 600) {
            this.radius = 12; // Slightly smaller on very small screens
        }
    }
    
    update() {
        // Calculate angle to player
        this.angle = p5Instance.atan2(player.y - this.y, player.x - this.x);
        
        // Update wobble for shambling effect
        this.wobble += this.wobbleSpeed;
        
        // Move towards player with wobble
        this.x += p5Instance.cos(this.angle + p5Instance.sin(this.wobble) * 0.2) * this.speed;
        this.y += p5Instance.sin(this.angle + p5Instance.sin(this.wobble) * 0.2) * this.speed;
        
        // Occasionally leave blood drips
        if (p5Instance.random() < 0.003) {
            particles.push(new Particle(this.x, this.y, COLORS.blood, 0.5, 30));
        }
    }
    
    draw() {
        p5Instance.push();
        p5Instance.translate(this.x, this.y);
        p5Instance.rotate(this.angle);
        
        // Health bar
        p5Instance.noStroke();
        p5Instance.fill(100, 0, 0);
        p5Instance.rect(-this.radius, -this.radius - 10, this.radius * 2, 5);
        p5Instance.fill(255, 0, 0);
        p5Instance.rect(-this.radius, -this.radius - 10, p5Instance.map(this.health, 0, this.maxHealth, 0, this.radius * 2), 5);
        
        // Zombie body - true top-down view with only arms
        p5Instance.noStroke();
        
        // Left arm
        p5Instance.push();
        p5Instance.fill(COLORS.zombie);
        p5Instance.translate(0, -this.radius * 1.0);
        p5Instance.rotate(p5Instance.sin(this.wobble) * 0.3);
        p5Instance.rect(-this.radius * 0.3, -this.radius * 0.8, this.radius * 0.6, this.radius * 0.8, 5);
        p5Instance.pop();
        
        // Right arm
        p5Instance.push();
        p5Instance.fill(COLORS.zombie);
        p5Instance.translate(0, this.radius * 1.0);
        p5Instance.rotate(p5Instance.sin(this.wobble + p5Instance.PI) * 0.3);
        p5Instance.rect(-this.radius * 0.3, 0, this.radius * 0.6, this.radius * 0.8, 5);
        p5Instance.pop();
        
        // Torso (body) - oval shape as seen from above
        p5Instance.fill(COLORS.zombie);
        p5Instance.ellipse(0, 0, this.radius * 1.8, this.radius * 2.2);
        
        // Head - slightly smaller oval at front
        p5Instance.ellipse(this.radius * 0.7, 0, this.radius * 1.2, this.radius * 1.0);
        
        // Eyes - as seen from above (small dots on head)
        p5Instance.fill(255, 0, 0);
        p5Instance.ellipse(this.radius * 0.7, -this.radius * 0.3, this.radius * 0.2, this.radius * 0.2);
        p5Instance.ellipse(this.radius * 0.7, this.radius * 0.3, this.radius * 0.2, this.radius * 0.2);
        
        // Blood spots on zombie
        p5Instance.fill(COLORS.blood);
        p5Instance.ellipse(0, 0, this.radius * 0.8, this.radius * 0.3); // Blood on torso
        p5Instance.ellipse(this.radius * 0.8, 0, this.radius * 0.4, this.radius * 0.3); // Blood on face
        
        p5Instance.pop(); // End zombie transform
    }
}
