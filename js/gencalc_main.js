// 中段のオプションとステータスの表示非表示を制御するイベント設定します
const elementOnClickHideTabContentToggle = function () {
    console.debug(this);
    let selector = '#tab-area-middle-hidable';
    $(selector).toggle();
    let isVisible = $(selector).is(":visible");
    selectorVisiblityStateMap.set(selector, $(selector).is(":visible"));
    console.debug(selectorVisiblityStateMap);
}
const elementOnClickToggleOther = function (selector, triggerSelector) {
    return function () {
        $(selector).toggle();
        if ($(selector).is(':visible')) {
            $(triggerSelector).removeClass('closed');
        } else {
            $(triggerSelector).addClass('closed');
        }
    }
}
$(document).on('click', '#option-set', elementOnClickToggleOther('#option-set+.hidable', '#option-set'));
$(document).on('click', '#status-set', elementOnClickToggleOther('#status-set+.tab-area', '#status-set'));

// 下段のダメージ計算の2行目以降の表示非表示を制御するイベントを設定します
$(document).on('click', '#通常攻撃ダメージResult', elementOnClickHidableChildrenToggle);
$(document).on('click', '#重撃ダメージResult', elementOnClickHidableChildrenToggle);
$(document).on('click', '#落下攻撃ダメージResult', elementOnClickHidableChildrenToggle);
$(document).on('click', '#通常攻撃ダメージ関連Result', elementOnClickHidableChildrenToggle);
$(document).on('click', '#元素スキルダメージResult', elementOnClickHidableChildrenToggle);
$(document).on('click', '#元素スキルダメージ関連Result', elementOnClickHidableChildrenToggle);
$(document).on('click', '#元素爆発ダメージResult', elementOnClickHidableChildrenToggle);
$(document).on('click', '#元素爆発ダメージ関連Result', elementOnClickHidableChildrenToggle);
$(document).on('click', '#その他ダメージResult', elementOnClickHidableChildrenToggle);

// MAIN
$(document).ready(function () {
    Promise.all([
        fetch("data/CharacterMaster.json").then(response => response.json()).then(jsonObj => {
            characterMaster = jsonObj;
            appendOptionElements(characterMaster, "#キャラクターInput");
        }),
        fetch("data/SwordMaster.json").then(response => response.json()).then(jsonObj => {
            weaponMaster["片手剣"] = jsonObj;
        }),
        fetch("data/ClaymoreMaster.json").then(response => response.json()).then(jsonObj => {
            weaponMaster["両手剣"] = jsonObj;
        }),
        fetch("data/PolearmMaster.json").then(response => response.json()).then(jsonObj => {
            weaponMaster["長柄武器"] = jsonObj;
        }),
        fetch("data/BowMaster.json").then(response => response.json()).then(jsonObj => {
            weaponMaster["弓"] = jsonObj;
        }),
        fetch("data/CatalystMaster.json").then(response => response.json()).then(jsonObj => {
            weaponMaster["法器"] = jsonObj;
        }),
        fetch("data/ArtifactMainMaster.json").then(response => response.json()).then(jsonObj => {
            artifactMainMaster = jsonObj;
        }),
        fetch("data/ArtifactSubMaster.json").then(response => response.json()).then(jsonObj => {
            artifactSubMaster = jsonObj;
        }),
        fetch("data/ArtifactSetMaster.json").then(response => response.json()).then(jsonObj => {
            artifactSetMaster = jsonObj;
            appendOptionElements(artifactSetMaster, ["#聖遺物セット効果1Input", "#聖遺物セット効果2Input"]);
        }),
        fetch("data/ElementalResonanceMaster.json").then(response => response.json()).then(jsonObj => {
            elementalResonanceMaster = jsonObj;
        }),
        fetch("data/EnemyMaster.json").then(response => response.json()).then(jsonObj => {
            enemyMaster = jsonObj;
            appendOptionElements(enemyMaster, "#敵Input");
        }),
        fetch("data/BuffDebuffMaster.json").then(response => response.json()).then(jsonObj => {
            バフデバフMaster = jsonObj;
        })
    ]).then(() => {
        characterInputOnChange();
        inputOnChangeArtifactSubUpdate();
        artifactSetInputOnChange();
        enemyInputOnChange();
    });
});

const KEY_ELEMENT_ID_MAP = new Map([
    ['character', 'キャラクターInput'],
    ['level', 'レベルInput'],
    ['constellation', '命ノ星座Input'],
    ['talent1Level', '通常攻撃レベルInput'],
    ['talent2Level', '元素スキルレベルInput'],
    ['talent3Level', '元素爆発レベルInput'],
    ['weapon', '武器Input'],
    ['weaponLevel', '武器レベルInput'],
    ['weaponRank', '精錬ランクInput'],
    ['artifactMain1', '聖遺物メイン効果1Input'],
    ['artifactMain2', '聖遺物メイン効果2Input'],
    ['artifactMain3', '聖遺物メイン効果3Input'],
    ['artifactMain4', '聖遺物メイン効果4Input'],
    ['artifactMain5', '聖遺物メイン効果5Input'],
    ['artifactSub1', '聖遺物サブ効果1Input'],
    ['artifactSub2', '聖遺物サブ効果2Input'],
    ['artifactSub3', '聖遺物サブ効果3Input'],
    ['artifactSub1M', '聖遺物サブ効果1倍率Input'],
    ['artifactSub2M', '聖遺物サブ効果2倍率Input'],
    ['artifactSub3M', '聖遺物サブ効果3倍率Input'],
    ['artifactSet1', '聖遺物セット効果1Input'],
    ['artifactSet1', '聖遺物セット効果2Input']
]);
