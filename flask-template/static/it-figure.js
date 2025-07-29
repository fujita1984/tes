// IT図表示ページのJavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadTerms();
});

let currentFigures = [];
let activeButton = null;

// 用語一覧を読み込み
async function loadTerms() {
    try {
        const response = await fetch('/api/it_figures');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const figures = await response.json();
        currentFigures = figures;
        displayTerms(figures);
        
    } catch (error) {
        console.error('Error loading terms:', error);
        showError('用語の読み込みに失敗しました。');
    }
}

// 用語ボタンを表示
function displayTerms(figures) {
    const termsList = document.getElementById('terms-list');
    termsList.innerHTML = '';
    
    if (figures.length === 0) {
        termsList.innerHTML = '<p class="no-figure-message">利用可能な図がありません</p>';
        return;
    }
    
    figures.forEach((figure, index) => {
        const button = document.createElement('button');
        button.className = 'term-button';
        button.textContent = figure.term;
        button.onclick = () => showFigure(figure, button);
        termsList.appendChild(button);
    });
}

// 図を表示
function showFigure(figure, button) {
    // 前のアクティブボタンを非アクティブにする
    if (activeButton) {
        activeButton.classList.remove('active');
    }
    
    // 現在のボタンをアクティブにする
    button.classList.add('active');
    activeButton = button;
    
    const figureDisplay = document.getElementById('figure-display');
    
    // ローディング表示
    figureDisplay.innerHTML = '<p class="loading">読み込み中...</p>';
    
    // 画像を作成
    const img = new Image();
    img.onload = function() {
        figureDisplay.innerHTML = `
            <div>
                <img src="${this.src}" alt="${figure.term}" class="figure-image">
                <div class="figure-info">
                    <div class="figure-title">${figure.term}</div>
                </div>
            </div>
        `;
    };
    
    img.onerror = function() {
        figureDisplay.innerHTML = `
            <div class="figure-info">
                <p style="color: #dc3545;">画像の読み込みに失敗しました</p>
                <p style="color: #6c757d; font-size: 14px;">ファイル: ${figure.filename}</p>
            </div>
        `;
    };
    
    // 画像のソースを設定して読み込み開始
    img.src = `/static/img/it/${figure.filename}`;
}

// エラー表示
function showError(message) {
    const termsList = document.getElementById('terms-list');
    termsList.innerHTML = `<p style="color: #dc3545;">${message}</p>`;
}

// キーボードショートカット
document.addEventListener('keydown', function(event) {
    if (currentFigures.length === 0) return;
    
    const currentIndex = activeButton ? 
        Array.from(document.querySelectorAll('.term-button')).indexOf(activeButton) : -1;
    
    let newIndex = currentIndex;
    
    switch(event.key) {
        case 'ArrowUp':
            event.preventDefault();
            newIndex = currentIndex > 0 ? currentIndex - 1 : currentFigures.length - 1;
            break;
        case 'ArrowDown':
            event.preventDefault();
            newIndex = currentIndex < currentFigures.length - 1 ? currentIndex + 1 : 0;
            break;
        default:
            return;
    }
    
    const buttons = document.querySelectorAll('.term-button');
    if (buttons[newIndex]) {
        buttons[newIndex].click();
        buttons[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});
