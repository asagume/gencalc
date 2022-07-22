function isString(value) {
    return typeof value === 'string' || value instanceof String;
}

/**
 * 計算式を計算します
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {number | string | Array} formulaArr 計算式
 * @param {number | string | Array} opt_max 上限
 * @returns {number} 計算結果
 */
const calculateFormulaArray = function (statusObj, formulaArr, opt_max = null) {
    let result = 0;
    if (!Array.isArray(formulaArr)) {
        if (!isNaN(formulaArr)) {
            result = Number(formulaArr);
        } else {
            if (formulaArr in statusObj) {
                result = statusObj[formulaArr];
            } else {
                console.error(statusObj, formulaArr, opt_max);
            }
        }
    } else {
        let operator = null;
        formulaArr.forEach(entry => {
            let subResult = 0;
            if (['+', '-', '*', '/'].includes(entry)) {
                operator = entry;
                return;
            } else if (!isNaN(entry)) {
                subResult = Number(entry);
            } else if (Array.isArray(entry)) {
                subResult = calculateFormulaArray(statusObj, entry);
            } else {
                if (entry in statusObj) {
                    subResult = Number(statusObj[entry]);
                } else if (entry.indexOf('#') != -1) {
                    let nameArr = entry.split('#');
                    if ('ダメージ計算' in statusObj && nameArr[0] in statusObj['ダメージ計算']) {
                        let damageArrArr = statusObj['ダメージ計算'][nameArr[0]];
                        let damage = null;
                        for (let damageArr of damageArrArr) {
                            if (nameArr[1] == damageArr[0]) {
                                damage = damageArr[4];  // 非会心
                                break;
                            }
                        }
                        if (damage != null) {
                            subResult = damage;
                        } else {
                            console.error(statusObj, formulaArr, opt_max, entry);
                        }
                    }
                } else {
                    console.error(statusObj, formulaArr, opt_max);
                }
            }
            if (operator == null) {
                result += subResult;
            } else {
                switch (operator) {
                    case '+':
                        result += subResult;
                        break;
                    case '-':
                        result -= subResult;
                        break;
                    case '*':
                        result *= subResult;
                        result = Math.floor(result * 100) / 100;
                        break;
                    case '/':
                        result /= subResult;
                        break;
                }
            }
        });
    }
    if (opt_max != null) {
        let maxValue = calculateFormulaArray(statusObj, opt_max);
        if (result > maxValue) {
            result = maxValue;
        }
    }
    //    result = Math.floor(result * 100) / 100;
    return result;
}

/**
 * 文字列を解析して、計算式Arrayを作成します Sub
 * 数値|数値%|数値%文字列|文字列
 * 
 * @param {string} str 計算式文字列
 * @param {string} defaultItem デフォルト種類
 * @returns {Array} 計算式
 */
function analyzeFormulaStrSub(str, defaultItem = null) {
    let resultArr = [];
    if (!isNaN(str)) {
        resultArr.push(Number(str));
    } else {
        let strArr = str.split('%');
        if (strArr.length == 1) {
            resultArr.push(strArr[0]);
        } else {
            resultArr.push(Number(strArr[0]) / 100);
            resultArr.push('*');
            if (strArr[1].length > 0) {
                resultArr.push(strArr[1]);
            } else if (defaultItem != null) {
                resultArr.push(defaultItem);
            }
        }
    }
    return resultArr;
}

/**
 * 文字列を解析して、計算式Arrayを作成します
 * 数値|数値%|数値%文字列|文字列
 * 
 * @param {string} str 計算式文字列
 * @param {string} defaultItem デフォルト種類
 * @returns {Array} 計算式
 */
const analyzeFormulaStr = function (str, defaultItem = null) {
    let resultArr = [];
    let re = new RegExp('([\\+\\-\\*/]?)([^\\+\\-\\*/]+)(.*)');
    let workStr = str;
    while (true) {
        let reRet = re.exec(workStr);
        if (!reRet) {
            resultArr.push(workStr);
            break;
        }
        if (reRet[1]) { // + - * /
            resultArr.push(reRet[1]);
        }
        resultArr.push(analyzeFormulaStrSub(reRet[2], defaultItem));
        if (!reRet[3]) {
            break;
        }
        workStr = reRet[3];
    }
    return resultArr;
}

/**
 * Twitterに投稿します
 * 
 * @param {string} text ツイートの本文
 * @param {string} url URLのシェア
 * @param {string} opt_hashtags ハッシュタグ
 * @param {string} opt_via アカウント関連付け @viaさんから
 */
function openTwitter(text, url, opt_hashtags = null, opt_via = null) {
    const baseUrl = 'https://twitter.com/intent/tweet?';
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('url', url);
    if (opt_hashtags) {
        params.append('hashtags', opt_hashtags);
    }
    if (opt_via) {
        params.append('via', opt_via);
    }
    const query = params.toString();
    const shareUrl = `${baseUrl}${query}`;
    console.log(params);
    console.log(shareUrl);
    window.open(shareUrl);
}

/**
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {Object} detailObj 
 * @param {string} opt_element 元素
 * @returns {Array}
 */
 function calculateDamageFromDetail(statusObj, detailObj, opt_element = null) {
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

    let validConditionValueArr = makeValidConditionValueArr('#オプションBox');  // 有効な条件

    if (detailObj['除外条件']) {
        detailObj['除外条件'].forEach(condition => {
            if ($.isPlainObject(condition)) {
                let optionElem = document.getElementById(condition['名前'] + 'Option');
                if (!optionElem) return;
                const number = checkConditionMatches(condition['名前'], validConditionValueArr);
                if (number > 0) {
                    ステータス条件取消(myステータス補正, condition['名前'], statusObj, validConditionValueArr);
                    validConditionValueArr = validConditionValueArr.filter(p => p != condition && !p.startsWith(condition + '@'));
                }
                if ('説明' in condition) {
                    if ($.isArray(condition['説明'])) {
                        condition['説明'].forEach(description => {
                            if (!statusObj['キャラクター注釈'].includes(description)) {
                                statusObj['キャラクター注釈'].push(description);
                            }
                        });
                    } else {
                        if (!statusObj['キャラクター注釈'].includes(condition['説明'])) {
                            statusObj['キャラクター注釈'].push(condition['説明']);
                        }
                    }
                }
            } else if (validConditionValueArr.includes(condition)) {
                ステータス条件取消(myステータス補正, condition, statusObj, validConditionValueArr);
                validConditionValueArr = validConditionValueArr.filter(p => p != condition && !p.startsWith(condition + '@'));
            }
        });
    }

    if (detailObj['適用条件']) {
        detailObj['適用条件'].forEach(condition => {
            if ($.isPlainObject(condition)) {
                let optionElem = document.getElementById(condition['名前'] + 'Option');
                if (!optionElem) return;
                if (condition['種類']) {
                    switch (condition['種類']) {
                        case 'selectedIndex':   // for 甘雨+アモスの弓
                            if (!(optionElem instanceof HTMLSelectElement)) return;
                            let curSelectedIndex = optionElem.selectedIndex;
                            let curSelectedValue = optionElem.children[curSelectedIndex].textContent;
                            let newSelectedIndex;
                            let newSelectedValue;
                            const re = new RegExp('([\\+\\-]?)(\\d+)');
                            let reRet = re.exec(String(condition['数値']));
                            if (reRet) {
                                if (reRet[1]) {
                                    if (reRet[1] == '+') {  // 加算
                                        newSelectedIndex = Math.min(curSelectedIndex + Number(reRet[2]), optionElem.children.length - 1);
                                    } else {    // 減算
                                        newSelectedIndex = Math.min(curSelectedIndex - Number(reRet[2]), 0);
                                    }
                                } else {    // 直値
                                    newSelectedIndex = Number(reRet[2]);
                                }
                                newSelectedValue = optionElem.children[newSelectedIndex].textContent;
                                if (curSelectedIndex > 0) {
                                    let curCondition = condition['名前'] + '@' + curSelectedValue;
                                    if (validConditionValueArr.includes(curCondition)) {
                                        validConditionValueArr = validConditionValueArr.filter(p => p != curCondition);
                                    }
                                    ステータス変更系詳細ArrMapVar.forEach((value, key) => {
                                        value.forEach(valueObj => {
                                            if (!valueObj['条件']) return;
                                            if (valueObj['対象']) return;   // 暫定
                                            let number = checkConditionMatches(valueObj['条件'], [curCondition]);
                                            if (number == 0) return;
                                            let myNew数値 = valueObj['数値'];
                                            if (number != 1) {
                                                myNew数値 = myNew数値.concat(['*', number]);
                                            }
                                            let workObj = JSON.parse(JSON.stringify(statusObj));    //　力技
                                            calculateStatus(workObj, valueObj['種類'], myNew数値, valueObj['上限']);
                                            Object.keys(workObj).forEach(statusName => {
                                                if (!$.isNumeric(workObj[statusName]) || workObj[statusName] == statusObj[statusName]) return;
                                                if (!(statusName in myステータス補正)) {
                                                    myステータス補正[statusName] = 0;
                                                }
                                                myステータス補正[statusName] -= workObj[statusName] - statusObj[statusName];
                                            });
                                        });
                                    });
                                }
                                let newCondition = condition['名前'] + '@' + newSelectedValue;
                                validConditionValueArr.push(newCondition);
                                ステータス変更系詳細ArrMapVar.forEach((value, key) => {
                                    value.forEach(valueObj => {
                                        if (!valueObj['条件']) return;
                                        if (valueObj['対象']) return;   // 暫定
                                        let number = checkConditionMatches(valueObj['条件'], [newCondition]);
                                        if (number == 0) return;
                                        let myNew数値 = valueObj['数値'];
                                        if (number != 1) {
                                            myNew数値 = myNew数値.concat(['*', number]);
                                        }
                                        let workObj = JSON.parse(JSON.stringify(statusObj));    //　力技
                                        calculateStatus(workObj, valueObj['種類'], myNew数値, valueObj['上限']);
                                        Object.keys(workObj).forEach(statusName => {
                                            if (!$.isNumeric(workObj[statusName]) || workObj[statusName] == statusObj[statusName]) return;
                                            if (!(statusName in myステータス補正)) {
                                                myステータス補正[statusName] = 0;
                                            }
                                            myステータス補正[statusName] += workObj[statusName] - statusObj[statusName];
                                        });
                                    });
                                });
                            } else {
                                console.error(detailObj, opt_element, null, condition);
                            }
                            break;
                        default:
                    }
                } else {
                    if (!validConditionValueArr.includes(condition)) {
                        ステータス条件追加(myステータス補正, condition, statusObj);
                        validConditionValueArr.push(condition);
                    }
                }
                if ('説明' in condition) {
                    if ($.isArray(condition['説明'])) {
                        condition['説明'].forEach(description => {
                            if (!statusObj['キャラクター注釈'].includes(description)) {
                                statusObj['キャラクター注釈'].push(description);
                            }
                        });
                    } else {
                        if (!statusObj['キャラクター注釈'].includes(condition['説明'])) {
                            statusObj['キャラクター注釈'].push(condition['説明']);
                        }
                    }
                }
            } else if (!validConditionValueArr.includes(condition)) {
                ステータス条件追加(myステータス補正, condition, statusObj);
                validConditionValueArr.push(condition);
            }
        });
    }

    let my天賦性能変更詳細Arr = [];
    let myステータス変更系詳細Arr = [];
    // 対象指定ありのダメージ計算（主に加算）を適用したい
    天賦性能変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(valueObj => {
            let number = null;
            if (valueObj['条件']) {
                number = checkConditionMatches(valueObj['条件'], validConditionValueArr);
                if (number == 0) {
                    return;
                }
            }
            if (valueObj['対象']) {
                if (valueObj['対象'].endsWith('元素ダメージ')) {    // for 申鶴
                    if (!valueObj['対象'].startsWith(my元素)) {
                        return;
                    }
                } else if (valueObj['対象'] == '物理ダメージ') {
                    if (my元素 != '物理') {
                        return;
                    }
                } else {
                    // 大分類 or 大分類.小分類
                    let my対象カテゴリArr = valueObj['対象'].split('.');
                    if (my対象カテゴリArr[0] != detailObj['種類']) {
                        return;
                    }
                    if (my対象カテゴリArr.length > 1 && my対象カテゴリArr[my対象カテゴリArr.length - 1] != detailObj['名前']) {
                        return;
                    }
                }
            }
            if (valueObj['種類'].endsWith('元素付与')) {   // 元素付与は先んじて適用します
                if (!detailObj['元素付与無効'] && detailObj['種類'] != '追加ダメージ') {
                    my元素 = valueObj['種類'].replace('元素付与', '');
                }
            } else if (valueObj['種類'] == '防御無視') {   // 防御無視は先んじて適用します for 雷電将軍
                let myValue = calculateFormulaArray(statusObj, valueObj['数値'], valueObj['上限']);
                my防御無視 += myValue;
            } else if (valueObj['種類'] == '固有変数') {
                // nop
            } else {
                if (number != null && number != 1) {    // オプションの@以降の数値でスケールする場合あり
                    let myNewValueObj = JSON.parse(JSON.stringify(valueObj)); // deepcopy
                    myNewValueObj['数値'] = myNewValueObj['数値'].concat(['*', number]);
                    my天賦性能変更詳細Arr.push(myNewValueObj);
                } else {
                    my天賦性能変更詳細Arr.push(valueObj);
                }
            }
        });
    });
    console.debug(detailObj['名前'] + ':my天賦性能変更詳細Arr');
    console.debug(my天賦性能変更詳細Arr);

    // 対象指定ありのステータスアップを適用したい
    ステータス変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(valueObj => {
            if (!valueObj['対象']) {
                return; // 対象指定なしのものは適用済みのためスキップします
            }
            if (valueObj['対象'].endsWith('元素ダメージ')) {   // for 九条裟羅
                if (!valueObj['対象'].startsWith(my元素)) {
                    return;
                }
            } else {
                let my対象カテゴリArr = valueObj['対象'].split('.');
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
            let myNewValue = valueObj;
            let number = null;
            if (valueObj['条件']) {
                number = checkConditionMatches(valueObj['条件'], validConditionValueArr);
                if (number == 0) {
                    return;
                }
                if (number != null && number != 1) {    // オプションの@以降の数値でスケールする場合あり
                    let myNew数値 = valueObj['数値'].concat(['*', number]);
                    myNewValue = JSON.parse(JSON.stringify(valueObj)); // deepcopy
                    myNewValue['数値'] = myNew数値;
                }
            }
            myステータス変更系詳細Arr.push(myNewValue);
        });
    });
    console.debug(detailObj['名前'] + ':myステータス変更系詳細Arr');
    console.debug(myステータス変更系詳細Arr);

    myステータス変更系詳細Arr.forEach(valueObj => {
        if (!valueObj['数値']) return;
        let myValue = calculateFormulaArray(statusObj, valueObj['数値'], valueObj['上限']);
        if (valueObj['種類'] in statusObj) {
            if (valueObj['種類'] in myステータス補正) {
                myステータス補正[valueObj['種類']] += myValue;
            } else {
                myステータス補正[valueObj['種類']] = myValue;
            }
        } else {
            switch (valueObj['種類']) {
                case '別枠乗算':    // for 宵宮
                    if (my別枠乗算 > 0) {
                        my別枠乗算 *= myValue / 100;    // for ディオナ
                    } else {
                        my別枠乗算 = myValue;
                    }
                    break;
                default:
                    console.error(detailObj, opt_element, null, valueObj['種類'], myValue);
            }
        }
    });

    // for 来歆の余響 「ダメージを与えた0.05秒後にクリアされる」
    if (detailObj['種類'] == '通常攻撃ダメージ') {
        let myCondition = null;
        if (validConditionValueArr.includes('[来歆の余響4]幽谷祭祀')) {
            myCondition = '[来歆の余響4]幽谷祭祀';
        } else if (validConditionValueArr.includes('[来歆の余響4]期待値')) {
            myCondition = '[来歆の余響4]期待値';
        }
        if (myCondition && detailObj['HIT数'] > 1) {
            ステータス変更系詳細ArrMapVar.get('聖遺物セット').forEach(valueObj => {
                if (!valueObj['条件']) return;
                if (!valueObj['数値']) return;
                if (checkConditionMatches(valueObj['条件'], [myCondition]) > 0) {
                    let myValue = calculateFormulaArray(statusObj, valueObj['数値'], valueObj['上限']);
                    if (!(valueObj['種類'] in myステータス補正)) {
                        myステータス補正[valueObj['種類']] = 0;
                    }
                    myステータス補正[valueObj['種類']] -= myValue * (detailObj['HIT数'] - Math.max(1, Math.floor(detailObj['HIT数'] / 2))) / detailObj['HIT数'];
                }
            });
            const description = '1段でダメージが複数回発生する通常攻撃については、来歆の余響4セット効果の幽谷祭祀のダメージアップは1回分のみ計上する';
            if (!statusObj['キャラクター注釈'].includes(description)) {
                statusObj['キャラクター注釈'].push(description);
            }
        }
    }

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
    my計算Result = calculateDamageFromDetailSub(statusObj, detailObj['数値'], myバフArr, is会心Calc, is防御補正Calc, is耐性補正Calc, my元素, my防御無視, my別枠乗算);
    console.debug(my計算Result);

    my天賦性能変更詳細Arr.forEach(valueObj => {
        let myResultWork = calculateDamageFromDetailSub(statusObj, valueObj['数値'], myバフArr, is会心Calc, is防御補正Calc, is耐性補正Calc, my元素, my防御無視, my別枠乗算);
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
        if (detailObj['名前'].startsWith('非表示_狼の魂基礎')) {    // レザー
            // nop
        } else if (DAMAGE_CATEGORY_ARRAY.includes(detailObj['種類'])) {
            let myResultWork = calculateDamageFromDetailSub(statusObj, statusObj[detailObj['種類'] + 'アップ'], myバフArr, is会心Calc, is防御補正Calc, is耐性補正Calc, my元素, my防御無視, 0);
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
            let myResultWork = calculateDamageFromDetailSub(statusObj, statusObj[my元素 + '元素ダメージアップ'], myバフArr, is会心Calc, is防御補正Calc, is耐性補正Calc, my元素, my防御無視, 0);
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
 * ダメージ計算を行います
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {number | string | Array} formula 計算式
 * @param {string []} buffArr バフリスト
 * @param {boolean} is会心Calc 会心計算要否
 * @param {boolean} is防御補正Calc 防御補正計算要否
 * @param {boolean} is耐性補正Calc 耐性補正計算要否
 * @param {string} 元素 
 * @param {number} 防御無視 
 * @param {number} 別枠乗算 
 * @returns {[string, number, number, number]} ダメージ[元素, 期待値, 会心, 非会心]
 */
 function calculateDamageFromDetailSub(statusObj, formula, buffArr, is会心Calc, is防御補正Calc, is耐性補正Calc, 元素, 防御無視, 別枠乗算) {
    let my非会心Result = calculateFormulaArray(statusObj, formula);
    console.debug("%o => %o", formula, my非会心Result);

    // 計算済みの値を参照する場合は、バフと防御、耐性補正の計算を省略します
    if (isUseReference(formula)) {
        buffArr = null;
        is防御補正Calc = false;
        is耐性補正Calc = false;
    }

    let my会心Result = null;
    let my期待値Result;
    let myバフ = 0;
    if (buffArr) {
        buffArr.forEach(buff => {
            myバフ += statusObj[buff];
        });
    }
    if (myバフ != 0) {
        my非会心Result *= (100 + myバフ) / 100;
    }
    if (is防御補正Calc) {
        my非会心Result *= calculate防御補正(statusObj, 防御無視);
    }
    if (is耐性補正Calc && 元素) {
        my非会心Result *= calculate元素耐性補正(statusObj, 元素);
    }
    if (別枠乗算) {    // 別枠乗算 for 宵宮
        my非会心Result *= 別枠乗算 / 100;
    }
    my期待値Result = my非会心Result;
    let my会心率 = Math.min(100, Math.max(0, statusObj['会心率']));    // 0≦会心率≦100
    let my会心ダメージ = statusObj['会心ダメージ'];
    if ((元素 + '元素ダメージ会心ダメージ') in statusObj) {
        my会心ダメージ += statusObj[元素 + '元素ダメージ会心ダメージ'];
    }
    if (is会心Calc) {
        if (my会心率 > 0) {
            my会心Result = my非会心Result * (100 + my会心ダメージ) / 100;
            my期待値Result = (my会心Result * my会心率 / 100) + (my非会心Result * (100 - my会心率) / 100);
        }
    }
    console.debug(buffArr, '=>', myバフ, is会心Calc, '=> [', my会心率, my会心ダメージ, ']', is防御補正Calc, is耐性補正Calc, 元素, 防御無視, 別枠乗算, '=>', my期待値Result, my会心Result, my非会心Result);
    return [元素, my期待値Result, my会心Result, my非会心Result];
}

/**
 * 計算式内の参照有無を求めます
 * 
 * @param {number | string | Array} formulaArr 計算式
 * @returns {boolean} 参照有無
 */
 function isUseReference(formulaArr) {
    if (!Array.isArray(formulaArr)) {
        if (!isNaN(formulaArr)) {
            return false;
        }
        return String(formulaArr).indexOf('#') != -1;
    }
    let result = false;
    formulaArr.forEach(entry => {
        if (['+', '-', '*', '/'].includes(entry)) {
            return;
        } else if (!isNaN(entry)) {
            return;
        } else if (Array.isArray(entry)) {
            if (isUseReference(entry)) {
                result = true;
            }
        } else {
            if (entry.indexOf('#') != -1) {
                result = true;
            }
        }
    });
    return result;
}

/**
 * 防御補正を計算します
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {number} opt_ignoreDef 防御無視
 * @returns {number} 防御補正
 */
 function calculate防御補正(statusObj, opt_ignoreDef = 0) { // 防御力,防御無視
    let level = Number($('#レベルInput').val().toString().replace('+', ''));
    let enemyLevel = statusObj['敵レベル'];
    let calcIgnoreDef = opt_ignoreDef / 100;
    let calcDef = statusObj['敵防御力'] / 100;
    let result = (level + 100) / ((1 - calcIgnoreDef) * (1 + calcDef) * (enemyLevel + 100) + level + 100);
    result = Math.floor(result * 10000) / 10000;
    console.debug(calculate防御補正.name, level, enemyLevel, calcIgnoreDef, calcDef, '=>', result);
    return result;
}

/**
 * 元素耐性補正を計算します
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {string} element 元素
 * @returns {number} 元素耐性補正
 */
function calculate元素耐性補正(element, statusObj, enemyStatusObj) {
    let result = enemyStatusObj[element + (element != '物理' ? '元素' : '') + '耐性'];
    if (result < 0) {
        result = 100 - result / 2;
    } else if (result < 75) {
        result = 100 - result;
    } else {
        result = 10000 / (4 * result + 100)
    }
    result = Math.floor(result * 100) / 10000;
    console.debug(calculate元素耐性補正.name, element, '=>', result);
    return result;
}

/**
 * 蒸発 融解 倍率を計算します
 * 
 * @param {string} reaction 元素反応
 * @param {string} element 元素
 * @param {object} statusObj キャラクターステータス
 * @returns {number} 蒸発 融解 倍率
 */
 function calculate乗算系元素反応倍率(reaction, element, statusObj) {
    if (!element || element == '物理' || !(reaction in 元素反応MasterVar[element])) {
        return 0;
    }
    const elementalMastery = statusObj['元素熟知'];
    const dmgBuff = statusObj[reaction];
    let result = 元素反応MasterVar[element][reaction]['数値'];
    result *= 1 + 25 * elementalMastery / (9 * (elementalMastery + 1400)) + dmgBuff / 100;
    return result;
}

/**
 * 過負荷 感電 超電導 拡散ダメージを計算します
 * 
 * @param {string} reaction 元素反応
 * @param {string} element 元素
 * @param {object} statusObj キャラクターステータス
 * @param {object} enemyStatusObj 敵ステータス
 * @returns {number} 過負荷 感電 超電導 拡散ダメージ
 */
function calculate固定値系元素反応ダメージ(reaction, element, statusObj, enemyStatusObj) {
    if (!element || element == '物理' || !(reaction in 元素反応MasterVar[element])) {
        return 0;
    }
    const level = statusObj['レベル'];
    const elementalMastery = statusObj['元素熟知'];
    const dmgBuff = statusObj[reaction];
    let dmgElement = 元素反応MasterVar[element][reaction]['元素'];
    if (reaction == '拡散') {
        if ($('#拡散Option').val()) {
            dmgElement = String($('#拡散Option').val()).replace(/元素$/, '');
        }
    }
    let result = 元素反応MasterVar[element][reaction]['数値'][level];
    result *= 1 + 16 * elementalMastery / (elementalMastery + 2000) + dmgBuff / 100;
    result *= calculate元素耐性補正(dmgElement, statusObj, enemyStatusObj);
    return result;
}

/**
 * 結晶吸収量を計算します
 * 
 * @param {string} element 元素
 * @param {object} statusObj キャラクターステータス
 * @returns {number} 結晶吸収量
 */
function calculate結晶シールド吸収量(element, statusObj) {
    if (!element || element == '物理' || !('結晶' in 元素反応MasterVar[element])) {
        return 0;
    }
    const level = statusObj['レベル'];
    let result = 元素反応MasterVar[element]['結晶']['数値'][level];
    result *= 1 + 40 * elementalMastery / (9 * (elementalMastery + 1400));
    return result;
}

/**
 * 被ダメージを計算します
 * 
 * @param {number} damage ダメージ
 * @param {string} element 元素
 * @param {object} statusObj キャラクターステータス
 * @returns {number} 被ダメージ
 */
function calculate被ダメージ(damage, element, statusObj, enemyStatusObj) {
    let def = enemyStatusObj['防御力'];
    let enemyLevel = enemyStatusObj['敵レベル'];
    let dmgReduction = statusObj['ダメージ軽減'];
    let res = statusObj[element == '物理' ? '物理耐性' : element + '元素耐性'];
    if (res < 0) {
        res = 100 - res / 2;
    } else if (res < 75) {
        res = 100 - res;
    } else {
        res = 10000 / (4 * res + 100)
    }
    res /= 100;
    let result = damage * (1 - def / (def + 5 * enemyLevel + 501)) * (100 - dmgReduction) / 100 * res;
    result = Math.max(0, Math.floor(result));
    return result;
}

