# backend

## LOGIN
http://localhost:3000/api/user/login
method: POST
{"user_id":"userid","user_pw":"userpw"}
=> {"msg":"Login successful","token":"토큰","user":{"id":"아이디","name":"이름"}}

## REGISTER
http://localhost:3000/api/user/register
method: POST
{"user_id":"userid","user_pw":"userpw","user_name":"username"}
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
-H "Authorization: Bearer 토큰"
=> { msg: 'Profile image uploaded successfully', image_url: imagePath }

## 제품 이미지 업로드
http://localhost:3000/api/user/upload_product_image
method: POST
-H "Authorization: Bearer 토큰"
=>


# DB

## user
user_id varchar(50) primary key, 
user_pw varchar(200) not null,
user_name varchar(50) NOT NULL,
profile_image varchar(255),
registration_date DATETIME NOT NULL

## user_info

user_id VARCHAR(50),
age int not null,
height int not null,
weight int not null,
sex boolean not null,
preg boolean,
dis varchar(200)

-# 성별 논리값 {남 : 1, 여 : 0}

## eating_history

user_id varchar(50) PRIMARY KEY,
eating_time DATETIME NOT NULL,
food_name VARCHAR(30),
calories FLOAT NOT NULL,
protien FLOAT NOT NULL,
fat FLOAT NOT NULL,
carbohydrate FLOAT NOT NULL,
sugar FLOAT NOT NULL,
sodium FLOAT NOT NULL,
cholestrol FLOAT NOT NULL,
saturated_fat FLOAT NOT NULL,
trans_fat FLOAT NOT NULL,
food_weight varchar(50),
product_image varchar(255),
nutrient_image VARCHAR(255) NOT NULL



