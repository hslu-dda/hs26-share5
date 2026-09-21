function sketch2(p) {
  let balls = [];

  p.setup = function () {
    p.createCanvas(300, 300);
    p.noStroke();
    let ball = new Ball(p, p.width / 2, p.height / 2, p.width * 0.15, p.color(230, 57, 70));
    balls.push(ball);
  };

  p.draw = function () {
    p.background("#83f283");
    for (b of balls) {
      b.update();
      b.draw();
    }
  };
  p.clicked = function () {
    let ball = new Ball(p, p.width / 2, p.height / 2, p.width * 0.15, p.color(p.random(100, 255), 100, 100));
    balls.push(ball);
  };
}
const mySketch2 = new p5(sketch2, document.getElementById("canvas2"));
