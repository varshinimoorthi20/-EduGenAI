# How to Set Up Google OAuth

## Step 1 — Create Google OAuth Credentials

1. Go to → https://console.cloud.google.com
2. Click **"Select a project"** → **"New Project"**
3. Name it `EduGenAI` → Click **Create**
4. In left sidebar → **APIs & Services** → **Credentials**
5. Click **"+ Create Credentials"** → **"OAuth client ID"**
6. If prompted, configure **OAuth consent screen** first:
   - Choose **External**
   - App name: `EduGenAI`
   - Add your email as support email
   - Save and continue (skip optional fields)
7. Back at Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `EduGenAI`
   - Authorized redirect URIs → Add:
     ```
     http://localhost:8000/auth/google/callback
     ```
8. Click **Create**
9. Copy your **Client ID** and **Client Secret**

---

## Step 2 — Add to .env

Open your `.env` file and add:
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
FRONTEND_URL=http://localhost:3000
```

---

## Step 3 — Restart backend

```powershell
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## That's it!

The "Continue with Google" button on Login and Signup pages will now work.
Users click the button → Google login page → redirected back → automatically logged in.

---

## Note: Google OAuth is Optional

If you don't set up Google OAuth, the app still works perfectly with
email/password signup and login. The Google button will show an error
if GOOGLE_CLIENT_ID is not set.
