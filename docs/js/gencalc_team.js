// @ts-check

/// <reference path="./gencalc_core.js"/>
/// <reference path="./gencalc_var.js"/>

const チームInputObjMap = new Map();
const チームDamageDetailObjMap = new Map();
const チームChangeDetailObjMap = new Map();
const チームStatusObjMap = new Map();
const チームConditionMapMap = new Map();
const チームExclusionMapMap = new Map();


/**
 * 指定の条件が適用可能かチェックします Sub
 * {条件名}
 * {条件名}@{条件値}
 * {条件名}@{条件値:START}-{条件値:END} ←この形式の場合条件値で倍率がかかります
 * {条件名}@{条件値1},{条件値2},...     ←この形式の場合条件値で倍率がかかります
 * {上記}^{排他条件名}
 * 
 * @param {Object} inputObj 入力条件詳細
 * @param {string} conditionStr チェックしたい条件
 * @param {string []} validConditionValueArr 有効な条件値の配列
 * @returns {number} 0:アンマッチ/1以上:マッチ(=倍率)
 */
function checkConditionMatchesSubEx(inputObj, conditionStr, validConditionValueArr) {
    let myCondArr = conditionStr.split('@');
    if (myCondArr[0] == '命ノ星座') {
        if (myCondArr.length == 2) {
            const re = new RegExp('[^0-9]*([0-9\\.]+).*');
            let reRet = re.exec(myCondArr[1]);
            if (reRet) {
                let myConstellation = inputObj['命ノ星座'];
                if (Number(reRet[1]) <= Number(myConstellation)) {
                    return 1;
                }
            }
        }
        return 0;   // アンマッチ
    }
    if (validConditionValueArr.includes(conditionStr)) {
        if (myCondArr.length == 1 || (myCondArr[1].indexOf('-') == -1 && myCondArr[1].indexOf(',') == -1)) {
            return 1;   // マッチ 等倍
        }
    } else if (myCondArr.length == 1 || (myCondArr[1].indexOf('-') == -1 && myCondArr[1].indexOf(',') == -1)) {
        return 0;   // アンマッチ
    }
    const re = new RegExp('[^0-9]*([0-9\\.]+).*');    // 条件値={prefix}{倍率}{postfix}
    for (let i = 0; i < validConditionValueArr.length; i++) {
        if (validConditionValueArr[i].startsWith(myCondArr[0] + '@')) {
            let workArr = validConditionValueArr[i].split('@');
            let reRet = re.exec(workArr[1]);
            if (reRet) {
                return Number(reRet[1]);    // マッチ x倍
            }
            console.error(conditionStr, validConditionValueArr[i]);
        }
    }
    return 0;   // アンマッチ
}

/**
 * 指定の条件が適用可能かチェックします Sub
 * {条件名}
 * {条件名}@{条件値}
 * {条件名}@{条件値:START}-{条件値:END} ←この形式の場合条件値で倍率がかかります
 * {条件名}@{条件値1},{条件値2},...     ←この形式の場合条件値で倍率がかかります
 * {上記}^{排他条件名}
 * 
 * @param {Object} inputObj 入力条件詳細
 * @param {string} conditionStr チェックしたい条件
 * @param {string []} validConditionValueArr 有効な条件値の配列
 * @returns {number} 0:アンマッチ/1以上:マッチ(=倍率)
 */
const checkConditionMatchesEx = function (inputObj, conditionStr, validConditionValueArr) {
    let myCondStr = conditionStr.split('^')[0];

    if (myCondStr.indexOf('|') != -1) {  // |はOR条件です
        let myCondStrArr = myCondStr.split('|');
        for (let i = 0; i < myCondStrArr.length; i++) {
            let resultSub = checkConditionMatchesSubEx(inputObj, myCondStrArr[i], validConditionValueArr);
            if (resultSub == 1) {
                return 1;   // マッチ
            }
        }
        return 0;
    }

    let myCondStrArr = myCondStr.split('&');    // &はAND条件です
    let result = 1;
    for (let i = 0; i < myCondStrArr.length; i++) {
        let resultSub = checkConditionMatchesSubEx(inputObj, myCondStrArr[i], validConditionValueArr);
        if (resultSub == 0) {
            return 0;   // アンマッチ
        }
        if (resultSub != 1) {
            result = resultSub;
        }
    }
    return result;
}

/**
 * 
 * @param {Object} damageDetailObj 
 * @param {Object} changeDetailObj 
 * @param {Object} inputObj 入力条件詳細
 * @param {Object} characterMasterObj キャラクターマスター
 */
const setupDamageDetailDataCharacterEx = function (damageDetailObj, changeDetailObj, inputObj, characterMasterObj) {
    const my元素スキルレベル = inputObj['元素スキルレベル'];
    const my元素爆発レベル = inputObj['元素爆発レベル'];

    damageDetailObj['元素スキル'] = null;
    damageDetailObj['元素爆発'] = null;

    changeDetailObj['キャラクター'] = {
        ステータス: [],
        天賦性能: []
    };

    let my天賦レベル;
    let myデフォルト種類;
    let myデフォルト元素;
    let my天賦詳細Obj;

    // 元素スキルを解析します。Object
    my天賦レベル = my元素スキルレベル;
    myデフォルト種類 = '元素スキルダメージ';
    myデフォルト元素 = characterMasterObj['元素'];
    my天賦詳細Obj = characterMasterObj['元素スキル'];
    damageDetailObj['元素スキル'] = makeTalentDetailArray(
        my天賦詳細Obj,
        my天賦レベル,
        myデフォルト種類,
        myデフォルト元素,
        changeDetailObj['キャラクター']['ステータス'],
        changeDetailObj['キャラクター']['天賦性能'],
        'キャラクター');
    console.debug(characterMasterObj['名前'], '元素スキルダメージ詳細');
    console.debug(damageDetailObj['元素スキル']);

    // 元素爆発を解析します。Object
    my天賦レベル = my元素爆発レベル;
    myデフォルト種類 = '元素爆発ダメージ';
    myデフォルト元素 = characterMasterObj['元素'];
    my天賦詳細Obj = characterMasterObj['元素爆発'];
    damageDetailObj['元素爆発'] = makeTalentDetailArray(
        my天賦詳細Obj,
        my天賦レベル,
        myデフォルト種類,
        myデフォルト元素,
        changeDetailObj['キャラクター']['ステータス'],
        changeDetailObj['キャラクター']['天賦性能'],
        'キャラクター');
    console.debug(characterMasterObj['名前'], '元素爆発ダメージ詳細');
    console.debug(damageDetailObj['元素爆発']);

    // その他戦闘天賦を解析します。Array
    if ('その他戦闘天賦' in characterMasterObj) {
        characterMasterObj['その他戦闘天賦'].forEach(entry => {
            my天賦詳細Obj = entry;
            makeTalentDetailArray(
                my天賦詳細Obj,
                null,
                null,
                null,
                changeDetailObj['キャラクター']['ステータス'],
                changeDetailObj['キャラクター']['天賦性能'],
                'キャラクター');
        });
    }

    // 固有天賦を解析します。Array
    if ('固有天賦' in characterMasterObj) {
        characterMasterObj['固有天賦'].forEach(entry => {
            my天賦詳細Obj = entry;
            makeTalentDetailArray(
                my天賦詳細Obj,
                null,
                null,
                null,
                changeDetailObj['キャラクター']['ステータス'],
                changeDetailObj['キャラクター']['天賦性能'],
                'キャラクター');
        })
    };

    // 命ノ星座を解析します。Object
    if ('命ノ星座' in characterMasterObj) {
        for (let i = 1; i <= Number(inputObj['命ノ星座']); i++) {
            my天賦詳細Obj = characterMasterObj['命ノ星座'][i];
            makeTalentDetailArray(
                my天賦詳細Obj,
                null,
                null,
                null,
                changeDetailObj['キャラクター']['ステータス'],
                changeDetailObj['キャラクター']['天賦性能'],
                'キャラクター');
        }
    }

    console.debug(characterMasterObj['名前'], 'ステータス変更詳細');
    console.debug(changeDetailObj['キャラクター']['ステータス']);
    console.debug(characterMasterObj['名前'], '天賦性能変更詳細');
    console.debug(changeDetailObj['キャラクター']['天賦性能']);
}

/**
 * 武器データより
 * 
 * @param {Object} changeDetailObj 
 * @param {Object} inputObj 入力条件詳細
 * @param {Object} weaponMasterObj 武器マスター
 */
const setupDamageDetailDataWeaponEx = function (changeDetailObj, inputObj, weaponMasterObj) {
    const my精錬ランク = inputObj['精錬ランク'];

    changeDetailObj['武器'] = {
        ステータス: [],
        天賦性能: []
    };

    if ('武器スキル' in weaponMasterObj) {
        makeTalentDetailArray(
            weaponMasterObj['武器スキル'],
            my精錬ランク,
            null,
            null,
            changeDetailObj['武器']['ステータス'],
            changeDetailObj['武器']['天賦性能'],
            '武器');
    }

    console.debug(weaponMasterObj['名前'], 'ステータス変更詳細');
    console.debug(changeDetailObj['武器']['ステータス']);
}

/**
 * 聖遺物セットデータより
 * 
 * @param {Object} changeDetailObj 
 * @param {Object} inputObj 入力条件詳細
 */
const setupDamageDetailDataArtifactSetEx = function (changeDetailObj, inputObj) {
    changeDetailObj['聖遺物セット'] = {
        ステータス: [],
        天賦性能: []
    };

    let myセット効果Arr = [];

    let myセット = '2セット効果';
    myセット効果Arr.push(聖遺物セット効果MasterVar[inputObj['聖遺物セット効果1']][myセット]);
    if (inputObj['聖遺物セット効果1'] == inputObj['聖遺物セット効果2']) {
        myセット = '4セット効果';
    }
    myセット効果Arr.push(聖遺物セット効果MasterVar[inputObj['聖遺物セット効果2']][myセット]);

    myセット効果Arr.forEach(entry => {
        makeTalentDetailArray(entry,
            null,
            null,
            null,
            changeDetailObj['聖遺物セット']['ステータス'],
            changeDetailObj['聖遺物セット']['天賦性能'],
            '聖遺物セット');
    });

    console.debug(inputObj['聖遺物セット効果1'], inputObj['聖遺物セット効果2'], 'ステータス変更詳細');
    console.debug(changeDetailObj['聖遺物セット']['ステータス']);
}

/**
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {Object} characterMasterObj 
 * @param {string} kind 種類
 * @param {number | string | Array} formulaArr 計算式
 * @param {number | string | Array} opt_max 上限
 * @returns 
 */
function calculateStatusEx(statusObj, characterMasterObj, kind, formulaArr, opt_max = null) {
    let result = calculateFormulaArray(statusObj, formulaArr, opt_max);
    let statusName = kind;
    if (!$.isNumeric(result)) {
        console.error(statusObj, kind, formulaArr, result);
    }
    if (KIND_TO_PROPERTY_MAP.has(kind)) {
        statusName = KIND_TO_PROPERTY_MAP.get(kind);
    } else {
        switch (kind) {
            case '自元素ダメージバフ':
                statusName = characterMasterObj['元素'] + '元素ダメージバフ';
                break;
            case '全元素ダメージバフ':
                ['炎', '水', '風', '雷', '草', '氷', '岩'].forEach(entry => {
                    let statusName = entry + '元素ダメージバフ';
                    if (!(statusName in statusObj)) {
                        statusObj[statusName] = 0;
                    }
                    statusObj[statusName] += result;
                });
                return;
            case '敵自元素耐性':
                statusName = '敵' + characterMasterObj['元素'] + '元素耐性';
                break;
            case '敵全元素耐性':
                ['炎', '水', '風', '雷', '草', '氷', '岩'].forEach(entry => {
                    let statusName = '敵' + entry + '元素耐性';
                    if (!(statusName in statusObj)) {
                        statusObj[statusName] = 0;
                    }
                    statusObj[statusName] += result;
                });
                return;
            case '全元素耐性':
                ['炎', '水', '風', '雷', '草', '氷', '岩'].forEach(entry => {
                    let statusName = entry + '元素耐性';
                    if (!(statusName in statusObj)) {
                        statusObj[statusName] = 0;
                    }
                    statusObj[statusName] += result;
                });
                return;
        }
    }
    if (!(statusName in statusObj)) {
        statusObj[statusName] = 0;
    }
    statusObj[statusName] += Math.round(result * 10) / 10;
    console.debug(calculateStatusEx.name, null, kind, formulaArr, '=>', result);
}

/**
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {Object} inputObj 入力条件詳細
 * @param {Object} characterMasterObj 
 * @param {Object} weaponMasterObj 
 * @param {Object} changeDetailObj 
 */
function setupStatusEx(statusObj, inputObj, characterMasterObj, weaponMasterObj, changeDetailObj) {
    calculateStatusObjSub1(statusObj, inputObj, characterMasterObj, weaponMasterObj);

    const conditionMap = チームConditionMapMap.get(inputObj['saveName']);
    const validConditionValueArr = makeValidConditionValueArrFromInputObj(inputObj['オプション'], conditionMap);

    const myPriority1KindArr = ['元素チャージ効率'];    // 攻撃力の計算で参照するステータス 草薙の稲光

    let myPriority1KindFormulaArr = [];
    let myPriority2KindFormulaArr = [];
    let myKindFormulaArr = [];

    Object.keys(changeDetailObj).forEach(key => {
        if (!('ステータス' in changeDetailObj[key])) {
            return;
        }
        changeDetailObj[key]['ステータス'].forEach(detailObj => {
            if (detailObj['対象']) {
                return;
            }
            let myNew数値 = detailObj['数値'];
            if (detailObj['条件']) {
                let number = checkConditionMatchesEx(inputObj, detailObj['条件'], validConditionValueArr);
                if (number == 0) return;
                if (number != 1) {
                    myNew数値 = myNew数値.concat(['*', number]);
                }
            }
            if (myPriority1KindArr.includes(detailObj['種類'])) { // 攻撃力の計算で参照されるものを先に計上するため…
                myPriority1KindFormulaArr.push([detailObj['種類'], myNew数値, detailObj['上限']]);
            } else if (detailObj['種類'].endsWith('%')) {  // 乗算系(%付き)のステータスアップを先回しします HP 攻撃力 防御力しかないはず
                myPriority2KindFormulaArr.push([detailObj['種類'], myNew数値, detailObj['上限']]);
            } else {
                myKindFormulaArr.push([detailObj['種類'], myNew数値, detailObj['上限']]);
            }
        });
    });

    // 攻撃力の計算で参照されるステータスアップを先に計上します
    myPriority1KindFormulaArr.forEach(entry => {
        calculateStatusEx(statusObj, characterMasterObj, entry[0], entry[1], entry[2]);
    });

    // 乗算系のステータスアップを計上します HP% 攻撃力% 防御力%
    myPriority2KindFormulaArr.sort(compareFunction);
    myPriority2KindFormulaArr.forEach(entry => {
        calculateStatusEx(statusObj, characterMasterObj, entry[0], entry[1], entry[2]);
    });

    // HP上限 攻撃力 防御力を計算します
    // これより後に乗算系(%付き)のステータスアップがあると計算が狂います
    statusObj['HP上限'] += statusObj['基礎HP'];
    statusObj['HP上限'] += statusObj['基礎HP'] * (statusObj['HP乗算']) / 100;
    statusObj['HP上限'] = Math.floor(statusObj['HP上限']);  // 切り捨て

    statusObj['攻撃力'] += statusObj['基礎攻撃力'];
    statusObj['攻撃力'] += statusObj['基礎攻撃力'] * (statusObj['攻撃力乗算']) / 100;
    statusObj['攻撃力'] = Math.floor(statusObj['攻撃力']);  // 切り捨て

    statusObj['防御力'] += statusObj['基礎防御力'];
    statusObj['防御力'] += statusObj['基礎防御力'] * (statusObj['防御力乗算']) / 100;
    statusObj['防御力'] = Math.floor(statusObj['防御力']);  // 切り捨て

    // それ以外のステータスアップを計上します
    myKindFormulaArr.sort(compareFunction);
    myKindFormulaArr.forEach(entry => {
        calculateStatusEx(statusObj, characterMasterObj, entry[0], entry[1], entry[2]);
    });

    // 小数第1位で四捨五入します
    Object.keys(statusObj).forEach(key => {
        if ($.isNumeric(statusObj[key])) {
            statusObj[key] = Math.round(statusObj[key] * 10) / 10;
        }
    });
}

/**
 * ダメージを計算します
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {Object} inputObj 入力条件詳細
 * @param {Object} detailObj 天賦詳細
 * @param {Object} changeDetailObj オプション詳細
 * @param {string []} validConditionValueArr 有効な条件のリスト
 * @param {string} opt_element 元素
 * @returns {Array} ダメージ計算結果
 */
function calculateDamageFromDetailEx(statusObj, inputObj, detailObj, changeDetailObj, validConditionValueArr, opt_element = null) {
    console.debug(detailObj['種類'], detailObj['名前']);

    let myバフArr = [];
    let is会心Calc = true;
    let is防御補正Calc = true;
    let is耐性補正Calc = true;
    let my元素 = detailObj['元素'] != null ? detailObj['元素'] : opt_element != null ? opt_element : null;
    let my防御無視 = 0; // for 雷電将軍
    let my別枠乗算 = 0; // for 宵宮
    let myHIT数 = detailObj['HIT数'] != null ? Number(detailObj['HIT数']) : 1;
    let myステータス補正 = {};
    let my精度 = 0;

    // if (detailObj['除外条件']) {
    //     detailObj['除外条件'].forEach(condition => {
    //         if ($.isPlainObject(condition)) {
    //             let optionElem = document.getElementById(condition['名前'] + 'Option');
    //             if (!optionElem) return;
    //             if (validConditionValueArr.includes(condition['名前'])) {
    //                 ステータス条件取消(myステータス補正, condition['名前'], statusObj);
    //                 validConditionValueArr = validConditionValueArr.filter(p => p != condition);
    //             }
    //             if ('説明' in condition) {
    //                 if ($.isArray(condition['説明'])) {
    //                     condition['説明'].forEach(description => {
    //                         if (!statusObj['キャラクター注釈'].includes(description)) {
    //                             statusObj['キャラクター注釈'].push(description);
    //                         }
    //                     });
    //                 } else {
    //                     if (!statusObj['キャラクター注釈'].includes(condition['説明'])) {
    //                         statusObj['キャラクター注釈'].push(condition['説明']);
    //                     }
    //                 }
    //             }
    //         } else if (validConditionValueArr.includes(condition)) {
    //             ステータス条件取消(myステータス補正, condition, statusObj);
    //             validConditionValueArr = validConditionValueArr.filter(p => p != condition);
    //         }
    //     });
    // }

    // if (detailObj['適用条件']) {
    //     detailObj['適用条件'].forEach(condition => {
    //         if ($.isPlainObject(condition)) {
    //             let optionElem = document.getElementById(condition['名前'] + 'Option');
    //             if (!optionElem) return;
    //             if (condition['種類']) {
    //                 switch (condition['種類']) {
    //                     case 'selectedIndex':   // for 甘雨+アモスの弓
    //                         if (!(optionElem instanceof HTMLSelectElement)) return;
    //                         let curSelectedIndex = optionElem.selectedIndex;
    //                         let curSelectedValue = optionElem.children[curSelectedIndex].textContent;
    //                         let newSelectedIndex;
    //                         let newSelectedValue;
    //                         const re = new RegExp('([\\+\\-]?)(\\d+)');
    //                         let reRet = re.exec(String(condition['数値']));
    //                         if (reRet) {
    //                             if (reRet[1]) {
    //                                 if (reRet[1] == '+') {  // 加算
    //                                     newSelectedIndex = Math.min(curSelectedIndex + Number(reRet[2]), optionElem.children.length - 1);
    //                                 } else {    // 減算
    //                                     newSelectedIndex = Math.min(curSelectedIndex - Number(reRet[2]), 0);
    //                                 }
    //                             } else {    // 直値
    //                                 newSelectedIndex = Number(reRet[2]);
    //                             }
    //                             newSelectedValue = optionElem.children[newSelectedIndex].textContent;
    //                             if (curSelectedIndex > 0) {
    //                                 let curCondition = condition['名前'] + '@' + curSelectedValue;
    //                                 if (validConditionValueArr.includes(curCondition)) {
    //                                     validConditionValueArr = validConditionValueArr.filter(p => p != curCondition);
    //                                 }
    //                                 ステータス変更系詳細ArrMapVar.forEach((value, key) => {
    //                                     value.forEach(valueObj => {
    //                                         if (!valueObj['条件']) return;
    //                                         if (valueObj['対象']) return;   // 暫定
    //                                         let number = checkConditionMatches(valueObj['条件'], [curCondition]);
    //                                         if (number == 0) return;
    //                                         let myNew数値 = valueObj['数値'];
    //                                         if (number != 1) {
    //                                             myNew数値 = myNew数値.concat(['*', number]);
    //                                         }
    //                                         let workObj = JSON.parse(JSON.stringify(statusObj));    //　力技
    //                                         calculateStatus(workObj, valueObj['種類'], myNew数値, valueObj['上限']);
    //                                         Object.keys(workObj).forEach(statusName => {
    //                                             if (!$.isNumeric(workObj[statusName]) || workObj[statusName] == statusObj[statusName]) return;
    //                                             if (!(statusName in myステータス補正)) {
    //                                                 myステータス補正[statusName] = 0;
    //                                             }
    //                                             myステータス補正[statusName] -= workObj[statusName] - statusObj[statusName];
    //                                         });
    //                                     });
    //                                 });
    //                             }
    //                             let newCondition = condition['名前'] + '@' + newSelectedValue;
    //                             validConditionValueArr.push(newCondition);
    //                             ステータス変更系詳細ArrMapVar.forEach((value, key) => {
    //                                 value.forEach(valueObj => {
    //                                     if (!valueObj['条件']) return;
    //                                     if (valueObj['対象']) return;   // 暫定
    //                                     let number = checkConditionMatches(valueObj['条件'], [newCondition]);
    //                                     if (number == 0) return;
    //                                     let myNew数値 = valueObj['数値'];
    //                                     if (number != 1) {
    //                                         myNew数値 = myNew数値.concat(['*', number]);
    //                                     }
    //                                     let workObj = JSON.parse(JSON.stringify(statusObj));    //　力技
    //                                     calculateStatus(workObj, valueObj['種類'], myNew数値, valueObj['上限']);
    //                                     Object.keys(workObj).forEach(statusName => {
    //                                         if (!$.isNumeric(workObj[statusName]) || workObj[statusName] == statusObj[statusName]) return;
    //                                         if (!(statusName in myステータス補正)) {
    //                                             myステータス補正[statusName] = 0;
    //                                         }
    //                                         myステータス補正[statusName] += workObj[statusName] - statusObj[statusName];
    //                                     });
    //                                 });
    //                             });
    //                         } else {
    //                             console.error(detailObj, opt_element, null, condition);
    //                         }
    //                         break;
    //                     default:
    //                 }
    //             } else {
    //                 if (!validConditionValueArr.includes(condition)) {
    //                     ステータス条件追加(myステータス補正, condition, statusObj);
    //                     validConditionValueArr.push(condition);
    //                 }
    //             }
    //             if ('説明' in condition) {
    //                 if ($.isArray(condition['説明'])) {
    //                     condition['説明'].forEach(description => {
    //                         if (!statusObj['キャラクター注釈'].includes(description)) {
    //                             statusObj['キャラクター注釈'].push(description);
    //                         }
    //                     });
    //                 } else {
    //                     if (!statusObj['キャラクター注釈'].includes(condition['説明'])) {
    //                         statusObj['キャラクター注釈'].push(condition['説明']);
    //                     }
    //                 }
    //             }
    //         } else if (!validConditionValueArr.includes(condition)) {
    //             ステータス条件追加(myステータス補正, condition, statusObj);
    //             validConditionValueArr.push(condition);
    //         }
    //     });
    // }

    let my天賦性能変更詳細Arr = [];
    let myステータス変更系詳細Arr = [];

    // 対象指定ありのダメージ計算（主に加算）を適用したい
    Object.keys(changeDetailObj).forEach(key => {
        if (!('天賦性能' in changeDetailObj[key])) {
            return;
        }
        changeDetailObj[key]['天賦性能'].forEach(entry => {
            let number = null;
            if (entry['条件']) {
                number = checkConditionMatchesEx(inputObj, entry['条件'], validConditionValueArr);
                if (number == 0) {
                    return;
                }
            }
            if (entry['対象']) {
                if (entry['対象'].endsWith('元素ダメージ')) {    // for 申鶴
                    if (!entry['対象'].startsWith(my元素)) {
                        return;
                    }
                } else if (entry['対象'] == '物理ダメージ') {
                    if (my元素 != '物理') {
                        return;
                    }
                } else {
                    // 大分類 or 大分類.小分類
                    let my対象カテゴリArr = entry['対象'].split('.');
                    if (my対象カテゴリArr[0] != detailObj['種類']) {
                        return;
                    } if (my対象カテゴリArr.length > 1 && my対象カテゴリArr[my対象カテゴリArr.length - 1] != detailObj['名前']) {
                        return;
                    }
                }
            }
            if (entry['種類'].endsWith('元素付与')) {   // 元素付与は先んじて適用します
                if (!detailObj['元素付与無効'] && detailObj['種類'] != '追加ダメージ') {
                    my元素 = entry['種類'].replace('元素付与', '');
                }
            } else if (entry['種類'] == '防御無視') {   // 防御無視は先んじて適用します for 雷電将軍
                let myValue = calculateFormulaArray(statusObj, entry['数値'], entry['上限']);
                my防御無視 += myValue;
            } else if (entry['種類'] == '固有変数') {
                // nop
            } else {
                if (number != null && number != 1) {    // オプションの@以降の数値でスケールする場合あり
                    let myNewValueObj = JSON.parse(JSON.stringify(entry)); // deepcopy
                    myNewValueObj['数値'] = myNewValueObj['数値'].concat(['*', number]);
                    my天賦性能変更詳細Arr.push(myNewValueObj);
                } else {
                    my天賦性能変更詳細Arr.push(entry);
                }
            }
        });
    });
    console.debug(detailObj['名前'] + ':my天賦性能変更詳細Arr');
    console.debug(my天賦性能変更詳細Arr);

    // 対象指定ありのステータスアップを適用したい
    Object.keys(changeDetailObj).forEach(key => {
        if (!('ステータス' in changeDetailObj[key])) {
            return;
        }
        changeDetailObj[key]['ステータス'].forEach(entry => {
            if (!entry['対象']) {
                return; // 対象指定なしのものは適用済みのためスキップします
            }
            if (entry['対象'].endsWith('元素ダメージ')) {   // for 九条裟羅
                if (!entry['対象'].startsWith(my元素)) {
                    return;
                }
            } else {
                let my対象カテゴリArr = entry['対象'].split('.');
                let my種類 = detailObj['種類'];
                if (detailObj['ダメージバフ']) {
                    if (DAMAGE_CATEGORY_ARRAY.includes(detailObj['ダメージバフ'].replace('バフ', ''))) {
                        my種類 = detailObj['ダメージバフ'].replace('バフ', '');
                    }
                }
                if (my対象カテゴリArr[0] != my種類) {
                    return;
                }
                if (my対象カテゴリArr.length > 1 && my対象カテゴリArr[my対象カテゴリArr.length - 1] != detailObj['名前']) {
                    return;
                }
            }
            let myNewValue = entry;
            let number = null;
            if (entry['条件']) {
                number = checkConditionMatchesEx(inputObj, entry['条件'], validConditionValueArr);
                if (number == 0) {
                    return;
                }
                if (number != null && number != 1) {    // オプションの@以降の数値でスケールする場合あり
                    let myNew数値 = entry['数値'].concat(['*', number]);
                    myNewValue = JSON.parse(JSON.stringify(entry)); // deepcopy
                    myNewValue['数値'] = myNew数値;
                }
            }
            myステータス変更系詳細Arr.push(myNewValue);
        });
    });
    console.debug(detailObj['名前'] + ':myステータス変更系詳細Arr');
    console.debug(myステータス変更系詳細Arr);

    myステータス変更系詳細Arr.forEach(entry => {
        if (!entry['数値']) return;
        let myValue = calculateFormulaArray(statusObj, entry['数値'], entry['上限']);
        if (entry['種類'] in statusObj) {
            if (entry['種類'] in myステータス補正) {
                myステータス補正[entry['種類']] += myValue;
            } else {
                myステータス補正[entry['種類']] = myValue;
            }
        } else {
            switch (entry['種類']) {
                case '別枠乗算':    // for 宵宮
                    if (my別枠乗算 > 0) {
                        my別枠乗算 *= myValue / 100;    // for ディオナ
                    } else {
                        my別枠乗算 = myValue;
                    }
                    break;
                default:
                    console.error(detailObj, opt_element, null, entry['種類'], myValue);
                    break;
            }
        }
    });

    // 一時的にステータスを書き換えます。
    Object.keys(myステータス補正).forEach(statusName => {
        statusObj[statusName] += myステータス補正[statusName];
        console.debug('ステータス補正', statusName, myステータス補正[statusName]);
    });

    let my計算Result;
    switch (detailObj['種類']) {
        case 'HP回復':
            myバフArr.push('与える治療効果');
            myバフArr.push('受ける治療効果');
            is会心Calc = false;
            is防御補正Calc = false;
            is耐性補正Calc = false;
            my元素 = null;
            break;
        case 'シールド':
            myバフArr.push('シールド強化');
            is会心Calc = false;
            is防御補正Calc = false;
            is耐性補正Calc = false;
            break;
        case '元素創造物HP':    // for アンバー 甘雨
            is会心Calc = false;
            is防御補正Calc = false;
            is耐性補正Calc = false;
            my元素 = null;
            break;
        case '他所基準ダメージ':
            is防御補正Calc = false;
            is耐性補正Calc = false;
            break;
        case '他所基準HP回復':
            is会心Calc = false;
            is防御補正Calc = false;
            is耐性補正Calc = false;
            my元素 = null;
            break;
        case '付加元素ダメージ':    // for 風キャラ
            my元素 = '炎';
        default:
            if (detailObj['種類'].startsWith('表示') || detailObj['種類'].startsWith('非表示')) {
                is会心Calc = false;
                is防御補正Calc = false;
                is耐性補正Calc = false;
                my元素 = null;
                let 種類SplitArr = detailObj['種類'].split('_');
                if (種類SplitArr.length > 1) {
                    my精度 = Number(種類SplitArr[1]);
                }
            } else {
                myバフArr.push('与えるダメージ');
                if (detailObj['ダメージバフ'] != null) {
                    myバフArr.push(detailObj['ダメージバフ']);
                } else if (DAMAGE_CATEGORY_ARRAY.includes(detailObj['種類'])) {
                    myバフArr.push(detailObj['種類'] + 'バフ');
                }
                if (my元素 != null) {
                    myバフArr.push(my元素 == '物理' ? '物理ダメージバフ' : my元素 + '元素ダメージバフ');
                }
            }
            break;
    }
    my計算Result = calculateDamageFromDetailSub(
        statusObj,
        detailObj['数値'],
        myバフArr,
        is会心Calc,
        is防御補正Calc,
        is耐性補正Calc,
        my元素,
        my防御無視,
        my別枠乗算);
    console.debug(my計算Result);

    my天賦性能変更詳細Arr.forEach(valueObj => {
        let myResultWork = calculateDamageFromDetailSub(statusObj,
            valueObj['数値'],
            myバフArr,
            is会心Calc,
            is防御補正Calc,
            is耐性補正Calc,
            my元素,
            my防御無視,
            my別枠乗算);
        if (valueObj['種類'].endsWith('ダメージアップ')) {
            if (detailObj['名前'] == 'ダメージアップ') {    // for 申鶴
                return;
            }
            if (DAMAGE_CATEGORY_ARRAY.includes(detailObj['種類'])) {
                // 複数回HITするダメージについては、HIT数を乗算します
                if (myHIT数 > 1) {
                    myResultWork[1] *= myHIT数;
                    if (myResultWork[2] != null) {
                        myResultWork[2] *= myHIT数;
                    }
                    if (myResultWork[3] != null) {
                        myResultWork[3] *= myHIT数;
                    }
                }
            }
        }
        my計算Result[1] += myResultWork[1];
        if (my計算Result[2] != null) {
            my計算Result[2] += myResultWork[2];
        }
        if (my計算Result[3] != null) {
            my計算Result[3] += myResultWork[3];
        }
    });

    if (statusObj[detailObj['種類'] + 'アップ'] > 0) {
        if (DAMAGE_CATEGORY_ARRAY.includes(detailObj['種類'])) {
            let myResultWork = calculateDamageFromDetailSub(
                statusObj,
                statusObj[detailObj['種類'] + 'アップ'],
                myバフArr,
                is会心Calc,
                is防御補正Calc,
                is耐性補正Calc,
                my元素,
                my防御無視,
                0);
            // 複数回HITするダメージについては、HIT数を乗算します
            if (myHIT数 > 1) {
                myResultWork[1] *= myHIT数;
                if (myResultWork[2] != null) {
                    myResultWork[2] *= myHIT数;
                }
                if (myResultWork[3] != null) {
                    myResultWork[3] *= myHIT数;
                }
            }
            my計算Result[1] += myResultWork[1];
            if (my計算Result[2] != null) {
                my計算Result[2] += myResultWork[2];
            }
            if (my計算Result[3] != null) {
                my計算Result[3] += myResultWork[3];
            }
        }
    }
    if (my元素 + '元素ダメージアップ' in statusObj && statusObj[my元素 + '元素ダメージアップ'] > 0) {
        if (is防御補正Calc && is耐性補正Calc) {
            let myResultWork = calculateDamageFromDetailSub(
                statusObj,
                statusObj[my元素 + '元素ダメージアップ'],
                myバフArr,
                is会心Calc,
                is防御補正Calc,
                is耐性補正Calc,
                my元素,
                my防御無視,
                0);
            // 複数回HITするダメージについては、HIT数を乗算します
            if (myHIT数 > 1) {
                myResultWork[1] *= myHIT数;
                if (myResultWork[2] != null) {
                    myResultWork[2] *= myHIT数;
                }
                if (myResultWork[3] != null) {
                    myResultWork[3] *= myHIT数;
                }
            }
            my計算Result[1] += myResultWork[1];
            if (my計算Result[2] != null) {
                my計算Result[2] += myResultWork[2];
            }
            if (my計算Result[3] != null) {
                my計算Result[3] += myResultWork[3];
            }
        }
    }

    // 書き換えたステータスを元に戻します。
    Object.keys(myステータス補正).forEach(statusName => {
        statusObj[statusName] -= myステータス補正[statusName];
    });

    let my計算Result_蒸発 = [null, null, null];
    let my計算Result_溶解 = [null, null, null];
    if (detailObj['種類'] == 'シールド') {
        if (my計算Result[0] == '岩') {  // 岩元素シールド for ノエル 鍾離
            my計算Result[1] = my計算Result[1] * 1.5;
            my計算Result[3] = my計算Result[3] * 1.5;
        }
    } else if (my計算Result[0]) {
        let my元素熟知 = statusObj['元素熟知'];
        let my蒸発倍率 = calculate蒸発倍率(statusObj, my計算Result[0], my元素熟知);
        if (my蒸発倍率 > 0) {
            my計算Result_蒸発[0] = my計算Result[1] * my蒸発倍率;
            if (my計算Result[2] != null) {
                my計算Result_蒸発[1] = my計算Result[2] * my蒸発倍率;
            }
            if (my計算Result[3] != null) {
                my計算Result_蒸発[2] = my計算Result[3] * my蒸発倍率;
            }
        }
        let my溶解倍率 = calculate溶解倍率(statusObj, my計算Result[0], my元素熟知);
        if (my溶解倍率 > 0) {
            my計算Result_溶解[0] = my計算Result[1] * my溶解倍率;
            if (my計算Result[2] != null) {
                my計算Result_溶解[1] = my計算Result[2] * my溶解倍率;
            }
            if (my計算Result[3] != null) {
                my計算Result_溶解[2] = my計算Result[3] * my溶解倍率;
            }
        }
    }

    let resultArr = [detailObj['名前'], my計算Result[0], my計算Result[1], my計算Result[2], my計算Result[3]];
    resultArr.push(my計算Result_蒸発[0]);
    resultArr.push(my計算Result_蒸発[1]);
    resultArr.push(my計算Result_蒸発[2]);
    resultArr.push(my計算Result_溶解[0]);
    resultArr.push(my計算Result_溶解[1]);
    resultArr.push(my計算Result_溶解[2]);

    for (let i = 2; i < resultArr.length; i++) {
        if (resultArr[i] && $.isNumeric(resultArr[i])) {
            if (my精度) {
                resultArr[i] = Number(resultArr[i].toFixed(my精度));
            } else {
                resultArr[i] = Number(resultArr[i].toFixed(0));
            }
        }
    }

    return resultArr;
}

/**
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {Object} inputObj 入力条件詳細
 * @param {Object} damageDetailObj 
 * @param {Object} changeDetailObj 
 */
function setupDamageResultEx(statusObj, inputObj, damageDetailObj, changeDetailObj) {
    statusObj['ダメージ計算'] = {};
    statusObj['ダメージ計算']['元素スキル'] = [];
    statusObj['ダメージ計算']['元素爆発'] = [];

    const conditionMap = チームConditionMapMap.get(inputObj['saveName']);
    const validConditionValueArr = makeValidConditionValueArrFromInputObj(inputObj['オプション'], conditionMap);

    damageDetailObj['元素スキル'].forEach(detailObj => {
        if (detailObj['条件']) {
            if (checkConditionMatchesEx(inputObj, detailObj['条件'], validConditionValueArr) == 0) {
                return;
            }
        }
        statusObj['ダメージ計算']['元素スキル'].push(calculateDamageFromDetailEx(statusObj, inputObj, detailObj, changeDetailObj, validConditionValueArr, null));
    });

    damageDetailObj['元素爆発'].forEach(detailObj => {
        if (detailObj['条件']) {
            if (checkConditionMatchesEx(inputObj, detailObj['条件'], validConditionValueArr) == 0) {
                return;
            }
        }
        statusObj['ダメージ計算']['元素爆発'].push(calculateDamageFromDetailEx(statusObj, inputObj, detailObj, changeDetailObj, validConditionValueArr, null));
    });
}

/**
 * 
 * @param {string} saveName 
 * @returns {Promise<Object>}
 */
async function makeTeamStatusObjEx(saveName) {
    const savedObj = JSON.parse(localStorage[saveName]);
    if (!savedObj) {
        console.error(saveName);
        return {};
    }

    const inputObj = {
        オプション: {}
    };
    Object.keys(savedObj).forEach(key => {
        if (キャラクター構成PROPERTY_MAP.has(key)) {
            inputObj[key] = キャラクター構成PROPERTY_MAP.get(key) == null ? savedObj[key] : Number(savedObj[key]);
        } else {
            inputObj['オプション'][key] = savedObj[key];
        }
    });
    inputObj['saveName'] = saveName;

    const myキャラクター = inputObj['キャラクター'];
    const my武器 = inputObj['武器'];

    if (!(myキャラクター in キャラクターリストMasterVar)) {
        console.error(saveName);
        return {};
    }
    if (!(my武器 in 武器リストMasterVar[キャラクターリストMasterVar[myキャラクター]['武器']])) {
        console.error(saveName);
        return {};
    }

    const responses = await Promise.all([
        キャラクターリストMasterVar[myキャラクター]['import'],
        武器リストMasterVar[キャラクターリストMasterVar[myキャラクター]['武器']][my武器]['import']
    ].map(url => fetch(url).then(resp => resp.json())));

    const characterMasterObj = responses[0];
    const weaponMasterObj = responses[1];

    console.debug(characterMasterObj['名前'], weaponMasterObj['名前']);

    キャラクターMasterMap.set(characterMasterObj['名前'], characterMasterObj);
    武器MasterMap.set(weaponMasterObj['名前'], weaponMasterObj);

    let damageDetailObj = {};
    let changeDetailObj = {};

    setupDamageDetailDataCharacterEx(damageDetailObj, changeDetailObj, inputObj, characterMasterObj);
    setupDamageDetailDataWeaponEx(changeDetailObj, inputObj, weaponMasterObj);
    setupDamageDetailDataArtifactSetEx(changeDetailObj, inputObj);

    let conditionMap = new Map();
    let exclusionMap = new Map();

    Object.keys(changeDetailObj).forEach(key1 => {
        Object.keys(changeDetailObj[key1]).forEach(key2 => {
            changeDetailObj[key1][key2].forEach(detailObj => {
                if (detailObj['条件']) {
                    makeConditionExclusionMapFromStr(detailObj['条件'], conditionMap, exclusionMap);
                }
            });
        });
    });

    チームConditionMapMap.set(saveName, conditionMap);
    チームExclusionMapMap.set(saveName, exclusionMap);

    let statusObj = JSON.parse(JSON.stringify(ステータス詳細ObjTemplate));

    statusObj['レベル'] = Number(inputObj['レベル'].replace('+', ''));

    setupStatusEx(statusObj, inputObj, characterMasterObj, weaponMasterObj, changeDetailObj);

    if (選択中キャラクターデータVar) {
        if (['雷電将軍'].includes(inputObj['キャラクター'])) {
            if ('元素エネルギー'in 選択中キャラクターデータVar['元素爆発']) {
                statusObj['元素エネルギー'] = 選択中キャラクターデータVar['元素爆発']['元素エネルギー'];
            }
        }
    }

    console.debug(statusObj);

    setupDamageResultEx(statusObj, inputObj, damageDetailObj, changeDetailObj);

    console.debug(statusObj['ダメージ計算']);

    チームInputObjMap.set(saveName, inputObj);
    チームDamageDetailObjMap.set(saveName, damageDetailObj);
    チームChangeDetailObjMap.set(saveName, changeDetailObj);
    チームStatusObjMap.set(saveName, statusObj);

    return statusObj;
}
