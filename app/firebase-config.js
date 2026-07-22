// ============================================
// 🔥 Firebase 설정 파일
// ============================================
// 1. https://console.firebase.google.com/ 접속
// 2. 프로젝트 만들기 (무료)
// 3. 웹 앱 추가 → 아래 config 값 복사해서 붙여넣기
// 4. Firestore Database → 만들기 → 테스트 모드
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyB9PwSC4uPumdiRCR7Kuflf38Rn9yVltho",
  authDomain: "nutrition-escape.firebaseapp.com",
  projectId: "nutrition-escape",
  storageBucket: "nutrition-escape.firebasestorage.app",
  messagingSenderId: "230313161821",
  appId: "1:230313161821:web:5f0abb0f0eb6f217cac9b4",
  measurementId: "G-72H697XLQP"
};

// Firebase 초기화 (설정값이 있을 때만)
let db = null;
function initFirebase() {
    try {
        if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('YOUR_')) {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            db = firebase.firestore();
            console.log('✅ Firebase 연결 성공!');
            return true;
        } else {
            console.warn('⚠️ Firebase 설정이 비어있습니다. firebase-config.js를 수정하세요.');
            return false;
        }
    } catch(e) {
        console.error('❌ Firebase 초기화 실패:', e);
        return false;
    }
}
