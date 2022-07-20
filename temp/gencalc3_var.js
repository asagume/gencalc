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

const キャラクター詳細MasterMapVar = new Map();

var キャラクター所持状況Var = {};

/** キャラクター選択 */
var CharacterSelectVm;
/** キャラクター情報入力 */
var CharacterInputVm;
/** ステータス情報入力 */
var StatusInputVm;
var EnemyInputVm;
/** 計算結果 */
var CalculationResultVm;
/** キャラクター所持状況 */
var CharacterOwnListVm;
/** 武器所持状況 */
var WeaponOwnListVm;

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

const DUMMY_IMG_SRC = "data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7";

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
    '防御力%': 0
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
