# Wanderlust - Project Structure Documentation

## 📂 Directory Structure

```
Wanderlust/
│
├── 📄 app.js                           # Main Express application entry point
├── 📄 schema.js                        # Mongoose schema definitions
├── 📄 package.json                     # Node.js dependencies and scripts
├── 📄 package-lock.json                # Locked versions of dependencies
├── 📄 FUTURE_IMPROVEMENTS_AND_ROADMAP.md  # Future features and roadmap
├── 📄 README.md                        # Project overview and setup
│
├── 📁 init/                            # Database initialization
│   ├── data.js                         # Initial seed data for listings
│   └── index.js                        # Script to populate database
│
├── 📁 models/                          # MongoDB/Mongoose Models
│   ├── listing.js                      # Listing model schema
│   ├── review.js                       # Review model schema
│   └── user.js                         # User model schema
│
├── 📁 views/                           # EJS Templates
│   ├── error.ejs                       # Error page template
│   ├── home.ejs                        # Homepage template
│   │
│   ├── experiences/                    # Experience-related views
│   │   └── index.ejs                   # Experiences listing page
│   │
│   ├── includes/                       # Reusable template partials
│   │   ├── footer.ejs                  # Footer component
│   │   ├── listing-card.ejs            # Listing card component
│   │   ├── location-section.ejs        # Location section component
│   │   ├── navbar.ejs                  # Navigation bar component
│   │   └── welcome-modal.ejs           # Welcome modal component
│   │
│   ├── layouts/                        # Layout templates
│   │   └── boilerplate.ejs             # Base layout with navbar/footer
│   │
│   ├── listings/                       # Listing-related views
│   │   ├── index.ejs                   # All listings page
│   │   └── show.ejs                    # Individual listing details
│   │
│   └── sections/                       # Section templates
│
├── 📁 public/                          # Static Assets
│   ├── CSS/
│   │   └── styles.css                  # Main stylesheet
│   │
│   ├── images/                         # Image assets
│   │   └── listings/                   # Listing images directory
│   │
│   └── js/                             # Client-side JavaScript
│       └── airbnb-components.js        # Frontend interactive components
│
├── 📁 utils/                           # Utility Functions
│   ├── ExpressError.js                 # Custom error handling class
│   └── wrapAsync.js                    # Async error wrapper utility
│
├── 📁 scripts/                         # Utility Scripts
│   ├── generate_project_docs.ps1       # PowerShell documentation generator
│   │
│   ├── database-management/            # Database utility scripts
│   │   ├── deleteAllListings.js        # Remove all listings from DB
│   │   ├── deleteSpecificListings.js   # Remove specific listings
│   │   └── update-prices.js            # Update listing prices
│   │
│   └── image-management/               # Image processing scripts
│       ├── add-sequence-numbers.js     # Add sequence numbers to images
│       ├── bulk-download-images.js     # Bulk image downloader
│       ├── check-all-images.js         # Verify all images exist
│       ├── complete-fix-images.js      # Complete image fix utility
│       ├── delete-broken-images.js     # Remove broken image files
│       ├── download-more-images.js     # Download additional images
│       ├── download-replacement-images.js  # Replace missing images
│       ├── download-unsplash-images.js # Download from Unsplash API
│       ├── fix-image-assignments.js    # Fix image-to-listing mapping
│       ├── remove-all-numbers.js       # Remove numbering from images
│       ├── remove-specific-numbers.js  # Remove specific number patterns
│       ├── rename-images-sequential.js # Rename images sequentially
│       ├── unsplash-api-download.js    # Unsplash API integration
│       └── verify-replacement-images.js # Verify replaced images
│
└── 📁 docs/                            # Documentation
    ├── 100_LISTINGS_COMPLETE.md        # 100 listings completion guide
    ├── BULK_IMAGE_DOWNLOAD_GUIDE.md    # Guide for bulk image downloads
    ├── COMPONENT_FUNCTIONALITY_DOCUMENTATION.txt  # Component docs
    ├── LOCATION_SECTIONS_DOCUMENTATION.txt  # Location sections guide
    ├── PRICE_DISPLAY_DOCUMENTATION.txt # Price display documentation
    ├── PROJECT_STRUCTURE_DOCUMENTATION.txt  # Legacy structure docs
    ├── SETUP_AND_USAGE_GUIDE.txt       # Setup instructions
    └── UNSPLASH_IMAGE_URLS.txt         # Unsplash image references
```

## 🔧 Core Application Files

### `app.js`
- Main Express server configuration
- Route definitions and middleware setup
- Database connection initialization
- Error handling configuration

### `schema.js`
- Mongoose schema definitions
- Data validation rules
- Model relationships

### `package.json`
- Project dependencies
- NPM scripts for running the application
- Project metadata

## 📊 Models Layer

All MongoDB models are defined using Mongoose ODM:

- **listing.js**: Property listings with details, images, pricing
- **review.js**: User reviews and ratings for listings
- **user.js**: User authentication and profile data

## 🎨 Views Layer (EJS Templates)

### Main Views
- `home.ejs`: Landing page
- `error.ejs`: Error handling page

### Listings
- `index.ejs`: Browse all available listings
- `show.ejs`: Detailed view of individual listing

### Reusable Components (includes/)
- Navigation bar, footer, modals
- Listing cards and location sections
- Ensures consistent UI across pages

## 🌐 Public Assets

### CSS
- `styles.css`: Custom styling for the entire application

### JavaScript
- `airbnb-components.js`: Interactive frontend features

### Images
- Organized listing images in `public/images/listings/`

## 🛠️ Utility Scripts

### Database Management
Scripts for managing listing data, prices, and database operations

### Image Management
Comprehensive tools for:
- Downloading images from Unsplash
- Organizing and renaming image files
- Verifying image integrity
- Fixing broken image references

## 📚 Documentation

All project documentation is organized in the `docs/` folder, including:
- Setup guides
- Feature documentation
- Component specifications
- Image management guides

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables
3. Initialize database: `node init/index.js`
4. Start server: `npm start` or `nodemon app.js`

## 📝 Notes

- Keep utility scripts in `scripts/` folder
- All documentation goes in `docs/` folder
- Static assets belong in `public/` folder
- Database models in `models/` folder
- Template files in `views/` folder

---

**Last Updated:** October 31, 2025
**Project:** Wanderlust - Airbnb Clone
**Author:** vardxn
