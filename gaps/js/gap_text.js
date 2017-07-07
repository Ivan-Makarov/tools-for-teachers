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
        console.log(gap.dataset.word.length);
        let gapMarker = ''
        for (let i of gap.dataset.word) {
            gapMarker += '__ '
        }
        const gapIndex = index + 1;
        gap.innerHTML = gapMarker + `<sup class="gap-index">${gapIndex}</sup>`;
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

            listItem.classList.add('wordlist-item');
            listItem.title = 'Click to remove from list';
            listItem.textContent = listItem.dataset.word = word.dataset.word = word.textContent;
            listItem.dataset.id = word.dataset.id = rand(1, 100000);

            wordlist.appendChild(listItem);

            word.classList.remove('removable-word')
            word.classList.add('gap');
            word.title = 'Click to remove gap';
        }

        function removeGap(item) {
            const wordlistItem = wordlist.querySelector(`[data-id="${item.dataset.id}"]`);
            item.textContent = item.dataset.word;
            item.classList.remove('gap');
            item.classList.add('removable-word');
            wordlist.removeChild(wordlistItem);
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

    processedText.addEventListener('click', handleGap);
    wordlist.addEventListener('click', removeWord);
    wordlist.addEventListener('mousedown', activate);
});
