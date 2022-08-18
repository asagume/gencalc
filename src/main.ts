import { createApp } from 'vue'
import App from './App.vue'
import { makeRecommendationList, loadRecommendation, CHARACTER_INPUT_TEMPLATE, ARTIFACT_DETAIL_INPUT_TEMPLATE, CONDITION_INPUT_TEMPLATE, TCharacterInput } from '@/input';
import { ARTIFACT_SET_MASTER, ARTIFACT_STAT_JA_EN_ABBREV_REVERSE_MAP, CHARACTER_MASTER, CHARACTER_MASTER_LIST, getCharacterMasterDetail, TCharacterKey, TWeaponTypeKey, WEAPON_MASTER, キャラクター構成PROPERTY_MAP } from '@/master';
import { deepcopy, isNumber } from './common';
import i18n from './i18n';


// eslint-disable-next-line
const basename = (path: string) => path!.split('/')!.pop()!.split('.')!.shift()!;

function makeSaveDataFromShareData(shareData: string) {
    const savedata = {} as {
        [key: string]: number | string
    };

    try {
        const shareDataArr = shareData.split(',');

        let character: TCharacterKey;

        let i = 0;
        キャラクター構成PROPERTY_MAP.forEach((value: any, key: string) => {
            let newValue = shareDataArr[i];
            switch (key) {
                case 'キャラクター':
                    (Object.keys(CHARACTER_MASTER) as TCharacterKey[]).forEach(key2 => {
                        if ('import' in CHARACTER_MASTER[key2]) {
                            const myBasename = basename(CHARACTER_MASTER[key2]['import']);
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
                        const weaponType = CHARACTER_MASTER[character]['武器'] as TWeaponTypeKey;
                        const typedWeaponMaster = WEAPON_MASTER[weaponType];
                        (Object.keys(typedWeaponMaster) as (keyof typeof typedWeaponMaster)[]).forEach(key2 => {
                            if ('import' in WEAPON_MASTER[weaponType][key2]) {
                                const myBasename = basename(WEAPON_MASTER[weaponType][key2]['import']);
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
                        (Object.keys(ARTIFACT_SET_MASTER) as (keyof typeof ARTIFACT_SET_MASTER)[]).forEach(key2 => {
                            if ('image' in ARTIFACT_SET_MASTER[key2]) {
                                const myBasename = basename(ARTIFACT_SET_MASTER[key2]['image']);
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
            if (value != null && isNumber(value)) {
                if (newValue) {
                    savedata[key] = Number(newValue);
                } else {
                    savedata[key] = 0;
                }
            } else {
                if (newValue) {
                    savedata[key] = newValue;
                } else {
                    savedata[key] = '';
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

function getCharacterByBirthday(): TCharacterKey {
    const today = new Date();
    let curDiff = Number.MAX_SAFE_INTEGER;
    let result = CHARACTER_MASTER_LIST[0].key;
    for (const entry of CHARACTER_MASTER_LIST) {
        if (entry['誕生日']) {
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

async function main() {
    const characterInput = deepcopy(CHARACTER_INPUT_TEMPLATE) as TCharacterInput;
    const artifactDetailInput = deepcopy(ARTIFACT_DETAIL_INPUT_TEMPLATE);
    const conditionInput = deepcopy(CONDITION_INPUT_TEMPLATE);

    const searchParams = new URLSearchParams(window.location.search);
    let urldata;
    if (searchParams.has('allin')) {
        const allin = searchParams.get('allin');
        if (allin) {
            urldata = makeSaveDataFromShareData(allin);
            characterInput.character = urldata.キャラクター as TCharacterKey;
        } else {
            console.error('query strings are not valid!');
        }
    } else {
        characterInput.character = getCharacterByBirthday();
    }
    console.log('url', urldata);
    characterInput.characterMaster = await getCharacterMasterDetail(characterInput.character);
    const recommendationList = makeRecommendationList(characterInput.characterMaster, urldata);
    const recommendation = recommendationList[0];
    await loadRecommendation(characterInput, artifactDetailInput, conditionInput, recommendationList[0].build);

    console.log('main', artifactDetailInput);

    createApp(App, {
        characterInput: characterInput,
        artifactDetailInput: artifactDetailInput,
        conditionInput: conditionInput,
        recommendationList: recommendationList,
        recommendation: recommendation,
        urldata: urldata,
    }).use(i18n).mount('#app')
}

main();