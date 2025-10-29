-- Создание таблиц для педагогической платформы

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица сообщений для чата
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    author VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица статей
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    excerpt TEXT,
    content TEXT,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица материалов в копилке
CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    author VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_url TEXT,
    category VARCHAR(100),
    downloads INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка начальных данных для демонстрации
INSERT INTO messages (author, text, created_at) VALUES 
    ('Анна Петрова', 'Использую метод ассоциаций на уроках истории. Дети запоминают даты через образы!', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
    ('Иван Сергеев', 'Кто-нибудь пробовал применять мнемотехники для изучения иностранных языков?', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
    ('Мария Козлова', 'Отличная идея! У меня есть готовые карточки с ассоциациями, могу поделиться', CURRENT_TIMESTAMP - INTERVAL '30 minutes');

INSERT INTO articles (title, excerpt, author, category, created_at) VALUES 
    ('Основы ассоциативной методики в педагогике', 'Познакомьтесь с фундаментальными принципами метода ассоциаций и его применением в современном образовании.', 'Елена Волкова', 'Теория', CURRENT_TIMESTAMP - INTERVAL '14 days'),
    ('Мнемотехники для запоминания математических формул', 'Практические примеры использования образных ассоциаций для изучения точных наук.', 'Дмитрий Новиков', 'Практика', CURRENT_TIMESTAMP - INTERVAL '17 days'),
    ('Игровые методы обучения через ассоциации', 'Как превратить урок в увлекательное путешествие с помощью ассоциативных игр.', 'Ольга Смирнова', 'Методика', CURRENT_TIMESTAMP - INTERVAL '21 days');

INSERT INTO materials (title, author, file_type, downloads, created_at) VALUES 
    ('Карточки для изучения исторических дат', 'Анна П.', 'PDF', 234, CURRENT_TIMESTAMP - INTERVAL '10 days'),
    ('Презентация: Ассоциации в химии', 'Иван С.', 'PPTX', 189, CURRENT_TIMESTAMP - INTERVAL '15 days'),
    ('Шаблон урока с мнемотехниками', 'Мария К.', 'DOCX', 312, CURRENT_TIMESTAMP - INTERVAL '20 days');