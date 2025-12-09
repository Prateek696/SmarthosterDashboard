# ⚡ Quick Start: Test Strapi Homepage API

## 🎯 TL;DR - Fast Testing

### Step 1: Check Your Strapi URL

Your Strapi URL is set to:
```
https://smarthoster-blogs.onrender.com
```

(Or check your `.env` file for `NEXT_PUBLIC_STRAPI_URL`)

---

## 🔍 Step 2: Test if Homepage Single Type Exists

Open this URL in your browser:
```
https://smarthoster-blogs.onrender.com/api/home-page?populate=*
```

### Expected Results:

#### ✅ If it EXISTS:
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "heroSection": { ... },
      "createdAt": "...",
      "updatedAt": "...",
      "publishedAt": "..."
    }
  },
  "meta": {}
}
```

#### ❌ If it DOESN'T EXIST:
```json
{
  "error": {
    "status": 404,
    "name": "NotFoundError",
    "message": "Not Found"
  }
}
```

---

## 🏗️ Step 3: Create It in Strapi Admin

### Quick Create Steps:

1. **Go to Strapi Admin:**
   ```
   https://smarthoster-blogs.onrender.com/admin
   ```

2. **Content-Type Builder:**
   - Left sidebar → **Content-Type Builder**
   - Click **"Create new single type"**

3. **Name It:**
   - Display name: `Home Page`
   - API ID: `home-page` ⚠️ (MUST be exact: lowercase, hyphen)
   - Click **Continue**

4. **Add ONE Field to Test:**
   - Click **"Add another field"**
   - Select **"Component"**
   - Component name: `heroSection`
   - Type: **Single component** → **Create new component**
   - Component name: `Hero Section`
   - Add field: `title` (Text)
   - Add field: `description` (Text)
   - Click **Finish**
   - Click **Save**

5. **Create Entry:**
   - Go to **Content Manager**
   - Click **Home Page**
   - Click **"Create new entry"**
   - Fill in `heroSection.title` (e.g., "Test Homepage")
   - Click **Save**
   - Click **Publish**

6. **Test Again:**
   - Open: `https://smarthoster-blogs.onrender.com/api/home-page?populate=*`
   - Should now return data!

---

## 🧪 Step 4: Test from Next.js

1. **Check Environment Variable:**
   ```bash
   # In .env.local or .env file:
   NEXT_PUBLIC_STRAPI_URL=https://smarthoster-blogs.onrender.com
   ```

2. **Start Next.js:**
   ```bash
   npm run dev:next
   ```

3. **Open Homepage:**
   ```
   http://localhost:3001
   ```

4. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for any errors
   - Check Network tab for requests to Strapi

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ API endpoint returns data (not 404)
2. ✅ Next.js homepage loads without errors
3. ✅ Browser console shows no Strapi errors
4. ✅ If Strapi has data → it appears on homepage
5. ✅ If Strapi is empty → fallback translations work

---

## 🔧 Common Issues

### Issue: 404 Not Found
**Solution:** Single Type not created. Follow Step 3.

### Issue: Empty Response `{ "data": null }`
**Solution:** Content exists but not published. Click "Publish" in Strapi.

### Issue: Network Error in Next.js
**Solution:** 
- Check Strapi URL in `.env`
- Make sure Strapi is accessible
- Check CORS settings in Strapi

### Issue: Components Not Showing
**Solution:** Make sure to use `populate=*` in the API call.

---

## 📍 Where Everything Is

| Item | Location |
|------|----------|
| Strapi Admin | `https://smarthoster-blogs.onrender.com/admin` |
| API Endpoint | `https://smarthoster-blogs.onrender.com/api/home-page?populate=*` |
| Next.js Config | `.env` → `NEXT_PUBLIC_STRAPI_URL` |
| API Service Code | `src/services/strapi.api.ts` |
| Homepage Code | `app/page.tsx` (server) + `app/page-client.tsx` (client) |

---

## 🚀 Next Steps

1. ✅ Create Single Type (if not exists)
2. ✅ Test API endpoint
3. ✅ Add minimal content
4. ✅ Test from Next.js
5. ✅ Gradually add more sections

---

**Need more details?** See `STRAPI_HOMEPAGE_SETUP.md` for complete field structure.





