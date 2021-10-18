// DEBUG
function detailToHtml(obj) {
    let myArr = [];
    if ("種類" in obj) myArr.push("種類:" + obj["種類"]);
    if ("対象" in obj) myArr.push("対象:" + obj["対象"]);
    if ("数値" in obj) myArr.push("数値:[" + obj["数値"] + "]");
    if ("条件" in obj) myArr.push("条件:" + obj["条件"]);
    if ("名前" in obj) myArr.push("名前:" + obj["名前"]);
    return "{" + myArr.join(",") + "}";
}

const setDebugInfo = function () {
    $("#debugInfo").empty();
    typeValueFormulaArr.forEach(entry => {
        $("<p>", {
            text: detailToHtml(entry)
        }).appendTo("#debugInfo");
    });
    conditionOptionMap.forEach((value, key) => {
        if (value) {
            if ($.isArray(value)) {
                value.forEach(entry => {
                    $("<p>", {
                        text: key + ":" + entry
                    }).appendTo("#debugInfo");
                });
            } else {
                $("<p>", {
                    text: key + ":" + value
                }).appendTo("#debugInfo");
            }
        } else {
            $("<p>", {
                text: key
            }).appendTo("#debugInfo");
        }
    });
    Object.keys(calculateObj).forEach(key => {
        $("<p>", {
            text: key + "=" + calculateObj[key]
        }).appendTo("#debugInfo");
    });
}

// 天賦種類:通常攻撃|元素スキル|元素爆発
// 攻撃種類:通常攻撃|重撃|落下攻撃|元素スキル|元素爆発|HP回復
// 元素:炎|水|風|雷|草|氷|岩|物理
function calcダメージバフ補正(天賦種類, 攻撃種類, 元素) {
    let 天賦種類ダメージバフ = 0;
    let 攻撃種類ダメージバフ = 0;
    let 元素ダメージバフ = 0;
    let 与えるダメージ = 0;
    if (攻撃種類 == "HP回復") {
        攻撃種類ダメージバフ = calculateObj["与える治療効果"];
    } else if (攻撃種類 == "シールド") {
        攻撃種類ダメージバフ = calculateObj["シールド強化"];
    } else {
        天賦種類ダメージバフ = calculateObj[天賦種類 + "ダメージバフ"]
        攻撃種類ダメージバフ = calculateObj[攻撃種類 + "ダメージバフ"];
        if (元素 == "物理") {
            let propName = 元素 + "ダメージバフ";
            元素ダメージバフ = calculateObj[propName];
        } else {
            let propName = 元素 + "元素ダメージバフ";
            元素ダメージバフ = calculateObj[propName];
        }
        与えるダメージ = calculateObj["与えるダメージ"];
    }
    let result = 1 + (天賦種類ダメージバフ + 攻撃種類ダメージバフ + 元素ダメージバフ + 与えるダメージ) / 100;
    return result;
}

// 防御補正を計算します
function calc防御補正(防御無視 = 0) {
    let myレベル = Number($("#レベルInput").val().replace("+", ""));
    let my敵レベル = Number($("#敵レベルInput").val());
    let my防御無視 = 防御無視;
    if (my防御無視 > 1) my防御無視 = my防御無視 / 100;    // 60(%) => 0.6
    let my敵防御力 = Number($("#敵防御力Input").val()) / 100;    // -15(%) => -0.15
    let my防御補正 = (myレベル + 100) / ((1 - my防御無視) * (1 + my敵防御力) * (my敵レベル + 100) + myレベル + 100);
    return my防御補正;
}

// 元素耐性補正を計算します
function calc元素耐性補正(元素) {
    let mySelector = "#敵" + 元素;
    if (元素 != "物理") {
        mySelector += "元素";
    }
    mySelector += "耐性Input";
    let my敵元素耐性 = Number($(mySelector).val());
    if (my敵元素耐性 < 0) {
        my敵元素耐性 = 100 - my敵元素耐性 / 2;
    } else if (my敵元素耐性 < 75) {
        my敵元素耐性 = 100 - my敵元素耐性;
    } else {
        my敵元素耐性 = 100 / (4 * my敵元素耐性 + 100)
    }
    return my敵元素耐性 / 100;
}

// 詳細行が展開済みかチェックします→展開済みであれば再構成後に再展開するため
function isDetailOpen(天賦種類, 攻撃種類) {
    let result = false;
    if ($("tr[id^='" + 天賦種類 + 攻撃種類 + "DetailTr']").is(':visible')) {
        result = true;
    }
    console.debug("isDetailOpen:" + result);
    return result;
}

//
function buildResultTable(name) {
    let tableId = name + "Result";
    let tableElem = document.getElementById(tableId);
    while (tableElem.firstChild) {
        tableElem.removeChild(tableElem.firstChild);
    }
    let isHidden = isHidden("#" + tableId + " .hidable");

    let theadElem = document.createElement("thead");
    tableElem.appendChild(theadElem);
    let tbodyElem = document.createElement("tbody");
    tableElem.appendChild(tbodyElem);

    let tr1Elem = document.createElement("tr");     // 1行目：タイトル行
    theadElem.appendChild(tr1Elem);
    let tr2Elem = document.createElement("tr");     // 2行目：ダメージ期待値
    tbodyElem.appendChild(tr2Elem);
    let tr3Elem = document.createElement("tr");     // 3行目：会心ダメージ
    tr3Elem.className = "hidable";
    tr3Elem.hidden = isHidden;
    tbodyElem.appendChild(tr3Elem);
    let tr4Elem = document.createElement("tr");     // 4行目：非会心ダメージ
    tr4Elem.className = "hidable";
    tr4Elem.hidden = isHidden;
    tbodyElem.appendChild(tr4Elem);
    let th1Elem1 = document.createElement("th");    // 1行目
    th1Elem1.textContent = name.replace("ダメージ", "");
    tr1Elem.appendChild(th1Elem1);
    let th2Elem1 = document.createElement("th");    // 2行目
    th2Elem1.textContent = "期待値";
    tr2Elem.appendChild(th2Elem1);
    let th3Elem1 = document.createElement("th");    // 3行目
    th3Elem1.textContent = "会心";
    tr3Elem.appendChild(th3Elem1);
    let th4Elem1 = document.createElement("th");    // 4行目
    th4Elem1.textContent = "非会心";
    tr4Elem.appendChild(th4Elem1);


}


//// 
function displayCalculateResultTable(計算式Map, 天賦種類, 攻撃種類, 元素, isDetailOpen = false) {
    let my防御補正 = calc防御補正();
    let my元素耐性補正 = calc元素耐性補正(元素);

    let tableElem = document.createElement("table");
    tableElem.id = 天賦種類 + 攻撃種類 + "TableTr";
    document.getElementById("計算結果Box").appendChild(tableElem);
    let theadElem = document.createElement("thead");
    tableElem.appendChild(theadElem);
    let tr1Elem = document.createElement("tr"); // タイトル行
    theadElem.appendChild(tr1Elem);
    let tbodyElem = document.createElement("tbody");
    tableElem.appendChild(tbodyElem);
    let tr2Elem = document.createElement("tr"); // ダメージ期待値
    tbodyElem.appendChild(tr2Elem);
    let tr3Elem = document.createElement("tr"); // 会心ダメージ
    tr3Elem.id = 天賦種類 + 攻撃種類 + "DetailTr1";
    tr3Elem.hidden = !isDetailOpen;
    tbodyElem.appendChild(tr3Elem);
    let tr4Elem = document.createElement("tr"); // 非会心ダメージ
    tr4Elem.id = 天賦種類 + 攻撃種類 + "DetailTr2";
    tr4Elem.hidden = !isDetailOpen;
    tbodyElem.appendChild(tr4Elem);
    let th1Elem1 = document.createElement("th");
    th1Elem1.className = "label";
    th1Elem1.textContent = 攻撃種類;
    tr1Elem.appendChild(th1Elem1);
    let th2Elem1 = document.createElement("th");
    th2Elem1.className = "label";
    th2Elem1.textContent = "期待値";
    tr2Elem.appendChild(th2Elem1);
    let th3Elem1 = document.createElement("th");
    th3Elem1.className = "label";
    th3Elem1.textContent = "会心";
    tr3Elem.appendChild(th3Elem1);
    let th4Elem1 = document.createElement("th");
    th4Elem1.className = "label";
    th4Elem1.textContent = "非会心";
    tr4Elem.appendChild(th4Elem1);
    計算式Map.forEach((value, key) => {
        let my基礎ダメージ = calculateDamage(calculateObj, "攻撃力", value);
        let myダメージバフ補正 = 1;
        let my非会心ダメージ;
        let my実会心率 = 0;
        if ("種類" in key) {
            switch (key["種類"]) {
                case "HP回復":  // 会心補正なし 防御補正なし 元素耐性補正なし
                    myダメージバフ補正 += Number($("#与える治療効果Input").val()) / 100;
                    my非会心ダメージ = my基礎ダメージ * myダメージバフ補正;
                    break;
                case "シールド":  // 会心補正なし 防御補正なし 元素耐性補正なし
                    myダメージバフ補正 += Number($("#シールド強化Input").val()) / 100;
                    if (selectedCharacterData["元素"] == "岩") {    // 岩元素シールド補正150%
                        myダメージバフ補正 *= 1.5;
                    }
                    my非会心ダメージ = my基礎ダメージ * myダメージバフ補正;
                    break;
                default:
                    myダメージバフ補正 = calcダメージバフ補正(天賦種類, 攻撃種類, 元素);
                    my非会心ダメージ = my基礎ダメージ * myダメージバフ補正 * my防御補正 * my元素耐性補正;
                    my実会心率 = Math.max(0, Math.min(100, calculateObj["会心率"]));
                    break;
            }
        } else {
            myダメージバフ補正 = calcダメージバフ補正(天賦種類, 攻撃種類, 元素);
            my非会心ダメージ = my基礎ダメージ * myダメージバフ補正 * my防御補正 * my元素耐性補正;
            my実会心率 = Math.max(0, Math.min(100, calculateObj["会心率"]));
        }
        let myダメージ期待値 = my非会心ダメージ;
        let my会心ダメージ;
        if (my実会心率 > 0) {
            my会心ダメージ = my非会心ダメージ * (100 + calculateObj["会心ダメージ"]) / 100;
            myダメージ期待値 = (my会心ダメージ * my実会心率 / 100) + (my非会心ダメージ * (100 - my実会心率) / 100);
        }
        let th1Elem = document.createElement("th");
        th1Elem.textContent = key["名前"];
        tr1Elem.appendChild(th1Elem);
        let td2Elem = document.createElement("td");
        td2Elem.textContent = Math.round(myダメージ期待値);
        tr2Elem.appendChild(td2Elem);
        let td3Elem = document.createElement("td");
        if (my実会心率 > 0) {
            td3Elem.textContent = Math.round(my会心ダメージ);
        } else {
            td3Elem.textContent = "-";
        }
        tr3Elem.appendChild(td3Elem);
        let td4Elem = document.createElement("td");
        td4Elem.textContent = Math.round(my非会心ダメージ);
        tr4Elem.appendChild(td4Elem);
        console.debug("%s:会心[%d]非会心[%d]期待値[%d]", key["名前"], my会心ダメージ, my非会心ダメージ, myダメージ期待値);
    });
    tableElem.onclick = function (event) {
        let myName = event.currentTarget.id;
        let detailName = myName.replace("TableTr", "DetailTr");
        $("tr[id^='" + detailName + "']").toggle(500);
    };
}

// RESULT 計算結果
const inputOnChangeResultUpdate = function () {
    if (!selectedCharacterData) return;
    if (!selectedWeaponData) return;
    if (!selectedEnemyData) return;
    let my防御補正 = calc防御補正();
    console.debug(my防御補正);

    let my元素 = selectedCharacterData["元素"];
    let my元素耐性補正 = calc元素耐性補正(my元素);
    console.debug(my元素耐性補正);

    let my通常攻撃レベル = $("#通常攻撃レベルInput").val();
    let my元素スキルレベル = $("#元素スキルレベルInput").val();
    let my元素爆発レベル = $("#元素爆発レベルInput").val();

    let 通常攻撃_通常攻撃IsDetailOpen = isDetailOpen("通常攻撃", "通常攻撃");
    let 通常攻撃_重撃IsDetailOpen = isDetailOpen("通常攻撃", "重撃");
    let 元素スキル_元素スキルIsDetailOpen = isDetailOpen("元素スキル", "元素スキル");
    let 元素爆発_元素爆発IsDetailOpen = isDetailOpen("元素爆発", "元素爆発");
    $("#計算結果Box").empty();
    // 通常攻撃を計算します
    let my通常攻撃計算式Map = new Map();
    let my通常攻撃詳細Arr = selectedCharacterData["通常攻撃"]["詳細"];
    my通常攻撃詳細Arr.forEach(entry => {
        my通常攻撃計算式Map.set(entry, makeDamageFormulaArrFromObj(entry, my通常攻撃レベル));
    });
    console.debug(my通常攻撃計算式Map);
    displayCalculateResultTable(my通常攻撃計算式Map, "通常攻撃", "通常攻撃", normalAttackElement, 通常攻撃_通常攻撃IsDetailOpen);
    // 重撃を計算します
    let my重撃計算式Map = new Map();
    let my重撃詳細Arr = selectedCharacterData["重撃"]["詳細"];
    my重撃詳細Arr.forEach(entry => {
        my重撃計算式Map.set(entry, makeDamageFormulaArrFromObj(entry, my通常攻撃レベル));
    });
    console.debug(my重撃計算式Map);
    displayCalculateResultTable(my重撃計算式Map, "通常攻撃", "重撃", chargedAttackElement, 通常攻撃_重撃IsDetailOpen);
    // 落下攻撃を計算します
    let my落下攻撃計算式Map = new Map();
    let my落下攻撃詳細Arr = selectedCharacterData["落下攻撃"]["詳細"];
    my落下攻撃詳細Arr.forEach(entry => {
        my落下攻撃計算式Map.set(entry, makeDamageFormulaArrFromObj(entry, my通常攻撃レベル));
    });
    // 元素スキルを計算します
    let my元素スキル計算式Map = new Map();
    if ("詳細" in selectedCharacterData["元素スキル"]) {
        let my元素スキル詳細Arr = selectedCharacterData["元素スキル"]["詳細"];
        my元素スキル詳細Arr.forEach(entry => {
            my元素スキル計算式Map.set(entry, makeDamageFormulaArrFromObj(entry, my元素スキルレベル));
        });
    }
    if ("一回押し" in selectedCharacterData["元素スキル"]) {
        let my元素スキル詳細Arr = selectedCharacterData["元素スキル"]["一回押し"]["詳細"];
        my元素スキル詳細Arr.forEach(entry => {
            my元素スキル計算式Map.set(entry, makeDamageFormulaArrFromObj(entry, my元素スキルレベル));
        });
    }
    if ("長押し" in selectedCharacterData["元素スキル"]) {
        let my元素スキル詳細Arr = selectedCharacterData["元素スキル"]["長押し"]["詳細"];
        my元素スキル詳細Arr.forEach(entry => {
            my元素スキル計算式Map.set(entry, makeDamageFormulaArrFromObj(entry, my元素スキルレベル));
        });
    }
    console.debug(my元素スキル計算式Map);
    displayCalculateResultTable(my元素スキル計算式Map, "元素スキル", "元素スキル", my元素, 元素スキル_元素スキルIsDetailOpen);
    // 元素爆発を計算します
    let my元素爆発計算式Map = new Map();
    let my元素爆発詳細Arr = selectedCharacterData["元素爆発"]["詳細"];
    my元素爆発詳細Arr.forEach(entry => {
        my元素爆発計算式Map.set(entry, makeDamageFormulaArrFromObj(entry, my元素爆発レベル));
    });
    console.debug(my元素爆発計算式Map);
    displayCalculateResultTable(my元素爆発計算式Map, "元素爆発", "元素爆発", my元素, 元素爆発_元素爆発IsDetailOpen);
    // デバッグ情報を出力します
    setDebugInfo();
}

////
function setInputValue(selector, value) {
    let step = $(selector).attr('step');
    let newValue = value;
    if (step && Number(step) < 1) {
        newValue = Number(value.toFixed(1));
    } else {
        newValue = Math.round(value);
    }
    $(selector).val(newValue);
}

function compareFunction(a, b) {
    let arr = ["HP%", "HP", "HP上限", "防御力%", "防御力", "攻撃力%", "攻撃力", "元素熟知", "会心率", "会心ダメージ", "与える治療効果", "受ける治療効果", "元素チャージ効率"];
    let aIndex = arr.indexOf(a["種類"]);
    let bIndex = arr.indexOf(b["種類"]);
    return (aIndex != -1 ? aIndex : arr.length) - (bIndex != -1 ? bIndex : arr.length);
}

function calculateStatus(obj, kind, formula) {
    let result = 0;
    if (kind.endsWith("%")) {
        if (["HP%", "攻撃力%", "防御力%"].includes(kind)) {
            kind = kind.replace(new RegExp("%$"), "");
            let value = ($.isArray(formula) ? formula[0] : formula);
            result = Number(value) / 100 * obj["基礎" + kind];
        }
    } else {
        if ($.isArray(formula)) {
            let op;
            formula.forEach(entry => {
                if (["+", "-", "*"].includes(entry)) {  // 加算 減算 乗算
                    op = entry;
                    return;
                }
                let value;
                if ($.isNumeric(entry)) {
                    value = Number(entry);
                } else {
                    if (entry in obj) {
                        value = obj[entry];
                    } else {
                        console.error(calculateStatus.name, obj, kind, formula);
                    }
                }
                if (op) {
                    switch (op) {
                        case "+":
                            result += value;
                            break;
                        case "-":
                            result -= value;
                            break;
                        case "*":
                            result *= value;
                            break;
                    }
                } else {
                    result += value;
                }
                op = null;
            });
        } else {
            if ($.isNumeric(formula)) {
                result += Number(formula);
            } else {
                if (formula in obj) {
                    result += obj[formula];
                } else {
                    console.error("%s[%o,%o,%o] => %o", calculateStatus.name, null, kind, formula, result);
                }
            }
        }
    }
    let statusName = kind;
    if (!$.isNumeric(result)) {
        console.error("%s[%o,%o,%o] => %o", calculateStatus.name, null, kind, formula, result);
    }
    if (["HP", "HP%"].includes(kind)) {
        statusName = "HP上限";
    } else if (kind == "自元素ダメージバフ") {
        statusName = selectedCharacterData["元素"] + "元素ダメージバフ";
    } else if (kind == "全元素ダメージバフ") {
        ["炎", "水", "風", "雷", "草", "氷", "岩"].forEach(entry => {
            let statusName = entry + "元素ダメージバフ";
            obj[statusName] = obj[statusName] + result;
        });
        console.debug("%s[%o,%o,%o] => %o", calculateStatus.name, null, kind, formula, result);
        return;
    }
    obj[statusName] = obj[statusName] + result;
    console.debug("%s[%o,%o,%o] => %o", calculateStatus.name, null, kind, formula, result);
}

function calculateSubStatus (obj, statusObj, level = null) {
    let ignoreArr = ["基礎HP", "基礎攻撃力", "基礎防御力"];
    Object.keys(statusObj).forEach(propName => {
        if (ignoreArr.includes(propName)) return;
        let formula = level != null ? statusObj[propName][level] : statusObj[propName];
        calculateStatus(obj, propName, statusObj, formula);
    });
}

// RESULT/INPUT ステータスを計算します
const inputOnChangeStatusUpdateSub = function (baseUpdate = true) {
    console.debug(inputOnChangeStatusUpdate.name);
    if (!selectedCharacterData) return;
    if (!selectedWeaponData) return;
    // 基礎
    initCalculateObj();
    let myLevel = $("#レベルInput").val();
    if (baseUpdate) {
        calculateObj["基礎HP"] = selectedCharacterData["ステータス"]["基礎HP"][myLevel];
        calculateObj["基礎攻撃力"] = selectedCharacterData["ステータス"]["基礎攻撃力"][myLevel] + selectedWeaponData["ステータス"]["基礎攻撃力"][myLevel];
        calculateObj["基礎防御力"] = selectedCharacterData["ステータス"]["基礎防御力"][myLevel];
    } else {
        calculateObj["基礎HP"] = Number($("#基礎HPInput").val());
        calculateObj["基礎攻撃力"] = Number($("#基礎攻撃力Input").val());
        calculateObj["基礎防御力"] = Number($("#基礎防御力Input").val());
    }
    calculateObj["HP上限"] = calculateObj["基礎HP"];
    calculateObj["攻撃力"] = calculateObj["基礎攻撃力"];
    calculateObj["防御力"] = calculateObj["基礎防御力"];
    calculateObj["敵炎元素耐性"] = selectedEnemyData["炎元素耐性"];
    calculateObj["敵水元素耐性"] = selectedEnemyData["水元素耐性"];
    calculateObj["敵風元素耐性"] = selectedEnemyData["風元素耐性"];
    calculateObj["敵雷元素耐性"] = selectedEnemyData["雷元素耐性"];
    calculateObj["敵草元素耐性"] = 0;
    calculateObj["敵氷元素耐性"] = selectedEnemyData["氷元素耐性"];
    calculateObj["敵岩元素耐性"] = selectedEnemyData["岩元素耐性"];
    calculateObj["敵物理耐性"] = selectedEnemyData["物理耐性"];
    calculateObj["敵防御力"] = 0;
    // キャラクターと武器のサブステータスを計算します
    calculateSubStatus (calculateObj, selectedCharacterData["ステータス"], myLevel);
    calculateSubStatus (calculateObj, selectedWeaponData["ステータス"], myLevel);
    // 聖遺物メイン効果
    $('select[name="聖遺物メイン効果Input"]').each(function () {
        calculateStatus(calculateObj, this.value, [artifactMainMaster["5"][this.value]]);
    });
    // 聖遺物サブ効果
    calculateObj["HP上限"] = calculateObj["HP上限"] + Number($("#聖遺物サブ効果HPInput").val()) + (calculateObj["基礎HP"] * Number($("#聖遺物サブ効果HPPInput").val()) / 100);
    calculateObj["攻撃力"] = calculateObj["攻撃力"] + Number($("#聖遺物サブ効果攻撃力Input").val()) + (calculateObj["基礎攻撃力"] * Number($("#聖遺物サブ効果攻撃力PInput").val()) / 100);
    calculateObj["防御力"] = calculateObj["防御力"] + Number($("#聖遺物サブ効果防御力Input").val()) + (calculateObj["基礎防御力"] * Number($("#聖遺物サブ効果防御力PInput").val()) / 100);;
    calculateObj["元素熟知"] = calculateObj["元素熟知"] + Number($("#聖遺物サブ効果元素熟知Input").val());
    calculateObj["会心率"] = calculateObj["会心率"] + Number($("#聖遺物サブ効果会心率Input").val());
    calculateObj["会心ダメージ"] = calculateObj["会心ダメージ"] + Number($("#聖遺物サブ効果会心ダメージInput").val());
    calculateObj["元素チャージ効率"] = calculateObj["元素チャージ効率"] + Number($("#聖遺物サブ効果元素チャージ効率Input").val());
    // 元素共鳴
    selectedElementalResonanceDataArr.forEach(entry => {
        if ("詳細" in entry) {
            if ($.isArray(entry["詳細"])) {
                console.debug(entry);
                entry["詳細"].forEach(data => {
                    calculateStatus(calculateObj, data["種類"], data["数値"]);
                });
            } else {
                let data = entry["詳細"];
                calculateStatus(calculateObj, data["種類"], data["数値"]);
            }
        }
    });
    // 各種アビリティ
    let currentInputOptionArr = [];
    $('input[name="オプション"]').each(function () {
        if (this.checked) {
            currentInputOptionArr.push(this.id.replace("Option", ""));
        }
    });
    $('select[name="オプション"]').each(function () {
        currentInputOptionArr.push(this.id.replace("Option", "") + "@" + this.value);
    });
    typeValueFormulaArr.forEach(entry => {
        if ("条件" in entry) {
            if (!currentInputOptionArr.includes(entry["条件"])) return;
        }
        let re = new RegExp("(.+)元素付与");
        let reRet = re.exec(entry["種類"]);
        if (reRet) {
            normalAttackElement = reRet[1];
            chargedAttackElement = reRet[1];
        }
        if ("数値" in entry) {
            calculateStatus(calculateObj, entry["種類"], entry["数値"]);
        }
    });
    // calculateObj⇒各Input要素 値をコピーします
    setObjectPropertiesToElements(calculateObj, "", "Input");
    inputOnChangeResultUpdate();
}

const inputOnChangeStatusUpdate = function () {
    inputOnChangeStatusUpdateSub(true);
}

const inputOnChangeStatusUpdateExceptBase = function () {
    inputOnChangeStatusUpdateSub(false);
}

$(document).on("change", "input[name='基礎ステータスInput']", inputOnChangeStatusUpdateExceptBase);
$(document).on("change", "input[name='ステータスInput']", inputOnChangeStatusUpdate);

// INPUT オプションを構成します
const analyzeDetailObj = function (obj, name, level) {
    if ($.isArray(obj)) {
        obj.forEach(e => {
            analyzeDetailObj(e, name, level);
        });
    } else {
        let resultObj = JSON.parse(JSON.stringify(obj));
        let myName = name;
        if ("名前" in obj) {
            myName += "." + obj["名前"];
        }
        resultObj["名前"] = myName;
        let myCondition = null;
        if ("条件" in obj) {
            myCondition = analyzeConditionStr(obj["条件"]);
        }
        let myFormula = null;
        if ("数値" in obj) {
            if (level) {
                myFormula = obj["数値"][level];
            }
        }

    }
}
// 名前なし：[計算式]
var statusFormulaMap = new Map();
// 名前あり・条件なし：名前 - [ 天賦種別(通常攻撃|元素スキル|元素爆発),攻撃種別(通常攻撃|重撃|落下攻撃|元素スキル|元素爆発),元素,[計算式] ]
var unconditionalDamageFormulaMap = new Map();
// 名前あり・条件あり：条件 - [ 対象,[計算式] ]
var conditionalDamageFormulaMap = new Map();
const setupDamageFormulaMapSub = function (obj, damageName, talentKind, damageKind, damageElement, level = null) {
    let myDamageName = damageName;
    if ("名前" in obj) {
        myDamageName += "." + obj["名前"];
    } else {
        if ("種類" in obj) {
        }
    }
    if ("種類" in obj) {

    } else {
        switch (damageKind) {
            case "通常攻撃ダメージ":

        }
    }
}
const setupDamageFormulaMap = function (obj, damageName, talentKind, damageKind, damageElement, level = null) {
    if (!"詳細" in obj) {
        setupDamageFormulaMapSub(obj, null, null, null, null, level);
        return;
    }
    if ($.Array(obj["詳細"])) {
        obj["詳細"].forEach(entry => {
            setupDamageFormulaMapSub(entry, damageName, talentKind, damageKind, damageElement, level);
        });
    } else {
        setupDamageFormulaMapSub(obj["詳細"], damageName, talentKind, damageKind, damageElement, level);
    }

    let myCondition = null;
    if ("条件" in obj) {
        myCondition = obj["数値"];
    } else {
        let myDamageName = damageName;
        if ("名前" in obj) {
            myDamageName += "." + obj["名前"];
        }
        let myTalentKind = talentKind;  // 通常攻撃|元素スキル|元素爆発|その他=null
        let myDamageKind = damageKind;  // 通常攻撃|重撃|落下攻撃|元素スキル|元素爆発|HP回復|シールド|その他=null
        if ("種類" in obj) {
            if (obj["種類"] in calculateObj) {  // バフ/デバフ系
                myDamageKind = obj["種類"];

            } else {
                switch (obj["種類"]) {
                    case "追加ダメージ":
                        break;
                }
            }
        }
        let myElement = damageElement;
        if ("元素" in obj) {
            myElement = obj["元素"];
        }


    }






    let myFormula = level != null ? obj["数値"][level] : obj["数値"];

}
const inputOnChangeOptionUpdate = function () {
    console.debug(inputOnChangeOptionUpdate.name);
    if (!selectedCharacterData) return;
    if (!selectedWeaponData) return;
    typeValueFormulaArr.splice(0);
    // キャラクター
    let myLevel = $("#レベルInput").val();
    setupTypeValueFormulaArr("副ステータス", selectedCharacterData["副ステータス"], myLevel);
    //    let myDamageName = "通常攻撃";
    //    let myDamageElement = selectedCharacterData["武器"] == "法器" ? selectedCharacterData["元素"] : "物理";
    //    myLevel = $("#通常攻撃レベルInput").val();
    //    selectedCharacterData["通常攻撃"].forEach(entry => {
    //        setupDamageFormulaMap(entry, myDamageName, myDamageElement, myLevel);
    //    });
    //    myDamageName = "重撃";
    //    selectedCharacterData["重撃"].forEach(entry => {
    //        setupDamageFormulaMap(entry, myDamageName, myDamageElement, myLevel);
    //    });
    //    myDamageName = "落下攻撃";
    //    selectedCharacterData["落下攻撃"].forEach(entry => {
    //        setupDamageFormulaMap(entry, myDamageName, myDamageElement, myLevel);
    //    });
    //    myDamageElement = selectedCharacterData["元素"];
    //    myLevel = $("#元素スキルレベルInput").val();
    //    selectedCharacterData["元素スキル"].forEach(entry => {
    //        if ("一回押し" in entry) {
    //            myDamageName = "元素スキル.一回押し";
    //            setupDamageFormulaMap(entry, myDamageName, myDamageElement, myLevel);
    //        }
    //        if ("長押し" in entry) {
    //            myDamageName = "元素スキル.長押し";
    //            setupDamageFormulaMap(entry, myDamageName, myDamageElement, myLevel);
    //        }
    //        myDamageName = "元素スキル";
    //        setupDamageFormulaMap(entry, myDamageName, myDamageElement, myLevel);
    //    });
    //    myDamageName = "元素爆発";
    //    myDamageElement = selectedCharacterData["元素"];
    //    myLevel = $("#元素爆発レベルInput").val();
    //    selectedCharacterData["元素爆発"].forEach(entry => {
    //        setupDamageFormulaMap(entry, myDamageName, myDamageElement, myLevel);
    //    });
    selectedCharacterData["その他天賦"].forEach(entry => {
        if ("詳細" in entry) {
            let key = "天賦" + ("名前" in entry ? "." + entry["名前"] : null);
            let level = null;
            if ("種類" in entry) {
                switch (entry["種類"]) {
                    case "元素スキル":
                        level = $("#元素スキルレベルInput").val();
                        break;
                    case "元素爆発":
                        level = $("#元素爆発レベルInput").val();
                        break;
                }
            }
            setupTypeValueFormulaArr(key, entry["詳細"], level);
        }
    });
    for (let i = $("#命ノ星座Input").val(); i > 0; i--) {
        let myData = selectedCharacterData["命ノ星座"][i];
        if ("詳細" in myData) {
            let key = "命ノ星座" + ("名前" in myData ? "." + myData["名前"] : null);
            setupTypeValueFormulaArr(key, myData["詳細"]);
        }
    }
    // 武器
    setupTypeValueFormulaArr("武器副ステータス", selectedWeaponData["副ステータス"], $("#武器レベルInput").val());
    if ("武器スキル" in selectedWeaponData && "詳細" in selectedWeaponData["武器スキル"]) {
        let key = "武器スキル" + ("名前" in selectedWeaponData["武器スキル"] ? "." + selectedWeaponData["武器スキル"]["名前"] : null);
        setupTypeValueFormulaArr(key, selectedWeaponData["武器スキル"]["詳細"], $("#精錬ランクInput").val());
    }
    // 聖遺物セット
    selectedArtifactSetDataArr.forEach(entry => {
        if ("詳細" in entry) {
            let key = "聖遺物";
            setupTypeValueFormulaArr(key, entry["詳細"]);
        }
    });
    // 現在選択中のオプションの値を退避します
    let currentInputUncheckedArr = [];
    let currentSelectValueMap = new Map();
    $('input[name="オプション"]').each(function () {
        if (!this.checked) {
            currentInputUncheckedArr.push(this.id);
        }
    });
    $('select[name="オプション"]').each(function () {
        currentSelectValueMap.set(this.id, this.value);
    });
    console.debug("currentInputCheckedArr:" + currentInputUncheckedArr);
    console.debug("currentSelectValueMap:" + currentSelectValueMap);
    conditionOptionMap.clear();
    exclusionOptionMap.clear();
    typeValueFormulaArr.forEach(entry => {
        if ("条件" in entry) {
            makeConditionExclusionMapFromStr(entry["条件"], conditionOptionMap, exclusionOptionMap);
        }
    });
    typeValueFormulaArr.sort(compareFunction);
    // オプションを作り直します
    $("#オプションBox").empty();
    conditionOptionMap.forEach((value, key) => {
        console.debug(key);
        if (value) {
            let divElem = document.createElement("div");
            $("#オプションBox").append(divElem);
            let elem = document.createElement("select");
            elem.id = key + "Option";
            elem.name = "オプション";
            divElem.append(elem);
            let optionElem = document.createElement("option");
            elem.appendChild(optionElem);
            value.forEach(v => {
                optionElem = document.createElement("option");
                optionElem.text = v;
                optionElem.value = v;
                elem.appendChild(optionElem);
            });
            optionElem.selected = true;
            let labelElem = document.createElement("label");
            labelElem.htmlFor = elem.id;
            labelElem.textContent = key;
            elem.before(labelElem);
            elem.onchange = optionInputOnChange;
        } else {
            let elem = document.createElement("input");
            elem.type = "checkbox";
            elem.checked = true;
            elem.value = value;
            elem.id = key + "Option";
            elem.name = "オプション";
            $("#オプションBox").append(elem);
            let labelElem = document.createElement("label");
            labelElem.htmlFor = elem.id;
            labelElem.textContent = key;
            elem.after(labelElem);
            elem.onchange = optionInputOnChange;
        }
    });
    // オプションの値を戻します
    currentInputUncheckedArr.forEach(id => {
        let elem = document.getElementById(id);
        if (elem) {
            elem.checked = false;
        }
    });
    currentSelectValueMap.forEach((value, id) => {
        let elem = document.getElementById(id);
        if (elem) {
            elem.value = value;
        }
    });
    inputOnChangeStatusUpdate();
};
const optionInputOnChange = function () {
    console.debug(optionInputOnChange.name);
    inputOnChangeStatusUpdate();
};
// INPUT 敵
const enemyInputOnChange = function () {
    selectedEnemyData = enemyMaster[$("#敵Input").val()];
    setObjectPropertiesToElements(selectedEnemyData, "敵", "Input");
    setInputValue("#敵防御力Input", 0);
    inputOnChangeResultUpdate();
}

$(document).on("change", "#敵Input", enemyInputOnChange);
$(document).on("change", "#敵レベルInput", inputOnChangeResultUpdate);
$(document).on("change", "#敵炎元素耐性Input", inputOnChangeResultUpdate);
$(document).on("change", "#敵水元素耐性Input", inputOnChangeResultUpdate);
$(document).on("change", "#敵風元素耐性Input", inputOnChangeResultUpdate);
$(document).on("change", "#敵雷元素耐性Input", inputOnChangeResultUpdate);
$(document).on("change", "#敵氷元素耐性Input", inputOnChangeResultUpdate);
$(document).on("change", "#敵岩元素耐性Input", inputOnChangeResultUpdate);
$(document).on("change", "#敵物理耐性Input", inputOnChangeResultUpdate);
$(document).on("change", "#敵防御力Input", inputOnChangeResultUpdate);
// INPUT 元素共鳴
const elementalResonanceInputOnChange = function (event) {
    if (event.currentTarget == $("#元素共鳴なしInput").get(0) && event.currentTarget.checked) {
        $("input[name='元素共鳴Input']").each(function (index, element) {
            if (element != $("#元素共鳴なしInput").get(0)) {
                element.checked = false;
            }
        });
        selectedElementalResonanceDataArr = [];
        selectedElementalResonanceDataArr.push(elementalResonanceMaster["元素共鳴なし"]);
    } else {
        $("#元素共鳴なしInput").prop("checked", false);
        let count = 0;
        $("[name='元素共鳴Input'").each(function (index, element) {
            if (element.checked) count++;
        });
        if (count > 2) {
            event.currentTarget.checked = false;
        } else {
            selectedElementalResonanceDataArr = [];
            $("[name='元素共鳴Input'").each(function (index, element) {
                if (element.checked) {
                    selectedElementalResonanceDataArr.push(elementalResonanceMaster[element.value]);
                }
            });
        }
    }
    $("#元素共鳴効果説明Box").empty();
    selectedElementalResonanceDataArr.forEach(data => {
        let my説明 = data["説明"];
        if (Array.isArray(my説明)) {
            my説明.join("<br>");
        }
        $("<p>", {
            html: my説明
        }).appendTo("#元素共鳴効果説明Box");
    });
    inputOnChangeStatusUpdate();
}
$(document).on("change", "input[name='元素共鳴Input']", elementalResonanceInputOnChange);
// INPUT 聖遺物
const inputOnChangeArtifactSubUpdate = function () {
    let workObj = {
        HP: 0,
        攻撃力: 0,
        防御力: 0,
        元素熟知: 0,
        HPP: 0,
        攻撃力P: 0,
        防御力P: 0,
        会心率: 0,
        会心ダメージ: 0,
        元素チャージ効率: 0
    };
    let my優先するサブ効果Arr = [];
    let my優先するサブ効果倍率合計 = 0;
    Array.from(document.getElementsByName("聖遺物優先するサブ効果Input")).forEach(elem => {
        let propName = elem.value;
        if (propName) {
            let myValue = artifactSubMaster[elem.value];
            let myMagnification = Number(document.getElementById(elem.id.replace("Input", "倍率Input")).value);
            propName = propName.replace("%", "P");
            workObj[propName] = workObj[propName] + (myValue * myMagnification) * 5;
            if (!my優先するサブ効果Arr.includes(elem.value)) {
                my優先するサブ効果Arr.push(elem.value);
            }
            my優先するサブ効果倍率合計 += myMagnification;
        }
    });
    let 優先しないサブ効果倍率 = Math.max(0, 10 - my優先するサブ効果倍率合計) / (10 - my優先するサブ効果Arr.length);
    Object.keys(workObj).forEach(key => {
        if (workObj[key] == 0) {
            let newKey = key;
            if (key != "HP") newKey = key.replace(new RegExp("P$"), "%");
            let value = artifactSubMaster[newKey];
            workObj[key] = value * 4 * 優先しないサブ効果倍率;
        }
    });
    setInputValue("#聖遺物サブ効果HPInput", workObj["HP"]);
    setInputValue("#聖遺物サブ効果攻撃力Input", workObj["攻撃力"]);
    setInputValue("#聖遺物サブ効果防御力Input", workObj["防御力"]);
    setInputValue("#聖遺物サブ効果元素熟知Input", workObj["元素熟知"]);
    setInputValue("#聖遺物サブ効果HPPInput", workObj["HPP"]);
    setInputValue("#聖遺物サブ効果攻撃力PInput", workObj["攻撃力P"]);
    setInputValue("#聖遺物サブ効果防御力PInput", workObj["防御力P"]);
    setInputValue("#聖遺物サブ効果会心率Input", workObj["会心率"]);
    setInputValue("#聖遺物サブ効果会心ダメージInput", workObj["会心ダメージ"]);
    setInputValue("#聖遺物サブ効果元素チャージ効率Input", workObj["元素チャージ効率"]);
    inputOnChangeStatusUpdate();
};
const artifactSetInputOnChange = function () {
    selectedArtifactSetDataArr = [];
    if ($("#聖遺物セット効果1Input").val() == $("#聖遺物セット効果2Input").val()) {
        let myData = artifactSetMaster[$("#聖遺物セット効果1Input").val()];
        selectedArtifactSetDataArr.push(myData["2セット効果"]);
        if ("4セット効果" in myData) {
            selectedArtifactSetDataArr.push(myData["4セット効果"]);
        }
    } else {
        selectedArtifactSetDataArr.push(artifactSetMaster[$("#聖遺物セット効果1Input").val()]["2セット効果"]);
        selectedArtifactSetDataArr.push(artifactSetMaster[$("#聖遺物セット効果2Input").val()]["2セット効果"]);
    }
    $("#聖遺物セット効果説明Box").empty();
    selectedArtifactSetDataArr.forEach(data => {
        let my説明 = data["説明"];
        if (Array.isArray(my説明)) {
            my説明.join("<br>");
        }
        $("<p>", {
            html: my説明
        }).appendTo("#聖遺物セット効果説明Box");
    });
    inputOnChangeOptionUpdate();
}
$(document).on("change", "select[name='聖遺物メイン効果Input']", inputOnChangeStatusUpdate);
$(document).on("change", "select[name='聖遺物優先するサブ効果Input']", inputOnChangeArtifactSubUpdate);
$(document).on("change", "select[name='聖遺物優先するサブ効果倍率Input']", inputOnChangeArtifactSubUpdate);
$(document).on("change", "select[name='聖遺物セット効果Input']", artifactSetInputOnChange);
$(document).on("change", "input[name='聖遺物サブ効果Input']", inputOnChangeStatusUpdate);
////
const appendOptionElement = function (key, data, selector) {
    if ("disabled" in data[key] && data[key]["disabled"]) return;
    $("<option>", {
        text: key,
        value: key,
        disabled: ("disabled" in data[key]) && data[key]["disabled"],
        selected: ("selected" in data[key]) && data[key]["selected"]
    }).appendTo(selector);
};
const appendOptionElements = function (data, selector) {
    $(selector).empty();
    Object.keys(data).forEach(key => {
        if ($.isArray(selector)) {
            selector.forEach(entry => {
                appendOptionElement(key, data, entry);
            });
        } else {
            appendOptionElement(key, data, selector);
        }
    });
};
// INPUT 武器
const weaponInputOnChange = function () {
    fetch(weaponMaster[selectedCharacterData["武器"]][$("#武器Input").val()]["import"]).then(response => response.json()).then(data => {
        selectedWeaponData = data;
        console.debug(selectedWeaponData);
        inputOnChangeOptionUpdate();
    });
};
$(document).on("change", "#武器Input", weaponInputOnChange);
$(document).on("change", "#武器レベルInput", inputOnChangeStatusUpdate);
$(document).on("change", "#精錬ランクInput", inputOnChangeOptionUpdate);

// INPUT キャラクター
const characterInputOnChange = function () {
    fetch(characterMaster[$("#キャラクターInput").val()].import).then(response => response.json()).then(data => {
        selectedCharacterData = data;
        console.debug(selectedCharacterData);
        appendOptionElements(weaponMaster[selectedCharacterData["武器"]], "#武器Input");
        if ("おすすめセット" in selectedCharacterData) {
            if ($.isArray(selectedCharacterData["おすすめセット"])) {
                let arr = selectedCharacterData["おすすめセット"];
                let entry = arr[0];
                Object.keys(entry).forEach(key => {
                    if (entry[key]) {
                        $("#" + key + "Input").val(entry[key]);
                    } else {
                        $("#" + key + "Input").prop("selectedIndex", 0);
                        console.debug($("#" + key + "Input"));
                    }
                });
            }
            inputOnChangeArtifactSubUpdate();
            artifactSetInputOnChange();
        }
        weaponInputOnChange();
    });
};
$(document).on("change", "#キャラクターInput", characterInputOnChange);
$(document).on("change", "#レベルInput", inputOnChangeStatusUpdate);
$(document).on("change", "#命ノ星座Input", inputOnChangeOptionUpdate);
$(document).on("change", "#通常攻撃レベルInput", inputOnChangeStatusUpdate);
$(document).on("change", "#元素スキルレベルInput", inputOnChangeStatusUpdate);
$(document).on("change", "#元素爆発レベルInput", inputOnChangeStatusUpdate);
