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
var CharacterMasterMap;
/** ローテーションマスター */
var RotationMaster;
/** サンプルデータ */
var RotationSample;
/** 元素粒子マスター */
var ParticleMaster;
/** キャラクター名候補Map <キャラクター名, [候補]> */
var CharacterNameMatchMap;

const DUMMY_IMG_SRC = "data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7";

const DEFAULT_ROTATION_TIME = 20;
const DEFAULT_ENERGY_BY_ENEMY = 0;
const DEFAULT_WINDFALL = false; // 追い風が吹く なし
const DEFAULT_CORRECTION = 0;   // エネルギー補正値 0

// N 通常攻撃 | N1..N6 通常攻撃1..6段 | N.HOLD 通常攻撃長押し
// C 重撃/狙い撃ち | C.FULL フルチャージ狙い撃ち
// P 落下攻撃 | P.HIGH 上空落下攻撃 | P.LOW 低空落下攻撃
// E 元素スキル | E.PRESS 元素スキル一回押し | E.HOLD 元素スキル長押し
// Q 元素爆発
// W 歩き
// D ダッシュ
// J ジャンプ
const actioinVariationMap = new Map([
    ['N', new Map([
        ['HOLD', '長押し']
    ])],
    ['C', new Map([
        ['AIMSHOT', '狙い撃ち'],
        ['AIM', '狙い撃ち'],
        ['FULLYCHARGEDAIMSHOT', 'フルチャージ狙い撃ち'],
        ['FULLYCHARGED', 'フルチャージ狙い撃ち'],
        ['FULLY', 'フルチャージ狙い撃ち'],
        ['FULL', 'フルチャージ狙い撃ち'],
        ['CHARGE1', '1段チャージ狙い撃ち'],
        ['CHARGE2', '2段チャージ狙い撃ち'],
        ['1', '1段チャージ狙い撃ち'],
        ['2', '2段チャージ狙い撃ち'],
    ])],
    ['P', new Map([
        ['HIGH', '上空落下'],
        ['LOW', '低空落下']
    ])],
    ['E', new Map([
        ['PRESS', '一回押し'],
        ['HOLD', '長押し'],
        ['TAP', '一回押し'],
        ['CHARGELEVEL1', '1段チャージ'],
        ['CHARGELEVEL2', '2段チャージ'],
        ['CHARGE1', '1段チャージ'],
        ['CHARGE2', '2段チャージ'],
        ['1', '1段チャージ'],
        ['2', '2段チャージ']
    ])],
])

const displayTypeNameMap = new Map([
    ['狙い撃ち', ''],
    ['フルチャージ狙い撃ち', '<div class="maru"><p>F</p></div>'],
    ['1段チャージ狙い撃ち', '<div class="maru"><p>1</p></div>'],
    ['2段チャージ狙い撃ち', '<div class="maru"><p>2</p></div>'],
    ['一回押し', ''],
    ['長押し', '<div class="maru"><p>H</p></div>'],
    ['上空落下', '<div class="maru"><p>H</p></div>'],
    ['低空落下', ''],
    ['1段チャージ', '<div class="maru"><p>1</p></div>'],
    ['2段チャージ', '<div class="maru"><p>2</p></div>']
])

/** 漢字が含まれるか判定する正規表現 */
const CONTAIN_KANJI_RE = /([\u{3005}\u{3007}\u{303b}\u{3400}-\u{9FFF}\u{F900}-\u{FAFF}\u{20000}-\u{2FFFF}][\u{E0100}-\u{E01EF}\u{FE00}-\u{FE02}]?)/mu;

const KQM_SPLIT_RE1 = new RegExp(/\s+>\s+/);
const KQM_SPLIT_RE2 = new RegExp(/(\/\*.*\*\/|\S+\.\S+|\S+)/);

const X_SCALE = 30; // px per second (1sencod = 60frames)

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
                        result = [entry[0], splitted[0]];
                        return;
                    }
                }
            }
            if (str2.startsWith(v.toLowerCase())) {
                if (!result) {
                    result = [entry[0], v];
                } else if (result[1].length < v.length) {
                    result = [entry[0], v];
                }
            }
        });
    }
    return result;
}

function makeActionRegExp() {
    const cStr = 'C(' + Array.from(actioinVariationMap.get('C').keys()).map(s => '\\.' + s).join('|') + ')?';
    const pStr = 'P(' + Array.from(actioinVariationMap.get('P').keys()).map(s => '\\.' + s).join('|') + ')?';
    const eStr = 'E(' + Array.from(actioinVariationMap.get('E').keys()).map(s => '\\.' + s).join('|') + ')?';
    const str = '^(\\d*)(N(\\.HOLD|\\d*)|' + cStr + '|' + pStr + '|' + eStr + '|Q|W|D|J)(\\((\\d*\\.?\\d*)([sf]?)\\))?';
    return new RegExp(str, 'i');
}

/**
 * KQM記法を解析します.
 * 
 * @param {string} kqm 
 * @returns {Map}
 */
function analyzeKqmNotation(kqm) {
    let result = new Map();

    kqm = kqm.replace(/\/\*(.*?)\*\//g, function (match, p1) {
        return '/* ' + p1.trim().replace('>', '&gt;') + ' */';
    });
    kqm = kqm.trim().replace(/\n/g, ' > ');
    if (!kqm) return result;

    const kqmSplitted = kqm.split(KQM_SPLIT_RE1);

    let actionGroupNo = 0;

    const actionRe = makeActionRegExp();

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

        const step1StrArr = [];
        const commentRe = new RegExp(/(.*?)(\/\*.*?\*\/)/g);
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

        let actionGroupObj = {};
        step2StrArr.forEach(str2 => {
            actionGroupNo++;

            if (str2.startsWith('/*') && str2.endsWith('*/')) { // コメント
                const comment = str2.replace(/^\/\*\s*/, '').replace(/\s*\*\/$/, '');
                if (comment) {
                    actionGroupObj = {
                        actionGroupNo: actionGroupNo,
                        comment: comment,
                    }
                    result.get(character).push(actionGroupObj);
                }
                return;
            }

            actionGroupObj = {
                actionGroupNo: actionGroupNo,
                groupName: str2.toUpperCase(),
                actionList: []
            }

            let repeatTimes = 1;
            const subList = [];

            workStr = str2;
            while (workStr) {
                const retActionRe = actionRe.exec(workStr);
                if (!retActionRe) break;
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
                    if (!retActionRe[9] || retActionRe[9].toLowerCase() == 's') {
                        actionTime *= 60;   // second -> frame
                    }
                }

                if (retActionRe[2].startsWith('N')) { // 通常攻撃
                    let numberOfAttack = 1;
                    let myType = null;
                    if (retActionRe[3]) {
                        if (Number.isNaN(retActionRe[3])) {
                            myType = actioinVariationMap.get('N').get(retActionRe[3].substring(1));
                        } else {
                            numberOfAttack = Number(retActionRe[3]);
                        }
                    }
                    subList.push({
                        action: retActionRe[2].substring(0, 1),
                        numberOfAttack: numberOfAttack,
                        type: myType,
                        time: actionTime
                    })
                } else if (retActionRe[2].startsWith('C')) { // 重撃
                    let myType = null;
                    if (retActionRe[4]) {
                        myType = actioinVariationMap.get('C').get(retActionRe[4].substring(1));
                    }
                    subList.push({
                        action: retActionRe[2].substring(0, 1),
                        type: myType,
                        time: actionTime
                    })
                } else if (retActionRe[2].startsWith('P')) { // 落下攻撃
                    let myType = null;
                    if (retActionRe[5]) {
                        myType = actioinVariationMap.get('P').get(retActionRe[5].substring(1));
                    }
                    subList.push({
                        action: retActionRe[2].substring(0, 1),
                        type: myType,
                        time: actionTime
                    })
                } else if (retActionRe[2].startsWith('E')) { // 元素スキル
                    let myType = null;
                    if (retActionRe[6]) {
                        myType = actioinVariationMap.get('E').get(retActionRe[6].substring(1));
                    }
                    subList.push({
                        action: retActionRe[2].substring(0, 1),
                        type: myType,
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

            result.get(character).push(actionGroupObj);
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
    return characterMaster['import'].replace(/data\/characters/, 'images/characters/face').replace(/json$/, 'png');
}

function getCharacterBackgroundImageUrl(characterMaster) {
    return 'images/star' + characterMaster['レアリティ'] + '-bg.png';
}

function getCharacterElementImgSrc(characterMaster) {
    return ELEMENT_IMG_SRC[characterMaster['元素']];
}

function getElementalSkillImgSrc(characterMaster) {
    const imgDir = characterMaster['import'].replace(/data\/characters/, 'images/characters').replace(/.json$/, '/');
    return imgDir + 'ElementalSkill.png';
}

function getElementalBurstImgSrc(characterMaster) {
    const imgDir = characterMaster['import'].replace(/data\/characters/, 'images/characters').replace(/.json$/, '/');
    return imgDir + 'ElementalBurst.png';
}

function getTimeNumber(time, opt_default) {
    let result = time;
    if (Array.isArray(result)) {
        result = time[time.length - 1];
    }
    if (isString(result)) {
        const splited = result.split(/\s*\D+\s*/)
        result = splited[splited.length - 1];
    }
    if (Number.isNaN(result)) {
        result = opt_default;
    }
    return Number(result);
}

function getActionTime(rotationMaster, action, n, type, opt_nextAction = null) {
    let time = -9999;
    let timeArr;
    if (rotationMaster) {
        switch (action) {
            case 'N':   // 通常攻撃
                time = 0;
                for (let i = 0; i < n; i++) {
                    timeArr = rotationMaster['通常攻撃']['Frames']['通常攻撃'][i];
                    if (Array.isArray(timeArr) && timeArr.length == 2) {
                        time += timeArr[1];
                    } else {
                        time = -9999;
                    }
                }
                if (time == 0) {
                    time = -9999;
                }
                timeArr = rotationMaster['通常攻撃']['Frames']['通常攻撃'][n];
                if (Array.isArray(timeArr) && timeArr.length == 2) {
                    if (opt_nextAction && opt_nextAction != 'N') {
                        time += timeArr[0];
                    } else {
                        time += timeArr[1];
                    }
                }
                break;
            case 'C':   // 重撃
                time = -9999;
                switch (rotationMaster['武器']) {
                    case '片手剣':
                    case '長柄武器':
                    case '法器':
                        timeArr = rotationMaster['通常攻撃']['Frames']['重撃'];
                        if (Array.isArray(timeArr) && timeArr.length == 2) {
                            if (opt_nextAction && opt_nextAction != 'N') {
                                time = timeArr[0];
                            } else {
                                time = timeArr[1];
                            }
                        }
                        break;
                    case '両手剣':
                        break;
                    case '弓':
                        if ('フルチャージ狙い撃ち' in rotationMaster['通常攻撃']['Frames']) {
                            timeArr = rotationMaster['通常攻撃']['Frames']['フルチャージ狙い撃ち'];
                        }
                        if (type && type in rotationMaster['通常攻撃']['Frames']) {
                            timeArr = rotationMaster['元素スキル']['Frames'][type];
                        }
                        if (Array.isArray(timeArr) && timeArr.length == 2) {
                            if (opt_nextAction) {
                                time = timeArr[0];
                            } else {
                                time = timeArr[1];
                            }
                        }
                        break;
                }
            case 'P':   // 落下攻撃
                if (!type) {
                    type = '低空落下';
                }
                time = -9999;
            case 'E':   // 元素スキル
                time = -9999;
                if (!type) {
                    type = '一回押し';
                }
                if (type in rotationMaster['元素スキル']['Frames']) {
                    timeArr = rotationMaster['元素スキル']['Frames'][type];
                    if (Array.isArray(timeArr) && timeArr.length == 2) {
                        if (opt_nextAction) {
                            time = timeArr[0];
                        } else {
                            time = timeArr[1];
                        }
                    }
                }
                break;
            case 'Q':   // 元素爆発
                time = -9999;
                timeArr = rotationMaster['元素スキル']['Frames'];
                if (Array.isArray(timeArr) && timeArr.length == 2) {
                    if (opt_nextAction) {
                        time = timeArr[0];
                    } else {
                        time = timeArr[1];
                    }
                }
                break;
        }
    }
    switch (action) {
        case 'W':   // 歩き
            time = 12;
            break;
        case 'D':   // ダッシュ
            time = 20;
            break;
        case 'J':   // ジャンプ
            time = 30;
            break;
    }
    if (Number.isNaN(time) || time <= 0) {
        switch (action) {
            case 'N':
                time = 30 + 30 * n;
                break;
            case 'C':
                time = 90;
            case 'P':
                time = 60;
            case 'E':
                time = 60;
                break;
            case 'Q':
                time = 120;
                break;
            default:
                time = 90;
                break;
        }
    }
    console.debug(rotationMaster ? rotationMaster['名前'] : null, action, n, type, opt_nextAction, '=>', time);
    return time;
}

function makeRotation4v(rotationStr) {
    const result = { width: 0, list: [] };

    if (!rotationStr) return result;
    rotationStr = rotationStr.trim();
    if (!rotationStr) return result;

    const analyzedMap = analyzeKqmNotation(rotationStr);

    analyzedMap.forEach((value, key) => {
        const character = key;
        const characterMasterDetail = CharacterMasterMap.get(character);
        const rotationMaster = RotationMaster[character];

        value.forEach(actionGroupObj => {
            if ('actionList' in actionGroupObj) {
                for (let i = 0; i < actionGroupObj['actionList'].length; i++) {
                    const actionObj = actionGroupObj['actionList'][i];
                    if (actionObj['time'] && !('comment' in actionObj)) return;
                    let frames;
                    let nextAction = null;
                    if (i + 1 < actionGroupObj['actionList'].length) {
                        nextAction = actionGroupObj['actionList'][i + 1]['action'];
                    }
                    switch (actionObj['action']) {
                        case 'N':   // 通常攻撃
                            let timeArr = [];
                            for (let j = 0; j < actionObj['numberOfAttack'] - 1; j++) {
                                frames = getActionTime(rotationMaster, actionObj['action'], j, null, 'N');
                                timeArr.push(frames);
                            }
                            frames = getActionTime(rotationMaster, actionObj['action'], actionObj['numberOfAttack'] - 1, null, nextAction);
                            timeArr.push(frames);
                            actionObj['time'] = timeArr;
                            break;
                        case 'C':   // 重撃
                        case 'P':   // 落下攻撃
                        case 'E':   // 元素スキル
                        case 'Q':   // 元素爆発
                        case 'W':   // 歩き
                        case 'D':   // ダッシュ
                        case 'J':   // ジャンプ
                            frames = getActionTime(rotationMaster, actionObj['action'], null, actionObj['type'], nextAction);
                            actionObj['time'] = frames;
                            break;
                    }
                }
            }
        })
    })

    // 行動順に並べます
    const analyzedDataOrderByGroupNo = [];
    analyzedMap.forEach((value, key) => {
        value.forEach(actionGroupObj => {
            analyzedDataOrderByGroupNo.push([key, actionGroupObj]);
        })
    });
    analyzedDataOrderByGroupNo.sort((a, b) => a[1]['actionGroupNo'] - b[1]['actionGroupNo']);

    const characterMap = new Map();

    let preCharacter;
    let nextGroupX = 0;
    analyzedDataOrderByGroupNo.forEach(entry => {
        const character = entry[0];
        const characterMaster = CharacterMaster[character];
        const characterMasterDetail = CharacterMasterMap.get(character);

        if (!characterMap.has(character)) {
            characterMap.set(character, {
                name: character,
                elementName: characterMaster['元素'],
                star: characterMaster['レアリティ'],
                imgSrc: getCharacterImgSrc(characterMaster),
                starBgUrl: getCharacterBackgroundImageUrl(characterMaster),
                elementImgSrc: getCharacterElementImgSrc(characterMaster),
                elementColor: getElementColor(characterMaster),
                actions: [],
                timeOnField: 0,
                timeOnFieldRatio: 0
            })
        }

        if (character != preCharacter) {
            if (preCharacter) {
                const lastActionObj4v = characterMap.get(preCharacter)['actions'].slice(-1)[0];
                if ('width' in lastActionObj4v) {
                    if (lastActionObj4v['width'] < 60) {
                        lastActionObj4v['width'] = 60;  // キャラクター交代クールタイム1s
                    }
                }
                nextGroupX += 12;   // キャラクター交代時間を加算します
            }
            preCharacter = character;
        }

        const actionGroupObj = entry[1];
        if ('actionList' in actionGroupObj) {
            let groupName = actionGroupObj['groupName'];
            let groupNameDisplay = '';
            const actionObj4v = {
                name: groupName,
                x: nextGroupX,
                width: 0,
                icons: [],
                comment: 'comment' in actionGroupObj ? actionGroupObj['comment'] : null
            }
            let nextIconX = 0;
            actionGroupObj['actionList'].forEach(actionObj => {
                let width;
                const iconObj = {
                    code: actionObj['action'],
                    x: nextIconX
                }
                if (['N', 'C', 'P'].includes(actionObj['action'])) {    // 通常攻撃 重撃 落下攻撃
                    if (characterMasterDetail) {
                        iconObj['name'] = characterMasterDetail['通常攻撃']['名前'];
                    }
                    if (actionObj['action'] == 'N') {
                        if (Array.isArray(actionObj['time'])) {
                            width = actionObj['time'][actionObj['time'].length - 1];
                        } else {
                            width = actionObj['time'];
                        }
                    } else {
                        width = actionObj['time'];
                    }
                    iconObj['imgSrc'] = NORMAL_ATTACK_IMG_SRC[characterMaster['武器']];
                    iconObj['width'] = width;
                    nextIconX += width;
                } else if (actionObj['action'] == 'E') {    // 元素スキル
                    if (characterMasterDetail) {
                        iconObj['name'] = characterMasterDetail['元素スキル']['名前'];
                        iconObj['type'] = actionObj['type'];
                        let cd;
                        let duration;
                        Object.keys(characterMasterDetail['元素スキル']).filter(key => key.endsWith('クールタイム')).forEach(key => {
                            if (actionObj['type']) {
                                if (key.startsWith(actionObj['type'])) {
                                    cd = characterMasterDetail['元素スキル'][key];
                                }
                            } else if (key == 'クールタイム') {
                                cd = characterMasterDetail['元素スキル'][key];
                            }
                        })
                        if (!cd && 'クールタイム' in characterMasterDetail['元素スキル']) {
                            cd = characterMasterDetail['元素スキル']['クールタイム'];
                        }
                        if (cd !== undefined) {
                            iconObj['cd'] = cd;
                        }
                        Object.keys(characterMasterDetail['元素スキル']).filter(key => key.endsWith('継続時間')).forEach(key => {
                            if (actionObj['type']) {
                                if (key.startsWith(actionObj['type'])) {
                                    duration = characterMasterDetail['元素スキル'][key];
                                }
                            } else if (key == '継続時間') {
                                duration = characterMasterDetail['元素スキル'][key];
                            }
                        });
                        if (duration !== undefined) {
                            iconObj['duration'] = duration;
                        }
                    }
                    width = actionObj['time'];
                    iconObj['imgSrc'] = getElementalSkillImgSrc(characterMaster);
                    iconObj['width'] = width;
                    nextIconX += width;
                } else if (actionObj['action'] == 'Q') {    // 元素爆発
                    if (characterMasterDetail) {
                        iconObj['name'] = characterMasterDetail['元素爆発']['名前'];
                        if ('継続時間' in characterMasterDetail['元素爆発']) {
                            iconObj['duration'] = characterMasterDetail['元素爆発']['継続時間'];
                        }
                        iconObj['cd'] = characterMasterDetail['元素爆発']['クールタイム'];
                        iconObj['energyCost'] = characterMasterDetail['元素爆発']['元素エネルギー'];
                    }
                    width = actionObj['time'];
                    iconObj['imgSrc'] = getElementalBurstImgSrc(characterMaster);
                    iconObj['width'] = width;
                    nextIconX += width;
                } else if (['W', 'D', 'J'].includes(actionObj['action'])) {    // 歩き ダッシュ ジャンプ
                    width = actionObj['time'];
                    iconObj['width'] = width;
                    nextIconX += width;
                }
                actionObj4v.icons.push(iconObj);

                groupNameDisplay += actionObj['action'];
                if (actionObj['action'] == 'N' && actionObj.numberOfAttack) {
                    iconObj['numberOfAttack'] = actionObj.numberOfAttack;
                    groupNameDisplay += actionObj.numberOfAttack;
                }
                if (actionObj['type'] && displayTypeNameMap.has(actionObj['type'])) {
                    groupNameDisplay += displayTypeNameMap.get(actionObj['type']);
                }
            })
            nextGroupX += nextIconX;

            actionObj4v.width = nextIconX;

            console.log(groupName, nextIconX);
            if (groupName.indexOf('.') == -1) {
                groupNameDisplay = groupName;
            }
            actionObj4v['groupNameDisplay'] = groupNameDisplay;

            characterMap.get(character)['actions'].push(actionObj4v);
            console.log(character, actionObj4v.x, actionObj4v.name);
        } else if ('comment' in actionGroupObj) {
            if (nextGroupX > 0) {
                nextGroupX -= 12;
            }
            const actionObj4v = {
                name: actionGroupObj['groupName'],
                x: nextGroupX,
                width: 0,
                comment: 'comment' in actionGroupObj ? actionGroupObj['comment'] : null
            }
            characterMap.get(character)['actions'].push(actionObj4v);
            console.log(character, actionObj4v.x, actionObj4v.name);
        }
    })

    let totalTimeOnField = 0;
    characterMap.forEach((value, key) => {
        value['actions'].forEach(actionObj4v => {
            if ('width' in actionObj4v) {
                value['timeOnField'] += actionObj4v.width;
                totalTimeOnField += actionObj4v.width;
            }
        })
    })
    if (totalTimeOnField) {
        console.debug('totalTimeOnField', totalTimeOnField)
        characterMap.forEach((value, key) => {
            console.debug(key, 'timeOnField', value['timeOnField'])
            value['timeOnFieldRatio'] = value['timeOnField'] / totalTimeOnField;
        })
    }

    let width = 0;
    characterMap.forEach((value, key) => {
        value.width = getScaledX(totalTimeOnField);

        value['actions'].forEach(actionObj4v => {
            if ('x' in actionObj4v) {
                actionObj4v['x'] = getScaledX(actionObj4v['x']);
                if (width < actionObj4v['x']) {
                    width = actionObj4v['x'];
                }
            }
            if ('icons' in actionObj4v) {
                actionObj4v['icons'].forEach(iconObj => {
                    let workWidth;
                    ['x', 'width'].forEach(propKey => {
                        if (propKey in iconObj) {
                            iconObj[propKey] = getScaledX(iconObj[propKey]);
                        }
                    });
                    workWidth = actionObj4v['x'] + iconObj['x'];
                    if ('width' in iconObj) {
                        workWidth += iconObj['width'];
                    }
                    if (width < workWidth) {
                        width = workWidth;
                    }
                    ['duration', 'cd'].forEach(propKey => {
                        if (propKey in iconObj) {
                            iconObj[propKey + 'Display'] = getScaledX(iconObj[propKey] * 60);
                        }
                    });
                    workWidth = actionObj4v['x'] + iconObj['x'];
                    if ('duration' in iconObj) {
                        workWidth += iconObj['durationDisplay'];
                    }
                    if (width < workWidth) {
                        width = workWidth;
                    }
                    workWidth = actionObj4v['x'] + iconObj['x'];
                    if ('cd' in iconObj) {
                        workWidth += iconObj['cdDisplay'];
                    }
                    if (width < workWidth) {
                        width = workWidth;
                    }
                })
            }
        })
        result.list.push(value);
    })

    result.width = 90 + 49 + width;
    console.log('makeRotation4v', result.width, result.list);
    return result;
}

function initErEstomator(vm, opt_index = undefined) {
    const data = opt_index !== undefined ? vm.list[opt_index] : vm;

    let isChanged = false;
    for (let i = 0; i < data.rotation4v.list.length; i++) {
        if (i < data.erEstimator.list.length) {
            if (data.rotation4v.list[i].name != data.erEstimator.list[i].name) {
                data.erEstimator.list[i].name = data.rotation4v.list[i].name;
                data.erEstimator.list[i].windfall = DEFAULT_WINDFALL;
                data.erEstimator.list[i].correction = DEFAULT_CORRECTION;
                isChanged = true;
            }
        } else {
            data.erEstimator.list.push({
                name: data.rotation4v.list[i].name,
                windfall: DEFAULT_WINDFALL,
                correction: DEFAULT_CORRECTION
            });
            isChanged = true;
        }
    }
    if (data.rotation4v.list.length < data.erEstimator.list.length) {
        data.erEstimator.list.length = data.rotation4v.list.length;
        isChanged = true;
    }
    if (isChanged) {
        estimateEnergyRecharge(vm, opt_index);
    }
}

function estimateEnergyRecharge(vm, opt_index = undefined) {
    const erEstimator = opt_index !== undefined ? vm.list[opt_index].erEstimator : vm.erEstimator;
    const rotation4v = opt_index !== undefined ? vm.list[opt_index].rotation4v : vm.rotation4v;

    const particleTimelineArr = [];
    const evenlyParticleObj = {};
    particleTimelineArr.length = erEstimator.rotationTime;
    for (let time = 0; time < particleTimelineArr.length; time++) {
        particleTimelineArr[time] = [];
    }

    rotation4v.list.forEach(character => {
        const name = character.name;
        character.actions.forEach(action => {
            if (!action.icons) return;
            action.icons.forEach(icon => {
                const curX = action.x + icon.x;
                const curTime = Math.trunc(curX / X_SCALE);
                if (curTime >= erEstimator.rotationTime) return;
                const timelineArr = particleTimelineArr[curTime].filter(s => s.name == name);
                let timelineObj;
                if (timelineArr.length > 0) {
                    timelineObj = timelineArr[0];
                } else {
                    timelineObj = {
                        x: curX,
                        name: name,
                        elementalSkill: []
                    };
                    particleTimelineArr[curTime].push(timelineObj);
                }
                if (icon.code == 'E') {
                    timelineObj.elementalSkill.push(icon.type);
                }
            })
        })
    });

    for (let time = 0; time < particleTimelineArr.length; time++) {
        particleTimelineArr[time].sort((a, b) => a.x - b.x);
        if (particleTimelineArr[time].length == 0) {
            if (time > 0 && particleTimelineArr[time - 1].length > 0) {
                const copyObj = JSON.parse(JSON.stringify(particleTimelineArr[time - 1][particleTimelineArr[time - 1].length - 1]));
                copyObj.elementalSkill = [];
                particleTimelineArr[time].push(copyObj);
            }
        }
    }

    const evenlyParticleMap = new Map();

    // 元素スキルによる元素粒子
    particleTimelineArr.forEach(timelineArr => {
        timelineArr.forEach(timelineObj => {
            if (timelineObj.elementalSkill.length == 0) return;
            const myCharacterMaster = CharacterMasterMap.get(timelineObj.name);
            const myParticleMaster = ParticleMaster[timelineObj.name];
            const particleObj = {};
            particleObj[myCharacterMaster['元素']] = 0;
            timelineObj.elementalSkill.forEach(type => {
                let my生成数;
                let my生成間隔;
                let myクールタイム;
                let my継続時間;
                if (type) {
                    Object.keys(myParticleMaster).filter(s => s.startsWith(type)).forEach(key => {
                        if (key.endsWith('生成数')) {
                            my生成数 = myParticleMaster[key];
                        }
                        if (key.endsWith('生成間隔')) {
                            my生成間隔 = myParticleMaster[key];
                        }
                        if (key.endsWith('クールタイム')) {
                            myクールタイム = myParticleMaster[key];
                        }
                        if (key.endsWith('継続時間')) {
                            my継続時間 = myParticleMaster[key];
                        }
                    });
                }
                if (!my生成数) {
                    my生成数 = myParticleMaster['生成数'] ? myParticleMaster['生成数'] : 0;
                }
                if (!my生成間隔) {
                    my生成間隔 = myParticleMaster['生成間隔'];
                }
                if (!myクールタイム) {
                    myクールタイム = myParticleMaster['クールタイム'];
                }
                if (!my継続時間) {
                    my継続時間 = myParticleMaster['継続時間'] ? myParticleMaster['継続時間'] : 0;
                }

                if (my生成間隔) {
                    const evenlyParticleObj = {};
                    evenlyParticleObj[myCharacterMaster['元素']] = my生成数 / my生成間隔 * particleTimelineArr.length;
                    evenlyParticleMap.set(timelineObj.name, evenlyParticleObj);
                } else {
                    particleObj[myCharacterMaster['元素']] += my生成数;
                }
            });
            timelineObj.particles = particleObj;
        })
    });

    evenlyParticleMap.forEach((value, key) => {
        Object.keys(value).forEach(key2 => {
            evenlyParticleObj[key2] = value[key2];
        })
    });

    // 西風シリーズ 追い風が吹く
    erEstimator.list.forEach(character => {
        if (character.windfall) {
            let preWindfallTime = -100;
            for (let i = 0; i < particleTimelineArr.length; i++) {
                const timelineArr = particleTimelineArr[i];
                timelineArr.filter(s => s.name == character.name).forEach(timelineObj => {
                    if (i >= (preWindfallTime + 6)) {
                        preWindfallTime = i;
                        let particleObj = {};
                        if ('particles' in timelineObj) {
                            particleObj = timelineObj.particles;
                        } else {
                            timelineObj.particles = particleObj;
                        }
                        particleObj['無色'] = 3;
                    }
                })
            }
        }
    });

    const particleTimelineArr2 = [];
    for (let i = 0; i < particleTimelineArr.length; i++) {
        const timelineArr = particleTimelineArr[i];
        const timelineObj2 = {};
        timelineObj2.particle = {};
        timelineObj2.character = {};
        timelineArr.forEach(timelineObj => {
            if ('particles' in timelineObj) {
                Object.keys(timelineObj.particles).forEach(key => {
                    if (key in timelineObj2.particle) {
                        timelineObj2.particle[key] += timelineObj.particles[key];
                    } else {
                        timelineObj2.particle[key] = timelineObj.particles[key];
                    }
                });
                timelineObj2.character[timelineObj.name] = 1;
            }
        });
        if (Object.keys(timelineObj2.character).length > 0) {
            const name = Object.keys(timelineObj2.character)[0];
            if ((i + 1) < particleTimelineArr.length) {
                let otherNameArr = particleTimelineArr[i + 1].filter(s => s.name != name);
                if (otherNameArr.length > 0) {
                    timelineObj2.character[name] = 0;
                    timelineObj2.character[otherNameArr[0].name] = 1;
                } else if ((i + 2) < particleTimelineArr.length) {
                    let otherNameArr = particleTimelineArr[i + 2].filter(s => s.name != name);
                    if (otherNameArr.length > 0) {
                        timelineObj2.character[name] = 0.5;
                        timelineObj2.character[otherNameArr[0].name] = 0.5;
                    }
                }
            }
        }
        particleTimelineArr2.push(timelineObj2);
    }

    console.debug(particleTimelineArr);
    console.debug(particleTimelineArr2);
    console.debug(evenlyParticleObj);

    const characterEnergyMap = new Map();
    erEstimator.list.forEach(character => {
        characterEnergyMap.set(character.name, 0);
    });
    particleTimelineArr2.forEach(timelineObj => {
        Object.keys(timelineObj.particle).forEach(prop => {
            characterEnergyMap.forEach((value, key) => {
                const myCharacterMaster = CharacterMasterMap.get(key);
                let workEnergy = timelineObj.particle[prop];
                if (prop == myCharacterMaster['元素']) {
                    workEnergy *= 3;
                } else if (key == '無色') {
                    workEnergy *= 2;
                }
                if (key in timelineObj.character) {
                    workEnergy = (workEnergy * timelineObj.character[key]) + (workEnergy * 0.6 * (1 - timelineObj.character[key]));
                } else {
                    workEnergy *= 0.6;
                }
                characterEnergyMap.set(key, value + workEnergy);
            });
        });
    });
    for (let i = 0; i < erEstimator.list.length; i++) {
        const character = erEstimator.list[i];
        const myCharacterMaster = CharacterMasterMap.get(character.name);
        const timeOnFieldRatio = rotation4v.list[i].timeOnFieldRatio;
        let workEnergy;

        // 出場時間に応じて均等に割り振ります
        Object.keys(evenlyParticleObj).forEach(key => {
            workEnergy = evenlyParticleObj[key];
            if (key == myCharacterMaster['元素']) {
                workEnergy *= 3;
            } else if (key == '無色') {
                workEnergy *= 2;
            }
            workEnergy = (workEnergy * timeOnFieldRatio) + (workEnergy * 0.6 * (1 - timeOnFieldRatio));
            characterEnergyMap.set(character.name, characterEnergyMap.get(character.name) + workEnergy);
        });

        workEnergy = erEstimator.energyFromEnemy;
        workEnergy = (workEnergy * timeOnFieldRatio) + (workEnergy * 0.6 * (1 - timeOnFieldRatio));
        characterEnergyMap.set(character.name, characterEnergyMap.get(character.name) + workEnergy);
    }

    console.debug(characterEnergyMap);

    for (let i = 0; i < erEstimator.list.length; i++) {
        const character = erEstimator.list[i];
        const myCharacterMaster = CharacterMasterMap.get(character.name);
        const energyCost = myCharacterMaster['元素爆発']['元素エネルギー'] - character.correction;
        if (energyCost) {
            vm.$set(character, 'energyRecharge', Math.floor(energyCost / characterEnergyMap.get(character.name) * 100));
        }
    }

    console.debug(erEstimator);
}

var newData;
function buildNewDataArea() {
    newData = new Vue({
        el: '#data_',
        data: {
            isDisplay: true,
            isCalculatable: false,
            name: '',
            rotation: null,
            description: null,
            rotation4v: {
                width: 360,
                list: undefined
            },
            erEstimator: {
                rotationTime: DEFAULT_ROTATION_TIME,
                energyFromEnemy: DEFAULT_ROTATION_TIME,
                list: []
            }
        },
        methods: {
            rotationOnInput: function (event) {
                this.rotation = event.target.value;
                this.rotation4v = makeRotation4v(this.rotation);
                initErEstomator(this);
            },
            saveButtonOnClick: function () {
                if (this.name) {
                    this.name = String(this.name).trim();
                }
                if (this.rotation) {
                    this.rotation = String(this.rotation).trim();
                }
                const saveDataObj = saveData(this);
                if (saveDataObj) {
                    if (savedDataList.filter(s => s.name == saveDataObj.name).length == 0) {
                        savedDataList.push(saveDataObj);
                        saveDataObj.index = saveDataObj.sortOrder;
                        saveDataObj.rotation4v = makeRotation4v(saveDataObj['rotation']);
                        saveDataObj.isCompact = true;
                        saveDataObj.isEditable = false;
                        saveDataObj.isDeletable = false;
                        saveDataArea.list.push(saveDataObj);
                    } else {
                        savedDataList.filter(s => s.name == saveDataObj.name).forEach(dataObj => {
                            dataObj.rotation = saveDataObj.rotation;
                            dataObj.description = saveDataObj.description;
                        })
                    }
                }
            },
            erEstimatorOnChange: function () {
                estimateEnergyRecharge(this);
            }
        }
    })
}

var saveDataArea;
var savedDataList = [];
function buildSaveDataArea() {
    Object.keys(localStorage).filter(s => s.startsWith(SAVE_DATA_KEY_PREFIX)).forEach(key => {
        const dataObj = JSON.parse(localStorage[key]);
        savedDataList.push(dataObj);
    })
    savedDataList.sort((a, b) => a.sortOrder - b.sortOrder)

    let index = 0;
    const list = [];
    savedDataList.forEach(dataObj => {
        const parsedDataObj = JSON.parse(JSON.stringify(dataObj));
        parsedDataObj.index = index++;
        parsedDataObj.rotation = parsedDataObj['rotation'];
        parsedDataObj.rotation4v = makeRotation4v(parsedDataObj['rotation']);
        if (!('erEstimator' in parsedDataObj)) {
            parsedDataObj.erEstimator = {
                rotationTime: DEFAULT_ROTATION_TIME,
                energyFromEnemy: DEFAULT_ENERGY_BY_ENEMY,
                list: []
            };
        }
        if (!parsedDataObj.erEstimator.rotationTime) {
            parsedDataObj.erEstimator.rotationTime = DEFAULT_ROTATION_TIME;
        }
        if (!parsedDataObj.erEstimator.energyFromEnemy) {
            parsedDataObj.erEstimator.energyFromEnemy = DEFAULT_ENERGY_BY_ENEMY;
        }
        parsedDataObj.isCompact = true;
        parsedDataObj.isEditable = false;
        parsedDataObj.isDeletable = false;
        parsedDataObj.isCalculatable = false;
        list.push(parsedDataObj);
    });

    saveDataArea = new Vue({
        el: '#saveDataArea',
        data: {
            list: list
        },
        methods: {
            rotationOnInput: function (index, event) {
                this.list[index].rotation = event.target.value;
                this.list[index].rotation4v = makeRotation4v(this.list[index].rotation);
                initErEstomator(this, index);
            },
            cancelButtonOnClick: function (index, event) {
                const dataObj = savedDataList[index];
                this.list[index].name = dataObj.name;
                this.list[index].rotation = dataObj.rotation;
                this.list[index].rotation4v = makeRotation4v(dataObj['rotation']);
                this.list[index].isEditable = false;
            },
            saveButtonOnClick: function (index, event) {
                if (this.list[index].name) {
                    this.list[index].name = String(this.list[index].name).trim();
                }
                if (this.list[index].rotation) {
                    this.list[index].rotation = String(this.list[index].rotation).trim();
                }
                this.list[index].isEditable = false;
                const dataObj = JSON.parse(JSON.stringify(this.list[index]));
                saveData(dataObj, index);
                savedDataList[index] = dataObj;
            },
            removeButtonOnClick: function (index, event) {
                list.splice(index, 1);
                const dataObj = savedDataList[index];
                savedDataList.splice(index, 1);
                const key = SAVE_DATA_KEY_PREFIX + dataObj.name;
                localStorage.removeItem(key);
                console.log(key, 'deleted');
            },
            upButtonOnClick: function (index, event) {
                if (index <= 0) return;

                const item0 = list[index - 1];
                const item1 = list[index];
                item0.index = index;
                item1.index = index - 1;
                list.splice(index - 1, 2, item1, item0);

                const savedItem1 = savedDataList[index - 1];
                const savedItem2 = savedDataList[index];
                savedItem1.index = index;
                savedItem2.index = index - 1;
                savedDataList.splice(index - 1, 2, savedItem2, savedItem1);
                saveData(savedItem1);
                saveData(savedItem2);
            },
            downButtonOnClick: function (index, event) {
                if (index >= (list.length - 1)) return;

                const item1 = list[index];
                const item2 = list[index + 1];
                item1.index = index + 1;
                item2.index = index;
                list.splice(index, 2, item2, item1);

                const savedItem1 = savedDataList[index];
                const savedItem2 = savedDataList[index + 1];
                savedItem1.index = index + 1;
                savedItem2.index = index;
                savedDataList.splice(index, 2, savedItem2, savedItem1);
                saveData(savedItem1);
                saveData(savedItem2);
            },
            erEstimatorOnChange: function (index) {
                estimateEnergyRecharge(this, index);
            }
        }
    });

    for (let i = 0; i < saveDataArea.list.length; i++) {
        initErEstomator(saveDataArea, i);
    }
}

var sampleDataArea;
function buildSampleDataArea() {
    if (!RotationSample) return;

    let index = 0;
    const list = [];
    RotationSample.forEach(dataObj => {
        const parsedDataObj = JSON.parse(JSON.stringify(dataObj));
        parsedDataObj.index = index++;
        parsedDataObj.rotation = parsedDataObj['rotation'];
        parsedDataObj.rotation4v = makeRotation4v(parsedDataObj['rotation']);
        parsedDataObj.energyRecharge = [NaN, NaN, NaN, NaN];
        parsedDataObj.description = parsedDataObj.description.replace(new RegExp(/\n/g), '<br>');
        parsedDataObj.isCompact = true;
        parsedDataObj.isEditable = false;
        list.push(parsedDataObj);
    })

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
    result.set('旅人(雷)', ['雷旅人', '雷空', '雷蛍', 'TravelerElectro', 'AetherElectro', 'LumineElectro']);
    result.set('旅人(岩)', ['岩旅人', '岩空', '岩蛍', 'TravelerGeo', 'AetherGeo', 'LumineGeo']);
    result.set('旅人(風)', ['風旅人', '風空', '風蛍', 'TravelerAnemo', 'AetherAnemo', 'LumineAnemo']);
    return result;
}

var FileButtonArea;
function buildFileButton() {
    FileButtonArea = new Vue({
        el: '#file-button-area',
        methods: {
            savedDataDownloadOnClick: function () {
                let json = JSON.stringify(savedDataList, null, 2);
                let blob = new Blob(json.split(''), { type: 'application/json' });
                let aElem = document.createElement('a');
                aElem.href = URL.createObjectURL(blob);
                aElem.download = 'your-rotations.json';
                aElem.click();
            }
        }
    })
}

async function init() {
    const responses = await Promise.all([
        'data/CharacterMaster.json',
        'data/RotationMaster.json',
        'data/RotationSample.json',
        'data/ParticleMaster.json'
    ].map(url => fetch(url).then(resp => resp.json())));

    CharacterMaster = responses[0];
    RotationMaster = responses[1];
    RotationSample = responses[2];
    ParticleMaster = responses[3];

    CharacterNameMatchMap = createCharacterNameMatchMap();

    CharacterMasterMap = new Map();
    await Promise.all(Object.keys(CharacterMaster).map(key => fetch(CharacterMaster[key]['import'])
        .then(resp => resp.json()).then(json => {
            CharacterMasterMap.set(key, json)
        })));

    // NEW ROTATION
    buildNewDataArea();
    // YOUR ROTATIONS
    buildSaveDataArea();
    // SAMPLE ROTATIONS
    buildSampleDataArea();

    // DOWNLOAD and UPLOAD
    buildFileButton();

    // H2 TOGGLE-SWITCH
    document.querySelectorAll('h2.toggle-switch').forEach(s => s.addEventListener('click', function () {
        if (this.classList.contains('opened')) {
            this.classList.remove('opened');
        } else {
            this.classList.add('opened');
        }
    }))
}

const SAVE_DATA_KEY_PREFIX = 'genrota_';
const SAVE_DATA_TEMPLATE = {
    name: null,
    rotation: null,
    description: null,
    sortOrder: null,
};

function saveData(data, opt_index = null) {
    console.debug('saveData', '=>', data);
    if (!data.name || !data.rotation) return null;

    const savedKeys = Object.keys(localStorage).filter(s => s.startsWith(SAVE_DATA_KEY_PREFIX));

    let savedKey;
    if (opt_index != null) {
        savedKey = savedKeys.filter(s => JSON.parse(localStorage[s]).sortOrder == opt_index)[0];
    } else if (localStorage[SAVE_DATA_KEY_PREFIX + data.name]) {
        savedKey = SAVE_DATA_KEY_PREFIX + data.name;
    }
    let sortOrder;
    if (savedKey) {
        const savedDataObj = JSON.parse(localStorage[savedKey]);
        sortOrder = savedDataObj.sortOrder;
    } else {
        sortOrder = savedKeys.length;
    }

    const key = SAVE_DATA_KEY_PREFIX + data.name;
    const dataObj = {
        name: data.name,
        rotation: data.rotation,
        description: data.description,
        sortOrder: sortOrder
    }
    localStorage.setItem(key, JSON.stringify(dataObj));

    if (key != savedKey) {
        localStorage.removeItem(savedKey);
    }

    return dataObj;
}



