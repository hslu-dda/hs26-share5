function sketch3(p) {
  let bgColor;
  p.setup = function () {
    p.createCanvas(300, 300);
    bgColor = p.color(p.random(255), p.random(255), p.random(255));

    const btn = document.getElementById("button");
    btn.addEventListener("click", function () {
      bgColor = p.color(p.random(255), p.random(255), p.random(255));
    });
  };

  p.draw = function () {
    p.background(bgColor);
  };
}
const mySketch3 = new p5(sketch3, document.getElementById("canvas3"));
