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
const introText = `깊고 깊은 숲 속, 길을 잃고 헤매던 백설공주는 작은 오두막을 발견했습니다.
그곳에는 일곱 난쟁이들이 살고 있었지만...
어찌된 일인지 모두들 심각한 영양 불균형으로 앓아누워 있었습니다!

"이대로 둘 순 없어! 내가 도와줘야겠어."

백설공주는 난쟁이들의 식습관을 분석하여 올바른 영양 처방을 내리기로 결심했습니다.`;

let typeIndex = 0;
function typeWriter() {
    if (typeIndex < introText.length) {
        const char = introText.charAt(typeIndex);
        const span = document.createElement('span');
        span.className = 'magic-char';
        // 줄바꿈 문자 처리
        if (char === '\n') {
            introTextEl.appendChild(document.createTextNode('\n'));
        } else {
            span.textContent = char;
            introTextEl.appendChild(span);
        }
        
        typeIndex++;
        setTimeout(typeWriter, 40); // 살짝 빠르게
    } else {
        startBtn.classList.remove('hidden');
    }
}

// --- 실험실 1: 탄수화물 드래그 앤 드롭 ---
const lab1CardsData = [
    { id: 'c1', text: '포도당', type: 'mono', emoji: '🍇' },
    { id: 'c2', text: '과당', type: 'mono', emoji: '🍎' },
    { id: 'c3', text: '설탕', type: 'di', emoji: '🍬' },
    { id: 'c4', text: '유당', type: 'di', emoji: '🥛' },
    { id: 'c5', text: '밥', type: 'poly', emoji: '🍚' },
    { id: 'c6', text: '식이섬유', type: 'poly', emoji: '🥦' },
    { id: 't1', text: '닭가슴살', type: 'trap_protein', emoji: '🍗' },
    { id: 't2', text: '버터', type: 'trap_fat', emoji: '🧈' }
];

const lab1CardsContainer = document.getElementById('lab1-cards');
lab1CardsData.forEach(data => {
    const card = document.createElement('div');
    card.className = 'food-card';
    card.draggable = true;
    card.id = data.id;
    card.innerHTML = `<span class="food-emoji">${data.emoji}</span><span>${data.text}</span>`;
    card.dataset.type = data.type;
    card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', card.id);
        card.style.opacity = '0.5';
    });
    card.addEventListener('dragend', () => {
        card.style.opacity = '1';
    });
    lab1CardsContainer.appendChild(card);
});

document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.addEventListener('dragover', e => {
        e.preventDefault();
        zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
    });
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('dragover');
        const cardId = e.dataTransfer.getData('text/plain');
        const card = document.getElementById(cardId);
        
        // 함정 처리
        if (card.dataset.type.startsWith('trap')) {
            showModal("경고: 이건 다른 난쟁이의 음식이야! (함정 카드 발견)");
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
    'A': '<h3>[요정 A의 수첩]</h3><p>칼슘 흡수를 돕는 비타민은 비타민 D랍니다.<br>여림이는 단백질이 부족해 보였어요.</p>',
    'B': '<h3>[요정 B의 수첩]</h3><p>식이섬유를 너무 많이 먹으면 무기질 흡수가 방해받을 수 있어요.<br>저리는 칼슘과 철분이 부족했답니다.</p>',
    'C': '<h3>[요정 C의 수첩]</h3><p>저리와 여림이는 공통적으로 "쉽게 지친다"는 증상이 있었죠.<br>하지만 원인은 분명 달랐어요!</p>'
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
    const codes = Array.from(inputs).map(i => i.value);
    
    // 건강한 씩씩이의 식단 순서: 아침(탄수 482) -> 점심(단백/무기 635) -> 간식(지방 197) -> 저녁(비타/물 806)
    if(codes[0]==='482' && codes[1]==='635' && codes[2]==='197' && codes[3]==='806') {
        document.getElementById('boss').classList.remove('active');
        document.getElementById('ending').classList.add('active');
        typeEnding();
    } else {
        showModal('처방 순서나 암호가 틀렸습니다. 다시 한번 식단표를 확인하세요!');
    }
}

// --- 엔딩 ---
const endingText = "모든 처방 코드가 메인 시스템에 전송되었습니다...\n\n메디컬 치료 성공!\n백설공주의 완벽한 영양 진단과 식단 처방 덕분에 아팠던 난쟁이들이 모두 건강을 되찾았습니다.\n\n이제 숲속 오두막에는 다시 튼튼하고 건강한 웃음소리만 가득합니다!\n\n- HAPPY ENDING -";
let endingIdx = 0;

function typeEnding() {
    const el = document.getElementById('ending-text');
    if(el) {
        if (endingIdx < endingText.length) {
            el.innerHTML += endingText.charAt(endingIdx);
            endingIdx++;
            setTimeout(typeEnding, 50);
        }
    }
}

// --- 이벤트 바인딩 ---
startBtn.addEventListener('click', () => {
    showScreen('lab1');
});

// --- 대문 열기 효과 ---
function openDoor() {
    const doorScreen = document.getElementById('door-screen');
    if (!doorScreen) return;
    
    // 날아가는 애니메이션 클래스 추가
    doorScreen.classList.add('fly-away');
    
    // 애니메이션 시간(1초) 후 요소를 숨기고 책 열기 애니메이션 시작
    setTimeout(() => {
        doorScreen.style.display = 'none';
        
        const bookContainer = document.getElementById('intro-book-container');
        const bookCover = document.getElementById('book-cover');
        
        if (bookContainer && bookCover) {
            bookContainer.classList.add('active'); // 책 나타나기
            
            // 0.5초 뒤 표지 넘기기 시작
            setTimeout(() => {
                bookCover.classList.add('open');
                
                // 표지 넘기는 애니메이션(1.5초) 완료 후 타이핑 시작
                setTimeout(() => {
                    typeWriter();
                }, 1500);
            }, 500);
        } else {
            typeWriter(); // fallback
        }
    }, 1000);
}

// 초기화
window.onload = () => {
    // 이제 타이핑 효과는 대문이 열린 후에 시작됩니다.
};

// --- Intro 3D Parallax Effect ---
document.getElementById('intro').addEventListener('mousemove', (e) => {
    const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    const wrapper = document.getElementById('intro-3d-wrapper');
    if(wrapper) {
        wrapper.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    }
});

document.getElementById('intro').addEventListener('mouseleave', () => {
    const wrapper = document.getElementById('intro-3d-wrapper');
    if(wrapper) {
        wrapper.style.transform = `rotateY(0deg) rotateX(0deg)`;
        wrapper.style.transition = 'transform 0.5s ease';
    }
});
document.getElementById('intro').addEventListener('mouseenter', () => {
    const wrapper = document.getElementById('intro-3d-wrapper');
    if(wrapper) wrapper.style.transition = 'none';
});
