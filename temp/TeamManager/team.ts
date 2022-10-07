import { makeDefaultBuildname } from "@/input";
import { CHARACTER_MASTER, TCharacterKey } from "@/master";

export type TMember = {
    id: number;
    name: string;
    buildname: string | undefined;
    savedata: any | undefined;
};

export type TTeam = {
    id: number;
    name: string;
    members: TMember[];
};

export const NUMBER_OF_TEAMS = 10;
export const NUMBER_OF_MEMBERS = 4;

export function characterMaster(member: TMember) {
    let result;
    if (member.name && member.name in CHARACTER_MASTER) {
        result = CHARACTER_MASTER[member.name as TCharacterKey];
    }
    return result;
}

const BUILD_STORAGE_KEY_PREFIX = '構成_';

export function makeBuildStorageKey(character: string, buildname?: string) {
    let result = BUILD_STORAGE_KEY_PREFIX + character;
    if (buildname && buildname != makeDefaultBuildname(character)) {
        result += '_' + buildname;
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

export function getBuildStorageKeys(character?: string) {
    return Object.keys(localStorage).filter(s => s.startsWith(BUILD_STORAGE_KEY_PREFIX + (character ?? '')));
}

export function getBuilddataFromStorage(character: string, buildname?: string) {
    let result;
    const storageKey = makeBuildStorageKey(character, buildname);
    const storageValue = localStorage.getItem(storageKey);
    if (storageValue) result = JSON.parse(storageValue);
    return result;
}

