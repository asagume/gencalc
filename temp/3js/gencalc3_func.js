//// @ts-check

///<reference path="./gencalc3_var.js"/>
///<reference path="./gencalc3_core.js"/>

/**
 * 直近に誕生日を迎えたキャラクターを取得します.
 *
 * @returns {string} キャラクターの名前
 */
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

/**
 * おすすめセットのリストを作成します.
 * 
 * @param {Object} characterMaster キャラクターマスター
 * @returns {[string, object, boolean][]} おすすめセットのリスト
 */
function makeRecommendationList(characterMaster, opt_buildData = null) {
    const result = [];

    const character = characterMaster['名前'];
    let isSavable = null;

    if (opt_buildData) {
        result.push({ name: 'IMPORTED DATA', build: opt_buildData, overwrite: false });
        isSavable = true;
    }

    let storageKeyArr = [];
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('構成_' + character)) {
            storageKeyArr.push(key);
            if (isSavable == null) {
                isSavable = false;
            }
        }
    });
    storageKeyArr.sort();
    const re = new RegExp('^構成_' + character + '_');
    storageKeyArr.forEach(key => {
        let buildname;
        if (key == '構成_' + character) {
            buildname = 'あなたの' + character;
        } else {
            buildname = key.replace(re, '');
        }
        result.push({ name: buildname, build: JSON.parse(localStorage[key]), overwrie: true });
    });

    characterMaster['おすすめセット'].forEach(obj => {
        let myおすすめセット = obj;
        ['聖遺物優先するサブ効果1', '聖遺物優先するサブ効果2', '聖遺物優先するサブ効果3'].forEach(stat => {
            if (!(stat in obj)) {
                obj[stat] = null;
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

        let buildname = myおすすめセット['武器'];
        buildname += ' ';
        if (myおすすめセット['聖遺物セット効果1'] == myおすすめセット['聖遺物セット効果2']) {
            buildname += myおすすめセット['聖遺物セット効果1'];
        } else {
            buildname += makeArtifactSetAbbrev(myおすすめセット['聖遺物セット効果1']);
            buildname += '/';
            buildname += makeArtifactSetAbbrev(myおすすめセット['聖遺物セット効果2']);
        }
        buildname += ' [';
        for (let i = 3; i <= 5; i++) {
            const statusName = myおすすめセット['聖遺物メイン効果' + i].split('_')[1];
            if (RECOMMEND_ABBREV_MAP.has(statusName)) {
                buildname += RECOMMEND_ABBREV_MAP.get(statusName);
            } else {
                buildname += statusName.substring(0, 1);
            }
        }
        buildname += ']';
        result.push({ name: buildname, build: myおすすめセット, overwrite: false });
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
 * @param {Object} characterInput キャラクター,武器,聖遺物セット効果
 * @param {Object} artifactDetailInput 聖遺物詳細[メイン効果,サブ効果,ステータス]
 * @param {Object} conditionInput 
 * @param {Object} recommendation 
 */
async function loadRecommendation(characterInput, artifactDetailInput, conditionInput, recommendation) {
    try {
        const character = characterInput.character;
        const characterMaster = await getCharacterMaster(character);
        characterInput.characterMaster = characterMaster;

        if ('レベル' in recommendation) {
            [characterInput.突破レベル, characterInput.レベル] = parseLevelStr(recommendation['レベル']);
        }
        ['命ノ星座', '通常攻撃レベル', '元素スキルレベル', '元素爆発レベル'].forEach(key => {
            if (key in recommendation) {
                characterInput[key] = recommendation[key];
            }
        });

        const weaponType = characterMaster['武器'];
        if ('武器' in recommendation) {
            characterInput.weapon = recommendation['武器'];
            characterInput.weaponMaster = await getWeaponMaster(weaponType, characterInput.weapon);
        }
        if ('武器レベル' in recommendation) {
            [characterInput.武器突破レベル, characterInput.武器レベル] = parseLevelStr(recommendation['武器レベル']);
        }
        if ('精錬ランク' in recommendation) {
            characterInput.武器精錬ランク = recommendation['精錬ランク'];
        }

        ['聖遺物セット効果1', '聖遺物セット効果2'].forEach((key, index) => {
            if (!(key in recommendation)) return;
            const artifactSet = recommendation[key];
            characterInput['聖遺物セット効果'][index]['名前'] = artifactSet;
            if (artifactSet && artifactSet in 聖遺物セット効果MasterVar) {
                characterInput['聖遺物セット効果'][index].master = 聖遺物セット効果MasterVar[artifactSet];
            } else {
                characterInput['聖遺物セット効果'][index].master = ARTIFACT_SET_MASTER_DUMMY;
            }
        });
        ['聖遺物メイン効果1', '聖遺物メイン効果2'].forEach((key, index) => {
            if (!(key in recommendation)) return;
            let mainStat = recommendation[key];
            if (!mainStat) {
                mainStat = ['5_HP', '5_攻撃力'][index];
            }
            artifactDetailInput['聖遺物メイン効果'][index] = mainStat;
        });
        ['聖遺物メイン効果3', '聖遺物メイン効果4', '聖遺物メイン効果5'].forEach((key, index) => {
            if (!(key in recommendation)) return;
            const mainstat = recommendation[key];
            artifactDetailInput['聖遺物メイン効果'][index + 2] = mainstat;
        });
        ['聖遺物優先するサブ効果1', '聖遺物優先するサブ効果2', '聖遺物優先するサブ効果3'].forEach((key, index) => {
            if (!(key in recommendation)) return;
            const substat = recommendation[key];
            artifactDetailInput['聖遺物優先するサブ効果'][index] = substat;
        });
        let hasSubstat = false;
        Object.keys(recommendation).filter(s => s.startsWith('聖遺物サブ効果')).forEach(key => {
            let stat = key.replace(/^聖遺物サブ効果/, '');
            if (stat in 聖遺物ステータスTEMPLATE) {
                // nop
            } else {
                stat = stat.replace(/P$/, '%');
            }
            artifactDetailInput['聖遺物ステータス'][stat] = Math.round(recommendation[key] * 10) / 10;
            hasSubstat = true;
        });
        artifactDetailInput.isステータス計算無効 = hasSubstat;

        makeDamageDetailObjArrObjCharacter(characterInput);
        makeDamageDetailObjArrObjWeapon(characterInput);
        makeDamageDetailObjArrObjArtifactSet(characterInput);
    }
    catch (error) {
        console.error(characterInput, artifactDetailInput, conditionInput, recommendation);
        throw error;
    }
}

/**
 * 
 * @param {number} ascension 突破レベル
 * @param {number} level レベル
 * @returns {string}
 */
function getLevelStr(ascension, level) {
    return level + 突破レベルレベルARRAY[ascension][0] == level ? '+' : '';
}

/**
 * 
 * @param {string} levelStr 
 * @returns {[number, number]}
 */
function parseLevelStr(levelStr) {
    try {
        let level = levelStr;
        if (isString(level)) {
            level = Number(level.replace('+', ''));
        }
        let ascension;
        for (let i = 突破レベルレベルARRAY.length - 1; i >= 0; i--) {
            if (突破レベルレベルARRAY[i][0] < level) continue;
            if (突破レベルレベルARRAY[i][突破レベルレベルARRAY[i].length - 1] > level) continue;
            ascension = i;
            if (levelStr.endsWith('+')) {
                ascension++;
            }
            break;
        }
        return [ascension, level];
    } catch (error) {
        console.error(levelStr);
        throw error;
    }
}

/**
 * 変化の起点
 * - キャラクター
 * - 突破レベル
 * - 命ノ星座
 * - 通常攻撃レベル
 * - 元素スキルレベル
 * - 元素爆発レベル
 * 
 * @param {Object} characterInput 
 * @param {Object} conditionInput 
 * @returns 
 */
function makeDamageDetailObjArrObjCharacter(characterInput, conditionInput) {
    try {
        const character = characterInput.character;
        const characterMaster = characterInput.characterMaster;

        const result = {};

        let myTalentDetail;
        let myTalentLevel;
        let myDefaultKind;
        let myDefaultElement;
        let myInputCategory = 'キャラクター';

        const myStatusChangeDetailObjArr = [];
        const myTalentChangeDetailObjArr = [];

        // 通常攻撃 重撃 落下攻撃
        myTalentLevel = characterInput['通常攻撃レベル'];
        myDefaultElement = characterMaster['武器'] === '法器' ? characterMaster['元素'] : null;
        ['通常攻撃', '重撃', '落下攻撃'].forEach(category => {
            myTalentDetail = characterMaster[category];
            myDefaultKind = category + 'ダメージ';
            result[category] = makeDamageDetailObjArr(myTalentDetail, myTalentLevel, myDefaultKind, myDefaultElement, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);
        });

        ['通常攻撃', '重撃', '落下攻撃'].forEach(category => {
            let workCategory = '特殊' + category;
            if (workCategory in characterMaster) {
                myTalentDetail = characterMaster[workCategory];
                if ('種類' in myTalentDetail) {
                    myDefaultKind = myTalentDetail['種類'];
                    switch (myDefaultKind) {
                        case '元素スキルダメージ':
                            myTalentLevel = characterInput['元素スキルレベル'];
                            break;
                        case '元素爆発ダメージ':
                            myTalentLevel = characterInput['元素爆発レベル'];
                            break;
                    }
                }
                if ('元素' in myTalentDetail) {
                    myDefaultElement = myTalentDetail['元素'];
                }
                const workObj = {
                    条件: myTalentDetail['条件'],
                    詳細: makeDamageDetailObjArr(myTalentDetail, myTalentLevel, myDefaultKind, myDefaultElement, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory)
                };
                result[workCategory] = workObj;
            }
        });

        // 元素スキル
        myTalentLevel = characterInput['元素スキルレベル'];
        myDefaultKind = '元素スキルダメージ';
        myDefaultElement = characterMaster['元素'];
        result['元素スキル'] = makeDamageDetailObjArr(characterMaster['元素スキル'], myTalentLevel, myDefaultKind, myDefaultElement, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);

        // 元素爆発
        myTalentLevel = characterInput['元素爆発レベル'];
        myDefaultKind = '元素爆発ダメージ';
        myDefaultElement = characterMaster['元素'];
        result['元素爆発'] = makeDamageDetailObjArr(characterMaster['元素爆発'], myTalentLevel, myDefaultKind, myDefaultElement, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);

        // その他戦闘天賦
        if ('その他戦闘天賦' in characterMaster) {
            characterMaster['その他戦闘天賦'].forEach(myTalentDetail => {
                let workArr = [];
                if ('その他' in result) {
                    workArr = result['その他'];
                }
                workArr.concat(makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory));
                result['その他'] = workArr;
            });
        }

        // 固有天賦
        characterMaster['固有天賦'].forEach(myTalentDetail => {
            let workArr = [];
            if ('その他' in result) {
                workArr = result['その他'];
            }
            workArr.concat(makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory));
            result['その他'] = workArr;
        });

        // 命ノ星座
        if ('命ノ星座' in characterMaster) {
            Object.keys(characterMaster['命ノ星座']).forEach(key => {
                myTalentDetail = characterMaster['命ノ星座'][key];
                if ('詳細' in myTalentDetail) {
                    myTalentDetail['詳細'].forEach(detailObj => {
                        if ('条件' in detailObj && detailObj['条件']) {
                            if (detailObj['条件'].indexOf('命ノ星座') == -1) {
                                detailObj['条件'] = '命ノ星座@' + key + '&' + detailObj['条件'];
                            }
                        } else {
                            detailObj['条件'] = '命ノ星座@' + key;
                        }
                    });
                }
                let workArr = [];
                if ('その他' in result) {
                    workArr = result['その他'];
                }
                workArr.concat(makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory));
                result['その他'] = workArr;
            });
        }

        // 風元素キャラクター
        if (characterMaster['元素'] == '風') {
            ['炎元素', '水元素', '雷元素', '氷元素'].forEach(cond => {
                myTalentChangeDetailObjArr.push({
                    名前: null,
                    種類: '固有変数',
                    元素: null,
                    数値: null,
                    条件: '拡散@' + cond,
                    対象: null,
                    上限: null,
                    HIT数: null,
                    ダメージバフ: null,
                    元素付与無効: null,
                    除外条件: null,
                    適用条件: null
                });
            });
        }

        result[CHANGE_KIND_STATUS] = myStatusChangeDetailObjArr;
        result[CHANGE_KIND_TALENT] = myTalentChangeDetailObjArr;

        const conditionMap = new Map();
        const exclusionMap = new Map();
        myStatusChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            makeConditionExclusionMapFromStr(detailObj['条件'], conditionMap, exclusionMap);
        });
        myTalentChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            makeConditionExclusionMapFromStr(detailObj['条件'], conditionMap, exclusionMap);
        });
        conditionMap.delete('命ノ星座');
        result['条件'] = conditionMap;
        result['排他'] = exclusionMap;

        キャラクターダメージ詳細ObjMapVar.set(character, result);
        // console.debug(makeDamageDetailObjCharacter.name, character, result);
        return result;
    } catch (error) {
        console.log(characterInput, conditionInput);
        throw error;
    }
}

/**
 * 変化の起点
 * - 武器
 * - 武器精錬ランク
 * 
 * @param {Object} characterInput 
 * @param {Object} conditionInput 
 * @returns 
 */
function makeDamageDetailObjArrObjWeapon(characterInput, conditionInput) {
    try {
        const name = characterInput.weapon;
        const weaponMaster = characterInput.weaponMaster;

        const result = {};

        if (!name || !weaponMaster) return result;

        let myTalentDetail;
        let myLevel = characterInput.武器精錬ランク;
        let myInputCategory = '武器';

        const myStatusChangeDetailObjArr = [];
        const myTalentChangeDetailObjArr = [];

        if ('武器スキル' in weaponMaster) {
            myTalentDetail = weaponMaster['武器スキル'];
            result['武器'] = makeDamageDetailObjArr(myTalentDetail, myLevel, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);
        }

        result[CHANGE_KIND_STATUS] = myStatusChangeDetailObjArr;
        result[CHANGE_KIND_TALENT] = myTalentChangeDetailObjArr;

        const conditionMap = new Map();
        const exclusionMap = new Map();
        myStatusChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            let condition = detailObj['条件'];
            if (isPlainObject(condition) && myLevel in condition) {
                condition = condition[myLevel];
            }
            makeConditionExclusionMapFromStr(condition, conditionMap, exclusionMap);
        });
        myTalentChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            let condition = detailObj['条件'];
            if (isPlainObject(condition) && myLevel in condition) {
                condition = condition[myLevel];
            }
            makeConditionExclusionMapFromStr(condition, conditionMap, exclusionMap);
        });
        result['条件'] = conditionMap;
        result['排他'] = exclusionMap;

        武器ダメージ詳細ObjMapVar.set(name, result);
        // console.debug(makeDamageDetailObjWeapon.name, name, result);
        return result;
    } catch (error) {
        console.log(characterInput, conditionInput);
        throw error;
    }
}

/**
 * 変化の起点
 * - 聖遺物セット効果
 * 
 * @param {Object} characterInput 
 * @param {Object} conditionInput 
 * @returns 
 */
function makeDamageDetailObjArrObjArtifactSet(characterInput, conditionInput) {
    try {
        const result = [];

        let myTalentDetail;
        let myInputCategory = '聖遺物セット効果';

        characterInput.聖遺物セット効果.forEach(artifactSet => {
            const name = artifactSet.名前;
            const master = artifactSet.master;
            if (!(name in 聖遺物セット効果MasterVar)) {
                result.push({});
                return;
            }
            if (聖遺物セット効果ダメージ詳細ObjMapVar.has(name)) {
                result.push(聖遺物セット効果ダメージ詳細ObjMapVar.get(name));
                return;
            }

            const damageDetailObj = {};
            const myStatusChangeDetailObjArr = [];
            const myTalentChangeDetailObjArr = [];

            ['2セット効果', '4セット効果'].forEach(setEffect => {
                if (!(setEffect in master)) return;
                const workObj = {};
                myTalentDetail = master[setEffect];
                workObj[setEffect] = makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);

                workObj[CHANGE_KIND_STATUS] = myStatusChangeDetailObjArr;
                workObj[CHANGE_KIND_TALENT] = myTalentChangeDetailObjArr;

                const conditionMap = new Map();
                const exclusionMap = new Map();
                myStatusChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
                    makeConditionExclusionMapFromStr(detailObj['条件'], conditionMap, exclusionMap);
                });
                myTalentChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
                    makeConditionExclusionMapFromStr(detailObj['条件'], conditionMap, exclusionMap);
                });
                workObj['条件'] = conditionMap;
                workObj['排他'] = exclusionMap;

                damageDetailObj[setEffect] = workObj;
            });

            result.push(damageDetailObj);
            聖遺物セット効果ダメージ詳細ObjMapVar.set(name, damageDetailObj);
        });

        return result;
    } catch (error) {
        console.log(characterInput, conditionInput);
        throw error;
    }
}

/**
 * 
 * @param {Object} talentDetail 
 * @param {string} opt_condition 条件なしの場合に設定する条件
 * @returns {Object}
 */
function makeDamageDetailObjArrObjOption(talentDetail, opt_condition = null) {
    const result = {};

    const myInputCategory = 'オプション';

    const myStatusChangeDetailObjArr = [];
    const myTalentChangeDetailObjArr = [];

    result['オプション'] = makeDamageDetailObjArr(talentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory, opt_condition);

    result[CHANGE_KIND_STATUS] = myStatusChangeDetailObjArr;
    result[CHANGE_KIND_TALENT] = myTalentChangeDetailObjArr;

    const conditionMap = new Map();
    const exclusionMap = new Map();
    myStatusChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
        let condition = detailObj['条件'];
        makeConditionExclusionMapFromStr(condition, conditionMap, exclusionMap);
    });
    myTalentChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
        let condition = detailObj['条件'];
        makeConditionExclusionMapFromStr(condition, conditionMap, exclusionMap);
    });
    result['条件'] = conditionMap;
    result['排他'] = exclusionMap;

    return result;
}

/**
 * 
 * @param {Object} talentDataObj 
 * @param {string} level 天賦レベル
 * @param {string} defaultKind デフォルト種類
 * @param {string} defaultElement デフォルト元素
 * @param {any[]} statusChangeDetailObjArr 
 * @param {any[]} talentChangeDetailObjArr 
 * @param {string} inputCategory 
 * @param {string} opt_condition 条件なしの場合に設定する条件
 * @returns {Object[]}
 */
const makeDamageDetailObjArr = function (talentDataObj, level, defaultKind, defaultElement, statusChangeDetailObjArr, talentChangeDetailObjArr, inputCategory, opt_condition = null) {
    let resultArr = [];
    if (!('詳細' in talentDataObj)) return resultArr;

    talentDataObj['詳細'].forEach(detailObj => {
        let my種類 = '種類' in detailObj ? detailObj['種類'] : defaultKind;
        let my対象 = null;
        if (my種類.indexOf('.') != -1) {
            my対象 = my種類.substring(my種類.indexOf('.') + 1);
            my種類 = my種類.substring(0, my種類.indexOf('.'));
        } else if ('対象' in detailObj) {
            my対象 = detailObj['対象'];
        }
        let my数値 = null;
        if ('数値' in detailObj) {
            my数値 = detailObj['数値'];
            if (isNumber(my数値) || isString(my数値)) {
                // nop
            } else if (isPlainObject(my数値) && level && level in my数値) { // キャラクター|武器のサブステータス
                my数値 = my数値[level];
            } else {
                console.error(talentDataObj, level, defaultKind, defaultElement, my数値);
            }
            if (DAMAGE_CATEGORY_ARRAY.includes(my種類 + 'ダメージ') || my種類.endsWith('ダメージ')) {
                my数値 = analyzeFormulaStr(my数値, '攻撃力');
            } else {
                my数値 = analyzeFormulaStr(my数値, my種類);
            }
        }
        let my条件 = null;
        if ('条件' in detailObj) {
            if (isPlainObject(detailObj['条件']) && level && level in detailObj['条件']) {  // 武器は精錬ランクによって数値を変えたいときがあるので
                my条件 = detailObj['条件'][level];
            } else {
                my条件 = detailObj['条件'];
            }
        } else {
            my条件 = opt_condition;
        }
        let my上限 = null;
        if ('上限' in detailObj) {
            my上限 = detailObj['上限'];
            if (isPlainObject(my上限) && level && level in my上限) {   // 草薙の稲光
                my上限 = my上限[level];
            }
            my上限 = analyzeFormulaStr(my上限);
        }
        let resultObj = {
            名前: detailObj['名前'],
            種類: my種類,
            元素: '元素' in detailObj ? detailObj['元素'] : defaultElement,
            数値: my数値,
            条件: my条件,
            対象: my対象,
            上限: my上限,
            HIT数: 'HIT数' in detailObj ? detailObj['HIT数'] : null,
            ダメージバフ: 'ダメージバフ' in detailObj ? detailObj['ダメージバフ'] : null,
            元素付与無効: '元素付与無効' in detailObj ? detailObj['元素付与無効'] : inputCategory == '武器',
            除外条件: '除外条件' in detailObj ? detailObj['除外条件'] : null,
            適用条件: '適用条件' in detailObj ? detailObj['適用条件'] : null
        }
        if (statusChangeDetailObjArr != null) {
            if (resultObj['種類'] in ステータスTEMPLATE
                || resultObj['種類'].endsWith('%')
                || new RegExp('[自全].+バフ').exec(resultObj['種類'])
                || new RegExp('敵?[自全]元素耐性').exec(resultObj['種類'])
                || resultObj['種類'] == '別枠乗算'
                || ['継続時間', '発動回数', 'クールタイム', '使用回数'].includes(my種類)
            ) {
                resultObj['元素'] = '元素' in detailObj ? detailObj['元素'] : null;
                statusChangeDetailObjArr.push(resultObj);
                return;
            }
        }
        if (talentChangeDetailObjArr != null) {
            if (resultObj['種類'].endsWith('強化')
                || resultObj['種類'].endsWith('付与')
                || resultObj['種類'].endsWith('アップ')
                || resultObj['種類'] == '防御無視' ||
                resultObj['種類'] == '固有変数') {   // ex.元素爆発強化,氷元素付与
                resultObj['元素'] = '元素' in detailObj ? detailObj['元素'] : null;
                talentChangeDetailObjArr.push(resultObj);
                return;
            }
        }
        resultArr.push(resultObj);
    });
    return resultArr;
}

/**
 * 
 * @param {Object} artifactDetailInput 
 * @param {boolean} opt_priority 
 * @returns {Object}
 */
function calculateArtifactStat(artifactDetailInput, opt_priority = true) {
    if (!artifactDetailInput) return;
    const result = JSON.parse(JSON.stringify(聖遺物ステータスTEMPLATE));

    artifactDetailInput['聖遺物メイン効果'].filter(s => s).forEach(mainStat => {
        const splitted = mainStat.split('_');
        const rarity = splitted[0];
        const stat = splitted[1];
        if (!(stat in result)) {
            result[stat] = 0;
        }
        result[stat] += 聖遺物メイン効果MasterVar[rarity][stat];
    });

    if (opt_priority) {
        calculateArtifactSubStatByPriority(result, artifactDetailInput);
    }

    if ('聖遺物ステータス' in artifactDetailInput) {
        artifactDetailInput['聖遺物ステータス'] = result;
    }

    return result;
}

/**
 * 
 * @param {Object} result 
 * @param {Object} artifactDetailInput 
 */
function calculateArtifactSubStatByPriority(result, artifactDetailInput) {
    for (let i = 0; i < 3; i++) {
        const subStat = artifactDetailInput['聖遺物優先するサブ効果'][i];
        if (!subStat) continue;
        const subStatValue = artifactDetailInput['聖遺物優先するサブ効果上昇値'][i];
        if (!subStatValue) continue;
        const subStatCount = artifactDetailInput['聖遺物優先するサブ効果上昇回数'][i];
        if (!subStatCount) continue;
        result[subStat] += subStatValue * subStatCount;
    }

    const PRIORITY_SUBSTAT_ARR = [
        '会心率',
        '会心ダメージ',
        '元素チャージ効率',
        '元素熟知',
        '攻撃力%',
        'HP%',
        '防御力%',
        '攻撃力',
        'HP',
        '防御力'
    ].filter(s => !artifactDetailInput['聖遺物優先するサブ効果'].includes(s));
    let noPriorityCount = artifactDetailInput.totalCount;
    noPriorityCount -= artifactDetailInput['聖遺物優先するサブ効果上昇回数'].reduce((sum, e) => sum + e);
    for (let i = noPriorityCount; i > 0; i--) {
        const subStat = PRIORITY_SUBSTAT_ARR[i % PRIORITY_SUBSTAT_ARR.length];
        result[subStat] += 聖遺物サブ効果MasterVar[subStat][3];
    }
}

/**
 * 「条件」からオプション表示用の情報を作成します
 * {条件名}
 * {条件名}@{条件値}
 * {条件名}@{条件値:START}-{条件値:END} ←この形式の場合条件値で倍率がかかります
 * {条件名}@{条件値1},{条件値2},...     ←この形式の場合条件値で倍率がかかります
 * {上記}^{排他条件名}
 * 
 * @param {string} conditionStr 条件文字列
 * @param {Map} conditionMap オプション条件Map
 * @param {Map} exclusionMap オプション排他Map
 */
const makeConditionExclusionMapFromStr = function (conditionStr, conditionMap, exclusionMap) {
    // 排他条件を抽出します
    let exclusionCond = null;
    let myCondStrArr = conditionStr.split('^');
    if (myCondStrArr.length > 1) {
        exclusionCond = myCondStrArr[1];
    }
    let myCondStr = myCondStrArr[0];
    if (myCondStr.indexOf('|') != -1) {
        // OR条件 for 申鶴
        myCondStrArr = myCondStr.split('|');
        myCondStrArr.forEach(myCondStr => {
            makeConditionExclusionMapFromStrSub(myCondStr, conditionMap, exclusionMap, exclusionCond);
        });
    } else {
        // AND条件
        myCondStrArr = myCondStr.split('&');
        myCondStrArr.forEach(myCondStr => {
            makeConditionExclusionMapFromStrSub(myCondStr, conditionMap, exclusionMap, exclusionCond);
        });
    }
}

// 「条件」からオプション表示用の情報を作成します Sub
/**
 * 
 * @param {string} conditionStr 
 * @param {Map} conditionMap 
 * @param {Map} exclusionMap 
 * @param {string} exclusion 
 */
function makeConditionExclusionMapFromStrSub(conditionStr, conditionMap, exclusionMap, exclusion) {
    let myCondStrArr = conditionStr.split('@');
    let myName = myCondStrArr[0];
    if (myCondStrArr.length == 1) {
        pushToMapValueArray(conditionMap, myName, null);
    } else if (myCondStrArr.length == 2) {
        if (myCondStrArr[1].indexOf('-') != -1) {
            const re = new RegExp('([^0-9\\.]*)([0-9\\.]+)-([0-9\\.]+)(.*)');
            const re2 = new RegExp('/([0-9\\.]+)(.*)');
            let reRet = re.exec(myCondStrArr[1]);
            if (reRet) {
                let prefix = reRet[1];
                let rangeStart = Number(reRet[2]);
                let rangeEnd = Number(reRet[3]);
                let step = rangeStart;
                let postfix = reRet[4];
                if (postfix) {
                    let re2Ret = re2.exec(postfix);
                    if (re2Ret) {
                        step = Number(re2Ret[1]);
                        postfix = re2Ret[2];
                    }
                }
                for (let i = rangeStart; i < rangeEnd; i = addDecimal(i, step, rangeEnd)) {
                    pushToMapValueArray(conditionMap, myName, prefix + String(i) + postfix);
                }
                pushToMapValueArray(conditionMap, myName, prefix + String(rangeEnd) + postfix);
            } else {
                pushToMapValueArray(conditionMap, myName, myCondStrArr[1]);
            }
        } else if (myCondStrArr[1].indexOf(',') != -1) {
            const re = new RegExp('([^0-9\\.]*)([0-9\\.,]+)(.*)');
            let reRet = re.exec(myCondStrArr[1]);
            let prefix = reRet[1];
            let condValurArr = reRet[2].split(',');
            let postfix = reRet[3];
            condValurArr.forEach(value => {
                pushToMapValueArray(conditionMap, myName, prefix + value + postfix);
            });
        } else {
            pushToMapValueArray(conditionMap, myName, myCondStrArr[1]);
        }
    } else {
        console.error(conditionStr, conditionMap, exclusionMap);
    }
    if (exclusion) {
        exclusion.split(',').forEach(e => {
            pushToMapValueArray(exclusionMap, myName, e);
        });
    }
}

/**
 * ステータスを計算します.
 * 
 * @param {Object} characterInput 
 * @param {Object} artifactDetailInput 
 * @param {Object} conditionInput 
 * @param {Object} optionInput 
 * @param {Object} statusInput 
 * @returns {Object}
 */
function calculateStatus(characterInput, artifactDetailInput, conditionInput, optionInput, statusInput) {
    const result = JSON.parse(JSON.stringify(ステータスTEMPLATE));

    const characterMaster = characterInput.characterMaster;
    const weaponMaster = characterInput.weaponMaster;

    const ascension = characterInput.突破レベル;
    const level = characterInput.レベル;
    const constellation = characterInput.命ノ星座;
    const weaponAscension = characterInput.武器突破レベル;
    const weaponLevel = characterInput.武器レベル;
    const weaponRefine = characterInput.武器精錬ランク;

    result['突破レベル'] = ascension;
    result['レベル'] = level;
    result['命ノ星座'] = Number(constellation);
    result['武器突破レベル'] = weaponAscension;
    result['武器レベル'] = weaponLevel;
    result['武器精錬ランク'] = weaponRefine;
    if ('元素爆発' in characterMaster && '元素エネルギー' in characterMaster['元素爆発']) {
        result['元素エネルギー'] = characterMaster['元素爆発']['元素エネルギー'];
    }

    // ステータス補正を計上します
    if (statusInput && 'ステータス補正' in statusInput) {
        const statusAdjustment = statusInput['ステータス補正'];
        Object.keys(statusAdjustment).forEach(stat => {
            if (!(stat in result)) return;
            result[stat] += statusAdjustment[stat];
        });
    }

    // キャラクターのステータスを計上します
    Object.keys(characterMaster['ステータス']).forEach(stat => {
        if (基礎ステータスARRAY.includes(stat)) {
            result[stat] += getStatValueByLevel(characterMaster['ステータス'][stat], ascension, level);
        } else {
            let toStat = ['HP', '攻撃力', '防御力'].includes(stat) ? stat + '+' : stat;
            if (!(toStat in result)) return;
            result[toStat] += getPropertyValueByLevel(characterMaster['ステータス'][stat], ascension);
        }
    });

    // 武器のステータスを計上します
    Object.keys(weaponMaster['ステータス']).forEach(stat => {
        result[stat] += getStatValueByLevel(weaponMaster['ステータス'][stat], weaponAscension, weaponLevel);
    });

    // 聖遺物のステータスを計上します
    if (artifactDetailInput && '聖遺物ステータス' in artifactDetailInput) {
        Object.keys(artifactDetailInput['聖遺物ステータス']).forEach(stat => {
            let toStat = ['HP', '攻撃力', '防御力'].includes(stat) ? stat + '+' : stat;
            if (!(toStat in result)) return;
            result[toStat] += artifactDetailInput['聖遺物ステータス'][stat];
        });
    }

    result['HP上限'] += result['基礎HP'];
    result['HP上限'] += result['基礎HP'] * result['HP%'] / 100;
    result['HP上限'] += result['HP+'];

    result['防御力'] += result['基礎防御力'];
    result['防御力'] += result['基礎防御力'] * result['防御力%'] / 100;
    result['防御力'] += result['防御力+'];

    result['攻撃力'] += result['基礎攻撃力'];
    result['攻撃力'] += result['基礎攻撃力'] * result['攻撃力%'] / 100;
    result['攻撃力'] += result['攻撃力+'];

    const damageDetailObjArr = getDamageDetailObjArrObjArr(characterInput);
    damageDetailObjArr.forEach(damageDetailObj => {
        if (!damageDetailObj) return;
        const validConditionValueArr = makeValidConditionValueArr(conditionInput);
        if (conditionInput) {
            damageDetailObj[CHANGE_KIND_STATUS].filter(s => s['条件']).forEach(detailObj => {
                const checkRet = checkConditionMatches(detailObj['条件'], validConditionValueArr, constellation);
                if (checkRet == 0) return;
                if (detailObj['種類'] in result) {
                    let formulaArr = detailObj['数値'];
                    if (checkRet != 1) formulaArr = formulaArr.concat(['*', checkRet]);
                    const statValue = calculateFormulaArray(result, formulaArr, detailObj['上限']);
                    result[detailObj['種類']] += statValue;
                } else {
                    console.error(detailObj);
                }
            });
        }
    });

    console.debug(calculateStatus.name, result);
    return result;
}

/**
 * 
 * @param {Object} characterInput 
 * @returns {Object[]}
 */
function getDamageDetailObjArrObjArr(characterInput) {
    const result = [];
    if (!characterInput) return result;
    result.push(キャラクターダメージ詳細ObjMapVar.get(characterInput.character));
    result.push(武器ダメージ詳細ObjMapVar.get(characterInput.weapon));
    if ('2セット効果' in characterInput['聖遺物セット効果'][0].master) {
        result.push(聖遺物セット効果ダメージ詳細ObjMapVar.get(characterInput['聖遺物セット効果'][0]['名前']['2セット効果']));
    }
    if (characterInput['聖遺物セット効果'][0].name == characterInput['聖遺物セット効果'][1].name) {
        if ('4セット効果' in characterInput['聖遺物セット効果'][0].master) {
            result.push(聖遺物セット効果ダメージ詳細ObjMapVar.get(characterInput['聖遺物セット効果'][0]['名前']['4セット効果']));
        }
    } else {
        if ('2セット効果' in characterInput['聖遺物セット効果'][1].master) {
            result.push(聖遺物セット効果ダメージ詳細ObjMapVar.get(characterInput['聖遺物セット効果'][1]['名前']['2セット効果']));
        }
    }
    return result;
}

/**
 * 指定レベルのステータス値を取得します.
 * 
 * @param {Object} statObj 
 * @param {number} ascension 
 * @param {number} level 
 * @returns {number}
 */
function getStatValueByLevel(statObj, ascension, level) {
    if (!statObj) return 0;
    const myLevelStr = getLevelStr(ascension, level);
    if (myLevelStr in statObj) {
        return statObj[myLevelStr];
    }
    const lowLevel = 突破レベルレベルARRAY[ascension][0];
    const highLevel = 突破レベルレベルARRAY[ascension][突破レベルレベルARRAY[ascension].length - 1];
    const lowValue = statObj[lowLevel + '+'];
    const highValue = statObj[highLevel];
    let result = lowValue + (highValue - lowValue) * (level - lowLevel) / (highLevel - lowLevel);
    return result;
}

/**
 * 
 * @param {Object} statObj 
 * @param {number} ascension 
 * @returns {number}
 */
function getPropertyValueByLevel(statObj, ascension) {
    const lowLevel = 突破レベルレベルARRAY[ascension][0];
    return statObj[lowLevel + '+'];
}

/**
 * 
 * @param {Object[]} group 
 * @param {Object} active 
 * @param {boolean} opt_invisible 
 */
function switchActiveEntry(group, active, opt_invisible = true) {
    group.forEach(entry => {
        if (entry != active) entry.isVisible = false;
    });
    if (opt_invisible) {
        active.isVisible = !active.isVisible;
    } else {
        active.isVisible = true;
    }
}

/**
 * ダメージ計算を実施します.
 * 
 * @param {Object} characterInput 
 * @param {Object} conditionInput 
 * @param {Object} optionInput 
 * @param {Object} statusInput 
 * @param {Object} calculationResult 
 */
function calculateResult(characterInput, conditionInput, optionInput, statusInput, calculationResult) {
    try {
        const characterMaster = characterInput.characterMaster;
        const constellation = characterInput['命ノ星座'];

        // 元素反応を計算します
        const reactionResult = JSON.parse(JSON.stringify(元素反応TEMPLATE));
        const reactionMaster = 元素反応MasterVar[characterMaster['元素']];
        Object.keys(reactionMaster).forEach(reaction => {
            const reactionObj = reactionMaster[reaction];
            let element = characterMaster['元素'];
            let resultValue = 0;
            if (reaction == '結晶') {
                resultValue = calculate結晶シールド吸収量(element, statusInput['ステータス']);
            } else {
                switch (reactionObj['種類']) {
                    case '乗算':
                        resultValue = calculate乗算系元素反応倍率(reaction, element, statusInput['ステータス']);
                        break;
                    case '固定':
                        resultValue = calculate固定値系元素反応ダメージ(reaction, element, statusInput['ステータス'], statusInput['敵ステータス']);
                        break;
                }
            }
            Object.keys(reactionResult).forEach(key => {
                if (key.startsWith(reaction)) {
                    reactionResult[key] = resultValue;
                }
            });
        });
        calculationResult['元素反応'] = reactionResult;

        // 戦闘天賦およびその他のダメージを計算します
        const validConditionValueArr = makeValidConditionValueArr(conditionInput);

        const talentDetailArrObj = キャラクターダメージ詳細ObjMapVar.get(characterMaster.名前);
        if (talentDetailArrObj) {
            ['通常攻撃', '重撃', '落下攻撃'].forEach(category => {
                calculationResult['計算結果'][category] = [];
                if (!(category in talentDetailArrObj)) return;
                let talentDetailArr = talentDetailArrObj[category];
                if (('特殊' + category) in talentDetailArrObj) {
                    const workObj = talentDetailArrObj['特殊' + category];
                    console.log(calculateResult.name, workObj, validConditionValueArr);
                    if (checkConditionMatches(workObj['条件'], validConditionValueArr, constellation)) {
                        talentDetailArr = workObj['詳細'];
                    }
                }
                talentDetailArr.forEach(talentDetail => {
                    if (talentDetail['条件'] && !checkConditionMatches(talentDetail['条件'], validConditionValueArr, constellation)) {
                        return;
                    }
                    const resultArr = calculateDamageFromDetail(
                        talentDetail,
                        characterInput,
                        conditionInput,
                        optionInput,
                        statusInput);
                    calculationResult['計算結果'][category].push(resultArr);
                });
            });
            ['元素スキル', '元素爆発', 'その他'].forEach(category => {
                calculationResult['計算結果'][category] = [];
                if (!(category in talentDetailArrObj)) return;
                const talentDetailArr = talentDetailArrObj[category];
                talentDetailArr.forEach(talentDetail => {
                    if (talentDetail['条件'] && !checkConditionMatches(talentDetail['条件'], validConditionValueArr, constellation)) {
                        return;
                    }
                    const resultArr = calculateDamageFromDetail(
                        talentDetail,
                        characterInput,
                        conditionInput,
                        optionInput,
                        statusInput);
                    calculationResult['計算結果'][category].push(resultArr);
                });
            });
        }

        console.log(calculateResult.name, calculationResult);
    } catch (error) {
        console.error(error);
        throw error;
    }
}
