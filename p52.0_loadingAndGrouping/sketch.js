let chlamydiosis;
let cMonthlyCases;
let cYearly;
let groupedArray = [];

async function setup() {
  createCanvas(800, 600);
  chlamydiosis = await d3.csv("assets/CHLAMYDIOSIS_oblig/data.csv");
  console.log(chlamydiosis);

  // alle monatilchen cases filtern
  cMonthlyCases = chlamydiosis.filter((d) => d.valueCategory === "cases" && d.temporal_type === "month");
  console.log("monthly", cMonthlyCases);

  cYearly = chlamydiosis.filter((d) => d.valueCategory === "cases" && d.temporal_type === "year");
  console.log("cYearly", cYearly);

  // alle monatilchen Daten finden, nicht nur die Cases, auch min,max,median
  let monthly = chlamydiosis.filter((d) => d.temporal_type === "month");

  // Gruppiert nach Monat: "2017-M01" -> [4 Zeilen: cases, min, median, max]
  let grouped = d3.group(monthly, (d) => d.temporal);

  for (let [temporal, rows] of grouped) {
    //destructuring ;) -> https://www.geeksforgeeks.org/javascript/what-is-destructuring-in-es6/
    // alle vier Felder vorab auf null, damit jedes Monats-Objekt gleich aussieht
    let obj = {
      temporal: temporal,
      cases: null,
      min_value_5y: null,
      median_value_5y: null,
      max_value_5y: null,
    };
    //Alle Zeilen dieses Monats durchgehen (z.B. die 4 Kategorien)
    // und die vorhandenen Werte ins Objekt eintragen.
    for (let row of rows) {
      obj[row.valueCategory] = +row.value;
    }

    groupedArray.push(obj);
  }

  groupedArray.sort((a, b) => a.temporal.localeCompare(b.temporal));

  console.log(groupedArray);
  textSize(12);
}

function draw() {
  background(220);
  let x = 0;
  let y = 0;
  let rectwidth = 30;
  let lineHeight = textAscent() + textDescent(); // echte Zeilenhöhe statt textAscent()*2
  let year = groupedArray[0].temporal.split("-")[0];

  for (let month of groupedArray) {
    let date = month.temporal.split("-");

    // neues Jahr -> Zeilenumbruch, immer ganz links beginnen
    if (date[0] != year) {
      x = 0;
      y += rectwidth;
    }
    year = date[0];

    // rot wenn Fallzahl über dem 5-Jahres-Median liegt, sonst grau

    if (month.median_value_5y !== null && month.median_value_5y < month.cases) {
      fill("#dd8c8c");
    } else {
      fill("#e1e4e1");
    }

    push();
    translate(x, y);
    rect(0, 0, rectwidth);
    fill(0);
    text(month.cases, 0, lineHeight);
    text(year, 0, lineHeight * 2);
    pop();

    x += rectwidth;
  }
}
