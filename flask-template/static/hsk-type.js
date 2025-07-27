// HSK タイピングゲーム JavaScript

class HSKTypingGame {
    constructor() {
        this.words = [];
        this.currentWordIndex = 0;
        this.currentWord = null;
        this.typedPinyin = '';
        this.correctCount = 0;
        this.skippedWords = []; // wrongWords から skippedWords に変更
        this.startTime = null;
        this.timerInterval = null;
        this.gameActive = false;
        
        // タイピング音用のAudioContext
        this.audioContext = null;
        this.soundEnabled = true;
        this.chineseAudioEnabled = true;
        this.pinyinDisplayMode = true;
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeAudio();
    }
    
    initializeAudio() {
        // Web Audio API を初期化
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API はサポートされていません');
            this.soundEnabled = false;
        }
    }
    
    playTypingSound(isCorrect = true) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            // メカニカルキーボードのようなクリック音を作成
            this.createMechanicalClickSound(isCorrect);
            
        } catch (e) {
            console.log('音声再生エラー:', e);
        }
    }
    
    createMechanicalClickSound(isCorrect = true) {
        // より複雑なメカニカルキーボード音を作成
        this.createLayeredClickSound(isCorrect);
    }
    
    createLayeredClickSound(isCorrect = true) {
        const currentTime = this.audioContext.currentTime;
        
        // レイヤー1: 高域のクリック音（プラスチック音）
        this.createClickLayer1(currentTime, isCorrect);
        
        // レイヤー2: 中域の機械的音（スプリング音）
        this.createClickLayer2(currentTime, isCorrect);
        
        // レイヤー3: 低域のクリック音（本体の響き）
        this.createClickLayer3(currentTime, isCorrect);
    }
    
    createClickLayer1(startTime, isCorrect) {
        // 高域ノイズクリック（プラスチックのカチカチ音）
        const bufferSize = 2048;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * 0.5;
        }
        
        // 短いアタックのエンベロープ
        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            const envelope = Math.exp(-15 * t);
            output[i] *= envelope;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(isCorrect ? 4000 : 3000, startTime);
        filter.Q.setValueAtTime(1.5, startTime);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.15, startTime);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        
        source.start(startTime);
        source.stop(startTime + 0.03);
    }
    
    createClickLayer2(startTime, isCorrect) {
        // 中域のメタリック音（スプリング音）
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(isCorrect ? 1200 : 800, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(isCorrect ? 600 : 400, startTime + 0.02);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, startTime);
        filter.Q.setValueAtTime(3, startTime);
        
        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.04);
    }
    
    createClickLayer3(startTime, isCorrect) {
        // 低域の響き（キーボード本体の振動）
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(isCorrect ? 150 : 120, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(isCorrect ? 100 : 80, startTime + 0.06);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.05, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.06);
        
        oscillator.connect(gain);
        gain.connect(this.audioContext.destination);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.06);
    }
    
    playSuccessSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            // メカニカルキーボードの成功音（3回のクリック音）
            const clickTimes = [0, 0.08, 0.16];
            const frequencies = [3000, 3500, 4000]; // 高めの周波数
            
            clickTimes.forEach((time, index) => {
                setTimeout(() => {
                    this.createMechanicalSuccessClick(frequencies[index]);
                }, time * 1000);
            });
            
        } catch (e) {
            console.log('成功音再生エラー:', e);
        }
    }
    
    playChineseAudio() {
        if (!this.currentWord || !this.chineseAudioEnabled) return;
        
        try {
            const audioPath = `/static/hsk/${this.currentWord.id}.mp3`;
            const audio = new Audio(audioPath);
            
            // 音量を調整
            audio.volume = 0.8;
            
            // 問題表示後少し遅延してから再生（読みやすくするため）
            setTimeout(() => {
                audio.play().catch(e => {
                    console.log(`中国語音声再生エラー (ID: ${this.currentWord.id}):`, e);
                });
            }, 500); // 500ms後に再生
            
        } catch (e) {
            console.log('中国語音声再生エラー:', e);
        }
    }
    
    createMechanicalSuccessClick(frequency = 3000) {
        // 短いホワイトノイズクリック音
        const bufferSize = 2048;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        // ホワイトノイズを生成
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * 0.3;
        }
        
        // 短いクリック音のエンベロープ
        for (let i = 0; i < bufferSize; i++) {
            const progress = i / bufferSize;
            let envelope;
            
            if (progress < 0.1) {
                envelope = progress / 0.1;
            } else {
                envelope = Math.exp(-5 * (progress - 0.1));
            }
            
            output[i] *= envelope;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        // 高域フィルター
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        filter.Q.setValueAtTime(2, this.audioContext.currentTime);
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start(this.audioContext.currentTime);
        source.stop(this.audioContext.currentTime + 0.05);
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
        
        // 音声切り替えボタン
        this.soundToggleBtn = document.getElementById('sound-toggle');
        
        // ピンイン表示ボタン
        this.pinyinDisplayBtn = document.getElementById('expert-mode');
    }
    
    setupEventListeners() {
        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.pinyinInput.addEventListener('input', (e) => this.handleInput(e));
        this.pinyinInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.skipWordBtn.addEventListener('click', () => this.skipCurrentWord());
        this.endGameBtn.addEventListener('click', () => this.endGame());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
        this.soundToggleBtn.addEventListener('click', () => this.toggleSound());
        this.pinyinDisplayBtn.addEventListener('click', () => this.togglePinyinDisplay());
        
        // 中国語音声トグルボタンのイベントリスナー
        const chineseAudioToggle = document.getElementById('chinese-audio-toggle');
        if (chineseAudioToggle) {
            chineseAudioToggle.addEventListener('click', () => this.toggleChineseAudio());
        }
        
        // スペースキーでゲーム開始
        document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
    }
    
    handleGlobalKeydown(e) {
        // ゲーム設定画面でスペースキーが押された場合
        if (e.code === 'Space' && !this.gameActive && 
            document.querySelector('.game-settings').style.display !== 'none') {
            e.preventDefault(); // デフォルトのスペースキー動作を防ぐ
            this.startGame();
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggleBtn.textContent = this.soundEnabled ? 'ON' : 'OFF';
        this.soundToggleBtn.className = this.soundEnabled ? 'btn-secondary' : 'btn-danger';
        
        // AudioContextが停止している場合は再開
        if (this.soundEnabled && this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    togglePinyinDisplay() {
        this.pinyinDisplayMode = !this.pinyinDisplayMode;
        this.pinyinDisplayBtn.textContent = this.pinyinDisplayMode ? 'ON' : 'OFF';
        this.pinyinDisplayBtn.className = this.pinyinDisplayMode ? 'btn-secondary' : 'btn-danger';
        
        // スキップボタンの表示/非表示を切り替え（ピンイン非表示時のみスキップボタン表示）
        if (this.gameActive) {
            this.skipWordBtn.style.display = !this.pinyinDisplayMode ? 'inline-block' : 'none';
        }
    }
    
    toggleChineseAudio() {
        this.chineseAudioEnabled = !this.chineseAudioEnabled;
        const chineseAudioToggle = document.getElementById('chinese-audio-toggle');
        if (chineseAudioToggle) {
            chineseAudioToggle.textContent = this.chineseAudioEnabled ? 'ON' : 'OFF';
            chineseAudioToggle.className = this.chineseAudioEnabled ? 'btn-secondary' : 'btn-danger';
        }
    }
    
    // 配列をランダムにシャッフルする関数（Fisher-Yatesアルゴリズム）
    shuffleArray(array) {
        const shuffled = [...array]; // 配列のコピーを作成
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
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
            
            // 単語をランダムにシャッフル
            this.words = this.shuffleArray(data);
            this.currentWordIndex = 0;
            this.correctCount = 0;
            this.skippedWords = []; // wrongWords から skippedWords に変更
            this.gameActive = true;
            
            // UI更新
            document.querySelector('.game-settings').style.display = 'none';
            document.querySelector('.spacebar-instruction').style.display = 'none';
            this.startGameBtn.style.display = 'none';
            this.gameArea.style.display = 'block';
            this.resultArea.style.display = 'none';
            
            this.totalWordsSpan.textContent = this.words.length;
            this.pinyinInput.disabled = false;
            this.pinyinInput.focus();
            
            // スキップボタンの表示をピンイン表示モードで制御
            this.skipWordBtn.style.display = !this.pinyinDisplayMode ? 'inline-block' : 'none';
            
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
        
        // 新しい単語が表示された時に中国語音声を再生
        this.playChineseAudio();
        
        // 次の単語の音声ファイルをプリロード（スムーズな再生のため）
        this.preloadNextAudio();
    }
    
    preloadNextAudio() {
        if (this.currentWordIndex + 1 < this.words.length) {
            const nextWord = this.words[this.currentWordIndex + 1];
            try {
                const audioPath = `/static/hsk/${nextWord.id}.mp3`;
                const audio = new Audio();
                audio.preload = 'metadata';
                audio.src = audioPath;
            } catch (e) {
                console.log('次の音声プリロードエラー:', e);
            }
        }
    }
    
    updatePinyinDisplay() {
        const targetPinyin = this.currentWord.pinyin.toLowerCase();
        const input = this.pinyinInput.value.toLowerCase().trim();
        
        // ピンイン非表示モードの場合はピンインを表示しない
        if (!this.pinyinDisplayMode) {
            this.completedPinyinSpan.textContent = '';
            this.currentCharSpan.textContent = '';
            this.remainingPinyinSpan.textContent = '';
            return;
        }
        
        // 正しく入力された文字数を計算
        let correctLength = 0;
        for (let i = 0; i < Math.min(input.length, targetPinyin.length); i++) {
            if (input[i] === targetPinyin[i]) {
                correctLength++;
            } else {
                break; // 間違った文字が見つかったら停止
            }
        }
        
        const completed = targetPinyin.substring(0, correctLength);
        const current = correctLength < targetPinyin.length ? 
                       targetPinyin.charAt(correctLength) : '';
        const remaining = targetPinyin.substring(correctLength + 1);
        
        this.completedPinyinSpan.textContent = completed;
        this.currentCharSpan.textContent = current;
        this.remainingPinyinSpan.textContent = remaining;
    }
    
    handleInput(e) {
        if (!this.gameActive) return;
        
        const input = e.target.value.toLowerCase().trim();
        const targetPinyin = this.currentWord.pinyin.toLowerCase();
        const previousLength = this.typedPinyin.length;
        
        this.typedPinyin = input;
        
        // 文字が追加された場合にのみ音を再生
        if (input.length > previousLength) {
            // 正しく入力された部分の長さを確認
            let correctLength = 0;
            for (let i = 0; i < Math.min(input.length, targetPinyin.length); i++) {
                if (input[i] === targetPinyin[i]) {
                    correctLength++;
                } else {
                    break;
                }
            }
            
            // 新しく入力された文字が正しいかどうかを判定
            const isCorrect = correctLength >= previousLength + 1;
            this.playTypingSound(isCorrect);
        }
        
        // ピンイン表示を更新
        this.updatePinyinDisplay();
        
        // 入力チェック
        if (input === targetPinyin) {
            // 正解
            this.pinyinInput.className = 'correct';
            this.correctCount++;
            this.playSuccessSound(); // 正解時の特別な音
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
                // ピンイン非表示モード（旧上級者モード）の場合のみスキップとして記録
                if (!this.pinyinDisplayMode) {
                    this.skippedWords.push({
                        chinese: this.currentWord.chinese,
                        pinyin: this.currentWord.pinyin,
                        japanese_meaning: this.currentWord.japanese_meaning,
                        userInput: input || '未入力'
                    });
                }
                this.nextWord();
            }
        }
    }
    
    nextWord() {
        this.currentWordIndex++;
        this.showCurrentWord();
    }
    
    skipCurrentWord() {
        if (!this.gameActive || this.pinyinDisplayMode) return; // ピンイン非表示モード時のみスキップ可能
        
        this.skippedWords.push({
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
        
        const skippedCount = this.skippedWords.length;
        // 実際にプレイした単語数 = 正解数 + スキップ数
        const actualPlayedWords = this.correctCount + skippedCount;
        const accuracy = actualPlayedWords > 0 ? Math.round((this.correctCount / actualPlayedWords) * 100) : 0;
        const totalTime = this.startTime ? Date.now() - this.startTime : 0;
        
        // 結果の値を設定
        this.resultCorrect.textContent = this.correctCount;
        document.getElementById('result-skipped').textContent = skippedCount;
        this.resultAccuracy.textContent = accuracy + '%';
        this.resultTime.textContent = this.formatTime(totalTime);
        this.resultTotal.textContent = actualPlayedWords;
        
        // 結果表示をピンイン表示モードと非表示モードで分ける
        if (!this.pinyinDisplayMode) {
            // ピンイン非表示モード（旧上級者モード）: 全項目表示
            document.querySelector('.stat-item:nth-child(1)').style.display = 'block'; // 正解数
            document.querySelector('.stat-item:nth-child(2)').style.display = 'block'; // スキップ数
            document.querySelector('.stat-item:nth-child(3)').style.display = 'block'; // 正解率
            document.querySelector('.stat-item:nth-child(4)').style.display = 'block'; // 総時間
            document.querySelector('.stat-item:nth-child(5)').style.display = 'block'; // 総単語数
        } else {
            // ピンイン表示モード（旧通常モード）: 総時間、総単語数のみ表示
            document.querySelector('.stat-item:nth-child(1)').style.display = 'none'; // 正解数
            document.querySelector('.stat-item:nth-child(2)').style.display = 'none'; // スキップ数
            document.querySelector('.stat-item:nth-child(3)').style.display = 'none'; // 正解率
            document.querySelector('.stat-item:nth-child(4)').style.display = 'block'; // 総時間
            document.querySelector('.stat-item:nth-child(5)').style.display = 'block'; // 総単語数
        }
        
        // スキップした単語を表示（ピンイン非表示モードのみ）
        if (!this.pinyinDisplayMode && this.skippedWords.length > 0) {
            const skippedWordsHTML = `
                <h3>スキップした単語 (${this.skippedWords.length}個)</h3>
                ${this.skippedWords.map(word => `
                    <div class="wrong-word-item">
                        <div class="wrong-word-chinese">${word.chinese}</div>
                        <div class="wrong-word-pinyin">正解: ${word.pinyin}${word.userInput !== 'スキップ' ? ` | 入力: ${word.userInput}` : ''}</div>
                        <div class="wrong-word-meaning">${word.japanese_meaning}</div>
                    </div>
                `).join('')}
            `;
            this.wrongWordsDiv.innerHTML = skippedWordsHTML;
        } else {
            this.wrongWordsDiv.innerHTML = '';
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
        document.querySelector('.spacebar-instruction').style.display = 'block';
        this.startGameBtn.style.display = 'block';
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
