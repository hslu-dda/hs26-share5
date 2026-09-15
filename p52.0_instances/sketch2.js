// ---------------------------------------------------------------
// sketch2.js
// Instance-Mode-Sketch #2: Kreise mit Radius proportional zum Wert.
// Liest dieselben sharedData wie sketch1.js und sketch3.js.
// ---------------------------------------------------------------

function sketch2(p) {
  p.setup = function () {
    p.createCanvas(300, 300);
    p.noStroke();
  };

  p.draw = function () {
    p.background(240);
    p.fill(250, 130, 80);

    let spacing = p.width / sharedData.length;

    for (let i = 0; i < sharedData.length; i++) {
      let d = p.map(sharedData[i], 0, 100, 4, 40);
      let x = i * spacing + spacing / 2;
      p.circle(x, p.height / 2, d);
    }
  };
}
