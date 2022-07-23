async function onLoad(searchParams) {
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
        'data/OptionMaster2.json'
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

    initialSetupCharacterSelect();
    initialSetupCalcurationResult();
    initialSetupStatusInput();
    initialSetupOptionInput();
    initialSetupConditionInput();
    initialSetupArtifactDetailInput();
    initialSetupArtifactSetSelect();
    initialSetupWeaponSelect('弓');
    initialSetupCharacterInput();
    initialSetupCharacterOwnList();
    initialSetupWeaponOwnList();

    Pane4Group.add(WeaponSelectVm);
    Pane4Group.add(ArtifactSetSelectVm);
    Pane4Group.add(ArtifactDetailInputVm);
}

function initialSetupCharacterSelect() {
    const CharacterSelect = {
        data() {
            return {
                isVisible: false,
                selected: null,
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
                    setupCharacterInput(this.selected, CharacterInputVm, ArtifactDetailInputVm, StatusInputVm);
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

async function initialSetupCharacterInput(name) {
    const CharacterInput = {
        data() {
            return {
                name: null,
                master: CHARACTER_MASTER_DUMMY,
                突破レベル: 6,
                レベル: 90,
                命ノ星座: 0,
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
                weapon: null,
                weaponMaster: WEAPON_MASTER_DUMMY,
                武器突破レベル: 6,
                武器突破レベルOption: {
                    max: 6
                },
                武器レベル: 90,
                武器精錬ランク: 1,
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
                おすすめセット: null,
                おすすめセットOption: {
                    isOpen: false,
                    list: []
                },
                saveName: ''
            }
        },
        created() {
            for (let artifactSet in this.聖遺物セット効果) {
                artifactSet.master = 聖遺物セット効果MasterVar[artifactSet['名前']];
            }
        },
        mounted() {
            const character = getCharacterByBirthday();
            setupCharacterInput(character, this, ArtifactDetailInputVm, StatusInputVm);
            CharacterSelectVm.selected = character;
        },
        computed: {
            colorClass: function () {
                return getColorClass(this.master);
            },
            bgColorClass: function () {
                return getBgColorClass(this.master);
            },
            starBackgroundUrl: function () {
                return getStarBackgroundUrl(this.master);
            },
            weaponStarBackgroundUrl: function () {
                return getStarBackgroundUrl(this.weaponMaster);
            },
            elementImgSrc: function () {
                return getElementImgSrc(this.master);
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
            artifactScore: function () {
                return 0;
            }
        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
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

            },
            elementalSkillOnClick: function () {

            },
            elementalBurstOnClick: function () {

            },
            characterInfoOnClick: function () {

            },
            saveOnClick: function () {
                if (!saveName) return;
            },
            removeOnClick: function () {
                if (!saveName) return;
            }
        },
        watch: {
            name: {
                handler: function (newVal, oldVal) {
                    updateStatusInputStatus(calculateStatus(this, ArtifactDetailInputVm, StatusInputVm));
                },
                deep: true
            },
            突破レベル: {
                handler: function (newVal, oldVal) {
                    updateStatusInputStatus(calculateStatus(this, ArtifactDetailInputVm, StatusInputVm));
                }
            },
            レベル: {
                handler: function (newVal, oldVal) {
                    updateStatusInputStatus(calculateStatus(this, ArtifactDetailInputVm, StatusInputVm));
                }
            },
            命ノ星座: {
                handler: function (newVal, oldVal) {
                    updateStatusInputStatus(calculateStatus(this, ArtifactDetailInputVm, StatusInputVm));
                }
            },
            weapon: {
                handler: function (newVal, oldVal) {
                    updateStatusInputStatus(calculateStatus(this, ArtifactDetailInputVm, StatusInputVm));
                }
            },
            武器突破レベル: {
                handler: function (newVal, oldVal) {
                    updateStatusInputStatus(calculateStatus(this, ArtifactDetailInputVm, StatusInputVm));
                }
            },
            武器レベル: {
                handler: function (newVal, oldVal) {
                    updateStatusInputStatus(calculateStatus(this, ArtifactDetailInputVm, StatusInputVm));
                }
            },
            武器精錬ランク: {
                handler: function (newVal, oldVal) {
                    updateStatusInputStatus(calculateStatus(this, ArtifactDetailInputVm, StatusInputVm));
                }
            },
            聖遺物セット効果: {
                handler: function (newVal, oldVal) {
                    updateStatusInputStatus(calculateStatus(this, ArtifactDetailInputVm, StatusInputVm));
                },
                deep: true
            }
        }
    }
    CharacterInputVm = Vue.createApp(CharacterInput).mount('#character-input');
}

async function initialSetupWeaponSelect(type) {
    const WeaponSelect = {
        data() {
            return {
                isVisible: false,
                selected: null,
                master: null,
                type: type,
                list: null
            }
        },
        created() {
            this.list = Object.keys(武器MasterVar[type]).map(function (key) {
                return {
                    name: key,
                    master: 武器MasterVar[type][key]
                }
            });
        },
        computed: {
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
            onClick: function (event) {
                if (event.target.alt != this.selected) {
                    this.selected = event.target.alt;
                    setupWeaponInput(this.type, this.selected, CharacterInputVm);
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
                isVisible: true,
                isEditable: false,
                聖遺物メイン効果: [null, null, null, null, null],
                聖遺物優先するサブ効果: [null, null, null],
                聖遺物優先するサブ効果上昇量: [4, 4, 4],
                聖遺物優先するサブ効果上昇回数: [5, 5, 5],
                聖遺物ステータス: JSON.parse(JSON.stringify(聖遺物ステータスTEMPLATE)),
                聖遺物ステータス補正: 聖遺物ステータスTEMPLATE,
                isステータスOpened: false,
                補正値0初期化Enabled: false
            }
        },
        computed: {
            priorityStatList: function () {
                return 聖遺物優先するサブ効果ARRAY;
            },
            statList: function () {
                return Object.keys(聖遺物ステータスTEMPLATE).filter(s => this.isステータスOpened || this.聖遺物ステータス[s]);
            }
        },
        created() {

        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
            },
            displayNumber: function (name, value) {
                return getDisplayNumber(name, value);
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
            }
        },
        watch: {
            聖遺物メイン効果: {
                handler: function (newVal, oldVal) {
                    calculateArtifactStat(this);
                    updateStatusInputStatus(calculateStatus(CharacterInputVm, this, StatusInputVm));
                },
                deep: true
            },
            聖遺物優先するサブ効果: {
                handler: function (newVal, oldVal) {
                    calculateArtifactStat(this);
                    updateStatusInputStatus(calculateStatus(CharacterInputVm, this, StatusInputVm));
                },
                deep: true
            },
            聖遺物優先するサブ効果上昇量: {
                handler: function (newVal, oldVal) {
                    calculateArtifactStat(this);
                    updateStatusInputStatus(calculateStatus(CharacterInputVm, this, StatusInputVm));
                },
                deep: true
            },
            聖遺物優先するサブ効果上昇回数: {
                handler: function (newVal, oldVal) {
                    calculateArtifactStat(this);
                    updateStatusInputStatus(calculateStatus(CharacterInputVm, this, StatusInputVm));
                },
                deep: true
            },
            聖遺物ステータス補正: {
                handler: function (newVal, oldVal) {
                    calculateArtifactStat(this);
                    updateStatusInputStatus(calculateStatus(CharacterInputVm, this, StatusInputVm));
                },
                deep: true
            }
        }
    }
    ArtifactDetailInputVm = Vue.createApp(ArtifactDetailInput).mount('#artifact-detail-input');
}

function initialSetupConditionInput(opt_characterMaster = null) {
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
                option1Master: オプション1MasterVar,
                オプション1: {},
                オプション1詳細: {},
                option2Master: オプション2MasterVar,
                オプション2: {},
                オプション2詳細: {}
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
            teamOptionCharacterList: function () {
                return Array.from(new Set(Object.keys(this.teamOptionMaster).map(s => s.split('_')[0])));
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
            teamOptionList: function (character) {
                return Object.keys(this.teamOptionMaster).filter(s => s.startsWith(character + '_')).map(s => s.replace(character + '_', ''));
            },
            teamOptionCharacterDisabled(character) {
                return CharacterInputVm && character == CharacterInputVm.name;
            },
            teamOptionDisabled(character, name) {
                return false;
            }
        }
    }
    OptionInputVm = Vue.createApp(OptionInput).mount('#option-input');
}

function initialSetupStatusInput(characterMaster) {
    const StatusInput = {
        data() {
            return {
                activeTab: '1',
                isEditable: false,
                ステータス: JSON.parse(JSON.stringify(ステータスTEMPLATE)),
                ステータス補正: {},
                isステータスOpened: {},
                補正値0初期化Enabled: false,
                敵: null,
                敵List: [],
                敵レベル: 90,
                敵ステータス: JSON.parse(JSON.stringify(敵ステータスTEMPLATE)),
                敵ステータス補正: {},
                敵防御力: 0,
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
            this.isステータスOpened['基本ステータス'] = true;
            this.敵List = Object.keys(敵MasterVar).map(name => {
                return {
                    name: name,
                    master: 敵MasterVar[name]
                }
            });
            this.敵 = this.敵List[0].name;
            const myEnemyMaster = this.敵List[0].master;
            Object.keys(myEnemyMaster).forEach(stat => {
                this.敵ステータス[stat] = myEnemyMaster[stat];
            });
            Object.keys(this.敵ステータス).forEach(stat => {
                this.敵ステータス補正[stat] = 0;
            });
        },
        computed: {
            enemyStatList: function () {
                return Object.keys(this.敵ステータス).filter(s => this.is敵ステータスOpened || this.敵ステータス[s]);
            }
        },
        methods: {
            displayName: function (name) {
                return getDisplayName(name);
            },
            displayNumber: function (name, value) {
                return getDisplayNumber(name, value);
            },
            statList: function (category) {
                return ステータスARRAY_MAP.get(category).filter(s => this.isステータスOpened[category] || this.ステータス[s]);
            },
            enemyListOnChange: function () {
                const master = 敵MasterVar[this.敵];
                Object.keys(master).forEach(stat => {
                    this.敵ステータス[stat.replace('耐性', '')] = master[stat];
                });
                Object.keys(this.敵ステータス補正).forEach(stat => {
                    this.敵ステータス[stat] += this.敵ステータス補正[stat];
                });
            }
        }
    };
    StatusInputVm = Vue.createApp(StatusInput).mount('#status-input');
}

function initialSetupCalcurationResult() {
    const CalculationResult = {
        data() {
            return {
                元素: '雷',
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
            this.元素 = '水';
            this.元素反応['蒸発倍率'] = 2;
            this.元素反応['溶解倍率'] = 0;
            this.元素反応['過負荷ダメージ'] = 0;
            this.元素反応['感電ダメージ'] = 2000;
            this.元素反応['超電導ダメージ'] = 0;

            this.計算結果['通常攻撃'] = [
                ['1段ダメージ', '物理', 1500, 2000, 1000],
                ['2段ダメージ', '物理', 1500, null, 1000],
                ['3段ダメージ', '物理', 1500, 2000, null],
                ['4段ダメージ', '水', 1500, 2000, 1000]
            ];
            this.計算結果['元素スキル'] = [
                ['スキルダメージ', '水', 1500, 2000, 1000]
            ];
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
            classByElement(element) {
                return ELEMENT_COLOR_CLASS[element];
            },
            damageList: function (category) {
                return this.計算結果[category].filter(s => !s[0].startsWith('非表示'));
            }
        }
    };
    CalculationResultVm = Vue.createApp(CalculationResult).mount('#calculation-result');
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
                } else if (this.命ノ星座[item.name] > 6) {
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

/**
 * 
 * @param {string} name キャラクター名
 */
async function setupCharacterInput(name, characterInput, artifactDetailInput, statusInput) {
    let characterMaster = null;
    if (!キャラクター個別MasterMapVar.has(name)) {
        const url = キャラクターMasterVar[name]['import'];
        const json = await fetch(url).then(resp => resp.json());
        キャラクター個別MasterMapVar.set(name, json);
    }
    characterMaster = キャラクター個別MasterMapVar.get(name);

    if ('固有変数' in characterMaster) {
        Object.keys(characterMaster['固有変数']).forEach(key => {
            statusInput[key] = characterMaster['固有変数'][key];
        });
    }

    if ('オプション初期値' in characterMaster) {

    }

    const myRarity = characterMaster['レアリティ'];
    const myVision = characterMaster['元素'];
    const myWeaponType = characterMaster['武器'];

    const myRecommendationList = makeRecommendationList(characterMaster);
    const myRecommendation = myRecommendationList[0];

    characterInput.おすすめセットOption.list = myRecommendationList;
    characterInput.おすすめセット = myRecommendation[0];

    let myAscension = 6;        // 突破レベル
    let myLevel = 90;           // レベル
    let myConstellation = 0;    // 命ノ星座

    if ('レベル' in myRecommendation[1]) {
        myLevel = Number(myRecommendation[1]['レベル'].replace('+', ''));
        for (myAscension = 0; myAscension < 突破レベルレベルARRAY.length; myAscension++) {
            const max = 突破レベルレベルARRAY[myAscension][突破レベルレベルARRAY[myAscension].length - 1];
            if (myLevel <= max) {
                break;
            }
        }
        if (myRecommendation[1]['レベル'].endsWith('+')) {
            myAscension++;
        }
    }

    if (name in キャラクター所持状況Var) {
        myConstellation = キャラクター所持状況Var[name];
    }
    if (!myConstellation) {
        myConstellation = 0;
    }

    if ('命ノ星座' in characterMaster) {
        let maxSkillLevel = 10;
        let maxBurstLevel = 10;
        let mySkillName = characterMaster.元素スキル.名前;
        let myBurstName = characterMaster.元素爆発.名前;
        Object.keys(characterMaster.命ノ星座).forEach(key => {
            if (myConstellation < Number(key)) return;
            if ('名前' in characterMaster.命ノ星座[key]) {
                if (characterMaster.命ノ星座[key]['名前'].indexOf(mySkillName) != -1) {
                    maxSkillLevel = 13;
                }
                if (characterMaster.命ノ星座[key]['名前'].indexOf(myBurstName) != -1) {
                    maxBurstLevel = 13;
                }
            }
        });
        characterInput.元素スキルレベルOption.max = maxSkillLevel;
        characterInput.元素爆発レベルOption.max = maxBurstLevel;
    } else {
        characterInput.命ノ星座Option.max = 0;
        characterInput.元素スキルレベルOption.max = 10;
        characterInput.元素爆発レベルOption.max = 10;
    }

    characterInput.name = name;
    characterInput.master = characterMaster;
    characterInput.突破レベル = myAscension;
    characterInput.レベル = myLevel;
    characterInput.命ノ星座 = myConstellation;

    loadRecommendation(myRecommendation[1], characterInput, artifactDetailInput, statusInput);

    let myLevelStr = myLevel;
    if (突破レベルレベルARRAY[myAscension][0] == myLevel) {
        myLevelStr += '+';
    }

    calculateArtifactStat(artifactDetailInput);
    calculateStatus(characterInput, artifactDetailInput, statusInput);

    const damegeDetailObj = makeDamageDetailObjCharacter(characterInput);

    // StatusInputVm.基礎ステータス['基礎HP'] = myCharacterMaster.ステータス['基礎HP'][myLevelStr];
    // StatusInputVm.基礎ステータス['基礎攻撃力'] = myCharacterMaster.ステータス['基礎攻撃力'][myLevelStr];
    // StatusInputVm.基礎ステータス['基礎防御力'] = myCharacterMaster.ステータス['基礎防御力'][myLevelStr];

    // const myPropertyName = Object.keys(myCharacterMaster.ステータス).filter(s => !s.startsWith('基礎'))[0];
    // ['高級ステータス', 'その他ステータス'].forEach(key => {
    //     if (myPropertyName in StatusInputVm[key]) {
    //         StatusInputVm[key][myPropertyName] = myCharacterMaster.ステータス[myPropertyName][myLevelStr];
    //     }
    // });
}

/**
 * 
 * @param {string} type 武器タイプ
 * @param {string} name 武器名
 */
async function setupWeaponInput(type, name, characterInput) {
    const myWeaponMaster = await fetch(武器MasterVar[type][name]['import']).then(resp => resp.json());
    characterInput.weapon = name;
    characterInput.weaponMaster = myWeaponMaster;
    if (myWeaponMaster['レアリティ'] < 3) {
        characterInput['武器突破レベルOption'].max = 4;
        if (characterInput['武器突破レベル'] > 4) {
            characterInput['武器突破レベル'] = 4;
        }
    } else {
        characterInput['武器突破レベルOption'].max = 6;
    }
    if (name in 武器所持状況ObjVar && 武器所持状況ObjVar[name]) {
        characterInput['武器精錬ランク'] = 武器所持状況ObjVar[name];
    }
}

function updateStatusInputStatus(statusObj) {
    Object.keys(statusObj).forEach(stat => {
        if (stat in StatusInputVm.ステータス && StatusInputVm.ステータス[stat] == statusObj[stat]) return;
        StatusInputVm.ステータス[stat] = statusObj[stat];
    });
    calculateResult(CharacterInputVm, ConditionInputVm, OptionInputVm, StatusInputVm, CalculationResultVm);
}

function setupEnemyInput(name) {
}

