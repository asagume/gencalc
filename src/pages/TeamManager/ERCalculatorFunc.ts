import _ from "lodash";
import { NUMBER_OF_MEMBERS, TActionItem, TTeam, TTeamMemberResult, getCharacterMaster } from "./team";
import { CHARACTER_E_DELAY_MAP, CHARACTER_E_UNTIL_MAP, CHARACTER_Q_TO_E_ARR, PARTICLE_MASTER, SP_LONG, SP_NEXT, SP_SELF, SP_SHRT, getDurationFromInfo, getParticleInfo, getParticleNumFromInfo, getReceiveTypeFromInfo } from "@/particlemaster";
import { TERParticle, RECHARGE_PARTICLE_SKILL, countE, countC, countQ, RECHARGE_PARTICLE_FAVONIUS, RECHARGE_PARTICLE_RESONANCE, TEREnergy, RECHARGE_ENERGY_ARTIFACT } from "./ERCalculatorCommon";
import { CHARACTER_ENERGY_FUNC, CHARACTER_PARTICLE_EXTRA_FUNC } from "./ERCalculatorFuncCharacter";
import { WEAPON_ENERGY_FUNC } from "./ERCalculatorFuncWeapon";

export function getParticleByCharacter(
    character: string,
    constellation: number,
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[] | undefined,
    onFields: number[],
): TERParticle[] | undefined {
    const kind = RECHARGE_PARTICLE_SKILL;
    const resultMap = new Map<string, number[]>();
    if (!character) return undefined;
    const cpmv = PARTICLE_MASTER[character];
    if (!cpmv) return undefined;
    if (!rotationList?.length) {
        rotationList = [{
            id: 0,
            member: character,
            action: Object.keys(cpmv)[0],
        }];
    }
    const memberNameArr = team.members.map(member => member.name);
    const myIndex = memberNameArr.indexOf(character);
    if (character === 'ファルザン' && constellation >= 6) {
        const eCount = countE(character, rotationList);
        const cCount = countC(character, rotationList);
        const qCount = countQ(character, rotationList);
        const action = 'E';
        const particleInfo = getParticleInfo(character, action);
        if (particleInfo) {
            const num = getParticleNumFromInfo(particleInfo) * Math.trunc(Math.min(rotationLength, Math.min(eCount, cCount) * 5.5 + qCount * 18) / 5.5);
            const resultVal = resultMap.get(action) ?? _.fill(Array(NUMBER_OF_MEMBERS), 0);
            splitNumToArrByOnFieldRate(resultVal, num, team, onFields);
            resultMap.set(action, resultVal);
        }
    } else {
        const timeArr = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        let curCharacter;
        let isBursting = false;
        let untilMap = new Map<string[], number>();
        let delayActions: string[] | undefined;    // delayActionsの実行まで元素粒子生成を遅らせる
        for (let i = 0; i < rotationList.length; i++) {
            const rotation = rotationList[i];
            if (rotation.member != curCharacter) {
                isBursting = false;
            }
            if (rotation.member == character) {
                let action = rotation.action;
                if (action === 'Q') {
                    isBursting = true; // キャラチェンするまでずっと元素爆発中判定とする
                }
                if (action === 'Q' && CHARACTER_Q_TO_E_ARR.includes(character)) {
                    action = 'E';
                }
                if (untilMap && untilMap.size > 0) {
                    for (const [key, value] of untilMap.entries()) {
                        if (key.filter(untilAction => action.indexOf(untilAction) != -1).length > 0) {
                            let untilCount = value;
                            if (untilCount) {
                                untilCount -= action.startsWith('N') ? action.length === 1 ? 1 : Number(action.substring(1, 2)) : 1;
                                if (untilCount > 0) {
                                    untilMap.set(key, untilCount);
                                } else {
                                    untilMap.clear();
                                }
                            }
                        }
                    }
                } else if (action.startsWith('E') || delayActions && delayActions.filter(delayAction => action.indexOf(delayAction) != -1).length) {
                    const workMap = CHARACTER_E_UNTIL_MAP.get(character);
                    if (workMap && workMap.size > 0) {
                        untilMap = _.cloneDeep(workMap);
                    } else if (CHARACTER_E_DELAY_MAP.has(character)) {
                        if (action.startsWith('E')) {
                            delayActions = _.cloneDeep(CHARACTER_E_DELAY_MAP.get(character));
                            continue;
                        }
                        delayActions = undefined;
                        action = 'E';
                    }
                    const resultVal = resultMap.get(action) ?? _.fill(Array(NUMBER_OF_MEMBERS), 0);
                    timeArr[myIndex] = setSkillParticleNumToArr(resultVal, character, action, constellation, team, rotationLength, rotationList, i, onFields, timeArr[myIndex], isBursting);
                    resultMap.set(action, resultVal);
                }
            }
            curCharacter = rotation.member;
        }
    }
    const result: TERParticle[] = [];
    const characterMaster = getCharacterMaster(character);
    const element = characterMaster?.元素 ?? '無色';
    resultMap.forEach((value, key) => {
        result.push([kind, key, element, value, []]);
    })
    return result;
}

export function getParticleByCharacterExtra(
    character: string,
    constellation: number,
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[] | undefined,
    onFields: number[],
): TERParticle[] | undefined {
    const func = CHARACTER_PARTICLE_EXTRA_FUNC[character];
    if (func === undefined) return undefined;
    const members = team.members.map(member => member.name);
    const ret = func(character, constellation, members, rotationLength, rotationList);
    if (ret === undefined) return undefined;
    const myIndex = members.indexOf(character);
    if (myIndex === -1) return undefined;
    const entry = ret;
    const particles = _.fill(Array(NUMBER_OF_MEMBERS), 0);
    const result: TERParticle = [ret[0], ret[1], ret[2], particles, ret[7]];
    if (ret[3]) {   // 本人
        particles[myIndex] += entry[3];
    }
    if (ret[4]) {   // 全員
        splitNumToArrByOnFieldRate(particles, entry[4], team, onFields);
    }
    return [result];
}

export function getParticleByWeapon(
    character: string,
    weapon: string,
    weaponRefine: number,
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[] | undefined,
    onFields: number[],
): TERParticle | undefined {
    let result: TERParticle | undefined;
    const kind = RECHARGE_PARTICLE_FAVONIUS;
    const memberNameArr = team.members.map(member => member.name);
    if (['西風剣', '西風大剣', '西風長槍', '西風猟弓', '西風秘典'].includes(weapon)) {
        result = [kind, weapon, '無色', _.fill(Array(NUMBER_OF_MEMBERS), 0), []];
        const ct = [12, 10.5, 9, 7.5, 6][weaponRefine - 1];
        let triggerCnt = 1;
        if (rotationLength && rotationList?.length && onFields) {
            const rindexArr: number[] = [];
            let fieldCnt = 0; // 出場回数
            for (let i = 0; i < rotationList.length; i++) {
                if (rotationList[i].member == character) {
                    fieldCnt += (i === 0 || rotationList[i - 1].member != character) ? 1 : 0;
                }
            }
            const onField = onFields[memberNameArr.indexOf(character)];
            triggerCnt = fieldCnt + Math.trunc(rotationLength * onField / 100 / ct);
            triggerCnt = Math.min(Math.trunc(rotationLength / ct), triggerCnt);
            let curCharacter = undefined;
            for (let i = 0; i < rotationList.length; i++) {
                const rotation = rotationList[i];
                if (rotation.member == character && rotation.member != curCharacter) {
                    rindexArr.push(i);
                }
                curCharacter = rotation.member;
            }
            for (let i = 0; i < triggerCnt; i++) {
                let nxtCharacter = character;
                if (i < rindexArr.length) {
                    const rindex = rindexArr[i];
                    const nxtRotation = (rindex + 1) < rotationList.length ? rotationList[rindex + 1] : rotationList[0];
                    nxtCharacter = nxtRotation.member;
                }
                const toIndex = memberNameArr.indexOf(nxtCharacter);
                (result[3][toIndex] as number) += 3;
            }
        } else {
            const toIndex = memberNameArr.indexOf(character);
            result[3][toIndex] = 3 * triggerCnt;
        }
    }
    return result;
}

export function getParticleByResonance(
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[] | undefined,
    onFields: number[],
): TERParticle[] | undefined {
    const resultArr = new Array<[string, string, string, number, number, string[]]>(); // [rechargeType, triggerName, element, myParticle, allParticle, messages]
    const messages: string[] = [];
    let allParticle = 0; // 分配
    const memberNum = team.members.filter(member => member.name).length;
    if (memberNum !== 4) return undefined;
    const electroCount = team.members.filter(member => getCharacterMaster(member.name)?.元素 === '雷').length;
    if (electroCount >= 2) { // 雷元素共鳴
        messages.push('超電導、過負荷、感電、原激化、超激化または超開花反応を起こした時、100%の確率で雷元素粒子を生成する。クールタイム5秒。');
        if (team.members.filter(member => ['氷', '炎', '水', '草'].includes(getCharacterMaster(member.name)?.元素 ?? '--')).length) {
            const ct = 5;
            allParticle = 1 * Math.trunc(rotationLength / ct);
        }
        resultArr.push([RECHARGE_PARTICLE_RESONANCE, '雷元素共鳴', '雷', 0, allParticle, messages]);
    }
    const result: TERParticle[] = [];
    resultArr.forEach(entry => {
        const particles = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        if (entry[4]) {
            splitNumToArrByOnFieldRate(particles, entry[4], team, onFields);
        }
        result.push([entry[0], entry[1], entry[2], particles, messages]);
    })
    return result;
}

export function getEnergyByCharacter(
    character: string,
    constellation: number,
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[],
    teamMemberResult?: TTeamMemberResult,
): TEREnergy[] {
    const result: TEREnergy[] = [];
    const func = CHARACTER_ENERGY_FUNC[character];
    if (func === undefined) return result;
    const ret = func(character, constellation, team.members, rotationLength, rotationList, teamMemberResult);
    if (!ret?.length) return result;
    const myIndex = team.members.map(member => member.name).indexOf(character);
    if (myIndex === -1) return result;
    ret.forEach(entry => {
        const energies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        const workResult: TEREnergy = [entry[0], entry[1], energies, entry[6]];
        if (entry[2]) {   // 本人
            energies[myIndex] += entry[2];
        }
        if (entry[3]) {   // 全員
            for (let i = 0; i < energies.length; i++) {
                energies[i] += entry[3];
            }
        }
        if (entry[4]) {   // 本人以外
            for (let i = 0; i < energies.length; i++) {
                if (i != myIndex) {
                    energies[i] += entry[4];
                }
            }
        }
        if (entry[5]?.length) {   // 誰か
            for (let i = 0; i < energies.length; i++) {
                energies[i] += entry[5][i];
            }
        }
        result.push(workResult);
    })
    return result;
}

export function getEnergyByWeapon(
    character: string,
    weapon: string,
    weaponRefine: number,
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[] | undefined,
): TEREnergy | undefined {
    let result: TEREnergy | undefined = undefined;
    const func = WEAPON_ENERGY_FUNC[weapon];
    if (func === undefined) return result;
    const members = team.members.map(member => member.name);
    const ret = func(character, weapon, weaponRefine, members, rotationLength, rotationList);
    if (!ret?.length) return result;
    const myIndex = members.indexOf(character);
    if (myIndex === -1) return result;
    const entry = ret;
    const energies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
    result = [entry[0], entry[1], energies, entry[6]];
    if (entry[2]) {   // 本人
        energies[myIndex] += entry[2];
    }
    if (entry[3]) {   // 全員
        for (let i = 0; i < energies.length; i++) {
            energies[i] += entry[3];
        }
    }
    if (entry[4]) {   // 本人以外
        for (let i = 0; i < energies.length; i++) {
            if (i != myIndex) {
                energies[i] += entry[4];
            }
        }
    }
    if (entry[5]?.length) {   // 誰か
        for (let i = 0; i < energies.length; i++) {
            energies[i] += entry[5][i];
        }
    }
    return result;
}

export function getEnergyByArtifact(
    character: string,
    artifactSet4: string,
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[] | undefined,
): TEREnergy | undefined {
    const rechargeKind = RECHARGE_ENERGY_ARTIFACT;
    const energies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
    const messages: string[] = [];
    const memberNameArr = team.members.map(member => member.name);
    const qCount = countQ(character, rotationList);
    const myIndex = memberNameArr.indexOf(character);
    let otherEnergy = 0;
    if (artifactSet4 === '亡命者') {
        otherEnergy = 6 * qCount;
    }
    if (otherEnergy) {
        messages.push('元素爆発を発動すると、2秒毎にチーム全員（自分を除く）の元素エネルギーを2回復する、継続時間6秒。重ね掛け不可。');
        for (let i = 0; i < energies.length; i++) {
            if (i != myIndex) {
                energies[i] += otherEnergy;
            }
        }
    }
    if (energies.filter(e => e > 0).length || messages.length) {
        return [rechargeKind, artifactSet4, energies, messages];
    }
    return undefined;
}

function setSkillParticleNumToArr(
    arr: number[],
    character: string,
    action: string,
    constellation: number,
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[],
    index: number,
    onFields: number[],
    time: number,
    isBursting = false,
) {
    const particleInfo = getParticleInfo(character, action, constellation, isBursting);
    if (particleInfo) {
        const rotation = rotationList[index];
        if (rotation) {
            const num = getParticleNumFromInfo(particleInfo, rotationLength - time);
            const receiveType = getReceiveTypeFromInfo(particleInfo);
            const duration = getDurationFromInfo(particleInfo);
            if ([SP_SELF, SP_NEXT].includes(receiveType)) {
                addNumToArr(arr, num, team, rotationList, index, receiveType);
            } else if ([SP_LONG, SP_SHRT].includes(receiveType)) {
                splitNumToArrByOnFieldRate(arr, num, team, onFields);
            }
            time += duration;
        }
    }
    return time;
}

function addNumToArr(
    arr: number[],
    num: number,
    team: TTeam,
    rotationList: TActionItem[],
    index: number,
    receiveType = SP_NEXT,
) {
    const memberNameArr = team.members.map(member => member.name);
    const nxtRotation = (index + receiveType) < rotationList.length ? rotationList[index + receiveType] : rotationList[0];
    arr[memberNameArr.indexOf(nxtRotation.member)] += num;
}

function splitNumToArrByOnFieldRate(
    arr: number[],
    num: number,
    team: TTeam,
    onFields: number[],
) {
    for (let i = 0; i < arr.length; i++) {
        if (team.members[i].name) {
            const onField = onFields[i];
            arr[i] += num * onField / 100;
        }
    }
}
