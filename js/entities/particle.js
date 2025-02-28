// Particle class for effects
class Particle {
    constructor(x, y, color, gravity = 0.05, lifespan = 60) {
        this.x = x;
        this.y = y;
        this.vx = p5Instance.random(-2, 2);
        this.vy = p5Instance.random(-2, 2);
        this.alpha = 255;
        this.size = p5Instance.random(2, 6);
        this.color = color;
        this.gravity = gravity;
        this.alphaDrop = 255 / lifespan;
        
        // Adjust particle size for small screens
        if (isMobile && p5Instance.width < 500) {
            this.size = p5Instance.random(1, 4);
        }
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.alpha -= this.alphaDrop;
    }
    
    draw() {
        p5Instance.noStroke();
        p5Instance.fill(this.color[0], this.color[1], this.color[2], this.alpha);
        p5Instance.ellipse(this.x, this.y, this.size, this.size);
    }
}
