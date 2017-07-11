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
const printBtn = draft.querySelector('.gap-controls--open-print');

let gaps = [...processedText.querySelectorAll('.gap')];
let wordlistItems = [...wordlist.querySelectorAll('.wordlist--item')];
let gapMode = 'plain';

let editWordlistButton = wordlistBox.querySelector('.edit-wordlist');

const regexWord = /[\w\-]+/g;
const regexNewLine = /\n/;
const regexArt = /\ba\b|\ban\b|\bthe\b/i;
const regexNewSentence = /[\.+\?!]/;

processButton.addEventListener('click', processRawText);
gapModeSelectors.forEach(changeGapMode);
clearWordlistButton.addEventListener('click', clearWordlist);
hideNumbersButton.addEventListener('click', blockButton);
printBtn.addEventListener('click', openPrint);

function rand(min,max) {
    return Math.floor( Math.random() * ( max - min + 1 ) + min );
}

function updateGaps() {
    gaps = [...processedText.querySelectorAll('.gap')]
}

function swapClassnames(item, from, to) {
    item.classList.remove(from);
    item.classList.add(to);
}

function swapEventListeners(item, e, from, to) {
    item.removeEventListener(e, from);
    item.addEventListener(e, to);
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

    function addLetterGap(i) {
        if (gap.dataset.word[i].match(/\-/)) {
            gapMarker += " -";
        } else {
            gapMarker += ' __';
        }
    }

    function addLetterCount() {
        for (let i in gap.dataset.word) {
            if (i == 0) {
                gapMarker += "__";
            } else {
                addLetterGap(i);
            }
        }
    }

    function addFirstLetterCount() {
        for (let i in gap.dataset.word) {
            if (i == 0) {
                gapMarker += gap.dataset.word[i];
            } else {
                addLetterGap(i);
            }
        }
    }

    switch(gapMode) {
        case 'plain':
            gapMarker = '_______________';
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
        case 'article': {
            gapMarker = '____'
        }
        default:
            break;
    }

    gap.textContent = gapMarker;
}

function updateWordlist() {
    wordlistItems = [...wordlist.querySelectorAll('.wordlist--item')]
}

function removeWord(item) {
    const textItem = processedText.querySelector(`[data-id="${item.dataset.id}"]`);
    textItem.textContent = item.dataset.word;
    swapClassnames(textItem, 'gap', 'removable-word')
    wordlist.removeChild(item);
    updateGapIndeces();
    updateWordlist()
    updateControls();
}

function removeWordOnClick(e) {
    const item = e.target;
    if (item.classList.contains('wordlist--item')) {
        removeWord(item);
    }
}

function showItem(item) {
    item.classList.remove('hidden');
}

function hideItem(item) {
    item.classList.add('hidden');
}

function itemToTag(item, tag, title, classnames = []) {
    return `<${tag} class="${classnames.join(' ')}" title="${title}">${item}</${tag}>`;
}

function wrapItems(text, regex, tag, title, classnames = []) {
    function toTag(match) {
        return itemToTag(match, tag, title, classnames);
    }
    return text.replace(regex, toTag);
}

function wrapChunks(text, separator, tag, classnames = []) {
    function breakText(text) {
        return text.split(separator);
    }

    function toTag(tags, current) {
        return tags += `<${tag} class="${classnames.join(' ')}">${current}</${tag}>`;
    }

    return breakText(text).reduce(toTag, '');
}

function processRawText(e) {
    e.preventDefault();

    hideItem(textToProcess);
    hideItem(processButton);
    showItem(draft);

    const textWrapInSpan = wrapItems(textToProcess.value, regexWord, 'span', 'Click to remove word', ['removable-word']);
    const textWrapInP = wrapChunks(textWrapInSpan, regexNewLine, 'p')
    processedText.innerHTML = textWrapInP;

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

            swapClassnames(word, 'removable-word', 'gap');
            word.title = 'Click to remove gap';
            addGapMarker(word);

            const gapIndex = document.createElement('sup');
            word.appendChild(gapIndex);
            gapIndex.classList.add('gap-index');

        }

        function removeGap(item) {
            const wordlistItem = wordlist.querySelector(`[data-id="${item.dataset.id}"]`);
            item.textContent = item.dataset.word;

            swapClassnames(item, 'gap', 'removable-word');
            wordlist.removeChild(wordlistItem);
        }

        updateGapIndeces();
        updateWordlist();
        updateControls();
    }

    function animate(e) {
        const item = e.target;
        if (item.classList.contains('wordlist--item')) {
            item.classList.add('wordlist--item__active');
        }
    }

    processedText.addEventListener('click', handleGap);
    wordlist.addEventListener('click', removeWordOnClick);
    wordlist.addEventListener('mousedown', animate);
    removeArtButton.addEventListener('click', toggleArticles);
}

function changeGapMode(selector) {
    selector.addEventListener('change', () => {
        gapMode = selector.value;
    });
}

function clearWordlist() {
    wordlistItems.forEach(removeWord);
}

function updateBtns() {
    editWordlistButton = wordlistBox.querySelector('.edit-wordlist');
    saveWordlistButton = wordlistBox.querySelector('.save-wordlist');
}

function editWordlist() {
    const btn = editWordlistButton;
    if (btn.classList.contains('edit-wordlist')) {
        swapClassnames(btn, 'edit-wordlist', 'save-wordlist');
        btn.innerHTML = '<i class="fa fa-floppy-o" aria-hidden="true"></i>';
        btn.title = 'Save wordlist';
        function openEdits(item) {
            item.innerHTML = `<input class="wordlist--edit" value="${item.textContent}" type="text">`;
            item.classList.add('wordlist--item__under-edit');
            item.title = '';
        }
        wordlistItems.forEach(openEdits);
    } else {
        swapClassnames(btn, 'save-wordlist', 'edit-wordlist');
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
    swapClassnames(editWordlistButton, 'wordlist--btn__inactive', 'wordlist--btn__active');
    swapClassnames(clearWordlistButton, 'wordlist--btn__inactive', 'wordlist--btn__active');
    clearWordlistButton.title = "Clear all";
    editWordlistButton.title = "Edit wordlist";
}

function offEditBtns() {
    editWordlistButton.removeEventListener('click', editWordlist);
    editWordlistButton.innerHTML = '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>';
    swapClassnames(editWordlistButton, 'wordlist--btn__active', 'wordlist--btn__inactive');
    swapClassnames(clearWordlistButton, 'wordlist--btn__active', 'wordlist--btn__inactive');
    clearWordlistButton.title = "";
    editWordlistButton.title = "";
}

function hideGapNumbers(e) {
    e.preventDefault();
    const numbers = [...document.querySelectorAll('sup')];
    numbers.forEach(number => number.classList.toggle('hidden'));
    if (hideNumbersButton.dataset.state === 'shown') {
        hideNumbersButton.dataset.state = 'hidden';
        hideNumbersButton.textContent = 'Show gap numbers';
    } else {
        hideNumbersButton.dataset.state = 'hidden';
        hideNumbersButton.textContent = 'Hide gap numbers';
    }
}

function onHideGapNumbersBtn() {
    swapEventListeners(hideNumbersButton, 'click', blockButton, hideGapNumbers);
    swapClassnames(hideNumbersButton, 'gap-controls--btn__inactive', 'gap-controls--btn__active');
}

function offHideGapNumbersBtn() {
    swapEventListeners(hideNumbersButton, 'click', hideGapNumbers, blockButton);
    hideNumbersButton.dataset.state = 'shown';
    hideNumbersButton.textContent = 'Hide gap numbers';
    swapClassnames(hideNumbersButton, 'gap-controls--btn__active', 'gap-controls--btn__inactive');
}

function updateControls() {
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

    function isArticle(word) {
        return word.match(regexArt) ? true : false;
    }

    function removeArticle(word) {
        if (isArticle(word.textContent)) {
            let saveGapMode = gapMode;
            gapMode = 'article';
            word.dataset.word = word.textContent;
            addGapMarker(word);
            swapClassnames(word, 'removable-word', 'gap-article')
            gapMode = saveGapMode;
        }
    }

    function restoreArticle(gap) {
        gap.outerHTML = itemToTag(gap.dataset.word, 'span', 'Click to add gap', ['removable-word'])
    }

    if (e.target.dataset.state === 'shown') {
        const words = [...processedText.querySelectorAll('.removable-word')];
        words.forEach(removeArticle);
        e.target.dataset.state = 'hidden';
    } else {
        const articleGaps = [...processedText.querySelectorAll('.gap-article')];
        articleGaps.forEach(restoreArticle);
        e.target.dataset.state = 'shown';
    }
}

function openPrint(e) {
    e.preventDefault();
    window.print();
}
