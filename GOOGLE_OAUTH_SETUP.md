# Google OAuth Setup Guide

## 🔐 Setting up Google Sign-In for Your LMS Portal

To enable "Continue with Google" functionality, you need to get a Google Client ID from Google Cloud Console.

---

## 📋 **Step-by-Step Instructions:**

### **Step 1: Go to Google Cloud Console**
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account (use iqrasanashaik24@gmail.com or any Google account)

### **Step 2: Create a New Project**
1. Click on the project dropdown at the top
2. Click "NEW PROJECT"
3. Project name: **LMS-Hackathon** (or any name you prefer)
4. Click **CREATE**
5. Wait for the project to be created, then select it

### **Step 3: Enable Google Sign-In API**
1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API" or "Google Identity"
3. Click on **"Google Identity Services"** or **"Google+ API"**
4. Click **ENABLE**

### **Step 4: Configure OAuth Consent Screen**
1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for testing with any Google account)
3. Click **CREATE**
4. Fill in the required fields:
   - **App name:** LMS Portal
   - **User support email:** iqrasanashaik24@gmail.com
   - **Developer contact email:** iqrasanashaik24@gmail.com
5. Click **SAVE AND CONTINUE**
6. Skip the "Scopes" section (click **SAVE AND CONTINUE**)
7. Add test users (optional): Add your email
8. Click **SAVE AND CONTINUE**, then **BACK TO DASHBOARD**

### **Step 5: Create OAuth 2.0 Client ID**
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **OAuth client ID**
4. Application type: **Web application**
5. Name: **LMS Portal Web Client**
6. **Authorized JavaScript origins:**
   - Add: `http://localhost:5173`
   - Add: `http://localhost:5000`
7. **Authorized redirect URIs:**
   - Add: `http://localhost:5173`
   - Add: `http://localhost:5173/login`
   - Add: `http://localhost:5173/register`
8. Click **CREATE**

### **Step 6: Copy Your Client ID**
1. A popup will appear with your **Client ID** and **Client Secret**
2. **Copy the Client ID** - it looks like:
   ```
   1234567890-abcdefghijklmnop.apps.googleusercontent.com
   ```
3. Keep this safe!

---

## 🔧 **Step 7: Add Client ID to Your Code**

### **Update LoginPage.jsx:**
1. Open: `lms-portal/src/components/LoginPage.jsx`
2. Find line with `client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',`
3. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID
4. Example:
   ```javascript
   client_id: '1234567890-abcdefghijklmnop.apps.googleusercontent.com',
   ```

### **Update RegistrationForm.jsx:**
1. Open: `lms-portal/src/components/RegistrationForm.jsx`
2. Find line with `client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',`
3. Replace with your actual Client ID

---

## ✅ **Testing:**

1. **Start your backend:**
   ```bash
   cd lms-backend
   npm start
   ```

2. **Start your frontend:**
   ```bash
   cd lms-portal
   npm run dev
   ```

3. **Test Google Sign-In:**
   - Go to http://localhost:5173
   - Click "Continue with Google"
   - You should see a popup showing your Google accounts
   - Select an account
   - You'll be automatically logged in!

---

## 🎯 **How It Works:**

1. **User clicks "Continue with Google"**
2. **Google shows account chooser popup**
3. **User selects their Google account**
4. **Google sends user info (email, name, picture) to your app**
5. **Your app sends this to the backend**
6. **Backend creates a new user OR logs in existing user**
7. **User is redirected to dashboard**

---

## 🔒 **Security Notes:**

- The Client Secret should be kept private (not committed to Git)
- For production, you'll need to:
  1. Verify the domain in Google Console
  2. Add your production URL to authorized origins
  3. Move Client ID to environment variables

---

## 📝 **For Production Deployment:**

When deploying (e.g., on Vercel/Netlify):

1. Add your production URLs to **Authorized JavaScript origins**:
   - `https://your-app.vercel.app`
   
2. Add to **Authorized redirect URIs**:
   - `https://your-app.vercel.app/login`
   - `https://your-app.vercel.app/register`

3. Use environment variables:
   ```javascript
   client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
   ```

---

## 🆘 **Troubleshooting:**

**Error: "Google Sign-In is loading. Please try again"**
- Wait a few seconds for the Google script to load
- Refresh the page

**Error: "redirect_uri_mismatch"**
- Check that `http://localhost:5173` is in Authorized JavaScript origins
- Make sure there are no trailing slashes

**Popup doesn't appear:**
- Check browser console for errors
- Make sure popup blockers are disabled
- Try in incognito mode

---

## ✨ **You're All Set!**

After following these steps, users can sign in with their Google account with just one click! 🎉
