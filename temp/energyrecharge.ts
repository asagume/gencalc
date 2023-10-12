import { TCharacterDetail } from "@/master";
import { TActionItem, TTeam } from "./team";

const E_PRESS_PARTICLES = new Map<String, Number>([
])
const E_HOLD_PARTICLES = new Map<String, Number>([
])

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

const getCharacterDetail = (character: string, characterDetailMap: Map<String, TCharacterDetail>): TCharacterDetail | undefined => {
    return characterDetailMap.get(character) ?? undefined;
};

export const energyFromMyself = (name: string, rotationList: TActionItem[], team: TTeam, characterDetailMap: Map<String, TCharacterDetail>) => {
    let energy = 0;
    const member = getTeamMember(name, team);
    const constellation = member && member.builddata ? member.builddata.命ノ星座 : 0;
    if (name === 'ジン') {
        const qCount = getQCount(name, rotationList);
        energy = 80 * 0.2 * qCount; // +16/元素爆発
    } else if (name === '七七' && constellation >= 1) {
        energy = 2 * 0;
    } else if (name === 'ガイア' && constellation >= 6) {
        const qCount = getQCount(name, rotationList);
        energy = 15 * qCount; // +15/元素爆発
    } else if (name === 'リサ' && constellation >= 1) {
        const eCount = getECount(name, rotationList, 'E.Hold');
        energy = 2 * eCount; // +2/元素スキル長押し
    } else if (name === 'バーバラ') {
        energy = 1 * rotationList.length / 7; // +1/10秒
        if (constellation >= 4) {
            const cCount = getCCount(name, rotationList);
            energy += 1 * cCount; // +1/重撃
        }
    } else if (name === '行秋' && constellation >= 6) {
        const qCount = getQCount(name, rotationList);
        if (qCount) {
            let n = 0;
            rotationList.forEach(rotation => {
                if (rotation.action.startsWith('N')) {
                    n++;
                }
            })
            energy = 3 * n / 3;
        }
    } else if (name === 'レザー') {
        energy = 0;
    } else if (name === '重雲' && constellation >= 4) {
        energy = 0;
    } else if (name === 'ウェンティ') {
        const qCount = getQCount(name, rotationList);
        energy = 15 * qCount; // +15/元素爆発
    } else if (name === 'クレー') {
        const critRate = 100; // FIXME
        const cCount = getCCount(name, rotationList);
        energy = 2 * critRate / 100 * cCount; // +2/重撃会心
    } else if (name === 'ディオナ') {
        const qCount = getQCount(name, rotationList);
        energy = 15 * qCount; // +15/元素爆発
    } else if (name === '甘雨' && constellation >= 1) {
        const cCount = getCCount(name, rotationList);
        energy = 2 * cCount; // +2/重撃
    } else if (name === 'ロサリア' && constellation >= 4) {
        let critRate = 100; // FIXME
        critRate = Math.min(100, critRate + Math.max(0, 100 - critRate) * critRate / 100);
        const eCount = getECount(name, rotationList);
        energy = 5 * critRate / 100 * eCount; // +5/元素スキル会心
    } else if (name === '楓原万葉' && constellation >= 4) {
        energy = 0;
    } else if (name === '旅人(雷)') {
        energy = 0;
    } else if (name === '雷電将軍') {
        energy = 0;
    } else if (name === '九条裟羅') {
        const er = 100; // FIXME
        const eCount = getECount(name, rotationList);
        energy = 1.2 * er / 100 * eCount;
    } else if (name === '珊瑚宮心海' && constellation >= 4) {
        let qi = Number.MIN_VALUE;
        for (let i = 0; i < rotationList.length; i++) {
            const rotation = rotationList[i];
            if (rotation.member == name && rotation.action === 'Q') {
                qi = i;
            } else if (i < qi + 7) { // 海人の羽衣による儀来羽衣状態
                if (rotation.member == name && rotation.action.startsWith('N')) {
                    const n = Number(rotation.action.substring(1) ?? '1');
                    energy += 0.8 * n;
                }
            }
        }
    } else if (name === '早柚' && constellation >= 4) {
        energy = 1.2 * 0;
    } else if (name === '八重神子' && constellation >= 1) {
        const qCount = getQCount(name, rotationList);
        energy = 8 * 3 * qCount;
    } else if (name === '荒瀧一斗' && constellation >= 2) {
        const geoCount = team.members.filter(member => getCharacterDetail(member.name, characterDetailMap)?.元素 === '岩').length;
        energy = Math.min(18, 6 * geoCount);
    } else if (name === 'トーマ' && constellation >= 4) {
        const qCount = getQCount(name, rotationList);
        energy = 15 * qCount; // +15/元素爆発
    } else if (name === '神里綾人') {
        let qi = Number.MIN_VALUE;
        for (let i = 0; i < rotationList.length; i++) {
            const rotation = rotationList[i];
            if (rotation.member == name && rotation.action === 'Q') {
                qi = i;
            } else if (rotation.member != name && i < qi + 7) {
                energy += 2;
            }
        }
    } else if (name === '鹿野院平蔵' && constellation >= 4) {
        energy = 9;
    } else if (name === '旅人(草)' && constellation >= 1) {
        const eCount = getECount(name, rotationList);
        energy = 3.5 * eCount;
    } else if (name === 'ニィロウ' && constellation >= 4) {
        let ei = Number.MIN_VALUE;
        for (let i = 0; i < rotationList.length; i++) {
            const rotation = rotationList[i];
            if (rotation.member == name && rotation.action === 'E') {
                if (ei < 0) {
                    energy += 15;
                }
                ei = i;
            } else if (rotation.member != name) {
                ei = Number.MIN_VALUE;
            }
        }
    } else if (name === 'ドリー') {
        const er = 100; // FIXME
        const eCount = getECount(name, rotationList);
        energy = Math.min(15, 5 * er / 100 * eCount);
    } else if (name === '放浪者') {
        const electroCount = team.members.filter(member => getCharacterDetail(member.name, characterDetailMap)?.元素 === '雷').length;
        if (electroCount) {
            const nCount = rotationList.filter(rotation => rotation.member == name && rotation.action.startsWith('N')).reduce((sum, rotation) => sum + Number(rotation.action.substring(1) ?? '1'), 0);
            const cCount = getCCount(name, rotationList);
            energy = 0.8 * (nCount + cCount);
        }
    } else if (name === 'ミカ' && constellation >= 4) {
        energy = 3 * 5;
    } else if (name === 'レイラ' && constellation >= 2) {
        energy = 1 * 0;
    } else if (name === 'ヨォーヨ' && constellation >= 2) {
        energy = 3 * 0;
    } else if (name === 'ファルザン' && constellation >= 4) {
        energy = 0.5 * 0;
    } else if (name === 'ディシア') {
        energy = 1.5 * 0;
    } else if (name === 'リネ') {
        energy = 0;
    } else if (name === 'フレミネ' && constellation >= 2) {
        energy = 0;
    }
    return Math.round(energy * 10) / 10;
}

export const energyFromFellow = (name: string) => {
    let energy = 0;


    return Math.round(energy * 10) / 10;
}

export const energyFromWeapon = (name: string, rotationList: TActionItem[], team: TTeam) => {
    let energy = 0;
    const member = getTeamMember(name, team);
    if (member && member.builddata) {
        const weapon = member.builddata.武器;
        const rank = member.builddata.武器精錬ランク;
        if (weapon === '金珀·試作') {
            // 元素爆発を発動した後の6秒間、2秒毎に元素エネルギーを4/4.5/5/5.5/6回復し、チーム全員のHPを2秒毎に4%/4.5%/5%/5.5%/6%回復する。
            const qCount = getQCount(name, rotationList);
            if (qCount) {
                energy = [0, 4, 4.5, 5, 5.5, 6][rank] * 3 * qCount;
            }
        } else if (weapon === '天目影打') {
            // 元素スキルを発動した後、継続時間30秒の継承の印を1つ獲得する。この効果は5秒毎に1回のみ発動可能で、継承の印は同時に最大3つまで存在可能。元素爆発を発動すると、所持している継承の印を全て消費し、消費した継承の印1つにつき、2秒後に該当キャラクターの元素エネルギーを6/7.5/9/10.5/12ポイント回復する。
            const eCount = getECount(name, rotationList);
            const qCount = getQCount(name, rotationList);
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
                if (rotation.member == name && rotation.action.startsWith('E')) {
                    if (i === 0 || rotationList[i - 1].member != name && rotationList[i - 1].action !== 'Q') {
                        energy -= 3;
                    }
                    energy += [0, 3, 3.5, 4, 4.5, 5][rank] * 3;
                    previous = i;
                }
            }
        } else if (weapon === '不滅の月華') {
            // 元素爆発を発動した後の12秒間、通常攻撃が敵に命中すると元素エネルギーが0.6ポイント回復する。この方式での元素エネルギー回復は、0.1秒毎に1回のみ可能。
            let qi = Number.MIN_VALUE;
            for (let i = 0; i < rotationList.length; i++) {
                const rotation = rotationList[i];
                if (rotation.member == name && rotation.action === 'Q') {
                    qi = i;
                } else if (i < qi + 9) { // 元素爆発を発動した後の12秒間
                    if (rotation.member == name && rotation.action.startsWith('N')) {
                        const n = Number(rotation.action.substring(1) ?? '1');
                        energy += 0.6 * n;
                    }
                }
            }
        } else if (weapon === '碧落の瓏') {
            // 元素爆発を起動、またはシールドを生成した後の3秒間、「定土玉圭」効果を発動する。2.5秒毎に元素エネルギーを4.5/5/5.5/6/6.5回復
            energy = [0, 4.5, 5, 5.5, 6, 6.5][rank] * rotationList.length / 2;
        } else if (weapon === '正義の報酬') {
            // 治療を受けた時、元素エネルギーを8/10/12/14/16ポイント回復する。この効果は10秒毎に1回のみ発動可能。キャラクターが待機中でも発動できる。
            energy = [0, 8, 10, 12, 14, 16][rank] * rotationList.length / 8;
        } else if (weapon === '久遠流転の大典') {
            // HP上限+16%/20%/24%/28%/32%。現在のHPが増える、または減る時、重撃ダメージ+14%/18%/22%/26%/30%。継続時間4秒、最大3層まで。0.3秒毎に1回のみ発動可能。3層まで重ねた時、または3層の継続時間がリセットされた時、元素エネルギーを8/9/10/11/12ポイント回復する。この方法による元素エネルギーの回復は、12秒に1回のみ。
            energy = [0, 8, 9, 10, 11, 12][rank] * rotationList.length / 9;
        } else if (weapon === '船渠剣' || weapon === '携帯型チェーンソー') {
            // 治療効果を受ける、または治療効果を与える時、強靭マークが1枚付与される。継続時間30秒、最大3枚まで。元素スキル、または元素爆発を発動する時、すべての強靭マークを消費し、継続時間10秒の「奮起」効果を獲得する。消費した強靭マーク1枚につき、元素熟知+40/50/60/70/80、さらに「奮起」効果を獲得した2秒後、消費した強靭マーク1枚につき、装備者の元素エネルギーを2/2.5/3/3.5/4ポイント回復する。「奮起」効果は15秒に1回のみ発動可能。キャラクターが待機中でも強靭マークを獲得できる。
            const eCount = getECount(name, rotationList);
            const qCount = getQCount(name, rotationList);
            if (eCount || qCount) {
                energy = [0, 2, 2.5, 3, 3.5, 4][rank] * 3;
            }
        }
    }
    return Math.round(energy * 10) / 10;
}

