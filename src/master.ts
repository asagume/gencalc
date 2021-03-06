export type TAnyObject = {
    [key: string]: any
}

export type TEntry = {
    key: string,
    icon_url: string,
}

export type TCharacter = {
    レアリティ: number,
    元素: string,
    武器: string,
    誕生日?: string,
    import: string,
}
export type TCharacterEntry = TCharacter | TEntry
export type TCharacterKey = keyof typeof CHARACTER_MASTER
export type TCharacterDetail = {
    名前: string,
    説明: string,
    icon_url: string,
    レアリティ: number,
    武器: TWeaponTypeKey,
    元素: string,
    baseInfo: any,
    ステータス: any,
    通常攻撃: any,
    重撃: any,
    落下攻撃: any,
    元素スキル: any,
    元素爆発: any,
    固有天賦: any[],
    命ノ星座?: any,
    特殊通常攻撃?: any,
    特殊重撃?: any,
    特殊落下攻撃?: any,
    その他天賦?: any,
    オプション初期値?: any,
    固有変数?: any,
    おすすめセット: any[],
}

export type TWeapon = {
    レアリティ: number,
    import: string,
}
export type TWeaponEntry = TWeapon | TEntry
export type TSwordKey = keyof typeof SWORD_MASTER;
export type TClaymoreKey = keyof typeof CLAYMORE_MASTER;
export type TPolearmKey = keyof typeof POLEARM_MASTER;
export type TBowKey = keyof typeof BOW_MASTER;
export type TCatalystKey = keyof typeof CATALYST_MASTER;
export type TWeaponTypeKey = '片手剣' | '両手剣' | '長柄武器' | '弓' | '法器';
export type TWeaponKey = TSwordKey | TClaymoreKey | TPolearmKey | TBowKey | TCatalystKey;
export type TWeaponDetail = {
    名前: string,
    説明: string,
    icon_url: string,
    レアリティ: number,
    種類: TWeaponTypeKey,
    ステータス: any,
    武器スキル?: any,
    オプション初期値?: any,
    固有変数?: any,
}

export type TArtifactSetEffect = {
    説明: string,
    詳細?: []
}
export type TArtifactSet = {
    レアリティ: number,
    image: string,
    '2セット効果'?: TArtifactSetEffect,
    '4セット効果'?: TArtifactSetEffect,
}
export type TArtifactSetEntry = TArtifactSet | TEntry
export type TArtifactSetKey = keyof typeof ARTIFACT_SET_MASTER;

export type TArtifactMainStat = keyof typeof ARTIFACT_MAIN_MASTER[5]
export type TArtifactMain = {
    5: TArtifactMainStat,
    4: TArtifactMainStat,
}

import CHARACTER_MASTER from '../public/data/CharacterMaster.json'// assert {type: 'json'}

import SWORD_MASTER from '../public/data/SwordMaster.json'// assert {type: 'json'}
import CLAYMORE_MASTER from '../public/data/ClaymoreMaster.json'// assert {type: 'json'}
import POLEARM_MASTER from '../public/data/PolearmMaster.json'// assert {type: 'json'}
import BOW_MASTER from '../public/data/BowMaster.json'// assert {type: 'json'}
import CATALYST_MASTER from '../public/data/CatalystMaster.json'// assert {type: 'json'}

import ARTIFACT_SET_MASTER from '../public/data/ArtifactSetMaster.json'// assert {type: 'json'}
import ARTIFACT_MAIN_MASTER from '../public/data/ArtifactMainMaster.json'// assert {type: 'json'}
import ARTIFACT_SUB_MASTER from '../public/data/ArtifactSubMaster.json'// assert {type: 'json'}

import ENEMY_MASTER from '../public/data/EnemyMaster.json'// assert {type: 'json'}

import ELEMENTAL_RESONANCE_MASTER from '../public/data/ElementalResonanceMaster.json'// assert {type: 'json'}
import TEAM_OPTION_MASTER from '../public/data/TeamOptionMaster.json'// assert {type: 'json'}
import OPTION1_MASTER from '../public/data/OptionMaster1.json'// assert {type: 'json'}
import OPTION2_MASTER from '../public/data/OptionMaster2.json'// assert {type: 'json'}

import ELEMENTAL_REACTION_MASTER from '../public/data/ElementalReactionMaster.json'// assert {type: 'json'}

import HOYO_DICTIONARY2 from '../public/data/HoYoDictionary2.json'// assert {type: 'json'}
import HOYO_DICTIONARY4 from '../public/data/HoYoDictionary4.json'// assert {type: 'json'}
import HOYO_DICTIONARY5 from '../public/data/HoYoDictionary5.json'// assert {type: 'json'}
import LOCAL_DICTIONARY from '../public/data/LocalDictionary.json'// assert {type: 'json'}

export {
    CHARACTER_MASTER,
    ARTIFACT_SET_MASTER,
    ARTIFACT_MAIN_MASTER,
    ARTIFACT_SUB_MASTER,
    ENEMY_MASTER,
    ELEMENTAL_RESONANCE_MASTER,
    TEAM_OPTION_MASTER,
    OPTION1_MASTER,
    OPTION2_MASTER,
    ELEMENTAL_REACTION_MASTER
};

function getIconUrl(master: TAnyObject) {
    if (master.icon_url) return master.icon_url;
    if (master.image) return master.image;
    if (master.import) {
        let result = master.import.replace('data/', 'images/');
        if (result.indexOf('characters/') != -1) {
            result = result.replace('characters/', 'characters/face/');
        }
        result = result.replace(/json$/, 'png');
        return result;
    }
    return null;
}

export const CHARACTER_MASTER_LIST: TCharacterEntry[] = [];
(Object.keys(CHARACTER_MASTER) as TCharacterKey[]).forEach(key => {
    const master: TCharacter = CHARACTER_MASTER[key];
    master.import = master.import.replace(/^public/, '');
    CHARACTER_MASTER_LIST.push({ ...master, key: key, icon_url: getIconUrl(master) });
});

const WEAPON_MASTER = {
    片手剣: SWORD_MASTER,
    両手剣: CLAYMORE_MASTER,
    長柄武器: POLEARM_MASTER,
    弓: BOW_MASTER,
    法器: CATALYST_MASTER,
};
(Object.keys(WEAPON_MASTER) as TWeaponTypeKey[]).forEach(key2 => {
    const typedMaster = WEAPON_MASTER[key2] as any; // お手上げ
    Object.keys(typedMaster).forEach(key => {
        const master = typedMaster[key];
        master.key = key;
        master.import = master.import.replace(/^public/, '');
        master.icon_url = getIconUrl(master);
    });
})
const SWORD_MASTER_LIST = (Object.keys(SWORD_MASTER) as TSwordKey[]).map(key => SWORD_MASTER[key]);
const CLAYMORE_MASTER_LIST = (Object.keys(CLAYMORE_MASTER) as TClaymoreKey[]).map(key => CLAYMORE_MASTER[key]);
const POLEARM_MASTER_LIST = (Object.keys(POLEARM_MASTER) as TPolearmKey[]).map(key => POLEARM_MASTER[key]);
const BOW_MASTER_LIST = (Object.keys(BOW_MASTER) as TBowKey[]).map(key => BOW_MASTER[key]);
const CATALYST_MASTER_LIST = (Object.keys(CATALYST_MASTER) as TCatalystKey[]).map(key => CATALYST_MASTER[key]);
export const WEAPON_MASTER_LIST = {
    片手剣: SWORD_MASTER_LIST,
    両手剣: CLAYMORE_MASTER_LIST,
    長柄武器: POLEARM_MASTER_LIST,
    弓: BOW_MASTER_LIST,
    法器: CATALYST_MASTER_LIST,
};

export const ARTIFACT_SET_MASTER_LIST: TArtifactSetEntry[] = [];
(Object.keys(ARTIFACT_SET_MASTER) as TArtifactSetKey[]).forEach(key => {
    const master = ARTIFACT_SET_MASTER[key] as any;
    master.image = master.image.replace(/^public/, '');
    master.key = key;
    master.icon_url = getIconUrl(master);
    ARTIFACT_SET_MASTER_LIST.push(master);
});

export const ARTIFACT_MAIN_MASTER_STATLIST: string[] = Object.keys(ARTIFACT_MAIN_MASTER[5]);

export const ARTIFACT_SUB_MASTER_STATLIST = Object.keys(ARTIFACT_SUB_MASTER);

export type TEnemy = {
    炎元素耐性: number,
    水元素耐性: number,
    風元素耐性: number,
    雷元素耐性: number,
    氷元素耐性: number,
    岩元素耐性: number,
    物理耐性: number,
}
export type TEnemyKey = keyof typeof ENEMY_MASTER;
export const ENEMY_MASTER_LIST = (Object.keys(ENEMY_MASTER) as TEnemyKey[])
    .map(key => ({ key: key, ...ENEMY_MASTER[key] }));

export type TElementalResonanceKey = keyof typeof ELEMENTAL_RESONANCE_MASTER;
export const ELEMENTAL_RESONANCE_MASTER_LIST = (Object.keys(ELEMENTAL_RESONANCE_MASTER) as TElementalResonanceKey[])
    .map(key => ({ key: key, ...ELEMENTAL_RESONANCE_MASTER[key] }));

export type TTeamOptionKey = keyof typeof TEAM_OPTION_MASTER;
export const TEAM_OPTION_MASTER_LIST = (Object.keys(TEAM_OPTION_MASTER) as TTeamOptionKey[])
    .map(key => ({ key: key, ...TEAM_OPTION_MASTER[key] }));

export type TOption1Key = keyof typeof OPTION1_MASTER;
export const OPTION1_MASTER_LIST = (Object.keys(OPTION1_MASTER) as TOption1Key[])
    .map(key => ({ key: key, ...OPTION1_MASTER[key] }));

export type TOption2Key = keyof typeof OPTION2_MASTER;
export const OPTION2_MASTER_LIST = (Object.keys(OPTION2_MASTER) as TOption2Key[])
    .map(key => ({ key: key, ...OPTION2_MASTER[key] }));

export type TElementalReactionKey = keyof typeof ELEMENTAL_REACTION_MASTER;
export const ELEMENTAL_REACTION_MASTER_LIST = (Object.keys(ELEMENTAL_REACTION_MASTER) as TElementalReactionKey[])
    .map(key => ({ key: key, ...ELEMENTAL_REACTION_MASTER[key] }));

export const DICTIONARY_MASTER = { ...HOYO_DICTIONARY2, ...HOYO_DICTIONARY4, ...HOYO_DICTIONARY5, ...LOCAL_DICTIONARY };

////////////////
////////////////
export function isPlainObject(value: any) {
    const myType = Object.prototype.toString.call(value);
    return myType === '[object Object]';
}

export function isString(value: any) {
    return typeof value === 'string' || value instanceof String;
}

function removeStrFromUrl(obj: any, str: string) {
    if (isPlainObject(obj)) {
        Object.keys(obj).forEach(key => {
            if (isPlainObject(obj[key])) {
                removeStrFromUrl(obj[key], str);
            } else if (isString(obj[key])) {
                obj[key] = obj[key].replace(str, '');
            }
        })
    }
}

const CHARACTER_MASTER_DETAIL_MAP = new Map();
/**
 * 
 * @param {string} character 
 * @returns {Promise<any>}
 */
export async function getCharacterMasterDetail(character: TCharacterKey): Promise<TCharacterDetail> {
    try {
        if (!CHARACTER_MASTER_DETAIL_MAP.has(character)) {
            const characterMaster = await fetch(CHARACTER_MASTER[character]['import']).then(resp => resp.json());
            removeStrFromUrl(characterMaster, 'public/');
            CHARACTER_MASTER_DETAIL_MAP.set(character, characterMaster);
        }
        return CHARACTER_MASTER_DETAIL_MAP.get(character);
    } catch (error) {
        console.error(character);
        throw error;
    }
}

const WEAPON_MASTER_DETAIL_MAP = new Map();
/**
 * 
 * @param weapon 
 * @param opt_weaponType 
 * @returns 
 */
export async function getWeaponMasterDetail(weapon: TWeaponKey, opt_weaponType?: TWeaponTypeKey): Promise<TWeaponDetail> {
    try {
        if (!WEAPON_MASTER_DETAIL_MAP.has(weapon)) {
            let weaponTypeArr;
            if (opt_weaponType) weaponTypeArr = [opt_weaponType];
            else weaponTypeArr = Object.keys(WEAPON_MASTER);
            for (const weaponType of weaponTypeArr) {
                if (weapon in WEAPON_MASTER[weaponType as TWeaponTypeKey]) {
                    const typedMaster: any = WEAPON_MASTER[weaponType as TWeaponTypeKey];
                    const url = typedMaster[weapon]['import'];
                    const weaponMaster: any = await fetch(url).then(resp => resp.json());
                    removeStrFromUrl(weaponMaster, 'public/');
                    WEAPON_MASTER_DETAIL_MAP.set(weapon, weaponMaster);
                    break;
                }
            }
        }
        return WEAPON_MASTER_DETAIL_MAP.get(weapon);
    } catch (error) {
        console.error(weapon, opt_weaponType);
        throw error;
    }
}

export const ELEMENT_COLOR_CLASS = {
    炎: 'pyro',
    水: 'hydro',
    風: 'anemo',
    雷: 'electro',
    草: 'dendro',
    氷: 'cryo',
    岩: 'geo'
};

export const ELEMENT_BG_COLOR_CLASS = {
    炎: 'pyro-bg',
    水: 'hydro-bg',
    風: 'anemo-bg',
    雷: 'electro-bg',
    草: 'dendro-bg',
    氷: 'cryo-bg',
    岩: 'geo-bg'
};

export const ELEMENT_IMG_SRC = {
    炎: 'images/element_pyro.png',
    水: 'images/element_hydro.png',
    風: 'images/element_anemo.png',
    雷: 'images/element_electro.png',
    // 草: 'images/element_dendro.png',
    氷: 'images/element_cryo.png',
    岩: 'images/element_geo.png'
};

export const WEAPON_IMG_SRC = {
    片手剣: 'images/characters/NormalAttack_sword.png',
    両手剣: 'images/characters/NormalAttack_claymore.png',
    長柄武器: 'images/characters/NormalAttack_polearm.png',
    弓: 'images/characters/NormalAttack_bow.png',
    法器: 'images/characters/NormalAttack_catalyst.png',
};

export const STAR_BACKGROUND_URL = {
    1: 'images/star1-bg.png',
    2: 'images/star2-bg.png',
    3: 'images/star3-bg.png',
    4: 'images/star4-bg.png',
    5: 'images/star5-bg.png'
};

export const IMG_SRC_DUMMY = "data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7";

export const ALLOW_LIST_LANG = ['zh-cn', 'zh-tw', 'de-de', 'en-us', 'es-es', 'fr-fr', 'id-id', 'ja-jp', 'ko-kr', 'pt-pt', 'ru-ru', 'th-th', 'vi-vn'];

export const キャラクター構成PROPERTY_MAP = new Map([
    ['キャラクター', null],
    ['レベル', null],
    ['命ノ星座', 0],
    ['通常攻撃レベル', 0],
    ['元素スキルレベル', 0],
    ['元素爆発レベル', 0],
    ['武器', null],
    ['武器レベル', 0],
    ['精錬ランク', 0],
    ['聖遺物セット効果1', null],
    ['聖遺物セット効果2', null],
    ['聖遺物メイン効果1', null],
    ['聖遺物メイン効果2', null],
    ['聖遺物メイン効果3', null],
    ['聖遺物メイン効果4', null],
    ['聖遺物メイン効果5', null],
    ['聖遺物サブ効果HP', 0],
    ['聖遺物サブ効果攻撃力', 0],
    ['聖遺物サブ効果防御力', 0],
    ['聖遺物サブ効果元素熟知', 0],
    ['聖遺物サブ効果会心率', 0],
    ['聖遺物サブ効果会心ダメージ', 0],
    ['聖遺物サブ効果元素チャージ効率', 0],
    ['聖遺物サブ効果HPP', 0],
    ['聖遺物サブ効果攻撃力P', 0],
    ['聖遺物サブ効果防御力P', 0],
    ['聖遺物優先するサブ効果1', null],
    ['聖遺物優先するサブ効果1上昇値', 0],
    ['聖遺物優先するサブ効果1上昇回数', 0],
    ['聖遺物優先するサブ効果2', null],
    ['聖遺物優先するサブ効果2上昇値', 0],
    ['聖遺物優先するサブ効果2上昇回数', 0],
    ['聖遺物優先するサブ効果3', null],
    ['聖遺物優先するサブ効果3上昇値', 0],
    ['聖遺物優先するサブ効果3上昇回数', 0]
]);

export const DAMAGE_CATEGORY_ARRAY = ['通常攻撃ダメージ', '重撃ダメージ', '落下攻撃ダメージ', '元素スキルダメージ', '元素爆発ダメージ'];

export const RECOMMEND_ABBREV_MAP = new Map([
    ['HP%', 'HP'], ['元素熟知', '熟'], ['元素チャージ効率', 'ﾁｬ'], ['会心率', '率'], ['会心ダメージ', 'ダ'], ['与える治療効果', '治']
]);

export const RECOMMEND_ABBREV_EN_MAP = new Map([
    ['HP%', 'HP'], ['攻撃力%', 'AT'], ['防御力%', 'DF'], ['元素熟知', 'EM'],
    ['会心率', 'CR'], ['会心ダメージ', 'CD'], ['元素チャージ効率', 'ER'], ['与える治療効果', 'HE'],
    ['炎元素ダメージバフ', 'Py'], ['水元素ダメージバフ', 'Hy'], ['風元素ダメージバフ', 'An'], ['雷元素ダメージバフ', 'El'], ['草元素ダメージバフ', 'De'], ['氷元素ダメージバフ', 'Cr'], ['岩元素ダメージバフ', 'Ge'], ['物理ダメージバフ', 'Ph'],
]);

