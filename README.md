# Chazadang API Documentation

Welcome to the official API documentation for the Chazadang application. This guide provides all the information you need to interact with the API endpoints.

## Base URL

All API endpoints are relative to the following base URL:

`https://localhost:3000`

## Authentication

Most endpoints require authentication using a JSON Web Token (JWT). To authenticate your requests, include an `Authorization` header with the value `Bearer YOUR_JWT_TOKEN`.


Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...


---

## 1. Authentication (`/api/auth`)

Handles user registration, login, and ID validation.

### Register
Creates a new user account.

- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Body:**
  ```json
  {
    "user_id": "newuser",
    "user_pw": "password123",
    "user_name": "강재성",
    "age": 25,
    "height": 180,
    "weight": 75,
    "sex": 1,
    "preg": 0,
    "dis": "없음"
  }

    Success Response (201):

    {
      "msg": "User registered successfully",
      "token": "YOUR_JWT_TOKEN"
    }

Login

Authenticates a user and returns a JWT.

    Method: POST

    Endpoint: /api/auth/login

    Body:

    {
      "user_id": "testuser",
      "user_pw": "password123"
    }

    Success Response (200):

    {
      "msg": "Login successful",
      "token": "YOUR_JWT_TOKEN",
      "user": {
        "id": "testuser",
        "name": "강재성"
      }
    }

Check ID Availability

Checks if a user ID is already taken.

    Method: POST

    Endpoint: /api/auth/check-id

    Body:

    {
      "user_id": "newuser"
    }

    Success Response (200):

    {
      "msg": "ID is available"
    }

2. Users (/api/users)

Manages the currently authenticated user's data.
Get My Basic Info

Retrieves basic profile information (ID, name, image).

    Method: GET

    Endpoint: /api/users/me

    Headers: Authorization: Bearer YOUR_JWT_TOKEN

    Success Response (200):

    {
      "id": "jaesung",
      "name": "Jaesung Kang",
      "profile_image": "uploads/profile_images/image-162987...jpg"
    }

Get My Detailed Profile

Retrieves all profile information for the user.

    Method: GET

    Endpoint: /api/users/me/profile

    Headers: Authorization: Bearer YOUR_JWT_TOKEN

    Success Response (200):

    {
      "id": "jaesung",
      "name": "Jaesung Kang",
      "age": 25,
      "height": 180,
      "weight": 75,
      "sex": 1,
      "preg": 0,
      "dis": "없음"
    }

Update My Profile

Updates the authenticated user's profile information.

    Method: PUT

    Endpoint: /api/users/me/profile

    Headers: Authorization: Bearer YOUR_JWT_TOKEN

    Body:

    {
      "user_name": "강재성",
      "age": 26,
      "height": 181,
      "weight": 76,
      "sex": 1,
      "preg": 0,
      "dis": "알러지"
    }

    Success Response (200):

    {
      "msg": "User info updated successfully"
    }

Upload Profile Image

Uploads or updates the user's profile image.

    Method: POST

    Endpoint: /api/users/me/image

    Headers: Authorization: Bearer YOUR_JWT_TOKEN

    Body: multipart/form-data with a field named image.

    Success Response (200):

    {
      "msg": "Profile image uploaded successfully",
      "image_url": "uploads/profile_images/image-162987...jpg"
    }

Get Today's Summary

Retrieves the user's health summary for the current day.

    Method: GET

    Endpoint: /api/users/me/today-summary

    Headers: Authorization: Bearer YOUR_JWT_TOKEN

    Success Response (200):

    {
      "name": "강재성",
      "avg_health_score": 75,
      "totals": {
        "sugar_g": 25,
        "calories_kcal": 1800
      }
    }

Delete Account

Deletes the authenticated user's account.

    Method: DELETE

    Endpoint: /api/users/me

    Headers: Authorization: Bearer YOUR_JWT_TOKEN

    Success Response (200):

    {
      "msg": "Account deleted successfully."
    }

3. Eating History (/api/eating-history)

Manages user's food consumption records.
Get Recent History

Retrieves the most recent eating history records.

    Method: GET

    Endpoint: /api/eating-history/recent?limit=3

    Headers: Authorization: Bearer YOUR_JWT_TOKEN

    Success Response (200):

    {
      "msg": "Successfully fetched recent eating history",
      "recentEatingHistory": [
        {
          "id": 101,
          "eating_time": "2025-08-23T09:00:00.000Z",
          "food_name": "프로틴바",
          "health_score": 85
        }
      ]
    }

Update History Record

Updates a specific eating history record.

    Method: PATCH

    Endpoint: /api/eating-history/:id

    Headers: Authorization: Bearer YOUR_JWT_TOKEN

    Body:

    {
      "rating": 5,
      "review_text": "맛있어요!"
    }

    Success Response (200):

    {
      "msg": "Successfully updated eating history"
    }

Upload Product Image for Analysis

Uploads a product's nutrient information image for analysis.

    Method: POST

    Endpoint: /api/eating-history/product-image

    Headers: Authorization: Bearer YOUR_JWT_TOKEN

    Body: multipart/form-data with a field named image.

    Success Response (200):

    {
      "msg": "Nutrients image uploaded successfully",
      "analyzeResult": { "...": "..." },
      "coupang": "uploads/nutrients_images/image-162987...jpg",
      "health_score": 78
    }

4. Calendar (/api/calendar)

Provides calendar-based views of eating history.
Get History by Date

Retrieves all eating history records for a specific date.

    Method: POST

    Endpoint: /api/calendar/date

    Headers: Authorization: Bearer YOUR_JWT_TOKEN

    Body:

    {
      "date": "2025-08-22"
    }

    Success Response (200):

    [
      {
        "eating_time": "2025-08-22T12:30:00.000Z",
        "food_name": "제로 콜라",
        "calories": 0,
        "...": "..."
      }
    ]

Get Monthly Status

Retrieves which days in a given month have eating records.

    Method: GET

    Endpoint: /api/calendar/status?month=2025-08

    Headers: Authorization: Bearer YOUR_JWT_TOKEN

    Success Response (200):

    {
      "days_with_records": [9, 11, 12, 13, 22]
    }

5. Rankings (/api/rankings)

Provides user rankings based on health scores.
Get Rankings by Period

Retrieves the top 10 users and the current user's rank for a given period.

    Method: GET

    Endpoint: /api/rankings?period=daily (or weekly, monthly)

    Headers: Authorization: Bearer YOUR_JWT_TOKEN

    Success Response (200):

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
        "user_name": "Jaesung Kang",
        "profile_image": "...",
        "score": 82
      }
    }

6. Posts (/api/posts)

Manages the community board posts and comments.
List Posts

Retrieves a paginated list of posts.

    Method: GET

    Endpoint: /api/posts?page=1

    Success Response (200):

    [
      {
        "post_id": 1,
        "title": "첫 번째 게시글",
        "created_at": "2025-08-23T09:00:00.000Z",
        "masked_name": "강*성"
      }
    ]

Get Post Detail

Retrieves a single post and its comments.

    Method: GET

    Endpoint: /api/posts/:id

    Success Response (200):

    {
      "post": {
        "title": "첫 번째 게시글",
        "content": "내용입니다.",
        "user_name": "강재성"
      },
      "comments": [
        {
          "content": "좋은 글이네요!",
          "user_name": "UserB"
        }
      ]
    }

Create Post

Creates a new post.

    Method: POST

    Endpoint: /api/posts

    Headers: Authorization: Bearer YOUR_JWT_TOKEN

    Body:

    {
      "title": "새로운 글 제목",
      "content": "새로운 글 내용입니다."
    }

    Success Response (201):

    {
      "msg": "게시글이 등록되었습니다."
    }

Update Post

Updates an existing post.

    Method: PUT

    Endpoint: /api/posts/:id

    Headers: Authorization: Bearer YOUR_JWT_TOKEN

    Body:

    {
      "title": "수정된 글 제목",
      "content": "수정된 글 내용입니다."
    }

    Success Response (200):

    {
      "msg": "게시글이 수정되었습니다."
    }

Delete Post

Deletes a post.

    Method: DELETE

    Endpoint: /api/posts/:id

    Headers: Authorization: Bearer YOUR_JWT_TOKEN

    Success Response (200):

    {
      "msg": "게시글이 삭제되었습니다."
    }

Create Comment

Adds a comment to a post.

    Method: POST

    Endpoint: /api/posts/:id/comments

    Headers: Authorization: Bearer YOUR_JWT_TOKEN

    Body:

    {
      "content": "댓글 내용입니다."
    }

    Success Response (201):

    {
      "msg": "Comment created successfully",
      "commentId": 123
    }

