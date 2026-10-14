const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

const additionalJS = `
function getUnderstandingColor(s, roomNum) {
    if (!s.roomStats || !s.roomStats[roomNum]) return 'rgba(255,255,255,0.1)';
    const rStat = s.roomStats[roomNum];
    if (!rStat.questions || Object.keys(rStat.questions).length === 0) return 'rgba(255,255,255,0.1)';
    
    let allFirstTry = true;
    let anyThreeFails = false;
    
    for (let qId in rStat.questions) {
        const q = rStat.questions[qId];
        if (!q.firstTryCorrect) allFirstTry = false;
        if (q.attempts >= 3 && !q.firstTryCorrect) anyThreeFails = true;
    }
    
    if (allFirstTry) return '#4ade80';
    if (anyThreeFails) return '#ef4444';
    return '#fbbf24';
}

function getUnderstandingDots(s) {
    return Array.from({length:7}, (_, i) => {
        const color = getUnderstandingColor(s, i + 1);
        return \`<div class="room-dot" style="background:\${color};" onclick="event.stopPropagation(); showRoomDetailModal('\${s.id}', \${i + 1})" title="방 상세 보기">\${i+1}</div>\`;
    }).join('');
}

function showRoomDetailModal(studentId, roomNum) {
    const s = allStudents.find(x => x.id === studentId);
    if (!s || !s.roomStats || !s.roomStats[roomNum]) {
        alert('이 방에 대한 기록이 없습니다.');
        return;
    }
    const rStat = s.roomStats[roomNum];
    let msg = s.name + ' 학생의 ' + roomNum + '방 상세 기록\\n\\n';
    if (rStat.entryTime) {
        const timeSpent = rStat.clearTime ? Math.round((rStat.clearTime - rStat.entryTime) / 1000) + '초' : '진행 중';
        msg += '소요시간: ' + timeSpent + '\\n\\n';
    }
    if (rStat.questions) {
        for (let q in rStat.questions) {
            const qData = rStat.questions[q];
            msg += '- 문제 ' + q + ': ' + (qData.firstTryCorrect ? 'O' : 'X') + ' (시도: ' + qData.attempts + '회)\\n';
            if (qData.lastWrongAnswer) msg += '  마지막 오답: ' + qData.lastWrongAnswer + '\\n';
        }
    }
    alert(msg);
}
`;

html = html.replace('function getRoomDots(s) {', additionalJS + '\nfunction getRoomDots(s) {');

// Add to table body row (Line 546-550 region)
html = html.replace('<td><div class="rooms-dots">${getRoomDots(s)}</div></td>', 
    '<td><div class="rooms-dots">${getRoomDots(s)}</div></td>\n            <td><div class="rooms-dots">${getUnderstandingDots(s)}</div></td>'
);

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Successfully added understanding logic.');
