const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function extractText(pptxPath) {
    const tmpDir = path.join(__dirname, 'docx_temp', path.basename(pptxPath, '.pptx'));
    const zipPath = pptxPath + '.zip';
    
    try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch(e){}
    fs.mkdirSync(tmpDir, { recursive: true });
    
    fs.copyFileSync(pptxPath, zipPath);
    
    try {
        execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${tmpDir}' -Force"`);
    } catch (e) {
        console.error("Failed to unzip " + zipPath);
        fs.unlinkSync(zipPath);
        return "";
    }
    fs.unlinkSync(zipPath);
    
    const slidesDir = path.join(tmpDir, 'ppt', 'slides');
    if (!fs.existsSync(slidesDir)) return 'No slides found.';
    
    const files = fs.readdirSync(slidesDir).filter(f => f.endsWith('.xml'));
    let allText = '';
    
    for (const file of files) {
        const content = fs.readFileSync(path.join(slidesDir, file), 'utf-8');
        const matches = [...content.matchAll(/<a:t>(.*?)<\/a:t>/g)];
        const text = matches.map(m => m[1]).join(' ');
        if(text) {
             allText += `\n--- ${file} ---\n${text}\n`;
        }
    }
    return allText;
}

const pptxFiles = fs.readdirSync('참고자료').filter(f => f.endsWith('.pptx'));
for (const f of pptxFiles) {
    console.log(`\n================ ${f} ================`);
    console.log(extractText(path.join('참고자료', f)));
}
