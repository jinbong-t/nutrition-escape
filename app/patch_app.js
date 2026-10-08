const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const replacements = [
  {
    target: "function enterRoom(roomNum) {",
    replace: "function enterRoom(roomNum) {\n    if (window.trackRoomEntry) trackRoomEntry(roomNum);"
  },
  {
    target: "function checkOption(roomNum, qNum, btn, result) {",
    replace: "function checkOption(roomNum, qNum, btn, result) {\n    if (window.trackQuestion) trackQuestion(roomNum, qNum, result, btn.innerText);"
  },
  {
    target: "function checkLie(roomNum, btn, isCorrect) {",
    replace: "function checkLie(roomNum, btn, isCorrect) {\n    if (window.trackQuestion) trackQuestion(roomNum, 1, isCorrect, btn.innerText);"
  },
  {
    target: "if (allCorrect) {\n        showModal('🎉 완벽해요! 단당류와 다당류를 정확히 구분했어요!', true);",
    replace: "if (allCorrect) {\n        if (window.trackQuestion) trackQuestion(roomNum, 2, true, '분류 성공');\n        showModal('🎉 완벽해요! 단당류와 다당류를 정확히 구분했어요!', true);"
  },
  {
    target: "else {\n        showModal('아직 틀린 분류가 있어요! 단당류(포도당·과당), 다당류(녹말·식이섬유)를 기억하세요.', false);",
    replace: "else {\n        if (window.trackQuestion) trackQuestion(roomNum, 2, false, '분류 실패');\n        showModal('아직 틀린 분류가 있어요! 단당류(포도당·과당), 다당류(녹말·식이섬유)를 기억하세요.', false);"
  },
  {
    target: "if (allFilled) {\n        showModal('🎉 정답입니다! 단백질이 어떻게 근육이 되는지 잘 알았네요.', true);",
    replace: "if (allFilled) {\n        if (window.trackQuestion) trackQuestion(roomNum, 2, true, '빈칸 채우기 성공');\n        showModal('🎉 정답입니다! 단백질이 어떻게 근육이 되는지 잘 알았네요.', true);"
  },
  {
    target: "else {\n        playWrong();\n        showModal('❌ 순서가 틀렸어요! 힌트를 다시 확인해보세요.', false);",
    replace: "else {\n        if (window.trackQuestion) trackQuestion(roomNum, 2, false, '빈칸 오답');\n        playWrong();\n        showModal('❌ 순서가 틀렸어요! 힌트를 다시 확인해보세요.', false);"
  },
  {
    target: "if (success) {\n        showModal('🎉 정답입니다! 소화 과정을 정확하게 맞췄어요.', true);",
    replace: "if (success) {\n        if (window.trackQuestion) trackQuestion(roomNum, 3, true, '순서 맞추기 성공');\n        showModal('🎉 정답입니다! 소화 과정을 정확하게 맞췄어요.', true);"
  },
  {
    target: "else {\n        playWrong();\n        showModal('❌ 순서가 틀렸어요. 처음부터 다시 배열해보세요.', false);",
    replace: "else {\n        if (window.trackQuestion) trackQuestion(roomNum, 3, false, '순서 틀림');\n        playWrong();\n        showModal('❌ 순서가 틀렸어요. 처음부터 다시 배열해보세요.', false);"
  },
  {
    target: "if (correctCount === 3) {\n        showModal('🎉 완벽해요! 지방에 대한 모든 오해를 풀었어요.', true);",
    replace: "if (correctCount === 3) {\n        if (window.trackQuestion) trackQuestion(roomNum, 2, true, 'OX 모두 정답');\n        showModal('🎉 완벽해요! 지방에 대한 모든 오해를 풀었어요.', true);"
  },
  {
    target: "else {\n        showModal(`아직 틀린 답이 ${3 - correctCount}개 있어요. 힌트를 확인해 보세요.`, false);",
    replace: "else {\n        if (window.trackQuestion) trackQuestion(roomNum, 2, false, 'OX 오답');\n        showModal(`아직 틀린 답이 ${3 - correctCount}개 있어요. 힌트를 확인해 보세요.`, false);"
  },
  {
    target: "if (r4MatchingSelected.pairs.length < 4) { showModal(`아직 ${4 - r4MatchingSelected.pairs.length}개 연결이 남았어요!`, false); return; }",
    replace: "if (r4MatchingSelected.pairs.length < 4) { if (window.trackQuestion) trackQuestion(roomNum, 2, false, '매칭 미완성'); showModal(`아직 ${4 - r4MatchingSelected.pairs.length}개 연결이 남았어요!`, false); return; }"
  },
  {
    target: "showModal('🎉 모든 비타민과 증상을 정확히 연결했어요!', true);",
    replace: "if (window.trackQuestion) trackQuestion(roomNum, 2, true, '매칭 성공');\n    showModal('🎉 모든 비타민과 증상을 정확히 연결했어요!', true);"
  },
  {
    target: "if (allCorrect && r5CartItems.length === 3) {\n        showModal('🎉 완벽해요! 칼슘 흡수를 돕는 식품만 정확하게 골랐어요!', true);",
    replace: "if (allCorrect && r5CartItems.length === 3) {\n        if (window.trackQuestion) trackQuestion(roomNum, 2, true, '장바구니 성공');\n        showModal('🎉 완벽해요! 칼슘 흡수를 돕는 식품만 정확하게 골랐어요!', true);"
  },
  {
    target: "else if (r5CartItems.length !== 3) {\n        showModal('바구니에 3개의 식품을 담아주세요!', false);",
    replace: "else if (r5CartItems.length !== 3) {\n        if (window.trackQuestion) trackQuestion(roomNum, 2, false, '바구니 갯수 미달');\n        showModal('바구니에 3개의 식품을 담아주세요!', false);"
  },
  {
    target: "else {\n        showModal('❌ 칼슘 흡수를 방해하는 식품이 섞여있어요! 다시 골라보세요.', false);",
    replace: "else {\n        if (window.trackQuestion) trackQuestion(roomNum, 2, false, '바구니 오답');\n        showModal('❌ 칼슘 흡수를 방해하는 식품이 섞여있어요! 다시 골라보세요.', false);"
  },
  {
    target: "function checkDrinkChoice(drink) {",
    replace: "function checkDrinkChoice(drink) {\n    if (window.trackQuestion) trackQuestion(6, 1, drink === 'water', drink);"
  },
  {
    target: "function checkR6OX(answer) {",
    replace: "function checkR6OX(answer) {\n    if (window.trackQuestion) trackQuestion(6, 2, answer === 'X', answer);"
  },
  {
    target: "if (parseInt(inputVal) === 330) {",
    replace: "if (parseInt(inputVal) === 330) {\n        if (window.trackR7) trackR7(1, inputVal, true);"
  },
  {
    target: "else {\n        playWrong();\n        showModal('❌ 틀렸습니다. 탄수화물과 단백질은 1g당 4kcal, 지방은 9kcal임을 기억하세요!', false);",
    replace: "else {\n        if (window.trackR7) trackR7(1, inputVal, false);\n        playWrong();\n        showModal('❌ 틀렸습니다. 탄수화물과 단백질은 1g당 4kcal, 지방은 9kcal임을 기억하세요!', false);"
  },
  {
    target: "if (carbs === 'glucose' && protein === 'amino' && fat === 'fatty') {",
    replace: "if (carbs === 'glucose' && protein === 'amino' && fat === 'fatty') {\n        if (window.trackR7) trackR7(2, carbs + ',' + protein + ',' + fat, true);"
  },
  {
    target: "else {\n        playWrong();\n        showModal('❌ 틀렸습니다. 소화 산물이 올바르게 연결되지 않았습니다.', false);",
    replace: "else {\n        if (window.trackR7) trackR7(2, carbs + ',' + protein + ',' + fat, false);\n        playWrong();\n        showModal('❌ 틀렸습니다. 소화 산물이 올바르게 연결되지 않았습니다.', false);"
  },
  {
    target: "if (hasA && hasC) {",
    replace: "if (hasA && hasC) {\n        if (window.trackR7) trackR7(3, r7SelectedVits.join(','), true);"
  },
  {
    target: "else {\n        playWrong();\n        showModal('❌ 아쉽습니다. 야맹증과 괴혈병을 치료할 비타민이 부족해요.', false);",
    replace: "else {\n        if (window.trackR7) trackR7(3, r7SelectedVits.join(','), false);\n        playWrong();\n        showModal('❌ 아쉽습니다. 야맹증과 괴혈병을 치료할 비타민이 부족해요.', false);"
  }
];

let modified = code;
replacements.forEach(r => {
  if (modified.includes(r.target)) {
    modified = modified.replace(r.target, r.replace);
  } else {
    console.log("NOT FOUND: " + r.target);
  }
});

fs.writeFileSync('app.js', modified, 'utf8');
console.log("app.js patched successfully.");
