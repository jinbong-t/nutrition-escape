const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

const injectionCode = `
// ===========================
// 수업 환류 렌더링
// ===========================
function renderFeedbackTab() {
    // 1. 오답 집중 구간 분석
    let questionStats = {};
    allStudents.forEach(s => {
        if (!s.roomStats) return;
        for (let roomNum in s.roomStats) {
            const rStat = s.roomStats[roomNum];
            if (!rStat.questions) continue;
            for (let qId in rStat.questions) {
                const q = rStat.questions[qId];
                if (!q.firstTryCorrect) {
                    const key = \`\${roomNames[roomNum-1]||(roomNum+'방')} - \${qId}번 문제\`;
                    if (!questionStats[key]) questionStats[key] = { wrongCount: 0, answers: {} };
                    questionStats[key].wrongCount++;
                    if (q.lastWrongAnswer) {
                        questionStats[key].answers[q.lastWrongAnswer] = (questionStats[key].answers[q.lastWrongAnswer] || 0) + 1;
                    }
                }
            }
        }
    });

    const sortedWrong = Object.keys(questionStats).map(key => ({
        name: key,
        count: questionStats[key].wrongCount,
        answers: questionStats[key].answers
    })).sort((a,b) => b.count - a.count).slice(0, 5);

    const wrongDiv = document.getElementById('top-wrong-questions');
    if (sortedWrong.length === 0) {
        wrongDiv.innerHTML = '<div style="color:rgba(255,255,255,0.5);">아직 오답 데이터가 충분하지 않아요.</div>';
    } else {
        wrongDiv.innerHTML = sortedWrong.map((item, idx) => {
            let mostCommonAnswer = '';
            if (Object.keys(item.answers).length > 0) {
                const topAns = Object.keys(item.answers).sort((a,b) => item.answers[b] - item.answers[a])[0];
                mostCommonAnswer = \`<span style="color:#ef4444; font-size:0.85rem; margin-left:10px;">(주요 오답: \${topAns})</span>\`;
            }
            return \`<div style="margin-bottom:8px;">
                <span style="color:#fbbf24; font-weight:bold;">\${idx+1}. \${item.name}</span>
                <span style="color:#e2e8f0; margin-left:10px;">\${item.count}명 틀림</span>
                \${mostCommonAnswer}
            </div>\`;
        }).join('');
    }

    // 2. 과정 평가 분포
    let evalCounts = { high: 0, mid: 0, low: 0, none: 0 };
    allStudents.forEach(s => {
        if (s.rubricScore >= 2) evalCounts.high++;
        else if (s.rubricScore === 1) evalCounts.mid++;
        else if (s.rubricScore === 0) evalCounts.low++;
        else if (s.processEval === 'high') evalCounts.high++;
        else if (s.processEval === 'mid') evalCounts.mid++;
        else if (s.processEval === 'low') evalCounts.low++;
        else evalCounts.none++;
    });

    const totalRated = evalCounts.high + evalCounts.mid + evalCounts.low;
    const evalDiv = document.getElementById('eval-distribution');
    if (totalRated === 0) {
        evalDiv.innerHTML = '<div style="color:rgba(255,255,255,0.5);">아직 평가된 학생이 없어요.</div>';
    } else {
        const hPercent = Math.round(evalCounts.high/totalRated*100)||0;
        const mPercent = Math.round(evalCounts.mid/totalRated*100)||0;
        const lPercent = Math.round(evalCounts.low/totalRated*100)||0;
        
        evalDiv.innerHTML = \`
            <div style="margin-bottom:12px; display:flex; justify-content:space-between; max-width: 350px;">
                <span style="color:#4ade80; font-weight:bold;">상: \${evalCounts.high}명 (\${hPercent}%)</span>
                <span style="color:#fbbf24; font-weight:bold;">중: \${evalCounts.mid}명 (\${mPercent}%)</span>
                <span style="color:#94a3b8; font-weight:bold;">하: \${evalCounts.low}명 (\${lPercent}%)</span>
            </div>
            
            <div style="width: 100%; height: 12px; background: rgba(255,255,255,0.1); border-radius: 6px; display: flex; overflow: hidden; margin-bottom: 8px;">
                <div style="width: \${hPercent}%; background: #4ade80;"></div>
                <div style="width: \${mPercent}%; background: #fbbf24;"></div>
                <div style="width: \${lPercent}%; background: #94a3b8;"></div>
            </div>
            
            <div style="margin-bottom:8px; font-size:0.85rem; color:rgba(255,255,255,0.6);">미평가: \${evalCounts.none}명</div>
        \`;
    }
}
`;

html = html.replace('// ===========================\r\n// 테이블 정렬', injectionCode + '\n// ===========================\r\n// 테이블 정렬');
html = html.replace('// ===========================\n// 테이블 정렬', injectionCode + '\n// ===========================\n// 테이블 정렬');

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Injected successfully');
