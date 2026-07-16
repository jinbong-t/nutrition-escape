// --- 상태 변수 ---
let currentScreen = 'intro';
const codes = {
    1: "482",
    2: "197",
    3: "635",
    4: "806"
};

// --- DOM 요소 ---
const introTextEl = document.getElementById('intro-text');
const startBtn = document.getElementById('start-btn');
const modal = document.getElementById('modal');
const modalText = document.getElementById('modal-text');

// --- 공통 기능 ---
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    currentScreen = id;
}

function showModal(msg) {
    modalText.innerText = msg;
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

function checkCode(labNum) {
    const input = document.getElementById(`lab${labNum}-code`).value;
    if (input === codes[labNum]) {
        if (labNum < 4) {
            showScreen(`lab${labNum + 1}`);
        } else {
            showScreen('boss');
        }
    } else {
        showModal("접근 거부: 잘못된 코드입니다.");
        document.getElementById(`lab${labNum}-code`).value = "";
    }
}

// --- 인트로 타이핑 효과 ---
const introStory = `SYSTEM ALERT... 청소년 영양 연구소 메인 서버 다운.
안녕, 신입 연구원. 나는 관리 AI "영양이"야.
누군가 데이터에 접근하려 한 흔적이 발견됐어.
데이터가 통째로 사라지기 전에 여섯 난쟁이의 기록을 4개 실험실에 나눠 숨겨뒀어.
시간이 많지 않아. 준비됐지? 미션을 시작한다.`;

let typeIndex = 0;
function typeWriter() {
    if (typeIndex < introStory.length) {
        introTextEl.innerHTML += introStory.charAt(typeIndex);
        typeIndex++;
        setTimeout(typeWriter, 50);
    } else {
        startBtn.classList.remove('hidden');
    }
}

// --- 실험실 1: 탄수화물 드래그 앤 드롭 ---
const lab1CardsData = [
    { id: 'c1', text: '포도당', type: 'mono' },
    { id: 'c2', text: '과당', type: 'mono' },
    { id: 'c3', text: '설탕', type: 'di' },
    { id: 'c4', text: '유당', type: 'di' },
    { id: 'c5', text: '밥', type: 'poly' },
    { id: 'c6', text: '식이섬유', type: 'poly' },
    { id: 't1', text: '닭가슴살', type: 'trap_protein' },
    { id: 't2', text: '버터', type: 'trap_fat' }
];

const lab1CardsContainer = document.getElementById('lab1-cards');
lab1CardsData.forEach(data => {
    const card = document.createElement('div');
    card.className = 'food-card';
    card.draggable = true;
    card.id = data.id;
    card.innerText = data.text;
    card.dataset.type = data.type;
    card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', card.id);
    });
    lab1CardsContainer.appendChild(card);
});

document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.addEventListener('dragover', e => e.preventDefault());
    zone.addEventListener('drop', e => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('text/plain');
        const card = document.getElementById(cardId);
        
        // 함정 처리
        if (card.dataset.type.startsWith('trap')) {
            showModal("경고: 이 식품은 다른 실험실 소관입니다! (함정 카드 발견)");
            return;
        }
        
        zone.querySelector('.slots').appendChild(card);
        checkLab1Completion();
    });
});

lab1CardsContainer.addEventListener('dragover', e => e.preventDefault());
lab1CardsContainer.addEventListener('drop', e => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    const card = document.getElementById(cardId);
    lab1CardsContainer.appendChild(card);
});

function checkLab1Completion() {
    // 사용자가 카드들을 분류했을 때 숫자 조합 힌트 제공 로직 추가 가능
    // 예: 접시마다 놓인 카드 갯수에 따라 숫자가 나타남 (정답: 4 8 2)
}


// --- 실험실 2: 미러 텍스트 토글 및 논리 퀴즈 ---
document.getElementById('mirror-toggle').addEventListener('click', (e) => {
    const mirrorEl = document.getElementById('nutrition-label');
    mirrorEl.classList.toggle('normal');
    if(mirrorEl.classList.contains('normal')) {
        e.target.innerText = "되돌리기 🪞";
    } else {
        e.target.innerText = "거울 보기 🪞";
    }
});

const quizContainer = document.getElementById('lab2-quiz');
quizContainer.innerHTML = `
    <div class="quiz-item">
        <p>Q1. 상온에서 고체이면서 동물성인 것은?</p>
        <select id="q1-ans">
            <option value="">선택</option>
            <option value="sat">포화지방산</option>
            <option value="unsat">불포화지방산</option>
            <option value="trans">트랜스지방</option>
        </select>
    </div>
    <div class="quiz-item">
        <p>Q2. 체내에서 합성되지 않으면서 등푸른 생선에 많은 것은?</p>
        <select id="q2-ans">
            <option value="">선택</option>
            <option value="omega3">오메가-3</option>
            <option value="trans">트랜스지방</option>
            <option value="coco">코코넛 오일</option>
        </select>
    </div>
    <button class="btn small" onclick="checkLab2Quiz()">퀴즈 확인</button>
`;

function checkLab2Quiz() {
    const q1 = document.getElementById('q1-ans').value;
    const q2 = document.getElementById('q2-ans').value;
    if (q1 === 'sat' && q2 === 'omega3') {
        showModal("퀴즈 정답입니다! 거울 속 숫자를 확인하여 코드를 입력하세요.");
    } else {
        showModal("퀴즈 오답입니다. 지방의 특징을 다시 생각해보세요.");
    }
}

// --- 실험실 3: 여림 & 저리의 기록 (역할 및 정보비대칭) ---
const rolesData = {
    'A': '<h3>[A 연구원의 수첩]</h3><p>칼슘 흡수를 돕는 비타민은 비타민 D입니다.<br>여림이는 단백질이 부족했습니다.</p>',
    'B': '<h3>[B 연구원의 수첩]</h3><p>식이섬유를 너무 많이 먹으면 무기질 흡수가 방해받을 수 있습니다.<br>저리는 칼슘과 철분이 부족했습니다.</p>',
    'C': '<h3>[C 연구원의 수첩]</h3><p>저리와 여림이는 공통적으로 "쉽게 지친다"는 증상이 있었습니다.<br>하지만 원인은 달랐습니다!</p>'
};

document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const role = e.target.dataset.role;
        const roleContent = document.getElementById('role-content');
        roleContent.innerHTML = rolesData[role] + '<br><button class="btn small" onclick="document.getElementById(\'role-content\').classList.add(\'hidden\')">닫기</button>';
        roleContent.classList.remove('hidden');
    });
});

// --- 실험실 4: UV 손전등 및 범위 슬라이더 ---
const lab4Container = document.querySelector('.uv-container');
const uvLight = document.getElementById('uv-light');
let uvActive = false;

document.getElementById('uv-toggle').addEventListener('click', () => {
    uvActive = !uvActive;
    if (uvActive) {
        lab4Container.classList.add('uv-active');
        uvLight.style.display = 'block';
    } else {
        lab4Container.classList.remove('uv-active');
        uvLight.style.display = 'none';
    }
});

lab4Container.addEventListener('mousemove', (e) => {
    if (uvActive) {
        const rect = lab4Container.getBoundingClientRect();
        uvLight.style.left = (e.clientX - rect.left) + 'px';
        uvLight.style.top = (e.clientY - rect.top) + 'px';
    }
});

document.getElementById('water-slider').addEventListener('change', (e) => {
    if(e.target.value >= 75 && e.target.value <= 85) {
        // 대략 8잔 부근
        showModal("적정량입니다! 단서를 모두 모아 코드를 조합해보세요.");
    } else {
        showModal("바싹이가 또 목말라합니다. 적정량이 아닙니다.");
    }
});

// --- 보스룸 ---
function checkBossCode() {
    const inputs = document.querySelectorAll('.boss-code');
    // 씩씩이 식사 순서: 아침(탄수화물 1실험실) -> 점심(단백질/무기질 3실험실) -> 간식(비타민/물 4실험실) -> 저녁(지방 2실험실)
    const correctOrder = [codes[1], codes[3], codes[4], codes[2]];
    let isCorrect = true;
    
    inputs.forEach((input, index) => {
        if (input.value !== correctOrder[index]) {
            isCorrect = false;
        }
    });

    if (isCorrect) {
        showScreen('ending');
        playEnding();
    } else {
        showModal("시스템 경고: 잠금 해제 실패! 식사 순서(아침->점심->간식->저녁)를 떠올려보세요.");
    }
}

// --- 엔딩 ---
const endingStory = `...시스템이 복구되고 있어!
근데... 뭔가 빠졌어. 씩씩이의 기록이야. 씩씩이만 여섯 영양소를 골고루 먹고 있었어.

일곱 난쟁이가 다르게 자란 건 타고난 게 아니었어. 
뭘, 얼마나, 어떻게 먹었는지가 만든 차이였어.

그리고... 오늘 접근 시도, 즉석식품을 파는 곳 쪽 흔적이 나왔어. 
이 기록이 알려지면 불리해질까 봐 그랬던 것 같아.

고마워, 신입 연구원. 그런데 아직 다 끝난 게 아니야. 
다음 시간에 다시 불러줄게.`;

function playEnding() {
    const endingTextEl = document.getElementById('ending-text');
    let idx = 0;
    endingTextEl.innerHTML = "";
    function typeEnding() {
        if (idx < endingStory.length) {
            endingTextEl.innerHTML += endingStory.charAt(idx) === '\n' ? '<br>' : endingStory.charAt(idx);
            idx++;
            setTimeout(typeEnding, 50);
        }
    }
    typeEnding();
}

// --- 이벤트 바인딩 ---
startBtn.addEventListener('click', () => {
    showScreen('lab1');
});

// 초기화
window.onload = () => {
    typeWriter();
};
