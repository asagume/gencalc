//// @ts-check

function isString(value) {
    if (typeof value === "string" || value instanceof String) {
        return true;
    } else {
        return false;
    }
}

/** キャラクターマスター */
var CharacterMaster;
/** ローテーションマスター */
var RotationMaster;
/** サンプルデータ */
var RotationSample;
/** キャラクター名候補Map <キャラクター名, [候補]> */
var CharacterNameMatchMap;

// N 通常攻撃 | N1..N6 通常攻撃1..6段 | N.HOLD 通常攻撃長押し
// C 重撃/狙い撃ち | C.FULL フルチャージ狙い撃ち
// P 落下攻撃 | P.HIGH 上空落下攻撃 | P.LOW 低空落下攻撃
// E 元素スキル | E.PRESS 元素スキル一回押し | E.HOLD 元素スキル長押し
// Q 元素爆発
// W 歩き
// D ダッシュ
// J ジャンプ
const actioinVariationMap = new Map([
    ['N', ['HOLD']],
    ['C', ['AIM', 'FULL']],
    ['P', ['HIGH', 'LOW']],
    ['E', ['PRESS', 'HOLD', 'TAP', 'HOLDLEVEL1', 'HOLDLEVEL2']]
])

/** 漢字が含まれるか判定する正規表現 */
const CONTAIN_KANJI_RE = /([\u{3005}\u{3007}\u{303b}\u{3400}-\u{9FFF}\u{F900}-\u{FAFF}\u{20000}-\u{2FFFF}][\u{E0100}-\u{E01EF}\u{FE00}-\u{FE02}]?)/mu;

const KQM_SPLIT_RE1 = new RegExp(/\s+>\s+/);
const KQM_SPLIT_RE2 = new RegExp(/(\/\*.*\*\/|\S+\.\S+|\S+)/);

const X_SCALE = 72; // px per second (1sencod = 60frames)

const ELEMENT_COLOR = {
    炎: '#d2655a',
    水: '#559cc9',
    風: '#3aaf7a',
    雷: '#b681df',
    草: '',
    氷: '#63beb4',
    岩: '#df8f37'
}

const ELEMENT_IMG_SRC = {
    炎: 'images/element_pyro.png',
    水: 'images/element_hydro.png',
    風: 'images/element_anemo.png',
    雷: 'images/element_electro.png',
    氷: 'images/element_cryo.png',
    岩: 'images/element_geo.png'
}

const NORMAL_ATTACK_IMG_SRC = {
    片手剣: 'images/characters/NormalAttack_sword.png',
    両手剣: 'images/characters/NormalAttack_claymore.png',
    長柄武器: 'images/characters/NormalAttack_polearm.png',
    弓: 'images/characters/NormalAttack_bow.png',
    法器: 'images/characters/NormalAttack_catalyst.png'
}

const REFERENCE_FRAMES = {
    E: 40,
    Q: 100,
    W: 12,
    D: 12,
    J: 24
}

/**
 * 文字列の先頭からキャラクター名を抽出します.
 * 
 * @param {string} str 
 * @returns {Array} [キャラクター名, キャラクター名部分文字列]
 */
function analyzeCharacterNameStr(str) {
    let result;
    const str2 = str.toLowerCase();
    for (let entry of CharacterNameMatchMap.entries()) {
        entry[1].forEach(v => {
            if (CONTAIN_KANJI_RE.test(v)) {
                const splitted = str2.split(/[ \t]+/);
                if (splitted[0].length >= 2) {
                    if (v.startsWith(splitted[0]) || v.endsWith(splitted[0])) {
                        result = [entry[1][0], splitted[0]];
                        return;
                    }
                }
            }
            if (str2.startsWith(v.toLowerCase())) {
                if (!result) {
                    result = [entry[1][0], v];
                } else if (result[1].length < v.length) {
                    result = [entry[1][0], v];
                }
            }
        });
    }
    return result;
}

/**
 * KQM記法を解析します.
 * 
 * @param {string} kqm 
 * @returns {Map}
 */
function analyzeKqmNotation(kqm) {
    let result = new Map();

    kqm = kqm.replace(/\/\*(.*)\*\//g, function (match, p1) {
        return '/* ' + p1.trim().replace('>', '&gt;') + ' */';
    });
    kqm = kqm.trim().replace(/\n/g, ' > ');
    if (!kqm) return result;

    const kqmSplitted = kqm.split(KQM_SPLIT_RE1);
    console.debug(kqmSplitted);

    let preCharacter;
    let actionGroupNo = 0;

    kqmSplitted.forEach(str => {
        str = str.trim();

        // 行頭のコメントは除去します
        if (str.startsWith('/*')) {
            str = str.replace(/^\/\*.+?\*\//, '').trim();
        }
        if (!str) return;

        // キャラクターを特定します
        const characterTuple = analyzeCharacterNameStr(str);
        if (!characterTuple) return;
        const character = characterTuple[0];
        str = str.substring(characterTuple[1].length + 1);
        // console.debug(characterTuple, str);
        if (!result.has(character)) {
            result.set(character, []);
        }
        if (character != preCharacter) {
            preCharacter = character;
        }

        const step1StrArr = [];
        const commentRe = new RegExp(/(.*?)(\/*.*\*\/)/g);
        let workStr = str;
        while (workStr) {
            const retCommentRe = commentRe.exec(str);
            if (retCommentRe) {
                if (retCommentRe[1]) {
                    step1StrArr.push(retCommentRe[1].trim());
                }
                step1StrArr.push(retCommentRe[2].trim());
                workStr = workStr.substring(retCommentRe[0].length);
            } else {
                step1StrArr.push(workStr.trim());
                break;
            }
        }

        let step2StrArr = [];
        step1StrArr.forEach(str1 => {
            if (str1.startsWith('/*') && str1.endsWith('*/')) {
                step2StrArr.push(str1);
            } else {
                step2StrArr = step2StrArr.concat(str1.split(/\s+/));
            }
        })

        const actionRe = new RegExp(/^(\d*)(N(\.HOLD|\d*)|C(\.HOLD|\.AIM|\.FULL)?|P(\.HIGH|\.LOW)?|E(\.PRESS|\.HOLD|\.TAP|\.HOLDLEVEL1|\.HOLDLEVEL2)?|Q|W|D|J)(\((\d*\.?\d*)([sf]?)\))?/i);

        let actionGroupObj = {};
        step2StrArr.forEach(str2 => {
            actionGroupNo++;

            if (str2.startsWith('/*') && str2.endsWith('*/')) { // コメント
                let comment = str2.replace(/^\/\*\s*/, '').replace(/\s*\*\/$/, '');
                if (actionGroupObj) {
                    if ('comment' in actionGroupObj) {
                        comment = actionGroupObj['comment'] + ',' + comment;
                    }
                    actionGroupObj['comment'] = comment;
                } else {
                    actionGroupObj = {
                        actionGroupNo: actionGroupNo,
                        comment: comment
                    };
                }
                return;
            }

            actionGroupObj = {
                actionGroupNo: actionGroupNo,
                groupName: str2,
                actionList: []
            }

            let repeatTimes = 1;
            const subList = [];

            workStr = str2;
            while (workStr) {
                const retActionRe = actionRe.exec(workStr);
                if (!retActionRe) break;
                console.debug(workStr, retActionRe);
                workStr = workStr.substring(retActionRe[0].length);

                for (let i = 1; i < retActionRe.length; i++) {
                    if (retActionRe[i]) {
                        retActionRe[i] = retActionRe[i].toUpperCase();
                    }
                }

                if (retActionRe[1]) {
                    repeatTimes = Number(retActionRe[1]);
                }

                let actionTime = null;
                if (retActionRe[8]) {
                    actionTime = Number(retActionRe[8]);
                    if (!retActionRe[9] || retActionRe[9] == 's') {
                        actionTime *= 60;
                    }
                }

                if (retActionRe[2].startsWith('N')) { // 通常攻撃
                    let numberOfNormalAttack = 1;
                    if (retActionRe[3] && !Number.isNaN(retActionRe[3])) {
                        numberOfNormalAttack = Number(retActionRe[3]);
                    }
                    subList.push({
                        action: retActionRe[2].substring(0, 1),
                        numberOfNormalAttack: numberOfNormalAttack,
                        type: Number.isNaN(retActionRe[3]) ? retActionRe[3] : null,
                        time: actionTime
                    })

                } else if (retActionRe[2].startsWith('C')) { // 重撃
                    subList.push({
                        action: retActionRe[2].substring(0, 1),
                        type: retActionRe[4],
                        time: actionTime
                    })
                } else if (retActionRe[2].startsWith('P')) { // 落下攻撃
                    subList.push({
                        action: retActionRe[2].substring(0, 1),
                        type: retActionRe[5],
                        time: actionTime
                    })
                } else if (retActionRe[2].startsWith('E')) { // 元素スキル
                    subList.push({
                        action: retActionRe[2].substring(0, 1),
                        type: retActionRe[6],
                        time: actionTime
                    })
                } else if (retActionRe[2].startsWith('Q')) { // 元素爆発
                    subList.push({
                        action: retActionRe[2].substring(0, 1),
                        time: actionTime
                    })
                } else if (retActionRe[2].startsWith('W') || retActionRe[2].startsWith('D') || retActionRe[2].startsWith('J')) { // 歩き ダッシュ ジャンプ
                    subList.push({
                        action: retActionRe[2].substring(0, 1),
                        time: actionTime
                    })
                }
            }

            for (let i = 0; i < repeatTimes; i++) {
                actionGroupObj.actionList = actionGroupObj.actionList.concat(subList);
            }

            if (actionGroupObj.actionList.length > 0 && !actionGroupObj.comment) {
                result.get(character).push(actionGroupObj);
            }
        })
    })

    console.debug('analyzeKqmNotation', '=>', result);
    return result;
}

function getScaledX(x) {
    return Math.trunc(x * X_SCALE / 60);
}

function analyzeRotationStr() {
    const result = new Map();

    return result;
}

function getElementColor(characterMaster) {
    return ELEMENT_COLOR[characterMaster['元素']];
}

function getCharacterImgSrc(characterMaster) {
    return characterMaster['import'].replace(/^data\/characters/, 'images/characters/face').replace(/json$/, 'png');
}

function getCharacterBackgroundImageUrl(characterMaster) {
    return 'images/star' + characterMaster['レアリティ'] + '-bg.png';
}

function getCharacterElementImgSrc(characterMaster) {
    return ELEMENT_IMG_SRC[characterMaster['元素']];
}

function getElementalSkillImgSrc(characterMaster) {
    const imgDir = characterMaster['import'].replace(/^data\/characters/, 'images/characters').replace(/.json$/, '/');
    return imgDir + 'ElementalSkill.png';
}

function getElementalBurstImgSrc(characterMaster) {
    const imgDir = characterMaster['import'].replace(/^data\/characters/, 'images/characters').replace(/.json$/, '/');
    return imgDir + 'ElementalBurst.png';
}

function getTimeNumber(time, opt_default) {
    let result = time;
    if (Array.isArray(result)) {
        result = time[time.length - 1];
    }
    if (isString(result)) {
        const splited = result.split(/\D+/)
        result = splited[splited.length - 1];
    }
    if (Number.isNaN(result)) {
        result = opt_default;
    }
    return Number(result);
}

function makeRotation4v(rotationStr) {
    const result = { list: [] };

    rotationStr = rotationStr.trim();
    if (!rotationStr) return result;

    const analyzedMap = analyzeKqmNotation(rotationStr);

    const ccAddX = 12;  // キャラクター変更に要するフレーム数
    let preCharacter;
    let startX = 0;

    analyzedMap.forEach((value, key) => {
        const character = key;
        const characterMaster = CharacterMaster[character];
        const rotationMaster = RotationMaster[character];

        value.forEach(actionGroupObj => {
            if ('actionList' in actionGroupObj) {
                actionGroupObj['actionList'].forEach(actionObj => {
                    if (actionObj['time']) return;
                    let frames;
                    switch (actionObj['action']) {
                        case 'N':   // 通常攻撃
                            if (actionObj['numberOfNormalAttack']) {
                                let timeArr = [];
                                for (let i = 0; i < actionObj['numberOfNormalAttack']; i++) {
                                    timeArr.push(60 + 30 * i);
                                }
                                actionObj['time'] = timeArr;
                            } else {
                                actionObj['time'] = 60; // 1s
                            }
                            break;
                        case 'C':   // 重撃
                            actionObj['time'] = 60; // 1s
                            break;
                        case 'P':   // 落下攻撃
                            actionObj['time'] = 60; // 1s
                            break;
                        case 'E':   // 元素スキル
                            frames = 60;
                            if (rotationMaster) {
                                switch (actionObj['type']) {
                                    case 'HOLD':
                                        if ('Hold' in rotationMaster['元素スキル']['Frames']) {
                                            frames = rotationMaster['元素スキル']['Frames']['Hold'];
                                        }
                                        break;
                                    case 'CHARGELEVEL1':
                                        if ('Charge Level 1' in rotationMaster['元素スキル']['Frames']) {
                                            frames = rotationMaster['元素スキル']['Frames']['Charge Level 1'];
                                        }
                                        break;
                                    case 'CHARGELEVEL2':
                                        if ('Charge Level 2' in rotationMaster['元素スキル']['Frames']) {
                                            frames = rotationMaster['元素スキル']['Frames']['Charge Level 2'];
                                        }
                                        break;
                                    case 'PRESS':
                                    case 'TAP':
                                    default:
                                        if ('Press' in rotationMaster['元素スキル']['Frames']) {
                                            frames = rotationMaster['元素スキル']['Frames']['Press'];
                                        }
                                        if ('Tap' in rotationMaster['元素スキル']['Frames']) {
                                            frames = rotationMaster['元素スキル']['Frames']['Tap'];
                                        }
                                        break;
                                }
                            }
                            actionObj['time'] = getTimeNumber(frames, 60);
                            break;
                        case 'Q':   // 元素爆発
                            frames = 100;
                            if (rotationMaster) {
                                if (rotationMaster['元素爆発']['Frames']['Cast Frames']) {
                                    frames = rotationMaster['元素爆発']['Frames']['Cast Frames'];
                                }
                            }
                            if (frames) {
                                if (Array.isArray(frames)) {
                                    frames = frames[frames.length - 1]; // last item
                                }
                                if (isNaN(frames)) {
                                    frames = 100;   // FIXME
                                }
                            }
                            actionObj['time'] = getTimeNumber(frames, 100);
                            break;
                        case 'W':   // 歩き
                            actionObj['time'] = 12; // 0.2s
                            break;
                        case 'D':   // ダッシュ
                            actionObj['time'] = 12; // 0.2s
                            break;
                        case 'J':   // ジャンプ
                            actionObj['time'] = 30; // 0.5s
                            break;
                    }
                })
            }
        })
    });

    const analyzedDataOrderByGroupNo = [];
    analyzedMap.forEach((value, key) => {
        value.forEach(actionGroupObj => {
            analyzedDataOrderByGroupNo.push([key, actionGroupObj]);
        })
    });
    analyzedDataOrderByGroupNo.sort((a, b) => a[1]['actionGroupNo'] - b[1]['actionGroupNo']);

    const characterMap = new Map();

    let nextGroupX = 0;
    analyzedDataOrderByGroupNo.forEach(entry => {
        const character = entry[0];
        const characterMaster = CharacterMaster[character];

        if (!characterMap.has(character)) {
            characterMap.set(character, {
                name: character,
                imgSrc: getCharacterImgSrc(characterMaster),
                starBgUrl: getCharacterBackgroundImageUrl(characterMaster),
                elementColor: getElementColor(characterMaster),
                actions: []
            })
        }

        const actionGroupObj = entry[1];
        if ('actionList' in actionGroupObj) {
            const actionObj4v = {
                name: actionGroupObj['groupName'],
                x: 0,
                icons: []
            }
            let nextIconX = 0;
            actionGroupObj['actionList'].forEach(actionObj => {
                let imgSrc;
                if (['N', 'C', 'P'].includes(actionObj['action'])) {
                    imgSrc = NORMAL_ATTACK_IMG_SRC[characterMaster['武器']];
                    if (Array.isArray(actionObj['time'])) {
                        const subX = nextIconX;
                        let x = subX;
                        for (let i = 0; i < actionObj['numberOfNormalAttack']; i++) {
                            actionObj4v.icons.push({
                                imgSrc: NORMAL_ATTACK_IMG_SRC[characterMaster['武器']],
                                x: x
                            })
                            x = subX + getTimeNumber(actionObj['time'][i]);
                        }
                        nextIconX += x;
                    } else {
                        actionObj4v.icons.push({
                            imgSrc: NORMAL_ATTACK_IMG_SRC[characterMaster['武器']],
                            x: nextIconX
                        })
                        nextIconX += getTimeNumber(actionObj['time']);
                    }
                } else if (actionObj['action'] == 'E') {
                    actionObj4v.icons.push({
                        imgSrc: getElementalSkillImgSrc(characterMaster),
                        x: nextIconX
                    })
                    nextIconX += getTimeNumber(actionObj['time']);
                } else if (actionObj['action'] == 'Q') {
                    actionObj4v.icons.push({
                        imgSrc: getElementalBurstImgSrc(characterMaster),
                        x: nextIconX
                    })
                    nextIconX += getTimeNumber(actionObj['time']);
                } else if (actionObj['action'] == 'W') {
                    nextIconX += 12;
                } else if (actionObj['action'] == 'D') {
                    nextIconX += 12;
                } else if (actionObj['action'] == 'J') {
                    nextIconX += 24;
                }
                nextGroupX += nextIconX;
            })
            actionObj4v.x = nextGroupX;
            console.log(nextGroupX);
            characterMap.get(character)['actions'].push(actionObj4v);
        }
    })

    characterMap.forEach((value, key) => {
        result.list.push(value);
    })

    console.log('makeRotation4v', result.list);
    return result;
}

var newData;
function buildNewDataArea() {
    newData = new Vue({
        el: '#data_',
        data: {
            idSuffix: null,
            name: '',
            rotation: null,
            description: null,
            sortOrder: null,
            editable: true,
            rotation4v: {
                list: []
            }
        },
        methods: {
            rotationOnInput: function (event) {
                this.rotation = event.target.value;
                this.rotation4v = makeRotation4v(this.rotation);
            },
            saveButtonOnClick: function () {
                if (this.name) {
                    this.name = String(this.name).trim();
                }
                if (this.rotation) {
                    this.rotation = String(this.rotation).trim();
                }
                if (this.description) {
                    this.description = String(this.description).trim();
                }
                if (!this.name || !this.rotation) return;
                //saveData(this);
            }
        },
    })
}

function buildSaveDataArea() {

}

var sampleDataArea;
function buildSampleDataArea() {
    if (!RotationSample) return;

    const list = [];
    let sortOrder = 1;
    RotationSample.forEach(dataObj => {
        const newDataObj = JSON.parse(JSON.stringify(dataObj));
        newDataObj['sortOrder'] = sortOrder++;
        newDataObj['rotation4v'] = makeRotation4v(newDataObj['rotation']);
        newDataObj['isCompact'] = false;
        newDataObj['isEditable'] = false;
        list.push(newDataObj);
    })
    console.log('list', list);

    sampleDataArea = new Vue({
        el: '#sampleDataArea',
        data: {
            list: list
        }
    })
}

function createCharacterNameMatchMap() {
    const result = new Map();
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
        result.set(key, mapValue);
    });
    return result;
}

async function init() {
    const responses = await Promise.all([
        'data/CharacterMaster.json',
        'data/RotationMaster.json',
        'data/RotationSample.json'
    ].map(url => fetch(url).then(resp => resp.json())));

    CharacterMaster = responses[0];
    RotationMaster = responses[1];
    RotationSample = responses[2];

    CharacterNameMatchMap = createCharacterNameMatchMap();

    // NEW ROTATION
    buildNewDataArea();
    // YOUR ROTATIONS
    buildSaveDataArea();
    // SAMPLE ROTATIONS
    buildSampleDataArea();
}

const SAVE_DATA_KEY_PREFIX = 'genrota_';
const SAVE_DATA_TEMPLATE = {
    name: null,
    rotation: null,
    description: null,
    sortOrder: null,
};

// function saveData(data) {
//     console.debug('saveData', '=>', data);
//     if (!data.name || !data.rotation) return;
//     const key = SAVE_DATA_KEY_PREFIX + data.name;
//     let sortOrder;
//     const savedData = localStorage[key];
//     if (savedData) {
//         const savedDataObj = JSON.parse(savedData);
//         sortOrder = savedDataObj.sortOrder;
//     } else {
//         sortOrder = Object.keys(localStorage).filter(s => s.startsWith(SAVE_DATA_KEY_PREFIX)).reduce((a, b) => Math.max(a, b)) + 1;
//     }
//     const dataObj = {
//         name: data.name,
//         rotation: data.rotation,
//         description: data.description,
//         sortOrder: sortOrder
//     };
//     localStorage.setItem(key, JSON.stringify(dataObj));
// };


// const savedDataList = [];
// Object.keys(localStorage).filter(s => s.startsWith(SAVE_DATA_KEY_PREFIX)).forEach(key => {
//     const dataObj = JSON.parse(localStorage[key]);
//     dataObj['editable'] = false;
//     savedDataList.push(dataObj);
// })
// savedDataList.sort((a, b) => a.sortOrder - b.sortOrder)

// var saveDataArea = new Vue({
//     el: '#saveDataArea',
//     data: {
//         list: savedDataList
//     }
// })

// const sampleDataList = JSON.parse(JSON.stringify(SampleMaster));
// sampleDataList.forEach(e => {
//     e['rotation4v'] = makeRotation4v(e);
// })

// var sampleDataArea = new Vue({
//     el: '#sampleDataArea',
//     data: {
//         list: sampleDataList
//     }
// })