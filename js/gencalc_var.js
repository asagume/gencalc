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

// 選択中のデータを保持します
var selectedCharacterData;
var selectedWeaponData;
var selectedArtifactSetDataArr = [];
var selectedElementalResonanceDataArr = [];
var selectedEnemyData;

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
const calculateObj = {
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
// 
var normalAttackElement;
var chargedAttackElement;
var plungAttackElement;
//
function initCalculateObj() {
    calculateObj["基礎HP"] = 0;
    calculateObj["基礎攻撃力"] = 0;
    calculateObj["基礎防御力"] = 0;
    calculateObj["HP上限"] = 0;
    calculateObj["攻撃力"] = 0;
    calculateObj["防御力"] = 0;
    calculateObj["元素熟知"] = 0;
    calculateObj["会心率"] = 5;
    calculateObj["会心ダメージ"] = 50;
    calculateObj["与える治療効果"] = 0;
    calculateObj["受ける治療効果"] = 0;
    calculateObj["クールタイム短縮"] = 0;
    calculateObj["シールド強化"] = 0;
    calculateObj["元素チャージ効率"] = 100;
    calculateObj["炎元素ダメージバフ"] = 0;
    calculateObj["水元素ダメージバフ"] = 0;
    calculateObj["風元素ダメージバフ"] = 0;
    calculateObj["雷元素ダメージバフ"] = 0;
    calculateObj["草元素ダメージバフ"] = 0;
    calculateObj["氷元素ダメージバフ"] = 0;
    calculateObj["岩元素ダメージバフ"] = 0;
    calculateObj["物理ダメージバフ"] = 0;
    calculateObj["炎元素耐性"] = 0;
    calculateObj["水元素耐性"] = 0;
    calculateObj["風元素耐性"] = 0;
    calculateObj["雷元素耐性"] = 0;
    calculateObj["草元素耐性"] = 0;
    calculateObj["氷元素耐性"] = 0;
    calculateObj["岩元素耐性"] = 0;
    calculateObj["物理耐性"] = 0;
    calculateObj["通常攻撃ダメージバフ"] = 0;
    calculateObj["重撃ダメージバフ"] = 0;
    calculateObj["落下攻撃ダメージバフ"] = 0;
    calculateObj["元素スキルダメージバフ"] = 0;
    calculateObj["元素爆発ダメージバフ"] = 0;
    calculateObj["与えるダメージ"] = 0;
    calculateObj["敵炎元素耐性"] = 0;
    calculateObj["敵水元素耐性"] = 0;
    calculateObj["敵風元素耐性"] = 0;
    calculateObj["敵雷元素耐性"] = 0;
    calculateObj["敵草元素耐性"] = 0;
    calculateObj["敵氷元素耐性"] = 0;
    calculateObj["敵岩元素耐性"] = 0;
    calculateObj["敵物理耐性"] = 0;

    normalAttackElement = null;
    chargedAttackElement = null;
    plungAttackElement = null;
    if (selectedCharacterData) {
        if (selectedCharacterData["武器"] == "法器") {
            normalAttackElement = selectedCharacterData["元素"];
            chargedAttackElement = selectedCharacterData["元素"];
            plungAttackElement = selectedCharacterData["元素"];
        } else {
            normalAttackElement = "物理";
            chargedAttackElement = "物理";
            plungAttackElement = "物理";
        }
    }
}

