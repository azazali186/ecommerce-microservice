-- User table creation
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255),
    username VARCHAR(255)
);

-- Product table creation
CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    productId VARCHAR(255),
    name VARCHAR(255),
    description TEXT
);

-- Permission table creation
CREATE TABLE permissions (
    id VARCHAR(255) PRIMARY KEY,
    path VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    guard VARCHAR(255) NOT NULL DEFAULT 'web',
    createdAt TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP NOT NULL
);

-- Intraction table creation
CREATE TABLE intractions (
    id VARCHAR(255) PRIMARY KEY,
    rating FLOAT DEFAULT 0.0,
    userId VARCHAR(255) NOT NULL,
    productId VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (productId) REFERENCES products(id)
);
