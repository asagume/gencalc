async function onLoad(searchParams) {
    if (localStorage['キャラクター所持状況']) {
        キャラクター所持状況Var = JSON.parse(localStorage['キャラクター所持状況']);
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
    initialSetupCharacterInput();
    initialSetupStatusInput();
    initialSetupEnemyInput();
    initialSetupCalcurationResult();
}

function getCharacterByBirthday() {
    let result = null;
    const today = new Date();
    let curDiff = Number.MAX_SAFE_INTEGER;
    Object.keys(キャラクターMasterVar).forEach(key => {
        if ('誕生日' in キャラクターMasterVar[key]) {
            const birthdayStrArr = キャラクターMasterVar[key]['誕生日'].split('/');
            let birthday = new Date(today.getFullYear(), Number(birthdayStrArr[0]) - 1, Number(birthdayStrArr[1]), 0, 0, 0, 0);
            const diff = today.getTime() - birthday.getTime();
            if (diff < 0) return;
            if (diff < curDiff) {
                curDiff = diff;
                result = key;
            }
        }
    });
    return result;
}

function getStarBackgroundUrl(master) {
    return STAR_BACKGROUND_URL[master['レアリティ']];
}

function getElementImgSrc(master) {
    return ELEMENT_IMG_SRC[master['元素']];
}

function getColorClass(master) {
    return ELEMENT_BG_COLOR_CLASS[master['元素']];
}

function getBgColorClass(master) {
    return ELEMENT_COLOR_CLASS[master['元素']];
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
        methods: {
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
            onClick: function (event) {
                if (event.target.alt != this.selected) {
                    this.selected = event.target.alt;
                    setupCharacterInput(this.selected);
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
                master: {
                    名前: 'アンバー',
                    icon_url: DUMMY_IMG_SRC,
                    レアリティ: 4,
                    武器: '弓',
                    元素: '炎',
                    通常攻撃: {
                        名前: null,
                        icon_url: DUMMY_IMG_SRC
                    },
                    元素スキル: {
                        名前: null,
                        icon_url: DUMMY_IMG_SRC
                    },
                    元素爆発: {
                        名前: null,
                        icon_url: DUMMY_IMG_SRC
                    }
                },
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
                weaponMaster: {
                    名前: '西風猟弓',
                    icon_url: DUMMY_IMG_SRC,
                    レアリティ: 4
                },
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
                        master: {
                            'icon_url': DUMMY_IMG_SRC
                        }
                    },
                    {
                        名前: 'NONE',
                        master: {
                            'icon_url': DUMMY_IMG_SRC
                        }
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
            setupCharacterInput(character);
        },
        computed: {
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
                const max = 突破レベルレベルARR.length;
                return Array.from({ length: max }, (_, i) => i);
            },
            levelRange: function () {
                return 突破レベルレベルARR[this.突破レベル];
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
                const max = this.武器突破レベルOption.max;
                return Array.from({ length: max }, (_, i) => i);
            },
            weaponLevelRange: function () {
                return 突破レベルレベルARR[this.武器突破レベル];
            },
            weaponRefineRange: function () {
                const max = this.武器精錬ランクOption.max;
                return Array.from({ length: max }, (_, i) => i + 1);
            }
        },
        methods: {
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
            weaponOnClick: function () {

            },
            artifactSetOnClick: function (index) {

            },
            artifactDetailOnClick: function () {

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
        }
    }
    CharacterInputVm = Vue.createApp(CharacterInput).mount('#character-input');
}

async function initialSetupWeaponInput(type, name) {

}

function initialSetupArtifactInput() {

}

function initialSetupOptionInput(characterMaster) {

}

function initialSetupStatusInput(characterMaster) {
    const StatusInput = {
        data() {
            return {
                activeTab: '1',
                isEditable: true,
                ステータス: {
                    '基礎ステータス': JSON.parse(JSON.stringify(基礎ステータスTEMPLATE)),
                    '基本ステータス': JSON.parse(JSON.stringify(基本ステータスTEMPLATE)),
                    '高級ステータス': JSON.parse(JSON.stringify(高級ステータスTEMPLATE)),
                    '元素ステータス・ダメージ': JSON.parse(JSON.stringify(元素ステータス_ダメージTEMPLATE)),
                    '元素ステータス・耐性': JSON.parse(JSON.stringify(元素ステータス_耐性TEMPLATE)),
                    'ダメージバフ': JSON.parse(JSON.stringify(ダメージバフTEMPLATE)),
                    '実数ダメージ加算': JSON.parse(JSON.stringify(実数ダメージ加算TEMPLATE)),
                    '元素反応バフ': JSON.parse(JSON.stringify(元素反応バフTEMPLATE)),
                    'その他': JSON.parse(JSON.stringify(ステータスその他TEMPLATE))
                },
                ステータス補正: {},
                isステータスOpened: {},
                補正値0初期化Enabled: false,
                敵: null,
                敵List: [],
                敵レベル: 90,
                敵ステータス: JSON.parse(JSON.stringify(元素ステータス_耐性TEMPLATE)),
                敵ステータス補正: {},
                敵防御力: 0
            }
        },
        created() {
            Object.keys(this.ステータス).forEach(category => {
                this.ステータス補正[category] = {};
                Object.keys(this.ステータス[category]).forEach(stat => {
                    this.ステータス補正[category][stat] = 0;
                });
            });
            Object.keys(this.ステータス).forEach(key => {
                this.isステータスOpened[key] = false; // close
            });
            Object.keys(this.敵ステータス).forEach(stat => {
                this.敵ステータス補正[stat] = 0;
            });
        },
        computed: {
            isCategoryDisp: function (category) {
                let result = false;
                Object.keys(this.ステータス[category]).forEach(stat => {
                    if (this.ステータス[category][stat]) {
                        result = true;
                    }
                });
                return result;
            }
        },
        methods: {
            statList: function (category) {
                return Object.keys(this.ステータス[category]).filter(s => this.isステータスOpened[category] || this.ステータス[category][s]);
            },
            getDisplayName(name) {
                return name;
            }
        }
    };
    StatusInputVm = Vue.createApp(StatusInput).mount('#status-input');
}

function initialSetupEnemyInput() {

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
            getClassByElement(element) {
                return ELEMENT_COLOR_CLASS[element];
            },
            getDisplayName(name) {
                name = name.replace(/ダメージ$/, '');
                name = name.replace(/の$/, '');
                return name;
            }
        }
    };
    CalculationResultVm = Vue.createApp(CalculationResult).mount('#calculation-result');
}

/**
 * 
 * @param {string} name キャラクター名
 */
async function setupCharacterInput(name) {
    let myCharacterMaster = null;
    if (!キャラクター詳細MasterMapVar.has(name)) {
        const url = キャラクターMasterVar[name]['import'];
        const json = await fetch(url).then(resp => resp.json());
        キャラクター詳細MasterMapVar.set(name, json);
    }
    myCharacterMaster = キャラクター詳細MasterMapVar.get(name);

    const myRarity = myCharacterMaster['レアリティ'];
    const myVision = myCharacterMaster['元素'];
    const myWeaponType = myCharacterMaster['武器'];

    let myAscension = 6;        // 突破レベル
    let myLevel = 90;           // レベル
    let myConstellation = 0;    // 命ノ星座
    if (name in キャラクター所持状況Var) {
        myConstellation = キャラクター所持状況Var[name];
    }

    CharacterInputVm.おすすめセットOption.list = makeRecommendationList(myCharacterMaster);


    let myRecommend = myCharacterMaster.おすすめセット;

    const savedKeyArr = Object.keys(localStorage).filter(s => s.startsWith('構成_' + name));
    if (savedKeyArr.length > 0) {

    }

    if ('命ノ星座' in myCharacterMaster) {
        let maxSkillLevel = 10;
        let maxBurstLevel = 10;
        let mySkillName = myCharacterMaster.元素スキル.名前;
        let myBurstName = myCharacterMaster.元素爆発.名前;
        Object.keys(myCharacterMaster.命ノ星座).forEach(key => {
            if (myConstellation < Number(key)) return;
            if ('名前' in myCharacterMaster.命ノ星座[key]) {
                if (myCharacterMaster.命ノ星座[key]['名前'].indexOf(mySkillName) != -1) {
                    maxSkillLevel = 13;
                }
                if (myCharacterMaster.命ノ星座[key]['名前'].indexOf(myBurstName) != -1) {
                    maxBurstLevel = 13;
                }
            }
        });
        CharacterInputVm.元素スキルレベルOption.max = maxSkillLevel;
        CharacterInputVm.元素爆発レベルOption.max = maxBurstLevel;
    } else {
        CharacterInputVm.元素スキルレベルOption.max = 10;
        CharacterInputVm.元素爆発レベルOption.max = 10;
    }

    CharacterInputVm.name = name;
    CharacterInputVm.master = myCharacterMaster;
    CharacterInputVm.突破レベル = myAscension;
    CharacterInputVm.レベル = myLevel;
    CharacterInputVm.命ノ星座 = myConstellation;

    let myLevelStr = myLevel;
    if (突破レベルレベルARR[myAscension][0] == myLevel) {
        myLevelStr += '+';
    }

    StatusInputVm.基礎ステータス.基礎HP = myCharacterMaster.ステータス.基礎HP[myLevelStr];
    StatusInputVm.基礎ステータス.基礎攻撃力 = myCharacterMaster.ステータス.基礎攻撃力[myLevelStr];
    StatusInputVm.基礎ステータス.基礎防御力 = myCharacterMaster.ステータス.基礎防御力[myLevelStr];

    const myPropertyName = Object.keys(myCharacterMaster.ステータス).filter(s => !s.startsWith('基礎'))[0];
    ['高級ステータス', 'その他ステータス'].forEach(key => {
        if (myPropertyName in StatusInputVm[key]) {
            StatusInputVm[key][myPropertyName] = myCharacterMaster.ステータス[myPropertyName][myLevelStr];
        }
    });

}

function makeRecommendationList(characterMaster) {
    const result = [];

    const myCharacterName = characterMaster['名前'];
    let isSavable = null;

    // if (URIキャラクター構成ObjVar) {
    //     if (myCharacterName == URIキャラクター構成ObjVar['キャラクター']) {
    //         おすすめセットArrVar.push(['IMPORTED DATA', URIキャラクター構成ObjVar, false]);
    //         isSavable = true;
    //     }
    // }

    let storageKeyArr = [];
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('構成_' + myCharacterName)) {
            storageKeyArr.push(key);
            if (isSavable == null) {
                isSavable = false;
            }
        }
    });
    storageKeyArr.sort();
    const re = new RegExp('^構成_' + myCharacterName + '_');
    storageKeyArr.forEach(key => {
        let setName;
        if (key == '構成_' + myCharacterName) {
            setName = 'あなたの' + myCharacterName;
        } else {
            setName = key.replace(re, '');
        }
        result.push([setName, JSON.parse(localStorage[key]), true]);
    });

    characterMaster['おすすめセット'].forEach(obj => {
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
        result.push([setName, myおすすめセット, false]);
    });
    return result;
}

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
 * 
 * @param {string} type 武器タイプ
 * @param {string} name 武器名
 */
async function setupWeaponInput(type, name) {

}

async function setupArtifactSetInput(name) {
    const ArtifactSetInput = {
        data() {
            return {
                set: [
                    {
                        名前: 'NONE',
                        master: null,
                        セット効果: null
                    },
                    {
                        名前: 'NONE',
                        master: null,
                        セット効果: null
                    }
                ]
            }
        },
        created() {
            this.set[0].master = 聖遺物セット効果MasterVar[this.set[0]['名前']];
            this.set[1].master = 聖遺物セット効果MasterVar[this.set[1]['名前']];
            if ('2セット効果' in this.set[0].master) {
                set[0]['セット効果'] = this.set[0].master['2セット効果']
            }
            if (this.set[0]['名前'] == this.set[1]['名前']) {
                if ('4セット効果' in this.set[1].master) {
                    set[1]['セット効果'] = this.set[1].master['4セット効果']['説明']
                }
            } else {
                if ('2セット効果' in this.set[1].master) {
                    set[1]['セット効果'] = this.set[1].master['2セット効果']['説明']
                }
            }
        },
        methods: {
            onChange: function (set) {

            }
        }
    };

}

function setupEnemyInput(name) {
    const EnemyInput = {
        data() {
            return {
                名前: name,
                レベル: 90,
                ステータス: null,
                ステータス補正: null,
                防御力: 0,
                list: []
            }
        },
        created() {
            this.list = Object.keys(敵MasterVar).map(name => {
                return {
                    名前: name,
                    ステータス: 敵MasterVar[name]
                }
            });
            this.ステータス = JSON.parse(JSON.stringify(敵MasterVar[name]));
            this.ステータス補正 = JSON.parse(JSON.stringify(元素ステータス_耐性TEMPLATE));
        }
    };
    EnemyInputVm = Vue.createApp(EnemyInput).mount('#enemy-input');
}
