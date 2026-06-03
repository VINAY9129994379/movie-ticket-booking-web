-- Movies Table (Matching your TMDB format dummy structure)
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    tmdb_id INT UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    overview TEXT,
    poster_path TEXT,
    backdrop_path TEXT,
    genres JSONB, -- Stores nested array of objects
    casts JSONB,  -- Stores nested array of objects
    release_date DATE,
    original_language VARCHAR(10),
    tagline TEXT,
    vote_average DECIMAL(3,2),
    vote_count INT,
    runtime INT
);

-- Shows Table
CREATE TABLE shows (
    id SERIAL PRIMARY KEY,
    movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
    theater_name VARCHAR(255) NOT NULL,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    ticket_price DECIMAL(10, 2) NOT NULL,
    total_seats INT DEFAULT 60
);

-- Bookings Table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    clerk_user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(100),
    user_email VARCHAR(100),
    show_id INT REFERENCES shows(id) ON DELETE CASCADE,
    seats_booked INT[] NOT NULL, -- Array of numbers e.g. {12, 13, 14}
    total_price DECIMAL(10, 2) NOT NULL,
    booking_status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
