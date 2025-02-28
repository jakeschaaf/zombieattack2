// Powerup class
class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // "health" or "ammo"
        this.radius = 10;
        this.bobAmount = 0;
        this.bobSpeed = 0.05;
        this.spinAngle = 0;
        this.spinSpeed = 0.03;
        this.alpha = 255;
        this.flashRate = 0.05;
        
        // Adjust size for small screens
        if (isMobile && p5Instance.width < 500) {
            this.radius = 8;
        }
    }
    
    update() {
        this.bobAmount = p5Instance.sin(p5Instance.frameCount * this.bobSpeed) * 5;
        this.spinAngle += this.spinSpeed;
        this.alpha = 150 + p5Instance.sin(p5Instance.frameCount * this.flashRate) * 105;
    }
    
    draw() {
        p5Instance.push();
        p5Instance.translate(this.x, this.y + this.bobAmount);
        p5Instance.rotate(this.spinAngle);
        
        // Glow effect
        p5Instance.noStroke();
        if (this.type === "health") {
            p5Instance.fill(0, 255, 0, this.alpha * 0.3);
        } else {
            p5Instance.fill(0, 100, 255, this.alpha * 0.3);
        }
        p5Instance.ellipse(0, 0, this.radius * 4, this.radius * 4);
        
        // Main box
        if (this.type === "health") {
            p5Instance.fill(0, 255, 0, this.alpha);
            p5Instance.rect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
            
            // Health cross
            p5Instance.fill(255);
            p5Instance.rect(-this.radius * 0.7, -this.radius * 0.2, this.radius * 1.4, this.radius * 0.4);
            p5Instance.rect(-this.radius * 0.2, -this.radius * 0.7, this.radius * 0.4, this.radius * 1.4);
        } else {
            p5Instance.fill(0, 100, 255, this.alpha);
            p5Instance.rect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
            
            // Ammo symbol
            p5Instance.fill(255);
            p5Instance.rect(-this.radius * 0.7, -this.radius * 0.5, this.radius * 0.4, this.radius);
            p5Instance.rect(-this.radius * 0.1, -this.radius * 0.5, this.radius * 0.4, this.radius);
            p5Instance.rect(this.radius * 0.5, -this.radius * 0.5, this.radius * 0.4, this.radius);
        }
        
        p5Instance.pop();
    }
}
