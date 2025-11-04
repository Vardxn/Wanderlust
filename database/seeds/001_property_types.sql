-- ============================================================================
-- Seed Data: Property Types
-- ============================================================================
-- Common property types for the Wanderlust platform
-- ============================================================================

INSERT INTO property_types (name, description) VALUES
    ('Apartment', 'A self-contained housing unit within a larger building'),
    ('House', 'A standalone residential building'),
    ('Villa', 'A luxurious standalone house, often in a resort setting'),
    ('Cottage', 'A small, cozy dwelling typically in a rural or semi-rural location'),
    ('Condominium', 'A privately owned unit in a complex with shared amenities'),
    ('Townhouse', 'A multi-floor home sharing walls with adjacent properties'),
    ('Loft', 'An open-concept space, often converted from industrial buildings'),
    ('Bungalow', 'A single-story house with a low-pitched roof'),
    ('Cabin', 'A simple dwelling typically in a wooded or mountain area'),
    ('Chalet', 'A wooden house with overhanging eaves, typically in mountains'),
    ('Castle', 'A historic fortified structure or grand residence'),
    ('Treehouse', 'A structure built in or around trees'),
    ('Boat', 'A vessel suitable for accommodation on water'),
    ('Camper/RV', 'A recreational vehicle equipped for camping'),
    ('Tent', 'A portable shelter made of fabric'),
    ('Yurt', 'A circular tent structure with a wooden frame'),
    ('Tipi', 'A conical tent traditionally used by indigenous peoples'),
    ('Igloo', 'A dome-shaped shelter made from snow'),
    ('Cave', 'A natural or man-made underground dwelling'),
    ('Farm Stay', 'Accommodation on a working farm'),
    ('Bed & Breakfast', 'A small lodging establishment with breakfast included'),
    ('Boutique Hotel', 'A small, stylish hotel with personalized service'),
    ('Hostel', 'Budget-friendly shared accommodation'),
    ('Resort', 'A full-service vacation facility'),
    ('Serviced Apartment', 'A furnished apartment with hotel-like services'),
    ('Studio', 'A single large room serving as bedroom and living area'),
    ('Guest Suite', 'A private area within a larger home'),
    ('Guesthouse', 'A separate small house on the property'),
    ('Pension', 'A small family-run hotel'),
    ('Ryokan', 'A traditional Japanese inn')
ON CONFLICT (name) DO NOTHING;
