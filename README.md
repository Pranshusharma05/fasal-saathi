# फसल साथी (Fasal Saathi) - Crop Yield Predictor

A farmer-friendly, mobile-first crop yield prediction web application designed specifically for Indian agriculture. It provides clear, plain-language yield forecasts in quintals, benchmarking against district historical averages with actionable agronomic advice.

---

## 🌟 Key Features

- **Hindi-First Bilingual UI**: Default Hindi interface with a one-tap English toggle in the header.
- **Mobile-First & Touch-Optimized**: Designed for 360px+ screens, big 48px+ touch hitboxes, large readable 18px base typography, and high outdoor contrast.
- **4-Step Intuitive Workflow**:
  1. **जगह (Location)**: State & cascading District selection (Punjab, Haryana, UP, Bihar, MP, Maharashtra).
  2. **फसल (Crop)**: Big visual cards with emojis (Wheat 🌾, Paddy 🌱, Maize 🌽, Cotton ☁️, Sugarcane 🎋, Mustard 🌼, Gram 🫘, Potato 🥔) and auto-selected season (Rabi, Kharif, Zaid).
  3. **खेत (Field)**: Land area input with live Acre ↔ Hectare conversion helper.
  4. **मिट्टी और खाद (Soil & Nutrients)**: Optional soil type cards, fertilizer usage scale, and collapsed Soil Health Card (N, P, K, pH) accordion.
- **Comprehensive Results Experience**:
  - Rating Badge (बहुत अच्छी, अच्छी, सामान्य, औसत से कम, ख़राब) with distinct color coding.
  - Farmer-centric unit display ("करीब 59 क्विंटल", "= 11.7 क्विंटल प्रति एकड़") with count-up animation.
  - Pure CSS/SVG comparison bar chart against the district average.
  - "ऐसा क्यों?" top 3 reasons with impact arrows.
  - "क्या करें?" actionable tips with Krishi Vigyan Kendra (KVK) helpline guidance.
  - 3-dot confidence meter with data source explanation.
  - One-tap WhatsApp sharing (`wa.me`) with pre-formatted bilingual message.
  - Recalculate and New Prediction workflows.
- **Testing All 5 Rating States**:
  - Floating **Demo Switcher** at the bottom-right for instant testing of all 5 rating states.
  - Supports URL parameter `?demo=great|good|normal|low|bad`.

---

## 🚀 How to Run

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Production Build**:
   ```bash
   npm run build
   ```

---

## 📂 Architecture

```
/
├── index.html                   # HTML entry point with Noto Sans Devanagari & Poppins fonts
├── src/
│   ├── main.tsx                 # React DOM root
│   ├── App.tsx                  # Main app container & view router
│   ├── index.css                # Tailwind CSS v4 setup & custom theme variables
│   ├── api/
│   │   ├── predict.ts           # Mock API layer returning realistic data after 2s delay
│   │   └── predict.js           # JS re-export
│   ├── data/
│   │   ├── options.ts           # States, districts, crops, seasons, soil options
│   │   └── options.js           # JS re-export
│   ├── utils/
│   │   ├── rating.ts            # Mathematical rating formulas and unit conversions
│   │   └── rating.js            # JS re-export
│   ├── translations/
│   │   └── index.ts             # Complete Hindi & English dictionaries
│   └── components/
│       ├── Header.tsx           # Accessible 3-zone top navigation & language toggle
│       ├── HomeHero.tsx         # Welcome hero, 3 step cards, trust strip
│       ├── PredictionForm.tsx   # 4-step wizard with sticky bottom navigation
│       ├── StepProgress.tsx     # Animated step progress indicator
│       ├── CropCard.tsx         # Tactile crop selection card
│       ├── SoilCard.tsx         # Visual soil type selection card
│       ├── LoadingScreen.tsx    # Rotating status animation
│       ├── ResultView.tsx       # Comprehensive results page
│       ├── RatingCard.tsx       # Colored rating card with count-up number
│       ├── ComparisonBar.tsx    # Pure CSS/SVG comparison chart
│       ├── ReasonList.tsx       # "ऐसा क्यों?" card with positive/negative indicators
│       ├── AdviceCard.tsx       # Actionable advisory & KVK contact card
│       ├── ConfidenceMeter.tsx  # 3-dot confidence indicator
│       ├── HowItWorksView.tsx   # Transparent explanation of methodology
│       ├── AboutView.tsx        # Mission and farmer support information
│       ├── DemoSwitcher.tsx     # Developer/tester rating state selector
│       └── WheatHeroIllustration.tsx # Lightweight SVG agricultural graphic
```
