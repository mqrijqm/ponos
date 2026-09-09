/**
 * Raspored poda i ciljevi animacije za svaku dasku.
 *
 * Sve brojke stoje ovdje, van komponente: scena ih samo cita. Tako se raspored
 * mijenja bez diranja renderovanja, a isti podaci vaze i za pod i za scroll.
 *
 * Smjer je obrnut od uobicajenog "sklapanja": pod POCINJE cio, pa se na scroll
 * raspada — daske se odvajaju, dizu i ostaju da lebde nad rupama.
 */

/* Prava daska laminata: 1220 x 190 x 8 mm. Jedna jedinica scene = 200 mm. */
export const DASKA = { duzina: 6.1, debljina: 0.04, sirina: 0.95 } as const;

/** Tri seta postoje na disku; hero koristi jedan. */
export const SETOVI = ["laminate", "kitchen", "oak"] as const;
export type Set = (typeof SETOVI)[number];

/**
 * Cijeli pod je od jednog materijala — najsvjetlijeg od tri. Izmjereno na
 * samim teksturama, ne procijenjeno: srednja svjetlina L* je 55.6 za laminate,
 * 52.5 za oak i 40.7 za kitchen. Uz to je laminate i glavni set.
 *
 * Jedan set znaci i jedan `InstancedMesh` za cijeli pod, i tri fajla manje za
 * skidanje umjesto devet.
 */
export const SET_HEROJA: Set = "laminate";

/*
  Tekstura je kvadratni uzorak od jednog metra. Daska je 1.22 x 0.19 m, pa
  ponavljanje po duzini ide 1.22, a po sirini 0.19 — tako godovi imaju stvarnu
  velicinu, a ne razvucenu ili zbijenu.
*/
export const UV_PONAVLJANJE: [number, number] = [1.22, 0.19];

/** Prozor scrolla u kojem se daske odvajaju. Prije i poslije se ne mice. */
export const DIZANJE = { od: 0.1, do: 0.6 } as const;
/** Razmak izmedju polazaka dvije daske. */
export const KORAK = 0.06;
/** Koliko scrolla traje dizanje jedne daske. */
export const TRAJANJE = 0.14;

/** Amplituda mirnog talasanja kad daske vec lebde. */
export const TALASANJE = 0.02;

export type Daska = {
  id: number;
  set: Set;
  /** Mjesto u podu; aktivna daska odavde polazi i ovdje ostavlja rupu. */
  polozaj: [number, number, number];
  aktivna: boolean;
  /** Slucajni pomjeraj teksture, da se ponavljanje ne prepoznaje. */
  uvPomak: [number, number];
  /* Ciljevi — samo za aktivne daske. */
  visina: number;
  zanos: [number, number];
  nagib: [number, number];
  uvecanje: number;
  pocetak: number;
  kraj: number;
  faza: number;
  drhtaj: number;
};

/**
 * Determinisan generator. Ista sjemenka daje isti pod pri svakom renderu, pa
 * se raspored ne mijenja izmedju servera i browsera niti pri svakom osvjezenju
 * — inace bi daske skakale na hidraciji. (mulberry32)
 */
function slucajni(sjeme: number) {
  let a = sjeme;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SJEME = 20260909;

/**
 * Pod od dvije kolone i N redova, sa preklopom od pola daske u svakom drugom
 * redu — tako se spojevi ne poklapaju, kao kod pravog poda. Ivice ostaju
 * zubate; to je namjerno, pod se i raspada.
 */
export function napraviPod(uzakEkran: boolean) {
  /*
    Pod je namjerno veci od kadra na obje strane: laminat ide do gornje ivice
    ekrana i ispod navbara, a i kad se kamera na kraju odmakne, njegove ivice
    ostaju van slike. Sve statične daske su jedan `InstancedMesh`, pa broj
    dasaka ne kosta ni jedan draw call vise — kosta samo matrice.

    Zato ih je vise od pocetnih 24-30: sa toliko dasaka pod prestaje na pola
    ekrana, i to se vidi u trenutku kad se kamera odmakne.
  */
  const kolona = uzakEkran ? 4 : 6;
  const redova = uzakEkran ? 18 : 30;
  const aktivnih = uzakEkran ? 4 : 7;
  const rnd = slucajni(SJEME);


  const daske: Daska[] = [];
  let id = 0;

  for (let red = 0; red < redova; red += 1) {
    /*
      Pomjeraj spoja je slucajan po redu, ne naizmjenican. Kad se redovi smjenjuju
      po pola daske, spojevi se poredaju u dijagonalne stepenice — pravi pod tako
      ne izgleda, tamo je svaki red pomjeren za svoju mjeru.
    */
    const preklop = (rnd() - 0.5) * DASKA.duzina;
    for (let kol = 0; kol < kolona; kol += 1) {
      const x = (kol - (kolona - 1) / 2) * DASKA.duzina + preklop;
      const z = (red - (redova - 1) / 2) * DASKA.sirina;
      daske.push({
        id,
        set: SET_HEROJA,
        polozaj: [x, DASKA.debljina / 2, z],
        aktivna: false,
        uvPomak: [rnd(), rnd()],
        visina: 0,
        zanos: [0, 0],
        nagib: [0, 0],
        uvecanje: 1,
        pocetak: 0,
        kraj: 0,
        faza: rnd() * Math.PI * 2,
        drhtaj: 0,
      });
      id += 1;
    }
  }

  /*
    Aktivne se biraju iz srednjeg dijela poda: da se dizu daske sa same ivice,
    rupe bi ostale van kadra, a kamera na kraju gleda u centar.
  */
  /*
    Aktivne daske se biraju iz uzeg pojasa oko sredine poda, ne iz cijelog:
    kamera i na pocetku i na kraju gleda u centar, pa rupa negdje na ivici
    velikog poda nikom nista ne znaci.
  */
  const sredina = daske.filter((d) => {
    const red = Math.floor(d.id / kolona);
    return (
      red >= redova * 0.42 &&
      red <= redova * 0.62 &&
      Math.abs(d.polozaj[0]) < 7
    );
  });

  const izabrane: Daska[] = [];
  while (izabrane.length < aktivnih && sredina.length) {
    const [uzeta] = sredina.splice(Math.floor(rnd() * sredina.length), 1);
    izabrane.push(uzeta);
  }

  /* Polasci idu od bliže ka daljoj, pa raspadanje ide kao talas, ne mrlja. */
  izabrane.sort((a, b) => b.polozaj[2] - a.polozaj[2]);

  izabrane.forEach((d, k) => {
    d.aktivna = true;
    /*
      Visina lebdenja: 0.35–0.9 jedinice, sto je 7–18 cm u pravoj mjeri. Vise
      od toga i daska duga 6.1 jedinicu, gledana pod uglom, preraste u oštricu
      preko cijelog kadra — mjereno na 1440x900.
    */
    d.visina = 0.35 + rnd() * 0.55;
    /* Svaka daska bjezi u svoju stranu; smjer je slucajan, ali determinisan. */
    d.zanos = [(rnd() - 0.5) * 0.8, (rnd() - 0.5) * 0.7];
    /* 5–20 stepeni na x i z osi, u nasumicnu stranu. */
    const stepen = Math.PI / 180;
    d.nagib = [
      (5 + rnd() * 15) * stepen * (rnd() < 0.5 ? -1 : 1),
      (5 + rnd() * 15) * stepen * (rnd() < 0.5 ? -1 : 1),
    ];
    d.uvecanje = 1.05 + rnd() * 0.05;
    d.pocetak = DIZANJE.od + k * KORAK;
    d.kraj = Math.min(d.pocetak + TRAJANJE, DIZANJE.do);
    d.drhtaj = 0.02 + rnd() * 0.03;
  });

  /* Kamera na kraju gleda u sredinu onoga sto lebdi, ne u sredinu poda. */
  const lebde = daske.filter((d) => d.aktivna);
  const cilj: [number, number, number] = [
    lebde.reduce((s, d) => s + d.polozaj[0] + d.zanos[0], 0) / lebde.length,
    lebde.reduce((s, d) => s + d.visina, 0) / lebde.length / 1.6,
    lebde.reduce((s, d) => s + d.polozaj[2] + d.zanos[1], 0) / lebde.length,
  ];

  return { daske, cilj };
}

/**
 * Kamera: iz ptičje perspektive, bez obilaska oko scene — samo translacija i
 * postepeni pomjeraj cilja pogleda. Pocetak je blizu poda, kraj odmaknut: kad
 * daske odlete, kadar se otvara oko njih.
 */
export const KAMERA = {
  /*
    Pocetak: blizu i tijesno, ~60 stepeni nadole. Laminat puni cijeli kadar do
    gornje ivice i ide ispod navbara — zadnja ivica poda je van slike.
    Kraj: odmaknuto i sa sirim uglom. Kad se daske dignu, kamera se udalji da
    se vidi kako lebde, umjesto da ulazi medu njih.
  */
  pocetak: { polozaj: [0, 9, 5.2] as const, fov: 38 },
  kraj: { polozaj: [0, 16.5, 11] as const, fov: 44 },
  /* Pogled na pocetku ide u sredinu poda, na kraju u sredinu lebdecih dasaka. */
  pocetniCilj: [0, 0, 0] as const,
};

/** Koliko ekrana scrolla nosi cijelu sekvencu. */
export const EKRANA_SCROLLA = 2.5;

/** easeOutCubic — dizanje krece naglo pa se smiruje, ne linearno. */
export function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Udio prijedenog puta unutar [od, do], odsjecen na 0..1. */
export function udio(vrijednost: number, od: number, do_: number) {
  if (do_ <= od) return vrijednost >= do_ ? 1 : 0;
  return Math.min(1, Math.max(0, (vrijednost - od) / (do_ - od)));
}
