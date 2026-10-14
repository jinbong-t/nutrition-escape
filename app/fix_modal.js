const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

const detailModalHtml = `
<!-- 방별 상세 기록 모달 -->
<div class="feedback-modal-overlay" id="room-detail-modal">
    <div class="feedback-modal" style="max-width:500px;">
        <button class="modal-close" onclick="document.getElementById('room-detail-modal').classList.remove('active')">✕</button>
        <h3 id="room-modal-title" style="color:#ffd700; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px; margin-bottom:15px;">방 상세 기록</h3>
        <div class="feedback-full-text" id="room-modal-content" style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); font-size: 0.9rem; max-height: 400px; overflow-y: auto;">
        </div>
    </div>
</div>
`;

if (!html.includes('id="room-detail-modal"')) {
    html = html.replace('<!-- 소감 상세 모달 -->', detailModalHtml + '\n<!-- 소감 상세 모달 -->');
}

const improvedModalJS = `
function showRoomDetailModal(studentId, roomNum) {
    const s = allStudents.find(x => x.id === studentId);
    const modalContent = document.getElementById('room-modal-content');
    const modalTitle = document.getElementById('room-modal-title');
    
    if (!s || !s.roomStats || !s.roomStats[roomNum]) {
        modalTitle.innerText = s.name + ' - ' + roomNum + '방 상세 기록';
        modalContent.innerHTML = '<div style="color:rgba(255,255,255,0.5); text-align:center; padding:20px;">이 방에 대한 진행 기록이 없습니다.</div>';
        document.getElementById('room-detail-modal').classList.add('active');
        return;
    }
    const rStat = s.roomStats[roomNum];
    modalTitle.innerText = s.name + ' - ' + roomNum + '방 상세 기록';
    
    let msg = '';
    if (rStat.entryTime) {
        const timeSpent = rStat.clearTime ? Math.round((rStat.clearTime - rStat.entryTime) / 1000) + '초' : '진행 중 🔥';
        msg += '<div style="margin-bottom:15px; font-weight:bold; color:#4ade80;">⏱ 소요 시간: ' + timeSpent + '</div>';
    }
    
    if (rStat.questions && Object.keys(rStat.questions).length > 0) {
        msg += '<div style="display:flex; flex-direction:column; gap:8px;">';
        for (let q in rStat.questions) {
            const qData = rStat.questions[q];
            const isO = qData.firstTryCorrect;
            msg += '<div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">';
            msg += '<div><strong style="color:#fbbf24;">문제 ' + q + '</strong> : ';
            msg += isO ? '<span style="color:#4ade80;">첫 시도 정답 🟢</span>' : '<span style="color:#ef4444;">오답 경험 🔴</span>';
            msg += ' <span style="color:rgba(255,255,255,0.5); font-size:0.8rem;">(총 시도: ' + qData.attempts + '회)</span></div>';
            
            if (qData.lastWrongAnswer) {
                msg += '<div style="margin-top:6px; font-size:0.85rem; color:#f87171; background:rgba(239,68,68,0.1); padding:4px 8px; border-radius:4px;">❌ 마지막 오답: ' + qData.lastWrongAnswer + '</div>';
            }
            msg += '</div>';
        }
        msg += '</div>';
    } else {
        msg += '<div style="color:rgba(255,255,255,0.5); text-align:center; padding:20px;">문제 풀이 기록이 없습니다.</div>';
    }
    
    modalContent.innerHTML = msg;
    document.getElementById('room-detail-modal').classList.add('active');
}
`;

html = html.replace(/function showRoomDetailModal[\s\S]*?alert\(msg\);\s*\}/, improvedModalJS);

// Fix understanding dots styling to use darker text color
html = html.replace(/class="room-dot" style="background:\$\{color\};"/g, 'class="room-dot" style="background:${color}; color:#111;"');

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Modal injected and dots styled.');
