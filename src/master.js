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

function getIconUrl(master) {
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

export const CHARACTER_MASTER_LIST = [];
Object.keys(CHARACTER_MASTER).forEach(key => {
    const master = CHARACTER_MASTER[key];
    master.key = key;
    master.import = master.import.replace(/^public/, '');
    master.icon_url = getIconUrl(master);
    CHARACTER_MASTER_LIST.push(CHARACTER_MASTER[key]);
});

export const WEAPON_MASTER = {
    片手剣: SWORD_MASTER,
    両手剣: CLAYMORE_MASTER,
    長柄武器: POLEARM_MASTER,
    弓: BOW_MASTER,
    法器: CATALYST_MASTER,
};
Object.keys(WEAPON_MASTER).forEach(key2 => {
    const master = WEAPON_MASTER[key2];
    Object.keys(master).forEach(key => {
        master[key].key = key;
        master[key].import = master[key].import.replace(/^public/, '');
        master[key].icon_url = getIconUrl(master[key]);
    });
})
const SWORD_MASTER_LIST = Object.keys(SWORD_MASTER).map(key => SWORD_MASTER[key]);
const CLAYMORE_MASTER_LIST = Object.keys(CLAYMORE_MASTER).map(key => CLAYMORE_MASTER[key]);
const POLEARM_MASTER_LIST = Object.keys(POLEARM_MASTER).map(key => POLEARM_MASTER[key]);
const BOW_MASTER_LIST = Object.keys(BOW_MASTER).map(key => BOW_MASTER[key]);
const CATALYST_MASTER_LIST = Object.keys(CATALYST_MASTER).map(key => CATALYST_MASTER[key]);
export const WEAPON_MASTER_LIST = {
    片手剣: SWORD_MASTER_LIST,
    両手剣: CLAYMORE_MASTER_LIST,
    長柄武器: POLEARM_MASTER_LIST,
    弓: BOW_MASTER_LIST,
    法器: CATALYST_MASTER_LIST,
};

export const ARTIFACT_SET_MASTER_LIST = [];
Object.keys(ARTIFACT_SET_MASTER).forEach(key =>{
    const master = ARTIFACT_SET_MASTER[key];
    master.key = key;
    master.image = master.image.replace(/^public/, '');
    master.icon_url = getIconUrl(master);
    ARTIFACT_SET_MASTER_LIST.push(master);
});

const ARTIFACT_MAIN_MASTER_KEYLIST = [];
Object.keys(ARTIFACT_MAIN_MASTER).forEach(rarity => {
    const rarityArtifactMain = ARTIFACT_MAIN_MASTER[rarity];
    Object.keys(rarityArtifactMain).forEach(key => {
        if (!ARTIFACT_MAIN_MASTER_KEYLIST.includes(key)) {
            ARTIFACT_MAIN_MASTER_KEYLIST.push(key);
        }
    })
});

export const ARTIFACT_SUB_MASTER_KEYLIST = Object.keys(ARTIFACT_SUB_MASTER);

export const ENEMY_MASTER_LIST = Object.keys(ENEMY_MASTER).map(key => ({ key: key, ...ENEMY_MASTER[key] }));

export const ELEMENTAL_RESONANCE_MASTER_LIST = Object.keys(ELEMENTAL_RESONANCE_MASTER).map(key => ({ key: key, ...ELEMENTAL_RESONANCE_MASTER[key] }));

export const TEAM_OPTION_MASTER_LIST = Object.keys(TEAM_OPTION_MASTER).map(key => ({ key: key, ...TEAM_OPTION_MASTER[key] }));

export const OPTION1_MASTER_LIST = Object.keys(OPTION1_MASTER).map(key => ({ key: key, ...OPTION1_MASTER[key] }));

export const OPTION2_MASTER_LIST = Object.keys(OPTION2_MASTER).map(key => ({ key: key, ...OPTION2_MASTER[key] }));

export const ELEMENTAL_REACTION_MASTER_LIST = Object.keys(ELEMENTAL_REACTION_MASTER).map(key => ({ key: key, ...ELEMENTAL_REACTION_MASTER[key] }));

export const DICTIONARY_MASTER = { ...HOYO_DICTIONARY2, ...HOYO_DICTIONARY4, ...HOYO_DICTIONARY5, ...LOCAL_DICTIONARY };

export const CHARACTER_MASTER_DETAIL_MAP = new Map();
/**
 * 
 * @param {string} character 
 * @returns {Promise<any>}
 */
export async function getCharacterMasterDetail(character) {
    try {
        if (!CHARACTER_MASTER_DETAIL_MAP.has(character)) {
            const characterMaster = await fetch(CHARACTER_MASTER[character]['import']).then(resp => resp.json());
            CHARACTER_MASTER_DETAIL_MAP.set(character, characterMaster);
        }
        return CHARACTER_MASTER_DETAIL_MAP.get(character);
    } catch (error) {
        console.error(character);
        throw error;
    }
}

export const WEAPON_MASTER_DETAIL_MAP = new Map();
/**
 * 
 * @param {string} weapon 
 * @param {string} opt_weaponType 
 * @returns {any}
 */
export async function getWeaponMasterDetail(weapon, opt_weaponType = null) {
    try {
        if (!WEAPON_MASTER_DETAIL_MAP.has(weapon)) {
            let weaponTypeArr;
            if (opt_weaponType) weaponTypeArr = [opt_weaponType];
            else weaponTypeArr = Object.keys(WEAPON_MASTER);
            for (let weaponType of weaponTypeArr) {
                if (weapon in WEAPON_MASTER[weaponType]) {
                    const weaponMaster = await fetch(WEAPON_MASTER[weaponType][weapon]['import']).then(resp => resp.json());
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
