// @ts-check

const DAMAGE_RESULT_TABLE_ID_ARR = [
    '通常攻撃ダメージResult',
    '重撃ダメージResult',
    '落下攻撃ダメージResult',
    '元素スキルダメージResult',
    '元素爆発ダメージResult',
    'その他ダメージResult'
];

// マスターデータ
var キャラクターリストMasterVar;

var 武器リストMasterVar = {
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
var オプション1MasterVar;
var オプション2MasterVar;
var チームオプションMasterVar;

const キャラクターMasterMap = new Map();
const 武器MasterMap = new Map();

// 選択中のデータを保持します
var 選択中キャラクターデータVar;
var 選択中武器データVar;
var 選択中聖遺物セット効果データArrVar = [];
var 選択中元素共鳴データArrVar = [];
var 選択中敵データVar;

var 選択可能武器セットObjVar = {};

var キャラクター元素Var;
var キャラクター武器Var;
var 通常攻撃名称Var;
var 元素スキル名称Var;
var 元素爆発名称Var;
var 元素エネルギーVar;
var おすすめセットArrVar;

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

// バフ/デバフBox用
var その他オプション1ArrVar = [];
const その他オプション1条件MapVar = new Map();
const その他オプション1排他MapVar = new Map();
var その他オプション2ArrVar = [];
const その他オプション2条件MapVar = new Map();
const その他オプション2排他MapVar = new Map();
var チームオプション詳細ArrVar = [];
const チームオプション条件MapVar = new Map();
const チームオプション排他MapVar = new Map();

// オプションBox用
// checkboxとselectの描画用の情報を保持します
// checkboxの場合、value=null
// selectの場合、valueは配列
const オプション条件MapVar = new Map();
const オプション排他MapVar = new Map(); // 同時にcheckedにならない条件を保持します

// オプションの状態を記憶します。
const オプションElementIdValue記憶Map = new Map();

// hidable要素に紐づくセレクタとvisibility=true/falseを保持するMap
var selectorVisiblityStateMap = new Map();  // セレクタ, is visible

//
var ステータス詳細ObjVar = {};
const ステータス詳細ObjTemplate = {
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

const キャラクター構成PROPERTY_MAP = new Map([
    ['キャラクター', null],
    ['レベル', null],
    ['命ノ星座', 0],
    ['通常攻撃レベル', 0],
    ['元素スキルレベル', 0],
    ['元素爆発レベル', 0],
    ['武器', null],
    ['武器レベル', 0],
    ['精錬ランク', 0],
    ['聖遺物セット効果1', null],
    ['聖遺物セット効果2', null],
    ['聖遺物メイン効果1', null],
    ['聖遺物メイン効果2', null],
    ['聖遺物メイン効果3', null],
    ['聖遺物メイン効果4', null],
    ['聖遺物メイン効果5', null],
    ['聖遺物サブ効果HP', 0],
    ['聖遺物サブ効果攻撃力', 0],
    ['聖遺物サブ効果防御力', 0],
    ['聖遺物サブ効果元素熟知', 0],
    ['聖遺物サブ効果会心率', 0],
    ['聖遺物サブ効果会心ダメージ', 0],
    ['聖遺物サブ効果元素チャージ効率', 0],
    ['聖遺物サブ効果HPP', 0],
    ['聖遺物サブ効果攻撃力P', 0],
    ['聖遺物サブ効果防御力P', 0],
    ['聖遺物優先するサブ効果1', null],
    ['聖遺物優先するサブ効果1上昇値', 0],
    ['聖遺物優先するサブ効果1上昇回数', 0],
    ['聖遺物優先するサブ効果2', null],
    ['聖遺物優先するサブ効果2上昇値', 0],
    ['聖遺物優先するサブ効果2上昇回数', 0],
    ['聖遺物優先するサブ効果3', null],
    ['聖遺物優先するサブ効果3上昇値', 0],
    ['聖遺物優先するサブ効果3上昇回数', 0]
]);

// マスターデータの詳細[].種類からステータス詳細ObjVarのプロパティへの変換表です
const KIND_TO_PROPERTY_MAP = new Map([
    ['HP', 'HP上限'],
    ['HP%', 'HP乗算'],
    ['攻撃力', '攻撃力'],
    ['攻撃力%', '攻撃力乗算'],
    ['防御力', '防御力'],
    ['防御力%', '防御力乗算']
]);

const ELEMENT_TD_CLASS_MAP = new Map([
    ['炎', 'pyro'],
    ['水', 'hydro'],
    ['風', 'anemo'],
    ['雷', 'electro'],
    ['草', 'dendro'],
    ['氷', 'cryo'],
    ['岩', 'geo']
]);

const ELEMENT_IMG_SRC_MAP = new Map([
    ['炎', 'images/element_pyro.png'],
    ['水', 'images/element_hydro.png'],
    ['風', 'images/element_anemo.png'],
    ['雷', 'images/element_electro.png'],
    ['草', 'images/element_dendro.png'],
    ['氷', 'images/element_cryo.png'],
    ['岩', 'images/element_geo.png']
]);

/**
 * ステータス詳細を初期化します
 * 
 * @param {Object} statusObj ステータス詳細
 */
function initステータス詳細ObjVar(statusObj) {
    Object.keys(ステータス詳細ObjTemplate).forEach(propName => {
        statusObj[propName] = ステータス詳細ObjTemplate[propName];
    });

    if (!('ダメージ計算' in statusObj)) {
        statusObj['ダメージ計算'] = {};
    }
    if ($.isPlainObject(statusObj['ダメージ計算'])) {
        Object.keys(statusObj['ダメージ計算']).forEach(subPropName => {
            statusObj['ダメージ計算'][subPropName] = [];
        });
    }

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


//////////////////////
//////////////////////
var キャラクター構成ObjVar = null;
var URIキャラクター構成ObjVar = null;

// おすすめセットをセットアップします
/**
 * 聖遺物セット名の略称を作成します
 * 
 * @param {string} name 聖遺物セット名
 * @returns {string} 聖遺物セット名の略称
 */
function makeArtifactSetAbbrev(name) {
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

/**
 * おすすめセットのリストを組み立てます
 * 
 * @param {string} opt_saveName 保存構成名
 */
function setupおすすめセット(opt_saveName = null) {
    おすすめセットArrVar = [];
    // if (!opt_saveName) {
    //     loadキャラクター構成();
    // }

    const myキャラクター = $('#キャラクターInput').val();

    let isSavable = null;

    if (URIキャラクター構成ObjVar) {
        if (myキャラクター == URIキャラクター構成ObjVar['キャラクター']) {
            おすすめセットArrVar.push(['IMPORTED DATA', URIキャラクター構成ObjVar, false]);
            isSavable = true;
        }
    }

    let storageKeyArr = [];
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('構成_' + myキャラクター)) {
            storageKeyArr.push(key);
            if (isSavable == null) {
                isSavable = false;
            }
        }
    });
    storageKeyArr.sort();
    const re = new RegExp('^構成_' + myキャラクター + '_');
    storageKeyArr.forEach(key => {
        let setName;
        if (key == '構成_' + myキャラクター) {
            setName = 'あなたの' + myキャラクター;
        } else {
            setName = key.replace(re, '');
        }
        おすすめセットArrVar.push([setName, JSON.parse(localStorage[key]), true]);
    });

    if ('おすすめセット' in 選択中キャラクターデータVar) {
        選択中キャラクターデータVar['おすすめセット'].forEach(obj => {
            let myおすすめセット = obj;
            ['聖遺物優先するサブ効果1', '聖遺物優先するサブ効果2', '聖遺物優先するサブ効果3'].forEach(statName => {
                if (!(statName in obj)) {
                    obj[statName] = null;
                }
            });
            let artifactRarerityArrArr = [[5, 5, 5, 5, 5], [4, 4, 5, 5, 5], [4, 4, 4, 5, 4]];
            let artifactRarerity4Num = 0;
            if (聖遺物セット効果MasterVar[myおすすめセット['聖遺物セット効果1']]['レアリティ'] == 4) {
                artifactRarerity4Num++;
            }
            if (聖遺物セット効果MasterVar[myおすすめセット['聖遺物セット効果2']]['レアリティ'] == 4) {
                artifactRarerity4Num++;
            }
            for (let i = 0; i < 2; i++) {
                let name = '聖遺物メイン効果' + (i + 1);
                if (!(name in myおすすめセット)) {
                    if (i == 0) {
                        myおすすめセット[name] = artifactRarerityArrArr[artifactRarerity4Num][i] + '_HP';
                    } else if (i == 1) {
                        myおすすめセット[name] = artifactRarerityArrArr[artifactRarerity4Num][i] + '_攻撃力';
                    }
                }
            }

            let setName = myおすすめセット['武器'];
            setName += ' ';
            if (myおすすめセット['聖遺物セット効果1'] == myおすすめセット['聖遺物セット効果2']) {
                setName += myおすすめセット['聖遺物セット効果1'];
            } else {
                setName += makeArtifactSetAbbrev(myおすすめセット['聖遺物セット効果1']);
                setName += '/';
                setName += makeArtifactSetAbbrev(myおすすめセット['聖遺物セット効果2']);
            }
            setName += ' [';
            for (let i = 3; i <= 5; i++) {
                const statusName = myおすすめセット['聖遺物メイン効果' + i].split('_')[1];
                switch (statusName) {
                    case 'HP%':
                        setName += 'HP';
                        break;
                    case '元素熟知':
                        setName += '熟';
                        break;
                    case '元素チャージ効率':
                        setName += 'ﾁｬ';
                        break;
                    case '会心率':
                        setName += '率';
                        break;
                    case '会心ダメージ':
                        setName += 'ダ';
                        break;
                    case '与える治療効果':
                        setName += '治';
                        break;
                    default:
                        setName += statusName.substring(0, 1);
                        break;
                }
            }
            setName += ']';
            おすすめセットArrVar.push([setName, myおすすめセット, false]);
        });
    }
    let selector = '#おすすめセットInput';
    $(selector).empty();
    おすすめセットArrVar.forEach(entry => {
        appendOptionElement(entry[0], entry[1], selector);
    });

    if (opt_saveName || isSavable === false) {
        $('#構成保存Button').prop('disabled', true);
        $('#保存構成削除Button').prop('disabled', false);
        $('#構成名称Input').prop('disabled', true);
    } else {
        $('#構成保存Button').prop('disabled', false);
        $('#保存構成削除Button').prop('disabled', true);
        $('#構成名称Input').prop('disabled', false);
    }

    if (opt_saveName) {
        $('#構成名称Input').val(opt_saveName);
        $(selector).val(opt_saveName);
    }
}

function makeSaveData() {
    キャラクター構成ObjVar = {};
    キャラクター構成PROPERTY_MAP.forEach((value, key) => {
        キャラクター構成ObjVar[key] = value;
    });

    Object.keys(キャラクター構成ObjVar).forEach(key => {
        if (キャラクター構成ObjVar[key] == null) {
            キャラクター構成ObjVar[key] = $('#' + selectorEscape(key) + 'Input').val();
        } else {
            キャラクター構成ObjVar[key] = Number($('#' + selectorEscape(key) + 'Input').val());
        }
    });

    $('#オプションBox input[type="checkbox"]').each((index, elem) => {
        const key = elem.id.replace('Option', '');
        const value = $(elem).prop('checked');
        キャラクター構成ObjVar[key] = value;
    });

    $('#オプションBox select').each((index, elem) => {
        const key = elem.id.replace('Option', '');
        const value = $(elem).prop('selectedIndex');
        キャラクター構成ObjVar[key] = value;
    });

    return キャラクター構成ObjVar;
}

const saveキャラクター構成 = function () {
    const my武器 = $('#武器Input').val().toString();
    if (!(my武器 in 武器リストMasterVar[選択中キャラクターデータVar['武器']])) return;

    const myキャラクター = $('#キャラクターInput').val();
    let key = '構成_' + myキャラクター;
    let saveName = $('#構成名称Input').val();
    if (saveName && saveName.toString().trim()) {
        saveName = saveName.toString().trim()
        if (saveName != 'あなたの' + myキャラクター) {
            key += '_' + saveName;
        }
    } else {
        saveName = 'あなたの' + myキャラクター;
    }
    キャラクター構成ObjVar = makeSaveData();

    localStorage.setItem(key, JSON.stringify(キャラクター構成ObjVar));

    $('#構成保存Button').prop('disabled', true);
    $('#保存構成削除Button').prop('disabled', false);
    $('#構成名称Input').prop('disabled', true);

    makeTeamStatusObjEx(key).then(value => { });

    setupおすすめセット(saveName);
}

const clearキャラクター構成 = function () {
    let setName = $('#構成名称Input').val();
    if (!setName) return;

    let myキャラクター = $('#キャラクターInput').val();
    let key = '構成_' + myキャラクター;
    if (setName != 'あなたの' + myキャラクター) {
        key += '_' + setName;
    }
    if (localStorage[key]) {
        localStorage.removeItem(key);
    }

    チームInputObjMap.delete(key);
    チームConditionMapMap.delete(key);
    チームExclusionMapMap.delete(key);
    チームDamageDetailObjMap.delete(key);
    チームChangeDetailObjMap.delete(key);
    チームStatusObjMap.delete(key);

    setupおすすめセット();
}

const loadキャラクター構成 = function () {
    let key = '構成_' + $('#キャラクターInput').val();
    if (localStorage[key]) {
        キャラクター構成ObjVar = JSON.parse(localStorage[key]);

        // 互換性維持のための小細工
        // 聖遺物レアリティありの場合：聖遺物レアリティ→聖遺物メイン効果
        for (let i = 1; i <= 5; i++) {
            let name1 = '聖遺物レアリティ' + i;
            if (name1 in キャラクター構成ObjVar) {
                let name2 = '聖遺物メイン効果' + i;
                キャラクター構成ObjVar[name2] = キャラクター構成ObjVar[name1] + '_' + キャラクター構成ObjVar[name2];
                delete キャラクター構成ObjVar[name1];
            }
        }
        // 聖遺物メイン効果が旧形式の場合：聖遺物セット効果→聖遺物メイン効果
        let artifactRarerityArrArr = [[5, 5, 5, 5, 5], [4, 4, 5, 5, 5], [4, 4, 4, 5, 4]];
        let artifactRarerity4Num = 0;
        if (聖遺物セット効果MasterVar[キャラクター構成ObjVar['聖遺物セット効果1']]['レアリティ'] == 4) {
            artifactRarerity4Num++;
        }
        if (聖遺物セット効果MasterVar[キャラクター構成ObjVar['聖遺物セット効果2']]['レアリティ'] == 4) {
            artifactRarerity4Num++;
        }
        for (let i = 0; i < 5; i++) {
            let name = '聖遺物メイン効果' + (i + 1);
            if (name in キャラクター構成ObjVar) {
                let value = キャラクター構成ObjVar[name];
                if (value && value.indexOf('_') == -1) {
                    キャラクター構成ObjVar[name] = artifactRarerityArrArr[artifactRarerity4Num][i] + '_' + キャラクター構成ObjVar[name];
                }
            } else if (i == 0) {
                キャラクター構成ObjVar[name] = artifactRarerityArrArr[artifactRarerity4Num][i] + '_HP';
            } else if (i == 1) {
                キャラクター構成ObjVar[name] = artifactRarerityArrArr[artifactRarerity4Num][i] + '_攻撃力';
            }
        }
        // 聖遺物サブ効果 倍率→上昇値+上昇回数
        for (let i = 0; i < 3; i++) {
            let name1 = '聖遺物優先するサブ効果' + (i + 1);
            let name2 = name1 + '倍率';         // old
            let name3 = name1 + '上昇値';       // new
            let name4 = name1 + '上昇回数';     // new
            if (name2 in キャラクター構成ObjVar) {
                let value2 = キャラクター構成ObjVar[name2];
                delete キャラクター構成ObjVar[name2];
                let value1 = キャラクター構成ObjVar[name1];
                if (!value1) {
                    continue;
                }
                let value3 = 聖遺物サブ効果MasterVar[value1][i];
                let value4 = Math.round(value2 * 5);
                キャラクター構成ObjVar[name3] = value3;
                キャラクター構成ObjVar[name4] = value4;
            }
        }

        Object.keys(キャラクター構成ObjVar).forEach(objKey => {
            const element = document.getElementById(objKey + 'Input');
            if (element instanceof HTMLInputElement && element.type == 'number') {
                $(element).val(Number(キャラクター構成ObjVar[objKey]));
            } else {
                $(element).val(String(キャラクター構成ObjVar[objKey]));
            }
        });

        $('#構成保存Button').prop('disabled', true);
        $('#保存構成削除Button').prop('disabled', false);
        $('#構成名称Input').val('あなたの' + $('#キャラクターInput').val());
        $('#構成名称Input').prop('disabled', true);
    } else {
        キャラクター構成ObjVar = null;
        $('#構成保存Button').prop('disabled', false);
        $('#保存構成削除Button').prop('disabled', true);
        $('#構成名称Input').val(null);
        $('#構成名称Input').prop('disabled', false);
    }
}

/**
 * 
 * @param {HTMLElement} elem HTML要素
 */
function changeキャラクター構成(elem) {
    if (!$('#構成保存Button').prop('disabled')) return;
    if (キャラクター構成ObjVar) {
        $('#構成保存Button').prop('disabled', false);
        $('#構成名称Input').prop('disabled', false);
        return;
    }
    let key = elem.id.replace('Input', '');
    let value = null;
    if (elem instanceof HTMLSelectElement) {
        value = elem.value;
    } else if (elem instanceof HTMLInputElement) {
        switch (elem.type) {
            case 'number':
                value = elem.value;
                break;
            case 'checkbox':
                value = elem.checked;
                break;
        }
    }
    if (value != null && key in キャラクター構成ObjVar && value != キャラクター構成ObjVar[key]) {
        $('#構成保存Button').prop('disabled', false);
        $('#構成名称Input').prop('disabled', false);
    }
}

const enable構成保存Button = function () {
    $('#構成保存Button').prop('disabled', false);
    $('#構成名称Input').prop('disabled', false);
};

function initキャラクター構成関連要素() {
    $('#構成保存Button').prop('disabled', true);
    $('#保存構成削除Button').prop('disabled', true);
    $('#構成名称Input').prop('disabled', true);

    $(document).on('click', '#構成保存Button', saveキャラクター構成);
    $(document).on('click', '#保存構成削除Button', clearキャラクター構成);
}

const ARTIFACT_SUB_NAME_VALUE_ARR_MAP = new Map();

/**
 * 聖遺物サブ効果の目標値にもっとも近い数値を求めます
 * 
 * @param {number} targetValue 目標値
 * @param {number []} arr 
 * @param {number} opt_start 
 * @param {number} opt_end 
 * @returns {number} 目標値にもっとも近い数値
 */
function searchApproximationFromArr(targetValue, arr, opt_start = null, opt_end = null) {
    if (opt_start == null) opt_start = 0;
    if (opt_end == null) opt_end = arr.length;
    let index = Number(((opt_end - opt_start) / 2).toFixed(0));
    if (targetValue <= arr[index] && (index + 1 >= opt_end || targetValue < arr[index - 1])) {
        return arr[index];
    }
    let newStart = opt_start;
    let newEnd = opt_end;
    if (targetValue < arr[index]) {
        newEnd = index;
    } else {
        newStart = index + 1;
    }
    return searchApproximationFromArr(targetValue, arr, newStart, newEnd);
}

/**
 * 聖遺物サブ効果の目標値にもっとも近い数値を求めます
 * 
 * @param {string} statusName サブ効果名
 * @param {number} times 上昇回数
 * @param {number} targetValue 目標値
 * @returns 目標値にもっとも近い数値
 */
function searchArtifactSubApproximation(statusName, times, targetValue) {
    if (ARTIFACT_SUB_NAME_VALUE_ARR_MAP.has(statusName) &&
        ARTIFACT_SUB_NAME_VALUE_ARR_MAP.get(statusName).has(times)) {
        const arr = ARTIFACT_SUB_NAME_VALUE_ARR_MAP.get(statusName).get(times);
        for (let i = 0; i < arr.length; i++) {
            if (targetValue <= arr[i]) {
                return arr[i];
            }
        }
    }
    return targetValue;
}

const basename = path => path.split('/').pop().split('.').shift();

const ARTIFACT_STAT_JA_EN_MAP = new Map([
    ['HP', 'HP'],
    ['攻撃力', 'ATK'],
    ['防御力', 'DEF'],
    ['元素熟知', 'Elemental Mastery'],
    ['会心率', 'CRIT Rate'],
    ['会心ダメージ', 'CRIT DMG'],
    ['元素チャージ効率', 'Energy Recharge'],
    ['炎元素ダメージバフ', 'Pyro Elemental DMG Bonus'],
    ['水元素ダメージバフ', 'Hydro Elemental DMG Bonus'],
    ['風元素ダメージバフ', 'anemo Elemental DMG Bonus'],
    ['雷元素ダメージバフ', 'Electro Elemental DMG Bonus'],
    ['草元素ダメージバフ', 'Dendro Elemental DMG Bonus'],
    ['氷元素ダメージバフ', 'Cryo Elemental DMG Bonus'],
    ['岩元素ダメージバフ', 'Geo Elemental DMG Bonus'],
    ['物理ダメージバフ', 'Physical Elemental DMG Bonus'],
    ['与える治療効果', 'Healing Bonus'],
    ['HP%', 'HP%'],
    ['攻撃力%', 'ATK%'],
    ['防御力%', 'DEF%']
]);

const ARTIFACT_STAT_JA_EN_ABBREV_MAP = new Map([
    ['HP', 'HP'],
    ['攻撃力', 'ATK'],
    ['防御力', 'DEF'],
    ['元素熟知', 'ElementalMastery'],
    ['会心率', 'CritRate'],
    ['会心ダメージ', 'CritDMG'],
    ['元素チャージ効率', 'EnergyRecharge'],
    ['炎元素ダメージバフ', 'Pyro'],
    ['水元素ダメージバフ', 'Hydro'],
    ['風元素ダメージバフ', 'anemo'],
    ['雷元素ダメージバフ', 'Electro'],
    ['草元素ダメージバフ', 'Dendro'],
    ['氷元素ダメージバフ', 'Cryo'],
    ['岩元素ダメージバフ', 'Geo'],
    ['物理ダメージバフ', 'Physical'],
    ['与える治療効果', 'Healing'],
    ['HP%', 'HPp'],
    ['攻撃力%', 'ATKp'],
    ['防御力%', 'DEFp']
]);

const ARTIFACT_STAT_JA_EN_ABBREV_REVERSE_MAP = new Map();
ARTIFACT_STAT_JA_EN_ABBREV_MAP.forEach((value, key) => {
    ARTIFACT_STAT_JA_EN_ABBREV_REVERSE_MAP.set(value, key);
});


function makeShareData(saveData) {
    const キャラクター = saveData['キャラクター'];

    let shareDataArr = [];
    キャラクター構成PROPERTY_MAP.forEach((value, key) => {
        let newValue = saveData[key];
        let myBasename;
        switch (key) {
            case 'キャラクター':
                myBasename = basename(キャラクターリストMasterVar[newValue]['import']);
                newValue = myBasename.split('_')[myBasename.split('_').length - 1];
                break;
            case '武器':
                myBasename = basename(武器リストMasterVar[キャラクターリストMasterVar[キャラクター]['武器']][newValue]['import']);
                newValue = myBasename.split('_')[myBasename.split('_').length - 1];
                break;
            case '聖遺物セット効果1':
            case '聖遺物セット効果2':
                if (newValue == 'NONE') {
                    newValue = '';  // 聖遺物セット効果なし
                } else {
                    myBasename = basename(聖遺物セット効果MasterVar[newValue]['image']);
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
            case '聖遺物優先するサブ効果1':
            case '聖遺物優先するサブ効果2':
            case '聖遺物優先するサブ効果3':
                if (newValue) {
                    newValue = ARTIFACT_STAT_JA_EN_ABBREV_MAP.get(newValue);
                }
                break;
        }
        shareDataArr.push(newValue);
    });
    Object.keys(saveData).forEach(key => {
        if (!キャラクター構成PROPERTY_MAP.has(key)) {
            shareDataArr.push(key + '=' + saveData[key]);
        }
    });

    return shareDataArr.join(',');
}

function makeSaveDataFromShareData(shareData) {
    const saveData = {};

    try {
        const shareDataArr = shareData.split(',');

        let myキャラクター;

        let i = 0;
        キャラクター構成PROPERTY_MAP.forEach((value, key) => {
            let newValue = shareDataArr[i];
            switch (key) {
                case 'キャラクター':
                    Object.keys(キャラクターリストMasterVar).forEach(key2 => {
                        if ('import' in キャラクターリストMasterVar[key2]) {
                            const myBasename = basename(キャラクターリストMasterVar[key2]['import']);
                            const myAbbrev = myBasename.split('_')[myBasename.split('_').length - 1];
                            if (newValue == myAbbrev) {
                                myキャラクター = key2;
                                newValue = myキャラクター;
                            }
                        }
                    });
                    break;
                case '武器':
                    if (myキャラクター) {
                        const my武器タイプ = キャラクターリストMasterVar[myキャラクター]['武器'];
                        Object.keys(武器リストMasterVar[my武器タイプ]).forEach(key2 => {
                            if ('import' in 武器リストMasterVar[my武器タイプ][key2]) {
                                const myBasename = basename(武器リストMasterVar[my武器タイプ][key2]['import']);
                                const myAbbrev = myBasename.split('_')[myBasename.split('_').length - 1];
                                if (newValue == myAbbrev) {
                                    newValue = key2;
                                }
                            }
                        });
                    }
                    break;
                case '聖遺物セット効果1':
                case '聖遺物セット効果2':
                    if (newValue) {
                        Object.keys(聖遺物セット効果MasterVar).forEach(key2 => {
                            if ('image' in 聖遺物セット効果MasterVar[key2]) {
                                const myBasename = basename(聖遺物セット効果MasterVar[key2]['image']);
                                const myAbbrev = myBasename.split('_')[myBasename.split('_').length - 1];
                                if (newValue == myAbbrev) {
                                    newValue = key2;
                                }
                            }
                        });
                    } else {
                        newValue = 'NONE';  // 聖遺物セット効果なし
                    }
                    break;
                case '聖遺物メイン効果1':
                case '聖遺物メイン効果2':
                case '聖遺物メイン効果3':
                case '聖遺物メイン効果4':
                case '聖遺物メイン効果5':
                    if (newValue) {
                        newValue = newValue.split('_')[0] + '_' + ARTIFACT_STAT_JA_EN_ABBREV_REVERSE_MAP.get(newValue.split('_')[1]);
                    }
                    break;
                case '聖遺物優先するサブ効果1':
                case '聖遺物優先するサブ効果2':
                case '聖遺物優先するサブ効果3':
                    if (newValue) {
                        newValue = ARTIFACT_STAT_JA_EN_ABBREV_REVERSE_MAP.get(newValue);
                    }
                    break;
            }
            if (value == null) {
                if (newValue) {
                    saveData[key] = newValue;
                } else {
                    saveData[key] = '';
                }
            } else {
                if (newValue) {
                    saveData[key] = Number(newValue);
                } else {
                    saveData[key] = 0;
                }
            }
            i++;
        });

        for (; i < shareDataArr.length; i++) {
            const keyAndValue = shareDataArr[i];
            let key;
            let value;
            if (keyAndValue.indexOf('=') != 1) {
                const splitted = keyAndValue.split('=');
                key = splitted[0];
                value = splitted[1];

                saveData[key] = value;
            }
        }
    } catch (e) {
        console.error(e);
        return null;
    }

    return saveData;
}


// --------
// キャラクター所持状況リスト
// --------
var キャラクター所持状況ObjVar = {};

function buildキャラクター所持状況List() {
    let ulElem = document.getElementById('キャラクター所持状況List');
    ulElem.innerHTML = '';
    Object.keys(キャラクターリストMasterVar).forEach(name => {
        let myMasterObj = キャラクターリストMasterVar[name];
        if ('disabled' in myMasterObj && myMasterObj['disabled']) {
            return;
        }

        let splittedUrl = myMasterObj['import'].split('/');
        let fileName = splittedUrl[splittedUrl.length - 1].replace('.json', '.png');
        let srcUrl = 'images/characters/face/' + fileName;

        let liElem = document.createElement('li');
        liElem.id = name + '_所持状況Input';
        ulElem.appendChild(liElem);

        let imgElem = document.createElement('img');
        imgElem.className = 'star' + myMasterObj['レアリティ'];
        imgElem.src = srcUrl;
        imgElem.alt = name;
        imgElem.width = 80;
        imgElem.height = 80;
        liElem.appendChild(imgElem);

        let img2Elem = document.createElement('img');
        img2Elem.className = 'element';
        img2Elem.src = ELEMENT_IMG_SRC_MAP.get(myMasterObj['元素']);
        img2Elem.alt = myMasterObj['元素'];
        img2Elem.width = 24;
        img2Elem.height = 24;
        liElem.appendChild(img2Elem);

        let pElem = document.createElement('p');
        if (name in キャラクター所持状況ObjVar) {
            pElem.textContent = キャラクター所持状況ObjVar[name];
        }
        liElem.appendChild(pElem);

        if (!pElem.textContent) {
            imgElem.classList.add('darken');
            img2Elem.classList.add('darken');
        }

        let divElem = document.createElement('div');
        divElem.className = 'tooltip';
        divElem.innerHTML = name;
        liElem.appendChild(divElem);
    });

    $(document).on('click', '#キャラクター所持状況List li', キャラクター所持状況OnClick);
}

const キャラクター所持状況OnClick = function () {
    const selector = '#' + selectorEscape(this.id);
    let text = $(selector + ' p').text();
    if (text) {
        let val = Number(text);
        if (++val > 6) {
            text = null;
            $(selector + ' img').addClass('darken');
        } else {
            text = val.toString();
        }
    } else {
        text = '0';
        $(selector + ' img').removeClass('darken');
    }
    $(selector + ' p').text(text);

    キャラクター所持状況ObjVar[this.id.split('_')[0]] = text;

    $('#キャラクター所持状況保存Button').prop('disabled', false);
}

const loadキャラクター所持状況 = function () {
    if (localStorage['キャラクター所持状況']) {
        try {
            キャラクター所持状況ObjVar = JSON.parse(localStorage['キャラクター所持状況']);
        } catch (error) {
            キャラクター所持状況ObjVar = {};
        }
    } else {
        キャラクター所持状況ObjVar = {};
    }
    $('#キャラクター所持状況Button').prop('disabled', true);
}

const saveキャラクター所持状況 = function () {
    localStorage['キャラクター所持状況'] = JSON.stringify(キャラクター所持状況ObjVar);
    $('#キャラクター所持状況保存Button').prop('disabled', true);
    $('#ローカルストレージクリアInput').prop('checked', false);
    toggleローカルストレージクリア();
}

// --------
// 武器所持状況リスト
// --------
var 武器所持状況ObjVar = {}

function build武器所持状況List() {
    Object.keys(武器リストMasterVar).forEach(weaponType => {
        const listElemId = weaponType + '所持状況List';
        $('#' + listElemId).empty();

        let ulElem = document.getElementById(listElemId);
        Object.keys(武器リストMasterVar[weaponType]).forEach(name => {
            let myMasterObj = 武器リストMasterVar[weaponType][name];
            if ('disabled' in myMasterObj && myMasterObj['disabled']) {
                return;
            }

            let srcUrl = myMasterObj['import'].replace('data/', 'images/').replace('.json', '.png');

            let liElem = document.createElement('li');
            liElem.id = name + '_所持状況Input';
            ulElem.appendChild(liElem);

            let imgElem = document.createElement('img');
            imgElem.classList.add('star' + myMasterObj['レアリティ']);
            imgElem.src = srcUrl;
            imgElem.alt = name;
            imgElem.width = 80;
            imgElem.height = 80;
            liElem.appendChild(imgElem);

            let pElem = document.createElement('p');
            if (name in 武器所持状況ObjVar) {
                pElem.textContent = 武器所持状況ObjVar[name];
            }
            liElem.appendChild(pElem);

            if (!pElem.textContent) {
                imgElem.classList.add('darken');
            }

            let divElem = document.createElement('div');
            divElem.className = 'tooltip';
            divElem.innerHTML = name;
            liElem.appendChild(divElem);
        });

        $(document).on('click', '#' + listElemId + ' li', 武器所持状況OnClick);
    });
}

const 武器所持状況OnClick = function () {
    const selector = '#' + selectorEscape(this.id);
    let text = $(selector + ' p').text();
    if (text) {
        let val = Number(text);
        if (++val > 5) {
            text = null;
            $('#' + selectorEscape(this.id) + ' img').addClass('darken');
        } else {
            text = val.toString();
        }
    } else {
        text = '1';
        $('#' + selectorEscape(this.id) + ' img').removeClass('darken');
    }
    $('#' + selectorEscape(this.id) + ' p').text(text);

    武器所持状況ObjVar[this.id.split('_')[0]] = text;

    $('#my-weapon-save-button').prop('disabled', false);
}

const load武器所持状況 = function () {
    if (localStorage['武器所持状況']) {
        try {
            武器所持状況ObjVar = JSON.parse(localStorage['武器所持状況']);
        } catch (error) {
            武器所持状況ObjVar = {};
        }
    } else {
        武器所持状況ObjVar = {};
    }
    $('#my-weapon-save-button').prop('disabled', true);
}

const save武器所持状況 = function () {
    localStorage['武器所持状況'] = JSON.stringify(武器所持状況ObjVar);
    $('#my-weapon-save-button').prop('disabled', true);
    $('#ローカルストレージクリアInput').prop('checked', false);
    toggleローカルストレージクリア();
}

// --------
// ローカルストレージ
// --------
const clearローカルストレージ = function () {
    localStorage.clear();
    $('#ローカルストレージクリアInput').prop('checked', false);
    toggleローカルストレージクリア();
}

const toggleローカルストレージクリア = function () {
    let checked = $('#ローカルストレージクリアInput').prop('checked');
    $('#ローカルストレージクリアButton').prop('disabled', !checked);
}
