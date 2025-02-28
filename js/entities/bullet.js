// Bullet class
class Bullet {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 4;
        this.damage = 25;
        
        // Adjust bullet size for small screens
        if (isMobile && p5Instance.width < 500) {
            this.radius = 3;
        }
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Create trail particles
        if (p5Instance.random() < 0.3) {
            particles.push(new Particle(this.x, this.y, COLORS.bullet, 0.7, 10));
        }
    }
    
    draw() {
        p5Instance.fill(COLORS.bullet);
        p5Instance.noStroke();
        p5Instance.ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
    }
    
    isOffScreen() {
        return (
            this.x < -this.radius ||
            this.x > p5Instance.width + this.radius ||
            this.y < -this.radius ||
            this.y > p5Instance.height + this.radius
        );
    }
}
