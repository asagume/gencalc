import _ from "lodash";
import { calculateArtifactStatsMain, calculateArtifactStats, calculateStats, calculateDamageResult } from "@/calculate";
import { overwriteObject } from "@/common";
import { TArtifactDetailInput, TCharacterInput, TConditionInput, TDamageResult, TOptionInput, TStats, TStatsInput, getDefaultArtifactDetailInput, getDefaultCharacterInput, getDefaultConditionInput, getDefaultDamageResultInput, getDefaultOptionInput, getDefaultStatsInput, loadRecommendation, makeBuildStorageKey, makeDamageDetailObjArrObjArtifactSets, makeDamageDetailObjArrObjCharacter, makeDamageDetailObjArrObjWeapon, makeDefaultBuildname, setupConditionValues, updateConditionsByTeam } from "@/input";
import { CHARACTER_MASTER, ELEMENTAL_RESONANCE_MASTER, TAnyObject, TCharacterDetail, TCharacterEntry, TCharacterKey, TWeaponEntry, TWeaponKey, TWeaponTypeKey, WEAPON_MASTER, getCharacterMasterDetail } from "@/master";
import { getElementalSkillActions } from "@/particlemaster";

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
    tags: string[],
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

export type TConstellation = {
    [key: string]: number,
};

export const NUMBER_OF_TEAMS = 10;
export const NUMBER_OF_MEMBERS = 4;

// 重撃の前に通常が挟まる武器、キャラクター
export const CHARGED_WITH_NORMAL_WEAPON = ['片手剣', '長柄武器'];
export const CHARGED_WITH_NORMAL_CHARACTER = ['鹿野院平蔵', 'リオセスリ'];
export const CHARGED_ONLY_CHARACTER = ['フリーナ'];

let memberId = 0;
const characterDetailMap = new Map<string, TCharacterDetail>();

export function getCharacterMaster(character: string) {
    let result;
    if (character && character in CHARACTER_MASTER) {
        result = CHARACTER_MASTER[character as TCharacterKey] as TCharacterEntry;
    }
    return result;
}

export async function setupCharacterDetailMap() {
    const list: Promise<void>[] = [];
    for (const character of Object.keys(CHARACTER_MASTER)) {
        list.push(getCharacterMasterDetail(character as TCharacterKey).then(response => {
            characterDetailMap.set(character, response);
        }));
    }
    await Promise.all(list);
}

export function getCharacterDetail(character: string) {
    return characterDetailMap.get(character);
}

export function getEnergyCost(character: string) {
    return characterDetailMap.get(character)?.元素爆発?.元素エネルギー ?? 0;
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

export function getDefaultMemberResult(): TMemberResult {
    return {
        characterInput: getDefaultCharacterInput(),
        artifactDetailInput: getDefaultArtifactDetailInput(),
        conditionInput: getDefaultConditionInput(),
        optionInput: getDefaultOptionInput(),
        statsInput: getDefaultStatsInput(),
        damageResult: getDefaultDamageResultInput(),
    }
}

export const calculateMemberResult = async (member: TMember, team: TTeam): Promise<TMemberResult> => {
    const result = getDefaultMemberResult();
    if (!member.name) return result;
    result.characterInput.character = member.name as TCharacterKey;
    result.characterInput.characterMaster = await getCharacterMasterDetail(result.characterInput.character);

    const DEFAULT_WEAPON: { [key: string]: TWeaponKey } = {
        '片手剣': '無鋒の剣',
        '両手剣': '訓練用大剣',
        '長柄武器': '新米の長槍',
        '弓': '狩猟弓',
        '法器': '生徒ノート'
    };
    result.characterInput.weapon = DEFAULT_WEAPON[result.characterInput.characterMaster.武器];

    const builddata = member.builddata;
    if (!builddata) return result;
    await loadRecommendation(result.characterInput, result.artifactDetailInput, result.conditionInput, result.optionInput, builddata);

    makeDamageDetailObjArrObjCharacter(result.characterInput);
    makeDamageDetailObjArrObjWeapon(result.characterInput);
    makeDamageDetailObjArrObjArtifactSets(result.characterInput);
    setupConditionValues(result.conditionInput, result.characterInput, result.optionInput);
    calculateArtifactStatsMain(
        result.artifactDetailInput.聖遺物ステータスメイン効果,
        result.artifactDetailInput.聖遺物メイン効果
    );
    calculateArtifactStats(result.artifactDetailInput);

    result.conditionInput.checkboxList.forEach((entry) => {
        result.conditionInput.conditionValues[entry.name] = false;
    });
    result.conditionInput.selectList.forEach((entry) => {
        result.conditionInput.conditionValues[entry.name] = 0;
    });
    await updateConditionsByTeam(result.characterInput, result.conditionInput, result.optionInput);

    // 元素共鳴
    if (getElementalResonance(team)) {
        const workObj = {} as TStats;
        getElementalResonance(team).filter(s => ['炎元素共鳴', '水元素共鳴', '草元素共鳴', '元素共鳴なし'].includes(s)).forEach(entry => {
            result.optionInput.elementalResonance.conditionValues[entry] = true;
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
        overwriteObject(result.optionInput.elementalResonance.conditionAdjustments, workObj);
    }

    calculateStats(result.statsInput, result.characterInput, result.artifactDetailInput, result.conditionInput, result.optionInput);
    calculateDamageResult(result.damageResult, result.characterInput, result.conditionInput, result.statsInput);

    return result;
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

export function makeBlankMember(id: number): TMember {
    return {
        id: id,
        name: '',
        buildname: undefined,
        builddata: undefined,
        tags: [],
        replacements: [],
    };
}

export function makeBlankTeam(id: number) {
    const team: TTeam = {
        id: id,
        name: 'チーム' + (id + 1),
        members: [] as TMember[],
        description: '',
        rotation: [],
        rotationDescription: '',
        tags: [],
    };
    for (let i = 0; i < NUMBER_OF_MEMBERS; i++) {
        team.members.push(makeBlankMember(memberId++));
    }
    return team;
}

export function initializeMember(member: TMember) {
    member.name = '';
    member.buildname = undefined;
    member.builddata = undefined;
    member.tags = [];
    member.replacements = [];
}

export function initializeTeam(team: TTeam) {
    team.name = 'チーム' + (team.id + 1);
    team.members.forEach((member) => {
        initializeMember(member);
    });
}

export function makeTeamsStr(teams: TTeam[]) {
    const work: TTeam[] = _.cloneDeep(teams);
    let id = 0;
    work.forEach((team) => {
        team.id = id++;
        team.members.forEach(member => {
            member.id = 0;
            member.builddata = undefined;
        })
        if (team.rotation?.length) {
            team.rotation.forEach(action => {
                action.id = 0;
            })
        }
    });
    return JSON.stringify(work, (key, value) => value !== null ? value : undefined);
}

export function copyTeams(output: TTeam[], input: any[], useBuilddata = false) {
    let actionId = 0;
    for (let i = 0; i < input.length; i++) {
        const src = input[i];
        let dst = output[i];
        if (!dst) {
            dst = makeBlankTeam(i);
            output.push(dst);
        }
        dst.name = src.name;
        for (let j = 0; j < dst.members.length; j++) {
            if (src.members?.length) {
                const srcMember = src.members[j];
                if (srcMember) {
                    dst.members[j].name = srcMember.name;
                    if (useBuilddata) {
                        dst.members[j].buildname = srcMember.buildname;
                        dst.members[j].builddata = srcMember.buildname ? getBuilddataFromStorage(srcMember.name, srcMember.buildname) : undefined;
                    } else {
                        dst.members[j].buildname = undefined;
                        dst.members[j].builddata = undefined;
                    }
                    dst.members[j].tags = srcMember.tags ?? [];
                    dst.members[j].replacements = srcMember.replacements ?? [];
                }
            }
        }
        dst.description = src.description ?? '';
        if (src.rotation?.length) {
            dst.rotation = _.cloneDeep(src.rotation);
            dst.rotation.forEach(rotation => {
                rotation.id = actionId++;
                if (rotation.action.startsWith('E')) {
                    const actions = getElementalSkillActions(rotation.member);
                    if (!actions.includes(rotation.action)) {
                        rotation.action = actions[0];
                    }
                }
            })
        }
        dst.rotationDescription = src.rotationDescription ?? '';
        dst.tags = src.tags ?? [];
    }
    if (output.length > input.length && output.length >= NUMBER_OF_TEAMS) {
        output.splice(input.length);
    }
}

export function getNormalAttackDan(name: string) {
    let dan = 1;
    const master = getCharacterDetail(name);
    if (master) {
        for (const detail of [master.特殊通常攻撃?.詳細, master.通常攻撃?.詳細]) {
            if (!detail) continue;
            let workDan = 1;
            detail.forEach((dmgDetail: any) => {
                if (dmgDetail.名前) {
                    const ret = dmgDetail.名前.match(/.*(\d)段.+/);
                    if (!ret) return;
                    const tempDan = Number(ret[1]);
                    if (tempDan > workDan) {
                        workDan = tempDan;
                    }
                }
            })
            if (dan < workDan) { // 元素スキル、元素爆発で通常攻撃が変化する場合は、段数の多い方を採用します
                dan = workDan;
            }
        }
    }
    return dan;
}
