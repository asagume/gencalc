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
