// Builds the two-slide "Parcel Locker protocol" deck -> ../project/parcel-locker-protocol.pptx
const path = require("path");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require("./apply-theme");

const THEME = {
  name: "Paczkomat",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1B2430", lt1: "FFFFFF", dk2: "2E3A4B", lt2: "F1F3F5",
    accent1: "F2A900", accent2: "2E6F95", accent3: "5B6770",
    accent4: "3E8E7E", accent5: "B85042", accent6: "8A93A0",
    hlink: "2E6F95", folHlink: "5B6770",
  },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33" x 7.5"
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Protokół Paczkomat";
pres.subject = "Oprogramowanie komunikacyjne dla Internetu rzeczy – projekt";
const C = pres.SchemeColor;

pres.defineSlideMaster({
  title: "TYTUL",
  background: { color: C.background1 },
  objects: [
    {
      placeholder: {
        options: {
          name: "title", type: "title", x: 0.5, y: 0.4, w: 12.3, h: 0.9,
          fontSize: 32, bold: true, color: C.text1, margin: 0, valign: "middle", align: "left",
        },
        text: "",
      },
    },
  ],
  slideNumber: { x: 12.1, y: 7.0, w: 0.7, h: 0.3, fontSize: 11, color: C.accent3, align: "right" },
});

const IMG = path.join(__dirname, "diagram-slide.png");

// ---------- Slajd 1: system ----------
pres.addSection({ title: "Protokół" });
const s1 = pres.addSlide({ masterName: "TYTUL", sectionTitle: "Protokół" });
s1.addText("Protokół Paczkomat (Kurier – Paczkomat – Odbiorca)", { placeholder: "title" });

s1.addImage({
  path: IMG, x: 0.5, y: 1.6, w: 7.9, h: 7.9 * 1100 / 1920,
  altText: "Diagram systemu Paczkomat: procesy Kurier, Paczkomat, Odbiorca i listy sygnałów między nimi",
});
s1.addText(
  "sk – numer skrytki · kk – kod kuriera · kod – kod odbioru · rozm – rozmiar paczki",
  { x: 0.5, y: 6.3, w: 7.9, h: 0.35, fontSize: 12, color: C.accent3, margin: 0, isTextBox: true,
    objectName: "Legenda oznaczeń" }
);

s1.addShape(pres.ShapeType.rect, {
  x: 8.7, y: 1.6, w: 4.13, h: 4.53, fill: { color: C.background2 }, line: { type: "none" },
  objectName: "Tło opisu",
});
s1.addText(
  [
    { text: "Scenariusz", options: { bold: true, fontSize: 16, breakLine: true, paraSpaceAfter: 4 } },
    { text: "Kurier nadaje paczkę: podaje rozmiar i kod, wkłada ją do otwartej skrytki. Paczkomat wysyła Odbiorcy SMS z kodem, a Odbiorca odbiera paczkę.",
      options: { fontSize: 14, breakLine: true, paraSpaceAfter: 12 } },
    { text: "Ograniczenia", options: { bold: true, fontSize: 16, breakLine: true, paraSpaceAfter: 4 } },
    { text: "Kod odbioru jest jednorazowy i trafia do Odbiorcy w SMS", options: { bullet: true, fontSize: 14, breakLine: true, paraSpaceAfter: 4 } },
    { text: "3 błędne kody Odbiorcy → Blokada", options: { bullet: true, fontSize: 14, breakLine: true, paraSpaceAfter: 4 } },
    { text: "Czas na odbiór T = 48 h, potem skrytka jest zwalniana", options: { bullet: true, fontSize: 14, breakLine: true, paraSpaceAfter: 4 } },
    { text: "rozm ∈ {S, M, L}; brak skrytki → Brak_miejsca", options: { bullet: true, fontSize: 14, breakLine: true, paraSpaceAfter: 4 } },
    { text: "Błędny kod kuriera → Odmowa", options: { bullet: true, fontSize: 14 } },
  ],
  { x: 8.95, y: 1.8, w: 3.7, h: 4.15, valign: "top", color: C.text1, margin: 0, isTextBox: true,
    objectName: "Opis i ograniczenia" }
);
s1.addNotes(
  "Trzy procesy: Kurier (człowiek), Paczkomat (maszyna), Odbiorca (człowiek). Strzałka z góry to sygnał z otoczenia (Nadanie). " +
  "Górne listy sygnałów idą w prawo, dolne w lewo. Ograniczenia: limit 3 błędnych kodów, czas T = 48 h, rozmiary S/M/L."
);

// ---------- Slajd 2: definicje procesow ----------
pres.addSection({ title: "Procesy" });
const s2 = pres.addSlide({ masterName: "TYTUL", sectionTitle: "Procesy" });
s2.addText("Definicje procesów", { placeholder: "title" });

const cards = [
  {
    name: "KURIER", kind: "człowiek",
    rola: "Nadaje paczkę: podaje rozmiar i swój kod, wkłada paczkę do otwartej skrytki i ją zamyka.",
    stany: ["SPOCZYNEK", "CZEKA_NA_PACZKOMAT"],
    dcl: "rozm, kk, sk",
    reakcje: ["Podaj_kod → Kod_kuriera(kk) lub Anuluj", "Otwarto(sk) → Zamknięto", "Brak_miejsca, Odmowa → SPOCZYNEK"],
    reakcjeLabel: "Reakcje: CZEKA_NA_PACZKOMAT",
  },
  {
    name: "PACZKOMAT", kind: "maszyna",
    rola: "Weryfikuje kuriera, przydziela skrytkę, generuje kod odbioru i wysyła SMS, pilnuje limitu prób i czasu T.",
    stany: ["GOTOWOŚĆ", "CZEKA_NA_KOD_KURIERA", "CZEKA_NA_ZAMKNIĘCIE", "CZEKA_NA_KOD_ODBIORCY", "CZEKA_NA_ODEBRANIE", "BLOKADA"],
    dcl: "rozm, kk, sk, kod, kw, próby, timer T",
    reakcje: [],
  },
  {
    name: "ODBIORCA", kind: "człowiek",
    rola: "Dostaje SMS z kodem, wpisuje go w Paczkomacie i odbiera paczkę; po błędnym kodzie ponawia albo rezygnuje.",
    stany: ["CZEKA_NA_SMS", "CZEKA_NA_PACZKOMAT"],
    dcl: "kod, sk",
    reakcje: ["Otwarto(sk) → Odebrano", "Błędny_kod → Kod(kod) lub Anuluj", "Blokada → CZEKA_NA_SMS"],
    reakcjeLabel: "Reakcje: CZEKA_NA_PACZKOMAT",
  },
];

const CW = 3.9, CH = 5.3, CY = 1.55, GAP = 0.315;
cards.forEach((c, i) => {
  const x = 0.5 + i * (CW + GAP);
  s2.addShape(pres.ShapeType.rect, {
    x, y: CY, w: CW, h: CH, fill: { color: C.background2 }, line: { type: "none" },
    objectName: `Karta ${c.name}`,
  });
  s2.addShape(pres.ShapeType.rect, {
    x, y: CY, w: CW, h: 0.7, fill: { color: C.text2 }, line: { type: "none" },
    objectName: `Nagłówek ${c.name}`,
  });
  s2.addText(c.name, {
    x: x + 0.2, y: CY, w: 2.3, h: 0.7, fontSize: 20, bold: true, color: C.background1,
    valign: "middle", margin: 0, isTextBox: true,
  });
  s2.addText(c.kind, {
    shape: pres.ShapeType.roundRect, rectRadius: 0.15,
    x: x + CW - 1.35, y: CY + 0.2, w: 1.15, h: 0.3, fontSize: 12, bold: true, color: C.text1,
    fill: { color: C.accent1 }, line: { type: "none" },
    align: "center", valign: "middle", margin: 0, objectName: `Typ ${c.name}`,
  });

  const lab = (t) => ({ text: t, options: { bold: true, fontSize: 12, color: C.accent3, breakLine: true, paraSpaceAfter: 1 } });
  const val = (t, last) => ({ text: t, options: { fontSize: 15, color: C.text1, breakLine: !last, paraSpaceAfter: 9 } });
  const runs = [lab("ROLA"), val(c.rola), lab("STANY")];
  c.stany.forEach((s, k) => runs.push({
    text: s, options: { fontSize: 15, color: C.text1, breakLine: true, paraSpaceAfter: k === c.stany.length - 1 ? 9 : 0 },
  }));
  runs.push(lab("ZMIENNE"), val(c.dcl, c.reakcje.length === 0));
  if (c.reakcje.length) {
    runs.push(lab(c.reakcjeLabel.toUpperCase()));
    c.reakcje.forEach((r, k) => {
      const last = k === c.reakcje.length - 1;
      runs.push({ text: r, options: { fontSize: 15, color: C.text1, bullet: true, breakLine: !last, paraSpaceAfter: 3 } });
    });
  }
  s2.addText(runs, {
    x: x + 0.2, y: CY + 0.9, w: CW - 0.4, h: CH - 1.1, valign: "top", margin: 0, isTextBox: true,
    objectName: `Opis ${c.name}`,
  });
});

s2.addNotes(
  "Procesy zdefiniowane przez rolę, stany i zmienne. Kurier i Odbiorca to ludzie, Paczkomat to maszyna."
);

const out = path.join(__dirname, "..", "project", "parcel-locker-protocol.pptx");
pres.writeFile({ fileName: out })
  .then(() => applyTheme(out, THEME))
  .then(() => console.log("zapisano", out))
  .catch((e) => { console.error(e); process.exit(1); });
