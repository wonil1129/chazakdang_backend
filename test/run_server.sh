#!/usr/bin/env bash
# 테스트 서버 실행 (Gemini mock 적용)
cd "$(dirname "$0")/.." && exec node -r ./test/mock-gemini.js index.js
