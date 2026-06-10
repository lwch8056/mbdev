// ===== 앱 설정 =====

// 카카오 JavaScript 키를 아래 따옴표 안에 붙여넣으세요.
//
// 발급 방법(약 3분, 한 번만):
//   1) https://developers.kakao.com 에 카카오 계정으로 로그인
//   2) [내 애플리케이션] → [애플리케이션 추가하기] (이름은 자유)
//   3) [앱 키] 탭의 "JavaScript 키"를 복사해 아래에 붙여넣기
//   4) [플랫폼] → [Web 플랫폼 등록]에 이 앱을 띄울 도메인 추가
//        (로컬 테스트면 http://localhost:8000 등)
//
// 비워두면("") 실제 API 대신 샘플(더미) 식당 데이터로 동작합니다.
// 키를 넣는 순간 같은 화면이 그대로 실제 데이터로 전환됩니다.
export const KAKAO_JS_KEY = "ffadb19e6de2195880957aafe7ef81a1";

// 좌표 기준 검색 반경(m). 동네를 좌표로 변환할 수 있을 때 적용됩니다.
export const SEARCH_RADIUS = 2000;

// 결과로 보여줄 식당 최대 개수
export const MAX_RESULTS = 8;
