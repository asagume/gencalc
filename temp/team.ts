import { calculateArtifactStatsMain, calculateArtifactStats, ALL_ELEMENTS, calculateStats, calculateDamageResult } from "@/calculate";
import { overwriteObject } from "@/common";
import { ARTIFACT_DETAIL_INPUT_TEMPLATE, CHARACTER_INPUT_TEMPLATE, CONDITION_INPUT_TEMPLATE, DAMAGE_RESULT_TEMPLATE, OPTION_INPUT_TEMPLATE, STATS_INPUT_TEMPLATE, TArtifactDetailInput, TCharacterInput, TConditionInput, TDamageResult, TOptionInput, TStats, TStatsInput, loadRecommendation, makeBuildStorageKey, makeDamageDetailObjArrObjArtifactSets, makeDamageDetailObjArrObjCharacter, makeDamageDetailObjArrObjWeapon, makeDefaultBuildname, setupConditionValues } from "@/input";
import { CHARACTER_MASTER, ELEMENTAL_RESONANCE_MASTER, TAnyObject, TCharacterDetail, TCharacterEntry, TCharacterKey, TWeapon, TWeaponEntry, TWeaponKey, TWeaponTypeKey, WEAPON_MASTER, getCharacterMasterDetail } from "@/master";
import _ from "lodash";

export type TMember = {
    id: number;
    name: string;
    buildname: string | undefined;
    builddata: any | undefined;
    tags: string[],
    replacements: string[],
};

export type TActionItem = {
    id: number;
    member: string;
    action: string;
};

export type TTeam = {
    id: number;
    name: string;
    members: TMember[];
    description: string,
    rotation: TActionItem[];
    rotationDescription: string,
};

export type TMemberResult = {
    characterInput: TCharacterInput,
    artifactDetailInput: TArtifactDetailInput,
    conditionInput: TConditionInput,
    optionInput: TOptionInput,
    statsInput: TStatsInput,
    damageResult: TDamageResult,
};

export type TTeamMemberResult = {
    [key: string]: TMemberResult,
};

export const NUMBER_OF_TEAMS = 10;
export const NUMBER_OF_MEMBERS = 4;

const characterDetailMap = new Map<string, TCharacterDetail>();

export function getCharacterMaster(character: string) {
    let result;
    if (character && character in CHARACTER_MASTER) {
        result = CHARACTER_MASTER[character as TCharacterKey] as TCharacterEntry;
    }
    return result;
}

export async function setupCharacterDetailMap(team: TTeam) {
    const list: Promise<void>[] = [];
    for (const member of team.members) {
        list.push(getCharacterMasterDetail(member.name as TCharacterKey).then(response => {
            characterDetailMap.set(member.name, response);
        }));
    }
    Promise.all(list);
}

export function getCharacterDetail(character: string) {
    return characterDetailMap.get(character);
}

export function getWeaponMaster(weaponType: string, weapon: string) {
    let result = undefined;
    if (weaponType && weapon && weaponType in WEAPON_MASTER) {
        const weaponTypeMaster = WEAPON_MASTER[weaponType as TWeaponTypeKey];
        if (weapon in weaponTypeMaster) {
            result = (weaponTypeMaster as any)[weapon] as TWeaponEntry;
        }
    }
    return result;
}

export function getBuildnameFromStorageKey(storageKey: string) {
    const work = storageKey.split('_');
    const character = work[1];
    work.splice(0, 2);
    let result;
    if (work.length > 0) {
        result = work.join('_');
    } else {
        result = makeDefaultBuildname(character);
    }
    return result;
}

export function getBuildStorageKeys(character: string) {
    return Object.keys(localStorage).filter(s => s.startsWith(makeBuildStorageKey(character)));
}

export function getBuilddataFromStorage(character: string, buildname?: string) {
    let result;
    const storageKey = makeBuildStorageKey(character, buildname);
    const storageValue = localStorage.getItem(storageKey);
    if (storageValue) result = JSON.parse(storageValue);
    return result;
}

export const calculateMemberResult = async (member: TMember, team: TTeam): Promise<TMemberResult> => {
    const characterInput: TCharacterInput = _.cloneDeep(CHARACTER_INPUT_TEMPLATE);
    const artifactDetailInput: TArtifactDetailInput = _.cloneDeep(ARTIFACT_DETAIL_INPUT_TEMPLATE);
    const conditionInput: TConditionInput = _.cloneDeep(CONDITION_INPUT_TEMPLATE);
    const optionInput: TOptionInput = _.cloneDeep(OPTION_INPUT_TEMPLATE);
    const statsInput: TStatsInput = _.cloneDeep(STATS_INPUT_TEMPLATE);
    const damageResult: TDamageResult = _.cloneDeep(DAMAGE_RESULT_TEMPLATE);

    const result: TMemberResult = {
        characterInput: characterInput,
        artifactDetailInput: artifactDetailInput,
        conditionInput: conditionInput,
        optionInput: optionInput,
        statsInput: statsInput,
        damageResult: damageResult,
    };

    if (!member.name) return result;

    characterInput.character = member.name as TCharacterKey;
    characterInput.characterMaster = await getCharacterMasterDetail(
        characterInput.character
    );

    const builddata = member.builddata;
    if (!builddata) return result;

    await loadRecommendation(
        characterInput,
        artifactDetailInput,
        conditionInput,
        optionInput,
        builddata
    );

    makeDamageDetailObjArrObjCharacter(characterInput);
    makeDamageDetailObjArrObjWeapon(characterInput);
    makeDamageDetailObjArrObjArtifactSets(characterInput);
    setupConditionValues(conditionInput, characterInput, optionInput);
    calculateArtifactStatsMain(
        artifactDetailInput.聖遺物ステータスメイン効果,
        artifactDetailInput.聖遺物メイン効果
    );
    calculateArtifactStats(artifactDetailInput);

    conditionInput.checkboxList.forEach((entry) => {
        conditionInput.conditionValues[entry.name] = false;
    });
    conditionInput.selectList.forEach((entry) => {
        conditionInput.conditionValues[entry.name] = 0;
    });

    const myVision = characterInput.characterMaster.元素;
    const teamElements: TAnyObject = {};
    if (team.members) {
        team.members.filter(s => s.name).forEach(entry => {
            const vision = CHARACTER_MASTER[entry.name as TCharacterKey].元素;
            if (vision in teamElements) {
                teamElements[vision]++;
            } else {
                teamElements[vision] = 1;
            }
        })
    }

    // 武器
    if (['千岩古剣', '千岩長槍'].includes(characterInput.weapon)) {
        if (team.members) {
            let liyueCount = 0;
            for (const entry of team.members.filter(s => s)) {
                const characterDetail = await getCharacterMasterDetail(entry.name as TCharacterKey);
                if (characterDetail.region) {
                    if (['璃月港'].includes(characterDetail.region)) {
                        liyueCount++;
                    }
                }
            }
            const conditionKey = '[' + characterInput.weapon + ']璃月キャラ1人毎に攻撃力と会心率+';
            conditionInput.conditionValues[conditionKey] = liyueCount;
        }
    } else if (['惡王丸', '斬波のひれ長', '曚雲の月'].includes(characterInput.weapon)) {
        if (team.members) {
            let totalEnergyCost = 0;
            for (const entry of team.members.filter(s => s)) {
                const characterDetail = await getCharacterMasterDetail(entry.name as TCharacterKey);
                if ('元素エネルギー' in characterDetail.元素爆発) {
                    totalEnergyCost += characterDetail.元素爆発.元素エネルギー;
                }
            }
            if (totalEnergyCost) {
                conditionInput.conditionValues['チーム全員の元素エネルギー上限の合計'] = totalEnergyCost;
            }
        }
    }

    const sameCount = teamElements[myVision] - 1;
    const otherElements = Object.keys(teamElements).filter(s => s != myVision);
    const otherCount = otherElements.length ? otherElements.map(s => teamElements[s]).reduce((a, b) => a + b) : 0;
    conditionInput.conditionValues['[チーム]同じ元素のキャラクター'] = sameCount;
    conditionInput.conditionValues['[チーム]異なる元素のキャラクター'] = otherCount;
    conditionInput.conditionValues['[チーム]キャラクターの元素タイプ'] = Object.keys(teamElements).length - 1; // requiredなので1減らします
    ALL_ELEMENTS.forEach(vision => {
        const key1 = '[チーム]' + vision + '元素キャラクター';
        conditionInput.conditionValues[key1] = teamElements[vision] ?? 0;
        const key2 = '[チーム]' + vision + '元素キャラクター(自分以外)';
        conditionInput.conditionValues[key2] = (teamElements[vision] ?? 0) - (vision == myVision ? 1 : 0);
    });

    // 元素共鳴
    if (getElementalResonance(team)) {
        const workObj = {} as TStats;
        getElementalResonance(team).filter(s => ['炎元素共鳴', '水元素共鳴', '草元素共鳴', '元素共鳴なし'].includes(s)).forEach(entry => {
            optionInput.elementalResonance.conditionValues[entry] = true;
            if ("詳細" in (ELEMENTAL_RESONANCE_MASTER as any)[entry]) {
                const detailObjArr = (ELEMENTAL_RESONANCE_MASTER as any)[entry].詳細;
                if (detailObjArr) {
                    for (const detailObj of detailObjArr) {
                        if ("種類" in detailObj && "数値" in detailObj) {
                            if (detailObj.種類 in workObj) {
                                workObj[detailObj.種類] += detailObj.数値;
                            } else {
                                workObj[detailObj.種類] = detailObj.数値;
                            }
                        }
                    }
                }
            }
        });
        overwriteObject(optionInput.elementalResonance.conditionAdjustments, workObj);
    }

    calculateStats(statsInput, characterInput, artifactDetailInput, conditionInput, optionInput);
    calculateDamageResult(damageResult, characterInput, conditionInput, statsInput);

    return {
        characterInput: characterInput,
        artifactDetailInput: artifactDetailInput,
        conditionInput: conditionInput,
        optionInput: optionInput,
        statsInput: statsInput,
        damageResult: damageResult,
    } as TMemberResult;
}

export const MEMBER_RESULT_DUMMY: TMemberResult = {
    characterInput: CHARACTER_INPUT_TEMPLATE,
    artifactDetailInput: ARTIFACT_DETAIL_INPUT_TEMPLATE,
    conditionInput: CONDITION_INPUT_TEMPLATE,
    optionInput: OPTION_INPUT_TEMPLATE,
    statsInput: STATS_INPUT_TEMPLATE,
    damageResult: DAMAGE_RESULT_TEMPLATE,
}

export const getElementalResonance = (team: TTeam) => {
    const result: string[] = [];
    const work: TAnyObject = {};
    const members = team.members.filter((member) => member.name);
    if (members.length == 4) {
        members.forEach((member) => {
            const master = getCharacterMaster(member.name);
            if (master) {
                if (master.元素 in work) {
                    work[master.元素]++;
                } else {
                    work[master.元素] = 1;
                }
            }
        });
        if (Object.keys(work).length == 4) {
            result.push("元素共鳴なし");
        } else {
            Object.keys(work).forEach((key) => {
                if (work[key] >= 2) {
                    result.push(key + "元素共鳴");
                }
            });
        }
    }
    return result;
}
