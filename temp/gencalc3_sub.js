// Vueのアプリケーションインスタンス*Vmを参照する関数はここに置こう

/**
 * 
 * @param {string} name 
 * @param {string} opt_lang 
 * @returns {string}
 */
function getDisplayName(name, opt_lang = null) {
    if (!name) return '';
    if (isString(name) && name.indexOf('-') != -1) {
        return name.split('_').map(s => isNumber(s) ? s : getDisplayName(s)).join('_');
    }
    if (!opt_lang && (!辞書MasterVar || !LanguageSelectVm)) return getDisplayNameJaJp(name);
    let lang = opt_lang ? opt_lang : LanguageSelectVm.selected;
    if (lang === 'ja-jp') return getDisplayNameJaJp(name);
    if (name in 辞書MasterVar) {
        if (辞書MasterVar[name][lang]) {
            name = 辞書MasterVar[name][lang];
        } else if (lang !== 'en-us' && 辞書MasterVar[name]['en-us']) {
            name = 辞書MasterVar[name]['en-us'];
        }
    }
    return name;
}

/**
 * 
 * @param {string} name 
 * @returns {string}
 */
function getDisplayNameJaJp(name) {
    if (元素ステータス_ダメージARRAY.includes(name) || ダメージバフARRAY.includes(name)) {
        name = name.replace(/バフ$/, '');
    }
    return name;
}

/**
 * 
 * @param {[string, object, boolean]} recommendation 
 * @returns {string}
 */
function getDisplayBuildName(recommendation) {
    if (recommendation[2] || LanguageSelectVm.selected == 'ja-jp') return recommendation[0];
    const splitted = recommendation[0].split(' ');
    let weapon = splitted.shift();
    let artifactSet = splitted.shift();
    let stat = splitted.shift();
    weapon = getDisplayName(weapon);
    artifactSet = getDisplayName(artifactSet, 'en-us').replace(/[a-z ]/g, '');
    RECOMMEND_ABBREV_EN_REVERSE_MAP.forEach((value, key) => {
        stat = stat.replace(key, value);
    });
    let result = weapon + '+' + artifactSet + ' ' + stat;
    return result;
}

/**
 * 
 * @param {string} character キャラクター名
 */
async function setupCharacterInput(character, characterInput, artifactDetailInput, conditionInput, optionInput, statusInput) {
    if (!characterInput || !artifactDetailInput || !conditionInput || !optionInput || !statusInput) return;

    const characterMaster = await getCharacterMaster(character);

    if ('固有変数' in characterMaster) {
        Object.keys(characterMaster['固有変数']).forEach(key => {
            statusInput[key] = characterMaster['固有変数'][key];
        });
    }

    if ('オプション初期値' in characterMaster) {

    }

    const rarity = characterMaster['レアリティ'];
    const vision = characterMaster['元素'];
    const weaponType = characterMaster['武器'];

    const myRecommendationList = makeRecommendationList(characterMaster);
    const myRecommendation = myRecommendationList[0];

    characterInput.おすすめセットOption.list = myRecommendationList;
    characterInput.おすすめセット = myRecommendation[0];

    let ascension = characterInput.突破レベル;
    let level = characterInput.レベル;
    let constellation = 0;

    if ('レベル' in myRecommendation[1]) {
        level = Number(myRecommendation[1]['レベル'].replace('+', ''));
        for (ascension = 0; ascension < 突破レベルレベルARRAY.length; ascension++) {
            const max = 突破レベルレベルARRAY[ascension][突破レベルレベルARRAY[ascension].length - 1];
            if (level <= max) {
                break;
            }
        }
        if (myRecommendation[1]['レベル'].endsWith('+')) {
            ascension++;
        }
    }

    if (character in キャラクター所持状況Var) {
        constellation = キャラクター所持状況Var[character];
    }
    if (!constellation) {
        constellation = 0;
    }

    if ('命ノ星座' in characterMaster) {
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
        characterInput.元素スキルレベルOption.max = maxSkillLevel;
        characterInput.元素爆発レベルOption.max = maxBurstLevel;
    } else {
        characterInput.命ノ星座Option.max = 0;
        characterInput.元素スキルレベルOption.max = 10;
        characterInput.元素爆発レベルOption.max = 10;
    }

    characterInput.character = character;
    characterInput.characterMaster = characterMaster;
    characterInput.突破レベル = ascension;
    characterInput.レベル = level;
    characterInput.命ノ星座 = constellation;

    await loadRecommendation(myRecommendation[1], characterInput, artifactDetailInput, conditionInput, statusInput);

    if (WeaponSelectVm) {
        WeaponSelectVm.weapon = characterInput.weapon;
        WeaponSelectVm.type = weaponType;
    }

    await setupWeaponInput(weaponType, characterInput.weapon, CharacterInputVm);

    if (!conditionInput) {  //　苦し紛れ
        conditionInput = ConditionInputVm;
    }
    if (conditionInput) {
        conditionInput.character = character;
        conditionInput.characterMaster = characterMaster;
    }

    calculateArtifactStat(artifactDetailInput);
    calculateStatus(characterInput, artifactDetailInput, statusInput);
    calculateResult(characterInput, conditionInput, optionInput, statusInput, CalculationResultVm);
}

/**
 * 
 * @param {string} type 武器タイプ
 * @param {string} weapon 武器名
 */
async function setupWeaponInput(type, weapon, characterInput) {
    if (!characterInput) return;

    const weaponMaster = await fetch(武器MasterVar[type][weapon]['import']).then(resp => resp.json());
    WeaponSelectVm.master = weaponMaster;
    characterInput.weapon = weapon;
    characterInput.weaponMaster = weaponMaster;
    if (weaponMaster['レアリティ'] < 3) {
        characterInput['武器突破レベルOption'].max = 4;
        if (characterInput['武器突破レベル'] > 4) {
            characterInput['武器突破レベル'] = 4;
        }
    } else {
        characterInput['武器突破レベルOption'].max = 6;
    }
    if (weapon in 武器所持状況Var && 武器所持状況Var[weapon]) {
        characterInput['武器精錬ランク'] = 武器所持状況Var[weapon];
    }

    makeDamageDetailObjWeapon(characterInput);
}

function setupTeamOption() {
    const teamOptionSupporterOptions = {};

    Object.keys(チームオプションMasterVar).forEach(optionKey => {
        const splittedKey = optionKey.split('_');
        const character = splittedKey[0];

        const detailObj = チームオプションMasterVar[optionKey];
        if (isPlainObject(detailObj['数値'])) {

        } else if (Array.isArray(detailObj['数値'])) {

        }

        const buildNamePrefix = '構成_' + character;
        const buildData = Object.keys(localStorage).filter(s => s.startsWith(buildNamePrefix));
        if (buildData.length == 0) {
            return;
        }

    });
}

function updateStatusStatus(statusObj) {
    Object.keys(statusObj).forEach(stat => {
        if (stat in StatusInputVm.ステータス && StatusInputVm.ステータス[stat] == statusObj[stat]) return;
        StatusInputVm.ステータス[stat] = statusObj[stat];
    });
    calculateResult(CharacterInputVm, ConditionInputVm, OptionInputVm, StatusInputVm, CalculationResultVm);
}

/**
 * EnemyObjectを作成します.
 * 
 * @param {string} name 敵の名前
 * @returns {object} 
 */
function makeEnemyObj(name) {
    return {
        name: name,
        master: 敵MasterVar[name]
    };
}

/**
 * 敵ステータスを更新します.
 * 
 * @param {object} enemyObj EnemyObject
 * @param {object} statusInput ステータス情報Object
 */
function updateStatusEnemyStatus(enemyObj, statusInput) {
    if (!statusInput) return;

    statusInput.enemy = enemyObj;
    Object.keys(statusInput.enemy.master).forEach(stat => {
        statusInput.敵ステータス[stat] = statusInput.enemy.master[stat];
    });
    statusInput.敵ステータス['防御力'] = 0;
    if (statusInput.敵ステータス補正) {
        Object.keys(statusInput.敵ステータス補正).forEach(stat => {
            statusInput.敵ステータス[stat] += statusInput.敵ステータス補正[stat];
        });
    }
}
