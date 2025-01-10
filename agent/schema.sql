-- Create tables for coffee shop database

-- Brewing Methods
CREATE TABLE brewing_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    grind_size VARCHAR(50) NOT NULL,
    water_temp VARCHAR(50) NOT NULL,
    brew_time VARCHAR(50) NOT NULL
);

-- Brewing Ratios
CREATE TABLE brewing_ratios (
    id SERIAL PRIMARY KEY,
    strength VARCHAR(20) NOT NULL,
    ratio INTEGER NOT NULL
);

-- Store Locations
CREATE TABLE store_locations (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    hours VARCHAR(100) NOT NULL,
    specialties TEXT NOT NULL,
    parking TEXT NOT NULL
);

-- Shipping Regions
CREATE TABLE shipping_regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    standard_delivery VARCHAR(100) NOT NULL,
    express_delivery VARCHAR(100) NOT NULL,
    cost TEXT NOT NULL,
    notes TEXT NOT NULL
);

-- Support Categories
CREATE TABLE support_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    message TEXT NOT NULL,
    timeline VARCHAR(100) NOT NULL,
    additional_info TEXT NOT NULL
);

-- Coffee Club Benefits
CREATE TABLE coffee_club_benefits (
    id SERIAL PRIMARY KEY,
    benefit TEXT NOT NULL
); 
