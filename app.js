const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const sampleListings = require('./init/data');
const methodOverride = require('method-override');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema } = require('./schema.js');

const app = express();

// Validation middleware
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

async function main() {
    await mongoose.connect('mongodb://localhost:27017/wanderlust');
    // Seed database if empty
    if (await Listing.countDocuments() === 0) {
        await Listing.insertMany(sampleListings);
    }

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride('_method'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.engine('ejs', require('ejs').__express);
    app.use(express.static(path.join(__dirname, 'public')));

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    // Home page redirects to /listings
    app.get('/', (req, res) => {
        res.redirect('/listings');
    });

    // Show all listings
    app.get('/listings', wrapAsync(async (req, res) => {
        const allListings = await Listing.find({});
        res.render('listings/index', { allListings });
    }));

    // Render form to add new listing
    app.get('/listings/new', (req, res) => {
        res.render('listings/new');
    });

    // Handle form submission to add new listing
    app.post('/listings', validateListing, wrapAsync(async (req, res) => {
        const { title, description, image, price, location, country } = req.body;
        const imageUrl = image && image.trim() !== ""
            ? image
            : "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
        const listing = new Listing({
            title,
            description,
            image: {
                filename: "listingimage",
                url: imageUrl
            },
            price,
            location,
            country
        });
        await listing.save();
        res.redirect('/listings');
    }));

    // Show single listing
    app.get('/listings/:id', wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError(404, "Listing not found!");
        }
        res.render('listings/show', { listing });
    }));

    // Render edit form
    app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError(404, "Listing not found!");
        }
        res.render('listings/edit', { listing });
    }));

    // Update listing
    app.put('/listings/:id', validateListing, wrapAsync(async (req, res) => {
        const { id } = req.params;
        const { title, description, image, price, location, country } = req.body;
        const imageUrl = image && image.trim() !== ""
            ? image
            : "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

        const listing = await Listing.findByIdAndUpdate(id, {
            title,
            description,
            image: {
                filename: "listingimage",
                url: imageUrl
            },
            price,
            location,
            country
        });

        if (!listing) {
            throw new ExpressError(404, "Listing not found!");
        }

        res.redirect(`/listings/${id}`);
    }));

    // Delete listing
    app.delete('/listings/:id', wrapAsync(async (req, res) => {
        const { id } = req.params;
        const deletedListing = await Listing.findByIdAndDelete(id);
        if (!deletedListing) {
            throw new ExpressError(404, "Listing not found!");
        }
        res.redirect('/listings');
    }));

    app.get('/testlisting', async (req, res) => {
        let samplelisting = new Listing({
            title: 'Sample Listing',
            description: 'This is a sample listing for testing purposes.',
            image: {
                filename: "listingimage",
                url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
            },
            location: 'Sample Location',
            price: 100,
            country: 'Sample Country',
        });

        await samplelisting.save();
        res.send('Sample listing created successfully!');
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
        let { statusCode = 500, message = "Something went wrong!" } = err;

        // Ensure statusCode is a valid number
        if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
            statusCode = 500;
        }

        res.status(statusCode).render("error.ejs", { message });
    });

    // Start server
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

main()
    .then(() => {
        console.log('Connected to MongoDB and server is running.');
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });
