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
        })
    ]).then(() => {
        characterInputOnChange();
        inputOnChangeArtifactSubUpdate();
        artifactSetInputOnChange();
        enemyInputOnChange();
    });
});
