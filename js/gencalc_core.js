// @ts-check

function isString (value) {
    return typeof value === 'string' || value instanceof String;
}

/**
 * セレクターに使用できない文字をエスケープします
 * 
 * @param {string} val 
 * @returns {string}
 */
function selectorEscape(val) {
    return val.replace(/[ !"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&');
}

/**
 * 加算関数です
 * 
 * @param {number} value1 
 * @param {number} value2 
 * @param {number} opt_max 
 * @returns {number}
 */
const addDecimal = function (value1, value2, opt_max = null) {
    let result = Math.floor((value1 * 100 + value2 * 100) / 10) / 10;
    if (opt_max != null) {
        result = Math.min(result, opt_max);
    }
    return result;
}

/**
 * 代入先のstep属性に併せて丸めた数値をセットします
 * 
 * @param {string} selector 
 * @param {number} value 
 */
function setInputValue(selector, value) {
    let step = $(selector).prop('step');
    let newValue = value;
    if (step && Number(step) < 1) {
        newValue = Number(value.toFixed(1));
    } else {
        newValue = Math.round(value);
    }
    $(selector).val(newValue);
}

/**
 * Mapのvalue(Array)にvalueを追加(push)します
 * 
 * @param {Map} map 
 * @param {string} key 
 * @param {string} value 
 */
function pushToMapValueArray(map, key, value) {
    if (value == null) {
        if (!map.has(key)) {
            map.set(key, null);
        }
    } else if (map.has(key)) {
        let oldValue = map.get(key);
        if (oldValue == null) {
            map.set(key, [value]);
        } else if (!oldValue.includes(value)) {
            map.get(key).push(value);
        }
    } else {
        map.set(key, [value]);
    }
}

/**
 * オブジェクトのプロパティ値を同名の要素にセットします
 * 
 * @param {Object} obj 
 * @param {string} prefix 
 * @param {string} postfix 
 */
function setObjectPropertiesToElements(obj, prefix, postfix) {
    Object.keys(obj).forEach(propName => {
        let inputElem = document.getElementById(prefix + propName + postfix);
        if (inputElem) {
            let value = obj[propName];
            let step = $(inputElem).prop('step');
            if (step && Number(step) < 1) {
                value = value.toFixed(1);
            } else {
                value = Math.round(value);
            }
            $(inputElem).val(value);
        }
    });
}

/**
 * 
 * @param {Object} obj 
 */
function setObjectPropertiesToTableTd(obj) {
    Object.keys(obj).forEach(propName => {
        let valueElem = document.getElementById(propName + 'Value');
        if (valueElem) {
            let value = obj[propName];
            let inputElem = document.getElementById(propName + 'Input');
            if (inputElem) {
                if ($(inputElem).prop('step') && Number($(inputElem).prop('step')) < 1) {
                    value = Math.round(value * 10) / 10;
                } else {
                    value = Math.round(value);
                }
            }
            valueElem.textContent = value;
        }
    });
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
        if ($.isNumeric(formulaArr)) {
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
            } else if ($.isNumeric(entry)) {
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
    if ($.isNumeric(str)) {
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
 * セレクターにオプション要素を追加します
 * 
 * @param {string} key キー（オプション要素のvalue）
 * @param {Object} valueObj 値詳細 
 * @param {string} selector セレクタ
 */
const appendOptionElement = function (key, valueObj, selector) {
    if ('disabled' in valueObj && valueObj['disabled']) return;   // とりあえず無効レコードは追加しません
    let myText = key;
    if ('レアリティ' in valueObj) {
        myText = '★' + valueObj['レアリティ'] + ' ' + key;
    }
    $('<option>', {
        text: myText,
        value: key,
        disabled: ('disabled' in valueObj) && valueObj['disabled'],
        selected: ('selected' in valueObj) && valueObj['selected']
    }).appendTo(selector);
};

/**
 * セレクターにオプション要素を生成します
 * 
 * @param {Object} data 詳細
 * @param {string | string []} selector セレクター
 */
const appendOptionElements = function (data, selector) {
    if (Array.isArray(selector)) {
        selector.forEach(entry => {
            $(entry).empty();
        });
    } else {
        $(selector).empty();
    }
    Object.keys(data).forEach(key => {
        if (Array.isArray(selector)) {
            selector.forEach(entry => {
                appendOptionElement(key, data[key], entry);
            });
        } else {
            appendOptionElement(key, data[key], selector);
        }
    });
};

