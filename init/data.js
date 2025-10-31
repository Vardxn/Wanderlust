const sampleListings = [
  {
    title: "Historic Villa in Tuscany",
    description:
      "Experience the charm of Tuscany in this beautifully restored villa. Explore the rolling hills and vineyards.",
    image: {
      filename: "image-1.jpg",
      url: "/images/listings/image-1.jpg",
    },
    price: 80000,
    location: "Florence",
    country: "Italy",
  },
  {
    title: "Secluded Treehouse Getaway",
    description:
      "Live among the treetops in this unique treehouse retreat. A true nature lover's paradise.",
    image: {
      filename: "image-2.jpg",
      url: "/images/listings/image-2.jpg",
    },
    price: 66000,
    location: "Portland",
    country: "United States",
  },
  {
    title: "Beachfront Paradise",
    description:
      "Step out of your door onto the sandy beach. This beachfront condo offers the ultimate relaxation.",
    image: {
      filename: "image-3.jpg",
      url: "/images/listings/image-3.jpg",
    },
    price: 65000,
    location: "Cancun",
    country: "Mexico",
  },
  {
    title: "Rustic Cabin by the Lake",
    description:
      "Spend your days fishing and kayaking on the serene lake. This cozy cabin is perfect for outdoor enthusiasts.",
    image: {
      filename: "image-4.jpg",
      url: "/images/listings/image-4.jpg",
    },
    price: 77000,
    location: "Lake Tahoe",
    country: "United States",
  },
  {
    title: "Luxury Penthouse with City Views",
    description:
      "Indulge in luxury living with panoramic city views from this stunning penthouse apartment.",
    image: {
      filename: "image-5.jpg",
      url: "/images/listings/image-5.jpg",
    },
    price: 29000,
    location: "New York",
    country: "United States",
  },
  {
    title: "Ski-In/Ski-Out Chalet",
    description:
      "Hit the slopes right from your doorstep in this ski-in/ski-out chalet in the Swiss Alps.",
    image: {
      filename: "image-6.jpg",
      url: "/images/listings/image-6.jpg",
    },
    price: 53000,
    location: "Verbier",
    country: "Switzerland",
  },
  {
    title: "Seaside Villa in Mykonos",
    description:
      "Luxurious white-washed villa with stunning sea views and private pool. Perfect for Mediterranean getaways.",
    image: {
      filename: "image-7.jpg",
      url: "/images/listings/image-7.jpg",
    },
    price: 56000,
    location: "Mykonos",
    country: "Greece",
  },
  {
    title: "Safari Lodge in the Serengeti",
    description:
      "Experience the thrill of the wild in a comfortable safari lodge. Witness the Great Migration up close.",
    image: {
      filename: "image-8.jpg",
      url: "/images/listings/image-8.jpg",
    },
    price: 66000,
    location: "Serengeti National Park",
    country: "Tanzania",
  },
  {
    title: "Private Island Retreat",
    description:
      "Have an entire island to yourself for a truly exclusive and unforgettable vacation experience.",
    image: {
      filename: "image-9.jpg",
      url: "/images/listings/image-9.jpg",
    },
    price: 67000,
    location: "Fiji",
    country: "Fiji",
  },
  {
    title: "Charming Cottage in the Cotswolds",
    description:
      "Escape to the picturesque Cotswolds in this quaint and charming cottage with a thatched roof.",
    image: {
      filename: "image-10.jpg",
      url: "/images/listings/image-10.jpg",
    },
    price: 65000,
    location: "Cotswolds",
    country: "United Kingdom",
  },
  {
    title: "Historic Brownstone in Boston",
    description:
      "Step back in time in this elegant historic brownstone located in the heart of Boston.",
    image: {
      filename: "image-11.jpg",
      url: "/images/listings/image-11.jpg",
    },
    price: 97000,
    location: "Boston",
    country: "United States",
  },
  {
    title: "Beachfront Bungalow in Bali",
    description:
      "Relax on the sandy shores of Bali in this beautiful beachfront bungalow with a private pool.",
    image: {
      filename: "image-12.jpg",
      url: "/images/listings/image-12.jpg",
    },
    price: 74000,
    location: "Bali",
    country: "Indonesia",
  },
  {
    title: "Mountain View Cabin in Banff",
    description:
      "Enjoy breathtaking mountain views from this cozy cabin in the Canadian Rockies.",
    image: {
      filename: "image-13.jpg",
      url: "/images/listings/image-13.jpg",
    },
    price: 83000,
    location: "Banff",
    country: "Canada",
  },
  {
    title: "Art Deco Apartment in Miami",
    description:
      "Step into the glamour of the 1920s in this stylish Art Deco apartment in South Beach.",
    image: {
      filename: "image-14.jpg",
      url: "/images/listings/image-14.jpg",
    },
    price: 47000,
    location: "Miami",
    country: "United States",
  },
  {
    title: "Tropical Villa in Phuket",
    description:
      "Escape to a tropical paradise in this luxurious villa with a private infinity pool in Phuket.",
    image: {
      filename: "image-15.jpg",
      url: "/images/listings/image-15.jpg",
    },
    price: 90000,
    location: "Phuket",
    country: "Thailand",
  },
  {
    title: "Historic Castle in Scotland",
    description:
      "Live like royalty in this historic castle in the Scottish Highlands. Explore the rugged beauty of the area.",
    image: {
      filename: "image-16.jpg",
      url: "/images/listings/image-16.jpg",
    },
    price: 28000,
    location: "Scottish Highlands",
    country: "United Kingdom",
  },
  {
    title: "Desert Oasis in Dubai",
    description:
      "Experience luxury in the middle of the desert in this opulent oasis in Dubai with a private pool.",
    image: {
      filename: "image-17.jpg",
      url: "/images/listings/image-17.jpg",
    },
    price: 56000,
    location: "Dubai",
    country: "United Arab Emirates",
  },
  {
    title: "Rustic Log Cabin in Montana",
    description:
      "Unplug and unwind in this cozy log cabin surrounded by the natural beauty of Montana.",
    image: {
      filename: "image-18.jpg",
      url: "/images/listings/image-18.jpg",
    },
    price: 37000,
    location: "Montana",
    country: "United States",
  },
  {
    title: "Beachfront Villa in Greece",
    description:
      "Enjoy the crystal-clear waters of the Mediterranean in this beautiful beachfront villa on a Greek island.",
    image: {
      filename: "image-19.jpg",
      url: "/images/listings/image-19.jpg",
    },
    price: 39000,
    location: "Mykonos",
    country: "Greece",
  },
  {
    title: "Historic Cottage in Charleston",
    description:
      "Experience the charm of historic Charleston in this beautifully restored cottage with a private garden.",
    image: {
      filename: "image-20.jpg",
      url: "/images/listings/image-20.jpg",
    },
    price: 87000,
    location: "Charleston",
    country: "United States",
  },
  {
    title: "Modern Apartment in Tokyo",
    description:
      "Explore the vibrant city of Tokyo from this modern and centrally located apartment.",
    image: {
      filename: "image-21.jpg",
      url: "/images/listings/image-21.jpg",
    },
    price: 79000,
    location: "Tokyo",
    country: "Japan",
  },
  {
    title: "Lakefront Cabin in New Hampshire",
    description:
      "Spend your days by the lake in this cozy cabin in the scenic White Mountains of New Hampshire.",
    image: {
      filename: "image-22.jpg",
      url: "/images/listings/image-22.jpg",
    },
    price: 80000,
    location: "New Hampshire",
    country: "United States",
  },
  {
    title: "Luxury Villa in the Maldives",
    description:
      "Indulge in luxury in this overwater villa in the Maldives with stunning views of the Indian Ocean.",
    image: {
      filename: "image-23.jpg",
      url: "/images/listings/image-23.jpg",
    },
    price: 34000,
    location: "Maldives",
    country: "Maldives",
  },
  {
    title: "Beachfront Villa in Crete",
    description:
      "Wake up to breathtaking sunsets in this stunning beachfront villa with private beach access in Crete.",
    image: {
      filename: "image-24.jpg",
      url: "/images/listings/image-24.jpg",
    },
    price: 85000,
    location: "Crete",
    country: "Greece",
  },
  {
    title: "Urban Loft in Berlin",
    description:
      "Stay in the cultural heart of Berlin in this modern loft with industrial design and contemporary amenities.",
    image: {
      filename: "image-25.jpg",
      url: "/images/listings/image-25.jpg",
    },
    price: 57000,
    location: "Berlin",
    country: "Germany",
  },
  {
    title: "Riverside Cabin in Norway",
    description:
      "Disconnect from the world in this peaceful riverside cabin surrounded by Norway's pristine wilderness.",
    image: {
      filename: "image-26.jpg",
      url: "/images/listings/image-26.jpg",
    },
    price: 67000,
    location: "Bergen",
    country: "Norway",
  },
  {
    title: "Luxury Penthouse in Singapore",
    description:
      "Enjoy panoramic city views from this ultra-modern penthouse in the heart of Singapore's financial district.",
    image: {
      filename: "image-27.jpg",
      url: "/images/listings/image-27.jpg",
    },
    price: 66000,
    location: "Singapore",
    country: "Singapore",
  },
  {
    title: "Desert Camp in Rajasthan",
    description:
      "Sleep under the stars in luxury tents in the heart of the Thar Desert with camel safari adventures.",
    image: {
      filename: "image-28.jpg",
      url: "/images/listings/image-28.jpg",
    },
    price: 45000,
    location: "Jaisalmer",
    country: "India",
  },
  {
    title: "Beachfront Bungalow in Mauritius",
    description:
      "Relax in paradise at this luxurious beachfront bungalow with crystal clear waters and white sandy beaches.",
    image: {
      filename: "image-29.jpg",
      url: "/images/listings/image-29.jpg",
    },
    price: 53000,
    location: "Mauritius",
    country: "Mauritius",
  },
  {
    title: "Mountain Lodge in Patagonia",
    description:
      "Adventure awaits at this remote mountain lodge with glacier views and world-class hiking trails.",
    image: {
      filename: "image-30.jpg",
      url: "/images/listings/image-30.jpg",
    },
    price: 67000,
    location: "Torres del Paine",
    country: "Chile",
  },
  {
    title: "Safari Tent in Serengeti",
    description:
      "Witness the Great Migration from this luxury safari tent with panoramic views of the African savannah.",
    image: {
      filename: "image-31.jpg",
      url: "/images/listings/image-31.jpg",
    },
    price: 58000,
    location: "Serengeti",
    country: "Tanzania",
  },
  {
    title: "Ice Hotel Suite in Lapland",
    description:
      "Experience the magic of the Arctic in this unique ice hotel with Northern Lights viewing opportunities.",
    image: {
      filename: "image-32.jpg",
      url: "/images/listings/image-32.jpg",
    },
    price: 44000,
    location: "Rovaniemi",
    country: "Finland",
  },
  {
    title: "Cliffside Villa in Big Sur",
    description:
      "Perched on dramatic cliffs overlooking the Pacific, this architectural marvel offers unparalleled ocean views.",
    image: {
      filename: "image-33.jpg",
      url: "/images/listings/image-33.jpg",
    },
    price: 67000,
    location: "Big Sur",
    country: "United States",
  },
  {
    title: "Traditional Ryokan in Kyoto",
    description:
      "Experience authentic Japanese hospitality in this traditional ryokan with tatami floors and zen gardens.",
    image: {
      filename: "image-34.jpg",
      url: "/images/listings/image-34.jpg",
    },
    price: 62000,
    location: "Kyoto",
    country: "Japan",
  },
  {
    title: "Overwater Bungalow in Tahiti",
    description:
      "Float above turquoise lagoons in this luxurious overwater bungalow with glass floor panels and private deck.",
    image: {
      filename: "image-35.jpg",
      url: "/images/listings/image-35.jpg",
    },
    price: 93000,
    location: "Bora Bora",
    country: "French Polynesia",
  },
  {
    title: "Countryside Manor in Tuscany",
    description:
      "Escape to this restored 16th-century manor house surrounded by rolling hills and olive groves in Tuscany.",
    image: {
      filename: "image-36.jpg",
      url: "/images/listings/image-36.jpg",
    },
    price: 37000,
    location: "Chianti",
    country: "Italy",
  },
  {
    title: "Lighthouse Keeper's House in Maine",
    description:
      "Stay in this converted lighthouse keeper's house perched on rugged coastal cliffs with panoramic ocean views.",
    image: {
      filename: "image-37.jpg",
      url: "/images/listings/image-37.jpg",
    },
    price: 47000,
    location: "Acadia National Park",
    country: "United States",
  },
  // Additional Tokyo listings
  {
    title: "Shibuya Modern Apartment",
    description:
      "Contemporary apartment in the heart of Shibuya with views of the famous crossing.",
    image: {
      filename: "image-38.jpg",
      url: "/images/listings/image-38.jpg",
    },
    price: 57000,
    location: "Tokyo",
    country: "Japan",
  },
  {
    title: "Shinjuku High-Rise Studio",
    description:
      "Minimalist studio on the 25th floor with panoramic views of Tokyo skyline.",
    image: {
      filename: "image-39.jpg",
      url: "/images/listings/image-39.jpg",
    },
    price: 49000,
    location: "Tokyo",
    country: "Japan",
  },
  {
    title: "Asakusa Traditional Machiya",
    description:
      "Restored traditional Japanese townhouse near Senso-ji Temple with tatami rooms.",
    image: {
      filename: "image-40.jpg",
      url: "/images/listings/image-40.jpg",
    },
    price: 56000,
    location: "Tokyo",
    country: "Japan",
  },
  {
    title: "Roppongi Designer Loft",
    description:
      "Ultra-modern loft in Roppongi's art district with access to rooftop gardens.",
    image: {
      filename: "image-41.jpg",
      url: "/images/listings/image-41.jpg",
    },
    price: 39000,
    location: "Tokyo",
    country: "Japan",
  },
  {
    title: "Harajuku Fashion District Flat",
    description:
      "Trendy apartment steps from Takeshita Street and Meiji Shrine.",
    image: {
      filename: "image-42.jpg",
      url: "/images/listings/image-42.jpg",
    },
    price: 92000,
    location: "Tokyo",
    country: "Japan",
  },
  {
    title: "Ginza Luxury Penthouse",
    description:
      "Opulent penthouse in Tokyo's upscale Ginza shopping district with concierge service.",
    image: {
      filename: "image-43.jpg",
      url: "/images/listings/image-43.jpg",
    },
    price: 63000,
    location: "Tokyo",
    country: "Japan",
  },
  {
    title: "Akihabara Tech Apartment",
    description:
      "Smart apartment in the electric town with all the latest tech gadgets.",
    image: {
      filename: "image-44.jpg",
      url: "/images/listings/image-44.jpg",
    },
    price: 95000,
    location: "Tokyo",
    country: "Japan",
  },
  {
    title: "Ueno Park Garden House",
    description:
      "Quiet residence near Ueno Park and Zoo with Japanese garden courtyard.",
    image: {
      filename: "image-45.jpg",
      url: "/images/listings/image-45.jpg",
    },
    price: 27000,
    location: "Tokyo",
    country: "Japan",
  },
  // Additional Paris listings
  {
    title: "Marais Historic Apartment",
    description:
      "Charming 18th-century apartment in Le Marais with original parquet floors.",
    image: {
      filename: "image-46.jpg",
      url: "/images/listings/image-46.jpg",
    },
    price: 35000,
    location: "Paris",
    country: "France",
  },
  {
    title: "Eiffel Tower View Penthouse",
    description:
      "Spectacular penthouse with direct views of the Eiffel Tower from the balcony.",
    image: {
      filename: "image-47.jpg",
      url: "/images/listings/image-47.jpg",
    },
    price: 42000,
    location: "Paris",
    country: "France",
  },
  {
    title: "Montmartre Artist Studio",
    description:
      "Bohemian studio in Montmartre with skylight and views of Sacré-Cœur.",
    image: {
      filename: "image-48.jpg",
      url: "/images/listings/image-48.jpg",
    },
    price: 39000,
    location: "Paris",
    country: "France",
  },
  {
    title: "Saint-Germain Boutique Loft",
    description:
      "Elegant loft in Saint-Germain-des-Prés near famous cafés and galleries.",
    image: {
      filename: "image-49.jpg",
      url: "/images/listings/image-49.jpg",
    },
    price: 93000,
    location: "Paris",
    country: "France",
  },
  {
    title: "Champs-Élysées Luxury Suite",
    description:
      "High-end apartment steps from the Champs-Élysées and Arc de Triomphe.",
    image: {
      filename: "image-50.jpg",
      url: "/images/listings/image-50.jpg",
    },
    price: 95000,
    location: "Paris",
    country: "France",
  },
  {
    title: "Latin Quarter Student Flat",
    description:
      "Cozy flat in the vibrant Latin Quarter near Sorbonne University.",
    image: {
      filename: "image-51.jpg",
      url: "/images/listings/image-51.jpg",
    },
    price: 39000,
    location: "Paris",
    country: "France",
  },
  {
    title: "Le Marais Courtyard Apartment",
    description:
      "Ground floor apartment with private courtyard in trendy Le Marais district.",
    image: {
      filename: "image-52.jpg",
      url: "/images/listings/image-52.jpg",
    },
    price: 80000,
    location: "Paris",
    country: "France",
  },
  {
    title: "Bastille Modern Loft",
    description:
      "Contemporary loft near Place de la Bastille with exposed brick and industrial design.",
    image: {
      filename: "image-53.jpg",
      url: "/images/listings/image-53.jpg",
    },
    price: 91000,
    location: "Paris",
    country: "France",
  },
  {
    title: "Louvre Museum Apartment",
    description:
      "Historic apartment with views of the Louvre courtyard and Tuileries Garden.",
    image: {
      filename: "image-54.jpg",
      url: "/images/listings/image-54.jpg",
    },
    price: 95000,
    location: "Paris",
    country: "France",
  },
  {
    title: "Canal Saint-Martin Houseboat",
    description:
      "Unique houseboat on Canal Saint-Martin in the hip 10th arrondissement.",
    image: {
      filename: "image-55.jpg",
      url: "/images/listings/image-55.jpg",
    },
    price: 97000,
    location: "Paris",
    country: "France",
  },
  // Additional Bali listings
  {
    title: "Ubud Rice Terrace Villa",
    description:
      "Luxurious villa overlooking Tegallalang rice terraces with infinity pool.",
    image: {
      filename: "image-56.jpg",
      url: "/images/listings/image-56.jpg",
    },
    price: 74000,
    location: "Bali",
    country: "Indonesia",
  },
  {
    title: "Seminyak Beach Club Villa",
    description:
      "Beachfront villa in trendy Seminyak with private beach club access.",
    image: {
      filename: "image-57.jpg",
      url: "/images/listings/image-57.jpg",
    },
    price: 91000,
    location: "Bali",
    country: "Indonesia",
  },
  {
    title: "Canggu Surf House",
    description:
      "Surfer's paradise villa steps from Echo Beach with outdoor shower.",
    image: {
      filename: "image-58.jpg",
      url: "/images/listings/image-58.jpg",
    },
    price: 57000,
    location: "Bali",
    country: "Indonesia",
  },
  {
    title: "Uluwatu Cliff Villa",
    description:
      "Dramatic cliffside villa with ocean views and access to hidden beaches.",
    image: {
      filename: "image-59.jpg",
      url: "/images/listings/image-59.jpg",
    },
    price: 81000,
    location: "Bali",
    country: "Indonesia",
  },
  {
    title: "Sanur Sunrise Villa",
    description:
      "Peaceful villa in traditional Sanur with sunrise beach views.",
    image: {
      filename: "image-60.jpg",
      url: "/images/listings/image-60.jpg",
    },
    price: 85000,
    location: "Bali",
    country: "Indonesia",
  },
  {
    title: "Nusa Dua Luxury Resort Villa",
    description:
      "5-star resort villa in Nusa Dua with butler service and private beach.",
    image: {
      filename: "image-61.jpg",
      url: "/images/listings/image-61.jpg",
    },
    price: 92000,
    location: "Bali",
    country: "Indonesia",
  },
  {
    title: "Jimbaran Seafood Bay Villa",
    description:
      "Beachside villa near famous seafood restaurants on Jimbaran Bay.",
    image: {
      filename: "image-62.jpg",
      url: "/images/listings/image-62.jpg",
    },
    price: 58000,
    location: "Bali",
    country: "Indonesia",
  },
  {
    title: "Sidemen Valley Eco Lodge",
    description:
      "Sustainable bamboo villa in pristine Sidemen Valley with mountain views.",
    image: {
      filename: "image-63.jpg",
      url: "/images/listings/image-63.jpg",
    },
    price: 75000,
    location: "Bali",
    country: "Indonesia",
  },
  // Additional Dubai listings
  {
    title: "Burj Khalifa Sky Apartment",
    description:
      "Ultra-luxury apartment in Burj Khalifa with panoramic city views from the 120th floor.",
    image: {
      filename: "image-64.jpg",
      url: "/images/listings/image-64.jpg",
    },
    price: 62000,
    location: "Dubai",
    country: "United Arab Emirates",
  },
  {
    title: "Palm Jumeirah Beach Villa",
    description:
      "Exclusive beachfront villa on the Palm with private beach and pool.",
    image: {
      filename: "image-65.jpg",
      url: "/images/listings/image-65.jpg",
    },
    price: 92000,
    location: "Dubai",
    country: "United Arab Emirates",
  },
  {
    title: "Dubai Marina Yacht View Penthouse",
    description:
      "Modern penthouse overlooking Dubai Marina with yacht club membership.",
    image: {
      filename: "image-66.jpg",
      url: "/images/listings/image-66.jpg",
    },
    price: 86000,
    location: "Dubai",
    country: "United Arab Emirates",
  },
  {
    title: "Downtown Dubai Luxury Apartment",
    description:
      "Premium apartment near Dubai Mall and Dancing Fountains.",
    image: {
      filename: "image-67.jpg",
      url: "/images/listings/image-67.jpg",
    },
    price: 64000,
    location: "Dubai",
    country: "United Arab Emirates",
  },
  {
    title: "Jumeirah Beach Residence",
    description:
      "Beachfront apartment in JBR with access to The Walk promenade.",
    image: {
      filename: "image-68.jpg",
      url: "/images/listings/image-68.jpg",
    },
    price: 70000,
    location: "Dubai",
    country: "United Arab Emirates",
  },
  {
    title: "Arabian Ranches Desert Villa",
    description:
      "Spacious villa in Arabian Ranches with golf course views and desert landscape.",
    image: {
      filename: "image-69.jpg",
      url: "/images/listings/image-69.jpg",
    },
    price: 40000,
    location: "Dubai",
    country: "United Arab Emirates",
  },
  {
    title: "Business Bay High-Rise",
    description:
      "Contemporary apartment in Business Bay with Canal views and metro access.",
    image: {
      filename: "image-70.jpg",
      url: "/images/listings/image-70.jpg",
    },
    price: 69000,
    location: "Dubai",
    country: "United Arab Emirates",
  },
  {
    title: "Dubai Creek Waterfront Home",
    description:
      "Traditional-modern home on Dubai Creek with dhow cruise views.",
    image: {
      filename: "image-71.jpg",
      url: "/images/listings/image-71.jpg",
    },
    price: 76000,
    location: "Dubai",
    country: "United Arab Emirates",
  },
  // Additional listings (72-100)
  {
    title: "Barcelona Gothic Quarter Loft",
    description:
      "Historic loft in Barcelona's Gothic Quarter with original medieval architecture and modern amenities.",
    image: {
      filename: "image-72.jpg",
      url: "/images/listings/image-72.jpg",
    },
    price: 93000,
    location: "Barcelona",
    country: "Spain",
  },
  {
    title: "Cape Town Sea Point Apartment",
    description:
      "Stylish apartment with breathtaking Atlantic Ocean views and close to beaches.",
    image: {
      filename: "image-73.jpg",
      url: "/images/listings/image-73.jpg",
    },
    price: 91000,
    location: "Cape Town",
    country: "South Africa",
  },
  {
    title: "Amsterdam Canal House",
    description:
      "Charming 17th-century canal house with stunning views of Amsterdam's famous waterways.",
    image: {
      filename: "image-74.jpg",
      url: "/images/listings/image-74.jpg",
    },
    price: 88000,
    location: "Amsterdam",
    country: "Netherlands",
  },
  {
    title: "Sydney Harbour Bridge View",
    description:
      "Modern apartment with spectacular views of Sydney Harbour Bridge and Opera House.",
    image: {
      filename: "image-75.jpg",
      url: "/images/listings/image-75.jpg",
    },
    price: 62000,
    location: "Sydney",
    country: "Australia",
  },
  {
    title: "Rome Trastevere Studio",
    description:
      "Cozy studio in the heart of Rome's vibrant Trastevere neighborhood.",
    image: {
      filename: "image-76.jpg",
      url: "/images/listings/image-76.jpg",
    },
    price: 50000,
    location: "Rome",
    country: "Italy",
  },
  {
    title: "Iceland Northern Lights Cabin",
    description:
      "Remote cabin perfect for viewing Northern Lights with geothermal hot tub.",
    image: {
      filename: "image-77.jpg",
      url: "/images/listings/image-77.jpg",
    },
    price: 73000,
    location: "Reykjavik",
    country: "Iceland",
  },
  {
    title: "Mexico City Historic Centro",
    description:
      "Beautiful colonial apartment in Mexico City's historic center near Zocalo.",
    image: {
      filename: "image-78.jpg",
      url: "/images/listings/image-78.jpg",
    },
    price: 31000,
    location: "Mexico City",
    country: "Mexico",
  },
  {
    title: "Istanbul Bosphorus Penthouse",
    description:
      "Luxury penthouse overlooking the Bosphorus with panoramic city and sea views.",
    image: {
      filename: "image-79.jpg",
      url: "/images/listings/image-79.jpg",
    },
    price: 82000,
    location: "Istanbul",
    country: "Turkey",
  },
  {
    title: "New Zealand Lake Retreat",
    description:
      "Stunning lakeside retreat in Queenstown with mountain views and water activities.",
    image: {
      filename: "image-80.jpg",
      url: "/images/listings/image-80.jpg",
    },
    price: 37000,
    location: "Queenstown",
    country: "New Zealand",
  },
  {
    title: "Morocco Marrakech Riad",
    description:
      "Traditional riad in Marrakech medina with rooftop terrace and authentic Moroccan decor.",
    image: {
      filename: "image-81.jpg",
      url: "/images/listings/image-81.jpg",
    },
    price: 68000,
    location: "Marrakech",
    country: "Morocco",
  },
  {
    title: "Vienna Historic Palace Suite",
    description:
      "Elegant suite in restored 18th-century palace near Vienna's cultural landmarks.",
    image: {
      filename: "image-82.jpg",
      url: "/images/listings/image-82.jpg",
    },
    price: 75000,
    location: "Vienna",
    country: "Austria",
  },
  {
    title: "Thailand Phuket Beach Villa",
    description:
      "Luxurious beachfront villa in Phuket with private pool and Thai-inspired design.",
    image: {
      filename: "image-83.jpg",
      url: "/images/listings/image-83.jpg",
    },
    price: 78000,
    location: "Phuket",
    country: "Thailand",
  },
  {
    title: "Dublin Georgian Townhouse",
    description:
      "Classic Georgian townhouse in Dublin city center with period features.",
    image: {
      filename: "image-84.jpg",
      url: "/images/listings/image-84.jpg",
    },
    price: 89000,
    location: "Dublin",
    country: "Ireland",
  },
  {
    title: "Los Angeles Hollywood Hills Villa",
    description:
      "Modern villa in Hollywood Hills with infinity pool and city views.",
    image: {
      filename: "image-85.jpg",
      url: "/images/listings/image-85.jpg",
    },
    price: 82000,
    location: "Los Angeles",
    country: "United States",
  },
  {
    title: "Prague Castle District Apartment",
    description:
      "Historic apartment near Prague Castle with views of Old Town.",
    image: {
      filename: "image-86.jpg",
      url: "/images/listings/image-86.jpg",
    },
    price: 26000,
    location: "Prague",
    country: "Czech Republic",
  },
  {
    title: "Buenos Aires Palermo Loft",
    description:
      "Trendy loft in Buenos Aires' hip Palermo Soho neighborhood.",
    image: {
      filename: "image-87.jpg",
      url: "/images/listings/image-87.jpg",
    },
    price: 64000,
    location: "Buenos Aires",
    country: "Argentina",
  },
  {
    title: "Edinburgh Old Town Flat",
    description:
      "Traditional Scottish flat on the Royal Mile with castle views.",
    image: {
      filename: "image-88.jpg",
      url: "/images/listings/image-88.jpg",
    },
    price: 73000,
    location: "Edinburgh",
    country: "United Kingdom",
  },
  {
    title: "Rio de Janeiro Copacabana Beach",
    description:
      "Beachfront apartment on famous Copacabana Beach with stunning ocean views.",
    image: {
      filename: "image-89.jpg",
      url: "/images/listings/image-89.jpg",
    },
    price: 100000,
    location: "Rio de Janeiro",
    country: "Brazil",
  },
  {
    title: "Singapore Marina Bay Suite",
    description:
      "Ultra-modern suite overlooking Marina Bay with skyline views.",
    image: {
      filename: "image-90.jpg",
      url: "/images/listings/image-90.jpg",
    },
    price: 61000,
    location: "Singapore",
    country: "Singapore",
  },
  {
    title: "Lisbon Alfama District Home",
    description:
      "Charming home in Lisbon's historic Alfama with Tagus River views.",
    image: {
      filename: "image-91.jpg",
      url: "/images/listings/image-91.jpg",
    },
    price: 83000,
    location: "Lisbon",
    country: "Portugal",
  },
  {
    title: "Miami South Beach Art Deco",
    description:
      "Restored Art Deco apartment steps from South Beach with ocean access.",
    image: {
      filename: "image-92.jpg",
      url: "/images/listings/image-92.jpg",
    },
    price: 71000,
    location: "Miami",
    country: "United States",
  },
  {
    title: "Seoul Gangnam Modern Apartment",
    description:
      "Sleek apartment in Seoul's trendy Gangnam district with city views.",
    image: {
      filename: "image-93.jpg",
      url: "/images/listings/image-93.jpg",
    },
    price: 77000,
    location: "Seoul",
    country: "South Korea",
  },
  {
    title: "Copenhagen Nyhavn Waterfront",
    description:
      "Colorful waterfront apartment in Copenhagen's iconic Nyhavn harbor.",
    image: {
      filename: "image-94.jpg",
      url: "/images/listings/image-94.jpg",
    },
    price: 83000,
    location: "Copenhagen",
    country: "Denmark",
  },
  {
    title: "Vancouver Coal Harbour Condo",
    description:
      "Luxury condo in Vancouver's Coal Harbour with mountain and ocean views.",
    image: {
      filename: "image-95.jpg",
      url: "/images/listings/image-95.jpg",
    },
    price: 77000,
    location: "Vancouver",
    country: "Canada",
  },
  {
    title: "Bangkok Sukhumvit Sky Suite",
    description:
      "High-rise suite on Sukhumvit Road with rooftop pool and city panoramas.",
    image: {
      filename: "image-96.jpg",
      url: "/images/listings/image-96.jpg",
    },
    price: 85000,
    location: "Bangkok",
    country: "Thailand",
  },
  {
    title: "Stockholm Gamla Stan Apartment",
    description:
      "Historic apartment in Stockholm's Old Town with Baltic Sea views.",
    image: {
      filename: "image-97.jpg",
      url: "/images/listings/image-97.jpg",
    },
    price: 32000,
    location: "Stockholm",
    country: "Sweden",
  },
  {
    title: "San Francisco Painted Lady",
    description:
      "Classic Victorian 'Painted Lady' house with Golden Gate views.",
    image: {
      filename: "image-98.jpg",
      url: "/images/listings/image-98.jpg",
    },
    price: 40000,
    location: "San Francisco",
    country: "United States",
  },
  {
    title: "Malta Valletta Harbor View",
    description:
      "Historic apartment overlooking Valletta's Grand Harbor in UNESCO heritage site.",
    image: {
      filename: "image-99.jpg",
      url: "/images/listings/image-99.jpg",
    },
    price: 75000,
    location: "Valletta",
    country: "Malta",
  },
  {
    title: "Hong Kong Victoria Peak Residence",
    description:
      "Exclusive residence on Victoria Peak with spectacular harbor and skyline views.",
    image: {
      filename: "image-100.jpg",
      url: "/images/listings/image-100.jpg",
    },
    price: 33000,
    location: "Hong Kong",
    country: "China",
  }
];

module.exports = sampleListings;

