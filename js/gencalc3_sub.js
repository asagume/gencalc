// Vueのアプリケーションインスタンス*Vmを参照する関数はここに置こう

function makeSaveDataFromShareData(shareData) {
    const saveData = {};

    try {
        const shareDataArr = shareData.split(',');

        let character;

        let i = 0;
        キャラクター構成PROPERTY_MAP.forEach((value, key) => {
            let newValue = shareDataArr[i];
            switch (key) {
                case 'キャラクター':
                    Object.keys(キャラクターMasterVar).forEach(key2 => {
                        if ('import' in キャラクターMasterVar[key2]) {
                            const myBasename = basename(キャラクターMasterVar[key2]['import']);
                            const myAbbrev = myBasename.split('_')[myBasename.split('_').length - 1];
                            if (newValue == myAbbrev) {
                                character = key2;
                                newValue = character;
                            }
                        }
                    });
                    break;
                case '武器':
                    if (character) {
                        const my武器タイプ = キャラクターMasterVar[character]['武器'];
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

        return saveData;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

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
    let weapon = getDisplayName(recommendation[1]['武器']);
    let artifactSet = '';
    if (recommendation[1]['聖遺物セット効果1'] == recommendation[1]['聖遺物セット効果2']) {
        artifactSet += getDisplayName(recommendation[1]['聖遺物セット効果1'], 'en-us');
    } else {
        artifactSet += getDisplayName(recommendation[1]['聖遺物セット効果1'], 'en-us');
        artifactSet += '/';
        artifactSet += getDisplayName(recommendation[2]['聖遺物セット効果1'], 'en-us');
    }
    artifactSet = artifactSet.replace(/[a-z ]/, '');
    let stat = '';
    stat += recommendation[1]['聖遺物メイン効果3'] ? RECOMMEND_ABBREV_EN_MAP.get(recommendation[1]['聖遺物メイン効果3']) : '  ';
    stat += recommendation[1]['聖遺物メイン効果4'] ? RECOMMEND_ABBREV_EN_MAP.get(recommendation[1]['聖遺物メイン効果4']) : '  ';
    stat += recommendation[1]['聖遺物メイン効果5'] ? RECOMMEND_ABBREV_EN_MAP.get(recommendation[1]['聖遺物メイン効果5']) : '  ';
    return weapon + ' ' + artifactSet + ' [' + stat + ']';
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

    makeDamageDetailObjArrObjWeapon(characterInput);
}

/**
 * 
 * @param {Object} optionInput 
 */
function setupElementalResonanceOption(optionInput) {
    Object.keys(元素共鳴MasterVar).forEach(optionKey => {
        const damageDetailObj = makeDamageDetailObjArrObjOption(元素共鳴MasterVar[optionKey]);
        元素共鳴ダメージ詳細ObjMapVar.set(optionKey, damageDetailObj);
    });
}

/**
 * チームオプションを設定します.
 * 
 * @param {Object} optionInput 
 */
async function setupTeamOption(optionInput) {
    const supporterList = optionInput.supporterList;

    optionInput.teamConditionListCheckbox = {};
    optionInput.teamConditionListSelect = {};

    Object.keys(チームオプションMasterVar).forEach(optionKey => {
        const splittedKey = optionKey.split('_');
        const character = splittedKey[0];

        if (!supporterList.includes(character)) {
            supporterList.push(character);
        }

        setupTeamOptionSupporter(optionInput, character, optionKey);
    });

    console.debug(setupTeamOption.name, optionInput.teamConditionListCheckbox, optionInput.teamConditionListSelect);
    return optionInput;
}

/**
 * チームオプションを設定します（サポーター単位）.
 * 
 * @param {Object} optionInput 
 * @param {string} character 
 * @param {string} optionKey 
 */
async function setupTeamOptionSupporter(optionInput, character, optionKey) {
    if (!(character in optionInput.teamConditionListCheckbox)) {
        optionInput.teamConditionListCheckbox[character] = [];
    }
    if (!(character in optionInput.teamConditionListSelect)) {
        optionInput.teamConditionListSelect[character] = [];
    }
    const conditionListCheckbox = optionInput.teamConditionListCheckbox[character];
    const conditionListSelect = optionInput.teamConditionListSelect[character];
    const teamOptionConditionValues = optionInput.teamOptionConditionValues;

    if (!サポーターInputMapVar.has(character)) {
        サポーターInputMapVar.set(character, JSON.parse(JSON.stringify(SUPPORTER_INPUT_TEMPLATE)))
    }
    const supporterInput = サポーターInputMapVar.get(character);
    const characterInput = supporterInput.characterInput;
    const artifactDetailInput = supporterInput.artifactDetailInput;
    const conditionInput = supporterInput.conditionInput;

    characterInput.character = character;

    let recommendation = {};
    const storageKey = '構成_' + character;
    if (localStorage[storageKey]) {
        recommendation = JSON.parse(localStorage[storageKey]);
    }
    await loadRecommendation(characterInput, artifactDetailInput, conditionInput, recommendation);

    const damageDetailObjArrObj = makeDamageDetailObjArrObjOption(チームオプションMasterVar[optionKey], optionKey);
    チームオプションダメージ詳細ObjMapVar.set(optionKey, damageDetailObjArrObj);

    conditionListCheckbox.push(...makeConditionListCheckbox(damageDetailObjArrObj));
    conditionListSelect.push(...makeConditionListSelect(damageDetailObjArrObj));

    initializeConditionValues(teamOptionConditionValues, conditionListCheckbox);
    initializeConditionValues(teamOptionConditionValues, conditionListSelect);
}

/**
 * その他オプションを設定します.
 * 
 * @param {Object} optionInput 
 */
function setupMiscOption(optionInput) {
    Object.keys(オプション1MasterVar).forEach(optionKey => {
        const damageDetailObj = makeDamageDetailObjArrObjOption(オプション1MasterVar[optionKey], optionKey);
        その他オプションダメージ詳細ObjMapVar.set(optionKey, damageDetailObj);
    });
    Object.keys(オプション2MasterVar).forEach(optionKey => {
        const damageDetailObj = makeDamageDetailObjArrObjOption(オプション2MasterVar[optionKey], optionKey);
        その他オプションダメージ詳細ObjMapVar.set(optionKey, damageDetailObj);
    });
    console.log(setupMiscOption.name, その他オプションダメージ詳細ObjMapVar);
}

/**
 * 
 * @param {Object} statusAdjustment ステータス補正
 * @param {Object[]} conditionList 条件のリスト
 * @param {Object} conditionValues 現在の条件の値
 * @param {Object} damageDetailObjArrObjArr 
 * @param {Object} opt_statusObj 
 */
function calculateStatusAdjustmentFromArr(statusAdjustment, conditionList, conditionValues, damageDetailObjArrObjArr, opt_statusObj = {}) {
    const constellation = 6;

    const result = statusAdjustment;

    const validConditionValueArr = makeValidConditionValueArr2(conditionList, conditionValues);
    damageDetailObjArrObjArr.forEach(damageDetailObjArrObj => {
        if (!damageDetailObjArrObj) return;
        damageDetailObjArrObj[CHANGE_KIND_STATUS].filter(s => s['条件']).forEach(detailObj => {
            const checkRet = checkConditionMatches(detailObj['条件'], validConditionValueArr, constellation);
            if (checkRet == 0) return;
            let formulaArr = detailObj['数値'];
            if (checkRet != 1) formulaArr = formulaArr.concat(['*', checkRet]);
            const statValue = calculateFormulaArray(opt_statusObj, formulaArr, detailObj['上限']);
            if (detailObj['種類'] in result) {
                result[detailObj['種類']] += statValue;
            } else {
                result[detailObj['種類']] = statValue;
            }
        });
    });
}

/**
 * 
 * @param {Object} statusAdjustment ステータス補正
 * @param {Object[]} conditionList 条件のリスト
 * @param {Object} conditionValues 現在の条件の値
 * @param {Object} damageDetailObjArrObjMap 
 * @param {Object} opt_statusObj 
 */
function calculateStatusAdjustmentFromMap(statusAdjustment, conditionList, conditionValues, damageDetailObjArrObjMap, opt_statusObj = {}) {
    const constellation = 6;

    const result = statusAdjustment;

    const validConditionValueArr = makeValidConditionValueArr2(conditionList, conditionValues);
    damageDetailObjArrObjMap.forEach(damageDetailObj => {
        damageDetailObj[CHANGE_KIND_STATUS].filter(s => s['条件']).forEach(detailObj => {
            const checkRet = checkConditionMatches(detailObj['条件'], validConditionValueArr, constellation);
            if (checkRet == 0) return;
            let formulaArr = detailObj['数値'];
            if (checkRet != 1) formulaArr = formulaArr.concat(['*', checkRet]);
            console.log(formulaArr);
            const statValue = calculateFormulaArray(opt_statusObj, formulaArr, detailObj['上限']);
            if (detailObj['種類'] in result) {
                result[detailObj['種類']] += statValue;
            } else {
                result[detailObj['種類']] = statValue;
            }
        });
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
 * @returns {Object} 
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
 * @param {Object} enemyObj EnemyObject
 * @param {Object} statusInput ステータス情報Object
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
