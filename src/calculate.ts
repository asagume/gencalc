import { deepcopy, isNumber, isPlainObject, overwriteObject } from "./common";
import { CHANGE_KIND_STATUS, CHANGE_KIND_TALENT, DAMAGE_RESULT_TEMPLATE, TArtifactDetailInput, TCharacterInput, TConditionInput, TDamageResult, TDamageResultEntry, TOptionInput, TStats, TStatsInput, ステータスTEMPLATE, 元素反応TEMPLATE, 基礎ステータスARRAY, 突破レベルレベルARRAY, 聖遺物サブ効果ARRAY } from "./input";
import { ARTIFACT_MAIN_MASTER, ARTIFACT_SUB_MASTER, DAMAGE_CATEGORY_ARRAY, ELEMENTAL_REACTION_MASTER, TArtifactMainRarity, TArtifactMainStat, TArtifactSubKey } from "./master";

/** [突破レベル, レベル] => レベル\+?  */
export function getLevelStr(ascension: number, level: number): string {
    return level + 突破レベルレベルARRAY[ascension][0] == level ? '+' : '';
}

/** キャラクターのレベルに応じた（基礎/突破）ステータスを算出します */
export function getStatValueByLevel(statObj: any, ascension: number, level: number): number {
    if (!statObj) return 0;
    const myLevelStr = getLevelStr(ascension, level);
    if (myLevelStr in statObj) {
        return statObj[myLevelStr];
    }
    const lowLevel = 突破レベルレベルARRAY[ascension][0];
    const highLevel = 突破レベルレベルARRAY[ascension][突破レベルレベルARRAY[ascension].length - 1];
    const lowValue = statObj[lowLevel + '+'];
    const highValue = statObj[highLevel];
    return lowValue + (highValue - lowValue) * (level - lowLevel) / (highLevel - lowLevel);
}

/** 武器のレベルに応じた（基礎/突破）ステータスを算出します */
export function getPropertyValueByLevel(statObj: any, ascension: number): number {
    const lowLevel = 突破レベルレベルARRAY[ascension][0];
    return statObj[lowLevel + '+'];
}

export function getValueByLevel(level: number | string, valueObj: any): number {
    if (level in valueObj) return valueObj[level];
    level = Number(level);
    const levelArr = Object.keys(valueObj).map(s => Number(s));
    let lowLevel;
    let highLevel;
    for (let i = 0; i < levelArr.length - 1; i++) {
        if (levelArr[i] <= level && levelArr[i + 1] >= level) {
            lowLevel = levelArr[i];
            highLevel = levelArr[i + 1];
        }
    }
    if (!lowLevel || !highLevel) return 0;
    return valueObj[lowLevel] + (valueObj[highLevel] - valueObj[lowLevel]) * (level - lowLevel) / (highLevel - lowLevel);
}

/** 聖遺物メイン効果のステータスを算出します */
export function calculateArtifactStatsMain(artifactStatsMain: any, mainstats: string[]) {
    (Object.keys(artifactStatsMain) as (keyof typeof artifactStatsMain)[]).forEach(
        (key) => {
            artifactStatsMain[key] = 0;
        }
    );
    for (const statWithRarity of mainstats) {
        if (!statWithRarity) continue;
        const stat: any[] = statWithRarity.split("_");
        artifactStatsMain[stat[1]] += ARTIFACT_MAIN_MASTER[stat[0] as TArtifactMainRarity][stat[1] as TArtifactMainStat];
    }
}

export function makePrioritySubstatValueList(
    prioritySubstats: TArtifactSubKey[],
    index: number,
    opt_substat?: TArtifactSubKey
) {
    const result: number[] = [];
    if (prioritySubstats[index]) {
        if (!opt_substat) opt_substat = prioritySubstats[index];
        if (opt_substat && opt_substat in ARTIFACT_SUB_MASTER) {
            const valueArr = ARTIFACT_SUB_MASTER[opt_substat];
            for (let i = 0; i < valueArr.length; i++) {
                result.push(valueArr[i]);
                if (i < valueArr.length - 1) {
                    const diff = valueArr[i + 1] - valueArr[i];
                    result.push(valueArr[i] + diff / 2);
                }
            }
        }
    }
    return result;
}

/** 聖遺物優先するサブ効果のステータスを算出します */
export function calculateArtifactSubStatByPriority(
    artifactStatsSub: any,
    mainstats: string[],
    prioritySubstats: string[],
    priotritySubstatIndices: number[],
    priotritySubstatValues: number[][],
    prioritySubstatCounts: number[]) {
    (Object.keys(artifactStatsSub) as (keyof typeof artifactStatsSub)[]).forEach(
        (key) => {
            artifactStatsSub[key] = 0;
        }
    );
    let totalCount = 0;
    for (let i = 0; i < 3; i++) {
        if (!prioritySubstats[i]) continue;
        if (!priotritySubstatIndices[i]) continue;
        if (!prioritySubstatCounts[i]) continue;
        artifactStatsSub[prioritySubstats[i]] += priotritySubstatValues[i][priotritySubstatIndices[i]] * prioritySubstatCounts[i];
        totalCount += prioritySubstatCounts[i];
    }
    // 初期: 3 or 4
    // 強化: 5 (+4 +8 +12 +16 +20)
    // 初期+強化: min=40 max=45
    const noPrioritySubstatArr = 聖遺物サブ効果ARRAY.filter(s => !prioritySubstats.includes(s));
    let noPriorityCount = Math.min(45, 40 + Math.round(Math.max(0, (totalCount - 12) / 4)));
    noPriorityCount -= Math.min(45, totalCount);
    for (let i = noPriorityCount; i > 0; i--) {
        const substat = noPrioritySubstatArr[i % noPrioritySubstatArr.length] as keyof typeof ARTIFACT_SUB_MASTER;
        artifactStatsSub[substat] += ARTIFACT_SUB_MASTER[substat][3];
    }
    const star4Count = mainstats.filter(s => s && s.startsWith('4')).length;
    const multiplier = 1 - (0.07 * star4Count); // ★4聖遺物ひとつにつきステータスを7%下げます
    (Object.keys(artifactStatsSub) as (keyof typeof artifactStatsSub)[]).forEach(
        (key) => {
            artifactStatsSub[key] *= multiplier;
            artifactStatsSub[key] = Math.round(artifactStatsSub[key] * 10) / 10;
        }
    );
}

export function calculateArtifactStats(artifactDetailInput: TArtifactDetailInput) {
    const artifactStats = artifactDetailInput.聖遺物ステータス;
    const artifactStatsMain = artifactDetailInput.聖遺物ステータスメイン効果;
    const artifactStatsSub = artifactDetailInput.聖遺物ステータスサブ効果;
    for (const stat of Object.keys(artifactStats)) {
        artifactStats[stat] = 0;
    }
    for (const stat of Object.keys(artifactStatsMain)) {
        if (stat in artifactStats) artifactStats[stat] += artifactStatsMain[stat];
        else artifactStats[stat] = artifactStatsMain[stat];
    }
    for (const stat of Object.keys(artifactStatsSub)) {
        if (stat in artifactStats) artifactStats[stat] += artifactStatsSub[stat];
        else artifactStats[stat] = artifactStatsSub[stat];
    }
}

/** キャラクターのステータスを計算します */
export const calculateStats = function (
    statsInput: TStatsInput,
    characterInput: TCharacterInput,
    artifactDetailInput: TArtifactDetailInput,
    conditionInput: TConditionInput,
    optionInput: TOptionInput) {
    if (!characterInput) return;
    if (!artifactDetailInput) return;
    if (!conditionInput) return;

    try {
        const characterMaster = characterInput.characterMaster;
        const ascension = characterInput.突破レベル;
        const level = characterInput.レベル;
        const constellation = characterInput.命ノ星座;
        const weaponMaster = characterInput.weaponMaster;
        const weaponAscension = characterInput.武器突破レベル;
        const weaponLevel = characterInput.武器レベル;

        const workStatsObj = deepcopy(ステータスTEMPLATE);

        workStatsObj['突破レベル'] = ascension;
        workStatsObj['レベル'] = level;
        workStatsObj['命ノ星座'] = constellation;

        // キャラクターマスターから元素エネルギーを設定します
        if ('元素エネルギー' in characterMaster['元素爆発']) {
            workStatsObj['元素エネルギー'] = characterMaster['元素爆発']['元素エネルギー'];
        }
        if ('固有変数' in characterMaster) {
            for (const name of Object.keys(characterMaster['固有変数'])) {
                if (name in conditionInput.conditionValues) {
                    workStatsObj[name] = Number(conditionInput.conditionValues[name]);
                } else {
                    workStatsObj[name] = characterMaster['固有変数'][name];
                }
            }
        }

        // 敵マスターから敵のステータス（耐性）を設定します
        for (const stat of Object.keys(statsInput.enemyMaster).filter(s => s != 'key')) {
            const toStat = '敵' + stat;
            workStatsObj[toStat] = statsInput.enemyMaster[stat];
        }

        // ステータス補正を計上します
        Object.keys(statsInput.statAdjustments).forEach(stat => {
            if (stat in workStatsObj) workStatsObj[stat] += statsInput.statAdjustments[stat];
        });

        // キャラクターの基礎ステータスと突破ステータスを計上します
        for (const stat of Object.keys(characterMaster['ステータス'])) {
            if (基礎ステータスARRAY.includes(stat)) {
                workStatsObj[stat] += getStatValueByLevel(characterMaster['ステータス'][stat], ascension, level);
            } else {
                const toStat = ['HP', '攻撃力', '防御力'].includes(stat) ? stat + '+' : stat;
                if (toStat in workStatsObj) {
                    workStatsObj[toStat] += getPropertyValueByLevel(characterMaster['ステータス'][stat], ascension);
                }
            }
        }

        // 武器の基礎ステータスと突破ステータスを計上します
        for (const stat of Object.keys(weaponMaster['ステータス'])) {
            workStatsObj[stat] += getStatValueByLevel(weaponMaster['ステータス'][stat], weaponAscension, weaponLevel);
        }

        // 聖遺物のステータスを計上します
        const artifactStats = artifactDetailInput.聖遺物ステータス;
        for (const stat of Object.keys(artifactStats)) {
            const toStat = ['HP', '攻撃力', '防御力'].includes(stat) ? stat + '+' : stat;
            workStatsObj[toStat] += artifactStats[stat];
        }

        if (optionInput) {
            // 元素共鳴を計上します
            Object.keys(optionInput.elementalResonanceStatAdjustments).forEach(stat => {
                if (stat in workStatsObj) workStatsObj[stat] += optionInput.elementalResonanceStatAdjustments[stat];
            });
            // チームオプションを計上します
            Object.keys(optionInput.teamOptionStatAdjustments).forEach(stat => {
                if (stat in workStatsObj) workStatsObj[stat] += optionInput.teamOptionStatAdjustments[stat];
            });
            // その他オプションを計上します
            Object.keys(optionInput.miscOptionStatAdjustments).forEach(stat => {
                if (stat in workStatsObj) workStatsObj[stat] += optionInput.miscOptionStatAdjustments[stat];
            });
        }

        const validConditionValueArr = makeValidConditionValueArr(conditionInput);

        // ステータス変化
        const myPriority1KindArr = ['元素チャージ効率'];    // 攻撃力の計算で参照するステータス 草薙の稲光
        const myPriority1KindFormulaArr = [] as any[];
        const myPriority2KindFormulaArr = [] as any[];
        const myKindFormulaArr = [] as any[];
        for (const myDamageDetail of [characterInput.damageDetailMyCharacter, characterInput.damageDetailMyWeapon, characterInput.damageDetailMyArtifactSets]) {
            if (myDamageDetail && CHANGE_KIND_STATUS in myDamageDetail) {
                for (const myDetailObj of myDamageDetail[CHANGE_KIND_STATUS]) {
                    let myNew数値 = myDetailObj['数値'];
                    if (myDetailObj['条件']) {
                        const number = checkConditionMatches(myDetailObj['条件'], validConditionValueArr, constellation);
                        if (number == 0) continue;
                        if (number != 1) {
                            myNew数値 = (myNew数値 as any).concat(['*', number]);
                        }
                    }
                    if (myDetailObj['対象']) {
                        const workArr = myDetailObj['対象'].split('.');
                        if (['通常攻撃', '重撃', '落下攻撃', '元素スキル', '元素爆発'].includes(workArr[0])) {
                            if (workArr.length > 1) {
                                // FIXME
                            } else {
                                const myNew種類 = myDetailObj['種類'] + '.' + myDetailObj['対象'];
                                myKindFormulaArr.push([myNew種類, myNew数値, myDetailObj['上限']]);
                            }
                        }
                        continue;  // 対象指定ありのものはスキップします
                    }
                    if (myDetailObj['種類']) {
                        if (myPriority1KindArr.includes(myDetailObj['種類'])) { // 攻撃力の計算で参照されるものを先に計上するため…
                            myPriority1KindFormulaArr.push([myDetailObj['種類'], myNew数値, myDetailObj['上限']]);
                        } else if (myDetailObj['種類'].endsWith('%')) {  // 乗算系(%付き)のステータスアップを先回しします HP 攻撃力 防御力しかないはず
                            myPriority2KindFormulaArr.push([myDetailObj['種類'], myNew数値, myDetailObj['上限']]);
                        } else {
                            myKindFormulaArr.push([myDetailObj['種類'], myNew数値, myDetailObj['上限']]);
                        }
                    }
                }
            }
        }
        // 攻撃力の計算で参照されるステータスアップを先に計上します
        myPriority1KindFormulaArr.forEach(entry => {
            updateStats(workStatsObj, entry[0], entry[1], entry[2]);
        });
        // 乗算系のステータスアップを計上します HP% 攻撃力% 防御力%
        myPriority2KindFormulaArr.sort(compareFunction);
        myPriority2KindFormulaArr.forEach(entry => {
            updateStats(workStatsObj, entry[0], entry[1], entry[2]);
        });

        // HP, 攻撃力, 防御力を計算します
        workStatsObj['HP上限'] += workStatsObj['基礎HP'] + workStatsObj['HP+'];
        workStatsObj['HP上限'] += (workStatsObj['基礎HP'] * workStatsObj['HP%']) / 100;
        workStatsObj['攻撃力'] += workStatsObj['基礎攻撃力'] + workStatsObj['攻撃力+'];
        workStatsObj['攻撃力'] += (workStatsObj['基礎攻撃力'] * workStatsObj['攻撃力%']) / 100;
        workStatsObj['防御力'] += workStatsObj['基礎防御力'] + workStatsObj['防御力+'];
        workStatsObj['防御力'] += (workStatsObj['基礎防御力'] * workStatsObj['防御力%']) / 100;

        // それ以外のステータスアップを計上します
        myKindFormulaArr.sort(compareFunction);
        myKindFormulaArr.forEach(entry => {
            updateStats(workStatsObj, entry[0], entry[1], entry[2]);
        });

        // 天賦性能変化
        let 通常攻撃_元素Var = null;
        let 重撃_元素Var = null;
        let 落下攻撃_元素Var = null;
        for (const myDamageDetail of [characterInput.damageDetailMyCharacter, characterInput.damageDetailMyWeapon, characterInput.damageDetailMyArtifactSets]) {
            if (myDamageDetail && CHANGE_KIND_TALENT in myDamageDetail) {
                for (const myDetailObj of myDamageDetail[CHANGE_KIND_TALENT]) {
                    if (myDetailObj['条件']) {
                        const number = checkConditionMatches(myDetailObj['条件'], validConditionValueArr, constellation);
                        if (number == 0) continue;
                    }
                    if (myDetailObj['種類'] && myDetailObj['種類'].endsWith('元素付与')) {
                        const my元素 = myDetailObj['種類'].replace('元素付与', '');
                        if (!myDetailObj['対象']) {
                            通常攻撃_元素Var = my元素;
                            重撃_元素Var = my元素;
                            落下攻撃_元素Var = my元素;
                        } else if (myDetailObj['対象'] == '通常攻撃ダメージ') {
                            通常攻撃_元素Var = my元素;
                        } else if (myDetailObj['対象'] == '重撃ダメージ') {
                            重撃_元素Var = my元素;
                        } else if (myDetailObj['対象'] == '落下攻撃ダメージ') {
                            落下攻撃_元素Var = my元素;
                        }
                    }
                }
            }
        }
        conditionInput.攻撃元素 = [通常攻撃_元素Var, 重撃_元素Var, 落下攻撃_元素Var];

        overwriteObject(statsInput.statsObj, workStatsObj);
    } catch (error) {
        console.error(statsInput, characterInput, artifactDetailInput, conditionInput, optionInput);
        throw error;
    }
}

function compareFunction(a: string, b: string) {
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

/** げんかるくスタイルの式データから結果（数値）を計算します */
export const calculateFormulaArray = function (
    formulaArr: any,
    statsObj: TStats,
    damageResult: TDamageResult,
    opt_max: number | string | Array<number | string> | null = null
): number {
    try {
        let result = 0;
        if (!Array.isArray(formulaArr)) {
            if (isNumber(formulaArr)) {
                result = Number(formulaArr);
            } else {
                if (formulaArr in statsObj) {
                    result = statsObj[formulaArr];
                } else {
                    console.error(statsObj, formulaArr, opt_max);
                }
            }
        } else {
            let operator: string | null = null;
            for (const entry of formulaArr) {
                let subResult = 0;
                if (['+', '-', '*', '/'].includes(entry)) {
                    operator = entry;
                    continue;
                } else if (isNumber(entry)) {
                    subResult = Number(entry);
                } else if (Array.isArray(entry)) {
                    subResult = calculateFormulaArray(entry, statsObj, damageResult);
                } else {
                    if (entry in statsObj) {
                        subResult = Number(statsObj[entry]);
                    } else if (entry.indexOf('#') != -1) {
                        const nameArr = entry.split('#');
                        if (damageResult && nameArr[0] in damageResult) {
                            const damageArrArr = damageResult[nameArr[0]] as TDamageResultEntry[];
                            let damage = null;
                            for (const damageArr of damageArrArr) {
                                if (nameArr[1] == damageArr[0]) {
                                    damage = damageArr[4];  // 非会心
                                    break;
                                }
                            }
                            if (damage != null) {
                                subResult = damage;
                            } else {
                                console.error(statsObj, formulaArr, opt_max, entry);
                            }
                        }
                    } else {
                        console.error(statsObj, formulaArr, opt_max);
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
            }
        }
        if (opt_max != null) {
            const maxValue = calculateFormulaArray(opt_max, statsObj, damageResult);
            if (result > maxValue) {
                result = maxValue;
            }
        }
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/** 文字列からげんかるくスタイルの計算式を生成します（サブ） */
export function analyzeFormulaStrSub(formulaStr: string, opt_defaultItem?: string): any[] {
    const resultArr: any[] = [];
    if (isNumber(formulaStr)) {
        resultArr.push(Number(formulaStr));
    } else {
        const strArr = formulaStr.split('%');
        if (strArr.length == 1) {
            resultArr.push(strArr[0]);
        } else {
            resultArr.push(Number(strArr[0]) / 100);
            resultArr.push('*');
            if (strArr[1].length > 0) {
                resultArr.push(strArr[1]);
            } else if (opt_defaultItem != null) {
                resultArr.push(opt_defaultItem);
            }
        }
    }
    return resultArr;
}

/** 文字列からげんかるくスタイルの計算式を生成します */
export const analyzeFormulaStr = function (formulaStr: string, opt_defaultItem?: string) {
    const resultArr: any[] = [];
    const re = new RegExp('([\\+\\-\\*/]?)([^\\+\\-\\*/]+)(.*)');
    let workStr = formulaStr;
    while (workStr) {
        const reRet = re.exec(workStr);
        if (!reRet) {
            resultArr.push(workStr);
            break;
        }
        if (reRet[1]) { // + - * /
            resultArr.push(reRet[1]);
        }
        resultArr.push(analyzeFormulaStrSub(reRet[2], opt_defaultItem));
        if (!reRet[3]) {
            break;
        }
        workStr = reRet[3];
    }
    return resultArr;
}

/** ダメージ計算を実施します */
export function calculateResult(damageResult: TDamageResult, characterInput: TCharacterInput, conditionInput: TConditionInput, statsInput: TStatsInput) {
    try {
        if (!characterInput) return;
        if (!conditionInput) return;
        if (!statsInput) return;
        const characterMaster = characterInput.characterMaster;
        const constellation = characterInput['命ノ星座'];
        const vision = characterMaster['元素'];

        // 元素反応を計算します
        const reactionResult = deepcopy(元素反応TEMPLATE);
        const reactionMaster = (ELEMENTAL_REACTION_MASTER as any)[vision];
        reactionResult['元素'] = vision;
        Object.keys(reactionMaster).forEach(reaction => {
            const reactionObj = reactionMaster[reaction];
            let resultValue = 0;
            if (reaction == '結晶') {
                resultValue = calculate結晶シールド吸収量(vision, statsInput.statsObj);
            } else {
                switch (reactionObj['種類']) {
                    case '乗算':
                        resultValue = calculate乗算系元素反応倍率(reaction, vision, statsInput.statsObj);
                        break;
                    case '固定':
                        resultValue = calculate固定値系元素反応ダメージ(reaction, vision, statsInput.statsObj);
                        break;
                }
            }
            Object.keys(reactionResult).forEach(key => {
                if (key.startsWith(reaction)) {
                    reactionResult[key] = resultValue;
                }
            });
        });
        overwriteObject(damageResult['元素反応'], reactionResult);
        console.debug('元素反応', damageResult);

        // 戦闘天賦およびその他のダメージを計算します
        const validConditionValueArr = makeValidConditionValueArr(conditionInput);

        const damageDetailMyCharacter = characterInput.damageDetailMyCharacter;
        const damageDetailMyWeapon = characterInput.damageDetailMyWeapon;
        const damageDetailMyArtifactSets = characterInput.damageDetailMyArtifactSets;

        if (damageDetailMyCharacter) {
            for (const category of ['通常攻撃', '重撃', '落下攻撃']) {
                damageResult[category] = [];
                if (!(category in damageDetailMyCharacter)) continue;
                const element = conditionInput.攻撃元素[['通常攻撃', '重撃', '落下攻撃'].indexOf(category)];
                let talentDetailArr = (damageDetailMyCharacter as any)[category];
                if (('特殊' + category) in damageDetailMyCharacter) {
                    const workObj = (damageDetailMyCharacter as any)['特殊' + category];
                    if (checkConditionMatches(workObj['条件'], validConditionValueArr, constellation)) {
                        talentDetailArr = workObj['詳細'];
                    }
                }
                for (const talentDetail of talentDetailArr) {
                    if (talentDetail['条件'] && !checkConditionMatches(talentDetail['条件'], validConditionValueArr, constellation)) {
                        continue;
                    }
                    const resultArr = calculateDamageFromDetail(talentDetail, characterInput, conditionInput, statsInput.statsObj, damageResult, element);
                    (damageResult[category] as any).push(resultArr);
                }
                if (category == '通常攻撃') {
                    let n = 0;
                    const sum = ['合計ダメージ', null, 0, 0, 0, null] as TDamageResultEntry;
                    for (const entry of damageResult[category]) {
                        if (entry[0].endsWith('段ダメージ')) {
                            sum[1] = entry[1];
                            sum[2] += entry[2];
                            if (entry[3] == null) sum[3] = null;
                            else if (sum[3] != null) sum[3] += entry[3];
                            sum[4] += entry[4];
                            n++;
                        }
                    }
                    if (n > 0) {
                        damageResult[category].splice(n, 1, sum);
                    }
                }
            }
            for (const category of ['元素スキル', '元素爆発', 'その他']) {
                damageResult[category] = [];
                if (!(category in damageDetailMyCharacter)) continue;
                const talentDetailArr = (damageDetailMyCharacter as any)[category];
                for (const talentDetail of talentDetailArr) {
                    if (talentDetail['条件'] && !checkConditionMatches(talentDetail['条件'], validConditionValueArr, constellation)) {
                        continue;
                    }
                    const resultArr = calculateDamageFromDetail(talentDetail, characterInput, conditionInput, statsInput.statsObj, damageResult);
                    (damageResult[category] as TDamageResultEntry[]).push(resultArr);
                }
            }
        }

        // 武器と聖遺物セット効果
        for (const myDamageDetail of [damageDetailMyWeapon, damageDetailMyArtifactSets]) {
            const category = 'その他';
            if (!myDamageDetail || !(category in myDamageDetail)) continue;
            const talentDetailArr = (damageDetailMyWeapon as any)[category];
            for (const talentDetail of talentDetailArr) {
                if (talentDetail['条件'] && !checkConditionMatches(talentDetail['条件'], validConditionValueArr, constellation)) {
                    continue;
                }
                const resultArr = calculateDamageFromDetail(talentDetail, characterInput, conditionInput, statsInput.statsObj, damageResult);
                (damageResult[category] as TDamageResultEntry[]).push(resultArr);
            }
        }

        // 被ダメージを計算します
        // TODO

        console.debug(damageResult);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export function makeValidConditionValueArr(conditionInput: any) {
    try {
        const result = [] as string[];
        if (!conditionInput) return result;
        const checkboxList = conditionInput.checkboxList;
        if (checkboxList) {
            checkboxList.forEach((entry: any) => {
                if (conditionInput.conditionValues[entry.name]) {
                    result.push(entry.name);
                }
            });
        }
        const selectList = conditionInput.selectList;
        if (selectList) {
            selectList.forEach((entry: any) => {
                const value = conditionInput.conditionValues[entry.name];
                if (value !== undefined && value !== null) {
                    if (value > 0 || (value == 0 && entry.required)) {
                        result.push(entry.name + '@' + entry.options[value]);
                    }
                }
            });
        }
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const checkConditionMatches = function (conditionStr: string, validConditionValueArr: string[], constellation: number): number {
    const myCondStr = conditionStr.split('^')[0];

    if (myCondStr.indexOf('|') != -1) {  // |はOR条件です
        const myCondStrArr = myCondStr.split('|');
        for (let i = 0; i < myCondStrArr.length; i++) {
            const resultSub = checkConditionMatchesSub(myCondStrArr[i], validConditionValueArr, constellation);
            if (resultSub == 1) {
                return 1;   // マッチ
            }
        }
        return 0;
    }

    const myCondStrArr = myCondStr.split('&');    // &はAND条件です
    let result = 1;
    for (let i = 0; i < myCondStrArr.length; i++) {
        const resultSub = checkConditionMatchesSub(myCondStrArr[i], validConditionValueArr, constellation);
        if (resultSub == 0) {
            return 0;   // アンマッチ
        }
        if (resultSub != 1) {
            result = resultSub;
        }
    }
    return result;
}

function checkConditionMatchesSub(conditionStr: string, validConditionValueArr: string[], constellation: number): number {
    const myCondArr = conditionStr.split('@');
    if (myCondArr[0] == '命ノ星座') {
        if (myCondArr.length == 2) {
            const re = new RegExp('[^0-9]*([0-9\\.]+).*');
            const reRet = re.exec(myCondArr[1]);
            if (reRet) {
                if (Number(reRet[1]) <= constellation) {
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
            const workArr = validConditionValueArr[i].split('@');
            const reRet = re.exec(workArr[1]);
            if (reRet) {
                return Number(reRet[1]);    // マッチ x倍
            }
            console.error(conditionStr, validConditionValueArr[i]);
        }
    }
    return 0;   // アンマッチ
}

export function calculate乗算系元素反応倍率(reaction: any, element: string, statsObj: any) {
    try {
        if (!element || element == '物理') return 0;
        const elementalMastery = statsObj['元素熟知'];
        const dmgBuff = statsObj[reaction];
        let result = (ELEMENTAL_REACTION_MASTER as any)[element][reaction]['数値'];
        result *= 1 + 25 * elementalMastery / (9 * (elementalMastery + 1400)) + dmgBuff / 100;
        return result;
    } catch (error) {
        console.error(reaction, element, statsObj);
        throw error;
    }
}

/**
 * 過負荷 感電 超電導 拡散ダメージを計算します
 */
export function calculate固定値系元素反応ダメージ(reaction: any, element: string, statsObj: TStats) {
    try {
        if (!element || element == '物理') return 0;
        const level = statsObj['レベル'];
        const elementalMastery = statsObj['元素熟知'];
        const dmgBuff = statsObj[reaction];
        const dmgElement = (ELEMENTAL_REACTION_MASTER as any)[element][reaction]['元素'];
        if (reaction == '拡散') {
            //TODO
        }
        let result = getValueByLevel(level, (ELEMENTAL_REACTION_MASTER as any)[element][reaction]['数値']);
        result *= 1 + 16 * elementalMastery / (elementalMastery + 2000) + dmgBuff / 100;
        result *= calculateEnemyRes(dmgElement, statsObj);
        return result;
    } catch (error) {
        console.error(reaction, element, statsObj);
        throw error;
    }
}

export function calculate結晶シールド吸収量(element: string, statsObj: TStats) {
    try {
        if (!element || element == '物理') return 0;
        const level = statsObj['レベル'];
        const elementalMastery = statsObj['元素熟知'];
        let result = getValueByLevel(level, (ELEMENTAL_REACTION_MASTER as any)[element]['結晶']['数値']);
        result *= 1 + 40 * elementalMastery / (9 * (elementalMastery + 1400));
        return result;
    } catch (error) {
        console.error(element, statsObj);
        throw error;
    }
}

export function calculateEnemyDef(statsObj: TStats, opt_ignoreDef = 0) { // 防御力,防御無視
    try {
        const level = statsObj['レベル'] ?? 0;
        const enemyLevel = statsObj['敵レベル'] ?? 0;
        const calcIgnoreDef = opt_ignoreDef / 100;
        const calcDef = (statsObj['敵防御力'] ?? 0) / 100;
        const result = (level + 100) / ((1 - calcIgnoreDef) * (1 + calcDef) * (enemyLevel + 100) + level + 100);
        return result;
    } catch (error) {
        console.error(statsObj, opt_ignoreDef);
        throw error;
    }
}

export function calculateEnemyRes(element: string, statsObj: TStats) {
    try {
        const statName = '敵' + element + (element != '物理' ? '元素' : '') + '耐性';
        let result = statsObj[statName] ?? 0;
        if (result < 0) {
            result = 100 - result / 2;
        } else if (result < 75) {
            result = 100 - result;
        } else {
            result = 10000 / (4 * result + 100)
        }
        result /= 100;
        return result;
    } catch (error) {
        console.error(element, statsObj);
        throw error;
    }
}

function calculateDamageFromDetail(
    detailObj: any,
    characterInput: TCharacterInput,
    conditionInput: TConditionInput,
    statsObj: TStats,
    damageResult: TDamageResult,
    opt_element: string | null = null): TDamageResultEntry {
    try {
        console.debug(calculateDamageFromDetail.name, detailObj, characterInput, conditionInput, statsObj, opt_element);

        const myバフArr = [] as Array<string>;
        let is会心Calc = true;
        let is防御補正Calc = true;
        let is耐性補正Calc = true;
        let my元素 = detailObj['元素'] != null ? detailObj['元素'] : opt_element != null ? opt_element : null;
        let my防御無視 = 0; // for 雷電将軍
        let my別枠乗算 = 0; // for 宵宮
        const myHIT数 = detailObj['HIT数'] != null ? Number(detailObj['HIT数']) : 1;
        const myステータス補正 = {} as { [key: string]: number };
        // let my精度 = 0;

        const constellation = statsObj['命ノ星座'];

        const statusChangeDetailObjArr = getChangeDetailObjArr(characterInput, CHANGE_KIND_STATUS);
        const talentChangeDetailObjArr = getChangeDetailObjArr(characterInput, CHANGE_KIND_TALENT);

        let validConditionValueArr = makeValidConditionValueArr(conditionInput);  // 有効な条件

        if (detailObj['除外条件']) {
            for (const delCondition of detailObj['除外条件']) {
                if (isPlainObject(delCondition)) {
                    const number = checkConditionMatches(delCondition['名前'], validConditionValueArr, constellation);
                    if (number > 0) {
                        ステータス条件取消(myステータス補正, delCondition['名前'], statsObj, validConditionValueArr, statusChangeDetailObjArr);
                        validConditionValueArr = validConditionValueArr.filter(s => s != delCondition && !s.startsWith(delCondition + '@'));
                    }
                    if ('説明' in delCondition) {
                        if (Array.isArray(delCondition['説明'])) {
                            delCondition['説明'].forEach(description => {
                                if (!damageResult['キャラクター注釈'].includes(description)) {
                                    damageResult['キャラクター注釈'].push(description);
                                }
                            });
                        } else {
                            if (!damageResult['キャラクター注釈'].includes(delCondition['説明'])) {
                                damageResult['キャラクター注釈'].push(delCondition['説明']);
                            }
                        }
                    }
                } else if (validConditionValueArr.includes(delCondition)) {
                    ステータス条件取消(myステータス補正, delCondition, statsObj, validConditionValueArr, statusChangeDetailObjArr);
                    validConditionValueArr = validConditionValueArr.filter(s => s != delCondition && !s.startsWith(delCondition + '@'));
                }
            }
        }

        if (detailObj['適用条件']) {
            for (const addCondition of detailObj['適用条件']) {
                if (isPlainObject(addCondition)) {
                    if (!(addCondition['名前'] in conditionInput.conditionValues)) continue;
                    if (addCondition['種類'] && addCondition['種類'] == 'selectedIndex') { // for 甘雨+アモスの弓
                        const conditionObjArr = conditionInput.selectList.filter(s => s.name == addCondition['名前']);
                        if (conditionObjArr.length == 0) continue;
                        const optionList = conditionInput.selectList.filter(s => s.name == addCondition['名前']).map(s => s.options)[0];
                        const curSelectedIndex = conditionInput.conditionValues[addCondition['名前']] as number;
                        const curSelectedValue = optionList[curSelectedIndex];
                        let newSelectedIndex;
                        let newSelectedValue;
                        const re = new RegExp('([\\+\\-]?)(\\d+)');
                        const reRet = re.exec(String(addCondition['数値']));
                        if (reRet) {
                            if (reRet[1]) {
                                if (reRet[1] == '+') {  // 加算
                                    newSelectedIndex = Math.min(curSelectedIndex + Number(reRet[2]), optionList.length - 1);
                                } else {    // 減算
                                    newSelectedIndex = Math.max(curSelectedIndex - Number(reRet[2]), 0);
                                }
                            } else {    // 直値
                                newSelectedIndex = Number(reRet[2]);
                            }
                            newSelectedValue = optionList[newSelectedIndex];
                            if (curSelectedIndex > 0) {
                                const curCondition = addCondition['名前'] + '@' + curSelectedValue;
                                if (validConditionValueArr.includes(curCondition)) {
                                    validConditionValueArr = validConditionValueArr.filter(p => p != curCondition);
                                }
                                statusChangeDetailObjArr.forEach(valueObj => {
                                    if (!valueObj['条件']) return;
                                    if (valueObj['対象']) return;   // 暫定
                                    const number = checkConditionMatches(valueObj['条件'], [curCondition], constellation);
                                    if (number == 0) return;
                                    let myNew数値 = valueObj['数値'];
                                    if (number != 1) {
                                        myNew数値 = myNew数値.concat(['*', number]);
                                    }
                                    const workObj = JSON.parse(JSON.stringify(statsObj));    // 力技
                                    updateStats(workObj, valueObj['種類'], myNew数値, valueObj['上限']);
                                    Object.keys(workObj).forEach(statName => {
                                        if (!isNumber(workObj[statName]) || workObj[statName] == statsObj[statName]) return;
                                        if (!(statName in myステータス補正)) {
                                            myステータス補正[statName] = 0;
                                        }
                                        myステータス補正[statName] -= workObj[statName] - statsObj[statName];
                                    });
                                });
                            }
                            const newCondition = addCondition['名前'] + '@' + newSelectedValue;
                            validConditionValueArr.push(newCondition);
                            statusChangeDetailObjArr.forEach(valueObj => {
                                if (!valueObj['条件']) return;
                                if (valueObj['対象']) return;   // 暫定
                                const number = checkConditionMatches(valueObj['条件'], [newCondition], constellation);
                                if (number == 0) return;
                                let myNew数値 = valueObj['数値'];
                                if (number != 1) {
                                    myNew数値 = myNew数値.concat(['*', number]);
                                }
                                const workObj = JSON.parse(JSON.stringify(statsObj));    // 力技
                                updateStats(workObj, valueObj['種類'], myNew数値, valueObj['上限']);
                                Object.keys(workObj).forEach(statName => {
                                    if (!isNumber(workObj[statName]) || workObj[statName] == statsObj[statName]) return;
                                    if (!(statName in myステータス補正)) {
                                        myステータス補正[statName] = 0;
                                    }
                                    myステータス補正[statName] += workObj[statName] - statsObj[statName];
                                });
                            });
                        } else {
                            console.error(detailObj, opt_element, null, addCondition);
                        }
                    } else {
                        if (!validConditionValueArr.includes(addCondition)) {
                            ステータス条件追加(myステータス補正, addCondition, statsObj, statusChangeDetailObjArr);
                            validConditionValueArr.push(addCondition);
                        }
                    }
                    if ('説明' in addCondition) {
                        if (Array.isArray(addCondition['説明'])) {
                            addCondition['説明'].forEach(description => {
                                if (!damageResult['キャラクター注釈'].includes(description)) {
                                    damageResult['キャラクター注釈'].push(description);
                                }
                            });
                        } else {
                            if (!damageResult['キャラクター注釈'].includes(addCondition['説明'])) {
                                damageResult['キャラクター注釈'].push(addCondition['説明']);
                            }
                        }
                    }
                } else if (!validConditionValueArr.includes(addCondition)) {
                    ステータス条件追加(myステータス補正, addCondition, statsObj, statusChangeDetailObjArr);
                    validConditionValueArr.push(addCondition);
                }
            }
        }

        const myTalentChangeDetailObjArr = [] as any[];
        const myStatusChangeDetailObjArr = [] as any[];

        if (talentChangeDetailObjArr && statusChangeDetailObjArr) {
            // 対象指定ありのダメージ計算（主に加算）を適用したい
            talentChangeDetailObjArr.forEach(valueObj => {
                let number = null;
                if (valueObj['条件']) {
                    number = checkConditionMatches(valueObj['条件'], validConditionValueArr, constellation);
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
                        const my対象カテゴリArr = valueObj['対象'].split('.');
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
                    const myValue = calculateFormulaArray(valueObj['数値'], statsObj, damageResult, valueObj['上限']);
                    my防御無視 += myValue;
                } else if (valueObj['種類'] == '固有変数') {
                    // nop
                } else {
                    if (number != null && number != 1) {    // オプションの@以降の数値でスケールする場合あり
                        const myNewValueObj = JSON.parse(JSON.stringify(valueObj)); // deepcopy
                        myNewValueObj['数値'] = myNewValueObj['数値'].concat(['*', number]);
                        myTalentChangeDetailObjArr.push(myNewValueObj);
                    } else {
                        myTalentChangeDetailObjArr.push(valueObj);
                    }
                }
            });

            // 対象指定ありのステータスアップを適用したい
            statusChangeDetailObjArr.forEach(valueObj => {
                if (!valueObj['対象']) {
                    return; // 対象指定なしのものは適用済みのためスキップします
                }
                if (valueObj['対象'].endsWith('元素ダメージ')) {   // for 九条裟羅
                    if (!valueObj['対象'].startsWith(my元素)) {
                        return;
                    }
                } else {
                    const my対象カテゴリArr = valueObj['対象'].split('.');
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
                    number = checkConditionMatches(valueObj['条件'], validConditionValueArr, constellation);
                    if (number == 0) {
                        return;
                    }
                    if (number != null && number != 1) {    // オプションの@以降の数値でスケールする場合あり
                        const myNew数値 = valueObj['数値'].concat(['*', number]);
                        myNewValue = JSON.parse(JSON.stringify(valueObj)); // deepcopy
                        myNewValue['数値'] = myNew数値;
                    }
                }
                myStatusChangeDetailObjArr.push(myNewValue);
            });
        }

        console.debug(detailObj['名前'] + ':myTalentChangeDetailObjArr');
        console.debug(myTalentChangeDetailObjArr);
        console.debug(detailObj['名前'] + ':myStatusChangeDetailObjArr');
        console.debug(myStatusChangeDetailObjArr);

        myStatusChangeDetailObjArr.forEach(valueObj => {
            if (!valueObj['数値']) return;
            const myValue = calculateFormulaArray(valueObj['数値'], statsObj, damageResult, valueObj['上限']);
            if (valueObj['種類'] in statsObj) {
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
        const damageDetailMyArtifactSets = characterInput.damageDetailMyArtifactSets;
        if (damageDetailMyArtifactSets) {
            if (detailObj['種類'] == '通常攻撃ダメージ') {
                let myCondition: string | null = null;
                if (validConditionValueArr.includes('[来歆の余響4]幽谷祭祀')) {
                    myCondition = '[来歆の余響4]幽谷祭祀';
                } else if (validConditionValueArr.includes('[来歆の余響4]期待値')) {
                    myCondition = '[来歆の余響4]期待値';
                }
                if (myCondition && detailObj['HIT数'] > 1) {
                    for (const valueObj of damageDetailMyArtifactSets[CHANGE_KIND_STATUS]) {
                        if (!valueObj['種類']) continue;
                        if (!valueObj['条件']) continue;
                        if (!valueObj['数値']) continue;
                        if (checkConditionMatches(valueObj['条件'], [myCondition], constellation) > 0) {
                            const myValue = calculateFormulaArray(valueObj['数値'], statsObj, damageResult, valueObj['上限']);
                            if (!(valueObj['種類'] in myステータス補正)) {
                                myステータス補正[valueObj['種類']] = 0;
                            }
                            myステータス補正[valueObj['種類']] -= myValue * (detailObj['HIT数'] - Math.max(1, Math.floor(detailObj['HIT数'] / 2))) / detailObj['HIT数'];
                        }
                    }
                    const description = '1段でダメージが複数回発生する通常攻撃については、来歆の余響4セット効果の幽谷祭祀のダメージアップは1回分のみ計上する';
                    if (!damageResult['キャラクター注釈'].includes(description)) {
                        damageResult['キャラクター注釈'].push(description);
                    }
                }
            }
        }

        // 一時的にステータスを書き換えます。
        Object.keys(myステータス補正).forEach(statusName => {
            statsObj[statusName] += myステータス補正[statusName];
            console.debug('ステータス補正', statusName, myステータス補正[statusName]);
        });

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
                break;
            default:
                if (detailObj['種類'].startsWith('表示') || detailObj['種類'].startsWith('非表示')) {
                    is会心Calc = false;
                    is防御補正Calc = false;
                    is耐性補正Calc = false;
                    my元素 = null;
                    // const 種類SplitArr = detailObj['種類'].split('_');
                    // if (種類SplitArr.length > 1) {
                    //     my精度 = Number(種類SplitArr[1]);
                    // }
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
        const my計算Result = calculateDamageFromDetailSub(statsObj, damageResult, detailObj['数値'], myバフArr, is会心Calc, is防御補正Calc, is耐性補正Calc, my元素, my防御無視, my別枠乗算);
        console.debug(my計算Result);

        myTalentChangeDetailObjArr.forEach(valueObj => {
            const myResultWork = calculateDamageFromDetailSub(statsObj, damageResult, valueObj['数値'], myバフArr, is会心Calc, is防御補正Calc, is耐性補正Calc, my元素, my防御無視, my別枠乗算);
            if (valueObj['種類'].endsWith('ダメージアップ')) {
                if (detailObj['名前'] == 'ダメージアップ') {    // for 申鶴
                    return;
                }
                if (DAMAGE_CATEGORY_ARRAY.includes(detailObj['種類'])) {
                    // 複数回HITするダメージについては、HIT数を乗算します
                    if (myHIT数 > 1) {
                        myResultWork[2] *= myHIT数;
                        if (myResultWork[3] != null) {
                            myResultWork[3] *= myHIT数;
                        }
                        if (myResultWork[4] != null) {
                            myResultWork[4] *= myHIT数;
                        }
                    }
                }
            }
            my計算Result[2] += myResultWork[2];
            if (my計算Result[3] != null && myResultWork[3]) {
                my計算Result[3] += myResultWork[3];
            }
            if (my計算Result[4] != null) {
                my計算Result[4] += myResultWork[4];
            }
        });

        if (statsObj[detailObj['種類'] + 'アップ'] > 0) {
            if (detailObj['名前'].startsWith('非表示_狼の魂基礎')) {    // レザー
                // nop
            } else if (DAMAGE_CATEGORY_ARRAY.includes(detailObj['種類'])) {
                const myResultWork = calculateDamageFromDetailSub(statsObj, damageResult, statsObj[detailObj['種類'] + 'アップ'], myバフArr, is会心Calc, is防御補正Calc, is耐性補正Calc, my元素, my防御無視, 0);
                // 複数回HITするダメージについては、HIT数を乗算します
                if (myHIT数 > 1) {
                    myResultWork[2] *= myHIT数;
                    if (myResultWork[3] != null) {
                        myResultWork[3] *= myHIT数;
                    }
                    if (myResultWork[4] != null) {
                        myResultWork[4] *= myHIT数;
                    }
                }
                my計算Result[2] += myResultWork[2];
                if (my計算Result[3] != null && myResultWork[3]) {
                    my計算Result[3] += myResultWork[3];
                }
                if (my計算Result[4] != null) {
                    my計算Result[4] += myResultWork[4];
                }
            }
        }
        if (my元素 + '元素ダメージアップ' in statsObj && statsObj[my元素 + '元素ダメージアップ'] > 0) {
            if (is防御補正Calc && is耐性補正Calc) {
                const myResultWork = calculateDamageFromDetailSub(statsObj, damageResult, statsObj[my元素 + '元素ダメージアップ'], myバフArr, is会心Calc, is防御補正Calc, is耐性補正Calc, my元素, my防御無視, 0);
                // 複数回HITするダメージについては、HIT数を乗算します
                if (myHIT数 > 1) {
                    myResultWork[2] *= myHIT数;
                    if (myResultWork[3] != null) {
                        myResultWork[3] *= myHIT数;
                    }
                    if (myResultWork[4] != null) {
                        myResultWork[4] *= myHIT数;
                    }
                }
                my計算Result[2] += myResultWork[2];
                if (my計算Result[3] != null && myResultWork[3]) {
                    my計算Result[3] += myResultWork[3];
                }
                if (my計算Result[4] != null) {
                    my計算Result[4] += myResultWork[4];
                }
            }
        }

        // 書き換えたステータスを元に戻します。
        Object.keys(myステータス補正).forEach(statusName => {
            statsObj[statusName] -= myステータス補正[statusName];
        });

        if (detailObj['種類'] == 'シールド') {
            if (my計算Result[1] == '岩') {  // 岩元素シールド for ノエル 鍾離
                my計算Result[2] = my計算Result[2] * 1.5;
                my計算Result[4] = my計算Result[4] * 1.5;
            }
        }

        const resultArr = [detailObj['名前'], my計算Result[1], my計算Result[2], my計算Result[3], my計算Result[4], detailObj['種類']] as TDamageResultEntry;
        return resultArr;
    } catch (error) {
        console.error(detailObj, characterInput, conditionInput, statsObj, opt_element);
        throw error;
    }
}

export function calculateDamageFromDetailSub(
    statsObj: TStats,
    damageResult: TDamageResult,
    formula: number | string | (number | string)[],
    buffArr: Array<string> | null,
    is会心Calc: boolean,
    is防御補正Calc: boolean,
    is耐性補正Calc: boolean,
    元素: string,
    防御無視: number,
    別枠乗算: number
): TDamageResultEntry {
    let my非会心Result = calculateFormulaArray(formula, statsObj, damageResult);
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
            myバフ += statsObj[buff];
        });
    }
    if (myバフ != 0) {
        my非会心Result *= (100 + myバフ) / 100;
    }
    if (is防御補正Calc) {
        my非会心Result *= calculateEnemyDef(statsObj, 防御無視);
    }
    if (is耐性補正Calc && 元素) {
        my非会心Result *= calculateEnemyRes(元素, statsObj);
    }
    if (別枠乗算) {    // 別枠乗算 for 宵宮
        my非会心Result *= 別枠乗算 / 100;
    }
    my期待値Result = my非会心Result;
    const my会心率 = Math.min(100, Math.max(0, statsObj['会心率']));    // 0≦会心率≦100
    let my会心ダメージ = statsObj['会心ダメージ'];
    if ((元素 + '元素ダメージ会心ダメージ') in statsObj) {
        my会心ダメージ += statsObj[元素 + '元素ダメージ会心ダメージ'];
    }
    if (is会心Calc) {
        if (my会心率 > 0) {
            my会心Result = my非会心Result * (100 + my会心ダメージ) / 100;
            my期待値Result = (my会心Result * my会心率 / 100) + (my非会心Result * (100 - my会心率) / 100);
        }
    }
    console.debug(buffArr, '=>', myバフ, is会心Calc, '=> [', my会心率, my会心ダメージ, ']', is防御補正Calc, is耐性補正Calc, 元素, 防御無視, 別枠乗算, '=>', my期待値Result, my会心Result, my非会心Result);
    return ['未設定', 元素, my期待値Result, my会心Result, my非会心Result, null];
}

function getChangeDetailObjArr(characterInput: TCharacterInput, changeKind: string) {
    let result = [] as any[];
    if (!characterInput) return result;

    if (characterInput.damageDetailMyCharacter && changeKind in characterInput.damageDetailMyCharacter) {
        result = result.concat((characterInput.damageDetailMyCharacter as any)[changeKind]);
    }
    if (characterInput.damageDetailMyWeapon && changeKind in characterInput.damageDetailMyWeapon) {
        result = result.concat((characterInput.damageDetailMyWeapon as any)[changeKind]);
    }
    if (characterInput.damageDetailMyArtifactSets && changeKind in characterInput.damageDetailMyArtifactSets) {
        result = result.concat((characterInput.damageDetailMyArtifactSets as any)[changeKind]);
    }
    return result;
}

function ステータス条件取消(
    newStatsObj: TStats,
    condition: string,
    statsObj: TStats,
    validConditionValueArr: string[],
    statusChangeDetailObjArr: any[]
) {
    const constellation = statsObj['命ノ星座'];

    statusChangeDetailObjArr.forEach(valueObj => {
        if (valueObj['対象'] || !valueObj['数値'] || !valueObj['条件']) return;

        let isTarget = false;
        const orSplitted = valueObj['条件'].split('|');
        for (const orValue of orSplitted) {
            const andSplitted = orValue.split('&');
            for (const andValue of andSplitted) {
                if (andValue == condition || andValue.startsWith(condition + '@')) {
                    isTarget = true;
                }
            }
        }
        if (!isTarget) return;

        let multiplier = 1;
        multiplier = checkConditionMatches(valueObj['条件'], validConditionValueArr, constellation);
        if (multiplier > 0) {
            const workObj = JSON.parse(JSON.stringify(statsObj));    // 力技
            let myNew数値 = valueObj['数値'];
            if (multiplier != 1) {
                myNew数値 = myNew数値.concat(['*', multiplier]);
            }
            updateStats(workObj, valueObj['種類'], myNew数値, valueObj['上限']);
            Object.keys(workObj).forEach(statName => {
                if (!isNumber(workObj[statName]) || workObj[statName] == statsObj[statName]) return;
                if (!(statName in newStatsObj)) {
                    newStatsObj[statName] = 0;
                }
                newStatsObj[statName] -= workObj[statName] - statsObj[statName];
            });
        }
    });
}

function ステータス条件追加(newStatsObj: TStats, condition: string, statsObj: TStats, statusChangeDetailObjArr: any[]) {
    statusChangeDetailObjArr.forEach(valueObj => {
        if (valueObj['対象'] || !valueObj['数値']) return;
        if (valueObj['条件'] == condition) {
            const workObj = JSON.parse(JSON.stringify(statsObj));    // 力技
            updateStats(workObj, valueObj['種類'], valueObj['数値'], valueObj['上限']);
            Object.keys(workObj).forEach(statName => {
                if (!isNumber(workObj[statName]) || workObj[statName] == statsObj[statName]) return;
                if (!(statName in newStatsObj)) {
                    newStatsObj[statName] = 0;
                }
                newStatsObj[statName] += workObj[statName] - statsObj[statName];
            });
        }
    });
}

/**
 * 計算式内の参照有無を求めます
 */
export function isUseReference(formulaArr: number | string | Array<number | string>): boolean {
    if (!Array.isArray(formulaArr)) {
        if (isNumber(formulaArr)) {
            return false;
        }
        return String(formulaArr).indexOf('#') != -1;
    }
    let result = false;
    formulaArr.forEach(entry => {
        if (['+', '-', '*', '/'].includes(String(entry))) {
            return;
        } else if (isNumber(entry)) {
            return;
        } else if (Array.isArray(entry)) {
            if (isUseReference(entry)) {
                result = true;
            }
        } else {
            if (String(entry).indexOf('#') != -1) {
                result = true;
            }
        }
    });
    return result;
}

/**
 * ステータスを更新します
 */
function updateStats(
    statsObj: TStats,
    statName: string,
    formulaArr: number | string | Array<number | string>,
    opt_max: number | string | Array<number | string> | null = null
) {
    const result = calculateFormulaArray(formulaArr, statsObj, DAMAGE_RESULT_TEMPLATE, opt_max);    // DAMAGE_RESULT_TEMPLATEは参照しない想定なのでダミーです
    if (!isNumber(result)) {
        console.error(statsObj, statName, formulaArr, result);
    }
    if (statName == 'HP') {
        statName = 'HP上限';
        // } else if (statName.indexOf('.') != -1) {
    } else {
        switch (statName) {
            case '自元素ダメージバフ':
                statName = statsObj['元素'] + '元素ダメージバフ';
                break;
            case '全元素ダメージバフ':
                ['炎', '水', '風', '雷', '草', '氷', '岩'].forEach(entry => {
                    const workStatName = entry + '元素ダメージバフ';
                    if (!(workStatName in statsObj)) {
                        statsObj[workStatName] = 0;
                    }
                    statsObj[workStatName] += result;
                });
                return;
            case '敵自元素耐性':
                statName = '敵' + statsObj['元素'] + '元素耐性';
                break;
            case '敵全元素耐性':
                ['炎', '水', '風', '雷', '草', '氷', '岩'].forEach(entry => {
                    const workStatName = '敵' + entry + '元素耐性';
                    if (!(workStatName in statsObj)) {
                        statsObj[workStatName] = 0;
                    }
                    statsObj[workStatName] += result;
                });
                return;
            case '全元素耐性':
                ['炎', '水', '風', '雷', '草', '氷', '岩'].forEach(entry => {
                    const workStatName = entry + '元素耐性';
                    if (!(workStatName in statsObj)) {
                        statsObj[workStatName] = 0;
                    }
                    statsObj[workStatName] += result;
                });
                return;
        }
    }
    if (!(statName in statsObj)) {
        statsObj[statName] = 0;
    }
    statsObj[statName] += result;
    console.debug(updateStats.name, null, statName, formulaArr, '=>', result, statsObj[statName]);
}
