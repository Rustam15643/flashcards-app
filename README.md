# So'z Kartochkalari

React + Firebase + Vite bilan qurilgan flashcard ilovasi. PWA sifatida telefonga o'rnatiladi.

## O'rnatish

```bash
npm install
npm run dev
```

## Vercelga deploy qilish

1. GitHub repoga push qiling
2. vercel.com → Import project → GitHub reponi tanlang
3. Build settings avtomatik aniqlanadi (Vite)
4. Deploy!

## Firebase Firestore xavfsizlik qoidalari

Firebase Console → Firestore → Rules tabiga quyidagini kiriting:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Firebase Authentication - Authorized domains

Vercelga deploy qilgandan keyin:
Firebase Console → Authentication → Settings → Authorized domains
→ Vercel URL manzilingizni qo'shing (masalan: flashcards-xyz.vercel.app)

## Imkoniyatlar

- Google bilan kirish
- Papkalar yaratish
- Har papkada ko'plab so'z to'plamlari
- Sessiya limiti (masalan 10 ta so'z birdaniga)
- Bildim/Qayta tizimi
- Tasodifiy tartib va teskari rejim
- Telefon + kompyuter sinxronizatsiyasi
- PWA - telefonga ilovadek o'rnatiladi
