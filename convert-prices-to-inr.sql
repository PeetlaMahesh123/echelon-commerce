-- ===========================================
-- CONVERT ALL PRODUCT PRICES FROM USD TO INR
-- Run this in Supabase Dashboard > SQL Editor
-- ===========================================

-- Exchange rate: 1 USD = 83 INR
-- You can change this value if needed

-- ===========================================
-- STEP 1: Preview Current Prices (USD)
-- ===========================================
SELECT 
    name,
    price as "Price (USD)",
    original_price as "Original Price (USD)",
    created_at
FROM products
ORDER BY created_at DESC
LIMIT 20;

-- ===========================================
-- STEP 2: Convert Prices to INR
-- ===========================================
-- This updates ALL products at once

UPDATE products
SET 
    price = ROUND(price * 83), -- Convert USD to INR
    original_price = CASE 
        WHEN original_price IS NOT NULL 
        THEN ROUND(original_price * 83)
        ELSE NULL
    END;

-- ===========================================
-- STEP 3: Verify Conversion
-- ===========================================
-- Check that prices are now in INR

SELECT 
    name,
    CONCAT('₹', price) as "Price (INR)",
    CASE 
        WHEN original_price IS NOT NULL 
        THEN CONCAT('₹', original_price)
        ELSE 'No discount'
    END as "Original Price (INR)",
    created_at
FROM products
ORDER BY created_at DESC
LIMIT 20;

-- ===========================================
-- STEP 4: Optional - Set Better Price Points
-- ===========================================
-- Indian market prefers charm prices ending in 99 or 999
-- Uncomment if you want to adjust prices:

/*
-- Example: Adjust prices to end with 99
UPDATE products
SET price = CASE
    WHEN price BETWEEN 100 AND 500 THEN ROUND(price / 100) * 100 + 99
    WHEN price BETWEEN 500 AND 1000 THEN ROUND(price / 500) * 500 + 99
    WHEN price > 1000 THEN ROUND(price / 1000) * 1000 + 999
    ELSE price
END;
*/

-- ===========================================
-- EXAMPLE CONVERSIONS
-- ===========================================
/*
Old USD Price  →  New INR Price
$10           →  ₹830
$25           →  ₹2,075
$50           →  ₹4,150
$100          →  ₹8,300
$250          →  ₹20,750
$500          →  ₹41,500
$1000         →  ₹83,000
*/

-- ===========================================
-- DONE!
-- ===========================================
-- Your product prices are now in Indian Rupees!
-- 
-- Next steps:
-- 1. Go to admin panel and verify prices look correct
-- 2. Test adding products to cart
-- 3. Check checkout shows total in ₹
-- 4. Adjust any prices manually if needed
--
-- To access admin:
-- http://localhost:8081/echelon-commerce/admin/products
-- ===========================================
