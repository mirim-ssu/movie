# 🎬 Movie-Summary: Easy Movie Guide

## 프로젝트 목적
Movie-Summary는 디지털 취약 계층이 영화 정보를 보다 쉽게 이해할 수 있도록 돕기 위해 제작되었습니다.  
영화 제목 검색만으로 포스터와 기본 정보를 제공하고, 선택적으로 AI 요약을 한 화면에서 제공합니다.

---

## 개요
TMDB 영화 데이터를 기반으로 영화를 검색하고,  
사용자가 원할 경우 OpenAI API를 활용해 **한 문장 요약**을 제공하는 웹 애플리케이션입니다.  

모든 외부 API 호출은 서버(API Route)에서 처리하여 보안과 안정성을 고려했습니다.

---

## 주요 기능
- 영화 제목 기반 검색
- 영화 포스터 및 기본 정보 제공
- **버튼 클릭 시에만 실행되는 AI 요약 기능**
- 서버 측 API 처리로 API 키 비노출

---

## 사용 흐름
1. 사용자가 웹 페이지에 접속
2. 영화 제목 입력 후 검색
3. 영화 포스터 및 정보 확인
4. 필요 시 AI 요약 버튼 선택

---

## 기술 구성
- **Framework**: Next.js (App Router)
- **Frontend**: React 기반 UI
- **Backend**: Next.js API Routes
- **External APIs**
  - TMDB Movie API – 영화 데이터 제공
  - OpenAI API – 영화 줄거리 요약

---

## 프로젝트 구조
```text
movie-summary/
├── app/
│   ├── api/
│   │   ├── tmdb/
│   │   │   └── search/route.ts   # TMDB 영화 검색 API
│   │   └── summary/route.ts      # OpenAI 기반 AI 요약 API
│   ├── layout.tsx
│   └── page.tsx                  # 메인 페이지
├── public/
├── .env.local                    # 환경 변수
├── package.json
└── README.md
환경 변수 설정
아래 값들은 .env.local 파일에 설정해야 합니다.

env
코드 복사
TMDB_API_KEY=YOUR_TMDB_API_KEY
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
실행 방법
bash
코드 복사
npm install
npm run dev
브라우저에서 아래 주소로 접속합니다.
👉 http://localhost:3000

주의 사항
OpenAI API 키가 없을 경우 AI 요약 기능은 동작하지 않습니다.
TMDB API 응답 상태에 따라 일부 영화 정보가 누락될 수 있습니다.
본 프로젝트는 데모 및 학습 목적의 개인 프로젝트입니다.