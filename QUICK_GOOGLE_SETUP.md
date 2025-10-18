# ⚡ Quick Google Sign-In Setup (5 Minutes)

## 🎯 Current Status:
❌ You're seeing "Google Sign-In coming soon!" because you need a Google Client ID

## ✅ What You Need To Do:

---

### **📌 Step 1: Get Google Client ID**

#### **1.1 Go to Google Cloud Console**
🔗 https://console.cloud.google.com/

#### **1.2 Create Project**
- Click project dropdown at top → "NEW PROJECT"
- Project name: **`LMS-Hackathon`**
- Click **CREATE**

#### **1.3 Create OAuth Client ID**
- In the search bar, type: **"Credentials"**
- Click **"Credentials"** in the results
- Click **"+ CREATE CREDENTIALS"** button
- Select **"OAuth client ID"**

#### **1.4 Configure Consent Screen (If Asked)**
- User Type: **External**
- App name: **`LMS Portal`**
- User support email: **`iqrasanashaik24@gmail.com`**
- Developer email: **`iqrasanashaik24@gmail.com`**
- Click **SAVE AND CONTINUE** (3 times to skip optional steps)

#### **1.5 Create Web Client**
- Application type: **Web application**
- Name: **`LMS Web Client`**
- Authorized JavaScript origins:
  - Click **"+ ADD URI"**
  - Enter: `http://localhost:5173`
  - Click **"+ ADD URI"** again
  - Enter: `http://localhost:5000`
- Click **CREATE**

#### **1.6 Copy Your Client ID**
✅ You'll see a popup with your Client ID

It looks like this:
```
123456789012-abcdefghijklmnopqrstuvwxyz12.apps.googleusercontent.com
```

**📋 COPY THIS!** You'll need it in the next step.

---

### **📌 Step 2: Add Client ID to Your Code**

#### **2.1 Open LoginPage.jsx**
File: `lms-portal/src/components/LoginPage.jsx`

#### **2.2 Find Line 108** (around there)
Look for:
```javascript
client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // ← REPLACE THIS
```

#### **2.3 Replace with Your Client ID**
Example - if your Client ID is `123456789-abc.apps.googleusercontent.com`:
```javascript
client_id: '123456789-abc.apps.googleusercontent.com',
```

#### **2.4 Do the Same for RegistrationForm.jsx**
File: `lms-portal/src/components/RegistrationForm.jsx`
Find the same line and replace it.

---

### **📌 Step 3: Restart and Test**

#### **3.1 Save both files**

#### **3.2 Refresh your browser**
Press **F5** or **Ctrl+R**

#### **3.3 Click "Continue with Google"**
🎉 You should now see the Google account chooser popup!

---

## ✅ What Happens After Setup:

1. **Click "Continue with Google"**
2. **Google popup shows your accounts** (like Gmail on Android/Chrome)
3. **Select your account**
4. **Automatically logged in!** No password needed
5. **Redirected to dashboard**

---

## 🆘 Troubleshooting:

**Still seeing "Google Sign-In coming soon!"?**
- ✅ Make sure you replaced `YOUR_GOOGLE_CLIENT_ID` in BOTH files
- ✅ Make sure you saved the files
- ✅ Refresh the browser (F5)

**"Google Sign-In is loading. Please try again in a moment."?**
- ✅ Wait 3-5 seconds for Google script to load
- ✅ Refresh and try again

**"redirect_uri_mismatch" error?**
- ✅ Make sure `http://localhost:5173` is in **Authorized JavaScript origins**
- ✅ No trailing slash: `http://localhost:5173` (not `http://localhost:5173/`)

---

## 📝 Quick Reference:

**Google Cloud Console:**
https://console.cloud.google.com/

**Where to get Client ID:**
Google Cloud Console → Credentials → OAuth 2.0 Client IDs → Click your client → Copy Client ID

**Files to update:**
1. `lms-portal/src/components/LoginPage.jsx` (Line ~108)
2. `lms-portal/src/components/RegistrationForm.jsx` (Line ~80)

---

## ✨ That's It!

After these 3 steps, your users can sign in with Google in one click! 🚀

**No React DevTools needed** - that's just a debugging tool, not required for Google Sign-In!
