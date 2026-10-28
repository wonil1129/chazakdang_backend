#!/usr/bin/env bash
# 사용법: 서버 실행 후 BASE_URL=https://localhost:3000 ./test/api_test.sh  (test/sample.jpg 필요)
# 차자당 백엔드 API 스모크 테스트
B=${BASE_URL:-https://localhost:3443}; C="curl -sk -w \n[%{http_code}]\n"
J='Content-Type: application/json'
step(){ echo; echo "### $1"; }
step "회원가입 A"; $C $B/api/auth/register -H "$J" -d '{"user_id":"alice","user_pw":"pw1234","user_name":"앨리스","age":25,"height":165,"weight":55,"sex":0,"preg":0,"dis":"없음"}'
step "회원가입 B"; $C $B/api/auth/register -H "$J" -d '{"user_id":"bob","user_pw":"pw1234","user_name":"밥","age":30,"height":180,"weight":80,"sex":1,"preg":0,"dis":"당뇨"}'
step "중복 아이디"; $C $B/api/auth/check-id -H "$J" -d '{"user_id":"alice"}'
step "로그인 실패(비번 틀림)"; $C $B/api/auth/login -H "$J" -d '{"user_id":"alice","user_pw":"wrong"}'
TA=$(curl -sk $B/api/auth/login -H "$J" -d '{"user_id":"alice","user_pw":"pw1234"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')
TB=$(curl -sk $B/api/auth/login -H "$J" -d '{"user_id":"bob","user_pw":"pw1234"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')
A="Authorization: Bearer $TA"; Bh="Authorization: Bearer $TB"
step "토큰 없이 접근"; $C $B/api/users/me
step "내 정보"; $C $B/api/users/me -H "$A"
step "상세 프로필"; $C $B/api/users/me/profile -H "$A"
step "프로필 수정"; $C -X PUT $B/api/users/me/profile -H "$A" -H "$J" -d '{"user_name":"앨리스2","age":26,"height":165,"weight":54,"sex":0,"preg":0,"dis":"없음"}'
step "프로필 이미지 업로드"; $C $B/api/users/me/image -H "$A" -F image=@test/sample.jpg
step "영양성분 이미지 분석(Gemini mock)"; R=$(curl -sk $B/api/eating-history/product-image -H "$A" -F image=@test/sample.jpg -F eating_percent=1 -F is_percent=1); echo "$R" | head -c 600; echo
ID=$(echo "$R" | python3 -c 'import sys,json;print(json.load(sys.stdin)["analyzeResult"]["id"])')
curl -sk $B/api/eating-history/product-image -H "$Bh" -F image=@test/sample.jpg -F eating_percent=50 -F is_percent=1 >/dev/null
sleep 1
step "최근 기록"; $C "$B/api/eating-history/recent?limit=3" -H "$A" | head -c 300; echo
step "기록 상세"; $C $B/api/eating-history/$ID -H "$A" | head -c 300; echo
step "남의 기록 상세(B가 A 기록)"; $C $B/api/eating-history/$ID -H "$Bh"
step "기록 수정"; $C -X PATCH $B/api/eating-history/$ID -H "$A" -H "$J" -d '{"rating":5}'
step "오늘 요약"; $C $B/api/users/me/today-summary -H "$A"
TODAY=$(TZ=Asia/Seoul date +%F); MONTH=$(TZ=Asia/Seoul date +%Y-%m)
step "캘린더 날짜별"; $C $B/api/calendar/date -H "$A" -H "$J" -d "{\"date\":\"$TODAY\"}" | head -c 300; echo
step "캘린더 월 상태"; $C "$B/api/calendar/status?month=$MONTH" -H "$A"
for p in daily weekly monthly; do step "랭킹 $p"; $C "$B/api/rankings?period=$p" -H "$A"; done
step "랭킹 잘못된 period"; $C "$B/api/rankings?period=yearly" -H "$A"
step "문의 작성"; $C $B/api/inquiry -H "$A" -H "$J" -d '{"inquiry_type":"앱기능","title":"질문","content":"내용"}'
step "문의 작성 검증 실패"; $C $B/api/inquiry -H "$A" -H "$J" -d '{"title":"제목만"}'
step "문의 목록"; $C "$B/api/inquiry/List?page=1&limit=8" -H "$A"
QID=$(curl -sk "$B/api/inquiry/List" -H "$A" | python3 -c 'import sys,json;print(json.load(sys.stdin)[0]["id"])')
step "문의 상세(본인)"; $C $B/api/inquiry/$QID -H "$A"
step "문의 상세(다른 사용자 B)"; $C $B/api/inquiry/$QID -H "$Bh"
step "문의 수정(다른 사용자 B)"; $C -X PATCH $B/api/inquiry/$QID -H "$Bh" -H "$J" -d '{"title":"해킹"}'
step "문의 수정(본인)"; $C -X PATCH $B/api/inquiry/$QID -H "$A" -H "$J" -d '{"title":"수정됨"}'
step "문의 삭제(본인)"; $C -X DELETE $B/api/inquiry/$QID -H "$A"
step "기록 삭제"; $C -X DELETE $B/api/eating-history/$ID -H "$A"
step "회원 탈퇴 B"; $C -X DELETE $B/api/users/me -H "$Bh"
