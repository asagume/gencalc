//// @ts-check

///<reference path="./gencalc3_var.js"/>
///<reference path="./gencalc3_core.js"/>
///<reference path="./gencalc3_func.js"/>
///<reference path="./gencalc3_sub.js"/>

async function onLoad(searchParams) {
    let buildDataFromUri = null;
    if (searchParams.has('allin')) {
        const allin = searchParams.get('allin');
        buildDataFromUri = makeSaveDataFromShareData(allin);
    }
    if (localStorage['キャラクター所持状況']) {
        キャラクター所持状況Var = JSON.parse(localStorage['キャラクター所持状況']);
    }
    if (localStorage['武器所持状況']) {
        武器所持状況Var = JSON.parse(localStorage['武器所持状況']);
    }

    const responses = await Promise.all([
        'data/CharacterMaster.json',
        'data/SwordMaster.json',
        'data/ClaymoreMaster.json',
        'data/PolearmMaster.json',
        'data/BowMaster.json',
        'data/CatalystMaster.json',
        'data/ArtifactSetMaster.json',
        'data/ArtifactMainMaster.json',
        'data/ArtifactSubMaster.json',
        'data/EnemyMaster.json',
        'data/ElementalReactionMaster.json',
        'data/ElementalResonanceMaster.json',
        'data/TeamOptionMaster.json',
        'data/OptionMaster1.json',
        'data/OptionMaster2.json',
        'data/HoYoDictionary2.json',
        'data/HoYoDictionary4.json',
        'data/HoYoDictionary5.json',
        'data/LocalDictionary.json',
    ].map(s => fetch(s).then(resp => resp.json())));

    キャラクターMasterVar = responses[0];
    武器MasterVar = {
        片手剣: responses[1],
        両手剣: responses[2],
        長柄武器: responses[3],
        弓: responses[4],
        法器: responses[5]
    };
    聖遺物セット効果MasterVar = responses[6];
    聖遺物メイン効果MasterVar = responses[7];
    聖遺物サブ効果MasterVar = responses[8];
    敵MasterVar = responses[9];
    元素反応MasterVar = responses[10];
    元素共鳴MasterVar = responses[11];
    チームオプションMasterVar = responses[12];
    オプション1MasterVar = responses[13];
    オプション2MasterVar = responses[14];
    辞書MasterVar = responses[15];
    [responses[16], responses[17], responses[18]].forEach(response => {
        Object.keys(response).forEach(key => {
            if (!(key in 辞書MasterVar)) {
                辞書MasterVar[key] = response[key];
            }
        })
    });

    const characterInput = JSON.parse(JSON.stringify(CHARACTER_INPUT_TEMPLATE));
    if (buildDataFromUri) {
        characterInput.character = buildDataFromUri['キャラクター'];
    } else {
        characterInput.character = getCharacterByBirthday();
    }
    characterInput.characterMaster = await getCharacterMaster(characterInput.character);
    const recommendationList = makeRecommendationList(characterInput.characterMaster, buildDataFromUri);
    const recommendation = recommendationList[0];
    const artifactDetailInput = JSON.parse(JSON.stringify(ARTIFACT_DETAIL_INPUT_TEMPLATE));
    const conditionInput = JSON.parse(JSON.stringify(CONDITION_INPUT_TEMPLATE));
    await loadRecommendation(characterInput, artifactDetailInput, conditionInput, recommendation[1]);

    initialSetupLanguageSelect();
    initialSetupCharacterSelect(characterInput);
    initialSetupWeaponSelect(characterInput);
    initialSetupConditionInput(characterInput, conditionInput);
    initialSetupArtifactDetailInput(characterInput, artifactDetailInput);
    initialSetupArtifactSetSelect(characterInput);
    initialSetupCharacterInput(characterInput, recommendation, recommendationList);
    initialSetupStatusInput();
    initialSetupCalcurationResult();
    initialSetupOptionInput();
    initialSetupCharacterInformation();
    initialSetupCharacterOwnList();
    initialSetupWeaponOwnList();
    initialSetupStorageControl();

    Pane4Group.add(WeaponSelectVm);
    Pane4Group.add(ArtifactSetSelectVm);
    Pane4Group.add(ArtifactDetailInputVm);

    const Pane6Toggle = {
        data() {
            return {
                targets: [null, ConditionInputVm, StatusInputVm, OptionInputVm]
            }
        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
            },
            checked: function (index) {
                return this.targets[index].isVisible;
            },
            onClick: function (event) {
                const index = Number(event.target.value);
                console.log(index);
                this.targets[index].isVisible = !this.targets[index].isVisible;
            }
        }
    };
    Pane6ToggleVm = Vue.createApp(Pane6Toggle).mount('#pane6-toggle');
}

function initialSetupLanguageSelect() {
    const LanguageSelect = {
        data() {
            return {
                selected: 'ja-jp',
                list: [
                    { name: '日本語', value: 'ja-jp' },
                    { name: 'English', value: 'en-us' },
                    { name: '简体中文', value: 'zh-cn' },
                    { name: '繁體中文', value: 'zh-tw' },
                    { name: '한국어', value: 'ko-kr' },
                    { name: 'Deutsch', value: 'de-de' },
                    { name: 'Español', value: 'es-es' },
                    { name: 'Français', value: 'fr-fr' },
                    { name: 'Indonesia', value: 'id-id' },
                    { name: 'Português', value: 'pt-pt' },
                    { name: 'Pусский', value: 'ru-ru' },
                    { name: 'ภาษาไทย', value: 'th-th' },
                    { name: 'Tiếng Việt', value: 'vi-vn' }
                ]
            }
        },
        mounted() {
            if ('language' in localStorage) {
                this.selected = localStorage.getItem('language');
            }
        },
        methods: {
            onChange: function () {
                localStorage.setItem('language', this.selected);
            }
        }
    };
    LanguageSelectVm = Vue.createApp(LanguageSelect).mount('#language-select');
}

function initialSetupCharacterSelect(characterInput) {
    const CharacterSelect = {
        data() {
            return {
                isVisible: false,
                selected: characterInput.character,
                list: null,
                filters: {
                    vision: {
                        selected: null,
                        list: null
                    },
                    weapon: {
                        selected: null,
                        list: null
                    }
                }
            }
        },
        created() {
            this.list = Object.keys(キャラクターMasterVar).map(function (key) {
                return {
                    name: key,
                    master: キャラクターMasterVar[key]
                }
            });
            this.filters.vision.list = Object.keys(ELEMENT_IMG_SRC).map(function (key) {
                return { name: key, url: ELEMENT_IMG_SRC[key] }
            });
            this.filters.weapon.list = Object.keys(WEAPON_IMG_SRC).map(function (key) {
                return { name: key, url: WEAPON_IMG_SRC[key] }
            });
        },
        computed: {
            filteredList: function () {
                return this.list.filter(s =>
                    (this.filters.vision.selected ? this.filters.vision.selected == s.master['元素'] : true)
                    && (this.filters.weapon.selected ? this.filters.weapon.selected == s.master['武器'] : true));
            }
        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
            },
            iconUrl: function (item) {
                const importUrl = item.master.import;
                return 'images/characters/face/' + importUrl.split('/')[importUrl.split('/').length - 1].replace('json', 'png');
            },
            starBackgroundUrl: function (item) {
                return getStarBackgroundUrl(item.master);
            },
            elementImgSrc: function (item) {
                return getElementImgSrc(item.master);
            },
            classSelected: function (item) {
                if (item.name == this.selected) {
                    return 'selected';
                }
                return '';
            },
            onClick: function (event) {
                if (event.target.alt != this.selected) {
                    this.selected = event.target.alt;
                    setupCharacterInput(this.selected, CharacterInputVm, ArtifactDetailInputVm, ConditionInputVm, OptionInputVm, StatusInputVm);
                }
                this.isVisible = false;
            },
            filterOnClick: function (filterObj, event) {
                if (event.target.value != filterObj.selected) {
                    filterObj.selected = event.target.value
                } else {
                    filterObj.selected = null;
                    event.target.checked = false;
                }
            }
        }
    }
    CharacterSelectVm = Vue.createApp(CharacterSelect).mount('#character-select');
}

async function initialSetupCharacterInput(characterInput, recommendation, recommendationList) {
    const CharacterInput = {
        data() {
            return {
                character: characterInput.character,
                characterMaster: characterInput.characterMaster,
                突破レベル: characterInput.突破レベル,
                レベル: characterInput.レベル,
                命ノ星座: characterInput.命ノ星座,
                命ノ星座Option: {
                    max: 6
                },
                通常攻撃レベル: 8,
                通常攻撃レベルOption: {
                    max: 11
                },
                元素スキルレベル: 8,
                元素スキルレベルOption: {
                    max: 13
                },
                元素爆発レベル: 8,
                元素爆発レベルOption: {
                    max: 13
                },
                weapon: characterInput.weapon,
                weaponMaster: characterInput.weaponMaster,
                武器突破レベル: characterInput.武器突破レベル,
                武器突破レベルOption: {
                    max: 6
                },
                武器レベル: characterInput.武器レベル,
                武器精錬ランク: characterInput.武器精錬ランク,
                武器精錬ランクOption: {
                    max: 5
                },
                聖遺物セット効果: [
                    {
                        名前: 'NONE',
                        master: ARTIFACT_SET_MASTER_DUMMY
                    },
                    {
                        名前: 'NONE',
                        master: ARTIFACT_SET_MASTER_DUMMY
                    }
                ],
                IMG_SRC_DUMMY: IMG_SRC_DUMMY,
                おすすめセット: recommendation,
                おすすめセットOption: {
                    isOpen: false,
                    list: recommendationList
                },
                buildName: '',
                isChanged: false
            }
        },
        computed: {
            colorClass: function () {
                return getColorClass(this.characterMaster);
            },
            bgColorClass: function () {
                return getBgColorClass(this.characterMaster);
            },
            starBackgroundUrl: function () {
                return getStarBackgroundUrl(this.characterMaster);
            },
            weaponStarBackgroundUrl: function () {
                return getStarBackgroundUrl(this.weaponMaster);
            },
            elementImgSrc: function () {
                return getElementImgSrc(this.characterMaster);
            },
            ascensionRange: function () {
                const max = 突破レベルレベルARRAY.length + 1;
                return Array.from({ length: max }, (_, i) => i);
            },
            levelRange: function () {
                return 突破レベルレベルARRAY[this.突破レベル];
            },
            constellationRange: function () {
                const max = this.命ノ星座Option.max + 1;
                return Array.from({ length: max }, (_, i) => i);
            },
            normalAttackLevelRange: function () {
                const max = this.通常攻撃レベルOption.max;
                return Array.from({ length: max }, (_, i) => i + 1);
            },
            elementalSkillLevelRange: function () {
                const max = this.元素スキルレベルOption.max;
                return Array.from({ length: max }, (_, i) => i + 1);
            },
            elementalBurstLevelRange: function () {
                const max = this.元素爆発レベルOption.max;
                return Array.from({ length: max }, (_, i) => i + 1);
            },
            weaponAscensionRange: function () {
                const max = this.武器突破レベルOption.max + 1;
                return Array.from({ length: max }, (_, i) => i);
            },
            weaponLevelRange: function () {
                return 突破レベルレベルARRAY[this.武器突破レベル];
            },
            weaponRefineRange: function () {
                const max = this.武器精錬ランクOption.max;
                return Array.from({ length: max }, (_, i) => i + 1);
            },
            changed: function () {
                this.isChanged = true;
            },
            artifactScore: function () {
                return 0;
            },
            saveDisabled: function () {
                if (!this.buildName) return true;
                return !this.isChanged;
            },
            removeDisabled: function () {
                if (!this.buildName) return true;
                let tempKey = '構成_' + this.character;
                if (this.buildName != ('あなたの' + this.character)) {
                    tempKey += '_' + this.buildName;
                }
                if (tempKey in localStorage) {
                    return false;
                }
                return true;
            }
        },
        watch: {
            name: {
                handler: function (newVal, oldVal) {
                    updateStatusStatus(calculateStatus(this, ArtifactDetailInputVm, ConditionInputVm, OptionInputVm, StatusInputVm));
                },
                deep: true
            },
            突破レベル: {
                handler: function (newVal, oldVal) {
                    makeDamageDetailObjCharacter(this);
                    updateStatusStatus(calculateStatus(this, ArtifactDetailInputVm, ConditionInputVm, OptionInputVm, StatusInputVm));
                }
            },
            レベル: {
                handler: function (newVal, oldVal) {
                    updateStatusStatus(calculateStatus(this, ArtifactDetailInputVm, ConditionInputVm, OptionInputVm, StatusInputVm));
                }
            },
            命ノ星座: {
                handler: function (newVal, oldVal) {
                    const constellation = newVal;
                    const characterMaster = this.characterMaster;
                    let maxSkillLevel = 10;
                    let maxBurstLevel = 10;
                    let mySkillName = characterMaster.元素スキル.名前;
                    let myBurstName = characterMaster.元素爆発.名前;
                    Object.keys(characterMaster.命ノ星座).forEach(key => {
                        if (constellation < Number(key)) return;
                        if ('名前' in characterMaster.命ノ星座[key]) {
                            if (characterMaster.命ノ星座[key]['名前'].indexOf(mySkillName) != -1) {
                                maxSkillLevel = 13;
                            }
                            if (characterMaster.命ノ星座[key]['名前'].indexOf(myBurstName) != -1) {
                                maxBurstLevel = 13;
                            }
                        }
                    });
                    this.元素スキルレベルOption.max = maxSkillLevel;
                    this.元素爆発レベルOption.max = maxBurstLevel;
                    makeDamageDetailObjCharacter(this);
                    updateStatusStatus(calculateStatus(this, ArtifactDetailInputVm, ConditionInputVm, OptionInputVm, StatusInputVm));
                }
            },
            通常攻撃レベル: {
                handler: function (newVal, oldVal) {
                    makeDamageDetailObjCharacter(this);
                    updateStatusStatus(calculateStatus(this, ArtifactDetailInputVm, ConditionInputVm, OptionInputVm, StatusInputVm));
                }
            },
            元素スキルレベル: {
                handler: function (newVal, oldVal) {
                    makeDamageDetailObjCharacter(this);
                    updateStatusStatus(calculateStatus(this, ArtifactDetailInputVm, ConditionInputVm, OptionInputVm, StatusInputVm));
                }
            },
            元素爆発レベル: {
                handler: function (newVal, oldVal) {
                    makeDamageDetailObjCharacter(this);
                    updateStatusStatus(calculateStatus(this, ArtifactDetailInputVm, ConditionInputVm, OptionInputVm, StatusInputVm));
                }
            },
            weapon: {
                handler: function (newVal, oldVal) {
                    makeDamageDetailObjWeapon(this);
                    updateStatusStatus(calculateStatus(this, ArtifactDetailInputVm, ConditionInputVm, OptionInputVm, StatusInputVm));
                }
            },
            武器突破レベル: {
                handler: function (newVal, oldVal) {
                    updateStatusStatus(calculateStatus(this, ArtifactDetailInputVm, ConditionInputVm, OptionInputVm, StatusInputVm));
                }
            },
            武器レベル: {
                handler: function (newVal, oldVal) {
                    updateStatusStatus(calculateStatus(this, ArtifactDetailInputVm, ConditionInputVm, OptionInputVm, StatusInputVm));
                }
            },
            武器精錬ランク: {
                handler: function (newVal, oldVal) {
                    makeDamageDetailObjWeapon(this);
                    updateStatusStatus(calculateStatus(this, ArtifactDetailInputVm, ConditionInputVm, OptionInputVm, StatusInputVm));
                }
            },
            聖遺物セット効果: {
                handler: function (newVal, oldVal) {
                    makeDamageDetailObjArtifactSet(this);
                    updateStatusStatus(calculateStatus(this, ArtifactDetailInputVm, ConditionInputVm, OptionInputVm, StatusInputVm));
                },
                deep: true
            }
        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
            },
            displayBuildName: function (name) {
                return getDisplayBuildName(name);
            },
            characterOnClick: function () {
                CharacterSelectVm.isVisible = !CharacterSelectVm.isVisible;
            },
            ascensionOnChange: function () {
                const min = this.levelRange[0];
                const max = this.levelRange[this.levelRange.length - 1];
                if (this.レベル < min) {
                    this.レベル = min;
                } else if (this.レベル > max) {
                    this.レベル = max;
                }
            },
            weaponAscensionOnChange: function () {
                const min = this.weaponLevelRange[0];
                const max = this.weaponLevelRange[this.weaponLevelRange.length - 1];
                if (this.武器レベル < min) {
                    this.武器レベル = min;
                } else if (this.武器レベル > max) {
                    this.武器レベル = max;
                }
            },
            weaponOnClick: function () {
                switchActiveEntry(Pane4Group, WeaponSelectVm);
            },
            artifactSetOnClick: function (index) {
                if (ArtifactSetSelectVm.isVisible) {
                    if (ArtifactSetSelectVm.index == index) {
                        ArtifactSetSelectVm.isVisible = false;
                    } else {
                        ArtifactSetSelectVm.index = index;
                    }
                } else {
                    ArtifactSetSelectVm.isVisible = true;
                    ArtifactSetSelectVm.index = index;
                }
                if (ArtifactSetSelectVm.isVisible) {
                    WeaponSelectVm.isVisible = false;
                }
            },
            classArtifactSetSelected: function (index) {
                if (ArtifactSetSelectVm && ArtifactSetSelectVm.isVisible && index == ArtifactSetSelectVm.index) {
                    return 'selected';
                }
                return '';
            },
            artifactDetailOnClick: function () {
                switchActiveEntry(Pane4Group, ArtifactDetailInputVm);
            },
            normalAttackOnClick: function () {
                CharacterInformationVm.controlVisible('通常攻撃');
            },
            elementalSkillOnClick: function () {
                CharacterInformationVm.controlVisible('元素スキル');
            },
            elementalBurstOnClick: function () {
                CharacterInformationVm.controlVisible('元素爆発');
            },
            characterInfoOnClick: function () {
                CharacterInformationVm.controlVisible();
            },
            saveOnClick: function () {
                if (!this.buildName) return;
            },
            removeOnClick: function () {
                if (!this.buildName) return;
            }
        }
    }
    CharacterInputVm = Vue.createApp(CharacterInput).mount('#character-input');
}

async function initialSetupWeaponSelect(weaponType, weapon, weaponMaster) {
    const WeaponSelect = {
        data() {
            return {
                isVisible: false,
                type: weaponType,
                selected: weapon,
                weaponMaster: weaponMaster
            }
        },
        computed: {
            list: function () {
                if (!this.type) return [];
                const result = [];
                if (this.weaponType) {
                    Object.keys(武器MasterVar[this.type]).forEach(key => {
                        result.push({
                            name: key,
                            master: 武器MasterVar[this.type][key]
                        })
                    });
                }
                return result;
            },
            baseATKValue: function () {
                return 0;
            },
            propertyName: function () {
                if (this.weaponMaster && 'ステータス' in this.weaponMaster) {
                    const statArr = Object.keys(this.weaponMaster['ステータス']).filter(s => !s.startsWith('基礎'));
                    if (statArr.length > 0) {
                        return statArr[0];
                    }
                }
                return null;
            },
            propertyValue: function () {
                return 0;
            },
            skillName: function () {
                if (this.weaponMaster && '武器スキル' in this.weaponMaster && '名前' in this.weaponMaster['武器スキル']) {
                    return this.weaponMaster['武器スキル']['名前'];
                }
                return null;
            },
            skillDesc: function () {
                if (this.weaponMaster && '武器スキル' in this.weaponMaster && '説明' in this.weaponMaster['武器スキル']) {
                    return this.weaponMaster['武器スキル']['説明'];
                }
                return null;
            }
        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
            },
            displayStatValue: function (name, value) {
                return getDisplayStatValue(name, value);
            },
            iconUrl: function (item) {
                const importUrl = item.master.import;
                return importUrl.replace('data/', 'images/').replace('.json', '.png');
            },
            starBackgroundUrl: function (item) {
                return getStarBackgroundUrl(item.master);
            },
            onClick: function (event) {
                const newValue = list.filter(s => s.name == event.target.alt)[0];
                if (event.target.alt != newValue.name) {
                    this.selected = newValue;
                    setupWeaponInput(this.type, newValue.name, CharacterInputVm);
                }
                this.isVisible = false;
            }
        }
    }
    WeaponSelectVm = Vue.createApp(WeaponSelect).mount('#weapon-select');
}

function initialSetupArtifactSetSelect() {
    const ArtifactSetSelect = {
        data() {
            return {
                isVisible: false,
                index: null,
                selected: ['NONE', 'NONE'],
                list: null
            }
        },
        created() {
            this.list = Object.keys(聖遺物セット効果MasterVar).map(function (key) {
                return {
                    name: key,
                    master: 聖遺物セット効果MasterVar[key]
                }
            });
        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
            },
            iconUrl: function (item) {
                return item.master.image;
            },
            starBackgroundUrl: function (item) {
                return getStarBackgroundUrl(item.master);
            },
            selectedClass: function (item) {
                if (item.name && selected.includes(item.name)) {
                    return 'selected';
                }
                return '';
            },
            descriptionTitle: function (index) {
                const name0 = this.selected[0];
                const name1 = this.selected[1];
                if (index == 0) {
                    return name0 + ' 2セット効果';
                } else if (name0 == name1) {
                    return name0 + ' 4セット効果';
                } else {
                    return name1 + ' 2セット効果';
                }
            },
            description: function (index) {
                const name0 = this.selected[0];
                const name1 = this.selected[1];
                if (index == 0) {
                    if (!name0) return null;
                } else {
                    if (!name1) return null;
                }
                const myMaster0 = 聖遺物セット効果MasterVar[this.selected[0]];
                const myMaster1 = 聖遺物セット効果MasterVar[this.selected[1]];
                if (index == 0) {
                    return ('2セット効果' in myMaster0) ? myMaster0['2セット効果']['説明'] : null;
                } else if (name0 == name1) {
                    return ('4セット効果' in myMaster0) ? myMaster0['4セット効果']['説明'] : null;
                } else {
                    return ('2セット効果' in myMaster1) ? myMaster1['2セット効果']['説明'] : null;
                }
            },
            onClick: function (item) {
                if (item.name != this.selected[this.index]) {
                    this.selected[this.index] = item.name;
                    CharacterInputVm['聖遺物セット効果'][this.index]['名前'] = item.name;
                    CharacterInputVm['聖遺物セット効果'][this.index].master = item.master;
                }
                this.isVisible = false;
            }
        }
    }
    ArtifactSetSelectVm = Vue.createApp(ArtifactSetSelect).mount('#artifact-set-select');
}

function initialSetupArtifactDetailInput() {
    const ArtifactDetailInput = {
        data() {
            return {
                isVisible: false,
                isEditable: false,
                聖遺物メイン効果: [null, null, null, null, null],
                聖遺物優先するサブ効果: [null, null, null],
                聖遺物優先するサブ効果上昇値: [0, 0, 0],
                聖遺物優先するサブ効果上昇回数: [8, 5, 5],
                subStatUpLists: [[], [], []],
                subStatUpIndices: [6, 6, 6],
                gensen: '厳選1ヶ月',
                gensenList: [null, '厳選初心者', '厳選1ヶ月', '厳選3ヶ月', '日々石割'],
                厳選目安一括変更Enabled: false,
                聖遺物ステータス: JSON.parse(JSON.stringify(聖遺物ステータスTEMPLATE)),
                聖遺物ステータス補正: JSON.parse(JSON.stringify(聖遺物ステータスTEMPLATE)),
                isステータス計算無効: false
            }
        },
        computed: {
            priorityStatList: function () {
                return 聖遺物優先するサブ効果ARRAY;
            },
            statList: function () {
                const result = [];
                const arr = Object.keys(聖遺物ステータスTEMPLATE);
                for (let i = 0; i < 7; i++) {
                    result.push([arr[i], i < (arr.length - 7) ? arr[i + 7] : null]);
                }
                return result;
            },
            countList: function () {
                return Array.from({ length: 16 }, (_, i) => i);
            },
            totalCount: function () {
                const priorityCount = this.聖遺物優先するサブ効果上昇回数.reduce((sum, e) => sum + e);
                let noPriorityCount = Math.min(45, 40 + Math.round(Math.max(0, (priorityCount - 12) / 4)));
                noPriorityCount -= Math.min(45, priorityCount)
                return priorityCount + noPriorityCount;
            }
        },
        mounted() {
        },
        watch: {
            聖遺物メイン効果: {
                handler: function (newVal, oldVal) {
                    if (!this.isステータス計算無効) {
                        calculateArtifactStat(this);
                    }
                    updateStatusStatus(calculateStatus(CharacterInputVm, this, StatusInputVm));
                },
                deep: true
            },
            聖遺物優先するサブ効果: {
                handler: function (newVal, oldVal) {
                    for (let i = 0; i < this.subStatUpLists.length; i++) {
                        const result = [];
                        const stat = this.聖遺物優先するサブ効果[i];
                        if (stat in 聖遺物サブ効果MasterVar) {
                            const master = 聖遺物サブ効果MasterVar[stat];
                            for (let i = 0; i < master.length; i++) {
                                result.push(master[i]);
                                if (i < master.length - 1) {
                                    let newValue = master[i] + (master[i + 1] - master[i]) / 2;
                                    newValue = Math.round(newValue * 100) / 100;
                                    result.push(newValue);
                                }
                            }
                        }
                        this.subStatUpLists.splice(i, 1, result);
                        if (result.length > 0 && this.subStatUpIndices[i] != -1) {
                            this.聖遺物優先するサブ効果上昇値[i] = result[this.subStatUpIndices[i]];
                        }
                    }
                    if (!this.isステータス計算無効) {
                        calculateArtifactStat(this);
                    }
                    updateStatusStatus(calculateStatus(CharacterInputVm, this, StatusInputVm));
                },
                deep: true
            },
            聖遺物優先するサブ効果上昇量: {
                handler: function (newVal, oldVal) {
                    if (!this.isステータス計算無効) {
                        calculateArtifactStat(this);
                    }
                    updateStatusStatus(calculateStatus(CharacterInputVm, this, StatusInputVm));
                },
                deep: true
            },
            聖遺物優先するサブ効果上昇回数: {
                handler: function (newVal, oldVal) {
                    if (!this.isステータス計算無効) {
                        calculateArtifactStat(this);
                    }
                    updateStatusStatus(calculateStatus(CharacterInputVm, this, StatusInputVm));
                },
                deep: true
            }
        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
            },
            displayStatValue: function (name, value) {
                return getDisplayStatValue(name, value);
            },
            statStep: function (name) {
                return getStatStep(name);
            },
            mainStatList: function (index) {
                return [
                    聖遺物メイン効果_生の花ARRAY,
                    聖遺物メイン効果_死の羽ARRAY,
                    聖遺物メイン効果_時の砂ARRAY,
                    聖遺物メイン効果_空の杯ARRAY,
                    聖遺物メイン効果_理の冠ARRAY
                ][index];
            },
            subStatUpList: function (index) {
                const stat = this.聖遺物優先するサブ効果[index];
                if (!stat) return [];
                const master = 聖遺物サブ効果MasterVar[stat];
                const result = [];
                for (let i = 0; i < master.length; i++) {
                    result.push(master[i]);
                    if (i < master.length - 1) {
                        let newValue = master[i] + (master[i + 1] - master[i]) / 2;
                        newValue = Math.round(newValue * 100) / 100;
                        result.push(newValue);
                    }
                }
                return result;
            },
            mainChanged: function () {
                this.isステータス計算無効 = false;
                CharacterInputVm.isChanged = true;
            },
            changed: function () {
                CharacterInputVm.isChanged = true;
            },
            priorityChanged: function () {
                this.isステータス計算無効 = false;
                CharacterInputVm.isChanged = true;
            },
            subStatOnChange: function (index, selectedIndex) {
                this.subStatUpIndices[index] = selectedIndex;
                this.isステータス計算無効 = false;
            },
            gensenOnChange: function () {
                this.厳選目安一括変更Enabled = false;
                if (!this.gensen) return;
                const 上昇値Arr = [[], [6, 6, 6], [6, 6, 6], [5, 5, 5], [4, 4, 4]];
                const 上昇回数Arr = [[], [4, 4, 4], [8, 5, 5], [11, 7, 7], [15, 10, 10]];
                const gensenIndex = this.gensenList.indexOf(this.gensen);
                for (let i = 0; i < 上昇回数Arr[gensenIndex].length; i++) {
                    this.聖遺物優先するサブ効果上昇値[i] = this.subStatUpList(i)[上昇値Arr[gensenIndex][i]];
                    this.subStatUpIndices[i] = 上昇値Arr[gensenIndex][i];
                    this.聖遺物優先するサブ効果上昇回数[i] = 上昇回数Arr[gensenIndex][i];
                }
            }
        }
    }
    ArtifactDetailInputVm = Vue.createApp(ArtifactDetailInput).mount('#artifact-detail-input');
}

function initialSetupConditionInput(opt_characterMaster = null) {
    const ConditionInput = {
        data() {
            return {
                isVisible: true,
                conditions: {},
                character: null,
                characterMaster: null,
                conditionAdjustments: {}
            }
        },
        computed: {
            inputList: function () {
                if (!this.character || !this.characterMaster) return [];
                const result = [];
                const damageDetailObjArr = getDamageDetailObjArr(CharacterInputVm);
                damageDetailObjArr.forEach(damageDetailObj => {
                    if (!damageDetailObj) return;
                    damageDetailObj['条件'].forEach((value, key) => {
                        if (value != null) return;
                        result.push({
                            name: key,
                            exclusions: damageDetailObj['排他'].has(key) ? damageDetailObj['排他'].get(key) : null
                        });
                    });
                });
                result.forEach(condition => {
                    if (condition.name in this.conditions) return;
                    let value = true;
                    [this.characterMaster, CharacterInputVm.weaponMaster].forEach(master => {
                        if ('オプション初期値' in master) {
                            if (condition.name in master['オプション初期値']) {
                                value = master['オプション初期値'][condition.name];
                            }
                        }
                    });
                    if (value && condition.exclusions) {
                        condition.exclusions.forEach(exclusion => {
                            if (this.conditions[exclusion]) {
                                value = false;
                            }
                        });
                    }
                    this.conditions[condition.name] = value;
                });
                return result;
            },
            selectList: function () {
                if (!this.character || !this.characterMaster) return [];
                const result = [];
                const damageDetailObjArr = getDamageDetailObjArr(CharacterInputVm);
                damageDetailObjArr.forEach(damageDetailObj => {
                    if (!damageDetailObj) return;
                    damageDetailObj['条件'].forEach((value, key) => {
                        if (value == null) return;
                        result.push({
                            name: key,
                            list: value,
                            require: value.filter(s => s.startsWith('required_')).length > 0,
                            exclusions: damageDetailObj['排他'].has(key) ? damageDetailObj['排他'].get(key) : null
                        });
                    });
                });
                result.forEach(condition => {
                    if (condition.name in this.conditions) return;
                    let value = condition.list[condition.list.length - 1];
                    [this.characterMaster, CharacterInputVm.weaponMaster].forEach(master => {
                        if ('オプション初期値' in master) {
                            if (condition.name in master['オプション初期値']) {
                                let index = master['オプション初期値'][condition.name];
                                if (!condition.require) index -= 1;
                                value = condition.list[index];
                            }
                        }
                    });
                    if (value && condition.exclusions) {
                        condition.exclusions.forEach(exclusion => {
                            if (this.conditions[exclusion]) {
                                value = null;
                            }
                        });
                    }
                    this.conditions[condition.name] = value;
                });
                return result;
            }
        },
        mounted() {
            this.$nextTick(function () {
                if (CharacterInputVm) {
                    this.character = CharacterInputVm.name;
                    this.characterMaster = CharacterInputVm.master;
                }
            });
        },
        watch: {
            conditions: {
                handler: function (newVal, oldVal) {
                    this.updateConditionAdjustments();
                    console.log('conditions', this.conditions);
                },
                deep: true
            }
        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
            },
            displayOption: function (name) {
                return getDisplayName(name.replace(/^required_/, ''));
            },
            displayStatKeyAndValue: function (name, value) {
                return getDisplayStatKeyAndValue(name, value);
            },
            onChange: function (item) {
                if (!item.exclusions) return;
                this.inputList.filter(s => item.exclusions.includes(s.name)).forEach(entry => {
                    this.conditions[entry.name] = false;
                });
                this.selectList.filter(s => item.exclusions.includes(s.name)).forEach(entry => {
                    this.conditions[entry.name] = null;
                });
            },
            updateConditionAdjustments: function () {
                if (!StatusInputVm) return;
                const validConditionValueArr = makeValidConditionValueArr(this);
                const constellation = CharacterInputVm.命ノ星座;
                const result = {};
                const damageDetailObjArr = getDamageDetailObjArr(CharacterInputVm);
                damageDetailObjArr.forEach(damageDetailObj => {
                    if (!damageDetailObj) return;
                    damageDetailObj[CHANGE_KIND_STATUS].filter(s => s['条件']).forEach(detailObj => {
                        const checkRet = checkConditionMatches(detailObj['条件'], validConditionValueArr, constellation);
                        if (checkRet == 0) return;
                        let formulaArr = detailObj['数値'];
                        if (checkRet != 1) formulaArr = formulaArr.concat(['*', checkRet]);
                        const work = calculateStatusDiff(StatusInputVm.ステータス, detailObj['種類'], formulaArr, detailObj['上限']);
                        Object.keys(work).forEach(key => {
                            addValueToObject(result, key, work[key]);
                        });
                    });
                });
                console.debug('updateConditionAdjustments', result);
                this.conditionAdjustments = result;
            }
        }
    };
    ConditionInputVm = Vue.createApp(ConditionInput).mount('#condition-input');
}

function initialSetupOptionInput(opt_characterMaster = null) {
    const OptionInput = {
        data() {
            return {
                isVisible: true,
                activeTab: 1,
                elementalResonanceMaster: 元素共鳴MasterVar,
                元素共鳴: {},
                元素共鳴詳細: {},
                teamOptionMaster: チームオプションMasterVar,
                チームオプション: {},
                チームオプション詳細: {},
                teamOptionSupporterList: [],
                isTeamOptionSupporterOpened: {},
                option1Master: オプション1MasterVar,
                オプション1: {},
                オプション1詳細: {},
                option2Master: オプション2MasterVar,
                オプション2: {},
                オプション2詳細: {},
                ステータス補正: {}
            }
        },
        created() {
            Object.keys(this.elementalResonanceMaster).forEach(key => {
                this.元素共鳴[key] = false;
                this.元素共鳴詳細[key] = null;
            });
            Object.keys(this.teamOptionMaster).forEach(key => {
                this.チームオプション[key] = null;
                this.チームオプション詳細[key] = null;
            });
            this.teamOptionSupporterList = Array.from(new Set(Object.keys(this.teamOptionMaster).map(s => s.split('_')[0])));
            this.teamOptionSupporterList.forEach(supporter => {
                this.isTeamOptionSupporterOpened[supporter] = false;
            });
            Object.keys(this.option1Master).forEach(key => {
                this.オプション1[key] = null;
                this.オプション1詳細[key] = null;
            });
            Object.keys(this.option2Master).forEach(key => {
                this.オプション2[key] = null;
                this.オプション2詳細[key] = null;
            });
        },
        computed: {
            elementalResonanceList: function () {
                return Object.keys(this.elementalResonanceMaster).filter(s => s.endsWith('共鳴'));
            },
            option1List: function () {
                return Object.keys(this.option1Master);
            },
            option2List: function () {
                return Object.keys(this.option2Master);
            }
        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
            },
            displayStatValue: function (name, value) {
                return getDisplayStatValue(name, value);
            },
            name: function (item) {
                return this.elementalResonanceMaster[item]['名前'];
            },
            elementalResonanceOnChange: function (key, event) {
                if (event.target.checked) {
                    if (Object.keys(this.元素共鳴).filter(s => this.元素共鳴[s]).length > 2) {
                        event.target.checked = false;
                        this.元素共鳴[key] = false;
                    }
                }
            },
            elementalResonanceName: function (index) {
                const arr = Object.keys(this.元素共鳴).filter(s => this.元素共鳴[s]);
                if (arr.length > index) {
                    return this.elementalResonanceMaster[arr[index]]['名前'];
                } else if (arr.length == 0 && index == 0) {
                    return this.elementalResonanceMaster['元素共鳴なし']['名前'];
                }
                return '';
            },
            elementalResonanceDescription: function (index) {
                const arr = Object.keys(this.元素共鳴).filter(s => this.元素共鳴[s]);
                if (arr.length > index) {
                    return this.elementalResonanceMaster[arr[index]]['説明'];
                } else if (arr.length == 0 && index == 0) {
                    return this.elementalResonanceMaster['元素共鳴なし']['説明'];
                }
                return '';
            },
            teamOptionList: function (supporter) {
                return Object.keys(this.teamOptionMaster).filter(s => s.startsWith(supporter + '_')).map(s => s.replace(supporter + '_', ''));
            },
            teamOptionSupporterDisabled(supporter) {
                return CharacterInputVm && supporter == CharacterInputVm.name;
            },
            teamOptionDisabled(character, name) {
                return false;
            },
            supporterInputList: function (supporter) {
                return [];
            },
            supporterSelectList: function (supporter) {
                return [];
            }
        }
    }
    OptionInputVm = Vue.createApp(OptionInput).mount('#option-input');
}

function initialSetupStatusInput(characterMaster) {
    const StatusInput = {
        data() {
            return {
                isVisible: true,
                activeTab: '1',
                isEditable: false,
                ステータス: JSON.parse(JSON.stringify(ステータスTEMPLATE)),
                ステータス補正: {},
                isステータスOpened: {},
                補正値0初期化Enabled: false,
                enemy: null,
                enemyList: [],
                敵ステータス: JSON.parse(JSON.stringify(敵ステータスTEMPLATE)),
                敵ステータス補正: {},
                is敵ステータスOpened: false
            }
        },
        created() {
            Object.keys(this.ステータス).forEach(stat => {
                this.ステータス補正[stat] = 0;
            });
            ステータスARRAY_MAP.forEach((value, key) => {
                this.isステータスOpened[key] = false; // close
            });
            this.敵ステータス['レベル'] = 90;
            this.isステータスOpened['基本ステータス'] = true;
            this.enemyList = Object.keys(敵MasterVar).map(name => makeEnemyObj(name));
            this.enemy = this.enemyList[0];
            Object.keys(this.enemy.master).forEach(stat => {
                this.敵ステータス[stat] = this.enemy.master[stat];
            });
            Object.keys(this.敵ステータス).forEach(stat => {
                this.敵ステータス補正[stat] = 0;
            });
        },
        computed: {
            enemyMaster: function () {
                return this.enemy.master;
            },
            enemyStatList: function () {
                return 元素ステータス_耐性ARRAY.filter(s => this.is敵ステータスOpened || this.敵ステータス[s]);
            }
        },
        watch: {
            ステータス補正: {
                handler: function (newVal, oldVal) {
                    //TODO
                },
                deep: true
            },
            enemy: {
                handler: function (newVal, oldVal) {
                    this.calculateEnemyStatus();
                }
            },
            敵ステータス補正: {
                handler: function (newVal, oldVal) {
                    this.calculateEnemyStatus();
                },
                deep: true
            }
        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
            },
            displayStatValue: function (name, value) {
                return getDisplayStatValue(name, value);
            },
            statStep: function (name) {
                return getStatStep(name);
            },
            statList: function (category) {
                return ステータスARRAY_MAP.get(category).filter(s => this.isステータスOpened[category] || this.ステータス[s]);
            },
            calculateEnemyStatus: function () {
                updateStatusEnemyStatus(this.enemy, this);
            },
            resetStatusAdjustment: function (adjustmentInput, opt_categoryArr = null) {
                this.補正値0初期化Enabled = false;
                if (opt_categoryArr) {
                    opt_categoryArr.forEach(category => {
                        ステータスARRAY_MAP.get(category).forEach(stat => {
                            if (stat in adjustmentInput) {
                                adjustmentInput[stat] = 0;
                            }
                        });
                    });
                } else {
                    Object.keys(adjustmentInput).forEach(stat => {
                        adjustmentInput[stat] = 0;
                    })
                }
            }
        }
    };
    StatusInputVm = Vue.createApp(StatusInput).mount('#status-input');
}

function initialSetupCalcurationResult() {
    const CalculationResult = {
        data() {
            return {
                元素: '風',
                元素反応: JSON.parse(JSON.stringify(元素反応TEMPLATE)),
                計算結果: JSON.parse(JSON.stringify(計算結果TEMPLATE)),
                増幅反応: 'なし',
                is計算結果Opened: {}
            }
        },
        created() {
            Object.keys(this.計算結果).forEach(key => {
                this.is計算結果Opened[key] = true; // open
            });
        },
        beforeMount() {
        },
        mounted() {
        },
        computed: {
            categoryList: function () {
                return Object.keys(this.計算結果).filter(s => this.計算結果[s].length);
            }
        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
            },
            displayDamageValue: function (item, index, opt_反応倍率 = null) {
                return getDisplayDamageValue(item, index, opt_反応倍率);
            },
            classByElement(element) {
                return ELEMENT_COLOR_CLASS[element];
            },
            damageList: function (category) {
                return this.計算結果[category].filter(s => s[0] && !s[0].startsWith('非表示'));
            }
        }
    };
    CalculationResultVm = Vue.createApp(CalculationResult).mount('#calculation-result');
}

function initialSetupCharacterInformation() {
    const CharacterInformation = {
        data() {
            return {
                isVisible: false,
                isContentVisible: {
                    ステータス: true,
                    通常攻撃: false,
                    元素スキル: false,
                    元素爆発: false,
                    その他戦闘天賦: true,
                    固有天賦: true,
                    命ノ星座: true
                }
            }
        },
        computed: {
            character: function () {
                return CharacterInputVm.character;
            },
            characterMaster: function () {
                return CharacterInputVm.characterMaster;
            }
        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
            },
            displayFormula: function (category, detailObj) {
                if (isPlainObject(detailObj['数値'])) {
                    let level;
                    if ('ダメージバフ' in detailObj) {
                        const workCategory = detailObj['ダメージバフ'].replace(/ダメージバフ$/, '');
                        if (workCategory in this.master) {
                            category = workCategory;
                        }
                    }
                    if (category == '通常攻撃') level = CharacterInputVm.通常攻撃レベル;
                    else if (category == '元素スキル') level = CharacterInputVm.元素スキルレベル;
                    else if (category == '元素爆発') level = CharacterInputVm.元素爆発レベル;
                    if (level in detailObj['数値']) {
                        return detailObj['数値'][level];
                    }
                }
                return detailObj['数値'];
            },
            categoryOtherInfoKeys: function (category) {
                return Object.keys(this.master[category]).filter(s =>
                    ['元素エネルギー'].includes(s) || s.endsWith('クールタイム') || s.endsWith('継続時間')
                );
            },
            categoryOtherInfoCount: function (category) {
                return this.categoryOtherInfoKeys(category).length;
            },
            categoryOtherInfoKey: function (category, index) {
                return this.categoryOtherInfoKeys(category)[index];
            },
            categoryOtherInfoValue: function (category, index) {
                return this.master[category][this.categoryOtherInfoKey(category, index)];
            },
            controlVisible: function (opt_target = null) {
                if (opt_target) {
                    if (this.isVisible && this.isContentVisible[opt_target]) {
                        this.isVisible = false;
                        return;
                    }
                    Object.keys(this.isContentVisible).forEach(key => {
                        if (key == opt_target) this.isContentVisible[key] = true;
                        else this.isContentVisible[key] = false;
                    });
                    this.isVisible = true;
                } else {
                    const TARGETABLE_ARR = ['通常攻撃', '元素スキル', '元素爆発'];
                    if (this.isVisible && TARGETABLE_ARR.filter(s => this.isContentVisible[s]).length == 0) {
                        this.isVisible = false;
                        return;
                    }
                    Object.keys(this.isContentVisible).forEach(key => {
                        if (TARGETABLE_ARR.includes(key)) this.isContentVisible[key] = false;
                        else this.isContentVisible[key] = true;
                    });
                    this.isVisible = true;
                }
            }
        }
    }
    CharacterInformationVm = Vue.createApp(CharacterInformation).mount('#character-information');
}

function initialSetupCharacterOwnList() {
    const CharacterOwnList = {
        data() {
            return {
                isVisible: false,
                list: [],
                命ノ星座: キャラクター所持状況Var,
                isChanged: false
            }
        },
        created() {
            this.list = Object.keys(キャラクターMasterVar).map(function (key) {
                return {
                    name: key,
                    master: キャラクターMasterVar[key]
                }
            });
            Object.keys(キャラクターMasterVar).forEach(key => {
                if (!(key in this.命ノ星座)) {
                    this.命ノ星座[key] = null;
                }
            });
        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
            },
            iconUrl: function (item) {
                const importUrl = item.master.import;
                return 'images/characters/face/' + importUrl.split('/')[importUrl.split('/').length - 1].replace('json', 'png');
            },
            starBackgroundUrl: function (item) {
                return getStarBackgroundUrl(item.master);
            },
            elementImgSrc: function (item) {
                return getElementImgSrc(item.master);
            },
            classSelected: function (item) {
                if (item.name == this.selected) {
                    return 'selected';
                }
                return '';
            },
            onClick: function (item) {
                if (this.命ノ星座[item.name] == null) {
                    this.命ノ星座[item.name] = 0;
                } else if (this.命ノ星座[item.name] > 5) {
                    this.命ノ星座[item.name] = null;
                } else {
                    this.命ノ星座[item.name]++;
                }
                this.isChanged = true;
            },
            saveOnClick: function () {
                const obj = {};
                Object.keys(this.命ノ星座).filter(s => this.命ノ星座[s] != null).forEach(key => {
                    obj[key] = this.命ノ星座[key];
                });
                localStorage.setItem('キャラクター所持状況', JSON.stringify(obj));
                this.isChanged = false;
            }
        }
    }
    CharacterOwnListVm = Vue.createApp(CharacterOwnList).mount('#character-own-list');
}

function initialSetupWeaponOwnList() {
    const WeaponOwnList = {
        data() {
            return {
                isVisible: false,
                list: null,
                精錬ランク: 武器所持状況Var,
                filters: {
                    weapon: {
                        selected: '片手剣',
                        list: null
                    }
                },
                isChanged: false
            }
        },
        created() {
            this.list = {};
            Object.keys(武器MasterVar).forEach(category => {
                this.list[category] = Object.keys(武器MasterVar[category]).map(function (key) {
                    return {
                        name: key,
                        master: 武器MasterVar[category][key]
                    }
                });
                Object.keys(武器MasterVar[category]).forEach(key => {
                    if (!(key in this.精錬ランク)) {
                        this.精錬ランク[key] = null;
                    }
                });
            });
            this.filters.weapon.list = Object.keys(WEAPON_IMG_SRC).map(function (key) {
                return { name: key, url: WEAPON_IMG_SRC[key] }
            });
        },
        computed: {
            filteredList: function () {
                return this.list[this.filters.weapon.selected];
            }
        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
            },
            iconUrl: function (item) {
                const importUrl = item.master.import;
                return importUrl.replace('data/', 'images/').replace('.json', '.png');
            },
            starBackgroundUrl: function (item) {
                return getStarBackgroundUrl(item.master);
            },
            onClick: function (item) {
                if (this.精錬ランク[item.name] == null) {
                    this.精錬ランク[item.name] = 1;
                } else if (this.精錬ランク[item.name] > 0 && item.master['レアリティ'] <= 2) {
                    this.精錬ランク[item.name] = null;
                } else if (this.精錬ランク[item.name] >= 5) {
                    this.精錬ランク[item.name] = null;
                } else {
                    this.精錬ランク[item.name]++;
                }
                this.isChanged = true;
            },
            saveOnClick: function () {
                const obj = {};
                Object.keys(this.精錬ランク).filter(s => this.精錬ランク[s] != null).forEach(key => {
                    obj[key] = this.精錬ランク[key];
                });
                localStorage.setItem('武器所持状況', JSON.stringify(obj));
                this.isChanged = false;
            }
        }
    }
    WeaponOwnListVm = Vue.createApp(WeaponOwnList).mount('#weapon-own-list');
}

function initialSetupStorageControl() {
    const StorageControl = {
        data() {
            return {
                canClearLocalStorage: false
            }
        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
            },
            clearLocalStorage() {
                localStorage.clear();
            }
        }
    }
    StorageControlVm = Vue.createApp(StorageControl).mount('#storage-control');
}

