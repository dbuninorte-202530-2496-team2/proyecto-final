-- Script de inicialización de la base de datos
-- Se ejecuta automáticamente cuando el contenedor de PostgreSQL se crea por primera vez

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserts de ejemplo
INSERT INTO users (username, email) VALUES 
    ('john_doe', 'john@example.com'),
    ('jane_smith', 'jane@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO courses (title, description) VALUES 
    ('English Basics', 'Introduction to English language'),
    ('Advanced Grammar', 'Deep dive into English grammar')
ON CONFLICT DO NOTHING;