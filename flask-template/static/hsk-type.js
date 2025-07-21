// HSK タイピングゲーム JavaScript

class HSKTypingGame {
    constructor() {
        this.words = [];
        this.currentWordIndex = 0;
        this.currentWord = null;
        this.typedPinyin = '';
        this.correctCount = 0;
        this.wrongWords = [];
        this.startTime = null;
        this.timerInterval = null;
        this.gameActive = false;
        
        this.initializeElements();
        this.setupEventListeners();
    }
    
    initializeElements() {
        // ゲーム設定要素
        this.hskLevelSelect = document.getElementById('hsk-level');
        this.wordCountSelect = document.getElementById('word-count');
        this.startGameBtn = document.getElementById('start-game');
        
        // ゲームエリア要素
        this.gameArea = document.getElementById('game-area');
        this.progressBar = document.getElementById('progress');
        this.currentWordSpan = document.getElementById('current-word');
        this.totalWordsSpan = document.getElementById('total-words');
        this.correctCountSpan = document.getElementById('correct-count');
        this.timerSpan = document.getElementById('timer');
        
        // 単語表示要素
        this.chineseWordDiv = document.getElementById('chinese-word');
        this.japaneseMeaningDiv = document.getElementById('japanese-meaning');
        this.completedPinyinSpan = document.getElementById('completed-pinyin');
        this.currentCharSpan = document.getElementById('current-char');
        this.remainingPinyinSpan = document.getElementById('remaining-pinyin');
        
        // 入力要素
        this.pinyinInput = document.getElementById('pinyin-input');
        this.skipWordBtn = document.getElementById('skip-word');
        this.endGameBtn = document.getElementById('end-game');
        
        // 結果エリア要素
        this.resultArea = document.getElementById('result-area');
        this.resultTotal = document.getElementById('result-total');
        this.resultCorrect = document.getElementById('result-correct');
        this.resultAccuracy = document.getElementById('result-accuracy');
        this.resultTime = document.getElementById('result-time');
        this.wrongWordsDiv = document.getElementById('wrong-words');
        this.playAgainBtn = document.getElementById('play-again');
    }
    
    setupEventListeners() {
        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.pinyinInput.addEventListener('input', (e) => this.handleInput(e));
        this.pinyinInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.skipWordBtn.addEventListener('click', () => this.skipCurrentWord());
        this.endGameBtn.addEventListener('click', () => this.endGame());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
    }
    
    async startGame() {
        const level = parseInt(this.hskLevelSelect.value);
        const count = this.wordCountSelect.value;
        
        try {
            // 「全て」が選択された場合はlimitパラメータを省略
            const url = count === 'all' 
                ? `/api/hsk_words?level=${level}`
                : `/api/hsk_words?level=${level}&limit=${parseInt(count)}`;
                
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.error) {
                alert('エラー: ' + data.error);
                return;
            }
            
            this.words = data;
            this.currentWordIndex = 0;
            this.correctCount = 0;
            this.wrongWords = [];
            this.gameActive = true;
            
            // UI更新
            document.querySelector('.game-settings').style.display = 'none';
            this.gameArea.style.display = 'block';
            this.resultArea.style.display = 'none';
            
            this.totalWordsSpan.textContent = this.words.length;
            this.pinyinInput.disabled = false;
            this.pinyinInput.focus();
            
            // タイマー開始
            this.startTime = Date.now();
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
            
            this.showCurrentWord();
        } catch (error) {
            alert('データの取得に失敗しました: ' + error.message);
        }
    }
    
    showCurrentWord() {
        if (this.currentWordIndex >= this.words.length) {
            this.endGame();
            return;
        }
        
        this.currentWord = this.words[this.currentWordIndex];
        this.typedPinyin = '';
        
        // 単語情報を表示
        this.chineseWordDiv.textContent = this.currentWord.chinese;
        this.japaneseMeaningDiv.textContent = this.currentWord.japanese_meaning;
        
        // ピンイン表示を更新
        this.updatePinyinDisplay();
        
        // 進行状況を更新
        this.currentWordSpan.textContent = this.currentWordIndex + 1;
        this.correctCountSpan.textContent = this.correctCount;
        
        // プログレスバーを更新
        const progress = (this.currentWordIndex / this.words.length) * 100;
        this.progressBar.style.width = progress + '%';
        
        // 入力フィールドをクリア
        this.pinyinInput.value = '';
        this.pinyinInput.className = '';
    }
    
    updatePinyinDisplay() {
        const targetPinyin = this.currentWord.pinyin.toLowerCase();
        const completed = targetPinyin.substring(0, this.typedPinyin.length);
        const current = this.typedPinyin.length < targetPinyin.length ? 
                       targetPinyin.charAt(this.typedPinyin.length) : '';
        const remaining = targetPinyin.substring(this.typedPinyin.length + 1);
        
        this.completedPinyinSpan.textContent = completed;
        this.currentCharSpan.textContent = current;
        this.remainingPinyinSpan.textContent = remaining;
    }
    
    handleInput(e) {
        if (!this.gameActive) return;
        
        const input = e.target.value.toLowerCase().trim();
        const targetPinyin = this.currentWord.pinyin.toLowerCase();
        
        this.typedPinyin = input;
        
        // ピンイン表示を更新
        this.updatePinyinDisplay();
        
        // 入力チェック
        if (input === targetPinyin) {
            // 正解
            this.pinyinInput.className = 'correct';
            this.correctCount++;
            this.nextWord();
        } else if (targetPinyin.startsWith(input)) {
            // 途中まで正解
            this.pinyinInput.className = '';
        } else {
            // 間違い
            this.pinyinInput.className = 'incorrect';
        }
    }
    
    handleKeydown(e) {
        if (!this.gameActive) return;
        
        if (e.key === 'Enter') {
            const input = e.target.value.toLowerCase().trim();
            const targetPinyin = this.currentWord.pinyin.toLowerCase();
            
            if (input === targetPinyin) {
                // 正解の場合は既にhandleInputで処理済み
                return;
            } else {
                // 不正解の場合
                this.wrongWords.push({
                    chinese: this.currentWord.chinese,
                    pinyin: this.currentWord.pinyin,
                    japanese_meaning: this.currentWord.japanese_meaning,
                    userInput: input
                });
                this.nextWord();
            }
        }
    }
    
    nextWord() {
        this.currentWordIndex++;
        this.showCurrentWord();
    }
    
    skipCurrentWord() {
        if (!this.gameActive) return;
        
        this.wrongWords.push({
            chinese: this.currentWord.chinese,
            pinyin: this.currentWord.pinyin,
            japanese_meaning: this.currentWord.japanese_meaning,
            userInput: 'スキップ'
        });
        
        this.nextWord();
    }
    
    endGame() {
        this.gameActive = false;
        
        // タイマー停止
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // 結果を表示
        this.showResults();
    }
    
    showResults() {
        this.gameArea.style.display = 'none';
        this.resultArea.style.display = 'block';
        
        const totalWords = this.words.length;
        const accuracy = totalWords > 0 ? Math.round((this.correctCount / totalWords) * 100) : 0;
        const totalTime = this.startTime ? Date.now() - this.startTime : 0;
        
        this.resultTotal.textContent = totalWords;
        this.resultCorrect.textContent = this.correctCount;
        this.resultAccuracy.textContent = accuracy + '%';
        this.resultTime.textContent = this.formatTime(totalTime);
        
        // 間違えた単語を表示
        if (this.wrongWords.length > 0) {
            const wrongWordsHTML = `
                <h3>間違えた単語 (${this.wrongWords.length}個)</h3>
                ${this.wrongWords.map(word => `
                    <div class="wrong-word-item">
                        <div class="wrong-word-chinese">${word.chinese}</div>
                        <div class="wrong-word-pinyin">正解: ${word.pinyin} | 入力: ${word.userInput}</div>
                        <div class="wrong-word-meaning">${word.japanese_meaning}</div>
                    </div>
                `).join('')}
            `;
            this.wrongWordsDiv.innerHTML = wrongWordsHTML;
        } else {
            this.wrongWordsDiv.innerHTML = '<h3 style="color: #28a745;">すべて正解でした！🎉</h3>';
        }
    }
    
    resetGame() {
        // ゲーム状態をリセット
        this.words = [];
        this.currentWordIndex = 0;
        this.currentWord = null;
        this.typedPinyin = '';
        this.correctCount = 0;
        this.wrongWords = [];
        this.startTime = null;
        this.gameActive = false;
        
        // タイマーを停止
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // UIをリセット
        this.resultArea.style.display = 'none';
        document.querySelector('.game-settings').style.display = 'flex';
        this.pinyinInput.disabled = true;
        this.pinyinInput.value = '';
        this.pinyinInput.className = '';
        
        // プログレスバーをリセット
        this.progressBar.style.width = '0%';
    }
    
    updateTimer() {
        if (this.startTime) {
            const elapsed = Date.now() - this.startTime;
            this.timerSpan.textContent = this.formatTime(elapsed);
        }
    }
    
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// ページ読み込み完了後にゲームを初期化
document.addEventListener('DOMContentLoaded', () => {
    new HSKTypingGame();
});
