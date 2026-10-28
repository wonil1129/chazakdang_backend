-- 차자당 DB 스키마 (README.db.md 기준, ranking_log 문법 오류 수정)
CREATE TABLE IF NOT EXISTS user (
    user_id VARCHAR(50) PRIMARY KEY,
    user_pw VARCHAR(200) NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    profile_image VARCHAR(255),
    registration_date DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS user_info (
    user_id VARCHAR(50) PRIMARY KEY,
    age INT NOT NULL,
    height INT NOT NULL,
    weight INT NOT NULL,
    sex BOOLEAN NOT NULL,          -- 남 1, 여 0
    preg BOOLEAN,
    dis VARCHAR(200),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS eating_history (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    health_score FLOAT,
    user_id VARCHAR(50) NOT NULL,
    eating_time DATETIME NOT NULL DEFAULT NOW(),
    food_name VARCHAR(255),
    calories FLOAT NOT NULL,
    protein FLOAT NOT NULL,
    fat FLOAT NOT NULL,
    carbohydrate FLOAT NOT NULL,
    sugar FLOAT NOT NULL,
    sodium FLOAT NOT NULL,
    cholesterol FLOAT NOT NULL,
    saturated_fat FLOAT NOT NULL,
    trans_fat FLOAT NOT NULL,
    food_weight VARCHAR(50),
    product_image VARCHAR(255),
    nutrient_image VARCHAR(255) NOT NULL,
    nutrient_list TEXT,
    rating TINYINT UNSIGNED,
    review_text TEXT,
    eating_percent FLOAT NOT NULL DEFAULT 1.0,
    is_percent BOOL DEFAULT 1,
    INDEX idx_user_time (user_id, eating_time),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- 기간별 랭킹 집계 결과. (user_id, ranking_type, rank_date) 가 같으면 덮어쓴다 (ON DUPLICATE KEY UPDATE)
CREATE TABLE IF NOT EXISTS ranking_log (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    ranking_type ENUM('daily', 'weekly', 'monthly') NOT NULL,
    score FLOAT NOT NULL,
    rank_date DATE NOT NULL,
    UNIQUE KEY uq_ranking (user_id, ranking_type, rank_date),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_inquiry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    inquiry_type ENUM('서비스','앱기능','건강분석','기타') NOT NULL,
    title VARCHAR(100),
    content TEXT,
    created_at DATETIME,
    is_answered TINYINT(1) DEFAULT 0,
    answer TEXT,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);
