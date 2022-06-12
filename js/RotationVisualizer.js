function selectorEscape(val) {
    return val.replace(/[ !"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&');
}

var CharacterMaster;
var WeaponMaster = [];
var ArtifactSetMaster;
var ArtifactMainMaster;
var ArtifactSubMaster;
var EnemyMaster;
var ElementalResonanceMaster;
var ElementalReactionMaster;
var OptionMaster1;
var OptionMaster2;
var TeamOptionMaster;
var characterMatchMap = new Map();

const SAVE_DATA_TEMPLATE = {
    id: '',
    name: '',
    data: '',
    description: '',
    sort_order: 0,
    updated_at: null
}

/**
 * 文字列の先頭からキャラクター名を抽出します.
 * 
 * @param {string} str 
 * @returns {string} キャラクター名部分文字列
 */
function analyzeCharacterNameStr(str) {
    let result;
    const str2 = str.toLowerCase();
    for (let entry of characterMatchMap.entries()) {
        entry[1].forEach(v => {
            if (str2.startsWith(v.toLowerCase())) {
                if (!result) {
                    result = v;
                } else if (result.length < v.length) {
                    result = v;
                }
            }
        });
    }
    return result;
}

const KQM_SPLIT_RE1 = new RegExp(/\s+>\s+/);
const KQM_SPLIT_RE2 = new RegExp(/(\/\*.*\*\/|\S+)/);

/**
 * KQM記法を解析します.
 * 
 * @param {*} kqm 
 * @returns {Map}
 */
function analyzeKqmNotation(kqm) {
    let result = new Map();

    kqm = kqm.replace(/\/\*(.*)\*\//g, function (match, p1) {
        return '/* ' + p1.trim().replace('>', '&gt;') + ' */';
    });
    kqm = kqm.trim().replace(/\n/g, ' > ');
    if (!kqm) return result;

    let start = 1;
    const kqmSplitted = kqm.split(KQM_SPLIT_RE1);
    console.log(kqmSplitted);
    kqmSplitted.forEach(e1 => {
        // 行頭のコメントは除去します
        if (e1.startsWith('/*')) {
            e1 = e1.replace(/^\/\*.+?\*\//, '');
        }

        // キャラクターを特定します
        const characterStr = analyzeCharacterNameStr(e1);
        let character;
        characterMatchMap.forEach((value, key) => {
            if (value.includes(characterStr)) {
                character = key;
            }
        });
        e1 = e1.substring(characterStr.length + 1);
        console.log(characterStr, character, e1);
        if (!character) return;
        if (!result.has(character)) {
            result.set(character, []);
        }

        let work = e1;
        while (work) {
            let reRet = KQM_SPLIT_RE2.exec(work);
            if (!reRet) {
                break;
            }
            work = work.substring(reRet[0].length).trim();
            const action = reRet[1];
            if (action.startsWith('/*') && action.endsWith('*/')) {
                result.get(character).push([start++, action]);
            } else {
                let subArr = [];
                let repeatTimesStr = '';
                const actionChars = action.split('');
                for (let i = 0; i < actionChars.length; i++) {
                    if (!$.isNumeric(actionChars[i])) {
                        break;
                    }
                    repeatTimesStr = repeatTimesStr + actionChars[i];
                }
                for (let i = 0; i < repeatTimesStr.length; i++) {
                    actionChars.shift();
                }
                actionChars.forEach(a => {
                    // N 通常攻撃
                    // C 重撃
                    // E 元素スキル
                    // Q 元素爆発
                    // D ダッシュ
                    // J ジャンプ
                    // W 歩き
                    if ('NEQ'.indexOf(a.toUpperCase()) != -1) { // 通常攻撃 元素スキル 元素爆発
                        subArr.push(a.toUpperCase());
                    } else if ('CDJW'.indexOf(a.toUpperCase()) != -1) { // 重撃 ダッシュ ジャンプ 歩き
                        if (subArr.length > 0 && subArr[subArr.length - 1].startsWith('N')) {
                            subArr[subArr.length - 1] = subArr[subArr.length - 1] + a;
                        } else {
                            subArr.push(a.toUpperCase());
                        }
                    } else if ($.isNumeric(a)) {
                        if (subArr[subArr.length - 1] == 'N') {
                            subArr[subArr.length - 1] = subArr[subArr.length - 1] + a;
                        }
                    }
                });
                let repeatTimes = 1;
                if (repeatTimesStr) {
                    repeatTimes = Number(repeatTimesStr);
                }
                for (let i = 0; i < repeatTimes; i++) {
                    subArr.forEach(a => {
                        result.get(character).push([start++, a]);
                    });
                }
            }
        }
    });

    return result;
}

function createElementCharacterLine(character) {
    const divElem = document.createElement('div');
    divElem.className = 'character-line';
    divElem.style.borderBottomColor = ELEMENT_COLOR[CharacterMaster[character]['元素']];
    divElem.style.borderImage = 'linear-gradient(135deg,' + ELEMENT_COLOR[CharacterMaster[character]['元素']] + ',#555555)';
    divElem.style.borderImageSlice = '1';

    const importVal = CharacterMaster[character]['import'];
    const src = importVal.replace(/^data\/characters/, 'images/characters/face').replace(/json$/, 'png');
    const backgroundImageUrl = 'images/star' + CharacterMaster[character]['レアリティ'] + '-bg.png';
    const imgHtml = FACE_HTML_TEMPLATE.replace('$1', src).replace('$2', backgroundImageUrl);

    const imgElem = document.createElement('img');
    imgElem.className = 'face';
    imgElem.src = importVal.replace(/^data\/characters/, 'images/characters/face').replace(/json$/, 'png');
    imgElem.alt = characterMatchMap.get(character)[1];
    imgElem.style.backgroundImage = 'url(' + backgroundImageUrl + ')';
    imgElem.style.backgroundSize = 'contain';
    divElem.appendChild(imgElem);

    const actionsDivElem = document.createElement('div');
    actionsDivElem.className = 'actions';
    divElem.appendChild(actionsDivElem);

    return divElem;
}

const NORMAL_ATTACK_SRC = {
    片手剣: 'images/characters/NormalAttack_sword.png',
    両手剣: 'images/characters/NormalAttack_claymore.png',
    長柄武器: 'images/characters/NormalAttack_polearm.png',
    弓: 'images/characters/NormalAttack_bow.png',
    法器: 'images/characters/NormalAttack_catalyst.png'
};

const ELEMENT_COLOR = {
    炎: '#d2655a',
    水: '#559cc9',
    風: '#3aaf7a',
    雷: '#b681df',
    草: '',
    氷: '#63beb4',
    岩: '#df8f37'
};

const TIME_UNIT = 48;
const ACTION_TIME = {
    C: 1.5 * TIME_UNIT,
    E: 1 * TIME_UNIT,
    Q: 1.5 * TIME_UNIT,
    D: 0.2 * TIME_UNIT,
    J: 0.3 * TIME_UNIT,
    W: 0.3 * TIME_UNIT
};
const NORMAL_ATTACK_TIME = {
    片手剣: 0.4 * TIME_UNIT,
    両手剣: 0.9 * TIME_UNIT,
    長柄武器: 0.4 * TIME_UNIT,
    弓: 0.4 * TIME_UNIT,
    法器: 0.75 * TIME_UNIT
};

const NORMAL_ATTACK_TIME_ARR = {
    片手剣: [0, 0, 0, 0, 4, 5, 6],
    両手剣: [0, 0, 0, 0, 225, 270],
    長柄武器: [0, 0, 0, 0, 4, 5, 6],
    弓: [0, 0, 0, 0, 4, 5, 6],
    法器: [0, 1, 0, 3, 4]
}

/**
 * 
 * @param {string} character 
 * @param {number} start 
 * @param {string} action 
 * @param {number} actionTime 
 * @returns {HTMLElement}
 */
function createElementAction(character, start, action, actionTime) {
    console.debug(character, start, action, actionTime);
    const divElem = document.createElement('div');
    divElem.className = 'action';
    divElem.style.width = actionTime + 'px';
    divElem.style.left = start + 'px';
    divElem.style.backgroundColor = ELEMENT_COLOR[CharacterMaster[character]['元素']];

    const importVal = CharacterMaster[character]['import'];
    const imgDir = importVal.replace(/^data\/characters/, 'images/characters').replace(/.json$/, '/');
    let src;
    if (action.startsWith('N') || action == 'C') {
        src = NORMAL_ATTACK_SRC[CharacterMaster[character]['武器']];
    } else if (action == 'E') {
        src = imgDir + 'ElementalSkill.png';
    } else if (action == 'Q') {
        src = imgDir + 'ElementalBurst.png';
    }
    if (src) {
        const imgElem = document.createElement('img');
        imgElem.className = 'action';
        imgElem.src = src;
        imgElem.alt = action;
        if (actionTime < 64) {
            imgElem.style.width = actionTime + 'px';
            // imgElem.style.height = actionTime + 'px';
        }
        divElem.appendChild(imgElem);
    }

    const pElem = document.createElement('p');
    pElem.innerHTML = action;
    divElem.appendChild(pElem);

    return divElem;
}

const ACTION_HTML_TEMPLATE = `<div class="action" style="width: $width; left: $left; background-color: $backgroundColor;">
$imgHtml
<p>$action</p>
</div>`;

function makeHtmlAction(character, start, action, actionTime) {
    console.debug(character, start, action, actionTime);

    let html = ACTION_HTML_TEMPLATE;
    html = html.replace(/\$width/, actionTime + 'px');
    html = html.replace(/\$left/, start + 'px');
    html = html.replace(/\$backgroundColor/, ELEMENT_COLOR[CharacterMaster[character]['元素']]);

    let imgHtml = '';
    const importVal = CharacterMaster[character]['import'];
    const imgDir = importVal.replace(/^data\/characters/, 'images/characters').replace(/.json$/, '/');
    let src;
    if (action.startsWith('N') || action == 'C') {
        src = NORMAL_ATTACK_SRC[CharacterMaster[character]['武器']];
    } else if (action == 'E') {
        src = imgDir + 'ElementalSkill.png';
    } else if (action == 'Q') {
        src = imgDir + 'ElementalBurst.png';
    }
    if (src) {
        imgHtml = `<img class="action" src="$src" alt="$action" style="$style">`;
        imgHtml = imgHtml.replace(/\$src/, src);
        imgHtml = imgHtml.replace(/\$action/, action);
        let style = '';
        if (actionTime < 64) {
            style = 'width: ' + Math.trunc(actionTime) + 'px;';
        }
        imgHtml = imgHtml.replace(/\$style/, style);
    }
    html = html.replace(/\$imgHtml/, imgHtml);

    html = html.replace(/\$action/, action);

    return html;
}

function displayTeam(data, opt_editable = false) {
    const divElem = document.createElement('div');
    divElem.className = 'team';
    divElem.id = data['id'];
}

function displayTeamCompact(data) {
    const divElem = document.createElement('div');
    if ('name' in data) {
        const nameElem = document.createElement('p');
        p.innerHTML = name;
        divElem.appendChild(nameElem);
    }
    if ('data' in data) {
        const faceElemArr = [];
        const analyzedMap = analyzeKqmNotation(data['data']);
        analyzedMap.forEach((value, key) => {
            faceElemArr.push(create)
        });

    }
    if ('description' in data) {

    }
}

function getElementColor(master) {
    return ELEMENT_COLOR[master['元素']];
}

function getFaceSrcUrl(master) {
    return master['import'].replace(/^data\/characters/, 'images/characters/face').replace(/json$/, 'png');
}

function getFaceBackgroundImageUrl(master) {
    return 'images/star' + master['レアリティ'] + '-bg.png';
}

/**
 * 
 * @param {string} name 
 */
function getSavedData(name) {
    return JSON.parse(localStorage[SAVE_DATA_KEY_PREFIX + name]);
}

/**
 * EDITボタンがクリックされました.
 */
const editButtonOnClick = function () {
    const name = $(this).attr('id').replace('edit-', '');
    $('#label-name-' + selectorEscape(name)).hide();
    $('#name-' + selectorEscape(name)).show();
    $('#edit-' + selectorEscape(name)).hide();
    $('#cancel-' + selectorEscape(name)).show();
    $('#save-' + selectorEscape(name)).show();
    $('#rotation-area-' + selectorEscape(name)).show();
    $('#description-area-' + selectorEscape(name)).show();
}

/**
 * CANCELボタンがクリックされました.
 */
const cancelButtonOnClick = function () {
    const name = $(this).attr('id').replace('cancel-', '');
    const savedData = getSavedData(name);
    if (savedData) {
        $('#name-' + selectorEscape(name)).val(savedData['name']);
        $('#rotation-area-' + selectorEscape(name)).val(savedData['data']);
        $('#description-area-' + selectorEscape(name)).val(savedData['description']);
    }
    $('#label-name-' + selectorEscape(name)).show();
    $('#name-' + selectorEscape(name)).hide();
    $('#edit-' + selectorEscape(name)).show();
    $('#cancel-' + selectorEscape(name)).hide();
    $('#save-' + selectorEscape(name)).hide();
    $('#rotation-area-' + selectorEscape(name)).hide();
    $('#description-area-' + selectorEscape(name)).hide();
}

/**
 * SAVEボタンがクリックされました.
 * 
 * @param {string} suffix 
 */
function saveButtonOnClick(suffix) {
    const name = String($('#' + selectorEscape('name-' + suffix)).val()).trim();
    const data = String($('#' + selectorEscape('rotation-' + suffix)).val()).trim();
    const description = String($('#' + selectorEscape('description-' + suffix)).val()).trim();
    if (name && data) {
        if (name != suffix) {
            localStorage.removeItem(SAVE_DATA_KEY_PREFIX + suffix);
        }
        const key = SAVE_DATA_KEY_PREFIX + name;
        let valueObj = JSON.parse(JSON.stringify(SAVE_DATA_TEMPLATE));
        if (localStorage[key]) {
            valueObj = JSON.parse(JSON.stringify(SAVE_DATA_TEMPLATE));
        } else {
            valueObj = JSON.parse(JSON.stringify(SAVE_DATA_TEMPLATE));
        }
        let sortOrder = 0;
        valueObj['name'] = name;
        valueObj['data'] = data;
        valueObj['description'] = description;
        valueObj['sortOrder'] = sortOrder;
        valueObj['updated_at'] = null;
        localStorage.setItem(key, JSON.stringify(valueObj));
    }
}

const saveButtonNewOnClick = function () {
    const id = $(this).attr('id');
    const suffix = id.substring(id.indexOf('-') + 1);

    saveButtonOnClick(suffix)
};

function redrawData(dataObj, element) {

}

const saveButtonSavedDataOnClick = function () {
    const id = $(this).attr('id');
    const suffix = id.substring(id.indexOf('-') + 1);

    const name = $('#name-' + selectorEscape(suffix)).val();

    saveButtonOnClick(suffix);

    const dataObj = getSavedData(name);
    if (dataObj) {

    }

    $('#label-name-' + selectorEscape(suffix)).show();
    $('#name-' + selectorEscape(suffix)).hide();
    $('#edit-' + selectorEscape(suffix)).show();
    $('#cancel-' + selectorEscape(suffix)).hide();
    $('#save-' + selectorEscape(suffix)).hide();
    $('#rotation-area-' + selectorEscape(suffix)).hide();
    $('#description-area-' + selectorEscape(suffix)).hide();
};

const saveButtonNewDataOnClick = function () {
    const id = $(this).attr('id');
    const suffix = id.substring(id.indexOf('-') + 1);

    const name = $('#name-' + selectorEscape(suffix)).val();

    saveButtonOnClick(suffix);

    const dataObj = getSavedData(name);
    if (dataObj) {

    }

    $('#name-' + selectorEscape(suffix)).show();
    $('#save-' + selectorEscape(suffix)).hide();
    $('#rotation-area-' + selectorEscape(suffix)).show();
    $('#description-area-' + selectorEscape(suffix)).show();
};

/**
 * 
 */
 const rotationTextareaOnChange = function () {
    let rotationVal = $(this).val();
    rotationVal.trim();
    if (rotationVal) {
        const id = $(this).attr('id');
        const suffix = id.substring(id.indexOf('-') + 1);
    
        const dataObj = JSON.parse(JSON.stringify(SAVE_DATA_TEMPLATE));
        dataObj['data'] = rotationVal;

        const visualAreaHtml = makeHtmlVisualArea(dataObj);
        const parent = $('#data-' + selectorEscape(suffix) + ' .visual-area').get()[0];
        parent.insertAdjacentHTML('beforeend', visualAreaHtml);
    }
};

const DATA_HTML_TEMPLATE = `<div class="data" id="data-$name">
    <div class="data-control">
        <p class="name" id="label-name-$name" style="$displayStyle">$name</p>
        <input type="text" id="name-$name" minlength="1" maxlength="32" size="32" value="$name" style="$inputStyle">
        <button type="button" class="data-edit" id="edit-$name" style="$editStyle">EDIT</button>
        <button type="button" class="data-cancel" id="cancel-$name" style="$cancelStyle">CANCEL</button>
        <button type="button" class="data-save" id="save-$name" style="$saveStyle">SAVE</button>
        <button type="button" class="data-remove" id="remove-$name" style="$removeStyle">REMOVE</button>
    </div>
    <div class="rotation-area" id="rotation-area-$name" style="$inputStyle">
        <div class="flex">
            <textarea id="rotation-$name" name="rotation-$name" rows="8" cols="65" autocapitalize="words">
            $rotation
            </textarea>
            <label for="rotation-$name">ROTAION</label>
        </div>
    </div>
    <div class="description-area" id="description-area-$name" style="$inputStyle">
        <div class="flex">
            <textarea id="description-$1" name="description-$name" rows="8" cols="65">
            $description
            </textarea>
            <label for="description-$name">DESCRIPTION</label>
        </div>
    </div>
    <div class="visual-area">
$dataLines
    </div>
    <fieldset class="description" style="$displayStyle">$description</fieldset>
</div>`;
const DATA_LINE_HTML_TEMPLATE = `<div class="character-line" id="character-line-$name_$character">
    <img class="face" src="$src" alt="$character" style="background-image: url($starBg); background-size: contain;">
    <div class="actions" style="border-bottom-color: $elementColor; border-image: linear-gradient(135deg, $elementColor, rgb(85, 85, 85)) 1 / 1 / 0 stretch;">
$actions
    </div>
</div>`;

/**
 * 
 * @param {*} dataObj 
 */
function makeHtmlVisualArea(dataObj) {
    let html = '';

    const analyzedMap = analyzeKqmNotation(dataObj['data']);

    const actionTimeMap = new Map();
    analyzedMap.forEach((value, key) => {
        const myMaster = CharacterMaster[key];
        if (!myMaster) return;
        value.forEach(action => {
            if (action[1].startsWith('/*') && action[1].endsWith('*/')) return;
            let actionTime = 0;
            if (action[1] in ACTION_TIME) {
                actionTime = ACTION_TIME[action[1]];
            } else {
                const nRe = new RegExp(/^N(\d*)([CDJW]*)/);
                let nRet = nRe.exec(action[1]);
                if (nRet) {
                    if (nRet[1]) {
                        actionTime = NORMAL_ATTACK_TIME[myMaster['武器']] * Number(nRet[1]);
                    } else {
                        actionTime = NORMAL_ATTACK_TIME[myMaster['武器']];
                    }
                    if (nRet[2]) {
                        if (nRet[2].indexOf('C') != -1) {
                            actionTime += NORMAL_ATTACK_TIME[myMaster['武器']] * 2;
                        }
                        actionTime += 0.2 * TIME_UNIT * nRet[2].length;
                    }
                }
            }
            console.debug(action, actionTime, typeof actionTime);
            actionTimeMap.set(action[0], actionTime);
        });
    });

    const startMap = new Map();
    actionTimeMap.forEach((value, key) => {
        let newValue = 0;
        for (let i = 1; i < key; i++) {
            if (actionTimeMap.has(i)) {
                newValue += Number(actionTimeMap.get(i));
            }
        }
        startMap.set(key, newValue);
    });

    analyzedMap.forEach((value, key) => {
        const myMaster = CharacterMaster[key];
        if (!myMaster) return;
        let htmlSub = DATA_LINE_HTML_TEMPLATE;
        htmlSub = htmlSub.replace(/\$name/g, dataObj['name']);
        htmlSub = htmlSub.replace(/\$character/g, key);
        htmlSub = htmlSub.replace(/\$src/g, getFaceSrcUrl(myMaster));
        htmlSub = htmlSub.replace(/\$starBg/g, getFaceBackgroundImageUrl(myMaster));
        htmlSub = htmlSub.replace(/\$elementColor/g, getElementColor(myMaster));

        let actionHtml = '';
        value.forEach(action => {
            actionHtml += makeHtmlAction(key, startMap.get(action[0]), action[1], actionTimeMap.get(action[0]));
        });
        htmlSub = htmlSub.replace(/\$actions/g, actionHtml);

        html += htmlSub;
    });

    return html;
}

function displayData(dataObj, parent, opt_mode = 0) {
    let html = DATA_HTML_TEMPLATE;
    html = html.replace(/\$name/g, dataObj['name']);
    let displayStyle = '';
    let inputStyle = '';
    let editStyle = '';
    let cancelStyle = '';
    let saveStyle = '';
    let removeStyle = '';
    if (opt_mode == 0) {    // SAVE DATA
        inputStyle = 'display: none;';
        cancelStyle = 'display: none;';
        saveStyle = 'display: none;';
    } if (opt_mode == 1) {  // NEW DATA
        displayStyle = 'display: none;';
        editStyle = 'display: none;';
        cancelStyle = 'display: none;';
        removeStyle = 'display: none;';
    }
    html = html.replace(/\$inputStyle/g, inputStyle);
    html = html.replace(/\$displayStyle/g, displayStyle);
    html = html.replace(/\$editStyle/g, editStyle);
    html = html.replace(/\$cancelStyle/g, cancelStyle);
    html = html.replace(/\$saveStyle/g, saveStyle);
    html = html.replace(/\$removeStyle/g, removeStyle);
    html = html.replace(/\$rotation/g, dataObj['data']);

    const dataLines = makeHtmlVisualArea(dataObj);
    html = html.replace(/\$dataLines/g, dataLines);

    const description = dataObj['description'] ? dataObj['description'] : '';
    html = html.replace(/\$description/g, description);

    parent.insertAdjacentHTML('beforeend', html);

    if (opt_mode == 0) {
        $(document).on('click', '#edit-' + selectorEscape(dataObj['name']), editButtonOnClick);
        $(document).on('click', '#cancel-' + selectorEscape(dataObj['name']), cancelButtonOnClick);
        $(document).on('click', '#save-' + selectorEscape(dataObj['name']), saveButtonSavedDataOnClick);
        $(document).on('click', '#rotation-' + selectorEscape(dataObj['name']), rotationTextareaOnChange);
    } else if (opt_mode == 1) {
        $(document).on('click', '#save-' + selectorEscape(dataObj['name']), saveButtonNewDataOnClick);
        $(document).on('click', '#rotation-' + selectorEscape(dataObj['name']), rotationTextareaOnChange);
    }

}

const DATA_COMPACT_HTML_TEMPLATE = `<div class="data-compact" id="data-compact-$1">
<p class="name">$1</p>
$3
<div class="description">$4</div>
<button type="button" class="data-compact-edit" id="data-compact-edit-$1">EDIT</button>
<button type="button" class="data-compact-reset" id="data-compact-reset-$1" disabled>RESET</button>
<button type="button" class="data-compact-save" id="data-compact-save-$1" disabled>SAVE</button>
<button type="button" class="data-compact-remove" id="data-compact-remove-$1">REMOVE</button>
</div>`;
const DATA_COMPACT_IMG_HTML_TEMPLATE = `<img class="face" src="$1" alt="$2" style="background-image: url($3); background-size: contain;">`;

/**
 * 
 * @param {object} dataObj 
 * @param {HTMLElement} parent 
 */
function displayDataCompact(dataObj, parent) {
    const analyzedMap = analyzeKqmNotation(dataObj['data']);

    let html = DATA_COMPACT_HTML_TEMPLATE;
    html = html.replace(/\$1/g, dataObj['name']);
    let imgHtml = '';
    analyzedMap.forEach((value, key) => {
        const myMaster = CharacterMaster[key];
        if (!myMaster) return;
        let imgHtmlSub = DATA_COMPACT_IMG_HTML_TEMPLATE;
        imgHtmlSub = imgHtmlSub.replace(/\$1/g, getFaceSrcUrl(myMaster));
        imgHtmlSub = imgHtmlSub.replace(/\$2/g, key);
        imgHtmlSub = imgHtmlSub.replace(/\$3/g, getFaceBackgroundImageUrl(myMaster));
        imgHtml += imgHtmlSub + '\n';
    });
    html = html.replace(/\$3/g, imgHtml);
    const description = dataObj['description'] ? dataObj['description'] : '';
    html = html.replace(/\$4/g, description);

    parent.insertAdjacentHTML('beforeend', html);


}

const SAVE_DATA_KEY_PREFIX = 'genteam-';

/**
 * 
 * @returns 
 */
function loadSavedData() {
    const saveDataAreaElem = $('#save-data-area').get()[0];
    saveDataAreaElem.innerHTML = '';

    const savedDataArr = [];
    Object.keys(localStorage).filter(s => s.startsWith(SAVE_DATA_KEY_PREFIX)).forEach(key => {
        const savedData = JSON.parse(localStorage[key]);
        savedDataArr.push(savedData);
    });
    if (savedDataArr.length == 0) return;

    savedDataArr.sort((a, b) => a['sortOrder'] - b['sortOrder']);

    let sortOrder = 1;
    savedDataArr.forEach(savedData => {
        if (savedData['sortOrder'] == sortOrder) return;
        savedData['sortOrder'] = sortOrder++;
        localStorage[SAVE_DATA_KEY_PREFIX + savedData['name']] = JSON.stringify(savedData);
    });

    let saveId = 1;
    savedDataArr.forEach(savedData => {
        const liElem = document.createElement('li');
        liElem.id = 'save-data-' + (saveId++);
        displayData(savedData, liElem);
        saveDataAreaElem.appendChild(liElem);
    });
}

/**
 * init.
 */
async function init() {
    const responses = await Promise.all([
        'data/CharacterMaster.json',
        'data/SwordMaster.json',
        'data/ClaymoreMaster.json',
        'data/PolearmMaster.json',
        'data/BowMaster.json',
        'data/CatalystMaster.json',
        'data/ArtifactSetMaster.json',
        'data/ArtifactMainMaster.json',
        'data/ArtifactSubMaster.json',
        'data/EnemyMaster.json',
        'data/ElementalResonanceMaster.json',
        'data/ElementalReactionMaster.json',
        'data/OptionMaster1.json',
        'data/OptionMaster2.json',
        'data/TeamOptionMaster.json'
    ].map(url => fetch(url).then(resp => resp.json())));

    CharacterMaster = responses[0];
    WeaponMaster['片手剣'] = responses[1];
    WeaponMaster['両手剣'] = responses[2];
    WeaponMaster['長柄武器'] = responses[3];
    WeaponMaster['弓'] = responses[4];
    WeaponMaster['法器'] = responses[5];
    ArtifactSetMaster = responses[6];
    ArtifactMainMaster = responses[7];
    ArtifactSubMaster = responses[8];
    EnemyMaster = responses[9];
    ElementalResonanceMaster = responses[10];
    ElementalReactionMaster = responses[11];
    OptionMaster1 = responses[12];
    OptionMaster2 = responses[13];
    TeamOptionMaster = responses[14];

    Object.keys(CharacterMaster).forEach(key => {
        const importVal = CharacterMaster[key]['import'];
        const splitted = importVal.split('_');
        const mapValue = [];
        mapValue.push(key);
        const name1 = splitted[splitted.length - 1].replace('.json', '');
        mapValue.push(name1);
        const name2 = name1.split(/(?=[A-Z])/).join(' ');
        if (name2 != name1) {
            mapValue.push(name2);
        }
        if (name2.indexOf(' ') != -1) {
            const nameSplitted = name2.split(' ');
            mapValue.push(nameSplitted[0]);
            mapValue.push(nameSplitted[1]);
        }
        characterMatchMap.set(key, mapValue);
    });

    console.log(characterMatchMap);

    // new-data-area
    const newDataAreaElem = $('#new-data-area').get()[0];
    newDataAreaElem.innerHTML = '';
    newData = JSON.parse(JSON.stringify(SAVE_DATA_TEMPLATE));
    displayData(newData, newDataAreaElem, 1);

    // save-data-area
    loadSavedData();
};

