// @ts-check

/// <reference path="./gencalc_core.js"/>
/// <reference path="./gencalc_var.js"/>
/// <reference path="./gencalc_team.js"/>

/** @type {Map<string, string>} inputとselectのフォーカス時点の値を保存しておきます */
const ELEMENT_VALUE_AT_FOCUS_MAP = new Map();

/** @type {string []} */
const DAMAGE_CATEGORY_ARRAY = ['通常攻撃ダメージ', '重撃ダメージ', '落下攻撃ダメージ', '元素スキルダメージ', '元素爆発ダメージ'];

/** @type {Object} 通常攻撃の画像URL */
const WEAPON_TYPE_IMG_FILE_ALIST = {
    片手剣: 'NormalAttack_sword.png',
    両手剣: 'NormalAttack_claymore.png',
    長柄武器: 'NormalAttack_polearm.png',
    弓: 'NormalAttack_bow.png',
    法器: 'NormalAttack_catalyst.png'
};

/** @type {Map<string, boolean>} */
const resultTableVisibilityMap = new Map();


////////////////////////////////////////////////////////////////////////////////
// selector
// elem, selector
const toggleShowHide = function () {
    let elem;
    let selector = arguments[arguments.length - 1];
    if (arguments.length > 1) {
        elem = arguments[0];
    }
    if ($(selector).is(':visible')) {
        $(selector).hide();
        if (elem) {
            $(elem).removeClass('opened');
        }
    } else {
        $(selector).show();
        if (elem) {
            $(elem).addClass('opened');
        }
    }
}
////////////////////////////////////////////////////////////////////////////////

/**
 * 指定の条件が適用可能かチェックします Sub
 * 
 * @param {string} conditionStr チェックしたい条件
 * @param {string []} validConditionValueArr 有効な条件値の配列
 * @returns {number} 0:アンマッチ/1以上:マッチ(=倍率)
 */
function checkConditionMatchesSub(conditionStr, validConditionValueArr) {
    let myCondArr = conditionStr.split('@');
    if (myCondArr[0] == '命ノ星座') {
        if (myCondArr.length == 2) {
            const re = new RegExp('[^0-9]*([0-9\\.]+).*');
            let reRet = re.exec(myCondArr[1]);
            if (reRet) {
                let myConstellation = $('#命ノ星座Input').val();
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
    } else if (myCondArr.length == 1) {
        if (validConditionValueArr.filter(s => s.startsWith(conditionStr + '@')).length > 0) {
            return 1;   // マッチ 等倍
        }
        return 0;   // アンマッチ
    } else if (myCondArr[1].indexOf('-') == -1 && myCondArr[1].indexOf(',') == -1) {
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
 * 指定の条件が適用可能かチェックします
 * {条件名}
 * {条件名}@{条件値}
 * {条件名}@{条件値:START}-{条件値:END} ←この形式の場合条件値で倍率がかかります
 * {条件名}@{条件値1},{条件値2},...     ←この形式の場合条件値で倍率がかかります
 * {上記}^{排他条件名}
 * 
 * @param {string} conditionStr チェックしたい条件
 * @param {string []} validConditionValueArr 有効な条件値の配列
 * @returns {number} 0:アンマッチ/1以上:マッチ(=倍率)
 */
const checkConditionMatches = function (conditionStr, validConditionValueArr) {
    let myCondStr = conditionStr.split('^')[0];

    if (myCondStr.indexOf('|') != -1) {  // |はOR条件です
        let myCondStrArr = myCondStr.split('|');
        for (let i = 0; i < myCondStrArr.length; i++) {
            let resultSub = checkConditionMatchesSub(myCondStrArr[i], validConditionValueArr);
            if (resultSub == 1) {
                return 1;   // マッチ
            }
        }
        return 0;
    }

    let myCondStrArr = myCondStr.split('&');    // &はAND条件です
    let result = 1;
    for (let i = 0; i < myCondStrArr.length; i++) {
        let resultSub = checkConditionMatchesSub(myCondStrArr[i], validConditionValueArr);
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
 * @param {string} parentSelector 親セレクタ
 * @returns {string []} 有効な条件のリスト
 */
function makeValidConditionValueArr(parentSelector) {
    let validConditionValueArr = [];
    $(parentSelector + ' input[type="checkbox"]').each((index, elem) => {
        if ($(elem).prop('checked')) {
            validConditionValueArr.push(elem.id.replace(new RegExp('Option$'), ''));
        }
    });
    $(parentSelector + ' select').each((index, elem) => {
        if ($(elem).val()) {
            validConditionValueArr.push(elem.id.replace(new RegExp('Option$'), '') + '@' + $(elem).val());
        }
    });
    return validConditionValueArr;
}

/**
 * 
 * @param {Object} inputObj 入力条件詳細
 * @param {Map} conditionMap 条件Map
 * @returns {string []} 有効な条件のリスト
 */
function makeValidConditionValueArrFromInputObj(inputObj, conditionMap) {
    return Object.keys(inputObj).filter(s => conditionMap.has(s) && inputObj[s]).map(s => {
        if (conditionMap.get(s) == null) { // checkbox
            return s;
        }
        let result = s + '@' + conditionMap.get(s)[inputObj[s] - 1];
        return result;
    });
}

// とても大事なデータを作成しています
/**
 * 
 * @param {Object} talentDataObj 
 * @param {string} level 天賦レベル
 * @param {string} defaultKind デフォルト種類
 * @param {string} defaultElement デフォルト元素
 * @param {*} statusChangeArr 
 * @param {*} talentChangeArr 
 * @param {string} inputCategory 
 * @returns {Array}
 */
const makeTalentDetailArray = function (talentDataObj, level, defaultKind, defaultElement, statusChangeArr, talentChangeArr, inputCategory) {
    let resultArr = [];
    if ('詳細' in talentDataObj) {
        talentDataObj['詳細'].forEach(detailObj => {
            let my種類 = '種類' in detailObj ? detailObj['種類'] : defaultKind;
            let my対象 = null;
            if (my種類.indexOf('.') != -1) {
                my対象 = my種類.substring(my種類.indexOf('.') + 1);
                my種類 = my種類.substring(0, my種類.indexOf('.'));
            } else if ('対象' in detailObj) {
                my対象 = detailObj['対象'];
            }
            let my数値 = null;
            if ('数値' in detailObj) {
                my数値 = detailObj['数値'];
                if ($.isPlainObject(my数値) && level != null && level in my数値) { // キャラクター|武器のサブステータス
                    my数値 = my数値[level];
                } else if (isFinite(my数値) || isString(my数値)) {
                    // nop
                } else {
                    console.error(talentDataObj, level, defaultKind, defaultElement, inputCategory);
                }
                if (DAMAGE_CATEGORY_ARRAY.includes(my種類 + 'ダメージ') || my種類.endsWith('ダメージ')) {
                    my数値 = analyzeFormulaStr(my数値, '攻撃力');
                } else {
                    my数値 = analyzeFormulaStr(my数値, my種類);
                }
            }
            let my条件 = null;
            if ('条件' in detailObj) {
                my条件 = detailObj['条件'];
                if (level && $.isPlainObject(my条件) && level in my条件) {  // 武器は精錬ランクによって数値を変えたいときがあるので
                    my条件 = my条件[level];
                }
            }
            let my上限 = null;
            if ('上限' in detailObj) {
                my上限 = detailObj['上限'];
                if (level != null && $.isPlainObject(my上限) && level in my上限) {   // 草薙の稲光
                    my上限 = my上限[level];
                }
                my上限 = analyzeFormulaStr(my上限);
            }
            let resultObj = {
                名前: detailObj['名前'],
                種類: my種類,
                元素: '元素' in detailObj ? detailObj['元素'] : defaultElement,
                数値: my数値,
                条件: my条件,
                対象: my対象,
                上限: my上限,
                HIT数: 'HIT数' in detailObj ? detailObj['HIT数'] : null,
                ダメージバフ: 'ダメージバフ' in detailObj ? detailObj['ダメージバフ'] : null,
                元素付与無効: '元素付与無効' in detailObj ? detailObj['元素付与無効'] : inputCategory == '武器',
                除外条件: '除外条件' in detailObj ? detailObj['除外条件'] : null,
                適用条件: '適用条件' in detailObj ? detailObj['適用条件'] : null
            }
            if (statusChangeArr != null) {
                if (resultObj['種類'] in ステータス詳細ObjTemplate
                    || resultObj['種類'].endsWith('%')
                    || new RegExp('[自全].+バフ').exec(resultObj['種類'])
                    || new RegExp('敵?[自全]元素耐性').exec(resultObj['種類'])
                    || resultObj['種類'] == '別枠乗算'
                    || ['継続時間', '発動回数', 'クールタイム', '使用回数'].includes(my種類)
                ) {
                    resultObj['元素'] = '元素' in detailObj ? detailObj['元素'] : null;
                    statusChangeArr.push(resultObj);
                    return;
                }
            }
            if (talentChangeArr != null) {
                if (resultObj['種類'].endsWith('強化')
                    || resultObj['種類'].endsWith('付与')
                    || resultObj['種類'].endsWith('アップ')
                    || resultObj['種類'] == '防御無視' ||
                    resultObj['種類'] == '固有変数') {   // ex.元素爆発強化,氷元素付与
                    resultObj['元素'] = '元素' in detailObj ? detailObj['元素'] : null;
                    talentChangeArr.push(resultObj);
                    return;
                }
            }
            resultArr.push(resultObj);
        });
    } else {
        // console.error(talentDataObj, level, defaultKind, defaultElement, inputCategory);
    }
    return resultArr;
}

/**
 * 
 * @param {Object} talentDataObj 
 * @param {string} level 
 * @param {string} defaultKind 
 * @param {string} defaultElement 
 * @param {*} statusChangeArr 
 * @param {*} talentChangeArr 
 * @param {string} inputCategory 
 * @returns {Array}
 */
const makeSpecialTalentDetailArray = function (talentDataObj, level, defaultKind, defaultElement, statusChangeArr, talentChangeArr, inputCategory) {
    if ('種類' in talentDataObj) {
        switch (talentDataObj['種類']) {
            case '元素スキルダメージ':
                level = $('#元素スキルレベルInput').val().toString();
                defaultKind = talentDataObj['種類'];
                break;
            case '元素爆発ダメージ':
                level = $('#元素爆発レベルInput').val().toString();
                defaultKind = talentDataObj['種類'];
                break;
        }
    }
    if ('元素' in talentDataObj) {
        defaultElement = talentDataObj['元素'];
    }
    return makeTalentDetailArray(talentDataObj, level, defaultKind, defaultElement, statusChangeArr, talentChangeArr, inputCategory);
}

// 「条件」からオプション表示用の情報を作成します Sub
/**
 * 
 * @param {string} conditionStr 
 * @param {Map} conditionMap 
 * @param {Map} exclusionMap 
 * @param {string} exclusion 
 */
function makeConditionExclusionMapFromStrSub(conditionStr, conditionMap, exclusionMap, exclusion) {
    let myCondStrArr = conditionStr.split('@');
    let myName = myCondStrArr[0];
    if (myCondStrArr.length == 1) {
        pushToMapValueArray(conditionMap, myName, null);
    } else if (myCondStrArr.length == 2) {
        if (myCondStrArr[1].indexOf('-') != -1) {
            const re = new RegExp('([^0-9\\.]*)([0-9\\.]+)-([0-9\\.]+)(.*)');
            const re2 = new RegExp('/([0-9\\.]+)(.*)');
            let reRet = re.exec(myCondStrArr[1]);
            if (reRet) {
                let prefix = reRet[1];
                let rangeStart = Number(reRet[2]);
                let rangeEnd = Number(reRet[3]);
                let step = rangeStart;
                let postfix = reRet[4];
                if (postfix) {
                    let re2Ret = re2.exec(postfix);
                    if (re2Ret) {
                        step = Number(re2Ret[1]);
                        postfix = re2Ret[2];
                    }
                }
                for (let i = rangeStart; i < rangeEnd; i = addDecimal(i, step, rangeEnd)) {
                    pushToMapValueArray(conditionMap, myName, prefix + String(i) + postfix);
                }
                pushToMapValueArray(conditionMap, myName, prefix + String(rangeEnd) + postfix);
            } else {
                pushToMapValueArray(conditionMap, myName, myCondStrArr[1]);
            }
        } else if (myCondStrArr[1].indexOf(',') != -1) {
            const re = new RegExp('([^0-9\\.]*)([0-9\\.,]+)(.*)');
            let reRet = re.exec(myCondStrArr[1]);
            let prefix = reRet[1];
            let condValurArr = reRet[2].split(',');
            let postfix = reRet[3];
            condValurArr.forEach(value => {
                pushToMapValueArray(conditionMap, myName, prefix + value + postfix);
            });
        } else {
            pushToMapValueArray(conditionMap, myName, myCondStrArr[1]);
        }
    } else {
        console.error(conditionStr, conditionMap, exclusionMap);
    }
    if (exclusion) {
        exclusion.split(',').forEach(e => {
            pushToMapValueArray(exclusionMap, myName, e);
        });
    }
}

/**
 * 「条件」からオプション表示用の情報を作成します
 * {条件名}
 * {条件名}@{条件値}
 * {条件名}@{条件値:START}-{条件値:END} ←この形式の場合条件値で倍率がかかります
 * {条件名}@{条件値1},{条件値2},...     ←この形式の場合条件値で倍率がかかります
 * {上記}^{排他条件名}
 * 
 * @param {string} conditionStr 条件文字列
 * @param {Map} conditionMap オプション条件Map
 * @param {Map} exclusionMap オプション排他Map
 */
const makeConditionExclusionMapFromStr = function (conditionStr, conditionMap, exclusionMap) {
    // 排他条件を抽出します
    let exclusionCond = null;
    let myCondStrArr = conditionStr.split('^');
    if (myCondStrArr.length > 1) {
        exclusionCond = myCondStrArr[1];
    }
    let myCondStr = myCondStrArr[0];
    if (myCondStr.indexOf('|') != -1) {
        // OR条件 for 申鶴
        myCondStrArr = myCondStr.split('|');
        myCondStrArr.forEach(myCondStr => {
            makeConditionExclusionMapFromStrSub(myCondStr, conditionMap, exclusionMap, exclusionCond);
        });
    } else {
        // AND条件
        myCondStrArr = myCondStr.split('&');
        myCondStrArr.forEach(myCondStr => {
            makeConditionExclusionMapFromStrSub(myCondStr, conditionMap, exclusionMap, exclusionCond);
        });
    }
}

/**
 * オプションBox用 input[type=checkbox]およびselect要素を追加します
 * 
 * @param {string} parentElemId 親要素ID
 * @param {Map} optionMap オプション条件Map
 * @param {Map} exclusionMap オプション排他Map
 * @param {string} name オプショングループ名
 * @param {boolean} opt_checked 初期値有無
 * @param {*} opt_onchange 
 */
const appendInputForOptionElement = function (parentElemId, optionMap, exclusionMap, name, opt_checked = true, opt_onchange = オプションInputOnChange) {
    optionMap.forEach((value, key) => {
        if (value) return;

        let divElem = document.createElement('div');
        divElem.className = 'checkbox-option';
        $('#' + selectorEscape(parentElemId)).append(divElem);

        let elem = document.createElement('input');
        elem.type = 'checkbox';
        if (opt_checked) {  // チェック指定ありの場合でも、自身の排他条件のうちcheckedのものが存在すればチェックしません
            let myChecked = true;
            if (exclusionMap.has(key)) {
                exclusionMap.get(key).forEach(entry => {
                    if ($('#' + selectorEscape(entry) + 'Option').prop('checked')) {
                        myChecked = false;
                    }
                });
            }
            elem.checked = myChecked;
        } else {
            elem.checked = opt_checked;
        }
        elem.value = value;
        elem.id = key + 'Option';
        elem.name = name;
        divElem.appendChild(elem);

        let labelElem = document.createElement('label');
        labelElem.htmlFor = elem.id;
        labelElem.textContent = key.replace(/^.*\*/, '');
        elem.after(labelElem);

        elem.onchange = opt_onchange;
    });
    optionMap.forEach((value, key) => {
        if (!value) return;

        let divElem = document.createElement('div');
        divElem.className = 'select-option';
        $('#' + selectorEscape(parentElemId)).append(divElem);

        let elem = document.createElement('select');
        elem.id = key + 'Option';
        elem.name = name;
        divElem.append(elem);
        let optionElem;
        optionElem = document.createElement('option');
        if (value[0].startsWith('required_')) {
            optionElem.disabled = true;
        }
        elem.appendChild(optionElem);
        value.forEach(v => {
            optionElem = document.createElement('option');
            optionElem.text = v.replace(/^required_/, '');
            optionElem.value = v;
            elem.appendChild(optionElem);
        });
        if (opt_checked) {
            let mySelected = true;
            if (exclusionMap.has(key)) {
                exclusionMap.get(key).forEach(entry => {
                    if ($('#' + selectorEscape(entry) + 'Option').prop('selectedIndex') > 0) {
                        mySelected = false;
                    }
                });
            }
            optionElem.selected = mySelected;
        }

        let labelElem = document.createElement('label');
        labelElem.htmlFor = elem.id;
        labelElem.textContent = key.replace(/^.*\*/, '');
        elem.after(labelElem);

        elem.onchange = opt_onchange;
        applyOptionVariable(ステータス詳細ObjVar, elem);
    });
}

// キャラクターデータから
const setupBaseDamageDetailDataCharacter = function () {
    let my通常攻撃レベル = $('#通常攻撃レベルInput').val().toString();
    let my元素スキルレベル = $('#元素スキルレベルInput').val().toString();
    let my元素爆発レベル = $('#元素爆発レベルInput').val().toString();

    ステータス変更系詳細ArrMapVar.set('キャラクター', []);
    天賦性能変更系詳細ArrMapVar.set('キャラクター', []);
    その他_基礎ダメージ詳細ArrMapVar.set('キャラクター', []);

    // 通常攻撃を解析します。Object
    let my天賦レベル = my通常攻撃レベル;
    let myデフォルト種類 = '通常攻撃ダメージ';
    let myデフォルト元素 = null;
    let my天賦詳細Obj = 選択中キャラクターデータVar['通常攻撃'];
    通常攻撃_基礎ダメージ詳細ArrVar = makeTalentDetailArray(
        my天賦詳細Obj,
        my天賦レベル,
        myデフォルト種類,
        myデフォルト元素,
        ステータス変更系詳細ArrMapVar.get('キャラクター'),
        天賦性能変更系詳細ArrMapVar.get('キャラクター'),
        'キャラクター');
    console.debug('通常攻撃_基礎ダメージ詳細ArrVar');
    console.debug(通常攻撃_基礎ダメージ詳細ArrVar);
    // 特殊通常攻撃を解析します。Object
    特殊通常攻撃_基礎ダメージ詳細MapVar.clear();
    if ('特殊通常攻撃' in 選択中キャラクターデータVar) {
        my天賦詳細Obj = 選択中キャラクターデータVar['特殊通常攻撃'];
        if ('種類' in my天賦詳細Obj) {
            switch (my天賦詳細Obj['種類']) {
                case '元素スキルダメージ':
                    my天賦レベル = my元素スキルレベル;
                    break;
                case '元素爆発ダメージ':
                    my天賦レベル = my元素爆発レベル;
                    break;
            }
        }
        if ('元素' in my天賦詳細Obj) {
            myデフォルト元素 = my天賦詳細Obj['元素'];
        }
        let myMapKey = my天賦詳細Obj['条件'];    // 特殊＊＊に切り替わる条件です。必須です
        let myMapValue = makeSpecialTalentDetailArray(
            my天賦詳細Obj,
            my天賦レベル,
            myデフォルト種類,
            myデフォルト元素,
            ステータス変更系詳細ArrMapVar.get('キャラクター'),
            天賦性能変更系詳細ArrMapVar.get('キャラクター'),
            'キャラクター');
        特殊通常攻撃_基礎ダメージ詳細MapVar.set(myMapKey, myMapValue);
        console.debug('特殊通常攻撃_基礎ダメージ詳細MapVar');
        console.debug(特殊通常攻撃_基礎ダメージ詳細MapVar);
    }

    // 重撃を解析します。Object
    my天賦レベル = my通常攻撃レベル;
    myデフォルト種類 = '重撃ダメージ';
    myデフォルト元素 = null;
    my天賦詳細Obj = 選択中キャラクターデータVar['重撃'];
    重撃_基礎ダメージ詳細ArrVar = makeTalentDetailArray(
        my天賦詳細Obj,
        my天賦レベル,
        myデフォルト種類,
        myデフォルト元素,
        ステータス変更系詳細ArrMapVar.get('キャラクター'),
        天賦性能変更系詳細ArrMapVar.get('キャラクター'),
        'キャラクター');
    console.debug('重撃_基礎ダメージ詳細ArrVar');
    console.debug(重撃_基礎ダメージ詳細ArrVar);
    // 特殊重撃を解析します。Object
    if ('特殊重撃' in 選択中キャラクターデータVar) {
        my天賦詳細Obj = 選択中キャラクターデータVar['特殊重撃'];
        if ('種類' in my天賦詳細Obj) {
            switch (my天賦詳細Obj['種類']) {
                case '元素スキルダメージ':
                    my天賦レベル = my元素スキルレベル;
                    break;
                case '元素爆発ダメージ':
                    my天賦レベル = my元素爆発レベル;
                    break;
            }
        }
        if ('元素' in my天賦詳細Obj) {
            myデフォルト元素 = my天賦詳細Obj['元素'];
        }
        let myMapKey = my天賦詳細Obj['条件'];    // 特殊＊＊に切り替わる条件です。必須です
        let myMapValue = makeSpecialTalentDetailArray(
            my天賦詳細Obj,
            my天賦レベル,
            myデフォルト種類,
            myデフォルト元素,
            ステータス変更系詳細ArrMapVar.get('キャラクター'),
            天賦性能変更系詳細ArrMapVar.get('キャラクター'),
            'キャラクター');
        特殊重撃_基礎ダメージ詳細MapVar.set(myMapKey, myMapValue);
        console.debug('特殊重撃_基礎ダメージ詳細MapVar');
        console.debug(特殊重撃_基礎ダメージ詳細MapVar);
    }

    // 落下攻撃を解析します。Object
    my天賦レベル = my通常攻撃レベル;
    myデフォルト種類 = '落下攻撃ダメージ';
    myデフォルト元素 = null;
    my天賦詳細Obj = 選択中キャラクターデータVar['落下攻撃'];
    落下攻撃_基礎ダメージ詳細ArrVar = makeTalentDetailArray(
        my天賦詳細Obj,
        my天賦レベル,
        myデフォルト種類,
        myデフォルト元素,
        ステータス変更系詳細ArrMapVar.get('キャラクター'),
        天賦性能変更系詳細ArrMapVar.get('キャラクター'),
        'キャラクター');
    console.debug('落下攻撃_基礎ダメージ詳細ArrVar');
    console.debug(落下攻撃_基礎ダメージ詳細ArrVar);
    // 特殊落下攻撃を解析します。Object
    if ('特殊落下攻撃' in 選択中キャラクターデータVar) {
        my天賦詳細Obj = 選択中キャラクターデータVar['特殊落下攻撃'];
        let myMapKey = my天賦詳細Obj['条件'];    // 特殊＊＊に切り替わる条件です。必須です
        let myMapValue = makeSpecialTalentDetailArray(
            my天賦詳細Obj,
            my天賦レベル,
            myデフォルト種類,
            myデフォルト元素,
            ステータス変更系詳細ArrMapVar.get('キャラクター'),
            天賦性能変更系詳細ArrMapVar.get('キャラクター'),
            'キャラクター');
        特殊落下攻撃_基礎ダメージ詳細MapVar.set(myMapKey, myMapValue);
        console.debug('特殊落下攻撃_基礎ダメージ詳細MapVar');
        console.debug(特殊落下攻撃_基礎ダメージ詳細MapVar);
    }

    // 元素スキルを解析します。Object
    my天賦レベル = my元素スキルレベル;
    myデフォルト種類 = '元素スキルダメージ';
    myデフォルト元素 = キャラクター元素Var;
    my天賦詳細Obj = 選択中キャラクターデータVar['元素スキル'];
    元素スキル_基礎ダメージ詳細ArrVar = makeTalentDetailArray(
        my天賦詳細Obj,
        my天賦レベル,
        myデフォルト種類,
        myデフォルト元素,
        ステータス変更系詳細ArrMapVar.get('キャラクター'),
        天賦性能変更系詳細ArrMapVar.get('キャラクター'),
        'キャラクター');
    console.debug('元素スキル_基礎ダメージ詳細ArrVar');
    console.debug(元素スキル_基礎ダメージ詳細ArrVar);

    // 元素爆発を解析します。Object
    my天賦レベル = my元素爆発レベル;
    myデフォルト種類 = '元素爆発ダメージ';
    myデフォルト元素 = キャラクター元素Var;
    my天賦詳細Obj = 選択中キャラクターデータVar['元素爆発'];
    元素爆発_基礎ダメージ詳細ArrVar = makeTalentDetailArray(
        my天賦詳細Obj,
        my天賦レベル,
        myデフォルト種類,
        myデフォルト元素,
        ステータス変更系詳細ArrMapVar.get('キャラクター'),
        天賦性能変更系詳細ArrMapVar.get('キャラクター'),
        'キャラクター');
    console.debug('元素爆発_基礎ダメージ詳細ArrVar');
    console.debug(元素爆発_基礎ダメージ詳細ArrVar);

    // その他戦闘天賦、固有天賦を解析します。Array
    if ('その他戦闘天賦' in 選択中キャラクターデータVar) {
        選択中キャラクターデータVar['その他戦闘天賦'].forEach(element => {
            my天賦詳細Obj = element;
            let resultArr = makeTalentDetailArray(
                my天賦詳細Obj,
                null,
                null,
                null,
                ステータス変更系詳細ArrMapVar.get('キャラクター'),
                天賦性能変更系詳細ArrMapVar.get('キャラクター'),
                'キャラクター');
            if (resultArr.length > 0) {
                その他_基礎ダメージ詳細ArrMapVar.set('キャラクター', resultArr);
            }
        })
    };
    if ('固有天賦' in 選択中キャラクターデータVar) {
        選択中キャラクターデータVar['固有天賦'].forEach(element => {
            my天賦詳細Obj = element;
            let resultArr = makeTalentDetailArray(
                my天賦詳細Obj,
                null,
                null,
                null,
                ステータス変更系詳細ArrMapVar.get('キャラクター'),
                天賦性能変更系詳細ArrMapVar.get('キャラクター'),
                'キャラクター');
            if (resultArr.length > 0) {
                if (その他_基礎ダメージ詳細ArrMapVar.has('キャラクター')) {
                    let newData = その他_基礎ダメージ詳細ArrMapVar.get('キャラクター');
                    newData = newData.concat(resultArr);
                    その他_基礎ダメージ詳細ArrMapVar.set('キャラクター', newData);
                } else {
                    その他_基礎ダメージ詳細ArrMapVar.set('キャラクター', resultArr);
                }
            }
        })
    };
    console.debug('その他_基礎ダメージ詳細ArrMapVar.get(キャラクター)');
    console.debug(その他_基礎ダメージ詳細ArrMapVar.get('キャラクター'));

    // 命ノ星座を解析します。Object
    if ('命ノ星座' in 選択中キャラクターデータVar) {
        for (let i = 1; i <= $('#命ノ星座Input').val(); i++) {
            my天賦詳細Obj = 選択中キャラクターデータVar['命ノ星座'][i];
            let resultArr = makeTalentDetailArray(
                my天賦詳細Obj,
                null,
                null,
                null,
                ステータス変更系詳細ArrMapVar.get('キャラクター'),
                天賦性能変更系詳細ArrMapVar.get('キャラクター'),
                'キャラクター');
            if (resultArr.length > 0) {
                if (その他_基礎ダメージ詳細ArrMapVar.has('キャラクター')) {
                    resultArr = その他_基礎ダメージ詳細ArrMapVar.get('キャラクター').concat(resultArr);
                }
                その他_基礎ダメージ詳細ArrMapVar.set('キャラクター', resultArr);
                console.debug('その他_基礎ダメージ詳細ArrMapVar.get(キャラクター)');
                console.debug(その他_基礎ダメージ詳細ArrMapVar.get('キャラクター'));
            }
        }
    }

    if (キャラクター元素Var == '風') {
        ['炎元素', '水元素', '雷元素', '氷元素'].forEach(cond => {
            天賦性能変更系詳細ArrMapVar.get('キャラクター').push({
                名前: null,
                種類: '固有変数',
                元素: null,
                数値: null,
                条件: '拡散@' + cond,
                対象: null,
                上限: null,
                HIT数: null,
                ダメージバフ: null,
                元素付与無効: null,
                除外条件: null,
                適用条件: null
            });
        })
    }

    console.debug('ステータス変更系詳細ArrMapVar.get(キャラクター)');
    console.debug(ステータス変更系詳細ArrMapVar.get('キャラクター'));
    console.debug('天賦性能変更系詳細ArrMapVar.get(キャラクター)');
    console.debug(天賦性能変更系詳細ArrMapVar.get('キャラクター'));
}

// 武器データより
const setupBaseDamageDetailDataWeapon = function () {
    ステータス変更系詳細ArrMapVar.set('武器', []);
    天賦性能変更系詳細ArrMapVar.set('武器', []);
    その他_基礎ダメージ詳細ArrMapVar.set('武器', []);
    let my精錬ランク = $('#精錬ランクInput').val().toString();
    if ('武器スキル' in 選択中武器データVar) {
        let resultArr = makeTalentDetailArray(
            選択中武器データVar['武器スキル'],
            my精錬ランク,
            null,
            null,
            ステータス変更系詳細ArrMapVar.get('武器'),
            天賦性能変更系詳細ArrMapVar.get('武器'),
            '武器');
        if (resultArr.length > 0) {
            その他_基礎ダメージ詳細ArrMapVar.set('武器', resultArr);
            console.debug('その他_基礎ダメージ詳細ArrMapVar.get(武器)');
            console.debug(その他_基礎ダメージ詳細ArrMapVar.get('武器'));
        }
    }
    console.debug('ステータス変更系詳細ArrMapVar.get(武器)');
    console.debug(ステータス変更系詳細ArrMapVar.get('武器'));
}

// 聖遺物セットデータより
const setupBaseDamageDetailDataArtifactSet = function () {
    ステータス変更系詳細ArrMapVar.set('聖遺物セット', []);
    選択中聖遺物セット効果データArrVar.forEach(data => {
        let myArr = makeTalentDetailArray(
            data,
            null,
            null,
            null,
            ステータス変更系詳細ArrMapVar.get('聖遺物セット'),
            天賦性能変更系詳細ArrMapVar.get('聖遺物セット'),
            '聖遺物セット');
        if (myArr.length != 0) {
            console.error(data);
        }
    });
    console.debug('ステータス変更系詳細ArrMapVar.get(聖遺物セット)');
    console.debug(ステータス変更系詳細ArrMapVar.get('聖遺物セット'));
}


////////////////////////////////////////////////////////////////////////////////
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
function calculate元素耐性補正(statusObj, element) {
    let result = statusObj['敵' + element + (element != '物理' ? '元素' : '') + '耐性'];
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
 * @param {Object} statusObj ステータス詳細
 * @param {string} element 元素
 * @param {number} elementalMastery 元素熟知
 * @param {string} elementalReaction 元素反応
 * @returns {number} 蒸発 融解 倍率
 */
function calculate乗算系元素反応倍率(statusObj, element, elementalMastery, elementalReaction) {
    if (!element || element == '物理' || !(elementalReaction in 元素反応MasterVar[element])) {
        return 0;
    }
    let result = 元素反応MasterVar[element][elementalReaction]['数値'];
    let dmgBuff = statusObj[elementalReaction + '反応ボーナス'];
    result *= 1 + 25 * elementalMastery / (9 * (elementalMastery + 1400)) + dmgBuff / 100;
    return result;
}

/**
 * 過負荷 感電 超電導 拡散ダメージを計算します
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {string} element 元素
 * @param {number} elementalMastery 元素熟知
 * @param {string} elementalReaction 元素反応
 * @returns {number} 過負荷 感電 超電導 拡散ダメージ
 */
function calculate固定値系元素反応ダメージ(statusObj, element, elementalMastery, elementalReaction) {
    if (!element || element == '物理' || !(elementalReaction in 元素反応MasterVar[element])) {
        return 0;
    }
    const level = Number($('#レベルInput').val().toString().replace('+', ''));
    const dmgBuff = statusObj[elementalReaction + '反応ボーナス'];
    let dmgElement = 元素反応MasterVar[element][elementalReaction]['元素'];
    if (elementalReaction == '拡散') {
        if ($('#拡散Option').val()) {
            dmgElement = String($('#拡散Option').val()).replace(/元素$/, '');
        }
    }
    let result = 元素反応MasterVar[element][elementalReaction]['数値'][level];
    result *= 1 + 16 * elementalMastery / (elementalMastery + 2000) + dmgBuff / 100;
    result *= calculate元素耐性補正(statusObj, dmgElement);
    return result;
}

/**
 * 結晶吸収量を計算します
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {string} element 元素
 * @param {number} elementalMastery 元素熟知
 * @returns {number} 結晶吸収量
 */
function calculate結晶シールド吸収量(statusObj, element, elementalMastery) {
    if (!element || element == '物理' || !('結晶' in 元素反応MasterVar[element])) {
        return 0;
    }
    let level = Number($('#レベルInput').val().toString().replace('+', ''));
    let result = 元素反応MasterVar[element]['結晶']['数値'][level];
    result *= 1 + 40 * elementalMastery / (9 * (elementalMastery + 1400));
    return result;
}

/**
 * 蒸発 倍率を計算します
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {string} element 元素
 * @param {number} elementalMastery 元素熟知
 * @returns {number} 蒸発 倍率
 */
function calculate蒸発倍率(statusObj, element, elementalMastery) {
    return calculate乗算系元素反応倍率(statusObj, element, elementalMastery, '蒸発');
}

/**
 * 溶解 倍率を計算します
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {string} element 元素
 * @param {number} elementalMastery 元素熟知
 * @returns {number} 溶解 倍率
 */
function calculate溶解倍率(statusObj, element, elementalMastery) {
    return calculate乗算系元素反応倍率(statusObj, element, elementalMastery, '溶解');
}

// 
/**
 * 被ダメージを計算します
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {number} damage ダメージ
 * @param {string} element 元素
 * @returns {number} 被ダメージ
 */
function calculate被ダメージ(statusObj, damage, element) {
    let def = statusObj['防御力'];
    let enemyLevel = statusObj['敵レベル'];
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

/**
 * 計算式内の参照有無を求めます
 * 
 * @param {number | string | Array} formulaArr 計算式
 * @returns {boolean} 参照有無
 */
function isUseReference(formulaArr) {
    if (!Array.isArray(formulaArr)) {
        if ($.isNumeric(formulaArr)) {
            return false;
        }
        return String(formulaArr).indexOf('#') != -1;
    }
    let result = false;
    formulaArr.forEach(entry => {
        if (['+', '-', '*', '/'].includes(entry)) {
            return;
        } else if ($.isNumeric(entry)) {
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
 * ステータスを更新します
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {string} kind 種類
 * @param {number | string | Array} formulaArr 計算式
 * @param {number | string | Array} opt_max 上限
 */
function calculateStatus(statusObj, kind, formulaArr, opt_max = null) {
    let result = calculateFormulaArray(statusObj, formulaArr, opt_max);
    let statusName = kind;
    let targetObj = statusObj;
    if (!$.isNumeric(result)) {
        console.error(statusObj, kind, formulaArr, result);
    }
    if (KIND_TO_PROPERTY_MAP.has(kind)) {
        statusName = KIND_TO_PROPERTY_MAP.get(kind);
    } else if (kind.indexOf('.') != -1) {
        const splittedArr = kind.split('.');
        statusName = splittedArr[0];
        for (let i = 1; i < splittedArr.length; i++) {
            if (!(splittedArr[i] in targetObj)) {
                targetObj[splittedArr[i]] = {};
            }
            targetObj = targetObj[splittedArr[i]];
        }
    } else {
        switch (kind) {
            case '自元素ダメージバフ':
                statusName = 選択中キャラクターデータVar['元素'] + '元素ダメージバフ';
                break;
            case '全元素ダメージバフ':
                ['炎', '水', '風', '雷', '草', '氷', '岩'].forEach(entry => {
                    let statusName = entry + '元素ダメージバフ';
                    if (!(statusName in targetObj)) {
                        targetObj[statusName] = 0;
                    }
                    targetObj[statusName] += result;
                });
                return;
            case '敵自元素耐性':
                statusName = '敵' + 選択中キャラクターデータVar['元素'] + '元素耐性';
                break;
            case '敵全元素耐性':
                ['炎', '水', '風', '雷', '草', '氷', '岩'].forEach(entry => {
                    let statusName = '敵' + entry + '元素耐性';
                    if (!(statusName in targetObj)) {
                        targetObj[statusName] = 0;
                    }
                    targetObj[statusName] += result;
                });
                return;
            case '全元素耐性':
                ['炎', '水', '風', '雷', '草', '氷', '岩'].forEach(entry => {
                    let statusName = entry + '元素耐性';
                    if (!(statusName in targetObj)) {
                        targetObj[statusName] = 0;
                    }
                    targetObj[statusName] += result;
                });
                return;
        }
    }
    if (!(statusName in targetObj)) {
        targetObj[statusName] = 0;
    }
    targetObj[statusName] += Math.round(result * 10) / 10;
    console.debug(calculateStatus.name, null, kind, formulaArr, '=>', result);
}

/**
 * 
 * @param {Object} resultObj リザルト詳細
 * @param {string} condition 条件文字列
 * @param {Object} statusObj ステータス詳細
 * @param {Array<string>} validConditionValueArr 有効な条件
 */
function ステータス条件取消(resultObj, condition, statusObj, validConditionValueArr) {
    ステータス変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(valueObj => {
            if (valueObj['対象'] || !valueObj['数値'] || !valueObj['条件']) return;

            let isTarget = false;
            const orSplitted = valueObj['条件'].split('|');
            orSplitted.forEach(orValue => {
                const andSplitted = orValue.split('&');
                andSplitted.forEach(andValue => {
                    if (andValue == condition || andValue.startsWith(condition + '@')) {
                        isTarget = true;
                    }
                });
            });
            if (!isTarget) return;

            let multiplier = 1;
            multiplier = checkConditionMatches(valueObj['条件'], validConditionValueArr);
            if (multiplier > 0) {
                let workObj = JSON.parse(JSON.stringify(statusObj));    //　力技
                let myNew数値 = valueObj['数値'];
                if (multiplier != 1) {
                    myNew数値 = myNew数値.concat(['*', multiplier]);
                }
                calculateStatus(workObj, valueObj['種類'], myNew数値, valueObj['上限']);
                Object.keys(workObj).forEach(statusName => {
                    if (!$.isNumeric(workObj[statusName]) || workObj[statusName] == statusObj[statusName]) return;
                    if (!(statusName in resultObj)) {
                        resultObj[statusName] = 0;
                    }
                    resultObj[statusName] -= workObj[statusName] - statusObj[statusName];
                });
            }
        });
    });
}

/**
 * 
 * @param {Object} resultObj リザルト詳細
 * @param {string} condition 条件文字列
 * @param {Object} statusObj ステータス詳細
 */
function ステータス条件追加(resultObj, condition, statusObj) {
    ステータス変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(valueObj => {
            if (valueObj['対象'] || !valueObj['数値']) return;
            if (valueObj['条件'] == condition) {
                let workObj = JSON.parse(JSON.stringify(statusObj));    //　力技
                calculateStatus(workObj, valueObj['種類'], valueObj['数値'], valueObj['上限']);
                Object.keys(workObj).forEach(statusName => {
                    if (!$.isNumeric(workObj[statusName]) || workObj[statusName] == statusObj[statusName]) return;
                    if (!(statusName in resultObj)) {
                        resultObj[statusName] = 0;
                    }
                    resultObj[statusName] += workObj[statusName] - statusObj[statusName];
                });
            }
        });
    });
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
 * ダメージ計算
 * 
 * @param {Object} inputObj 
 * @param {Object} statusObj 
 * @param {string []} validConditionValueArr 
 */
function calculateDamageResult(inputObj, statusObj, validConditionValueArr) {
    let myダメージ計算 = statusObj['ダメージ計算'];

    // 通常攻撃ダメージを計算します
    console.debug('通常攻撃 start');
    let myDamageDetailObjArr = 通常攻撃_基礎ダメージ詳細ArrVar;
    // 条件にマッチしていたならば、myDamageDetailObjArrを置き換えます
    特殊通常攻撃_基礎ダメージ詳細MapVar.forEach((value, key) => {
        if (validConditionValueArr.includes(key)) {
            myDamageDetailObjArr = value;
        }
    });
    myDamageDetailObjArr.forEach(detailObj => {
        if (detailObj['条件'] != null) {
            if (checkConditionMatches(detailObj['条件'], validConditionValueArr) == 0) {
                return;
            }
        }
        myダメージ計算['通常攻撃'].push(calculateDamageFromDetail(statusObj, detailObj, 通常攻撃_元素Var));
    });
    let my合計ダメージArr = null;
    let my段数 = 0;
    myダメージ計算['通常攻撃'].forEach(arr => {
        if (arr[0].startsWith('非表示_')) return;
        if (arr[0].endsWith('段ダメージ')) {
            if (my合計ダメージArr == null) {
                my合計ダメージArr = JSON.parse(JSON.stringify(arr));
                my合計ダメージArr[0] = '合計ダメージ';
            } else {
                for (let i = 2; i < my合計ダメージArr.length; i++) {
                    if (arr[i]) {
                        my合計ダメージArr[i] += arr[i];
                    }
                }
            }
            my段数++;
        }
    });
    if (my段数 > 0) {
        myダメージ計算['通常攻撃'].splice(my段数, 0, my合計ダメージArr);
    }
    console.debug('通常攻撃 summary');
    console.debug(myダメージ計算['通常攻撃']);

    // 重撃ダメージを計算します
    console.debug('重撃 start');
    myDamageDetailObjArr = 重撃_基礎ダメージ詳細ArrVar;
    // 条件にマッチしていたならば、myDamageDetailObjArrを置き換えます
    特殊重撃_基礎ダメージ詳細MapVar.forEach((value, key) => {
        if (validConditionValueArr.includes(key)) {
            myDamageDetailObjArr = value;
        }
    });
    myDamageDetailObjArr.forEach(detailObj => {
        if (detailObj['条件'] != null) {
            if (checkConditionMatches(detailObj['条件'], validConditionValueArr) == 0) {
                return;
            }
        }
        myダメージ計算['重撃'].push(calculateDamageFromDetail(statusObj, detailObj, 重撃_元素Var));
    });
    console.debug('重撃 summary');
    console.debug(myダメージ計算['重撃']);

    // 落下攻撃ダメージを計算します
    console.debug('落下攻撃 start');
    myDamageDetailObjArr = 落下攻撃_基礎ダメージ詳細ArrVar;
    // 条件にマッチしていたならば、myDamageDetailObjArrを置き換えます
    特殊落下攻撃_基礎ダメージ詳細MapVar.forEach((value, key) => {
        if (validConditionValueArr.includes(key)) {
            myDamageDetailObjArr = value;
        }
    });
    myDamageDetailObjArr.forEach(detailObj => {
        if (detailObj['条件'] != null) {
            if (checkConditionMatches(detailObj['条件'], validConditionValueArr) == 0) {
                return;
            }
        }
        myダメージ計算['落下攻撃'].push(calculateDamageFromDetail(statusObj, detailObj, 落下攻撃_元素Var));
    });
    console.debug('落下攻撃 summary');
    console.debug(myダメージ計算['落下攻撃']);

    // 元素スキルダメージを計算します
    console.debug('元素スキル start');
    myDamageDetailObjArr = 元素スキル_基礎ダメージ詳細ArrVar;
    myDamageDetailObjArr.forEach(detailObj => {
        if (detailObj['条件'] != null) {
            if (checkConditionMatches(detailObj['条件'], validConditionValueArr) == 0) {
                return;
            }
        }
        myダメージ計算['元素スキル'].push(calculateDamageFromDetail(statusObj, detailObj, null));
    });
    console.debug('元素スキル summary');
    console.debug(myダメージ計算['元素スキル']);

    // 元素爆発ダメージを計算します
    console.debug('元素爆発 start');
    myDamageDetailObjArr = 元素爆発_基礎ダメージ詳細ArrVar;
    myDamageDetailObjArr.forEach(detailObj => {
        if (detailObj['条件'] != null) {
            if (checkConditionMatches(detailObj['条件'], validConditionValueArr) == 0) {
                return;
            }
        }
        myダメージ計算['元素爆発'].push(calculateDamageFromDetail(statusObj, detailObj, null));
    });
    console.debug('元素爆発 summary');
    console.debug(myダメージ計算['元素爆発']);

    // その他ダメージを計算します
    console.debug('その他 start');
    その他_基礎ダメージ詳細ArrMapVar.forEach((value, key) => {
        myDamageDetailObjArr = value;
        if (myDamageDetailObjArr.length > 0) {
            myDamageDetailObjArr.forEach(detailObj => {
                myダメージ計算['その他'].push(calculateDamageFromDetail(statusObj, detailObj, null));
            });
        }
    });
    console.debug('その他 summary');
    console.debug(myダメージ計算['その他']);
}

/**
 * ダメージ計算結果テーブルを表示します
 * 
 * @param {string} tableId 
 * @param {string} categoryName 
 * @param {Array} damageResultArr 
 */
const displayResultTable = function (tableId, categoryName, damageResultArr) {
    let tableElem = document.getElementById(tableId);
    while (tableElem.firstChild) {
        tableElem.removeChild(tableElem.firstChild);
    }

    if (damageResultArr.length == 0) return;

    let elementalReaction = $('input[name="元素反応Input"]:checked').val();

    let myIsHidden = true;
    if (resultTableVisibilityMap.has(tableId)) {
        myIsHidden = !resultTableVisibilityMap.get(tableId);
    }

    let theadElem = document.createElement('thead');
    tableElem.appendChild(theadElem);
    let trElem1 = document.createElement('tr');
    theadElem.appendChild(trElem1);
    let trElem2 = document.createElement('tr');
    trElem2.className = 'noreaction';
    trElem2.hidden = (elementalReaction != 'noreaction');
    tableElem.appendChild(trElem2);
    let trElem3 = document.createElement('tr');
    trElem3.className = 'noreaction hidable';
    trElem3.hidden = (elementalReaction != 'noreaction') || myIsHidden;
    tableElem.appendChild(trElem3);
    let trElem4 = document.createElement('tr');
    trElem4.className = 'noreaction hidable';
    trElem4.hidden = (elementalReaction != 'noreaction') || myIsHidden;
    tableElem.appendChild(trElem4);
    let thElem1 = document.createElement('th');
    thElem1.className = 'category';
    thElem1.textContent = categoryName;
    trElem1.appendChild(thElem1);
    let thElem2 = document.createElement('th');
    thElem2.className = 'label';
    thElem2.textContent = '期待値';
    trElem2.appendChild(thElem2);
    let thElem3 = document.createElement('th');
    thElem3.className = 'label';
    thElem3.textContent = '会心';
    trElem3.appendChild(thElem3);
    let thElem4 = document.createElement('th');
    thElem4.className = 'label';
    thElem4.textContent = '非会心';
    trElem4.appendChild(thElem4);
    // 蒸発ダメージ
    let trElem5 = document.createElement('tr');
    trElem5.className = 'vaporize';
    trElem5.hidden = (elementalReaction != 'vaporize');
    tableElem.appendChild(trElem5);
    let trElem6 = document.createElement('tr');
    trElem6.className = 'vaporize hidable';
    trElem6.hidden = (elementalReaction != 'vaporize') || myIsHidden;
    tableElem.appendChild(trElem6);
    let trElem7 = document.createElement('tr');
    trElem7.className = 'vaporize hidable';
    trElem7.hidden = (elementalReaction != 'vaporize') || myIsHidden;
    tableElem.appendChild(trElem7);
    let thElem5 = document.createElement('th');
    thElem5.className = 'label';
    thElem5.textContent = '期待値';
    trElem5.appendChild(thElem5);
    let thElem6 = document.createElement('th');
    thElem6.className = 'label';
    thElem6.textContent = '会心';
    trElem6.appendChild(thElem6);
    let thElem7 = document.createElement('th');
    thElem7.className = 'label';
    thElem7.textContent = '非会心';
    trElem7.appendChild(thElem7);
    // 溶解ダメージ
    let trElem8 = document.createElement('tr');
    trElem8.className = 'melt';
    trElem8.hidden = (elementalReaction != 'melt');
    tableElem.appendChild(trElem8);
    let trElem9 = document.createElement('tr');
    trElem9.className = 'melt hidable';
    trElem9.hidden = (elementalReaction != 'melt') || myIsHidden;
    tableElem.appendChild(trElem9);
    let trElem10 = document.createElement('tr');
    trElem10.className = 'melt hidable';
    trElem10.hidden = (elementalReaction != 'melt') || myIsHidden;
    tableElem.appendChild(trElem10);
    let thElem8 = document.createElement('th');
    thElem8.className = 'label';
    thElem8.textContent = '期待値';
    trElem8.appendChild(thElem8);
    let thElem9 = document.createElement('th');
    thElem9.className = 'label';
    thElem9.textContent = '会心';
    trElem9.appendChild(thElem9);
    let thElem10 = document.createElement('th');
    thElem10.className = 'label';
    thElem10.textContent = '非会心';
    trElem10.appendChild(thElem10);

    damageResultArr.forEach(valueArr => {
        if (!valueArr[0]) return;
        if (valueArr[0].startsWith('非表示_')) return;

        let tdClassName = null;
        if (valueArr[1] && ELEMENT_TD_CLASS_MAP.has(valueArr[1])) {
            tdClassName = ELEMENT_TD_CLASS_MAP.get(valueArr[1]);
        }
        let thElem1 = document.createElement('th');
        if (valueArr[0]) {
            let name = valueArr[0];
            if (damageResultArr.length > 2) {
                name = name.replace('のダメージ', '');
            }
            if (damageResultArr.length > 3 || categoryName == '落下攻撃') {
                thElem1.textContent = name.replace('ダメージ', '');
            } else {
                thElem1.textContent = name;
            }
        }
        trElem1.appendChild(thElem1);
        let tdElem2 = document.createElement('td');
        tdElem2.textContent = valueArr[2];
        tdElem2.classList.add('value');
        if (tdClassName) {
            tdElem2.classList.add(tdClassName);
        }
        trElem2.appendChild(tdElem2);
        let tdElem3 = document.createElement('td');
        tdElem3.textContent = valueArr[3];
        tdElem3.classList.add('value');
        if (tdClassName) {
            tdElem3.classList.add(tdClassName);
        }
        trElem3.appendChild(tdElem3);
        let tdElem4 = document.createElement('td');
        tdElem4.textContent = valueArr[4];
        tdElem4.classList.add('value');
        if (tdClassName) {
            tdElem4.classList.add(tdClassName);
        }
        trElem4.appendChild(tdElem4);
        // 蒸発ダメージ
        let tdElem5 = document.createElement('td');
        tdElem5.textContent = valueArr[5] != null ? valueArr[5] : valueArr[2];
        tdElem5.classList.add('value');
        if (tdClassName) {
            tdElem5.classList.add(tdClassName);
        }
        trElem5.appendChild(tdElem5);
        let tdElem6 = document.createElement('td');
        tdElem6.textContent = valueArr[6] != null ? valueArr[6] : valueArr[3];
        tdElem6.classList.add('value');
        if (tdClassName) {
            tdElem6.classList.add(tdClassName);
        }
        trElem6.appendChild(tdElem6);
        let tdElem7 = document.createElement('td');
        tdElem7.textContent = valueArr[7] != null ? valueArr[7] : valueArr[4];
        tdElem7.classList.add('value');
        if (tdClassName) {
            tdElem7.classList.add(tdClassName);
        }
        trElem7.appendChild(tdElem7);
        // 溶解ダメージ
        let tdElem8 = document.createElement('td');
        tdElem8.textContent = valueArr[8] != null ? valueArr[8] : valueArr[2];
        tdElem8.classList.add('value');
        if (tdClassName) {
            tdElem8.classList.add(tdClassName);
        }
        trElem8.appendChild(tdElem8);
        let tdElem9 = document.createElement('td');
        tdElem9.textContent = valueArr[9] != null ? valueArr[9] : valueArr[3];
        tdElem9.classList.add('value');
        if (tdClassName) {
            tdElem9.classList.add(tdClassName);
        }
        trElem9.appendChild(tdElem9);
        let tdElem10 = document.createElement('td');
        tdElem10.textContent = valueArr[10] != null ? valueArr[10] : valueArr[4];
        tdElem10.classList.add('value');
        if (tdClassName) {
            tdElem10.classList.add(tdClassName);
        }
        trElem10.appendChild(tdElem10);
    });
}

/**
 * ダメージ計算Areaを更新します
 * 
 * @param {Object} statusObj 詳細ステータス
 */
const inputOnChangeResultUpdate = function (statusObj) {
    if (!選択中キャラクターデータVar) return;
    if (!選択中武器データVar) return;
    if (!選択中敵データVar) return;

    let my元素熟知 = statusObj['元素熟知'];
    let my蒸発倍率 = calculate蒸発倍率(statusObj, キャラクター元素Var, my元素熟知);
    if (my蒸発倍率) {
        $('#元素反応蒸発Input+label').text('蒸発×' + Math.round(my蒸発倍率 * 100) / 100);
    }
    let my溶解倍率 = calculate溶解倍率(statusObj, キャラクター元素Var, my元素熟知);
    if (my溶解倍率) {
        $('#元素反応溶解Input+label').text('溶解×' + Math.round(my溶解倍率 * 100) / 100);
    }
    let my過負荷ダメージ = calculate固定値系元素反応ダメージ(statusObj, キャラクター元素Var, my元素熟知, '過負荷');
    if (my過負荷ダメージ) {
        $('#元素反応過負荷Label').text('過負荷' + Math.round(my過負荷ダメージ));
        $('#元素反応過負荷Label').show();
    } else {
        $('#元素反応過負荷Label').hide();
    }
    let my感電ダメージ = calculate固定値系元素反応ダメージ(statusObj, キャラクター元素Var, my元素熟知, '感電');
    if (my感電ダメージ) {
        $('#元素反応感電Label').text('感電' + Math.round(my感電ダメージ));
        $('#元素反応感電Label').show();
    } else {
        $('#元素反応感電Label').hide();
    }
    let my超電導ダメージ = calculate固定値系元素反応ダメージ(statusObj, キャラクター元素Var, my元素熟知, '超電導');
    if (my超電導ダメージ) {
        $('#元素反応超電導Label').text('超電導' + Math.round(my超電導ダメージ));
        $('#元素反応超電導Label').show();
    } else {
        $('#元素反応超電導Label').hide();
    }
    let my拡散ダメージ = calculate固定値系元素反応ダメージ(statusObj, キャラクター元素Var, my元素熟知, '拡散');
    if (my拡散ダメージ) {
        $('#元素反応拡散Label').text('拡散' + Math.round(my拡散ダメージ));
        let clazz = ELEMENT_TD_CLASS_MAP.get(String($('#拡散Option').val()).replace(/元素$/, ''));
        if (!clazz) {
            clazz = 'pyro';
        }
        ['pyro', 'hydro', 'electro', 'dendro', 'cryo'].filter(s => s != clazz).forEach(entry => {
            $('#元素反応拡散Label').removeClass(entry);
        });
        $('#元素反応拡散Label').addClass(clazz);
        $('#元素反応拡散Label').show();
    } else {
        $('#元素反応拡散Label').hide();
    }
    let my結晶吸収量 = calculate結晶シールド吸収量(statusObj, キャラクター元素Var, my元素熟知);
    if (my結晶吸収量) {
        $('#元素反応結晶Label').text('結晶' + Math.round(my結晶吸収量));
        $('#元素反応結晶Label').show();
    } else {
        $('#元素反応結晶Label').hide();
    }

    let validConditionValueArr = makeValidConditionValueArr('#オプションBox');

    let myダメージ計算 = statusObj['ダメージ計算'];
    if (myダメージ計算 == null) {
        myダメージ計算 = {};
        statusObj['ダメージ計算'] = myダメージ計算;
    }
    myダメージ計算['通常攻撃'] = [];
    myダメージ計算['重撃'] = [];
    myダメージ計算['落下攻撃'] = [];
    myダメージ計算['元素スキル'] = [];
    myダメージ計算['元素爆発'] = [];
    myダメージ計算['その他'] = [];
    myダメージ計算['被ダメージ'] = [];

    statusObj['キャラクター注釈'] = [];

    calculateDamageResult(null, statusObj, validConditionValueArr);

    let resValueArr = [statusObj['物理耐性']];
    let resArrArr = [['物理', calculate被ダメージ(statusObj, 10000, '物理')]];
    const resNameArr = ['炎', '水', '風', '雷', '氷', '岩'];
    resNameArr.forEach(element => {
        let resValue = statusObj[element + '元素耐性'];
        if (!resValueArr.includes(resValue)) {
            if (element == '炎') {
                resValueArr = [resValue];
            }
            resArrArr.push([element, calculate被ダメージ(statusObj, 10000, element)]);
        }
    });
    let my被ダメージHtml = '';
    let my耐久スコアHtml = '';
    resArrArr.forEach(arr => {
        my被ダメージHtml += ' <span class="' + ELEMENT_TD_CLASS_MAP.get(arr[0].toString()) + '">' + arr[1] + '</span>';
        let score = Math.round(statusObj['HP上限'] * 10000 / Number(arr[1]));
        my耐久スコアHtml += ' <span class="' + ELEMENT_TD_CLASS_MAP.get(arr[0].toString()) + '">' + score + '</span>';
    });
    $('#被ダメージResult').html(my被ダメージHtml);
    $('#耐久Score').html(my耐久スコアHtml);

    displayResultTable('通常攻撃ダメージResult', '通常攻撃', myダメージ計算['通常攻撃']);
    displayResultTable('重撃ダメージResult', '重撃', myダメージ計算['重撃']);
    displayResultTable('落下攻撃ダメージResult', '落下攻撃', myダメージ計算['落下攻撃']);
    displayResultTable('元素スキルダメージResult', '元素スキル', myダメージ計算['元素スキル']);
    displayResultTable('元素爆発ダメージResult', '元素爆発', myダメージ計算['元素爆発']);
    if (myダメージ計算['その他'].length > 0) {
        $('#その他ダメージResult').show();
        displayResultTable('その他ダメージResult', 'その他', myダメージ計算['その他']);
    } else {
        $('#その他ダメージResult').hide();
    }

    $('#ダメージ計算注釈').html(statusObj['キャラクター注釈'].join('<br>'));

    // デバッグ情報を出力します
    setDebugInfo();
}

function compareFunction(a, b) {
    const arr = ['HP%', 'HP', 'HP上限', '防御力%', '防御力', '元素熟知', '会心率', '会心ダメージ', '与える治療効果', '受ける治療効果', '元素チャージ効率', '攻撃力%', '攻撃力'];
    const lowestArr = ['ダメージ軽減'];
    let aIndex = arr.indexOf(a[0]);
    if (lowestArr.indexOf(a[0]) >= 0) {
        aIndex = arr.length + 1;
    }
    let bIndex = arr.indexOf(b[0]);
    if (lowestArr.indexOf(b[0]) >= 0) {
        bIndex = arr.length + 1;
    }
    return (aIndex != -1 ? aIndex : arr.length) - (bIndex != -1 ? bIndex : arr.length);
}

/**
 * ステータス変化HTML（メッセージ）を作成します
 * 
 * @param {Object} changeStatusObj ステータス変化
 * @returns {string} HTML
 */
function makeステータス変化Html(changeStatusObj) {
    let html = '';
    Object.keys(changeStatusObj).forEach(key => {
        let postfix = '';
        html += '<p>';
        if (['元素付与'].includes(key)) {
            html += changeStatusObj[key] + key;
        } else {
            if (key.startsWith('敵')) {
                html += key.replace(/^敵/, '敵の');
                postfix = '%';
            } else if (key.endsWith('バフ')) {
                html += key.replace(/バフ$/, '');
                postfix = '%';
            } else if (key.endsWith('乗算')) {
                html += key.replace(/乗算$/, '');
                postfix = '%';
            } else if (key.indexOf('ダメージ会心') != -1) {
                html += key.replace(/ダメージ会心/, 'ダメージの会心');
                postfix = '%';
            } else if (key.endsWith('クールタイム')) {
                html += key.replace(/クールタイム$/, 'のクールタイム');
                postfix = '%';
            } else if (key.endsWith('速度')) {
                html += key;
                postfix = '%';
            } else if ([
                '会心率',
                '会心ダメージ',
                '与える治療効果',
                '受ける治療効果',
                '元素チャージ効率',
                'シールド強化',
                '与えるダメージ',
                'ダメージ軽減'].includes(key)) {
                html += key;
                postfix = '%';
            } else {
                html += key;
            }
            if (changeStatusObj[key] >= 0) {
                html += '+';
            }
            html += changeStatusObj[key] + postfix;
        }
        html += '</p>';
    });
    return html;
}

/**
 * ステータス詳細を更新します Sub1
 * 
 * @param {Object} statusObj 詳細ステータス
 * @param {Object} inputObj 入力条件詳細
 * @param {Object} characterMasterObj キャラクターマスター
 * @param {Object} weaponMasterObj 武器マスター
 */
function calculateStatusObjSub1(statusObj, inputObj, characterMasterObj, weaponMasterObj) {
    const myレベル = inputObj['レベル'];
    const my武器レベル = inputObj['武器レベル'];

    if ('元素エネルギー' in characterMasterObj['元素爆発']) {
        statusObj['元素エネルギー'] = characterMasterObj['元素爆発']['元素エネルギー'];
    }

    if ('固有変数' in characterMasterObj) {
        Object.keys(characterMasterObj['固有変数']).forEach(key => {
            if (key in inputObj['オプション']) {
                statusObj[key] = inputObj['オプション'][key];
            } else {
                statusObj[key] = characterMasterObj['固有変数'][key];
            }
        });
    }

    // キャラクター
    Object.keys(characterMasterObj['ステータス']).forEach(key => {
        let toKey = key;
        if (key.endsWith('%')) {
            toKey = key.replace('%', '乗算');
        }
        statusObj[toKey] += characterMasterObj['ステータス'][key][myレベル];
    });

    // 武器
    Object.keys(weaponMasterObj['ステータス']).forEach(key => {
        let toKey = key;
        if (key == 'HP') {
            toKey = 'HP上限';
        } else if (key.endsWith('%')) {
            toKey = key.replace('%', '乗算');
        }
        statusObj[toKey] += weaponMasterObj['ステータス'][key][my武器レベル];
    });

    // 聖遺物·聖遺物メイン効果
    Object.keys(inputObj).filter(s => s.startsWith('聖遺物メイン効果')).forEach(inputKey => {
        if (!inputObj[inputKey]) {
            return;
        }
        const splittedKey = inputObj[inputKey].split('_'); // レアリティ_メイン効果
        let key;
        let rarerity;
        if (splittedKey.length > 1) {
            key = splittedKey[1];
            rarerity = splittedKey[0];
        } else {
            key = splittedKey[0];
            rarerity = '5';
        }
        let toKey = key;
        if (key == 'HP') {
            toKey = 'HP上限';
        } else if (key.endsWith('%')) {
            toKey = key.replace('%', '乗算');
        }
        statusObj[toKey] += 聖遺物メイン効果MasterVar[rarerity][key];
    });

    // 聖遺物·聖遺物サブ効果
    Object.keys(inputObj).filter(s => s.startsWith('聖遺物サブ効果')).forEach(inputKey => {
        const key = inputKey.replace('聖遺物サブ効果', '');
        let toKey = key;
        if (key == 'HP') {
            toKey = 'HP上限';
        } else if (key.endsWith('P')) { // HPP, 攻撃力P, 防御力P
            toKey = key.replace(/P$/, '乗算');
        }
        statusObj[toKey] += Number(inputObj[inputKey]);
        statusObj[inputKey] = Number(inputObj[inputKey]);
    });

    // 元素共鳴を計上します
    選択中元素共鳴データArrVar.forEach(detailObj => {
        if ('詳細' in detailObj) {
            if ($.isArray(detailObj['詳細'])) {
                detailObj['詳細'].forEach(data => {
                    calculateStatus(statusObj, data['種類'], data['数値']);
                });
            } else {
                let data = detailObj['詳細'];
                calculateStatus(statusObj, data['種類'], data['数値']);
            }
        }
    });
}

/**
 * ステータス詳細を更新します
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {Object} inputObj 入力条件詳細
 * @param {Object} characterMasterObj キャラクターマスター
 * @param {Object} weaponMasterObj 武器マスター
 */
function calculateStatusObj(statusObj, inputObj, characterMasterObj, weaponMasterObj) {
    calculateStatusObjSub1(statusObj, inputObj, characterMasterObj, weaponMasterObj);

    // ステータス補正の入力値を計上します
    Object.keys(inputObj).filter(s => $.isNumeric(inputObj[s]) && inputObj[s]).forEach(inputKey => {
        if (['レベル'].includes(inputKey)) return;
        if (inputKey.startsWith('聖遺物サブ効果')) return;
        if (inputKey in statusObj) {
            statusObj[inputKey] += inputObj[inputKey];
        }
    });

    // ステータス調整の入力値を計上します
    Object.keys(inputObj).filter(s => s.startsWith('ステータス調整')).forEach(inputKey => {
        const key = inputKey.replace('ステータス調整', '');
        let toKey = key;
        if (key == 'HP') {
            toKey = 'HP上限';
        } else if (key.endsWith('P')) { // HPP, 攻撃力P, 防御力P
            toKey = key.replace(/P$/, '乗算');
        }
        statusObj[toKey] += Number(inputObj[inputKey]);
    });

    statusObj['ダメージ計算'] = {};

    const my元素スキルObj = characterMasterObj['元素スキル'];
    statusObj['元素スキル'] = {
        使用回数: 1
    };
    Object.keys(my元素スキルObj).forEach(key => {
        if (['継続時間', '発動回数', 'クールタイム', '使用回数'].filter(s => key.endsWith(s)).length == 0) return;
        if ($.isPlainObject(my元素スキルObj[key])) {
            const level = inputObj['元素スキルレベル'];
            if (level in my元素スキルObj[key]) {
                statusObj['元素スキル'][key] = my元素スキルObj[key][level];
            }
        } else {
            statusObj['元素スキル'][key] = my元素スキルObj[key];
        }
    });

    const my元素爆発Obj = characterMasterObj['元素爆発'];
    statusObj['元素爆発'] = {
        元素エネルギー: '元素エネルギー' in my元素爆発Obj ? my元素爆発Obj['元素エネルギー'] : null
    };
    Object.keys(my元素爆発Obj).forEach(key => {
        if (['継続時間', '発動回数', 'クールタイム'].filter(s => key.endsWith(s)).length == 0) return;
        if ($.isPlainObject(my元素爆発Obj[key])) {
            const level = inputObj['元素爆発レベル'];
            if (level in my元素爆発Obj[key]) {
                statusObj['元素爆発'][key] = my元素爆発Obj[key][level];
            }
        } else {
            statusObj['元素爆発'][key] = my元素爆発Obj[key];
        }
    });

    // チームオプションを計上します
    $('#チームオプションステータス変化').html('');
    const validTeamConditionValueArr = makeValidConditionValueArrFromInputObj(inputObj['オプション'], チームオプション条件MapVar);
    const サポーターSet = new Set(チームオプション詳細ArrVar.map(detailObj => detailObj['条件'].split('*')[1]));
    サポーターSet.forEach(name => {
        const labelElem = $('#チームオプション' + selectorEscape(name) + '+label').get()[0];
        if (labelElem) {
            labelElem.classList.remove('selected');
            if (validTeamConditionValueArr.filter(s => s.startsWith('*' + name + '*')).length > 0) {
                labelElem.classList.add('selected');
            }
        }
    });
    if (validTeamConditionValueArr.length > 0) {
        const teamStatusObj = {};
        チームオプション詳細ArrVar.forEach(detailObj => {
            if (detailObj['対象']) return;
            let number = checkConditionMatches(detailObj['条件'], validTeamConditionValueArr);
            if (number == 0) {
                return;
            }
            if (detailObj['数値']) {
                let myNew数値 = detailObj['数値'];
                if (number != 1) {
                    myNew数値 = myNew数値.concat(['*', number]);
                }
                let myサポーター = detailObj['条件'].split('*')[1];
                try {
                    const supporterStatusObj = チームStatusObjMap.get('構成_' + myサポーター);
                    const value = calculateFormulaArray(supporterStatusObj, myNew数値, detailObj['上限']);
                    calculateStatus(teamStatusObj, detailObj['種類'], [value]);
                } catch (e) {
                    // nop
                }
            } else if (detailObj['種類'].indexOf('元素付与') != -1) {
                teamStatusObj['元素付与'] = detailObj['種類'].substring(0, 1);
                switch (選択中キャラクターデータVar['武器']) {
                    case '片手剣':
                    case '両手剣':
                    case '長柄武器':
                        通常攻撃_元素Var = teamStatusObj['元素付与'];
                        重撃_元素Var = teamStatusObj['元素付与'];
                        落下攻撃_元素Var = teamStatusObj['元素付与'];
                        break;
                }
            } else {
                console.error(detailObj);
            }
        });
        Object.keys(teamStatusObj).forEach(key => {
            if ($.isNumeric(teamStatusObj[key])) {
                if (!(key in statusObj)) {
                    statusObj[key] = 0;
                }
                statusObj[key] += teamStatusObj[key];
            } else {
                statusObj[key] = teamStatusObj[key];
            }
        });
        const html = makeステータス変化Html(teamStatusObj);
        $('#チームオプションステータス変化').html(html);
    }

    // その他オプションを計上します
    const miscStatusObj = {};
    $('#その他オプションステータス変化').html('');

    // その他オプション·聖遺物を計上します
    const validMisc1ConditionValueArr = makeValidConditionValueArrFromInputObj(inputObj['オプション'], その他オプション1条件MapVar);
    if (validMisc1ConditionValueArr.length > 0) {
        その他オプション1ArrVar.forEach(detailObj => {
            let key = detailObj['条件'].split('@')[0].replace(/^\*/, '');
            if (Array.from(オプション条件MapVar.keys()).includes(key)) {
                return;
            }
            let number = checkConditionMatches(detailObj['条件'], validMisc1ConditionValueArr);
            if (number == 0) {
                return;
            }
            if (detailObj['種類'].endsWith('元素付与')) {
                let my元素 = detailObj['種類'].replace('元素付与', '');
                通常攻撃_元素Var = my元素;
                重撃_元素Var = my元素;
                落下攻撃_元素Var = my元素;
                return;
            }
            let myNew数値 = detailObj['数値'];
            if (number != 1) {
                myNew数値 = myNew数値.concat(['*', number]);
            }
            calculateStatus(miscStatusObj, detailObj['種類'], myNew数値);
        });
    }

    // その他オプション2を計上します
    const validMisc2ConditionValueArr = makeValidConditionValueArrFromInputObj(inputObj['オプション'], その他オプション2条件MapVar);
    if (validMisc2ConditionValueArr.length > 0) {
        その他オプション2ArrVar.forEach(detailObj => {
            let key = detailObj['条件'].split('@')[0].replace(/^\*/, '');
            if (Array.from(オプション条件MapVar.keys()).includes(key)) {
                return;
            }
            let number = checkConditionMatches(detailObj['条件'], validMisc2ConditionValueArr);
            if (number == 0) {
                return;
            }
            if (detailObj['種類'].endsWith('元素付与')) {
                let my元素 = detailObj['種類'].replace('元素付与', '');
                通常攻撃_元素Var = my元素;
                重撃_元素Var = my元素;
                落下攻撃_元素Var = my元素;
                return;
            }
            let myNew数値 = detailObj['数値'];
            if (number != 1) {
                myNew数値 = myNew数値.concat(['*', number]);
            }
            calculateStatus(miscStatusObj, detailObj['種類'], myNew数値);
        });
    }

    Object.keys(miscStatusObj).forEach(key => {
        if ($.isNumeric(miscStatusObj[key])) {
            if (!(key in statusObj)) {
                statusObj[key] = 0;
            }
            statusObj[key] += miscStatusObj[key];
        } else {
            statusObj[key] = miscStatusObj[key];
        }
    });

    const miscHtml = makeステータス変化Html(miscStatusObj);
    $('#その他オプションステータス変化').html(miscHtml);

    // ステータス変更系詳細ArrMapVarの登録内容を計上します
    // * キャラクター 固有天賦 命ノ星座
    // * 武器 アビリティ
    // * 聖遺物 セット効果
    const validConditionValueArr = makeValidConditionValueArrFromInputObj(inputObj['オプション'], オプション条件MapVar);

    let myPriority1KindArr = ['元素チャージ効率'];    // 攻撃力の計算で参照するステータス 草薙の稲光
    let myPriority1KindFormulaArr = [];
    let myPriority2KindFormulaArr = [];
    let myKindFormulaArr = [];
    ステータス変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(valueObj => {
            let myNew数値 = valueObj['数値'];
            if (valueObj['条件']) {
                let number = checkConditionMatches(valueObj['条件'], validConditionValueArr);
                if (number == 0) return;
                if (number != 1) {
                    myNew数値 = myNew数値.concat(['*', number]);
                }
            }
            if (valueObj['対象']) {
                let workArr = valueObj['対象'].split('.');
                if (['通常攻撃', '重撃', '落下攻撃', '元素スキル', '元素爆発'].includes(workArr[0])) {
                    if (workArr.length > 1) {
                        // FIXME
                    } else {
                        const myNew種類 = valueObj['種類'] + '.' + valueObj['対象'];
                        myKindFormulaArr.push([myNew種類, myNew数値, valueObj['上限']]);
                    }
                }
                return;  // 対象指定ありのものはスキップします
            }
            if (myPriority1KindArr.includes(valueObj['種類'])) { // 攻撃力の計算で参照されるものを先に計上するため…
                myPriority1KindFormulaArr.push([valueObj['種類'], myNew数値, valueObj['上限']]);
            } else if (valueObj['種類'].endsWith('%')) {  // 乗算系(%付き)のステータスアップを先回しします HP 攻撃力 防御力しかないはず
                myPriority2KindFormulaArr.push([valueObj['種類'], myNew数値, valueObj['上限']]);
            } else {
                myKindFormulaArr.push([valueObj['種類'], myNew数値, valueObj['上限']]);
            }
        });
    });
    // 攻撃力の計算で参照されるステータスアップを先に計上します
    myPriority1KindFormulaArr.forEach(entry => {
        calculateStatus(statusObj, entry[0], entry[1], entry[2]);
    });
    // 乗算系のステータスアップを計上します HP% 攻撃力% 防御力%
    myPriority2KindFormulaArr.sort(compareFunction);
    myPriority2KindFormulaArr.forEach(entry => {
        calculateStatus(statusObj, entry[0], entry[1], entry[2]);
    });

    // HP上限 攻撃力 防御力を計算します
    // これより後に乗算系(%付き)のステータスアップがあると計算が狂います
    statusObj['HP上限'] += statusObj['基礎HP'];
    statusObj['HP上限'] += statusObj['基礎HP'] * (statusObj['HP乗算']) / 100;

    statusObj['攻撃力'] += statusObj['基礎攻撃力'];
    statusObj['攻撃力'] += statusObj['基礎攻撃力'] * (statusObj['攻撃力乗算']) / 100;

    statusObj['防御力'] += statusObj['基礎防御力'];
    statusObj['防御力'] += statusObj['基礎防御力'] * (statusObj['防御力乗算']) / 100;

    statusObj['HP上限'] = Math.floor(statusObj['HP上限']);  // 切り捨て
    statusObj['攻撃力'] = Math.floor(statusObj['攻撃力']);  // 切り捨て
    statusObj['防御力'] = Math.floor(statusObj['防御力']);  // 切り捨て

    // それ以外のステータスアップを計上します
    myKindFormulaArr.sort(compareFunction);
    myKindFormulaArr.forEach(entry => {
        calculateStatus(statusObj, entry[0], entry[1], entry[2]);
    });

    // 天賦性能変更系詳細ArrMapVarの登録内容を反映します
    天賦性能変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(value => {
            if (value['条件']) {
                let number = checkConditionMatches(value['条件'], validConditionValueArr);
                if (number == 0) return;
            }
            if (value['種類'].endsWith('元素付与')) {
                let my元素 = value['種類'].replace('元素付与', '');
                if (!value['対象']) {
                    通常攻撃_元素Var = my元素;
                    重撃_元素Var = my元素;
                    落下攻撃_元素Var = my元素;
                } else if (value['対象'] == '通常攻撃ダメージ') {
                    通常攻撃_元素Var = my元素;
                } else if (value['対象'] == '重撃ダメージ') {
                    重撃_元素Var = my元素;
                } else if (value['対象'] == '落下攻撃ダメージ') {
                    落下攻撃_元素Var = my元素;
                }
            }
        });
    });

    Object.keys(statusObj).forEach(propName => {
        if ($.isNumeric(statusObj[propName])) {
            statusObj[propName] = Math.round(statusObj[propName] * 10) / 10;
        }
    });
}

/**
 * 聖遺物スコアを計算します
 * 
 * @param {Object} statusObj ステータス詳細
 */
function calculateArtifactScore(statusObj) {
    let my攻撃力小計 = statusObj['聖遺物サブ効果攻撃力'];
    if (!$('#聖遺物メイン効果2Input').val()) { // 死の羽未設定の場合
        if (my攻撃力小計 >= 聖遺物メイン効果MasterVar['5']['攻撃力']) {
            my攻撃力小計 -= 聖遺物メイン効果MasterVar['5']['攻撃力'];
        }
    }
    let my攻撃力P小計 = statusObj['聖遺物サブ効果攻撃力P'];
    my攻撃力P小計 += my攻撃力小計 / statusObj['基礎攻撃力'];
    if (!$('#聖遺物メイン効果3Input').val()) { // 時の砂未設定の場合
        if (statusObj['聖遺物サブ効果元素チャージ効率'] < 聖遺物メイン効果MasterVar['5']['元素チャージ効率']) { // 攻撃力%とみなします
            if (my攻撃力P小計 >= 聖遺物メイン効果MasterVar['5']['攻撃力%']) {
                my攻撃力P小計 -= 聖遺物メイン効果MasterVar['5']['攻撃力%'];
            }
        }
    }
    if (!$('#聖遺物メイン効果4Input').val()) {  // 空の杯が未設定の場合、攻撃力%とみなします
        if (my攻撃力P小計 >= 聖遺物メイン効果MasterVar['5']['攻撃力%']) {
            my攻撃力P小計 -= 聖遺物メイン効果MasterVar['5']['攻撃力%'];
        }
    }
    let my会心率小計 = statusObj['聖遺物サブ効果会心率'];
    let my会心ダメージ小計 = statusObj['聖遺物サブ効果会心ダメージ'];
    if (!$('#聖遺物メイン効果5Input').val()) { // 理の冠未設定の場合、会心率または会心ダメージとみなします
        if (my会心率小計 >= 聖遺物メイン効果MasterVar['5']['会心率']) {
            my会心率小計 -= 聖遺物メイン効果MasterVar['5']['会心率'];
        } else if (my会心ダメージ小計 >= 聖遺物メイン効果MasterVar['5']['会心ダメージ']) {
            my会心ダメージ小計 -= 聖遺物メイン効果MasterVar['5']['会心ダメージ'];
        }
    }
    let my聖遺物スコア = my攻撃力P小計 + (my会心率小計 * 2) + my会心ダメージ小計;
    my聖遺物スコア = Math.round(my聖遺物スコア * 10) / 10;
    $('#artifact-score').html(my聖遺物スコア);
}

/**
 * ステータス詳細を計算します
 * 
 * @param {Object} statusObj ステータス詳細
 */
const inputOnChangeStatusUpdateSub = function (statusObj) {
    if (!選択中キャラクターデータVar) return;
    if (!選択中武器データVar) return;

    // 初期化
    const inputObj = {
        オプション: {}
    };
    // キャラクター、武器、聖遺物
    キャラクター構成PROPERTY_MAP.forEach((value, key) => {
        if (key.startsWith('聖遺物優先するサブ効果')) return;
        const val = $('#' + selectorEscape(key + 'Input')).val();
        if (value == null) {
            inputObj[key] = val;
        } else {
            inputObj[key] = Number(val);
        }
    });
    // ステータス1, ステータス2
    [
        'ステータスInput',
        'ダメージバフ1Input',
        'ダメージバフ2Input',
        'ダメージアップInput',
        '元素反応ボーナスInput',
        '耐性軽減Input'
    ].forEach(name => {
        $('input[name="' + name + '"]').each(function (index, element) {
            const key = element.id.replace(/Input$/, '');
            const val = $(element).val();
            if ($(element).prop('type') == 'number') {
                inputObj[key] = Number(val);
            } else {
                console.error(key, val, element);
            }
        });
    });
    // 敵
    inputObj['敵'] = $('#敵Input').val();
    inputObj['敵レベル'] = Number($('#敵レベルInput').val());
    $('input[name="敵ステータスInput"]').each(function (index, element) {
        const key = element.id.replace(/Input$/, '');
        const val = $(element).val();
        if ($(element).prop('type') == 'number') {
            inputObj[key] = Number(val);
        } else {
            console.error(key, val, element);
        }
    });
    // 調整
    $('input[name="ステータス調整Input"]').each(function (index, element) {
        const key = element.id.replace(/Input$/, '');
        const val = $(element).val();
        if ($(element).prop('type') == 'number') {
            inputObj[key] = Number(val);
        } else {
            console.error(key, val, element);
        }
    });
    // オプションBox
    オプション条件MapVar.forEach((value, key) => {
        const selector = '#' + selectorEscape(key) + 'Option';
        if ($(selector).length) {
            if ($(selector).get()[0] instanceof HTMLInputElement) { // checkbox
                inputObj['オプション'][key] = $(selector).prop('checked');
            } else {
                inputObj['オプション'][key] = $(selector).prop('selectedIndex');
            }
        }
    });
    // チームオプションBox
    チームオプション条件MapVar.forEach((value, key) => {
        const selector = '#' + selectorEscape(key) + 'Option';
        if ($(selector).length) {
            if ($(selector).get()[0] instanceof HTMLInputElement) { // checkbox
                inputObj['オプション'][key] = $(selector).prop('checked');
            } else {
                inputObj['オプション'][key] = $(selector).prop('selectedIndex');
            }
        }
    });
    // その他オプション1Box
    その他オプション1条件MapVar.forEach((value, key) => {
        const selector = '#' + selectorEscape(key) + 'Option';
        if ($(selector).length) {
            if ($(selector).get()[0] instanceof HTMLInputElement) { // checkbox
                inputObj['オプション'][key] = $(selector).prop('checked');
            } else {
                inputObj['オプション'][key] = $(selector).prop('selectedIndex');
            }
        }
    });
    // その他オプション2Box
    その他オプション2条件MapVar.forEach((value, key) => {
        const selector = '#' + selectorEscape(key) + 'Option';
        if ($(selector).length) {
            if ($(selector).get()[0] instanceof HTMLInputElement) { // checkbox
                inputObj['オプション'][key] = $(selector).prop('checked');
            } else {
                inputObj['オプション'][key] = $(selector).prop('selectedIndex');
            }
        }
    });

    initステータス詳細ObjVar(statusObj);

    // 敵関連データをセットします
    Object.keys(選択中敵データVar).forEach(propName => {
        if (propName in statusObj) {
            statusObj['敵' + propName] = Number(選択中敵データVar[propName]);
        }
    });

    calculateStatusObj(statusObj, inputObj, 選択中キャラクターデータVar, 選択中武器データVar);

    calculateArtifactScore(statusObj);
}

// ステータスAreaを更新します
const inputOnChangeStatusUpdate = function () {
    inputOnChangeStatusUpdateSub(ステータス詳細ObjVar);

    // ステータス詳細ObjVar⇒各Value要素 値をコピーします
    setObjectPropertiesToTableTd(ステータス詳細ObjVar);

    //
    let mode = $('#ステータス1補正入力Toggle').prop('checked') || $('#ステータス2補正入力Toggle').prop('checked');
    applyステータス補正入力モード(mode);

    inputOnChangeResultUpdate(ステータス詳細ObjVar);
}

const buttonToggleCheckboxOnChange = function () {
    let buttonElem = document.getElementById(this.id.replace('Toggle', 'Button'));
    if (buttonElem) {
        $(buttonElem).prop('disabled', !this.checked);
    }
}

// オプションBoxを再構成します
const inputOnChangeOptionUpdate = function () {
    if (!選択中キャラクターデータVar || !選択中武器データVar) return;

    let my条件付き詳細ObjArr = [];
    ['キャラクター', '武器', '聖遺物セット'].forEach(key => {
        if (天賦性能変更系詳細ArrMapVar.has(key)) {
            天賦性能変更系詳細ArrMapVar.get(key).forEach(detailObj => {
                if (detailObj['条件']) {
                    my条件付き詳細ObjArr.push(detailObj);
                }
            });
        }
        if (ステータス変更系詳細ArrMapVar.has(key)) {
            ステータス変更系詳細ArrMapVar.get(key).forEach(detailObj => {
                if (detailObj['条件']) {
                    my条件付き詳細ObjArr.push(detailObj);
                }
            });
        }
    });
    console.debug('my条件付き詳細ObjArr');
    console.debug(my条件付き詳細ObjArr);

    オプション条件MapVar.clear();
    オプション排他MapVar.clear();

    my条件付き詳細ObjArr.forEach(entry => {
        makeConditionExclusionMapFromStr(entry['条件'], オプション条件MapVar, オプション排他MapVar);
    });

    Array.from(その他オプション1条件MapVar.keys()).forEach(key => {
        let selector = '#' + selectorEscape(key + 'Option');
        if (Array.from(オプション条件MapVar.keys()).includes(key.replace(/^\*/, ''))) {
            $(selector).prop('disabled', true);
            $(selector).prev('label').addClass('disabled');
        } else {
            $(selector).prop('disabled', false);
            $(selector).prev('label').removeClass('disabled');
        }
    });
    Array.from(その他オプション2条件MapVar.keys()).forEach(key => {
        let selector = '#' + selectorEscape(key + 'Option');
        if (Array.from(オプション条件MapVar.keys()).includes(key.replace(/^\*/, ''))) {
            $(selector).prop('disabled', true);
            $(selector).prev('label').addClass('disabled');
        } else {
            $(selector).prop('disabled', false);
            $(selector).prev('label').removeClass('disabled');
        }
    });

    // オプションを作り直します
    $('#オプションBox').empty();
    appendInputForOptionElement('オプションBox', オプション条件MapVar, オプション排他MapVar, 'オプション');
    // オプションの状態を復元します
    オプションElementIdValue記憶Map.forEach((value, key) => {
        let elem = document.getElementById(key);
        if (elem) {
            if (elem instanceof HTMLInputElement) {
                elem.checked = value;
                if (value) {
                    let myName = key.replace('Option', '');
                    if (オプション排他MapVar.has(myName)) {
                        let exclusionArr = オプション排他MapVar.get(myName);
                        if (exclusionArr) {
                            exclusionArr.forEach(exclusion => {
                                let exclusionElem = document.getElementById(exclusion + 'Option');
                                if (exclusionElem && exclusionElem instanceof HTMLInputElement) {
                                    exclusionElem.checked = false;
                                }
                            });
                        }
                    }
                }
            } else if (elem instanceof HTMLSelectElement) {
                elem.selectedIndex = value;
                if (value > 0) {
                    let myName = key.replace('Option', '');
                    if (オプション排他MapVar.has(myName)) {
                        let exclusionArr = オプション排他MapVar.get(myName);
                        if (exclusionArr) {
                            exclusionArr.forEach(exclusion => {
                                let exclusionElem = document.getElementById(exclusion + 'Option');
                                if (exclusionElem && exclusionElem instanceof HTMLSelectElement) {
                                    exclusionElem.selectedIndex = 0;
                                }
                            });
                        }
                    }
                }
            } else {
                console.error(elem, value, key);
            }
            applyOptionVariable(ステータス詳細ObjVar, elem);
        }
    });

    inputOnChangeStatusUpdate();

    build天賦詳細レベル変動();
};

/**
 * オプションElementから対応する固有変数を更新します
 * 
 * @param {Object} statusObj ステータス詳細
 * @param {HTMLElement} elem HTML要素
 */
function applyOptionVariable(statusObj, elem) {
    if (!選択中キャラクターデータVar) return;
    if (elem instanceof HTMLSelectElement) {
        let propName = elem.id.replace('Option', '');
        if ('固有変数' in 選択中キャラクターデータVar && propName in 選択中キャラクターデータVar['固有変数']) {
            if (elem.value) {
                let re = new RegExp('[^0-9]*([0-9\\.]+).*');
                let reRet = re.exec(elem.value);
                if (reRet) {
                    let propValue = Number(reRet[1]);
                    statusObj[propName] = propValue;
                }
            } else {    // 未選択の場合は初期値をセットします
                statusObj[propName] = Number(選択中キャラクターデータVar['固有変数'][propName]);
            }
        }
    }
}

/**
 * オプション 変更イベント Sub
 * 
 * @param {HTMLInputElement|HTMLSelectElement} opt_elem 
 */
const オプションInputOnChangeSub = function (opt_elem = null) {
    if (!opt_elem) {
        opt_elem = this;
    }
    if ((opt_elem instanceof HTMLInputElement && opt_elem.checked) || (opt_elem instanceof HTMLSelectElement && opt_elem.value)) {
        let conditionName = opt_elem.id.replace('Option', '');
        オプション排他MapVar.forEach((value, key) => {
            if (key != conditionName) return;
            value.forEach(entry => {
                let elem = document.getElementById(entry + 'Option');
                if (elem instanceof HTMLInputElement) {
                    elem.checked = false;
                } else if (elem instanceof HTMLSelectElement) {
                    elem.value = '';
                }
            });
        });
    }

    オプションElementIdValue記憶Map.set(opt_elem.id, opt_elem instanceof HTMLInputElement ? opt_elem.checked : opt_elem.selectedIndex);    // チェック状態または選択要素のインデックスを保持します
    applyOptionVariable(ステータス詳細ObjVar, opt_elem);
    inputOnChangeStatusUpdate();
};

/**
 * オプション 変更イベント
 */
const オプションInputOnChange = function () {
    オプションInputOnChangeSub(this);

    build天賦詳細レベル変動();

    enable構成保存Button();
};

/**
 * 敵 変更イベント
 * 
 * @param {Object} statusObj ステータス詳細
 */
function inputOnChangeEnemyUpdate(statusObj) {
    let my敵 = $('#敵Input').val().toString();
    if (!my敵) return;
    選択中敵データVar = 敵MasterVar[my敵];
    Object.keys(選択中敵データVar).forEach(propName => {
        statusObj['敵' + propName] = 選択中敵データVar[propName];
    });
    statusObj['敵防御力'] = 0;
}

/**
 * 敵 変更イベント
 */
const 敵InputOnChange = function () {
    inputOnChangeEnemyUpdate(ステータス詳細ObjVar);
    inputOnChangeStatusUpdate();
}

/**
 * 元素共鳴 変更イベント
 * 
 * @param {Event} event 
 */
const elementalResonanceInputOnChange = function (event) {
    if (event.currentTarget instanceof HTMLInputElement) {
        if (event.currentTarget == $('#元素共鳴なしInput').get(0) && event.currentTarget.checked) {
            $('input[name="元素共鳴Input"]').each(function (index, element) {
                if (element != $('#元素共鳴なしInput').get(0)) {
                    $(element).prop('checked', false);
                }
            });
            選択中元素共鳴データArrVar = [];
            選択中元素共鳴データArrVar.push(元素共鳴MasterVar['元素共鳴なし']);
        } else {
            $('#元素共鳴なしInput').prop('checked', false);
            let count = 0;
            $('[name="元素共鳴Input"').each(function (index, element) {
                if ($(element).prop('checked')) {
                    count++;
                }
            });
            if (count > 2) {
                event.currentTarget.checked = false;
            } else {
                選択中元素共鳴データArrVar = [];
                $('[name="元素共鳴Input"').each(function (index, element) {
                    if ($(element).prop('checked')) {
                        選択中元素共鳴データArrVar.push(元素共鳴MasterVar[$(element).val().toString()]);
                    }
                });
            }
        }
    }
    $('#元素共鳴効果説明Box').empty();
    選択中元素共鳴データArrVar.forEach(data => {
        let my説明 = data['説明'];
        if (Array.isArray(my説明)) {
            my説明.join('<br>');
        }
        $('<p>', {
            html: my説明
        }).appendTo('#元素共鳴効果説明Box');
    });
    inputOnChangeStatusUpdate();
}

// 聖遺物セット効果説明
function setup聖遺物セット効果説明() {
    $('#artifactset1-desc').html('');
    $('#artifactset2-desc').html('');
    let myInput1Value = $('#聖遺物セット効果1Input').val().toString();
    let mySet1Name = myInput1Value;
    if (myInput1Value) {
        $('#artifactset1-button img').attr('src', 聖遺物セット効果MasterVar[myInput1Value]['image']);
        $('#artifactset1-button img').attr('alt', myInput1Value);

        mySet1Name += ' 2セット効果';
        if ('image' in 聖遺物セット効果MasterVar[myInput1Value]) {
            $('#artifactset1-img').attr('src', 聖遺物セット効果MasterVar[myInput1Value]['image']);
        } else {
            $('#artifactset1-img').attr('src', 'images/artifacts/3_Adventurer.png');
        }
        $('#artifactset1-img').attr('alt', myInput1Value);
        $('#artifactset1-desc').html(makeHtml(聖遺物セット効果MasterVar[myInput1Value]['2セット効果']));
    }
    let myInput2Value = $('#聖遺物セット効果2Input').val().toString();
    let mySet2Name = myInput2Value;
    if (myInput2Value) {
        $('#artifactset2-button img').attr('src', 聖遺物セット効果MasterVar[myInput2Value]['image']);
        $('#artifactset2-button img').attr('alt', myInput2Value);

        if ('image' in 聖遺物セット効果MasterVar[myInput2Value]) {
            $('#artifactset2-img').attr('src', 聖遺物セット効果MasterVar[myInput2Value]['image']);
        } else {
            $('#artifactset2-img').attr('src', 'images/artifacts/3_Adventurer.png');
        }
        $('#artifactset2-img').attr('alt', myInput1Value);
        if (myInput1Value == myInput2Value) {
            mySet2Name += ' 4セット効果';
            if ('4セット効果' in 聖遺物セット効果MasterVar[myInput2Value]) {
                $('#artifactset2-desc').html(makeHtml(聖遺物セット効果MasterVar[myInput2Value]['4セット効果']));
            }
        } else {
            mySet2Name += ' 2セット効果';
            $('#artifactset2-desc').html(makeHtml(聖遺物セット効果MasterVar[myInput2Value]['2セット効果']));
        }
    }
    $('#artifactset1-name').html(mySet1Name);
    $('#artifactset2-name').html(mySet2Name);
}

// 聖遺物サブ効果 変更イベント
const inputOnChangeArtifactSubUpdate = function () {
    if ($('#聖遺物詳細計算停止Config').prop('checked')) {
        inputOnChangeStatusUpdate();
        return;
    }

    let priorityArr = [];
    let middlePriorityArr = [];
    let lowPriorityArr = [
        '会心率',
        '会心ダメージ',
        '元素チャージ効率',
        '元素熟知',
        '攻撃力%',
        'HP%',
        '防御力%',
        '攻撃力',
        'HP',
        '防御力'
    ];
    [
        '聖遺物優先するサブ効果1Input',
        '聖遺物優先するサブ効果2Input',
        '聖遺物優先するサブ効果3Input'
    ].forEach(elemId => {
        const elem = document.getElementById(elemId);
        if (!($(elem).val())) return;
        const priorityStatus = $(elem).val().toString();
        if (priorityStatus) {
            if (middlePriorityArr.indexOf(priorityStatus) != -1) {
                middlePriorityArr = middlePriorityArr.filter(e => e != priorityStatus);
            }
            if (lowPriorityArr.indexOf(priorityStatus) != -1) {
                lowPriorityArr = lowPriorityArr.filter(e => e != priorityStatus);
            }
            if (priorityStatus.endsWith('%')) {
                let secondStatus = priorityStatus.replace('%', '');
                if (!middlePriorityArr.includes(secondStatus)) {
                    middlePriorityArr.push(secondStatus);
                }
                if (lowPriorityArr.indexOf(secondStatus) != -1) {
                    lowPriorityArr = lowPriorityArr.filter(e => e != secondStatus);
                }
            }
        }
    });
    priorityArr = middlePriorityArr.concat(lowPriorityArr);

    let workObj = {
        HP: 0,
        攻撃力: 0,
        防御力: 0,
        元素熟知: 0,
        HPP: 0,
        攻撃力P: 0,
        防御力P: 0,
        会心率: 0,
        会心ダメージ: 0,
        元素チャージ効率: 0
    };
    let myレアリティ補正 = 0;
    $('select[name="聖遺物メイン効果Input"').each((index, element) => {
        if (!$(element).val()) return;
        let splitted = $(element).val().toString().split('_');
        if (splitted[0] == '4') {   // ★4ひとつ当たり7%数値を下げます
            myレアリティ補正 += 7;
        }
    });
    let my優先するサブ効果Arr = [];
    let my優先するサブ効果回数合計 = 0;
    Array.from(document.getElementsByName('聖遺物優先するサブ効果Input')).forEach(elem => {
        let propName = $(elem).val();
        if (propName) {
            propName = propName.toString();
            const 上昇値Elem = document.getElementById(elem.id.replace('Input', '上昇値Input'));
            const 上昇回数Elem = document.getElementById(elem.id.replace('Input', '上昇回数Input'));
            const 上昇値 = Number($(上昇値Elem).val());
            const 上昇回数 = Number($(上昇回数Elem).val());
            const targetValue = 上昇値 * 上昇回数;
            const resultValue = searchArtifactSubApproximation(propName, 上昇回数, targetValue);
            const toKey = propName.replace('%', 'P');
            workObj[toKey] += resultValue * (100 - myレアリティ補正) / 100;
            if (!my優先するサブ効果Arr.includes(propName)) {
                my優先するサブ効果Arr.push(propName);
            }
            my優先するサブ効果回数合計 += 上昇回数;
        }
    });
    let my優先しないサブ効果回数 = Math.min(45, 40 + Math.round(Math.max(0, (my優先するサブ効果回数合計 - 12) / 4)));
    my優先しないサブ効果回数 -= Math.min(45, my優先するサブ効果回数合計);

    $('#回数Display').text(my優先するサブ効果回数合計 + my優先しないサブ効果回数);

    for (let i = 0; i < priorityArr.length; i++) {
        let status = priorityArr[i];
        let workStatus = status;
        if (status.endsWith('%')) {
            workStatus = status.replace('%', 'P');
        }
        let value = 聖遺物サブ効果MasterVar[status][3];
        let multi = Math.floor(my優先しないサブ効果回数 / (10 - my優先するサブ効果Arr.length));
        let mod = my優先しないサブ効果回数 % (10 - my優先するサブ効果Arr.length);
        if (i < mod) {
            multi += 1;
        }
        workObj[workStatus] = value * multi * (100 - myレアリティ補正) / 100;
    }
    setInputValue('#聖遺物サブ効果HPInput', workObj['HP']);
    setInputValue('#聖遺物サブ効果攻撃力Input', workObj['攻撃力']);
    setInputValue('#聖遺物サブ効果防御力Input', workObj['防御力']);
    setInputValue('#聖遺物サブ効果元素熟知Input', workObj['元素熟知']);
    setInputValue('#聖遺物サブ効果HPPInput', workObj['HPP']);
    setInputValue('#聖遺物サブ効果攻撃力PInput', workObj['攻撃力P']);
    setInputValue('#聖遺物サブ効果防御力PInput', workObj['防御力P']);
    setInputValue('#聖遺物サブ効果会心率Input', workObj['会心率']);
    setInputValue('#聖遺物サブ効果会心ダメージInput', workObj['会心ダメージ']);
    setInputValue('#聖遺物サブ効果元素チャージ効率Input', workObj['元素チャージ効率']);

    inputOnChangeStatusUpdate();
};

// 聖遺物セット効果変更時の処理
// 戻り値
//  true: 聖遺物メイン効果を更新した
function inputOnChangeArtifactSetUpdate() {
    let isArtifactMainUpdated = false;

    const preSet1Value = ELEMENT_VALUE_AT_FOCUS_MAP.get('聖遺物セット効果1Input');
    const preSet2Value = ELEMENT_VALUE_AT_FOCUS_MAP.get('聖遺物セット効果2Input');
    ['聖遺物セット効果1Input', '聖遺物セット効果2Input'].forEach(id => {
        ELEMENT_VALUE_AT_FOCUS_MAP.set(id, $('#' + selectorEscape(id)).val().toString());
    });

    let preRarerity4Num = 0;
    if (preSet1Value && 聖遺物セット効果MasterVar[preSet1Value]['レアリティ'] == 4) {
        preRarerity4Num++;
    }
    if (preSet2Value && 聖遺物セット効果MasterVar[preSet2Value]['レアリティ'] == 4) {
        preRarerity4Num++;
    }
    let curRarerity4Num = 0;
    if (聖遺物セット効果MasterVar[$('#聖遺物セット効果1Input').val().toString()]['レアリティ'] == 4) {
        curRarerity4Num++;
    }
    if (聖遺物セット効果MasterVar[$('#聖遺物セット効果2Input').val().toString()]['レアリティ'] == 4) {
        curRarerity4Num++;
    }
    // 聖遺物セットのレアリティが変化する場合は、聖遺物メイン効果のレアリティを書き換えます
    if (preRarerity4Num != curRarerity4Num) {
        const rarerityArrArr = [[5, 5, 5, 5, 5], [4, 4, 5, 5, 5], [4, 4, 4, 5, 4]];
        for (let i = 0; i < rarerityArrArr[curRarerity4Num].length; i++) {
            let elem = document.getElementById('聖遺物メイン効果' + (i + 1) + 'Input');
            if (!$(elem).val()) continue;
            let rarerity = rarerityArrArr[curRarerity4Num][i];
            let statusName = $(elem).val().toString().split('_')[1];
            $(elem).val(rarerity + '_' + statusName);
            ELEMENT_VALUE_AT_FOCUS_MAP.set(elem.id, $(elem).val().toString());
        }
        // 聖遺物メイン効果を更新しました
        isArtifactMainUpdated = true;
    }

    選択中聖遺物セット効果データArrVar = [];
    if ($('#聖遺物セット効果1Input').val() == $('#聖遺物セット効果2Input').val()) {
        let myData = 聖遺物セット効果MasterVar[$('#聖遺物セット効果1Input').val().toString()];
        選択中聖遺物セット効果データArrVar.push(myData['2セット効果']);
        if ('4セット効果' in myData) {
            選択中聖遺物セット効果データArrVar.push(myData['4セット効果']);
        }
    } else {
        選択中聖遺物セット効果データArrVar.push(聖遺物セット効果MasterVar[$('#聖遺物セット効果1Input').val().toString()]['2セット効果']);
        選択中聖遺物セット効果データArrVar.push(聖遺物セット効果MasterVar[$('#聖遺物セット効果2Input').val().toString()]['2セット効果']);
    }

    // 説明Boxを再構成します
    //$('#聖遺物セット効果説明Box').empty();
    選択中聖遺物セット効果データArrVar.forEach(data => {
        //let my説明 = data['説明'];
        //if (Array.isArray(my説明)) {
        //    my説明.join('<br>');
        //}
        //$('<p>', {
        //    html: my説明
        //}).appendTo('#聖遺物セット効果説明Box');
        if ('オプション初期値' in data) {
            Object.keys(data['オプション初期値']).forEach(key => {
                let elemId = key + 'Option';
                let value = data['オプション初期値'][key];
                if (!オプションElementIdValue記憶Map.has(elemId)) {
                    オプションElementIdValue記憶Map.set(elemId, value);
                }
            });
        }
    });

    setup聖遺物セット効果説明();

    return isArtifactMainUpdated;
}

// 聖遺物セット効果 変更イベント
const 聖遺物セットInputOnChange = function () {
    let isArtifactMainUpdated = inputOnChangeArtifactSetUpdate();
    if (isArtifactMainUpdated) {    // メイン効果のレアリティ変更時はサブ効果を再計算します
        inputOnChangeArtifactSubUpdate();
    }
    setupBaseDamageDetailDataArtifactSet();
    inputOnChangeOptionUpdate();
}

const 聖遺物メイン効果InputOnChange = function () {
    if (this.value) {
        let preValue = ELEMENT_VALUE_AT_FOCUS_MAP.get(this.id);
        if (preValue != null) {
            let preRarerity = preValue.split('_')[0];
            let curRarerity = this.value.split('_')[0];
            if (curRarerity != preRarerity) {
                inputOnChangeArtifactSubUpdate();
            } else {
                inputOnChangeStatusUpdate();
            }
        } else {
            inputOnChangeArtifactSubUpdate();
        }
    } else {
        inputOnChangeStatusUpdate();
    }
}

/**
 * 
 * @param {HTMLInputElement} element 
 * @param {number | string} opt_value 
 */
function inputOnChangeArtifactPrioritySubUpdate(element, opt_value = null) {
    let unitSelector = '#' + element.id.replace('Input', '上昇値Input');
    let selectedIndex = $(unitSelector).prop('selectedIndex');
    if (selectedIndex == -1) {
        selectedIndex = 6;
    }
    $(unitSelector).empty();
    let statusName = element.value;
    if (!statusName) {
        return;
    }
    const valueIndexMap = new Map();
    let index = 0;
    let master = 聖遺物サブ効果MasterVar[statusName];
    const postfixArr = ['(最高)', '(高め)', '(低め)', '(最低)'];
    for (let j = 0; j < master.length; j++) {
        $('<option>', {
            text: master[j] + postfixArr[j],
            value: master[j]
        }).appendTo(unitSelector);
        valueIndexMap.set(index++, master[j]);
        if (j < master.length - 1) {
            for (let k = 1; k <= 3; k++) {
                let value = (master[j] - (master[j] - master[j + 1]) * k / 4).toFixed(1);
                $('<option>', {
                    text: value,
                    value: value
                }).appendTo(unitSelector);
                valueIndexMap.set(index++, value);
            }
        }
    }
    if (opt_value != null) {
        valueIndexMap.forEach((value, key) => {
            if (Number(value) >= Number(opt_value)) {
                selectedIndex = key;
            }
        });
    }
    $(unitSelector).prop('selectedIndex', selectedIndex);
}

function inputOnChangeArtifactPrioritySubUpdateAll() {
    for (let i = 1; i <= 3; i++) {
        const elem = /** @type {HTMLInputElement} */ (document.getElementById('聖遺物優先するサブ効果' + i + 'Input'));
        inputOnChangeArtifactPrioritySubUpdate(elem);
    }
}

const 聖遺物優先するサブ効果InputOnChange = function () {
    inputOnChangeArtifactPrioritySubUpdate(this);
    inputOnChangeArtifactSubUpdate();
}

const 厳選目安ToggleOnChange = function () {
    $('#厳選目安Input').prop('disabled', !this.checked);
    $('#厳選目安Input').prop('selectedIndex', 0);
}

const 厳選目安InputOnChange = function () {
    if (this.value) {
        const 上昇値Arr = [[], [6, 6, 6], [6, 6, 6], [5, 5, 5], [4, 4, 4]];
        const 上昇回数Arr = [[], [4, 4, 4], [8, 5, 5], [11, 7, 7], [15, 10, 10]];
        for (let i = 0; i < 上昇回数Arr[Number(this.value)].length; i++) {
            const id = '聖遺物優先するサブ効果' + (i + 1) + 'Input';
            const elem = document.getElementById(id);
            if ($(elem).val()) {
                const 上昇値Id = '聖遺物優先するサブ効果' + (i + 1) + '上昇値Input';
                const 上昇回数Id = '聖遺物優先するサブ効果' + (i + 1) + '上昇回数Input';
                $('#' + 上昇値Id).prop('selectedIndex', 上昇値Arr[Number(this.value)][i]);
                $('#' + 上昇回数Id).val(上昇回数Arr[Number(this.value)][i]);
            }
        }
        $('#厳選目安Input').prop('disabled', true);
        $('#厳選目安Toggle').prop('checked', false);
        inputOnChangeArtifactSubUpdate();
        enable構成保存Button();
    }
}

/**
 * 天賦説明設定を作成します
 * 
 * @param {Object} obj 天賦詳細
 * @param {string} level 天賦レベル
 * @returns {string} HTML
 */
function makeTalentStatTableTr(obj, level) {
    const re = new RegExp('\\d+(\\.\\d+)?', 'g');

    let innerHtml = '';
    if ('詳細' in obj) {
        obj['詳細'].forEach(valueObj => {
            if ('名前' in valueObj) {
                innerHtml += '<tr>';
                innerHtml += '<th>';
                innerHtml += valueObj['名前'];
                innerHtml += '</th>';
                innerHtml += '<td>';
                if ('数値' in valueObj) {
                    let my数値;
                    if ($.isPlainObject(valueObj['数値'])) {
                        my数値 = valueObj['数値'][level];
                    } else {
                        my数値 = valueObj['数値'];
                    }
                    if (my数値 instanceof String || typeof (my数値) == 'string') {
                        innerHtml += my数値.replace(re, (match) => {
                            if (Number(match) >= 10) {
                                return (Math.round(Number(match) * 10) / 10).toFixed(1);
                            } else {
                                return (Math.round(Number(match) * 100) / 100).toFixed(2).replace(/\.0+$/, '');
                            }
                        });
                    } else {
                        innerHtml += my数値;
                    }
                }
                innerHtml += '</td>';
                innerHtml += '</tr>';
            }
        });
    }
    return innerHtml;
}

function build天賦詳細レベル変動() {
    $('#talent2-duration').html('');
    $('#talent2-trigger-quota').html('');
    $('#talent2-cd').html('');
    $('#talent2-charge').html('');

    $('#talent3-duration').html('');
    $('#talent3-trigger-quota').html('');
    $('#talent3-cd').html('');

    $('#talent1-stat').html('');
    $('#talent2-stat').html('');
    $('#talent3-stat').html('');

    if ('元素スキル' in 選択中キャラクターデータVar) {
        const obj = 選択中キャラクターデータVar['元素スキル'];
        let apartObj = {};
        if ('元素スキル' in ステータス詳細ObjVar) {
            apartObj = ステータス詳細ObjVar['元素スキル'];
        }

        let durationHtml = '';
        Object.keys(obj).filter(s => s.endsWith('継続時間')).forEach(key => {
            let value = obj[key];
            if (key in apartObj && apartObj[key]) {
                value = apartObj[key];
                if (key in obj && $.isNumeric(obj[key]) && obj[key] == apartObj[key]) {
                    value = value.toFixed(1) + '秒';
                } else {
                    value = '<span class="strong">' + value.toFixed(1) + '秒</span>';
                }
            } else if ($.isNumeric(value)) {
                value = obj[key];
                value = value.toFixed(1) + '秒';
            } else if ($.isPlainObject(value)) {
                // TODO
                value = '';
            }
            durationHtml += key.replace(/の?継続時間/, '') + value + '<br>';
        });
        $('#talent2-duration').html(durationHtml);
        if (durationHtml) {
            $('#talent2-duration').prev().show();
            $('#talent2-duration').show();
        } else {
            $('#talent2-duration').prev().hide();
            $('#talent2-duration').hide();
        }

        let triggerQuotaHtml = '';
        Object.keys(obj).filter(s => s.endsWith('発動回数')).forEach(key => {
            let value = obj[key];
            if (key in apartObj && apartObj[key]) {
                value = apartObj[key];
            } else {
                value = obj[key];
            }
            if ($.isNumeric(value)) {
                value = value + '回';
            } else if ($.isPlainObject(value)) {
                // TODO
                value = '';
            }
            triggerQuotaHtml += key.replace(/の?発動回数/, '') + value + '<br>';
        });
        $('#talent2-trigger-quota').html(triggerQuotaHtml);
        if (triggerQuotaHtml) {
            $('#talent2-trigger-quota').prev().show();
            $('#talent2-trigger-quota').show();
        } else {
            $('#talent2-trigger-quota').prev().hide();
            $('#talent2-trigger-quota').hide();
        }

        let cdHtml = '';
        Object.keys(obj).filter(s => s.endsWith('クールタイム')).forEach(key => {
            let value = obj[key];
            if (key in apartObj && apartObj[key]) {
                value = apartObj[key];
                if (key in obj && $.isNumeric(obj[key])) {
                    if (obj[key] == apartObj[key]) {
                        value = value.toFixed(1) + '秒';
                    } else {
                        value = '<span class="strong">' + value.toFixed(1) + '秒</span>';
                    }
                } else {
                    value = value + '秒';
                }
            } else if ($.isNumeric(value)) {
                value = obj[key];
                value = value.toFixed(1) + '秒';
            } else if ($.isPlainObject(value)) {
                // TODO
                value = '';
            }
            cdHtml += key.replace(/の?クールタイム/, '') + value + '<br>';
        });
        $('#talent2-cd').html(cdHtml);

        if ('使用回数' in apartObj && Number(apartObj['使用回数']) > 1) {
            let chargeHtml = apartObj['使用回数'] + '回';
            if (!('使用回数' in obj) || Number(obj['使用回数']) != Number(apartObj['使用回数'])) {
                chargeHtml = '<span class="strong">' + chargeHtml + '</span>';
            }
            $('#talent2-charge').html(chargeHtml);
            $('#talent2-charge').prev().show();
            $('#talent2-charge').show();
        } else {
            $('#talent2-charge').prev().hide();
            $('#talent2-charge').hide();
        }
    }

    if ('元素爆発' in 選択中キャラクターデータVar) {
        const obj = 選択中キャラクターデータVar['元素爆発'];
        let apartObj = {};
        if ('元素爆発' in ステータス詳細ObjVar) {
            apartObj = ステータス詳細ObjVar['元素爆発'];
        }

        let durationHtml = '';
        Object.keys(obj).filter(s => s.endsWith('継続時間')).forEach(key => {
            let value = obj[key];
            if (key in apartObj && apartObj[key]) {
                value = apartObj[key];
                if (key in obj && $.isNumeric(obj[key]) && obj[key] == apartObj[key]) {
                    value = value.toFixed(1) + '秒';
                } else {
                    value = '<span class="strong">' + value.toFixed(1) + '秒</span>';
                }
            } else if ($.isNumeric(value)) {
                value = obj[key];
                value = value.toFixed(1) + '秒';
            } else if ($.isPlainObject(value)) {
                // TODO
                value = '';
            }
            durationHtml += key.replace(/の?継続時間/, '') + value + '<br>';
        });
        $('#talent3-duration').html(durationHtml);
        if (durationHtml) {
            $('#talent3-duration').prev().show();
            $('#talent3-duration').show();
        } else {
            $('#talent3-duration').prev().hide();
            $('#talent3-duration').hide();
        }

        let triggerQuotaHtml = '';
        Object.keys(obj).filter(s => s.endsWith('発動回数')).forEach(key => {
            let value = obj[key];
            if (key in apartObj && apartObj[key]) {
                value = apartObj[key];
            } else {
                value = obj[key];
            }
            if ($.isNumeric(value)) {
                value = value + '回';
            } else if ($.isPlainObject(value)) {
                // TODO
                value = '';
            }
            triggerQuotaHtml += key.replace(/の?発動回数/, '') + value + '<br>';
        });
        $('#talent3-trigger-quota').html(triggerQuotaHtml);
        if (triggerQuotaHtml) {
            $('#talent3-trigger-quota').prev().show();
            $('#talent3-trigger-quota').show();
        } else {
            $('#talent3-trigger-quota').prev().hide();
            $('#talent3-trigger-quota').hide();
        }

        let cdHtml = '';
        Object.keys(obj).filter(s => s.endsWith('クールタイム')).forEach(key => {
            let value = obj[key];
            if (key in apartObj && apartObj[key]) {
                value = apartObj[key];
                if (key in obj && $.isNumeric(obj[key]) && obj[key] == apartObj[key]) {
                    value = value.toFixed(1) + '秒';
                } else {
                    value = '<span class="strong">' + value.toFixed(1) + '秒</span>';
                }
            } else if ($.isNumeric(value)) {
                value = obj[key];
                value = value.toFixed(1) + '秒';
            } else if ($.isPlainObject(value)) {
                // TODO
                value = '';
            }
            cdHtml += key.replace(/の?クールタイム/, '') + value + '<br>';
        });
        $('#talent3-cd').html(cdHtml);
    }

    const validConditionValueArr = makeValidConditionValueArr('#オプションBox');

    let talent1InnerHtml = '';
    ['特殊通常攻撃', '特殊重撃', '特殊落下攻撃'].forEach(kind => {
        if (kind in 選択中キャラクターデータVar) {
            const obj = 選択中キャラクターデータVar[kind];
            if (checkConditionMatches(obj['条件'], validConditionValueArr) == 0) {
                return;
            }
            let level = String($('#通常攻撃レベルInput').val());
            if ('種類' in obj) {
                switch (obj['種類']) {
                    case '元素スキルダメージ':
                        level = String($('#元素スキルレベルInput').val());
                        break;
                    case '元素爆発ダメージ':
                        level = String($('#元素爆発レベルInput').val());
                        break;
                }
            }
            talent1InnerHtml += makeTalentStatTableTr(obj, level);
        }
    });
    if (!talent1InnerHtml) {
        let level = String($('#通常攻撃レベルInput').val());
        ['通常攻撃', '重撃', '落下攻撃'].forEach(kind => {
            const obj = 選択中キャラクターデータVar[kind];
            talent1InnerHtml += makeTalentStatTableTr(obj, level);
        });
    }
    if (talent1InnerHtml) {
        talent1InnerHtml = '<table>' + talent1InnerHtml + '</table>';
    }
    $('#talent1-stat').html(talent1InnerHtml);

    if ('元素スキル' in 選択中キャラクターデータVar) {
        let level = String($('#元素スキルレベルInput').val());
        const obj = 選択中キャラクターデータVar['元素スキル'];
        let innerHtml = makeTalentStatTableTr(obj, level);
        if (innerHtml) {
            innerHtml = '<table>' + innerHtml + '</table>';
        }
        $('#talent2-stat').html(innerHtml);
    }

    if ('元素爆発' in 選択中キャラクターデータVar) {
        let level = String($('#元素爆発レベルInput').val());
        const obj = 選択中キャラクターデータVar['元素爆発'];
        let innerHtml = makeTalentStatTableTr(obj, level);
        if (innerHtml) {
            innerHtml = '<table>' + innerHtml + '</table>';
        }
        $('#talent3-stat').html(innerHtml);
    }
}

function build天賦詳細() {
    const characterData = キャラクターリストMasterVar[$('#キャラクターInput').val().toString()];
    const url = characterData['import'];
    let urlArr = url.split('/');
    let dirName = urlArr[urlArr.length - 1].replace('.json', '');

    $('#talent1-name').html(通常攻撃名称Var);
    $('#talent1-img').attr('src', 'images/characters/' + WEAPON_TYPE_IMG_FILE_ALIST[characterData['武器']]);
    $('#talent1-img').prop('alt', 通常攻撃名称Var);
    $('#talent1-desc').html('');

    $('#talent2-name').html(元素スキル名称Var);
    $('#talent2-img').prop('src', 'images/characters/' + dirName + '/ElementalSkill.png');
    $('#talent2-img').prop('alt', 元素スキル名称Var);
    // $('#talent2-particle').html('');
    $('#talent2-desc').html('');

    $('#talent3-name').html(元素爆発名称Var);
    $('#talent3-img').prop('src', 'images/characters/' + dirName + '/ElementalBurst.png');
    $('#talent3-img').prop('alt', 元素爆発名称Var);
    $('#talent3-energy-cost').html('');
    $('#talent3-desc').html('');

    let talent1Desc = '';
    ['通常攻撃', '重撃', '落下攻撃'].forEach(kind => {
        const obj = 選択中キャラクターデータVar[kind];
        if ('説明' in obj) {
            talent1Desc += '<span class="strong">' + kind + '</span><br>';
            talent1Desc += makeHtml(obj) + '<br>';
        }
    });
    $('#talent1-desc').html(talent1Desc);

    if ('元素スキル' in 選択中キャラクターデータVar) {
        const obj = 選択中キャラクターデータVar['元素スキル'];

        // if ('粒子生成数' in obj) {
        //     let my粒子生成数 = obj['粒子生成数'];
        //     if ($.isNumeric(my粒子生成数)) {
        //         my粒子生成数 = my粒子生成数 + '個';
        //     }
        //     $('#talent2-particle').html(makeHtml(my粒子生成数));
        // }

        if ('説明' in obj) {
            $('#talent2-desc').html(makeHtml(obj));
        }
    }

    if ('元素爆発' in 選択中キャラクターデータVar) {
        const obj = 選択中キャラクターデータVar['元素爆発'];

        if ('元素エネルギー' in obj) {
            $('#talent3-energy-cost').html(obj['元素エネルギー']);
        }

        if ('説明' in obj) {
            $('#talent3-desc').html(makeHtml(obj));
        }
    }

    build天賦詳細レベル変動();
}

// 武器説明設定
function setup武器説明レベル変動() {
    let my武器レベル = $('#武器レベルInput').val().toString();
    let my武器OP = '';
    Object.keys(選択中武器データVar['ステータス']).forEach(status => {
        if (status != '基礎攻撃力') {
            my武器OP = status;
        }
    });
    $('#weapon-base-attack').html(選択中武器データVar['ステータス']['基礎攻撃力'][my武器レベル]);
    $('#weapon-secondary-stat').html('-');
    $('#weapon-secondary-stat-value').html('-');
    if (my武器OP) {
        $('#weapon-secondary-stat').html(my武器OP.replace('%', ''));
        let my武器OPVal = 選択中武器データVar['ステータス'][my武器OP][my武器レベル];
        if (my武器OP != '元素熟知') {
            my武器OPVal += '%';
        }
        $('#weapon-secondary-stat-value').html(my武器OPVal);
    }
}
function setup武器説明() {
    // 画像と説明
    $('#weapon-name').html($('#武器Input').val().toString());
    const starImg = '<img width="16", height="16" src="images/star.png" alt="star">';
    let myRarerityHtml = starImg;
    for (let i = 1; i < 選択中武器データVar['レアリティ']; i++) {
        myRarerityHtml += starImg;
    }
    $('#weapon-rarity').html(myRarerityHtml);
    $('#weapon-ability-name').html('');
    $('#weapon-ability-desc').html('');
    if ('武器スキル' in 選択中武器データVar) {
        if ('名前' in 選択中武器データVar['武器スキル']) {
            $('#weapon-ability-name').html(選択中武器データVar['武器スキル']['名前']);
        }
        if ('説明' in 選択中武器データVar['武器スキル']) {
            let desc = makeHtml(選択中武器データVar['武器スキル']['説明']);
            const re = /.*\{(.+)\}.*/;
            let reRet = re.exec(desc);
            while (reRet) {
                const my精錬ランク = Number($('#精錬ランクInput').val().toString());
                let refineVar = reRet[1].split('/')[my精錬ランク - 1];
                desc = desc.replace('{' + reRet[1] + '}', '<span class="refine-var">' + refineVar + '</span>');
                reRet = re.exec(desc);
            }
            $('#weapon-ability-desc').html(desc);
        }
    }
    setup武器説明レベル変動();
}

// 武器·精錬ランク 変更イベント
const 精錬ランクInputOnChange = function () {
    setupBaseDamageDetailDataWeapon();
    setup武器説明();
    inputOnChangeOptionUpdate();
};

// 武器レベル 変更イベント
const 武器レベルInputOnChange = function () {
    setup武器説明レベル変動();
    inputOnChangeOptionUpdate();
};

// 武器 変更イベント
const 武器InputOnChange = function () {
    const my名前 = $('#武器Input').val().toString();
    const url = 選択可能武器セットObjVar[my名前]['import'];

    setupWeaponImg(url, my名前);

    fetch(url).then(response => response.json()).then(data => {
        武器MasterMap.set(my名前, data);

        選択中武器データVar = data;

        if ('オプション初期値' in 選択中武器データVar) {
            Object.keys(選択中武器データVar['オプション初期値']).forEach(key => {
                let elemId = key + 'Option';
                let value = 選択中武器データVar['オプション初期値'][key];
                if (!オプションElementIdValue記憶Map.has(elemId)) {
                    オプションElementIdValue記憶Map.set(elemId, value);
                }
            });
        }

        // 精錬できない武器への対応 
        let isUnrefinable = false;
        if ('unrefinable' in 選択中武器データVar) {
            isUnrefinable = 選択中武器データVar['unrefinable'];
        }
        $('#精錬ランクInput option').each((index, elem) => {
            elem.hidden = false;
        });
        if (isUnrefinable) {
            $('#精錬ランクInput option').each((index, elem) => {
                if (index > 0) {
                    elem.hidden = true;
                }
            });
        }

        let my精錬ランク = 0;
        if (isUnrefinable) {
            my精錬ランク = 1;
        } else {
            if (おすすめセットArrVar.length > 0) {
                let myObj = おすすめセットArrVar[$('#おすすめセットInput').prop('selectedIndex')][1];
                if ('精錬ランク' in myObj && myObj['武器'] == 選択中武器データVar['名前']) {
                    my精錬ランク = myObj['精錬ランク'];
                }
            }
            if (my精錬ランク == 0) {
                if (my名前 in 武器所持状況ObjVar && 武器所持状況ObjVar[my名前]) {
                    my精錬ランク = 武器所持状況ObjVar[my名前];
                } else if ('精錬ランク' in 選択中武器データVar) {
                    my精錬ランク = 選択中武器データVar['精錬ランク'];
                }
            }
            if (my精錬ランク == 0) {
                if ('レアリティ' in 選択中武器データVar) {
                    switch (選択中武器データVar['レアリティ']) {
                        case 5:
                            my精錬ランク = 1;
                            break;
                        case 4:
                            my精錬ランク = 3;
                            break;
                        case 3:
                            my精錬ランク = 5;
                            break;
                    }
                }
            }
        }
        $('#精錬ランクInput').val(my精錬ランク);

        setup武器説明();
        setup武器説明レベル変動();

        setupBaseDamageDetailDataWeapon();
        inputOnChangeOptionUpdate();
    });
};

// おすすめセット 変更イベント
const おすすめセットInputOnChange = function () {
    // 非表示
    $('#おすすめセットInput').hide();

    通常攻撃_基礎ダメージ詳細ArrVar = [];
    重撃_基礎ダメージ詳細ArrVar = [];
    落下攻撃_基礎ダメージ詳細ArrVar = [];
    元素スキル_基礎ダメージ詳細ArrVar = [];
    元素爆発_基礎ダメージ詳細ArrVar = [];
    その他_基礎ダメージ詳細ArrMapVar.clear();

    ELEMENT_VALUE_AT_FOCUS_MAP.clear();

    let is聖遺物サブ効果Includes = false;
    const selectedSet = おすすめセットArrVar[$('#おすすめセットInput').prop('selectedIndex')];
    if (selectedSet[2]) {
        $('#構成名称Input').val(selectedSet[0]);
        $('#構成保存Button').prop('disabled', true);
        $('#保存構成削除Button').prop('disabled', false);
    } else {
        $('#構成名称Input').val('');
        $('#構成保存Button').prop('disabled', false);
        $('#保存構成削除Button').prop('disabled', true);
    }

    const entry = selectedSet[1];

    const 聖遺物優先するサブ効果上昇値ValueMap = new Map([
        ['聖遺物優先するサブ効果1上昇値Input', null],
        ['聖遺物優先するサブ効果2上昇値Input', null],
        ['聖遺物優先するサブ効果3上昇値Input', null]
    ]);
    Object.keys(entry).forEach(key => {
        if (key.match(/聖遺物優先するサブ効果\d上昇値/)) {  // 後回し
            聖遺物優先するサブ効果上昇値ValueMap.set(key + 'Input', entry[key]);
            return;
        }
        let isElemExists = false;
        ['Input', 'Option'].forEach(suffix => {
            let elem = document.getElementById(key + suffix);
            if (elem != null) {
                isElemExists = true;
                if (elem instanceof HTMLInputElement) {
                    if (elem.type == 'checkbox') {
                        elem.checked = entry[key];  // true or false
                    } else if (elem.type == 'number') {
                        elem.value = String(entry[key]);    // number
                    } else {
                        elem.value = entry[key];    // string
                    }
                } else if (elem instanceof HTMLSelectElement) {
                    if (suffix == 'Input') {
                        elem.value = entry[key];
                    } else {
                        elem.selectedIndex = entry[key];
                    }
                }
                if (suffix == 'Option') {
                    オプションElementIdValue記憶Map.set(key + 'Option', entry[key]);
                } else if ($(elem).prop('name') == '聖遺物サブ効果Input') {
                    is聖遺物サブ効果Includes = true;    // セーブデータを想定
                }
            }
        });
        if (!isElemExists) {
            オプションElementIdValue記憶Map.set(key + 'Option', entry[key]);
        }
    });
    // 聖遺物優先するサブ効果上昇値
    聖遺物優先するサブ効果上昇値ValueMap.forEach((value, key) => {
        const elem = /** @type {HTMLInputElement} */ (document.getElementById(key.replace('上昇値', '')));
        inputOnChangeArtifactPrioritySubUpdate(elem, value);
    });
    // キャラクター
    setupBaseDamageDetailDataCharacter();
    // 聖遺物
    inputOnChangeArtifactSetUpdate();
    setupBaseDamageDetailDataArtifactSet();
    if (!is聖遺物サブ効果Includes) {    // セーブデータの場合聖遺物サブ効果を再計算しません
        inputOnChangeArtifactSubUpdate();
    }
    // 武器
    武器InputOnChange();
};

// 通常攻撃Lv. 元素スキルLv. 元素爆発Lv. 変更イベント
const 天賦レベルInputOnChange = function () {
    setupBaseDamageDetailDataCharacter();
    inputOnChangeOptionUpdate();
    build天賦詳細レベル変動();
};

// 命ノ星座 変更イベント
const 命ノ星座InputOnChange = function () {
    setupBaseDamageDetailDataCharacter();
    inputOnChangeOptionUpdate();
};

// レベル 変更イベント
const レベルInputOnChange = function () {
    buildキャラクタープロフィールレベル変動();
    inputOnChangeOptionUpdate();
};

function get説明(obj) {
    let result = '';
    if ('説明' in obj) {
        if ($.isArray(obj['説明'])) {
            obj['説明'].forEach(e => {
                result += e;
            });
        } else if (obj['説明'] instanceof String || typeof (obj['説明']) == 'string') {
            result = String(obj['説明']);
        }
    }
    return result;
}

function makeHtml(obj) {
    let result = '';
    let desc;
    if ($.isPlainObject(obj)) {
        if (!('説明' in obj)) {
            return '';
        }
        desc = obj['説明'];
    } else {
        desc = obj;
    }

    if ($.isArray(desc)) {
        let lineArr = [];
        desc.forEach(line => {
            if (line.startsWith('「') && line.endsWith('」')) {
                lineArr.push('<span class="em">' + line + '</span>');
            } else {
                lineArr.push(line);
            }
        });
        result = lineArr.join('<br>');
    } else if (desc instanceof String || typeof (desc) == 'string') {
        result = String(desc);
    }

    ELEMENT_TD_CLASS_MAP.forEach((value, key) => {
        const elementRe1 = new RegExp(key + '(元素)?(範囲)?ダメージ', 'g');
        const elementRe2 = new RegExp(key + '元素耐性', 'g');
        const elementRe3 = new RegExp(key + '元素付与', 'g');
        const elementRe4 = new RegExp(key + '元素付着', 'g');
        result = result.replace(elementRe1, '<span class="' + value + '">$&</span>');
        result = result.replace(elementRe2, '<span class="' + value + '">$&</span>');
        result = result.replace(elementRe3, '<span class="' + value + '">$&</span>');
        result = result.replace(elementRe4, '<span class="' + value + '">$&</span>');
    });
    // 過負荷
    const overloadRe = /過負荷/g;
    result = result.replace(overloadRe, '<span class="pyro">$&</span>');
    // 燃焼
    const burningRe = /燃焼/g;
    result = result.replace(burningRe, '<span class="pyro">$&</span>');
    // 湿潤
    const wetRe = /湿潤/g;
    result = result.replace(wetRe, '<span class="hydro">$&</span>');
    // 感電
    const electroChargedRe = /感電/g;
    result = result.replace(electroChargedRe, '<span class="electro">$&</span>');
    // 超電導
    const superconductRe = /超電導/g;
    result = result.replace(superconductRe, '<span class="cryo">$&</span>');
    // 凍結
    const frozenRe = /凍結/g;
    result = result.replace(frozenRe, '<span class="cryo">$&</span>');
    // 拡散
    const swirlRe = /拡散/g;
    result = result.replace(swirlRe, '<span class="anemo">$&</span>');
    // 岩元素創造物
    const geoConstructRe = /岩元素創造物/g;
    result = result.replace(geoConstructRe, '<span class="geo">$&</span>');
    // ***強調*** em-strong
    const emStrongRe = new RegExp('(\\*\\*\\*|___)([^\\*_]+?)(\\*\\*\\*|___)', 'g');
    result = result.replace(emStrongRe, '<span class="em-strong">$2</span>');
    // **強調** strong
    const strongRe = new RegExp('(\\*\\*|__)([^\\*_]+?)(\\*\\*|__)', 'g');
    result = result.replace(strongRe, '<span class="strong">$2</span>');
    // *強調* em
    const emRe = new RegExp('(\\*|_)([^\\*_]+?)(\\*|_)', 'g');
    result = result.replace(emRe, '<span class="em">$2</span>');

    result = result.replace('\n', '<br>');

    return result;
}

// キャラクター 変更イベント
function setupCharacterImg(url) {
    let urlArr = url.split('/');
    let fileName = urlArr[urlArr.length - 1].replace('.json', '.png');

    // キャラクター画像
    $('#character-button img').attr('src', 'images/characters/face/' + fileName);
    for (let i = 4; i <= 5; i++) {
        $('#character-button img').removeClass('star' + i);
    }
    if (url.indexOf('5') == -1) {
        $('#character-button img').addClass('star4');
    } else {
        $('#character-button img').addClass('star5');
    }
}

function setupTalentButton(url, characterData) {
    let urlArr = url.split('/');
    let dirName = urlArr[urlArr.length - 1].replace('.json', '');

    // 通常攻撃
    $('#talent1-button img').attr('src', 'images/characters/' + WEAPON_TYPE_IMG_FILE_ALIST[characterData['武器']]);
    ELEMENT_TD_CLASS_MAP.forEach((value, key) => {
        if (key == characterData['元素']) {
            $('#talent1-button').addClass(value + '-bg');
        } else {
            $('#talent1-button').removeClass(value + '-bg');
        }
    });
    // $('#talent1-button .tooltip').html(通常攻撃名称Var);

    // 元素スキル
    $('#talent2-button img').attr('src', 'images/characters/' + dirName + '/ElementalSkill.png');
    $('#talent2-button img').attr('alt', characterData['元素スキル']['名前']);
    ELEMENT_TD_CLASS_MAP.forEach((value, key) => {
        if (key == characterData['元素']) {
            $('#talent2-button').addClass(value + '-bg');
        } else {
            $('#talent2-button').removeClass(value + '-bg');
        }
    });
    // $('#talent2-button .tooltip').html(元素スキル名称Var);

    // 元素爆発
    $('#talent3-button img').attr('src', 'images/characters/' + dirName + '/ElementalBurst.png');
    $('#talent3-button img').attr('alt', characterData['元素爆発']['名前']);
    ELEMENT_TD_CLASS_MAP.forEach((value, key) => {
        if (key == characterData['元素']) {
            $('#talent3-button').addClass(value + '-bg');
        } else {
            $('#talent3-button').removeClass(value + '-bg');
        }
    });
    // $('#talent3-button .tooltip').html(元素爆発名称Var);
}

const キャラクターInputOnChange = function () {
    const my名前 = $('#キャラクターInput').val().toString();

    let myMasterObj = キャラクターリストMasterVar[my名前];

    let elementSrcUrl = 'images/element_' + ELEMENT_TD_CLASS_MAP.get(myMasterObj['元素']) + '.png';
    let imgElem = '<img width="18" height="18" src="' + elementSrcUrl + '" alt="' + myMasterObj['元素'] + '">';
    $('#character-name').html(imgElem + my名前);

    const url = myMasterObj['import'];
    fetch(url).then(response => response.json()).then(data => {
        キャラクターMasterMap.set(my名前, data);

        選択中キャラクターデータVar = data;

        キャラクター元素Var = 選択中キャラクターデータVar['元素'];
        キャラクター武器Var = 選択中キャラクターデータVar['武器'];
        通常攻撃名称Var = 選択中キャラクターデータVar['通常攻撃']['名前'];
        元素スキル名称Var = 選択中キャラクターデータVar['元素スキル']['名前'];
        元素爆発名称Var = 選択中キャラクターデータVar['元素爆発']['名前'];

        通常攻撃_元素Var = キャラクター武器Var == '法器' ? キャラクター元素Var : '物理';
        重撃_元素Var = キャラクター武器Var == '法器' ? キャラクター元素Var : '物理';
        落下攻撃_元素Var = キャラクター武器Var == '法器' ? キャラクター元素Var : '物理';

        if ('元素エネルギー' in 選択中キャラクターデータVar['元素爆発']) {
            ステータス詳細ObjVar['元素エネルギー'] = Number(選択中キャラクターデータVar['元素爆発']['元素エネルギー']);
        }

        if ('固有変数' in 選択中キャラクターデータVar) {
            Object.keys(選択中キャラクターデータVar['固有変数']).forEach(key => {
                ステータス詳細ObjVar[key] = Number(選択中キャラクターデータVar['固有変数'][key]);
            });
        }

        オプションElementIdValue記憶Map.clear();
        if ('オプション初期値' in 選択中キャラクターデータVar) {
            Object.keys(選択中キャラクターデータVar['オプション初期値']).forEach(key => {
                const elemId = key + 'Option';
                const value = 選択中キャラクターデータVar['オプション初期値'][key];
                オプションElementIdValue記憶Map.set(elemId, value);
            });
        }
        if (キャラクター元素Var == '風') {
            const elemId = '拡散' + 'Option';
            const value = 1;    // 炎元素
            オプションElementIdValue記憶Map.set(elemId, value);
        }

        // 命ノ星座selectの範囲(option)設定を行います for アーロイ
        if ('命ノ星座' in 選択中キャラクターデータVar) {
            $('#命ノ星座Input option').each((index, elem) => {
                elem.hidden = false;
            });
        } else {
            $('#命ノ星座Input option').each((index, elem) => {
                if ($(elem).val()) {
                    elem.hidden = true;
                }
            });
        }

        // 天賦レベルselectの範囲(option)設定を行います for アーロイ
        let max通常攻撃レベル = 11;
        let max元素スキルレベル = 13;
        let max元素爆発レベル = 13;
        for (let i = 11; i > 10; i--) {
            選択中キャラクターデータVar['通常攻撃']['詳細'].forEach(detailObj => {
                if ('数値' in detailObj) {
                    if ($.isPlainObject(detailObj['数値'])) {
                        if ((!(i in detailObj['数値']) || !detailObj['数値'][i]) && max通常攻撃レベル >= i) {
                            max通常攻撃レベル = i - 1;
                        }
                    }
                }
            });
            選択中キャラクターデータVar['重撃']['詳細'].forEach(detailObj => {
                if ('数値' in detailObj) {
                    if ($.isPlainObject(detailObj['数値'])) {
                        if ((!(i in detailObj['数値']) || !detailObj['数値'][i]) && max通常攻撃レベル >= i) {
                            max通常攻撃レベル = i - 1;
                        }
                    }
                }
            });
            選択中キャラクターデータVar['落下攻撃']['詳細'].forEach(detailObj => {
                if ('数値' in detailObj) {
                    if ($.isPlainObject(detailObj['数値'])) {
                        if ((!(i in detailObj['数値']) || !detailObj['数値'][i]) && max通常攻撃レベル >= i) {
                            max通常攻撃レベル = i - 1;
                        }
                    }
                }
            });
        }
        for (let i = 13; i > 10; i--) {
            if ('詳細' in 選択中キャラクターデータVar['元素スキル']) {
                選択中キャラクターデータVar['元素スキル']['詳細'].forEach(detailObj => {
                    if ('数値' in detailObj) {
                        if ($.isPlainObject(detailObj['数値'])) {
                            if ((!(i in detailObj['数値']) || !detailObj['数値'][i]) && max元素スキルレベル >= i) {
                                max元素スキルレベル = i - 1;
                            }
                        }
                    }
                });
            }
            if ('一回押し' in 選択中キャラクターデータVar['元素スキル']) {
                選択中キャラクターデータVar['元素スキル']['一回押し']['詳細'].forEach(detailObj => {
                    if ('数値' in detailObj) {
                        if ($.isPlainObject(detailObj['数値'])) {
                            if ((!(i in detailObj['数値']) || !detailObj['数値'][i]) && max元素スキルレベル >= i) {
                                max元素スキルレベル = i - 1;
                            }
                        }
                    }
                });
            }
            if ('長押し' in 選択中キャラクターデータVar['元素スキル']) {
                選択中キャラクターデータVar['元素スキル']['長押し']['詳細'].forEach(detailObj => {
                    if ('数値' in detailObj) {
                        if ($.isPlainObject(detailObj['数値'])) {
                            if ((!(i in detailObj['数値']) || !detailObj['数値'][i]) && max元素スキルレベル >= i) {
                                max元素スキルレベル = i - 1;
                            }
                        }
                    }
                });
            }
            選択中キャラクターデータVar['元素爆発']['詳細'].forEach(detailObj => {
                if ('数値' in detailObj) {
                    if ($.isPlainObject(detailObj['数値'])) {
                        if ((!(i in detailObj['数値']) || !detailObj['数値'][i]) && max元素爆発レベル >= i) {
                            max元素爆発レベル = i - 1;
                        }
                    }
                }
            });
        }
        $('#通常攻撃レベルInput option').each((index, elem) => {
            elem.hidden = $(elem).val() > max通常攻撃レベル;
        });
        $('#元素スキルレベルInput option').each((index, elem) => {
            elem.hidden = $(elem).val() > max元素スキルレベル;
        });
        $('#元素爆発レベルInput option').each((index, elem) => {
            elem.hidden = $(elem).val() > max元素爆発レベル;
        });

        switch (キャラクター元素Var) {
            case '炎':
                $('#元素反応なしInput+label').show();
                $('#元素反応蒸発Input+label').show();
                $('#元素反応溶解Input+label').show();
                break;
            case '水':
                $('#元素反応なしInput+label').show();
                $('#元素反応蒸発Input+label').show();
                $('#元素反応溶解Input+label').hide();
                if ($('#元素反応溶解Input').is(':checked')) {
                    $('#元素反応なしInput').prop('checked', true);
                }
                break;
            case '氷':
                $('#元素反応なしInput+label').show();
                $('#元素反応蒸発Input+label').hide();
                $('#元素反応溶解Input+label').show();
                if ($('#元素反応蒸発Input').is(':checked')) {
                    $('#元素反応なしInput').prop('checked', true);
                }
                break;
            default:
                $('#元素反応なしInput').prop('checked', true);
                $('#元素反応なしInput+label').hide();
                $('#元素反応蒸発Input+label').hide();
                $('#元素反応溶解Input+label').hide();
                break;
        }

        let my命ノ星座 = 0;
        if (my名前 in キャラクター所持状況ObjVar) {
            my命ノ星座 = キャラクター所持状況ObjVar[my名前];
            if (my命ノ星座 == null) {
                my命ノ星座 = 0;
            }
        }
        if ('命ノ星座' in 選択中キャラクターデータVar) {
            if (!(my命ノ星座 in 選択中キャラクターデータVar['命ノ星座'])) {
                my命ノ星座 = 0;
            }
        } else {
            my命ノ星座 = 0;
        }
        $('#命ノ星座Input').val(my命ノ星座);

        let my通常攻撃レベル = 8;
        let my元素スキルレベル = 8;
        let my元素爆発レベル = 8;
        if ('命ノ星座' in 選択中キャラクターデータVar) {
            for (let i = Number(my命ノ星座); i > 0; i--) {
                if ((i == 3 || i == 5) && i in 選択中キャラクターデータVar['命ノ星座']) {
                    let my説明 = get説明(選択中キャラクターデータVar['命ノ星座'][i]);
                    if (my説明.indexOf(元素スキル名称Var) != -1) {
                        my元素スキルレベル = 11;
                    } else if (my説明.indexOf(元素爆発名称Var) != -1) {
                        my元素爆発レベル = 11;
                    }
                }
            }
        }
        $('#通常攻撃レベルInput').val(my通常攻撃レベル);
        $('#元素スキルレベルInput').val(my元素スキルレベル);
        $('#元素爆発レベルInput').val(my元素爆発レベル);

        if ($('#全武器解放Config').prop('checked')) {
            選択可能武器セットObjVar = {};
            Object.keys(武器リストMasterVar).forEach(key => {
                Object.keys(武器リストMasterVar[key]).forEach(key2 => {
                    選択可能武器セットObjVar[key2] = 武器リストMasterVar[key][key2];
                });
            });
        } else {
            選択可能武器セットObjVar = 武器リストMasterVar[キャラクター武器Var];
        }
        appendOptionElements(選択可能武器セットObjVar, '#武器Input');

        setupCharacterImg(url);
        setupTalentButton(url, 選択中キャラクターデータVar);

        setupおすすめセット();

        ELEMENT_VALUE_AT_FOCUS_MAP.clear();

        inputOnChangeEnemyUpdate(ステータス詳細ObjVar); // 敵

        おすすめセットInputOnChange();

        buildキャラクタープロフィール();
        build天賦詳細();

        setupチームオプション();
    });
};

//
function buildチームオプション() {
    const ulElem = document.getElementById('チームオプションBox');
    ulElem.innerHTML = '';

    let myサポーター;

    const myサポーターオプション条件Map = new Map();
    チームオプション条件MapVar.forEach((value, key) => {
        myサポーター = key.split('*')[1];

        if (!(myサポーター in キャラクターリストMasterVar)) {
            console.error(key);
            return;
        }

        if (!myサポーターオプション条件Map.has(myサポーター)) {
            myサポーターオプション条件Map.set(myサポーター, new Map());
        }
        myサポーターオプション条件Map.get(myサポーター).set(key, value);
    });

    myサポーターオプション条件Map.forEach((value, key) => {
        myサポーター = key;

        const liElem = document.createElement('li');
        ulElem.appendChild(liElem);

        const inputElem = document.createElement('input');
        inputElem.className = 'hidden';
        inputElem.id = 'チームオプション' + myサポーター;
        inputElem.type = 'checkbox';
        liElem.appendChild(inputElem);

        const labelElem = document.createElement('label');
        labelElem.className = 'button-label';
        labelElem.innerHTML = myサポーター;
        labelElem.htmlFor = inputElem.id;
        liElem.appendChild(labelElem);

        const divElem = document.createElement('div');
        divElem.id = 'チームオプションBox' + myサポーター;
        liElem.appendChild(divElem);

        appendInputForOptionElement(divElem.id, value, new Map(), 'チームオプションName' + myサポーター, false, オプションInputOnChangeSub);
    });
}

/**
 * 指定サポーターのオプションを表示します
 * 
 * @param {string} supporterName サポーター名
 * @param {string} optionName オプション名
 */
function showチームオプション(supporterName, optionName) {

    $('#' + selectorEscape('チームオプション' + supporterName)).parent().children().prop('disabled', false);
    if (optionName) {
        const target = optionName + 'Option';
        $('#' + selectorEscape(target)).parent().children().prop('disabled', false);
    }
}

/**
 * 指定サポーターのオプションを非表示にします
 * 
 * @param {string} supporterName サポーター名
 * @param {string} optionName オプション名
 */
function hideチームオプション(supporterName, optionName) {
    if (optionName) {
        const target = '*' + supporterName + '*' + optionName + 'Option';
        const elem = document.getElementById(target);

        if (elem instanceof HTMLInputElement) {
            $(elem).prop('checked', false);
        } else {
            $(elem).val('');
        }

        $(elem).parent().children().prop('disabled', true);
    } else {
        const target = 'チームオプション' + supporterName;
        const elem = document.getElementById(target);

        $(elem).parent().children().prop('checked', false);
        $(elem).parent().children().find('input').prop('checked', false);
        $(elem).parent().children().find('select').val('');

        $(elem).parent().children().prop('disabled', true);
        $(elem).parent().children().find('input,select').prop('disabled', true);
    }
}

function clearオプション(optionConditionMap) {
    optionConditionMap.forEach((value, key) => {
        const id = key + 'Option';
        const elem = document.getElementById(id);
        if (elem) {
            if (elem instanceof HTMLInputElement) {
                $(elem).prop('checked', false);
            } else if (elem instanceof HTMLSelectElement) {
                let index = 0;
                if ($(elem).find('option')[0].disabled) {
                    index = 1;
                }
                $(elem).prop('selectedIndex', index);
            }
        }
    });
}

function clearチームオプション() {
    clearオプション(チームオプション条件MapVar);
}

function clearその他オプション() {
    clearオプション(その他オプション1条件MapVar);
    clearオプション(その他オプション2条件MapVar);
}

function setupチームオプション() {
    let saveName;

    // for 雷罰悪曜の眼
    saveName = '構成_雷電将軍';
    if (チームStatusObjMap.has(saveName)) {
        if ('元素エネルギー' in 選択中キャラクターデータVar['元素爆発']) {
            チームStatusObjMap.get(saveName)['元素エネルギー'] = 選択中キャラクターデータVar['元素爆発']['元素エネルギー'];
        }
        setupDamageResultEx(チームStatusObjMap.get(saveName), チームInputObjMap.get(saveName), チームDamageDetailObjMap.get(saveName), チームChangeDetailObjMap.get(saveName));
    }

    const myサポーターオプション条件Map = new Map();
    チームオプション条件MapVar.forEach((value, key) => {
        const myサポーター = key.split('*')[1];

        if (myサポーター == 選択中キャラクターデータVar['名前']) {
            hideチームオプション(myサポーター, null);
            return;
        }
        const optionName = key.substring(1).replace('*', '_');
        if (optionName in チームオプションMasterVar) {
            let isNeedSaveData = false;
            チームオプションMasterVar[optionName]['詳細'].forEach(detailObj => {
                if (detailObj['数値'] && !$.isNumeric(detailObj['数値'])) {
                    isNeedSaveData = true;
                }
            });
            if (isNeedSaveData && localStorage['構成_' + myサポーター] == null) {
                hideチームオプション(myサポーター, optionName.split('_')[1]);
                return;
            }
        } else {
            if (localStorage['構成_' + myサポーター] == null) {
                hideチームオプション(myサポーター, null);
                return;
            }
        }

        if (!myサポーターオプション条件Map.has(myサポーター)) {
            myサポーターオプション条件Map.set(myサポーター, new Map());
        }
        myサポーターオプション条件Map.get(myサポーター).set(key, value);
    });

    myサポーターオプション条件Map.forEach((value1, key1) => {
        value1.forEach((value2, key2) => {
            showチームオプション(key1, key2);
        });
    });
}

/**
 * キャラクター選択リストを生成します
 * 
 * @param {string} opt_elementType 元素
 * @param {string} opt_weaponType 武器
 */
function buildキャラクター選択リスト(opt_elementType = null, opt_weaponType = null) {
    document.querySelector('#キャラクター選択').innerHTML = '';
    let ulElem = document.getElementById('キャラクター選択');
    Object.keys(キャラクターリストMasterVar).forEach(name => {
        let myMasterObj = キャラクターリストMasterVar[name];
        if ('disabled' in myMasterObj && myMasterObj['disabled']) {
            return;
        }
        if (opt_elementType && myMasterObj['元素'] != opt_elementType) {
            return;
        }
        if (opt_weaponType && myMasterObj['武器'] != opt_weaponType) {
            return;
        }
        let liElem = document.createElement('li');
        ulElem.appendChild(liElem);

        let splittedUrl = myMasterObj['import'].split('/');
        let fileName = splittedUrl[splittedUrl.length - 1].replace('.json', '.png');
        let srcUrl = 'images/characters/face/' + fileName;

        let imgElem = document.createElement('img');
        imgElem.className = 'star' + myMasterObj['レアリティ'];
        imgElem.src = srcUrl;
        imgElem.alt = name;
        imgElem.width = 80;
        imgElem.height = 80;
        liElem.appendChild(imgElem);

        let img2Elem = document.createElement('img');
        img2Elem.className = 'element';
        img2Elem.src = ELEMENT_IMG_SRC_MAP.get(myMasterObj['元素']);
        img2Elem.alt = myMasterObj['元素'];
        img2Elem.width = 24;
        img2Elem.height = 24;
        liElem.appendChild(img2Elem);

        let divElem = document.createElement('div');
        divElem.className = 'tooltip';
        divElem.innerHTML = name;
        liElem.appendChild(divElem);

        imgElem.onclick = selectCharacter;
    });
}

function emSelectedItemInList(listSelector, name) {
    $(listSelector + ' li').removeClass('selected');
    $(listSelector + ' li').each((index, element) => {
        let imgElems = $(element).find('img');
        if (imgElems.length == 0) {
            return;
        }
        if (Array.isArray(name)) {
            if (name.includes(imgElems[0].alt)) {
                $(element).addClass('selected');
            }
        } else {
            if (name == imgElems[0].alt) {
                $(element).addClass('selected');
            }
        }
    });
}

// 武器変更イベント
function setupWeaponImg(url, name) {
    let srcUrl = url.replace('data/', 'images/').replace('.json', '.png');

    // 武器画像
    $('#weapon-button img').attr('src', srcUrl);
    $('#weapon-button img').attr('alt', name);
    for (let i = 3; i <= 5; i++) {
        $('#weapon-button img').removeClass('star' + i);
    }
    if (url.indexOf('3') != -1) {
        $('#weapon-button img').addClass('star3');
    } else if (url.indexOf('4') != -1) {
        $('#weapon-button img').addClass('star4');
    } else {
        $('#weapon-button img').addClass('star5');
    }
}

/**
 * 武器選択リストを生成します
 */
function build武器選択リスト() {
    document.querySelector('#weapon-list').innerHTML = '';
    let ulElem = document.getElementById('weapon-list');
    Object.keys(武器リストMasterVar).forEach(kind => {
        Object.keys(武器リストMasterVar[kind]).forEach(name => {
            let myMasterObj = 武器リストMasterVar[kind][name];
            if ('disabled' in myMasterObj && myMasterObj['disabled']) {
                return;
            }
            if (!(name in 選択可能武器セットObjVar)) {
                return;
            }
            let srcUrl = myMasterObj['import'].replace('data/', 'images/').replace('.json', '.png');

            let liElem = document.createElement('li');
            ulElem.appendChild(liElem);

            let imgElem = document.createElement('img');
            imgElem.className = 'star' + myMasterObj['レアリティ'];
            imgElem.src = srcUrl;
            imgElem.alt = name;
            imgElem.width = 60;
            imgElem.height = 60;
            liElem.appendChild(imgElem);

            let divElem = document.createElement('div');
            divElem.className = 'tooltip';
            divElem.innerHTML = name;
            liElem.appendChild(divElem);

            imgElem.onclick = selectWeapon;
        });
    });
}

/**
 * キャラクタープロフィールを生成します
 */
function buildキャラクタープロフィール() {
    // ステータス
    buildキャラクタープロフィールレベル変動();

    // 命ノ星座
    const constellationsElem = document.getElementById('constellations');
    constellationsElem.innerHTML = '';
    if ('命ノ星座' in 選択中キャラクターデータVar) {
        let tableElem = document.createElement('table');

        let my重 = 1;

        Object.keys(選択中キャラクターデータVar['命ノ星座']).forEach(key => {
            let tr1Elem = document.createElement('tr');
            tableElem.appendChild(tr1Elem);

            let thElem = document.createElement('th');
            thElem.innerHTML = '第' + my重 + '重 ' + 選択中キャラクターデータVar['命ノ星座'][key]['名前'];
            tr1Elem.appendChild(thElem);

            let tr2Elem = document.createElement('tr');
            tableElem.appendChild(tr2Elem);

            let tdElem = document.createElement('td');
            tdElem.innerHTML = makeHtml(選択中キャラクターデータVar['命ノ星座'][key]['説明']);
            tr2Elem.appendChild(tdElem);

            my重++;
        });

        constellationsElem.appendChild(tableElem);
    }

    // 固有天賦
    const passiveTalentsElem = document.getElementById('passive-talents');
    passiveTalentsElem.innerHTML = '';
    if ('固有天賦' in 選択中キャラクターデータVar) {
        let tableElem = document.createElement('table');

        選択中キャラクターデータVar['固有天賦'].forEach(valueObj => {
            let tr1Elem = document.createElement('tr');
            tableElem.appendChild(tr1Elem);

            let thElem = document.createElement('th');
            if ('名前' in valueObj) {
                thElem.innerHTML = valueObj['名前'];
            }
            tr1Elem.appendChild(thElem);

            let tr2Elem = document.createElement('tr');
            tableElem.appendChild(tr2Elem);

            let tdElem = document.createElement('td');
            if ('説明' in valueObj) {
                tdElem.innerHTML = makeHtml(valueObj['説明']);
            }
            tr2Elem.appendChild(tdElem);
        });

        passiveTalentsElem.appendChild(tableElem);
    }

    const attackTalentsEtcElem = document.getElementById('attack-talents-etc');
    attackTalentsEtcElem.innerHTML = '';
    if ('その他戦闘天賦' in 選択中キャラクターデータVar) {
        let tableElem = document.createElement('table');

        選択中キャラクターデータVar['その他戦闘天賦'].forEach(valueObj => {
            let tr1Elem = document.createElement('tr');
            tableElem.appendChild(tr1Elem);

            let thElem = document.createElement('th');
            if ('名前' in valueObj) {
                thElem.innerHTML = valueObj['名前'];
            }
            tr1Elem.appendChild(thElem);

            let tr2Elem = document.createElement('tr');
            tableElem.appendChild(tr2Elem);

            let tdElem = document.createElement('td');
            if ('説明' in valueObj) {
                tdElem.innerHTML = makeHtml(valueObj['説明']);
            }
            tr2Elem.appendChild(tdElem);
        });

        attackTalentsEtcElem.appendChild(tableElem);

        $(attackTalentsEtcElem).parents('table').show();
    } else {
        $(attackTalentsEtcElem).parents('table').hide();
    }
}

function buildキャラクタープロフィールレベル変動() {
    const myLevel = String($('#レベルInput').val());
    // 基礎HP
    const baseHpElem = document.getElementById('base-hp-value');
    baseHpElem.innerHTML = 選択中キャラクターデータVar['ステータス']['基礎HP'][myLevel];
    // 基礎攻撃力
    const baseAtkElem = document.getElementById('base-atk-value');
    baseAtkElem.innerHTML = 選択中キャラクターデータVar['ステータス']['基礎攻撃力'][myLevel];
    // 基礎防御力
    const baseDefElem = document.getElementById('base-def-value');
    baseDefElem.innerHTML = 選択中キャラクターデータVar['ステータス']['基礎防御力'][myLevel];
    // 第2ステータス
    const stat2NameElem = document.getElementById('stat2-name');
    const stat2ValueElem = document.getElementById('stat2-value');
    Object.keys(選択中キャラクターデータVar['ステータス']).forEach(key => {
        if (!['基礎HP', '基礎攻撃力', '基礎防御力'].includes(key)) {
            stat2NameElem.innerHTML = key.replace(/%$/, '');
            stat2ValueElem.innerHTML = 選択中キャラクターデータVar['ステータス'][key][myLevel];
            if (key.endsWith('%') || ['会心率', '会心ダメージ', '元素チャージ効率'].includes(key) || key.endsWith('ダメージバフ')) {
                stat2ValueElem.innerHTML += '%';
            }
        }
    });
}

// キャラクター選択
const selectCharacter = function () {
    $('#character-select').hide();
    $('[name="detail-box"]').prop('checked', false);
    $('.select-group1').removeClass('selected');
    characterSelected(this.alt);
}
function characterSelected(name) {
    $('#キャラクターInput').val(name);
    キャラクターInputOnChange();
}

// 武器選択
const selectWeapon = function () {
    // $('#weapon-detail-and-select').prop('checked', false);
    weaponSelected(this.alt);
    emSelectedItemInList('#weapon-list', $('#武器Input').val());
    enable構成保存Button();
}
function weaponSelected(name) {
    $('#武器Input').val(name);
    武器InputOnChange();
}

// 聖遺物
function apply聖遺物サブ効果直接入力モード(mode) {
    if (mode) {
        $('#聖遺物サブ効果直接入力Toggle').prop('checked', true);
    } else {
        $('#聖遺物サブ効果直接入力Toggle').prop('checked', false);
    }
    if (mode) {
        $('[name="聖遺物サブ効果Input"]').show();
        $('#聖遺物サブ効果HPValue').hide();
        $('#聖遺物サブ効果HPPValue').hide();
        $('#聖遺物サブ効果攻撃力Value').hide();
        $('#聖遺物サブ効果攻撃力PValue').hide();
        $('#聖遺物サブ効果防御力Value').hide();
        $('#聖遺物サブ効果防御力PValue').hide();
        $('#聖遺物サブ効果元素熟知Value').hide();
        $('#聖遺物サブ効果会心率Value').hide();
        $('#聖遺物サブ効果会心ダメージValue').hide();
        $('#聖遺物サブ効果元素チャージ効率Value').hide();
    } else {
        $('[name="聖遺物サブ効果Input"]').hide();
        $('#聖遺物サブ効果HPValue').show();
        $('#聖遺物サブ効果HPPValue').show();
        $('#聖遺物サブ効果攻撃力Value').show();
        $('#聖遺物サブ効果攻撃力PValue').show();
        $('#聖遺物サブ効果防御力Value').show();
        $('#聖遺物サブ効果防御力PValue').show();
        $('#聖遺物サブ効果元素熟知Value').show();
        $('#聖遺物サブ効果会心率Value').show();
        $('#聖遺物サブ効果会心ダメージValue').show();
        $('#聖遺物サブ効果元素チャージ効率Value').show();
    }
}
function 聖遺物サブ効果直接入力モードToggleOnChange() {
    const mode = this.checked;
    apply聖遺物サブ効果直接入力モード(mode);
    localStorage['聖遺物サブ効果直接入力モード'] = mode;
}

// 聖遺物画像 クリック処理
var 選択中聖遺物セット番号Var = null;
const selectArtifactSet = function () {
    $('#聖遺物セット効果' + 選択中聖遺物セット番号Var + 'Input').val(this.alt);
    聖遺物セットInputOnChange();
    emSelectedItemInList('#artifactset-list', [$('#聖遺物セット効果1Input').val(), $('#聖遺物セット効果2Input').val()]);
    enable構成保存Button();
}
function build聖遺物セットリスト() {
    const listId = 'artifactset-list';
    if ($('#' + listId).find('li').length > 0) {
        return;
    }
    let ulElem = document.getElementById(listId);
    Object.keys(聖遺物セット効果MasterVar).forEach(name => {
        let myMasterObj = 聖遺物セット効果MasterVar[name];
        if ('disabled' in myMasterObj && myMasterObj['disabled']) {
            return;
        }
        let srcUrl = myMasterObj['image'];

        let liElem = document.createElement('li');
        ulElem.appendChild(liElem);
        let imgElem = document.createElement('img');
        imgElem.className = 'star' + myMasterObj['レアリティ'];
        imgElem.src = srcUrl;
        imgElem.alt = name;
        imgElem.width = 60;
        imgElem.height = 60;
        liElem.appendChild(imgElem);

        let divElem = document.createElement('div');
        divElem.className = 'tooltip';
        divElem.innerHTML = name;
        liElem.appendChild(divElem);

        imgElem.onclick = selectArtifactSet;
    });
}

// ステータス1 基本ステータス/高級ステータス/元素ステータス·ダメージ/ダメージバフ/ダメージアップ
const StatusRowGroupOnClick = function () {
    let name = this.id.replace('RowGroup', '');
    let mode = this.classList.contains('opened');
    if (mode) {
        this.classList.remove('opened');
        $('[name="' + name + 'Input"]').each((index, element) => {
            let statusName = element.id.replace('Input', '');
            if (statusName in ステータス詳細ObjVar) {
                if (ステータス詳細ObjVar[statusName]) {
                    $('#' + statusName + 'Value').closest('tr').show();
                } else {
                    $('#' + statusName + 'Value').closest('tr').hide();
                }
            } else {
                $('#' + statusName + 'Value').closest('tr').show();
            }
        });
    } else {
        this.classList.add('opened');
        $('[name="' + name + 'Input"]').each((index, element) => {
            $(element).closest('tr').show();
        });
    }
}

function applyステータス補正入力モード(mode) {
    if (mode) {
        $('#ステータス1補正入力Toggle').prop('checked', true);
        $('#ステータス2補正入力Toggle').prop('checked', true);
        $('#敵耐性補正入力Toggle').prop('checked', true);
    } else {
        $('#ステータス1補正入力Toggle').prop('checked', false);
        $('#ステータス2補正入力Toggle').prop('checked', false);
        $('#敵耐性補正入力Toggle').prop('checked', false);
    }
    if (mode) {
        // input要素を表示します
        ["ステータス", "基礎ステータス", "ダメージバフ1", "ダメージバフ2", "ダメージアップ", "元素反応ボーナス", "耐性軽減", "敵ステータス"].forEach(name => {
            $('[name="' + name + 'Input"]').show();
        });
    } else {
        // input要素を隠します
        ["ステータス", "基礎ステータス", "ダメージバフ1", "ダメージバフ2", "ダメージアップ", "元素反応ボーナス", "耐性軽減", "敵ステータス"].forEach(name => {
            $('[name="' + name + 'Input"]').hide();
        });
    }

    ["ダメージバフ1", "ダメージバフ2", "ダメージアップ", "元素反応ボーナス"].forEach(name => {
        if ($('#' + name + 'RowGroup').hasClass('opened')) {
            $('[name="' + name + 'Input"]').closest('tr').show();
            return;
        }
        $('[name="' + name + 'Input"]').each((index, element) => {
            let statusName = element.id.replace('Input', '');
            if (statusName in ステータス詳細ObjVar) {
                if (ステータス詳細ObjVar[statusName]) {
                    $('#' + statusName + 'Value').closest('tr').show();
                } else {
                    $('#' + statusName + 'Value').closest('tr').hide();
                }
            } else {
                $('#' + statusName + 'Value').closest('tr').show();
            }
        });
    });
}
function ステータス補正入力モードToggleOnChange() {
    const mode = this.checked;
    localStorage['ステータス補正入力モード'] = mode;
    applyステータス補正入力モード(mode);
}

////////////////////////////////////////////////////////////////////////////////
function isHiddenHidableElement(selector, opt_default = false) {
    let isHidden = opt_default;
    if (selectorVisiblityStateMap.has(selector)) {
        isHidden = !selectorVisiblityStateMap.get(selector);
    }
    return isHidden;
}

// 指定要素の表示非表示を制御するイベント関数を返す関数です
const elementOnClickToggleOther = function (selector, triggerSelector) {
    return function () {
        $(selector).toggle();
        if ($(selector).is(':visible')) {
            $(triggerSelector).removeClass('closed');
        } else {
            $(triggerSelector).addClass('closed');
        }
    }
}

// 下段のダメージ計算表の2行目以降を閉じたり開いたりします
const resultTableOnClickToggle = function () {
    let tableId = this.id;
    let isVisible = false;
    if (resultTableVisibilityMap.has(tableId)) {
        isVisible = resultTableVisibilityMap.get(tableId);
    }
    resultTableVisibilityMap.set(tableId, !isVisible);
    console.log(resultTableVisibilityMap);
    elementalReactionOnChange();
};

const elementalReactionOnChange = function () {
    let elementalReaction = $('input[name="元素反応Input"]:checked').val();
    DAMAGE_RESULT_TABLE_ID_ARR.forEach(tableId => {
        let isVisible = false;
        if (resultTableVisibilityMap.has(tableId)) {
            isVisible = resultTableVisibilityMap.get(tableId);
        }
        $('#' + selectorEscape(tableId) + ' tr.' + elementalReaction).each((index, element) => {
            if (element.className.indexOf('hidable') == -1) {
                element.style.display = "table-row";
            } else {
                if (isVisible) {
                    element.style.display = "table-row";
                } else {
                    element.style.display = "none";
                }
            }
        });
        ['noreaction', 'vaporize', 'melt'].forEach(className => {
            if (className != elementalReaction) {
                $('tr.' + className).hide();
            }
        });
    });
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// DEBUG
function detailToHtml(obj) {
    let myArr = [];
    Object.keys(obj).forEach(key => {
        if (obj[key]) myArr.push(key + '[' + obj[key] + ']');
    });
    return myArr.join(',');
}

// デバッグ情報を出力します
const debugMode = false;
const setDebugInfo = function () {
    if (!debugMode) return;
    const debugInfo = '#debugInfo';

    $('#debugInfo').empty();

    $('<hr>').appendTo(debugInfo);
    $('<p>', {
        text: '通常攻撃'
    }).appendTo(debugInfo);
    通常攻撃_基礎ダメージ詳細ArrVar.forEach(entry => {
        $('<p>', {
            text: detailToHtml(entry)
        }).appendTo(debugInfo);
    });
    $('<hr>').appendTo(debugInfo);
    $('<p>', {
        text: '重撃'
    }).appendTo(debugInfo);
    重撃_基礎ダメージ詳細ArrVar.forEach(entry => {
        $('<p>', {
            text: detailToHtml(entry)
        }).appendTo(debugInfo);
    });
    $('<hr>').appendTo(debugInfo);
    $('<p>', {
        text: '落下攻撃'
    }).appendTo(debugInfo);
    落下攻撃_基礎ダメージ詳細ArrVar.forEach(entry => {
        $('<p>', {
            text: detailToHtml(entry)
        }).appendTo(debugInfo);
    });
    $('<hr>').appendTo(debugInfo);
    $('<p>', {
        text: '元素スキル'
    }).appendTo(debugInfo);
    元素スキル_基礎ダメージ詳細ArrVar.forEach(entry => {
        $('<p>', {
            text: detailToHtml(entry)
        }).appendTo(debugInfo);
    });
    $('<hr>').appendTo(debugInfo);
    $('<p>', {
        text: '元素爆発'
    }).appendTo(debugInfo);
    元素爆発_基礎ダメージ詳細ArrVar.forEach(entry => {
        $('<p>', {
            text: detailToHtml(entry)
        }).appendTo(debugInfo);
    });

    $('<hr>').appendTo(debugInfo);
    $('<p>', {
        text: 'ステータス変更系詳細'
    }).appendTo(debugInfo);
    ステータス変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(entry => {
            $('<p>', {
                text: key + ':' + detailToHtml(entry)
            }).appendTo(debugInfo);
        });
    });

    $('<hr>').appendTo(debugInfo);
    $('<p>', {
        text: '天賦性能変更系詳細'
    }).appendTo(debugInfo);
    天賦性能変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(entry => {
            $('<p>', {
                text: key + ':' + detailToHtml(entry)
            }).appendTo(debugInfo);
        });
    });
    $('<hr>').appendTo(debugInfo);
    $('<p>', {
        text: 'その他_基礎ダメージ詳細'
    }).appendTo(debugInfo);
    その他_基礎ダメージ詳細ArrMapVar.forEach((value, key) => {
        value.forEach(entry => {
            $('<p>', {
                text: key + ':' + detailToHtml(entry)
            }).appendTo(debugInfo);
        });
    });
    $('<hr>').appendTo(debugInfo);
    $('<p>', {
        text: 'オプション条件'
    }).appendTo(debugInfo);
    $('#オプションBox input').each((index, element) => {
        $('<p>', {
            text: element.id + '=' + $(element).prop('checked')
        }).appendTo(debugInfo);
    });
    $('#オプションBox select').each((index, element) => {
        $('<p>', {
            text: element.id + '=[' + $(element).prop('selectedIndex') + ']=' + $(element).val()
        }).appendTo(debugInfo);
    });
    // オプション条件MapVar.forEach((value, key) => {
    //     if (value) {
    //         if ($.isArray(value)) {
    //             value.forEach(entry => {
    //                 $('<p>', {
    //                     text: key + ':' + entry
    //                 }).appendTo('#debugInfo');
    //             });
    //         } else {
    //             $('<p>', {
    //                 text: key + ':' + value
    //             }).appendTo('#debugInfo');
    //         }
    //     } else {
    //         $('<p>', {
    //             text: key
    //         }).appendTo('#debugInfo');
    //     }
    // });
    $('<hr>').appendTo(debugInfo);
    $('<p>', {
        text: 'オプション排他'
    }).appendTo(debugInfo);
    オプション排他MapVar.forEach((value, key) => {
        if (value) {
            if ($.isArray(value)) {
                value.forEach(entry => {
                    $('<p>', {
                        text: key + ':' + entry
                    }).appendTo(debugInfo);
                });
            } else {
                $('<p>', {
                    text: key + ':' + value
                }).appendTo(debugInfo);
            }
        } else {
            $('<p>', {
                text: key
            }).appendTo(debugInfo);
        }
    });

    $('<hr>').appendTo(debugInfo);
    $('<p>', {
        text: 'ステータス詳細'
    }).appendTo(debugInfo);
    Object.keys(ステータス詳細ObjVar).forEach(key => {
        if (ステータス詳細ObjVar[key] != 9999) {
            if ($.isPlainObject(ステータス詳細ObjVar[key])) {
                Object.keys(ステータス詳細ObjVar[key]).forEach(key2 => {
                    $('<p>', {
                        text: key + '.' + key2 + '=' + ステータス詳細ObjVar[key][key2]
                    }).appendTo(debugInfo);
                });
            } else {
                $('<p>', {
                    text: key + '=' + ステータス詳細ObjVar[key]
                }).appendTo(debugInfo);
            }
        }
    });
    $('<hr>').appendTo(debugInfo);
}

// 聖遺物サブ効果の自動計算を止める
const toggle聖遺物詳細計算停止 = function () {
    if (this.checked) {
        $('select[name="聖遺物優先するサブ効果Input"]').prop('disabled', true);
        $('select[name="聖遺物優先するサブ効果倍率Input"]').prop('disabled', true);
    } else {
        $('select[name="聖遺物優先するサブ効果Input"]').prop('disabled', false);
        $('select[name="聖遺物優先するサブ効果倍率Input"]').prop('disabled', false);
    }
}

//
// Twitter
const shareByTwitter = function () {
    const saveData = makeSaveData();
    const shareData = makeShareData(saveData);
    console.log(shareData.length);
    console.log(shareData);

    let text = '';
    const saveName = $('#構成名称Input').val();
    if (saveName) {
        text += saveName;
    } else {
        text += 'あなたの' + saveData['キャラクター'];
    }
    text += ' (' + saveData['キャラクター'] + ')\n';
    text += 'げんかるく\n';

    const encoded = encodeURI(shareData);
    console.log(encoded.length);
    console.log(encoded);
    const url = 'https://asagume.github.io/gencalc/' + '?allin=' + encoded;
    openTwitter(text, url);

    // UTF8toBinary(JSON.stringify(shareData)).then(bin => {
    //     const encoded = btoa(bin);
    //     // console.log(encoded.length);
    //     // console.log(encoded);
    //     const url = 'https://asagume.github.io/gencalc/' + '?allin=' + encoded;
    //     openTwitter(text, url);
    // });
}
