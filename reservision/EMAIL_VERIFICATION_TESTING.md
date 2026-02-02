# ✅ COMPLETE EMAIL VERIFICATION SYSTEM - TESTING GUIDE

## 🎯 Quick Start Testing

### Prerequisites
1. ✅ Backend server running (port 8000)
2. ✅ Frontend dev server running (port 5173)
3. ⚠️ Resend API key configured in `.env`
4. ⚠️ Database table `otp_verifications` created

---

## 🧪 STEP-BY-STEP TEST

### Option 1: Test Backend Only

**Open in browser:**
```
file:///C:/xampp/htdocs/cap2/CAPSTONE_BACKEND/reservision-backend/test-otp.html
```

Or use VS Code Live Server.

**Test Steps:**
1. Enter your email
2. Click "Send Verification Code"
3. Check email inbox (and spam)
4. Copy 6-digit code
5. Paste and click "Verify Code"
6. Should see ✅ success message

---

### Option 2: Test Complete Booking Flow

**1. Start Frontend**
```bash
cd C:\xampp\htdocs\cap\CAPSTONE_FRONTEND\reservision
npm run dev
```

**2. Go to Reservation Page**
- Open: http://localhost:5173
- Navigate to Reservation page
- Select rooms/cottages/events/food
- Choose dates
- Click "Continue to Booking"

**3. Fill Guest Information**
- First Name: Juan
- Last Name: Dela Cruz
- Adults: 2
- Phone: 912 345 6789
- Postal: 5200
- Street Address: 123 Resort St.
- City: Calapan
- Country: Philippines

**4. Email Verification (NEW!)**
- Scroll to "Email Verification" section
- Enter your email: `your-email@gmail.com`
- Click "Send Verification Code"
- Wait for alert: "✅ Verification code sent!"

**5. Check Email**
- Open your email inbox
- Check spam folder if not in inbox
- Find email from "Eduardo's Resort"
- Subject: "Your Verification Code - Eduardo's Resort"
- Copy the 6-digit code

**6. Verify Code**
- Paste code in "Enter 6-Digit Code" field
- Click "Verify Code"
- Wait for alert: "✅ Email verified successfully!"
- Section turns green with checkmark

**7. Complete Payment**
- Scroll to "Booking Summary" (review items)
- Select payment method (GCash/PayMaya/Bank)
- Check "I agree to Terms & Conditions"
- Click "Pay Now & Confirm"
- Redirects to PayMongo

---

## 📧 What to Expect in Email

### OTP Email Template
```
Subject: Your Verification Code - Eduardo's Resort

[Beautiful HTML Email]
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi Juan! 👋

Here's your verification code for Eduardo's Resort:

    ┏━━━━━━━━━━┓
    ┃  123456  ┃
    ┗━━━━━━━━━━┛

⏰ This code expires in 10 minutes.
━━━━━━━━━━━━━━━━━━━━━━━━━━

For your security:
• Never share this code
• Our team will never ask for it

Need help? Contact us at support@eduardosresort.com

Eduardo's Resort
[Logo]
━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎬 Demo Scenarios

### Scenario 1: Happy Path ✅
1. Enter email → Send code
2. Receive email → Enter code
3. Verify successfully → Pay

**Expected Result:** Green checkmark, payment enabled

---

### Scenario 2: Wrong Code ❌
1. Send code
2. Enter wrong code (e.g., 111111)
3. Click verify

**Expected Result:** Alert "❌ Invalid verification code"

---

### Scenario 3: Expired Code ⏰
1. Send code
2. Wait 10+ minutes
3. Try to verify

**Expected Result:** Alert "❌ Verification code has expired. Please request a new code."

---

### Scenario 4: Resend Code 🔄
1. Send code
2. Don't receive email
3. Click "Resend Code"

**Expected Result:** 
- New code sent
- Timer resets to 10:00
- Previous code invalidated

---

### Scenario 5: Payment Without Verification 🚫
1. Skip email verification
2. Try to click "Pay Now"

**Expected Result:** 
- Button disabled (grayed out)
- Text shows "Verify Email First"
- Alert: "⚠️ Please verify your email address first before proceeding with payment."

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Resend API key not configured"
**Solution:**
1. Open `.env` file
2. Add: `RESEND_API_KEY=re_your_key_here`
3. Restart backend server

### Issue 2: Email not received
**Check:**
- ✅ Spam/junk folder
- ✅ Email spelling correct
- ✅ Resend API key valid
- ✅ Check Resend dashboard: https://resend.com/emails

### Issue 3: Backend not responding
**Solution:**
1. Check backend running: `http://localhost:8000`
2. Check terminal for errors
3. Restart: `npm start` in backend folder

### Issue 4: Frontend not showing verification section
**Solution:**
1. Clear browser cache
2. Hard refresh: Ctrl+Shift+R
3. Check browser console for errors

### Issue 5: Countdown timer not working
**Solution:**
- Should start at 10:00 and count down
- If stuck, refresh page and try again

---

## 🔍 Testing Checklist

### Backend Testing
- [ ] Backend server running on port 8000
- [ ] Database table `otp_verifications` exists
- [ ] Resend API key configured
- [ ] Can send OTP via test-otp.html
- [ ] Can verify OTP successfully

### Frontend Testing
- [ ] Email verification section appears
- [ ] Can enter email
- [ ] "Send Code" button works
- [ ] Receives email with code
- [ ] Can enter 6-digit code
- [ ] Code auto-formats (digits only)
- [ ] Countdown timer works
- [ ] "Verify Code" button works
- [ ] Section turns green after verification
- [ ] Payment button disabled before verification
- [ ] Payment button enabled after verification

### Integration Testing
- [ ] Complete booking flow works
- [ ] Email verification required before payment
- [ ] Booking created in database
- [ ] Payment link generated
- [ ] Redirects to PayMongo

---

## 📊 Expected Database Records

After testing, check database:

### Table: `otp_verifications`
```sql
SELECT * FROM otp_verifications ORDER BY created_at DESC LIMIT 5;
```

**Expected:**
| id | email | otp_code | expires_at | verified | created_at |
|----|-------|----------|------------|----------|------------|
| 1  | test@example.com | 123456 | 2026-02-01 14:30:00 | 1 | 2026-02-01 14:20:00 |

### Table: `customers`
```sql
SELECT * FROM customers ORDER BY created_at DESC LIMIT 1;
```

**Expected:** New customer record with verified email

### Table: `bookings`
```sql
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 1;
```

**Expected:** New booking with customer_id

### Table: `payments`
```sql
SELECT * FROM payments ORDER BY created_at DESC LIMIT 1;
```

**Expected:** Payment record with PayMongo details

---

## 🎯 Success Criteria

✅ **Email Verification Works**
- Code sent to email
- Code received within 1 minute
- Code verifies successfully
- Section highlights green

✅ **Security Works**
- Cannot pay without verification
- Expired codes rejected
- Invalid codes rejected
- Rate limiting works (max 1 per minute)

✅ **User Experience Good**
- Clear instructions
- Helpful error messages
- Visual feedback (green highlight)
- Countdown timer visible

✅ **Integration Complete**
- Booking created in database
- Payment link generated
- Redirects to PayMongo
- Email stored correctly

---

## 📞 If Everything Fails

### Check These in Order:

1. **Backend Running?**
   ```bash
   # Terminal should show:
   Server running at http://localhost:8000
   ```

2. **Database Connected?**
   - Open phpMyAdmin
   - Check `eduardos` database exists
   - Check `otp_verifications` table exists

3. **Resend Configured?**
   - Check `.env` has `RESEND_API_KEY`
   - Test at: https://resend.com/emails
   - Verify API key is active

4. **Frontend Running?**
   ```bash
   # Terminal should show:
   VITE v5.x.x  ready in XXX ms
   ➜  Local:   http://localhost:5173/
   ```

5. **Network?**
   - Check internet connection
   - Try opening backend in browser: http://localhost:8000

---

## 🎉 When Everything Works

You should see:

1. ✅ Email verification section in booking page
2. ✅ Code sent and received in email
3. ✅ Code verifies successfully
4. ✅ Green checkmark appears
5. ✅ Payment button enabled
6. ✅ Booking created successfully
7. ✅ Redirected to PayMongo

**Congratulations! Email verification is working!** 🎊

---

## 📝 Next Steps

After successful testing:

1. **Production Setup**
   - Verify domain in Resend
   - Update sender email
   - Update API URLs

2. **User Training**
   - Show admin how to monitor emails
   - Explain OTP system
   - Review email logs in Resend

3. **Documentation**
   - User manual with screenshots
   - Admin guide for troubleshooting

---

*Complete Testing Guide*  
*Eduardo's Resort Booking System*  
*Capstone Project - 2024*
