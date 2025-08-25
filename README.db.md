Chazadang 데이터베이스 문서
===================

이 문서는 Chazadang 애플리케이션의 데이터베이스 스키마를 설명합니다. 각 테이블의 구조와 컬럼의 역할을 명확히 정의합니다.

1\. `user` 테이블
--------------

사용자의 기본 인증 정보와 프로필 데이터를 저장합니다.

|

컬럼명

 |

데이터 타입

 |

제약 조건

 |

설명

 |
|

**user_id**

 |

`VARCHAR(50)`

 |

**Primary Key**

 |

사용자의 고유 식별 아이디

 |
|

**user_pw**

 |

`VARCHAR(200)`

 |

Not Null

 |

해시 처리된 사용자의 비밀번호

 |
|

**user_name**

 |

`VARCHAR(50)`

 |

Not Null

 |

사용자의 이름 또는 닉네임

 |
|

**profile_image**

 |

`VARCHAR(255)`

 |

 |

프로필 이미지 파일의 서버 경로

 |
|

**registration_date**

 |

`DATETIME`

 |

Not Null

 |

계정 생성 일시

 |

2\. `user_info` 테이블
-------------------

사용자의 상세 신체 정보를 저장합니다. `user` 테이블과 1:1 관계를 가집니다.

|

컬럼명

 |

데이터 타입

 |

제약 조건

 |

설명

 |
|

**user_id**

 |

`VARCHAR(50)`

 |

**Primary Key**, **Foreign Key**

 |

`user` 테이블의 `user_id`를 참조

 |
|

**age**

 |

`INT`

 |

Not Null

 |

나이

 |
|

**height**

 |

`INT`

 |

Not Null

 |

신장 (cm)

 |
|

**weight**

 |

`INT`

 |

Not Null

 |

체중 (kg)

 |
|

**sex**

 |

`BOOLEAN`

 |

Not Null

 |

성별 (남자: 1, 여자: 0)

 |
|

**preg**

 |

`BOOLEAN`

 |

 |

임신 여부

 |
|

**dis**

 |

`VARCHAR(200)`

 |

 |

사용자가 가진 질병 정보 (텍스트)

 |

> **참고**: `user` 테이블의 레코드가 삭제되면, `ON DELETE CASCADE` 제약 조건에 따라 이 테이블의 관련 레코드도 함께 삭제됩니다.

3\. `eating_history` 테이블
------------------------

사용자가 섭취한 음식의 상세 정보와 영양 분석 결과를 기록합니다.

|

컬럼명

 |

데이터 타입

 |

제약 조건

 |

설명

 |
|

**id**

 |

`INT`

 |

**Primary Key**, Auto Increment

 |

기록의 고유 번호

 |
|

**health_score**

 |

`FLOAT`

 |

 |

해당 음식의 건강 점수

 |
|

**user_id**

 |

`VARCHAR(50)`

 |

Not Null, **Foreign Key**

 |

`user` 테이블의 `user_id`를 참조

 |
|

**eating_time**

 |

`DATETIME`

 |

Not Null, Default `NOW()`

 |

음식을 섭취한 시간

 |
|

**food_name**

 |

`VARCHAR(255)`

 |

 |

음식 또는 제품의 이름

 |
|

**calories**

 |

`FLOAT`

 |

Not Null

 |

칼로리 (kcal)

 |
|

**protein**

 |

`FLOAT`

 |

Not Null

 |

단백질 (g)

 |
|

**fat**

 |

`FLOAT`

 |

Not Null

 |

지방 (g)

 |
|

**carbohydrate**

 |

`FLOAT`

 |

Not Null

 |

탄수화물 (g)

 |
|

**sugar**

 |

`FLOAT`

 |

Not Null

 |

당류 (g)

 |
|

**sodium**

 |

`FLOAT`

 |

Not Null

 |

나트륨 (mg)

 |
|

**cholesterol**

 |

`FLOAT`

 |

Not Null

 |

콜레스테롤 (mg)

 |
|

**saturated_fat**

 |

`FLOAT`

 |

Not Null

 |

포화지방 (g)

 |
|

**trans_fat**

 |

`FLOAT`

 |

Not Null

 |

트랜스지방 (g)

 |
|

**food_weight**

 |

`VARCHAR(50)`

 |

 |

음식의 총량 (예: "100g")

 |
|

**product_image**

 |

`VARCHAR(255)`

 |

 |

제품 이미지 파일 경로

 |
|

**nutrient_image**

 |

`VARCHAR(255)`

 |

Not Null

 |

영양성분표 이미지 파일 경로

 |
|

**nutrient_list**

 |

`TEXT`

 |

 |

분석된 영양성분 목록 (JSON 형태의 문자열)

 |
|

**rating**

 |

`TINYINT`

 |

 |

사용자가 매긴 평점 (별점)

 |
|

**review_text**

 |

`TEXT`

 |

 |

사용자가 작성한 리뷰 텍스트

 |

4\. `ranking_log` 테이블
---------------------

일간, 주간, 월간 사용자 랭킹 데이터를 저장하여 빠른 조회를 지원합니다.

|

컬럼명

 |

데이터 타입

 |

제약 조건

 |

설명

 |
|

**id**

 |

`INT`

 |

**Primary Key**, Auto Increment

 |

로그의 고유 번호

 |
|

**user_id**

 |

`VARCHAR(50)`

 |

Not Null, **Foreign Key**

 |

`user` 테이블의 `user_id`를 참조

 |
|

**ranking_type**

 |

`ENUM`

 |

Not Null

 |

랭킹 종류 ('daily', 'weekly', 'monthly')

 |
|

**score**

 |

`FLOAT`

 |

Not Null

 |

집계 시점의 평균 건강 점수

 |
|

**rank_date**

 |

`DATE`

 |

Not Null, Unique

 |

점수가 집계된 기준 날짜

 |

5\. `board` 테이블
---------------

커뮤니티 게시판의 게시글 정보를 저장합니다.

|

컬럼명

 |

데이터 타입

 |

제약 조건

 |

설명

 |
|

**post_id**

 |

`INT`

 |

**Primary Key**, Auto Increment

 |

게시글의 고유 번호

 |
|

**user_id**

 |

`VARCHAR(50)`

 |

Not Null

 |

작성자의 `user_id`

 |
|

**title**

 |

`VARCHAR(100)`

 |

Not Null

 |

게시글 제목

 |
|

**content**

 |

`TEXT`

 |

Not Null

 |

게시글 내용

 |
|

**created_at**

 |

`DATETIME`

 |

 |

게시글 작성 일시

 |

6\. `comment` 테이블
-----------------

게시글에 달린 댓글 정보를 저장합니다.

|

컬럼명

 |

데이터 타입

 |

제약 조건

 |

설명

 |
|

**comment_id**

 |

`INT`

 |

**Primary Key**, Auto Increment

 |

댓글의 고유 번호

 |
|

**post_id**

 |

`INT`

 |

**Foreign Key**

 |

`board` 테이블의 `post_id`를 참조

 |
|

**user_id**

 |

`VARCHAR(50)`

 |

 |

작성자의 `user_id`

 |
|

**content**

 |

`TEXT`

 |

Not Null

 |

댓글 내용

 |
|

**created_at**

 |

`DATETIME`

 |

 |

댓글 작성 일시

 |