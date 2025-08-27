# Chazadang API 문서

Chazadang 애플리케이션의 공식 API 문서입니다. 이 가이드는 API 엔드포인트와 상호작용하는 데 필요한 모든 정보를 제공합니다.

## 기본 URL

모든 API 엔드포인트는 다음 기본 URL을 기준으로 합니다.

`https://localhost:3000` `https://c1a4832edc2e.ngrok-free.app`

## 인증

대부분의 엔드포인트는 JWT(JSON Web Token)를 사용한 인증이 필요합니다. 요청을 인증하려면 `Authorization` 헤더에 `Bearer YOUR_JWT_TOKEN` 값을 포함해야 합니다.

```

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

```

---

1\. 인증 (`/api/auth`)
--------------------

사용자 회원가입, 로그인, 아이디 유효성 검사를 처리합니다.

### 회원가입
새로운 사용자 계정을 생성합니다.

- **메서드:** `POST`
- **엔드포인트:** `/api/auth/register`
- **Body:**
  ```
  {
    "user_id": "newuser",
    "user_pw": "password123",
    "user_name": "UserName",
    "age": 25,
    "height": 180,
    "weight": 75,
    "sex": 1,
    "preg": 0,
    "dis": "없음"
  }
  ```

-   **성공 응답 (201):**

    ```
    {
      "msg": "User registered successfully",
      "token": "YOUR_JWT_TOKEN"
    }

    ```

### 로그인

사용자를 인증하고 JWT를 반환합니다.

-   **메서드:**  `POST`

-   **엔드포인트:**  `/api/auth/login`

-   **Body:**

    ```
    {
      "user_id": "testuser",
      "user_pw": "password123"
    }

    ```

-   **성공 응답 (200):**

    ```
    {
      "msg": "Login successful",
      "token": "YOUR_JWT_TOKEN",
      "user": {
        "id": "testuser",
        "name": "UserName"
      }
    }

    ```

### 아이디 중복 확인

사용자 아이디가 이미 사용 중인지 확인합니다.

-   **메서드:**  `POST`

-   **엔드포인트:**  `/api/auth/check-id`

-   **Body:**

    ```
    {
      "user_id": "newuser"
    }

    ```

-   **성공 응답 (200):**

    ```
    {
      "msg": "ID is available"
    }

    ```

2\. 사용자 (`/api/users`)
----------------------

현재 인증된 사용자의 데이터를 관리합니다.

### 내 기본 정보 조회

기본 프로필 정보(아이디, 이름, 이미지)를 조회합니다.

-   **메서드:**  `GET`

-   **엔드포인트:**  `/api/users/me`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **성공 응답 (200):**

    ```
    {
      "id": "UserID",
      "name": "UserName",
      "profile_image": "uploads/profile_images/image-162987...jpg"
    }

    ```

### 내 상세 정보 조회

사용자의 모든 프로필 정보를 조회합니다.

-   **메서드:**  `GET`

-   **엔드포인트:**  `/api/users/me/profile`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **성공 응답 (200):**

    ```
    {
      "id": "UserID",
      "name": "UserName",
      "age": 25,
      "height": 165,
      "weight": 75,
      "sex": 1,
      "preg": 0,
      "dis": "없음"
    }

    ```

### 내 프로필 수정

인증된 사용자의 프로필 정보를 수정합니다.

-   **메서드:**  `PUT`

-   **엔드포인트:**  `/api/users/me/profile`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **Body:**

    ```
    {
      "user_name": "UserName",
      "age": 26,
      "height": 165,
      "weight": 76,
      "sex": 1,
      "preg": 0,
      "dis": "알러지"
    }

    ```

-   **성공 응답 (200):**

    ```
    {
      "msg": "User info updated successfully"
    }

    ```

### 프로필 이미지 업로드

사용자의 프로필 이미지를 업로드하거나 업데이트합니다.

-   **메서드:**  `POST`

-   **엔드포인트:**  `/api/users/me/image`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **Body:**  `multipart/form-data` 형식, 필드 이름 `image`: 식품 이미지, `eating_percent`: 먹은 양(% 또는 gram), `is_percent`: %로 입력시 1, gram으로 입력시 0

-   **성공 응답 (200):**

    ```
    {
      "msg": "Profile image uploaded successfully",
      "image_url": "uploads/profile_images/image-162987...jpg"
    }

    ```

### 오늘의 요약 조회

사용자의 당일 건강 요약 정보를 조회합니다.

-   **메서드:**  `GET`

-   **엔드포인트:**  `/api/users/me/today-summary`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **성공 응답 (200):**

    ```
    {
      "name": "UserName",
      "avg_health_score": 75,
      "totals": {
        "sugar_g": 25,
        "calories_kcal": 1800,
        "carbohydrate": 123,
        "protein": 123,
        "fat": 123
      }
    }

    ```

### 회원 탈퇴

인증된 사용자의 계정을 삭제합니다.

-   **메서드:**  `DELETE`

-   **엔드포인트:**  `/api/users/me`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **성공 응답 (200):**

    ```
    {
      "msg": "Account deleted successfully."
    }

    ```

3\. 식단 기록 (`/api/eating-history`)
---------------------------------

사용자의 음식 섭취 기록을 관리합니다.

### 최근 기록 조회

가장 최근의 식단 기록을 조회합니다.

-   **메서드:**  `GET`

-   **엔드포인트:**  `/api/eating-history/recent?limit=3`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **성공 응답 (200):**

    ```
    {
      "msg": "Successfully fetched recent eating history",
      "recentEatingHistory": [
        {
          "id": 101,
          "eating_time": "2025-08-23T09:00:00.000Z",
          "food_name": "프로틴바",
          "product_image": "uploads/product_images/...",
          "health_score": 85,
          "nutrient_list": "...",
          "review_text": "...",
          "calories": 200,
          "protein": 20,
          "fat": 8,
          "carbohydrate": 22,
          "sugar": 5,
          "sodium": 150,
          "cholesterol": 75.6,
          "saturated_fat": 23.52,
          "trans_fat": 0.588,
          "food_weight": "168g",
          "product_image": "uploads/product_images/placeholder.jpg",
          "nutrient_image": "uploads/nutrients_images/image-1756254574428-990832697.jpg",
          "nutrient_list": "D-말티톨, 소비톨, 에리스리톨, 수크랄로스, 아세설팜칼륨, 폴리글리시톨",
          "rating": 4,
          "review_text": "이 제품은...",
          "eating_percent": 55,
          "is_percent": 0
        }
      ]
    }

    ```

### 식단 기록 상세 조회

ID로 특정 식단 기록의 모든 정보를 조회합니다.

-   **메서드:**  `GET`

-   **엔드포인트:**  `/api/eating-history/:id`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **성공 응답 (200):**

    ```
    {
      "id": 79,
      "eating_time": "2025-08-22T12:30:00.000Z",
      "food_name": "제로 콜라",
      "product_image": "...",
      "health_score": 90,
      "nutrient_list": "...",
      "review_text": "...",
      "calories": 0,
      "protein": 0,
      "fat": 0,
      "carbohydrate": 0,
      "sugar": 0,
      "sodium": 20
    }

    ```

### 기록 수정

특정 식단 기록을 수정합니다.

-   **메서드:**  `PATCH`

-   **엔드포인트:**  `/api/eating-history/:id`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **Body:**

    ```
    {
      "rating": 5,
      "review_text": "Gemini의 해당 음식 분석 text"
    }

    ```

-   **성공 응답 (200):**

    ```
    {
      "msg": "Successfully updated eating history"
    }

    ```

### 기록 삭제

특정 식단 기록을 삭제합니다.

-   **메서드:**  `DELETE`

-   **엔드포인트:**  `/api/eating-history/:id`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **성공 응답 (200):**

    ```
    {
      "msg": "Successfully deleted eating history"
    }

    ```
### 제품 이미지 분석 요청

분석할 제품의 영양성분표 이미지를 업로드합니다.

-   **메서드:**  `POST`

-   **엔드포인트:**  `/api/eating-history/product-image`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **Body:**  `multipart/form-data` 형식, 필드 이름 `image`.

-   **성공 응답 (200):**

    ```
    {
      "msg": "Nutrients image uploaded successfully",
      "analyzeResult": { "...": "..." },
      "coupang": "uploads/nutrients_images/image-162987...jpg",
      "health_score": 78
    }

    ```

4\. 캘린더 (`/api/calendar`)
-------------------------

캘린더 기반으로 식단 기록을 조회합니다.

### 특정 날짜 기록 조회

지정된 날짜의 모든 식단 기록을 조회합니다.

-   **메서드:**  `POST`

-   **엔드포인트:**  `/api/calendar/date`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **Body:**

    ```
    {
      "date": "2025-08-22"
    }

    ```

-   **성공 응답 (200):**

    ```
    [
      {
        "id": 200,
        "health_score": 17.897,
        "user_id": "jaesung",
        "eating_time": "2025-08-27T00:30:04.000Z",
        "food_name": "제로 초콜릿칩 쿠키",
        "calories": 789.6,
        "protein": 15.12,
        "fat": 43.68,
        "carbohydrate": 100.8,
        "sugar": 0,
        "sodium": 739.2,
        "cholesterol": 75.6,
        "saturated_fat": 23.52,
        "trans_fat": 0.588,
        "food_weight": "168g",
        "product_image": "uploads/product_images/placeholder.jpg",
        "nutrient_image": "uploads/nutrients_images/image-1756254574428-990832697.jpg",
        "nutrient_list": "D-말티톨, 소비톨, 에리스리톨, 수크랄로스, 아세설팜칼륨, 폴리글리시톨",
        "rating": 4,
        "review_text": "test123",
        "eating_percent": 0.8,
        "is_percent": 1
      }
    ]

    ```

### 월별 기록 현황 조회

주어진 월에 식단 기록이 있는 날짜들을 조회합니다.

-   **메서드:**  `GET`

-   **엔드포인트:**  `/api/calendar/status?month=2025-08`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **성공 응답 (200):**

    ```
    {
      "days_with_records": [9, 11, 12, 13, 22]
    }

    ```

5\. 랭킹 (`/api/rankings`)
------------------------

건강 점수 기반의 사용자 랭킹을 제공합니다.

### 기간별 랭킹 조회

주어진 기간(일간/주간/월간)의 상위 10명과 현재 사용자의 랭킹을 조회합니다.

-   **메서드:**  `GET`

-   **엔드포인트:**  `/api/rankings?period=daily` (또는 `weekly`, `monthly`)

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **성공 응답 (200):**

    ```
    {
      "top_10": [
        {
          "rank": 1,
          "user_name": "UserA",
          "profile_image": "...",
          "score": 95
        }
      ],
      "my_rank": {
        "rank": 15,
        "user_name": "UserA",
        "profile_image": "...",
        "score": 82
      }
    }

    ```

6\. 문의 (`/api/inquiry`)
----------------------

1대1 문의 기능

### 사용자 문의 목록 조회

사용자의 문의 목록을 조회합니다.

-   **메서드:**  `GET`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **엔드포인트:**  `/api/inquiry/List?page=1&limit=8`

-   **성공 응답 (200):**

    ```
    [
      {
        "id": 1,
        "title": "첫 번째 게시글",
        "inquiry_type": "서비스",
        "is_answered": "1",
        "created_at": "2025-08-23T09:00:00.000Z"
      }
    ]

    ```

### 문의 상세 조회

단일 문의와 해당 문의의 답변을 조회합니다.

-   **메서드:**  `GET`

-   **엔드포인트:**  `/api/inquiry/:id`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **성공 응답 (200):**

  ```
    
  {
    "id": 3,
    "user_id": "user11",
    "inquiry_type": "서비스",
    "title": "dddddd",
    "content": "ㅇㅇㅇㅇㅇ",
    "created_at": "2025-08-23T04:13:49.000Z",
    "is_answered": 0,
    "answer": null
  }
    

  ```

### 문의 작성

새로운 문의를 작성합니다.

-   **메서드:**  `POST`

-   **엔드포인트:**  `/api/inquiry`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **Body:**

    ```
    {
      "inquiry_type": "문의 종류",
      "title": "새로운 문의 제목",
      "content": "새로운 문의 내용"
    }
    ```

-   **성공 응답 (201):**

    ```
    {
      "msg": "문의가 성공적으로 생성되었습니다."
    }
    ```

---

### 문의 수정

기존 문의를 수정합니다.

-   **메서드:**  `PATCH`

-   **엔드포인트:**  `/api/inquiry/:id`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **Body:**

    ```
    {
      "inquiry_type": "수정 문의 유형",
      "title": "수정할 글 제목",
      "content": "수정할 글 내용입니다."
    }
    ```

-   **성공 응답 (200):**

    ```
    {
      "msg": "문의가 성공적으로 수정되었습니다."
    }
    ```

---

### 게시글 삭제

게시글을 삭제합니다.

-   **메서드:**  `DELETE`

-   **엔드포인트:**  `/api/inquiry/:id`

-   **헤더:**  `Authorization: Bearer YOUR_JWT_TOKEN`

-   **성공 응답 (200):**

    ```
    {
      "msg": "문의가 성공적으로 삭제되었습니다."
    }
    ```
