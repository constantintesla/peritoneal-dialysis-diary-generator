// Схемы диализа
const dialysisSchemes = {
    papd4: { times: ['08.00', '13.00', '18.00', '23.00'], type: 'ПАПД', count: 4 },
    papd5: { times: ['08.00', '12.00', '16.00', '20.00', '24.00'], type: 'ПАПД', count: 5 },
    apd2: { times: ['22.00', '22.00'], type: 'АПД', count: 2 },
    apd3_1: { times: ['22.00', '22.00', '22.00'], type: 'АПД', count: 3 },
    apd3_2: { times: ['22.00', '22.00', '07.00'], type: 'АПД', count: 3 },
    apd4: { times: ['22.00', '22.00', '22.00', '07.00'], type: 'АПД', count: 4 }
};

let generatedDiaries = [];

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Установить сегодняшнюю дату по умолчанию
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;

    // Обработчики событий
    document.getElementById('solutionType').addEventListener('change', handleSolutionTypeChange);
    document.getElementById('dialysisScheme').addEventListener('change', handleDialysisSchemeChange);
    document.getElementById('volumeInjected').addEventListener('change', handleVolumeInjectedChange);
    document.getElementById('nurseTitle').addEventListener('change', handleNurseTitleChange);
    document.getElementById('showWeight').addEventListener('change', handleWeightToggle);
    document.getElementById('generateBtn').addEventListener('click', generateDiaries);
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);

    handleNurseTitleChange();
});

function handleSolutionTypeChange() {
    const solutionType = document.getElementById('solutionType').value;
    const customGroup = document.getElementById('customSolutionGroup');
    if (solutionType === 'custom') {
        customGroup.style.display = 'block';
    } else {
        customGroup.style.display = 'none';
    }
}

function handleDialysisSchemeChange() {
    const scheme = document.getElementById('dialysisScheme').value;
    const customGroup = document.getElementById('customSchemeGroup');
    if (scheme === 'custom') {
        customGroup.style.display = 'block';
    } else {
        customGroup.style.display = 'none';
    }
}

function handleVolumeInjectedChange() {
    const volume = document.getElementById('volumeInjected').value;
    const customGroup = document.getElementById('customVolumeGroup');
    if (volume === 'custom') {
        customGroup.style.display = 'block';
    } else {
        customGroup.style.display = 'none';
    }
}

function handleNurseTitleChange() {
    const nurseTitle = document.getElementById('nurseTitle').value;
    const customGroup = document.getElementById('customNurseTitleGroup');
    if (nurseTitle === 'custom') {
        customGroup.style.display = 'block';
    } else {
        customGroup.style.display = 'none';
    }
}

function handleWeightToggle() {
    const showWeight = document.getElementById('showWeight').checked;
    const weightGroup = document.getElementById('weightRangeGroup');
    weightGroup.style.display = showWeight ? 'block' : 'none';
}

// Генерация случайного числа в диапазоне
function randomInRange(min, max, step = 1) {
    const range = Math.floor((max - min) / step) + 1;
    return min + Math.floor(Math.random() * range) * step;
}

// Генерация случайной температуры
function generateTemperature() {
    return (36.5 + Math.random() * 0.2).toFixed(1);
}

// Генерация АД
function generateBloodPressure(systolicMin, systolicMax, diastolicMin, diastolicMax) {
    const systolic = randomInRange(systolicMin, systolicMax);
    const diastolic = randomInRange(diastolicMin, diastolicMax);
    return `${systolic}/${diastolic}`;
}

// Генерация объема слитого раствора
function generateDrainedVolume(volumeInjected, drainedMin, drainedMax) {
    return randomInRange(drainedMin, drainedMax, 50);
}

// Генерация веса
function generateWeight(weightMin, weightMax) {
    return (weightMin + Math.random() * (weightMax - weightMin)).toFixed(1);
}

// Форматирование даты
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// Генерация дневников
function generateDiaries() {
    const startDate = new Date(document.getElementById('startDate').value);
    const daysCount = parseInt(document.getElementById('daysCount').value);
    const schemeKey = document.getElementById('dialysisScheme').value;
    const customScheme = document.getElementById('customScheme').value;
    const solutionType = document.getElementById('solutionType').value;
    const customSolution = document.getElementById('customSolution').value;
    const volumeInjectedValue = document.getElementById('volumeInjected').value;
    const customVolume = document.getElementById('customVolume').value;
    
    // Определяем объем введенного раствора
    let volumeInjected;
    if (volumeInjectedValue === 'custom') {
        if (!customVolume || customVolume <= 0) {
            alert('Введите объем введенного раствора');
            return;
        }
        volumeInjected = parseInt(customVolume);
    } else {
        volumeInjected = parseInt(volumeInjectedValue);
    }
    const drainedMin = parseInt(document.getElementById('drainedMin').value);
    const drainedMax = parseInt(document.getElementById('drainedMax').value);
    const systolicMin = parseInt(document.getElementById('systolicMin').value);
    const systolicMax = parseInt(document.getElementById('systolicMax').value);
    const diastolicMin = parseInt(document.getElementById('diastolicMin').value);
    const diastolicMax = parseInt(document.getElementById('diastolicMax').value);
    const showWeight = document.getElementById('showWeight').checked;
    const weightMin = parseFloat(document.getElementById('weightMin').value) || 60;
    const weightMax = parseFloat(document.getElementById('weightMax').value) || 90;
    const nurseTitleValue = document.getElementById('nurseTitle').value;
    const customNurseTitle = document.getElementById('customNurseTitle').value.trim();
    let nurseTitle;
    if (nurseTitleValue === 'custom') {
        if (!customNurseTitle) {
            alert('Введите должность медперсонала');
            return;
        }
        nurseTitle = customNurseTitle;
    } else {
        nurseTitle = nurseTitleValue || 'Медицинская сестра';
    }

    const nurseName = document.getElementById('nurseName').value || '________________';
    const doctorName = document.getElementById('doctorName').value || '________________';

    // Определяем схему диализа
    let scheme;
    if (schemeKey === 'custom') {
        if (!customScheme || !customScheme.trim()) {
            alert('Введите время процедур');
            return;
        }
        // Парсим кастомную схему
        const times = customScheme.split(',').map(t => t.trim()).filter(t => t);
        if (times.length === 0) {
            alert('Введите хотя бы одно время процедуры');
            return;
        }
        // Определяем тип схемы (ПАПД или АПД) на основе времени
        const isAPD = times.some(t => t.startsWith('22') || t.startsWith('23') || t.startsWith('24'));
        scheme = {
            times: times,
            type: isAPD ? 'АПД' : 'ПАПД',
            count: times.length
        };
    } else {
        if (!schemeKey) {
            alert('Выберите схему диализа');
            return;
        }
        scheme = dialysisSchemes[schemeKey];
    }
    
    // Определяем тип раствора
    const solution = solutionType === 'custom' ? customSolution : solutionType;

    if (solutionType === 'custom' && !customSolution) {
        alert('Введите название раствора');
        return;
    }

    generatedDiaries = [];

    // Генерация данных для каждого дня
    for (let day = 0; day < daysCount; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + day);

        const diaryData = {
            date: currentDate,
            scheme: scheme,
            solution: solution,
            volumeInjected: volumeInjected,
            procedures: []
        };

        let totalDifference = 0;

        // Создаем карту значений температуры и АД для каждого уникального времени
        const timeValuesMap = {};
        const uniqueTimes = [...new Set(scheme.times)];
        uniqueTimes.forEach(time => {
            timeValuesMap[time] = {
                temperature: generateTemperature(),
                bloodPressure: generateBloodPressure(systolicMin, systolicMax, diastolicMin, diastolicMax)
            };
        });

        // Генерация данных для каждой процедуры
        scheme.times.forEach((time, index) => {
            const drainedVolume = generateDrainedVolume(volumeInjected, drainedMin, drainedMax);
            const difference = drainedVolume - volumeInjected;
            totalDifference += difference;

            // Используем одинаковые значения температуры и АД для одинакового времени
            const timeValues = timeValuesMap[time];

            const procedure = {
                time: time,
                solution: solution,
                volumeInjected: volumeInjected,
                drainedVolume: drainedVolume,
                difference: difference,
                temperature: timeValues.temperature,
                bloodPressure: timeValues.bloodPressure,
                weight: showWeight ? generateWeight(weightMin, weightMax) : null,
                notes: 'без особенностей'
            };

            diaryData.procedures.push(procedure);
        });

        diaryData.totalDifference = totalDifference;
        diaryData.nurseName = nurseName;
        diaryData.nurseTitle = nurseTitle;
        diaryData.doctorName = doctorName;
        generatedDiaries.push(diaryData);
    }

    renderPreview();
    document.getElementById('exportPdfBtn').style.display = 'block';
}

function renderPreview() {
    const previewContainer = document.getElementById('previewContainer');
    if (!previewContainer) {
        return;
    }

    if (generatedDiaries.length === 0) {
        previewContainer.innerHTML = '<p class="placeholder">Настройте параметры и нажмите "Сгенерировать дневники"</p>';
        document.getElementById('exportPdfBtn').style.display = 'none';
        return;
    }

    previewContainer.innerHTML = '';
    const pages = Math.ceil(generatedDiaries.length / 5);
    for (let page = 0; page < pages; page++) {
        const offset = page * 5;
        const pageDiaries = generatedDiaries.slice(offset, offset + 5);
        const pageElement = createDiaryPage(pageDiaries, page === pages - 1, offset);
        previewContainer.appendChild(pageElement);
    }
}

// Создание страницы с дневниками
function createDiaryPage(diaries, isLastPage, pageOffset = 0) {
    const pageDiv = document.createElement('div');
    pageDiv.className = 'diary-page';

    const title = document.createElement('div');
    title.className = 'diary-page-title';
    title.textContent = 'Дневник перитонеального диализа';
    pageDiv.appendChild(title);

    diaries.forEach((diary, index) => {
        const diaryElement = createDiaryItem(diary, pageOffset + index);
        pageDiv.appendChild(diaryElement);
    });

    // Подписи в конце страницы
    if (isLastPage || diaries.length === 5) {
        const signatures = document.createElement('div');
        signatures.className = 'page-signatures';

        const doctorSignature = document.createElement('div');
        doctorSignature.className = 'page-signature';
        doctorSignature.textContent = `Врач ${diaries[0].doctorName || '________________'} ________________`;
        signatures.appendChild(doctorSignature);

        const nurseSignature = document.createElement('div');
        nurseSignature.className = 'page-signature';
        const nurseTitleText = diaries[0].nurseTitle || 'Медицинская сестра';
        nurseSignature.textContent = `${nurseTitleText} ${diaries[0].nurseName || '________________'} ________________`;
        signatures.appendChild(nurseSignature);

        pageDiv.appendChild(signatures);
    }

    return pageDiv;
}

// Создание одного дневника
function createDiaryItem(diary, diaryIndex) {
    const diaryDiv = document.createElement('div');
    diaryDiv.className = 'diary-item';

    const dateDiv = document.createElement('div');
    dateDiv.className = 'diary-date';
    dateDiv.textContent = formatDate(diary.date);
    diaryDiv.appendChild(dateDiv);

    const table = document.createElement('table');
    table.className = 'diary-table';

    // Заголовки таблицы
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Время', 'Вид раствора', 'Объем введенного, мл', 'Объем слитого, мл', 
                     'Разница, мл', 'Температура', 'АД'];
    
    if (diary.procedures[0].weight !== null) {
        headers.push('Вес, кг');
    }
    headers.push('Особенности');

    headers.forEach(headerText => {
        const th = document.createElement('th');
        // Используем createTextNode для правильной кодировки
        const headerTextNode = document.createTextNode(headerText);
        th.appendChild(headerTextNode);
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = document.createElement('tbody');
    diary.procedures.forEach((proc, procIndex) => {
        const row = document.createElement('tr');
        row.dataset.diaryIndex = diaryIndex;
        row.dataset.procIndex = procIndex;

        // Время (не редактируется)
        const timeCell = document.createElement('td');
        timeCell.textContent = proc.time;
        row.appendChild(timeCell);

        // Вид раствора (выпадающий список)
        const solutionCell = document.createElement('td');
        const solutionSelect = createSolutionSelect(diaryIndex, procIndex, proc.solution);
        solutionCell.appendChild(solutionSelect);
        row.appendChild(solutionCell);

        // Объем введенного
        const injectedCell = document.createElement('td');
        injectedCell.textContent = proc.volumeInjected;
        makeCellEditable(injectedCell, diaryIndex, procIndex, 'volumeInjected');
        row.appendChild(injectedCell);

        // Объем слитого
        const drainedCell = document.createElement('td');
        drainedCell.textContent = proc.drainedVolume;
        makeCellEditable(drainedCell, diaryIndex, procIndex, 'drainedVolume');
        row.appendChild(drainedCell);

        // Разница
        const differenceCell = document.createElement('td');
        differenceCell.textContent = formatDifference(proc.difference);
        makeCellEditable(differenceCell, diaryIndex, procIndex, 'difference');
        row.appendChild(differenceCell);

        // Температура
        const temperatureCell = document.createElement('td');
        temperatureCell.textContent = proc.temperature;
        makeCellEditable(temperatureCell, diaryIndex, procIndex, 'temperature');
        row.appendChild(temperatureCell);

        // АД
        const bpCell = document.createElement('td');
        bpCell.textContent = proc.bloodPressure;
        makeCellEditable(bpCell, diaryIndex, procIndex, 'bloodPressure');
        row.appendChild(bpCell);

        if (proc.weight !== null) {
            const weightCell = document.createElement('td');
            weightCell.textContent = proc.weight;
            row.appendChild(weightCell);
        }

        // Особенности
        const notesCell = document.createElement('td');
        notesCell.textContent = proc.notes;
        makeCellEditable(notesCell, diaryIndex, procIndex, 'notes');
        row.appendChild(notesCell);

        tbody.appendChild(row);
    });

    // Строка итогов
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    const totalCells = ['Итого', '', '', '', 
                        diary.totalDifference > 0 ? `+${diary.totalDifference}` : diary.totalDifference,
                        '', ''];
    
    if (diary.procedures[0].weight !== null) {
        totalCells.splice(6, 0, '');
    }
    totalCells.push('');

    totalCells.forEach((cellText, cellIndex) => {
        const td = document.createElement('td');
        td.textContent = cellText;
        if (cellIndex === 4) {
            td.dataset.totalDifference = 'true';
        }
        totalRow.appendChild(td);
    });
    tbody.appendChild(totalRow);
    table.appendChild(tbody);

    diaryDiv.appendChild(table);

    // Подпись медсестры
    const signatures = document.createElement('div');
    signatures.className = 'diary-signatures';
    const nurseSig = document.createElement('div');
    nurseSig.className = 'diary-signature';
    const nurseTitleText = diary.nurseTitle || 'Медицинская сестра';
    nurseSig.textContent = `${nurseTitleText} ${diary.nurseName || '________________'} ________________`;
    signatures.appendChild(nurseSig);
    diaryDiv.appendChild(signatures);

    return diaryDiv;
}

function getAvailableSolutionOptions(currentSolution) {
    const solutionSelect = document.getElementById('solutionType');
    const options = new Set();

    if (solutionSelect) {
        Array.from(solutionSelect.options).forEach(option => {
            if (option.value && option.value !== 'custom') {
                options.add(option.value);
            }
        });
    }

    const customSolutionInput = document.getElementById('customSolution');
    if (customSolutionInput && customSolutionInput.value.trim()) {
        options.add(customSolutionInput.value.trim());
    }

    if (currentSolution) {
        options.add(currentSolution);
    }

    return Array.from(options);
}

function createSolutionSelect(diaryIndex, procIndex, currentSolution) {
    const select = document.createElement('select');
    select.className = 'diary-solution-select';
    select.dataset.diaryIndex = diaryIndex;
    select.dataset.procIndex = procIndex;

    const options = getAvailableSolutionOptions(currentSolution);
    options.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        if (optionValue === currentSolution) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    select.addEventListener('change', handleSolutionChange);
    return select;
}

function handleSolutionChange(event) {
    const select = event.target;
    const diaryIndex = parseInt(select.dataset.diaryIndex, 10);
    const procIndex = parseInt(select.dataset.procIndex, 10);

    if (Number.isNaN(diaryIndex) || Number.isNaN(procIndex)) {
        return;
    }

    const diary = generatedDiaries[diaryIndex];
    if (!diary) {
        return;
    }

    const procedure = diary.procedures[procIndex];
    if (!procedure) {
        return;
    }

    procedure.solution = select.value;
}

function makeCellEditable(td, diaryIndex, procIndex, field) {
    td.contentEditable = 'true';
    td.spellcheck = false;
    td.dataset.diaryIndex = diaryIndex;
    td.dataset.procIndex = procIndex;
    td.dataset.field = field;
    td.addEventListener('blur', handleEditableCellBlur);
}

function handleEditableCellBlur(event) {
    const td = event.target;
    const field = td.dataset.field;
    const diaryIndex = parseInt(td.dataset.diaryIndex, 10);
    const procIndex = parseInt(td.dataset.procIndex, 10);

    if (!field || Number.isNaN(diaryIndex) || Number.isNaN(procIndex)) {
        return;
    }

    const diary = generatedDiaries[diaryIndex];
    if (!diary) {
        return;
    }

    const procedure = diary.procedures[procIndex];
    if (!procedure) {
        return;
    }

    const rawValue = td.textContent.trim();

    if (field === 'volumeInjected' || field === 'drainedVolume' || field === 'difference') {
        const numericValue = parseInt(rawValue.replace(/[^\d+-]/g, ''), 10);
        if (Number.isNaN(numericValue)) {
            td.textContent = formatFieldValue(procedure[field], field);
            return;
        }

        if (field === 'difference') {
            procedure.difference = numericValue;
        } else {
            procedure[field] = numericValue;
            procedure.difference = procedure.drainedVolume - procedure.volumeInjected;
            updateRowDifferenceCell(td.closest('tr'), procedure.difference);
        }

        diary.totalDifference = diary.procedures.reduce((sum, proc) => sum + (proc.difference || 0), 0);
        updateTotalDifferenceCell(td.closest('table'), diary.totalDifference);
        td.textContent = formatFieldValue(procedure[field], field);
        return;
    }

    if (field === 'temperature') {
        procedure.temperature = rawValue || procedure.temperature;
        td.textContent = procedure.temperature;
        return;
    }

    if (field === 'bloodPressure') {
        procedure.bloodPressure = rawValue || procedure.bloodPressure;
        td.textContent = procedure.bloodPressure;
        return;
    }

    if (field === 'notes') {
        procedure.notes = rawValue || '';
        td.textContent = procedure.notes;
    }
}

function updateRowDifferenceCell(row, differenceValue) {
    if (!row) {
        return;
    }
    const differenceCell = row.querySelector('[data-field="difference"]');
    if (differenceCell) {
        differenceCell.textContent = formatDifference(differenceValue);
    }
}

function updateTotalDifferenceCell(table, totalDifference) {
    if (!table) {
        return;
    }
    const totalCell = table.querySelector('[data-total-difference="true"]');
    if (totalCell) {
        totalCell.textContent = formatDifference(totalDifference);
    }
}

function formatDifference(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '';
    }
    const numericValue = Number(value);
    if (numericValue > 0) {
        return `+${numericValue}`;
    }
    return `${numericValue}`;
}

function formatFieldValue(value, field) {
    if (field === 'difference') {
        return formatDifference(value);
    }
    return value != null ? String(value) : '';
}

// Создание формального дневника для PDF
function createFormalDiaryItem(diary) {
    const diaryDiv = document.createElement('div');
    diaryDiv.className = 'formal-diary-item';

    // Заголовок с датой
    const header = document.createElement('div');
    header.className = 'formal-diary-header';
    
    const date = document.createElement('div');
    date.className = 'formal-diary-date';
    const dateText = document.createTextNode(`Дата: ${formatDate(diary.date)}`);
    date.appendChild(dateText);
    header.appendChild(date);
    
    diaryDiv.appendChild(header);

    // Таблица
    const table = document.createElement('table');
    table.className = 'formal-diary-table';

    // Заголовки таблицы
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Время', 'Вид раствора', 'Объем введенного, мл', 'Объем слитого, мл', 
                     'Разница, мл', 'Температура, °C', 'АД, мм рт.ст.'];
    
    // Безопасная проверка наличия веса
    if (diary.procedures && diary.procedures.length > 0 && diary.procedures[0].weight !== null && diary.procedures[0].weight !== undefined) {
        headers.splice(7, 0, 'Вес, кг');
    }
    headers.push('Особенности');

    headers.forEach(headerText => {
        const th = document.createElement('th');
        // Используем createTextNode для правильной кодировки
        const headerTextNode = document.createTextNode(headerText);
        th.appendChild(headerTextNode);
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = document.createElement('tbody');
    diary.procedures.forEach(proc => {
        const row = document.createElement('tr');
        // Убеждаемся, что название раствора правильно отображается
        const solutionName = proc.solution || '';
        const cells = [
            proc.time || '',
            solutionName,
            (proc.volumeInjected != null && proc.volumeInjected !== undefined ? String(proc.volumeInjected) : ''),
            (proc.drainedVolume != null && proc.drainedVolume !== undefined ? String(proc.drainedVolume) : ''),
            proc.difference != null && proc.difference !== undefined ? (proc.difference > 0 ? `+${proc.difference}` : String(proc.difference)) : '',
            proc.temperature || '',
            proc.bloodPressure || ''
        ];

        if (proc.weight !== null && proc.weight !== undefined) {
            const weightValue = proc.weight != null ? (typeof proc.weight === 'string' ? proc.weight : proc.weight.toString()) : '';
            cells.splice(7, 0, weightValue);
        }
        cells.push(proc.notes || '');

        cells.forEach(cellText => {
            const td = document.createElement('td');
            // Безопасное преобразование в строку
            let textValue = '';
            if (cellText != null) {
                if (typeof cellText === 'string') {
                    textValue = cellText;
                } else if (typeof cellText === 'number') {
                    textValue = cellText.toString();
                } else {
                    textValue = String(cellText);
                }
            }
            // Используем createTextNode для правильной кодировки кириллицы
            const textNode = document.createTextNode(textValue);
            td.appendChild(textNode);
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });

    // Строка итогов - создаем с правильным количеством ячеек
    const totalRow = document.createElement('tr');
    totalRow.className = 'formal-total-row';
    
    // Определяем количество колонок на основе заголовков
    const columnCount = headers.length;
    const totalCells = [];
    
    // Заполняем массив пустыми строками
    for (let i = 0; i < columnCount; i++) {
        totalCells.push('');
    }
    
    // Устанавливаем значения в нужные позиции
    totalCells[0] = 'Итого'; // Первая колонка - "Итого"
    
    // Находим индекс колонки "Разница, мл" (обычно 4, но может быть сдвинут если есть вес)
    let diffColumnIndex = 4;
    if (diary.procedures && diary.procedures.length > 0 && diary.procedures[0].weight !== null && diary.procedures[0].weight !== undefined) {
        // Если есть вес, то "Разница" будет на позиции 5
        diffColumnIndex = 5;
    }
    
    // Безопасная обработка totalDifference
    if (diary.totalDifference != null && diary.totalDifference !== undefined) {
        const totalDiff = typeof diary.totalDifference === 'number' ? diary.totalDifference : (parseFloat(diary.totalDifference) || 0);
        totalCells[diffColumnIndex] = totalDiff > 0 ? `+${totalDiff}` : String(totalDiff);
    } else {
        totalCells[diffColumnIndex] = '';
    }

    totalCells.forEach((cellText, index) => {
        const td = document.createElement('td');
        // Используем createTextNode для правильной кодировки
        const textNode = document.createTextNode(cellText || '');
        td.appendChild(textNode);
        // Убеждаемся, что все ячейки имеют правильное выравнивание
        td.style.textAlign = 'center';
        totalRow.appendChild(td);
    });
    tbody.appendChild(totalRow);
    table.appendChild(tbody);

    diaryDiv.appendChild(table);

    // Подпись медсестры
    const signature = document.createElement('div');
    signature.className = 'formal-diary-signature';
    // Используем явное создание текстового узла для правильной кодировки
    const nurseTitleLabel = diary.nurseTitle || 'Медицинская сестра';
    const signatureText = document.createTextNode(`${nurseTitleLabel} ${diary.nurseName || '________________'} ________________`);
    signature.appendChild(signatureText);
    diaryDiv.appendChild(signature);

    return diaryDiv;
}

// Создание формальной страницы для PDF
function createFormalDiaryPage(diaries, isLastPage) {
    const pageDiv = document.createElement('div');
    pageDiv.className = 'formal-diary-page';

    // Заголовок страницы "Дневник перитонеального диализа" (в единственном числе)
    const pageTitle = document.createElement('div');
    pageTitle.className = 'formal-page-title';
    const titleText = document.createTextNode('Дневник перитонеального диализа');
    pageTitle.appendChild(titleText);
    pageDiv.appendChild(pageTitle);

    diaries.forEach((diary, index) => {
        const diaryElement = createFormalDiaryItem(diary);
        pageDiv.appendChild(diaryElement);
        
        // Разделитель между дневниками (кроме последнего)
        if (index < diaries.length - 1) {
            const separator = document.createElement('div');
            separator.className = 'formal-diary-separator';
            pageDiv.appendChild(separator);
        }
    });

    // Подписи в конце страницы (для всех страниц)
    const signatures = document.createElement('div');
    signatures.className = 'formal-page-signatures';
    
    const doctorSig = document.createElement('div');
    doctorSig.className = 'formal-page-signature';
    
    const doctorLabel = document.createElement('div');
    doctorLabel.className = 'signature-label';
    doctorLabel.textContent = `Врач ${diaries[0].doctorName || '________________'}`;
    doctorSig.appendChild(doctorLabel);

    const doctorLine = document.createElement('div');
    doctorLine.className = 'signature-line';
    doctorSig.appendChild(doctorLine);
    signatures.appendChild(doctorSig);
    
    const nurseSig = document.createElement('div');
    nurseSig.className = 'formal-page-signature';
    const nurseTitleLabel = diaries[0].nurseTitle || 'Медицинская сестра';
    
    const nurseLabel = document.createElement('div');
    nurseLabel.className = 'signature-label';
    nurseLabel.textContent = `${nurseTitleLabel} ${diaries[0].nurseName || '________________'}`;
    nurseSig.appendChild(nurseLabel);

    const nurseLine = document.createElement('div');
    nurseLine.className = 'signature-line';
    nurseSig.appendChild(nurseLine);
    signatures.appendChild(nurseSig);
    
    pageDiv.appendChild(signatures);

    return pageDiv;
}

// Экспорт в PDF
function exportToPDF() {
    if (generatedDiaries.length === 0) {
        alert('Сначала сгенерируйте дневники');
        return;
    }

    if (typeof html2pdf === 'undefined') {
        alert('Библиотека html2pdf не загружена. Пожалуйста, обновите страницу.');
        return;
    }

    // Сохраняем текущее содержимое previewContainer
    const previewContainer = document.getElementById('previewContainer');
    const originalContent = previewContainer.innerHTML;
    
    // Создаем контейнер для PDF с формальными дневниками
    const pdfContainer = document.createElement('div');
    pdfContainer.className = 'pdf-container';
    // Убеждаемся, что контейнер видим и правильно позиционирован с фиксированными размерами
    pdfContainer.style.display = 'block';
    pdfContainer.style.visibility = 'visible';
    pdfContainer.style.position = 'relative';
    pdfContainer.style.width = '210mm'; // Полная ширина A4 portrait
    pdfContainer.style.minWidth = '210mm';
    pdfContainer.style.maxWidth = '210mm';
    pdfContainer.style.pageBreakBefore = 'auto'; // Не создавать разрыв перед контейнером
    
    // Распределяем дневники по страницам: максимум 5 дневников на страницу
    const maxDiariesPerPage = 5;
    
    let currentPageDiaries = [];
    
    generatedDiaries.forEach((diary, index) => {
        // Если на текущей странице уже 5 дневников, создаем новую страницу
        if (currentPageDiaries.length >= maxDiariesPerPage) {
            // Создаем страницу с накопленными дневниками
            const pageElement = createFormalDiaryPage(currentPageDiaries, false);
            pdfContainer.appendChild(pageElement);
            // Начинаем новую страницу
            currentPageDiaries = [];
        }
        
        // Добавляем дневник на текущую страницу
        currentPageDiaries.push(diary);
    });
    
    // Добавляем последнюю страницу, если есть дневники
    if (currentPageDiaries.length > 0) {
        const pageElement = createFormalDiaryPage(currentPageDiaries, true);
        pdfContainer.appendChild(pageElement);
    }
    
    // Временно заменяем содержимое previewContainer формальными дневниками
    previewContainer.innerHTML = '';
    previewContainer.style.overflow = 'visible';
    previewContainer.style.width = 'auto';
    previewContainer.appendChild(pdfContainer);

    const fileName = `Дневники_ПД_${formatDate(new Date()).replace(/\./g, '_')}.pdf`;

    // Определяем браузер для оптимизации настроек
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    // Firefox имеет меньшие ограничения на размер canvas (обычно ~11180x11180 пикселей)
    // Для A4 (210x297mm) при scale=1.5 получаем примерно 1240x1755 пикселей, что безопасно
    const canvasScale = isFirefox ? 1.5 : 2;

    // Настройки для экспорта в альбомной ориентации
    const opt = {
        margin: [0, 0, 0, 0], // Без margin, отступ управляется через стили
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: canvasScale,
            useCORS: true,
            letterRendering: true,
            logging: false,
            backgroundColor: '#ffffff',
            removeContainer: false,
            allowTaint: false,
            imageTimeout: 15000,
            scrollX: false,
            scrollY: false,
            // Упрощенные настройки для избежания ошибок
            foreignObjectRendering: false,
            onclone: function(clonedDoc) {
                // Убеждаемся, что все элементы в клоне правильно инициализированы
                const clonedContainer = clonedDoc.querySelector('.pdf-container');
                if (clonedContainer) {
                    clonedContainer.style.width = '210mm'; // Полная ширина A4 portrait
                    clonedContainer.style.minWidth = '210mm';
                    clonedContainer.style.maxWidth = '210mm';
                    clonedContainer.style.display = 'block';
                    clonedContainer.style.visibility = 'visible';
                    clonedContainer.style.position = 'relative';
                    clonedContainer.style.margin = '0';
                    clonedContainer.style.padding = '0';
                    clonedContainer.style.pageBreakBefore = 'auto';
                }
                // Убеждаемся, что все страницы имеют одинаковые стили
                const clonedPages = clonedDoc.querySelectorAll('.formal-diary-page');
                clonedPages.forEach((page, index) => {
                    page.style.margin = '0';
                    page.style.padding = '0';
                    page.style.position = 'relative';
                    // Первая страница не должна иметь разрыв перед
                    if (index === 0) {
                        page.style.pageBreakBefore = 'avoid';
                        page.style.breakBefore = 'avoid';
                    }
                    // Последняя страница не должна создавать пустой лист
                    if (index === clonedPages.length - 1) {
                        page.style.pageBreakAfter = 'auto';
                        page.style.breakAfter = 'auto';
                    }
                });
            }
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true,
            precision: 16
        },
        pagebreak: { 
            mode: ['css'],
            avoid: ['.formal-diary-item', '.formal-diary-separator', '.formal-page-signatures', '.formal-diary-page:last-child']
        }
    };

    // Увеличиваем задержку для полного рендеринга контента
    setTimeout(() => {
        // Проверяем, что контейнер содержит контент
        if (pdfContainer.children.length === 0) {
            alert('Ошибка: не удалось создать контент для PDF');
            previewContainer.innerHTML = originalContent;
            return;
        }

        // Проверяем, что все элементы правильно созданы
        const allTables = pdfContainer.querySelectorAll('table');
        const allCells = pdfContainer.querySelectorAll('td, th');
        
        // Убеждаемся, что все ячейки имеют textContent (не null)
        allCells.forEach(cell => {
            if (cell.textContent === null) {
                cell.textContent = '';
            }
        });

        // Принудительно устанавливаем фиксированные размеры перед экспортом
        pdfContainer.style.width = '210mm';
        pdfContainer.style.minWidth = '210mm';
        pdfContainer.style.maxWidth = '210mm';
        pdfContainer.style.display = 'block';
        pdfContainer.style.visibility = 'visible';
        pdfContainer.style.position = 'relative';
        pdfContainer.style.overflow = 'visible';

        // Экспорт в PDF с обработкой ошибок для Firefox
        html2pdf().set(opt).from(pdfContainer).save().then(() => {
            // Восстанавливаем оригинальное содержимое
            previewContainer.innerHTML = originalContent;
        }).catch((error) => {
            console.error('Ошибка при экспорте в PDF:', error);
            const errorMessage = error.message || 'Неизвестная ошибка';
            
            // Проверяем, является ли ошибка связанной с размером canvas (Firefox)
            if (errorMessage.includes('canvas exceeds max size') || errorMessage.includes('canvas')) {
                // Пытаемся с еще меньшим scale для Firefox
                if (isFirefox && canvasScale > 1) {
                    console.log('Попытка экспорта с уменьшенным scale...');
                    const retryOpt = { ...opt };
                    retryOpt.html2canvas = { ...opt.html2canvas, scale: 1 };
                    
                    html2pdf().set(retryOpt).from(pdfContainer).save().then(() => {
                        previewContainer.innerHTML = originalContent;
                    }).catch((retryError) => {
                        console.error('Ошибка при повторной попытке экспорта:', retryError);
                        alert('Не удалось экспортировать PDF. Возможно, документ слишком большой. Попробуйте экспортировать меньше дней за раз или используйте браузер Chrome.');
                        previewContainer.innerHTML = originalContent;
                    });
                } else {
                    alert('Не удалось экспортировать PDF из-за ограничений размера canvas. Попробуйте:\n1. Уменьшить количество дней для экспорта\n2. Использовать браузер Chrome\n3. Экспортировать дневники по частям');
                    previewContainer.innerHTML = originalContent;
                }
            } else {
                alert('Произошла ошибка при экспорте в PDF: ' + errorMessage);
                previewContainer.innerHTML = originalContent;
            }
        });
    }, 200);
}

