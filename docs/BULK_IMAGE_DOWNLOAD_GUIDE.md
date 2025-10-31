# 📸 Bulk Image Download Guide for Wanderlust Project

## Overview
This guide explains how to get high-quality property images in bulk for your Airbnb-like project.

---

## 🎯 Quick Start (Easiest Method)

### Method 1: Direct Download Script (NO API KEY NEEDED)
```bash
node bulk-download-images.js
```

This will download **50 curated high-quality images** from Unsplash directly into your `public/images/listings/` folder.

**Features:**
- ✅ No API key required
- ✅ Curated property images
- ✅ Auto-numbered (image-1.jpg to image-50.jpg)
- ✅ Skips existing files
- ✅ Progress tracking

---

## 🔑 Method 2: Unsplash API (Best Quality & Variety)

### Step 1: Get Unsplash API Access Key (FREE)
1. Go to https://unsplash.com/developers
2. Click "Register as a Developer"
3. Create a new application:
   - Application name: "Wanderlust Image Downloader"
   - Description: "Download property images for travel website"
4. Copy your **Access Key**

### Step 2: Configure the Script
1. Open `unsplash-api-download.js`
2. Replace `YOUR_ACCESS_KEY_HERE` with your actual key:
   ```javascript
   const UNSPLASH_ACCESS_KEY = 'your_actual_key_here';
   ```

### Step 3: Run the Script
```bash
node unsplash-api-download.js
```

**API Limits:**
- Free tier: 50 requests/hour
- Can download up to 50 images per run

---

## 🌐 Free Image Sources (Manual Download)

### 1. **Unsplash** (Recommended)
- **URL:** https://unsplash.com
- **License:** Free for commercial use
- **Search terms:**
  - "luxury villa"
  - "vacation rental"
  - "beachfront property"
  - "mountain cabin"
  - "city apartment"
  - "hotel interior"

### 2. **Pexels**
- **URL:** https://www.pexels.com
- **License:** Free for commercial use
- **Collections:**
  - Hotels: https://www.pexels.com/search/hotel/
  - Vacation: https://www.pexels.com/search/vacation%20rental/
  - Luxury homes: https://www.pexels.com/search/luxury%20home/

### 3. **Pixabay**
- **URL:** https://pixabay.com
- **License:** Free for commercial use
- **Search:** "vacation home", "resort", "apartment"

---

## 💰 Premium Image Sources (Paid)

### Best for Production Websites:

1. **Shutterstock**
   - Subscription: $29/month (10 images)
   - Bulk: $169/month (350 images)
   - URL: https://www.shutterstock.com

2. **Adobe Stock**
   - Subscription: $29.99/month (10 images)
   - URL: https://stock.adobe.com

3. **iStock by Getty Images**
   - Pay as you go or subscription
   - URL: https://www.istockphoto.com

4. **Envato Elements**
   - Unlimited downloads: $16.50/month
   - URL: https://elements.envato.com

---

## 📋 Image Requirements for Airbnb-Style Sites

### Recommended Specifications:
- **Format:** JPG or WebP
- **Resolution:** 1920x1080 or higher
- **Aspect Ratio:** 16:9 or 4:3
- **File Size:** 200KB - 500KB (optimized)
- **Orientation:** Landscape preferred

### Image Categories You Need:
- ✅ Exterior shots (main property image)
- ✅ Living rooms
- ✅ Bedrooms
- ✅ Kitchens
- ✅ Bathrooms
- ✅ Pools/outdoor areas
- ✅ Views/surroundings
- ✅ Unique features

---

## 🛠️ Image Optimization (After Download)

### Online Tools (Free):
1. **TinyPNG** - https://tinypng.com
   - Reduces file size by 50-70%
   - Maintains quality

2. **Squoosh** - https://squoosh.app
   - Google's image optimizer
   - WebP conversion

### Command Line (Bulk Optimization):
```bash
# Install ImageMagick
npm install -g imagemagick

# Resize and optimize all images
for file in public/images/listings/*.jpg; do
  convert "$file" -resize 1200x800 -quality 85 "$file"
done
```

---

## 📊 Current Project Status

**Your project has:**
- 71 listings
- 45 images currently
- Need: ~26 more unique images to avoid duplicates

**Recommendation:** Download at least 75-100 images to have variety

---

## 🚀 Usage Instructions

### After downloading images:

1. **Run the bulk downloader:**
   ```bash
   node bulk-download-images.js
   ```

2. **Check downloaded images:**
   ```bash
   cd public/images/listings
   dir
   ```

3. **Update database:**
   ```bash
   node init/index.js
   ```

4. **Start your server:**
   ```bash
   node app.js
   ```

---

## 🎨 Custom Search Queries

To get specific types of properties, modify `bulk-download-images.js` and add these Unsplash URLs:

### Beach Properties:
```
https://images.unsplash.com/photo-XXXXX?w=1200&q=80
```

### Search on Unsplash:
1. Go to https://unsplash.com
2. Search for property type
3. Click on image
4. Right-click → Copy image address
5. Add to the `unsplashImageUrls` array

---

## 📝 License Information

### Unsplash License:
- ✅ Free to use
- ✅ Commercial use allowed
- ✅ No attribution required (but appreciated)
- ✅ Cannot sell unmodified photos
- ✅ Cannot use in competing services

### Best Practices:
- Give attribution when possible
- Don't claim images as your own
- Read full license: https://unsplash.com/license

---

## ⚡ Quick Commands Reference

```bash
# Download 50 curated images
node bulk-download-images.js

# Download using Unsplash API (requires key)
node unsplash-api-download.js

# Check current image count
cd public/images/listings && dir /b | find /c ".jpg"

# Reinitialize database
node init/index.js

# Start server
node app.js
```

---

## 🆘 Troubleshooting

### Issue: "Download failed"
- Check internet connection
- URL might be expired (use API method)
- Try again with delay between downloads

### Issue: "API rate limit exceeded"
- Free tier: 50 requests/hour
- Wait 1 hour or upgrade to paid tier

### Issue: "Images not showing on website"
- Clear browser cache
- Restart Node.js server
- Check file permissions
- Verify image paths in database

---

## 📞 Need More Help?

- Unsplash API Docs: https://unsplash.com/documentation
- Pexels API: https://www.pexels.com/api/
- GitHub Issues: Report bugs in your repo

---

**Happy downloading! 🎉**
