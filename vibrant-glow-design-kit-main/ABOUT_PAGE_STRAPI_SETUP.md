# About Page Strapi Setup Guide

## Current Status
✅ Text fields are working (Hero, Origin Story, titles, descriptions)  
⚠️ Arrays need manual setup first (Core Values, Team Members, Sustainability features)  
⚠️ Mission & Vision need manual setup (nested components)

## Step-by-Step: Make Arrays Editable

### 1. Team Members Array
1. Go to Strapi Admin → Content Manager → Single Types → About Page
2. Scroll to **Team** section
3. Under **Members**, click **"Add an entry"**
4. Fill in ONE member:
   - Name: "Test Member"
   - Role: "Test Role"  
   - Description: "Test description"
   - Image: (optional, can upload later)
5. Click **Save** (bottom)
6. Click **Publish** (top right)
7. Refresh your website - members should now appear!

### 2. Core Values Array
1. In the same About Page, scroll to **Core Values** section
2. Under **Values**, click **"Add an entry"**
3. Fill in ONE value:
   - Icon Name: "Users"
   - Title: "Test Value"
   - Description: "Test description"
4. Click **Save**, then **Publish**
5. Refresh website

### 3. Sustainability Features Array
1. Scroll to **Sustainability** section
2. Under **Features**, click **"Add an entry"**
3. Fill in ONE feature:
   - Text: "Test feature"
4. Click **Save**, then **Publish**
5. Refresh website

### 4. Mission & Vision (Nested Components)
Mission & Vision are nested single components. After you add them in Strapi:
1. Go to **Mission & Vision** section
2. Make sure both **Mission** and **Vision** components are filled:
   - Mission → Icon Name, Title, Content
   - Vision → Icon Name, Title, Content
3. Click **Save**, then **Publish**
4. Refresh website

**Note:** Mission & Vision might still use translations as fallback if nested populate doesn't work, but the data will be in Strapi for future use.

## After Setup
Once you've added at least one item to each array and published:
- ✅ Changes you make in Strapi will appear on the website
- ✅ You can add more items, edit existing ones, or delete items
- ✅ All changes require clicking **Publish** to appear on the website

## Troubleshooting
If arrays still don't appear after adding items:
1. Make sure you clicked **Publish** (not just Save)
2. Hard refresh browser (Ctrl+Shift+R)
3. Check browser console for errors
4. Verify in Strapi that items show in the arrays





