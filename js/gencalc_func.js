

// 存在するプロパティに対してvalueを代入します
function setExistingProp(targetObj, propName, value) {
    if (propName in targetObj) {
        targetObj[propName] = value;
    }
}

// 存在するプロパティに対してvalueを加算します
function addExistingProp(targetObj, propName, value) {
    if (propName in targetObj) {
        targetObj[propName] += value;
    }
}

// そこそこ正確めな加算関数です
const addDecimal = function (value1, value2) {
    let decimalDigits1 = String(value1).length - String(value1).lastIndexOf('.');
    let decimalDigits2 = String(value2).length - String(value2).lastIndexOf('.');
    let decimalDigits = Math.max([decimalDigits1, decimalDigits2]);
    return Math.round((value1 * 100 + value2 * 100) / 10) / 10;
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

// {条件名}
// {条件名}@{条件値}
// {条件名}@{PREFIX}{レンジSTART}-{レンジEND}{POSTFIX}
// {条件名}^{排他条件}
// {条件名}@{条件値1},{条件値2},{条件値3}...
const makeConditionExclusionMapFromStr = function (conditionStr, conditionMap, exclusionMap) {
    let name;
    let exclusion;
    let indexOf = conditionStr.indexOf('^');
    if (indexOf >= 0) {
        exclusion = conditionStr.substring(indexOf + 1);
        conditionStr = conditionStr.substring(0, indexOf);
    }
    let condArr = conditionStr.split(/[@#]/);
    if (condArr.length == 1) {
        name = conditionStr;
        pushToMapValueArray(conditionMap, name, null);
    } else if (condArr.length == 2) {
        name = condArr[0];
        if (condArr[1].indexOf('-') != -1) {
            const re = new RegExp('([^0-9\\.]*)([0-9\\.]+)-([0-9\\.]+)(.*)');
            let reRet = re.exec(condArr[1]);
            if (reRet) {
                let prefix = reRet[1];
                let rangeStart = Number(reRet[2]);
                let rangeEnd = Number(reRet[3]);
                let postfix = reRet[4];
                for (let i = rangeStart; i <= rangeEnd; i = addDecimal(i, rangeStart)) {
                    pushToMapValueArray(conditionMap, name, prefix + String(i) + postfix);
                }
            } else {
                pushToMapValueArray(conditionMap, name, condArr[1]);
            }
        } else if (condArr[1].indexOf(',') != -1) {
            let re = new RegExp('([^0-9\\.]*)([0-9\\.,]+)(.*)');
            let reRet = re.exec(condArr[1]);
            let prefix = reRet[1];
            let condValurArr = reRet[2].split(',');
            let postfix = reRet[3];
            condValurArr.forEach(value => {
                pushToMapValueArray(conditionMap, name, prefix + value + postfix);
            });
        } else {
            pushToMapValueArray(conditionMap, name, condArr[1]);
        }
    } else {
        console.error(conditionStr, conditionMap, exclusionMap);
    }
    if (exclusion) {
        pushToMapValueArray(exclusionMap, name, exclusion.split(','));
    }
}

const analyzeValueFormula = function (kind, valueStr) {
    let workArr = [];
    let re = new RegExp('(\\+|\\-|\\*|\\/|\\%|[0-9\\.]+|[^\\+\\-\\*\\/\\%0-9\\.]+)(.*)');
    let workStr = valueStr;
    while (true) {
        let reRet = re.exec(workStr);
        if (!reRet) break;
        let value = reRet[1];
        workArr.push(value);
        if (!reRet[2]) break;
        workStr = reRet[2];
    }
    let valueArr = [];
    for (let i = 0; i < workArr.length; i++) {
        if ($.isNumeric(workArr[i])) {
            if ((i + 1) < workArr.length) {
                if (workArr[i + 1] == '%') {
                    valueArr.push(workArr[i] / 100);
                    continue;
                }
            }
        } else if (workArr[i] == '%') {
            valueArr.push('*');
            if ((i + 1) < workArr.length) {
                if (['+', '-', '*', '/'].includes(workArr[i + 1])) {
                    valueArr.push(kind);
                }
            } else {
                valueArr.push(kind);
            }
            continue;
        }
        valueArr.push(workArr[i]);
    }
    return valueArr;
}
const setupTypeValueFormulaArrFromObj = function (parentName, obj, level = null) {
    //console.debug('%s[%o,%o,%o]', setupTypeValueFormulaArrFromObj.name, parentName, obj, level);
    let newObj = JSON.parse(JSON.stringify(obj));
    let my種類 = obj['種類'];
    let my数値 = obj['数値'];
    if ('数値' in obj && level) {
        my数値 = obj['数値'][level];
    }
    newObj['数値'] = analyzeValueFormula(my種類, my数値);
    if (parentName) {
        if ('名前' in obj) {
            newObj['名前'] = parentName + '.' + newObj['名前'];
        } else {
            newObj['名前'] = parentName;
        }
    }
    if ('条件' in obj) {
        let my条件 = obj['条件'];
        let my条件Arr = my条件.split('@');
        if (my条件Arr.length > 1) {
            const re = new RegExp('([^0-9\\.]*)([0-9\\.]+)-([0-9\\.]+)(.*)');
            let reRet = re.exec(my条件Arr[1]);
            if (reRet) {
                let prefix = reRet[1];
                let rangeStart = Number(reRet[2]);
                let rangeEnd = Number(reRet[3]);
                let postfix = reRet[4];
                for (let i = rangeStart; i <= rangeEnd; i = addDecimal(i, rangeStart)) {
                    let newObj2 = JSON.parse(JSON.stringify(newObj));
                    newObj2['条件'] = my条件Arr[0] + '@' + prefix + i + postfix;
                    newObj2['数値'].push('*');
                    newObj2['数値'].push(i);
                    typeValueFormulaArr.push(newObj2);
                }
                return;
            }
        }
    }
    typeValueFormulaArr.push(newObj);
}

const setupTypeValueFormulaArr = function (parentName, obj, level = null) {
    if ($.isArray(obj)) {
        obj.forEach(e => {
            setupTypeValueFormulaArrFromObj(parentName, e, level);
        });
    } else {
        setupTypeValueFormulaArrFromObj(parentName, obj, level);
    }
}

const makeDamageFormulaArrFromObj = function (obj, level = null) {
    let my数値 = obj['数値'];
    if (level) {
        my数値 = obj['数値'][level];
    }
    return analyzeValueFormula('攻撃力', my数値);
}

// 計算式を評価します
function calculateDamage(calculateObj, formula) {
    let result = 0;
    if ($.isArray(formula)) {
        let op;
        formula.forEach(entry => {
            if (['+', '-', '*'].includes(entry)) {  // 加算 減算 乗算
                op = entry;
                return;
            }
            let value;
            if ($.isNumeric(entry)) {
                value = Number(entry);
            } else {
                if (entry in calculateObj) {
                    value = calculateObj[entry];
                } else {
                    console.error(calculateDamage.name, calculateObj, formula);
                }
            }
            if (op) {
                switch (op) {
                    case '+':
                        result += value;
                        break;
                    case '-':
                        result -= value;
                        break;
                    case '*':
                        result *= value;
                        break;
                }
            } else {
                result += value;
            }
            op = null;
        });
    } else {
        if ($.isNumeric(formula)) {
            result += Number(formula);
        } else {
            if (formula in calculateObj) {
                result += calculateObj[formula];
            } else {
                console.error(calculateDamage.name, calculateObj, formula);
            }
        }
    }
    //console.debug('%s[%o,%o,%o] => %o', calculateDamage.name, null, formula, result);
    return result;
}

//
function setObjectPropertiesToElements(obj, prefix, postfix) {
    Object.keys(obj).forEach(propName => {
        let inputElem = document.getElementById(prefix + propName + postfix);
        if (inputElem) {
            let value = obj[propName];
            let step = inputElem.step;
            if (step && Number(step) < 1) {
                value = Number(value.toFixed(1));
            } else {
                value = Math.round(value);
            }
            inputElem.value = value;
        }
    });
}

//
const calculateFormulaArray = function (itemValueObj, formulaArr, kind, opt_max = null) {
    let result = 0;
    if (!$.isArray(formulaArr)) {
        if ($.isNumeric(formulaArr)) {
            result = Number(formulaArr);
        } else {
            if (formulaArr in itemValueObj) {
                result = itemValueObj[formulaArr];
            } else {
                console.error(itemValueObj, formulaArr, kind, opt_max);
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
                subResult = calculateFormulaArray(itemValueObj, entry, kind);
            } else {
                if (entry in itemValueObj) {
                    subResult = Number(itemValueObj[entry]);
                } else {
                    console.error(itemValueObj, formulaArr, kind, opt_max);
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
                        break;
                    case '/':
                        result /= subResult;
                        break;
                }
            }
        });
    }
    if (opt_max != null && $.isNumeric(opt_max) && result > Number(opt_max)) {
        result = Number(opt_max);
    }
    return result;
}

//// 文字列を解析して、計算式Arrayを作成します
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
    let re = new RegExp('([0-9\\.]+%[^0-9\\.%\\+\\-\\*/]+|[0-9\\.]+%|\\-?[0-9\\.]+)([\\+\\-\\*/]?)(.*)');
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

// 計算式Arrayを表示用の文字列に変換します
function formulaArrayToString(formulaArr) {
    let result = '';
    if ($.isArray(formulaArr)) {
        result += '[';
        formulaArr.forEach(entry => {
            result += formulaArrayToString(entry);
        });
        result += ']';
    } else {
        result += formulaArr;
    }
    return result;
}

// テーブルクリックで行を隠したり表示したり
var selectorVisiblityStateMap = new Map();
const elementOnClickHidableChildrenToggle = function () {
    let selector = '#' + this.id + ' .hidable';
    $(selector).toggle();
    let isVisible = $(selector).is(':visible');
    selectorVisiblityStateMap.set(selector, $(selector).is(':visible'));
    console.debug(selectorVisiblityStateMap);
}
const elementOnClickHidableNeighborToggle = function () {
    let selector = '#' + this.id + '+.hidable';
    $(selector).toggle();
    let isVisible = $(selector).is(':visible');
    selectorVisiblityStateMap.set(selector, $(selector).is(':visible'));
    console.debug(selectorVisiblityStateMap);
}

function isHiddenHidableElement(selector, opt_default = false) {
    let isHidden = opt_default;
    if (selectorVisiblityStateMap.has(selector)) {
        isHidden = !selectorVisiblityStateMap.get(selector);
    }
    return isHidden;
}
