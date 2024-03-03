import { CHARACTER_E_UNTIL_MAP, getParticleInfo, getDurationFromInfo, getReceiveTypeFromInfo, SP_SELF } from "@/particlemaster";
import _ from "lodash";
import { TActionItem, TTeam, NUMBER_OF_MEMBERS, getCharacterMaster, TTeamMemberResult, TMember, getDefaultMemberResult, getCharacterDetail, getNormalAttackDan } from "./team";

export const RECHARGE_ENERGY_SKILL = "01";              // 元素スキルによる元素エネルギー回復
export const RECHARGE_ENERGY_BURST = "02";              // 元素爆発による元素エネルギー回復
export const RECHARGE_ENERGY_PASSIVE = "03";            // 固有天賦による元素エネルギー回復
export const RECHARGE_ENERGY_CONSTELLATION = "04";      // 命ノ星座による元素エネルギー回復
export const RECHARGE_ENERGY_ATTACK = "05";             // 通常攻撃、重撃による元素エネルギー回復
export const RECHARGE_ENERGY_WEAPON = "06";             // 武器効果による元素エネルギー回復
export const RECHARGE_ENERGY_ARTIFACT = "07";           // 聖遺物セット効果による元素エネルギー回復
export const RECHARGE_PARTICLE_SKILL = "11";            // 元素スキルによる元素粒子生成
export const RECHARGE_PARTICLE_PASSIVE = "13";          // 固有天賦による元素粒子生成
export const RECHARGE_PARTICLE_CONSTELLATION = "14";    // 命ノ星座による元素粒子生成
export const RECHARGE_PARTICLE_FAVONIUS = "16";         // 武器効果（西風）による元素粒子生成
export const RECHARGE_PARTICLE_RESONANCE = "18";        // 元素共鳴による元素粒子生成
export const RECHARGE_PARTICLE_ENEMY = "19";            // 敵による元素粒子生成

export const ATTACK_ENERGY_COUNT_OBJ = {
    '片手剣': 4.52,     // 10% + 5% * n
    '両手剣': 4.66,     // 0% + 10% * n
    '長柄武器': 6.95,   // 0% + 4% * n
    '弓': 6.29,         // 0% + 5% * n
    '法器': 4.66,       // 0% + 10% * n
}

const NORMAL_ATTACK_LENGTH_OBJ = {
    '片手剣': 0.4,
    '両手剣': 0.8,
    '長柄武器': 0.4,
    '弓': 0.6,
    '法器': 0.6,
}

const ACTION_LENGTH_MAP = new Map<string, Map<string, number>>();
ACTION_LENGTH_MAP.set('楓原万葉', new Map<string, number>([['E.Press', 1.5], ['E.Hold', 2]]));
ACTION_LENGTH_MAP.set('荒瀧一斗', new Map<string, number>([['C', 0.8]]));
ACTION_LENGTH_MAP.set('ヌヴィレット', new Map<string, number>([['C', 3]]));
ACTION_LENGTH_MAP.set('シャルロット', new Map<string, number>([['E.Hold', 2]]));

// rechargeKind, triggerName, energies[], messages[]
export type TEREnergy = [string, string, number[], string[]];
// rechargeKind, triggerName, element, particles[], messages[]
export type TERParticle = [string, string, string, number[], string[]];

export function isRechargeKindEnergy(rechargeKind: string) {
    return rechargeKind ? rechargeKind.startsWith('0') : false;
}

export function isRechargeKindParticle(rechargeKind: string) {
    return rechargeKind ? rechargeKind.startsWith('1') : false;
}

/** 通常攻撃使用回数 */
export function countN(character?: string, rotationList?: TActionItem[], isBursting?: boolean) {
    let result = 0;
    if (rotationList?.length) {
        if (character && isBursting !== undefined) {
            let isQing = false;
            for (let i = 0; i < rotationList.length; i++) {
                const rotation = rotationList[i];
                if (rotation.member == character) {
                    if (rotation.action === 'Q') {
                        isQing = true;
                    } else if (rotation.action.startsWith('N') && isBursting == isQing) {
                        result += rotation.action.length === 1 ? 1 : Number(rotation.action.substring(1, 2));
                    }
                } else {
                    isQing = false;
                }
            }
        } else {
            result = rotationList.filter(rotation => (!character || rotation.member == character) && rotation.action.startsWith('N')).map(rotation => rotation.action.length === 1 ? 1 : Number(rotation.action.substring(1, 2))).reduce((p, c) => p + c, 0);
        }
    } else {
        return 1;
    }
    return result;
}
/** 重撃使用回数 */
export function countC(character?: string, rotationList?: TActionItem[], isBursting?: boolean) {
    let result = 0;
    if (rotationList?.length) {
        if (character && isBursting !== undefined) {
            let isQing = false;
            for (let i = 0; i < rotationList.length; i++) {
                const rotation = rotationList[i];
                if (rotation.action === 'Q') {
                    isQing = true;
                } else if (rotation.action.includes('C') && isBursting == isQing) {
                    result++;
                }
            }
        } else {
            result = rotationList.filter(rotation => (!character || rotation.member == character) && rotation.action.includes('C')).length;
        }
    } else {
        return 1;
    }
    return result;
}
export function countP(character?: string, rotationList?: TActionItem[], isBursting?: boolean) {
    let result = 0;
    if (rotationList?.length) {
        if (character && isBursting !== undefined) {
            let isQing = false;
            for (let i = 0; i < rotationList.length; i++) {
                const rotation = rotationList[i];
                if (rotation.action === 'Q') {
                    isQing = true;
                } else if (rotation.action.includes('P') && isBursting == isQing) {
                    result++;
                }
            }
        } else {
            result = rotationList.filter(rotation => (!character || rotation.member == character) && rotation.action.includes('P')).length;
        }
    } else {
        return 1;
    }
    return result;
}
/** 元素スキル使用回数 */
export function countE(character?: string, rotationList?: TActionItem[], action = 'E', isBursting?: boolean) {
    let result = 0;
    if (rotationList?.length) {
        if (character) {
            let isQing = false;
            let untilMap: Map<string[], number> | undefined;
            for (let i = 0; i < rotationList.length; i++) {
                const rotation = rotationList[i];
                if (rotation.member == character) {
                    if (untilMap && untilMap.size > 0) {
                        for (const [key, value] of untilMap.entries()) {
                            if (key.filter(untilAction => rotation.action.indexOf(untilAction) != -1).length) {
                                let untilCount = value;
                                if (untilCount) {
                                    untilCount -= rotation.action.startsWith('N') ? rotation.action.length === 1 ? 1 : Number(rotation.action.substring(1, 2)) : 1;
                                    if (untilCount > 0) {
                                        untilMap.set(key, untilCount);
                                    } else {
                                        untilMap.clear();
                                    }
                                }
                            }
                        }
                    } else if (rotation.action === 'Q') {
                        isQing = true;
                    } else if (rotation.action.startsWith(action)) {
                        const workMap = CHARACTER_E_UNTIL_MAP.get(character);
                        if (workMap && workMap.size > 0) {
                            untilMap = _.cloneDeep(workMap);
                        }
                        result += (isBursting === undefined || isBursting == isQing) ? 1 : 0;
                    }
                } else {
                    isQing = false;
                }
            }
        } else {
            result = rotationList.filter(rotation => (!character || rotation.member == character) && rotation.action.startsWith(action)).length;
        }
    } else {
        result = 1;
    }
    return result;
}
/** 元素爆発使用回数 */
export function countQ(character?: string, rotationList?: TActionItem[]) {
    return rotationList?.length ?
        rotationList.filter(rotation => (!character || rotation.member == character) && rotation.action === 'Q').length
        : 1;
}
/** 出場時間(%) */
export function getOnFieldRate(team: TTeam, rotationLength: number, rotationList: TActionItem[], constellations: number[]) {
    const result = _.fill(Array(NUMBER_OF_MEMBERS), 0);
    const memberNameArr = team.members.map(member => member.name);
    const danArr = team.members.map(member => member.name ? getNormalAttackDan(member.name) : 0);
    if (rotationList?.length) {
        const lengthList = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        let length = 0;
        let isNCPIgnoring = false;
        let preRotation = undefined;
        for (let i = 0; i < rotationList.length; i++) {
            const rotation = rotationList[i];
            if (preRotation && rotation.member != preRotation.member) {
                lengthList[memberNameArr.indexOf(preRotation.member)] += (length > 1 ? length : 1);
                length = 0;
                isNCPIgnoring = false;
            }
            preRotation = rotation;
            const actionLength1 = ACTION_LENGTH_MAP.get(rotation.member);
            if (actionLength1) {
                const actionLength2 = actionLength1.get(rotation.action);
                if (actionLength2 !== undefined) {
                    length += actionLength2;
                    continue;
                }
            }
            const characterMaster = getCharacterMaster(rotation.member);
            if (rotation.action === 'Q') {
                length += 0.8;
                if (characterMaster?.レアリティ && characterMaster.レアリティ === 5) {
                    length += 0.4;
                }
            } else if (rotation.action === 'E.Hold') {
                length += 1;
            } else if (['E', 'E.Press'].includes(rotation.action)) {
                length += 0.5;
                const particleInfo = getParticleInfo(rotation.member, rotation.action, constellations[memberNameArr.indexOf(rotation.member)]);
                const duration = getDurationFromInfo(particleInfo);
                if (getReceiveTypeFromInfo(particleInfo) === SP_SELF && duration) {
                    // 特定の元素スキル発動後は一定時間を加算して、キャラチェンまで通常攻撃、重撃、落下攻撃を無視する
                    length += duration;
                    isNCPIgnoring = true;
                }
            } else if (!isNCPIgnoring) {
                if (rotation.action.startsWith('N')) {
                    const maxDan = danArr[memberNameArr.indexOf(preRotation.member)];
                    const dan = rotation.action.length === 1 ? 1 : Number(rotation.action.substring(1, 2));
                    if (characterMaster?.武器) {
                        const unitLength = NORMAL_ATTACK_LENGTH_OBJ[characterMaster.武器];
                        for (let j = 0; j < dan; j++) {
                            if ((j / maxDan) < (2 / 3)) {
                                length += unitLength * 0.8;
                            } else {
                                length += unitLength * 1.2;
                            }
                        }
                    } else {
                        length += 0.6 * dan;
                    }
                    if (rotation.action.endsWith('C')) {
                        length += 0.5;
                    }
                    length += 0.3;
                } else if (rotation.action == 'C') {
                    if (characterMaster?.武器 === '両手剣') {   // ぐるぐる or ぶんぶん
                        length += 3;
                    } else if (characterMaster?.武器 === '弓') {    // 狙い撃ち
                        length += 1.5;  // 甘雨 1段チャージ/2段チャージ=1s/1.5s
                    } else if (characterMaster?.武器 === '法器') {
                        length += 1;
                    } else {    // for フリーナ
                        length += 1;
                    }
                } else if (rotation.action == 'P') {
                    length += 1.5;
                }
            }
        }
        if (preRotation && length > 0) {
            lengthList[memberNameArr.indexOf(preRotation.member)] += (length > 1 ? length : 1);
        }
        const multiple = Math.ceil(100 / rotationLength);
        const lengthSum = _.sum(lengthList);
        for (let i = 0; i < result.length; i++) {
            if (lengthSum && i < lengthList.length) {
                result[i] = Math.ceil(lengthList[i] / lengthSum * 100 / multiple) * multiple;
            } else {
                result[i] = 25;
            }
        }
        const sumVal = _.sum(result);
        if (sumVal > 100) {
            const maxVal = _.max(result);
            for (let i = 0; i < result.length; i++) {
                if (result[i] == maxVal) {
                    result[i] -= sumVal - 100;
                    break;
                }
            }
        }
    } else {
        const memberNum = memberNameArr.filter(name => name).length;
        if (memberNum) {
            const rate = 100 / memberNum;
            for (let i = 0; i < result.length; i++) {
                if (memberNameArr[i]) {
                    result[i] = rate;
                }
            }
        }
    }
    return result;
}

export function getMemberResult(character: string, members: TMember[], teamMemberResult?: TTeamMemberResult) {
    let result = getDefaultMemberResult();
    if (teamMemberResult) {
        const memberArr = members.filter(member => member.name == character);
        if (memberArr.length) {
            result = teamMemberResult[memberArr[0].id];
        }
    } else {
        const characterDetail = getCharacterDetail(character);
        if (characterDetail?.ステータス) {
            Object.keys(characterDetail.ステータス).forEach(key => {
                result.statsInput.statsObj[key] += characterDetail.ステータス[key]['90'];
            })
        }
    }
    return result;
}

export function getCharacterInputValue(character: string, members: TMember[], item: string, teamMemberResult?: TTeamMemberResult) {
    return (getMemberResult(character, members, teamMemberResult).characterInput as any)[item];
}

export function getStatsInputValue(character: string, members: TMember[], item: string, teamMemberResult?: TTeamMemberResult) {
    return (getMemberResult(character, members, teamMemberResult).statsInput.statsObj as any)[item];
}
