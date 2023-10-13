import { TActionItem, TTeam, TTeamMemberResult, getCharacterDetail, getCharacterMaster } from "./team";

export const RECHAEGE_TYPE_ENERGY = "0"; // 元素エネルギー(固定値)
export const RECHAEGE_TYPE_PARTICLE = "1"; // 元素粒子

export const CHARACTER_ENERGY = 'CHARACTER_ENERGY';
export const WEAPON_ENERGY = 'WEAPON_ENERGY';
export const ARTIFACT_ENERGY = 'ARTIFACT_ENERGY';
export const CHARACTER_PARTICLE = 'CHARACTER_PARTICLE';
export const WEAPON_PARTICLE = 'WEAPON_PARTICLE';
export const ARTIFACT_PARTICLE = 'ARTIFACT_PARTICLE';

export type TEREnergy = number[]; // 元素エネルギー
export type TERParticle = [string, number]; // 元素, 粒子数

function getTeamMember(name: string, team: TTeam) {
    return team.members.filter(member => member.name == name)[0];
}

/** 重撃使用回数 */
export function getCCount(name: string, rotationList: TActionItem[]) {
    return rotationList.filter(rotation => rotation.member == name && rotation.action.indexOf('C') != -1).length;
}

/** 元素スキル使用回数 */
export function getECount(name: string, rotationList: TActionItem[], action = 'E') {
    return rotationList.filter(rotation => rotation.member == name && rotation.action.startsWith(action)).length;
}

/** 元素爆発使用回数 */
export function getQCount(name: string, rotationList: TActionItem[]) {
    return rotationList.filter(rotation => rotation.member == name && rotation.action === 'Q').length;
}

export const getEnergyFromMyself = (
    character: string,
    team: TTeam,
    rotationList: TActionItem[],
    teamMemberResult: TTeamMemberResult
) => {
    let energy = 0;
    const member = getTeamMember(character, team);
    const memberResult = teamMemberResult[member.id];
    const constellation = memberResult?.characterInput.命ノ星座 ?? 0;
    if (character === 'ジン') {
        const qCount = getQCount(character, rotationList);
        energy = 80 * 0.2 * qCount; // +16/元素爆発
    } else if (character === '七七' && constellation >= 1) {
        energy = 2 * 0;
    } else if (character === 'ガイア' && constellation >= 6) {
        const qCount = getQCount(character, rotationList);
        energy = 15 * qCount; // +15/元素爆発
    } else if (character === 'リサ' && constellation >= 1) {
        const eCount = getECount(character, rotationList, 'E.Hold');
        energy = 2 * eCount; // +2/元素スキル長押し
    } else if (character === 'バーバラ') {
        energy = 1 * rotationList.length / 7; // +1/10秒
        if (constellation >= 4) {
            const cCount = getCCount(character, rotationList);
            energy += 1 * cCount; // +1/重撃
        }
    } else if (character === '行秋' && constellation >= 6) {
        const qCount = getQCount(character, rotationList);
        if (qCount) {
            let n = 0;
            rotationList.forEach(rotation => {
                if (rotation.action.startsWith('N')) {
                    n++;
                }
            })
            energy = 3 * n / 3;
        }
    } else if (character === 'レザー') {
        energy = 0;
    } else if (character === '重雲' && constellation >= 4) {
        energy = 0;
    } else if (character === 'ウェンティ') {
        const qCount = getQCount(character, rotationList);
        energy = 15 * qCount; // +15/元素爆発
    } else if (character === 'クレー') {
        const critRate = memberResult?.statsInput.statsObj.会心率 ?? 60;
        const cCount = getCCount(character, rotationList);
        energy = 2 * critRate / 100 * cCount; // +2/重撃会心
    } else if (character === 'ディオナ') {
        const qCount = getQCount(character, rotationList);
        energy = 15 * qCount; // +15/元素爆発
    } else if (character === '甘雨' && constellation >= 1) {
        const cCount = getCCount(character, rotationList);
        energy = 2 * cCount; // +2/重撃
    } else if (character === 'ロサリア' && constellation >= 4) {
        let critRate = memberResult?.statsInput.statsObj.会心率 ?? 60;
        critRate = Math.min(100, critRate + Math.max(0, 100 - critRate) * critRate / 100);
        const eCount = getECount(character, rotationList);
        energy = 5 * critRate / 100 * eCount; // +5/元素スキル会心
    } else if (character === '楓原万葉' && constellation >= 4) {
        energy = 0;
    } else if (character === '旅人(雷)') {
        energy = 0;
    } else if (character === '雷電将軍') {
        const qCount = getQCount(character, rotationList);
        let unit = 2.3;
        if (memberResult) {
            memberResult.damageResult.元素爆発.forEach(entry => {
                if (entry[0] === '夢想の一心エネルギー回復') {
                    unit = entry[2];
                }
            })
        }
        energy += unit * 5 * qCount;
    } else if (character === '九条裟羅') {
        const er = memberResult?.statsInput.statsObj.元素チャージ効率 ?? 100;
        const eCount = getECount(character, rotationList);
        energy = 1.2 * er / 100 * eCount;
    } else if (character === '珊瑚宮心海' && constellation >= 4) {
        let isBursting = false;
        for (let i = 0; i < rotationList.length; i++) {
            const rotation = rotationList[i];
            if (rotation.member == character) {
                if (rotation.action === 'Q') {
                    isBursting = true;
                } else if (isBursting && rotation.action.startsWith('N')) {
                    const n = Number(rotation.action.substring(1) ?? '1');
                    energy += 0.8 * n;
                }
            } else {
                isBursting = false;
            }
        }
    } else if (character === '早柚' && constellation >= 4) {
        energy = 1.2 * 0;
    } else if (character === '八重神子' && constellation >= 1) {
        const eCount = getECount(character, rotationList);
        const qCount = getQCount(character, rotationList);
        if (eCount || qCount) {
            energy = 8 * Math.min(3, Math.trunc(eCount / qCount)) * qCount;
        }
    } else if (character === '荒瀧一斗' && constellation >= 2) {
        const geoCount = team.members.filter(member => getCharacterDetail(member.name)?.元素 === '岩').length;
        energy = Math.min(18, 6 * geoCount);
    } else if (character === 'トーマ' && constellation >= 4) {
        const qCount = getQCount(character, rotationList);
        energy = 15 * qCount; // +15/元素爆発
    } else if (character === '神里綾人') {
        let isBursted = false;
        let isOffField = false;
        for (let i = 0; i < rotationList.length; i++) {
            const rotation = rotationList[i];
            if (rotation.member == character) {
                if (rotation.action === 'Q') {
                    isBursted = true;
                }
                isOffField = false;
            } else if (isBursted) {
                isBursted = false;
                isOffField = true;
            } else if (isOffField) {
                energy += 2;
            }
        }
    } else if (character === '鹿野院平蔵' && constellation >= 4) {
        energy = 9;
    } else if (character === '旅人(草)' && constellation >= 1) {
        const eCount = getECount(character, rotationList);
        energy = 3.5 * eCount;
    } else if (character === 'ニィロウ' && constellation >= 4) {
        let isSkilling = false;
        for (let i = 0; i < rotationList.length; i++) {
            const rotation = rotationList[i];
            if (rotation.member == character) {
                if (rotation.action === 'E') {
                    if (!isSkilling) {
                        energy += 15;
                    }
                    isSkilling = true;
                }
            } else {
                isSkilling = false;
            }
        }
    } else if (character === 'ドリー') {
        const er = memberResult?.statsInput.statsObj.元素チャージ効率 ?? 100;
        const eCount = getECount(character, rotationList);
        energy = Math.min(15, 5 * er / 100 * eCount);
    } else if (character === '放浪者') {
        const electroCount = team.members.filter(member => getCharacterDetail(member.name)?.元素 === '雷').length;
        if (electroCount) {
            const nCount = rotationList.filter(rotation => rotation.member == character && rotation.action.startsWith('N')).reduce((sum, rotation) => sum + Number(rotation.action.substring(1) ?? '1'), 0);
            const cCount = getCCount(character, rotationList);
            energy = 0.8 * (nCount + cCount);
        }
    } else if (character === 'ミカ' && constellation >= 4) {
        const qCount = getECount(character, rotationList);
        energy = 3 * 5 * qCount;
    } else if (character === 'レイラ' && constellation >= 2) {
        energy = 1 * 0;
    } else if (character === 'ヨォーヨ' && constellation >= 2) {
        energy = 3 * 0;
    } else if (character === 'ファルザン' && constellation >= 4) {
        energy = 0.5 * 0;
    } else if (character === 'ディシア') {
        energy = 1.5 * 0;
    } else if (character === 'リネ') {
        energy = 0;
    } else if (character === 'フレミネ' && constellation >= 2) {
        energy = 0;
    }
    return Math.round(energy * 10) / 10;
}

export const energyFromFellow = (
    character: string,
    team: TTeam,
    rotationList: TActionItem[],
    teamMemberResult: TTeamMemberResult
) => {
    let energy = 0;
    const characterDetail = getCharacterDetail(character);
    const vision = characterDetail?.元素;
    const elementArr = team.members.map(member => getCharacterDetail(member.name)?.元素);
    team.members.filter(member => member.name != character).forEach(member => {
        const qCount = getQCount(member.name, rotationList);
        const memberResult = teamMemberResult[member.id];
        if (member.name === 'ウェンティ') {
            for (const element of ['炎', '水', '雷', '氷']) {
                if ((elementArr as any).includes(element)) {
                    if (vision == element) {
                        energy += 15 * qCount;
                    }
                    break;
                }
            }
        } else if (member.name === '雷電将軍') {
            let unit = 2.3;
            if (memberResult) {
                memberResult.damageResult.元素爆発.forEach(entry => {
                    if (entry[0] === '夢想の一心エネルギー回復') {
                        unit = entry[2];
                    }
                })
            }
            energy += unit * 5 * qCount;
        }
    })
    return Math.round(energy * 10) / 10;
}

export const getEnergyFromWeapon = (
    character: string,
    team: TTeam,
    rotationList: TActionItem[],
    teamMemberResult: TTeamMemberResult
) => {
    let energy = 0;
    const member = getTeamMember(character, team);
    const memberResult = teamMemberResult[member.id];
    if (member && memberResult) {
        const weapon = memberResult.characterInput.weapon;
        const rank = memberResult.characterInput.武器精錬ランク;
        if (weapon === '金珀·試作') {
            // 元素爆発を発動した後の6秒間、2秒毎に元素エネルギーを4/4.5/5/5.5/6回復し、チーム全員のHPを2秒毎に4%/4.5%/5%/5.5%/6%回復する。
            const qCount = getQCount(character, rotationList);
            energy = [0, 4, 4.5, 5, 5.5, 6][rank] * 3 * qCount;
        } else if (weapon === '天目影打') {
            // 元素スキルを発動した後、継続時間30秒の継承の印を1つ獲得する。この効果は5秒毎に1回のみ発動可能で、継承の印は同時に最大3つまで存在可能。元素爆発を発動すると、所持している継承の印を全て消費し、消費した継承の印1つにつき、2秒後に該当キャラクターの元素エネルギーを6/7.5/9/10.5/12ポイント回復する。
            const eCount = getECount(character, rotationList);
            const qCount = getQCount(character, rotationList);
            if (qCount) {
                energy = [0, 6, 7.5, 9, 10.5, 12][rank] * eCount;
            }
        } else if (weapon === '桂木斬長正' || weapon === '喜多院十文字槍') {
            // 元素スキルが命中した時、キャラクターは元素エネルギーを3失う。その後の6秒間、2秒毎に元素エネルギーを3/3.5/4/4.5/5獲得する。この効果は10秒毎に1回のみ発動でき、待機中のキャラクターも発動できる。
            let previous = Number.MIN_VALUE;
            for (let i = 0; i < rotationList.length; i++) {
                if (i < previous + 7) { // 10秒毎に1回のみ発動可能
                    continue;
                }
                const rotation = rotationList[i];
                if (rotation.member == character && rotation.action.startsWith('E')) {
                    if (i === 0 || rotationList[i - 1].member != character && rotationList[i - 1].action !== 'Q') {
                        energy -= 3;
                    }
                    energy += [0, 3, 3.5, 4, 4.5, 5][rank] * 3;
                    previous = i;
                }
            }
        } else if (weapon === '不滅の月華') {
            // 元素爆発を発動した後の12秒間、通常攻撃が敵に命中すると元素エネルギーが0.6ポイント回復する。この方式での元素エネルギー回復は、0.1秒毎に1回のみ可能。
            let isBursting = false;
            for (let i = 0; i < rotationList.length; i++) {
                const rotation = rotationList[i];
                if (rotation.member == character) {
                    if (rotation.action === 'Q') {
                        isBursting = true;
                    } else if (isBursting && rotation.action.startsWith('N')) {
                        const n = Number(rotation.action.substring(1) ?? '1');
                        energy += 0.6 * n;
                    }
                } else {
                    isBursting = false;
                }
            }
        } else if (weapon === '碧落の瓏') {
            // 元素爆発を起動、またはシールドを生成した後の3秒間、「定土玉圭」効果を発動する。2.5秒毎に元素エネルギーを4.5/5/5.5/6/6.5回復
            const qCount = getQCount(character, rotationList);
            energy = [0, 4.5, 5, 5.5, 6, 6.5][rank] * qCount * 20 / 2.5;
        } else if (weapon === '正義の報酬') {
            // 治療を受けた時、元素エネルギーを8/10/12/14/16ポイント回復する。この効果は10秒毎に1回のみ発動可能。キャラクターが待機中でも発動できる。
            const qCount = getQCount(character, rotationList);
            energy = [0, 8, 10, 12, 14, 16][rank] * qCount;
        } else if (weapon === '久遠流転の大典') {
            // HP上限+16%/20%/24%/28%/32%。現在のHPが増える、または減る時、重撃ダメージ+14%/18%/22%/26%/30%。継続時間4秒、最大3層まで。0.3秒毎に1回のみ発動可能。3層まで重ねた時、または3層の継続時間がリセットされた時、元素エネルギーを8/9/10/11/12ポイント回復する。この方法による元素エネルギーの回復は、12秒に1回のみ。
            const qCount = getQCount(character, rotationList);
            energy = [0, 8, 9, 10, 11, 12][rank] * qCount;
        } else if (weapon === '船渠剣' || weapon === '携帯型チェーンソー') {
            // 治療効果を受ける、または治療効果を与える時、強靭マークが1枚付与される。継続時間30秒、最大3枚まで。元素スキル、または元素爆発を発動する時、すべての強靭マークを消費し、継続時間10秒の「奮起」効果を獲得する。消費した強靭マーク1枚につき、元素熟知+40/50/60/70/80、さらに「奮起」効果を獲得した2秒後、消費した強靭マーク1枚につき、装備者の元素エネルギーを2/2.5/3/3.5/4ポイント回復する。「奮起」効果は15秒に1回のみ発動可能。キャラクターが待機中でも強靭マークを獲得できる。
            const eCount = getECount(character, rotationList);
            const qCount = getQCount(character, rotationList);
            if (eCount || qCount) {
                energy = [0, 2, 2.5, 3, 3.5, 4][rank] * 3 * qCount;
            }
        }
    }
    return Math.round(energy * 10) / 10;
}

export function getEnergyByCharacter(
    character: string,
    constellation: number,
    team: TTeam,
    rotationTime: number,
    rotationList: TActionItem[] | undefined,
    teamMemberResult: TTeamMemberResult | undefined,
): TEREnergy | undefined {
    const energies = [0, 0, 0, 0];
    const memberNameArr = team.members.map(member => member.name);
    const myIndex = memberNameArr.indexOf(character);
    const member = team.members[myIndex];
    const eCount = rotationList ? getECount(character, rotationList) : 1;
    const qCount = rotationList ? getQCount(character, rotationList) : 1;
    const memberResult = teamMemberResult ? teamMemberResult[member.id] : undefined;
    let myEnergy = 0; // 自分の元素エネルギー
    let allEnergy = 0; // 全員の元素エネルギー
    let otherEnergy = 0; // 自分以外全員の元素エネルギー
    let herEnergy = 0; // 誰かの元素エネルギー
    let herIndex = -1; // 誰かのインデックス
    otherEnergy = 0;
    herEnergy = 0;
    herIndex = -1;
    if (!character) {
        return undefined;
    } else if (character === 'ヌヴィレット') {
        myEnergy = 0;
    } else if (character === 'リネ') {
        myEnergy = 0;
    } else if (character === '白朮') {
        myEnergy = 0;
    } else if (character === 'ディシア') {
        myEnergy = 0;
    } else if (character === 'アルハイゼン') {
        myEnergy = 0;
    } else if (character === '放浪者') {
        const electroCount = team.members.filter(member => getCharacterDetail(member.name)?.元素 === '雷').length;
        if (electroCount) {
            let nCount = 1;
            let cCount = 1;
            if (rotationList) {
                nCount = rotationList.filter(rotation => rotation.member == character && rotation.action.startsWith('N')).reduce((sum, rotation) => sum + Number(rotation.action.substring(1) ?? '1'), 0);
                cCount = getCCount(character, rotationList);
            }
            myEnergy += 0.8 * (nCount + cCount);
        }
    } else if (character === 'ナヒーダ') {
        myEnergy = 0;
    } else if (character === 'ニィロウ' && constellation >= 4) {
        let count = eCount;
        if (rotationList) {
            count = 0;
            let isSkilling = false;
            for (let i = 0; i < rotationList.length; i++) {
                const rotation = rotationList[i];
                if (rotation.member == character) {
                    if (rotation.action === 'E') {
                        if (!isSkilling) {
                            count++;
                        }
                        isSkilling = true;
                    }
                } else {
                    isSkilling = false;
                }
            }
        }
        myEnergy += 15 * count;
    } else if (character === 'セノ') {
        myEnergy = 0;
    } else if (character === 'ティナリ') {
        myEnergy = 0;
    } else if (character === '夜蘭') {
        myEnergy = 0;
    } else if (character === '神里綾人') {
        myEnergy = 0;
    } else if (character === '八重神子') {
        myEnergy = 0;
    } else if (character === '申鶴') {
        myEnergy = 0;
    } else if (character === '荒瀧一斗') {
        myEnergy = 0;
    } else if (character === '珊瑚宮心海') {
        myEnergy = 0;
    } else if (character === '雷電将軍') {
        let unit = 2.3 * (1 + (132 - 100) * 0.006);
        if (memberResult) {
            memberResult.damageResult.元素爆発.forEach(entry => {
                if (entry[0] === '夢想の一心エネルギー回復') {
                    unit = entry[2];
                }
            })
        }
        allEnergy = unit * 5 * qCount;
    } else if (character === 'アーロイ') {
        myEnergy = 0;
    } else if (character === '宵宮') {
        myEnergy = 0;
    } else if (character === '神里綾華') {
        myEnergy = 0;
    } else if (character === '楓原万葉') {
        myEnergy = 0;
    } else if (character === 'エウルア') {
        myEnergy = 0;
    } else if (character === '胡桃') {
        myEnergy = 0;
    } else if (character === '魈') {
        myEnergy = 0;
    } else if (character === '甘雨') {
        myEnergy = 0;
    } else if (character === 'アルベド') {
        myEnergy = 0;
    } else if (character === '鍾離') {
        myEnergy = 0;
    } else if (character === 'タルタリヤ') {
        myEnergy = 0;
    } else if (character === 'クレー') {
        myEnergy = 0;
    } else if (character === 'ウェンティ') {
        myEnergy = 0;
    } else if (character === '刻晴') {
        myEnergy = 0;
    } else if (character === 'モナ') {
        myEnergy = 0;
    } else if (character === '七七') {
        myEnergy = 0;
    } else if (character === 'ディルック') {
        myEnergy = 0;
    } else if (character === 'ジン') {
        myEnergy = 0;
    } else if (character === 'フレミネ') {
        myEnergy = 0;
    } else if (character === 'リネット') {
        myEnergy = 0;
    } else if (character === '綺良々') {
        myEnergy = 0;
    } else if (character === 'カーヴェ') {
        myEnergy = 0;
    } else if (character === 'ミカ') {
        myEnergy = 0;
    } else if (character === 'ヨォーヨ') {
        myEnergy = 0;
    } else if (character === 'ファルザン') {
        myEnergy = 0;
    } else if (character === 'レイラ') {
        myEnergy = 0;
    } else if (character === 'キャンディス') {
        myEnergy = 0;
    } else if (character === 'ドリー') {
        const er = memberResult?.statsInput.statsObj.元素チャージ効率 ?? 100;
        myEnergy = Math.min(15, 5 * er / 100 * eCount);
    } else if (character === 'コレイ') {
        myEnergy = 0;
    } else if (character === '鹿野院平蔵') {
        myEnergy = 9 * qCount;
        energies[myIndex] += myEnergy;
    } else if (character === '久岐忍') {
        myEnergy = 0;
    } else if (character === '雲菫') {
        myEnergy = 0;
    } else if (character === 'ゴロー') {
        myEnergy = 0;
    } else if (character === 'トーマ') {
        myEnergy = 0;
    } else if (character === '九条裟羅') {
        myEnergy = 0;
    } else if (character === '早柚') {
        myEnergy = 0;
    } else if (character === '煙緋') {
        myEnergy = 0;
    } else if (character === 'ロサリア') {
        myEnergy = 0;
    } else if (character === '辛炎') {
        myEnergy = 0;
    } else if (character === 'ディオナ') {
        myEnergy = 0;
    } else if (character === 'スクロース') {
        myEnergy = 0;
    } else if (character === '重雲') {
        myEnergy = 0;
    } else if (character === 'ノエル') {
        myEnergy = 0;
    } else if (character === 'ベネット') {
        myEnergy = 0;
    } else if (character === 'フィッシュル') {
        myEnergy = 0;
    } else if (character === '凝光') {
        myEnergy = 0;
    } else if (character === '行秋') {
        myEnergy = 0;
    } else if (character === '北斗') {
        myEnergy = 0;
    } else if (character === '香菱') {
        myEnergy = 0;
    } else if (character === 'レザー') {
        myEnergy = 0;
    } else if (character === 'バーバラ') {
        myEnergy = 0;
    } else if (character === 'リサ') {
        myEnergy = 0;
    } else if (character === 'ガイア') {
        myEnergy = 0;
    } else if (character === 'アンバー') {
        myEnergy = 0;
    } else if (character === '旅人(水)') {
        myEnergy = 0;
    } else if (character === '旅人(草)') {
        myEnergy = 3.5 * eCount;
    } else if (character === '旅人(雷)') {
        myEnergy = 0;
    } else if (character === '旅人(岩)') {
        myEnergy = 0;
    } else if (character === '旅人(風)') {
        myEnergy = 0;
    }

    if (myEnergy) {
        energies[myIndex] += myEnergy;
    }
    if (allEnergy) {
        for (let i = 0; i < energies.length; i++) {
            energies[i] += allEnergy;
        }
    }
    if (otherEnergy) {
        for (let i = 0; i < energies.length; i++) {
            if (i != myIndex) {
                energies[i] += otherEnergy;
            }
        }
    }
    if (herEnergy && herIndex !== -1) {
        energies[herIndex] += herEnergy;
    }

    return energies.filter(e => e > 0).length > 0 ? energies : undefined;
}

export function getParticleByCharacter(
    character: string,
    constellation: number,
    team: TTeam,
    rotationTime: number,
    rotationList: TActionItem[] | undefined,
    teamMemberResult: TTeamMemberResult | undefined,
    ePressCount?: number,
    eHoldCount?: number,
): TERParticle | undefined {
    let myParticle = 0;
    const memberNameArr = team.members.map(member => member.name);
    const myIndex = memberNameArr.indexOf(character);
    const member = team.members[myIndex];
    const eCount = rotationList ? getECount(character, rotationList) : 1;
    const qCount = rotationList ? getQCount(character, rotationList) : 1;
    const memberResult = teamMemberResult ? teamMemberResult[member.id] : undefined;
    if (!character) {
        return undefined;
    }
    const characterMaster = getCharacterMaster(character);
    const element = characterMaster?.元素 ?? '白';
    const characterParticle = CHARACTER_PARTICLE_MAP[character];
    if (characterParticle) {
        myParticle = 0;
    }
    return [element, myParticle];
}

export function getParticleByCharacterExtra(
    character: string,
    constellation: number,
    team: TTeam,
    rotationTime: number,
    rotationList: TActionItem[] | undefined,
): TERParticle | undefined {
    let element;
    let num;
    const eCount = rotationList ? getECount(character, rotationList) : 1;
    const qCount = rotationList ? getQCount(character, rotationList) : 1;
    if (character === '刻晴' && constellation >= 2) {
        // 刻晴の通常攻撃と重撃が雷元素の影響を受けた敵に命中した時、50%の確率で元素粒子を1個生成する。5秒毎に1回のみ発動可能。
        const ct = 5;
        element = '雷';
        num = rotationTime / ct;
    }
    if (character === 'ガイア') {
        // 霜の襲撃が敵を凍結状態にした場合、凍結された敵から追加の元素粒子が落ちる。1回の霜襲は2つの元素粒子が追加で発生する。
        if (team.members.filter(member => getCharacterMaster(member.name)?.元素 === '水').length) {
            const ct = 6;
            element = '氷';
            num = 2 * rotationTime / ct;
        }
    }
    let result: TERParticle | undefined;
    if (num && element) {
        result = [element, num];
    }
    return result;
}

export function getEnergyByWeapon(
    character: string,
    weapon: string,
    weaponRefine: number,
    team: TTeam,
    rotationTime: number,
    rotationList: TActionItem[] | undefined,
): TEREnergy | undefined {
    const energies = [0, 0, 0, 0];
    const memberNameArr = team.members.map(member => member.name);
    const myIndex = memberNameArr.indexOf(character);
    let unit = 1;
    const eCount = rotationList ? getECount(character, rotationList) : 1;
    const qCount = rotationList ? getQCount(character, rotationList) : 1;
    let myEnergy = 0;
    if (weapon === '金珀·試作') {
        // 元素爆発を発動した後の6秒間、2秒毎に元素エネルギーを4/4.5/5/5.5/6回復し、チーム全員のHPを2秒毎に4%/4.5%/5%/5.5%/6%回復する。
        unit = [4, 4.5, 5, 5.5, 6][weaponRefine - 1];
        myEnergy = unit * 3 * qCount;
    } else if (weapon === '天目影打') {
        // 元素スキルを発動した後、継続時間30秒の継承の印を1つ獲得する。この効果は5秒毎に1回のみ発動可能で、継承の印は同時に最大3つまで存在可能。元素爆発を発動すると、所持している継承の印を全て消費し、消費した継承の印1つにつき、2秒後に該当キャラクターの元素エネルギーを6/7.5/9/10.5/12ポイント回復する。
        unit = [6, 7.5, 9, 10.5, 12][weaponRefine - 1];
        if (qCount) {
            myEnergy = unit * eCount;
        }
    } else if (weapon === '桂木斬長正' || weapon === '喜多院十文字槍') {
        // 元素スキルが命中した時、キャラクターは元素エネルギーを3失う。その後の6秒間、2秒毎に元素エネルギーを3/3.5/4/4.5/5獲得する。この効果は10秒毎に1回のみ発動でき、待機中のキャラクターも発動できる。
        unit = [3, 3.5, 4, 4.5, 5][weaponRefine - 1];
        if (rotationList) {
            let previous = Number.MIN_VALUE;
            for (let i = 0; i < rotationList.length; i++) {
                if (i < previous + 7) { // 10秒毎に1回のみ発動可能
                    continue;
                }
                const rotation = rotationList[i];
                if (rotation.member == character && rotation.action.startsWith('E')) {
                    if (i === 0 || rotationList[i - 1].member != character && rotationList[i - 1].action !== 'Q') {
                        myEnergy -= 3;
                    }
                    myEnergy += unit * 3;
                    previous = i;
                }
            }
        }
    } else if (weapon === '不滅の月華') {
        // 元素爆発を発動した後の12秒間、通常攻撃が敵に命中すると元素エネルギーが0.6ポイント回復する。この方式での元素エネルギー回復は、0.1秒毎に1回のみ可能。
        unit = 0.6;
        if (rotationList) {
            let isBursting = false;
            for (let i = 0; i < rotationList.length; i++) {
                const rotation = rotationList[i];
                if (rotation.member == character) {
                    if (rotation.action === 'Q') {
                        isBursting = true;
                    } else if (isBursting && rotation.action.startsWith('N')) {
                        const n = Number(rotation.action.substring(1) ?? '1');
                        myEnergy += unit * n;
                    }
                } else {
                    isBursting = false;
                }
            }
        }
    } else if (weapon === '碧落の瓏') {
        // 元素爆発を起動、またはシールドを生成した後の3秒間、「定土玉圭」効果を発動する。2.5秒毎に元素エネルギーを4.5/5/5.5/6/6.5回復
        unit = [4.5, 5, 5.5, 6, 6.5][weaponRefine - 1];
        myEnergy = unit * qCount * 20 / 2.5;
    } else if (weapon === '正義の報酬') {
        // 治療を受けた時、元素エネルギーを8/10/12/14/16ポイント回復する。この効果は10秒毎に1回のみ発動可能。キャラクターが待機中でも発動できる。
        unit = [8, 10, 12, 14, 16][weaponRefine - 1];
        myEnergy = unit * qCount;
    } else if (weapon === '久遠流転の大典') {
        // HP上限+16%/20%/24%/28%/32%。現在のHPが増える、または減る時、重撃ダメージ+14%/18%/22%/26%/30%。継続時間4秒、最大3層まで。0.3秒毎に1回のみ発動可能。3層まで重ねた時、または3層の継続時間がリセットされた時、元素エネルギーを8/9/10/11/12ポイント回復する。この方法による元素エネルギーの回復は、12秒に1回のみ。
        unit = [8, 9, 10, 11, 12][weaponRefine - 1];
        myEnergy = unit * qCount;
    } else if (weapon === '船渠剣' || weapon === '携帯型チェーンソー') {
        // 治療効果を受ける、または治療効果を与える時、強靭マークが1枚付与される。継続時間30秒、最大3枚まで。元素スキル、または元素爆発を発動する時、すべての強靭マークを消費し、継続時間10秒の「奮起」効果を獲得する。消費した強靭マーク1枚につき、元素熟知+40/50/60/70/80、さらに「奮起」効果を獲得した2秒後、消費した強靭マーク1枚につき、装備者の元素エネルギーを2/2.5/3/3.5/4ポイント回復する。「奮起」効果は15秒に1回のみ発動可能。キャラクターが待機中でも強靭マークを獲得できる。
        unit = [2, 2.5, 3, 3.5, 4][weaponRefine - 1];
        if (eCount || qCount) {
            myEnergy = unit * 3 * qCount;
        }
    }

    if (myEnergy) {
        energies[myIndex] += myEnergy;
    }

    return energies.filter(e => e > 0).length > 0 ? energies : undefined;
}

export function getParticleByWeapon(
    character: string,
    weapon: string,
    weaponRefine: number,
    rotationTime: number,
    rotationList: TActionItem[] | undefined,
): TERParticle | undefined {
    let result: TERParticle | undefined;
    if (['西風剣', '西風大剣', '西風長槍', '西風猟弓', '西風秘典'].includes(weapon)) {
        const ct = [12, 10.5, 9, 7.5, 6][weaponRefine - 1];
        const num = 3;
        result = ['白', num];
    }
    return result;
}

export function getParticleByArtifact(
    character: string,
    artifactSet1: string | undefined,
    artifactSet2: string | undefined,
    team: TTeam,
    rotationTime: number,
    rotationList: TActionItem[] | undefined,
): TERParticle | undefined {
    let result: TERParticle | undefined;
    if (artifactSet1 && artifactSet2 && artifactSet1 == artifactSet2) { // 4セット効果
        if (['雷のような怒り'].includes(artifactSet1)) {
            // 超電導、過負荷、感電、原激化、超激化または超開花反応を起こした時、100%の確率で雷元素粒子を生成する。クールタイム5秒。
            if (team.members.filter(member => getCharacterMaster(member.name)?.元素 === '雷').length) {
                if (team.members.filter(member => ['氷', '炎', '水', '草'].includes(getCharacterMaster(member.name)?.元素 ?? '--')).length) {
                    const ct = 5;
                    const num = 1 * Math.trunc(rotationTime / ct);
                    result = ['雷', num];
                }
            }
        }
    }
    return result;
}

const CHARACTER_PARTICLE_MAP: { [key: string]: any } = {
    'ヌヴィレット': {
        'E': 0,
    },
    'リネ': {
        'E': 0,
    },
    '白朮': {
        'E': 0,
    },
    'ディシア': {
        'E': 0,
    },
    'アルハイゼン': {
        'E': 0,
    },
    '放浪者': {
        'E': 0,
    },
    'ナヒーダ': {
        'E.Press': 0,
        'E.Hold': 0,
    },
    'ニィロウ': {
        'E': 0,
    },
    'セノ': {
        'E': 0,
    },
    'ティナリ': {
        'E': 0,
    },
    '夜蘭': {
        'E.Press': 0,
        'E.Hold': 0,
    },
    '神里綾人': {
        'E': 0,
    },
    '八重神子': {
        'E': 0,
    },
    '申鶴': {
        'E.Press': 0,
        'E.Hold': 0,
    },
    '荒瀧一斗': {
        'E': 0,
    },
    '珊瑚宮心海': {
        'E': 0,
    },
    '雷電将軍': {
        'E': 0,
    },
    'アーロイ': {
        'E': 5,
    },
    '宵宮': {
        'E': 5,
    },
    '神里綾華': {
        'E': 0,
    },
    '楓原万葉': {
        'E.Press': 0,
        'E.Hold': 0,
    },
    'エウルア': {
        'E.Press': 1.5,
        'E.Hold': 2.5,
    },
    '胡桃': {
        'E': 5,
    },
    '魈': {
        'E': 0,
    },
    '甘雨': {
        'E': 0,
    },
    'アルベド': {
        'E.Press': 0,
        'E.Hold': 0,
    },
    '鍾離': {
        'E.Press': 0,
        'E.Hold': 0,
    },
    'タルタリヤ': {
        'E': 0,
    },
    'クレー': {
        'E': 0,
    },
    'ウェンティ': {
        'E.Press': 0,
        'E.Hold': 0,
    },
    '刻晴': {
        'E.Press': 2.5,
        'E.Hold': 2.5,
    },
    'モナ': {
        'E': 0,
    },
    '七七': {
        'E': 0,
    },
    'ディルック': {
        'E': 0,
    },
    'ジン': {
        'E': 0,
    },
    'フレミネ': {
        'E': 0,
    },
    'リネット': {
        'E.Press': 0,
        'E.Hold': 0,
    },
    '綺良々': {
        'E.Press': 0,
        'E.Hold': 0,
    },
    'カーヴェ': {
        'E': 0,
    },
    'ミカ': {
        'E': 0,
    },
    'ヨォーヨ': {
        'E': 0,
    },
    'ファルザン': {
        'E': 0,
    },
    'レイラ': {
        'E': 0,
    },
    'キャンディス': {
        'E.Press': 0,
        'E.Hold': 0,
    },
    'ドリー': {
        'E': 0,
    },
    'コレイ': {
        'E': 0,
    },
    '鹿野院平蔵': {
        'E': 0,
    },
    '久岐忍': {
        'E': 0,
    },
    '雲菫': {
        'E': 0,
    },
    'ゴロー': {
        'E': 2,
    },
    'トーマ': {
        'E': 0,
    },
    '九条裟羅': {
        'E': 0,
    },
    '早柚': {
        'E': 0,
    },
    '煙緋': {
        'E': 0,
    },
    'ロサリア': {
        'E': 0,
    },
    '辛炎': {
        'E': 0,
    },
    'ディオナ': {
        'E': 0,
    },
    'スクロース': {
        'E': 0,
    },
    '重雲': {
        'E': 0,
    },
    'ノエル': {
        'E': 0,
    },
    'ベネット': {
        'E.Press': 0,
        'E.Hold': 0,
    },
    'フィッシュル': {
        'E': 0,
    },
    '凝光': {
        'E': 0,
    },
    '行秋': {
        'E': 4.5,
    },
    '北斗': {
        'E.Press': 0,
        'E.Hold': 0,
    },
    '香菱': {
        'E': 0,
    },
    'レザー': {
        'E': 0,
    },
    'バーバラ': {
        'E': 0,
    },
    'リサ': {
        'E': 0,
    },
    'ガイア': {
        'E': 0,
    },
    'アンバー': {
        'E': 0,
    },
    '旅人(水)': {
        'E': 0,
    },
    '旅人(草)': {
        'E': 0,
    },
    '旅人(雷)': {
        'E': 0,
    },
    '旅人(岩)': {
        'E': 0,
    },
    '旅人(風)': {
        'E': 0,
    },
}
