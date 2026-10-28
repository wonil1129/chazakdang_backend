-- 앱 전용 계정: 이 DB의 데이터 읽기/쓰기만 허용 (root 사용 금지)
-- 비밀번호는 실행 전에 직접 바꾸세요. Docker 등 다른 호스트에서 접속하면 'localhost' 대신 '%'
CREATE USER IF NOT EXISTS 'chazadang_app'@'localhost' IDENTIFIED BY 'CHANGE_ME';
GRANT SELECT, INSERT, UPDATE, DELETE ON chazadang.* TO 'chazadang_app'@'localhost';
FLUSH PRIVILEGES;
