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
 * @param {number} ascension 突破レベル
 * @param {number} level レベル
 * @returns {string}
 */
function getLevelStr(ascension, level) {
    return level + 突破レベルレベルARR[ascension][0] == level ? '+' : '';
}

function makeDamageDetailObjCharacter(characterInput) {
    const characterMaster = characterInput.master;

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
            const workMap = new Map();
            const myCondition = myTalentDetail['条件'];
            workMap.set(myCondition, makeTalentDetailArray(myTalentDetail, myTalentLevel, myDefaultKind, myDefaultElement, myステータス変更系詳細Arr, my天賦性能変更系詳細Arr, myInputCategory));
            result[workCategory] = workMap;
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

    console.debug(result);
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
    } else {
        console.error(talentDataObj, level, defaultKind, defaultElement);
    }
    return resultArr;
}

/**
 * 
 * @param {Object} talentDataObj 
 * @param {string} level 
 * @param {string} defaultKind 
 * @param {string} defaultElement 
 * @param {*} statusChangeArr 
 * @param {*} talentChangeArr 
 * @param {string} inputCategory 
 * @returns {Array}
 */
const makeSpecialTalentDetailArray = function (talentDataObj, level, defaultKind, defaultElement, statusChangeArr, talentChangeArr, inputCategory) {
    if ('種類' in talentDataObj) {
        switch (talentDataObj['種類']) {
            case '元素スキルダメージ':
                level = $('#元素スキルレベルInput').val().toString();
                defaultKind = talentDataObj['種類'];
                break;
            case '元素爆発ダメージ':
                level = $('#元素爆発レベルInput').val().toString();
                defaultKind = talentDataObj['種類'];
                break;
        }
    }
    if ('元素' in talentDataObj) {
        defaultElement = talentDataObj['元素'];
    }
    return makeTalentDetailArray(talentDataObj, level, defaultKind, defaultElement, statusChangeArr, talentChangeArr, inputCategory);
}

/**
 * ステータスを計算します.
 * 
 * @param {object} characterInput 
 * @param {object} statusAdjustment 
 * @returns {object}
 */
function calculateStatus(characterInput, statusAdjustment) {
    const result = JSON.parse(JSON.stringify(ステータスTEMPLATE));

    const myCharacterMaster = characterInput.master;
    const myWeaponMaster = characterInput.weaponMaster;

    // ステータス補正を計上します
    if (statusAdjustment) {
        Object.keys(statusAdjustment).forEach(category => {
            if (!(category in result)) return;
            Object.keys(statusAdjustment[category]).forEach(stat => {
                if (!(stat in result[category])) return;
                result[category][stat] += statusAdjustment[category][stat];
            });
        });
    }

    Object.keys(myCharacterMaster['ステータス']).forEach(stat => {
        ['基礎ステータス', '高級ステータス', 'その他'].forEach(category => {
            if (stat in result[category]) {
                result[category][stat] += getStatValueByLevel(myCharacterMaster['ステータス'][stat], characterInput['突破レベル'], characterInput['レベル']);
            }
        });
    });

    Object.keys(myWeaponMaster['ステータス']).forEach(stat => {
        ['基礎ステータス', '高級ステータス', 'その他'].forEach(category => {
            if (stat in result[category]) {
                result[category][stat] += getStatValueByLevel(myWeaponMaster['ステータス'][stat], characterInput['突破レベル'], characterInput['レベル']);
            }
        });
    });

    if ('2セット効果' in characterInput['聖遺物セット効果'][0].master) {

    }
    if (characterInput['聖遺物セット効果'][0].name == characterInput['聖遺物セット効果'][1].name) {
        if ('4セット効果' in characterInput['聖遺物セット効果'][0].master) {

        }
    } else {
        if ('2セット効果' in characterInput['聖遺物セット効果'][1].master) {

        }
    }

    result['基本ステータス']['HP上限'] += result['基礎ステータス']['基礎HP'];
    result['基本ステータス']['HP上限'] += result['基礎ステータス']['基礎HP'] * result['その他']['HP%'];
    result['基本ステータス']['HP上限'] += result['その他']['HP+'];

    result['基本ステータス']['防御力'] += result['基礎ステータス']['基礎防御力'];
    result['基本ステータス']['防御力'] += result['基礎ステータス']['基礎防御力'] * result['その他']['防御力%'];
    result['基本ステータス']['防御力'] += result['その他']['防御力+'];

    result['基本ステータス']['攻撃力'] += result['基礎ステータス']['基礎攻撃力'];
    result['基本ステータス']['攻撃力'] += result['基礎ステータス']['基礎攻撃力'] * result['その他']['攻撃力%'];
    result['基本ステータス']['攻撃力'] += result['その他']['攻撃力+'];



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
    const lowLevel = 突破レベルレベルARR[ascension][0];
    const highLevel = 突破レベルレベルARR[ascension][突破レベルレベルARR[ascension].length - 1];
    const lowValue = statObj[lowLevel + '+'];
    const highValue = statObj[highLevel];
    let result = lowValue + (highValue - lowValue) * (level - lowLevel) / (highLevel - lowLevel);
    return result;
}

