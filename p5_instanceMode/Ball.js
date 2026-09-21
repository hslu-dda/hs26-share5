class Ball {
  constructor(p, x, y, size, color) {
    this.p = p;
    this.position = p.createVector(x, y);
    this.vel = p.createVector(p.random(1, 5), p.random(1, 5));
    this.size = size;
    this.color = color;
  }

  update() {
    const p = this.p;
    this.position.add(this.vel);

    const r = this.size / 2;

    // horizontal walls
    if (this.position.x - r < 0) {
      this.position.x = r;
      this.vel.x *= -1;
    } else if (this.position.x + r > p.width) {
      this.position.x = p.width - r;
      this.vel.x *= -1;
    }

    // vertical walls
    if (this.position.y - r < 0) {
      this.position.y = r;
      this.vel.y *= -1;
    } else if (this.position.y + r > p.height) {
      this.position.y = p.height - r;
      this.vel.y *= -1;
    }
  }

  draw() {
    const p = this.p;
    p.noStroke();
    p.fill(this.color);
    p.ellipse(this.position.x, this.position.y, this.size, this.size);
  }
}
