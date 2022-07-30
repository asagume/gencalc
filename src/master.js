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

export const 基礎ステータスARRAY = [
    '基礎HP',
    '基礎攻撃力',
    '基礎防御力'
];
export const 基本ステータスARRAY = [
    'HP上限',
    '攻撃力',
    '防御力',
    '元素熟知'
];
export const 高級ステータスARRAY = [
    '会心率',
    '会心ダメージ',
    '与える治療効果',
    '受ける治療効果',
    '元素チャージ効率',
    'シールド強化'
];
export const 元素ステータス_ダメージARRAY = [
    '炎元素ダメージバフ',
    '水元素ダメージバフ',
    '風元素ダメージバフ',
    '雷元素ダメージバフ',
    '草元素ダメージバフ',
    '氷元素ダメージバフ',
    '岩元素ダメージバフ',
    '物理ダメージバフ'
];
export const 元素ステータス_耐性ARRAY = [
    '炎元素耐性',
    '水元素耐性',
    '風元素耐性',
    '雷元素耐性',
    '草元素耐性',
    '氷元素耐性',
    '岩元素耐性',
    '物理耐性'
];
export const ダメージバフARRAY = [
    '通常攻撃ダメージバフ',
    '重撃ダメージバフ',
    '落下攻撃ダメージバフ',
    '元素スキルダメージバフ',
    '元素爆発ダメージバフ',
    '与えるダメージ'
];
export const 実数ダメージ加算ARRAY = [
    '通常攻撃ダメージアップ',
    '重撃ダメージアップ',
    '落下攻撃ダメージアップ',
    '元素スキルダメージアップ',
    '元素爆発ダメージアップ',
    '炎元素ダメージアップ',
    '水元素ダメージアップ',
    '風元素ダメージアップ',
    '雷元素ダメージアップ',
    '草元素ダメージアップ',
    '氷元素ダメージアップ',
    '岩元素ダメージアップ',
    '物理ダメージアップ'
];
export const 元素反応バフARRAY = [
    '蒸発',
    '溶解',
    '過負荷',
    '感電',
    '凍結',
    '超電導',
    '拡散',
    '結晶',
    '燃焼',
    '開花',
    '激化'
];
export const ステータスその他ARRAY = [
    'ダメージ軽減',
    'HP%',
    '攻撃力%',
    '防御力%',
    'HP+',
    '攻撃力+',
    '防御力+'
];

export const ステータスARRAY_MAP = new Map([
    ['基礎ステータス', 基礎ステータスARRAY],
    ['基本ステータス', 基本ステータスARRAY],
    ['高級ステータス', 高級ステータスARRAY],
    ['元素ステータス·ダメージ', 元素ステータス_ダメージARRAY],
    ['元素ステータス·耐性', 元素ステータス_耐性ARRAY],
    ['ダメージバフ', ダメージバフARRAY],
    ['実数ダメージ加算', 実数ダメージ加算ARRAY],
    ['元素反応バフ', 元素反応バフARRAY],
    ['その他', ステータスその他ARRAY]
]);

function makeStatusTenmplate() {
    const statusObj = {};
    ステータスARRAY_MAP.forEach((value, key) => {
        value.forEach(stat => {
            statusObj[stat] = 0;
        });
    });
    statusObj['会心率'] = 5;
    statusObj['会心ダメージ'] = 50;
    statusObj['元素チャージ効率'] = 100;
    return statusObj;
};
export const ステータスTEMPLATE = makeStatusTenmplate();

function makeEnemyStatusTemplate() {
    const statusObj = {};
    [元素ステータス_耐性ARRAY].forEach((value, key) => {
        value.forEach(stat => {
            statusObj[stat] = 0;
        });
    });
    statusObj['防御力'] = 0;
    return statusObj;
};
export const 敵ステータスTEMPLATE = makeEnemyStatusTemplate();

export const 聖遺物メイン効果_生の花ARRAY = [
    '5_HP', '4_HP'
];
export const 聖遺物メイン効果_死の羽ARRAY = [
    '5_攻撃力', '4_攻撃力'
];
export const 聖遺物メイン効果_時の砂ARRAY = [
    '5_元素チャージ効率',
    '5_HP%',
    '5_攻撃力%',
    '5_防御力%',
    '5_元素熟知',
    '4_元素チャージ効率',
    '4_HP%',
    '4_攻撃力%',
    '4_防御力%',
    '4_元素熟知'
];
export const 聖遺物メイン効果_空の杯ARRAY = [
    '5_炎元素ダメージバフ',
    '5_水元素ダメージバフ',
    '5_風元素ダメージバフ',
    '5_雷元素ダメージバフ',
    '5_草元素ダメージバフ',
    '5_氷元素ダメージバフ',
    '5_岩元素ダメージバフ',
    '5_物理ダメージバフ',
    '5_HP%',
    '5_攻撃力%',
    '5_防御力%',
    '5_元素熟知',
    '4_炎元素ダメージバフ',
    '4_水元素ダメージバフ',
    '4_風元素ダメージバフ',
    '4_雷元素ダメージバフ',
    '4_草元素ダメージバフ',
    '4_氷元素ダメージバフ',
    '4_岩元素ダメージバフ',
    '4_物理ダメージバフ',
    '4_HP%',
    '4_攻撃力%',
    '4_防御力%',
    '4_元素熟知'
];
export const 聖遺物メイン効果_理の冠ARRAY = [
    '5_会心率',
    '5_会心ダメージ',
    '5_HP%',
    '5_攻撃力%',
    '5_防御力%',
    '5_元素熟知',
    '5_与える治療効果',
    '4_会心率',
    '4_会心ダメージ',
    '4_HP%',
    '4_攻撃力%',
    '4_防御力%',
    '4_元素熟知',
    '4_与える治療効果'
];

export const 聖遺物優先するサブ効果ARRAY = [
    '会心率',
    '会心ダメージ',
    '元素チャージ効率',
    '攻撃力%',
    'HP%',
    '防御力%'
];

export const 聖遺物ステータスTEMPLATE = {
    'HP': 0,
    '攻撃力': 0,
    '防御力': 0,
    '元素熟知': 0,
    '会心率': 0,
    '会心ダメージ': 0,
    '元素チャージ効率': 0,
    'HP%': 0,
    '攻撃力%': 0,
    '防御力%': 0,
};

export const 元素反応TEMPLATE = {
    蒸発倍率: 0,
    溶解倍率: 0,
    過負荷ダメージ: 0,
    感電ダメージ: 0,
    超電導ダメージ: 0,
    拡散ダメージ: 0,
    拡散元素: '炎',
    結晶吸収量: 0,
    結晶元素: '炎',
    燃焼ダメージ: 0,
    激化ダメージ: 0,
    開花ダメージ: 0
};

export const 計算結果TEMPLATE = {
    通常攻撃: [],
    重撃: [],
    落下攻撃: [],
    元素スキル: [],
    元素爆発: [],
    その他: []
};

export const 突破レベルレベルARRAY = [
    Array.from({ length: 20 }, (_, i) => i + 1),
    Array.from({ length: 21 }, (_, i) => i + 20),
    Array.from({ length: 11 }, (_, i) => i + 40),
    Array.from({ length: 11 }, (_, i) => i + 50),
    Array.from({ length: 11 }, (_, i) => i + 60),
    Array.from({ length: 11 }, (_, i) => i + 70),
    Array.from({ length: 11 }, (_, i) => i + 80),
];

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
