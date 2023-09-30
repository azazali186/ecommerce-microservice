CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE permissions (
    id UUID PRIMARY KEY,
    path VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    guard VARCHAR(255) DEFAULT 'web',
    service VARCHAR(255) DEFAULT 'auth-service',
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    roleId UUID REFERENCES roles(id),
    isActive BOOLEAN DEFAULT true,
    accessToken VARCHAR(255),
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE rolePermissions (
    RoleId UUID REFERENCES roles(id),
    PermissionId UUID REFERENCES permissions(id),
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY(RoleId, PermissionId)
);
