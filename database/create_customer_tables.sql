CREATE TABLE IF NOT EXISTS tbl_customers (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    company_name VARCHAR(191) NOT NULL,
    contact_person VARCHAR(191) NOT NULL,
    email VARCHAR(191) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(500) DEFAULT '',
    industry VARCHAR(100) DEFAULT '',
    company_size VARCHAR(50) DEFAULT '',
    revenue VARCHAR(50) DEFAULT '',
    status ENUM('active', 'inactive', 'churned') NOT NULL DEFAULT 'active',
    customer_since DATE DEFAULT NULL,
    last_contact DATE DEFAULT NULL,
    total_spent DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    contract_end_date DATE DEFAULT NULL,
    renewal_status ENUM('upcoming', 'renewed', 'expired') NOT NULL DEFAULT 'upcoming',
    account_manager VARCHAR(191) DEFAULT '',
    satisfaction TINYINT UNSIGNED NOT NULL DEFAULT 3,
    lifetime_value DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    tier ENUM('standard', 'premium', 'enterprise') NOT NULL DEFAULT 'standard',
    nps TINYINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS customer_products (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id INT UNSIGNED NOT NULL,
    product_name VARCHAR(191) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_customer_products_customer_id (customer_id)
);
