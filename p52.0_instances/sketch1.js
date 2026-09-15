// ---------------------------------------------------------------
// sketch1.js
// Instance-Mode-Sketch #1: Balkendiagramm.
// "p" ist die p5-Instanz -- alle p5-Funktionen (createCanvas,
// background, rect, ...) hängen hier am "p" statt global zu sein.
// So können mehrere Sketches unabhängig auf derselben Seite laufen.
// ---------------------------------------------------------------

function sketch1(p) {
  p.setup = function () {
    p.createCanvas(300, 300);
  };

  p.draw = function () {
    p.background(240);
    p.noStroke();
    p.fill(80, 130, 250);

    let barWidth = p.width / sharedData.length;

    for (let i = 0; i < sharedData.length; i++) {
      let h = p.map(sharedData[i], 0, 100, 0, p.height);
      p.rect(i * barWidth, p.height - h, barWidth * 0.8, h);
    }
  };
}
