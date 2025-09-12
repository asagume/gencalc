import _ from 'lodash';
import { isNumeric, overwriteObject } from '@/common';
import {
    CHANGE_KIND_STATUS,
    CHANGE_KIND_TALENT,
    DAMAGE_RESULT_TEMPLATE,
    getChangeKind,
    getConditionOpkind,
    getDefaultArtifactDetailInput,
    getDefaultCharacterInput,
    getDefaultConditionInput,
    getDefaultDamageResultInput,
    getDefaultStatsInput,
    getStatValue,
    loadRecommendation,
    makeConditionExclusionMapFromStr,
    makeDamageDetailObjArr,
    makeDamageDetailObjArrObjArtifactSets,
    makeDamageDetailObjArrObjCharacter,
    makeDamageDetailObjArrObjWeapon,
    makeTeamOptionDetailObjArr,
    NUMBER_CONDITION_VALUE_RE,
    setupConditionValues,
    TArtifactDetailInput,
    TArtifactStats,
    TArtifactStatsKey,
    TCharacterInput,
    TConditionInput,
    TConditionValues,
    TDamageDetailObj,
    TDamageResult,
    TDamageResultElementalReaction,
    TDamageResultEntry,
    TOptionInput,
    TStats,
    TStatsInput,
    updateNumberConditionValues,
    ステータスTEMPLATE,
    ステータスチーム内最高ARRAY,
    ダメージバフARRAY,
    元素ステータス_ダメージARRAY,
    元素ステータス_耐性ARRAY,
    元素反応TEMPLATE,
    元素反応バフARRAY,
    基礎ステータスARRAY,
    実数ダメージ加算ARRAY,
    突破レベルレベルARRAY,
    聖遺物サブ効果ARRAY,
} from '@/input';
import {
    ALL_ELEMENTS,
    ARTIFACT_MAIN_MASTER,
    ARTIFACT_SUB_MASTER,
    DAMAGE_CATEGORY_ARRAY,
    ELEMENTAL_REACTION_BASE_DAMAGE_MASTER,
    ELEMENTAL_REACTION_MASTER,
    ELEMENTAL_RESONANCE_MASTER,
    getCharacterMasterDetail,
    TArtifactMainRarity,
    TArtifactMainStat,
    TCharacterKey,
    TEAM_OPTION_MASTER_LIST,
} from '@/master';

export type TRotationDamageEntry = {
    name: string;
    category: string;
    reactions: object[];
    counts: number[];
};
export type TRotationDamageInfo = {
    totalDamage: number,
    rotationDamages: TRotationDamageEntry[],
};
export const REACTION_DMG_ARR = [
    '過負荷ダメージ',
    '感電ダメージ',
    '超電導ダメージ',
    '拡散ダメージ',
    '燃焼ダメージ',
    '開花ダメージ',
    '烈開花ダメージ',
    '超開花ダメージ',
];
export const REACTION_DMG_ELEMENT_MAP = new Map<string, string>();
function setupReactionDmgElementMap() {
    REACTION_DMG_ARR.forEach((reactionDmg) => {
        const reaction = reactionDmg.replace(/ダメージ$/, '');
        Object.keys(ELEMENTAL_REACTION_MASTER).forEach((element) => {
            const reactionMaster = (ELEMENTAL_REACTION_MASTER as any)[element];
            const workArr = Object.keys(reactionMaster);
            if (workArr.includes(reaction)) {
                if ('元素' in reactionMaster[reaction]) {
                    REACTION_DMG_ELEMENT_MAP.set(reactionDmg, reactionMaster[reaction].元素);
                }
            }
        });
    });
}
setupReactionDmgElementMap();

/** [突破レベル, レベル] => レベル\+?  */
export function getLevelStr(ascension: number, level: number): string {
    return level + (突破レベルレベルARRAY[ascension][0] == level ? '+' : '');
}

/** キャラクターのレベルに応じた（基礎/突破）ステータスを算出します */
export function getStatValueByLevel(statObj: any, ascension: number, level: number): number {
    if (!statObj) return 0;
    const myLevelStr = getLevelStr(ascension, level);
    console.log(myLevelStr);
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
        const stat: any[] = statWithRarity.split('_');
        artifactStatsMain[stat[1]] += ARTIFACT_MAIN_MASTER[stat[0] as TArtifactMainRarity][stat[1] as TArtifactMainStat];
    }
}

/** 聖遺物優先するサブ効果のステータスを算出します */
export function calculateArtifactSubStatByPriority(
    artifactStatsSub: TArtifactStats,
    mainstats: string[],
    prioritySubstats: string[],
    priotritySubstatIndices: number[],
    priotritySubstatValues: number[][],
    prioritySubstatCounts: number[],
) {
    (Object.keys(artifactStatsSub) as (keyof typeof artifactStatsSub)[]).forEach((key) => {
        artifactStatsSub[key] = 0;
    });
    let totalCount = 0;
    for (let i = 0; i < prioritySubstats.length; i++) {
        if (!prioritySubstats[i]) continue;
        if (priotritySubstatIndices[i] === undefined || priotritySubstatIndices[i] < 0) continue;
        if (!prioritySubstatCounts[i]) continue;
        artifactStatsSub[prioritySubstats[i] as TArtifactStatsKey] += priotritySubstatValues[i][priotritySubstatIndices[i]] * prioritySubstatCounts[i];
        totalCount += prioritySubstatCounts[i];
    }
    // 初期: 3 or 4
    // 強化: 5 (+4 +8 +12 +16 +20)
    // 初期+強化: min=40 max=45
    const noPrioritySubstatArr = 聖遺物サブ効果ARRAY.filter(s => !prioritySubstats.includes(s));
    let noPriorityCount = Math.min(45, 40 + Math.floor(Math.max(0, (totalCount - 12) / 5)));
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
        (artifactStats as any)[stat] = 0;
    }
    for (const stat of Object.keys(artifactStatsMain)) {
        if (stat in artifactStats) (artifactStats as any)[stat] += (artifactStatsMain as any)[stat];
        else (artifactStats as any)[stat] = (artifactStatsMain as any)[stat];
    }
    for (const stat of Object.keys(artifactStatsSub)) {
        if (stat in artifactStats) (artifactStats as any)[stat] += (artifactStatsSub as any)[stat];
        else (artifactStats as any)[stat] = (artifactStatsSub as any)[stat];
    }
}

function makeEvalableScript(
    formula: string,
    statsObj: TStats,
    damageResult: TDamageResult,
) {
    const replaceMap = new Map<string, string>();
    const re = /\$\{(.+?)\}/g;
    let reRet;
    while ((reRet = re.exec(formula)) !== null) {
        const key = reRet[1];
        if (!replaceMap.has(key)) {
            let value;
            if (key.includes('#')) {   // 元素爆発#スキルダメージ 等
                const arr = key.split('#');
                if (arr.length === 2) {
                    const major = arr[0];
                    const minor = arr[1];
                    if (major in damageResult) {
                        const entryArr = (damageResult[major] as TDamageResultEntry[]).filter(s => s[0] == minor);
                        if (entryArr.length) {
                            value = String(entryArr[0][4]);  // 非会心
                        }
                    }
                }
                if (value === undefined) {
                    console.warn(formula, damageResult, key);
                    value = '0';
                }
            } else {    // ステータス
                value = String(getStatValue(key, statsObj));
            }
            if (value !== undefined) {
                replaceMap.set(key, value);
            }
        }
    }
    let result = formula;
    replaceMap.forEach((value, key) => {
        result = result.replaceAll('${' + key + '}', value);
    })
    return result;
}

export function evalFormula(
    formula: number | string | null | undefined,
    statsObj: TStats,
    damageResult: TDamageResult,
    opt_max: number | string | null = null,
    opt_min: number | string | null = null
) {
    let result = 0;
    let script;
    if (!formula) {
        // nop
    } else if (_.isNumber(formula)) {
        result = formula;
    } else {
        script = makeEvalableScript(formula, statsObj, damageResult);
        try {
            result = eval(script);
        } catch (error) {
            console.error(error);
            console.error(formula, statsObj, damageResult, script);
        }
    }
    if (opt_max !== null) {
        const max = evalFormula(opt_max, statsObj, damageResult);
        result = Math.min(result, max);
    }
    if (opt_min !== null) {
        const min = evalFormula(opt_min, statsObj, damageResult);
        result = Math.max(result, min);
    }
    console.debug(formula, opt_max, opt_min, script, result);
    return result;
}

/** キャラクターのステータスを計算します */
export const calculateStats = function (
    statsInput: TStatsInput,
    characterInput: TCharacterInput,
    artifactDetailInput: TArtifactDetailInput,
    conditionInput: TConditionInput,
    optionInput: TOptionInput
) {
    if (!characterInput || !artifactDetailInput || !conditionInput || !optionInput) return;
    try {
        const characterMaster = characterInput.characterMaster;
        const ascension = characterInput.突破レベル;
        const level = characterInput.レベル;
        const constellation = characterInput.命ノ星座;
        const weaponMaster = characterInput.weaponMaster;
        const weaponAscension = characterInput.武器突破レベル;
        const weaponLevel = characterInput.武器レベル;

        const workStatsObj = _.cloneDeep(ステータスTEMPLATE);

        workStatsObj['突破レベル'] = ascension;
        workStatsObj['レベル'] = level;
        workStatsObj['命ノ星座'] = constellation;
        (workStatsObj as any)['元素'] = characterMaster.元素;

        // キャラクターマスターから元素エネルギーを設定します
        if ('元素エネルギー' in characterMaster['元素爆発']) {
            workStatsObj['元素エネルギー'] = Number(characterMaster['元素爆発']['元素エネルギー']);
        }
        if ('固有変数' in weaponMaster) {   // for 赤月のシルエット
            for (const name of Object.keys(weaponMaster['固有変数'])) {
                if (name in conditionInput.conditionValues) {
                    workStatsObj[name] = Number(conditionInput.conditionValues[name]);
                } else {
                    workStatsObj[name] = weaponMaster['固有変数'][name];
                }
            }
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
        Object.keys(statsInput.statAdjustments).filter(s => !ステータスチーム内最高ARRAY.includes(s)).forEach(stat => {
            if (stat in workStatsObj) workStatsObj[stat] += statsInput.statAdjustments[stat];
        });
        Object.keys(statsInput.statAdjustmentsEx).filter(s => !ステータスチーム内最高ARRAY.includes(s)).forEach(stat => {
            if (stat in workStatsObj) workStatsObj[stat] += statsInput.statAdjustmentsEx[stat];
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
        if (weaponMaster['ステータス']) {
            for (const stat of Object.keys(weaponMaster['ステータス'])) {
                workStatsObj[stat] += getStatValueByLevel(weaponMaster['ステータス'][stat], weaponAscension, weaponLevel);
            }
        }

        // 聖遺物のステータスを計上します
        const artifactStats = artifactDetailInput.聖遺物ステータス;
        for (const stat of Object.keys(artifactStats)) {
            const toStat = ['HP', '攻撃力', '防御力'].includes(stat) ? stat + '+' : stat;
            workStatsObj[toStat] += (artifactStats as any)[stat];
        }

        let 通常攻撃_元素Var = characterMaster.武器 == '法器' ? characterMaster.元素 : '物理';
        let 重撃_元素Var = characterMaster.武器 == '法器' ? characterMaster.元素 : '物理';
        let 落下攻撃_元素Var = characterMaster.武器 == '法器' ? characterMaster.元素 : '物理';

        if (optionInput) {
            // 元素共鳴、チームオプション、その他オプションを計上します
            [optionInput.elementalResonance, optionInput.teamOption, optionInput.miscOption].forEach(optionObj => {
                if (optionObj && optionObj.conditionAdjustments) {
                    Object.keys(optionObj.conditionAdjustments).forEach(stat => {
                        const workValue = optionObj.conditionAdjustments[stat];
                        if (stat.endsWith('元素付与')) {
                            if (['片手剣', '両手剣', '長柄武器'].includes(characterMaster.武器)) {
                                const my付与元素 = stat.replace(/元素付与$/, '');
                                通常攻撃_元素Var = my付与元素;
                                重撃_元素Var = my付与元素;
                                落下攻撃_元素Var = my付与元素;
                            }
                        } else if (workValue !== null) {
                            if (stat in workStatsObj) {
                                workStatsObj[stat] += workValue;
                            } else {
                                workStatsObj[stat] = workValue;
                            }
                            if (stat.endsWith('V1') || stat.endsWith('V2') || stat.endsWith('V3')) {
                                const toStat = stat.replace(/V[1-3]$/, '');
                                if (toStat in workStatsObj) {
                                    workStatsObj[toStat] += workValue;
                                } else {
                                    workStatsObj[toStat] = workValue;
                                }
                            }
                        }
                    })
                }
            })
        }

        const validConditionValueArr = makeValidConditionValueArr(conditionInput);

        // 特殊な固有変数 for アルレッキーノ
        for (const myDamageDetail of [characterInput.damageDetailMyCharacter, characterInput.damageDetailMyWeapon, characterInput.damageDetailMyArtifactSets]) {
            if (myDamageDetail && CHANGE_KIND_TALENT in myDamageDetail) {
                for (const myDetailObj of myDamageDetail[CHANGE_KIND_TALENT]) {
                    if (myDetailObj['条件']) {
                        const number = checkConditionMatches(myDetailObj['条件'], validConditionValueArr, constellation);   // ステータス依存は不可
                        if (number === 0) continue;
                    }
                    if (myDetailObj['種類'] === '固有変数' && myDetailObj['名前'] && myDetailObj['数値'] !== null) {
                        workStatsObj[myDetailObj['名前']] = evalFormula(myDetailObj['数値'], workStatsObj, DAMAGE_RESULT_TEMPLATE);
                    }
                }
            }
        }

        // チーム内で最も高いステータス値を求めます
        calculateStatsTop(workStatsObj, optionInput);
        // ステータス補正を計上します
        ステータスチーム内最高ARRAY.forEach(stat => {
            if (stat in statsInput.statAdjustments) {
                if (stat in workStatsObj) {
                    workStatsObj[stat] += statsInput.statAdjustments[stat];
                }
            }
        });

        // ステータス変化
        const conditionAdjustments = updateStatsWithCondition(characterInput, validConditionValueArr, workStatsObj);

        // 天賦性能変化 元素付与
        for (const myDamageDetail of [characterInput.damageDetailMyCharacter, characterInput.damageDetailMyWeapon, characterInput.damageDetailMyArtifactSets]) {
            if (myDamageDetail && CHANGE_KIND_TALENT in myDamageDetail) {
                for (const myDetailObj of myDamageDetail[CHANGE_KIND_TALENT]) {
                    if (myDetailObj['条件']) {
                        const number = checkConditionMatches(myDetailObj['条件'], validConditionValueArr, constellation, workStatsObj, conditionInput.conditionValues);
                        if (number === 0) continue;
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
        overwriteObject(conditionInput.conditionAdjustments, conditionAdjustments);
    } catch (error) {
        console.error(error);
        console.error(statsInput, characterInput, artifactDetailInput, conditionInput, optionInput);
        // throw error;
    }
}

function updateStatsWithCondition(
    characterInput: TCharacterInput,
    validConditionValueArr: string[],
    workStatsObj: TStats
) {
    const constellation = characterInput.命ノ星座;
    const workConditionAdjustments = {} as { [key: string]: number };
    const statFormulaMap: Map<string, any[]> = new Map();

    for (const myDamageDetail of [characterInput.damageDetailMyCharacter, characterInput.damageDetailMyWeapon, characterInput.damageDetailMyArtifactSets]) {
        if (myDamageDetail && CHANGE_KIND_STATUS in myDamageDetail) {
            for (const myDetailObj of myDamageDetail[CHANGE_KIND_STATUS]) {
                let hasCondition = false;
                let my数値 = myDetailObj['数値'];
                if (my数値 === null) {
                    continue;
                }
                if (myDetailObj['条件']) {
                    const number = checkConditionMatches(myDetailObj.条件, validConditionValueArr, constellation, workStatsObj);
                    if (my数値.includes('${INDEX}')) {
                        my数値 = my数値.replaceAll('${INDEX}', String(number));
                    } else if (number === 0) {
                        continue;
                    } else {
                        my数値 = '(' + my数値 + ')*' + number;
                    }
                    hasCondition = true;
                }
                let my種類 = myDetailObj['種類'];
                if (my種類) {
                    if (myDetailObj['対象']) {
                        my種類 += '.' + myDetailObj['対象'];
                    }
                    if (my数値.indexOf('${') === -1 && my数値.indexOf('}') === -1) { // 他ステータス依存でないもの
                        updateStatsWithConditionSub2(workConditionAdjustments, workStatsObj, my種類, my数値, myDetailObj.上限, myDetailObj.下限, hasCondition);
                    } else {    // 他ステータス依存のもの
                        if (!statFormulaMap.has(my種類)) {
                            statFormulaMap.set(my種類, []);
                        }
                        statFormulaMap.get(my種類)?.push([my種類, my数値, myDetailObj.上限, myDetailObj.下限, hasCondition]);
                    }
                }
            }
        }
    }

    workStatsObj['HP上限'] += workStatsObj['基礎HP'] + workStatsObj['HP+'];
    workStatsObj['HP上限'] += (workStatsObj['基礎HP'] * workStatsObj['HP%']) / 100;
    workStatsObj['防御力'] += workStatsObj['基礎防御力'] + workStatsObj['防御力+'];
    workStatsObj['防御力'] += (workStatsObj['基礎防御力'] * workStatsObj['防御力%']) / 100;
    workStatsObj['攻撃力'] += workStatsObj['基礎攻撃力'] + workStatsObj['攻撃力+'];
    workStatsObj['攻撃力'] += (workStatsObj['基礎攻撃力'] * workStatsObj['攻撃力%']) / 100;

    const saveStatsObj = _.cloneDeep(workStatsObj);

    const hpStatArr = ['基礎HP', 'HP%', 'HP+', 'HP上限'];
    const defStatArr = ['基礎防御力', '防御力%', '防御力+', '防御力'];
    const atkStatArr = ['基礎攻撃力', '攻撃力%', '攻撃力+', '攻撃力'];
    const otherStatArr = [...元素ステータス_ダメージARRAY, '全元素ダメージバフ', ...元素ステータス_耐性ARRAY, '全元素耐性', ...ダメージバフARRAY, ...実数ダメージ加算ARRAY, ...元素反応バフARRAY, 'ダメージ軽減'];
    otherStatArr.push(...Array.from(statFormulaMap.keys()).filter(s => s.indexOf('.') != -1));

    const formulaStatArr = [...new Set(Array.from(statFormulaMap.keys()).map(s => s.replace(/V[1-3]$/, '')))].filter(s => ![...hpStatArr, ...defStatArr, ...atkStatArr, ...otherStatArr].includes(s));
    formulaStatArr.sort(compareFunction);

    // HPを計算します
    for (const stat of hpStatArr) {
        const oldStatsObj: TStats = {};
        ['V1', 'V2', 'V3'].forEach(postfix => {
            const workStat = stat + postfix;
            if (workStat in workStatsObj) {
                oldStatsObj[workStat] = workStatsObj[workStat];
            } else {
                oldStatsObj[workStat] = 0;
            }
        });
        updateStatsWithConditionSub(workConditionAdjustments, workStatsObj, statFormulaMap, stat);
        ['V1', 'V2', 'V3'].forEach(postfix => {
            const fromStat = stat + postfix;
            if (workStatsObj[fromStat]) {
                if (stat in workStatsObj) {
                    workStatsObj[stat] += workStatsObj[fromStat] - oldStatsObj[fromStat];
                } else {
                    workStatsObj[stat] = workStatsObj[fromStat] - oldStatsObj[fromStat];
                }
            }
        });
    }
    if (workStatsObj['HP+'] != saveStatsObj['HP+']) {
        workStatsObj['HP上限'] += workStatsObj['HP+'] - saveStatsObj['HP+'];
    }
    if (workStatsObj['HP%'] != saveStatsObj['HP%']) {
        workStatsObj['HP上限'] += workStatsObj['基礎HP'] * (workStatsObj['HP%'] - saveStatsObj['HP%']) / 100;
    }

    for (const stat of formulaStatArr) {
        const oldStatsObj: TStats = {};
        ['V1', 'V2', 'V3'].forEach(postfix => {
            const workStat = stat + postfix;
            if (workStat in workStatsObj) {
                oldStatsObj[workStat] = workStatsObj[workStat];
            } else {
                oldStatsObj[workStat] = 0;
            }
        });
        updateStatsWithConditionSub(workConditionAdjustments, workStatsObj, statFormulaMap, stat);
        ['V1', 'V2', 'V3'].forEach(postfix => {
            const fromStat = stat + postfix;
            if (workStatsObj[fromStat]) {
                if (stat in workStatsObj) {
                    workStatsObj[stat] += workStatsObj[fromStat] - oldStatsObj[fromStat];
                } else {
                    workStatsObj[stat] = workStatsObj[fromStat] - oldStatsObj[fromStat];
                }
            }
        });
    }

    // 防御力を計算します
    for (const stat of defStatArr) {
        const oldStatsObj: TStats = {};
        ['V1', 'V2', 'V3'].forEach(postfix => {
            const workStat = stat + postfix;
            if (workStat in workStatsObj) {
                oldStatsObj[workStat] = workStatsObj[workStat];
            } else {
                oldStatsObj[workStat] = 0;
            }
        });
        updateStatsWithConditionSub(workConditionAdjustments, workStatsObj, statFormulaMap, stat);
        ['V1', 'V2', 'V3'].forEach(postfix => {
            const fromStat = stat + postfix;
            if (workStatsObj[fromStat]) {
                if (stat in workStatsObj) {
                    workStatsObj[stat] += workStatsObj[fromStat] - oldStatsObj[fromStat];
                } else {
                    workStatsObj[stat] = workStatsObj[fromStat] - oldStatsObj[fromStat];
                }
            }
        });
    }
    if (workStatsObj['防御力+'] != saveStatsObj['防御力+']) {
        workStatsObj['防御力'] += workStatsObj['防御力+'] - saveStatsObj['防御力+'];
    }
    if (workStatsObj['防御力%'] != saveStatsObj['防御力%']) {
        workStatsObj['防御力'] += workStatsObj['基礎防御力'] * (workStatsObj['防御力%'] - saveStatsObj['防御力%']) / 100;
    }

    // 攻撃力を計算します
    for (const stat of atkStatArr) {
        const oldStatsObj: TStats = {};
        ['V1', 'V2', 'V3'].forEach(postfix => {
            const workStat = stat + postfix;
            if (workStat in workStatsObj) {
                oldStatsObj[workStat] = workStatsObj[workStat];
            } else {
                oldStatsObj[workStat] = 0;
            }
        });
        updateStatsWithConditionSub(workConditionAdjustments, workStatsObj, statFormulaMap, stat);
        ['V1', 'V2', 'V3'].forEach(postfix => {
            const fromStat = stat + postfix;
            if (workStatsObj[fromStat]) {
                if (stat in workStatsObj) {
                    workStatsObj[stat] += workStatsObj[fromStat] - oldStatsObj[fromStat];
                } else {
                    workStatsObj[stat] = workStatsObj[fromStat] - oldStatsObj[fromStat];
                }
            }
        });
    }
    if (workStatsObj['攻撃力+'] != saveStatsObj['攻撃力+']) {
        workStatsObj['攻撃力'] += workStatsObj['攻撃力+'] - saveStatsObj['攻撃力+'];
    }
    if (workStatsObj['攻撃力%'] != saveStatsObj['攻撃力%']) {
        workStatsObj['攻撃力'] += workStatsObj['基礎攻撃力'] * (workStatsObj['攻撃力%'] - saveStatsObj['攻撃力%']) / 100;
    }

    // 元素ステータスおよび隠しステータスを計算します
    for (const stat of otherStatArr) {
        const oldStatsObj: TStats = {};
        ['V1', 'V2', 'V3'].forEach(postfix => {
            const workStat = stat + postfix;
            if (workStat in workStatsObj) {
                oldStatsObj[workStat] = workStatsObj[workStat];
            } else {
                oldStatsObj[workStat] = 0;
            }
        });
        updateStatsWithConditionSub(workConditionAdjustments, workStatsObj, statFormulaMap, stat);
        ['V1', 'V2', 'V3'].forEach(postfix => {
            const fromStat = stat + postfix;
            if (workStatsObj[fromStat]) {
                if (stat in workStatsObj) {
                    workStatsObj[stat] += workStatsObj[fromStat] - oldStatsObj[fromStat];
                } else {
                    workStatsObj[stat] = workStatsObj[fromStat] - oldStatsObj[fromStat];
                }
            }
        });
    }

    return workConditionAdjustments;
}

function updateStatsWithConditionSub(
    workConditionAdjustments: TStats,
    workStatsObj: TStats,
    statFormulaMap: Map<string, any[]>,
    formulaKey: string,
) {
    for (const formulaArr of [statFormulaMap.get(formulaKey), ...['V1', 'V2', 'V3'].map(s => statFormulaMap.get(formulaKey + s))]) {
        if (!formulaArr) continue;
        formulaArr.forEach(formula => {
            const diffStats = updateStats(workStatsObj, formula[0], formula[1], formula[2], formula[3]);
            for (const stat of Object.keys(diffStats)) {
                if (ステータスチーム内最高ARRAY.includes(stat + 'TOP')) {
                    const statValue = getStatValue(stat + 'X7', workStatsObj);
                    const topValue = workStatsObj[stat + 'TOP'];
                    if (statValue !== undefined && topValue !== undefined) {
                        if (statValue > topValue) {
                            workStatsObj[stat + 'TOP'] = statValue;
                        }
                    }
                }
            }
            if (formula[4]) {
                for (const stat of Object.keys(diffStats)) {
                    if (stat in workConditionAdjustments) {
                        workConditionAdjustments[stat] += diffStats[stat];
                    } else {
                        workConditionAdjustments[stat] = diffStats[stat];
                    }
                }
            }
        })
    }
}

function updateStatsWithConditionSub2(
    workConditionAdjustments: TStats,
    workStatsObj: TStats,
    kind: string,
    formula: string,
    maxFormula: string | null,
    minFormula: string | null,
    hasCondition = false,
) {
    const diffStats = updateStats(workStatsObj, kind, formula, maxFormula, minFormula);
    for (const stat of Object.keys(diffStats)) {
        if (ステータスチーム内最高ARRAY.includes(stat + 'TOP')) {
            const statValue = getStatValue(stat + 'X7', workStatsObj);
            const topValue = workStatsObj[stat + 'TOP'];
            if (statValue !== undefined && topValue !== undefined) {
                if (statValue > topValue) {
                    workStatsObj[stat + 'TOP'] = statValue;
                }
            }
        }
    }
    if (hasCondition) {
        for (const stat of Object.keys(diffStats)) {
            if (stat in workConditionAdjustments) {
                workConditionAdjustments[stat] += diffStats[stat];
            } else {
                workConditionAdjustments[stat] = diffStats[stat];
            }
        }
    }
}

function compareFunction(a: string, b: string) {
    const arr = ['元素熟知', '会心率', '会心ダメージ', '与える治療効果', '受ける治療効果', '元素チャージ効率', 'シールド強化'];
    const lowestArr = ['ダメージ軽減'];
    let aIndex = arr.indexOf(a);
    if (lowestArr.indexOf(a) >= 0) {
        aIndex = arr.length + 1;
    }
    let bIndex = arr.indexOf(b);
    if (lowestArr.indexOf(b) >= 0) {
        bIndex = arr.length + 1;
    }
    return (aIndex != -1 ? aIndex : arr.length) - (bIndex != -1 ? bIndex : arr.length);
}

export function calculateElementalResonance(
    conditionValues: TConditionValues,
    conditionInput: TConditionInput,
): TStats {
    const result: TStats = {};
    const validConditionValueArr = makeValidConditionValueArr(conditionInput);
    for (const key of Object.keys(ELEMENTAL_RESONANCE_MASTER)) {
        if (!conditionValues[key]) continue;
        const master = (ELEMENTAL_RESONANCE_MASTER as any)[key];
        if (master.詳細) {
            for (const detailObj of master.詳細) {
                if (detailObj.条件) {
                    const matchRet = checkConditionMatches(detailObj.条件, validConditionValueArr, 0);
                    if (matchRet === 0) continue;
                }
                if (detailObj.種類 && detailObj.数値) {
                    if (detailObj.種類 in result) {
                        result[detailObj.種類] += detailObj.数値;
                    } else {
                        result[detailObj.種類] = detailObj.数値;
                    }
                }
            }
        }
        if (key == '草元素共鳴' && conditionValues.dendroOption) {
            result['元素熟知'] += Number(conditionValues.dendroOption);
        }
    }
    return result;
}

// /** げんかるくスタイルの式データから結果（数値）を計算します */
// function calculateFormulaArray(
//     formulaArr: any,
//     statsObj: TStats,
//     damageResult: TDamageResult,
//     opt_max: number | string | Array<number | string> | null = null,
//     opt_min: number | string | Array<number | string> | null = null
// ): number {
//     try {
//         let result = 0;
//         if (Array.isArray(formulaArr)) {
//             let operator: string | null = null;
//             for (const entry of formulaArr) {
//                 let subResult = 0;
//                 if (['+', '-', '*', '/'].includes(entry)) {
//                     operator = entry;
//                     continue;
//                 } else if (isNumeric(entry)) {
//                     subResult = Number(entry);
//                 } else if (Array.isArray(entry)) {
//                     subResult = calculateFormulaArray(entry, statsObj, damageResult);
//                 } else if (entry.indexOf('#') != -1) {
//                     const nameArr = entry.split('#');
//                     if (damageResult && nameArr[0] in damageResult) {
//                         const damageArrArr = damageResult[nameArr[0]] as TDamageResultEntry[];
//                         let damage = null;
//                         for (const damageArr of damageArrArr) {
//                             if (nameArr[1] == damageArr[0]) {
//                                 damage = damageArr[4];  // 非会心
//                                 break;
//                             }
//                         }
//                         if (damage != null) {
//                             subResult = damage;
//                         } else {
//                             console.error(formulaArr, statsObj, damageResult, opt_max, opt_min, entry);
//                         }
//                     }
//                 } else {
//                     const temp = getStatValue(entry, statsObj);
//                     if (temp === undefined) {
//                         console.error(formulaArr, statsObj, null, opt_max, opt_min, entry);
//                     } else {
//                         subResult = temp;
//                     }
//                 }
//                 if (operator == null) {
//                     result += subResult;
//                 } else {
//                     switch (operator) {
//                         case '+':
//                             result += subResult;
//                             break;
//                         case '-':
//                             result -= subResult;
//                             break;
//                         case '*':
//                             result *= subResult;
//                             result = Math.floor(result * 100) / 100;
//                             break;
//                         case '/':
//                             result /= subResult;
//                             break;
//                     }
//                 }
//             }
//         } else if (isNumeric(formulaArr)) {
//             result = Number(formulaArr);
//         } else if (formulaArr.indexOf('#') != -1) {
//             const nameArr = formulaArr.split('#');
//             if (damageResult && nameArr[0] in damageResult) {
//                 const damageArrArr = damageResult[nameArr[0]] as TDamageResultEntry[];
//                 for (const damageArr of damageArrArr) {
//                     if (nameArr[1] == damageArr[0]) {
//                         result = damageArr[4];  // 非会心
//                         break;
//                     }
//                 }
//             }
//         } else {
//             const temp = getStatValue(formulaArr, statsObj);
//             if (temp !== undefined) {
//                 result = temp;
//             } else {
//                 console.error(formulaArr, statsObj, null, opt_max, opt_min);
//                 result = 0; // 暫定
//             }
//         }
//         if (opt_max != null) {
//             const maxValue = calculateFormulaArray(opt_max, statsObj, damageResult);
//             result = Math.min(result, maxValue);
//         }
//         if (opt_min != null) {
//             const minValue = calculateFormulaArray(opt_min, statsObj, damageResult);
//             result = Math.max(result, minValue);
//         }
//         return result;
//     } catch (error) {
//         console.error(error);
//         console.error(formulaArr, statsObj, damageResult, opt_max, opt_min);
//         throw error;
//     }
// }

/** ダメージ計算を実施します */
export function calculateDamageResult(
    damageResult: TDamageResult,
    characterInput: TCharacterInput,
    conditionInput: TConditionInput,
    statsInput: TStatsInput,
) {
    try {
        if (!characterInput) return;
        if (!conditionInput) return;
        if (!statsInput) return;
        const characterMaster = characterInput.characterMaster;
        const constellation = characterInput['命ノ星座'];
        const vision = characterMaster['元素'];

        // 元素反応を計算します
        const reactionResult = _.cloneDeep(元素反応TEMPLATE);
        const reactionMasterArr = [];
        const dmgElementSet = new Set<string>();
        dmgElementSet.add(vision); // 神の目の元素ダメージによる元素反応
        if (conditionInput.selectList.filter(s => s.name == '元素変化').length) {
            const selectEntry = conditionInput.selectList.filter(s => s.name == '元素変化')[0];
            const selectedIndex = conditionInput.conditionValues['元素変化'] as number;
            if (selectedIndex) {
                const dmgElement = selectEntry.options[selectedIndex].replace(/元素$/, '');
                dmgElementSet.add(dmgElement); // 元素変化したダメージによる元素反応
            }
        }
        if (conditionInput.selectList.filter(s => s.name == '拡散').length) {
            const selectEntry = conditionInput.selectList.filter(s => s.name == '拡散')[0];
            const selectedIndex = conditionInput.conditionValues['拡散'] as number;
            if (selectedIndex) {
                const dmgElement = selectEntry.options[selectedIndex].replace(/元素$/, '');
                dmgElementSet.add(dmgElement); // 拡散ダメージによる元素反応
            }
        }
        for (const dmgElement of conditionInput.攻撃元素) {
            if (dmgElement && dmgElement != '物理') {
                dmgElementSet.add(dmgElement); // 元素付与で変化した通常攻撃/重撃/落下攻撃ダメージによる元素反応
            }
        }
        if (characterInput.character == 'チャスカ') {
            for (const dmgElement of ['炎', '水', '雷', '氷']) {
                const key = '[チーム]' + dmgElement + '元素キャラクター';
                if (conditionInput.selectList.filter(s => s.name == key).length) {
                    const selectedIndex = conditionInput.conditionValues[key] as number;
                    if (selectedIndex) {
                        dmgElementSet.add(dmgElement);
                    }
                }
            }
        }
        for (const dmgElement of dmgElementSet) {
            reactionMasterArr.push([dmgElement, (ELEMENTAL_REACTION_MASTER as any)[dmgElement]]);
        }
        let has氷砕き = false;
        if (characterMaster.元素 == '岩' || characterMaster.武器 == '両手剣') {
            has氷砕き = true;
        } else {
            const characterArr = (ELEMENTAL_REACTION_MASTER as any).破砕?.氷砕き?.キャラクター;
            if (characterArr && characterArr.includes(characterMaster.名前)) {
                has氷砕き = true;
            }
        }
        if (has氷砕き) {
            const dmgElement = '破砕';
            reactionMasterArr.push([dmgElement, (ELEMENTAL_REACTION_MASTER as any)[dmgElement]]);
        }
        reactionResult['元素'] = vision;
        reactionMasterArr.forEach(entry => {
            const element = entry[0];
            const reactionMaster = entry[1];
            Object.keys(reactionMaster).forEach(reaction => {
                const reactionObj = reactionMaster[reaction];
                let resultValue = 0;
                if (reaction == '結晶') {
                    resultValue = calculate結晶シールド吸収量(element, statsInput.statsObj);
                } else if (reaction == '拡散') {
                    let dmgElement = '炎';
                    for (const entry of conditionInput.selectList) {
                        if (entry.name == '拡散') {
                            const optionValue = entry.options[Number(conditionInput.conditionValues['拡散'])];
                            if (optionValue) dmgElement = optionValue.replace(/元素$/, '');
                            break;
                        }
                    }
                    reactionResult['拡散元素'] = dmgElement;
                    resultValue = calculate固定値系元素反応ダメージ(reaction, element, statsInput.statsObj, dmgElement);
                } else {
                    switch (reactionObj['種類']) {
                        case '乗算':    // 蒸発 溶解
                            resultValue = calculate乗算系元素反応倍率(reaction, element, statsInput.statsObj);
                            break;
                        case '固定':    // 過負荷 感電 超電導 氷砕き
                            resultValue = calculate固定値系元素反応ダメージ(reaction, element, statsInput.statsObj);
                            break;
                        case '加算':    // 超激化 草激化
                            resultValue = calculate加算系元素反応ダメージ(reaction, element, statsInput.statsObj);
                            break;
                    }
                }
                ['倍率', 'ダメージ', '吸収量'].forEach(suffix => {
                    let key = reaction + suffix;
                    if (suffix === '倍率') {
                        key += '_' + element;
                    }
                    if (key in reactionResult) {
                        (reactionResult as any)[key] = resultValue;
                    }
                });
            });
        });
        Object.keys(reactionResult).filter(s => s.endsWith('ダメージ') && s.indexOf('会心') == -1).forEach(dmg => {
            ['会心率', '会心ダメージ'].forEach(stat => {
                const key = dmg + stat;
                if (key in statsInput.statsObj) {
                    (reactionResult as any)[key] = statsInput.statsObj[key];
                }
            });
            if (dmg.startsWith('月')) { // for ナド・クライ
                const critRateKey = dmg + '会心率';
                let critRate = Math.min(100, statsInput.statsObj['会心率']);
                if (critRateKey in reactionResult && (reactionResult as any)[critRateKey]) {
                    critRate *= (reactionResult as any)[critRateKey] / 100;
                }
                (reactionResult as any)[critRateKey] = critRate;
                const critDmgKey = dmg + '会心ダメージ';
                let critDmg = statsInput.statsObj['会心ダメージ'];
                if (critDmgKey in reactionResult && (reactionResult as any)[critDmgKey]) {
                    critDmg *= (reactionResult as any)[critDmgKey] / 100;
                }
                (reactionResult as any)[critDmgKey] = critDmg;
            }
        });
        overwriteObject(damageResult.元素反応, reactionResult);

        // 戦闘天賦およびその他のダメージを計算します
        const validConditionValueArr = makeValidConditionValueArr(conditionInput);

        const damageDetailMyCharacter = characterInput.damageDetailMyCharacter;
        const damageDetailMyWeapon = characterInput.damageDetailMyWeapon;
        const damageDetailMyArtifactSets = characterInput.damageDetailMyArtifactSets;

        if (Array.isArray(damageResult['キャラクター注釈'])) {
            damageResult['キャラクター注釈'].splice(0, damageResult['キャラクター注釈'].length);
        }

        if (damageDetailMyCharacter) {
            for (const category of ['通常攻撃', '重撃', '落下攻撃']) {
                damageResult[category] = [];
                if (!(category in damageDetailMyCharacter)) continue;
                const element = conditionInput.攻撃元素[['通常攻撃', '重撃', '落下攻撃'].indexOf(category)];
                let talentDetailArr = (damageDetailMyCharacter as any)[category];
                if (('特殊' + category) in damageDetailMyCharacter) {
                    const workObj = (damageDetailMyCharacter as any)['特殊' + category];
                    if (checkConditionMatches(workObj['条件'], validConditionValueArr, constellation, statsInput.statsObj, conditionInput.conditionValues) !== 0) {
                        talentDetailArr = workObj['詳細'];
                    }
                }
                for (const talentDetail of talentDetailArr) {
                    if (talentDetail['条件'] && checkConditionMatches(talentDetail['条件'], validConditionValueArr, constellation, statsInput.statsObj, conditionInput.conditionValues) === 0) {
                        continue;
                    }
                    const resultArr = calculateDamageFromDetail(talentDetail, characterInput, conditionInput, statsInput.statsObj, damageResult, element);
                    (damageResult[category] as any).push(resultArr);
                }
                if (category == '通常攻撃') {
                    let n = 0;
                    const sum = ['合計ダメージ', null, 0, 0, 0, null, 0, 0, 1] as TDamageResultEntry;
                    for (const entry of damageResult[category]) {
                        if ((entry[0].endsWith('段ダメージ') || ['水月ダメージ'].includes(entry[0])) && !entry[0].startsWith('非表示_')) {  // ニィロウ
                            sum[1] = entry[1];
                            sum[2] += entry[2];
                            if (entry[3] == null) sum[3] = null;
                            else if (sum[3] != null) sum[3] += entry[3];
                            sum[4] += entry[4];
                            if (sum[6] != null) {   // HIT数
                                if (entry[6]) sum[6] += entry[6];
                                else sum[6]++;
                            }
                            sum[7] = entry[7];  // ダメージバフ
                            sum[8] = entry[8];  // 敵の防御補正
                            n++;
                        }
                    }
                    if (n > 0) {
                        damageResult[category].splice(n, 0, sum);
                    }
                }
            }
            for (const category of ['元素スキル', '元素爆発', 'その他']) {
                damageResult[category] = [];
                if (!(category in damageDetailMyCharacter)) continue;
                const talentDetailArr = (damageDetailMyCharacter as any)[category];
                for (const talentDetail of talentDetailArr) {
                    if (talentDetail['条件'] && checkConditionMatches(talentDetail['条件'], validConditionValueArr, constellation, statsInput.statsObj, conditionInput.conditionValues) === 0) {
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
            const talentDetailArr = (myDamageDetail as any)[category];
            for (const talentDetail of talentDetailArr) {
                if (talentDetail['条件'] && checkConditionMatches(talentDetail['条件'], validConditionValueArr, constellation, statsInput.statsObj, conditionInput.conditionValues) === 0) {
                    continue;
                }
                const resultArr = calculateDamageFromDetail(talentDetail, characterInput, conditionInput, statsInput.statsObj, damageResult);
                (damageResult[category] as TDamageResultEntry[]).push(resultArr);
            }
        }

        // 被ダメージを計算します
        const damageTakenArr = [] as any;
        for (const stat of 元素ステータス_耐性ARRAY) {
            const element = stat.replace(/元素耐性$/, '').replace(/耐性$/, '');
            const damageTaken = calculateDamageTaken(statsInput.statsObj, 10000, element);
            damageTakenArr.push({ key: element, value: damageTaken });
        }
        damageResult['被ダメージ'] = damageTakenArr;

        // 耐久スコアを計算します
        const resScoreArr = [] as any;
        for (const damageTaken of damageTakenArr) {
            resScoreArr.push({ key: damageTaken.key, value: statsInput.statsObj['HP上限'] * 10000 / damageTaken.value });
        }
        damageResult['耐久スコア'] = resScoreArr;

        console.debug('damageResult', damageResult);
    } catch (error) {
        console.error(error);
        console.error(damageResult, characterInput, conditionInput, statsInput);
        // throw error;
    }
}

export function calculateDamageResultLunarReaction(
    damageResult: TDamageResult,
    characterInput: TCharacterInput,
    optionInput: TOptionInput,
) {
    const allMap = new Map<string, TDamageResultEntry[]>();

    if (damageResult?.元素反応) {
        Object.keys(damageResult.元素反応).forEach(key => {
            let value = (damageResult.元素反応 as any)[key];
            if (key.endsWith('ALL') && _.isArray(value)) {
                key = key.replace(/ALL$/, '');
                const template: TDamageResultEntry[] = [];
                const work = damageResult.元素反応 as any;
                template.push(makeTDamageResultEntry(characterInput.character, null, work[key], work[key + '会心率'], work[key + '会心ダメージ']));
                value = template;
                allMap.set(key, value);
            }
        })
    }
    if (optionInput?.teamMembers) {
        for (const member of optionInput.teamMembers) {
            if (member == characterInput.character) {
                continue;
            }
            const supporter = optionInput.supporters[member];
            if (supporter?.damageResult?.元素反応) {
                allMap.forEach((value, key) => {
                    const work = supporter.damageResult.元素反応 as any;
                    value.push(makeTDamageResultEntry(member, null, work[key], work[key + '会心率'], work[key + '会心ダメージ']));
                })
            }
        }
    }

    allMap.forEach((value, key) => {
        (damageResult.元素反応 as any)[key + 'ALL'].splice(0, value.length, ...value);
    })
}

function makeTDamageResultEntry(name: string, element: string | null, nonCrit: number, critRate: number, critDmg: number, type: string | null = null): TDamageResultEntry {
    const crit = nonCrit * (1 + critDmg / 100);
    critRate = Math.min(100, critRate);
    const expectedValue = nonCrit * critRate / 100 * (1 + critDmg / 100) + (1 - critRate / 100) * nonCrit;
    const result: TDamageResultEntry = [name, element, expectedValue, crit, nonCrit, type, null, null, null];  // 0:名前, 1:元素, 2:期待値, 3:会心, 4:非会心, 5:種類, 6:HIT数, 7:ダメージバフ, 8:敵の防御補正
    return result;
}

export function makeValidConditionValueArr(conditionInput: TConditionInput) {
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
                if (_.isNumber(value)) {
                    if (value > 0 || (value === 0 && entry.required)) {
                        result.push(entry.name + '@' + entry.options[value]);
                    }
                }
            });
        }
        const numberList = conditionInput.numberList;
        if (numberList) {
            numberList.forEach((entry: any) => {
                const value = conditionInput.conditionValues[entry.name];
                if (_.isNumber(value)) {
                    result.push(entry.name + '=' + value);
                }
            });
        }
        return result;
    } catch (error) {
        console.error(error);
        console.error(conditionInput);
        throw error;
    }
}

export function checkConditionMatches(
    conditionStr: string,
    validConditionValueArr: string[],
    constellation: number,
    statsObj: TStats = {},
    conditionValues: TConditionValues = {},
): number {
    const myCondStr = conditionStr.split('^')[0];

    if (myCondStr.indexOf('|') !== -1) {  // |はOR条件です
        const myCondStrArr = myCondStr.split('|');
        for (let i = 0; i < myCondStrArr.length; i++) {
            const resultSub = checkConditionMatchesSub(myCondStrArr[i], validConditionValueArr, constellation, statsObj, conditionValues);
            if (resultSub === 1) {
                return 1;   // マッチ
            }
        }
        return 0;
    }

    const myCondStrArr = myCondStr.split('&');    // &はAND条件です
    let result = 1;
    for (let i = 0; i < myCondStrArr.length; i++) {
        const resultSub = checkConditionMatchesSub(myCondStrArr[i], validConditionValueArr, constellation, statsObj, conditionValues);
        if (resultSub === 0) {
            return 0;   // アンマッチ
        }
        if (resultSub !== 1) {
            result = resultSub;
        }
    }
    return result;
}

function checkConditionMatchesSub(
    conditionStr: string,
    validConditionValueArr: string[],
    constellation: number,
    statsObj: TStats,
    conditionValues: TConditionValues,
): number {
    const opkind = getConditionOpkind(conditionStr);
    const conditionKeyValArr = opkind ? conditionStr.split(opkind) : [conditionStr];
    const conditionKey = conditionKeyValArr[0];
    let conditionVal: number | string | undefined = conditionKeyValArr.length === 2 ? conditionKeyValArr[1] : undefined;
    if (opkind === undefined) {
        return validConditionValueArr.filter(s => s.split('@')[0] == conditionKey).length > 0 ? 1 : 0;
    }
    if (!conditionVal) {
        console.error(conditionStr, validConditionValueArr, constellation, statsObj);
        return 0;
    }
    if (conditionKey === '命ノ星座') {
        if (isNumeric(conditionVal)) {
            conditionVal = Number(conditionVal);
            if (opkind === '>=' || opkind === '@') {
                return constellation >= conditionVal ? 1 : 0;
            } else if (opkind === '<=') {
                return constellation <= conditionVal ? 1 : 0;
            } else if (opkind === '>') {
                return constellation > conditionVal ? 1 : 0;
            } else if (opkind === '<') {
                return constellation < conditionVal ? 1 : 0;
            } else if (opkind === '=') {
                return constellation == conditionVal ? 1 : 0;
            }
        }
    } else if (opkind === '@') {
        const re = new RegExp('([^0-9]*?)([\\-0-9\\.]+)(.*)');    // 条件値={prefix}{倍率}{postfix}
        for (let i = 0; i < validConditionValueArr.length; i++) {
            if (validConditionValueArr[i].startsWith(conditionKey + '@')) {
                const tempArr = validConditionValueArr[i].split('@');
                const reRet = re.exec(tempArr[1]);
                if (reRet) {
                    let tempVal = conditionVal;
                    if (reRet[1]) tempVal = tempVal.substring(reRet[1].length);
                    if (reRet[3]) tempVal = tempVal.substring(0, tempVal.length - reRet[3].length);
                    tempVal = tempVal.replace(/\/.+/, '');
                    const tempValArr = tempVal.split(/[,-]/);
                    const fromVal = Number(tempValArr[0]);
                    const toVal = Number(tempValArr[tempValArr.length - 1]);
                    const actualVal = Number(reRet[2]);
                    if (fromVal <= actualVal && actualVal <= toVal) {
                        return actualVal;   // マッチ 倍率
                    }
                }
            }
        }
    } else if (opkind === '=') {
        if (validConditionValueArr.includes(conditionKey + '@' + conditionVal)) {
            return 1;   // マッチ
        }
        if (NUMBER_CONDITION_VALUE_RE.test(conditionVal)) { // 数値入力条件
            const tempArr = validConditionValueArr.filter(s => s.split('=')[0] == conditionKey);
            if (tempArr.length > 0) {
                return Number(tempArr[0].split('=')[1]);   // マッチ 倍率
            }
        }
        if (isNumeric(conditionVal)) {
            return conditionKey in statsObj && statsObj[conditionKey] == Number(conditionVal) ? 1 : 0;
        }
    } else if (opkind === '>=') {    // 以上
        if (isNumeric(conditionVal)) {
            return conditionKey in statsObj && statsObj[conditionKey] >= Number(conditionVal) ? 1 : 0;
        }
        if (conditionVal.startsWith('index_')) {    // selectListのindex
            conditionVal = conditionVal.replace(/^index_/, '');
            if (isNumeric(conditionVal) && conditionKey in conditionValues) {
                const actualVal = conditionValues[conditionKey];
                if (_.isNumber(actualVal) && actualVal >= Number(conditionVal)) {
                    return 1;   // マッチ
                }
            }
        }
    } else if (opkind === '<=') {    // 以下
        if (isNumeric(conditionVal)) {
            return conditionKey in statsObj && statsObj[conditionKey] <= Number(conditionVal) ? 1 : 0;
        }
        if (conditionVal.startsWith('index_')) {    // selectListのindex
            conditionVal = conditionVal.replace(/^index_/, '');
            if (isNumeric(conditionVal) && conditionKey in conditionValues) {
                const actualVal = conditionValues[conditionKey];
                if (_.isNumber(actualVal) && actualVal <= Number(conditionVal)) {
                    return 1;   // マッチ
                }
            }
        }
    } else if (opkind === '>') {     // 大なり
        if (isNumeric(conditionVal)) {
            return conditionKey in statsObj && statsObj[conditionKey] > Number(conditionVal) ? 1 : 0;
        }
        if (conditionVal.startsWith('index_')) {    // selectListのindex
            conditionVal = conditionVal.replace(/^index_/, '');
            if (isNumeric(conditionVal) && conditionKey in conditionValues) {
                const actualVal = conditionValues[conditionKey];
                if (_.isNumber(actualVal) && actualVal > Number(conditionVal)) {
                    return 1;   // マッチ
                }
            }
        }
    } else if (opkind === '<') {     // 小なり
        if (isNumeric(conditionVal)) {
            return conditionKey in statsObj && statsObj[conditionKey] < Number(conditionVal) ? 1 : 0;
        }
        if (conditionVal.startsWith('index_')) {    // selectListのindex
            conditionVal = conditionVal.replace(/^index_/, '');
            if (isNumeric(conditionVal) && conditionKey in conditionValues) {
                const actualVal = conditionValues[conditionKey];
                if (_.isNumber(actualVal) && actualVal < Number(conditionVal)) {
                    return 1;   // マッチ
                }
            }
        }
    }
    return 0;   // アンマッチ
}

/** 蒸発、溶解のダメージを計算します */
function calculate乗算系元素反応倍率(
    reaction: any,
    element: string,
    statsObj: any,
) {
    try {
        if (!element || element == '物理') return 0;
        const elementalMastery = statsObj['元素熟知'];
        const dmgBuff = statsObj[reaction + '反応ボーナス'] ?? 0;
        let result = (ELEMENTAL_REACTION_MASTER as any)[element][reaction]['数値'];
        result *= 1 + (25 * elementalMastery / (9 * (elementalMastery + 1400))) + dmgBuff / 100;
        return result;
    } catch (error) {
        console.error(error);
        console.error(reaction, element, statsObj);
        throw error;
    }
}

/**
 * 過負荷、感電、超電導、拡散のダメージを計算します
 */
function calculate固定値系元素反応ダメージ(
    reaction: any,
    element: string,
    statsObj: TStats,
    opt_dmgElement?: string,
) {
    try {
        if (!element || element == '物理') return 0;
        const level = statsObj['レベル'];
        const elementalMastery = statsObj['元素熟知'];
        const baseDmgUp = statsObj[reaction + '基礎ダメージアップ'] ?? 0;
        const dmgBuff = statsObj[reaction + '反応ボーナス'] ?? 0;
        const dmgUp = statsObj[reaction + 'ダメージアップ'] ?? 0;
        const dmgElement = opt_dmgElement ?? (ELEMENTAL_REACTION_MASTER as any)[element][reaction]['元素'];
        const multiplier = (ELEMENTAL_REACTION_MASTER as any)[element][reaction]['数値'];
        const baseDmg = getValueByLevel(level, ELEMENTAL_REACTION_BASE_DAMAGE_MASTER);
        let result = baseDmg * multiplier * (1 + baseDmgUp / 100);
        if (reaction.startsWith('月')) {
            result *= 1 + (6 * elementalMastery / (elementalMastery + 2000)) + dmgBuff / 100;
        } else {
            result *= 1 + (16 * elementalMastery / (elementalMastery + 2000)) + dmgBuff / 100;
        }
        result += dmgUp;
        result *= calculateEnemyRes(dmgElement, statsObj);
        return result;
    } catch (error) {
        console.error(error);
        console.error(reaction, element, statsObj, opt_dmgElement);
        throw error;
    }
}

/** 結晶シールドの吸収量を計算します */
function calculate結晶シールド吸収量(element: string, statsObj: TStats) {
    try {
        if (!element || element == '物理') return 0;
        const level = statsObj['レベル'];
        const elementalMastery = statsObj['元素熟知'];
        const dmgBuff = statsObj['結晶反応ボーナス'] ?? 0;
        const multiplier = (ELEMENTAL_REACTION_MASTER as any)[element]['結晶']['数値'];
        const baseDmg = getValueByLevel(level, ELEMENTAL_REACTION_BASE_DAMAGE_MASTER);
        let result = baseDmg * multiplier;
        result *= 1 + (40 * elementalMastery / (9 * (elementalMastery + 1400))) + dmgBuff / 100;
        return result;
    } catch (error) {
        console.error(error);
        console.error(element, statsObj);
        throw error;
    }
}

/** 超激化、草激化のダメージを計算します */
function calculate加算系元素反応ダメージ(reaction: any, element: string, statsObj: TStats) {
    try {
        if (!element || element == '物理') return 0;
        const level = statsObj['レベル'];
        const elementalMastery = statsObj['元素熟知'];
        const dmgBuff = statsObj[reaction + '反応ボーナス'] ?? 0;
        const dmgElement = (ELEMENTAL_REACTION_MASTER as any)[element][reaction]['元素'];
        const multiplier = (ELEMENTAL_REACTION_MASTER as any)[element][reaction]['数値'];
        const baseDmg = getValueByLevel(level, ELEMENTAL_REACTION_BASE_DAMAGE_MASTER);
        let result = baseDmg * multiplier;
        result *= 1 + (5 * elementalMastery / (elementalMastery + 1200)) + dmgBuff / 100;
        result *= calculateEnemyRes(dmgElement, statsObj);
        return result;
    } catch (error) {
        console.error(error);
        console.error(reaction, element, statsObj);
        throw error;
    }
}

/** 防御力補正を計算します */
export function calculateEnemyDef(statsObj: TStats, opt_ignoreDef = 0) { // 防御力, 防御無視
    try {
        const level = statsObj['レベル'] ?? 0;
        const enemyLevel = statsObj['敵レベル'] ?? 0;
        const calcIgnoreDef = opt_ignoreDef / 100;
        const calcDef = Math.max(-100, statsObj['敵防御力'] ?? 0) / 100;    // 下限 -100%
        const result = (level + 100) / ((1 - calcIgnoreDef) * (1 + calcDef) * (enemyLevel + 100) + level + 100);
        return result;
    } catch (error) {
        console.error(error);
        console.error(statsObj, opt_ignoreDef);
        throw error;
    }
}

/** 元素(物理)耐性補正を計算します */
function calculateRes(res: number) {
    if (res == Infinity) return 0;  // 完全耐性
    let result = res;
    if (result < 0) {
        result = 100 - result / 2;
    } else if (result < 75) {
        result = 100 - result;
    } else {
        result = 10000 / (4 * result + 100)
    }
    result /= 100;
    return result;
}

/** 敵の元素(物理)耐性補正を計算します */
export function calculateEnemyRes(element: string, statsObj: TStats) {
    try {
        const statName = '敵' + element + (element != '物理' ? '元素' : '') + '耐性';
        const result = calculateRes(statsObj[statName] ?? 0);
        return result;
    } catch (error) {
        console.error(error);
        console.error(element, statsObj);
        throw error;
    }
}

/** ダメージを計算します */
function calculateDamageFromDetail(
    detailObj: any,
    characterInput: TCharacterInput,
    conditionInput: TConditionInput,
    statsObj: TStats,
    damageResult: TDamageResult,
    opt_element: string | null = null
): TDamageResultEntry {
    try {
        const myバフArr = [] as Array<string>;
        let is会心Calc = true;
        let is防御補正Calc = true;
        let is耐性補正Calc = true;
        let my元素 = detailObj['元素'] != null ? detailObj['元素'] : opt_element != null ? opt_element : null;
        let my防御無視 = 0; // for 雷電将軍
        let my別枠乗算 = 0; // for 宵宮
        const myHIT数 = detailObj['HIT数'] != null ? Number(detailObj['HIT数']) : 1;
        const myステータス補正 = {} as { [key: string]: number };

        const constellation = statsObj['命ノ星座'];
        const talentChangeDetailObjArr = getChangeDetailObjArr(characterInput, CHANGE_KIND_TALENT);

        let validConditionValueArr = makeValidConditionValueArr(conditionInput);  // 有効な条件
        const myConditionValuesAfter = _.cloneDeep(conditionInput.conditionValues);

        if (detailObj['除外条件']) {
            for (const delCondition of detailObj['除外条件']) {
                let work = delCondition;
                if (_.isPlainObject(delCondition)) {
                    work = delCondition.名前;
                }
                if (work in myConditionValuesAfter) {
                    if (isNumeric(myConditionValuesAfter[work])) {
                        myConditionValuesAfter[work] = 0;
                    } else if (_.isBoolean(myConditionValuesAfter[work])) {
                        myConditionValuesAfter[work] = false;
                    }
                }
            }
        }
        if (detailObj['適用条件']) {
            for (const addCondition of detailObj['適用条件']) {
                if (_.isString(addCondition)) {
                    if (addCondition in myConditionValuesAfter) {
                        if (_.isBoolean(myConditionValuesAfter[addCondition])) {
                            myConditionValuesAfter[addCondition] = true;
                        }
                    }
                } else if (_.isPlainObject(addCondition)) {
                    if (addCondition.名前 in myConditionValuesAfter) {
                        let newValue = myConditionValuesAfter[addCondition.名前];
                        if ('数値' in addCondition) {
                            if (_.isString(addCondition.数値)) {
                                const work = String(addCondition.数値).replace(/^\+/, '');
                                (newValue as number) += Number(work);
                            } else if (isNumeric(addCondition.数値)) {
                                newValue = addCondition.数値;
                            } else {
                                newValue = addCondition.数値;
                            }
                            if (newValue !== null && isNumeric(newValue)) {
                                if ((newValue as number) < 0) {
                                    newValue = 0;
                                } else {
                                    conditionInput.selectList.filter(s => s.name == addCondition.名前).forEach(entry => {
                                        if (newValue !== null && (newValue as number) >= entry.options.length) {
                                            newValue = entry.options.length - 1;
                                        }
                                    })
                                }
                            }
                        } else {
                            newValue = true;
                        }
                        myConditionValuesAfter[addCondition.名前] = newValue;
                    }
                    if (addCondition.説明) {
                        if (Array.isArray(addCondition.説明)) {
                            addCondition.説明.forEach((desc: string) => {
                                if (!damageResult['キャラクター注釈'].includes(desc)) {
                                    damageResult['キャラクター注釈'].push(desc);
                                }
                            })
                        } else {
                            const desc = addCondition.説明;
                            if (!damageResult['キャラクター注釈'].includes(desc)) {
                                damageResult['キャラクター注釈'].push(desc);
                            }
                        }
                    }
                }
            }
        }
        if (detailObj['除外条件'] || detailObj['適用条件']) {
            const myConditionInputAfter: TConditionInput = _.cloneDeep(conditionInput);
            myConditionInputAfter.conditionValues = myConditionValuesAfter;
            const validConditionValueArrAfter = makeValidConditionValueArr(myConditionInputAfter);

            [characterInput.damageDetailMyCharacter, characterInput.damageDetailMyWeapon, characterInput.damageDetailMyArtifactSets].forEach(damageDetail => {
                if (!damageDetail) return;
                damageDetail.ステータス変更系詳細.filter(s => s.条件).forEach(damageDetailObj => {
                    if (damageDetailObj.数値 === null) {
                        return;
                    }
                    const conditionStr = damageDetailObj.条件 as string;
                    const matchesBefore = checkConditionMatches(conditionStr, validConditionValueArr, constellation, statsObj, conditionInput.conditionValues);
                    const matchesAfter = checkConditionMatches(conditionStr, validConditionValueArrAfter, constellation, statsObj, conditionInput.conditionValues);
                    if (matchesBefore == matchesAfter) {
                        return;
                    }
                    let valueBefore = 0;
                    let valueAfter = 0;
                    let before数値 = damageDetailObj.数値;
                    if (before数値.includes('${INDEX}')) {
                        before数値 = before数値.replaceAll('${INDEX}', String(matchesBefore));
                    } else if (matchesBefore !== 0) {
                        before数値 = '(' + before数値 + ')*' + matchesBefore;
                    } else {
                        before数値 = '0';
                    }
                    valueBefore = evalFormula(before数値, statsObj, damageResult, damageDetailObj.上限, damageDetailObj.下限);
                    let after数値 = damageDetailObj.数値;
                    if (after数値.includes('${INDEX}')) {
                        after数値 = after数値.replaceAll('${INDEX}', String(matchesAfter));
                    } else if (matchesAfter !== 0) {
                        after数値 = '(' + after数値 + ')*' + matchesAfter;
                    } else {
                        after数値 = '0';
                    }
                    valueAfter = evalFormula(after数値, statsObj, damageResult, damageDetailObj.上限, damageDetailObj.下限);
                    const diff = valueAfter - valueBefore;
                    if (diff) {
                        let new種類 = damageDetailObj.種類 as string;
                        if (damageDetailObj.対象) {
                            new種類 += '.' + damageDetailObj.対象;
                        }
                        if (new種類 in myステータス補正) {
                            myステータス補正[new種類] += diff;
                        } else {
                            myステータス補正[new種類] = diff;
                        }
                    }
                })
            })

            validConditionValueArr = validConditionValueArrAfter;
        }

        const myTalentChangeDetailObjArr = [] as any[];
        if (talentChangeDetailObjArr) {
            // 対象指定ありのダメージ計算（主に加算）を適用したい
            talentChangeDetailObjArr.forEach(valueObj => {
                let number = null;
                if (valueObj.条件) {
                    number = checkConditionMatches(valueObj.条件, validConditionValueArr, constellation, statsObj, conditionInput.conditionValues);
                    if (number === 0) {
                        return;
                    }
                }
                if (valueObj.対象) {
                    if (valueObj.対象.endsWith('元素ダメージ')) {    // for 申鶴
                        if (!valueObj.対象.startsWith(my元素)) {
                            return;
                        }
                    } else if (valueObj.対象 == '物理ダメージ') {
                        if (my元素 != '物理') {
                            return;
                        }
                    } else {
                        // 大分類 or 大分類.小分類
                        const myダメージ種類 = detailObj.種類;
                        const my対象カテゴリArr = valueObj.対象.split('.');
                        if (my対象カテゴリArr[0] != myダメージ種類) {
                            return;
                        }
                        if (my対象カテゴリArr.length > 1 && my対象カテゴリArr[my対象カテゴリArr.length - 1] != detailObj.名前) {
                            return;
                        }
                    }
                }
                if (valueObj['種類'].endsWith('元素付与')) {   // 元素付与は先んじて適用します
                    if (['通常攻撃ダメージ', '重撃ダメージ', '落下攻撃ダメージ'].includes(detailObj.種類)) {
                        if (!detailObj['元素付与無効']) {
                            my元素 = valueObj['種類'].replace('元素付与', '');
                        }
                    }
                } else if (valueObj.種類 == '防御無視') {   // 防御無視は先んじて適用します for 雷電将軍
                    const myValue = evalFormula(valueObj.数値, statsObj, damageResult, valueObj.上限, valueObj.下限);
                    my防御無視 += myValue;
                } else if (valueObj.種類 == '固有変数') {
                    // nop
                } else {
                    if (number != null && number != 1) {    // オプションの@以降の数値でスケールする場合あり
                        const myNewValueObj = JSON.parse(JSON.stringify(valueObj)); // _.cloneDeep
                        if (_.isString(myNewValueObj.数値)) {
                            myNewValueObj.数値 += '*' + number;
                        } else if (_.isArray(myNewValueObj.数値)) {
                            myNewValueObj.数値 = myNewValueObj.数値.concat(['*', number]);
                        }
                        myTalentChangeDetailObjArr.push(myNewValueObj);
                    } else {
                        myTalentChangeDetailObjArr.push(valueObj);
                    }
                }
            });
        }

        // 対象指定ありのステータスアップを適用したい
        const tempStatsObj: TStats = {};
        [statsObj, myステータス補正].forEach(entryObj => {
            Object.keys(entryObj).forEach(stat => {
                const tempArr = stat.split('.');
                if (tempArr.length == 1) return;
                let isValid = false;
                if (tempArr[1] == detailObj.種類) {
                    if (tempArr.length == 2) {
                        isValid = true;
                    } else if (tempArr[2] == detailObj.名前) {
                        if (tempArr.length == 3) {
                            isValid = true;
                        }
                    }
                } else if (tempArr[1] == (my元素 + '元素ダメージ')) {
                    if (tempArr.length == 2) {
                        isValid = true;
                    }
                } else if (tempArr[1] == '物理ダメージ' && my元素 == '物理') {
                    if (tempArr.length == 2) {
                        isValid = true;
                    }
                }
                if (isValid) {
                    const toStat = tempArr[0];
                    if (toStat in tempStatsObj) {
                        if (toStat == '別枠乗算' && tempStatsObj[toStat] > 0) {
                            tempStatsObj[toStat] *= entryObj[stat] / 100;   // for ディオナ
                        } else {
                            tempStatsObj[toStat] += entryObj[stat];
                        }
                    } else {
                        tempStatsObj[toStat] = entryObj[stat];
                    }
                }
            })
        })
        Object.keys(tempStatsObj).forEach(stat => {
            if (stat in myステータス補正) {
                if (stat.startsWith('別枠乗算') && myステータス補正[stat] > 0) {
                    myステータス補正[stat] *= tempStatsObj[stat] / 100;   // for ディオナ
                } else {
                    myステータス補正[stat] += tempStatsObj[stat];
                }
            } else {
                myステータス補正[stat] = tempStatsObj[stat];
            }
        });

        // for 来歆の余響 「ダメージを与えた0.05秒後にクリアされる」
        const damageDetailMyArtifactSets = characterInput.damageDetailMyArtifactSets;
        if (damageDetailMyArtifactSets) {
            if (detailObj.種類 == '通常攻撃ダメージ' && detailObj.HIT数 > 1
                && characterInput.artifactSets[0] == '来歆の余響' && characterInput.artifactSets[1] == '来歆の余響') {
                let isValid = false;
                for (const valueObj of damageDetailMyArtifactSets[CHANGE_KIND_STATUS].filter(s => s.条件 && s.種類 && s.数値)) {
                    const my種類 = valueObj.種類 as string; // 通常攻撃ダメージアップ
                    const my条件 = valueObj.条件 as string;
                    const myHIT数 = detailObj.HIT数;
                    if (checkConditionMatches(my条件, validConditionValueArr, constellation, statsObj, conditionInput.conditionValues) !== 0) {
                        const my数値 = valueObj.数値;
                        const myValue = evalFormula(my数値, statsObj, damageResult, valueObj.上限, valueObj.下限);
                        if (!(my種類 in myステータス補正)) {
                            myステータス補正[my種類] = 0;
                        }
                        myステータス補正[my種類] -= myValue * (myHIT数 - Math.max(1, Math.floor(myHIT数 / 2))) / myHIT数;
                        isValid = true;
                    }
                }
                if (isValid) {
                    const description = '来歆の余響4セット効果の幽谷祭祀のダメージアップは多段HITダメージの全てには乗らない。3HIT以下：1回分、4HIT：2回分を計上する';
                    if (!damageResult['キャラクター注釈'].includes(description)) {
                        damageResult['キャラクター注釈'].push(description);
                    }
                }
            }
        }

        // 一時的にステータスを書き換えます。
        Object.keys(myステータス補正).forEach(stat => {
            if (stat in statsObj) {
                if (stat.startsWith('別枠乗算') && statsObj[stat] > 0) {
                    statsObj[stat] *= myステータス補正[stat];
                } else {
                    statsObj[stat] += myステータス補正[stat];
                }
            } else {
                statsObj[stat] = myステータス補正[stat];
            }
        });

        if (statsObj['別枠乗算']) {
            my別枠乗算 = statsObj['別枠乗算'];
        }

        switch (detailObj.種類) {
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
                if (!['炎', '水', '雷', '氷'].includes(my元素)) {
                    my元素 = '炎';
                }
                break;
            case 'HP消費':  // for リネ リネット
                is会心Calc = false;
                is防御補正Calc = false;
                is耐性補正Calc = false;
                my元素 = null;
                break;
            default:
                if (detailObj.種類.startsWith('表示') || detailObj.種類.startsWith('非表示')) {
                    is会心Calc = false;
                    is防御補正Calc = false;
                    is耐性補正Calc = false;
                    my元素 = null;
                } else {
                    myバフArr.push('与えるダメージ');
                    if (detailObj.ダメージバフ != 'NONE') {  // for コレイ
                        if (detailObj.ダメージバフ) {
                            myバフArr.push(detailObj.ダメージバフ);
                        } else if (DAMAGE_CATEGORY_ARRAY.includes(detailObj.種類)) {
                            myバフArr.push(detailObj.種類 + 'バフ');
                        }
                    }
                    if (my元素) {
                        myバフArr.push(my元素 == '物理' ? '物理ダメージバフ' : my元素 + '元素ダメージバフ');
                    }
                }
                break;
        }
        let my計算Result: TDamageResultEntry;
        if (detailObj.種類.startsWith('月') && detailObj.種類.endsWith('反応ダメージ')) {   // for イネファ
            my計算Result = calculateDamageFromDetailSubLunar(statsObj, damageResult, detailObj.数値, detailObj.種類, my元素);
        } else {
            my計算Result = calculateDamageFromDetailSub(statsObj, damageResult, detailObj.数値, myバフArr, is会心Calc, is防御補正Calc, is耐性補正Calc, my元素, my防御無視, my別枠乗算, detailObj.上限, detailObj.下限);
        }

        myTalentChangeDetailObjArr.forEach(valueObj => {
            const myResultWork = calculateDamageFromDetailSub(statsObj, damageResult, valueObj.数値, myバフArr, is会心Calc, is防御補正Calc, is耐性補正Calc, my元素, my防御無視, null, valueObj.上限, valueObj.下限);
            if (valueObj.種類.endsWith('ダメージアップ')) {  // 実数ダメージ加算
                if (detailObj.名前 == 'ダメージアップ') return;  // for 申鶴
                if (DAMAGE_CATEGORY_ARRAY.includes(detailObj.種類)) {
                    // 複数回HITするダメージについては、HIT数を乗算します
                    if (myHIT数 > 1) {
                        myResultWork[2] *= myHIT数;
                        if (myResultWork[3] != null) {
                            myResultWork[3] *= myHIT数;
                        }
                        myResultWork[4] *= myHIT数;
                    }
                }
            }
            my計算Result[2] += myResultWork[2];
            if (my計算Result[3] != null && myResultWork[3]) {
                my計算Result[3] += myResultWork[3];
            }
            my計算Result[4] += myResultWork[4];
        });

        // ステータスによる実数ダメージ加算を計算します
        if ([...DAMAGE_CATEGORY_ARRAY, 'その他ダメージ'].includes(detailObj.種類)) {
            let myダメージ種類 = detailObj.種類;
            if (detailObj.ダメージバフ) {    // for 夢想の一心状態の時、雷電将軍の通常攻撃、重撃、落下攻撃のダメージは元素爆発ダメージと見なす
                const temp = detailObj.ダメージバフ.replace(/バフ$/, '');
                if (DAMAGE_CATEGORY_ARRAY.includes(temp)) {
                    myダメージ種類 = temp;
                }
            }

            const dmgUpStatArr = [];
            dmgUpStatArr.push(myダメージ種類 + 'アップ');
            if (my元素) {
                dmgUpStatArr.push(my元素 == '物理' ? '物理ダメージアップ' : my元素 + '元素ダメージアップ');
            }
            dmgUpStatArr.forEach(dmgUpStat => {
                if (!statsObj[dmgUpStat]) return;
                if (!is防御補正Calc || !is耐性補正Calc) return;

                if (detailObj.名前.startsWith('非表示_狼の魂基礎')) return;    // for レザー

                const myResultWork = calculateDamageFromDetailSub(statsObj, damageResult, statsObj[dmgUpStat], myバフArr, is会心Calc, is防御補正Calc, is耐性補正Calc, my元素, my防御無視, null);
                // 複数回HITするダメージについては、HIT数を乗算します
                if (myHIT数 > 1) {
                    myResultWork[2] *= myHIT数;
                    if (myResultWork[3] != null) {
                        myResultWork[3] *= myHIT数;
                    }
                    myResultWork[4] *= myHIT数;
                }
                my計算Result[2] += myResultWork[2];
                if (my計算Result[3] != null && myResultWork[3]) {
                    my計算Result[3] += myResultWork[3];
                }
                my計算Result[4] += myResultWork[4];
            });
        }

        // 書き換えたステータスを元に戻します。
        Object.keys(myステータス補正).forEach(statName => {
            statsObj[statName] -= myステータス補正[statName];
        });

        if (detailObj.種類 == 'シールド') {
            if (my計算Result[1] == '岩') {  // 岩元素シールド for ノエル 鍾離
                my計算Result[2] = my計算Result[2] * 1.5;
                my計算Result[4] = my計算Result[4] * 1.5;
            }
        }

        const resultArr = [detailObj.名前, my計算Result[1], my計算Result[2], my計算Result[3], my計算Result[4], detailObj.種類, detailObj.HIT数, my計算Result[7], my計算Result[8]] as TDamageResultEntry;
        console.debug(resultArr);
        return resultArr;
    } catch (error) {
        console.error(error);
        console.error(detailObj, characterInput, conditionInput, statsObj, opt_element);
        throw error;
    }
}

/**
 * 計算式内の参照有無を求めます
 */
export function isUseReference(formula: number | string) {
    return _.isString(formula) && formula.includes('#');
}

function calculateDamageFromDetailSub(
    statsObj: TStats,
    damageResult: TDamageResult,
    formula: number | string,
    buffArr: Array<string> | null,
    is会心Calc: boolean,
    is防御補正Calc: boolean,
    is耐性補正Calc: boolean,
    元素: string,
    防御無視: number,
    別枠乗算: number | null,
    opt_max: number | string | null = null,
    opt_min: number | string | null = null
): TDamageResultEntry {
    const myダメージ基礎値 = evalFormula(formula, statsObj, damageResult, opt_max, opt_min);
    let myダメージ = myダメージ基礎値;

    if (別枠乗算) { // 別枠乗算 for 宵宮
        myダメージ *= 別枠乗算 / 100;
    } else {
        別枠乗算 = 1;
    }

    // 計算済みの値を参照する場合は、バフと防御、耐性補正の計算を省略します
    if (isUseReference(formula)) {
        buffArr = null;
        is防御補正Calc = false;
        is耐性補正Calc = false;
    }

    let myダメージバフ補正 = 1;
    if (buffArr) {
        myダメージバフ補正 = 100;   // percent
        buffArr.forEach(buff => {
            if (statsObj[buff]) {
                myダメージバフ補正 += statsObj[buff];
            }
        });
        myダメージバフ補正 = myダメージバフ補正 / 100;
        myダメージ *= myダメージバフ補正;
    }

    let my防御補正 = 1;
    if (is防御補正Calc) {
        my防御補正 = calculateEnemyDef(statsObj, 防御無視);
        myダメージ *= my防御補正;
    }

    let my耐性補正 = 1;
    if (is耐性補正Calc && 元素) {
        my耐性補正 = calculateEnemyRes(元素, statsObj);
        myダメージ *= my耐性補正;
    }

    let my会心率 = statsObj['会心率'];
    if (元素 == '物理') {
        if ('物理ダメージ会心率' in statsObj) {
            my会心率 += statsObj['物理ダメージ会心率'];
        }
    } else if ((元素 + '元素ダメージ会心率') in statsObj) {
        my会心率 += statsObj[元素 + '元素ダメージ会心率'];
    }
    my会心率 = Math.min(100, Math.max(0, my会心率)) / 100;    // 0≦会心率≦1

    let my会心ダメージ = statsObj['会心ダメージ'];
    if (元素 == '物理') {
        if ('物理ダメージ会心ダメージ' in statsObj) {
            my会心ダメージ += statsObj['物理ダメージ会心ダメージ'];
        }
    } else if ((元素 + '元素ダメージ会心ダメージ') in statsObj) {
        my会心ダメージ += statsObj[元素 + '元素ダメージ会心ダメージ'];
    }
    my会心ダメージ = (100 + my会心ダメージ) / 100;

    let my会心Result = null;
    let my期待値Result = myダメージ;
    if (is会心Calc && my会心率 > 0) {
        my会心Result = myダメージ * my会心ダメージ;
        my期待値Result = (my会心Result * my会心率) + (myダメージ * (1 - my会心率));
    }

    console.debug('別枠乗算[%f] ダメージバフ補正[%o=%f] 会心[%f,%f] 防御補正[%f] 耐性補正[%f]', 別枠乗算, buffArr, myダメージバフ補正, my会心率, my会心ダメージ, my防御補正, my耐性補正);
    return ['未設定', 元素, my期待値Result, my会心Result, myダメージ, null, null, myダメージバフ補正, my防御補正];
}

function calculateDamageFromDetailSubLunar(
    statsObj: TStats,
    damageResult: TDamageResult,
    formula: number | string,
    kind: string,
    dmgElement: string,
): TDamageResultEntry {
    const myダメージ基礎値 = evalFormula(formula, statsObj, damageResult, null, null);
    const workKind = kind.replace('反応ダメージ', '');
    const baseDmgUp = statsObj[workKind + '反応基礎ダメージアップ'] ?? 0;
    const em = statsObj['元素熟知'] ?? 0;
    const emBonus = (6 * em) / (em + 2000);
    const otherBonus = statsObj[workKind + '反応ボーナス'] ?? 0;

    let multiplier = 1;
    if (workKind == '月感電') {
        multiplier = 3;
    }
    let myダメージ = multiplier * myダメージ基礎値 * (1 + baseDmgUp / 100) * (1 + emBonus + otherBonus / 100);

    const my耐性補正 = calculateEnemyRes(dmgElement, statsObj);
    myダメージ *= my耐性補正;

    let my会心率 = statsObj['会心率'];
    my会心率 += statsObj[dmgElement + '元素ダメージ会心率'] || 0;
    my会心率 = Math.min(100, Math.max(0, my会心率)) / 100;    // 0≦会心率≦1

    let my会心ダメージ = statsObj['会心ダメージ'];
    my会心ダメージ += statsObj[dmgElement + '元素ダメージ会心ダメージ'] || 0;
    my会心ダメージ = (100 + my会心ダメージ) / 100;

    let my会心Result = null;
    let my期待値Result = myダメージ;
    if (my会心率 > 0) {
        my会心Result = myダメージ * my会心ダメージ;
        my期待値Result = (my会心Result * my会心率) + (myダメージ * (1 - my会心率));
    }

    return ['未設定', dmgElement, my期待値Result, my会心Result, myダメージ, null, null, null, null];
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

/**
 * ステータスを更新します
 */
function updateStats(
    statsObj: TStats,
    statName: string,
    formulaArr: number | string,
    opt_max: number | string | null = null,
    opt_min: number | string | null = null,
) {
    const value = evalFormula(formulaArr, statsObj, DAMAGE_RESULT_TEMPLATE, opt_max, opt_min);    // DAMAGE_RESULT_TEMPLATEは参照しない想定なのでダミーです
    if (!isNumeric(value)) {
        console.error(statsObj, statName, formulaArr, value);
    }
    const nameArr = [];
    if (statName == 'HP') {
        nameArr.push('HP上限');
    } else if (statName.startsWith('自元素')) {
        nameArr.push(statName.replace(/^自/, String(statsObj['元素'])));
    } else if (statName.startsWith('全元素')) {
        ALL_ELEMENTS.forEach(entry => {
            nameArr.push(statName.replace(/^全/, entry));
        });
    } else if (statName.startsWith('敵自元素')) {
        nameArr.push(statName.replace(/^敵自/, '敵' + String(statsObj['元素'])));
    } else if (statName.startsWith('敵全元素')) {
        ALL_ELEMENTS.forEach(entry => {
            nameArr.push(statName.replace(/^敵全/, '敵' + entry));
        });
    } else {
        nameArr.push(statName);
    }
    const diffStats = {} as { [key: string]: number };
    nameArr.forEach(name => {
        diffStats[name] = value;
    });
    for (const name of Object.keys(diffStats)) {
        if (name in statsObj) {
            if (name.startsWith('別枠乗算') && diffStats[name] > 0) {
                statsObj[name] *= diffStats[name] / 100;    // for ディオナ
            } else {
                statsObj[name] += diffStats[name];
            }
        } else {
            statsObj[name] = diffStats[name];
        }
    }
    console.debug(updateStats.name, null, statName, formulaArr, '=>', diffStats);
    return diffStats;
}

/** 被ダメージを計算します */
function calculateDamageTaken(statsObj: TStats, damage: number, element: string) {
    const def = statsObj['防御力'];
    const enemyLevel = statsObj['敵レベル'];
    const dmgReduction = statsObj['ダメージ軽減'];
    const res = calculateRes(statsObj[element == '物理' ? '物理耐性' : element + '元素耐性']);
    let result = damage * (1 - def / (def + 5 * enemyLevel + 501)) * (100 - dmgReduction) / 100 * res;
    result = Math.max(0, result);
    return result;
}

// function flattenArray(value: any) {
//     const result: any[] = [];
//     if (Array.isArray(value)) {
//         value.forEach(e => {
//             if (Array.isArray(e)) {
//                 result.push(...flattenArray(e));
//             } else {
//                 result.push(e);
//             }
//         });
//     }
//     return result;
// }

export function calculateArtifactScore(
    characterInput: TCharacterInput,
    artifactDetailInput: TArtifactDetailInput,
    scoringStats: [string, number][]
) {
    let result = 0;
    for (const scoringStat of scoringStats) {
        const stat = scoringStat[0];
        const magnification = scoringStat[1];
        const statValue = (artifactDetailInput.聖遺物ステータスサブ効果 as any)[stat];
        if (statValue) {
            result += statValue * magnification;
        }
    }
    return result;
}

export function calculateStatsTop(
    statsObj: TStats,
    optionInput: TOptionInput,
) {
    ステータスチーム内最高ARRAY.forEach(stat => {
        const srcStat = stat.replace(/TOP$/, 'X7');
        let srcStatValue = getStatValue(srcStat, statsObj);
        if (srcStatValue) {
            statsObj[stat] = srcStatValue;
        }
        for (const member of optionInput.teamMembers) {
            const calculatedSupporter = optionInput.supporters[member];
            if (!calculatedSupporter?.statsInput?.statsObj) continue;
            srcStatValue = getStatValue(srcStat, calculatedSupporter.statsInput.statsObj);
            if (srcStatValue !== undefined) {
                if (statsObj[stat] < srcStatValue) {
                    statsObj[stat] = srcStatValue;
                }
            }
        }
    });
}

export async function setupTeamOptionSupporter(
    optionInput: TOptionInput,
    supporter: TCharacterKey,
    build?: string,
    character?: TCharacterKey,
): Promise<[TStats, TDamageResult]> {
    const characterInput = getDefaultCharacterInput();
    const artifactDetailInput = getDefaultArtifactDetailInput();
    const conditionInput = getDefaultConditionInput();
    const statsInput = getDefaultStatsInput();
    const damageResult = getDefaultDamageResultInput();
    const optionDetails1: TDamageDetailObj[] = [];
    const optionDetails2: TDamageDetailObj[] = [];
    const conditionMap = new Map<string, string[] | object | null>();
    const exclusionMap = new Map<string, string[]>();

    characterInput.character = supporter;
    characterInput.characterMaster = await getCharacterMasterDetail(characterInput.character);

    if (build) {
        const builddata = JSON.parse(build);

        await loadRecommendation(characterInput, artifactDetailInput, conditionInput, optionInput, builddata);
        makeDamageDetailObjArrObjCharacter(characterInput);
        makeDamageDetailObjArrObjWeapon(characterInput);
        makeDamageDetailObjArrObjArtifactSets(characterInput);
        setupConditionValues(conditionInput, characterInput, optionInput);
        calculateArtifactStatsMain(artifactDetailInput.聖遺物ステータスメイン効果, artifactDetailInput.聖遺物メイン効果);
        calculateArtifactStats(artifactDetailInput);
        if (optionInput.elementalResonance) {
            optionInput.elementalResonance.conditionAdjustments = calculateElementalResonance(optionInput.elementalResonance.conditionValues, conditionInput);
        }
        calculateStats(statsInput, characterInput, artifactDetailInput, conditionInput, optionInput);
        updateNumberConditionValues(conditionInput, characterInput, statsInput.statsObj);
        calculateStats(statsInput, characterInput, artifactDetailInput, conditionInput, optionInput);

        if (character && characterInput.character === '雷電将軍') {
            // for 雷罰悪曜の眼
            const myCharacterMaster = await getCharacterMasterDetail(character);
            if ('元素エネルギー' in myCharacterMaster['元素爆発']) {
                statsInput.statsObj['元素エネルギー'] = Number(myCharacterMaster['元素爆発']['元素エネルギー']);
            }
        }

        calculateDamageResult(damageResult, characterInput, conditionInput, statsInput);
    }

    // TEAM_OPTION_MASTER
    const teamOptions: any[] = [];
    TEAM_OPTION_MASTER_LIST.filter(entry => entry.key.startsWith(supporter + '_')).forEach(entry => {
        if (_.isArray(entry.詳細)) {
            for (const detailObj of entry.詳細) {
                (detailObj as any).条件 = makeSupporterCondition(supporter, entry.名前, (detailObj as any).条件);
            }
        }
        teamOptions.splice(teamOptions.length, 0, ...makeDamageDetailObjArr(entry, null, null, null, optionDetails1, optionDetails2, 'その他オプション'));
    })
    teamOptions.filter((s) => s.条件).forEach((detailObj) => {
        makeConditionExclusionMapFromStr(detailObj.条件 as string, conditionMap, exclusionMap);
    })
    optionDetails1.filter((s) => s.条件).forEach((detailObj) => {
        makeConditionExclusionMapFromStr(detailObj.条件 as string, conditionMap, exclusionMap);
    })
    optionDetails2.filter((s) => s.条件).forEach((detailObj) => {
        makeConditionExclusionMapFromStr(detailObj.条件 as string, conditionMap, exclusionMap);
    })
    conditionMap.forEach((value, key) => {
        if (value && _.isArray(value)) {
            if (!value[0].startsWith('required_')) {
                conditionMap.set(key, ['', ...value]);
            }
        }
    })
    // CHARACTER_MASTER
    let characterOptions: any[] = [];
    if (characterInput.characterMaster?.チームバフ) {
        characterOptions = characterInput.characterMaster.チームバフ;
    }
    // WEAPON_MASTER
    let weaponOptions: any[] = [];
    if (characterInput.weaponMaster?.チームバフ) {
        weaponOptions = characterInput.weaponMaster.チームバフ;
    }
    // ARTIFACT_SET_MASTER
    const vision = characterInput.characterMaster.元素;
    const elementalReactionArr = Object.keys((ELEMENTAL_REACTION_MASTER as any)[vision]);
    if (['水', '氷'].includes(vision) && !elementalReactionArr.includes('凍結')) {
        elementalReactionArr.push('凍結');
    }
    const artifactSetOptions: any[] = [];
    if (characterInput.artifactSets[0] && characterInput.artifactSets[1] && characterInput.artifactSets[0] == characterInput.artifactSets[1]) {
        if (characterInput.artifactSetMasters[0]['4セット効果']) {
            if (_.isArray(characterInput.artifactSetMasters[0]['4セット効果']['詳細'])) {
                characterInput.artifactSetMasters[0]['4セット効果']['詳細'].forEach(detailObj => {
                    if (detailObj.チーム) {
                        if (_.isString(detailObj.条件)) {
                            detailObj.条件 = detailObj.条件.replace('拡散', '翠緑の影');
                            if (detailObj.条件.startsWith('灰燼の都に立つ英雄の絵巻')) { // for 灰燼の都に立つ英雄の絵巻
                                if (elementalReactionArr.filter(s => detailObj['条件'].startsWith('灰燼の都に立つ英雄の絵巻=' + s)).length === 0) {
                                    return;
                                }
                            }
                        }
                        artifactSetOptions.push(detailObj);
                    }
                })
            }
        }
    }
    for (const options of [characterOptions, weaponOptions, artifactSetOptions]) {
        if (options.length) {
            const damageDetailObjArr = makeTeamOptionDetailObjArr(options);
            damageDetailObjArr.forEach((damageDetailObj) => {
                const condition = makeSupporterCondition(supporter, damageDetailObj.名前, damageDetailObj.条件);
                damageDetailObj.条件 = condition;
                const changeKind = getChangeKind(damageDetailObj.種類 as string);
                if (changeKind === 'STATUS' &&
                    optionDetails1.filter((s) => s.条件 == condition && s.種類 == damageDetailObj.種類).length === 0
                ) {
                    optionDetails1.splice(optionDetails1.length, 0, damageDetailObj);
                }
                if (changeKind === 'TALENT' &&
                    optionDetails2.filter((s) => s.条件 == condition && s.種類 == damageDetailObj.種類).length === 0
                ) {
                    optionDetails2.splice(optionDetails2.length, 0, damageDetailObj);
                }
                makeConditionExclusionMapFromStr(condition, conditionMap, exclusionMap);
            })
        }
    }

    optionInput.supporters[supporter] = {
        characterInput: characterInput,
        artifactDetailInput: artifactDetailInput,
        conditionInput: conditionInput,
        statsInput: statsInput,
        damageResult: damageResult,
        optionDetails1: optionDetails1,
        optionDetails2: optionDetails2,
        conditionMap: conditionMap,
        exclusionMap: exclusionMap,
    };

    return [statsInput.statsObj, damageResult];
}

function makeSupporterCondition(supporter: string, name: string | null, condition: string | null | undefined) {
    let result = supporter + '*';
    if (condition) {
        result += condition.replace(/([&|^])/g, '$1' + supporter + '*');
    } else if (name) {
        result += name;
    }
    result = result.replace(supporter + '*' + supporter + '*', supporter + '*');
    return result;
}

export function calculateConditionAdjustments(
    stats: TStats,
    damageDetailObjs: TDamageDetailObj[] | undefined,
    validConditionValueArr: string[],
    refStats: TStats,
    damageResult: TDamageResult,
    constellation = 6,
) {
    if (damageDetailObjs === undefined) {
        return;
    }
    for (const detailObj of damageDetailObjs) {
        let my数値 = detailObj.数値;
        if (my数値 === null) {
            continue;
        }
        if (detailObj.条件) {
            const number = checkConditionMatches(detailObj.条件, validConditionValueArr, constellation, refStats);
            if (number === 0) continue;
            if (my数値.includes('${INDEX}')) {
                my数値 = my数値.replaceAll('${INDEX}', String(number));
            } else {
                my数値 = '(' + my数値 + ')*' + number;
            }
        }
        const myValue = evalFormula(my数値, refStats, damageResult, detailObj.上限, detailObj.下限);
        const kinds = [] as string[];
        if (detailObj.種類) {
            if (detailObj.種類.startsWith('全') || detailObj.種類.startsWith('敵全')) {
                for (const elem of ALL_ELEMENTS) {
                    kinds.push(detailObj.種類.replace('全', elem));
                }
            } else {
                kinds.push(detailObj.種類);
            }
        }
        for (const kind of kinds) {
            let tempKind = kind;
            if (detailObj.対象) {
                tempKind += '.' + detailObj.対象;
            }
            if (tempKind in stats) {
                stats[tempKind] += myValue;
            } else {
                stats[tempKind] = myValue;
            }
        }
    }
}

const TEAM_OPTION_NOT_UNIQUE_ARR = ['千夜に浮かぶ夢', 'サイフォスの月明かり', 'マカイラの水色', '彷徨える星'];

export function calculateTeamStatsAdjustments(optionInput: TOptionInput, topStats: TStats, character: string) {
    const result = {} as TStats;
    const validConditionValueArr: string[] = [];
    makeValidConditionValueArr(optionInput.teamOption).forEach(value => {
        const indexOf = value.indexOf('*');
        const supporter = value.substring(0, indexOf);
        if (supporter != character) {
            const work = value.substring(indexOf);
            if (TEAM_OPTION_NOT_UNIQUE_ARR.includes(work.substring(1)) || validConditionValueArr.filter(s => s.endsWith(work)).length === 0) {
                validConditionValueArr.push(value);
            }
        }
    })
    Object.keys(optionInput.supporters).filter(supporter => supporter != character).forEach(supporter => {
        const workInput = optionInput.supporters[supporter];
        let statsObj = workInput ? workInput.statsInput.statsObj : ステータスTEMPLATE;
        if (Object.keys(topStats).length) {
            statsObj = _.cloneDeep(statsObj);
            Object.keys(topStats).forEach(stat => { // チーム内で最も高いステータスをセットします
                statsObj[stat] = topStats[stat];
            })
        }
        const damageResult = workInput ? workInput.damageResult : DAMAGE_RESULT_TEMPLATE;
        [
            optionInput.supporters[supporter]?.optionDetails1,
            optionInput.supporters[supporter]?.optionDetails2,
        ].forEach(optionDetails => {
            calculateConditionAdjustments(result, optionDetails, validConditionValueArr, statsObj, damageResult);
        })
    })
    overwriteObject(optionInput.teamOption.conditionAdjustments, result);
    return result;
}

export function calculateMiscStatsAdjustments(optionInput: TOptionInput) {
    const result = {} as TStats;
    const validConditionValueArr: string[] = [];
    const teamConditionValueArr = makeValidConditionValueArr(optionInput.teamOption);
    makeValidConditionValueArr(optionInput.miscOption).forEach(value => {
        if (teamConditionValueArr.filter(s => s.endsWith('*' + value)).length === 0) {
            validConditionValueArr.push(value);
        }
    });
    const statsObj = ステータスTEMPLATE;
    const damageResult = DAMAGE_RESULT_TEMPLATE;
    [
        optionInput.miscOption.optionDetails1,
        optionInput.miscOption.optionDetails2,
    ].forEach(optionDetails => {
        calculateConditionAdjustments(result, optionDetails, validConditionValueArr, statsObj, damageResult);
    })
    overwriteObject(optionInput.miscOption.conditionAdjustments, result);
    return result;
}

export function getCritFromResultEntry(entry: TDamageResultEntry) {
    let critRate = 0;
    let critDmg = 0;
    if (entry[2] && entry[3] && entry[4]) {
        critRate = entry[2] - entry[4]; // 期待値 - 非会心
        critRate /= entry[3] - entry[4]; // 会心 - 非会心
        critRate = Math.round(critRate * 1000) / 10;
        critDmg = Math.round((entry[3] / entry[4] - 1) * 1000) / 10;
    }
    return [critRate, critDmg];
}

export function getDamageResultArr(
    rotationDamageEntry: TRotationDamageEntry,
    damageResult: TDamageResult,
): TDamageResultEntry[] {
    const result = [] as TDamageResultEntry[];
    const category = rotationDamageEntry.category;
    if (REACTION_DMG_ARR.includes(category)) {
        result.push([
            category,
            REACTION_DMG_ELEMENT_MAP?.get(category) ?? null,
            (damageResult.元素反応 as any)[category],
            null,
            (damageResult.元素反応 as any)[category],
            null,
            1,
            null,
            null,
        ]);
    } else {
        for (let entry of damageResult[category] as TDamageResultEntry[]) {
            if (!entry[0]) continue;
            if (entry[0].startsWith('非表示')) continue;
            if (entry[0].endsWith('合計ダメージ')) continue;
            if (entry[5]?.endsWith('ダメージ')) {
                if (entry[0].startsWith('法獣の灼眼')) {  // 会心した時の追加なので
                    entry = _.cloneDeep(entry);
                    const [critRate] = getCritFromResultEntry(entry);
                    entry[2] = entry[2] * critRate / 100;
                }
                result.push(entry);
            }
        }
    }
    return result;
}

export function calculateRotationDamageEntry(
    rotationDamageEntry: TRotationDamageEntry,
    index: number,
    damageResult: TDamageResult,
) {
    let result = 0;
    const list = getDamageResultArr(rotationDamageEntry, damageResult);
    if (list && list.length > index && rotationDamageEntry.reactions.length > index) {
        const dmgResultEntry = list[index];
        const reactionObj: any = rotationDamageEntry.reactions[index];
        const count = rotationDamageEntry.counts[index];
        const plainDmg = calculateReactedDamage(dmgResultEntry, 2, damageResult.元素反応, ''); // 元素反応なし
        for (let n = 0; n < count; n++) {
            let workDmg = plainDmg;
            ['蒸発', '溶解'].forEach((reaction) => {
                if (reaction in reactionObj && n < reactionObj[reaction]) {
                    workDmg = calculateReactedDamage(dmgResultEntry, 2, damageResult.元素反応, reaction);
                }
            });
            result += workDmg;
        }
        ['超激化', '草激化'].forEach((reaction) => {
            if (reaction in reactionObj) {
                result += calculateReactedDamage(dmgResultEntry, 2, damageResult.元素反応, reaction, reactionObj[reaction]) - plainDmg;
            }
        });
    }
    return result;
}

export function calculateRotationTotalDamage(
    rotationDamageArr: TRotationDamageEntry[],
    damageResult: TDamageResult,
) {
    let result = 0;
    rotationDamageArr.forEach((rotationDamageEntry) => {
        const list = getDamageResultArr(rotationDamageEntry, damageResult);
        for (let i = 0; i < list.length; i++) {
            result += calculateRotationDamageEntry(rotationDamageEntry, i, damageResult);
        }
    });
    return result;
}

/** 元素反応込みのダメージを算出します */
export function calculateReactedDamage(
    dmgResultEntry: TDamageResultEntry,
    dmgIndex: number,
    elementalReaction: TDamageResultElementalReaction,
    reaction: string,
    reactionTimes = 1
) {
    let result = Number(dmgResultEntry[dmgIndex]); // 2:期待値/3:会心/4:非会心
    const dmgElement = dmgResultEntry[1];
    if (reaction && dmgElement) {
        if (['蒸発', '溶解'].includes(reaction)) {
            const reactionKey = reaction + '倍率_' + dmgElement;
            if (reactionKey in elementalReaction) {
                result *= (elementalReaction as any)[reactionKey];
            }
        } else if (['超激化', '草激化'].includes(reaction)) {
            const reactionKey = reaction + 'ダメージ';
            if (reactionKey in elementalReaction) {
                let reactionDmg = (elementalReaction as any)[reactionKey];
                if (dmgResultEntry[2]) {
                    reactionDmg *= result / dmgResultEntry[4]; // ÷ 非会心
                }
                if (dmgResultEntry[7]) {
                    reactionDmg *= dmgResultEntry[7]; // ダメージバフ
                }
                if (dmgResultEntry[8]) {
                    reactionDmg *= dmgResultEntry[8]; // 敵の防御補正
                }
                reactionDmg *= reactionTimes; // 反応回数
                result += reactionDmg;
            }
        }
    }
    return result;
}

export function getAmplifyingReactionElement(reaction: string, dmgElement: string) {
    let reactionElement;
    if (reaction === '蒸発' && dmgElement === '炎') {
        reactionElement = '水';
    } else if (reaction === '蒸発' && dmgElement === '水') {
        reactionElement = '炎';
    } else if (reaction === '溶解' && dmgElement === '炎') {
        reactionElement = '氷';
    } else if (reaction === '溶解' && dmgElement === '氷') {
        reactionElement = '炎';
    } else if (reaction === '超激化' && dmgElement === '雷') {
        reactionElement = '草';
    } else if (reaction === '草激化' && dmgElement === '草') {
        reactionElement = '雷';
    }
    return reactionElement;
}
