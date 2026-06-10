// 근처 식당 검색 모듈
// - 카카오 JS 키가 있으면 카카오맵 키워드 검색 API로 실제 데이터를 가져온다.
// - 키가 없으면 샘플(더미) 데이터를 반환해 UI를 그대로 확인할 수 있게 한다.
import { KAKAO_JS_KEY, SEARCH_RADIUS, MAX_RESULTS } from "./config.js";

// SDK는 처음 검색할 때 한 번만 로드한다(지연 로딩).
let sdkPromise = null;

// 카카오 키가 설정되어 있는지 여부
export function isApiEnabled() {
  return typeof KAKAO_JS_KEY === "string" && KAKAO_JS_KEY.trim().length > 0;
}

// 카카오맵 JS SDK(services 라이브러리 포함) 로드
function loadKakaoSdk() {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve(window.kakao);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://dapi.kakao.com/v2/maps/sdk.js" +
      `?appkey=${encodeURIComponent(KAKAO_JS_KEY)}` +
      "&autoload=false&libraries=services";
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao));
    script.onerror = () =>
      reject(new Error("카카오 지도 SDK를 불러오지 못했어요. 키와 도메인 등록을 확인해 주세요."));
    document.head.appendChild(script);
  });
  return sdkPromise;
}

// 카카오 장소 데이터를 앱 공통 형태로 정규화
function normalize(place) {
  return {
    name: place.place_name,
    category: shortCategory(place.category_name),
    address: place.road_address_name || place.address_name || "",
    phone: place.phone || "",
    url: place.place_url || "",
    distance: place.distance ? Number(place.distance) : null,
  };
}

// "음식점 > 한식 > 찌개,전골" → "찌개,전골"
function shortCategory(category) {
  if (!category) return "";
  const parts = category.split(">").map((s) => s.trim()).filter(Boolean);
  return parts[parts.length - 1] || category;
}

// 동네 이름 → 좌표(주소 검색). 좌표를 못 찾으면 null.
function geocode(kakao, dong) {
  return new Promise((resolve) => {
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(dong, (result, status) => {
      if (status === kakao.maps.services.Status.OK && result[0]) {
        resolve({ x: result[0].x, y: result[0].y });
      } else {
        resolve(null);
      }
    });
  });
}

// 키워드로 장소 검색. 좌표가 있으면 그 주변을 거리순으로, 없으면 "동네 키워드"로 검색.
function keywordSearch(kakao, dong, keyword, coords) {
  return new Promise((resolve, reject) => {
    const ps = new kakao.maps.services.Places();
    const options = { size: MAX_RESULTS };
    let query = `${dong} ${keyword}`;

    if (coords) {
      query = keyword;
      options.location = new kakao.maps.LatLng(coords.y, coords.x);
      options.radius = SEARCH_RADIUS;
      options.sort = kakao.maps.services.SortBy.DISTANCE;
    }

    ps.keywordSearch(
      query,
      (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
          resolve(data.map(normalize));
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
          resolve([]);
        } else {
          reject(new Error("식당 검색에 실패했어요. 잠시 후 다시 시도해 주세요."));
        }
      },
      options
    );
  });
}

// 동네 + 메뉴로 근처 식당을 검색한다.
// 반환: { usingDummy: boolean, places: [...] }
export async function searchNearby({ dong, keyword }) {
  if (!isApiEnabled()) {
    return { usingDummy: true, places: dummyResults(dong, keyword) };
  }
  const kakao = await loadKakaoSdk();
  const coords = await geocode(kakao, dong);
  const places = await keywordSearch(kakao, dong, keyword, coords);
  return { usingDummy: false, places: places.slice(0, MAX_RESULTS) };
}

// 좌표(현재 위치) + 메뉴로 근처 식당을 검색한다.
// 반환: { usingDummy: boolean, regionName: string, places: [...] }
export async function searchByLocation({ lat, lng, keyword }) {
  if (!isApiEnabled()) {
    return { usingDummy: true, regionName: "내 위치", places: dummyResults("내 위치", keyword) };
  }
  const kakao = await loadKakaoSdk();
  const regionName = await coordToRegion(kakao, lat, lng);
  const places = await keywordSearch(kakao, regionName || "내 위치", keyword, { x: lng, y: lat });
  return { usingDummy: false, regionName, places: places.slice(0, MAX_RESULTS) };
}

// 좌표 → 동네 이름(역지오코딩). 못 찾으면 "".
function coordToRegion(kakao, lat, lng) {
  return new Promise((resolve) => {
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(lng, lat, (result, status) => {
      if (status === kakao.maps.services.Status.OK && result[0]) {
        const addr = result[0].address;
        resolve(addr ? addr.region_3depth_name || addr.region_2depth_name || "" : "");
      } else {
        resolve("");
      }
    });
  });
}

// ===== 샘플(더미) 데이터 =====
// 키가 없을 때 화면 확인용으로 쓰는 가짜 식당 목록.
// 링크는 실제 카카오맵 웹 검색으로 연결해 둬서 그대로도 쓸모 있게 했다.
function dummyResults(dong, keyword) {
  const suffixes = ["맛집", "식당", "본점", "골목집", "명가", "한그릇", "연구소", "키친"];
  const cats = ["한식", "분식", "일식", "백반·가정식", "면류", "찌개·전골"];
  const mapUrl = `https://map.kakao.com/?q=${encodeURIComponent(`${dong} ${keyword}`)}`;

  return suffixes.slice(0, MAX_RESULTS).map((suffix, i) => ({
    name: `${keyword}${suffix}`,
    category: cats[i % cats.length],
    address: `${dong} ${(i + 1) * 13}-${i + 2}`,
    phone: "",
    url: mapUrl,
    distance: (i + 1) * 120 + (i % 3) * 40,
  }));
}
