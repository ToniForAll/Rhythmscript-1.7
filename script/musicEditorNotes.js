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
        
        const uniqueDotId = `rhythm-dot-${columnIndex}-${uniqueIdCounter}`;
        newButton.onclick = function() {
            toggleCircle(this.parentElement, columnIndex, lineCounter, uniqueDotId);
        };
        
        newLine.appendChild(newButton);
        column.appendChild(newLine);
    });
    
    console.log(`Nueva línea ${lineCounter} (ID: ${uniqueIdCounter}) agregada a todas las columnas`);
    setTimeout(scrollToTop, 50);
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

function saveDotsToArrays() {
    column1Data = [];
    column2Data = [];
    column3Data = [];
    column4Data = [];
    
    const columns = document.querySelectorAll('.column-level');
    
    columns.forEach((column, columnIndex) => {
        const lines = column.querySelectorAll('.line');
        
        lines.forEach(line => {
            const lineNumber = parseInt(line.getAttribute('data-line'));
            const hasDot = line.classList.contains('has-rhythm-dot');
            
            const value = hasDot ? 1 : 0;
            
            switch(columnIndex) {
                case 0:
                    column1Data[lineNumber - 1] = value;
                    break;
                case 1:
                    column2Data[lineNumber - 1] = value;
                    break;
                case 2:
                    column3Data[lineNumber - 1] = value;
                    break;
                case 3:
                    column4Data[lineNumber - 1] = value;
                    break;
            }
        });
    });
    
    fillEmptyPositions();
    
    console.log('Datos guardados en arrays:');
    console.log('Columna 1:', column1Data);
    console.log('Columna 2:', column2Data);
    console.log('Columna 3:', column3Data);
    console.log('Columna 4:', column4Data);
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
    column1Data = Array(lineCounter).fill(0);
    column2Data = Array(lineCounter).fill(0);
    column3Data = Array(lineCounter).fill(0);
    column4Data = Array(lineCounter).fill(0);
    
    for (const dotId in activeRhythmDots) {
        const dot = activeRhythmDots[dotId];
        const lineIndex = dot.lineNumber - 1;
        
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
    
    console.log('Datos guardados desde activeRhythmDots:');
    console.log('Columna 1:', column1Data);
    console.log('Columna 2:', column2Data);
    console.log('Columna 3:', column3Data);
    console.log('Columna 4:', column4Data);
}

function getAllColumnsData() {
    saveDotsToArraysFromActive();
    
    return {
        column1: column1Data,
        column2: column2Data,
        column3: column3Data,
        column4: column4Data,
        totalLines: lineCounter,
        totalDots: Object.keys(activeRhythmDots).length
    };
}

function saveToLocalStorage() {
    const data = getAllColumnsData();
    localStorage.setItem('rhythmPattern', JSON.stringify(data));
    console.log('Patrón guardado en localStorage:', data);
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('rhythmPattern');
    if (saved) {
        const data = JSON.parse(saved);
        console.log('Patrón cargado desde localStorage:', data);
        return data;
    }
    return null;
}