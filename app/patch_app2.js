const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

function replaceAll(target, replacement) {
    code = code.split(target).join(replacement);
}

// 1. 방 입장 추적
replaceAll("function enterRoom(roomNum) {\n", "function enterRoom(roomNum) {\n    if (window.trackRoomEntry) trackRoomEntry(roomNum);\n");

// 2. checkOption
replaceAll("function checkOption(roomNum, qNum, btn, result) {\n", "function checkOption(roomNum, qNum, btn, result) {\n    if (window.trackQuestion) trackQuestion(roomNum, qNum, result, btn.innerText);\n");

// 3. checkLie
replaceAll("function checkLie(roomNum, btn, isCorrect) {\n", "function checkLie(roomNum, btn, isCorrect) {\n    if (window.trackQuestion) trackQuestion(roomNum, 1, isCorrect, btn.innerText);\n");

// 4. checkClassifyQ
code = code.replace(/if \(allCorrect\) \{\s*showModal\('🎉 완벽해요! 단당류와 다당류를 정확히 구분했어요!', true\);/g, "if (allCorrect) { if (window.trackQuestion) trackQuestion(roomNum, 2, true, '분류 성공'); showModal('🎉 완벽해요! 단당류와 다당류를 정확히 구분했어요!', true);");
code = code.replace(/else \{\s*showModal\('아직 틀린 분류가 있어요! 단당류\(포도당·과당\), 다당류\(녹말·식이섬유\)를 기억하세요.', false\);/g, "else { if (window.trackQuestion) trackQuestion(roomNum, 2, false, '분류 실패'); showModal('아직 틀린 분류가 있어요! 단당류(포도당·과당), 다당류(녹말·식이섬유)를 기억하세요.', false);");

// 5. checkDiaryQ
code = code.replace(/if \(allFilled\) \{\s*showModal\('🎉 정답입니다! 단백질이 어떻게 근육이 되는지 잘 알았네요.', true\);/g, "if (allFilled) { if (window.trackQuestion) trackQuestion(roomNum, 2, true, '빈칸 채우기 성공'); showModal('🎉 정답입니다! 단백질이 어떻게 근육이 되는지 잘 알았네요.', true);");
code = code.replace(/else \{\s*playWrong\(\);\s*showModal\('❌ 순서가 틀렸어요! 힌트를 다시 확인해보세요.', false\);/g, "else { if (window.trackQuestion) trackQuestion(roomNum, 2, false, '빈칸 오답'); playWrong(); showModal('❌ 순서가 틀렸어요! 힌트를 다시 확인해보세요.', false);");

// 6. checkOrderQ
code = code.replace(/if \(success\) \{\s*showModal\('🎉 정답입니다! 소화 과정을 정확하게 맞췄어요.', true\);/g, "if (success) { if (window.trackQuestion) trackQuestion(roomNum, 3, true, '순서 맞추기 성공'); showModal('🎉 정답입니다! 소화 과정을 정확하게 맞췄어요.', true);");
code = code.replace(/else \{\s*playWrong\(\);\s*showModal\('❌ 순서가 틀렸어요. 처음부터 다시 배열해보세요.', false\);/g, "else { if (window.trackQuestion) trackQuestion(roomNum, 3, false, '순서 틀림'); playWrong(); showModal('❌ 순서가 틀렸어요. 처음부터 다시 배열해보세요.', false);");

// 7. checkOXQ
code = code.replace(/if \(correctCount === 3\) \{\s*showModal\('🎉 완벽해요! 지방에 대한 모든 오해를 풀었어요.', true\);/g, "if (correctCount === 3) { if (window.trackQuestion) trackQuestion(roomNum, 2, true, 'OX 모두 정답'); showModal('🎉 완벽해요! 지방에 대한 모든 오해를 풀었어요.', true);");
code = code.replace(/else \{\s*showModal\(`아직 틀린 답이 \$\{3 - correctCount\}개 있어요. 힌트를 확인해 보세요.`, false\);/g, "else { if (window.trackQuestion) trackQuestion(roomNum, 2, false, 'OX 오답'); showModal(`아직 틀린 답이 ${3 - correctCount}개 있어요. 힌트를 확인해 보세요.`, false);");

// 8. checkCartQ
code = code.replace(/if \(allCorrect && r5CartItems\.length === 3\) \{\s*showModal\('🎉 완벽해요! 칼슘 흡수를 돕는 식품만 정확하게 골랐어요!', true\);/g, "if (allCorrect && r5CartItems.length === 3) { if (window.trackQuestion) trackQuestion(roomNum, 2, true, '장바구니 성공'); showModal('🎉 완벽해요! 칼슘 흡수를 돕는 식품만 정확하게 골랐어요!', true);");
code = code.replace(/else if \(r5CartItems\.length !== 3\) \{\s*showModal\('바구니에 3개의 식품을 담아주세요!', false\);/g, "else if (r5CartItems.length !== 3) { if (window.trackQuestion) trackQuestion(roomNum, 2, false, '바구니 갯수 미달'); showModal('바구니에 3개의 식품을 담아주세요!', false);");
code = code.replace(/else \{\s*showModal\('❌ 칼슘 흡수를 방해하는 식품이 섞여있어요! 다시 골라보세요.', false\);/g, "else { if (window.trackQuestion) trackQuestion(roomNum, 2, false, '바구니 오답'); showModal('❌ 칼슘 흡수를 방해하는 식품이 섞여있어요! 다시 골라보세요.', false);");

// 9. checkDrinkChoice
replaceAll("function checkDrinkChoice(drink) {\n", "function checkDrinkChoice(drink) {\n    if (window.trackQuestion) trackQuestion(6, 1, drink === 'water', drink);\n");

// 10. checkR6OX
replaceAll("function checkR6OX(answer) {\n", "function checkR6OX(answer) {\n    if (window.trackQuestion) trackQuestion(6, 2, answer === 'X', answer);\n");

// 11. checkR7Stage1
code = code.replace(/if \(parseInt\(inputVal\) === 330\) \{/, "if (parseInt(inputVal) === 330) { if (window.trackR7) trackR7(1, inputVal, true);");
code = code.replace(/else \{\s*playWrong\(\);\s*showModal\('❌ 틀렸습니다. 탄수화물과 단백질은 1g당 4kcal, 지방은 9kcal임을 기억하세요!', false\);/, "else { if (window.trackR7) trackR7(1, inputVal, false); playWrong(); showModal('❌ 틀렸습니다. 탄수화물과 단백질은 1g당 4kcal, 지방은 9kcal임을 기억하세요!', false);");

// 12. checkR7Stage2
code = code.replace(/if \(carbs === 'glucose' && protein === 'amino' && fat === 'fatty'\) \{/, "if (carbs === 'glucose' && protein === 'amino' && fat === 'fatty') { if (window.trackR7) trackR7(2, carbs+','+protein+','+fat, true);");
code = code.replace(/else \{\s*playWrong\(\);\s*showModal\('❌ 틀렸습니다. 소화 산물이 올바르게 연결되지 않았습니다.', false\);/, "else { if (window.trackR7) trackR7(2, carbs+','+protein+','+fat, false); playWrong(); showModal('❌ 틀렸습니다. 소화 산물이 올바르게 연결되지 않았습니다.', false);");

// 13. checkR7Stage3
code = code.replace(/if \(hasA && hasC\) \{/, "if (hasA && hasC) { if (window.trackR7) trackR7(3, r7SelectedVits.join(','), true);");
code = code.replace(/else \{\s*playWrong\(\);\s*showModal\('❌ 아쉽습니다. 야맹증과 괴혈병을 치료할 비타민이 부족해요.', false\);/, "else { if (window.trackR7) trackR7(3, r7SelectedVits.join(','), false); playWrong(); showModal('❌ 아쉽습니다. 야맹증과 괴혈병을 치료할 비타민이 부족해요.', false);");

fs.writeFileSync('app.js', code, 'utf8');
console.log('patched');
