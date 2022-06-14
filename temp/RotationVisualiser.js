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
    ['C', ['FULL']],
    ['P', ['HIGH', 'LOW']],
    ['E', ['PRESS', 'HOLD', 'LEVEL1', 'LEVEL2']]
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
 * {
 *  no: number
 *  character:
 *  comment: string
 *  action: [N|C|P|E|Q|W|D|J]
 *  numberOfNormalAttack: number
 *  mode: [AIM|FULL|PRESS|HOLD|TAP|HOLDLEVEL1|HOLDLEVEL2]
 *  time: number or Array[number] (frame)
 * }
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

    let no = 0;
    let preCharacter;

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
            no++;
            preCharacter = character;
        }

        const step1StrArr = [];
        const commentRe = new RegExp(/(.*?)(\/*.*\*\/)/g);
        let workStr = str;
        while (workStr) {
            retCommentRe = commentRe.exec(str);
            if (retCommentRe) {
                if (retCommentRe[1]) {
                    step1StrArr.push(retCommentRe[1].trim());
                }
                step1StrArr.push(retCommentRe[2].trim());
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
        console.debug(character, no, step2StrArr);

        let actionGroupNo = 0;
        step2StrArr.forEach(str2 => {
            actionGroupNo++;

            if (str2.startsWith('/*') && str2.endsWith('*/')) { // コメント

            } else {

            }
        })

        const actionArr = [];

        const actionRe = new RegExp(/^\s*(\d*)(N(\.HOLD|(\d*)([CWDJ]*))|C(\.HOLD|\.AIM|\.FULL)?|P(\.HIGH|\.LOW)?|E(\.PRESS|\.HOLD|\.TAP|\.HOLD1|\.HOLD2)?|Q|W|D|J)(\((\d*\.?\d*)([sf]?)\))?/i);

        //     let workStr = str;
        //     while (workStr) {
        //         const retCommentRe = commentRe.exec(workStr);
        //         if (retCommentRe) {
        //             workStr = workStr.substring(retCommentRe[0].length).trim();
        //             actionArr.push(retActionRe[1]);
        //             continue;
        //         }

        //         const retActionRe = actionRe.exec(workStr);
        //         // console.log(character, workStr, 'retActionRe', retActionRe);
        //         if (!retActionRe) break;
        //         workStr = workStr.substring(retActionRe[0].length).trim();

        //         let repeatTimes = 1;
        //         if (retActionRe[1]) {
        //             repeatTimes = Number(retActionRe[1]);
        //         }

        //         let actionTime = null;
        //         if (retActionRe[9]) {
        //             actionTime = Number(retActionRe[10]);
        //             if (retActionRe[11] == 's') {
        //                 actionTime *= 60;
        //             }
        //         }

        //         let subObj = {};

        //         let subArr = [];
        //         if (retActionRe[2].startsWith('N')) { // 通常攻撃
        //             let n = 1;
        //             if (retActionRe[4]) {
        //                 n = Number(retActionRe[4]);
        //             }
        //             subObj = {
        //                 action: 'N',
        //                 n: n,
        //                 mode: retActionRe[4]
        //             };
        //             subArr.push(subObj);
        //             if (retActionRe[5]) {
        //                 const contArr = retActionRe[5].split('');
        //                 for (let i = 0; i < contArr.length; i++) {
        //                 }
        //             }
        //         } else if (retActionRe[2].startsWith('C')) { // 重撃
        //             subObj['action'] = 'C';
        //             subObj['mode'] = retActionRe[4];
        //             subObj['time'] = actionTime;
        //         } else if (retActionRe[2].startsWith('P')) { // 落下攻撃
        //             subObj['action'] = 'P';
        //             subObj['mode'] = retActionRe[4];
        //             subObj['time'] = actionTime;
        //         } else if (retActionRe[2].startsWith('E')) { // 元素スキル
        //             subObj['action'] = 'E';
        //             subObj['mode'] = retActionRe[4];
        //             subObj['time'] = actionTime;
        //         } else if (retActionRe[2].startsWith('Q')) { // 元素爆発
        //             subObj['action'] = 'Q';
        //             subObj['time'] = actionTime;
        //         } else if (retActionRe[2].startsWith('W')) { // 歩き
        //             subObj['action'] = 'W';
        //             subObj['time'] = actionTime;
        //         } else if (retActionRe[2].startsWith('D')) { // ダッシュ
        //             subObj['action'] = 'D';
        //             subObj['time'] = actionTime;
        //         } else if (retActionRe[2].startsWith('J')) { // ジャンプ
        //             subObj['action'] = 'J';
        //             subObj['time'] = actionTime;
        //         }

        //         let workArr = [];
        //         for (let i = 0; i < repeatTimes; i++) {
        //             workArr = workArr.concat(subArr);
        //         }
        //         actionArr.push(workArr);
        //     }

        //     result.get(character).push([no, actionArr]);
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

function makeRotation4v(rotationStr) {
    const result = { list: [] };

    rotationStr = rotationStr.trim();
    if (!rotationStr) return result;

    const analyzedMap = analyzeKqmNotation(rotationStr);

    const ccAddX = 12;  // キャラクター変更に要するフレーム数
    let preCharacter;
    let startX = 0;

    let actionTimeIndex = 0;

    const actionTimeMap = new Map();
    analyzedMap.forEach((value, key) => {
        const characterMaster = CharacterMaster[key];
        const rotationMaster = RotationMaster[key];
        value.forEach(v1 => {
            const actionTimeArr = [];
            for (let i = 0; i < v1[1].length; i++) {
                const v2 = v1[1][i];
                if (Array.isArray(v2)) {
                    v2.forEach(v3 => {
                        const nRe = new RegExp(/N(\d+|\.HOLD)?(\(\d*\.?\d*[sf]\))/);
                        const retNRe = nRe.exec(v3);
                        if (retNRe) {
                            if (retNRe[1] && !isNaN(retNRe[1])) {
                                const n = Number(retNRe[1]);
                                let workTime = 1 * 60;
                                if (rotationMaster) {
                                    for (let j = 0; j < n; j++) {
                                        workTime = rotationMaster['通常攻撃']['Frames']['通常攻撃'][j];
                                        if (Array.isArray(workTime)) {
                                            workTime = workTime[workTime.length - 1];
                                        }
                                        if (!isNaN(workTime)) {
                                            const workArr = workTime.split(/\s*\D\s*/);
                                            workTime = workArr[workArr.length - 1];
                                        }
                                    }
                                }
                                actionTimeArr.push(Number(workTime));
                            } else {    // .HOLD
                                let workTime = 1 * 60;
                                if (retNRe[2]) {
                                    workTime = Number(retNRe[2].substring(0, retNRe[2].length - 1));
                                    if (retNRe[2].endsWith('s')) {
                                        workTime *= 60;
                                    }
                                }
                                actionTimeArr.push(workTime);
                            }
                        }
                    })
                } else {

                }

                actionTimeMap.set(actionTimeIndex++, actionTimeArr);
            }
        })
    })

    //     value.forEach(v => {

    //         let actionTimeArr = [];
    //         if (v[1].startsWith('N')) {
    //             let lastActionTime = 0;
    //             const nRe = new RegExp(/^N(\d*)([CWDJ]*)(\(([\d\.]+)([sf]?)\))?/);
    //             const nReRet = nRe.exec(v[1]);
    //             if (nReRet) {
    //                 if (nReRet[3]) {
    //                     lastActionTime = Number(nReRet[3]);
    //                     if (!nReRet[4] || nReRet[4].toUpperCase() == 's') {
    //                         lastActionTime *= 60;   // second -> frames
    //                     }
    //                 }
    //                 if (nReRet[2]) {
    //                     let contArr = nReRet[2].split('');
    //                     for (let i = 0; i < contArr.length - (lastActionTime > 0 ? 1 : 0); i++) {
    //                         if (['C'].includes(contArr[i])) {
    //                             let actionTime = 100;   // FIXME
    //                             if (rotationMaster) {
    //                                 Object.keys(rotationMaster['通常攻撃']['Frames']).forEach(key => {
    //                                     if (['Charged Attack DMG', 'Fully-Charged Aimed Shot']) {

    //                                     } else {

    //                                     }
    //                                 })
    //                             }
    //                         } else {
    //                             actionTimeArr.push(REFERENCE_FRAMES[contArr[i]]);
    //                         }
    //                     }
    //                 }
    //                 let n = 1;
    //                 if (nReRet[1]) {    // n-Hit
    //                     n = Number(nReRet[1]);
    //                 }
    //                 if (rotationMaster) {
    //                     let lastN = Math.min(n, rotationMaster['通常攻撃']['Frames']['通常攻撃'].length);
    //                     lastN -= lastActionTime > 0 ? 1 : 0;
    //                     for (let i = 0; i < lastN; i++) {
    //                         let iconX = rotationMaster['通常攻撃']['Frames']['通常攻撃'][i];
    //                         if (isNaN(iconX)) {
    //                             if (Array.isArray(iconX)) {
    //                                 iconX = iconX[iconX.length - 1];
    //                             }
    //                             if (isString(iconX)) {
    //                                 if (iconX.indexOf('+') != 0) {
    //                                     const splittedX = iconX.split(/\s*\+\s*/);
    //                                     iconX = splittedX[splittedX.length - 1];
    //                                 }
    //                                 if (!isNaN(iconX)) {
    //                                     iconX = Number(iconX);
    //                                 } else {
    //                                     iconX = 18 * i; // FIXME
    //                                 }
    //                             }
    //                         }
    //                         actionTimeArr.push(iconX);
    //                     }
    //                     if (lastActionTime > 0) {
    //                         actionTimeArr.push(lastActionTime);
    //                     }
    //                 }
    //             }
    //         } else {
    //             const timeRe = new RegExp(/\(([\d\.]+)([sf]?)\)/);
    //             const timeReRet = timeRe.exec(v[1]);
    //             if (timeReRet) {
    //                 actionTime = Number(timeReRet[0]);
    //                 if (!timeReRet[2] || timeReRet[2].toLowerCase() == 's') {
    //                     actionTime *= 60; // convert to frame
    //                 }
    //                 actionTimeArr = [actionTime];
    //             } else {
    //                 actionTimeArr.push(60);
    //             }
    //         }
    //         actionTimeMap.set(v[0], actionTimeArr);
    //     })
    // })

    // const actionXMap = new Map();
    // analyzedMap.forEach((value, key) => {
    //     value.forEach(v => {
    //         let actionX = 0;
    //         for (i = 0; i < v[0]; i++) {
    //             if (actionTimeMap.has(i)) {
    //                 let workX = actionTimeMap.get(i)[actionTimeMap.get(i).length - 1];
    //                 if (!isNaN(workX)) {
    //                     actionX += workX;
    //                 }
    //             }
    //         }
    //         actionXMap.set(v[0], actionX);
    //     })
    // })

    // analyzedMap.forEach((value, key) => {
    //     const characterMaster = CharacterMaster[key];
    //     const rotationMaster = RotationMaster[key];
    //     const actions = [];
    //     value.forEach(v => {
    //         const actionX = actionXMap.get(v[0]);
    //         let actionObj = {
    //             no: v[0],
    //             name: v[1],
    //             x: getScaledX(actionX),
    //             width: 40,
    //             icons: []
    //         };
    //         let imgSrcArr = [];
    //         let iconXArr = [0];
    //         if (v[1].startsWith('N')) { // 通常攻撃
    //             let n = 1;
    //             let reRet = new RegExp(/^N(\d+)/).exec(v[1]);
    //             console.log(v[1], reRet);
    //             if (reRet) {
    //                 n = Number(reRet[1]);
    //             }
    //             for (i = 0; i < n; i++) {
    //                 imgSrcArr.push(NORMAL_ATTACK_IMG_SRC[characterMaster['武器']]);
    //                 if (i > 0 && rotationMaster && i < rotationMaster['通常攻撃']['Frames']['通常攻撃'].length) {
    //                     let iconX = rotationMaster['通常攻撃']['Frames']['通常攻撃'][i - 1];
    //                     if (isNaN(iconX)) {
    //                         if (Array.isArray(iconX)) {
    //                             iconX = iconX[iconX.length - 1];
    //                         }
    //                         if (isString(iconX)) {
    //                             if (iconX.indexOf('+') != 0) {
    //                                 const splittedX = iconX.split(/\s*\+\s*/);
    //                                 iconX = splittedX[splittedX.length - 1];
    //                             }
    //                             if (!isNaN(iconX)) {
    //                                 iconX = Number(iconX);
    //                             } else {
    //                                 iconX = 18 * i; // FIXME
    //                             }
    //                         }
    //                     }
    //                     iconXArr.push(iconX);
    //                 }
    //             }
    //         } else if (v[1].startsWith('C')) { // 重撃
    //             imgSrcArr.push(NORMAL_ATTACK_IMG_SRC[characterMaster['武器']]);
    //         } else if (v[1].startsWith('P')) { // 落下攻撃
    //             imgSrcArr.push(NORMAL_ATTACK_IMG_SRC[characterMaster['武器']]);
    //         } else if (v[1].startsWith('E')) { // 元素スキル
    //             imgSrcArr.push(getElementalSkillImgSrc(characterMaster));
    //         } else if (v[1].startsWith('Q')) { // 元素爆発
    //             imgSrcArr.push(getElementalBurstImgSrc(characterMaster));
    //         }
    //         for (let i = 0; i < imgSrcArr.length; i++) {
    //             const iconObj = {
    //                 imgSrc: imgSrcArr[i],
    //                 x: getScaledX(iconXArr[i])
    //             };
    //             actionObj.icons.push(iconObj);
    //         }
    //         actions.push(actionObj);
    //     });
    //     const charObj = {
    //         name: key,
    //         imgSrc: getCharacterImgSrc(characterMaster),
    //         starBgUrl: getCharacterBackgroundImageUrl(characterMaster),
    //         elementSrc: getCharacterElementImgSrc(characterMaster),
    //         elementColor: getElementColor(characterMaster),
    //         actions: actions
    //     }
    //     result.list.push(charObj);
    // })

    console.log('makeRotation4v', '=>', result);
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
                saveData(this);
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