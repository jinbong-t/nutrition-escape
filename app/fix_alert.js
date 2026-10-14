const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

const alertJS = `
        let isStuck = false;
        if (!s.completed && s.currentRoom) {
            const rStat = s.roomStats && s.roomStats[s.currentRoom];
            if (rStat && rStat.entryTime && !rStat.clearTime) {
                if (Date.now() - rStat.entryTime > 5 * 60 * 1000) {
                    isStuck = true;
                }
            }
        }
        const nameDisplay = s.name + (isStuck ? ' <span title="5분 이상 같은 방에 머물고 있습니다!" style="animation: pulse 1.5s infinite;">🚨</span>' : '');
`;

if (!html.includes('isStuck = false;')) {
    html = html.replace('const progress = getProgress(s);', alertJS + '\n        const progress = getProgress(s);');
    html = html.replace('<td><div class="student-name">${s.name}</div>', '<td><div class="student-name">${nameDisplay}</div>');
}

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Added 🚨 alert logic.');
