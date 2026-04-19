# CoreRestart Live – Claude Code Notes

## Zvukové notifikace

Po dokončení každého úkolu přehraj zvuk pomocí PowerShellu:
```bash
powershell -c "[console]::beep(880,200); [console]::beep(1100,300)"
```

## Testing – Playwright

Playwright is installed and configured in this project.

Installation date: April 9, 2026
Test result at installation: 12/12 passed (4 tests × 3 browsers)

### Browsers tested:
- Chromium
- Firefox
- WebKit (Safari)

### Test files:
- `tests/corerestart.spec.js` – hlavní test file (4 testy: homepage, form, livestream, no-timeline)
- `tests/exkluzivni-nabidka.spec.js` – testy pro exkluzivni-nabidka.html (9 testů)
- `tests/screenshots/` – automatické screenshoty z každého spuštění

### Test history:
| Datum | Soubor | Výsledek |
|---|---|---|
| 9. dubna 2026 | `corerestart.spec.js` | 12/12 passed (4 testy × 3 prohlížeče) |
| 19. dubna 2026 | `exkluzivni-nabidka.spec.js` | 27/27 passed (9 testů × 3 prohlížeče) |

### How to run tests:
- Headless mode (background, no visible browser):
  `npm test`
- Headed mode (visible browser windows):
  `npm run test:headed`
- Konkrétní soubor:
  `npx playwright test tests/exkluzivni-nabidka.spec.js`

### When to run tests:
Vždy spustit testy po změnách v HTML souborech před deplojem na Vercel:
- `index.html` → `corerestart.spec.js`
- `vysílání-1.html` → `corerestart.spec.js`
- `exkluzivni-nabidka.html` → `exkluzivni-nabidka.spec.js`

### Note on headless mode:
By default Playwright runs in headless mode - browsers run in background
without visible windows. This is normal and correct behavior.
To see browsers visually, use: `npm run test:headed`

---

## Přehled projektu

Webová aplikace která simuluje živé vysílání předtočeného videa uloženého na AWS S3.
Zákazníci dostanou odkaz, přijdou na stránku, uvidí odpočet do začátku vysílání,
a v přesný čas se jim spustí video – bez možnosti posouvat časovou osu.
V průběhu vysílání se zobrazí CTA tlačítko vedoucí na prodejní stránku.
Po skončení videa se zobrazí stránka "Vysílání skončilo" s tlačítkem na záznam.

---

## Tech Stack

| Vrstva | Technologie |
|---|---|
| Frontend | Vanilla HTML + CSS + JavaScript (žádný framework) |
| Hosting | Vercel |
| Video | AWS S3 (přímá URL) |

**DŮLEŽITÉ: Tento projekt NEPOUŽÍVÁ Next.js, React ani npm.**
Je to čisté HTML/CSS/JS – žádné závislosti, žádný build process.

---

## Klíčové URL a konfigurace

- **Live URL:** https://corerestart-live.vercel.app
- **Prodejní stránka (CTA):** https://corerestart.cz/
- **Záznam vysílání:** https://mamacore.cz/
- **VIDEO_URL:** prázdná – doplnit před každým vysíláním (viz níže)
- **CTA se zobrazí po:** 1800 sekundách (= 30 minutách) od startu videa

---

## Aktuální struktura projektu

```
CoreRestart-Live/
├── index.html                – homepage (coming soon stránka, corerestart.live/)
├── dekovaci-hlavni.html      – děkovací stránka (corerestart.live/dekujeme-za-registraci)
├── exkluzivni-nabidka.html   – stránka s nabídkou 5 výzev (corerestart.live/exkluzivni-nabidka)
├── vysílání-1.html           – fake livestream player (corerestart.live/vysilani-1)
├── styles.css                – CSS pro vysílání-1.html
├── script.js                 – JS pro vysílání-1.html
├── vercel.json               – konfigurace Vercel + routy
├── CLAUDE.md                 – tento soubor s instrukcemi
├── .gitignore
├── image/
│   ├── Logo-stredni.png                    – kulaté logo CoreRestart
│   ├── My dva nové.png                     – fotka Filipa a Tomáše
│   └── img-exkluzivni-nabidka/            – produktové obrázky pro exkluzivni-nabidka.html
│       ├── Transformační FyzioVýzva.png
│       ├── FyzioVýzva pro krční páteř.png
│       ├── FyzioVýzva pro seniory.png
│       └── FyzioYóga 30+30.png
├── .claude/
└── .vercel/
```

---

## Jak aktualizovat datum a čas vysílání

Před každým novým vysíláním napiš Claude Code:
```
Update the stream start time in vysílání-1.html to [DATUM] at [ČAS] CEST
(= [ČAS - 2 hodiny] in UTC) and redeploy to Vercel with: npx vercel --prod
```
**Důležité:** CEST = UTC + 2 hodiny. Vždy odečti 2 hodiny pro UTC.
Příklad: 20:00 CEST = 18:00 UTC → `2026-04-03T18:00:00Z`

---

## Jak aktualizovat URL videa

Video URL je záměrně prázdná z bezpečnostních důvodů. Před každým vysíláním napiš Claude Code:
```
Update VIDEO_URL in vysílání-1.html to: [URL VIDEA]
Then redeploy to Vercel with: npx vercel --prod
```
Po skončení vysílání URL opět smazat:
```
Remove the VIDEO_URL from vysílání-1.html (set it to empty string "")
and redeploy to Vercel with: npx vercel --prod
```

---

## Jak nasadit na Vercel

```bash
npx vercel --prod
```
Spustit v terminálu ve složce projektu `C:/projekty/corerestart-live`.

---

## Known Issues & Fixes

### 1. Video starts muted (autoplay browser restriction)
**Problém:** Když odpočet doběhne a video se spustí automaticky, zvuk je ztlumený.
**Důvod:** Všechny moderní prohlížeče (Chrome, Firefox, Safari) blokují autoplay
se zvukem. Toto NELZE obejít – je to bezpečnostní funkce prohlížeče.
**Řešení:** Zobrazit velké výrazné tlačítko "▶ Spustit vysílání" když odpočet skončí.
Video se spustí se zvukem po kliknutí na toto tlačítko.
Jedno kliknutí je nevyhnutelné – nelze se tomu vyhnout.

### 2. Časová osa viditelná
**Problém:** HTML5 video přehrávač zobrazuje timeline – diváci vidí délku videa
a mohou přeskakovat na libovolnou pozici. Na fake livestreamu to nesmí být vidět.
**Důvod selhání CSS:** Webkit pseudo-elementy (`video::-webkit-media-controls-timeline`)
fungují pouze v Chrome – ve Firefoxu nefungují.
**Správné řešení:** Odebrat nativní `controls` atribut z `<video>` úplně a postavit
vlastní ovládací prvky v JS/CSS.
**Implementováno:** Vlastní control bar obsahuje pouze:
- ▶/⏸ play/pause vlevo
- 🔊 + slider hlasitosti vpravo
- ⛶ fullscreen vpravo
- Controls se auto-schovají po 3s přehrávání, zobrazí se na hover nebo při pauze
- Funguje ve všech prohlížečích (Chrome, Firefox, Safari, Edge)

**Anti-seek JavaScript:**
```js
video.addEventListener('seeking', () => { video.currentTime = livePosition; });
```
Resetuje pozici na správnou živou pozici při jakémkoliv pokusu o seek.

### 3. Pozdní diváci – správná pozice videa
Pokud někdo přijde po startu vysílání, video se spustí od aktuální "živé" pozice:
```js
const livePosition = (serverTime - streamStartTime) / 1000; // sekundy od startu
video.currentTime = livePosition;
```

---

## Lessons Learned – Windows Development

### Problém: Duplicate React Instance na Windows
Next.js (v14 i v15) obsahuje interní zkompilovanou kopii Reactu (`next/dist/compiled/react`).
Windows má case-insensitive souborový systém – webpack občas načte obě kopie současně.
React vyžaduje přesně jednu instanci – se dvěma instancemi hodí chyby:
- `"invariant expected layout router to be mounted"`
- `"Cannot read properties of null (reading 'useContext')"`
- `"Cannot read properties of null (reading 'useReducer')"`

### Co jsme zkoušeli a nefungovalo:
- webpack resolve.alias pro pinování Reactu na jednu instanci
- npm overrides v package.json
- Downgrade z Next.js 15 na Next.js 14
- Přechod z App Routeru na Pages Router
- Čistá reinstalace node_modules

### Řešení:
Přechod na čisté HTML + CSS + JavaScript (žádný framework).
Výsledek je rychlejší, jednodušší a bez závislostí.

### Pravidla pro budoucí Next.js projekty na Windows:
1. Složku projektu vždy pojmenovat malými písmeny: `corerestart-live` NE `CoreRestart-Live`
2. Celá cesta nesmí obsahovat velká písmena: `c:/projekty/corerestart-live`
3. Pinovat přesnou verzi Next.js: `"next": "15.1.0"` (bez stříšky `^`)
4. Ihned po vytvoření projektu přidat do `next.config.js`:
```js
const path = require("path");
module.exports = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom"),
    };
    return config;
  },
};
```
5. Vyhýbat se knihovnám s vlastními React závislostmi (např. video.js)
6. Vždy říct Claude Code na začátku: "Jsme na Windows, použij webpack alias pro single React instanci"

---

## Removed files (Next.js leftovers)
Tyto soubory byly smazány 4. dubna 2026 jako pozůstatky z abandoned Next.js implementace:
- `.next/` složka (Next.js compiled build)
- `CLAUDE.md.md` (duplicitní soubor vytvořený omylem)
- `.env.local.example` (šablona pro Next.js environment variables)
- `.next` složka (zkompilovaný Next.js build)

---

## Děkovací stránka (dekovaci-hlavni.html)

Vytvořena 15. dubna 2026. Zobrazí se po odeslání e-mailového formuláře SmartEmailing.

- **URL:** `corerestart.live/dekujeme-za-registraci` → route v `vercel.json`
- **Soubor:** `dekovaci-hlavni.html`
- **Design:** stejný jako index.html – černý header, bílé pozadí, Open Sans
- **Obsah:** velká zelená animovaná fajfka (SVG 200 px) + text „Hotovo, vše proběhlo v pořádku." + „Budete u toho první." + odkaz zpět na hlavní stránku
- **Přesměrování:** nastaveno v SmartEmailing adminu → URL po odeslání formuláře = `https://corerestart.live/dekujeme-za-registraci` ✓ (ověřeno a funkční)

### Technické detaily fajfky
- SVG bez kruhového pozadí (kruh byl odstraněn – způsoboval velkou prázdnou plochu pod fajfkou)
- `viewBox="7 13 38 30"` – těsně ořezává jen tvar fajfky, žádné prázdné místo pod ní
- Animace: `pop-in` (scale) při načtení + `draw-check` (stroke-dashoffset) pro vykreslení čáry

---

## Exkluzivní nabídka (exkluzivni-nabidka.html)

Vytvořena 18. dubna 2026. Stránka pro členy FyzioKlubu s nabídkou 5 cvičebních výzev zdarma při prodloužení členství.

- **URL:** `corerestart.live/exkluzivni-nabidka` → route v `vercel.json`
- **Soubor:** `exkluzivni-nabidka.html`
- **Design:** barvy `#ffdddd`, `#000000`, `#ffcc00`, `#162438` – Open Sans (300–800)
- **Layout:** Hero sekce (navy) + 5 program bloků v alternujícím 2-sloupcovém gridu

**5 programů:**
1. Transformační FyzioVýzva (90 dní) – obrázek + bonusy (guma, jídelníčky, metabolická karta, meditace)
2. FyzioVýzva pro krční páteř (90 dní) – obrázek + bonusy (ke stolu, do postele, do auta)
3. FyzioVýzva pro seniory – obrázek + bonusy (chodidla/kolena/kyčle, spánek, chůze, lavička)
4. FyzioYóga 30+30 (60 dní) – obrázek + bonusy (videa pozic, CORE sestavy, e-mail průvodce)
5. FyzioVýzva pro chodidla, kolena a kyčle – **bez obrázku** (spouštění podzim 2026)
   → nahrazeno animovaným navy placeholderem s názvem tělesných částí a badgem "PODZIM 2026"

**Technické detaily:**
- Obrázky mají `position: sticky; top: 32px` na desktopu → obrázek zůstane na místě, text se scrolluje vedle
- Na mobilu sticky vypnuto, normální flow
- Obrázky v `/image/img-exkluzivni-nabidka/` – názvy s diakritikou, URL-encodovat při odkazování
- Scroll animace: `.fade-up` + IntersectionObserver

---

## Budoucí vylepšení (TODO)

- [ ] Schovat VIDEO_URL do Vercel environment variable místo hardcoded v HTML
      (volat `/api/video-url` endpoint – URL nebude viditelná ve zdrojovém kódu)
- [ ] Přidat produktový obrázek k FyzioVýzva pro chodidla, kolena a kyčle (podzim 2026)

---

## Deployment

### Custom Domain

- Primary domain: https://corerestart.live
- WWW redirect: https://www.corerestart.live → redirects to corerestart.live
- Domain registrar: Wedos.cz
- DNS configured on: April 4, 2026

DNS records set on Wedos.cz:
- A record: @ → 216.198.79.1
- CNAME record: www → 37d27d7c2851bbd5.vercel-dns-o17.com

The app is now accessible on both:
- https://corerestart.live (primary)
- https://corerestart-live.vercel.app (backup Vercel URL)

---

## Routování (vercel.json)

```json
{ "src": "/vysilani-1",               "dest": "/vysílání-1.html"         }
{ "src": "/vysilani-1/",              "dest": "/vysílání-1.html"         }
{ "src": "/dekujeme-za-registraci",   "dest": "/dekovaci-hlavni.html"    }
{ "src": "/dekujeme-za-registraci/",  "dest": "/dekovaci-hlavni.html"    }
{ "src": "/exkluzivni-nabidka",       "dest": "/exkluzivni-nabidka.html" }
{ "src": "/exkluzivni-nabidka/",      "dest": "/exkluzivni-nabidka.html" }
{ "src": "/",                         "dest": "/index.html"              }
```

- `corerestart.live/` → index.html (coming soon homepage)
- `corerestart.live/vysilani-1` → vysílání-1.html (fake livestream player)
- `corerestart.live/dekujeme-za-registraci` → dekovaci-hlavni.html (děkovací stránka po registraci)
- `corerestart.live/exkluzivni-nabidka` → exkluzivni-nabidka.html (nabídka 5 výzev pro členy FyzioKlubu)

---

## Homepage (index.html) – Coming Soon stránka

### Aktuální design (redesign 15. dubna 2026)

- **Font:** Open Sans (300, 400, 600, 700, 800) – Google Fonts
- **Barvy:** bílé pozadí `#ffffff`, černý text `#0f0f0f`, zlatý akcent `#f5c518`
- **Layout:** single-screen (jen první obrazovka, bez scrollování na desktopu)
- **Struktura:** Header + Hero – vše ostatní odstraněno

**Header:**
- Černé pozadí `#0f0f0f`
- Logo (`image/Logo-stredni.png`) + název + LIVE badge vlevo
- Tagline vpravo

**Hero – split layout (dvě poloviny):**
- Levá polovina: bílá, text „Připravujeme / pro vás" + odstavec + CTA tlačítko
- Pravá polovina: bílá, fotka `image/My dva nové.png` bez blend mode (zobrazena přirozeně)

**SmartEmailing formulář – modal popup:**
- CTA tlačítko „Zanechte nám e-mail" otevře modal overlay
- Modal obsahuje: popis + SmartEmailing embed script
- Zavření: tlačítko ×, klik mimo box, klávesa Escape
- Script ID: `11999-wf8mwxct48wvy4hapo8bryltt3uh2jaz5fohyyu2qqf3itfpxelgbire851eh5a2xbizpd2xdi26t1fo5wokexjn1ij7te1suv9a`

---

## Known Issue: SmartEmailing form styling

SmartEmailing (`web-forms-v2`) injektuje vlastní `<style>` tag dynamicky po načtení stránky.
Tento tag přichází v DOM **po** našem inline CSS, takže i naše `!important` pravidla prohrávají.
JavaScript `MutationObserver` + `setProperty('important')` byl vyzkoušen, ale SmartEmailing
může styly znovu přepsat po každém re-renderu komponenty.

**Závěr:** Nespoléhat na přebíjení SmartEmailing stylů. Pokud je nutná plná kontrola
nad designem formuláře, použít vlastní HTML formulář s fetch/XHR voláním na SmartEmailing API.
