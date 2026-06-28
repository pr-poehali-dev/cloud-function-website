CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

INSERT INTO reviews (name, text) VALUES
('Анна', 'Очень приятный и аккуратный сайт. Всё чётко и по делу.'),
('Дмитрий', 'Обратился через форму — ответили быстро. Рекомендую!'),
('Мария', 'Минималистичный дизайн, ничего лишнего. Именно то, что искала.');