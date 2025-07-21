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
const timeLimit = 0;

const startArea = document.getElementById('start-area');
const gameArea = document.getElementById('game-area');
const timerArea = document.getElementById('timer-area');
const scoreArea = document.getElementById('score-area');

let questionCount = null; 
let customTimeLimit = null; 
let selectedCategory = 'ALL';

const wordLangPairs = [
    { label: 'Japanese：English', left: 'japanese', right: 'english' },
    { label: 'Japanese：Chinese', left: 'japanese', right: 'chinese' },
    { label: 'English：Chinese', left: 'english', right: 'chinese' },
];

window.onload = async () => {
    try {
        const res = await fetchWithRetry('/api/word_categories');
        const categories = await res.json();
        
        createLangButtons(categories);
        gameArea.style.display = 'none';
        timerArea.style.display = 'none';
        scoreArea.style.display = 'none';
        
        console.log('Categories loaded successfully:', categories);
    } catch (error) {
        console.error('Failed to load categories after all retries:', error);
        startArea.innerHTML = `
            <div style="color: red; text-align: center; margin: 2em;">
                <h3>エラー</h3>
                <p>カテゴリの読み込みに失敗しました。</p>
                <p>ネットワーク接続やサーバーの状態を確認してください。</p>
                <button onclick="location.reload()" style="margin-top: 1em; padding: 0.5em 1em;">
                    再読み込み
                </button>
            </div>
        `;
    }
};


async function fetchWithRetry(url, options = {}, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Fetching ${url} (attempt ${attempt}/${maxRetries})`);
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log(`Successfully fetched ${url}`);
            return response;
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            
            if (attempt === maxRetries) {
                throw error; 
            }
            
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 1.5;
        }
    }
}

function createLangButtons(categories) {
    startArea.innerHTML = '';
    startArea.style.display = '';

    const lastCategory = getCookie('category') || 'ALL';
    const lastQCount = getCookie('qcount') || '10';
    const lastTime = getCookie('timelimit') || '';

    const catDiv = document.createElement('div');
    catDiv.className = 'input-row';
    catDiv.style.margin = '0.5em 0';
    catDiv.innerHTML = '<label>Category：</label>';
    const catSelect = document.createElement('select');
    catSelect.id = 'category-select';
    const allOpt = document.createElement('option');
    allOpt.value = 'ALL';
    allOpt.textContent = 'ALL';
    catSelect.appendChild(allOpt);
    (categories || []).forEach(val => {
        if (val && val !== true && val !== false) {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            catSelect.appendChild(opt);
        }
    });
    catSelect.value = lastCategory;
    catSelect.onchange = e => {
        selectedCategory = e.target.value;
        setCookie('category', selectedCategory);
    };
    catDiv.appendChild(catSelect);
    startArea.appendChild(catDiv);

    const qCountDiv = document.createElement('div');
    qCountDiv.className = 'input-row';
    qCountDiv.style.margin = '0.5em 0';
    qCountDiv.innerHTML = '<label>Number of questions：</label>';
    const qCountSelect = document.createElement('select');
    [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        qCountSelect.appendChild(opt);
    });
    qCountSelect.value = lastQCount;
    qCountSelect.id = 'q-count-select';
    qCountSelect.onchange = e => {
        setCookie('qcount', e.target.value);
    };
    qCountDiv.appendChild(qCountSelect);
    startArea.appendChild(qCountDiv);

    const timeDiv = document.createElement('div');
    timeDiv.className = 'input-row';
    timeDiv.style.margin = '0.5em 0';
    timeDiv.innerHTML = '<label>Time limit (seconds)：</label>';
    const timeInput = document.createElement('input');
    timeInput.type = 'number';
    timeInput.min = 1;
    timeInput.style.width = '5em';
    timeInput.id = 'time-limit-input';
    timeInput.value = lastTime;
    timeInput.onchange = e => {
        setCookie('timelimit', e.target.value);
    };
    timeDiv.appendChild(timeInput);
    startArea.appendChild(timeDiv);

    const wordTitle = document.createElement('div');
    wordTitle.style.margin = '1em 0 0.5em 0';
    wordTitle.style.fontWeight = 'bold';
    startArea.appendChild(wordTitle);
    startArea.appendChild(createGameButtons(wordLangPairs));

}

function setCookie(name, value, days = 365) {
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/`;
}
function getCookie(name) {
    const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? decodeURIComponent(v[2]) : null;
}



function createGameButtons(langPairs) {
    const btnArea = document.createElement('div');
    langPairs.forEach(pair => {
        const btn = document.createElement('button');
        btn.textContent = pair.label;
        btn.className = 'lang-btn';
        btn.onclick = () => {
            leftLang = pair.left;
            rightLang = pair.right;
            const qCountVal = document.getElementById('q-count-select').value;
            questionCount = parseInt(qCountVal);
            if (isNaN(questionCount) || questionCount < 1 || questionCount > 100) questionCount = 10;
            const timeVal = document.getElementById('time-limit-input').value;
            customTimeLimit = timeVal ? parseInt(timeVal) : null;
            selectedCategory = document.getElementById('category-select').value;
            startArea.style.display = 'none';
            gameArea.style.display = '';
            document.getElementById('left-col').innerHTML = '';
            document.getElementById('right-col').innerHTML = '';
            document.getElementById('progress-area').textContent = '';
            timerArea.style.display = 'none';
            scoreArea.style.display = 'none';
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

async function startGame() {
    const apiUrl = `/api/words?limit=${encodeURIComponent(questionCount)}&category=${encodeURIComponent(selectedCategory)}`;
    
    try {
        const res = await fetchWithRetry(apiUrl);
        const words = await res.json();
        
        if (!words || words.length === 0) {
            throw new Error('No words received from server');
        }
        
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
        console.log('Game started successfully with', words.length, 'words');
        
    } catch (error) {
        console.error('Error starting game after retries:', error);
        alert('ゲーム開始時にエラーが発生しました。しばらく待ってから再試行してください。');
        
        gameArea.style.display = 'none';
        startArea.style.display = '';
        
        const overlay = document.getElementById('countdown-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

function startTimer() {
    let limit = customTimeLimit ? customTimeLimit : null;
    if (!limit) {
        timerArea.style.display = 'none';
        timerInterval = null;
        return;
    }
    let remaining = limit;
    timerArea.style.display = '';
    timerArea.textContent = `${remaining} sec`;
    timerInterval = setInterval(() => {
        remaining = limit - Math.floor((Date.now() - startTime) / 1000);
        if (remaining <= 0) {
            timerArea.textContent = `0 sec`;
            clearInterval(timerInterval);
            endGame(false);
        } else {
            timerArea.textContent = `${remaining} sec`;
        }
    }, 200);
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



function playAudio(id,lang) {
    if (lang !== 'japanese') {
        const audioPath = `/static/audio/${lang}/${id}.mp3`;
        const audio = new Audio(audioPath);
        audio.play().catch(e => console.error("再生エラー:", e));
    }
}

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
                playAudio(id, langCode);
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

    renderColumn('left-col', leftLang, renderWords.order1, selectLeft);
    renderColumn('right-col', rightLang, renderWords.order2, selectRight);
    const total = allWords.length;
    document.getElementById('progress-area').textContent = `${correctCount} / ${total}`;
}

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



function endGame(success) {
    clearInterval(timerInterval);
    timerArea.style.display = 'none';
    gameArea.style.display = 'none';

    let elapsed = success ? Math.floor((Date.now() - startTime) / 1000) : timeLimit; ;
    let scoreText = `<h3 style="margin-top: 5px;margin-bottom: 5px;">RESULT</h3>`;
    scoreText += `<table id="result-table" style="margin-left:auto; margin-right:auto;">`;
    scoreText += `<tr><th style="text-align:right;">Time：</th><td style="text-align:left;"> ${elapsed}</td></tr>`;
    scoreText += `<tr><th style="text-align:right;">Correct：</th><td style="text-align:left;"> ${correctCount}</td></tr>`;
    scoreText += `<tr><th style="text-align:right;">Wrong：</th><td style="text-align:left;"> ${wrongCount}</td></tr>`;
    scoreText += `<tr><th style="text-align:right;">Max Combo：</th><td style="text-align:left;"> ${maxCombo}</td></tr>`;
    scoreText += `</table>`;
    scoreArea.innerHTML = scoreText;
    scoreArea.style.display = '';

}