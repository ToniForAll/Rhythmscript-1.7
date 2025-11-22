const activeRhythmDots = {};
let lineCounter = 7;
let uniqueIdCounter = 10;

function toggleCircle(lineElement, columnIndex, lineNumber, uniqueId = null) {
    const button = lineElement.querySelector('.line-button');
    const dotId = uniqueId || `rhythm-dot-${columnIndex}-${lineNumber}`;
    
    if (activeRhythmDots[dotId]) {
        removeRhythmDot(dotId, button, lineElement);
        return;
    }
    createRhythmDot(lineElement, columnIndex, lineNumber, button, dotId);
}

function createRhythmDot(lineElement, columnIndex, lineNumber, button, dotId) {
    const rhythmDot = document.createElement('div');
    rhythmDot.className = 'rhythm-dot pulse';
    rhythmDot.id = dotId;
    
    lineElement.appendChild(rhythmDot);
    lineElement.classList.add('has-rhythm-dot');
    
    activeRhythmDots[dotId] = {
        element: rhythmDot,
        columnIndex: columnIndex,
        lineNumber: lineNumber,
        lineElement: lineElement,
        uniqueId: dotId
    };
    
    updateButtonState(button, columnIndex, true);
}

function removeRhythmDot(dotId, button, lineElement) {
    if (activeRhythmDots[dotId]) {
        activeRhythmDots[dotId].element.remove();

        if (lineElement) {
            lineElement.classList.remove('has-rhythm-dot');
        }
        
        const columnIndex = activeRhythmDots[dotId].columnIndex;
        delete activeRhythmDots[dotId];
        
        updateButtonState(button, columnIndex, false);
    }
}

function updateButtonState(button, columnIndex, isActive) {
    if (isActive) {
        button.textContent = '-';
        button.classList.add('active');

        if (columnIndex === 1 || columnIndex === 2) {
            button.classList.add('minus');
        }
    } else {
        button.textContent = '+';
        button.classList.remove('active', 'minus');
    }
}

function addNewLineToAllColumns() {
    lineCounter++;
    uniqueIdCounter++;

    const columns = document.querySelectorAll('.column-level');
    
    columns.forEach((column, columnIndex) => {
        const newLine = document.createElement('div');
        newLine.className = 'line';
        newLine.setAttribute('data-line', lineCounter);
        newLine.setAttribute('data-unique-id', uniqueIdCounter);

        const newButton = document.createElement('button');
        newButton.className = 'line-button';
        newButton.textContent = '+';
        
        const uniqueDotId = `rhythm-dot-${columnIndex}-${lineCounter}-${uniqueIdCounter}`;
        
        newButton.onclick = function() {
            const currentLineNumber = parseInt(this.parentElement.getAttribute('data-line'));
            const currentColumnIndex = columnIndex;
            toggleCircle(this.parentElement, currentColumnIndex, currentLineNumber, uniqueDotId);
        };
        
        newLine.appendChild(newButton);
        column.appendChild(newLine);
    });

    setTimeout(scrollToTop, 50);
}

function addMultipleLines(numberOfLines) {
    for (let i = 0; i < numberOfLines; i++) {
        addNewLineToAllColumns();
    }
}

function scrollToTop() {
    const container = document.querySelector('.notesEditor-container');
    if (container) {
        container.scrollTop = 0;
    }
}

// guardar notas del nivel

let column1Data = [];
let column2Data = [];
let column3Data = [];
let column4Data = [];

function saveDotsToArraysFromActive() {
    let maxLineNumber = 0;
    for (const dotId in activeRhythmDots) {
        const dot = activeRhythmDots[dotId];
        if (dot.lineNumber > maxLineNumber) {
            maxLineNumber = dot.lineNumber;
        }
    }

    const totalLines = Math.max(lineCounter, maxLineNumber);

    column1Data = Array(totalLines).fill(0);
    column2Data = Array(totalLines).fill(0);
    column3Data = Array(totalLines).fill(0);
    column4Data = Array(totalLines).fill(0);

    for (const dotId in activeRhythmDots) {
        const dot = activeRhythmDots[dotId];
        const lineIndex = dot.lineNumber - 1; 
        
        if (lineIndex < totalLines) {
            switch(dot.columnIndex) {
                case 0:
                    column1Data[lineIndex] = 1;
                    break;
                case 1:
                    column2Data[lineIndex] = 1;
                    break;
                case 2:
                    column3Data[lineIndex] = 1;
                    break;
                case 3:
                    column4Data[lineIndex] = 1;
                    break;
            }
        } else {
            console.warn(`Índice ${lineIndex} fuera de rango para totalLines ${totalLines}`);
        }
    }

    return totalLines;
}

function fillEmptyPositions() {
    const maxLength = Math.max(
        column1Data.length,
        column2Data.length,
        column3Data.length,
        column4Data.length
    );
    
    for (let i = 0; i < maxLength; i++) {
        if (column1Data[i] === undefined) column1Data[i] = 0;
        if (column2Data[i] === undefined) column2Data[i] = 0;
        if (column3Data[i] === undefined) column3Data[i] = 0;
        if (column4Data[i] === undefined) column4Data[i] = 0;
    }
}

function saveDotsToArraysFromActive() {
    let maxLineNumber = 0;
    for (const dotId in activeRhythmDots) {
        const dot = activeRhythmDots[dotId];
        if (dot.lineNumber > maxLineNumber) {
            maxLineNumber = dot.lineNumber;
        }
    }
    
    const totalLines = Math.max(lineCounter, maxLineNumber);
    
    column1Data = Array(totalLines).fill(0);
    column2Data = Array(totalLines).fill(0);
    column3Data = Array(totalLines).fill(0);
    column4Data = Array(totalLines).fill(0);
    
    for (const dotId in activeRhythmDots) {
        const dot = activeRhythmDots[dotId];
        const lineIndex = dot.lineNumber - 1;
        
        if (lineIndex < totalLines) {
            switch(dot.columnIndex) {
                case 0:
                    column1Data[lineIndex] = 1;
                    break;
                case 1:
                    column2Data[lineIndex] = 1;
                    break;
                case 2:
                    column3Data[lineIndex] = 1;
                    break;
                case 3:
                    column4Data[lineIndex] = 1;
                    break;
            }
        }
    }
}

function getAllColumnsData() {
    const totalLines = saveDotsToArraysFromActive(); 
    
    return {
        column1: column1Data,
        column2: column2Data,
        column3: column3Data,
        column4: column4Data,
        totalLines: totalLines,
        totalDots: Object.keys(activeRhythmDots).length
    };
}