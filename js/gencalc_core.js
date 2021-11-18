// セレクターに使用できない文字をエスケープします
function selectorEscape(val) {
    return val.replace(/[ !"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&');
}

// 加算関数です
const addDecimal = function (value1, value2, opt_max = null) {
    let decimalDigits1 = String(value1).length - String(value1).lastIndexOf('.');
    let decimalDigits2 = String(value2).length - String(value2).lastIndexOf('.');
    let decimalDigits = Math.max([decimalDigits1, decimalDigits2]);
    let result = Math.floor((value1 * 100 + value2 * 100) / 10) / 10;
    if (opt_max != null) {
        result = Math.min(result, opt_max);
    }
    return result;
}

// 代入先のstep属性に併せて丸めた数値をセットします
function setInputValue(selector, value) {
    let step = $(selector).attr('step');
    let newValue = value;
    if (step && Number(step) < 1) {
        newValue = Number(value.toFixed(1));
    } else {
        newValue = Math.round(value);
    }
    $(selector).val(newValue);
}

// Mapのvalue(Array)にvalueを追加(push)します
function pushToMapValueArray(map, key, value) {
    if (map.has(key)) {
        if (value != null) {
            if (!map.get(key).includes(value)) {
                map.get(key).push(value);
            }
        }
    } else {
        if (value == null) {
            map.set(key, null);
        } else {
            map.set(key, [value]);
        }
    }
}

// オブジェクトのプロパティ値を同名の要素にセットします
function setObjectPropertiesToElements(obj, prefix, postfix) {
    Object.keys(obj).forEach(propName => {
        let inputElem = document.getElementById(prefix + propName + postfix);
        if (inputElem) {
            let value = obj[propName];
            let step = inputElem.step;
            if (step && Number(step) < 1) {
                value = value.toFixed(1);
            } else {
                value = Math.round(value);
            }
            inputElem.value = value;
        }
    });
}

function setObjectPropertiesToTableTd(obj) {
    Object.keys(obj).forEach(propName => {
        let valueElem = document.getElementById(propName + 'Value');
        if (valueElem) {
            let value = obj[propName];
            let inputElem = document.getElementById(propName + 'Input');
            if (inputElem) {
                if (inputElem.step && Number(inputElem.step) < 1) {
                    value = Math.round(value * 10) / 10;
                } else {
                    value = Math.round(value);
                }
            }
            valueElem.textContent = value;
        }
    });
}

// 計算式を計算します
const calculateFormulaArray = function (statusObj, formulaArr, opt_max = null) {
    let result = 0;
    if (!$.isArray(formulaArr)) {
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
            } else if ($.isArray(entry)) {
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
    return result;
}

// 文字列を解析して、計算式Arrayを作成します
// 数値|数値%|数値%文字列|文字列
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

const analyzeFormulaStr = function (str, defaultItem = null) {
    let resultArr = [];
    let re = new RegExp('([0-9\\.]+%[^0-9\\.%\\+\\-\\*/]+|[0-9\\.]+%|\\-?[0-9\\.]+|[^0-9\\.%\\+\\-\\*/]+)([\\+\\-\\*/]?)(.*)');
    let workStr = str;
    while (true) {
        let reRet = re.exec(workStr);
        if (!reRet) {
            resultArr.push(workStr);
            break;
        }
        resultArr.push(analyzeFormulaStrSub(reRet[1], defaultItem));
        if (reRet[2]) {
            resultArr.push(reRet[2]);
            if (reRet[3]) {
                workStr = reRet[3];
                continue;
            } else {
                console.error(str, defaultItem);
            }
        } else if (reRet[3]) {
            console.error(str, defaultItem);
        }
        break;
    }
    return resultArr;
}

// 防御補正を計算します
//function calcurate防御補正(level, enemyLevel, opt_def = 0, opt_ignoreDef = 0) {
//    let calcIgnoreDef = opt_ignoreDef / 100;
//    let calcDef = opt_def / 100;
//    let result = (level + 100) / ((1 - calcIgnoreDef) * (1 + calcDef) * (enemyLevel + 100) + level + 100);
//    return result;
//}

// 耐性補正を計算します
//function calculate耐性補正(res) {
//    if (res < 0) {
//        res = 100 - res / 2;
//    } else if (res < 75) {
//        res = 100 - res;
//    } else {
//        res = 100 / (4 * res + 100)
//    }
//    return res / 100;
//}

// 