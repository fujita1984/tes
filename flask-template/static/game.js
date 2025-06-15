let allWords = [];
let remainWords = [];
let shownWords = [];
let selectedLeft = null;
let selectedRight = null;
let leftLang = '';
let rightLang = '';
    
let correctCount = 0;
let wrongCount = 0;
let comboCount = 0;
let maxCombo = 0;
let startTime = null;
let timerInterval = null;
const timeLimit = 20; // 秒

const startArea = document.getElementById('start-area');
const gameArea = document.getElementById('game-area');
const timerArea = document.getElementById('timer-area');
const scoreArea = document.getElementById('score-area');

// ゲーム種別
let gameType = ''; // 'word' or 'phrase'

// 単語・フレーズの言語ペア
const wordLangPairs = [
    { label: '日本語：英語', left: 'japanese', right: 'english' },
    { label: '日本語：中国語', left: 'japanese', right: 'chinese' },
    { label: '英語：中国語', left: 'english', right: 'chinese' },
];
const phraseLangPairs = [
    { label: '日本語：英語', left: 'japanese', right: 'english' },
    { label: '日本語：中国語', left: 'japanese', right: 'chinese' },
    { label: '英語：中国語', left: 'english', right: 'chinese' },
];

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function shuffleIndex(n) {
    let arr = Array.from({ length: n }, (_, i) => i);
    shuffle(arr);
    return arr;
}

function showNextWords() {

    if (shownWords.length === 0 && remainWords.length > 0) {
        let addCount = Math.min(5, remainWords.length);
        let newWords = [];
        for (let i = 0; i < addCount; i++) {
            newWords.push(remainWords.shift());
        }
        shuffle(newWords);
        shownWords = newWords;
        renderWords.engOrder = null;
        renderWords.jpnOrder = null;
    }
    renderWords();
}

function playAudio(id, gameType, lang) {
    if (lang !== 'japanese') {
        // Use absolute path assuming Flask serves static files from /static/audio/
        const audioPath = `/static/audio/${gameType}/${lang}/${id}.mp3`;
        const audio = new Audio(audioPath);
        audio.play().catch(e => console.error("再生エラー:", e));
    }
}
// 汎用的に列をレンダリング
function renderColumn(containerId, langCode, orderArr, selectFunc) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        const div = document.createElement('div');
        div.className = 'word card-fixed';
        div.style.minHeight = '2.5em';
        div.style.marginBottom = '0.5em';

        const idx = orderArr[i];
        if (shownWords[idx]) {
            const val = shownWords[idx][langCode];
            const id = shownWords[idx].id;
            div.textContent = val || '(なし)';
            div.style.visibility = 'visible';
            div.onclick = () => {
                playAudio(id,gameType, langCode);
                selectFunc(id, div);
            };
        } else {
            div.textContent = '';
            div.onclick = null;
            div.style.visibility = 'hidden';
        }

        container.appendChild(div);
    }
}

function renderWords() {
    if (!renderWords.order1 || renderWords.order1.length !== shownWords.length) {
        renderWords.order1 = shuffleIndex(shownWords.length);
        renderWords.order2 = shuffleIndex(shownWords.length);
    }

    // 左列、右列に好きな言語とID・選択関数を渡す
    renderColumn('left-col', leftLang, renderWords.order1, selectLeft);
    renderColumn('right-col', rightLang, renderWords.order2, selectRight);
    const total = allWords.length;
    document.getElementById('progress-area').textContent = `${correctCount} / ${total}`;
}

// 選択時処理も汎用化（必要なら書き換えてください）
function selectLeft(id, elem) {
    document.querySelectorAll('#left-col .word').forEach(e => e.classList.remove('selected'));
    elem.classList.add('selected');
    selectedLeft = id;
    checkMatch();
}
function selectRight(id, elem) {
    document.querySelectorAll('#right-col .word').forEach(e => e.classList.remove('selected'));
    elem.classList.add('selected');
    selectedRight = id;
    checkMatch();
}


function checkMatch() {
    if (selectedLeft && selectedRight) {
        if (selectedLeft === selectedRight) {
            for (let i = 0; i < shownWords.length; i++) {
                if (shownWords[i] && shownWords[i].id === selectedLeft) {
                    shownWords[i] = null;
                }
            }
            correctCount++;
            comboCount++;
            maxCombo = Math.max(maxCombo, comboCount);
            selectedLeft = null;
            selectedRight = null;
            renderWords();

            if (shownWords.every(w => w === null) && remainWords.length > 0) {
                shownWords = [];
                renderWords.order1 = null;
                renderWords.order2 = null;
                showNextWords();
            }

            if (shownWords.every(w => w === null) && remainWords.length === 0) {
                endGame(true);
            }
        } else {
            wrongCount++;
            comboCount = 0;
            document.querySelectorAll('#left-col .word.selected').forEach(e => e.classList.add('wrong'));
            document.querySelectorAll('#right-col .word.selected').forEach(e => e.classList.add('wrong'));
            setTimeout(() => {
                document.querySelectorAll('.word.selected').forEach(e => e.classList.remove('selected'));
                document.querySelectorAll('.word.wrong').forEach(e => e.classList.remove('wrong'));
                selectedLeft = null;
                selectedRight = null;
            }, 500);
        }
    }
}

function createGameButtons(langPairs, type) {
    const btnArea = document.createElement('div');
    langPairs.forEach(pair => {
        const btn = document.createElement('button');
        btn.textContent = pair.label;
        btn.className = 'lang-btn';
        btn.onclick = () => {
            leftLang = pair.left;
            rightLang = pair.right;
            gameType = type;
            startArea.style.display = 'none';
            gameArea.style.display = '';
            document.getElementById('left-col').innerHTML = '';
            document.getElementById('right-col').innerHTML = '';
            document.getElementById('progress-area').textContent = '';
            timerArea.style.display = 'none';
            scoreArea.style.display = 'none';
            // カウントダウンオーバーレイ生成
            let overlay = document.createElement('div');
            overlay.id = 'countdown-overlay';
            overlay.innerHTML = '<span id="countdown-number"></span>';
            gameArea.appendChild(overlay);
            let count = 3;
            document.getElementById('countdown-number').textContent = count;
            const countdown = setInterval(() => {
                count--;
                if (count > 0) {
                    document.getElementById('countdown-number').textContent = count;
                } else {
                    clearInterval(countdown);
                    overlay.remove();
                    timerArea.style.display = '';
                    startGame();
                }
            }, 1000);
        };
        btnArea.appendChild(btn);
    });
    return btnArea;
}

function createLangButtons() {
    startArea.innerHTML = '';
    startArea.style.display = '';
    // 単語ボタン
    const wordTitle = document.createElement('div');
    wordTitle.textContent = '単語';
    wordTitle.style.margin = '1em 0 0.5em 0';
    wordTitle.style.fontWeight = 'bold';
    startArea.appendChild(wordTitle);
    startArea.appendChild(createGameButtons(wordLangPairs, 'words'));
    // フレーズボタン
    const phraseTitle = document.createElement('div');
    phraseTitle.textContent = 'フレーズ';
    phraseTitle.style.margin = '1em 0 0.5em 0';
    phraseTitle.style.fontWeight = 'bold';
    startArea.appendChild(phraseTitle);
    startArea.appendChild(createGameButtons(phraseLangPairs, 'phrases'));
}

function startGame() {
    let apiUrl = gameType === 'words' ? '/api/words' : '/api/phrases';
    fetch(apiUrl).then(res => res.json()).then(words => {
        allWords = words;
        remainWords = [...allWords];
        shownWords = [];
        correctCount = 0;
        wrongCount = 0;
        comboCount = 0;
        maxCombo = 0;
        startTime = Date.now();
        renderWords.order1 = null;
        renderWords.order2 = null;
        gameArea.style.display = '';
        scoreArea.style.display = 'none';
        startTimer();
        showNextWords();
    });
}

function startTimer() {
    let remaining = timeLimit;
    timerArea.style.display = '';
    timerArea.textContent = `残り時間：${remaining} 秒`;
    timerInterval = setInterval(() => {
        remaining = timeLimit - Math.floor((Date.now() - startTime) / 1000);
        if (remaining <= 0) {
            timerArea.textContent = `残り時間：0 秒`;
            clearInterval(timerInterval);
            endGame(false);
        } else {
            timerArea.textContent = `残り時間：${remaining} 秒`;
        }
    }, 200);
}

function endGame(success) {
    clearInterval(timerInterval);
    timerArea.style.display = 'none';
    gameArea.style.display = 'none';

    let elapsed = Math.floor((Date.now() - startTime) / 1000);
    let scoreText = `<h3>結果</h3>`;
    if (success) {
        scoreText += `<p>🎉 クリアタイム：${elapsed} 秒</p>`;
    } else {
        scoreText += `<p>⌛ タイムオーバー</p>`;
    }
    scoreText += `<p>✅ 正解数：${correctCount}</p>`;
    scoreText += `<p>❌ 誤答数：${wrongCount}</p>`;
    scoreText += `<p>🔥 最大コンボ：${maxCombo}</p>`;
    scoreArea.innerHTML = scoreText;
    scoreArea.style.display = '';

}


window.onload = () => {
    createLangButtons();
    gameArea.style.display = 'none';
    timerArea.style.display = 'none';
    scoreArea.style.display = 'none';
};
