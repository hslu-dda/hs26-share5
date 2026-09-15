// ---------------------------------------------------------------
// sketch3.js
// Instance-Mode-Sketch #3: Linienchart.
// Liest dieselben sharedData wie sketch1.js und sketch2.js.
// ---------------------------------------------------------------

function sketch3(p) {
  p.setup = function () {
    p.createCanvas(300, 300);
  };

  p.draw = function () {
    p.background(240);
    p.stroke(80, 190, 120);
    p.strokeWeight(2);
    p.noFill();

    let spacing = p.width / (sharedData.length - 1);

    p.beginShape();
    for (let i = 0; i < sharedData.length; i++) {
      let y = p.map(sharedData[i], 0, 100, p.height - 10, 10);
      p.vertex(i * spacing, y);
    }
    p.endShape();
  };
}
