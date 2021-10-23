// マスターデータ
var キャラクターMasterVar;
var 武器MasterVar = {
    片手剣: null,
    両手剣: null,
    長柄武器: null,
    弓: null,
    法器: null
};
var 聖遺物メイン効果MasterVar;
var 聖遺物サブ効果MasterVar;
var 聖遺物セット効果MasterVar;
var 元素共鳴MasterVar;
var 敵MasterVar;
var 元素反応MasterVar;
var バフデバフMasterVar;

// 選択中のデータを保持します
var 選択中キャラクターデータVar;
var 選択中武器データVar;
var 選択中聖遺物セット効果データArrVar = [];
var 選択中元素共鳴データArrVar = [];
var 選択中敵データVar;

var キャラクター名前Var;
var キャラクター元素Var;
var キャラクター武器Var;
var 通常攻撃名称Var;
var 元素スキル名称Var;
var 元素爆発名称Var;
var 元素エネルギーVar;

// 通常攻撃天賦で使用する元素を設定します
var 通常攻撃_元素Var;
var 重撃_元素Var;
var 落下攻撃_元素Var;

// とても重要なデータ群です
var 通常攻撃_基礎ダメージ詳細ArrVar = [];
var 重撃_基礎ダメージ詳細ArrVar = [];
var 落下攻撃_基礎ダメージ詳細ArrVar = [];
var 元素スキル_基礎ダメージ詳細ArrVar = [];
var 元素爆発_基礎ダメージ詳細ArrVar = [];
var その他_基礎ダメージ詳細ArrMapVar = new Map();
// key:条件,value:＊詳細Var for 雷電将軍
var 特殊通常攻撃_基礎ダメージ詳細MapVar = new Map();
var 特殊重撃_基礎ダメージ詳細MapVar = new Map();
var 特殊落下攻撃_基礎ダメージ詳細MapVar = new Map();
// 
var ステータス変更系詳細ArrMapVar = new Map();
var 天賦性能変更系詳細ArrMapVar = new Map();

// バフデバフBox用
var バフデバフ詳細ArrVar = [];
var バフデバフオプション条件Map = new Map();
var バフデバフオプション排他Map = new Map();

// オプションBox用
// checkboxとselectの描画用の情報を保持します
// checkboxの場合、value=null
// selectの場合、valueは配列
const オプション条件MapVar = new Map();
const オプション排他MapVar = new Map(); // 同時にcheckedにならない条件を保持します

// hidable要素に紐づくセレクタとvisibility=true/falseを保持するMap
var selectorVisiblityStateMap = new Map();  // セレクタ, is visible

//
var ステータス詳細ObjVar = {
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
    会心率: 0,
    会心ダメージ: 0,
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
    敵炎元素耐性: 0,
    敵水元素耐性: 0,
    敵風元素耐性: 0,
    敵雷元素耐性: 0,
    敵草元素耐性: 0,
    敵氷元素耐性: 0,
    敵岩元素耐性: 0,
    敵物理耐性: 0,
    敵防御力: 0,
    燃焼ダメージバフ: 0,
    蒸発ダメージバフ: 0,
    溶解ダメージバフ: 0,
    氷砕きダメージバフ: 0,
    感電ダメージバフ: 0,
    過負荷ダメージバフ: 0,
    超電導ダメージバフ: 0,
    拡散ダメージバフ: 0
};

// マスターデータの詳細[].種類からステータス詳細ObjVarのプロパティへの変換表です
const KIND_TO_PROPERTY_MAP = new Map([
    ['HP', 'HP上限'],
    ['HP%', 'HP乗算'],
    ['攻撃力', '攻撃力'],
    ['攻撃力%', '攻撃力乗算'],
    ['防御力', '防御力'],
    ['防御力%', '防御力乗算']
]);

// ステータス詳細ObjVarを初期化します
function initステータス詳細ObjVar() {
    Object.keys(ステータス詳細ObjVar).forEach(key => {
        ステータス詳細ObjVar[key] = 0;
    });
    ステータス詳細ObjVar['会心率'] = 5;
    ステータス詳細ObjVar['会心ダメージ'] = 50;
    ステータス詳細ObjVar['元素チャージ効率'] = 100;

    // 通常攻撃の元素
    通常攻撃_元素Var = '物理';
    重撃_元素Var = '物理';
    落下攻撃_元素Var = '物理';
    if (選択中キャラクターデータVar) {
        if (選択中キャラクターデータVar['武器'] == '法器') {
            通常攻撃_元素Var = 選択中キャラクターデータVar['元素'];
            重撃_元素Var = 選択中キャラクターデータVar['元素'];
            落下攻撃_元素Var = 選択中キャラクターデータVar['元素'];
        }
    }
}

