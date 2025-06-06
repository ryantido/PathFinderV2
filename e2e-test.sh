#!/bin/bash

set -e

API_URL="http://localhost:4000"
EMAIL="e2euser@example.com"
PASSWORD="Test1234"
FIRSTNAME="E2E"
LASTNAME="User"

# Signup
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/signup" -H 'Content-Type: application/json' -d '{"email":"'$EMAIL'","password":"'$PASSWORD'","firstName":"'$FIRSTNAME'","lastName":"'$LASTNAME'"}')
echo "Signup response: $RESPONSE"

# Login
LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" -H 'Content-Type: application/json' -d '{"email":"'$EMAIL'","password":"'$PASSWORD'"}')
echo "Login response: $LOGIN"
TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*"' | cut -d '"' -f4)
USER_ID=$(echo $LOGIN | grep -o '"id":"[^"]*"' | head -1 | cut -d '"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed, no token received."
  exit 1
fi

# Accès protégé : favoris
FAV=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_URL/api/users/$USER_ID/favorites")
CODE=$(echo "$FAV" | tail -n1)
BODY=$(echo "$FAV" | head -n-1)
echo "Favorites response code: $CODE"
echo "Favorites response body: $BODY"
if [ "$CODE" != "200" ]; then
  echo "E2E test: FAIL (favorites route not accessible)"
  exit 1
fi

echo "[TEST] Quiz: récupération d'un quiz et de ses questions..."
QUIZ=$(curl -s "$API_URL/api/quizzes")
QUIZ_ID=$(echo $QUIZ | grep -o '"id":[0-9]*' | head -1 | cut -d ':' -f2)
if [ -z "$QUIZ_ID" ]; then
  echo "E2E test: FAIL (quiz not found)"; exit 1; fi
QUESTIONS=$(curl -s "$API_URL/api/quizzes/$QUIZ_ID/questions")
Q_COUNT=$(echo $QUESTIONS | grep -o '"id":' | wc -l)
echo "Quiz ID: $QUIZ_ID, Questions: $Q_COUNT"
if [ "$Q_COUNT" -lt 2 ]; then
  echo "E2E test: FAIL (not enough questions)"; exit 1; fi

# Simule des réponses (prend la première option à chaque question)
ANSWERS="{"
for i in $(seq 1 $Q_COUNT); do
  if [ $i -gt 1 ]; then ANSWERS+=","; fi
  ANSWERS+="\"$i\":0"
done
ANSWERS+="}"

# Validation JSON (nécessite jq)
echo "$ANSWERS" | jq . > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "E2E test: FAIL (invalid JSON for answers: $ANSWERS)"; exit 1; fi

SCORE=$Q_COUNT

echo "[TEST] Enregistrement du résultat du quiz..."
QUIZ_RESULT=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/quizResults" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"quizId":'$QUIZ_ID',"userId":"'$USER_ID'","resultData":'$ANSWERS',"score":'$SCORE'}')
QR_CODE=$(echo "$QUIZ_RESULT" | tail -n1)
QR_BODY=$(echo "$QUIZ_RESULT" | head -n-1)
echo "Quiz result response code: $QR_CODE"
echo "Quiz result response body: $QR_BODY"
if [ "$QR_CODE" != "200" ]; then
  echo "E2E test: FAIL (quiz result not saved)"; exit 1; fi

# Récupère un job
JOBS=$(curl -s "$API_URL/api/jobs")
JOB_ID=$(echo $JOBS | grep -o '"id":[0-9]*' | head -1 | cut -d ':' -f2)
if [ -z "$JOB_ID" ]; then echo "E2E test: FAIL (no job found)"; exit 1; fi

echo "[TEST] Postuler à un job..."
APPLY=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/jobs/$JOB_ID/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"Candidature automatique E2E"}')
APPLY_CODE=$(echo "$APPLY" | tail -n1)
APPLY_BODY=$(echo "$APPLY" | head -n-1)
echo "Apply response code: $APPLY_CODE"
echo "Apply response body: $APPLY_BODY"
if [ "$APPLY_CODE" != "200" ]; then
  echo "E2E test: FAIL (job application failed)"; exit 1; fi

echo "E2E test: SUCCESS (signup, login, quiz, quiz result, job application, accès protégé OK)" 