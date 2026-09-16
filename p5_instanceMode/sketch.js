function sketch(p) {
  let ball;

  p.setup = function () {
    p.createCanvas(300, 300);
    ball = new Ball(p, p.width / 2, p.height / 2, p.width * 0.15, p.color(100, 200, 200));
  };

  p.draw = function () {
    p.background("#ff9999");
    ball.update();
    ball.draw();
  };
}

new p5(sketch, document.getElementById("canvas1"));
