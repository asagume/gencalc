import { ARTIFACT_SET_MASTER, DAMAGE_CATEGORY_ARRAY, ENEMY_MASTER_LIST, getCharacterMasterDetail, getWeaponMasterDetail, IMG_SRC_DUMMY, RECOMMEND_ABBREV_MAP, TArtifactSet, TArtifactSetEntry, TArtifactSetKey, TCharacterDetail, TCharacterKey, TEnemyEntry, TWeaponDetail, TWeaponKey, キャラクター構成PROPERTY_MAP } from '@/master';
import { deepcopy, isNumber, isPlainObject, isString, overwriteObject } from './common';

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
    'クールタイム短縮',
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
    '与えるダメージ',
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
export const 敵元素ステータス_耐性ARRAY = [
    '敵炎元素耐性',
    '敵水元素耐性',
    '敵風元素耐性',
    '敵雷元素耐性',
    '敵草元素耐性',
    '敵氷元素耐性',
    '敵岩元素耐性',
    '敵物理耐性'
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
    ['その他', ステータスその他ARRAY],
    ['敵元素ステータス·耐性', 敵元素ステータス_耐性ARRAY],
]);

export const STAT_PERCENT_LIST = [
    ...高級ステータスARRAY, ...元素ステータス_ダメージARRAY, ...元素ステータス_耐性ARRAY, ...ダメージバフARRAY, ...元素反応バフARRAY, ...敵元素ステータス_耐性ARRAY
];

function makeStatusTenmplate() {
    const statsObj = {} as { [key: string]: number };
    ステータスARRAY_MAP.forEach((value) => {
        value.forEach(stat => {
            statsObj[stat] = 0;
        });
    });
    statsObj['会心率'] = 5;
    statsObj['会心ダメージ'] = 50;
    statsObj['元素チャージ効率'] = 100;
    statsObj['敵レベル'] = 0;
    statsObj['敵防御力'] = 0;
    return statsObj;
}
export const ステータスTEMPLATE = makeStatusTenmplate();
export type TStats = {
    [key: string]: number,
};

function makeEnemyStatusTemplate() {
    const statsObj = {} as { [key: string]: number };
    [元素ステータス_耐性ARRAY].forEach((value) => {
        value.forEach(stat => {
            statsObj[stat] = 0;
        });
    });
    statsObj['防御力'] = 0;
    return statsObj;
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

export const 聖遺物サブ効果ARRAY = [
    'HP',
    '攻撃力',
    '防御力',
    '元素熟知',
    '会心率',
    '会心ダメージ',
    '元素チャージ効率',
    '攻撃力%',
    'HP%',
    '防御力%',
];
export const 聖遺物優先するサブ効果ARRAY = [
    '攻撃力%',
    'HP%',
    '防御力%',
    '元素熟知',
    '会心率',
    '会心ダメージ',
    '元素チャージ効率',
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
    '炎元素ダメージバフ': 0,
    '水元素ダメージバフ': 0,
    '風元素ダメージバフ': 0,
    '雷元素ダメージバフ': 0,
    '草元素ダメージバフ': 0,
    '氷元素ダメージバフ': 0,
    '岩元素ダメージバフ': 0,
    '物理ダメージバフ': 0,
    '与える治療効果': 0,
};

export const 元素反応TEMPLATE = {
    元素: '炎',
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
export type TDamageResultElementalReaction = typeof 元素反応TEMPLATE;
export type TDamageResultElementalReactionKey = keyof typeof 元素反応TEMPLATE;

export type TDamageResultEntry = [string, string | null, number, number | null, number, string | null];    // 名前, 元素, 期待値, 会心, 非会心, 種類
export type TDamageResult = {
    元素反応: TDamageResultElementalReaction,
    通常攻撃: TDamageResultEntry[],
    重撃: TDamageResultEntry[],
    落下攻撃: TDamageResultEntry[],
    元素スキル: TDamageResultEntry[],
    元素爆発: TDamageResultEntry[],
    その他: TDamageResultEntry[],
    キャラクター注釈: string[],
    [key: string]: TDamageResultElementalReaction | TDamageResultEntry[] | string[],
};

export const DAMAGE_RESULT_TEMPLATE = {
    元素反応: deepcopy(元素反応TEMPLATE) as TDamageResultElementalReaction,
    通常攻撃: [] as TDamageResultEntry[],
    重撃: [] as TDamageResultEntry[],
    落下攻撃: [] as TDamageResultEntry[],
    元素スキル: [] as TDamageResultEntry[],
    元素爆発: [] as TDamageResultEntry[],
    その他: [] as TDamageResultEntry[],
    キャラクター注釈: [] as string[],
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


export type TDamageDetailObj = {
    名前: string | null,
    種類: string | null,
    元素: string | null,
    数値: number | string | Array<any> | null,
    条件: string | null,
    対象: string | null,
    上限: number | string | null,
    HIT数: number | null,
    ダメージバフ: string | null,
    元素付与無効: boolean | null,
    除外条件: string | null,
    適用条件: string | null,
};

export type TDamageDetail = {
    通常攻撃?: TDamageDetailObj[],
    重撃?: TDamageDetailObj[],
    落下攻撃?: TDamageDetailObj[],
    元素スキル?: TDamageDetailObj[],
    元素爆発?: TDamageDetailObj[],
    その他?: TDamageDetailObj[],
    ステータス変更系詳細: TDamageDetailObj[],
    天賦性能変更系詳細: TDamageDetailObj[],
    条件: Map<string, string[] | null>,
    排他: Map<string, string[] | null>,
};

export const ARTIFACT_SET_MASTER_DUMMY = {
    key: 'NONE' as TArtifactSetKey,
    レアリティ: 5,
    image: IMG_SRC_DUMMY,
} as TArtifactSet;

export const CHARACTER_INPUT_TEMPLATE = {
    character: 'アンバー' as TCharacterKey,
    characterMaster: {} as TCharacterDetail,
    突破レベル: 6,
    レベル: 90,
    命ノ星座: 0,
    通常攻撃レベル: 8,
    元素スキルレベル: 8,
    元素爆発レベル: 8,
    weapon: '西風猟弓' as TWeaponKey,
    weaponMaster: {} as TWeaponDetail,
    武器突破レベル: 6,
    武器レベル: 90,
    武器精錬ランク: 1,
    artifactSets: ['NONE' as TArtifactSetKey, 'NONE' as TArtifactSetKey],
    artifactSetMasters: [ARTIFACT_SET_MASTER_DUMMY, ARTIFACT_SET_MASTER_DUMMY] as TArtifactSetEntry[],
    damageDetailMyCharacter: null as TDamageDetail | null,
    damageDetailMyWeapon: null as TDamageDetail | null,
    damageDetailMyArtifactSets: null as TDamageDetail | null,
    buildname: '',
    saveDisabled: true,     // ローカルストレージへの構成保存不可か？
    removeDisabled: true,   // ローカルストレージの構成削除不可か？
};
export type TCharacterInput = typeof CHARACTER_INPUT_TEMPLATE;

export const ARTIFACT_DETAIL_INPUT_TEMPLATE = {
    聖遺物メイン効果: ['', '', '', '', ''],
    聖遺物優先するサブ効果: ['', '', ''],
    聖遺物優先するサブ効果上昇値: [4, 4, 4],
    聖遺物優先するサブ効果上昇回数: [4, 4, 4],
    聖遺物ステータス: deepcopy(聖遺物ステータスTEMPLATE),
    聖遺物ステータスメイン効果: deepcopy(聖遺物ステータスTEMPLATE),
    聖遺物ステータスサブ効果: deepcopy(聖遺物ステータスTEMPLATE),
    聖遺物優先するサブ効果Disabled: false,
};
export type TArtifactDetailInput = typeof ARTIFACT_DETAIL_INPUT_TEMPLATE;

export type TCheckboxEntry = {
    name: string;
};
export type TSelectEntry = {
    name: string;
    options: string[];
    required: boolean;
};
export const CONDITION_INPUT_TEMPLATE = {
    checkboxList: [] as TCheckboxEntry[],
    selectList: [] as TSelectEntry[],
    conditionValues: {} as { [key: string]: boolean | number | null },
    conditionAdjustments: {} as { [key: string]: number },
    攻撃元素: [null, null, null] as (string | null)[],
};
export type TConditionInput = typeof CONDITION_INPUT_TEMPLATE;

export const STATS_INPUT_TEMPLATE = {
    statsObj: deepcopy(ステータスTEMPLATE) as TStats,
    statAdjustments: deepcopy(ステータスTEMPLATE) as TStats,
    enemyMaster: ENEMY_MASTER_LIST[0] as TEnemyEntry,
};
for (const stat of Object.keys(STATS_INPUT_TEMPLATE.statAdjustments)) {
    STATS_INPUT_TEMPLATE.statAdjustments[stat] = 0;
}
export type TStatsInput = typeof STATS_INPUT_TEMPLATE;

export const OPTION_INPUT_TEMPLATE = {
    elementalResonanceChecked: {} as { [key: string]: boolean },
    elementalResonanceStatAdjustments: {} as TStats,
    supporterList: [],
    isSupporterOptionOpened: {} as { [key: string]: boolean },
    teamOptionConditionMap: {},
    teamOptionConditionValues: {},
    teamOptionStatAdjustments: {} as TStats,
    miscOptionConditionValues: {},
    miscOptionStatAdjustments: {} as TStats,
};
export type TOptionInput = typeof OPTION_INPUT_TEMPLATE;

export const SUPPORTER_INPUT_TEMPLATE = {
    characterInput: deepcopy(CHARACTER_INPUT_TEMPLATE) as TCharacterInput,
    artifactDetailInput: deepcopy(ARTIFACT_DETAIL_INPUT_TEMPLATE) as TArtifactDetailInput,
    conditionInput: deepcopy(CONDITION_INPUT_TEMPLATE) as TConditionInput,
    statusInput: deepcopy(STATS_INPUT_TEMPLATE) as TStatsInput,
};
export type TSupporterInput = typeof SUPPORTER_INPUT_TEMPLATE;

/** レベル文字列（1+,20,20+,...,90）を突破レベルとレベルに分割します */
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
            if (突破レベルレベルARRAY[i][0] > level) continue;
            if (突破レベルレベルARRAY[i][突破レベルレベルARRAY[i].length - 1] < level) continue;
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

/** おすすめセットのリストを作成します. [おすすめセットの名前, おすすめセットの内容, 上書き可不可][] */
export function makeRecommendationList(characterMaster: { [key: string]: any }, opt_buildData?: { [key: string]: any }): TRecommendation[] {
    const result: TRecommendation[] = [];

    const character = characterMaster['名前'];
    let isSavable: boolean | null = null;

    if (opt_buildData) {
        result.push({ name: 'IMPORTED DATA', build: opt_buildData, overwrite: false });
        isSavable = true;
        console.log(opt_buildData);
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

/** 聖遺物セット名の略称を作成します */
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

/** おすすめセットをロードします */
export async function loadRecommendation(
    characterInput: TCharacterInput,
    artifactDetailInput: TArtifactDetailInput,
    conditionInput: TConditionInput,
    build: { [key: string]: any }
) {
    console.log(loadRecommendation.name, build);

    try {
        const character = characterInput.character;
        const characterMaster = await getCharacterMasterDetail(character);
        characterInput.characterMaster = characterMaster;
        const artifactStatsMain = deepcopy(聖遺物ステータスTEMPLATE);
        const artifactStatsSub = deepcopy(聖遺物ステータスTEMPLATE);

        if ('レベル' in build) {
            [characterInput.突破レベル, characterInput.レベル] = parseLevelStr(build['レベル']);
        }
        ['命ノ星座', '通常攻撃レベル', '元素スキルレベル', '元素爆発レベル'].forEach(key => {
            if (key in build) {
                (characterInput as any)[key] = build[key];
            }
        });

        const weaponType = characterMaster['武器'];
        if ('武器' in build) {
            characterInput.weapon = build['武器'] as TWeaponKey;
            characterInput.weaponMaster = await getWeaponMasterDetail(characterInput.weapon, weaponType);
        }
        if ('武器レベル' in build) {
            [characterInput.武器突破レベル, characterInput.武器レベル] = parseLevelStr(build['武器レベル']);
        }
        if ('精錬ランク' in build) {
            characterInput.武器精錬ランク = build['精錬ランク'];
        }

        let prioritySubstatsDisabled = false;
        for (const key of Object.keys(build).filter((s: string) => s.startsWith('聖遺物サブ効果'))) {
            let toKey = key.replace(/^聖遺物サブ効果/, '');
            if (toKey != 'HP') toKey = toKey.replace(/P$/, '%');
            if (build[key]) {
                prioritySubstatsDisabled = true;
                artifactStatsSub[toKey] = Number(build[key]);
            }
        }
        artifactDetailInput.聖遺物優先するサブ効果Disabled = prioritySubstatsDisabled;
        overwriteObject(artifactDetailInput.聖遺物ステータスサブ効果, artifactStatsSub);

        ['聖遺物セット効果1', '聖遺物セット効果2'].forEach((key, index) => {
            if (!(key in build)) return;
            const artifactSet = build[key] as TArtifactSetKey;
            if (artifactSet && artifactSet in ARTIFACT_SET_MASTER) {
                characterInput.artifactSets[index] = artifactSet;
                characterInput.artifactSetMasters[index] = ARTIFACT_SET_MASTER[artifactSet] as TArtifactSetEntry;
            } else {
                characterInput.artifactSetMasters[index] = ARTIFACT_SET_MASTER_DUMMY as TArtifactSetEntry;
            }
        });

        ['聖遺物メイン効果1', '聖遺物メイン効果2'].forEach((key, index) => {
            if (key in build) {
                artifactDetailInput['聖遺物メイン効果'][index] = build[key];
            } else {
                artifactDetailInput['聖遺物メイン効果'][index] = ['5_HP', '5_攻撃力'][index];
            }
        });
        ['聖遺物メイン効果3', '聖遺物メイン効果4', '聖遺物メイン効果5'].forEach((key, index) => {
            if (!(key in build)) return;
            const mainstat = build[key];
            artifactDetailInput['聖遺物メイン効果'][index + 2] = mainstat;
        });
        // for (const entry of artifactDetailInput['聖遺物メイン効果']) {
        //     const [rarity, stat] = entry.split('_');
        //     artifactStatsMain[stat] += (ARTIFACT_MAIN_MASTER as any)[rarity][stat];
        // }
        // overwriteObject(artifactDetailInput.聖遺物ステータスメイン効果, artifactStatsMain);

        ['聖遺物優先するサブ効果1', '聖遺物優先するサブ効果2', '聖遺物優先するサブ効果3'].forEach((key, index) => {
            if (!(key in build)) return;
            const substat = build[key];
            artifactDetailInput['聖遺物優先するサブ効果'][index] = substat;
        });
        ['聖遺物優先するサブ効果1上昇値', '聖遺物優先するサブ効果2上昇値', '聖遺物優先するサブ効果3上昇値'].forEach((key, index) => {
            if (!(key in build) && build[key] != -1) return;
            const substatValue = build[key];
            artifactDetailInput['聖遺物優先するサブ効果上昇値'][index] = substatValue;
        });
        ['聖遺物優先するサブ効果1上昇回数', '聖遺物優先するサブ効果2上昇回数', '聖遺物優先するサブ効果3上昇回数'].forEach((key, index) => {
            if (!(key in build) && build[key] != -1) return;
            const substatCount = build[key];
            artifactDetailInput['聖遺物優先するサブ効果上昇回数'][index] = substatCount;
        });

        Object.keys(build).filter(s => !キャラクター構成PROPERTY_MAP.has(s)).forEach(key => {
            conditionInput.conditionValues[key] = build[key];
        });

        console.log('build', build);
        console.log('聖遺物ステータスメイン効果', artifactDetailInput.聖遺物ステータスメイン効果, artifactStatsMain);
        console.log('聖遺物ステータスサブ効果', artifactDetailInput.聖遺物ステータスサブ効果, artifactStatsSub);
    }
    catch (error) {
        console.error(characterInput, artifactDetailInput, conditionInput, build);
        throw error;
    }
}

export function makeSavedata(characterInput: TCharacterInput, artifactDetailInput: TArtifactDetailInput, conditionInput: TConditionInput) {
    const resultObj = {} as any;

    // キャラクター
    resultObj['キャラクター'] = characterInput.character;
    // レベル
    resultObj['レベル'] = characterInput.レベル + (突破レベルレベルARRAY[characterInput.突破レベル][0] == characterInput.レベル ? '+' : '');
    // 命ノ星座
    resultObj['命ノ星座'] = characterInput.命ノ星座;
    // 通常攻撃レベル
    resultObj['通常攻撃レベル'] = characterInput.通常攻撃レベル;
    // 元素スキルレベル
    resultObj['元素スキルレベル'] = characterInput.元素スキルレベル;
    // 元素爆発レベル
    resultObj['元素爆発レベル'] = characterInput.元素爆発レベル;
    // 武器
    resultObj['武器'] = characterInput.weapon;
    // 武器レベル
    resultObj['武器レベル'] = characterInput.武器レベル + (突破レベルレベルARRAY[characterInput.突破レベル][0] == characterInput.武器レベル ? '+' : '');
    // 精錬ランク
    resultObj['精錬ランク'] = characterInput.武器精錬ランク;
    // 聖遺物セット効果1
    resultObj['聖遺物セット効果1'] = characterInput.artifactSets[0];
    // 聖遺物セット効果2
    resultObj['聖遺物セット効果2'] = characterInput.artifactSets[1];
    // 聖遺物メイン効果1
    resultObj['聖遺物メイン効果1'] = artifactDetailInput.聖遺物メイン効果[0];
    // 聖遺物メイン効果2
    resultObj['聖遺物メイン効果2'] = artifactDetailInput.聖遺物メイン効果[1];
    // 聖遺物メイン効果3
    resultObj['聖遺物メイン効果3'] = artifactDetailInput.聖遺物メイン効果[2];
    // 聖遺物メイン効果4
    resultObj['聖遺物メイン効果4'] = artifactDetailInput.聖遺物メイン効果[3];
    // 聖遺物メイン効果5
    resultObj['聖遺物メイン効果5'] = artifactDetailInput.聖遺物メイン効果[4];
    // 聖遺物サブ効果HP
    resultObj['聖遺物サブ効果HP'] = artifactDetailInput.聖遺物ステータスサブ効果['HP'];
    // 聖遺物サブ効果攻撃力
    resultObj['聖遺物サブ効果攻撃力'] = artifactDetailInput.聖遺物ステータスサブ効果['攻撃力'];
    // 聖遺物サブ効果防御力
    resultObj['聖遺物サブ効果防御力'] = artifactDetailInput.聖遺物ステータスサブ効果['防御力'];
    // 聖遺物サブ効果元素熟知
    resultObj['聖遺物サブ効果元素熟知'] = artifactDetailInput.聖遺物ステータスサブ効果['元素熟知'];
    // 聖遺物サブ効果会心率
    resultObj['聖遺物サブ効果会心率'] = artifactDetailInput.聖遺物ステータスサブ効果['会心率'];
    // 聖遺物サブ効果会心ダメージ
    resultObj['聖遺物サブ効果会心ダメージ'] = artifactDetailInput.聖遺物ステータスサブ効果['会心ダメージ'];
    // 聖遺物サブ効果元素チャージ効率
    resultObj['聖遺物サブ効果元素チャージ効率'] = artifactDetailInput.聖遺物ステータスサブ効果['元素チャージ効率'];
    // 聖遺物サブ効果HPP
    resultObj['聖遺物サブ効果HPP'] = artifactDetailInput.聖遺物ステータスサブ効果['HP%'];
    // 聖遺物サブ効果攻撃力P
    resultObj['聖遺物サブ効果攻撃力P'] = artifactDetailInput.聖遺物ステータスサブ効果['攻撃力%'];
    // 聖遺物サブ効果防御力P
    resultObj['聖遺物サブ効果防御力P'] = artifactDetailInput.聖遺物ステータスサブ効果['防御力%'];
    // 聖遺物優先するサブ効果1
    resultObj['聖遺物優先するサブ効果1'] = artifactDetailInput.聖遺物優先するサブ効果[0];
    // 聖遺物優先するサブ効果1上昇値
    resultObj['聖遺物優先するサブ効果1上昇値'] = artifactDetailInput.聖遺物優先するサブ効果上昇値[0];
    // 聖遺物優先するサブ効果1上昇回数
    resultObj['聖遺物優先するサブ効果1上昇回数'] = artifactDetailInput.聖遺物優先するサブ効果上昇回数[0];
    // 聖遺物優先するサブ効果2
    resultObj['聖遺物優先するサブ効果2'] = artifactDetailInput.聖遺物優先するサブ効果[1];
    // 聖遺物優先するサブ効果2上昇値
    resultObj['聖遺物優先するサブ効果2上昇値'] = artifactDetailInput.聖遺物優先するサブ効果上昇値[1];
    // 聖遺物優先するサブ効果2上昇回数
    resultObj['聖遺物優先するサブ効果2上昇回数'] = artifactDetailInput.聖遺物優先するサブ効果上昇回数[1];
    // 聖遺物優先するサブ効果3
    resultObj['聖遺物優先するサブ効果3'] = artifactDetailInput.聖遺物優先するサブ効果[2];
    // 聖遺物優先するサブ効果3上昇値
    resultObj['聖遺物優先するサブ効果3上昇値'] = artifactDetailInput.聖遺物優先するサブ効果上昇値[2];
    // 聖遺物優先するサブ効果3上昇回数
    resultObj['聖遺物優先するサブ効果3上昇回数'] = artifactDetailInput.聖遺物優先するサブ効果上昇回数[2];

    for (const entry of conditionInput.checkboxList) {
        if (conditionInput.conditionValues[entry.name]) {
            resultObj[entry.name] = true;
        }
    }
    for (const entry of conditionInput.selectList) {
        if (conditionInput.conditionValues[entry.name]) {
            resultObj[entry.name] = conditionInput.conditionValues[entry.name];
        }
    }

    return resultObj;
}

export const CHANGE_KIND_STATUS = 'ステータス変更系詳細';
export const CHANGE_KIND_TALENT = '天賦性能変更系詳細';

export function makeDamageDetailObjArrObjCharacter(characterInput: TCharacterInput): TDamageDetail {
    try {
        const characterMaster = characterInput.characterMaster as any;

        const result = {} as any;

        let myTalentDetail;
        let myTalentLevel: number;
        let myDefaultKind: string | null;
        let myDefaultElement: string | null;
        const myInputCategory = 'キャラクター';

        const myStatusChangeDetailObjArr = [] as any[];
        const myTalentChangeDetailObjArr = [] as any[];

        // 通常攻撃 重撃 落下攻撃
        myTalentLevel = characterInput['通常攻撃レベル'];
        myDefaultElement = characterMaster['武器'] === '法器' ? characterMaster['元素'] : null;
        ['通常攻撃', '重撃', '落下攻撃'].forEach(category => {
            myTalentDetail = characterMaster[category];
            myDefaultKind = category + 'ダメージ';
            result[category] = makeDamageDetailObjArr(myTalentDetail, myTalentLevel, myDefaultKind, myDefaultElement, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);
        });

        ['通常攻撃', '重撃', '落下攻撃'].forEach(category => {
            const workCategory = '特殊' + category;
            if (workCategory in characterMaster) {
                myTalentDetail = characterMaster[workCategory];
                if ('種類' in myTalentDetail) {
                    myDefaultKind = myTalentDetail['種類'];
                    switch (myDefaultKind) {
                        case '元素スキルダメージ':
                            myTalentLevel = characterInput['元素スキルレベル'];
                            break;
                        case '元素爆発ダメージ':
                            myTalentLevel = characterInput['元素爆発レベル'];
                            break;
                    }
                }
                if ('元素' in myTalentDetail) {
                    myDefaultElement = myTalentDetail['元素'];
                }
                const workObj = {
                    条件: myTalentDetail['条件'],
                    詳細: makeDamageDetailObjArr(myTalentDetail, myTalentLevel, myDefaultKind, myDefaultElement, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory)
                };
                result[workCategory] = workObj;
            }
        });

        // 元素スキル
        myTalentLevel = characterInput['元素スキルレベル'];
        myDefaultKind = '元素スキルダメージ';
        myDefaultElement = characterMaster['元素'];
        result['元素スキル'] = makeDamageDetailObjArr(characterMaster['元素スキル'], myTalentLevel, myDefaultKind, myDefaultElement, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);

        // 元素爆発
        myTalentLevel = characterInput['元素爆発レベル'];
        myDefaultKind = '元素爆発ダメージ';
        myDefaultElement = characterMaster['元素'];
        result['元素爆発'] = makeDamageDetailObjArr(characterMaster['元素爆発'], myTalentLevel, myDefaultKind, myDefaultElement, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);

        // その他戦闘天賦
        if ('その他戦闘天賦' in characterMaster) {
            characterMaster['その他戦闘天賦'].forEach((myTalentDetail: any) => {
                let workArr = [];
                if ('その他' in result) {
                    workArr = result['その他'];
                }
                workArr.concat(makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory));
                result['その他'] = workArr;
            });
        }

        // 固有天賦
        characterMaster['固有天賦'].forEach((myTalentDetail: any) => {
            let workArr = [];
            if ('その他' in result) {
                workArr = result['その他'];
            }
            workArr.concat(makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory));
            result['その他'] = workArr;
        });

        // 命ノ星座
        if ('命ノ星座' in characterMaster) {
            let c = 0;
            Object.keys(characterMaster['命ノ星座']).forEach(key => {
                if (c++ > characterInput.命ノ星座) return;
                myTalentDetail = characterMaster['命ノ星座'][key];
                // if ('詳細' in myTalentDetail) {
                //     myTalentDetail['詳細'].forEach((detailObj: { [x: string]: string; }) => {
                //         if ('条件' in detailObj && detailObj['条件']) {
                //             if (detailObj['条件'].indexOf('命ノ星座') == -1) {
                //                 detailObj['条件'] = '命ノ星座@' + key + '&' + detailObj['条件'];
                //             }
                //         } else {
                //             detailObj['条件'] = '命ノ星座@' + key;
                //         }
                //     });
                // }
                let workArr = [];
                if ('その他' in result) {
                    workArr = result['その他'];
                }
                workArr.concat(makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory));
                result['その他'] = workArr;
            });
        }

        // 風元素キャラクター
        if (characterMaster['元素'] == '風') {
            if (myTalentChangeDetailObjArr.filter(s => s.条件 && s.条件.startsWith('拡散@')).length == 0) {
                ['炎元素', '水元素', '雷元素', '氷元素'].forEach(cond => {
                    myTalentChangeDetailObjArr.push({
                        名前: null,
                        種類: '固有変数',
                        元素: null,
                        数値: null,
                        条件: '拡散@' + cond,
                        対象: null,
                        上限: null,
                        HIT数: null,
                        ダメージバフ: null,
                        元素付与無効: null,
                        除外条件: null,
                        適用条件: null
                    });
                });
            }
            if ('オプション初期値' in characterMaster) {
                if (Object.keys(characterMaster['オプション初期値']).filter(s => s == '拡散').length == 0) {
                    characterMaster['オプション初期値']['拡散'] = 1;
                }
            } else {
                characterMaster['オプション初期値'] = { 拡散: 1 };
            }
        }

        result[CHANGE_KIND_STATUS] = myStatusChangeDetailObjArr;
        result[CHANGE_KIND_TALENT] = myTalentChangeDetailObjArr;

        const conditionMap = new Map();
        const exclusionMap = new Map();
        myStatusChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            makeConditionExclusionMapFromStr(detailObj['条件'], conditionMap, exclusionMap);
        });
        myTalentChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            makeConditionExclusionMapFromStr(detailObj['条件'], conditionMap, exclusionMap);
        });
        // conditionMap.delete('命ノ星座');
        conditionMap.forEach((value, key) => {
            if (value && Array.isArray(value)) {
                if (!value[0].startsWith('required_')) {
                    conditionMap.set(key, ['', ...value]);
                }
            }
        });
        result['条件'] = conditionMap;
        result['排他'] = exclusionMap;

        characterInput.damageDetailMyCharacter = result;

        return result;
    } catch (error) {
        console.log(characterInput);
        throw error;
    }
}

export function makeDamageDetailObjArrObjWeapon(characterInput: any) {
    try {
        const name = characterInput.weapon;
        const weaponMaster = characterInput.weaponMaster;

        const result = {} as any;

        if (!name || !weaponMaster) return result;

        let myTalentDetail;
        const myLevel = characterInput.武器精錬ランク;
        const myInputCategory = '武器';

        const myStatusChangeDetailObjArr = [] as any[];
        const myTalentChangeDetailObjArr = [] as any[];

        if ('武器スキル' in weaponMaster) {
            myTalentDetail = weaponMaster['武器スキル'];
            result['武器'] = makeDamageDetailObjArr(myTalentDetail, myLevel, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);
        }

        result[CHANGE_KIND_STATUS] = myStatusChangeDetailObjArr;
        result[CHANGE_KIND_TALENT] = myTalentChangeDetailObjArr;

        const conditionMap = new Map();
        const exclusionMap = new Map();
        myStatusChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            let condition = detailObj['条件'];
            if (isPlainObject(condition) && myLevel in condition) {
                condition = condition[myLevel];
            }
            makeConditionExclusionMapFromStr(condition, conditionMap, exclusionMap);
        });
        myTalentChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            let condition = detailObj['条件'];
            if (isPlainObject(condition) && myLevel in condition) {
                condition = condition[myLevel];
            }
            makeConditionExclusionMapFromStr(condition, conditionMap, exclusionMap);
        });
        conditionMap.forEach((value, key) => {
            if (value && Array.isArray(value)) {
                if (!value[0].startsWith('required_')) {
                    conditionMap.set(key, ['', ...value]);
                }
            }
        });
        result['条件'] = conditionMap;
        result['排他'] = exclusionMap;

        characterInput.damageDetailMyWeapon = result;

        return result;
    } catch (error) {
        console.log(characterInput);
        throw error;
    }
}

export function makeDamageDetailObjArrObjArtifactSets(characterInput: any) {
    try {
        const result = [] as any;

        let myTalentDetail;
        const myInputCategory = '聖遺物セット効果';

        const myStatusChangeDetailObjArr = [] as any[];
        const myTalentChangeDetailObjArr = [] as any[];

        const artifactSetMasters = characterInput.artifactSetMasters.filter((s: any) => s);

        if (artifactSetMasters.length > 0) {
            if ('2セット効果' in artifactSetMasters[0]) {
                myTalentDetail = artifactSetMasters[0]['2セット効果'];
                result['聖遺物セット効果1'] = makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);
            }
            if (artifactSetMasters.length == 2) {
                if (artifactSetMasters[0] == artifactSetMasters[1]) {
                    myTalentDetail = artifactSetMasters[0]['4セット効果'];
                    result['聖遺物セット効果2'] = makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);
                } else {
                    myTalentDetail = artifactSetMasters[1]['2セット効果'];
                    result['聖遺物セット効果2'] = makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);
                }
            }
        }

        result[CHANGE_KIND_STATUS] = myStatusChangeDetailObjArr;
        result[CHANGE_KIND_TALENT] = myTalentChangeDetailObjArr;

        const conditionMap = new Map();
        const exclusionMap = new Map();
        myStatusChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            makeConditionExclusionMapFromStr(detailObj['条件'], conditionMap, exclusionMap);
        });
        myTalentChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            makeConditionExclusionMapFromStr(detailObj['条件'], conditionMap, exclusionMap);
        });
        conditionMap.forEach((value, key) => {
            if (value && Array.isArray(value)) {
                if (!value[0].startsWith('required_')) {
                    conditionMap.set(key, ['', ...value]);
                }
            }
        });
        result['条件'] = conditionMap;
        result['排他'] = exclusionMap;

        characterInput.damageDetailMyArtifactSets = result;

        return result;
    } catch (error) {
        console.log(characterInput);
        throw error;
    }
}

export const makeDamageDetailObjArr = function (
    talentDataObj: any,
    level: number | null,
    defaultKind: string | null,
    defaultElement: string | null,
    statusChangeDetailObjArr: any[],
    talentChangeDetailObjArr: any[],
    inputCategory: string,
    opt_condition = null): TDamageDetailObj[] {

    const resultArr = [] as any[];
    if (!('詳細' in talentDataObj)) return resultArr;

    talentDataObj['詳細'].forEach((detailObj: { [x: string]: any; }) => {
        let my種類 = '種類' in detailObj ? detailObj['種類'] : defaultKind;
        let my対象 = null;
        if (my種類.indexOf('.') != -1) {
            my対象 = my種類.substring(my種類.indexOf('.') + 1);
            my種類 = my種類.substring(0, my種類.indexOf('.'));
        } else if ('対象' in detailObj) {
            my対象 = detailObj['対象'];
        }
        let my数値 = null;
        if ('数値' in detailObj) {
            my数値 = detailObj['数値'];
            if (isNumber(my数値) || isString(my数値)) {
                // nop
            } else if (isPlainObject(my数値) && level && level in my数値) { // キャラクター|武器のサブステータス
                my数値 = my数値[level];
            } else {
                console.error(talentDataObj, level, defaultKind, defaultElement, my数値);
            }
            if (DAMAGE_CATEGORY_ARRAY.includes(my種類 + 'ダメージ') || my種類.endsWith('ダメージ')) {
                my数値 = analyzeFormulaStr(my数値, '攻撃力');
            } else {
                my数値 = analyzeFormulaStr(my数値, my種類);
            }
        }
        let my条件 = null;
        if ('条件' in detailObj) {
            if (isPlainObject(detailObj['条件']) && level && level in detailObj['条件']) {  // 武器は精錬ランクによって数値を変えたいときがあるので
                my条件 = detailObj['条件'][level];
            } else {
                my条件 = detailObj['条件'];
            }
        } else {
            my条件 = opt_condition;
        }
        let my上限 = null;
        if ('上限' in detailObj) {
            my上限 = detailObj['上限'];
            if (isPlainObject(my上限) && level && level in my上限) {   // 草薙の稲光
                my上限 = my上限[level];
            }
            my上限 = analyzeFormulaStr(my上限);
        }
        const resultObj = {
            名前: detailObj['名前'],
            種類: my種類,
            元素: '元素' in detailObj ? detailObj['元素'] : defaultElement,
            数値: my数値,
            条件: my条件,
            対象: my対象,
            上限: my上限,
            HIT数: 'HIT数' in detailObj ? detailObj['HIT数'] : null,
            ダメージバフ: 'ダメージバフ' in detailObj ? detailObj['ダメージバフ'] : null,
            元素付与無効: '元素付与無効' in detailObj ? detailObj['元素付与無効'] : inputCategory == '武器',
            除外条件: '除外条件' in detailObj ? detailObj['除外条件'] : null,
            適用条件: '適用条件' in detailObj ? detailObj['適用条件'] : null
        }
        if (statusChangeDetailObjArr != null) {
            if (resultObj['種類'] in ステータスTEMPLATE
                || resultObj['種類'].endsWith('%')
                || new RegExp('[自全].+バフ').exec(resultObj['種類'])
                || new RegExp('敵?[自全]元素耐性').exec(resultObj['種類'])
                || resultObj['種類'] == '別枠乗算'
                || ['継続時間', '発動回数', 'クールタイム', '使用回数'].includes(my種類)
                || ['敵防御力', '移動速度', '攻撃速度', '通常攻撃速度'].includes(my種類)
                || my種類.endsWith('継続時間')
                || my種類.endsWith('クールタイム')
                || my種類.endsWith('会心率')
                || my種類.endsWith('会心ダメージ')
            ) {
                resultObj['元素'] = '元素' in detailObj ? detailObj['元素'] : null;
                statusChangeDetailObjArr.push(resultObj);
                return;
            }
        }
        if (talentChangeDetailObjArr != null) {
            if (resultObj['種類'].endsWith('強化')
                || resultObj['種類'].endsWith('付与')
                || resultObj['種類'].endsWith('アップ')
                || resultObj['種類'] == '防御無視' ||
                resultObj['種類'] == '固有変数') {   // ex.元素爆発強化,氷元素付与
                resultObj['元素'] = '元素' in detailObj ? detailObj['元素'] : null;
                talentChangeDetailObjArr.push(resultObj);
                return;
            }
        }
        resultArr.push(resultObj);
    });
    return resultArr;
}

export const makeConditionExclusionMapFromStr = function (conditionStr: string, conditionMap: Map<string, string[] | null>, exclusionMap: Map<string, string[] | null>) {
    // 排他条件を抽出します
    let exclusionCond: string | null = null;
    let myCondStrArr = conditionStr.split('^');
    if (myCondStrArr.length > 1) {
        exclusionCond = myCondStrArr[1];
    }
    const myCondStr = myCondStrArr[0];
    if (myCondStr.indexOf('|') != -1) {
        // OR条件 for 申鶴
        myCondStrArr = myCondStr.split('|');
        myCondStrArr.forEach((myCondStr: string) => {
            makeConditionExclusionMapFromStrSub(myCondStr, conditionMap, exclusionMap, exclusionCond);
        });
    } else {
        // AND条件
        myCondStrArr = myCondStr.split('&');
        myCondStrArr.forEach((myCondStr: string) => {
            makeConditionExclusionMapFromStrSub(myCondStr, conditionMap, exclusionMap, exclusionCond);
        });
    }
}

function makeConditionExclusionMapFromStrSub(conditionStr: string, conditionMap: Map<string, string[] | null>, exclusionMap: Map<string, string[] | null>, exclusion: string | null) {
    const myCondStrArr = conditionStr.split('@');
    const myName = myCondStrArr[0];
    if (myCondStrArr.length == 1) {
        pushToMapValueArray(conditionMap, myName, null);
    } else if (myCondStrArr.length == 2) {
        if (myCondStrArr[1].indexOf('-') != -1) {
            const re = new RegExp('([^0-9\\.]*)([0-9\\.]+)-([0-9\\.]+)(.*)');
            const re2 = new RegExp('/([0-9\\.]+)(.*)');
            const reRet = re.exec(myCondStrArr[1]);
            if (reRet) {
                const prefix = reRet[1];
                const rangeStart = Number(reRet[2]);
                const rangeEnd = Number(reRet[3]);
                let step = rangeStart;
                let postfix = reRet[4];
                if (postfix) {
                    const re2Ret = re2.exec(postfix);
                    if (re2Ret) {
                        step = Number(re2Ret[1]);
                        postfix = re2Ret[2];
                    }
                }
                for (let i = rangeStart; i < rangeEnd; i = addDecimal(i, step, rangeEnd)) {
                    pushToMapValueArray(conditionMap, myName, prefix + String(i) + postfix);
                }
                pushToMapValueArray(conditionMap, myName, prefix + String(rangeEnd) + postfix);
            } else {
                pushToMapValueArray(conditionMap, myName, myCondStrArr[1]);
            }
        } else if (myCondStrArr[1].indexOf(',') != -1) {
            const re = new RegExp('([^0-9\\.]*)([0-9\\.,]+)(.*)');
            const reRet = re.exec(myCondStrArr[1]);
            if (reRet) {
                const prefix = reRet[1];
                const condValurArr = reRet[2].split(',');
                const postfix = reRet[3];
                condValurArr.forEach(value => {
                    pushToMapValueArray(conditionMap, myName, prefix + value + postfix);
                });
            }
        } else {
            pushToMapValueArray(conditionMap, myName, myCondStrArr[1]);
        }
    } else {
        console.error(conditionStr, conditionMap, exclusionMap);
    }
    if (exclusion) {
        exclusion.split(',').forEach(e => {
            pushToMapValueArray(exclusionMap, myName, e);
        });
    }
}

export function setupConditionValues(conditionInput: TConditionInput, characterInput: TCharacterInput) {
    try {
        const masters = [characterInput.characterMaster, characterInput.weaponMaster, ...characterInput.artifactSetMasters];
        for (const master of masters.filter(s => s)) {
            if ('オプション初期値' in master) {
                for (const key of Object.keys((master as any)['オプション初期値'])) {
                    if (!(key in conditionInput.conditionValues)) {
                        conditionInput.conditionValues[key] = (master as any)['オプション初期値'][key];
                    }
                }
            }
            // 聖遺物セット効果のオプション初期値は変な位置にあります
            if ('4セット効果' in master && 'オプション初期値' in (master as any)['4セット効果']) {
                for (const key of Object.keys((master as any)['4セット効果']['オプション初期値'])) {
                    if (!(key in conditionInput.conditionValues)) {
                        conditionInput.conditionValues[key] = (master as any)['4セット効果']['オプション初期値'][key];
                    }
                }
            }
        }

        const conditionValues = conditionInput.conditionValues;
        const checkboxList = conditionInput.checkboxList as TCheckboxEntry[];
        const selectList = conditionInput.selectList as TSelectEntry[];

        checkboxList.splice(0, checkboxList.length);
        selectList.splice(0, selectList.length);

        for (const myDamageDetail of [characterInput.damageDetailMyCharacter, characterInput.damageDetailMyWeapon, characterInput.damageDetailMyArtifactSets]) {
            if (myDamageDetail && myDamageDetail.条件 && myDamageDetail.排他) {
                if (myDamageDetail && myDamageDetail.条件) {
                    myDamageDetail.条件.forEach((value: string[] | null, key: string) => {
                        if (value) {
                            if (selectList.filter(s => s.name == key).length == 0) {
                                const required = value[0].startsWith("required_");
                                selectList.push({
                                    name: key,
                                    options: value,
                                    required: required,
                                });
                            }
                        } else {
                            if (checkboxList.filter(s => s.name == key).length == 0) {
                                checkboxList.push({ name: key });
                            }
                        }
                    });
                }

                const conditionMap: Map<string, any[] | null> = myDamageDetail.条件;
                const exclusionMap: Map<string, string[] | null> = myDamageDetail.排他;
                conditionMap.forEach((value, key) => {
                    if (key in conditionValues && conditionValues[key] != null) {
                        const exclusions = exclusionMap.get(key);
                        if (exclusions) {
                            for (const exclusion of exclusions) {
                                if (exclusion in conditionValues) {
                                    const conditionValue = conditionMap.get(exclusion);
                                    if (conditionValue !== undefined) {
                                        if (conditionValue === null) {  // checkbox
                                            conditionValues[exclusion] = false;
                                        } else {    // select
                                            conditionValues[exclusion] = 0;
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        if (value === null) {   // checkbox
                            let checked = true;
                            const arr = exclusionMap.get(key);
                            if (arr && arr.filter(s => conditionValues[s]).length > 0) {
                                checked = false;
                            }
                            conditionValues[key] = checked;
                        } else {   // select
                            let selectedIndex = value.length - 1;
                            const arr = exclusionMap.get(key);
                            if (arr && arr.filter(s => conditionValues[s]).length > 0) {
                                selectedIndex = 0;
                            }
                            conditionValues[key] = selectedIndex;
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error(conditionInput, characterInput);
        throw error;
    }
}

function pushToMapValueArray(map: Map<any, any>, key: any, value: any) {
    if (value == null) {
        if (!map.has(key)) {
            map.set(key, null);
        }
    } else if (map.has(key)) {
        const oldValue = map.get(key);
        if (oldValue == null) {
            map.set(key, [value]);
        } else if (!oldValue.includes(value)) {
            map.get(key).push(value);
        }
    } else {
        map.set(key, [value]);
    }
}

const addDecimal = function (value1: number, value2: number, opt_max: number | null = null) {
    let result = value1 + value2;
    if (opt_max != null) {
        result = Math.min(result, opt_max);
    }
    return result;
}

const analyzeFormulaStr = function (formulaStr: number | string, opt_defaultItem: string | null = null) {
    const resultArr = [] as any[];
    const re = new RegExp('([\\+\\-\\*/]?)([^\\+\\-\\*/]+)(.*)');
    let workStr = String(formulaStr);
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const reRet = re.exec(workStr);
        if (!reRet) {
            resultArr.push(workStr);
            break;
        }
        if (reRet[1]) { // + - * /
            resultArr.push(reRet[1]);
        }
        resultArr.push(analyzeFormulaStrSub(reRet[2], opt_defaultItem));
        if (!reRet[3]) {
            break;
        }
        workStr = reRet[3];
    }
    return resultArr;
}

function analyzeFormulaStrSub(formulaStr: string, opt_defaultItem: string | null = null) {
    const resultArr = [] as any;
    if (isNumber(formulaStr)) {
        resultArr.push(Number(formulaStr));
    } else {
        const strArr = (formulaStr as string).split('%');
        if (strArr.length == 1) {
            resultArr.push(strArr[0]);
        } else {
            resultArr.push(Number(strArr[0]) / 100);
            resultArr.push('*');
            if (strArr[1].length > 0) {
                resultArr.push(strArr[1]);
            } else if (opt_defaultItem != null) {
                resultArr.push(opt_defaultItem);
            }
        }
    }
    return resultArr;
}
