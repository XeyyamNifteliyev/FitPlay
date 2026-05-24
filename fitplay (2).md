# 🏃 FitPlay — Hərəkətlə Oyna, Sağlam Qal

> **Kamera + Telefon/Planşet/Kompüter + TV = Evinizin Oyun Zalı**  
> MediaPipe · Three.js · Socket.io · WebRTC · Next.js

[![Tech](https://img.shields.io/badge/MediaPipe-Pose-blue)](https://mediapipe.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Avatar-black)](https://threejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-white)](https://socket.io/)
[![Multiplayer](https://img.shields.io/badge/Multiplayer-Online_PvP-red)]()
[![License](https://img.shields.io/badge/License-MIT-green)]()

---

## 📋 Məzmun

- [Layihə Haqqında](#-layihə-haqqında)
- [Oyun Seçim Ekranı](#-oyun-seçim-ekranı)
- [Oyun Rejimləri — Hamı üçün](#-oyun-rejimləri--hamı-üçün)
- [Qadınlar üçün Oyunlar](#-qadınlar-üçün-oyunlar-)
- [Kişilər üçün Oyunlar](#-kişilər-üçün-oyunlar-)
- [Uşaqlar üçün Oyunlar](#-uşaqlar-üçün-oyunlar-)
- [Multiplayer Sistemi](#️-multiplayer-sistemi)
- [Leaderboard və Mükafat Sistemi](#-leaderboard-və-mükafat-sistemi)
- [Cihaz Bağlantı Bələdçisi](#-cihaz-bağlantı-bələdçisi)
- [Texniki Arxitektura](#️-texniki-arxitektura)
- [Performans və Təhlükəsizlik](#-performans-və-təhlükəsizlik)
- [Gəlir Modelləri](#-gəlir-modelləri)
- [Quraşdırma](#-quraşdırma)
- [Roadmap](#-roadmap)
- [AI Alətləri ilə İnkişaf](#-ai-alətləri-ilə-inkişaf)

---

## 🚀 Layihə Haqqında

**FitPlay** — Heç bir əlavə cihaz almadan, sadəcə smartfonunuz, planşetiniz və ya kompüteriniz vasitəsilə evdə interaktiv idman edə biləcəyiniz, həm yerli həm də onlayn rəqabət apara biləcəyiniz veb-əsaslı hərəkət platformasıdır.

### 🎯 Hədəf Kütlə

| Qrup | Sevdikləri Oyunlar |
|---|---|
| 👩 Qadınlar | Subway Runner, Zumba, Pilates, Hula Hoop, Jump Rope |
| 👨 Kişilər | Boks PvP, Futbol Penaltı, Sumo Döyüşü, Subway Runner |
| 👶 Uşaqlar | Balon Partlatma, Heyvan Oyunu, Rəng Avcısı, Dans |
| 👨‍👩‍👧 Ailələr | Co-op Subway Runner, Ailə Dansı, Turnir |

---

## 🎮 Oyun Seçim Ekranı

İstifadəçi sayta girəndə ilk gördüyü şey **Oyun Seçim Ekranıdır.** Heç bir qeydiyyat olmadan birbaşa oyna.

```
┌─────────────────────────────────────────────────────────┐
│                    🏃 FitPlay                           │
│           Hansı oyunu oynamaq istəyirsən?               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   👩 QADINLAR             👨 KİŞİLƏR                   │
│   ───────────             ──────────                   │
│   🏃 Subway Runner        🥊 Boks PvP                  │
│   💃 Zumba Dance          ⚽ Futbol Penaltı             │
│   🌀 Hula Hoop            🥋 Sumo Döyüşü               │
│   🎀 Jump Rope            🏃 Subway Runner              │
│   🧘 Pilates Flow         🎯 Reflex Hədəf               │
│   🫧 Bubble Pop           🤼 Güləş                      │
│                                                         │
│   👶 UŞAQLAR              🌍 HAMISI ÜÇÜN               │
│   ─────────               ──────────────               │
│   🎈 Balon Partlatma      👨‍👩‍👧 Ailə Yarışı              │
│   🐾 Heyvan Yamsılama     📅 Gündəlik Çağırış           │
│   🌈 Rəng Avcısı          🏆 Turnir                    │
│   🎵 Dans Dans Dans       📊 Leaderboard               │
│                                                         │
└─────────────────────────────────────────────────────────┘

Seçim sonrası: Solo oyna | Dosta link göndər | Liderlik cədvəli
```

### Oyun Seçim UI Davranışı

```javascript
// Oyun kartları
const GAMES = [
  {
    id: 'subway_runner',
    title: 'Subway Runner',
    emoji: '🏃',
    category: ['women', 'men', 'all'],
    difficulty: 'easy',
    players: '1–2',
    duration: '∞',
    description: 'Qaç, tullan, əy — nə qədər uzaq gedə bilərsən?',
    tags: ['cardio', 'popular', 'multiplayer']
  },
  {
    id: 'zumba_dance',
    title: 'Zumba Dance',
    emoji: '💃',
    category: ['women'],
    difficulty: 'medium',
    players: '1–4',
    duration: '3–10 dəq',
    description: 'Latın ritmlərindən Azərbaycan musiqisinə — rəqs et, kökəl!',
    tags: ['dance', 'music', 'fun']
  },
  // ... digər oyunlar
]

// Filter sistemi
function filterGames(category) {
  return GAMES.filter(g =>
    g.category.includes(category) || g.category.includes('all')
  )
}
```

---

## 🏃 Oyun Rejimləri — Hamı üçün

### 🚇 Subway Runner (Əsas Oyun — Subway Surfers Stilində)

Bu oyunun **ürəyidir.** Hərəkət fiziki olaraq sənin bədəninlə idarə olunur.

```
SUBWAY RUNNER HƏRƏKƏT XƏRİTƏSİ:
─────────────────────────────────

  REAL HƏRƏKƏT              → OYUNDA NƏ BAŞ VERİR
  ──────────────               ──────────────────
  İki dizini qaldır          → Tullanmaq (maneəni aşmaq)
  Squat (çömək)              → Aşağı keçid (tunneldən keçmək)
  Sola əymək (bel)           → Sol xəttə keçid
  Sağa əymək (bel)           → Sağ xəttə keçid
  Sol əli uzatmaq            → Sol sürpriz qutusu toplamaq
  Sağ əli uzatmaq            → Sağ sürpriz qutusu toplamaq
  Hər iki əli yuxarı qaldır → Super güc aktivləşmə (magnet, kalkıcı)
  Əylənmək / gülümsəmək*    → Easter egg — bonus xal (*face detection)

FIZIKI EFFEKT:
  Bir raund ≈ 5–15 dəqiqə qaçış
  Kalori: ~80–150 kal/raund
  Kardio effekti: Orta intensivlik
```

```
OYUN DÜNYASI (Subway Surfers-dən İLHAM, orijinal dizayn):
  
  🏙️ Bakı metrosu mövzusu
     → Xalça naxışlı divarlar
     → Qobustan qaya rəsmləri (fon dekorları)
     → Azərbaycan bayrağı rəngləri (xarakter geyimi)
  
  Digər mövzular (açılabilir):
  🕌 Qədim İçərişəhər
  🌊 Xəzər sahili
  🏔️ Böyük Qafqaz
  🌃 Gecə Bakısı
```

```javascript
// Subway Runner hərəkət aşkarlama
const subwayGestures = {
  jump: (prev, curr) => {
    const hipLift = prev.LEFT_HIP.y - curr.LEFT_HIP.y
    const kneeAngle = calcAngle(curr.LEFT_HIP, curr.LEFT_KNEE, curr.LEFT_ANKLE)
    return hipLift > 0.06 && kneeAngle < 150
  },

  slide: (prev, curr) => {
    const hipDrop = curr.LEFT_HIP.y - prev.LEFT_HIP.y
    return hipDrop > 0.05
  },

  moveLeft: (curr) => {
    const torsoTilt = curr.LEFT_SHOULDER.x - curr.RIGHT_SHOULDER.x
    return torsoTilt > 0.08  // sola əyilmə
  },

  moveRight: (curr) => {
    const torsoTilt = curr.RIGHT_SHOULDER.x - curr.LEFT_SHOULDER.x
    return torsoTilt > 0.08
  },

  collectLeft: (curr) => {
    return curr.LEFT_WRIST.x < curr.LEFT_SHOULDER.x - 0.15
  },

  superPower: (curr) => {
    return curr.LEFT_WRIST.y < curr.NOSE.y &&
           curr.RIGHT_WRIST.y < curr.NOSE.y
  }
}
```

**Multiplayer Subway Runner:**
```
İki oyunçu eyni xəttdə qaçır:
→ P1 solu, P2 sağu idarə edir
→ Kim daha çox məsafə qət edir?
→ Real-time bal müqayisəsi ekranın üstündə
→ Rəqib düşəndə: confetti + "Sen qazandın! 🎉"
```

---

## 👩 Qadınlar üçün Oyunlar 💃

### 💃 Zumba Dance — Rəqs Edərək Kökəl

```
MEXANIKA:
  Ekranda 3D rəqs müəllimi (avatar) hərəkəti əvvəlcədən göstərir
  İstifadəçi eyni hərəkəti edir
  MediaPipe oxşarlığı % ilə qiymətləndirir
  
  80%+ uyğunluq → "Əla! +50 XP" + yanıb-sönən effekt
  60-80%        → "Yaxşı! +30 XP"
  60%-dən az    → "Daha bir daha cəhd et! 💪"

MUSİQİ PARKETLƏRİ:
  💃 Latin / Salsa paketi
  🪗 Azərbaycan xalq rəqsləri (Qaytağı, Yallı)
  🎵 Pop hits (Top 40)
  🕉️ Bollywood Bhangra
  
FIZIKI EFFEKT:
  30 dəqiqə Zumba ≈ 300–500 kalori
  Tam bədən əzələ işi
  Ürək döyüntüsü: orta-yüksək intensivlik

MULTIPLAYER:
  Eyni mahnıda 2–4 nəfər rəqs edir
  Kim daha sinxron? → XP + kupon
```

### 🌀 Hula Hoop — Bel Döyürəcini Fırlat

```
MEXANIKA:
  İstifadəçi belini dairəvi hərəkətlə döndürür
  MediaPipe bel koordinatının dairəvi trayektoriyasını izləyir
  Dairə tam deyilsə → avatar hula hoop-u buraxır
  Ritm saxlandıqca → tezlik artar, bal artır

AŞKARLAMA:
  hip_x sin dalğası: ~0.3 Hz başlayır, 1 Hz-ə qədər sürətlənir
  Radius tutarlılığı: variasiya < 20%

FIZIKI EFFEKT:
  Bel, yan, qarın əzələləri
  10 dəqiqə ≈ 100 kalori
  
VİZUAL EFFEKT:
  Avatar ətrafında parlayan hula hoop
  Rəng: sürət artdıqca göydən qırmızıya keçir
  Partlama effekti rekord qırılanda
```

### 🎀 Jump Rope — Zıplama İpi

```
MEXANIKA:
  İstifadəçi yerindəcə tullanır
  MediaPipe hip-in yuxarı-aşağı ritmini izləyir
  Ekranda virtual ip döndürülür
  İpin ritminə uyğun tullanmasan → "ip ayağa dolaşdı"

REJİMLƏR:
  🕐 Vaxt rejimi — 60 saniyədə neçə tullanma?
  🏆 Rekord rejimi — şəxsi rekordu qır
  🎵 Ritm rejimi — musiqi tempinə uyğun tulla

ÇOXLU MƏRHƏLƏLƏR:
  Seviyyə 1: Sadə tullanma (ağır ip)
  Seviyyə 2: İkiqat tullanma (ip daha sürətli)
  Seviyyə 3: Çarpaz ip (çox çətin!)

FIZIKI EFFEKT:
  1 dəqiqə = 10–15 kalori
  Ayaqlar, baldır, ürək
```

### 🧘 Pilates Flow — Axıcı Hərəkət

```
MEXANIKA:
  Ekranda ideal poz göstərilir (30 saniyə saxla)
  MediaPipe əyrilik açısını ölçür
  Real-time feedback arrow-larla:
    → "Sol qolunu 10° yuxarı"
    → "Kürəyini daha düz tut"
    → "Nəfəs al, relax ol"
  
  Poz kamil saxlananda: yaşıl halo effekti + saydac

POZ KATEQORİYALARI:
  🌅 Səhər rutini (10 dəq) — yüngül açılma
  💪 Güc axışı (20 dəq) — karın, bel, bud
  🌙 Gecə gərmə (15 dəq) — relaksasiya

BONUS:
  Duruş korreksiyası: "Çiyinlərini geri çək"
  Nəfəs xatırlatması hər 2 dəqiqədə
  
FIZIKI EFFEKT:
  Əzələ uzanması, balans, çeviklik
  Arxalıq ağrısını azaldır
  Stres azalması
```

### 🫧 Bubble Pop — Baloncuq Partlatma

```
MEXANIKA:
  Ekranda müxtəlif yerlərdə rəngli baloncuqlar uçur
  İstifadəçi əlləri ilə baloncuqlara "çatır"
  MediaPipe biləyin koordinatı baloncuğa toxunarsa → partlar
  
  Xüsusi baloncuqlar:
  🟡 Qızıl → 3x xal
  ❄️ Buz   → Vaxtı 5 saniyə dondurur
  💣 Bomba → Vurma! (xal azalır)
  🌈 Göy qurşağı → Bütün ekranı partladır

MUSİQİ SİNXRONİZASİYASI:
  Baloncuqlar musiqi ritminə görə çıxır
  Beat-ə uyğun vurulsa → bonus xal

FIZIKI EFFEKT:
  Yüngül, əyləncəli
  Çiyin, qol, koordinasiya
  Yaşlılar + uşaqlar üçün ideal
```

### 🎀 Ribbon Dance — Lent Rəqsi

```
MEXANIKA:
  Hər iki əldə virtual lentlər dalğalanır
  Xüsusi hərəkət nümunələrini izlə:
    ∞ səkkiz şəkli → +100 XP
    dairə hərəkəti → +50 XP
    dalğa hərəkəti → +30 XP
  Ritmik hərəkət kombinasiyaları
  
VIZUAL:
  Rəngli iz effekti hər biləyin arxasından
  Çox rəngli parıldayan lentlər
  Ekran rəqsin gözəlliyinə görə rəng dəyişir

FIZIKI EFFEKT:
  Qol, çiyin, boyun əzələləri
  Balans, koordinasiya
  Çox estetik, sosial mediaya paylaşmaq üçün ideal
```

---

## 👨 Kişilər üçün Oyunlar 🥊

### 🥊 Boks PvP — Onlayn Döyüş

```
MEXANIKA (Solo):
  Ekranda hədəflər çıxır:
  🔴 Qırmızı hədəf → Sağ yumruq
  🔵 Mavi hədəf   → Sol yumruq
  ⚡ Sürüşən hədəf → Sürətli kombinasiya lazımdır
  🛡️ Qalxan işarə → Blok et (hər iki əli üzdən yuxarı tut)

AŞKARLAMA:
  Biləyin sürət vektoru > threshold → zərbə sayılır
  Yumruğun güc hesablaması:
    velocity × acceleration × arm_extension = damage

MULTIPLAYER PvP:
  İki oyunçu real-time döyüşür
  Hər zərbə rəqibin HP-sini azaldır
  Blok → zərəri 70% azaldır
  Kombolar: Jab → Cross → Hook → Uppercut → SUPER COMBO!
  
  HP sistemi: 100 HP, kim sıfırlanar, uduzur
  Round: 3 dəqiqə × 3 raund

FIZIKI EFFEKT:
  Tam bədən — qol, çiyin, bel rotasiyası, ayaq işi
  HIIT effekti — 15 dəq ≈ 200 kalori
  Stress atmaq üçün ideal
```

### ⚽ Futbol Penaltı — Nöbəti Penaltı

```
MEXANIKA:
  2 nəfər oynayır: Penaltçı ↔ Qapıçı (nöbəti dəyişir)

  PENALTÇİ:
    Real topu vurur kimi bədənlə hərəkət edir
    MediaPipe ayaq hərəkətini izləyir (kick gesture)
    Tir istiqaməti = ayağın hərəkət istiqaməti
    Sol alt → sağ yuxarı kimi yarı-cazibədar hərəkətlər

  QAPİÇİ:
    Yana tullanır (bədənini yana atar)
    Sağa əgilmə → qapıçı sağa atılır
    Sola əgilmə → qapıçı sola atılır
    Yuxarı uzanmaq → yuxarı qurtarır

RAUND STRUKTURU:
  Penaltı seriyası: 5 zərbə hər tərəfdən
  Bərabər qalsa → Sudden Death (nöbəti zərbə həlledici)
  
VIZUAL:
  Qapıçı PVP → hər ikisi öz ekranında tam ölçülü görür
  Ləng çəkim — top şəbəkəyə girəndə / qurtarılanda
  Azərbaycan milli komanda forması seçimi

FIZIKI EFFEKT:
  Penaltçı: Ayaq, bud, bel rotasiyası
  Qapıçı: Çiyin, bel, sürətli yana atılma
```

### 🥋 Sumo Döyüşü

```
MEXANIKA:
  İki oyunçu virtual dairənin içindədir
  Xüsusi hərəkətlər:
    → Əlləri öndə uzatmaq = itələmə
    → Yana addım = yanlama
    → Squat = aşağı duruş (müdafiə)
    → İrəli hücum = qaçmaq kimi irəli əymə
  
  Rəqibi dairədən çıxartsan → qazanırsan
  Birinciyə çatan 3 qazanc qalibi müəyyən edir

FIZIKI EFFEKT:
  Gövdə gücü, balans, ayaq-qol koordinasiyası
  Əyləncəli, heç vaxt ağır gəlmir
```

### 🎯 Reflex Hədəf — Sürətin Sınağı

```
MEXANIKA:
  Ekranda 9 hücrəli şəbəkə var (3×3)
  Hücrələr işıqlanır → müvafiq bədən hissəsini ora yönəlt
    Sol üst    → Sol əlini yuxarı sol künəkə uzan
    Sağ orta   → Sağ əlini sağa uzat
    Aşağı mərkəz → Çöm
  
  Sürət artdıqca işıqlanma tezliyi artır
  Ardıcıl 10 uğurlu → Combo Mode (xal ×3)

MULTIPLAYER: Kim daha sürətli reaksiya verir?
```

### 🤼 Güləş (Wrestling)

```
MEXANIKA:
  2 nəfər rəqabəti
  Hücum hərəkətləri: qucaqlamaq (hər iki qolu öndə uzat)
  Müdafiə: geri çəkilmə, yan çevirmə
  HP sistemi: Uğurlu hücum → rəqibin HP-si azalır
  3 raund, hər raund 2 dəqiqə
```

---

## 👶 Uşaqlar üçün Oyunlar 🎈

### 🎈 Balon Partlatma

```
MEXANIKA:
  Havada uçan rəngli balonlar
  Əllərinlə partlat → xal qazan
  Xüsusi balonlar: qızıl (×5), bomba (qaç!), göy qurşağı (hamısını partlat)
  Musiqi ritminə uyğun baloncuqlar — əyləncəli vizual effekt
  
İDEAL YAŞ: 4–12
FIZIKI: Yüngül, koordinasiya, əl-göz sinxronizasiyası
```

### 🐾 Heyvan Yamsılama

```
MEXANIKA:
  Ekranda heyvan görünür
  Uşaq həmin heyvanın hərəkətini yamsılayır:
    🦋 Kəpənək  → Qolları dalğalandır (uç!)
    🐸 Qurbağa  → Çöm və tullan
    🦁 Aslan    → Dörd ayaq üstündə irəli get
    🐍 İlan     → Bədənini dalğalandır
    🦘 Kenquru  → Geniş tullanmalar
    🐘 Fil      → Ağır addımlarla irəli get (qollar sallanır)
  
  Uyğunluq % → "Əla! Sən həqiqi aslansan! 🦁"
  
İDEAL YAŞ: 3–9
FIZIKI: Bütün bədən, əyləncəli, güldürücü
```

### 🌈 Rəng Avcısı

```
MEXANIKA:
  Ekranda rəngli dairələr uçur
  Əmr: "Yalnız mavi dairələri vur!" 
  Uşaq əlləri ilə doğru rəngdəkilərə toxunur
  Yanlış rəngə toxunarsa → xal azalır
  Sürət tədricən artır
  
İDEAL YAŞ: 4–10
ÖYRƏDICI: Rənglər, diqqət, reaksiya sürəti
```

### 🎵 Dans Dans Dans — Uşaqlar üçün

```
MEXANIKA:
  Ekranda sevimli animasiya personajı rəqs edir
  Uşaq eyni hərəkəti edir
  Azərbaycan uşaq mahnıları + beynəlxalq uşaq hitləri
  Çox rəngli effektlər, ulduz yağışı
  
İDEAL YAŞ: 3–12
```

---

## ⚔️ Multiplayer Sistemi

### Lokal Co-op (Eyni TV, İki Telefon)

```
Subway Runner Co-op:
  P1 + P2 paralel xətdə qaçır, bir-birinə kömək edir
  P1 düşəndə P2 "can" verə bilər (bir anlıq dayandıraraq)

Boks PvP Lokal:
  Hər ikisi öz telefonunda hərəkət edir
  TV-də iki avatar üz-üzə

Futbol Penaltı Lokal:
  Eyni TV, nöbəti dəyişir
```

### Online PvP (Fərqli Evlər)

```
┌─────────────────┐                    ┌─────────────────┐
│   Nəfər 1 evi   │                    │   Nəfər 2 evi   │
│  📱 → 📺        │  ←── Server ──→   │  📱 → 📺        │
│  Öz avatarı +   │                    │  Öz avatarı +   │
│  rəqib avatarı  │                    │  rəqib avatarı  │
└─────────────────┘                    └─────────────────┘

Hər oyunçu özünün ekranında oyunun eyni vəziyyətini görür.
Koordinatlar real-time sinxronizasiya edilir.
```

### Gecikmə İdarəetməsi

```
Eyni Wi-Fi → WebRTC P2P:  ~10–30ms  🟢 Mükəmməl
Eyni Wi-Fi → Socket.io:   ~30–60ms  🟢 Yaxşı
Online PvP → Server:      ~80–150ms 🟡 Hiss olunur, işləyir
```

```javascript
// Lag compensation — öz hərəkətin anında görünür
class LagCompensation {
  applyLocalPose(landmarks) {
    avatar.p1.update(landmarks)          // sıfır gecikmə
  }
  applyRemotePose(landmarks, timestamp) {
    this.buffer.push({ landmarks, timestamp })
    const smooth = interpolateBuffer(this.buffer, 100) // 100ms buffer
    avatar.p2.update(smooth)
  }
}
```

---

## 🏆 Leaderboard və Mükafat Sistemi

### Leaderboard Strukturu

```
HƏFTƏLIK LEADERBOARD — Subway Runner
─────────────────────────────────────
🥇 1.  Leyla H.     ████████████ 12,400 m  → 50 AZN kupon
🥈 2.  Əli M.       ██████████   10,200 m  → 30 AZN kupon
🥉 3.  Nigar Q.     █████████     9,800 m  → 20 AZN kupon
   4.  Rauf Ə.      ████████      8,500 m  → 10 AZN kupon
   5–10. ...                       ...     →  5 AZN kupon
─────────────────────────────────────
   Sənin yerin: #47 → 3,200 m
   TOP 10 üçün: 5,300 m daha lazımdır
```

### Leaderboard Növləri

| Növ | Müddət | Mükafat | Sıfırlanma |
|---|---|---|---|
| 🔥 Həftəlik | 7 gün | Kupon | Bazar ertəsi |
| 📅 Aylıq | 30 gün | Böyük kupon | Ayın 1-i |
| 🌍 All-time | Heç vaxt | Hall of Fame | Sıfırlanmır |
| ⚔️ PvP Rating | Davamlı | Rütbə badge | Mövsüm sonu |
| 🎮 Oyun üzrə | Hər oyun | Oyun xüsusi | Həftəlik |

### Bal Sistemi (XP)

```javascript
const XP_REWARDS = {
  // Oyun nəticəsi
  game_complete:    50,
  perfect_score:   100,
  new_highscore:    75,
  pvp_win:         150,
  pvp_loss:         30,
  combo_x10:        25,

  // Sadiqlik
  daily_login:      10,
  streak_3:         30,
  streak_7:        100,
  streak_30:       500,

  // Sosial
  refer_friend:    200,
  share_result:     20,
}
```

### Kupon Sistemi

```
KUPON NÖVLƏRİ:
  TOP 1:   50 AZN — İdman mağazası / sağlamlıq brendindən
  TOP 2:   30 AZN
  TOP 3:   20 AZN
  TOP 4–5: 10 AZN
  TOP 6–10: 5 AZN
  30 Gün Streak: 5 AZN (hamıya, TOP olmadan da)

KUPON KODU FORMATI: FIT-2025-X7K9
E-mail ilə avtomatik göndərilir
Müddət: 2 həftə
```

```javascript
// Həftəlik mükafat — hər Bazar ertəsi 00:00
cron.schedule('0 0 * * 1', async () => {
  const top10 = await getWeeklyTop10()
  top10.forEach((user, index) => {
    issueCoupon(user.id, index + 1)
  })
  await resetWeeklyScores()
})
```

---

## 📱 Cihaz Bağlantı Bələdçisi

### Dəstəklənən Cihazlar

| Cihaz | Bağlantı | Xüsusiyyət |
|---|---|---|
| 📱 Smartfon | QR Kod | Ən rahat, tövsiyə edilir |
| 📟 Planşet | QR Kod | Böyük ekran, daha rahat |
| 💻 Noutbuk/PC | Manual Room ID | QR oxutmaq lazım deyil |
| 📺 Smart TV | Display tərəfi | Yalnız görüntü |

### Bağlantı Üsulları

```
📱 TELEFON / PLANŞET:
  1. TV-də fitplay.az/display aç
  2. Telefonda fitplay.az/join aç → "QR Skan et"
  3. TV-dəki QR-a tut → Avtomatik bağlanır ✅

💻 KOMPÜTER (3 variant):
  A) Manual ID: TV-dəki 6 rəqəmli kodu kompüterdə yaz
  B) Telefon QR oxuyur, kompüter həmin kodu yazır
  C) Solo rejim: fitplay.az/solo — TV lazım deyil

👥 İKİ TELEFON EYNI ANDA:
  Hər ikisi eyni Room ID-yə qoşulur
  Server avtomatik P1/P2 rollarını təyin edir
```

---

## 🏗️ Texniki Arxitektura

### Tam Sistem

```
[Telefon / Planşet / Kompüter]
  MediaPipe Pose (CİHAZDA — video serverə GETMIR)
  → 33 keypoint JSON
       │
       ▼
[Socket.io Server — Node.js]
  Room idarəsi · Leaderboard · Kupon · Multiplayer sync
       │
  ┌────┴────────────────┐
  │                     │
[TV 1 — Three.js]    [TV 2 — Three.js]
 P1 avatar +          P2 avatar +
 P2 shadow            P1 shadow

[PostgreSQL + Redis]
 İstifadəçi · XP · Leaderboard · Kuponlar
```

### Tech Stack

| Qat | Texnologiya | Məqsəd |
|---|---|---|
| Pose Detection | MediaPipe Pose JS | 33 keypoint, cihazda işlənir |
| 3D Render | Three.js | Avatar, oyun dünyası |
| Realtime | Socket.io + WebRTC | P2P lokal, server online |
| Backend | Node.js + Express | API, room, auth |
| Database | PostgreSQL + Redis | Data + real-time state |
| Deploy | Vercel + Railway | Frontend + server |
| CDN/SSL | Cloudflare | Sürət + təhlükəsizlik |

---

## 🔐 Performans və Təhlükəsizlik

### Performans

```javascript
// 30 FPS throttle — lazımsız trafik yoxdur
let lastSend = 0
function onPoseResults(results) {
  if (Date.now() - lastSend < 33) return
  lastSend = Date.now()
  socket.emit('pose', compress(results.poseLandmarks))
}

// Koordinatları sıxışdır (video deyil, rəqəmlər)
// Video: 1–5 MB/s → Koordinatlar: <1 KB/s (5000x az!)
function compress(landmarks) {
  return landmarks.map(l => [
    +(l.x.toFixed(3)), +(l.y.toFixed(3)), +(l.visibility.toFixed(2))
  ])
}
```

### Təhlükəsizlik

```
✅ Kamera görüntüsü serverə GETMİR
✅ Yalnız rəqəmlər (koordinatlar) ötürülür — GDPR uyğun
✅ HTTPS + WSS (şifrəli)
✅ Room ID 5 dəqiqədən sonra bağlanır
✅ Rate limiting: saniyədə max 60 event/socket
✅ Input validation, XSS, injection qoruması
```

---

## 💰 Gəlir Modelləri

### Ümumi Baxış

| Model | Başlanğıc | 1,000 istifadəçi | 10,000 istifadəçi |
|---|---|---|---|
| Reklam | 0 AZN | ~150 AZN/ay | ~1,500 AZN/ay |
| Freemium | Ay 3-dən | ~300 AZN/ay | ~3,000 AZN/ay |
| Brend kupon | Ay 4-dən | ~400 AZN/ay | ~4,000 AZN/ay |
| Məktəb lic. | Ay 6-dan | ~500 AZN/ay | ~2,000 AZN/ay |
| Turnir | Ay 5-dən | ~200 AZN/ay | ~800 AZN/ay |

### Freemium

| Xüsusiyyət | Pulsuz | Premium (2.99 AZN/ay) |
|---|---|---|
| Oyun rejimləri | 4 oyun | Hamısı (12+ oyun) |
| Avatarlar | 1 standart | 15+ avatar |
| Mövzular (Subway) | 1 (Bakı metro) | 4 mövzu |
| Reklam | Var | Yoxdur |
| Leaderboard mükafatı | ✅ | ✅ |
| Ailə rejimi (4 nəfər) | Yoxdur | ✅ |
| AI məşqçi | Yoxdur | ✅ |

### Brend Kupon Sistemi (Ən Ağıllı Model)

```
SƏN: Ödənişsiz kupon paylaşırsın
BREND: Kuponun dəyərini ödəyir + reklam haqqı
İSTİFADƏÇİ: Pulsuz mükafat alır, xoşbəxt olur

Nümunə:
  İdman mağazası ilə anlaşma:
  → Həftəlik TOP 10-a 50 AZN dəyərli kuponlar
  → Mağaza hər kupon üçün sənə 10 AZN ödəyir
  → Həftəlik 10 kupon × 10 AZN = 100 AZN/həftə
  → Aylıq: ~400 AZN yalnız bir brenddən
```

> 💡 **Başlanğıc stratejiyası:** Ay 1–2: reklam yox, istifadəçi qur. Ay 3: AdSense əlavə et. Ay 4: Premium oyunlar. Ay 5: Brend kupon anlaşması. Ay 6: Məktəb lisenziyası.

---

## 🚀 Quraşdırma

```bash
git clone https://github.com/yourusername/fitplay.git
cd fitplay && npm install
cp .env.example .env.local
npm run db:migrate
npm run server   # Socket.io
npm run dev      # Frontend
```

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
DATABASE_URL=postgresql://user:pass@localhost:5432/fitplay
REDIS_URL=redis://localhost:6379
RESEND_API_KEY=re_...
JWT_SECRET=your_secret
```

---

## 📈 Roadmap

### ✅ MVP (Ay 1–2)

- [ ] Socket.io server + QR + manual Room ID bağlantısı
- [ ] MediaPipe Pose (telefon, planşet, kompüter)
- [ ] Subway Runner — tullanma, çömə, sol/sağ
- [ ] Kalibrasiya ekranı
- [ ] Oyun seçim ekranı (UI)
- [ ] Lokal Co-op (iki telefon)

### 🔄 Alpha (Ay 2–3)

- [ ] 3D avatarlar (Mixamo-dan)
- [ ] Bakı metro mövzusu (Subway Runner)
- [ ] Boks PvP (lokal)
- [ ] Bal sistemi + XP
- [ ] Balon Partlatma (uşaqlar üçün)

### 🚀 Beta (Ay 3–4)

- [ ] Online PvP + lag compensation
- [ ] Zumba Dance (Azərbaycan mahnıları paketi)
- [ ] Futbol Penaltı
- [ ] Leaderboard + kupon e-mail sistemi
- [ ] AdSense inteqrasiyası
- [ ] Hula Hoop, Jump Rope

### 🌟 v1.0 (Ay 5–6)

- [ ] Bütün 12 oyun rejimi tamamlanmış
- [ ] Premium abunə sistemi
- [ ] Brend kupon inteqrasiyası
- [ ] Pilates Flow + AI feedback
- [ ] Heyvan Yamsılama, Rəng Avcısı

### 🌍 v2.0 (Ay 7–12)

- [ ] Turnir sistemi + ödənişli iştirak
- [ ] Mobil tətbiq (React Native)
- [ ] Sosial paylaşım (gameplay highlight kliplər)
- [ ] Çoxdilli (AZ, RU, EN, TR)
- [ ] Məktəb lisenziya paneli

---

## 🤖 AI Alətləri ilə İnkişaf

| Mərhələ | AI Aləti | Nə üçün? |
|---|---|---|
| Kod | **Gemini 2.5 Pro** (OpenCode) | Server, multiplayer, oyun məntiqi |
| Kod | **Cursor** | IDE assistant |
| 3D Model | **Meshy.ai** | Personaj yaratma |
| Animasiya | **DeepMotion** | Video → 3D animasiya |
| Musiqi analiz | **Essentia.js** | Musiqi ritmi aşkarlama (Zumba) |
| Dizayn | **Google Stitch** | UI komponentlər |

### Subway Runner üçün OpenCode Promptu

```
Subway Surfers stilində fiziki hərəkətlə idarə olunan oyun qurmaq istəyirəm.

Controller (telefon): MediaPipe Pose ilə bu hərəkətləri aşkarla:
  - Tullanma: hip_y azalır + diz bükülür
  - Çömə (slide): hip_y artır
  - Sola əymə: bel sola tilts
  - Sağa əymə: bel sağa tilts
  - Sol əl uzatma: sol biləy sol çiyindən kənarda
  - Sağ əl uzatma: sağ biləy sağ çiyindən kənarda

Display (TV): Three.js ilə:
  - Sonsuz manej yolu (procedural generation)
  - 3 xətt (sol, mərkəz, sağ)
  - Maneələr: üstdən keçilən, altdan keçilən, yanlama
  - Toplanacaq əşyalar: sikkə, güc, xüsusi

Multiplayer: İki oyunçu parallel xətdə, real-time bal müqayisəsi

İlk addım: Tullanma hərəkəti aşkarlayan + ekranda cubun tullandığı minimal demo.
```

---

## 📁 Layihə Strukturu

```
fitplay/
├── apps/
│   ├── display/
│   │   ├── games/
│   │   │   ├── subway-runner/    # Əsas oyun
│   │   │   ├── boxing/           # Boks PvP
│   │   │   ├── zumba/            # Dans
│   │   │   ├── penalty/          # Futbol
│   │   │   ├── hula-hoop/        # Hula hoop
│   │   │   ├── jump-rope/        # Zıplama ipi
│   │   │   ├── pilates/          # Pilates/Yoga
│   │   │   ├── bubble-pop/       # Baloncuk
│   │   │   ├── sumo/             # Sumo
│   │   │   ├── ribbon-dance/     # Lent rəqsi
│   │   │   ├── animal-mimic/     # Heyvan yamsılama
│   │   │   └── color-catcher/    # Rəng avcısı
│   │   ├── game-select.js        # Oyun seçim ekranı
│   │   ├── avatar.js             # Three.js skeleton
│   │   └── multiplayer.js        # PvP sinxronizasiya
│   └── controller/
│       ├── mediapipe.js          # Pose detection
│       ├── calibration.js        # Kalibrasiya
│       ├── qr-scanner.js         # QR oxuma
│       └── gesture-router.js     # Hərəkəti uyğun oyuna yönləndir
├── server/
│   ├── rooms.js                  # Room idarəsi
│   ├── leaderboard.js            # XP + sıralama
│   ├── coupons.js                # Kupon sistemi
│   └── cron.js                   # Həftəlik mükafat
└── packages/
    └── gestures/
        ├── subway.js             # Subway hərəkətləri
        ├── boxing.js             # Boks hərəkətləri
        ├── dance.js              # Dans uyğunluğu
        ├── penalty.js            # Top vuruş
        └── lag-compensate.js     # Online PvP
```

---

<div align="center">

**Heç nə al. Heç nə yüklə. Sadəcə hərəkət et. 🏃**

*Qaç · Rəqs et · Döyüş · Geri dön · Yenidən qaç*

*Qadınlar üçün 💃 · Kişilər üçün 🥊 · Uşaqlar üçün 🎈 · Ailə üçün 👨‍👩‍👧*

</div>
