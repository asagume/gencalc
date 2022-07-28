/**
 * 
 * @param {Object} damageDetailObjArr 
 * @returns {Object[]}
 */
function makeConditionListCheckbox(damageDetailObjArr) {
    try {
        const result = [];
        damageDetailObjArr['条件'].forEach((value, key) => {
            if (value) return;
            const conditionObj = {
                name: key,
            };
            if (damageDetailObjArr['排他'].has(key)) {
                conditionObj['exclusions'] = damageDetailObjArr['排他'].get(key);
            }
            result.push(conditionObj);
        });
        return result;
    } catch (error) {
        console.error(damageDetailObjArr);
        throw error;
    }
}

/**
 * 
 * @param {Object} damageDetailObjArr 
 * @returns {Object[]}
 */
function makeConditionListSelect(damageDetailObjArr) {
    try {
        const result = [];
        damageDetailObjArr['条件'].forEach((value, key) => {
            if (!value) return;
            if (Array.isArray(value) && value.length > 0) {
                if (isString(value[0]) && value[0].startsWith('required_')) {
                    // nop
                } else {
                    value.splice(0, 0, null);
                }
            } else {
                console.error(damageDetailObjArr, value, key);
                return;
            }
            const conditionObj = {
                name: key,
                options: value,
            };
            if (damageDetailObjArr['排他'].has(key)) {
                conditionObj['exclusions'] = damageDetailObjArr['排他'].get(key);
            }
            result.push(conditionObj);
        });
        return result;
    } catch (error) {
        console.error(damageDetailObjArr);
        throw error;
    }
}

/**
 * 条件の値（集合）を初期設定します.
 * 
 * @param {Object} conditionValues 条件の値（集合）
 * @param {Object[]} conditionList 条件のリスト
 * @param {boolean} opt_checked checkboxの初期値
 * @param {number} opt_selectedIndex selectの初期値
 * @param {Object} opt_initialConditionValues 条件の初期値（集合）
 */
function initializeConditionValues(conditionValues, conditionList, opt_checked = false, opt_selectedIndex = 0, opt_initialConditionValues = {}) {
    try {
        conditionList.forEach(entry => {
            if (entry.name in opt_initialConditionValues) { // 初期値指定ありを優先します
                conditionValues[entry.name] = opt_initialConditionValues[entry.name];
            } else {
                let isExcluded = false;
                if ('exclusions' in entry) {
                    entry.exclusions.forEach(exclusion => {
                        if (exclusion in conditionValues && conditionValues[exclusion]) {
                            isExcluded = true;
                        }
                    });
                }
                if (isExcluded) {
                    if ('options' in entry) {   // select
                        conditionValues[entry.name] = 0;
                    } else {    // checkbox
                        conditionValues[entry.name] = false;
                    }
                } else {
                    if ('options' in entry) {   // select
                        conditionValues[entry.name] = opt_selectedIndex >= entry.options.length ? entry.options.length - 1 : opt_selectedIndex;
                    } else {    // checkbox
                        conditionValues[entry.name] = opt_checked;
                    }
                }
            }
            // 排他条件を設定します
            if (conditionValues[entry.name] && 'exclusions' in entry) {
                entry.exclusions.forEach(exclusion => {
                    if (exclusion in opt_initialConditionValues) return;
                    conditionList.filter(s => s.name == exclusion).forEach(exclusionItem => {
                        if ('options' in exclusionItem) {   // select
                            conditionValues[exclusion] = 0;
                        } else {    // checkbox
                            conditionValues[exclusion] = false;
                        }
                    });
                });
            }
        });
    } catch (error) {
        console.error(conditionValues, conditionList, opt_checked, opt_selectedIndex, opt_initialConditionValues);
        throw error;
    }
}

/**
 * 
 * @param {Object[]} conditionList 
 * @param {Object} conditionValues 
 * @returns {string[]}
 */
function makeValidConditionValueArr2(conditionList, conditionValues) {
    const result = [];
    conditionList.forEach(entry => {
        if (entry.name in conditionValues) {
            let value;
            if ('options' in entry) {
                if (entry.options[conditionValues[entry.name]]) {
                    value = entry.name + '@' + entry.options[conditionValues[entry.name]];
                }
            } else if (conditionValues[entry.name]) {   // checked
                value = entry.name;
            }
            if (value) {
                result.push(value);
            }
        }
    });
    return result;
}
