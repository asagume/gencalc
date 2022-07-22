function getDisplayName(name) {
    return name;
}

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

function getStarBackgroundUrl(master) {
    if ('レアリティ' in master) {
        return STAR_BACKGROUND_URL[master['レアリティ']];
    }
    return IMG_SRC_DUMMY;
}

function getElementImgSrc(master) {
    if ('元素' in master) {
        return ELEMENT_IMG_SRC[master['元素']];
    }
    return IMG_SRC_DUMMY;
}

function getColorClass(master) {
    if ('元素' in master) {
        return ELEMENT_COLOR_CLASS[master['元素']];
    }
    return ''
}

function getBgColorClass(master) {
    if ('元素' in master) {
        return ELEMENT_BG_COLOR_CLASS[master['元素']];
    }
    return ''
}

/**
 * おすすめセットのリストを作成します.
 * 
 * @param {object} characterMaster キャラクターマスター
 * @returns {Array} おすすめセットのリスト
 */
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
            if (RECOMMEND_ABBREV_MAP.has(statusName)) {
                setName += RECOMMEND_ABBREV_MAP.get(statusName);
            } else {
                setName += statusName.substring(0, 1);
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
 * @param {number} ascension 突破レベル
 * @param {number} level レベル
 * @returns {string}
 */
function getLevelStr(ascension, level) {
    return level + 突破レベルレベルARRAY[ascension][0] == level ? '+' : '';
}

function makeDamageDetailObjCharacter(characterInput) {
    const characterMaster = characterInput.master;

    if (キャラクターダメージ詳細ObjMapVar.has(characterMaster['名前'])) {
        return キャラクターダメージ詳細ObjMapVar.get(characterMaster['名前']);
    }

    const result = {};

    let myTalentDetail;
    let myTalentLevel;
    let myDefaultKind;
    let myDefaultElement;
    let myInputCategory = 'キャラクター';

    const myステータス変更系詳細Arr = [];
    const my天賦性能変更系詳細Arr = [];

    // 通常攻撃 重撃 落下攻撃
    myTalentLevel = characterInput['通常攻撃レベル'];
    myDefaultElement = null;
    ['通常攻撃', '重撃', '落下攻撃'].forEach(category => {
        myTalentDetail = characterMaster[category];
        myDefaultKind = category + 'ダメージ';
        result[category] = makeTalentDetailArray(myTalentDetail, myTalentLevel, myDefaultKind, myDefaultElement, myステータス変更系詳細Arr, my天賦性能変更系詳細Arr, myInputCategory);
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
                詳細: makeTalentDetailArray(myTalentDetail, myTalentLevel, myDefaultKind, myDefaultElement, myステータス変更系詳細Arr, my天賦性能変更系詳細Arr, myInputCategory)
            };
            result[workCategory] = workObj;
        }
    });

    // 元素スキル
    myTalentLevel = characterInput['元素スキルレベル'];
    myDefaultKind = '元素スキルダメージ';
    myDefaultElement = characterMaster['元素'];
    result['元素スキル'] = makeTalentDetailArray(characterMaster['元素スキル'], myTalentLevel, myDefaultKind, myDefaultElement, myステータス変更系詳細Arr, my天賦性能変更系詳細Arr, myInputCategory);

    // 元素爆発
    myTalentLevel = characterInput['元素爆発レベル'];
    myDefaultKind = '元素爆発ダメージ';
    myDefaultElement = characterMaster['元素'];
    result['元素爆発'] = makeTalentDetailArray(characterMaster['元素爆発'], myTalentLevel, myDefaultKind, myDefaultElement, myステータス変更系詳細Arr, my天賦性能変更系詳細Arr, myInputCategory);

    // その他戦闘天賦
    if ('その他戦闘天賦' in characterMaster) {
        characterMaster['その他戦闘天賦'].forEach(myTalentDetail => {
            let workArr = [];
            if ('その他' in result) {
                workArr = result['その他'];
            }
            workArr.concat(makeTalentDetailArray(myTalentDetail, null, null, null, myステータス変更系詳細Arr, my天賦性能変更系詳細Arr, myInputCategory));
            result['その他'] = workArr;
        });
    }

    // 固有天賦
    characterMaster['固有天賦'].forEach(myTalentDetail => {
        let workArr = [];
        if ('その他' in result) {
            workArr = result['その他'];
        }
        workArr.concat(makeTalentDetailArray(myTalentDetail, null, null, null, myステータス変更系詳細Arr, my天賦性能変更系詳細Arr, myInputCategory));
        result['その他'] = workArr;
    });

    // 命ノ星座
    if ('命ノ星座' in characterMaster) {
        Object.keys(characterMaster['命ノ星座']).forEach(key => {
            myTalentDetail = characterMaster['命ノ星座'][key];
            if ('詳細' in myTalentDetail) {
                Object.keys(myTalentDetail['詳細']).forEach(detailObj => {
                    if ('条件' in detailObj && detailObj['条件']) {
                        if (detailObj['条件'].indexOf('命ノ星座') == -1) {
                            detailObj['条件'] += '&命ノ星座@' + key;
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
            workArr.concat(makeTalentDetailArray(myTalentDetail, null, null, null, myステータス変更系詳細Arr, my天賦性能変更系詳細Arr, myInputCategory));
            result['その他'] = workArr;
        });
    }

    // 風元素キャラクター
    if (characterMaster['元素'] == '風') {
        ['炎元素', '水元素', '雷元素', '氷元素'].forEach(cond => {
            my天賦性能変更系詳細Arr.push({
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

    result['ステータス変更系詳細'] = myステータス変更系詳細Arr;
    result['天賦性能変更系詳細'] = my天賦性能変更系詳細Arr;

    console.debug(result);
    キャラクターダメージ詳細ObjMapVar.set(characterMaster['名前'], result);

    return result;
}

/**
 * 
 * @param {Object} talentDataObj 
 * @param {string} level 天賦レベル
 * @param {string} defaultKind デフォルト種類
 * @param {string} defaultElement デフォルト元素
 * @param {*} statusChangeArr 
 * @param {*} talentChangeArr 
 * @param {string} inputCategory 
 * @returns {Array}
 */
const makeTalentDetailArray = function (talentDataObj, level, defaultKind, defaultElement, statusChangeArr, talentChangeArr, inputCategory) {
    let resultArr = [];
    if ('詳細' in talentDataObj) {
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
                if (isFinite(my数値) || isString(my数値)) {
                    // nop
                } else if (typeof my数値 === 'object' && level && level in my数値) { // キャラクター|武器のサブステータス
                    my数値 = my数値[level];
                } else {
                    console.error(talentDataObj, level, defaultKind, defaultElement);
                }
                if (DAMAGE_CATEGORY_ARRAY.includes(my種類 + 'ダメージ') || my種類.endsWith('ダメージ')) {
                    my数値 = analyzeFormulaStr(my数値, '攻撃力');
                } else {
                    my数値 = analyzeFormulaStr(my数値, my種類);
                }
            }
            let my条件 = null;
            if ('条件' in detailObj) {
                my条件 = detailObj['条件'];
                if (typeof my条件 === 'object' && level && level in my条件) {  // 武器は精錬ランクによって数値を変えたいときがあるので
                    my条件 = my条件[level];
                }
            }
            let my上限 = null;
            if ('上限' in detailObj) {
                my上限 = detailObj['上限'];
                if (typeof my上限 === 'object' && level && level in my上限) {   // 草薙の稲光
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
            if (statusChangeArr != null) {
                if (resultObj['種類'] in 詳細_種類TEMPLATE
                    || resultObj['種類'].endsWith('%')
                    || new RegExp('[自全].+バフ').exec(resultObj['種類'])
                    || new RegExp('敵?[自全]元素耐性').exec(resultObj['種類'])
                    || resultObj['種類'] == '別枠乗算'
                    || ['継続時間', '発動回数', 'クールタイム', '使用回数'].includes(my種類)
                ) {
                    resultObj['元素'] = '元素' in detailObj ? detailObj['元素'] : null;
                    statusChangeArr.push(resultObj);
                    return;
                }
            }
            if (talentChangeArr != null) {
                if (resultObj['種類'].endsWith('強化')
                    || resultObj['種類'].endsWith('付与')
                    || resultObj['種類'].endsWith('アップ')
                    || resultObj['種類'] == '防御無視' ||
                    resultObj['種類'] == '固有変数') {   // ex.元素爆発強化,氷元素付与
                    resultObj['元素'] = '元素' in detailObj ? detailObj['元素'] : null;
                    talentChangeArr.push(resultObj);
                    return;
                }
            }
            resultArr.push(resultObj);
        });
    }
    return resultArr;
}

function calculateArtifactStat(artifactDetailInput) {
    const result = JSON.parse(JSON.stringify(聖遺物ステータスTEMPLATE));

    artifactDetailInput['聖遺物メイン効果'].filter(s => s).forEach(mainStat => {
        const splitted = mainStat.split('_');
        const rarity = splitted[0];
        const stat = splitted[1];
        if (!(stat in result)) {
            result[stat] = 0;
        }
        if (stat in 聖遺物メイン効果MasterVar[rarity]) {
            result[stat] += 聖遺物メイン効果MasterVar[rarity][stat];
        } else {
            result[stat] += 聖遺物メイン効果MasterVar[rarity][stat + 'バフ'];
        }
    });
    for (let i = 0; i < 3; i++) {
        const subStat = artifactDetailInput['聖遺物サブ効果'][i];
        if (!subStat) continue;
        const subStatValue1 = artifactDetailInput['聖遺物サブ効果上昇量'][i];
        if (!subStatValue1) continue;
        const subStatValue2 = artifactDetailInput['聖遺物サブ効果上昇回数'][i];
        if (!subStatValue2) continue;
        result[subStat] += subStatValue1 * subStatValue2;
    }

    if ('聖遺物ステータス' in artifactDetailInput) {
        Object.keys(result).forEach(stat => {
            if ('聖遺物ステータス補正' in artifactDetailInput) {
                if (stat in artifactDetailInput['聖遺物ステータス補正']) {
                    result[stat] += artifactDetailInput['聖遺物ステータス補正'][stat];
                }
            }
            artifactDetailInput['聖遺物ステータス'][stat] = result[stat];
        });
    }

    return result;
}

/**
 * ステータスを計算します.
 * 
 * @param {object} characterInput 
 * @param {object} statusInput 
 * @returns {object}
 */
function calculateStatus(characterInput, artifactDetailInput, statusInput) {
    const result = ステータスTEMPLATE();

    const characterMaster = characterInput.master;
    const weaponMaster = characterInput.weaponMaster;

    // ステータス補正を計上します
    if ('ステータス補正' in statusInput) {
        const statusAdjustment = statusInput['ステータス補正'];
        Object.keys(statusAdjustment).forEach(stat => {
            if (!(stat in result)) return;
            result[stat] += statusAdjustment[stat];
        });
    }

    // キャラクターのステータスを計上します
    Object.keys(characterMaster['ステータス']).forEach(stat => {
        if (基礎ステータスARRAY.includes(stat)) {
            result[stat] += getStatValueByLevel(characterMaster['ステータス'][stat], characterInput['突破レベル'], characterInput['レベル']);
        } else {
            let toStat = ['HP', '攻撃力', '防御力'].includes(stat) ? stat + '+' : stat;
            if (!(toStat in result)) return;
            result[toStat] += getPropertyValueByLevel(characterMaster['ステータス'][stat], characterInput['突破レベル'], characterInput['レベル']);
        }
    });

    // 武器のステータスを計上します
    Object.keys(weaponMaster['ステータス']).forEach(stat => {
        result[stat] += getStatValueByLevel(characterMaster['ステータス'][stat], characterInput['突破レベル'], characterInput['レベル']);
    });

    // 聖遺物のステータスを計上します
    if (artifactDetailInput && '聖遺物ステータス' in artifactDetailInput) {
        Object.keys(artifactDetailInput['聖遺物ステータス']).forEach(stat => {
            let toStat = ['HP', '攻撃力', '防御力'].includes(stat) ? stat + '+' : stat;
            if (!(toStat in result)) return;
            result[toStat] += artifactDetailInput['聖遺物ステータス'][stat];
        });
    }

    if ('2セット効果' in characterInput['聖遺物セット効果'][0].master) {

    }
    if (characterInput['聖遺物セット効果'][0].name == characterInput['聖遺物セット効果'][1].name) {
        if ('4セット効果' in characterInput['聖遺物セット効果'][0].master) {

        }
    } else {
        if ('2セット効果' in characterInput['聖遺物セット効果'][1].master) {

        }
    }

    result['HP上限'] += result['基礎HP'];
    result['HP上限'] += result['基礎HP'] * result['HP%'];
    result['HP上限'] += result['HP+'];

    result['防御力'] += result['基礎防御力'];
    result['防御力'] += result['基礎防御力'] * result['防御力%'];
    result['防御力'] += result['防御力+'];

    result['攻撃力'] += result['基礎攻撃力'];
    result['攻撃力'] += result['基礎攻撃力'] * result['攻撃力%'];
    result['攻撃力'] += result['攻撃力+'];

    console.log(result);
    return result;
}

/**
 * 指定レベルのステータス値を取得します.
 * 
 * @param {object} statObj 
 * @param {number} ascension 
 * @param {number} level 
 * @returns {number}
 */
function getStatValueByLevel(statObj, ascension, level) {
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

function getPropertyValueByLevel(statObj, ascension) {
    const lowLevel = 突破レベルレベルARRAY[ascension][0];
    return lowValue = statObj[lowLevel + '+'];
}

function switchActiveEntry(group, active, opt_invisible = true) {
    group.filter(s => s !== active).forEach(entry => {
        entry.isVisible = false;
    });
    if (opt_invisible) {
        active.isVisible = !active.isVisible;
    } else {
        active.isVisible = true;
    }
}
