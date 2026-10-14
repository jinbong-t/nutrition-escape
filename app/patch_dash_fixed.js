const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

// 1. Add Feedback Tab Button
html = html.replace(
    '<button class=\"tab-btn\" id=\"tab-btn-ranking\" onclick=\"switchTab(\\'ranking\\')\">🏆 순위표</button>',
    '<button class=\"tab-btn\" id=\"tab-btn-ranking\" onclick=\"switchTab(\\'ranking\\')\">🏆 순위표</button>\\n    <button class=\"tab-btn\" id=\"tab-btn-feedback\" onclick=\"switchTab(\\'feedback\\')\">💡 수업 환류</button>'
);

// 2. Add Feedback Tab Content
const feedbackTabHtml = \
<!-- ======================== 탭3: 수업 환류 ======================== -->
<div class="tab-content" id="tab-feedback">
    <div class="ranking-section">
        <div class="toolbar" style="justify-content: flex-end; margin-bottom: 10px;">
            <button class="save-btn" onclick="saveAsImage('tab-feedback')" style="background:linear-gradient(135deg,#ec4899,#be185d);">
                📸 수업 환류 저장
            </button>
        </div>
        <div class="stats-row" style="grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="stat-card" style="text-align: left; grid-column: span 1; padding: 20px;">
                <h3 style="color:#ffd700; margin-bottom:15px; font-family:'Gamja Flower',cursive; font-size: 1.3rem;">🚨 오답 집중 구간 TOP 5</h3>
                <div id="top-wrong-questions" style="font-size:0.95rem; line-height:1.8;">
                    데이터 분석 중...
                </div>
            </div>
            <div class="stat-card" style="text-align: left; grid-column: span 1; padding: 20px;">
                <h3 style="color:#ffd700; margin-bottom:15px; font-family:'Gamja Flower',cursive; font-size: 1.3rem;">📊 과정 평가(지식/적용/태도) 분포</h3>
                <div id="eval-distribution" style="font-size:0.95rem; line-height:1.8;">
                    데이터 분석 중...
                </div>
            </div>
        </div>
    </div>
</div>
\;
html = html.replace('<!-- ======================== 탭2: 순위표 ======================== -->', feedbackTabHtml + '\\n<!-- ======================== 탭2: 순위표 ======================== -->');

// 3. Add '방별 이해도' column to the table
html = html.replace(
    '<th onclick=\"handleSort(\\'progress\\')\" style=\"cursor:pointer;\" title=\"클릭하여 정렬\">방 진행 ↕</th>',
    '<th onclick=\"handleSort(\\'progress\\')\" style=\"cursor:pointer;\" title=\"클릭하여 정렬\">방 진행 ↕</th>\\n                    <th>방별 이해도</th>'
);

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('dashboard.html successfully patched in Node.js');
