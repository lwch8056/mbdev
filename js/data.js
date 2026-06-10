// 카테고리 상수 (필터 칩 / 결과 카드 태그에 사용)
export const CATEGORIES = [
  { id: "korean", label: "한식" },
  { id: "japanese", label: "일식" },
  { id: "chinese", label: "중식" },
  { id: "western", label: "양식" },
  { id: "snack", label: "분식" },
  { id: "fastfood", label: "패스트푸드" },
];

// 조리방식 상수
export const TYPES = [
  { id: "cook", label: "직접 요리" },
  { id: "delivery", label: "배달" },
  { id: "dineout", label: "외식" },
];

// 메뉴 데이터
// { id, name, emoji, category, type, soloFriendly, comment }
export const MENUS = [
  // 한식
  { id: "kimchi-stew", name: "김치찌개", emoji: "🍲", category: "korean", type: "cook", soloFriendly: true, comment: "냉장고 속 김치면 완성, 1인분도 든든." },
  { id: "bibimbap", name: "비빔밥", emoji: "🍚", category: "korean", type: "dineout", soloFriendly: true, comment: "남은 나물 다 넣고 쓱쓱." },
  { id: "soybean-stew", name: "된장찌개", emoji: "🥘", category: "korean", type: "cook", soloFriendly: true, comment: "구수한 한 끼, 밥도둑." },
  { id: "bulgogi", name: "불고기", emoji: "🥩", category: "korean", type: "dineout", soloFriendly: false, comment: "달큰한 양념이 일품." },
  { id: "gukbap", name: "국밥", emoji: "🍜", category: "korean", type: "dineout", soloFriendly: true, comment: "혼밥의 정석, 뜨끈하게." },
  { id: "tteokbokki-rice", name: "제육덮밥", emoji: "🍛", category: "korean", type: "delivery", soloFriendly: true, comment: "매콤하게 배달로 간단히." },

  // 일식
  { id: "ramen", name: "라멘", emoji: "🍜", category: "japanese", type: "dineout", soloFriendly: true, comment: "카운터석에서 후루룩." },
  { id: "sushi", name: "초밥", emoji: "🍣", category: "japanese", type: "delivery", soloFriendly: true, comment: "혼자 즐기는 작은 호사." },
  { id: "donburi", name: "규동", emoji: "🍱", category: "japanese", type: "delivery", soloFriendly: true, comment: "간장 소스 밥 한 그릇." },
  { id: "udon", name: "우동", emoji: "🍲", category: "japanese", type: "cook", soloFriendly: true, comment: "냉동 우동이면 5분 컷." },
  { id: "katsu", name: "돈카츠", emoji: "🍤", category: "japanese", type: "dineout", soloFriendly: true, comment: "바삭한 한 끼의 행복." },
  { id: "onigiri", name: "주먹밥", emoji: "🍙", category: "japanese", type: "cook", soloFriendly: true, comment: "간단하게 손으로 쥐어서." },

  // 중식
  { id: "jjajang", name: "짜장면", emoji: "🍝", category: "chinese", type: "delivery", soloFriendly: true, comment: "혼밥 배달 클래식." },
  { id: "jjamppong", name: "짬뽕", emoji: "🍜", category: "chinese", type: "delivery", soloFriendly: true, comment: "얼큰하게 속을 풀어." },
  { id: "tangsuyuk", name: "탕수육", emoji: "🍖", category: "chinese", type: "dineout", soloFriendly: false, comment: "여럿이 나눠 먹으면 더 좋아." },
  { id: "mapo-tofu", name: "마파두부", emoji: "🥘", category: "chinese", type: "cook", soloFriendly: true, comment: "밥에 비벼 먹기 좋은 매콤함." },
  { id: "fried-rice", name: "볶음밥", emoji: "🍚", category: "chinese", type: "cook", soloFriendly: true, comment: "남은 밥 처리엔 이게 최고." },
  { id: "mara", name: "마라탕", emoji: "🌶️", category: "chinese", type: "dineout", soloFriendly: true, comment: "내 입맛대로 골라 담는 재미." },

  // 양식
  { id: "pasta", name: "파스타", emoji: "🍝", category: "western", type: "cook", soloFriendly: true, comment: "오일이든 토마토든 1인분 완벽." },
  { id: "pizza", name: "피자", emoji: "🍕", category: "western", type: "delivery", soloFriendly: false, comment: "한 판은 혼자 좀 벅찰지도." },
  { id: "steak", name: "스테이크", emoji: "🥩", category: "western", type: "dineout", soloFriendly: false, comment: "특별한 날 나에게 선물." },
  { id: "risotto", name: "리조또", emoji: "🍚", category: "western", type: "cook", soloFriendly: true, comment: "크리미하게 천천히 저어서." },
  { id: "burger-plate", name: "함박스테이크", emoji: "🍳", category: "western", type: "dineout", soloFriendly: true, comment: "밥과 함께 든든하게." },
  { id: "salad", name: "샐러드", emoji: "🥗", category: "western", type: "cook", soloFriendly: true, comment: "가볍게 챙기는 한 끼." },
  { id: "omurice", name: "오므라이스", emoji: "🍳", category: "western", type: "cook", soloFriendly: true, comment: "케첩으로 이름 한 번 적어봐." },

  // 분식
  { id: "tteokbokki", name: "떡볶이", emoji: "🌶️", category: "snack", type: "delivery", soloFriendly: true, comment: "매콤달콤 국룰 간식." },
  { id: "kimbap", name: "김밥", emoji: "🍙", category: "snack", type: "dineout", soloFriendly: true, comment: "혼밥 최강자, 한 줄이면 끝." },
  { id: "sundae", name: "순대", emoji: "🍢", category: "snack", type: "dineout", soloFriendly: true, comment: "떡볶이랑 단짝." },
  { id: "ramyeon", name: "라면", emoji: "🍜", category: "snack", type: "cook", soloFriendly: true, comment: "혼밥의 영원한 친구." },
  { id: "fried-snack", name: "튀김", emoji: "🍤", category: "snack", type: "dineout", soloFriendly: true, comment: "바삭하게 한 입씩." },
  { id: "fish-cake", name: "어묵탕", emoji: "🍢", category: "snack", type: "cook", soloFriendly: true, comment: "따뜻한 국물이 그리울 때." },

  // 패스트푸드
  { id: "burger", name: "햄버거", emoji: "🍔", category: "fastfood", type: "dineout", soloFriendly: true, comment: "혼자 후딱 해치우기 좋아." },
  { id: "chicken", name: "치킨", emoji: "🍗", category: "fastfood", type: "delivery", soloFriendly: false, comment: "한 마리는 좀 많을 수도?" },
  { id: "hotdog", name: "핫도그", emoji: "🌭", category: "fastfood", type: "dineout", soloFriendly: true, comment: "간단하게 한 손으로." },
  { id: "fries", name: "감자튀김", emoji: "🍟", category: "fastfood", type: "delivery", soloFriendly: true, comment: "야식 당길 때 딱." },
  { id: "taco", name: "타코", emoji: "🌮", category: "fastfood", type: "dineout", soloFriendly: true, comment: "가볍게 한두 개 집어." },
  { id: "sandwich", name: "샌드위치", emoji: "🥪", category: "fastfood", type: "cook", soloFriendly: true, comment: "냉장고 재료로 뚝딱." },
];
