// 



// そこそこ正確めな加算関数です
const addDecimal = function (value1, value2) {
    let decimalDigits1 = String(value1).length - String(value1).lastIndexOf(".") - 1;
    let decimalDigits2 = String(value2).length - String(value2).lastIndexOf(".") - 1;
    let decimalDigits = Math.max([decimalDigits1, decimalDigits2]);
    if (decimalDigits > 0) {
        let pow = Math.pow(10, decimalDigits);
        return ((value1 * pow) + (value2 * pow)) / pow;
    }
    return value1 + value2;
}

//
function pushArrMap(map, key, value) {
    if (map.has(key)) {
        if (value) {
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
const makeConditionExclusionMapFromStr = function (conditionStr, conditionMap, exclusionMap) {
    let name;
    let exclusion;
    let indexOf = conditionStr.indexOf("^");
    if (indexOf >= 0) {
        exclusion = conditionStr.substring(indexOf + 1);
        conditionStr = conditionStr.substring(0, indexOf);
    }
    let condArr = conditionStr.split("@");
    if (condArr.length == 1) {
        name = conditionStr;
        pushArrMap(conditionMap, name, null);
    } else if (condArr.length == 2) {
        name = condArr[0];
        const re = new RegExp("([^0-9\\.]*)([0-9\\.]+)-([0-9\\.]+)(.*)");
        let reRet = re.exec(condArr[1]);
        if (reRet) {
            let prefix = reRet[1];
            let rangeStart = Number(reRet[2]);
            let rangeEnd = Number(reRet[3]);
            let postfix = reRet[4];
            for (let i = rangeStart; i <= rangeEnd; i = addDecimal(i, rangeStart)) {
                pushArrMap(conditionMap, name, prefix + String(i) + postfix);
            }
        } else {
            pushArrMap(conditionMap, name, condArr[1]);
        }
    } else {
        console.error("%s[%o,%o,%o]", makeOptionConditionMap.name, conditionStr, conditionMap, exclusionMap);
    }
    if (exclusion) {
        pushArrMap(exclusionMap, name, exclusion.split(","));
    }
}

const analyzeValueFormula = function (kind, valueStr) {
    let param = kind;
    if (kind.endsWith("%")) {
        param = kind.replace("%$", "");
        switch (param) {
            case "HP":
                param = "基礎HP";
                break;
            case "攻撃力":
                param = "基礎攻撃力";
                break;
            case "防御力":
                param = "基礎防御力";
                break;
        }
    }
    let workArr = [];
    let re = new RegExp("(\\+|\\-|\\*|\\/|\\%|[0-9\\.]+|[^\\+\\-\\*\\/\\%0-9\\.]+)(.*)");
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
                if (workArr[i + 1] == "%") {
                    valueArr.push(workArr[i] / 100);
                    continue;
                }
            }
        } else if (workArr[i] == "%") {
            valueArr.push("*");
            if ((i + 1) < workArr.length) {
                if (["+", "-", "*", "/"].includes(workArr[i + 1])) {
                    valueArr.push(param);
                }
            } else {
                valueArr.push(param);
            }
            continue;
        }
        valueArr.push(workArr[i]);
    }
    return valueArr;
}
const setupTypeValueFormulaArrFromObj = function (parentName, obj, level = null) {
    //console.debug("%s[%o,%o,%o]", setupTypeValueFormulaArrFromObj.name, parentName, obj, level);
    let newObj = JSON.parse(JSON.stringify(obj));
    let my種類 = obj["種類"];
    let my数値 = obj["数値"];
    if ("数値" in obj && level) {
        my数値 = obj["数値"][level];
    }
    newObj["数値"] = analyzeValueFormula(my種類, my数値);
    if (parentName) {
        if ("名前" in obj) {
            newObj["名前"] = parentName + "." + newObj["名前"];
        } else {
            newObj["名前"] = parentName;
        }
    }
    if ("条件" in obj) {
        let my条件 = obj["条件"];
        let my条件Arr = my条件.split("@");
        if (my条件Arr.length > 1) {
            const re = new RegExp("([^0-9\\.]*)([0-9\\.]+)-([0-9\\.]+)(.*)");
            let reRet = re.exec(my条件Arr[1]);
            if (reRet) {
                let prefix = reRet[1];
                let rangeStart = Number(reRet[2]);
                let rangeEnd = Number(reRet[3]);
                let postfix = reRet[4];
                for (let i = rangeStart; i <= rangeEnd; i = addDecimal(i, rangeStart)) {
                    let newObj2 = JSON.parse(JSON.stringify(newObj));
                    newObj2["条件"] = my条件Arr[0] + "@" + prefix + i + postfix;
                    newObj2["数値"].push("*");
                    newObj2["数値"].push(i);
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
    let my数値 = obj["数値"];
    if (level) {
        my数値 = obj["数値"][level];
    }
    return analyzeValueFormula("攻撃力", my数値);
}

// 計算式を評価します
function calculateDamage(calculateObj, kind, formula) {
    let result = 0;
    if ($.isArray(formula)) {
        let op;
        formula.forEach(entry => {
            if (["+", "-", "*"].includes(entry)) {  // 加算 減算 乗算
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
                    console.error(calculateDamage.name, calculateObj, kind, formula);
                }
            }
            if (op) {
                switch (op) {
                    case "+":
                        result += value;
                        break;
                    case "-":
                        result -= value;
                        break;
                    case "*":
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
                console.error(calculateDamage.name, calculateObj, kind, formula);
            }
        }
    }
    console.debug("%s[%o,%o,%o] => %o", calculateDamage.name, null, kind, formula, result);
    return result;
}
