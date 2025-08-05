# backend

## LOGIN
http://localhost:3000/api/user/login
method: POST
{"user_id":"userid","user_pw":"userpw"}
=> {"msg":"Login successful","token":"토큰","user":{"id":"아이디","name":"이름"}}

## REGISTER
http://localhost:3000/api/user/register
method: POST
-H "Content-Type: application/json" -d '{"user_id":"아이디","user_pw":"비밀번호","user_name":"이름", "age":"나이", "height":"키","weight":"몸무게","sex":"0 또는 1","preg":"0 또는 1","dis":"텍스트"}'
=> {"msg":"User registered successfully","token":"토큰"}

## 회원탈퇴
http://localhost:3000/api/user/delete_account
method: POST
-H "Authorization: Bearer 토큰"
=> { msg: '회원 탈퇴가 완료되었습니다.' }

## 회원조회
http://localhost:3000/api/user/profile
method: GET
-H "Authorization: Bearer 토큰"
=> {"id":"jaesung","name":"Jaesung Kang"}

## 회원정보조회
http://localhost:3000/api/user/profile/detail
method: POST
-H "Authorization: Bearer 토큰"
=> {
      id: user.user_id,
      name: user.user_name,
      age: user.age,
      height: user.height,
      weight: user.weight,
      sex: user.sex,
      preg: user.preg,
      dis: user.dis,
    }

## 프로필 이미지 업로드
https://localhost:3000/api/user/upload_profile_image
method: POST
-H "Authorization: Bearer 토큰" -F "image=@이미지 경로"
=> { msg: 'Profile image uploaded successfully', image_url: imagePath }

## 제품 이미지 업로드
http://localhost:3000/api/user/upload_product_image
method: POST
-H "Authorization: Bearer 토큰" -F "image=@이미지 경로"
=> {"msg":"Product image uploaded successfully"}

## 중복 ID 확인
http://localhost:3000/api/user/check_id
method: POST
-H "Content-Type: application/json" -d '{"user_id": "user_id"}'
=> {"msg":"ID is available"}

## 회원 정보 수정
http://localhost:3000/api/user/update_info
method: PUT
-H "Authorization: Bearer 토큰" -d '{"user_id":"아이디","user_pw":"비밀번호","user_name":"이름", "age":"나이", "height":"키","weight":"몸무게","sex":"0 또는 1","preg":"0 또는 1","dis":"텍스트"}'

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

create table eating_history(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id varchar(50) NOT NULL,
    eating_time DATETIME NOT NULL DEFAULT NOW(),
    food_name VARCHAR(30),
    calories FLOAT NOT NULL,
    protein FLOAT NOT NULL,
    fat FLOAT NOT NULL,
    carbohydrate FLOAT NOT NULL,
    sugar FLOAT NOT NULL,
    sodium FLOAT NOT NULL,
    cholestrol FLOAT NOT NULL,
    saturated_fat FLOAT NOT NULL,
    trans_fat FLOAT NOT NULL,
    food_weight varchar(50),
    product_image varchar(255),
    nutrient_image VARCHAR(255) NOT NULL,
    nutrient_list VARCHAR(255),
    rating TINYINT UNSIGNED,
    review_text TEXT,
    foreign key (user_id) references user(user_id) on delete cascade
);



