# Premium Shop Bot

Professional **Telegram Premium sotuvchi bot** — Node.js, [Telegraf](https://telegraf.js.org/), MongoDB (Mongoose) asosida, toza **MVC** arxitekturasida yozilgan. Majburiy obuna, referal tizimi, balans, pul yechish, ticket (qo'llab-quvvatlash) va to'liq **admin panel** bilan.

## ✨ Imkoniyatlar

- **Majburiy obuna** — 2 ta kanalga obuna majburiy, avtomatik tekshiriladi.
- **Asosiy menyu** — Reply keyboard: Premium sotib olish, Profil, Referal, Kabinet, Pul yechish, Admin bilan bog'lanish.
- **Premium sotib olish** — 3 / 6 / 12 oylik tariflar; to'lov usullari: **Click, Payme, Uzum Bank, Telegram Stars** va balansdan to'lash.
- **Profil** — Telegram ID, username, balans, referallar soni, xaridlar, ro'yxatdan o'tgan sana.
- **Referal tizimi** — har bir foydalanuvchi uchun `?start=<id>` havola, har taklif uchun bonus, statistika.
- **Kabinet** — balans, referal daromad, xaridlar tarixi, to'lovlar tarixi, pul yechishlar.
- **Pul yechish** — karta + summa → adminga so'rov → tasdiqlansa balansdan yechiladi.
- **Ticket tizimi** — foydalanuvchi adminga yozadi, admin javob beradi, foydalanuvchiga yetkaziladi.
- **Admin panel** — statistika, foydalanuvchilar, balans qo'shish/ayirish, reklama, forward, bonus, ban/unban, to'lovlar, buyurtmalar, sozlamalar.
- **Xavfsizlik** — rate limit, anti-spam, error handling, admin middleware, MongoDB validatsiya.

## 🧱 Arxitektura (MVC)

```
premium-shop-bot/
├── index.js                  # Kirish nuqtasi: config → DB → bot launch
├── .env.example              # Namuna environment
├── src/
│   ├── config/               # Konfiguratsiya (env o'qish + validatsiya)
│   ├── database/             # MongoDB ulanishi
│   ├── models/               # Mongoose modellari (Model)
│   ├── controllers/          # Handlerlar (Controller)
│   │   └── admin/            # Admin panel controllerlari
│   ├── services/             # Biznes-logika (DB qoidalari shu yerda)
│   ├── routes/               # Bot route'lari (user + admin)
│   ├── middlewares/          # session, rateLimit, antiSpam, ban, admin, subscription, error
│   ├── scenes/               # Telegraf wizard sahnalari (ko'p bosqichli oqimlar)
│   ├── keyboards/            # Reply / inline klaviaturalar (View)
│   └── utils/                # logger, constants, messages, helpers
```

### Database collections
`users`, `referrals`, `payments`, `orders`, `withdrawals`, `tickets`, `settings`.

## 🚀 Ishga tushirish

1. **Talablar:** Node.js ≥ 18, MongoDB (lokal yoki Atlas).

2. **O'rnatish:**
   ```bash
   npm install
   ```

3. **Sozlash:** `.env.example` ni `.env` ga nusxalang va to'ldiring:
   ```bash
   cp .env.example .env
   ```
   Asosiy maydonlar:
   - `BOT_TOKEN` — [@BotFather](https://t.me/BotFather) dan olingan token.
   - `BOT_USERNAME` — bot username (referal havola uchun, `@` siz).
   - `ADMIN_IDS` — admin Telegram ID lar (vergul bilan).
   - `REQUIRED_CHANNEL_1/2` — majburiy kanallar (`@username` yoki `-100...`).
   - `MONGODB_URI` — MongoDB ulanish manzili.
   - Narxlar, to'lov rekvizitlari, bonus va limitlar.

   > ⚠️ Bot majburiy obunani tekshirishi uchun **u kanallarda admin** bo'lishi shart.

4. **Ishga tushirish:**
   ```bash
   npm start      # production
   npm run dev    # watch rejimi (auto-restart)
   ```

## 💳 Telegram Stars

`XTR` valyutasi va bo'sh `provider_token` bilan invoice yuboriladi. To'lov yakunlangach buyurtma avtomatik yopiladi. Boshqa usullar (Click/Payme/Uzum) admin tomonidan qo'lda tasdiqlanadi.

## 🛠 Admin panel

`/admin` buyrug'i (yoki admin sifatida har qanday xabar) admin klaviaturasini ochadi. Yangi buyurtma, pul yechish va ticketlar adminga inline tugmalar bilan keladi (tasdiqlash / rad etish / javob berish).

## 🔒 Xavfsizlik

- **Rate limit** — har foydalanuvchi uchun oynaviy so'rov cheklovi.
- **Anti-spam** — ketma-ket bir xil xabarlar bloklanadi.
- **Ban middleware** — bloklangan foydalanuvchilar to'xtatiladi.
- **Admin middleware** — admin handlerlari himoyalangan.
- **Error handling** — global `bot.catch`, foydalanuvchiga xavfsiz xabar.

## 📜 Skriptlar

| Buyruq | Tavsif |
|--------|--------|
| `npm start` | Botni ishga tushirish |
| `npm run dev` | Watch rejimida ishga tushirish |
| `npm run lint` | ESLint tekshiruvi |
| `npm run lint:fix` | ESLint avto-tuzatish |

## 📄 Litsenziya

MIT
