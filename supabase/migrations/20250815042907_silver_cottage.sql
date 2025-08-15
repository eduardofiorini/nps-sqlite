/*
  # Remove Stripe Integration Tables

  1. Tables to Remove
    - `stripe_customers` - Customer mapping table
    - `stripe_subscriptions` - Subscription data table  
    - `stripe_orders` - Order history table

  2. Views to Remove
    - `user_subscriptions` - User subscription view
    - `user_orders` - User orders view

  3. Types to Remove
    - `subscription_status` - Subscription status enum
    - `order_status` - Order status enum

  This migration removes all Stripe-related functionality from the database.
*/

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS user_subscriptions;
DROP VIEW IF EXISTS user_orders;

-- Drop tables
DROP TABLE IF EXISTS stripe_orders;
DROP TABLE IF EXISTS stripe_subscriptions;
DROP TABLE IF EXISTS stripe_customers;

-- Drop custom types
DROP TYPE IF EXISTS subscription_status;
DROP TYPE IF EXISTS order_status;