// マスターデータ
var characterMaster;
var weaponMaster = {
    片手剣: null,
    両手剣: null,
    長柄武器: null,
    弓: null,
    法器: null
};
var artifactMainMaster;
var artifactSubMaster;
var artifactSetMaster;
var elementalResonanceMaster;
var enemyMaster;
var バフデバフMaster;

var バフデバフ詳細ArrVar = [];
var バフデバフオプション条件Map = new Map();
var バフデバフオプション排他Map = new Map();

// 選択中のデータを保持します
var selectedCharacterData;
var selectedWeaponData;
var selectedArtifactSetDataArr = [];
var selectedElementalResonanceDataArr = [];
var selectedEnemyData;

var キャラクター名称Var;
var キャラクター元素Var;
var キャラクター武器Var;
var 通常攻撃名称Var;
var 元素スキル名称Var;
var 元素爆発名称Var;
var 元素エネルギーVar;

var 通常攻撃_基礎ダメージ詳細ArrVar = [];
var 重撃_基礎ダメージ詳細ArrVar = [];
var 落下攻撃_基礎ダメージ詳細ArrVar = [];
var 元素スキル_基礎ダメージ詳細ArrVar = [];
var 元素爆発_基礎ダメージ詳細ArrVar = [];
var その他_基礎ダメージ詳細ArrMapVar = new Map();
// key:条件,value:＊詳細Var
var 特殊通常攻撃_基礎ダメージ詳細MapVar = new Map();
var 特殊重撃_基礎ダメージ詳細MapVar = new Map();
var 特殊落下攻撃_基礎ダメージ詳細MapVar = new Map();
//
var ダメージ増分詳細MapVar = new Map();
//
var ステータス変更系詳細ArrMapVar = new Map();
var 天賦性能変更系詳細ArrMapVar = new Map();

// 通常攻撃天賦で使用する元素を設定します
var 通常攻撃_元素Var;
var 重撃_元素Var;
var 落下攻撃_元素Var;

// hidable要素に紐づくセレクタとvisibility=true/falseを保持するMap
var selectorVisiblityStateMap = new Map();  // セレクタ, is visible
// 子要素のhidableクラス要素の表示/非表示を切り替えるイベント処理です
const toggleHidableChildren = function (id = null) {
    if (id == null) id = this.id;
    let selector = "#" + id + " .hidable";
    $(selector).toggle();
    selectorVisiblityStateMap.set(selector, $(selector).is(":visible"));
}
// 隣接するhidableクラス要素の表示/非表示を切り替えるイベント処理です
const toggleHidableNeighbor = function (id = null) {
    if (id == null) id = this.id;
    let selector = "#" + id + " .hidable";
    $(selector).toggle();
    selectorVisiblityStateMap.set(selector, $(selector).is(":visible"));
}
function isHidden(selector) {
    let isHidden = false;
    if (selectorVisiblityStateMap.has(selector)) {
        isHidden = !selectorVisiblityStateMap.get(selector);
    }
    return isHidden;
}

// 条件名
var conditionCheckboxArr = [];
// 条件名, [オプション値]
var conditionSelectMap = new Map();
// 
var conditionExclusionMap = new Map();
//
function initCondition() {
    conditionCheckboxArr.splice(0);
    conditionSelectMap.clear();
    conditionExclusionMap.clear();
}
function analyzeConditionStrSub(str) {
    let strArr = str.split("^");
    let exclusion = null;
    if (strArr > 2) {
        console.error("%s[%o]", str);
    } else if (strArr == 2) {
        exclusion = strArr[1];
    }
    let optionArr = [];
    strArr = strArr[0].split("@");
    if (strArr > 2) {
        console.error("%s[%o]", str);
    } else if (strArr == 2) {
        let re = new RegExp("([^0-9\\.]*)([0-9\\.]+)-([0-9\\.]+)([^0-9\\.]*)");
        let reRet = re.exec(strArr[1]);
        if (reRet) {
            let prefix = reRet[1];
            let start = Number(reRet[2]);
            let end = Number(reRet[3]);
            let postfix = reRet[4];
            for (let i = start; i <= end; i = addDecimal(i, start)) {
                optionArr.push(prefix + i + postfix);
            }
        } else {
            optionArr.push(strArr[1]);
        }
    }
    if (optionArr.length == 0) {
        if (!conditionCheckboxArr.includes(strArr[0])) {
            conditionCheckboxArr.push(strArr[0]);
        }
    } else {
        if (!conditionSelectMap.has(strArr[0])) {
            conditionSelectMap.set(strArr[0], optionArr);
        } else {
            optionArr.push(conditionSelectMap.get(strArr[0]));
            conditionSelectMap.set(strArr[0], $.unique(optionArr).sort());
        }
    }
    if (exclusion) {
        if (!exclusionMap.has(strArr[0])) {
            exclusionMap.set(strArr[0], exclusion);
        }
    }
}
const analyzeConditionStr = function (str) {
    let strArr = str.split(",");
    strArr.forEach(e => {
        analyzeConditionStrSub(e);
    });
}

// 

// 
const typeValueFormulaArr = [];
// 
const conditionOptionMap = new Map();
const exclusionOptionMap = new Map();
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
    敵物理耐性: 0
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

//
function initステータス詳細ObjVar() {
    ステータス詳細ObjVar['HP乗算'] = 0;
    ステータス詳細ObjVar['攻撃力乗算'] = 0;
    ステータス詳細ObjVar['防御力乗算'] = 0;

    ステータス詳細ObjVar["基礎HP"] = 0;
    ステータス詳細ObjVar["基礎攻撃力"] = 0;
    ステータス詳細ObjVar["基礎防御力"] = 0;
    ステータス詳細ObjVar["HP上限"] = 0;
    ステータス詳細ObjVar["攻撃力"] = 0;
    ステータス詳細ObjVar["防御力"] = 0;
    ステータス詳細ObjVar["元素熟知"] = 0;
    ステータス詳細ObjVar["会心率"] = 5;
    ステータス詳細ObjVar["会心ダメージ"] = 50;
    ステータス詳細ObjVar["与える治療効果"] = 0;
    ステータス詳細ObjVar["受ける治療効果"] = 0;
    ステータス詳細ObjVar["クールタイム短縮"] = 0;
    ステータス詳細ObjVar["シールド強化"] = 0;
    ステータス詳細ObjVar["元素チャージ効率"] = 100;
    ステータス詳細ObjVar["炎元素ダメージバフ"] = 0;
    ステータス詳細ObjVar["水元素ダメージバフ"] = 0;
    ステータス詳細ObjVar["風元素ダメージバフ"] = 0;
    ステータス詳細ObjVar["雷元素ダメージバフ"] = 0;
    ステータス詳細ObjVar["草元素ダメージバフ"] = 0;
    ステータス詳細ObjVar["氷元素ダメージバフ"] = 0;
    ステータス詳細ObjVar["岩元素ダメージバフ"] = 0;
    ステータス詳細ObjVar["物理ダメージバフ"] = 0;
    ステータス詳細ObjVar["炎元素耐性"] = 0;
    ステータス詳細ObjVar["水元素耐性"] = 0;
    ステータス詳細ObjVar["風元素耐性"] = 0;
    ステータス詳細ObjVar["雷元素耐性"] = 0;
    ステータス詳細ObjVar["草元素耐性"] = 0;
    ステータス詳細ObjVar["氷元素耐性"] = 0;
    ステータス詳細ObjVar["岩元素耐性"] = 0;
    ステータス詳細ObjVar["物理耐性"] = 0;
    ステータス詳細ObjVar["通常攻撃ダメージバフ"] = 0;
    ステータス詳細ObjVar["重撃ダメージバフ"] = 0;
    ステータス詳細ObjVar["落下攻撃ダメージバフ"] = 0;
    ステータス詳細ObjVar["元素スキルダメージバフ"] = 0;
    ステータス詳細ObjVar["元素爆発ダメージバフ"] = 0;
    ステータス詳細ObjVar["与えるダメージ"] = 0;
    ステータス詳細ObjVar["敵炎元素耐性"] = 0;
    ステータス詳細ObjVar["敵水元素耐性"] = 0;
    ステータス詳細ObjVar["敵風元素耐性"] = 0;
    ステータス詳細ObjVar["敵雷元素耐性"] = 0;
    ステータス詳細ObjVar["敵草元素耐性"] = 0;
    ステータス詳細ObjVar["敵氷元素耐性"] = 0;
    ステータス詳細ObjVar["敵岩元素耐性"] = 0;
    ステータス詳細ObjVar["敵物理耐性"] = 0;

    通常攻撃_元素Var = "物理";
    重撃_元素Var = "物理";
    落下攻撃_元素Var = "物理";
    if (selectedCharacterData) {
        if (selectedCharacterData["武器"] == "法器") {
            通常攻撃_元素Var = selectedCharacterData["元素"];
            重撃_元素Var = selectedCharacterData["元素"];
            落下攻撃_元素Var = selectedCharacterData["元素"];
        }
    }
}

