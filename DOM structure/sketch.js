const sketch = (p) => {
  let holder;
  let ball;

  p.setup = () => {
    holder = document.getElementById("canvas-holder");
    const w = holder.offsetWidth;
    const h = w * 0.5;

    p.createCanvas(w, h).parent(holder);

    ball = new Ball(p, w / 2, h / 2, w * 0.15, p.color(230, 57, 70));
  };

  p.draw = () => {
    p.background(245);
    ball.update();
    ball.draw();
  };
};

new p5(sketch);
