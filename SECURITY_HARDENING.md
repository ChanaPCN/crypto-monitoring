# Crypto Portfolio Monitor - Security Hardening Guide

## 🔐 Production Security Configuration

### Vercel Deployment Security Settings

```bash
# Add these environment variables in Vercel Dashboard
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=<your-production-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-production-key>
```

### Recommended vercel.json Configuration

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-DNS-Prefetch-Control",
          "value": "on"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

---

## 🛡️ Supabase Security Configuration

### Authentication Settings

1. **Go to Authentication > Settings**
   - ✅ Enable email confirmations
   - ✅ Disable signups from specific email providers if needed
   - ✅ Set session timeout (recommended: 7 days)
   - ✅ Enable MFA (Multi-Factor Authentication)

2. **Email Templates**
   - Customize confirmation emails
   - Add your domain/branding
   - Include security tips

3. **OAuth Providers**
   - Google: Add authorized domains
   - Restrict to specific email domains if needed

### Database Security

1. **Row Level Security (RLS)**
   ```sql
   -- Verify RLS is enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   
   -- All tables should show rowsecurity = true
   ```

2. **Connection Pooling**
   - Enable PgBouncer for production
   - Set max connections appropriately
   - Monitor connection usage

3. **Backups**
   - ✅ Enable automatic backups (daily recommended)
   - ✅ Test restore procedure
   - ✅ Store backups in different region

### API Security

1. **API Keys**
   - Keep anon key secret (client-side use only)
   - Never expose service_role key client-side
   - Rotate keys if compromised
   - Use separate keys per environment

2. **Rate Limiting**
   ```
   Enable in Supabase Dashboard:
   - Auth endpoints: 100 requests/hour
   - Database queries: 500 requests/minute  
   - Storage: 200 requests/minute
   ```

---

## 🔒 Advanced Security Measures

### 1. Implement Redis for Rate Limiting (Production)

```typescript
// lib/redis-rate-limit.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
})

export async function checkRateLimit(
  identifier: string,
  limit: number = 5,
  window: number = 60
): Promise<{ success: boolean; remaining: number }> {
  const key = `rate_limit:${identifier}`
  const count = await redis.incr(key)
  
  if (count === 1) {
    await redis.expire(key, window)
  }
  
  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count)
  }
}
```

### 2. Add Logging with Sensitive Data Masking

```typescript
// lib/logger.ts
export function logSecure(level: string, message: string, data?: any) {
  const sanitizedData = data ? maskSensitiveData(data) : {}
  
  console.log({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitizedData
  })
}

function maskSensitiveData(obj: any): any {
  const sensitive = ['password', 'token', 'key', 'secret', 'authorization']
  const masked = { ...obj }
  
  for (const key in masked) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      masked[key] = '***REDACTED***'
    }
  }
  
  return masked
}
```

### 3. Implement CAPTCHA for Forms (Optional)

```bash
npm install @hcaptcha/react-hcaptcha
# or
npm install react-google-recaptcha
```

Add to login/signup forms:
```typescript
import HCaptcha from '@hcaptcha/react-hcaptcha'

// In component
const [captchaToken, setCaptchaToken] = useState<string | null>(null)

// Before submit
if (!captchaToken) {
  setError('Please complete the CAPTCHA')
  return
}
```

### 4. Add Security Monitoring

```bash
# Install Sentry for error tracking
npm install @sentry/nextjs

# Configure in sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers
    }
    return event
  }
})
```

---

## 🚨 Security Incident Response Plan

### Detection
1. Monitor error logs daily
2. Set up alerts for:
   - Multiple failed login attempts
   - Unusual API usage patterns
   - Database query failures
   - Rate limit violations

### Response Process
1. **Identify**: Confirm the security incident
2. **Contain**: Limit the damage
   - Revoke compromised keys
   - Block suspicious IPs
   - Disable affected accounts
3. **Eradicate**: Remove the threat
   - Patch vulnerability
   - Update dependencies
   - Review code changes
4. **Recover**: Restore normal operations
   - Deploy fixes
   - Monitor closely
   - Communicate with users
5. **Learn**: Document and improve
   - Post-mortem analysis
   - Update security measures
   - Train team

---

## 📊 Security Monitoring Checklist

### Daily
- [ ] Review error logs
- [ ] Check failed login attempts
- [ ] Monitor API usage

### Weekly
- [ ] Run `npm audit`
- [ ] Check for dependency updates
- [ ] Review rate limit violations
- [ ] Test backup restoration

### Monthly
- [ ] Security header scan (securityheaders.com)
- [ ] SSL certificate check (ssllabs.com)
- [ ] OWASP ZAP scan
- [ ] Review access permissions

### Quarterly
- [ ] Full penetration test
- [ ] Update security documentation
- [ ] Review and update policies
- [ ] Security training for team
- [ ] Rotate API keys

---

## 🔧 Security Tools

### Recommended Tools:
1. **OWASP ZAP** - Automated security testing
2. **Snyk** - Dependency vulnerability scanning
3. **Lighthouse** - Security audit in Chrome DevTools
4. **SSL Labs** - SSL/TLS configuration test
5. **SecurityHeaders.com** - HTTP header analysis

### Commands:
```bash
# Check for vulnerabilities
npm audit

# Fix automatically if possible
npm audit fix

# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Check bundle size (smaller = safer)
npm run build -- --profile
```

---

## 💡 Additional Security Tips

### Code Security
- Never commit secrets to git
- Use environment variables for all config
- Validate all user input
- Sanitize all output
- Use parameterized queries
- Keep dependencies updated
- Review code before deployment

### Infrastructure Security
- Use HTTPS everywhere
- Enable DDoS protection
- Use WAF (Web Application Firewall)
- Enable CDN for DDoS mitigation
- Use separate databases per environment
- Implement database encryption
- Regular backups with encryption

### User Security
- Enforce strong passwords
- Enable 2FA
- Session timeout after inactivity
- Logout on all devices option
- Security notifications for account changes
- Privacy controls

---

## 📞 Security Contacts

### Report Security Issues:
- Email: security@yourdomain.com
- PGP Key: [Your PGP public key]
- Bug Bounty: [If applicable]

### Response Time:
- Critical: < 4 hours
- High: < 24 hours  
- Medium: < 1 week
- Low: < 1 month

---

## 🏆 Security Certifications

Track progress toward:
- [ ] OWASP ASVS Level 2
- [ ] SOC 2 Type II
- [ ] ISO 27001
- [ ] PCI DSS (if handling payments)

---

**Security is an ongoing process, not a one-time implementation.**

Regular reviews, updates, and testing are essential to maintain a secure application.
