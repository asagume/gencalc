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

function setupBaseDamageDetailDataCharacter(characterInput) {
    const characterMaster = characterInput.master;



    let myDefaultCategory = '';
    let myDefaultElement = null;


    ['通常攻撃', '重撃', '落下攻撃'].forEach(category => {
    });

    ['元素スキル'].forEach(category => {

    });

    ['元素爆発'].forEach(category => {

    });

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

