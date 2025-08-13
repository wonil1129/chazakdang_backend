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

## 최근 먹은 음식 기록 조회
https://localhost:3000/api/user/eating_history/recent
method: GET
-H "Authorization: Bearer 토큰" {limit: 3}
=> 
{
  "msg": "Successfully fetched recent eating history",
  "recentEatingHistory": [
    {
      "id": 79,
      "eating_time": "2025-08-13T01:11:52.000Z",
      "food_name": "제로마일드초콜릿",
      "health_score": 32.3564
    }
  ]
}

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

## 일일 랭킹 조회
http://localhost:3000/api/ranking/dailyRanking
method: GET
=> {"rank": "랭킹 순위", "user_name": "이름", "profile_image": "프로필 이미지", "daily_score": "일일 건강 점수"}

## 주간 랭킹 조회
http://localhost:3000/api/ranking/weeklyRanking
method: GET
=> {"rank": "랭킹 순위", "user_name": "이름", "profile_image": "프로필 이미지", "weekly_score": "주간 건강 점수"}


## 월간 랭킹 조회
http://localhost:3000/api/ranking/monthlyRanking
method: GET
=> {"rank": "랭킹 순위", "user_name": "이름", "profile_image": "프로필 이미지", "monthly_score": "월간 건강 점수"}

## 캘린더 조회
http://localhost:3000/api/user/calendar/history
method: GET
-H "Authorization: Bearer 토큰" 
=> {"eating_time": 먹은 시간, "food_name": 음식 이름, "calories": 칼로리, "protein": "단백질", "fat": "지방", "carbohydrate": "탄수화물", "sugar": "당", "sodium": "나트륨"}

## 게시판 등록
http://localhost:3000/api/board/create
method: POST
-H "Authorization: Bearer 토큰" -d '{"user_id": "아이디", "title": "글 제목", "content": "글 내용"}'
=> { "msg": '게시글이 등록되었습니다.'}

## 댓글 등록
http://localhost:3000/api/board/comment
method: POST
-H "Authorization: Bearer 토큰" -d '{"user_id": "아이디",  "content": "댓글 내용"}'
=> { "msg": '댓글이 등록되었습니다.'}

## 게시글 목록 조회
http://localhost:3000/api/board/list
method: GET
-d '{"page": "페이지 번호"}'
=> {"post_id": "게시글 번호", "title": "제목", "created_at": "게시글 생성 일자"}

## 게시글 상세 조회
http://localhost:3000/api/board/detail/:id
method: GET
-d '{"page": "페이지 번호"}'
=> {"post_id": "게시글 번호", "title": "제목", "created_at": "게시글 생성 일자"}

## 게시글 수정
http://localhost:3000/api/board/update/:id
method: PUT
-H "Authorization: Bearer 토큰" -d '{"title": "글 제목", "content": "글 내용"}'
=> {"msg": '게시글이 수정되었습니다.'}

## 게시글 삭제
http://localhost:3000/api/board/delete/:id
method: DELETE
-H "Authorization: Bearer 토큰"
=> {"msg": '게시글이 삭제되었습니다.'}


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



