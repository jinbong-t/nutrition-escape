// ===========================
// 🎓 학생 진행 추적 모듈 (과정중심평가 추가)
// ===========================

let studentId = null;
let studentName = null;
let firebaseReady = false;

// 추가된 데이터 구조
let roomStats = {};
for(let i=1; i<=7; i++) {
    roomStats[i] = {
        entryTime: null,
        clearTime: null,
        questions: {}
    };
}
let r7Data = {
    caloriesInput: null,
    digestionMapping: null,
    deficiencyDiagnosis: null
};

// 학생 세션 초기화
async function initTracker(classNum, name) {
    studentName = name;
    const safeClass = classNum.replace(/\s/g,'_');
    const safeName = name.replace(/\s/g,'_');
    studentId = `${safeClass}_${safeName}_${Date.now()}`;
    
    localStorage.setItem('nutrition_student_class', classNum);
    localStorage.setItem('nutrition_student_name', name);
    localStorage.setItem('nutrition_student_id', studentId);

    if (!db) {
        console.log('[Tracker] 데모 모드 (Firebase 미설정)');
        return;
    }

    try {
        await db.collection('sessions').doc(studentId).set({
            classNum: classNum,
            name: name,
            startedAt: firebase.firestore.FieldValue.serverTimestamp(),
            clearedRooms: [],
            currentStage: '허브 이동 중',
            completed: false,
            score: 0,
            feedback: null,
            rating: null,
            completedAt: null,
            roomStats: roomStats,
            r7Data: r7Data,
            evaluation: {
                knowledge: null,
                application: null,
                attitude: null,
                teacherComment: ""
            }
        });
        firebaseReady = true;
        console.log('[Tracker] ✅ 학생 세션 시작:', name);
    } catch(e) {
        console.error('[Tracker] Firebase 저장 오류:', e);
    }
}

// 방 입장 추적 (추가됨)
window.trackRoomEntry = function(roomNum) {
    if(!roomStats[roomNum].entryTime) {
        roomStats[roomNum].entryTime = Date.now();
        syncStats();
    }
};

// 문제 풀이 추적 (추가됨)
window.trackQuestion = function(roomNum, qNum, isCorrect, studentAnswer) {
    if(!roomStats[roomNum].questions[qNum]) {
        roomStats[roomNum].questions[qNum] = {
            firstTryCorrect: isCorrect,
            attempts: 0,
            lastWrongAnswer: ""
        };
    }
    
    roomStats[roomNum].questions[qNum].attempts += 1;
    if(!isCorrect) {
        roomStats[roomNum].questions[qNum].lastWrongAnswer = studentAnswer;
    }
    syncStats();
};

// 7번방 특수 추적 (추가됨)
window.trackR7 = function(stage, val, isCorrect) {
    if(stage === 1) r7Data.caloriesInput = val;
    if(stage === 2) r7Data.digestionMapping = val;
    if(stage === 3) r7Data.deficiencyDiagnosis = val;
    
    trackQuestion(7, stage, isCorrect, val);
};

// 동기화 헬퍼 (디바운스 처리가 좋지만 일단 단순화)
function syncStats() {
    if (!studentId || !firebaseReady) return;
    db.collection('sessions').doc(studentId).update({
        roomStats: roomStats,
        r7Data: r7Data,
        lastActivity: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(e => console.error('[Tracker] Stats 동기화 오류:', e));
}

// 방 클리어 추적
async function trackRoomClear(roomNum) {
    const roomNames = {
        1: '1방 잠보(탄수화물) ✅',
        2: '2방 여림이(단백질) ✅',
        3: '3방 부풍이(지방) ✅',
        4: '4방 흐림이(비타민) ✅',
        5: '5방 저리(무기질) ✅',
        6: '6방 바싹이(물) ✅'
    };
    
    roomStats[roomNum].clearTime = Date.now();
    
    if (!studentId || !firebaseReady) return;
    try {
        await db.collection('sessions').doc(studentId).update({
            clearedRooms: firebase.firestore.FieldValue.arrayUnion(roomNum),
            currentStage: roomNames[roomNum] || `${roomNum}방 클리어`,
            score: firebase.firestore.FieldValue.increment(15),
            lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
            roomStats: roomStats
        });
    } catch(e) {
        console.error('[Tracker] 방 클리어 저장 오류:', e);
    }
}

// 엔딩 도달 추적
async function trackEnding() {
    roomStats[7].clearTime = Date.now();
    if (!studentId || !firebaseReady) return;
    try {
        await db.collection('sessions').doc(studentId).update({
            clearedRooms: firebase.firestore.FieldValue.arrayUnion(7),
            completed: true,
            currentStage: '🎉 엔딩 도달!',
            completedAt: firebase.firestore.FieldValue.serverTimestamp(),
            score: firebase.firestore.FieldValue.increment(30),
            roomStats: roomStats
        });
    } catch(e) {
        console.error('[Tracker] 엔딩 저장 오류:', e);
    }
}

// 활동 소감 제출
async function submitFeedback(feedbackText, rating) {
    if (!studentId) return;
    localStorage.setItem('nutrition_feedback_submitted', '1');
    if (!firebaseReady) {
        console.log('[Tracker] 데모 소감:', feedbackText, '별점:', rating);
        return;
    }
    try {
        await db.collection('sessions').doc(studentId).update({
            feedback: feedbackText,
            rating: rating,
            feedbackAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('[Tracker] ✅ 소감 제출 완료');
    } catch(e) {
        console.error('[Tracker] 소감 제출 오류:', e);
    }
}
