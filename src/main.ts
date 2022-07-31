import { createApp } from 'vue'
import App from './App.vue'
import { makeRecommendationList, loadRecommendation } from './input';

const Master = require('./master.ts') as any
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

    createApp(App, {
        initialCharacterInput: characterInput,
        initialArtifactDetailInput: artifactDetailInput,
        initialConditionInput: conditionInput,
        initialRecommendationList: recommendationList,
    }).mount('#app')
}

main();
