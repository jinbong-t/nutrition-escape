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
let r6DehyAnswers = {};

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
        } else {
            showModal(`으악! ${item.name}은(는) 칼슘 흡수를 방해해서 뼈에 구멍이 뚫려요! 💀`, false);
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
        scoreText.textContent = `점수: ${boneScore} / 5`;
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
        showModal(`☠️ 게임 오버! ${badName} 때문에 뼈가 다 부서졌어요... 다시 도전하세요!`, false);
        const startBtn = document.getElementById('start-bone-btn');
        if (startBtn) startBtn.style.display = 'block';
    }
}

// ===========================
// 방6: 탈수 진단
// ===========================
function selectDehyd(el) {
    const userAnswer = el.dataset.userAnswer;
    if (userAnswer) {
        el.classList.remove('dehyd-red','dehyd-blue');
        delete el.dataset.userAnswer;
        delete r6DehyAnswers[el.textContent];
    } else {
        el.classList.add(el.dataset.answer === '탈수' ? 'dehyd-red' : 'dehyd-blue');
        el.dataset.userAnswer = el.dataset.answer === '탈수' ? '탈수' : '정상';
        r6DehyAnswers[el.textContent] = el.dataset.userAnswer;
    }
}
function checkDehydQ(roomNum) {
    const cards = document.querySelectorAll('.dehyd-card');
    const answered = document.querySelectorAll('.dehyd-card[data-user-answer]').length;
    if (answered < cards.length) { showModal(`아직 ${cards.length - answered}개 항목이 남았어요!`, false); return; }
    let allCorrect = true;
    cards.forEach(c => { if (c.dataset.userAnswer !== c.dataset.answer) allCorrect = false; });
    if (allCorrect) {
        showModal('🎉 정확합니다! 탈수 증상을 모두 구별했어요!', true);
        setTimeout(() => { closeModal(); nextQuizStage(roomNum, 2); }, 1500);
    } else {
        showModal('틀린 항목이 있어요! 다시 살펴보세요.', false);
        cards.forEach(c => { c.classList.remove('dehyd-red','dehyd-blue'); delete c.dataset.userAnswer; });
        r6DehyAnswers = {};
    }
}

// 방6: 비밀번호 (Q3)
function checkWaterPasswordQ(roomNum) {
    const p1 = document.getElementById('r6-pw-1').value;
    const p2 = document.getElementById('r6-pw-2').value;
    const p3 = document.getElementById('r6-pw-3').value;
    if (p1 === '2' && p2 === '4' && p3 === '2') {
        showModal('🎉 찰칵! 자물쇠가 열렸습니다! 완벽해요!', true);
        setTimeout(() => { closeModal(); nextQuizStage(roomNum, 3); }, 1800);
    } else {
        showModal('❌ 삐빅! 비밀번호가 틀렸습니다. 다시 생각해 보세요!', false);
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
        setTimeout(() => { showScreen('ending'); typeEnding(); }, 1200);
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
// 엔딩
// ===========================
const endingText = `여섯 방을 모두 돌아다닌 백설공주.\n영양전도사 코드가 완성되었습니다!\n\n완성된 영양 처방전을 난쟁이들에게 나누어 주자...\n\n시들시들했던 잠보, 여림이, 부풍이, 흐림이, 저리, 갈증이\n하나씩 건강하고 튼튼하게 변신했습니다! 💪\n\n"공주님 덕분에 살았어요!"\n\n"우리도 이제 영양 전도사가 되어\n 올바른 식습관을 전파할게요! 🌟"\n\n"균형 잡힌 6대 영양소로\n 우리 모두 건강하게 살아요! 💊"\n\n━━━━━━━━━━━━━━━━━━\n🍚 탄수화물 · 🥩 단백질 · 🫒 지방\n🍊 비타민 · 🥛 무기질 · 💧 물\n━━━━━━━━━━━━━━━━━━\n\n— 행복하게 오래오래 살았답니다 —`;
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
