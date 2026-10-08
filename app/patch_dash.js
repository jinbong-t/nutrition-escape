const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

// 1. Add Feedback Tab Button
html = html.replace(
    '<button class="tab-btn" onclick="switchTab(\'ranking\')">🏆 명예의 전당</button>',
    '<button class="tab-btn" onclick="switchTab(\'ranking\')">🏆 명예의 전당</button>\n            <button class="tab-btn" onclick="switchTab(\'feedback\')">📊 수업 환류</button>'
);

// 2. Add Feedback Tab Content
const feedbackTabHtml = `
        <!-- 수업 환류 탭 -->
        <div id="tab-feedback" class="tab-content">
            <div class="toolbar" style="justify-content: flex-end;">
                <button class="save-btn" onclick="saveFeedbackImage()">📸 이미지로 저장</button>
            </div>
            <div class="stats-row" id="feedback-content" style="grid-template-columns: 1fr 1fr;">
                <div class="stat-card" style="text-align: left; grid-column: span 2;">
                    <h3 style="color:#ffd700; margin-bottom:10px;">🔥 가장 많이 틀린 문제 TOP 5</h3>
                    <div id="top-wrong-questions" style="font-size:0.9rem; line-height:1.6;">데이터 수집 중...</div>
                </div>
                <div class="stat-card" style="text-align: left;">
                    <h3 style="color:#ffd700; margin-bottom:10px;">📈 평가 등급 분포</h3>
                    <div id="eval-distribution" style="font-size:0.9rem; line-height:1.6;">데이터 수집 중...</div>
                </div>
            </div>
        </div>
`;
html = html.replace('<!-- 명예의 전당 탭 -->', feedbackTabHtml + '\n        <!-- 명예의 전당 탭 -->');

// 3. Add Process Evaluation Modal
const evalModalHtml = `
    <!-- 과정평가 및 방별 상세 모달 -->
    <div class="feedback-modal-overlay" id="process-modal-overlay">
        <div class="feedback-modal" style="max-width:600px;">
            <button class="close-modal" onclick="document.getElementById('process-modal-overlay').classList.remove('active')">✕</button>
            <h3 id="process-modal-title">학생 상세 정보</h3>
            <div id="process-modal-content" class="feedback-full-text" style="max-height: 400px; overflow-y: auto;">
                <!-- 내용 동적 생성 -->
            </div>
        </div>
    </div>
`;
html = html.replace('</body>', evalModalHtml + '\n</body>');

// 4. Update Table Header
html = html.replace(
    '<th>상태</th>',
    '<th>상태</th>\n                            <th>방별 이해도</th>'
);

// 5. Inject new JS logic
const newJsLogic = `
        // --- 과정 중심 평가 추가 로직 ---
        function calculateUnderstandingColor(roomStat) {
            if (!roomStat || !roomStat.questions || Object.keys(roomStat.questions).length === 0) return 'gray';
            let allFirstTry = true;
            let anyThreeFails = false;
            
            for (let qId in roomStat.questions) {
                const q = roomStat.questions[qId];
                if (!q.firstTryCorrect) allFirstTry = false;
                if (q.attempts >= 3 && !q.firstTryCorrect) anyThreeFails = true;
            }
            
            if (allFirstTry) return '#4ade80'; // Green
            if (anyThreeFails) return '#ef4444'; // Red
            return '#fbbf24'; // Yellow
        }

        function showProcessModal(docId) {
            const doc = studentsData.find(d => d.id === docId);
            if (!doc) return;
            const data = doc.data();
            
            let html = '<h4>[방별 상세 기록]</h4>';
            if (data.roomStats) {
                for (let i = 1; i <= 7; i++) {
                    const rStat = data.roomStats[i];
                    if (rStat && rStat.entryTime) {
                        const timeSpent = rStat.clearTime ? Math.round((rStat.clearTime - rStat.entryTime) / 1000) + '초' : '진행중';
                        html += \`<div style="margin-top:10px; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                            <strong>\${i}번 방</strong> (소요시간: \${timeSpent})<br>\`;
                        
                        if (rStat.questions) {
                            for (let q in rStat.questions) {
                                const qData = rStat.questions[q];
                                html += \`- 문제 \${q}: \${qData.firstTryCorrect ? 'O' : 'X'} (시도: \${qData.attempts}회) \`;
                                if (qData.lastWrongAnswer) html += \`<span style="color:#ef4444; font-size:0.8rem;">마지막 오답: \${qData.lastWrongAnswer}</span>\`;
                                html += '<br>';
                            }
                        }
                        html += '</div>';
                    }
                }
            } else {
                html += '<p>데이터가 없습니다.</p>';
            }
            
            // 과정평가 기준 자동 계산
            let knowScore = 0, applyScore = 0, attitudeScore = 0;
            // ... (간단한 계산 예시)
            
            document.getElementById('process-modal-title').innerText = data.name + ' 상세 분석';
            document.getElementById('process-modal-content').innerHTML = html;
            document.getElementById('process-modal-overlay').classList.add('active');
        }

        // CSV export overriding
        const originalExportCSV = window.exportCSV; // Not fully reliable in string injection, but we will inject it correctly.
`;
html = html.replace('// 데이터 실시간 수신', newJsLogic + '\n        // 데이터 실시간 수신');

// Overwrite the renderTable function partially using regex
html = html.replace(/<td class="status-cell">[\s\S]*?<\/td>/g, 
    '$&\n                            <td class="understanding-cell"></td>'
);

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('dashboard patched');
