# 종목 분석 리포트 — GitHub Pages 사이트

`report/`에 저장된 마크다운 리포트를 핸드폰에서 보기 좋은 웹사이트로 보여줍니다.
종목별 디렉토리 구조(`docs/reports/{종목명}/{날짜}.md`)로 구성됩니다.

## 사이트 다시 만들기

리포트를 추가/수정한 뒤 아래를 실행하면 사이트가 갱신됩니다.

```bash
python3 build_site.py
```

## 로컬에서 미리보기

```bash
cd docs && python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

## GitHub Pages 배포

1. GitHub에 저장소를 만들고 푸시합니다.
   ```bash
   git init
   git add .
   git commit -m "종목 분석 리포트 사이트"
   git branch -M main
   git remote add origin https://github.com/<사용자명>/<저장소>.git
   git push -u origin main
   ```
2. 저장소 **Settings → Pages** 로 이동
3. **Source** 를 `Deploy from a branch` 로 설정
4. **Branch** 를 `main` / 폴더 `/docs` 로 지정 후 Save
5. 잠시 후 `https://<사용자명>.github.io/<저장소>/` 에서 확인 (핸드폰 홈 화면에 추가하면 앱처럼 사용 가능)

## 구조

```
docs/
├── index.html        모바일 SPA
├── manifest.json     종목/리포트 목록 (자동 생성)
├── assets/           스타일·스크립트
└── reports/
    ├── 삼성전자/
    │   └── 2026-06-28.md
    └── 테슬라/
        └── 2026-06-28.md
```
