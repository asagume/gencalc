import { ALL_ELEMENTS, ARTIFACT_SET_MASTER, ARTIFACT_STAT_JA_EN_ABBREV_MAP, ARTIFACT_SUB_MASTER, CHARACTER_MASTER, ELEMENTAL_REACTION_MASTER, ELEMENTAL_RESONANCE_MASTER, ELEMENTAL_RESONANCE_MASTER_LIST, ENEMY_MASTER_LIST, GENSEN_MASTER_LIST, getCharacterMasterDetail, getWeaponMasterDetail, IMG_SRC_DUMMY, NUMBER_OF_PRIORITY_SUBSTATS, OPTION1_MASTER_LIST, OPTION2_MASTER_LIST, RECOMMEND_ABBREV_MAP, TAnyObject, TArtifactSet, TArtifactSetEntry, TArtifactSetKey, TArtifactSubKey, TCharacterDetail, TCharacterKey, TEnemyEntry, TWeaponDetail, TWeaponKey, TWeaponTypeKey, WEAPON_MASTER, キャラクター構成PROPERTY_MAP } from '@/master';
import _ from 'lodash';
import { basename, isNumeric, overwriteObject } from './common';

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
    '物理ダメージアップ',
    '拡散ダメージアップ',
    '開花ダメージアップ',       // for ラウマ
    '烈開花ダメージアップ',     // for ラウマ
    '超開花ダメージアップ',     // for ラウマ
    '月感電ダメージアップ',     // for ナド・クライ
    '月開花ダメージアップ',     // for ラウマ
];
export const 元素反応バフARRAY = [
    '蒸発反応ボーナス',
    '溶解反応ボーナス',
    '過負荷反応ボーナス',
    '感電反応ボーナス',
    '凍結反応ボーナス',
    '超電導反応ボーナス',
    '拡散反応ボーナス',
    '結晶反応ボーナス',
    '燃焼反応ボーナス',
    '開花反応ボーナス',
    '烈開花反応ボーナス',
    '超開花反応ボーナス',
    '超激化反応ボーナス',
    '草激化反応ボーナス',
    '月感電反応ボーナス',           // for イネファ
    '月感電反応基礎ダメージアップ', // for イネファ
    '月開花反応ボーナス',           // for ラウマ
    '月開花反応基礎ダメージアップ', // for ラウマ
];
export const ステータスその他ARRAY = [
    'ダメージ軽減',
    'HP%',
    '攻撃力%',
    '防御力%',
    'HP+',
    '攻撃力+',
    '防御力+',
];
export const ステータス連動ARRAY = [
    'HP上限V1',
    '攻撃力V1',
    '防御力V1',
    '元素熟知V1',
    '会心率V1',
    '会心ダメージV1',
    '与える治療効果V1',
    '受ける治療効果V1',
    '元素チャージ効率V1',
];
export const ステータスチーム内最高ARRAY = [
    '元素熟知TOP',
];
export const 敵ステータス_元素耐性ARRAY = [
    '敵炎元素耐性',
    '敵水元素耐性',
    '敵風元素耐性',
    '敵雷元素耐性',
    '敵草元素耐性',
    '敵氷元素耐性',
    '敵岩元素耐性',
    '敵物理耐性'
];
export const 敵ステータス_その他ARRAY = [
    '敵防御力'
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
    ['ステータス連動', ステータス連動ARRAY],
    ['チーム内最高値', ステータスチーム内最高ARRAY],
    ['敵ステータス·元素耐性', 敵ステータス_元素耐性ARRAY],
    ['敵ステータス·その他', 敵ステータス_その他ARRAY],
]);

export const STAT_PERCENT_LIST = [
    ...高級ステータスARRAY, ...元素ステータス_ダメージARRAY, ...元素ステータス_耐性ARRAY, ...ダメージバフARRAY, ...元素反応バフARRAY, ...敵ステータス_元素耐性ARRAY,
    '別枠乗算', '敵防御力', 'ダメージ軽減',
];

export type TStats = {
    [key: string]: number,
};

function makeStatusTemplate() {
    const statsObj: TStats = {};
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
export const ステータスTEMPLATE = makeStatusTemplate();

function makeEnemyStatusTemplate() {
    const statsObj: TStats = {};
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
    'HP%',
    'HP',
    '攻撃力%',
    '攻撃力',
    '防御力%',
    '防御力',
    '元素熟知',
    '会心率',
    '会心ダメージ',
    '元素チャージ効率',
];
export const 聖遺物優先するサブ効果ARRAY = [
    '攻撃力%',
    'HP%',
    '防御力%',
    '元素熟知',
    '会心率',
    '会心ダメージ',
    '元素チャージ効率',
    'HP',
    '攻撃力',
    '防御力',
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
export type TArtifactStats = typeof 聖遺物ステータスTEMPLATE;
export type TArtifactStatsKey = keyof typeof 聖遺物ステータスTEMPLATE;

export type TDamageResultEntry = [string, string | null, number, number | null, number, string | null, number | null, number | null, number | null];    // 0:名前, 1:元素, 2:期待値, 3:会心, 4:非会心, 5:種類, 6:HIT数, 7:ダメージバフ, 8:敵の防御補正

export const 元素反応TEMPLATE = {
    元素: '炎',
    蒸発倍率_炎: 0,                 // 1.5倍
    蒸発倍率_水: 0,                 // 2倍
    溶解倍率_氷: 0,                 // 1.5倍
    溶解倍率_炎: 0,                 // 2倍
    過負荷ダメージ: 0,
    感電ダメージ: 0,
    超電導ダメージ: 0,
    拡散ダメージ: 0,
    拡散元素: '炎',
    結晶吸収量: 0,
    氷砕きダメージ: 0,
    燃焼ダメージ: 0,
    開花ダメージ: 0,
    烈開花ダメージ: 0,
    超開花ダメージ: 0,
    超激化ダメージ: 0,
    草激化ダメージ: 0,
    燃焼ダメージ会心率: 0,          // for ナヒーダ
    燃焼ダメージ会心ダメージ: 0,    // for ナヒーダ
    開花ダメージ会心率: 0,          // for ナヒーダ
    開花ダメージ会心ダメージ: 0,    // for ナヒーダ
    烈開花ダメージ会心率: 0,        // for ナヒーダ
    烈開花ダメージ会心ダメージ: 0,  // for ナヒーダ
    超開花ダメージ会心率: 0,        // for ナヒーダ
    超開花ダメージ会心ダメージ: 0,  // for ナヒーダ
    拡散ダメージ会心率: 0,          // for 夢見月瑞希
    拡散ダメージ会心ダメージ: 0,    // for 夢見月瑞希
    月感電ダメージ: 0,              // for イネファ
    月感電ダメージ会心率: 0,        // for イネファ
    月感電ダメージ会心ダメージ: 0,  // for イネファ
    月感電ダメージALL: [] as TDamageResultEntry[],  // for イネファ
};
Object.keys(元素反応TEMPLATE).forEach(key => {
    if (key.endsWith('ALL')) {
        const template: TDamageResultEntry[] = [];
        for (let i = 0; i < 4; i++) {
            template.push(['', null, 0, 0, 0, null, null, null, null]);  // 0:名前, 1:元素, 2:期待値, 3:会心, 4:非会心, 5:種類, 6:HIT数, 7:ダメージバフ, 8:敵の防御補正
        }
        (元素反応TEMPLATE as any)[key] = template;
    }
})

export type TDamageResultElementalReactionKey = keyof typeof 元素反応TEMPLATE;
export type TDamageResultElementalReaction = typeof 元素反応TEMPLATE;

export type TDamageResult = {
    元素反応: TDamageResultElementalReaction,
    通常攻撃: TDamageResultEntry[],
    重撃: TDamageResultEntry[],
    落下攻撃: TDamageResultEntry[],
    元素スキル: TDamageResultEntry[],
    元素爆発: TDamageResultEntry[],
    その他: TDamageResultEntry[],
    キャラクター注釈: string[],
    被ダメージ: any[],
    耐久スコア: any[],
    [key: string]: TDamageResultElementalReaction | TDamageResultEntry[] | string[],
};

export const DAMAGE_RESULT_TEMPLATE = {
    元素反応: _.cloneDeep(元素反応TEMPLATE) as TDamageResultElementalReaction,
    通常攻撃: [] as TDamageResultEntry[],
    重撃: [] as TDamageResultEntry[],
    落下攻撃: [] as TDamageResultEntry[],
    元素スキル: [] as TDamageResultEntry[],
    元素爆発: [] as TDamageResultEntry[],
    その他: [] as TDamageResultEntry[],
    キャラクター注釈: [] as string[],
    被ダメージ: [] as any[],
    耐久スコア: [] as any[],
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
    数値: string | null,
    条件: string | null,
    対象: string | null,
    上限: string | null,
    下限: string | null,
    HIT数: number | null,
    ダメージバフ: string | null,
    元素付与無効: boolean | null,
    除外条件: (string | object)[] | null,
    適用条件: (string | object)[] | null,
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
    条件: Map<string, string[] | object | null>,
    排他: Map<string, string[]>,
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
    damageDetailElementalResonance: null as TDamageDetail | null,
    buildname: '',
    recommendationSelectedIndex: 0,
    removeDisabled: true,   // ローカルストレージの構成削除不可か？
};
export type TCharacterInput = typeof CHARACTER_INPUT_TEMPLATE;

export const ARTIFACT_TEMPLATE = {
    name: '',
    rarity: 1,
    setname: 'NONE',
    cat_id: 1,
    mainStat: '',
    mainStatValue: 0,
    subStats: [
        { name: 'HP', value: 0 },
        { name: '攻撃力', value: 0 },
        { name: '防御力', value: 0 },
        { name: '元素熟知', value: 0 },
    ]
};
export type TArtifact = typeof ARTIFACT_TEMPLATE;

export const ARTIFACT_DETAIL_INPUT_TEMPLATE = {
    聖遺物メイン効果: ['', '', '', '', ''],
    聖遺物優先するサブ効果: _.fill(Array(NUMBER_OF_PRIORITY_SUBSTATS), ''),
    聖遺物優先するサブ効果上昇値: Array.from(GENSEN_MASTER_LIST[2].values),     // 厳選1ヶ月
    聖遺物優先するサブ効果上昇回数: Array.from(GENSEN_MASTER_LIST[2].counts),   // 厳選1ヶ月
    聖遺物ステータス: _.cloneDeep(聖遺物ステータスTEMPLATE) as TArtifactStats,
    聖遺物ステータスメイン効果: _.cloneDeep(聖遺物ステータスTEMPLATE) as TArtifactStats,
    聖遺物ステータスサブ効果: _.cloneDeep(聖遺物ステータスTEMPLATE) as TArtifactStats,
    聖遺物優先するサブ効果Disabled: false,
    artifact_list: [] as TArtifact[],
};
export type TArtifactDetailInput = typeof ARTIFACT_DETAIL_INPUT_TEMPLATE;

export type TCheckboxEntry = {
    name: string;
    displayName?: string;
};
export type TSelectEntry = {
    name: string;
    displayName?: string;
    options: string[];
    required: boolean;
};
export type TNumberEntry = {
    name: string;
    displayName?: string;
    min: number | string;
    max?: number | string | undefined;
    step: number;
    initial: number;
};
export type TConditionValues = {
    [key: string]: boolean | number | null,
};
export type TConditionAdjustments = {
    [key: string]: number | null,
};
export const CONDITION_INPUT_TEMPLATE = {
    optionDetails1: [] as TDamageDetailObj[],
    optionDetails2: [] as TDamageDetailObj[],
    conditionMap: new Map<string, string[] | object | null>(),
    exclusionMap: new Map<string, string[]>(),
    checkboxList: [] as TCheckboxEntry[],
    selectList: [] as TSelectEntry[],
    numberList: [] as TNumberEntry[],
    conditionValues: {} as TConditionValues,
    conditionAdjustments: {} as TConditionAdjustments,
    攻撃元素: [null, null, null] as (string | null)[],
};
export type TConditionInput = typeof CONDITION_INPUT_TEMPLATE;

export const STATS_INPUT_TEMPLATE = {
    statsObj: _.cloneDeep(ステータスTEMPLATE) as TStats,
    statAdjustments: _.cloneDeep(ステータスTEMPLATE) as TStats,
    statAdjustmentsEx: {} as TStats,
    enemyMaster: ENEMY_MASTER_LIST[0] as TEnemyEntry,
};
for (const stat of Object.keys(STATS_INPUT_TEMPLATE.statAdjustments)) {
    STATS_INPUT_TEMPLATE.statAdjustments[stat] = 0;
}
export type TStatsInput = typeof STATS_INPUT_TEMPLATE;

export function getDefaultCharacterInput(): TCharacterInput {
    return _.cloneDeep(CHARACTER_INPUT_TEMPLATE);
}
export function getDefaultArtifactDetailInput(): TArtifactDetailInput {
    return _.cloneDeep(ARTIFACT_DETAIL_INPUT_TEMPLATE);
}
export function getDefaultConditionInput(): TConditionInput {
    const result = _.cloneDeep(CONDITION_INPUT_TEMPLATE);
    result.selectList.push({
        name: '月兆',
        options: ['初照', '満照'],
        required: false,
    });
    result.numberList.push({
        name: '月反応ボーナス',
        min: 0,
        max: 36,
        step: 0.1,
        initial: 0,
    });
    result.checkboxList.push({
        name: '魔導秘儀',
    });
    return result;
}
export function getDefaultOptionInput(): TOptionInput {
    return _.cloneDeep(OPTION_INPUT_TEMPLATE);
}
export function getDefaultStatsInput(): TStatsInput {
    return _.cloneDeep(STATS_INPUT_TEMPLATE);
}
export function getDefaultDamageResultInput(): TDamageResult {
    return _.cloneDeep(DAMAGE_RESULT_TEMPLATE);
}

export type TElementalResonance = {
    conditionValues: TConditionValues,
    conditionAdjustments: TConditionAdjustments,
};

export type TMoonsign = {
    nascentGleam: boolean,
    ascendantGleam: boolean,
};

export const SUPPORTER_INPUT_TEMPLATE = {
    characterInput: getDefaultCharacterInput(),
    artifactDetailInput: getDefaultArtifactDetailInput(),
    conditionInput: getDefaultConditionInput(),
    statsInput: getDefaultStatsInput(),
    damageResult: getDefaultDamageResultInput(),
    optionDetails1: [] as TDamageDetailObj[],
    optionDetails2: [] as TDamageDetailObj[],
    conditionMap: new Map<string, string[] | object | null>(),
    exclusionMap: new Map<string, string[]>(),
};
export type TSupporterInput = typeof SUPPORTER_INPUT_TEMPLATE;
export type TSupporters = { [key: string]: TSupporterInput | undefined };

export const OPTION_INPUT_TEMPLATE = {
    elementalResonance: {
        conditionValues: {},
        conditionAdjustments: {},
    } as TElementalResonance,
    moonSign: {
        nascentGleam: false,
        ascendantGleam: false,
    } as TMoonsign,
    hexerei: false as boolean,
    supporterBuildname: {} as { [key: string]: string | undefined },
    supporters: {} as TSupporters,
    teamMembers: [] as string[],
    teamOption: _.cloneDeep(CONDITION_INPUT_TEMPLATE) as TConditionInput,
    miscOption: _.cloneDeep(CONDITION_INPUT_TEMPLATE) as TConditionInput,
};
export type TOptionInput = typeof OPTION_INPUT_TEMPLATE;

export type TRecommendation = {
    name: string,
    build: any,
    overwrite: boolean
}

export const CHANGE_KIND_STATUS = 'ステータス変更系詳細';
export const CHANGE_KIND_TALENT = '天賦性能変更系詳細';

/** レベル文字列（1+,20,20+,...,90）を突破レベルとレベルに分割します */
function parseLevelStr(levelStr: number | string): [number, number] {
    let result: [number, number] = [0, 1];
    try {
        let level: number;
        if (_.isString(levelStr)) {
            level = Number(String(levelStr).replace('+', ''));
        } else {
            level = Number(levelStr);
        }
        let ascension = 0;
        for (let i = (突破レベルレベルARRAY.length - 1); i >= 0; i--) {
            ascension = i;
            if (突破レベルレベルARRAY[i][0] > level) continue;
            if (突破レベルレベルARRAY[i][0] == level && !String(levelStr).endsWith('+')) {
                ascension--;
            }
            break;
        }
        result = [Math.max(0, ascension), level];
    } catch (error) {
        console.error(levelStr);
        // throw error;
    }
    return result;
}

export function makeDefaultBuildname(character: any) {
    return 'あなたの' + character;
}

export function makeBuildStorageKey(character: TCharacterKey | string, buildname?: string) {
    let result = '構成_' + character;
    if (buildname && buildname != makeDefaultBuildname(character)) {
        result += '_' + buildname;
    }
    return result;
}

export function makeOptionStorageKey(character: TCharacterKey | string, buildname?: string) {
    return 'オプション' + makeBuildStorageKey(character, buildname);
}

export function makeArtifactScoringStorageKey(character: TCharacterKey | string, buildname?: string) {
    return makeBuildStorageKey(character, buildname).replace(/^構成/, 'ArtifactScoring');
}

export function makeSupporterBuildnameStorageKey(character: TCharacterKey | string, buildname?: string) {
    return makeBuildStorageKey(character, buildname).replace(/^構成/, 'SupporterBuildname');
}

/** おすすめセットのリストを作成します. [おすすめセットの名前, おすすめセットの内容, 上書き可不可][] */
export function makeRecommendationList(
    characterMaster: TAnyObject,
    opt_buildData?: TAnyObject,
): TRecommendation[] {
    const result: TRecommendation[] = [];

    const character = characterMaster['名前'];
    let isSavable: boolean | null = null;

    if (opt_buildData) {
        result.push({ name: 'IMPORTED DATA', build: opt_buildData, overwrite: false });
        isSavable = true;
        console.log('IMPORTED DATA', opt_buildData);
    }

    const storageKeyArr: string[] = [];
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(makeBuildStorageKey(character))) {
            storageKeyArr.push(key);
            if (isSavable === null) {
                isSavable = false;
            }
        }
    });
    storageKeyArr.sort();
    const re = new RegExp('^構成_' + character + '_');
    storageKeyArr.forEach(key => {
        let buildname;
        if (key == makeBuildStorageKey(character)) {
            buildname = makeDefaultBuildname(character);
        } else {
            buildname = key.replace(re, '');
        }
        const buildObj = JSON.parse(localStorage[key]);
        const key2 = 'オプション' + key;
        if (key2 in localStorage) {
            const optionsObj = JSON.parse(localStorage[key2]);
            buildObj.options = optionsObj;
        }
        const key3 = key.replace(/^構成/, 'ArtifactScoring');
        if (key3 in localStorage) {
            const artifactScoringObj = JSON.parse(localStorage[key3]);
            buildObj.artifactScoring = artifactScoringObj;
        }
        const key4 = key.replace(/^構成/, 'SupporterBuildname');
        if (key4 in localStorage) {
            const supporterBuildnameObj = JSON.parse(localStorage[key4]);
            buildObj.supporterBuildname = supporterBuildnameObj;
        }
        result.push({ name: buildname, build: buildObj, overwrite: true });
    });

    characterMaster['おすすめセット'].forEach((obj: { [key: string]: any }) => {
        const myRecommendation = obj;
        for (let i = 1; i <= NUMBER_OF_PRIORITY_SUBSTATS; i++) {
            const subkey = '聖遺物優先するサブ効果' + i;
            if (!(subkey in obj)) {
                obj[subkey] = null;
            }
        }
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

export function makePrioritySubstatValueList(
    prioritySubstats: string[],
    index: number,
    opt_substat?: string
) {
    const result: number[] = [];
    if (prioritySubstats[index]) {
        if (!opt_substat) opt_substat = prioritySubstats[index];
        if (opt_substat && opt_substat in ARTIFACT_SUB_MASTER) {
            const valueArr = ARTIFACT_SUB_MASTER[opt_substat as TArtifactSubKey];
            for (let i = 0; i < valueArr.length; i++) {
                result.push(valueArr[i]);
                if (i < valueArr.length - 1) {
                    const diff = valueArr[i + 1] - valueArr[i];
                    result.push(valueArr[i] + diff / 2);
                }
            }
        }
    }
    return result;
}

export function makeEasyInputSubstatValueList(
    substat: TArtifactSubKey
) {
    const result: number[] = [];
    if (substat && substat in ARTIFACT_SUB_MASTER) {
        const valueArr = ARTIFACT_SUB_MASTER[substat];
        for (let i = 0; i < valueArr.length; i++) {
            result.push(valueArr[i]);
            if (i < valueArr.length - 1) {
                const diff = valueArr[i + 1] - valueArr[i];
                result.push(valueArr[i] + diff / 2);
            }
        }
    }
    return result;
}

/** おすすめセットをロードします */
export async function loadRecommendation(
    characterInput: TCharacterInput,
    artifactDetailInput: TArtifactDetailInput,
    conditionInput: TConditionInput,
    optionInput: TOptionInput,
    build: { [key: string]: any },
    buildname?: string,
) {
    try {
        const character = characterInput.character;
        const characterMaster = await getCharacterMasterDetail(character);
        characterInput.characterMaster = characterMaster;
        const artifactStatsSub = _.cloneDeep(聖遺物ステータスTEMPLATE);
        if (buildname) {
            characterInput.buildname = buildname;
        }

        if ('レベル' in build) {
            [characterInput.突破レベル, characterInput.レベル] = parseLevelStr(build['レベル']);
        }
        ['命ノ星座', '通常攻撃レベル', '元素スキルレベル', '元素爆発レベル'].forEach(key => {
            if (key in build) {
                (characterInput as any)[key] = Number(build[key]);
            }
        });

        const weaponType = characterMaster['武器'];
        if ('武器' in build) {
            if (Object.keys(WEAPON_MASTER[weaponType]).includes(build['武器'])) {
                let weaponKey = build['武器'];
                if (weaponKey in WEAPON_MASTER[weaponType]) {
                    characterInput.weapon = weaponKey as TWeaponKey;
                } else if (weaponKey.includes('·') && weaponKey.replace('·', '・') in WEAPON_MASTER[weaponType]) {
                    weaponKey = weaponKey.replace('·', '・');
                    characterInput.weapon = weaponKey as TWeaponKey;
                } else if (weaponKey.includes('・') && weaponKey.replace('・', '·') in WEAPON_MASTER[weaponType]) {
                    weaponKey = weaponKey.replace('・', '·');
                    characterInput.weapon = weaponKey as TWeaponKey;
                } else {
                    characterInput.weapon = Object.keys(WEAPON_MASTER[weaponType]).filter(s => s.startsWith('西風'))[0] as TWeaponKey;
                }
            } else {
                characterInput.weapon = Object.keys(WEAPON_MASTER[weaponType]).filter(s => s.startsWith('西風'))[0] as TWeaponKey;
            }
            characterInput.weaponMaster = await getWeaponMasterDetail(characterInput.weapon, weaponType);
        }
        if ('武器レベル' in build) {
            [characterInput.武器突破レベル, characterInput.武器レベル] = parseLevelStr(build['武器レベル']);
        }
        if ('精錬ランク' in build) {
            characterInput.武器精錬ランク = Number(build['精錬ランク']);
        }

        let prioritySubstatsDisabled = false;
        for (const key of Object.keys(build).filter((s: string) => s.startsWith('聖遺物サブ効果'))) {
            let toKey = key.replace(/^聖遺物サブ効果/, '');
            if (toKey != 'HP') toKey = toKey.replace(/P$/, '%');
            if (build[key] || build[key] == 0) {
                prioritySubstatsDisabled = true;
                (artifactStatsSub as any)[toKey] = Number(build[key]);
            }
        }
        artifactDetailInput.聖遺物優先するサブ効果Disabled = prioritySubstatsDisabled;

        const newArtifactSets: TArtifactSetKey[] = [];
        const newArtifactSetMasters: TArtifactSetEntry[] = [];
        ['聖遺物セット効果1', '聖遺物セット効果2'].forEach((key) => {
            const artifactSet: TArtifactSetKey = build[key] ?? 'NONE';
            newArtifactSets.push(artifactSet);
            newArtifactSetMasters.push(ARTIFACT_SET_MASTER[artifactSet] as TArtifactSetEntry);
        });
        characterInput.artifactSets.splice(0, characterInput.artifactSets.length, ...newArtifactSets);
        characterInput.artifactSetMasters.splice(0, characterInput.artifactSetMasters.length, ...newArtifactSetMasters);

        const newArtifactStatsMain: string[] = [];
        ['聖遺物メイン効果1', '聖遺物メイン効果2'].forEach((key, index) => {
            const value = build[key];
            newArtifactStatsMain.push(value ?? ['5_HP', '5_攻撃力'][index]);
            if (key in build) {
                artifactDetailInput['聖遺物メイン効果'][index] = build[key];
            } else {
                artifactDetailInput['聖遺物メイン効果'][index] = ['5_HP', '5_攻撃力'][index];
            }
        });
        ['聖遺物メイン効果3', '聖遺物メイン効果4', '聖遺物メイン効果5'].forEach((key) => {
            const value = build[key];
            newArtifactStatsMain.push(value ?? '');
        });
        artifactDetailInput['聖遺物メイン効果'].splice(0, artifactDetailInput['聖遺物メイン効果'].length, ...newArtifactStatsMain);

        const newPriotitySubstat: string[] = [];
        const newPriotitySubstatValue: number[] = [];
        const newPriotitySubstatCount: number[] = [];
        for (let i = 0; i < artifactDetailInput['聖遺物優先するサブ効果'].length; i++) {
            const subkey1 = '聖遺物優先するサブ効果' + (i + 1);
            const subkey2 = subkey1 + '上昇値';
            const subkey3 = subkey1 + '上昇回数';
            const substat = build[subkey1];
            const substatValue = build[subkey2];
            const substatCount = build[subkey3];
            newPriotitySubstat.push(substat ?? '');
            newPriotitySubstatValue.push(substatValue !== undefined ? Number(substatValue) : GENSEN_MASTER_LIST[2].values[i]);
            newPriotitySubstatCount.push(substatCount !== undefined ? Number(substatCount) : GENSEN_MASTER_LIST[2].counts[i]);
        }
        artifactDetailInput['聖遺物優先するサブ効果'].splice(0, artifactDetailInput['聖遺物優先するサブ効果'].length, ...newPriotitySubstat);
        artifactDetailInput['聖遺物優先するサブ効果上昇値'].splice(0, artifactDetailInput['聖遺物優先するサブ効果上昇値'].length, ...newPriotitySubstatValue);
        artifactDetailInput['聖遺物優先するサブ効果上昇回数'].splice(0, artifactDetailInput['聖遺物優先するサブ効果上昇回数'].length, ...newPriotitySubstatCount);

        Object.keys(build).filter(s => !キャラクター構成PROPERTY_MAP.has(s) && !['options', 'artifactScoring', 'supporterBuildname', 'artifact_list'].includes(s)).forEach(key => {
            if (build[key] === null) {
                conditionInput.conditionValues[key] = build[key];   // null
            } else if (_.isString(build[key])) {
                conditionInput.conditionValues[key] = Number(build[key]);
            } else {
                conditionInput.conditionValues[key] = build[key];
            }
        });

        if ('options' in build) {
            overwriteObject(optionInput.elementalResonance.conditionValues, {});
            overwriteObject(optionInput.teamOption.conditionValues, {});
            overwriteObject(optionInput.miscOption.conditionValues, {});
            optionInput.teamMembers.splice(0, optionInput.teamMembers.length);
            const keys = Object.keys(build.options);
            if (keys.length) {
                keys.forEach(key => {
                    if (key === 'teamMembers' && _.isArray(build.options[key])) {
                        optionInput.teamMembers.splice(0, optionInput.teamMembers.length, ...build.options[key]);
                    } else if (key in ELEMENTAL_RESONANCE_MASTER || key === 'dendroOption') {
                        // 元素共鳴
                        optionInput.elementalResonance.conditionValues[key] = build.options[key];
                    } else {
                        const astarIndex = key.indexOf('*');
                        if (astarIndex != -1) {
                            const workCharacter = key.substring(0, astarIndex);
                            if (workCharacter in CHARACTER_MASTER) {
                                // チーム
                                optionInput.teamOption.conditionValues[key] = build.options[key];
                            } else {
                                // その他
                                optionInput.miscOption.conditionValues[key] = build.options[key];
                            }
                        } else {
                            // その他
                            optionInput.miscOption.conditionValues[key] = build.options[key];
                        }
                    }
                })
            }
        }

        if ('supporterBuildname' in build) {
            const keys = Object.keys(build.supporterBuildname);
            if (keys.length) {
                overwriteObject(optionInput.supporterBuildname, {});
                keys.forEach(key => {
                    optionInput.supporterBuildname[key] = build.supporterBuildname[key];
                });
            }
        }

        if ('artifact_list' in build) {
            const ARTIFACT_KEYS = Object.keys(ARTIFACT_TEMPLATE).sort();
            const newList = build.artifact_list.filter((s: any) => _.isEqual(Object.keys(s).sort(), ARTIFACT_KEYS));
            artifactDetailInput.artifact_list.splice(0, artifactDetailInput.artifact_list.length, ...newList);
        } else {
            artifactDetailInput.artifact_list.splice(0, artifactDetailInput.artifact_list.length);
        }

        overwriteObject(artifactDetailInput.聖遺物ステータスサブ効果, artifactStatsSub);

        console.debug('loadRecommendation', characterInput, artifactDetailInput, conditionInput, build);
    }
    catch (error) {
        console.error(characterInput, artifactDetailInput, conditionInput, build);
        // throw error;
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
    // 聖遺物優先するサブ効果*,  聖遺物優先するサブ効果*上昇値, 聖遺物優先するサブ効果*上昇回数
    for (let i = 0; i < artifactDetailInput.聖遺物優先するサブ効果.length; i++) {
        const substat = artifactDetailInput.聖遺物優先するサブ効果[i];
        if (substat) {
            const key = '聖遺物優先するサブ効果' + (i + 1);
            resultObj[key] = substat;
            resultObj[key + '上昇値'] = artifactDetailInput.聖遺物優先するサブ効果上昇値[i];
            resultObj[key + '上昇回数'] = artifactDetailInput.聖遺物優先するサブ効果上昇回数[i];
        }
    }

    for (const entry of conditionInput.checkboxList) {
        resultObj[entry.name] = conditionInput.conditionValues[entry.name];
    }
    for (const entry of conditionInput.selectList) {
        resultObj[entry.name] = conditionInput.conditionValues[entry.name];
    }

    resultObj['artifact_list'] = artifactDetailInput.artifact_list;

    return resultObj;
}

export function makeOptionsSavedata(character: string, optionInput: TOptionInput) {
    const resultObj = {} as any;

    // 元素共鳴
    {
        const conditionValues = optionInput.elementalResonance.conditionValues;
        Object.keys(conditionValues).forEach(key => {
            if (conditionValues[key]) {
                resultObj[key] = conditionValues[key];
            }
        })
    }
    // チーム
    {
        const conditionValues = optionInput.teamOption.conditionValues;
        Object.keys(conditionValues).forEach(key => {
            if (key.startsWith(character + '*')) return;
            if (conditionValues[key]) {
                resultObj[key] = conditionValues[key];
            }
        });
        if (optionInput.teamMembers.length) {
            resultObj['teamMembers'] = optionInput.teamMembers;
        }
    }
    // その他
    {
        const conditionValues = optionInput.miscOption.conditionValues;
        Object.keys(conditionValues).forEach(key => {
            if (conditionValues[key]) {
                resultObj[key] = conditionValues[key];
            }
        })
    }

    return resultObj;
}

export function makeSupporterBuildnameSavedata(buildnameSelection: TAnyObject, optionInput: TOptionInput) {
    const result: TAnyObject = {};
    const conditionKeys = Object.keys(optionInput.teamOption.conditionValues);
    for (const supporter of Object.keys(buildnameSelection)) {
        if (!buildnameSelection[supporter]) continue;
        if (conditionKeys.filter(s => s.startsWith(supporter + '*')).length == 0) continue;
        result[supporter] = buildnameSelection[supporter];
    }
    return result;
}

export function makeDamageDetailObjArrObjCharacter(characterInput: TCharacterInput): TDamageDetail {
    const result = {} as any;
    try {
        const characterMaster = characterInput.characterMaster as any;

        let myTalentDetail;
        const myTalentLevelArr = [characterInput['通常攻撃レベル'], characterInput['元素スキルレベル'], characterInput['元素爆発レベル']];
        let myDefaultKind: string | null;
        let myDefaultElement: string | null;
        const myInputCategory = 'キャラクター';

        const myStatusChangeDetailObjArr = [] as any[];
        const myTalentChangeDetailObjArr = [] as any[];


        // 通常攻撃 重撃 落下攻撃
        myDefaultElement = characterMaster['武器'] === '法器' ? characterMaster['元素'] : null;
        ['通常攻撃', '重撃', '落下攻撃'].forEach(category => {
            myTalentDetail = characterMaster[category];
            myDefaultKind = category + 'ダメージ';
            result[category] = makeDamageDetailObjArr(myTalentDetail, myTalentLevelArr, myDefaultKind, myDefaultElement, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);
        });

        ['通常攻撃', '重撃', '落下攻撃'].forEach(category => {
            const workCategory = '特殊' + category;
            let workTalentLevelArr = myTalentLevelArr;
            if (workCategory in characterMaster) {
                myTalentDetail = characterMaster[workCategory];
                if ('種類' in myTalentDetail) {
                    myDefaultKind = myTalentDetail['種類'];
                    let myLevel;
                    switch (myDefaultKind) {
                        case '通常攻撃ダメージ':
                        case '重撃ダメージ':
                        case '落下攻撃ダメージ':
                            myLevel = myTalentLevelArr[0];
                            workTalentLevelArr = [myLevel, myLevel, myLevel];
                            break;
                        case '元素スキルダメージ':
                            myLevel = myTalentLevelArr[1];
                            workTalentLevelArr = [myLevel, myLevel, myLevel];
                            break;
                        case '元素爆発ダメージ':
                            myLevel = myTalentLevelArr[2];
                            workTalentLevelArr = [myLevel, myLevel, myLevel];
                            break;
                    }
                }
                if ('元素' in myTalentDetail) {
                    myDefaultElement = myTalentDetail['元素'];
                }
                const workObj = {
                    条件: myTalentDetail['条件'],
                    詳細: makeDamageDetailObjArr(myTalentDetail, workTalentLevelArr, myDefaultKind, myDefaultElement, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory)
                };
                result[workCategory] = workObj;
            }
        });

        // 元素スキル
        myDefaultKind = '元素スキルダメージ';
        myDefaultElement = characterMaster['元素'];
        result['元素スキル'] = makeDamageDetailObjArr(characterMaster['元素スキル'], myTalentLevelArr, myDefaultKind, myDefaultElement, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);

        // 元素爆発
        myDefaultKind = '元素爆発ダメージ';
        myDefaultElement = characterMaster['元素'];
        result['元素爆発'] = makeDamageDetailObjArr(characterMaster['元素爆発'], myTalentLevelArr, myDefaultKind, myDefaultElement, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);

        result['その他'] = [] as TDamageDetailObj[];

        // その他戦闘天賦
        if ('その他戦闘天賦' in characterMaster) {
            characterMaster['その他戦闘天賦'].forEach((myTalentDetail: any) => {
                const workArr = makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);
                if (workArr.length > 0) result['その他'].push(...workArr);
            });
        }

        // 固有天賦
        characterMaster['固有天賦'].forEach((myTalentDetail: any) => {
            const workArr = makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);
            if (workArr.length > 0) result['その他'].push(...workArr);
        });

        // 命ノ星座
        if ('命ノ星座' in characterMaster) {
            Object.keys(characterMaster['命ノ星座']).forEach(key => {
                if (Number(key) > characterInput.命ノ星座) return;
                myTalentDetail = characterMaster['命ノ星座'][key];
                const workArr = makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);
                if (workArr.length > 0) result['その他'].push(...workArr);
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
                        下限: null,
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
            if (value && _.isArray(value)) {
                if (!value[0].startsWith('required_')) {
                    conditionMap.set(key, ['', ...value]);
                }
            }
        });
        result['条件'] = conditionMap;
        result['排他'] = exclusionMap;

        characterInput.damageDetailMyCharacter = result;
    } catch (error) {
        console.error(characterInput, result);
        // throw error;
    }
    return result;
}

export function makeDamageDetailObjArrObjWeapon(characterInput: any) {
    const result = {} as any;
    try {
        const name = characterInput.weapon;
        const weaponMaster = characterInput.weaponMaster;
        if (!name || !weaponMaster) return result;

        let myTalentDetail;
        const myLevel = characterInput.武器精錬ランク;
        const myInputCategory = '武器';

        const myStatusChangeDetailObjArr = [] as any[];
        const myTalentChangeDetailObjArr = [] as any[];

        if ('武器スキル' in weaponMaster) {
            myTalentDetail = weaponMaster['武器スキル'];
            result['その他'] = makeDamageDetailObjArr(myTalentDetail, myLevel, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);
        }

        result[CHANGE_KIND_STATUS] = myStatusChangeDetailObjArr;
        result[CHANGE_KIND_TALENT] = myTalentChangeDetailObjArr;

        const conditionMap = new Map();
        const exclusionMap = new Map();
        myStatusChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            let condition = detailObj['条件'];
            if (_.isPlainObject(condition) && myLevel in condition) {
                condition = condition[myLevel];
            }
            makeConditionExclusionMapFromStr(condition, conditionMap, exclusionMap);
        });
        myTalentChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            let condition = detailObj['条件'];
            if (_.isPlainObject(condition) && myLevel in condition) {
                condition = condition[myLevel];
            }
            makeConditionExclusionMapFromStr(condition, conditionMap, exclusionMap);
        });
        conditionMap.forEach((value, key) => {
            if (value && _.isArray(value)) {
                if (!value[0].startsWith('required_')) {
                    conditionMap.set(key, ['', ...value]);
                }
            }
        });
        result['条件'] = conditionMap;
        result['排他'] = exclusionMap;

        characterInput.damageDetailMyWeapon = result;
    } catch (error) {
        console.error(characterInput, result);
        // throw error;
    }
    return result;
}

export function makeDamageDetailObjArrObjArtifactSets(characterInput: any) {
    const result = [] as any;
    try {
        let myTalentDetail;
        const myInputCategory = '聖遺物セット効果';

        const myStatusChangeDetailObjArr = [] as any[];
        const myTalentChangeDetailObjArr = [] as any[];

        const artifactSetMasters = characterInput.artifactSetMasters.filter((s: any) => s);

        if (artifactSetMasters.length > 0) {
            const damageDetailObjArr = [] as TDamageDetailObj[];
            if ('2セット効果' in artifactSetMasters[0]) {
                myTalentDetail = artifactSetMasters[0]['2セット効果'];
                damageDetailObjArr.push(...makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory));
            }
            if (artifactSetMasters.length == 2) {
                if (artifactSetMasters[0] == artifactSetMasters[1]) {
                    myTalentDetail = artifactSetMasters[0]['4セット効果'];
                    damageDetailObjArr.push(...makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory));
                } else {
                    myTalentDetail = artifactSetMasters[1]['2セット効果'];
                    damageDetailObjArr.push(...makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory));
                }
            }
            result['その他'] = damageDetailObjArr;
        }

        const vision = characterInput.characterMaster.元素;
        const elementalReactionArr = Object.keys((ELEMENTAL_REACTION_MASTER as any)[vision]);
        if (['水', '氷'].includes(vision) && !elementalReactionArr.includes('凍結')) {
            elementalReactionArr.push('凍結');
        }

        const workArr = [] as any[];
        myStatusChangeDetailObjArr.forEach(detailObj => {
            if (detailObj['条件'] && detailObj['条件'].startsWith('灰燼の都に立つ英雄の絵巻')) { // for 灰燼の都に立つ英雄の絵巻
                if (elementalReactionArr.filter(s => detailObj['条件'].startsWith('灰燼の都に立つ英雄の絵巻=' + s)).length === 0) {
                    return;
                }
            }
            workArr.push(detailObj);
        });

        result[CHANGE_KIND_STATUS] = workArr;
        result[CHANGE_KIND_TALENT] = myTalentChangeDetailObjArr;

        const conditionMap = new Map();
        const exclusionMap = new Map();
        workArr.filter(s => s['条件']).forEach(detailObj => {
            makeConditionExclusionMapFromStr(detailObj['条件'], conditionMap, exclusionMap);
        });
        myTalentChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            makeConditionExclusionMapFromStr(detailObj['条件'], conditionMap, exclusionMap);
        });
        conditionMap.forEach((value, key) => {
            if (value && _.isArray(value)) {
                if (!value[0].startsWith('required_')) {
                    conditionMap.set(key, ['', ...value]);
                }
            }
        });
        result['条件'] = conditionMap;
        result['排他'] = exclusionMap;

        characterInput.damageDetailMyArtifactSets = result;
    } catch (error) {
        console.error(characterInput, result);
        // throw error;
    }
    return result;
}

export function makeDamageDetailObjArrObjElementalResonance(characterInput: any) {
    const result = [] as any;
    try {
        const myInputCategory = '元素共鳴';
        const damageDetailObjArr = [] as TDamageDetailObj[];
        const myStatusChangeDetailObjArr = [] as any[];
        const myTalentChangeDetailObjArr = [] as any[];
        for (const myTalentDetail of ELEMENTAL_RESONANCE_MASTER_LIST) {
            const workObj = _.cloneDeep(myTalentDetail);
            if (workObj.詳細) {
                workObj.詳細.forEach((detailObj: TAnyObject) => {
                    detailObj.名前 = myTalentDetail.key;
                });
            }
            damageDetailObjArr.push(...makeDamageDetailObjArr(workObj, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory));
        }
        result['その他'] = damageDetailObjArr;
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
            if (value && _.isArray(value)) {
                if (!value[0].startsWith('required_')) {
                    conditionMap.set(key, ['', ...value]);
                }
            }
        });
        result['条件'] = conditionMap;
        result['排他'] = exclusionMap;

        characterInput.damageDetailElementalResonance = result;
    } catch (error) {
        console.error(characterInput, result);
        // throw error;
    }
    return result;
}

export function makeDetailObj(
    detailObj: any,
    level: number | null,
    defaultKind: string | null,
    defaultElement: string | null,
    inputCategory: string | null,
    opt_condition?: string,
): TDamageDetailObj {
    let my種類 = detailObj.種類 ?? defaultKind;
    let my対象 = detailObj.対象 ?? null;
    if (my種類 && my種類.indexOf('.') !== -1) {
        my対象 = my種類.substring(my種類.indexOf('.') + 1);
        my種類 = my種類.substring(0, my種類.indexOf('.'));
    }

    let my数値 = detailObj.数値 ?? 0;
    if (_.isPlainObject(my数値)) {  // キャラクター|武器のサブステータス
        if (level && level in my数値) {
            my数値 = my数値[level];
        } else {
            console.error(detailObj, level, my数値);
            my数値 = 0;
        }
    }
    my数値 = makeFormulaTemplate(my数値);

    let my条件 = detailObj.条件 ?? opt_condition ?? null;
    if (_.isPlainObject(my条件) && level && level in my条件) {  // 武器は精錬ランクによって数値を変えたいときがあるので
        my条件 = my条件[level];
    }

    let my上限 = detailObj.上限 ?? null;
    if (_.isPlainObject(my上限)) {
        if (level && level in my上限) { // for 草薙の稲光
            my上限 = my上限[level];
        } else {
            console.error(detailObj, level, my上限);
            my上限 = null;
        }
    }
    my上限 = makeFormulaTemplate(my上限);

    let my下限 = detailObj.下限 ?? null; // for ニィロウ
    if (_.isPlainObject(my下限)) {
        if (level && level in my下限) {
            my下限 = my下限[level];
        } else {
            console.error(detailObj, level, my下限);
            my下限 = null;
        }
    }
    my下限 = makeFormulaTemplate(my下限);

    return {
        名前: detailObj.名前 ?? null,
        種類: my種類,
        元素: detailObj.元素 ?? defaultElement ?? null,
        数値: my数値,
        条件: my条件,
        対象: my対象,
        上限: my上限,
        下限: my下限,
        HIT数: detailObj.HIT数 ?? null,
        ダメージバフ: detailObj.ダメージバフ ?? null,
        元素付与無効: detailObj.元素付与無効 ?? inputCategory === '武器',
        除外条件: detailObj.除外条件 ?? null,
        適用条件: detailObj.適用条件 ?? null,
    }
}

export function getChangeKind(kind: string) {
    if (kind in ステータスTEMPLATE
        || new RegExp('[自全].+(バフ|アップ)').exec(kind)
        || ['その他ダメージアップ'].includes(kind)  // for 放浪者
        || new RegExp('敵?[自全]元素耐性').exec(kind)
        || ['別枠乗算', '回復量アップ'].includes(kind)
        || ['敵防御力'].includes(kind)
        || ['発動回数', '使用回数'].includes(kind)
        || ['攻撃速度', '通常攻撃速度', '重撃速度', '移動速度'].includes(kind)
        || kind.endsWith('継続時間')
        || kind.endsWith('クールタイム')
        || kind.endsWith('会心率')
        || kind.endsWith('会心ダメージ')
        || kind.endsWith('反応ボーナス')
        || kind.endsWith('反応基礎ダメージアップ')
    ) {
        return 'STATUS';
    } else if (kind.endsWith('強化')
        || kind.endsWith('付与')
        || kind == '防御無視'
        || kind == '固有変数'
    ) {   // ex.元素爆発強化,氷元素付与
        return 'TALENT';
    }
    return undefined;
}

export function makeDamageDetailObjArr(
    talentDataObj: any,
    level: number[] | number | null,
    defaultKind: string | null,
    defaultElement: string | null,
    statusChangeDetailObjArr: any[],
    talentChangeDetailObjArr: any[],
    inputCategory: string,
    opt_condition?: string,
): TDamageDetailObj[] {
    const resultArr = [] as any[];
    if (!('詳細' in talentDataObj)) return resultArr;

    talentDataObj['詳細'].forEach((detailObj: TAnyObject) => {
        let myLevel = null;
        if (level == null) {
            myLevel = null;
        } else if (_.isArray(level)) {
            switch (defaultKind) {
                case '通常攻撃ダメージ':
                case '重撃ダメージ':
                case '落下攻撃ダメージ':
                    myLevel = level[0];
                    break;
                case '元素スキルダメージ':
                    myLevel = level[1];
                    break;
                case '元素爆発ダメージ':
                    myLevel = level[2];
                    break;
            }
            if (detailObj.種類) {
                let isChanged = false;
                switch (detailObj.種類) {
                    case '通常攻撃ダメージ':
                    case '重撃ダメージ':
                    case '落下攻撃ダメージ':
                        myLevel = level[0];
                        isChanged = true;
                        break;
                    case '元素スキルダメージ':
                        myLevel = level[1];
                        isChanged = true;
                        break;
                    case '元素爆発ダメージ':
                        myLevel = level[2];
                        isChanged = true;
                        break;
                }
                if (isChanged) {
                    console.info('makeDamageDetailObjArr', detailObj.名前, myLevel, defaultKind, detailObj);
                }
            }
        } else {
            myLevel = level;
        }
        const resultObj = makeDetailObj(detailObj, myLevel, defaultKind, defaultElement, inputCategory, opt_condition);
        const my種類 = resultObj.種類 as string;
        if (statusChangeDetailObjArr != null && getChangeKind(my種類) === 'STATUS') {
            resultObj['元素'] = detailObj.元素 ?? null;
            statusChangeDetailObjArr.push(resultObj);
            return;
        }
        if (talentChangeDetailObjArr != null && getChangeKind(my種類) === 'TALENT') {
            resultObj['元素'] = detailObj.元素 ?? null;
            talentChangeDetailObjArr.push(resultObj);
            return;
        }
        resultArr.push(resultObj);
    });

    return resultArr;
}

export function makeTeamOptionDetailObjArr(
    detailObjArr: any[],
): TDamageDetailObj[] {
    const resultArr = [] as TDamageDetailObj[];
    detailObjArr.forEach((detailObj: { [x: string]: any; }) => {
        const resultObj = makeDetailObj(detailObj, null, null, null, null);
        if (resultObj) {
            resultArr.push(resultObj);
        }
    });
    return resultArr;
}

// 条件名
// 条件名@prefix数値postfix
// 条件名@prefix数値(From)-数値(To)postfix
// 条件名@prefix数値1,数値2,数値3postfix
// 条件名=prefix数値postfix
// 条件名@文字列
// 条件名=文字列
// 条件名={min=数値|文字列,max=数値|文字列,step=数値}
// OR条件   条件A|条件B
// AND条件  条件A&条件B
// 排他条件 条件A^条件B
export function makeConditionExclusionMapFromStr(
    conditionStr: string,
    conditionMap: Map<string, string[] | object | null>,
    exclusionMap: Map<string, string[]>
) {
    // 排他条件を抽出します
    let exclusionStr: string | undefined = undefined;
    const workArr = conditionStr.split('^');
    if (workArr.length > 1) {
        exclusionStr = workArr[1];
    }
    const workStr = workArr[0];
    if (workStr.includes('|')) {
        // OR条件 for 申鶴
        const conditionStrArr = workStr.split('|');
        conditionStrArr.forEach((elem) => {
            makeConditionExclusionMapFromStrSub(elem, conditionMap, exclusionMap, exclusionStr);
        })
    } else {
        // AND条件
        const conditionStrArr = workStr.split('&');
        conditionStrArr.forEach((elem) => {
            makeConditionExclusionMapFromStrSub(elem, conditionMap, exclusionMap, exclusionStr);
        })
    }
}

export function getConditionOpkind(conditionStr: string) {
    let opkind = undefined;
    if (conditionStr.includes('@')) {   // イコール。右辺の値で倍率がかかる
        opkind = '@';
    } else if (conditionStr.includes('>=')) {   // 数値比較 以上
        opkind = '>=';
    } else if (conditionStr.includes('<=')) {   // 数値比較 以下
        opkind = '<=';
    } else if (conditionStr.includes('>')) {    // 数値比較 大なり
        opkind = '>';
    } else if (conditionStr.includes('<')) {    // 数値比較 小なり
        opkind = '<';
    } else if (conditionStr.includes('=')) {    // イコール。右辺の値で倍率がかからない
        opkind = '=';
    }
    return opkind;
}

export const NUMBER_CONDITION_VALUE_RE = /^\s*{.+}\s*$/;

function makeConditionExclusionMapFromStrSub(
    conditionStr: string,
    conditionMap: Map<string, string[] | object | null>,
    exclusionMap: Map<string, string[]>,
    exclusion?: string,
) {
    const opkind = getConditionOpkind(conditionStr);
    const workArr = opkind ? conditionStr.split(opkind) : [conditionStr];
    const name = workArr[0];
    if (opkind === undefined) {
        pushToMapValueArray(conditionMap, name, null);  // null
    } else if (opkind === '@' || opkind === '=') {
        if (workArr.length === 2) {
            if (NUMBER_CONDITION_VALUE_RE.test(workArr[1])) {
                try {
                    const workObj = JSON.parse(workArr[1]);
                    const min = workObj.min;
                    const max = workObj.max;
                    if (!_.isNumber(min) && !_.isString(min)) {
                        console.error(conditionStr, conditionMap, exclusionMap, exclusion);
                    } if (max !== undefined && !_.isNumber(max) && !_.isString(max)) {
                        console.error(conditionStr, conditionMap, exclusionMap, exclusion);
                    } else {
                        const conditionObj = {
                            min: min,
                            max: max,
                            step: isNumeric(workObj.step) ? Number(workObj.step) : 1,
                            initial: isNumeric(workObj.initial) ? Number(workObj.initial) : min,
                        };
                        pushToMapValueArray(conditionMap, name, conditionObj);  // object
                    }
                } catch (error) {
                    console.error(error);
                    console.error(conditionStr, conditionMap, exclusionMap, exclusion);
                }
            } else if (workArr[1].includes(',')) {
                const re = new RegExp('([^0-9]*?)([\\+\\-0-9\\.,]+)(.*)');  // 表現可能:-10,+60%
                const reRet = re.exec(workArr[1]);
                if (reRet) {
                    const prefix = reRet[1];
                    const condValueArr = reRet[2].split(',');
                    const postfix = reRet[3];
                    condValueArr.forEach(value => {
                        pushToMapValueArray(conditionMap, name, prefix + value + postfix);  // string[]
                    })
                }
            } else if (workArr[1].includes('-')) {
                const re = new RegExp('([^0-9\\.]*)(-?[0-9\\.]+)-(-?[0-9\\.]+)(.*)');   // 数値部に+は含められない。prefixには含められる。
                const re2 = new RegExp('/([0-9\\.]+)(.*)');
                const reRet = re.exec(workArr[1]);
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
                    step = step ? step : 1;
                    for (let i = rangeStart; i < rangeEnd; i = addDecimal(i, step, rangeEnd)) {
                        pushToMapValueArray(conditionMap, name, prefix + String(i) + postfix);  // string[]
                    }
                    pushToMapValueArray(conditionMap, name, prefix + String(rangeEnd) + postfix);  // string[]
                } else {
                    pushToMapValueArray(conditionMap, name, workArr[1]);  // string[]
                }
            } else {
                pushToMapValueArray(conditionMap, name, workArr[1]);  // string[]
            }
        } else {
            console.error(conditionStr, conditionMap, exclusionMap, exclusion);
        }
    }
    if (exclusion) {
        exclusion.split(',').forEach(e => {
            pushToMapValueArray(exclusionMap, name, e);  // string[]
        })
    }
}

export function setupConditionValues(
    conditionInput: TConditionInput,
    characterInput: TCharacterInput,
    optionInput: TOptionInput,
) {
    try {
        const workConditionValues = _.cloneDeep(conditionInput.conditionValues);
        const workCheckboxList: TCheckboxEntry[] = [];
        const workSelectList: TSelectEntry[] = [];
        const workNumberList: TNumberEntry[] = [];

        if ('月兆' in optionInput.elementalResonance.conditionValues) {
            workConditionValues['月兆'] = optionInput.elementalResonance.conditionValues['月兆'];
        }
        if ('月反応ボーナス' in optionInput.elementalResonance.conditionValues) {
            workConditionValues['月反応ボーナス'] = optionInput.elementalResonance.conditionValues['月反応ボーナス'];
        }
        if ('魔導秘儀' in optionInput.elementalResonance.conditionValues) {
            workConditionValues['魔導秘儀'] = optionInput.elementalResonance.conditionValues['魔導秘儀'];
        }

        // キャラクター、武器、聖遺物セット効果
        for (const master of [characterInput.characterMaster, characterInput.weaponMaster, ...characterInput.artifactSetMasters]) {
            if ('オプション初期値' in master) {
                for (const key of Object.keys((master as any)['オプション初期値'])) {
                    if (!(key in workConditionValues)) {
                        workConditionValues[key] = (master as any)['オプション初期値'][key];
                    }
                }
            }
        }

        const conditionMap = makeConditionMapFromCharacterInput(characterInput);
        const exclusionMap = makeExclusionMapFromCharacterInput(characterInput);

        if (optionInput.elementalResonance) {
            for (const key of Object.keys(ELEMENTAL_RESONANCE_MASTER)) {
                if (!optionInput.elementalResonance.conditionValues[key]) continue;
                const master = (ELEMENTAL_RESONANCE_MASTER as any)[key];
                if (!master.詳細) continue;
                for (const detailObj of master.詳細) {
                    if (!detailObj.条件) continue;
                    makeConditionExclusionMapFromStr(detailObj.条件, conditionMap, exclusionMap);
                }
            }
        }

        conditionMap.forEach((value, key) => {
            if (value === null) {
                if (workCheckboxList.filter(s => s.name == key).length === 0) {
                    workCheckboxList.push({ name: key });
                }
            } else if (_.isArray(value)) {
                if (workSelectList.filter(s => s.name == key).length === 0) {
                    const required = value[0].startsWith('required_');
                    workSelectList.push({
                        name: key,
                        options: value,
                        required: required,
                    });
                }
            } else if (_.isPlainObject(value)) {
                if (workNumberList.filter(s => s.name == key).length === 0) {
                    const numberObj = value as any;
                    const entry = {
                        name: key,
                        min: numberObj.min,
                        max: numberObj.max,
                        step: numberObj.step,
                        initial: numberObj.initial,
                    };
                    workNumberList.push(entry);
                }
            }
            if (key in workConditionValues && workConditionValues[key] !== null) {
                const conditionValue = workConditionValues[key]; // boolean:checkbox / number:select,input[number]
                if ((_.isBoolean(conditionValue) && conditionValue) || (_.isNumber(conditionValue) && conditionValue > 0)) {
                    const exclusions = exclusionMap.get(key);
                    if (exclusions) {
                        for (const exclusion of exclusions) {
                            if (exclusion in workConditionValues) {
                                const conditionValue = conditionMap.get(exclusion);
                                if (conditionValue === null) {  // checkbox
                                    workConditionValues[exclusion] = false;
                                } else if (_.isArray(value)) {  // select
                                    workConditionValues[exclusion] = 0;
                                } else if (_.isPlainObject(value)) {    // number
                                    const initialValue = (value as any).initial;
                                    const minValue = (value as any).min;
                                    if (isNumeric(initialValue)) {
                                        workConditionValues[exclusion] = Number(initialValue);
                                    } else if (isNumeric(minValue)) {
                                        workConditionValues[exclusion] = Number(minValue);
                                    } else {
                                        workConditionValues[exclusion] = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                if (value === null) {   // checkbox
                    let checked = true;
                    const arr = exclusionMap.get(key);
                    if (arr && arr.filter(s => workConditionValues[s]).length > 0) {
                        checked = false;
                    }
                    workConditionValues[key] = checked;
                } else if (_.isArray(value)) {  // select
                    let selectedIndex = value.length - 1;
                    const arr = exclusionMap.get(key);
                    if (arr && arr.filter(s => workConditionValues[s]).length > 0) {
                        selectedIndex = 0;
                    }
                    workConditionValues[key] = selectedIndex;
                } else if (_.isPlainObject(value)) {    // number
                    const initialValue = (value as any).initial;
                    const minValue = (value as any).min;
                    if (isNumeric(initialValue)) {
                        workConditionValues[key] = Number(initialValue);
                    } else if (isNumeric(minValue)) {
                        workConditionValues[key] = Number(minValue);
                    } else {
                        workConditionValues[key] = 0;
                    }
                }
            }
        })

        if (!_.isEqual(conditionInput.conditionValues, workConditionValues)) {
            overwriteObject(conditionInput.conditionValues, workConditionValues);
        }
        if (!_.isEqual(conditionInput.checkboxList, workCheckboxList)) {
            conditionInput.checkboxList.splice(0, conditionInput.checkboxList.length, ...workCheckboxList);
        }
        if (!_.isEqual(conditionInput.selectList, workSelectList)) {
            conditionInput.selectList.splice(0, conditionInput.selectList.length, ...workSelectList);
        }
        if (!_.isEqual(conditionInput.numberList, workNumberList)) {
            conditionInput.numberList.splice(0, conditionInput.numberList.length, ...workNumberList);
        }
    } catch (error) {
        console.error(conditionInput, characterInput, optionInput);
        // throw error;
    }
}

export function makeConditionMapFromCharacterInput(characterInput: TCharacterInput) {
    const result = new Map() as Map<string, any[] | null | object>;
    [
        characterInput.damageDetailMyCharacter,
        characterInput.damageDetailMyWeapon,
        characterInput.damageDetailMyArtifactSets,
    ].forEach((damageDetail) => {
        if (damageDetail && damageDetail.条件) {
            damageDetail.条件.forEach((value, key) => {
                result.set(key, value);
            });
        }
    });
    return result;
}

export function makeExclusionMapFromCharacterInput(characterInput: TCharacterInput) {
    const result = new Map() as Map<string, string[]>;
    [
        characterInput.damageDetailMyCharacter,
        characterInput.damageDetailMyWeapon,
        characterInput.damageDetailMyArtifactSets,
    ].forEach((damageDetail) => {
        if (damageDetail && damageDetail.排他) {
            damageDetail.排他.forEach((value, key) => {
                result.set(key, value);
            });
        }
    });
    return result;
}

export function getStatValue(stat: string, statsObj: TStats) {
    let result;
    if (stat in statsObj) {
        result = statsObj[stat];
    } else {
        const re = /(.+)X([0-7])$/;
        const reRet = re.exec(stat);
        if (reRet) {
            if (reRet[1] in statsObj) {
                result = statsObj[reRet[1]];
                let n = Number(reRet[2]);
                for (let i = 1; i <= 3; i++) {
                    if ((n % 2) == 1) {
                        const vStat: string = reRet[1] + 'V' + i;
                        if (vStat in statsObj) {
                            result -= statsObj[vStat];
                        }
                    }
                    n = Math.trunc(n / 2);
                }
            }
        }
    }
    if (result === undefined) {
        console.warn(stat, statsObj); // キャラクターが切り替わったときとかによく引っ掛かる
        result = 0; // fixed
    }
    return result;
}

export function updateNumberConditionValues(
    conditionInput: TConditionInput,
    characterInput: TCharacterInput,
    statsObj: TStats,
) {
    const conditionMap = makeConditionMapFromCharacterInput(characterInput);
    conditionMap.forEach((value, key) => {
        if (_.isPlainObject(value)) {
            const numberEntryArr = conditionInput.numberList.filter(s => s.name == key);
            if (numberEntryArr.length > 0) {
                let minValue = (value as any).min;
                let maxValue = (value as any).max;
                if (_.isString(minValue) || _.isString(maxValue)) {
                    if (_.isString(minValue)) {
                        minValue = getStatValue(minValue, statsObj);
                    }
                    if (_.isString(maxValue)) {
                        maxValue = getStatValue(maxValue, statsObj);
                    }
                    numberEntryArr[0].min = minValue;
                    numberEntryArr[0].max = maxValue;
                    if (key in conditionInput.conditionValues) {
                        const value = conditionInput.conditionValues[key];
                        if (_.isNumber(value)) {
                            if (value < minValue) {
                                conditionInput.conditionValues[key] = minValue;
                            } else if (maxValue !== undefined && value > maxValue) {
                                conditionInput.conditionValues[key] = maxValue;
                            }
                        }
                    }
                }
            }
        }
    })
}

function pushToMapValueArray(map: Map<any, any>, key: any, value: any) {
    if (value === null) {    // checkbox
        if (!map.has(key)) {
            map.set(key, null);
        }
    } else if (_.isString(value)) { // select
        if (map.has(key)) {
            const oldValue = map.get(key);
            if (oldValue === null) {
                map.set(key, [value]);
            } else if (_.isArray(oldValue)) {
                if (!oldValue.includes(value)) {
                    map.get(key).push(value);
                }
            } else {
                console.error(map, key, value);
            }
        } else {
            map.set(key, [value]);
        }
    } else if (_.isPlainObject(value)) {    // number
        map.set(key, value);
    }
}

function getDecimalLength(value: number): number {
    const arr = ('' + value).split('.');
    return arr.length > 1 ? arr[1].length : 0;
}

export function multiplyDecimal(value1: number, value2: number): number {
    const decimalLength = getDecimalLength(value1) + getDecimalLength(value2);
    const intValue1 = Number(('' + value1).replace('.', ''));
    const intValue2 = Number(('' + value2).replace('.', ''));
    const result = (intValue1 * intValue2) / Math.pow(10, decimalLength);
    return Number(result);
}

export function addDecimal(value1: number, value2: number, opt_max?: number): number {
    const k = Math.pow(10, Math.max(getDecimalLength(value1), getDecimalLength(value2)));
    let result = (multiplyDecimal(value1, k) + multiplyDecimal(value2, k)) / k;
    if (opt_max != undefined) {
        result = Math.min(result, opt_max);
    }
    return result;
}

// function analyzeFormulaStr(
//     formulaStr: number | string,
//     opt_defaultItem: string | null = null
// ) {
//     const resultArr = [] as any[];
//     const re = new RegExp('([\\+\\-\\*/]?)([^\\+\\-\\*/]+)(.*)');
//     let workStr = String(formulaStr);
//     // eslint-disable-next-line no-constant-condition
//     while (true) {
//         const reRet = re.exec(workStr);
//         if (!reRet) {
//             resultArr.push(workStr);
//             break;
//         }
//         if (reRet[1]) { // + - * /
//             resultArr.push(reRet[1]);
//         }
//         resultArr.push(analyzeFormulaStrSub(reRet[2], opt_defaultItem));
//         if (!reRet[3]) {
//             break;
//         }
//         workStr = reRet[3];
//     }
//     return resultArr;
// }
//
// function analyzeFormulaStrSub(
//     formulaStr: string,
//     opt_defaultItem: string | null = null
// ) {
//     const resultArr = [] as any;
//     if (isNumeric(formulaStr)) {
//         resultArr.push(Number(formulaStr));
//     } else {
//         const strArr = (formulaStr as string).split('%');
//         if (strArr.length == 1) {
//             resultArr.push(strArr[0]);
//         } else {
//             resultArr.push(Number(strArr[0]) / 100);
//             resultArr.push('*');
//             if (strArr[1].length > 0) {
//                 resultArr.push(strArr[1]);
//             } else if (opt_defaultItem != null) {
//                 resultArr.push(opt_defaultItem);
//             }
//         }
//     }
//     return resultArr;
// }

export function makeFormulaTemplate(
    formula: number | string | null | undefined,
) {
    let result: string | null = '';
    if (formula === undefined || formula === null) {
        result = null;
    } else if (_.isNumber(formula) || isNumeric(formula)) {
        result = String(formula);
    } else {
        const symbols = "!\"&'()*+,-/:;<=>?@[\\]^`|~";
        const escapedSymbols = symbols.split('').map(s => '\\' + s).join('');
        const re = new RegExp('([^' + escapedSymbols + ']+|[' + escapedSymbols + ']+)', 'g');
        let reRet;
        while ((reRet = re.exec(formula)) !== null) {
            let item = reRet[1];
            if (!symbols.includes(item.substring(0, 1))) {
                item = _.trim(item);
                if (isNumeric(item)) {
                    result += item;
                } else if (item.length) {
                    if (item.includes('%')) {   // 123.4% or 12.34%HP上限 等。%の前は数値
                        const arr = item.split('%').map(s => _.trim(s));
                        result += arr[0] + '/100*';
                        item = arr[1].length ? arr[1] : '攻撃力';
                    }
                    result += '${' + item + '}';
                }
            } else {
                result += item;
            }
        }
    }
    return result;
}

export function getMaxConstellation(characterMaster: TCharacterDetail) {
    let max = 0;
    if ('命ノ星座' in characterMaster) {
        max = Object.keys(characterMaster.命ノ星座).length;
    }
    return max;
}

export function getMaxTalentLevel(characterMaster: TCharacterDetail, key: string) {
    let max = 10;
    if (key in characterMaster) {
        const talentObj = (characterMaster as any)[key];
        if ('詳細' in talentObj) {
            for (const detailObj of talentObj.詳細) {
                if ('数値' in detailObj && _.isPlainObject(detailObj.数値)) {
                    const work = Object.keys(detailObj.数値).length;
                    if (max < work) max = work;
                }
            }
        }
    }
    return max;
}

export function setupTeamOption(optionInput: TOptionInput) {
    const optionDetails1: TDamageDetailObj[] = [];
    const optionDetails2: TDamageDetailObj[] = [];
    const conditionMap = new Map<string, string[] | object | null>();
    const exclusionMap = new Map<string, string[]>();
    const checkboxList: TCheckboxEntry[] = [];
    const selectList: TSelectEntry[] = [];
    const numberList: TNumberEntry[] = [];
    Object.keys(optionInput.supporters).forEach(key => {
        const workDetails1 = optionInput.supporters[key]?.optionDetails1;
        const workDetails2 = optionInput.supporters[key]?.optionDetails2;
        const workMap1 = optionInput.supporters[key]?.conditionMap;
        const workMap2 = optionInput.supporters[key]?.exclusionMap;
        if (workDetails1 !== undefined) {
            optionDetails1.push(...workDetails1);
        }
        if (workDetails2 !== undefined) {
            optionDetails2.push(...workDetails2);
        }
        if (workMap1 !== undefined) {
            workMap1.forEach((value, key) => {
                conditionMap.set(key, value);
                if (value === null) { // checkbox
                    if (checkboxList.filter((s) => s.name == key).length === 0) {
                        checkboxList.push({
                            name: key,
                            displayName: key.replace(/^.+\*/, ''),
                        })
                    }
                } else if (_.isArray(value)) {  // select
                    if (selectList.filter((s) => s.name == key).length === 0) {
                        const required = value[0].startsWith('required_');
                        selectList.push({
                            name: key,
                            displayName: key.replace(/^.+\*/, ''),
                            options: (required || !value[0]) ? value : ['', ...value],
                            required: required,
                        })
                    }
                } else if (_.isPlainObject(value)) {  // number
                    if (numberList.filter((s) => s.name == key).length === 0) {
                        numberList.push({
                            name: key,
                            displayName: key.replace(/^.+\*/, ''),
                            min: (value as any).min,
                            max: (value as any).max,
                            step: (value as any).step,
                            initial: (value as any).initial,
                        })
                    }
                }
            })
        }
        if (workMap2 !== undefined) {
            workMap2.forEach((value, key) => {
                exclusionMap.set(key, value);
            })
        }
    })
    optionInput.teamOption.optionDetails1.splice(0, optionInput.teamOption.optionDetails1.length, ...optionDetails1);
    optionInput.teamOption.optionDetails2.splice(0, optionInput.teamOption.optionDetails2.length, ...optionDetails2);
    optionInput.teamOption.conditionMap = conditionMap;
    optionInput.teamOption.exclusionMap = exclusionMap;
    optionInput.teamOption.checkboxList.splice(0, optionInput.teamOption.checkboxList.length, ...checkboxList);
    optionInput.teamOption.selectList.splice(0, optionInput.teamOption.selectList.length, ...selectList);
    optionInput.teamOption.numberList.splice(0, optionInput.teamOption.numberList.length, ...numberList);
}

export function setupMiscOption(optionInput: TOptionInput) {
    const optionDetails1: TDamageDetailObj[] = [];
    const optionDetails2: TDamageDetailObj[] = [];
    const conditionMap = new Map<string, string[] | object | null>();
    const exclusionMap = new Map<string, string[]>();
    const checkboxList: TCheckboxEntry[] = [];
    const selectList: TSelectEntry[] = [];
    const numberList: TNumberEntry[] = [];
    [OPTION1_MASTER_LIST, OPTION2_MASTER_LIST].forEach(masterList => {
        for (const entry of masterList) {
            if ('詳細' in entry) {
                for (const detailObj of entry.詳細) {
                    if (!('条件' in detailObj)) {
                        (detailObj as any).条件 = entry.key;
                    }
                }
            }
            makeDamageDetailObjArr(entry, null, null, null, optionDetails1, optionDetails2, 'その他オプション');
        }
    })
    optionDetails1.filter((s) => s.条件).forEach((detailObj) => {
        makeConditionExclusionMapFromStr(detailObj.条件 as string, conditionMap, exclusionMap);
    });
    optionDetails2.filter((s) => s.条件).forEach((detailObj) => {
        makeConditionExclusionMapFromStr(detailObj.条件 as string, conditionMap, exclusionMap);
    });
    conditionMap.forEach((value, key) => {
        if (value === null) { // checkbox
            if (checkboxList.filter((s) => s.name == key).length === 0) {
                checkboxList.push({
                    name: key,
                    displayName: key.replace(/^.+\*/, ''),
                })
            }
        } else if (_.isArray(value)) {  // select
            if (selectList.filter((s) => s.name == key).length === 0) {
                const required = value[0].startsWith('required_');
                selectList.push({
                    name: key,
                    displayName: key.replace(/^.+\*/, ''),
                    options: (required || !value[0]) ? value : ['', ...value],
                    required: required,
                })
            }
        } else if (_.isPlainObject(value)) {  // number
            if (numberList.filter((s) => s.name == key).length === 0) {
                numberList.push({
                    name: key,
                    displayName: key.replace(/^.+\*/, ''),
                    min: (value as any).min,
                    max: (value as any).max,
                    step: (value as any).step,
                    initial: (value as any).initial,
                })
            }
        }
    });
    optionInput.miscOption.optionDetails1.splice(0, optionInput.miscOption.optionDetails1.length, ...optionDetails1);
    optionInput.miscOption.optionDetails2.splice(0, optionInput.miscOption.optionDetails2.length, ...optionDetails2);
    optionInput.miscOption.conditionMap = conditionMap;
    optionInput.miscOption.exclusionMap = exclusionMap;
    optionInput.miscOption.checkboxList.splice(0, optionInput.miscOption.checkboxList.length, ...checkboxList);
    optionInput.miscOption.selectList.splice(0, optionInput.miscOption.selectList.length, ...selectList);
    optionInput.miscOption.numberList.splice(0, optionInput.miscOption.numberList.length, ...numberList);
}

export async function updateConditionsByTeam(
    characterInput: TCharacterInput,
    conditionInput: TConditionInput,
    optionInput: TOptionInput,
) {
    const character = characterInput.character;
    const teamMembers: string[] = [character];
    if (optionInput?.teamMembers) {
        teamMembers.push(...optionInput.teamMembers.filter(s => s && s != character));
    }
    const myVision = CHARACTER_MASTER[character as TCharacterKey].元素;

    // [チーム]*出身キャラクター, [チーム]*以外出身キャラクター
    const regionCountMap = new Map<string, number>();
    // [チーム]元素エネルギー上限の合計
    let totalEnergyCost = 0;
    // Map<元素, キャラクターの数>
    const visionCountMap = new Map<string, number>();
    for (const entry of teamMembers) {
        const characterDetail = await getCharacterMasterDetail(entry as TCharacterKey);
        if (characterDetail.region) {
            const count = regionCountMap.get(characterDetail.region);
            if (count) {
                regionCountMap.set(characterDetail.region, count + 1);
            } else {
                regionCountMap.set(characterDetail.region, 1);
            }
        }
        if ('元素エネルギー' in characterDetail.元素爆発) {
            totalEnergyCost += Number(characterDetail.元素爆発.元素エネルギー);
        }
        if (characterDetail.元素) {
            const count = visionCountMap.get(characterDetail.元素);
            if (count) {
                visionCountMap.set(characterDetail.元素, count + 1);
            } else {
                visionCountMap.set(characterDetail.元素, 1);
            }
        }
    }
    regionCountMap.forEach((value, key) => {
        conditionInput.conditionValues['[チーム]' + key + '出身キャラクター'] = value;
        conditionInput.conditionValues['[チーム]' + key + '以外出身キャラクター'] = teamMembers.length - value;
    })
    if (totalEnergyCost) {
        conditionInput.conditionValues['[チーム]元素エネルギー上限の合計'] = totalEnergyCost;
    }
    ALL_ELEMENTS.forEach(key => {
        conditionInput.conditionValues['[チーム]' + key + '元素キャラクター'] = 0;
        conditionInput.conditionValues['[チーム]' + key + '元素以外キャラクター'] = 0;
    })
    visionCountMap.forEach((value, key) => {
        conditionInput.conditionValues['[チーム]' + key + '元素キャラクター'] = value;
        conditionInput.conditionValues['[チーム]' + key + '元素以外キャラクター'] = teamMembers.length - value;
        if (key == myVision) {
            conditionInput.conditionValues['[チーム]同じ元素のキャラクター'] = value - 1;
            conditionInput.conditionValues['[チーム]異なる元素のキャラクター'] = teamMembers.length - value;
        }
    })
    conditionInput.conditionValues['[チーム]キャラクターの元素タイプ'] = visionCountMap.size - 1; // requiredなので1減らします
    const pyroCount = visionCountMap.get('炎') ?? 0;
    const hydroCount = visionCountMap.get('水') ?? 0;
    const electroCount = visionCountMap.get('雷') ?? 0;
    const cryoCount = visionCountMap.get('氷') ?? 0;
    conditionInput.conditionValues['[チーム]炎水雷氷元素のキャラクター'] = pyroCount + hydroCount + electroCount + cryoCount;
}

export async function updateOptionsElementalResonanceByTeam(
    characterInput: TCharacterInput,
    optionInput: TOptionInput,
) {
    const character = characterInput.character;
    const teamMembers: string[] = [character];
    if (optionInput?.teamMembers) {
        teamMembers.push(...optionInput.teamMembers.filter(s => s && s != character));
    }
    if (teamMembers.length == 4) {
        const visionCountMap = new Map<string, number>();
        for (const entry of teamMembers) {
            const characterDetail = await getCharacterMasterDetail(entry as TCharacterKey);
            if (characterDetail.元素) {
                const count = visionCountMap.get(characterDetail.元素);
                if (count) {
                    visionCountMap.set(characterDetail.元素, count + 1);
                } else {
                    visionCountMap.set(characterDetail.元素, 1);
                }
            }
        }

        // 元素共鳴を調整します
        const newElementResonance: TConditionValues = {};
        const resonanceElementArr: string[] = [];
        const restMemberElementArr: string[] = [];
        visionCountMap.forEach((value, key) => {
            if (value >= 2) {
                resonanceElementArr.push(key);
            } else if (value == 1) {
                restMemberElementArr.push(key);
            }
        })
        if (optionInput.teamMembers.length == 3) {
            if (resonanceElementArr.length > 1) {
                newElementResonance[resonanceElementArr[0] + '元素共鳴'] = true;
                newElementResonance[resonanceElementArr[1] + '元素共鳴'] = true;
            } else if (resonanceElementArr.length > 0) {
                newElementResonance[resonanceElementArr[0] + '元素共鳴'] = true;
            } else {
                newElementResonance['元素共鳴なし'] = true;
            }
        } else if (resonanceElementArr.length > 0) {
            const tempArr: string[] = [resonanceElementArr[0] + '元素共鳴'];
            const currentElementArr = Object.keys(optionInput.elementalResonance.conditionValues).filter(s => optionInput.elementalResonance.conditionValues[s] && s != '元素共鳴なし').map(s => s.replace(/元素共鳴$/, ''));
            currentElementArr.forEach(element => {
                if (restMemberElementArr.includes(element)) {
                    tempArr.push(element + '元素共鳴');
                }
            });
            if (tempArr.length < 2) {
                ALL_ELEMENTS.forEach(element => {
                    const resonance = element + '元素共鳴';
                    if (optionInput.elementalResonance.conditionValues[resonance]) {
                        if (!tempArr.includes(resonance)) {
                            tempArr.push(resonance);
                        }
                    }
                });
            }
            tempArr.forEach(resonance => {
                newElementResonance[resonance] = true;
            })
        }
        if (!_.isEqual(newElementResonance, optionInput.elementalResonance.conditionValues)) {
            overwriteObject(optionInput.elementalResonance.conditionValues, newElementResonance);
            return true;
        }
    }
    return false;
}

export function makeSharedata(savedata: TAnyObject) {
    const sharedataArr = [] as any[];

    let character: TCharacterKey;
    let weaponType: TWeaponTypeKey;

    キャラクター構成PROPERTY_MAP.forEach((value, key) => {
        let newValue = savedata[key];
        let myBasename;
        switch (key) {
            case 'キャラクター':
                character = newValue as TCharacterKey;
                myBasename = basename(CHARACTER_MASTER[character]['import']);
                newValue = myBasename.split('_')[myBasename.split('_').length - 1];
                break;
            case '武器':
                weaponType = CHARACTER_MASTER[character]['武器'] as TWeaponTypeKey;
                myBasename = basename((WEAPON_MASTER as any)[weaponType][newValue]['import']);
                newValue = myBasename.split('_')[myBasename.split('_').length - 1];
                break;
            case '聖遺物セット効果1':
            case '聖遺物セット効果2':
                if (newValue == 'NONE') {
                    newValue = '';  // 聖遺物セット効果なし
                } else {
                    myBasename = basename(ARTIFACT_SET_MASTER[newValue as TArtifactSetKey]['image']);
                    newValue = myBasename.split('_')[myBasename.split('_').length - 1];
                }
                break;
            case '聖遺物メイン効果1':
            case '聖遺物メイン効果2':
            case '聖遺物メイン効果3':
            case '聖遺物メイン効果4':
            case '聖遺物メイン効果5':
                if (newValue) {
                    newValue = newValue.split('_')[0] + '_' + ARTIFACT_STAT_JA_EN_ABBREV_MAP.get(newValue.split('_')[1]);
                }
                break;
        }
        if (key.match(/^聖遺物優先するサブ効果\d$/)) {
            if (newValue) {
                newValue = ARTIFACT_STAT_JA_EN_ABBREV_MAP.get(newValue);
            }
        }
        sharedataArr.push(newValue);
    });
    Object.keys(savedata).forEach(key => {
        if (!キャラクター構成PROPERTY_MAP.has(key)) {
            sharedataArr.push(key + '=' + savedata[key]);
        }
    });

    return sharedataArr.join(',');
}

function openTwitter(text: string, url: string, opt_hashtags?: string, opt_via?: string) {
    const baseUrl = 'https://twitter.com/intent/tweet?';
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('url', url);
    if (opt_hashtags) {
        params.append('hashtags', opt_hashtags);
    }
    if (opt_via) {
        params.append('via', opt_via);
    }
    const query = params.toString();
    const shareUrl = `${baseUrl}${query}`;
    console.log(params);
    console.log(shareUrl);
    window.open(shareUrl);
}

export function shareByTwitter(
    characterInput: TCharacterInput,
    artifactDetailInput: TArtifactDetailInput,
    conditionInput: TConditionInput
) {
    const savedata = makeSavedata(characterInput, artifactDetailInput, conditionInput);
    const sharedata = makeSharedata(savedata);

    const text = characterInput.buildname;
    const encoded = encodeURI(sharedata);
    const url = 'https://asagume.github.io/gencalc/' + '?allin=' + encoded;

    openTwitter(text, url);
}

export function pushBuildinfoToSession(character: TCharacterKey | string, buildname?: string, builddata?: any, teammembers?: string[]) {
    sessionStorage.setItem('character', character);
    if (buildname) {
        sessionStorage.setItem('buildname', buildname);
    }
    if (builddata) {
        sessionStorage.setItem('builddata', JSON.stringify(builddata));
    }
    if (teammembers) {
        sessionStorage.setItem('teammembers', JSON.stringify(teammembers));
    }
}

export function popBuildinfoFromSession() {
    const result: [string | undefined, string | undefined, TAnyObject | undefined, string[] | undefined] = [undefined, undefined, undefined, undefined];
    const character = sessionStorage.getItem('character');
    if (character) {
        result[0] = character;
        const buildname = sessionStorage.getItem('buildname');
        if (buildname) {
            result[1] = buildname;
        }
        const builddata = sessionStorage.getItem('builddata');
        if (builddata) {
            result[2] = JSON.parse(builddata);
        }
        const teammembers = sessionStorage.getItem('teammembers');
        if (teammembers) {
            result[3] = JSON.parse(teammembers);
        }
        console.log(character, buildname, builddata, teammembers);
    }
    sessionStorage.removeItem('character');
    sessionStorage.removeItem('builddata');
    sessionStorage.removeItem('buildname');
    sessionStorage.removeItem('teammembers');
    return result;
}
