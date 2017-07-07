'use strict';

const textToProcess = document.querySelector('.raw-text');
const processButton = document.querySelector('.process-button');
const draft = document.querySelector('.worksheet-draft');
const processedText = draft.querySelector('.processed-text');
const wordlistBox = draft.querySelector('.wordlist-box');
const wordlist = wordlistBox.querySelector('.wordlist');
let gaps = [...processedText.querySelectorAll('.gap')];
let wordlistItems = [...wordlist.querySelectorAll('.wordlist-item')];


function rand(min,max) {
    return Math.floor( Math.random() * ( max - min + 1 ) + min );
}

function updateGaps() {
    gaps = [...processedText.querySelectorAll('.gap')]
}

function updateGapContent() {
    updateGaps();
    gaps.forEach( (gap, index) => {
        const gapIndex = index + 1;
        gap.innerHTML = `_______________` + `<sup class="gap-index">${gapIndex}</sup>`;
    })
}

function updateWordlist() {
    wordlistItems = [...wordlist.querySelectorAll('.wordlist-item')]
}

processButton.addEventListener('click', function(e) {
    e.preventDefault();

    draft.classList.remove('hidden');

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
            return `<span class="removable-word">${match}</span>`;
        }
    }

    processedText.innerHTML = paras.replace(/[\w\-]+/g, replacer);

    const words = [...processedText.querySelectorAll('.removable-word')];

    function handleGap(e) {

        const item = e.target;
        if (item.classList.contains('gap')) {
            removeGap(item);
        } else {
            addGap(item);
        }

        function addGap(word) {
            const currentWord = word.cloneNode(true);
            const wordText = word.textContent;
            const id = rand(1, 10000);

            wordlist.appendChild(currentWord);
            currentWord.outerHTML = `<li class="wordlist-item">${wordText}</li>`;
            wordlist.lastElementChild.title = 'Click to remove from list';
            wordlist.lastElementChild.dataset.id = word.dataset.id = id;
            wordlist.lastElementChild.dataset.word = word.dataset.word = word.textContent;
            word.classList.remove('removable-word')
            word.classList.add('gap');
            word.textContent = '_______________';
            word.title = 'Click to remove gap';
        }

        function removeGap(item) {
            const wordlistItem = wordlist.querySelector(`[data-id="${item.dataset.id}"]`);
            wordlist.removeChild(wordlistItem);
            item.textContent = item.dataset.word;
            item.classList.remove('gap');
            item.classList.add('removable-word')
        }

        updateGapContent();
        updateWordlist()
    }

    function addGapEvent(word) {
        word.addEventListener('click', handleGap);
    }

    function removeWord(e) {
        const item = e.target;
        if (item.classList.contains('wordlist-item')) {
            const textItem = processedText.querySelector(`[data-id="${item.dataset.id}"]`);
            textItem.textContent = item.dataset.word;
            textItem.classList.remove('gap');
            textItem.classList.add('removable-word');
            wordlist.removeChild(item);
            updateGapContent();
        }
    }

    function activate(e) {
        const item = e.target;
        if (item.classList.contains('wordlist-item')) {
            item.classList.add('wordlist-item__active');
        }
    }

    words.forEach(addGapEvent);
    words.forEach(word => {
        word.title = 'Click to add gap';
    })

    wordlist.addEventListener('click', removeWord);
    wordlist.addEventListener('mousedown', activate);
});
