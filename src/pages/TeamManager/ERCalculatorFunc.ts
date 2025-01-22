import _ from "lodash";
import { NUMBER_OF_MEMBERS, TActionItem, TTeam, TTeamMemberResult, getCharacterDetail, getCharacterMaster } from "./team";
import { CHARACTER_E_DELAY_MAP, CHARACTER_E_UNTIL_MAP, CHARACTER_Q_NOT_RECHARGEABLE, CHARACTER_Q_TO_E_ARR, SP_LONG, SP_NEXT, SP_SELF, SP_SHRT, getDurationFromInfo, getElementalSkillActions, getParticleInfo, getParticleNumFromInfo, getReceiveTypeFromInfo } from "@/particlemaster";
import { TERParticle, RECHARGE_PARTICLE_SKILL, countE, countC, countQ, RECHARGE_PARTICLE_FAVONIUS, RECHARGE_PARTICLE_RESONANCE, TEREnergy, RECHARGE_ENERGY_ARTIFACT, RECHARGE_ENERGY_ATTACK, ATTACK_ENERGY_COUNT_OBJ } from "./ERCalculatorCommon";
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
    if (!rotationList?.length) {
        rotationList = [{
            id: 0,
            member: character,
            action: getElementalSkillActions(character)[0],
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
        const num = getParticleNumFromInfo(particleInfo) * Math.trunc(Math.min(rotationLength, Math.min(eCount, cCount) * 5.5 + qCount * 18) / 5.5);
        const resultVal = resultMap.get(action) ?? _.fill(Array(NUMBER_OF_MEMBERS), 0);
        splitNumToArrByOnFieldRate(resultVal, num, team, onFields);
        resultMap.set(action, resultVal);
    } else if (character === 'フリーナ') {
        let ousiaLength = 0;
        let isOusia = true; // はじめはウーシア
        rotationList.forEach(rotation => {
            if (rotation.member == character && rotation.action.includes('C')) {    // 重撃でアルケー切り替え
                isOusia = !isOusia;
            }
            if (isOusia) {
                ousiaLength++;
            }
        })
        const action = 'E';
        const particleInfo = getParticleInfo(character, action);
        const num = getParticleNumFromInfo(particleInfo, rotationLength) * Math.trunc(ousiaLength / rotationList.length);
        const resultVal = resultMap.get(action) ?? _.fill(Array(NUMBER_OF_MEMBERS), 0);
        splitNumToArrByOnFieldRate(resultVal, num, team, onFields);
        resultMap.set(action, resultVal);
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
                    if (CHARACTER_Q_TO_E_ARR.includes(character)) {
                        action = 'E';
                    }
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
    const ret = func(character, constellation, team.members, rotationLength, rotationList, onFields);
    if (ret === undefined) return undefined;
    const memberNameArr = team.members.map(member => member.name);
    const myIndex = memberNameArr.indexOf(character);
    if (myIndex === -1) return undefined;
    const particles = _.fill(Array(NUMBER_OF_MEMBERS), 0);
    const result: TERParticle = [ret[0], ret[1], ret[2], particles, ret[6]];
    if (ret[3]) {   // 本人
        particles[myIndex] += ret[3];
    }
    if (ret[4]) {   // 全員
        splitNumToArrByOnFieldRate(particles, ret[4], team, onFields);
    }
    if (ret[5].length) {   // 誰か
        for (let i = 0; i < ret[5].length && i < particles.length; i++) {
            particles[i] += ret[5][i];
        }
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
    const memberNameArr = team.members.map(member => member.name);
    if (['西風剣', '西風大剣', '西風長槍', '西風猟弓', '西風秘典'].includes(weapon)) {
        const particles = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        const ct = [12, 10.5, 9, 7.5, 6][weaponRefine - 1];
        let triggerCnt = 1;
        if (rotationList?.length) {
            const rindexArr: number[] = [];
            for (let i = 0; i < rotationList.length; i++) {
                const rotation = rotationList[i];
                if (rotation.member == character && (i === 0 || rotationList[i - 1].member != character)) {
                    rindexArr.push(i);
                }
            }
            const onField = onFields[memberNameArr.indexOf(character)];
            triggerCnt = Math.min(Math.trunc(rotationLength / ct), rindexArr.length + Math.max(0, Math.trunc(rotationLength * onField / 100 / ct) - 1));
            for (let i = 0; i < triggerCnt; i++) {
                let nxtCharacter = character;
                if (i < rindexArr.length && (rindexArr[i] + 1) < rotationList.length) {
                    nxtCharacter = rotationList[rindexArr[i] + 1].member;
                }
                const toIndex = memberNameArr.indexOf(nxtCharacter);
                particles[toIndex] += 3;
            }
        } else {
            const toIndex = memberNameArr.indexOf(character);
            particles[toIndex] = 3 * triggerCnt;
        }
        result = [RECHARGE_PARTICLE_FAVONIUS, weapon, '無色', particles, []];
    }
    return result;
}

export function getParticleByResonance(
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[] | undefined,
    onFields: number[],
): TERParticle | undefined {
    let result: TERParticle | undefined = undefined;
    if (team.members.filter(member => member.name).length < 4) return result;
    const electroCount = team.members.filter(member => getCharacterMaster(member.name)?.元素 === '雷').length;
    if (electroCount >= 2) { // 雷元素共鳴
        const messages = [
            '超電導、過負荷、感電、原激化、超激化または超開花反応を起こした時、100%の確率で雷元素粒子を生成する。クールタイム5秒。',
        ];
        let allParticle = 0; // 分配
        if (team.members.filter(member => ['氷', '炎', '水', '草'].includes(getCharacterMaster(member.name)?.元素 ?? '--')).length) {
            const ct = 5;
            allParticle = 1 * Math.trunc(rotationLength / ct);
        }
        const particles = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        splitNumToArrByOnFieldRate(particles, allParticle, team, onFields);
        result = [RECHARGE_PARTICLE_RESONANCE, '雷元素共鳴', '雷', particles, messages];
    }
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
    const myIndex = memberNameArr.indexOf(character);
    if (artifactSet4 === '亡命者') {
        messages.push('元素爆発を発動すると、2秒毎にチーム全員（自分を除く）の元素エネルギーを2回復する、継続時間6秒。重ね掛け不可。');
        const otherEnergy = 6 * countQ(character, rotationList);
        if (otherEnergy) {
            for (let i = 0; i < energies.length; i++) {
                if (i != myIndex) {
                    energies[i] += otherEnergy;
                }
            }
        }
    } else if (artifactSet4 === '灰燼の都に立つ英雄の絵巻') {
        messages.push('付近にいるチーム内キャラクターが「夜魂バースト」を起こすと、装備者は元素エネルギーを6ポイント回復する。');
        const natlanCount = team.members.filter(member => (getCharacterDetail(member.name) as any)?.region === 'ナタ').length;
        console.log(natlanCount, (getCharacterDetail(character) as any));
        if (natlanCount > 0) {
            let myEnergy = 6 * Math.trunc(rotationLength / [-1, 18, 12, 9][natlanCount]);
            if (team.members.filter(member => member.name === 'シロネン').length > 0) {
                myEnergy += 6 * Math.trunc(rotationLength / 14);
            }
            energies[myIndex] += myEnergy;
        }
    }
    if (energies.filter(e => e > 0).length || messages.length) {
        return [rechargeKind, artifactSet4, energies, messages];
    }
    return undefined;
}

export function getEnergyByAttack(
    character: string,
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[],
): TEREnergy | undefined {
    let result: TEREnergy | undefined = undefined;
    const memberNameArr = team.members.map(member => member.name);
    const myIndex = memberNameArr.indexOf(character);
    const characterDetail = getCharacterDetail(character);
    if (characterDetail) {
        const denominator = ATTACK_ENERGY_COUNT_OBJ[characterDetail.武器];
        if (denominator) {
            let hitCount = 0;
            if (rotationList?.length) {
                rotationList.filter(rotation => rotation.member == character).forEach(rotation => {
                    let withC = false;
                    if (rotation.action.startsWith('N')) {
                        let workHitCount = 0;
                        let dans = 1;
                        if (rotation.action.length > 1) {
                            dans = Number(rotation.action.substring(1, 2));
                        }
                        characterDetail.通常攻撃.詳細.forEach((obj: any) => {
                            if (obj.名前 && obj.名前.endsWith('段ダメージ')) {
                                const workDan = obj.名前.substring(0, 1);
                                if (!isNaN(workDan) && dans <= Number(workDan)) {
                                    if (obj.HIT数) {
                                        workHitCount += obj.HIT数;
                                    }
                                }
                            }
                        })
                        if (workHitCount < dans) {
                            workHitCount = dans;
                        }
                        hitCount += workHitCount;
                        if (rotation.action.endsWith('C')) {
                            withC = true;
                        }
                    }
                    if (rotation.action === 'C' || withC) {
                        let workHitCount = 1;
                        characterDetail.重撃.詳細.forEach((obj: any) => {
                            if (obj.名前 && obj.名前 === '重撃ダメージ') {
                                if (obj.HIT数) {
                                    workHitCount = obj.HIT数;
                                }
                            }
                        })
                        hitCount += workHitCount;
                    }
                })
            }
            const energy = Math.trunc(hitCount / denominator);
            if (energy) {
                const rechargeKind = RECHARGE_ENERGY_ATTACK;
                const energies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
                const messages: string[] = [];
                result = [rechargeKind, '', energies, messages];
                energies[myIndex] += energy;
            }
        }
    }
    return result;
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
    const nxtRotation = (index + receiveType - SP_SELF) < rotationList.length ? rotationList[index + receiveType - SP_SELF] : rotationList[0];
    if (nxtRotation.action === 'Q' && CHARACTER_Q_NOT_RECHARGEABLE.includes(nxtRotation.member)) {
        num = 0;
    }
    arr[memberNameArr.indexOf(nxtRotation.member)] += num;
}

export function splitNumToArrByOnFieldRate(
    arr: number[],
    num: number,
    team: TTeam,
    onFields: number[],
) {
    const denominator = onFields.map(v => Math.pow(v / 100, 2)).reduce((p, c) => p + c, 0);
    for (let i = 0; i < arr.length; i++) {
        if (team.members[i].name) {
            const onField = onFields[i];
            arr[i] += num * Math.pow(onField / 100, 2) / denominator;
        }
    }
}
