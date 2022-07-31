import { createApp } from 'vue'
import App from './App.vue'
import { makeRecommendationList } from './input';

const Master = require('./master.js') as any
const Input = require('./input.ts') as any

const basename = (path: string) => path!.split('/')!.pop()!.split('.')!.shift()!;

function makeSaveDataFromShareData(shareData: string) {
    const savedata = {} as {
        [key: string]: number | string
    };

    try {
        const shareDataArr = shareData.split(',');

        let character: string;

        let i = 0;
        Master.キャラクター構成PROPERTY_MAP.forEach((value: any, key: string) => {
            let newValue = shareDataArr[i];
            switch (key) {
                case 'キャラクター':
                    Object.keys(Master.CHARACTER_MASTER).forEach(key2 => {
                        if ('import' in Master.CHARACTER_MASTER[key2]) {
                            const myBasename = basename(Master.CHARACTER_MASTER[key2]['import']);
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
                        const my武器タイプ = Master.CHARACTER_MASTER[character]['武器'];
                        Object.keys(Master.WEAPON_MASTER[my武器タイプ]).forEach(key2 => {
                            if ('import' in Master.WEAPON_MASTER[my武器タイプ][key2]) {
                                const myBasename = basename(Master.WEAPON_MASTER[my武器タイプ][key2]['import']);
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
                        Object.keys(Master.ARTIFACT_SET_MASTER).forEach(key2 => {
                            if ('image' in Master.ARTIFACT_SET_MASTER[key2]) {
                                const myBasename = basename(Master.ARTIFACT_SET_MASTER[key2]['image']);
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
                        newValue = newValue.split('_')[0] + '_' + Master.ARTIFACT_STAT_JA_EN_ABBREV_REVERSE_MAP.get(newValue.split('_')[1]);
                    }
                    break;
                case '聖遺物優先するサブ効果1':
                case '聖遺物優先するサブ効果2':
                case '聖遺物優先するサブ効果3':
                    if (newValue) {
                        newValue = Master.ARTIFACT_STAT_JA_EN_ABBREV_REVERSE_MAP.get(newValue);
                    }
                    break;
            }
            if (value == null) {
                if (newValue) {
                    savedata[key] = newValue;
                } else {
                    savedata[key] = '';
                }
            } else {
                if (newValue) {
                    savedata[key] = Number(newValue);
                } else {
                    savedata[key] = 0;
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

                savedata[key] = value;
            }
        }

        return savedata;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

function getCharacterByBirthday(): string {
    const today = new Date();
    let curDiff = Number.MAX_SAFE_INTEGER;
    let result = Master.CHARACTER_MASTER_LIST[0].key;
    for (const entry of Master.CHARACTER_MASTER_LIST) {
        if ('誕生日' in entry) {
            const birthdayStrArr = entry['誕生日'].split('/');
            const birthday = new Date(today.getFullYear(), Number(birthdayStrArr[0]) - 1, Number(birthdayStrArr[1]), 0, 0, 0, 0);
            const diff = today.getTime() - birthday.getTime();
            if (diff < 0) continue;
            if (diff < curDiff) {
                curDiff = diff;
                result = entry.key;
            }
        }
    }
    return result;
}

async function loadRecommendation(characterInput: { [key: string]: any }, artifactDetailInput: { [key: string]: any }, conditionInput: { [key: string]: any }, recommendation: { [key: string]: any }) {
    try {
        const character = characterInput.character;
        const characterMaster = await Master.getCharacterMasterDetail(character);
        characterInput.characterMaster = characterMaster;

        if ('レベル' in recommendation) {
            [characterInput.突破レベル, characterInput.レベル] = Input.parseLevelStr(recommendation['レベル']);
        }
        ['命ノ星座', '通常攻撃レベル', '元素スキルレベル', '元素爆発レベル'].forEach(key => {
            if (key in recommendation) {
                characterInput[key] = recommendation[key];
            }
        });

        const weaponType = characterMaster['武器'];
        console.log(weaponType, recommendation);
        if ('武器' in recommendation) {
            characterInput.weapon = recommendation['武器'];
            characterInput.weaponMaster = await Master.getWeaponMasterDetail(characterInput.weapon, weaponType);
        }
        if ('武器レベル' in recommendation) {
            [characterInput.武器突破レベル, characterInput.武器レベル] = Input.parseLevelStr(recommendation['武器レベル']);
        }
        if ('精錬ランク' in recommendation) {
            characterInput.武器精錬ランク = recommendation['精錬ランク'];
        }

        ['聖遺物セット効果1', '聖遺物セット効果2'].forEach((key, index) => {
            if (!(key in recommendation)) return;
            const artifactSet = recommendation[key];
            characterInput['聖遺物セット効果'][index]['名前'] = artifactSet;
            if (artifactSet && artifactSet in Master.ARTIFACT_SET_MASTER) {
                characterInput['聖遺物セット効果'][index].master = Master.ARTIFACT_SET_MASTER[artifactSet];
            } else {
                characterInput['聖遺物セット効果'][index].master = Master.ARTIFACT_SET_MASTER_DUMMY;
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
            if (stat in Input.聖遺物ステータスTEMPLATE) {
                // nop
            } else {
                stat = stat.replace(/P$/, '%');
            }
            artifactDetailInput['聖遺物ステータス'][stat] = Math.round(recommendation[key] * 10) / 10;
            hasSubstat = true;
        });
        artifactDetailInput.isステータス計算無効 = hasSubstat;

        // makeDamageDetailObjArrObjCharacter(characterInput);
        // makeDamageDetailObjArrObjWeapon(characterInput);
        // makeDamageDetailObjArrObjArtifactSet(characterInput);
    }
    catch (error) {
        console.error(characterInput, artifactDetailInput, conditionInput, recommendation);
        throw error;
    }
}

async function main() {
    const characterInput = JSON.parse(JSON.stringify(Input.CHARACTER_INPUT_TEMPLATE)) as { [key: string]: any };
    const artifactDetailInput = JSON.parse(JSON.stringify(Input.ARTIFACT_DETAIL_INPUT_TEMPLATE));
    const conditionInput = JSON.parse(JSON.stringify(Input.CONDITION_INPUT_TEMPLATE));

    const searchParams = new URLSearchParams(window.location.search);
    let savedata;
    if (searchParams.has('allin')) {
        savedata = makeSaveDataFromShareData(searchParams.get('allin')!);
        characterInput.character = savedata.キャラクター;
    } else {
        characterInput.character = getCharacterByBirthday();
    }
    characterInput.characterMaster = await Master.getCharacterMasterDetail(characterInput.character);
    const recommendationList = makeRecommendationList(characterInput.characterMaster, savedata);
    const recommendation = recommendationList[0];
    await loadRecommendation(characterInput, artifactDetailInput, conditionInput, recommendation.build);
    console.log(characterInput);

    createApp(App, { initialCharacterInput: characterInput }).mount('#app')
}

main();
