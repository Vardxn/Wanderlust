# Wanderlust Project Documentation Generator
# This script creates a comprehensive text file with all project code

$outputFile = "WANDERLUST_PROJECT_COMPLETE_CODE.txt"
$projectRoot = Get-Location

Write-Host "Generating Wanderlust Project Documentation..." -ForegroundColor Green

# Create the documentation file
@"
===============================================================================
                        WANDERLUST PROJECT - COMPLETE CODEBASE
===============================================================================
Generated on: $(Get-Date)
Project Location: $projectRoot

This file contains all the code from the Wanderlust Airbnb Clone project.
Each file is clearly labeled with its purpose and structure explained.

===============================================================================
                                PROJECT STRUCTURE
===============================================================================

Wanderlust/
├── app.js                          # Main Express server file
├── package.json                    # Node.js dependencies and scripts
├── schema.js                       # Joi validation schemas
├── init/
│   ├── data.js                     # Sample listing data for seeding
│   └── index.js                    # Database seeding script
├── models/
│   ├── listing.js                  # Mongoose model for listings
│   └── review.js                   # Mongoose model for reviews
├── public/
│   └── CSS/
│       └── styles.css              # Custom CSS styles (Airbnb-inspired)
├── utils/
│   ├── ExpressError.js             # Custom error handling class
│   └── wrapAsync.js                # Async error wrapper utility
├── views/
│   ├── error.ejs                   # Error page template
│   ├── experiences/
│   │   └── index.ejs               # Experiences listing page
│   ├── includes/
│   │   ├── footer.ejs              # Reusable footer component
│   │   └── navbar.ejs              # Navigation bar component
│   ├── layouts/
│   │   └── boilerplate.ejs         # Main layout template
│   └── listings/
│       ├── edit.ejs                # Edit listing form
│       ├── index.ejs               # Main listings page
│       ├── new.ejs                 # Create new listing form
│       └── show.ejs                # Individual listing details

===============================================================================
                                TECHNOLOGY STACK
===============================================================================

Backend:
- Node.js (Runtime Environment)
- Express.js (Web Framework)
- MongoDB (Database)
- Mongoose (ODM for MongoDB)

Frontend:
- EJS (Template Engine)
- Bootstrap 5 (CSS Framework)
- Font Awesome (Icons)
- Custom CSS (Airbnb-inspired design)

Validation:
- Joi (Schema validation)

Development:
- Nodemon (Auto-restart during development)

===============================================================================
                                    SERVER CODE
===============================================================================

"@ | Out-File -FilePath $outputFile -Encoding UTF8

# Function to add file content with proper formatting
function Add-FileToDoc {
    param(
        [string]$FilePath,
        [string]$Description,
        [string]$Purpose
    )
    
    if (Test-Path $FilePath) {
        @"

===============================================================================
FILE: $FilePath
===============================================================================
PURPOSE: $Purpose
DESCRIPTION: $Description

"@ | Out-File -FilePath $outputFile -Append -Encoding UTF8
        
        Get-Content $FilePath | Out-File -FilePath $outputFile -Append -Encoding UTF8
        
        @"


"@ | Out-File -FilePath $outputFile -Append -Encoding UTF8
    } else {
        @"

===============================================================================
FILE: $FilePath (NOT FOUND)
===============================================================================

"@ | Out-File -FilePath $outputFile -Append -Encoding UTF8
    }
}

# Add all project files with descriptions
Add-FileToDoc "app.js" "Main Express.js server application" "Central server file that handles routing, middleware, database connections, and error handling. Contains all API endpoints for listings, reviews, and experiences."

Add-FileToDoc "package.json" "Node.js project configuration" "Defines project dependencies, scripts, and metadata. Contains information about required packages like Express, MongoDB, Bootstrap, etc."

Add-FileToDoc "schema.js" "Joi validation schemas" "Contains validation rules for listing and review data. Ensures data integrity before database operations."

Add-FileToDoc "init\data.js" "Sample listing data" "Contains 48+ sample property listings with realistic data for seeding the database. Includes diverse properties from around the world."

Add-FileToDoc "init\index.js" "Database seeding script" "Script to populate the MongoDB database with sample data. Run this to initialize the database with test listings."

Add-FileToDoc "models\listing.js" "Mongoose Listing model" "Database schema for property listings. Defines structure for title, description, image, price, location, and reviews."

Add-FileToDoc "models\review.js" "Mongoose Review model" "Database schema for user reviews. Includes rating, comment, author, and timestamp fields."

Add-FileToDoc "utils\ExpressError.js" "Custom error handling" "Custom error class for consistent error handling throughout the application. Extends native Error class."

Add-FileToDoc "utils\wrapAsync.js" "Async error wrapper" "Utility function to wrap async route handlers and automatically catch errors. Prevents need for try-catch in every route."

Add-FileToDoc "public\CSS\styles.css" "Custom CSS styles" "Comprehensive stylesheet with Airbnb-inspired design. Includes navbar, cards, buttons, forms, and responsive layouts."

Add-FileToDoc "views\layouts\boilerplate.ejs" "Main layout template" "Base HTML template used by all pages. Includes head, navigation, footer, and content area. Sets up Bootstrap and Font Awesome."

Add-FileToDoc "views\includes\navbar.ejs" "Navigation component" "Reusable navigation bar with Airbnb-inspired design. Includes logo, search functionality, and user menu."

Add-FileToDoc "views\includes\footer.ejs" "Footer component" "Reusable footer with social links and copyright information."

Add-FileToDoc "views\listings\index.ejs" "Main listings page" "Homepage that displays all property listings in a responsive grid. Includes image, title, location, price, and view details button."

Add-FileToDoc "views\listings\show.ejs" "Individual listing page" "Detailed view of a single property with images, description, reviews section, and review form."

Add-FileToDoc "views\listings\new.ejs" "Create listing form" "Form for adding new property listings. Includes validation and proper styling."

Add-FileToDoc "views\listings\edit.ejs" "Edit listing form" "Form for updating existing property listings. Pre-populated with current data."

Add-FileToDoc "views\experiences\index.ejs" "Experiences page" "Alternative view of listings presented as experiences with filtering and sorting options."

Add-FileToDoc "views\error.ejs" "Error page template" "User-friendly error page that displays when something goes wrong. Includes navigation back to main site."

# Add setup instructions
@"

===============================================================================
                                SETUP INSTRUCTIONS
===============================================================================

1. PREREQUISITES:
   - Node.js (v14 or higher)
   - MongoDB (local installation or MongoDB Atlas)
   - Git (for version control)

2. INSTALLATION STEPS:
   
   # Clone or navigate to project directory
   cd "C:\Users\varda\Documents\VS Code\Wanderlust"
   
   # Install dependencies
   npm install
   
   # Start MongoDB (if using local installation)
   mongod
   
   # Seed database with sample data
   cd init
   node index.js
   cd ..
   
   # Start the server
   node app.js
   # OR for development with auto-restart:
   nodemon app.js
   
   # Access the application
   Open browser and go to: http://localhost:8080/listings

3. PROJECT FEATURES:
   - 48+ realistic property listings
   - Responsive design (mobile, tablet, desktop)
   - CRUD operations for listings
   - Review system with star ratings
   - Search and filter functionality
   - Airbnb-inspired modern design
   - Error handling and validation
   - Clean, semantic HTML structure
   - Modern CSS with animations

4. API ENDPOINTS:
   GET    /                           # Redirects to /listings
   GET    /listings                   # View all listings
   GET    /listings/new               # Show create form
   POST   /listings                   # Create new listing
   GET    /listings/:id               # View single listing
   GET    /listings/:id/edit          # Show edit form
   PUT    /listings/:id               # Update listing
   DELETE /listings/:id               # Delete listing
   POST   /listings/:id/reviews       # Add review
   DELETE /listings/:id/reviews/:rid  # Delete review
   GET    /experiences                # View experiences page

5. DATABASE STRUCTURE:
   - Listings Collection: stores property information
   - Reviews Collection: stores user reviews
   - Relationships: Listings can have multiple reviews

6. STYLING APPROACH:
   - Bootstrap 5 for responsive grid and components
   - Custom CSS for Airbnb-like appearance
   - Font Awesome for icons
   - CSS custom properties for consistent theming
   - Smooth animations and hover effects

===============================================================================
                                    END OF FILE
===============================================================================
Generated by Wanderlust Project Documentation Generator
Total Files Documented: Multiple
Date: $(Get-Date)

"@ | Out-File -FilePath $outputFile -Append -Encoding UTF8

Write-Host "Documentation generated successfully!" -ForegroundColor Green
Write-Host "File location: $projectRoot\$outputFile" -ForegroundColor Yellow
Write-Host "File size: $((Get-Item $outputFile).Length / 1KB) KB" -ForegroundColor Cyan
