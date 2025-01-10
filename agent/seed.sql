-- Seed brewing methods
INSERT INTO brewing_methods (name, grind_size, water_temp, brew_time) VALUES
    ('pourover', 'medium-fine', '195-205°F', '2:30-3:00'),
    ('french-press', 'coarse', '200-205°F', '4:00'),
    ('espresso', 'fine', '195-200°F', '25-30 seconds'),
    ('cold-brew', 'coarse', 'room temperature', '12-24 hours'),
    ('aeropress', 'fine-medium', '185-205°F', '1:30-2:00'),
    ('moka-pot', 'fine', 'off boil', '3:00-4:00');

-- Seed brewing ratios
INSERT INTO brewing_ratios (strength, ratio) VALUES
    ('light', 18),
    ('medium', 16),
    ('strong', 14);

-- Seed store locations
INSERT INTO store_locations (city, neighborhood, address, hours, specialties, parking) VALUES
    ('San Francisco', 'Mission District', '123 Valencia St', '7AM-7PM daily', 'Pour-over bar, roasting facility tours', 'Street parking available'),
    ('San Francisco', 'Hayes Valley', '456 Hayes St', '6AM-6PM daily', 'Espresso tasting flights, pastry program', 'Public garage nearby'),
    ('Portland', 'Pearl District', '789 Pearl St', '6AM-8PM daily', 'Cold brew tower, brewing workshops', 'Free lot parking'),
    ('Seattle', 'Capitol Hill', '321 Pike St', '6AM-8PM daily', 'Single origin flights, roasting demos', 'Street parking and nearby garage'),
    ('Chicago', 'Wicker Park', '555 Milwaukee Ave', '7AM-7PM daily', 'Coffee education center, tasting room', 'Street parking available'),
    ('New York', 'Williamsburg', '888 Bedford Ave', '6AM-8PM daily', 'Specialty drinks, brewing classes', 'Street parking, limited');

-- Seed shipping regions
INSERT INTO shipping_regions (name, standard_delivery, express_delivery, cost, notes) VALUES
    ('USA-West', '2-3 business days', 'Next day delivery', 'Free over $35, otherwise $4.99', 'Orders placed before 2PM PST ship same day'),
    ('USA-Central', '3-4 business days', '2 day delivery', 'Free over $35, otherwise $4.99', 'Orders placed before 2PM CST ship same day'),
    ('USA-East', '3-5 business days', '2-3 day delivery', 'Free over $35, otherwise $4.99', 'Orders placed before 2PM EST ship same day'),
    ('Canada', '5-7 business days', '3-4 business days', 'Free over $49 CAD, otherwise $9.99 CAD', 'Duties and taxes included in price'),
    ('Europe', '7-10 business days', '4-5 business days', 'Free over €50, otherwise €12.99', 'VAT calculated at checkout'),
    ('Asia', '10-14 business days', '5-7 business days', 'Free over $75 USD, otherwise $19.99 USD', 'Import duties may apply'),
    ('Australia', '10-14 business days', '7-8 business days', 'Free over $75 AUD, otherwise $14.99 AUD', 'GST included in price'),
    ('South-America', '12-15 business days', '7-9 business days', '$24.99 USD flat rate', 'Import duties may apply'),
    ('Other', '15-20 business days', '10-12 business days', '$29.99 USD flat rate', 'Import duties may apply');

-- Seed support categories
INSERT INTO support_categories (name, message, timeline, additional_info) VALUES
    ('product', 'We''ll have our coffee experts get back to you with detailed information about our products.', 'within 24 hours', 'In the meantime, you might want to check our coffee guide section on our website.'),
    ('shipping', 'Our logistics team will provide you with specific shipping information for your location.', 'within 12 hours', 'You can also track existing orders on our website using your order number.'),
    ('technical', 'Our technical support team will help you resolve any issues you''re experiencing.', 'within 48 hours', 'For immediate brewing tips, check our troubleshooting guide online.'),
    ('wholesale', 'Our wholesale team will contact you with partnership information.', 'within 2 business days', 'You can review our wholesale program details on our website.'),
    ('other', 'We''ll have our customer support team address your inquiry.', 'within 24 hours', 'Our FAQ section might have the information you''re looking for.');

-- Seed coffee club benefits
INSERT INTO coffee_club_benefits (benefit) VALUES
    ('Fresh roasted coffee delivered on your schedule'),
    ('Member-only discounts'),
    ('Early access to new roasts'),
    ('Free shipping on all deliveries'); 
