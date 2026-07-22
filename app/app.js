// ===========================
// 상태 관리
// ===========================
let clearedRooms = [1, 2, 3, 4];
let currentRoom = 0;
let roomQuizState = {};

// 힌트 사용 여부
let usedHints = {};

// 방2 순서 맞추기 상태
let r2OrderSequence = [];   // 클릭한 순서 [{correct, text}, ...]
let r2OrderSlot = 1;        // 다음에 채울 슬롯 번호

// 방3 드래그/분류 상태
let r1DraggedCard = null;

// 방3 OX 상태
let r3OXAnswers = {};

// 방3 매칭 상태
let r3MatchingSelected = { left: null, right: null, pairs: [] };

// 방4 매칭 상태
let r4MatchingSelected = { left: null, right: null, pairs: [] };

// 방4 비타민 분류 상태
let r4SelectedVit = null;
let r4VitClassified = {}; // { 'A': '지용성', 'B': '수용성', ... }

// 방5 장바구니
let r5CartItems = [];

// 방6 탈수 판단


// 방2 빈칸
let r2BlankFills = { 1: null, 2: null, 3: null };
let r2SelectedWord = null;

// 코드 글자
const codeLetters = { 1: '영', 2: '양', 3: '전', 4: '도', 5: '사', 6: '!' };

// ===========================
// 힌트 내용
// ===========================
const hintData = {
    '1-1': '탄수화물은 우리 몸을 움직이는 가장 중요한 에너지원이에요!',
    '1-2': '단당류는 포도당·과당처럼 작은 단위, 다당류는 녹말·식이섬유처럼 큰 단위예요.',
    '1-3': '단당류(포도당·과당)는 빠르게 흡수되어 혈당이 급등락해요!',
    '2-1': '단백질은 몸을 "만드는" 영양소! 근육, 피부, 머리카락 모두 단백질로 이루어져요.',
    '2-2': '빈칸 순서: 단백질 → 근육 → 달걀·고기·콩',
    '2-3': '필수 아미노산은 체내에서 합성되지 않아 외부 음식으로 섭취해야 해요!',
    '3-1': '산소 운반은 혈액 속 헤모글로빈(철분)이 하는 일이에요!',
    '3-2': '불포화지방산이 풍부한 식품: 아보카도, 고등어, 올리브오일!',
    '3-3': '"불" + "포화" + "지방" + "산" = 불포화지방산! 좋은 지방이에요.',
    '4-1': '잇몸에서 피가 나는 괴혈병은 비타민 C 부족 때문이에요!',
    '4-2': '비타민 A→야맹증, C→괴혈병, D→구루병, B1→각기병이에요.',
    '4-3': '지용성: A·D·E·K (기름에 녹아요), 수용성: B·C (물에 녹아요)',
    '4-4': '칼슘이 뼈에 흡수되려면 햇빛을 받아 생기는 비타민 D가 꼭 필요해요!',
    '5-1': '우유·멸치에 풍부하게 들어있는 무기질이 뼈를 만들어요!',
    '5-2': '칼슘이 풍부한 식품: 우유 🥛 멸치 🐟 브로콜리 🥦',
    '5-3': '나트륨(Na)은 세포의 삼투압 조절(수분평형)! 칼슘 흡수 촉진은 비타민 D, C, 젖당!',
    '6-1': '물은 에너지를 만들지는 않지만, 에너지가 돌아다니도록 도와줘요!',
    '6-2': '탈수 신호: 소변 색 진해짐, 두통, 피부 탄력 감소, 소변량 감소!',
    '6-3': '체수분 손실: 2% 갈증, 4% 근육 피로, 20% 생명 위험!',
};

// ===========================
// 공통 함수
// ===========================
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
}

const modal = document.getElementById('modal');
const modalText = document.getElementById('modal-text');
const modalIcon = document.getElementById('modal-icon');

function showModal(msg, isCorrect = null) {
    modalText.innerHTML = msg.replace(/\n/g, '<br>'); // innerHTML로 변경하여 디자인 적용
    modal.classList.remove('success', 'error', 'witch'); // 기존 클래스 초기화
    modalIcon.style.display = 'block';
    
    if (isCorrect === true) { 
        modalIcon.textContent = '✅'; 
        modal.classList.add('success'); 
    }
    else if (isCorrect === false) { 
        modalIcon.textContent = '❌'; 
        modal.classList.add('error'); 
    }
    else if (isCorrect === 'witch') {
        modalIcon.style.display = 'none';
        modal.classList.add('witch');
    }
    else { 
        modalIcon.textContent = '💡'; 
        modal.querySelector('.modal-content').style.borderColor = '#d97706'; 
    }
    modal.classList.add('active');
}
function closeModal() { 
    modal.classList.remove('active', 'success', 'error'); 
}

// 힌트 모달
function showHint(key, btn) {
    if (usedHints[key]) return;
    usedHints[key] = true;
    btn.disabled = true;
    btn.textContent = '💡 힌트 사용됨';
    btn.classList.add('hint-used');

    const hintModal = document.getElementById('hint-modal');
    document.getElementById('hint-modal-text').textContent = hintData[key] || '힌트가 없어요!';
    hintModal.classList.add('active');
}
function closeHintModal() { document.getElementById('hint-modal').classList.remove('active'); }

// ===========================
// 인트로 타이핑
// ===========================
const introPages = [
    `옛날 옛날, 아름답지만 차가운 성에서 쫓겨난 백설공주...\n깊고 어두운 숲속을 며칠 낮밤으로 헤매고 있었습니다.\n\n배도 고프고 지쳐 쓰러지기 직전,\n저 멀리서 따뜻한 불빛이 새어나오는 작은 오두막을 발견했어요.`,
    
    `조심스레 오두막 문을 열고 들어간 백설공주.\n그곳에는 광산에서 씩씩하게 일해야 할 일곱 난쟁이들이 살고 있었어요.\n\n하지만 난쟁이들은 모두 침대에 누워 끙끙 앓고 있었답니다.`,
    
    `잠보는 기운이 없어 축 늘어져 있고,\n여림이는 뼈가 앙상하며,\n부풍이는 춥다며 오들오들 떨고 있었죠.\n\n흐림이, 저리, 바싹이까지 모두 상태가 엉망이었어요.\n오직 막내인 '튼튼이'만이 간신히 형들을 돌보고 있었습니다.`,
    
    `방 안을 둘러본 백설공주는\n난쟁이들이 편식만 하고, 영양소가 골고루 들어있는 음식을\n전혀 먹지 않았다는 걸 깨달았어요.\n\n그때, 성에서 '가정 선생님'께 열심히 배웠던\n[ 6대 영양소 ] 지식이 번쩍 떠올랐습니다!`,
    
    `"걱정 마! 내가 배운 영양소 지식으로\n너희들을 모두 건강하게 치료해 줄게!"\n\n백설공주의 영양 처방전 만들기 대작전이\n지금부터 시작됩니다! 🍎`
];

let introPageIndex = 0;
let typeIndex = 0;
let isTyping = false;
let typeTimer = null;
const introTextEl = document.getElementById('intro-text');
const introControls = document.getElementById('intro-controls');
const startBtn = document.getElementById('start-btn');

function typeWriter() {
    isTyping = true;
    const currentText = introPages[introPageIndex];
    const textArray = Array.from(currentText); // 이모지(🍎) 깨짐 방지용 배열 변환
    
    if (typeIndex < textArray.length) {
        const char = textArray[typeIndex];
        if (char === '\n') introTextEl.appendChild(document.createElement('br'));
        else { 
            const span = document.createElement('span'); 
            span.className = 'magic-char'; 
            span.textContent = char; 
            introTextEl.appendChild(span); 
        }
        typeIndex++;
        typeTimer = setTimeout(typeWriter, 35);
    } else {
        isTyping = false;
        if (introPageIndex < introPages.length - 1) {
            introControls.classList.remove('hidden');
        } else {
            startBtn.classList.remove('hidden');
        }
    }
}

function nextIntroPage() {
    if (isTyping) return;
    if (introPageIndex >= introPages.length - 1) return; // 마지막 페이지면 무시
    
    introControls.classList.add('hidden');
    introTextEl.innerHTML = ''; // clear text
    typeIndex = 0;
    introPageIndex++;
    typeWriter();
}

// ===========================
// 대문 열기
// ===========================
function openDoor() {
    const doorScreen = document.getElementById('door-screen');
    if (!doorScreen) return;
    doorScreen.classList.add('fly-away');
    setTimeout(() => {
        doorScreen.style.display = 'none';
        const bookContainer = document.getElementById('intro-book-container');
        const bookCover = document.getElementById('book-cover');
        if (bookContainer && bookCover) {
            bookContainer.classList.add('active');
            setTimeout(() => { bookCover.classList.add('open'); setTimeout(typeWriter, 1500); }, 500);
        } else { typeWriter(); }
    }, 1000);
}

// 선생님 전용 스킵 기능
function skipIntro() {
    // 도어 스크린 즉시 숨기기
    const doorScreen = document.getElementById('door-screen');
    if (doorScreen) {
        doorScreen.style.opacity = '0';
        doorScreen.style.pointerEvents = 'none';
        setTimeout(() => { doorScreen.style.display = 'none'; }, 400);
    }
    if (typeTimer) clearTimeout(typeTimer);
    isTyping = false;
    setTimeout(() => {
        showScreen('hub');
        updateHubRooms();
    }, 300);
}

// startBtn 이벤트 리스너 제거 (HTML inline onclick으로 이동함)

// ===========================
// 허브 / 방 이동
// ===========================
function enterRoom(roomNum) {
    if (roomNum > 1 && !clearedRooms.includes(roomNum - 1)) {
        showModal(`먼저 ${getRoomName(roomNum - 1)} 방을 해결해야 해요!`);
        return;
    }
    currentRoom = roomNum;
    if (!roomQuizState[roomNum]) roomQuizState[roomNum] = 1;
    showScreen(`room-screen-${roomNum}`);
    showQuizStage(roomNum, roomQuizState[roomNum]);
}

function getRoomName(num) {
    return ['', '잠보(탄수화물)', '여림이(단백질)', '부풍이(지방)', '흐림이(비타민)', '저리(무기질)', '바싹이(물)'][num];
}

// ===========================
// 씩씩이(막내) 가이드 기능
// ===========================
let ssikssikiQuotes = [
    "공주님, 힘내세요! 형들을 부탁해요!",
    "저는 매일 규칙적으로 밥을 먹어서 튼튼해요!",
    "형들이 편식만 하더니 결국 병이 났어요...",
    "비타민은 과일과 채소에 듬뿍 들어있어요!",
    "우유를 마시면 뼈가 튼튼해져요!",
    "물을 자주 마시는 것도 중요해요!"
];

function clickSsikssiki() {
    const modal = document.getElementById('ssikssiki-modal');
    const modalText = document.getElementById('ssikssiki-modal-text');
    if (!modal || !modalText) return;
    
    modalText.textContent = ssikssikiQuotes[Math.floor(Math.random() * ssikssikiQuotes.length)];
    modal.classList.add('active');
}

// ===========================
// 비밀 스킵 기능 (백설공주 클릭)
// ===========================
let hubClickCount = 0;
let hubClickTimer = null;
function hubSkipClick() {
    hubClickCount++;
    if (hubClickTimer) clearTimeout(hubClickTimer);
    hubClickTimer = setTimeout(() => { hubClickCount = 0; }, 1000);
    
    if (hubClickCount >= 5) {
        hubClickCount = 0;
        showModal('비밀 스킵! 마녀전으로 즉시 이동합니다.', true);
        setTimeout(() => {
            closeModal();
            startWitchCutscene();
        }, 1500);
    }
}

function showQuizStage(roomNum, stageNum) {
    document.querySelectorAll(`#room-screen-${roomNum} .quiz-stage`).forEach(s => s.classList.add('hidden'));
    const clearEl = document.getElementById(`r${roomNum}-clear`);
    if (clearEl) clearEl.classList.add('hidden');
    let maxQ = roomNum === 5 ? 4 : 3;
    if (stageNum <= maxQ) {
        const el = document.getElementById(`r${roomNum}-q${stageNum}`);
        if (el) el.classList.remove('hidden');
    }
}

function nextQuizStage(roomNum, currentQ) {
    let maxQ = roomNum === 5 ? 4 : 3;
    if (currentQ < maxQ) { 
        roomQuizState[roomNum] = currentQ + 1; 
        showQuizStage(roomNum, currentQ + 1); 
    }
    else { 
        showQuizStage(roomNum, 99); 
        const clearEl = document.getElementById(`r${roomNum}-clear`); 
        if (clearEl) clearEl.classList.remove('hidden'); 
        
        // 마녀 깜짝 등장 (3번 방 클리어 시)
        if (roomNum === 3) {
            setTimeout(() => {
                const witchHTML = `
                    <div class="witch-emoji">🧙‍♀️</div>
                    <b style="color:#7e22ce; font-size:2.5rem; display:block; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">나쁜 식습관 마녀 등장!</b>
                    <span style="font-size:1.5rem; color: #4c1d95; font-weight: bold; display: block; line-height: 1.4;">"히히히! 영양소들을 다 모으게 둘 순 없지!<br>다음 방부터는 더 어려워질 거다!"</span>
                `;
                showModal(witchHTML, 'witch');
            }, 800);
        }
    }
}

// ===========================
// 객관식 체크
// ===========================
function checkOption(roomNum, qNum, btn, result) {
    const allBtns = btn.closest('.quiz-options').querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);
    if (result === 'correct') {
        btn.classList.add('correct');
        showModal('🎉 정답입니다!', true);
        setTimeout(() => { closeModal(); nextQuizStage(roomNum, qNum); }, 1500);
    } else {
        btn.classList.add('wrong');
        allBtns.forEach(b => { if (b.getAttribute('onclick').includes("'correct'")) b.classList.add('correct'); });
        showModal('😅 틀렸어요! 정답을 확인하고 다시 도전해 보세요.', false);
        
        // 틀렸을 때 힌트 버튼 표시
        const hintBtn = btn.closest('.quiz-stage').querySelector('.hint-btn');
        if (hintBtn) hintBtn.classList.add('show-hint');

        setTimeout(() => {
            closeModal();
            allBtns.forEach(b => { b.disabled = false; b.classList.remove('correct', 'wrong'); });
        }, 2500);
    }
}

// ===========================
// 거짓말 찾기 (방1)
// ===========================
function checkLie(roomNum, btn, isCorrect) {
    const allBtns = btn.closest('.lie-choices').querySelectorAll('.lie-btn');
    allBtns.forEach(b => b.disabled = true);
    if (isCorrect) {
        btn.classList.add('lie-correct');
        const explain = document.getElementById(`lie-explain-${roomNum}`);
        if (explain) explain.classList.remove('hidden');
        showModal('🎉 거짓말을 찾았습니다!', true);
        setTimeout(() => { closeModal(); nextQuizStage(roomNum, 3); }, 1800);
    } else {
        btn.classList.add('lie-wrong');
        showModal('❌ 그 문장은 사실이에요! 다시 살펴보세요.', false);
        
        // 틀렸을 때 힌트 버튼 표시
        const hintBtn = btn.closest('.quiz-stage').querySelector('.hint-btn');
        if (hintBtn) hintBtn.classList.add('show-hint');

        setTimeout(() => { closeModal(); allBtns.forEach(b => { b.disabled = false; b.classList.remove('lie-wrong'); }); }, 2000);
    }
}

// ===========================
// 표 오류 찾기 (방5)
// ===========================
function selectTableRow(el, roomNum, isCorrect) {
    document.querySelectorAll('.table-row').forEach(r => r.classList.remove('row-selected', 'row-wrong-flash'));
    el.classList.add('row-selected');
    if (isCorrect) {
        el.classList.add('row-correct');
        const explain = document.getElementById(`lie-explain-${roomNum}`);
        if (explain) explain.classList.remove('hidden');
        showModal('🎉 오류를 찾았습니다! "체내 수분 평형"은 나트륨의 역할이에요!', true);
        setTimeout(() => { closeModal(); nextQuizStage(roomNum, 3); }, 2500);
    } else {
        el.classList.add('row-wrong-flash');
        showModal('그 행은 올바른 정보예요! 다시 살펴보세요.', false);
        
        // 틀렸을 때 힌트 버튼 표시
        const hintBtn = document.getElementById(`hint-${roomNum}-2`); // 방5 문제2
        if (hintBtn) hintBtn.classList.add('show-hint');

        setTimeout(() => { el.classList.remove('row-selected', 'row-wrong-flash'); closeModal(); }, 1800);
    }
}

// ===========================
// 방1: 드래그 & 분류
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    initDragAndDrop();
    initOXCards();
    initMatchingGame();
    initR3LineGame();
    initWordCards();
});

function initDragAndDrop() {
    document.querySelectorAll('.drag-card').forEach(card => {
        card.addEventListener('dragstart', e => { r1DraggedCard = card; card.classList.add('dragging'); });
        card.addEventListener('dragend', () => { card.classList.remove('dragging'); r1DraggedCard = null; });
    });
    document.querySelectorAll('.classify-bin, .classify-source').forEach(zone => {
        zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            if (!r1DraggedCard) return;
            if (zone.classList.contains('classify-bin')) zone.querySelector('.bin-content').appendChild(r1DraggedCard);
            else zone.appendChild(r1DraggedCard);
        });
    });
}

function checkClassifyQ(roomNum) {
    const monoBin = document.getElementById('r1-mono').querySelector('.bin-content');
    const polyBin = document.getElementById('r1-poly').querySelector('.bin-content');
    const monoCards = monoBin.querySelectorAll('.drag-card');
    const polyCards = polyBin.querySelectorAll('.drag-card');

    let allCorrect = true;
    monoCards.forEach(c => { if (c.dataset.category !== 'mono') allCorrect = false; });
    polyCards.forEach(c => { if (c.dataset.category !== 'poly') allCorrect = false; });

    const trapInBins = [...monoCards, ...polyCards].filter(c => c.dataset.category === 'trap');
    if (trapInBins.length > 0) allCorrect = false;
    if (monoCards.length !== 3 || polyCards.length !== 3) allCorrect = false;

    if (allCorrect) {
        showModal('🎉 완벽해요! 단당류와 다당류를 정확히 구분했어요!', true);
        setTimeout(() => { closeModal(); nextQuizStage(roomNum, 2); }, 1500);
    } else {
        showModal('아직 틀린 분류가 있어요! 단당류(포도당·과당), 다당류(녹말·식이섬유)를 기억하세요.', false);
        
        // 틀렸을 때 힌트 버튼 표시
        const hintBtn = document.getElementById('hint-1-2');
        if (hintBtn) hintBtn.classList.add('show-hint');
    }
}

// ===========================
// 방2: 빈칸 채우기
// ===========================
const blankAnswers = { 1: '단백질', 2: '근육', 3: '달걀·고기·콩' };

function initWordCards() {
    document.querySelectorAll('.word-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.word-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            r2SelectedWord = card.dataset.word;
        });
    });
}

function fillBlank(blankNum) {
    if (!r2SelectedWord) { showModal('먼저 단어 카드를 선택해 주세요!'); return; }
    r2BlankFills[blankNum] = r2SelectedWord;
    const el = document.getElementById(`blank${blankNum}`);
    el.textContent = r2SelectedWord;
    el.classList.add('filled');
    r2SelectedWord = null;
    document.querySelectorAll('.word-card').forEach(c => c.classList.remove('selected'));
}

function checkDiaryQ(roomNum) {
    const correct = r2BlankFills[1] === blankAnswers[1] && r2BlankFills[2] === blankAnswers[2] && r2BlankFills[3] === blankAnswers[3];
    if (correct) {
        showModal('🎉 일기를 완성했어요!', true);
        setTimeout(() => { closeModal(); nextQuizStage(roomNum, 2); }, 1500);
    } else {
        showModal('빈칸이 비어있거나 틀린 단어가 있어요!', false);
        r2BlankFills = { 1: null, 2: null, 3: null };
        ['blank1','blank2','blank3'].forEach(id => { const el = document.getElementById(id); if(el){el.textContent='?'; el.classList.remove('filled');} });
    }
}

// ===========================
// 방2: 순서 맞추기 (Q3)
// ===========================
function clickOrder(roomNum, el) {
    if (el.classList.contains('order-placed')) return;
    if (r2OrderSlot > 4) return;

    const slotEl = document.querySelector(`#r2-order-result [data-slot="${r2OrderSlot}"]`);
    if (!slotEl) return;

    slotEl.querySelector('.slot-text').textContent = el.textContent;
    slotEl.classList.add('slot-filled');
    el.classList.add('order-placed');
    el.dataset.assignedSlot = r2OrderSlot;

    r2OrderSequence.push({ slot: r2OrderSlot, correct: parseInt(el.dataset.correct), el });
    r2OrderSlot++;
}

function checkOrderQ(roomNum) {
    if (r2OrderSlot <= 4) { showModal(`아직 ${5 - r2OrderSlot}개가 남았어요!`, false); return; }
    const isCorrect = r2OrderSequence.every((item, idx) => item.correct === idx + 1);
    if (isCorrect) {
        showModal('🎉 완벽한 순서입니다! 필수 아미노산의 비밀을 풀었어요!', true);
        setTimeout(() => { closeModal(); nextQuizStage(roomNum, 3); }, 1800);
    } else {
        showModal('순서가 틀렸어요! 문장이 자연스럽게 이어지도록 다시 생각해 보세요.', false);
        // 초기화
        r2OrderSequence = [];
        r2OrderSlot = 1;
        document.querySelectorAll('.order-card').forEach(c => { c.classList.remove('order-placed'); delete c.dataset.assignedSlot; });
        document.querySelectorAll('.order-slot').forEach(s => { s.querySelector('.slot-text').textContent = '?'; s.classList.remove('slot-filled'); });
    }
}

// ===========================
// 방3: O/X 판별
// ===========================
function initOXCards() {
    // onclick으로 처리
}
function selectOX(card) {
    document.querySelectorAll('.ox-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
}
function markOX(mark) {
    const selected = document.querySelector('.ox-card.selected');
    if (!selected) { showModal('먼저 음식을 클릭해서 선택해 주세요!'); return; }
    const food = selected.dataset.food;
    r3OXAnswers[food] = mark;
    selected.dataset.marked = mark;
    selected.classList.remove('selected');
    selected.classList.add(mark === 'O' ? 'marked-o' : 'marked-x');
    selected.textContent = selected.textContent.replace(/ [✅❌]$/, '') + (mark === 'O' ? ' ✅' : ' ❌');
}
function checkOXQ(roomNum) {
    const cards = document.querySelectorAll('.ox-card');
    if (Object.keys(r3OXAnswers).length < cards.length) { showModal(`아직 ${cards.length - Object.keys(r3OXAnswers).length}개 남았어요!`, false); return; }
    let allCorrect = true;
    cards.forEach(c => { if (r3OXAnswers[c.dataset.food] !== c.dataset.answer) allCorrect = false; });
    if (allCorrect) {
        showModal('🎉 완벽해요! 좋은 지방과 나쁜 지방을 모두 구별했어요!', true);
        setTimeout(() => { closeModal(); nextQuizStage(roomNum, 2); }, 1500);
    } else {
        showModal('틀린 항목이 있어요! 불포화지방산(아보카도·고등어·올리브오일)은 좋은 지방이에요.', false);
        r3OXAnswers = {};
        document.querySelectorAll('.ox-card').forEach(c => { c.classList.remove('marked-o','marked-x'); c.textContent = c.textContent.replace(/ [✅❌]$/,''); });
    }
}

// ===========================
// 방4: 비타민 매칭
// ===========================
function initMatchingGame() {
    document.querySelectorAll('.match-item:not(.r3-item)').forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('matched')) return;
            const side = item.classList.contains('left') ? 'left' : 'right';
            const container = item.closest('.match-container');
            const state = r4MatchingSelected;

            container.querySelectorAll(`.match-item.${side}`).forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            state[side] = item.dataset.id;
            
            if (state.left && state.right) {
                const leftEl = container.querySelector('.match-item.left.selected');
                const rightEl = container.querySelector('.match-item.right.selected');
                if (state.left === state.right) {
                    leftEl.classList.add('matched'); rightEl.classList.add('matched');
                    state.pairs.push(state.left);
                } else {
                    leftEl.classList.add('wrong-flash'); rightEl.classList.add('wrong-flash');
                    setTimeout(() => { leftEl.classList.remove('wrong-flash','selected'); rightEl.classList.remove('wrong-flash','selected'); }, 600);
                }
                state.left = null; state.right = null;
            }
        });
    });
}

let r3MatchedCount = 0;
let r3SelectedLeft = null;
function initR3LineGame() {
    const svg = document.getElementById('r3-svg');
    const container = document.getElementById('r3-match-container');
    if (!svg || !container) return;

    document.querySelectorAll('.r3-item.left').forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('matched')) return;
            document.querySelectorAll('.r3-item.left').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            r3SelectedLeft = item;
        });
    });

    document.querySelectorAll('.r3-item.right').forEach(item => {
        item.addEventListener('click', () => {
            if (!r3SelectedLeft) {
                showModal('먼저 왼쪽에서 음식을 선택하세요!', false);
                return;
            }
            const expectedType = r3SelectedLeft.dataset.type;
            const clickedType = item.dataset.type;

            if (expectedType === clickedType) {
                r3SelectedLeft.classList.add('matched');
                r3SelectedLeft.classList.remove('selected');
                
                const cRect = container.getBoundingClientRect();
                const lRect = r3SelectedLeft.getBoundingClientRect();
                const rRect = item.getBoundingClientRect();
                
                const x1 = lRect.right - cRect.left;
                const y1 = lRect.top + lRect.height/2 - cRect.top;
                const x2 = rRect.left - cRect.left;
                const y2 = rRect.top + rRect.height/2 - cRect.top;
                
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                const color = '#3b82f6'; // 성공 시 파란색 선
                line.setAttribute('stroke', color);
                line.setAttribute('stroke-width', '4');
                line.setAttribute('stroke-linecap', 'round');
                
                svg.appendChild(line);
                r3MatchedCount++;
                r3SelectedLeft = null;
            } else {
                r3SelectedLeft.classList.add('wrong-flash');
                item.classList.add('wrong-flash');
                const prevLeft = r3SelectedLeft;
                setTimeout(() => {
                    prevLeft.classList.remove('wrong-flash', 'selected');
                    item.classList.remove('wrong-flash');
                }, 600);
                r3SelectedLeft = null;
            }
        });
    });
}

function checkFatMatchingQ(roomNum) {
    if (r3MatchedCount < 6) { 
        showModal(`아직 ${6 - r3MatchedCount}개 연결이 남았어요!`, false); 
        const hintBtn = document.getElementById('hint-3-2');
        if (hintBtn) hintBtn.classList.add('show-hint');
        return; 
    }
    showModal('🎉 완벽해요! 모든 지방을 올바르게 판별했어요!', true);
    setTimeout(() => { closeModal(); nextQuizStage(roomNum, 3); }, 1500);
}
function checkMatchingQ(roomNum) {
    if (r4MatchingSelected.pairs.length < 4) { showModal(`아직 ${4 - r4MatchingSelected.pairs.length}개 연결이 남았어요!`, false); return; }
    showModal('🎉 모든 비타민과 증상을 정확히 연결했어요!', true);
    setTimeout(() => { closeModal(); nextQuizStage(roomNum, 2); }, 1500);
}

// ===========================
// 방4: 방탈출 퍼즐 로직
// ===========================
// 1단계: 손전등 효과
document.addEventListener('DOMContentLoaded', () => {
    const darkRoom = document.getElementById('dark-room');
    if (darkRoom) {
        darkRoom.addEventListener('mousemove', (e) => {
            const rect = darkRoom.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const overlay = document.getElementById('dark-overlay');
            if (overlay) {
                // radial gradient 중심을 마우스 위치로 업데이트 (시야 아주 좁게: 60px)
                overlay.style.background = `radial-gradient(circle 60px at ${x}px ${y}px, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.99) 100%)`;
            }
        });
    }
});

function foundCarrot(el) {
    const container = document.getElementById('dark-room');
    container.classList.add('lights-on');
    el.style.transform = 'scale(1.5)';
    showModal('🎉 비타민 A(당근)를 찾았습니다! 야맹증이 치료되어 시야가 밝아집니다!', true);
    setTimeout(() => { 
        closeModal(); 
        nextQuizStage(4, 1); 
    }, 2500);
}

// 2단계: 금고 다이어리
const safeState = ['A', 'A', 'A', 'A'];
function changeDial(index, dir) {
    let charCode = safeState[index].charCodeAt(0);
    charCode += dir;
    if (charCode > 90) charCode = 65; // Z -> A
    if (charCode < 65) charCode = 90; // A -> Z
    safeState[index] = String.fromCharCode(charCode);
    document.getElementById(`dial-${index}`).textContent = safeState[index];
}

function checkSafeCode(roomNum) {
    const code = safeState.join('');
    if (code === 'CDAB') {
        showModal('🔓 찰칵! 금고 문이 열렸습니다!', true);
        setTimeout(() => { 
            closeModal(); 
            nextQuizStage(roomNum, 2); 
        }, 1500);
    } else {
        showModal('😅 비밀번호가 틀렸습니다. 결핍증 증상을 다시 잘 읽어보세요!', false);
    }
}


// ===========================
// 방5: 장바구니 미션 (기존 복구)
// ===========================
function addToCart(el) {
    if (el.classList.contains('in-cart')) {
        el.classList.remove('in-cart');
        r5CartItems = r5CartItems.filter(i => i !== el.textContent);
        const cartEl = document.getElementById('r5-cart');
        const cartItem = cartEl.querySelector(`[data-ref="${el.textContent}"]`);
        if (cartItem) cartItem.remove();
    } else {
        if (r5CartItems.length >= 3) { showModal('장바구니는 3개까지만 담을 수 있어요!'); return; }
        el.classList.add('in-cart');
        r5CartItems.push(el.textContent);
        const item = document.createElement('div');
        item.className = 'cart-item'; item.dataset.ref = el.textContent; item.textContent = el.textContent;
        document.getElementById('r5-cart').appendChild(item);
    }
}
function checkCartQ(roomNum) {
    if (r5CartItems.length < 3) { showModal(`3개를 담아야 해요! 현재 ${r5CartItems.length}개입니다.`, false); return; }
    const correctItems = ['🥛 우유', '🐟 뱅어포', '🍄 표고버섯'];
    const allCorrect = r5CartItems.every(item => correctItems.includes(item));
    if (allCorrect) {
        showModal('🎉 완벽한 장보기! 뼈가 아주 튼튼해지겠어요!', true);
        setTimeout(() => { closeModal(); nextQuizStage(roomNum, 2); }, 1500);
    } else {
        showModal('앗, 잘못된 식품이 있어요! (힌트: 옥살산이나 카페인, 인산이 든 식품은 피하세요!)', false);
        r5CartItems = [];
        document.querySelectorAll('.market-item').forEach(i => i.classList.remove('in-cart'));
        const cartEl = document.getElementById('r5-cart');
        cartEl.innerHTML = '<div class="cart-label">🛒 장바구니 (3개를 담으세요)</div>';
    }
}

// ===========================
// 방5: 뼈 튼튼 캐치 게임
// ===========================
let boneGameActive = false;
let boneScore = 0;
let boneHealth = 100;
let boneCombo = 0;
let boneItemsCaught = 0;
let boneItems = [];
let boneGameInterval = null;
let boneSpawnInterval = null;
let boneKeys = { ArrowLeft: false, ArrowRight: false, a: false, d: false };
let bonePlayerX = 0;

const goodItems = [{emoji: '🍊', name: '비타민 C'}, {emoji: '☀️', name: '비타민 D'}, {emoji: '🥛', name: '젖당'}];
const badItems = [{emoji: '☕', name: '카페인'}, {emoji: '🧂', name: '나트륨'}, {emoji: '🥤', name: '인산'}];

function startBoneGame() {
    const startBtn = document.getElementById('start-bone-btn');
    if (startBtn) startBtn.style.display = 'none';
    
    boneScore = 0;
    boneHealth = 100;
    boneCombo = 0;
    boneItemsCaught = 0;
    boneKeys = { ArrowLeft: false, ArrowRight: false, a: false, d: false };
    
    boneItems.forEach(item => item.el.remove());
    boneItems = [];
    document.querySelectorAll('.bone-hole').forEach(h => h.remove());
    
    const container = document.getElementById('bone-game-container');
    const player = document.getElementById('bone-player');
    bonePlayerX = container.offsetWidth / 2;
    player.style.left = `${bonePlayerX}px`;
    
    updateBoneUI();
    
    boneGameActive = true;
    
    container.addEventListener('mousemove', handleBoneMove);
    document.addEventListener('keydown', handleBoneKeyDown);
    document.addEventListener('keyup', handleBoneKeyUp);
    
    // 재귀적 setTimeout을 통해 동적 스폰 주기 적용
    scheduleNextSpawn();
    boneGameInterval = setInterval(updateBoneGame, 20); // 프레임 향상 (30ms -> 20ms)
}

function handleBoneKeyDown(e) {
    if (boneKeys.hasOwnProperty(e.key)) boneKeys[e.key] = true;
}
function handleBoneKeyUp(e) {
    if (boneKeys.hasOwnProperty(e.key)) boneKeys[e.key] = false;
}

function scheduleNextSpawn() {
    if (!boneGameActive) return;
    spawnBoneItem();
    // 잡은 개수가 오를수록 스폰 주기가 짧아짐 (긴박감 UP!)
    let spawnDelay = Math.max(250, 1000 - (boneItemsCaught * 80));
    boneSpawnInterval = setTimeout(scheduleNextSpawn, spawnDelay);
}

let lastMouseX = 0;
function handleBoneMove(e) {
    if (!boneGameActive) return;
    const container = document.getElementById('bone-game-container');
    const player = document.getElementById('bone-player');
    const rect = container.getBoundingClientRect();
    let x = e.clientX - rect.left;
    
    if (x < 30) x = 30;
    if (x > rect.width - 30) x = rect.width - 30;
    bonePlayerX = x; // 마우스 좌표로 갱신
}

function spawnBoneItem() {
    if (!boneGameActive) return;
    const container = document.getElementById('bone-game-container');
    const rect = container.getBoundingClientRect();
    
    const isGood = Math.random() > 0.4;
    const itemData = isGood ? goodItems[Math.floor(Math.random() * goodItems.length)] : badItems[Math.floor(Math.random() * badItems.length)];
    
    const el = document.createElement('div');
    el.className = 'bone-item';
    el.textContent = itemData.emoji;
    
    const startX = 30 + Math.random() * (rect.width - 60);
    el.style.left = `${startX}px`;
    el.style.top = `-40px`;
    
    // 회전 애니메이션
    el.classList.add('item-spin');
    
    container.appendChild(el);
    
    // 잡은 개수에 따라 초기 속도와 가속도가 증가
    let diffMult = 1 + (boneItemsCaught * 0.15);
    
    boneItems.push({
        el: el,
        x: startX,
        y: -40,
        vy: (3 + Math.random() * 4) * diffMult, // 난이도에 따른 초기 속도 (조금 더 빠르게)
        isGood: isGood,
        name: itemData.name
    });
}

function updateBoneGame() {
    if (!boneGameActive) return;
    const container = document.getElementById('bone-game-container');
    const player = document.getElementById('bone-player');
    const containerHeight = container.offsetHeight;
    const containerWidth = container.offsetWidth;
    
    // 키보드 이동 로직 추가
    let speed = 12;
    if (boneKeys.ArrowLeft || boneKeys.a) bonePlayerX -= speed;
    if (boneKeys.ArrowRight || boneKeys.d) bonePlayerX += speed;
    if (bonePlayerX < 30) bonePlayerX = 30;
    if (bonePlayerX > containerWidth - 30) bonePlayerX = containerWidth - 30;
    
    player.style.left = `${bonePlayerX}px`;
    
    // 틸트 효과 (이동 방향에 따라 기울기)
    let tilt = 0;
    if (bonePlayerX > lastMouseX + 3) tilt = 20;
    else if (bonePlayerX < lastMouseX - 3) tilt = -20;
    player.style.transform = `translateX(-50%) rotate(${tilt}deg)`;
    lastMouseX = bonePlayerX;
    
    const playerRect = player.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    const px = playerRect.left - contRect.left + playerRect.width/2;
    const py = playerRect.top - contRect.top + playerRect.height/2;
    const hitRadius = 55; // 뼈다귀 크기 확대로 인한 충돌 판정 확대
    
    for (let i = boneItems.length - 1; i >= 0; i--) {
        const item = boneItems[i];
        let diffMult = 1 + (boneItemsCaught * 0.05);
        item.vy += (0.15 * diffMult); // 중력 가속도도 난이도 비례
        item.y += item.vy;
        item.el.style.top = `${item.y}px`;
        
        const dx = item.x - px;
        const dy = item.y - py;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < hitRadius) {
            handleBoneCollision(item);
            item.el.remove();
            boneItems.splice(i, 1);
            continue;
        }
        
        if (item.y > containerHeight) {
            // 좋은 아이템을 놓치면 콤보 초기화
            if (item.isGood) {
                boneCombo = 0;
                updateBoneUI();
            }
            item.el.remove();
            boneItems.splice(i, 1);
        }
    }
}

function handleBoneCollision(item) {
    const container = document.getElementById('bone-game-container');
    if (item.isGood) {
        boneCombo++;
        boneItemsCaught++;
        const points = 10 * boneCombo;
        boneScore += points;
        boneHealth = Math.min(100, boneHealth + (5 * boneCombo)); // 콤보 시 체력도 더 많이 회복
        updateBoneUI();
        
        // 플로팅 텍스트 (콤보 표시)
        const floatText = document.createElement('div');
        floatText.className = 'floating-text';
        floatText.innerHTML = `+${points}<br><span style="font-size:0.7em; color:#fcd34d;">${boneCombo} COMBO!</span>`;
        floatText.style.left = `${item.x}px`;
        floatText.style.top = `${item.y - 30}px`;
        if(boneCombo > 3) floatText.style.transform = 'scale(1.5)';
        container.appendChild(floatText);
        setTimeout(() => floatText.remove(), 1000);
        
        // 채워지는 시각 효과 (구멍 메우기)
        const player = document.getElementById('bone-player');
        const holes = player.querySelectorAll('.bone-hole');
        if (holes.length > 0) holes[0].remove();
        
        if (boneScore >= 300) { // 목표 점수를 300점으로 증가 (콤보로 금방 채움)
            endBoneGame(true);
        }
    } else {
        boneCombo = 0; // 나쁜 거 먹으면 콤보 리셋
        boneHealth -= 30;
        updateBoneUI();
        
        // 화면 흔들림 및 붉은 섬광 효과
        container.classList.add('shake', 'flash-red');
        setTimeout(() => container.classList.remove('shake', 'flash-red'), 500);
        
        const floatText = document.createElement('div');
        floatText.className = 'floating-text';
        floatText.innerHTML = `OUCH!<br><span style="font-size:0.7em;">콤보 초기화!</span>`;
        floatText.style.color = '#ef4444';
        floatText.style.left = `${item.x}px`;
        floatText.style.top = `${item.y - 20}px`;
        container.appendChild(floatText);
        setTimeout(() => floatText.remove(), 1000);
        
        const player = document.getElementById('bone-player');
        const hole = document.createElement('div');
        hole.className = 'bone-hole';
        hole.style.left = `${20 + Math.random() * 30}px`;
        hole.style.top = `${20 + Math.random() * 20}px`;
        player.appendChild(hole);
        
        if (boneHealth <= 0) {
            endBoneGame(false, item.name);
        }
    }
}

function updateBoneUI() {
    const healthBar = document.getElementById('bone-health-bar');
    const scoreText = document.getElementById('bone-score');
    
    if (healthBar) {
        healthBar.style.width = `${boneHealth}%`;
        if (boneHealth > 60) healthBar.style.background = '#10b981';
        else if (boneHealth > 30) healthBar.style.background = '#f59e0b';
        else healthBar.style.background = '#ef4444';
    }
    
    if (scoreText) {
        scoreText.innerHTML = `점수: ${boneScore} / 300<br><span style="font-size:0.7em;color:#fcd34d">🔥 현재 콤보: ${boneCombo}</span>`;
    }
}

function endBoneGame(isWin, failReason = '') {
    boneGameActive = false;
    clearInterval(boneGameInterval);
    clearTimeout(boneSpawnInterval);
    document.removeEventListener('keydown', handleBoneKeyDown);
    document.removeEventListener('keyup', handleBoneKeyUp);
    
    if (isWin) {
        showModal('🎉 완벽해요! 촉진자들을 먹고 뼈가 아주 튼튼해졌어요!', true);
        setTimeout(() => {
            closeModal();
            document.querySelectorAll('#room-screen-5 .quiz-stage').forEach(s => s.classList.add('hidden'));
            document.getElementById('r5-clear').classList.remove('hidden');
        }, 2000);
    } else {
        showModal(`☠️ 게임 오버! ${failReason} 때문에 뼈가 다 부서졌어요... 다시 도전하세요!`, false);
        const startBtn = document.getElementById('start-bone-btn');
        if (startBtn) startBtn.style.display = 'block';
    }
}

// ===========================
// 방6: 진짜 물을 찾아라!
// ===========================

function checkDrinkChoice(drink) {
    const slot = document.querySelector('.vending-slot');
    const flap = document.querySelector('.vending-slot-flap');
    
    // 덜컹거리는 자판기 애니메이션
    const vending = document.getElementById('r6-vending');
    vending.classList.add('shake-vending');
    setTimeout(() => vending.classList.remove('shake-vending'), 400);

    // 자판기 출구 플랩 열기
    flap.style.transform = 'rotateX(75deg)';
    flap.style.transition = 'transform 0.3s';
    
    // 아이템 생성 (떨어지는 애니메이션)
    const item = document.createElement('div');
    item.className = 'dropped-item';
    if (drink === '콜라') item.textContent = '🥤';
    else if (drink === '아메리카노') item.textContent = '☕';
    else if (drink === '주스') item.textContent = '🧃';
    else if (drink === '생수') item.textContent = '💧';
    
    // 기존에 떨어진 아이템이 있다면 제거
    const oldItem = slot.querySelector('.dropped-item');
    if (oldItem) oldItem.remove();
    
    slot.appendChild(item);

    // 떨어지는 연출을 잠시 보여준 뒤 모달 띄우기
    setTimeout(() => {
        flap.style.transform = ''; // 출구 닫기
        
        if (drink === '콜라') {
            showModal('❌ 콜라에는 설탕이 너무 많아!\n순간적으로 시원하지만 오히려 갈증이 더 심해져요.', false);
        } else if (drink === '아메리카노') {
            showModal('❌ 커피의 카페인은 이뇨 작용을 일으켜요!\n마신 수분보다 더 많은 물이 몸 밖으로 빠져나갑니다.', false);
        } else if (drink === '주스') {
            showModal('❌ 과일주스도 액상과당이 많아서\n진정한 수분 보충으로는 부족해요.', false);
        } else if (drink === '생수') {
            showModal('🎉 완벽해요! 시원한 생수가 바싹이의 몸을 촉촉하게 채워주었어요!', true);
            setTimeout(() => {
                closeModal();
                nextQuizStage(6, 1);
                r6OXIndex = 0; // 초기화
                loadR6OX();
            }, 2000);
        }
    }, 800);
}

const r6OXQuestions = [
    { q: "물 대신 커피나 녹차를 마시면 완벽하게 수분을 보충할 수 있다?", a: "X", desc: "카페인의 이뇨작용으로 수분이 배출됩니다." },
    { q: "물은 우리 몸의 노폐물을 밖으로 내보내는 청소부 역할을 한다?", a: "O", desc: "물은 노폐물 배출과 체온 조절에 필수적입니다." },
    { q: "갈증이 나기 전에 미리미리 물을 마셔주는 것이 좋다?", a: "O", desc: "갈증을 느낄 때는 이미 탈수가 시작된 상태입니다." }
];
let r6OXIndex = 0;

function loadR6OX() {
    if (r6OXIndex >= r6OXQuestions.length) {
        showModal('🎉 완벽해요! 진짜 물의 중요성을 모두 알게 되었습니다!', true);
        setTimeout(() => {
            closeModal();
            document.querySelectorAll('#room-screen-6 .quiz-stage').forEach(s => s.classList.add('hidden'));
            document.getElementById('r6-clear').classList.remove('hidden');
        }, 2000);
        return;
    }
    const q = r6OXQuestions[r6OXIndex];
    const container = document.getElementById('r6-ox-container');
    
    // 문제 등장 시 통통 튀는 애니메이션
    container.classList.remove('ox-animate-in');
    void container.offsetWidth; // reflow 강제 발생시켜 애니메이션 재시작
    container.classList.add('ox-animate-in');

    document.getElementById('r6-ox-question').innerHTML = `Q${r6OXIndex + 1}. ${q.q}`;
    document.getElementById('r6-ox-progress').textContent = `${r6OXIndex + 1} / ${r6OXQuestions.length}`;
}

function checkR6OX(answer) {
    const q = r6OXQuestions[r6OXIndex];
    const container = document.getElementById('r6-ox-container');
    
    if (answer === q.a) {
        // 정답일 때 스케일 업 이펙트
        container.style.transform = 'scale(1.05)';
        container.style.transition = 'transform 0.2s';
        
        showModal(`🎉 정답!\n${q.desc}`, true);
        r6OXIndex++;
        
        setTimeout(() => {
            container.style.transform = ''; // 원상복구
            closeModal();
            loadR6OX();
        }, 2000);
    } else {
        // 오답일 때 부르르 떨기
        container.classList.add('ox-shake');
        setTimeout(() => container.classList.remove('ox-shake'), 400);
        
        showModal(`❌ 오답!\n다시 생각해 보세요.`, false);
    }
}

// ===========================
// 방 클리어 & 코드 획득
// ===========================
function clearRoom(roomNum) {
    if (!clearedRooms.includes(roomNum)) clearedRooms.push(roomNum);
    fillPotion(roomNum);
    revealCode(roomNum);
    showScreen('hub');
    updateHubRooms();
    if (clearedRooms.length === 6) {
        setTimeout(() => { startWitchCutscene(); }, 1200);
    }
}

function fillPotion(num) {
    const layer = document.getElementById(`layer-${num}`);
    if (layer) { 
        layer.classList.add('filled'); 
    }
}

function revealCode(roomNum) {
    const codeEl = document.getElementById(`code-${roomNum}`);
    if (!codeEl) return;
    codeEl.classList.add('code-revealed');
    codeEl.innerHTML = `<span class="code-char">${codeLetters[roomNum]}</span>`;
    // HUD 돷 업데이트
    const hudDot = document.getElementById(`hdot-${roomNum}`);
    if (hudDot) {
        hudDot.classList.add('dot-revealed');
        hudDot.textContent = codeLetters[roomNum];
    }
    // 힌트 텍스트 업데이트
    const cleared = clearedRooms.length;
    const hintEl = document.getElementById('code-hint-text-hub') || document.querySelector('.code-hint-text');
    if (hintEl) {
        if (cleared < 6) hintEl.textContent = `${cleared} / 6 완료! 앞으로 ${6 - cleared}방 남았어요!`;
        else hintEl.textContent = '🎉 코드 완성! 영양전도사!';
    }
}

function updateHubRooms() {
    const cleared = clearedRooms.length;

    // HUD 진행 텍스트 업데이트
    const hudText = document.getElementById('hud-progress-text');
    if (hudText) hudText.textContent = `${cleared} / 6 방 완료`;

    for (let i = 1; i <= 6; i++) {
        const card = document.getElementById(`room-${i}`);
        if (!card) continue;

        const statusBtn = document.getElementById(`room-status-${i}`);
        const imgWrap = card.querySelector('.stage-img-wrap');
        const lockOverlay = imgWrap ? imgWrap.querySelector('.stage-lock-overlay') : null;
        const hudDot = document.getElementById(`hdot-${i}`);

        if (clearedRooms.includes(i)) {
            card.classList.remove('locked');
            card.classList.add('cleared');
            if (statusBtn) {
                statusBtn.textContent = '✅ 치료 완료!';
                statusBtn.className = 'stage-enter-btn enter-cleared';
            }
            if (lockOverlay) lockOverlay.remove();
            revealCode(i);
        } else if (i === 1 || clearedRooms.includes(i - 1)) {
            card.classList.remove('locked', 'cleared');
            if (statusBtn) {
                statusBtn.textContent = '🔓 입장하기';
                statusBtn.className = 'stage-enter-btn enter-open';
            }
            if (lockOverlay) lockOverlay.remove();
        }
    }
}

// ===========================
// 마녀 등장 컷씬
// ===========================
const witchCutsceneText = "감히 너희가 6대 영양소를 제대로 먹겠다고? 어림도 없지! 이 숲을 정크푸드로 뒤덮을테다!!!";
let cutsceneIdx = 0;

function startWitchCutscene() {
    // 모든 스크린 숨기기
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // 허브 화면에서 화면 흔들림 효과
    document.body.classList.add('shake-heavy');
    
    setTimeout(() => {
        document.body.classList.remove('shake-heavy');
        document.getElementById('witch-cutscene-screen').classList.remove('hidden');
        document.getElementById('cutscene-dialog-text').textContent = '';
        cutsceneIdx = 0;
        
        const screen = document.getElementById('witch-cutscene-screen');
        screen.style.boxShadow = 'inset 0 0 100px rgba(239,68,68,0.8)';
        setTimeout(() => { screen.style.boxShadow = ''; }, 500);

        setTimeout(typeWitchCutscene, 800);
    }, 1500);
}

function typeWitchCutscene() {
    const el = document.getElementById('cutscene-dialog-text');
    if (!el) return;
    if (cutsceneIdx < witchCutsceneText.length) {
        el.textContent += witchCutsceneText.charAt(cutsceneIdx);
        cutsceneIdx++;
        setTimeout(typeWitchCutscene, 60); // 타이핑 속도
    } else {
        // 대사 출력 완료 후 잠시 대기 후 미니게임 시작
        setTimeout(() => {
            document.getElementById('witch-cutscene-screen').classList.add('hidden');
            startWitchBattle();
        }, 2000);
    }
}

// ===========================
// 마녀 보스전 (마지막 - 미니게임)
// ===========================
let witchHp = 100;
let villageHp = 100;
let witchTime = 20.0;
let witchGameLoop = null;
let witchMoveInterval = null;
let junkSpawnInterval = null;
let isWitchDead = false;
let junkFoods = [];

function startWitchBattle() {
    // 모든 스크린 숨기기
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // 마녀 보스전 화면 표시
    const battleScreen = document.getElementById('witch-battle-screen');
    battleScreen.classList.remove('hidden');
    battleScreen.style.display = 'flex';
    
    // 상태 초기화
    witchHp = 100;
    villageHp = 100;
    witchTime = 20.0;
    isWitchDead = false;
    
    document.getElementById('witch-hp-bar').style.width = '100%';
    document.getElementById('village-hp-bar').style.width = '100%';
    document.getElementById('witch-timer').textContent = `남은 시간: ${witchTime.toFixed(1)}초`;
    
    // 마녀 위치 초기화
    const boss = document.getElementById('witch-boss');
    boss.style.left = '50%';
    boss.style.top = '0%';
    
    // 이전 생성된 장애물들 클리어
    document.querySelectorAll('.junk-food').forEach(j => j.remove());
    junkFoods = [];
    
    // 게임 루프 시작
    witchGameLoop = setInterval(updateWitchGame, 30); // 프레임 증가
    witchMoveInterval = setInterval(moveWitchRandomly, 1000); // 더 빠르게 이동
    junkSpawnInterval = setInterval(spawnJunkFood, 100); // 엄청나게 쏟아짐 (100ms)
}

function moveWitchRandomly() {
    if (isWitchDead) return;
    const boss = document.getElementById('witch-boss');
    
    // 가로 10% ~ 90%
    const newX = 10 + Math.random() * 80;
    // 맨 위에서만 머물도록 고정 (하늘)
    const newY = 0;
    
    boss.style.left = `${newX}%`;
    boss.style.top = `${newY}%`;
}

function spawnJunkFood() {
    if (isWitchDead) return;
    const boss = document.getElementById('witch-boss');
    const area = document.getElementById('witch-game-area');
    
    const junkEmojis = ['🍬', '🍪', '🍩', '🥐', '🍞', '🍕', '🍔'];
    const emoji = junkEmojis[Math.floor(Math.random() * junkEmojis.length)];
    
    const junk = document.createElement('div');
    junk.className = 'junk-food';
    junk.textContent = emoji;
    
    // 마녀의 현재 위치 계산
    const bossRect = boss.getBoundingClientRect();
    const areaRect = area.getBoundingClientRect();
    
    // 마녀의 중앙 아래쪽(입/손)에서 시작되도록 계산
    const startX = bossRect.left - areaRect.left + (bossRect.width / 2) - 20;
    let yPos = bossRect.bottom - areaRect.top - 40;
    
    junk.style.left = `${startX}px`;
    junk.style.top = `${yPos}px`;
    
    // 클릭(또는 터치)해서 방어(파괴)
    junk.onmousedown = (e) => {
        e.stopPropagation();
        if (isWitchDead) return;
        junk.style.transform = 'scale(1.5)';
        junk.style.opacity = '0';
        junkFoods = junkFoods.filter(j => j.el !== junk);
        setTimeout(() => junk.remove(), 200);
    };
    
    area.appendChild(junk);
    // x축(좌우 퍼짐)과 y축(중력 낙하) 속도를 랜덤 지정하여 영화처럼 마구 뿌려지게 함
    const speedX = (Math.random() - 0.5) * 20; // 좌우로 강하게 퍼짐
    const speedY = 2 + Math.random() * 5; // 떨어지는 속도 다양화
    
    junkFoods.push({ el: junk, x: startX, y: yPos, speedX: speedX, speedY: speedY }); 
}

function updateWitchGame() {
    if (isWitchDead) return;
    
    // 1. 타이머 처리
    witchTime -= 0.05; // 50ms = 0.05초
    if (witchTime <= 0) {
        witchTime = 0;
        document.getElementById('witch-timer').textContent = `남은 시간: 0.0초`;
        endWitchBattle(false, '시간이 초과되어 마녀가 코드를 들고 도망갔어요! 😱');
        return;
    }
    document.getElementById('witch-timer').textContent = `남은 시간: ${witchTime.toFixed(1)}초`;
    
    // 2. 장애물 낙하 처리
    const area = document.getElementById('witch-game-area');
    const areaRect = area.getBoundingClientRect();
    const groundY = areaRect.height - 20; // 바닥 높이
    
    for (let i = junkFoods.length - 1; i >= 0; i--) {
        const item = junkFoods[i];
        item.x += item.speedX;
        item.y += item.speedY;
        item.el.style.left = `${item.x}px`;
        item.el.style.top = `${item.y}px`;
        
        // 바닥에 닿으면
        if (item.y + 40 >= groundY) { // 40은 대략적인 아이템 높이
            item.el.remove();
            junkFoods.splice(i, 1);
            
            // 마을 데미지 (마구 쏟아지므로 데미지를 1%로 줄여서 오래 버틸 수 있게 함)
            villageHp -= 1;
            if (villageHp < 0) villageHp = 0;
            document.getElementById('village-hp-bar').style.width = `${villageHp}%`;
            
            // 화면 붉게 깜빡임 효과 (타격감)
            area.style.boxShadow = 'inset 0 0 50px rgba(239,68,68,0.9)';
            setTimeout(() => { area.style.boxShadow = ''; }, 200);
            
            if (villageHp <= 0) {
                endWitchBattle(false, '마을 방어력이 0이 되어 파괴되었습니다! 😭 다시 도전하세요!');
                return;
            }
        }
    }
}

function hitWitch() {
    if (witchTime <= 0 || isWitchDead) return;
    
    witchHp -= 5; // 20번 클릭 시 처치
    
    // 이모지 흔들기 효과
    const bossEl = document.getElementById('witch-boss');
    bossEl.style.transform = `translateX(-50%) scale(0.9) rotate(${(Math.random()-0.5)*20}deg)`;
    setTimeout(() => { bossEl.style.transform = 'translateX(-50%)'; }, 50);

    if (witchHp <= 0) {
        witchHp = 0;
        endWitchBattle(true, '🎉 마녀를 물리치고 마을을 지켜냈습니다!\n잃어버린 마지막 코드를 되찾았어요!');
    }
    document.getElementById('witch-hp-bar').style.width = `${witchHp}%`;
}

function endWitchBattle(isWin, msg) {
    isWitchDead = true;
    clearInterval(witchGameLoop);
    clearInterval(witchMoveInterval);
    clearInterval(junkSpawnInterval);
    
    if (isWin) {
        document.getElementById('witch-hp-bar').style.width = '0%';
        // 필드에 남은 정크푸드 폭발 효과
        document.querySelectorAll('.junk-food').forEach(j => {
            j.style.transform = 'scale(2)';
            j.style.opacity = '0';
            setTimeout(() => j.remove(), 200);
        });
        
        showModal(msg, true);
        setTimeout(() => {
            closeModal();
            showEnding();
        }, 2500);
    } else {
        showModal(msg, false);
        setTimeout(() => {
            closeModal();
            startWitchBattle(); // 재도전
        }, 2500);
    }
}

function showEnding() {
    const battleScreen = document.getElementById('witch-battle-screen');
    battleScreen.classList.add('hidden');
    battleScreen.style.display = 'none';
    
    showScreen('ending');
    
    // 엔딩 텍스트 초기화 후 타이핑 시작
    document.getElementById('ending-text').innerHTML = '';
    const dwarfs = document.getElementById('ending-dwarfs');
    if (dwarfs) dwarfs.classList.add('hidden');
    
    endingIdx = 0;
    setTimeout(typeEnding, 1000);
}

// ===========================
// 엔딩
// ===========================
const endingText = `여섯 방을 모두 돌아다닌 백설공주.\n영양전도사 코드가 완성되었습니다!\n\n완성된 영양 처방전을 난쟁이들에게 나누어 주자...\n\n시들시들했던 잠보, 여림이, 부풍이, 흐림이, 저리, 바싹이가\n모두 건강하고 튼튼하게 변신했습니다! 💪\n\n"공주님 덕분에 살았어요!"\n\n"우리도 이제 영양 전도사가 되어\n 올바른 식습관을 전파할게요! 🌟"\n\n"균형 잡힌 6대 영양소로\n 우리 모두 건강하게 살아요! 💊"\n\n━━━━━━━━━━━━━━━━━━\n🍚 탄수화물 · 🥩 단백질 · 🫒 지방\n🍊 비타민 · 🥛 무기질 · 💧 물\n━━━━━━━━━━━━━━━━━━\n\n— 행복하게 오래오래 살았답니다 —`;
let endingIdx = 0;

function typeEnding() {
    const el = document.getElementById('ending-text');
    if (!el) return;
    if (endingIdx < endingText.length) {
        const char = endingText.charAt(endingIdx);
        if (char === '\n') el.appendChild(document.createElement('br'));
        else el.innerHTML += char;
        endingIdx++;
        setTimeout(typeEnding, 40);
    } else {
        // 타이핑이 끝나면 난쟁이들 이미지 표시
        const dwarfs = document.getElementById('ending-dwarfs');
        if (dwarfs) dwarfs.classList.remove('hidden');
    }
}

// ===========================
// 인트로 3D 패럴랙스
// ===========================
const introSection = document.getElementById('intro');
const wrapper3D = document.getElementById('intro-3d-wrapper');
if (introSection && wrapper3D) {
    introSection.addEventListener('mousemove', e => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 30;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 30;
        wrapper3D.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });
    introSection.addEventListener('mouseleave', () => { wrapper3D.style.transition = 'transform 0.5s ease'; wrapper3D.style.transform = 'rotateY(0deg) rotateX(0deg)'; });
    introSection.addEventListener('mouseenter', () => { wrapper3D.style.transition = 'none'; });
}
