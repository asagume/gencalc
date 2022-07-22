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

const 基礎ステータスTEMPLATE = {
    基礎HP: 0,
    基礎攻撃力: 0,
    基礎防御力: 0
};

const 基本ステータスTEMPLATE = {
    HP上限: 0,
    攻撃力: 0,
    防御力: 0,
    元素熟知: 0
};

const 高級ステータスTEMPLATE = {
    会心率: 5,
    会心ダメージ: 50,
    与える治療効果: 0,
    受ける治療効果: 0,
    元素チャージ効率: 100,
    シールド強化: 0
};

const 元素ステータス_ダメージTEMPLATE = {
    炎元素: 0,
    水元素: 0,
    風元素: 0,
    雷元素: 0,
    草元素: 0,
    氷元素: 0,
    岩元素: 0,
    物理: 0
};

const 元素ステータス_耐性TEMPLATE = {
    炎元素: 0,
    水元素: 0,
    風元素: 0,
    雷元素: 0,
    草元素: 0,
    氷元素: 0,
    岩元素: 0,
    物理: 0
};

const ダメージバフTEMPLATE = {
    通常攻撃: 0,
    重撃: 0,
    落下攻撃: 0,
    元素スキル: 0,
    元素爆発: 0,
    与えるダメージ: 0
};

const 実数ダメージ加算TEMPLATE = {
    通常攻撃: 0,
    重撃: 0,
    落下攻撃: 0,
    元素スキル: 0,
    元素爆発: 0,
    炎元素: 0,
    水元素: 0,
    風元素: 0,
    雷元素: 0,
    草元素: 0,
    氷元素: 0,
    岩元素: 0,
    物理: 0
};

const 元素反応バフTEMPLATE = {
    蒸発: 0,
    溶解: 0,
    過負荷: 0,
    感電: 0,
    凍結: 0,
    超電導: 0,
    拡散: 0,
    結晶: 0,
    燃焼: 0,
    開花: 0,
    激化: 0
};

const ステータスその他TEMPLATE = {
    ダメージ軽減: 0,
    'HP%': 0,
    '攻撃力%': 0,
    '防御力%': 0,
    'HP+': 0,
    '攻撃力+': 0,
    '防御力+': 0
};

const 聖遺物メイン効果_生の花ARR = [
    '5_HP', '4_HP'
];

const 聖遺物メイン効果_死の羽ARR = [
    '5_攻撃力', '4_攻撃力'
];

const 聖遺物メイン効果_時の砂ARR = [
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

const 聖遺物メイン効果_空の杯ARR = [
    '5_炎元素ダメージバフ',
    '5_水元素ダメージバフ',
    '5_風元素ダメージバフ',
    '5_雷元素ダメージバフ',
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
    '4_氷元素ダメージバフ',
    '4_岩元素ダメージバフ',
    '4_物理ダメージバフ',
    '4_HP%',
    '4_攻撃力%',
    '4_防御力%',
    '4_元素熟知'
];

const 聖遺物メイン効果_理の冠ARR = [
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

const ステータスTEMPLATE = {
    '基礎ステータス': 基礎ステータスTEMPLATE,
    '基本ステータス': 基本ステータスTEMPLATE,
    '高級ステータス': 高級ステータスTEMPLATE,
    '元素ステータス・ダメージ': 元素ステータス_ダメージTEMPLATE,
    '元素ステータス・耐性': 元素ステータス_耐性TEMPLATE,
    'ダメージバフ': ダメージバフTEMPLATE,
    '実数ダメージ加算': 実数ダメージ加算TEMPLATE,
    '元素反応バフ': 元素反応バフTEMPLATE,
    'その他': ステータスその他TEMPLATE
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

const 突破レベルレベルARR = [
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

// 暫定
const 詳細_種類TEMPLATE = {
    レベル: 0,
    HP乗算: 0,
    攻撃力乗算: 0,
    防御力乗算: 0,
    基礎HP: 0,
    基礎攻撃力: 0,
    基礎防御力: 0,
    HP上限: 0,
    攻撃力: 0,
    防御力: 0,
    元素熟知: 0,
    会心率: 5,
    会心ダメージ: 50,
    与える治療効果: 0,
    受ける治療効果: 0,
    クールタイム短縮: 0,
    シールド強化: 0,
    元素チャージ効率: 100,
    炎元素ダメージバフ: 0,
    水元素ダメージバフ: 0,
    風元素ダメージバフ: 0,
    雷元素ダメージバフ: 0,
    草元素ダメージバフ: 0,
    氷元素ダメージバフ: 0,
    岩元素ダメージバフ: 0,
    物理ダメージバフ: 0,
    炎元素耐性: 0,
    水元素耐性: 0,
    風元素耐性: 0,
    雷元素耐性: 0,
    草元素耐性: 0,
    氷元素耐性: 0,
    岩元素耐性: 0,
    物理耐性: 0,
    通常攻撃ダメージバフ: 0,
    重撃ダメージバフ: 0,
    落下攻撃ダメージバフ: 0,
    元素スキルダメージバフ: 0,
    元素爆発ダメージバフ: 0,
    与えるダメージ: 0,
    ダメージ軽減: 0,
    敵レベル: 0,
    敵炎元素耐性: 0,
    敵水元素耐性: 0,
    敵風元素耐性: 0,
    敵雷元素耐性: 0,
    敵草元素耐性: 0,
    敵氷元素耐性: 0,
    敵岩元素耐性: 0,
    敵物理耐性: 0,
    敵防御力: 0,
    蒸発反応ボーナス: 0,
    溶解反応ボーナス: 0,
    過負荷反応ボーナス: 0,
    燃焼反応ボーナス: 0,
    感電反応ボーナス: 0,
    凍結反応ボーナス: 0,
    氷砕き反応ボーナス: 0,
    拡散反応ボーナス: 0,
    超電導反応ボーナス: 0,
    結晶化反応ボーナス: 0,
    キャラクター注釈: [],
    通常攻撃ダメージアップ: 0,
    重撃ダメージアップ: 0,
    落下攻撃ダメージアップ: 0,
    元素スキルダメージアップ: 0,
    元素爆発ダメージアップ: 0,
    炎元素ダメージアップ: 0,
    水元素ダメージアップ: 0,
    風元素ダメージアップ: 0,
    雷元素ダメージアップ: 0,
    草元素ダメージアップ: 0,
    氷元素ダメージアップ: 0,
    岩元素ダメージアップ: 0,
    物理ダメージアップ: 0,
    炎元素ダメージ会心ダメージ: 0,
    水元素ダメージ会心ダメージ: 0,
    風元素ダメージ会心ダメージ: 0,
    雷元素ダメージ会心ダメージ: 0,
    氷元素ダメージ会心ダメージ: 0,
    岩元素ダメージ会心ダメージ: 0,
    聖遺物サブ効果HP: 0,
    聖遺物サブ効果攻撃力: 0,
    聖遺物サブ効果防御力: 0,
    聖遺物サブ効果元素熟知: 0,
    聖遺物サブ効果会心率: 0,
    聖遺物サブ効果会心ダメージ: 0,
    聖遺物サブ効果元素チャージ効率: 0,
    聖遺物サブ効果HPP: 0,
    聖遺物サブ効果攻撃力P: 0,
    聖遺物サブ効果防御力P: 0
};
