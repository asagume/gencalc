import _ from "lodash";
import { deepcopy, overwriteObject } from "@/common";
import { CHANGE_KIND_STATUS, CHANGE_KIND_TALENT, DAMAGE_RESULT_TEMPLATE, getStatValue, NUMBER_CONDITION_VALUE_RE, TArtifactDetailInput, TCharacterInput, TConditionInput, TConditionValues, TDamageResult, TDamageResultEntry, TOptionInput, TStats, TStatsInput, ステータスTEMPLATE, ダメージバフARRAY, 元素ステータス_ダメージARRAY, 元素ステータス_耐性ARRAY, 元素反応TEMPLATE, 元素反応バフARRAY, 基礎ステータスARRAY, 実数ダメージ加算ARRAY, 突破レベルレベルARRAY, 聖遺物サブ効果ARRAY } from "@/input";
import { ARTIFACT_MAIN_MASTER, ARTIFACT_SUB_MASTER, DAMAGE_CATEGORY_ARRAY, ELEMENTAL_REACTION_MASTER, ELEMENTAL_RESONANCE_MASTER, TArtifactMainRarity, TArtifactMainStat } from "@/master";

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
    optionInput: TOptionInput
) {
    if (!characterInput) return;
    if (!artifactDetailInput) return;
    if (!conditionInput) return;
    if (!optionInput) return;

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
        workStatsObj['元素'] = characterMaster.元素;

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

        let 通常攻撃_元素Var = characterMaster.武器 == '法器' ? characterMaster.元素 : '物理';
        let 重撃_元素Var = characterMaster.武器 == '法器' ? characterMaster.元素 : '物理';
        let 落下攻撃_元素Var = characterMaster.武器 == '法器' ? characterMaster.元素 : '物理';

        if (optionInput) {
            // 元素共鳴、チームオプション、その他オプションを計上します
            [optionInput.elementalResonance, optionInput.teamOption, optionInput.miscOption].forEach(optionObj => {
                if (optionObj) {
                    Object.keys(optionObj.conditionAdjustments).forEach(stat => {
                        if (optionObj.conditionAdjustments[stat] === Infinity) {
                            if (stat.endsWith('元素付与')) {
                                if (['片手剣', '両手剣', '長柄武器'].includes(characterMaster.武器)) {
                                    const my付与元素 = stat.replace(/元素付与$/, '');
                                    通常攻撃_元素Var = my付与元素;
                                    重撃_元素Var = my付与元素;
                                    落下攻撃_元素Var = my付与元素;
                                }
                            }
                        }
                        if (stat in workStatsObj) {
                            workStatsObj[stat] += optionObj.conditionAdjustments[stat];
                        } else {
                            workStatsObj[stat] = optionObj.conditionAdjustments[stat];
                        }
                        if (stat.endsWith('V1') || stat.endsWith('V2') || stat.endsWith('V3')) {
                            const toStat = stat.replace(/V[1-3]$/, '');
                            if (toStat in workStatsObj) {
                                workStatsObj[toStat] += optionObj.conditionAdjustments[stat];
                            } else {
                                workStatsObj[toStat] = optionObj.conditionAdjustments[stat];
                            }
                        }
                    })
                }
            })
        }

        const validConditionValueArr = makeValidConditionValueArr(conditionInput);

        // ステータス変化
        const conditionAdjustments = updateStatsWithCondition(characterInput, validConditionValueArr, workStatsObj);

        // 天賦性能変化
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
                let myNew数値 = myDetailObj['数値'];
                if (myDetailObj['条件']) {
                    const number = checkConditionMatches(myDetailObj.条件, validConditionValueArr, constellation);
                    if (number == 0) continue;
                    if (number != 1) {
                        myNew数値 = (myNew数値 as any).concat(['*', number]);
                    }
                    hasCondition = true;
                }
                let myNew種類 = myDetailObj['種類'];
                if (myNew種類) {
                    if (myDetailObj['対象']) {
                        myNew種類 += '.' + myDetailObj['対象'];
                    }
                    if (!statFormulaMap.has(myNew種類)) {
                        statFormulaMap.set(myNew種類, []);
                    }
                    statFormulaMap.get(myNew種類)?.push([myNew種類, myNew数値, myDetailObj.上限, myDetailObj.下限, hasCondition]);
                }
            }
        }
    }

    const hpStatArr = ['基礎HP', 'HP%', 'HP+', 'HP上限'];
    const defStatArr = ['基礎防御力', '防御力%', '防御力+', '防御力'];
    const atkStatArr = ['基礎攻撃力', '攻撃力%', '攻撃力+', '攻撃力'];
    const otherStatArr = [...元素ステータス_ダメージARRAY, ...元素ステータス_耐性ARRAY, ...ダメージバフARRAY, ...実数ダメージ加算ARRAY, ...元素反応バフARRAY, 'ダメージ軽減'];
    otherStatArr.push(...Array.from(statFormulaMap.keys()).filter(s => s.indexOf('ダメージバフ.') != -1));
    otherStatArr.push(...Array.from(statFormulaMap.keys()).filter(s => s.indexOf('ダメージアップ.') != -1));

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
    workStatsObj['HP上限'] += workStatsObj['基礎HP'] + workStatsObj['HP+'];
    workStatsObj['HP上限'] += (workStatsObj['基礎HP'] * workStatsObj['HP%']) / 100;

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
    workStatsObj['防御力'] += workStatsObj['基礎防御力'] + workStatsObj['防御力+'];
    workStatsObj['防御力'] += (workStatsObj['基礎防御力'] * workStatsObj['防御力%']) / 100;

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
    workStatsObj['攻撃力'] += workStatsObj['基礎攻撃力'] + workStatsObj['攻撃力+'];
    workStatsObj['攻撃力'] += (workStatsObj['基礎攻撃力'] * workStatsObj['攻撃力%']) / 100;

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
    formulaKey: string
) {
    for (const formulaArr of [statFormulaMap.get(formulaKey), ...['V1', 'V2', 'V3'].map(s => statFormulaMap.get(formulaKey + s))]) {
        if (!formulaArr) continue;
        formulaArr.forEach(formula => {
            const diffStats = updateStats(workStatsObj, formula[0], formula[1], formula[2], formula[3]);
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
                    if (matchRet == 0) continue;
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
            result["元素熟知"] += Number(conditionValues.dendroOption);
        }
    }
    return result;
}

/** げんかるくスタイルの式データから結果（数値）を計算します */
export function calculateFormulaArray(
    formulaArr: any,
    statsObj: TStats,
    damageResult: TDamageResult,
    opt_max: number | string | Array<number | string> | null = null,
    opt_min: number | string | Array<number | string> | null = null
): number {
    try {
        let result = 0;
        const re = /(.+)X([0-8])$/;
        if (!Array.isArray(formulaArr)) {
            if (_.isNumber(formulaArr)) {
                result = Number(formulaArr);
            } else {
                const temp = getStatValue(formulaArr, statsObj);
                if (temp !== undefined) {
                    result = temp;
                } else {
                    console.error(formulaArr, statsObj, null, opt_max, opt_min);
                }
            }
        } else {
            let operator: string | null = null;
            for (const entry of formulaArr) {
                let subResult = 0;
                if (['+', '-', '*', '/'].includes(entry)) {
                    operator = entry;
                    continue;
                } else if (_.isNumber(entry)) {
                    subResult = Number(entry);
                } else if (Array.isArray(entry)) {
                    subResult = calculateFormulaArray(entry, statsObj, damageResult);
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
                            console.error(formulaArr, statsObj, damageResult, opt_max, opt_min, entry);
                        }
                    }
                } else {
                    const reRet = re.exec(entry);
                    if (reRet) {
                        const stat = reRet[1];
                        if (stat in statsObj) {
                            subResult = statsObj[stat];
                            let n = Number(reRet[2]);
                            if ((n % 2) == 1) {
                                if ((stat + 'V1') in statsObj) {
                                    subResult -= statsObj[stat + 'V1'];
                                }
                            }
                            n = Math.trunc(n / 2);
                            if ((n % 2) == 1) {
                                if ((stat + 'V2') in statsObj) {
                                    subResult -= statsObj[stat + 'V2'];
                                }
                            }
                            n = Math.trunc(n / 2);
                            if ((n % 2) == 1) {
                                if ((stat + 'V3') in statsObj) {
                                    subResult -= statsObj[stat + 'V3'];
                                }
                            }
                        } else {
                            console.error(formulaArr, statsObj, null, opt_max, opt_min);
                        }
                    } else if (entry in statsObj) {
                        subResult = statsObj[entry];
                    } else {
                        console.error(formulaArr, statsObj, null, opt_max, opt_min);
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
            result = Math.min(result, maxValue);
        }
        if (opt_min != null) {
            const minValue = calculateFormulaArray(opt_min, statsObj, damageResult);
            result = Math.max(result, minValue);
        }
        return result;
    } catch (error) {
        console.error(error);
        console.error(formulaArr, statsObj, damageResult, opt_max, opt_min);
        throw error;
    }
}

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
        const reactionResult = deepcopy(元素反応TEMPLATE);
        const reactionMasterArr = [[vision, (ELEMENTAL_REACTION_MASTER as any)[vision]]];
        if (conditionInput.selectList.filter(s => s.name == '元素変化').length) {
            const selectEntry = conditionInput.selectList.filter(s => s.name == '元素変化')[0];
            const selectedIndex = conditionInput.conditionValues['元素変化'] as number;
            if (selectedIndex) {
                const dmgElement = selectEntry.options[selectedIndex].replace(/元素$/, '');
                reactionMasterArr.push([dmgElement, (ELEMENTAL_REACTION_MASTER as any)[dmgElement]]);
            }
        }
        if (conditionInput.selectList.filter(s => s.name == '拡散').length) {
            const selectEntry = conditionInput.selectList.filter(s => s.name == '拡散')[0];
            const selectedIndex = conditionInput.conditionValues['拡散'] as number;
            if (selectedIndex) {
                const dmgElement = selectEntry.options[selectedIndex].replace(/元素$/, '');
                reactionMasterArr.push([dmgElement, (ELEMENTAL_REACTION_MASTER as any)[dmgElement]]);
            }
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
                        case '固定':    // 過負荷 感電 超電導
                            resultValue = calculate固定値系元素反応ダメージ(reaction, element, statsInput.statsObj);
                            break;
                        case '加算':    // 超激化 草激化
                            resultValue = calculate加算系元素反応ダメージ(reaction, element, statsInput.statsObj);
                            break;
                    }
                }
                Object.keys(reactionResult).forEach(key => {
                    if (key.startsWith(reaction) && _.isNumber(reactionResult[key])) {
                        reactionResult[key] = resultValue;
                    }
                });
            });
        })
        overwriteObject(damageResult.元素反応, reactionResult);
        console.debug('元素反応', damageResult.元素反応);

        // 戦闘天賦およびその他のダメージを計算します
        const validConditionValueArr = makeValidConditionValueArr(conditionInput);

        const damageDetailMyCharacter = characterInput.damageDetailMyCharacter;
        const damageDetailMyWeapon = characterInput.damageDetailMyWeapon;
        const damageDetailMyArtifactSets = characterInput.damageDetailMyArtifactSets;

        if (Array.isArray(damageResult.キャラクター注釈)) {
            damageResult.キャラクター注釈.splice(0, damageResult.キャラクター注釈.length);
        }

        if (damageDetailMyCharacter) {
            for (const category of ['通常攻撃', '重撃', '落下攻撃']) {
                damageResult[category] = [];
                if (!(category in damageDetailMyCharacter)) continue;
                const element = conditionInput.攻撃元素[['通常攻撃', '重撃', '落下攻撃'].indexOf(category)];
                let talentDetailArr = (damageDetailMyCharacter as any)[category];
                if (('特殊' + category) in damageDetailMyCharacter) {
                    const workObj = (damageDetailMyCharacter as any)['特殊' + category];
                    if (checkConditionMatches(workObj['条件'], validConditionValueArr, constellation) != 0) {
                        talentDetailArr = workObj['詳細'];
                    }
                }
                for (const talentDetail of talentDetailArr) {
                    if (talentDetail['条件'] && checkConditionMatches(talentDetail['条件'], validConditionValueArr, constellation) == 0) {
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
                    if (talentDetail['条件'] && checkConditionMatches(talentDetail['条件'], validConditionValueArr, constellation) == 0) {
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
                if (talentDetail['条件'] && checkConditionMatches(talentDetail['条件'], validConditionValueArr, constellation) == 0) {
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

        console.debug(damageResult);
    } catch (error) {
        console.error(error);
        console.error(damageResult, characterInput, conditionInput, statsInput);
        // throw error;
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
        const numberList = conditionInput.numberList;
        if (numberList) {
            numberList.forEach((entry: any) => {
                const value = conditionInput.conditionValues[entry.name];
                if (value !== undefined && value !== null) {
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
): number {
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

function checkConditionMatchesSub(
    conditionStr: string,
    validConditionValueArr: string[],
    constellation: number,
): number {
    const myCondArr = conditionStr.split(/[@=]/);
    if (myCondArr[0] == '命ノ星座') {
        if (myCondArr.length == 2) {
            if (_.isNumber(myCondArr[1])) {
                const work = Number(myCondArr[1]);
                if (work <= constellation) {
                    return 1;
                }
            }
        }
        return 0;   // アンマッチ
    }
    if (validConditionValueArr.includes(conditionStr) || validConditionValueArr.includes(conditionStr.replace('=', '@'))) {
        return 1;   // マッチ 等倍
    }
    if (myCondArr.length == 1) {
        if (validConditionValueArr.filter(s => s.split('@')[0] == conditionStr).length > 0) {
            return 1;   // マッチ 等倍
        }
        return 0;   // アンマッチ
    }
    if (conditionStr.indexOf('=') != -1) {
        if (NUMBER_CONDITION_VALUE_RE.test(myCondArr[1])) { // 数値入力条件
            const workArr = validConditionValueArr.filter(s => s.split('=')[0] == myCondArr[0]);
            if (workArr.length > 0) {
                return Number(workArr[0].split('=')[1]);   // マッチ
            }
        }
        return 0;   // アンマッチ
    }
    const re = new RegExp('[^0-9]*?([\\-0-9\\.]+).*');    // 条件値={prefix}{倍率}{postfix}
    for (let i = 0; i < validConditionValueArr.length; i++) {
        if (validConditionValueArr[i].startsWith(myCondArr[0] + '@')) {
            const workCondArr = validConditionValueArr[i].split('@');
            const reRet = re.exec(workCondArr[1]);
            if (reRet) {
                const work = Number(reRet[1]);
                return work;    // マッチ 倍率
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
        const dmgBuff = statsObj[reaction + '反応ボーナス'] ?? 0;
        const dmgElement = opt_dmgElement ?? (ELEMENTAL_REACTION_MASTER as any)[element][reaction]['元素'];
        let result = getValueByLevel(level, (ELEMENTAL_REACTION_MASTER as any)[element][reaction]['数値']);
        result *= 1 + (16 * elementalMastery / (elementalMastery + 2000)) + dmgBuff / 100;
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
        let result = getValueByLevel(level, (ELEMENTAL_REACTION_MASTER as any)[element]['結晶']['数値']);
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
        let result = getValueByLevel(level, (ELEMENTAL_REACTION_MASTER as any)[element][reaction]['数値']);
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
        const myConditionValuesAfter = deepcopy(conditionInput.conditionValues);

        if (detailObj['除外条件']) {
            for (const delCondition of detailObj['除外条件']) {
                let work = delCondition;
                if (_.isPlainObject(delCondition)) {
                    work = delCondition.名前;
                }
                if (work in myConditionValuesAfter) {
                    if (_.isNumber(myConditionValuesAfter[work])) {
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
                                newValue += Number(work);
                            } else if (_.isNumber(addCondition.数値)) {
                                newValue = addCondition.数値;
                            } else {
                                newValue = addCondition.数値;
                            }
                            if (_.isNumber(newValue)) {
                                if (newValue < 0) {
                                    newValue = 0;
                                } else {
                                    conditionInput.selectList.filter(s => s.name == addCondition.名前).forEach(entry => {
                                        if (newValue >= entry.options.length) {
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
            const myConditionInputAfter: TConditionInput = deepcopy(conditionInput);
            myConditionInputAfter.conditionValues = myConditionValuesAfter;
            const validConditionValueArrAfter = makeValidConditionValueArr(myConditionInputAfter);

            [characterInput.damageDetailMyCharacter, characterInput.damageDetailMyWeapon, characterInput.damageDetailMyArtifactSets].forEach(damageDetail => {
                if (!damageDetail) return;
                damageDetail.ステータス変更系詳細.filter(s => s.条件).forEach(damageDetailObj => {
                    const conditionStr = damageDetailObj.条件 as string;
                    let valueBefore = 0;
                    let valueAfter = 0;
                    const matchesBefore = checkConditionMatches(conditionStr, validConditionValueArr, constellation);
                    const matchesAfter = checkConditionMatches(conditionStr, validConditionValueArrAfter, constellation);
                    if (matchesBefore == matchesAfter) return;
                    if (matchesBefore != 0) {
                        let new数値 = damageDetailObj.数値;
                        if (matchesBefore != 1) {
                            new数値 = (new数値 as any[]).concat(['*', matchesBefore]);
                        }
                        valueBefore = calculateFormulaArray(new数値, statsObj, damageResult, damageDetailObj.上限, damageDetailObj.下限);
                    }
                    if (matchesAfter != 0) {
                        let new数値 = damageDetailObj.数値;
                        if (matchesAfter != 1) {
                            new数値 = (new数値 as any[]).concat(['*', matchesAfter]);
                        }
                        valueAfter = calculateFormulaArray(new数値, statsObj, damageResult, damageDetailObj.上限, damageDetailObj.下限);
                    }
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
                    number = checkConditionMatches(valueObj.条件, validConditionValueArr, constellation);
                    if (number == 0) {
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
                    const myValue = calculateFormulaArray(valueObj.数値, statsObj, damageResult, valueObj.上限, valueObj.下限);
                    my防御無視 += myValue;
                } else if (valueObj.種類 == '固有変数') {
                    // nop
                } else {
                    if (number != null && number != 1) {    // オプションの@以降の数値でスケールする場合あり
                        const myNewValueObj = JSON.parse(JSON.stringify(valueObj)); // deepcopy
                        myNewValueObj.数値 = myNewValueObj.数値.concat(['*', number]);
                        myTalentChangeDetailObjArr.push(myNewValueObj);
                    } else {
                        myTalentChangeDetailObjArr.push(valueObj);
                    }
                }
            });
        }
        console.debug(detailObj['名前'] + ':myTalentChangeDetailObjArr');
        console.debug(myTalentChangeDetailObjArr);

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
        console.debug('myステータス補正', myステータス補正);

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
                    if (checkConditionMatches(my条件, validConditionValueArr, constellation) != 0) {
                        const myValue = calculateFormulaArray(valueObj.数値, statsObj, damageResult, valueObj.上限, valueObj.下限);
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
            console.debug('ステータス補正', stat, myステータス補正[stat]);
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
        const my計算Result = calculateDamageFromDetailSub(statsObj, damageResult, detailObj.数値, myバフArr, is会心Calc, is防御補正Calc, is耐性補正Calc, my元素, my防御無視, my別枠乗算, detailObj.上限, detailObj.下限);

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
        if (DAMAGE_CATEGORY_ARRAY.includes(detailObj.種類)) {
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
        console.debug('calculateDamageFromDetail', detailObj, characterInput, conditionInput, statsObj, opt_element, resultArr);
        return resultArr;
    } catch (error) {
        console.error(error);
        console.error(detailObj, characterInput, conditionInput, statsObj, opt_element);
        throw error;
    }
}

function calculateDamageFromDetailSub(
    statsObj: TStats,
    damageResult: TDamageResult,
    formula: number | string | (number | string)[],
    buffArr: Array<string> | null,
    is会心Calc: boolean,
    is防御補正Calc: boolean,
    is耐性補正Calc: boolean,
    元素: string,
    防御無視: number,
    別枠乗算: number | null,
    opt_max: number | string | Array<number | string> | null = null,
    opt_min: number | string | Array<number | string> | null = null
): TDamageResultEntry {
    const myダメージ基礎値 = calculateFormulaArray(formula, statsObj, damageResult, opt_max, opt_min);
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

    console.debug('%f * %f * [%o]=%f * [%f,%f] * %f * %f => %f,%f,%f', myダメージ基礎値, 別枠乗算, buffArr, myダメージバフ補正, my会心率, my会心ダメージ, my防御補正, my耐性補正, my期待値Result, my会心Result, myダメージ);
    return ['未設定', 元素, my期待値Result, my会心Result, myダメージ, null, null, myダメージバフ補正, my防御補正];
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
 * 計算式内の参照有無を求めます
 */
export function isUseReference(formulaArr: number | string | Array<number | string>): boolean {
    if (!Array.isArray(formulaArr)) {
        if (_.isNumber(formulaArr)) {
            return false;
        }
        return String(formulaArr).indexOf('#') != -1;
    }
    let result = false;
    formulaArr.forEach(entry => {
        if (['+', '-', '*', '/'].includes(String(entry))) {
            return;
        } else if (_.isNumber(entry)) {
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

export const ALL_ELEMENTS = ['炎', '水', '風', '雷', '草', '氷', '岩'];

/**
 * ステータスを更新します
 */
function updateStats(
    statsObj: TStats,
    statName: string,
    formulaArr: number | string | Array<number | string>,
    opt_max: number | string | Array<number | string> | null = null,
    opt_min: number | string | Array<number | string> | null = null,
) {
    const value = calculateFormulaArray(formulaArr, statsObj, DAMAGE_RESULT_TEMPLATE, opt_max, opt_min);    // DAMAGE_RESULT_TEMPLATEは参照しない想定なのでダミーです
    if (!_.isNumber(value)) {
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

export type TArtifactScoreFormulaElement = [string, number];
export type TArtifactScoreFormula = TArtifactScoreFormulaElement[];

export const ARTIFACT_SCORE_FACTORS = [
    'HP%', '攻撃力%', '防御力%', '元素熟知', '会心率', '会心ダメージ', '元素チャージ効率',
];

export const ARTIFACT_SCORE_FORMULA_TEMPLATE: TArtifactScoreFormula[] = [
    [['攻撃力%', 1], ['会心率', 2], ['会心ダメージ', 1]],
    [['HP%', 1], ['会心率', 2], ['会心ダメージ', 1]],
    [['防御力%', 1], ['会心率', 2], ['会心ダメージ', 1]],
    [['HP%', 0.5], ['攻撃力%', 0.5], ['会心率', 2], ['会心ダメージ', 1]],
    [['攻撃力%', 0.5], ['防御力%', 0.5], ['会心率', 2], ['会心ダメージ', 1]],
    [['攻撃力%', 0.5], ['元素熟知', 0.125], ['会心率', 2], ['会心ダメージ', 1]],
];

export function calculateArtifactScore(
    characterInput: TCharacterInput,
    artifactDetailInput: TArtifactDetailInput,
    scoringStats: [string, number][]
) {
    let result = 0;
    for (const scoringStat of scoringStats) {
        const stat = scoringStat[0];
        const magnification = scoringStat[1];
        if (artifactDetailInput.聖遺物ステータスサブ効果[stat]) {
            result += artifactDetailInput.聖遺物ステータスサブ効果[stat] * magnification;
        }
    }
    return result;
}