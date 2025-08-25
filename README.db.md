# DB

## user

CREATE TABLE user(
    user_id varchar(50) primary key, 
    user_pw varchar(200) not null,
    user_name varchar(50) NOT NULL,
    profile_image varchar(255),
    registration_date DATETIME NOT NULL
    );

## user_info

CREATE TABLE user_info(
    user_id VARCHAR(50),
    age int not null,
    height int not null,
    weight int not null,
    sex boolean not null,
    preg boolean,
    dis varchar(200),
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-# 성별 논리값 {남 : 1, 여 : 0}

## eating_history

CREATE TABLE eating_history (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    health_score float,
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
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

## ranking_log

CREATE TABLE ranking_log (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, -- 자동 증가 기본키
    user_id VARCHAR(50) NOT NULL, -- 사용자 ID
    ranking_type ENUM('daily', 'weekly', 'monthly') NOT NULL, -- 랭킹 종류
    score FLOAT NOT NULL, -- 해당 시점의 평균 건강 점수
    rank_date DATE NOT NULL, unique -- 점수가 집계된 날짜
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

## board

CREATE TABLE  board(
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME
);

## comment

create table comment(
	comment_id int auto_increment primary key,
    post_id int,
    user_id varchar(50),
    content text not null,
    created_at datetime,
    foreign key (post_id) references board(post_id)
);
