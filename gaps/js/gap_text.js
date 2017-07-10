'use strict';

const textToProcess = document.querySelector('.text-input--raw-text');
const processButton = document.querySelector('.text-input--process-button');
const draft = document.querySelector('.worksheet-draft');
const processedText = draft.querySelector('.worksheet-draft--text');
const wordlistBox = draft.querySelector('.wordlist');
const wordlist = wordlistBox.querySelector('.wordlist--list');
const gapModeSelectors = [...draft.querySelectorAll('.gap-controls--selector')];
const clearWordlistButton = wordlistBox.querySelector('.clear-wordlist');
const hideNumbersButton = draft.querySelector('.gap-controls--hide-numbers');
const removeArtButton = draft.querySelector('.gap-controls--remove-articles');

let gaps = [...processedText.querySelectorAll('.gap')];
let wordlistItems = [...wordlist.querySelectorAll('.wordlist--item')];
let gapMode = 'plain';

let editWordlistButton = wordlistBox.querySelector('.edit-wordlist');

function rand(min,max) {
    return Math.floor( Math.random() * ( max - min + 1 ) + min );
}

function updateGaps() {
    gaps = [...processedText.querySelectorAll('.gap')]
}

function updateGapIndeces() {
    updateGaps();
    gaps.forEach( (gap, index) => {
        const gapIndexField = gap.querySelector('.gap-index');
        const gapIndex = index + 1;

        gapIndexField.textContent = gapIndex;
    })
}

function addGapMarker(gap) {
    let gapMarker = '';

    function addFirstLetter() {
        gapMarker = gap.dataset.word[0] + '_______________';
    }

    function addLetterCount() {
        for (let i in gap.dataset.word) {
            if (i == 0) {
                gapMarker += "__";
            } else if (gap.dataset.word[i].match(/\-/)) {
                gapMarker += " -";
            } else {
                gapMarker += ' __';
            }
        }
    }

    function addFirstLetterCount() {
        for (let i in gap.dataset.word) {
            if (i == 0) {
                gapMarker += gap.dataset.word[i];
            } else if (gap.dataset.word[i].match(/\-/)) {
                gapMarker += " -";
            } else {
                gapMarker += ' __';
            }
        }
    }

    switch(gapMode) {
        case 'plain':
            gapMarker = "_______________";
            break;
        case 'plain-first':
            addFirstLetter();
            break
        case 'number':
            addLetterCount();
            break;
        case 'number-first':
            addFirstLetterCount();
            break;
        default:
            break;
    }

    gap.innerHTML = gapMarker;
}

function updateWordlist() {
    wordlistItems = [...wordlist.querySelectorAll('.wordlist--item')]
}

function removeWord(item) {
    const textItem = processedText.querySelector(`[data-id="${item.dataset.id}"]`);
    textItem.textContent = item.dataset.word;
    textItem.classList.remove('gap');
    textItem.classList.add('removable-word');
    wordlist.removeChild(item);
    updateGapIndeces();
    updateWordlist()
    handleControls();
}

function removeWordOnClick(e) {
    const item = e.target;
    if (item.classList.contains('wordlist--item')) {
        removeWord(item);
    }
}

processButton.addEventListener('click', function(e) {
    e.preventDefault();

    draft.classList.remove('hidden');
    textToProcess.classList.add('hidden');
    processButton.classList.add('hidden');

    function breakLines(text) {
        return text.split(/\n/);
    }

    function makeParagraphs(total, current) {
        return total += `<p>${current}</p>`;
    }

    const paras = breakLines(textToProcess.value).reduce(makeParagraphs, '');

    function replacer(match) {
        if (match === 'br' || match === 'p') {
            return match;
        } else {
            return `<span class="removable-word" title="Click to add gap">${match}</span>`;
        }
    }

    processedText.innerHTML = paras.replace(/[\w\-]+/g, replacer);

    const words = [...processedText.querySelectorAll('.removable-word')];

    function handleGap(e) {

        const item = e.target;
        if (item.classList.contains('gap')) {
            removeGap(item);
        } else if (item.classList.contains('removable-word')){
            addGap(item);
        }

        function addGap(word) {
            const listItem = document.createElement('li');

            listItem.classList.add('wordlist--item');
            listItem.title = 'Click to remove from list';
            listItem.textContent = listItem.dataset.word = word.dataset.word = word.textContent;
            listItem.dataset.id = word.dataset.id = rand(1, 100000);

            wordlist.appendChild(listItem);

            word.classList.remove('removable-word')
            word.classList.add('gap');
            word.title = 'Click to remove gap';
            addGapMarker(word);

            const gapIndex = document.createElement('sup');
            word.appendChild(gapIndex);
            gapIndex.classList.add('gap-index');

        }

        function removeGap(item) {
            const wordlistItem = wordlist.querySelector(`[data-id="${item.dataset.id}"]`);
            item.textContent = item.dataset.word;
            item.classList.remove('gap');
            item.classList.add('removable-word');
            wordlist.removeChild(wordlistItem);
        }

        updateGapIndeces();
        updateWordlist();
        handleControls();
    }

    function addGapEvent(word) {
        word.addEventListener('click', handleGap);
    }

    function activate(e) {
        const item = e.target;
        if (item.classList.contains('wordlist--item')) {
            item.classList.add('wordlist--item__active');
        }
    }

    processedText.addEventListener('click', handleGap);
    wordlist.addEventListener('click', removeWordOnClick);
    wordlist.addEventListener('mousedown', activate);
    removeArtButton.addEventListener('click', toggleArticles);
});

function changeGapMode(selector) {
    selector.addEventListener('change', () => {
        gapMode = selector.value;
    });
}

gapModeSelectors.forEach(changeGapMode);

clearWordlistButton.addEventListener('click', (e) => {
    wordlistItems.forEach(removeWord);
});

function updateBtns() {
    editWordlistButton = wordlistBox.querySelector('.edit-wordlist');
    saveWordlistButton = wordlistBox.querySelector('.save-wordlist');
}

function editWordlist() {
    const btn = editWordlistButton;
    if (btn.classList.contains('edit-wordlist')) {
        btn.classList.remove('edit-wordlist');
        btn.classList.add('save-wordlist');
        btn.innerHTML = '<i class="fa fa-floppy-o" aria-hidden="true"></i>';
        btn.title = 'Save wordlist';
        function openEdits(item) {
            item.innerHTML = `<input class="wordlist--edit" value="${item.textContent}" type="text">`;
            item.classList.add('wordlist--item__under-edit');
            item.title = '';
        }
        wordlistItems.forEach(openEdits);
    } else {
        btn.classList.remove('save-wordlist');
        btn.classList.add('edit-wordlist')
        btn.innerHTML = '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>';
        btn.title = 'Edit wordlist';
        function saveEdits(item) {
            const newWord = item.querySelector('input').value;
            item.innerHTML = `${newWord}`;
            item.classList.remove('wordlist--item__under-edit');
            item.title = 'Click to remove from list'
        }
        wordlistItems.forEach(saveEdits);
    }
}

function onEditBtns() {
    editWordlistButton.addEventListener('click', editWordlist);
    editWordlistButton.classList.remove('wordlist--btn__inactive');
    clearWordlistButton.classList.remove('wordlist--btn__inactive');
    editWordlistButton.classList.add('wordlist--btn__active');
    clearWordlistButton.classList.add('wordlist--btn__active');
    clearWordlistButton.title = "Clear all";
    editWordlistButton.title = "Edit wordlist";
}

function offEditBtns() {
    editWordlistButton.removeEventListener('click', editWordlist);
    editWordlistButton.innerHTML = '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>';
    editWordlistButton.classList.add('wordlist--btn__inactive');
    clearWordlistButton.classList.add('wordlist--btn__inactive');
    editWordlistButton.classList.remove('wordlist--btn__active');
    clearWordlistButton.classList.remove('wordlist--btn__active');
    clearWordlistButton.title = "";
    editWordlistButton.title = "";
}

function hideGapNumbers(e) {
    e.preventDefault();
    const numbers = [...document.querySelectorAll('sup')];
    numbers.forEach(number => number.classList.toggle('hidden'));
    if (hideNumbersButton.dataset.state == 0) {
        hideNumbersButton.dataset.state = 1;
        hideNumbersButton.textContent = 'Show gap numbers';
    } else {
        hideNumbersButton.dataset.state = 0;
        hideNumbersButton.textContent = 'Hide gap numbers';
    }
}

function onHideGapNumbersBtn() {
    hideNumbersButton.removeEventListener('click', blockButton);
    hideNumbersButton.addEventListener('click', hideGapNumbers);
    hideNumbersButton.classList.remove('gap-controls--btn__inactive');
    hideNumbersButton.classList.add('gap-controls--btn__active');
}

function offHideGapNumbersBtn() {
    hideNumbersButton.removeEventListener('click', hideGapNumbers);
    hideNumbersButton.addEventListener('click', blockButton);
    hideNumbersButton.dataset.state = 0;
    hideNumbersButton.textContent = 'Hide gap numbers';
    hideNumbersButton.classList.remove('gap-controls--btn__active');
    hideNumbersButton.classList.add('gap-controls--btn__inactive');
}

hideNumbersButton.addEventListener('click', blockButton)

function handleControls() {
    if (gaps.length === 0) {
        offEditBtns()
        offHideGapNumbersBtn();

    } else if (gaps.length === 1) {
        onEditBtns();
        onHideGapNumbersBtn();
    }
}

function blockButton(e) {
    e.preventDefault();
}

function toggleArticles(e) {
    e.preventDefault();

    function restoreArticle(gap) {
        const article = gap.dataset.article;
        gap.outerHTML = `<span class="removable-word" title="Click to add gap">${article}</span>`
    }

    if (e.target.dataset.state == 0) {
        function isArticle(item) {
            const regexArt = /\ba\b|\ban\b|\bthe\b|\bA\b|\bAN\b|\bTHE\b|\bAn\b|\bThe\b/g;
            const article = item.textContent.match(regexArt);
            if (article !== null) {
                return true;
            } else {
                return false;
            }
        }

        const words = [...processedText.querySelectorAll('.removable-word')];

        function artRem(word) {
            if (isArticle(word)) {
                word.outerHTML = `<span class="gap-article" title="" data-article="${word.textContent}">___</span>`;
            }
        }

        words.forEach(artRem);
        e.target.dataset.state = 1;
    } else {
        const articleGaps = [...processedText.querySelectorAll('.gap-article')];
        articleGaps.forEach(restoreArticle);
        e.target.dataset.state = 0;
    }
}
