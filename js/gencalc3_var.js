var キャラクターMasterVar;
var 武器MasterVar;
var 聖遺物セット効果MasterVar;
var 聖遺物メイン効果MasterVar;
var 聖遺物サブ効果MasterVar;
var 元素反応MasterVar;
var 元素共鳴MasterVar;
var 敵MasterVar;
var チームオプションMasterVar;
var オプション1MasterVar;
var オプション2MasterVar;

const キャラクター個別MasterMapVar = new Map();
const 武器個別MasterMapVar = new Map();

const キャラクターダメージ詳細ObjMapVar = new Map();
const 武器ダメージ詳細ObjMapVar = new Map();
const 聖遺物セット効果ダメージ詳細ObjMapVar = new Map();

var キャラクター所持状況Var = {};
var 武器所持状況Var = {};

/** キャラクター選択 */
var CharacterSelectVm;
/** キャラクター情報入力 */
var CharacterInputVm;
/** 武器選択 */
var WeaponSelectVm;
/** 聖遺物セット効果選択 */
var ArtifactSetSelectVm;
/** 聖遺物メイン/サブ効果入力 */
var ArtifactDetailInputVm;
/** 条件入力 */
var ConditionInputVm;
/** オプション入力 */
var OptionInputVm;
/** ステータス情報入力 */
var StatusInputVm;
/** 敵情報入力 */
var EnemyInputVm;
/** 計算結果 */
var CalculationResultVm;
/** キャラクター情報 */
var CharacterInformationVm;
/** キャラクター所持状況 */
var CharacterOwnListVm;
/** 武器所持状況 */
var WeaponOwnListVm;

var Pane4Group = new Set();

const ALLOW_LIST_LANG = ['zh-cn', 'zh-tw', 'de-de', 'en-us', 'es-es', 'fr-fr', 'id-id', 'ja-jp', 'ko-kr', 'pt-pt', 'ru-ru', 'th-th', 'vi-vn'];

const ELEMENT_COLOR_CLASS = {
    炎: 'pyro',
    水: 'hydro',
    風: 'anemo',
    雷: 'electro',
    草: 'dendro',
    氷: 'cryo',
    岩: 'geo'
};

const ELEMENT_BG_COLOR_CLASS = {
    炎: 'pyro-bg',
    水: 'hydro-bg',
    風: 'anemo-bg',
    雷: 'electro-bg',
    草: 'dendro-bg',
    氷: 'cryo-bg',
    岩: 'geo-bg'
};

const ELEMENT_IMG_SRC = {
    炎: 'images/element_pyro.png',
    水: 'images/element_hydro.png',
    風: 'images/element_anemo.png',
    雷: 'images/element_electro.png',
    // 草: 'images/element_dendro.png',
    氷: 'images/element_cryo.png',
    岩: 'images/element_geo.png'
};

const WEAPON_IMG_SRC = {
    片手剣: 'images/characters/NormalAttack_sword.png',
    両手剣: 'images/characters/NormalAttack_claymore.png',
    長柄武器: 'images/characters/NormalAttack_polearm.png',
    弓: 'images/characters/NormalAttack_bow.png',
    法器: 'images/characters/NormalAttack_catalyst.png',
};

const STAR_BACKGROUND_URL = {
    1: 'images/star1-bg.png',
    2: 'images/star2-bg.png',
    3: 'images/star3-bg.png',
    4: 'images/star4-bg.png',
    5: 'images/star5-bg.png'
};

const IMG_SRC_DUMMY = "data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7";

const 基礎ステータスARRAY = [
    '基礎HP',
    '基礎攻撃力',
    '基礎防御力'
];
const 基本ステータスARRAY = [
    'HP上限',
    '攻撃力',
    '防御力',
    '元素熟知'
];
const 高級ステータスARRAY = [
    '会心率',
    '会心ダメージ',
    '与える治療効果',
    '受ける治療効果',
    '元素チャージ効率',
    'シールド強化'
];
const 元素ステータス_ダメージARRAY = [
    '炎元素ダメージバフ',
    '水元素ダメージバフ',
    '風元素ダメージバフ',
    '雷元素ダメージバフ',
    '草元素ダメージバフ',
    '氷元素ダメージバフ',
    '岩元素ダメージバフ',
    '物理ダメージバフ'
];
const 元素ステータス_耐性ARRAY = [
    '炎元素耐性',
    '水元素耐性',
    '風元素耐性',
    '雷元素耐性',
    '草元素耐性',
    '氷元素耐性',
    '岩元素耐性',
    '物理耐性'
];
const ダメージバフARRAY = [
    '通常攻撃ダメージ',
    '重撃ダメージ',
    '落下攻撃ダメージ',
    '元素スキルダメージ',
    '元素爆発ダメージ',
    '与えるダメージ'
];
const 実数ダメージ加算ARRAY = [
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
const 元素反応バフARRAY = [
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
const ステータスその他ARRAY = [
    'ダメージ軽減',
    'HP%',
    '攻撃力%',
    '防御力%',
    'HP+',
    '攻撃力+',
    '防御力+'
];

const ステータスARRAY_MAP = new Map([
    ['基礎ステータス', 基礎ステータスARRAY],
    ['基本ステータス', 基本ステータスARRAY],
    ['高級ステータス', 高級ステータスARRAY],
    ['元素ステータス・ダメージ', 元素ステータス_ダメージARRAY],
    ['元素ステータス・耐性', 元素ステータス_耐性ARRAY],
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
const ステータスTEMPLATE = makeStatusTenmplate();

function makeEnemyStatusTemplate() {
    const statusObj = {};
    [元素ステータス_耐性ARRAY].forEach((value, key) => {
        value.forEach(stat => {
            statusObj[stat] = 0;
        });
    });
    return statusObj;
};
const 敵ステータスTEMPLATE = makeEnemyStatusTemplate();

const 聖遺物メイン効果_生の花ARRAY = [
    '5_HP', '4_HP'
];
const 聖遺物メイン効果_死の羽ARRAY = [
    '5_攻撃力', '4_攻撃力'
];
const 聖遺物メイン効果_時の砂ARRAY = [
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
const 聖遺物メイン効果_空の杯ARRAY = [
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
const 聖遺物メイン効果_理の冠ARRAY = [
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

const 聖遺物ステータスTEMPLATE = {
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

const 元素反応TEMPLATE = {
    蒸発倍率: 1.5,
    溶解倍率: 2,
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

const 計算結果TEMPLATE = {
    通常攻撃: [],
    重撃: [],
    落下攻撃: [],
    元素スキル: [],
    元素爆発: [],
    その他: []
};

const 突破レベルレベルARRAY = [
    Array.from({ length: 20 }, (_, i) => i + 1),
    Array.from({ length: 21 }, (_, i) => i + 20),
    Array.from({ length: 11 }, (_, i) => i + 40),
    Array.from({ length: 11 }, (_, i) => i + 50),
    Array.from({ length: 11 }, (_, i) => i + 60),
    Array.from({ length: 11 }, (_, i) => i + 70),
    Array.from({ length: 11 }, (_, i) => i + 80),
];

const CHARACTER_MASTER_DUMMY = {
    名前: 'dummy',
    icon_url: IMG_SRC_DUMMY,
    レアリティ: 4,
    武器: null,
    元素: null,
    ステータス: {},
    通常攻撃: {
        名前: null,
        icon_url: IMG_SRC_DUMMY
    },
    元素スキル: {
        名前: null,
        icon_url: IMG_SRC_DUMMY
    },
    元素爆発: {
        名前: null,
        icon_url: IMG_SRC_DUMMY
    }

};

const WEAPON_MASTER_DUMMY = {
    名前: 'dummy',
    icon_url: IMG_SRC_DUMMY,
    レアリティ: 4,
    ステータス: {}
};

const ARTIFACT_SET_MASTER_DUMMY = {
    名前: 'dummy',
    image: IMG_SRC_DUMMY
};

/** @type {string []} */
const DAMAGE_CATEGORY_ARRAY = ['通常攻撃ダメージ', '重撃ダメージ', '落下攻撃ダメージ', '元素スキルダメージ', '元素爆発ダメージ'];

const RECOMMEND_ABBREV_MAP = new Map([
    ['HP%', 'HP'], ['元素熟知', '熟'], ['元素チャージ効率', 'ﾁｬ'], ['会心率', '率'], ['会心ダメージ', 'ダ'], ['与える治療効果', '治']
]);

