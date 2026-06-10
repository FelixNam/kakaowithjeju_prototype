# 이미지 매니페스트 — 배포용 고화질 교체 가이드

각 슬롯은 이제 `images/` 폴더의 **실제 파일을 `src=`로 연결**합니다.
저장 한계(단일 2MB)와 무관하므로, 아래 파일을 **같은 이름의 고화질 원본으로 덮어쓰기**만 하면
브라우저가 원본 해상도 그대로 렌더링합니다.

## 권장 해상도 (자글거림 없이 깔끔하게)

| 파일 | 용도 | 권장 최대 변 | 포맷 |
|---|---|---|---|
| `images/suwolbong-dusk.png` | 히어로 풀스크린 배경 | **1920px** | JPG/WebP 권장 |
| `images/ch01-coast-debris.jpg` | CH01 게이트 풀블리드 배경 | **1920px** | JPG q80–85 |
| `images/ch02-chagwido.jpg` | CH02 게이트 풀블리드 배경 | **1920px** | JPG q80–85 |
| `images/ch03-trekking.jpg` | CH03 게이트 풀블리드 배경 | **1920px** | JPG q80–85 |
| `images/q1-debris.jpg` | CH01 스티키 교차 이미지 1 | 1400px | JPG q85 |
| `images/q1-cliff.jpg` | CH01 스티키 교차 이미지 2 | 1400px | JPG q85 |
| `images/q1-strata.jpg` | CH01 스티키 교차 이미지 3 | 1400px | JPG q85 |
| `images/gallery-01.jpg` | 가로 갤러리 카드 1 | 1200px | JPG q85 |

## 아직 비어 있는 슬롯 (드래그로 채우거나, 같은 방식으로 src 연결 요청)

- `img-gate-ch05` — CH04(변화와 동행) 게이트 배경
- `img-support` — CH04 본문 와이드 컷
- `img-gate` — CH05(새로운 시선) 선언 게이트 배경
- 갤러리 2~4 (`img-g2`, `img-g3`, `img-g4`)

> 이 슬롯들에 고화질 파일을 쓰고 싶으면, 원본을 주시면 위와 동일하게 `images/`에 넣고 `src=` 연결해 드립니다.

## 메모
- **PNG보다 JPG/WebP** 권장 — 사진은 JPG가 같은 화질에 용량이 훨씬 작습니다.
- 풀블리드 배경은 1920px면 충분하며, 그 이상은 체감 차이 대비 용량만 커집니다.
- 파일명을 **그대로 유지**하면 HTML 수정 없이 교체됩니다.
