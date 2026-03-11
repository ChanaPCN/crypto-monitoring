# 🔐 Security Testing Guide - Crypto Portfolio Monitor

## Quick Security Test (5 minutes)

Run these tests locally before deploying to production:

### 1. Rate Limiting Test (Login)

```bash
# Test rate limiting on login page
```

**Steps:**
1. Open `http://localhost:3000/login`
2. Try logging in with wrong password **6 times**
3. ✅ **Expected**: After 5 attempts, you should see "Too many login attempts" with a countdown timer
4. ✅ **Expected**: Login button should be disabled during lockout
5. Wait 15 minutes OR clear browser cache to reset

### 2. Rate Limiting Test (Signup)

**Steps:**
1. Open `http://localhost:3000/signup`
2. Try registering with invalid email **4 times**
3. ✅ **Expected**: After 3 attempts, you should see "Too many signup attempts" with lockout message
4. ✅ **Expected**: Signup button should be disabled during lockout

### 3. Password Strength Test

**Steps:**
1. Open `http://localhost:3000/signup`
2. Try these passwords:

| Password | Expected Result |
|----------|----------------|
| `weak` | ❌ "At least 8 characters" |
| `password` | ❌ "At least 8 characters" + "Common password" |
| `Password` | ❌ "At least one number" |
| `Password1` | ❌ "At least one special character" |
| `Password1!` | ✅ All checks pass ✓ |

3. ✅ **Expected**: Real-time password validation feedback
4. ✅ **Expected**: Submit button disabled until all requirements met

### 4. Email Validation Test

**Steps:**
1. Try signing up with these emails:

| Email | Expected |
|-------|----------|
| `notanemail` | ❌ "Invalid email format" |
| `test@` | ❌ "Invalid email format" |
| `@example.com` | ❌ "Invalid email format" |
| `test@example.com` | ✅ Accepted |

### 5. Input Validation Test (Add Transaction)

**Steps:**
1. Login and go to dashboard
2. Click "Add Transaction"
3. Try these inputs:

| Field | Test Value | Expected |
|-------|-----------|----------|
| Coin Symbol | `<script>alert(1)</script>` | ❌ "Only letters and numbers allowed" |
| Coin Symbol | `VERYLONGCOINNAME` | ❌ "Maximum 10 characters" |
| Amount | `-5` | ❌ "Amount must be positive" |
| Amount | `abc` | ❌ "Invalid amount" |
| Price | `0` | ❌ "Price must be positive" |
| Date | `2000-01-01` | ❌ "Date cannot be before 2009" |
| Date | Future date | ❌ "Date cannot be in the future" |
| Notes | 600 characters | ❌ "Notes maximum 500 characters" |

4. ✅ Valid transaction example:
   - Coin: `BTC`
   - Amount: `0.5`
   - Price: `50000`
   - Date: `2024-01-15`
   - Notes: `Investment purchase`

### 6. XSS Prevention Test

**Steps:**
1. Add transaction with these payloads in notes:
   - `<script>alert('XSS')</script>`
   - `<img src=x onerror=alert(1)>`
   - `javascript:alert(1)`

2. ✅ **Expected**: Text appears as plain text, not executed
3. ✅ **Expected**: HTML entities are escaped

### 7. Duplicate Transaction Prevention

**Steps:**
1. Add a transaction:
   - Coin: BTC
   - Amount: 1.0
   - Price: 50000
   - Date: Today
2. Try adding the EXACT same transaction again
3. ✅ **Expected**: "Similar transaction already exists" error

### 8. Security Headers Test

**Steps:**
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Load any page
4. Click on the document request
5. Check Response Headers:

✅ **Expected headers:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [should be present]
Permissions-Policy: [should be present]
```

### 9. HTTPS Redirect (Production Only)

**Steps:**
1. After deploying, try accessing `http://yourdomain.com`
2. ✅ **Expected**: Automatically redirects to `https://yourdomain.com`
3. ✅ **Expected**: HSTS header present with `max-age=31536000`

### 10. Session Security Test

**Steps:**
1. Login to the app
2. Open DevTools → Application → Cookies
3. Find Supabase auth cookies
4. ✅ **Expected**: Cookies should have:
   - `Secure` flag (production only)
   - `HttpOnly` flag
   - `SameSite=Lax` or `SameSite=Strict`

---

## Automated Security Tests

### Run Security Audits

```bash
# 1. Check for vulnerabilities in dependencies
npm audit

# 2. Check for outdated packages
npm outdated

# 3. Analyze bundle for security issues
npm run build

# 4. Type check
npx tsc --noEmit
```

### Expected Results:
- ✅ 0 vulnerabilities (high or critical)
- ✅ No type errors
- ✅ Build completes successfully

---

## Online Security Tests

### 1. SSL/TLS Test (After Deployment)
https://www.ssllabs.com/ssltest/

✅ **Target**: A+ rating

### 2. Security Headers Test
https://securityheaders.com/

✅ **Target**: A rating or higher

### 3. OWASP ZAP Scan
```bash
# Install OWASP ZAP
# Run automated scan against your deployment
# Check for:
# - XSS vulnerabilities
# - SQL injection
# - CSRF issues
# - Security misconfigurations
```

---

## Penetration Testing Checklist

### Authentication Attacks
- [ ] Brute force login (should be blocked after 5 attempts)
- [ ] Brute force signup (should be blocked after 3 attempts)
- [ ] SQL injection in login form
- [ ] Password reset token exploitation
- [ ] Session fixation attacks
- [ ] Session hijacking attempts

### Input Validation Attacks
- [ ] XSS in transaction notes
- [ ] XSS in coin name/symbol
- [ ] SQL injection in forms
- [ ] Command injection attempts
- [ ] Path traversal attempts
- [ ] Buffer overflow tests

### Business Logic Tests
- [ ] Negative amounts in transactions
- [ ] Future dates in transactions
- [ ] Access other user's data
- [ ] Bypass rate limiting with multiple browsers
- [ ] Create duplicate transactions
- [ ] Delete other user's transactions

### API Security Tests
- [ ] Unauthorized API access
- [ ] Mass assignment vulnerabilities
- [ ] Excessive data exposure
- [ ] Rate limiting bypass
- [ ] API parameter tampering

---

## Security Test Results Template

```
Date: ___________
Tester: ___________
Environment: [ ] Local [ ] Staging [ ] Production

| Test | Pass | Fail | Notes |
|------|------|------|-------|
| Rate Limiting (Login) | [ ] | [ ] | |
| Rate Limiting (Signup) | [ ] | [ ] | |
| Password Strength | [ ] | [ ] | |
| Email Validation | [ ] | [ ] | |
| Input Validation | [ ] | [ ] | |
| XSS Prevention | [ ] | [ ] | |
| Duplicate Prevention | [ ] | [ ] | |
| Security Headers | [ ] | [ ] | |
| SSL/TLS | [ ] | [ ] | |
| Session Security | [ ] | [ ] | |
| npm audit | [ ] | [ ] | |
| OWASP ZAP | [ ] | [ ] | |

Overall Status: [ ] PASS [ ] FAIL

Issues Found:
1. ___________
2. ___________
3. ___________

Recommendations:
1. ___________
2. ___________
3. ___________
```

---

## Common Issues & Solutions

### Issue: Rate limiting not working
**Solution:** Clear browser cache and cookies, or test in incognito mode

### Issue: Password validation not showing
**Solution:** Check browser console for JavaScript errors

### Issue: Security headers missing
**Solution:** Ensure middleware.ts is properly configured and deployed

### Issue: HTTPS redirect not working
**Solution:** Check hosting platform SSL settings (Vercel auto-handles this)

### Issue: XSS payload executing
**Solution:** Verify sanitizeInput() is called on all user inputs

---

## Production Deployment Security Checklist

Before deploying to production:

- [ ] All security tests pass
- [ ] npm audit shows 0 high/critical issues
- [ ] Environment variables configured in hosting platform
- [ ] Supabase RLS policies active
- [ ] SSL certificate configured
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] Password strength enforced
- [ ] Input validation working
- [ ] Error messages sanitized
- [ ] SECURITY.md reviewed
- [ ] Backup strategy in place
- [ ] Monitoring/logging configured
- [ ] Incident response plan documented

---

## Continuous Security Testing

### Set up automated tests:

```javascript
// __tests__/security.test.ts
describe('Security Tests', () => {
  test('should enforce rate limiting', async () => {
    // Test implementation
  })
  
  test('should validate password strength', () => {
    // Test implementation
  })
  
  test('should sanitize user input', () => {
    // Test implementation
  })
})
```

Run weekly:
```bash
npm test -- security.test.ts
```

---

**Remember:** Security testing is not a one-time event. Run these tests:
- Before each deployment
- After dependency updates
- Weekly in production
- After any security-related code changes

Stay vigilant! 🛡️
