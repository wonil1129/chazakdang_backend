#!/usr/bin/env bash
# 프론트(Flutter) 코드가 보내는 요청을 형식 그대로 재현해 백엔드와 맞는지 확인
B=${BASE_URL:-https://localhost:3443}; C="curl -sk -w \n[%{http_code}]\n"; J='Content-Type: application/json; charset=UTF-8'
step(){ echo; echo "### $1"; }
step "signup_screen: 아이디 확인"; $C $B/api/auth/check-id -H "$J" -d '{"user_id":"carol"}'
step "signup_screen: 회원가입 (숫자도 문자열로 보냄)"; $C $B/api/auth/register -H "$J" -d '{"user_id":"carol","user_pw":"pw1234","user_name":"캐롤","age":"27","height":"160","weight":"50","sex":"0","preg":"0","dis":""}'
step "login_screen: 로그인"; R=$(curl -sk $B/api/auth/login -H "$J" -d '{"user_id":"carol","user_pw":"pw1234"}'); echo "$R" | head -c 200; echo
T=$(echo "$R" | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])'); A="Authorization: Bearer $T"
step "auth_service/account_screen: 상세 프로필"; $C $B/api/users/me/profile -H "$A"
step "account_screen: 프로필 수정 (문자열 값)"; $C -X PUT $B/api/users/me/profile -H "$A" -H 'Content-Type: application/json' -d '{"user_name":"캐롤","age":"28","height":"160","weight":"51","sex":"0","preg":"1","dis":"빈혈"}'
step "account_screen: 프로필 이미지 (field=image)"; $C $B/api/users/me/image -H "$A" -F image=@test/sample.jpg
step "loading_screen: 영양 분석 (image만, eating_percent 없음)"; R=$(curl -sk $B/api/eating-history/product-image -H "$A" -F image=@test/sample.jpg); echo "$R" | python3 -c 'import sys,json;d=json.load(sys.stdin);a=d["analyzeResult"];print({k:a.get(k) for k in ["food_name","nutrient_list","rating","review_text"]}, "health_score", d["health_score"], "coupang", d["coupang"])'
sleep 1
step "home_screen: 오늘 요약 (name, avg_health_score, totals.sugar_g, totals.calories_kcal)"; $C $B/api/users/me/today-summary -H "$A"
step "home_screen: 최근 3개 (recentEatingHistory[].health_score/food_name/nutrient_image)"; curl -sk "$B/api/eating-history/recent?limit=3" -H "$A" | python3 -c 'import sys,json;d=json.load(sys.stdin);print([{k:i.get(k) for k in ["health_score","food_name","nutrient_image","nutrient_list","rating"]} for i in d["recentEatingHistory"]])'
M=$(TZ=Asia/Seoul date +%Y-%m); D=$(TZ=Asia/Seoul date +%F)
step "calendar_screen: 월 상태 (days_with_records)"; $C "$B/api/calendar/status?month=$M" -H "$A" -H 'Accept: application/json'
step "calendar_screen: 날짜별 기록"; curl -sk $B/api/calendar/date -H "$A" -H "$J" -d "{\"date\":\"$D\"}" | head -c 150; echo
for p in daily weekly monthly; do step "ranking_screen: $p (top_10, my_rank)"; $C "$B/api/rankings?period=$p" -H "$A" | head -c 250; echo; done
step "account_screen: 회원 탈퇴 (빈 JSON body)"; $C -X DELETE $B/api/users/me -H "$A" -H "$J" -d '{}'
