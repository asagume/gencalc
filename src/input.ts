import { ARTIFACT_SET_MASTER, getCharacterMasterDetail, getWeaponMasterDetail, IMG_SRC_DUMMY, RECOMMEND_ABBREV_MAP, TArtifactSetKey } from '@/master';

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
    const statusObj = {} as { [key: string]: number };
    ステータスARRAY_MAP.forEach((value, key) => {
        value.forEach(stat => {
            statusObj[stat] = 0;
        });
    });
    statusObj['会心率'] = 5;
    statusObj['会心ダメージ'] = 50;
    statusObj['元素チャージ効率'] = 100;
    return statusObj;
}
export const ステータスTEMPLATE = makeStatusTenmplate();

function makeEnemyStatusTemplate() {
    const statusObj = {} as { [key: string]: number };
    [元素ステータス_耐性ARRAY].forEach((value, key) => {
        value.forEach(stat => {
            statusObj[stat] = 0;
        });
    });
    statusObj['防御力'] = 0;
    return statusObj;
}
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

const ARTIFACT_SET_MASTER_DUMMY = {
    key: 'dummy',
    image: IMG_SRC_DUMMY
};

export const CHARACTER_INPUT_TEMPLATE = {
    character: null,
    characterMaster: null,
    突破レベル: 6,
    レベル: 90,
    命ノ星座: 0,
    通常攻撃レベル: 8,
    元素スキルレベル: 8,
    元素爆発レベル: 8,
    weapon: null,
    weaponMaster: null,
    武器突破レベル: 6,
    武器レベル: 90,
    武器精錬ランク: 1,
    artifactSetMaster: [ARTIFACT_SET_MASTER_DUMMY, ARTIFACT_SET_MASTER_DUMMY],
};

export const ARTIFACT_DETAIL_INPUT_TEMPLATE = {
    聖遺物メイン効果: [null, null, null, null, null],
    聖遺物優先するサブ効果: [null, null, null],
    聖遺物優先するサブ効果上昇値: [0, 0, 0],
    聖遺物優先するサブ効果上昇回数: [8, 5, 5],
    subStatUpLists: [[], [], []],
    subStatUpIndices: [6, 6, 6],
    gensen: '厳選1ヶ月',
    gensenList: [null, '厳選初心者', '厳選1ヶ月', '厳選3ヶ月', '日々石割'],
    厳選目安一括変更Enabled: false,
    聖遺物ステータス: JSON.parse(JSON.stringify(聖遺物ステータスTEMPLATE)),
    聖遺物ステータス補正: JSON.parse(JSON.stringify(聖遺物ステータスTEMPLATE)),
    isステータス計算無効: false
};

export const CONDITION_INPUT_TEMPLATE = {
    isVisible: true,
    conditionValues: {},
    character: null,
    characterMaster: null,
    conditionAdjustments: {}
};

export const OPTION_INPUT_TEMPLATE = {
    isVisible: true,
    activeTab: 1,
    elementalResonanceConditionValues: {},
    elementalResonanceStatusAdjustment: {},
    supporterList: [],
    isSupporterOptionOpened: {},
    teamOptionConditionMap: {},
    teamOptionConditionValues: {},
    teamOptionStatusAdjustment: {},
    miscOptionConditionValues: {},
    miscOptionStatusAdjustment: {},
};

export const SUPPORTER_INPUT_TEMPLATE = {
    characterInput: CHARACTER_INPUT_TEMPLATE,
    artifactDetailInput: ARTIFACT_DETAIL_INPUT_TEMPLATE,
    conditionInput: CONDITION_INPUT_TEMPLATE,
    statusInput: {}
};

export function isString(value: any) {
    return typeof value === 'string' || value instanceof String;
}

export function isNumber(value: any) {
    return isFinite(value) && value != null;
}

export function isPlainObject(value: any) {
    const myType = Object.prototype.toString.call(value);
    return myType === '[object Object]';
}

/**
 * 
 * @param {string} levelStr 
 * @returns {[number, number]}
 */
export function parseLevelStr(levelStr: number | string): [number, number] {
    try {
        let level: number;
        if (isString(levelStr)) {
            level = Number(String(levelStr).replace('+', ''));
        } else {
            level = Number(levelStr);
        }
        let ascension = 0;
        for (let i = 突破レベルレベルARRAY.length - 1; i >= 0; i--) {
            if (突破レベルレベルARRAY[i][0] < level) continue;
            if (突破レベルレベルARRAY[i][突破レベルレベルARRAY[i].length - 1] > level) continue;
            ascension = i;
            if (String(levelStr).endsWith('+')) {
                ascension++;
            }
            break;
        }
        return [ascension, level];
    } catch (error) {
        console.error(levelStr);
        throw error;
    }
}

export type TRecommendation = {
    name: string,
    build: any,
    overwrite: boolean
}

/**
 * おすすめセットのリストを作成します.
 * 
 * @param {Object} characterMaster キャラクターマスター
 * @returns {[string, object, boolean][]} おすすめセットのリスト
 */
export function makeRecommendationList(characterMaster: { [key: string]: any }, opt_buildData?: { [key: string]: any }): TRecommendation[] {
    const result: TRecommendation[] = [];

    const character = characterMaster['名前'];
    let isSavable: boolean | null = null;

    if (opt_buildData) {
        result.push({ name: 'IMPORTED DATA', build: opt_buildData, overwrite: false });
        isSavable = true;
    }

    const storageKeyArr: string[] = [];
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('構成_' + character)) {
            storageKeyArr.push(key);
            if (isSavable == null) {
                isSavable = false;
            }
        }
    });
    storageKeyArr.sort();
    const re = new RegExp('^構成_' + character + '_');
    storageKeyArr.forEach(key => {
        let buildname;
        if (key == '構成_' + character) {
            buildname = 'あなたの' + character;
        } else {
            buildname = key.replace(re, '');
        }
        result.push({ name: buildname, build: JSON.parse(localStorage[key]), overwrite: true });
    });

    characterMaster['おすすめセット'].forEach((obj: { [key: string]: any }) => {
        const myRecommendation = obj;
        ['聖遺物優先するサブ効果1', '聖遺物優先するサブ効果2', '聖遺物優先するサブ効果3'].forEach(stat => {
            if (!(stat in obj)) {
                obj[stat] = null;
            }
        });
        const artifactRarerityArrArr = [[5, 5, 5, 5, 5], [4, 4, 5, 5, 5], [4, 4, 4, 5, 4]];
        let artifactRarerity4Num = 0;
        const artifactSet1 = myRecommendation['聖遺物セット効果1'] as TArtifactSetKey;
        const artifactSet2 = myRecommendation['聖遺物セット効果2'] as TArtifactSetKey;
        if (ARTIFACT_SET_MASTER[artifactSet1]['レアリティ'] == 4) {
            artifactRarerity4Num++;
        }
        if (ARTIFACT_SET_MASTER[artifactSet2]['レアリティ'] == 4) {
            artifactRarerity4Num++;
        }
        for (let i = 0; i < 2; i++) {
            const name = '聖遺物メイン効果' + (i + 1);
            if (!(name in myRecommendation)) {
                if (i == 0) {
                    myRecommendation[name] = artifactRarerityArrArr[artifactRarerity4Num][i] + '_HP';
                } else if (i == 1) {
                    myRecommendation[name] = artifactRarerityArrArr[artifactRarerity4Num][i] + '_攻撃力';
                }
            }
        }

        let buildname = myRecommendation['武器'];
        buildname += ' ';
        if (myRecommendation['聖遺物セット効果1'] == myRecommendation['聖遺物セット効果2']) {
            buildname += myRecommendation['聖遺物セット効果1'];
        } else {
            buildname += makeArtifactSetAbbrev(myRecommendation['聖遺物セット効果1']);
            buildname += '/';
            buildname += makeArtifactSetAbbrev(myRecommendation['聖遺物セット効果2']);
        }
        buildname += ' [';
        for (let i = 3; i <= 5; i++) {
            const statusName = myRecommendation['聖遺物メイン効果' + i].split('_')[1];
            if (RECOMMEND_ABBREV_MAP.has(statusName)) {
                buildname += RECOMMEND_ABBREV_MAP.get(statusName);
            } else {
                buildname += statusName.substring(0, 1);
            }
        }
        buildname += ']';
        result.push({ name: buildname, build: myRecommendation, overwrite: false });
    });

    return result;
}

/**
 * 聖遺物セット名の略称を作成します
 * 
 * @param {string} name 聖遺物セット名
 * @returns {string} 聖遺物セット名の略称
 */
function makeArtifactSetAbbrev(name: string): string {
    const abbrRe = /[\p{sc=Hiragana}\p{sc=Katakana}ー]+/ug;
    let abbr = name.replace(abbrRe, '');
    if (abbr.length > 2) {
        abbr = name.split(abbrRe).sort((a, b) => {
            return b.length - a.length;
        })[0];
    }
    if (abbr.length > 3) {
        abbr = abbr.substring(0, 2);
    }
    return abbr;
}

export async function loadRecommendation(characterInput: { [key: string]: any }, artifactDetailInput: { [key: string]: any }, conditionInput: { [key: string]: any }, recommendation: { [key: string]: any }) {
    try {
        const character = characterInput.character;
        const characterMaster = await getCharacterMasterDetail(character);
        characterInput.characterMaster = characterMaster;

        if ('レベル' in recommendation) {
            [characterInput.突破レベル, characterInput.レベル] = parseLevelStr(recommendation['レベル']);
        }
        ['命ノ星座', '通常攻撃レベル', '元素スキルレベル', '元素爆発レベル'].forEach(key => {
            if (key in recommendation) {
                characterInput[key] = recommendation[key];
            }
        });

        const weaponType = characterMaster['武器'];
        console.log(weaponType, recommendation);
        if ('武器' in recommendation) {
            characterInput.weapon = recommendation['武器'];
            characterInput.weaponMaster = await getWeaponMasterDetail(characterInput.weapon, weaponType);
        }
        if ('武器レベル' in recommendation) {
            [characterInput.武器突破レベル, characterInput.武器レベル] = parseLevelStr(recommendation['武器レベル']);
        }
        if ('精錬ランク' in recommendation) {
            characterInput.武器精錬ランク = recommendation['精錬ランク'];
        }

        ['聖遺物セット効果1', '聖遺物セット効果2'].forEach((key, index) => {
            if (!(key in recommendation)) return;
            const artifactSet = recommendation[key] as TArtifactSetKey;
            if (artifactSet && artifactSet in ARTIFACT_SET_MASTER) {
                characterInput.artifactSetMaster[index] = ARTIFACT_SET_MASTER[artifactSet];
            } else {
                characterInput.artifactSetMaster[index] = ARTIFACT_SET_MASTER_DUMMY;
            }
        });
        ['聖遺物メイン効果1', '聖遺物メイン効果2'].forEach((key, index) => {
            if (!(key in recommendation)) return;
            let mainStat = recommendation[key];
            if (!mainStat) {
                mainStat = ['5_HP', '5_攻撃力'][index];
            }
            artifactDetailInput['聖遺物メイン効果'][index] = mainStat;
        });
        ['聖遺物メイン効果3', '聖遺物メイン効果4', '聖遺物メイン効果5'].forEach((key, index) => {
            if (!(key in recommendation)) return;
            const mainstat = recommendation[key];
            artifactDetailInput['聖遺物メイン効果'][index + 2] = mainstat;
        });
        ['聖遺物優先するサブ効果1', '聖遺物優先するサブ効果2', '聖遺物優先するサブ効果3'].forEach((key, index) => {
            if (!(key in recommendation)) return;
            const substat = recommendation[key];
            artifactDetailInput['聖遺物優先するサブ効果'][index] = substat;
        });
        let hasSubstat = false;
        Object.keys(recommendation).filter(s => s.startsWith('聖遺物サブ効果')).forEach(key => {
            let stat = key.replace(/^聖遺物サブ効果/, '');
            if (stat in 聖遺物ステータスTEMPLATE) {
                // nop
            } else {
                stat = stat.replace(/P$/, '%');
            }
            artifactDetailInput['聖遺物ステータス'][stat] = Math.round(recommendation[key] * 10) / 10;
            hasSubstat = true;
        });
        artifactDetailInput.isステータス計算無効 = hasSubstat;

        // makeDamageDetailObjArrObjCharacter(characterInput);
        // makeDamageDetailObjArrObjWeapon(characterInput);
        // makeDamageDetailObjArrObjArtifactSet(characterInput);
    }
    catch (error) {
        console.error(characterInput, artifactDetailInput, conditionInput, recommendation);
        throw error;
    }
}

