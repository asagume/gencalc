import _ from "lodash";
import { TActionItem, TTeamMemberResult, NUMBER_OF_MEMBERS, getCharacterMaster, getCharacterDetail, TMember } from "./team";
import { countQ, RECHARGE_ENERGY_CONSTELLATION, RECHARGE_ENERGY_SKILL, RECHARGE_ENERGY_BURST, countE, countC, RECHARGE_ENERGY_PASSIVE, countN, getCharacterInputValue, getStatsInputValue, RECHARGE_PARTICLE_CONSTELLATION, RECHARGE_PARTICLE_PASSIVE, getMemberResult } from "./ERCalculatorCommon";

export type TCharacterEnergyRet = [string, string, number, number, number, number[], string[]];
export type TCharacterParticleRet = [string, string, string, number, number, number[], string[]];

export const CHARACTER_ENERGY_FUNC: {
    [key: string]: (
        character: string,
        constellation: number,
        members: TMember[],
        rotationLength: number,
        rotationList: TActionItem[] | undefined,
        teamMemberResult?: TTeamMemberResult,
    ) => TCharacterEnergyRet[]
} = {
    '旅人(岩)': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 4;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '岩潮幾重が引き起こす振動波が敵に命中する度に、元素エネルギーが5回復する。この方法で一回で最大25まで回復可能。',
            ];
            const myEnergy = 5 * countQ(character, rotationList);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    '旅人(雷)': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const messages: string[] = [
            '豊穰の勾玉 ・元素エネルギーが回復する。',
            '旅人自身の元素チャージ効率の10%を基準に、雷影剣が生成した豊穰の勾玉による元素チャージ効率をアップする。',
        ];
        const constellationLevel = 4;
        if (constellation >= constellationLevel) {
            messages.push('キャラクターが雷影剣で生成した豊穰の勾玉を獲得した時、該当キャラクターの元素エネルギーが35%未満の場合、豊穰の勾玉で回復できる元素エネルギー+100%。');
        }
        const skillLevel = getCharacterInputValue(character, members, '元素スキルレベル', teamMemberResult);
        const er = getStatsInputValue(character, members, '元素チャージ効率', teamMemberResult);
        const myEnergy = [3, 3, 3, 3.5, 3.5, 3.5, 4, 4, 4, 4, 4, 4, 4, 4, 4][skillLevel - 1] * (100 + (er / 10)) / 100;
        const allEnergy = 0;
        const otherEnergy = 0;
        const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        result.push([RECHARGE_ENERGY_SKILL, '', myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        const messages2 = [
            '身に纏う雷霆 出場している自身のキャラクターの通常攻撃または重撃が敵に命中すると、威光の落雷が発動し、敵に雷元素ダメージを与える。威光の落雷が敵に命中すると、該当キャラクターの元素エネルギーを回復する。威光の落雷の発生は0.5秒毎に1回のみ可能。'
        ];
        const burstLevel = getCharacterInputValue(character, members, '元素爆発レベル', teamMemberResult);
        const somebodyEnergy = [0.8, 0.8, 0.8, 0.9, 0.9, 0.9, 1, 1, 1, 1, 1, 1, 1, 1, 1][burstLevel - 1];
        result.push([RECHARGE_ENERGY_BURST, '', somebodyEnergy, allEnergy, otherEnergy, herEnergies, messages2]);
        return result;
    },
    '旅人(草)': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 1;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '草縁剣が敵に命中すると、旅人の元素エネルギーが3.5回復する。',
            ];
            const myEnergy = 3.5 * countE(character, rotationList);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'ガイア': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 6;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '凛冽なる輪舞の氷柱が1本追加され、発動時に元素エネルギーが15回復する。',
            ];
            const myEnergy = 15 * countQ(character, rotationList);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'リサ': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 1;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '蒼雷を長押しで発動した後、敵に命中する度にリサの元素エネルギーが2回復する。一回で最大10まで回復可能。',
            ];
            const myEnergy = 2 * countE(character, rotationList, 'E.Hold');
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'バーバラ': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        let constellationLevel = 1;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '10秒毎に元素エネルギーを1回復する。',
            ];
            const myEnergy = 1 * Math.trunc(rotationLength / 10);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        constellationLevel = 4;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '重撃が敵に命中する度に、バーバラの元素エネルギーが1回復する。一回で最大元素エネルギーが5まで回復できる。',
            ];
            const myEnergy = 1 * countC(character, rotationList);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'レザー': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const messages: string[] = [
            '無形の雷狼を召喚して自身を守り、周囲の敵に雷元素ダメージを与える。同時に、雷の印を消耗して自身の元素エネルギーを回復する。退場時、残り時間を基準に、元素エネルギーを最大10まで回復する。',
        ];
        const myEnergy = 0;
        const allEnergy = 0;
        const otherEnergy = 0;
        const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        result.push([RECHARGE_ENERGY_BURST, '', myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        return result;
    },
    '行秋': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 6;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '古華剣·裁雨留虹が剣雨攻撃を2回発動する度に、次の剣雨攻撃が大幅に強化され、敵に命中する時行秋の元素エネルギーを3回復する。',
            ];
            const nCount = rotationList?.length ? Math.trunc(rotationList.filter(rotation => rotation.action.startsWith('N')).length / 3) : 1;
            const myEnergy = 3 * nCount;
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    '重雲': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 4;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '重雲の攻撃が氷元素の影響を受けた敵に命中した時、自身の元素エネルギーを1回復する。この効果は2秒毎に1回のみ発動可能。',
            ];
            const myEnergy = 1;
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'ディオナ': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 1;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '特製スピリッツの効果終了時、ディオナの元素エネルギーを15回復する。',
            ];
            const myEnergy = 15 * countQ(character, rotationList);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'ロサリア': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 4;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '罪喰いの懺悔で会心が発生すると、ロサリア自身の元素エネルギーが5回復する。この効果は、1回の罪喰いの懺悔で1度のみ発動可能。',
            ];
            const myEnergy = 5;
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    '早柚': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 4;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '早柚がフィールド上で拡散反応を起こした時、元素エネルギーを1.2ポイント回復する。この効果は2秒毎に1回のみ発動可能。',
            ];
            const myEnergy = 1.2;
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    '九条裟羅': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const messages: string[] = [
            '天狗呪雷·伏は敵に命中すると、九条裟羅の元素チャージ効率を基準にし、その100%の元素チャージ効率毎に、チーム全員の元素エネルギーを1.2回復する。この効果は3秒毎に1回のみ発動可能。',
        ];
        const er = getStatsInputValue(character, members, '元素チャージ効率', teamMemberResult);
        const myEnergy = 0;
        const allEnergy = 1.2 * er / 100 * countE(character, rotationList);
        const otherEnergy = 0;
        const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        result.push([RECHARGE_ENERGY_PASSIVE, '御公儀', myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        return result;
    },
    'トーマ': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 4;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '真紅熾炎の大鎧を発動すると、トーマの元素エネルギーを15ポイント回復する。',
            ];
            const myEnergy = 15 * countQ(character, rotationList);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    '鹿野院平蔵': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 4;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '一回の廻風蹴で発生した「廻風真眼」が初めて爆発する時、鹿野院平蔵自身の元素エネルギーを9回復する。その後、爆発するたびに追加で元素エネルギーを1.5回復する。この方法により一回の廻風蹴で回復できる元素エネルギーは、最大13.5まで。',
            ];
            const myEnergy = 9 * countQ(character, rotationList);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'ドリー': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const messages: string[] = [
            'ジンニーランプ·トラブルシューターのトラブルシューター砲またはアフターサービス弾が敵に命中すると、ドリーの元素チャージ効率を基準にし、その100%の元素チャージ効率毎にドリーの元素エネルギーを5回復する。ジンニーランプ·トラブルシューター1回につき、この方式で回復できる元素エネルギーは15まで。',
        ];
        const er = getStatsInputValue(character, members, '元素チャージ効率', teamMemberResult);
        const myEnergy = Math.min(15, 5 * er / 100) * countE(character, rotationList);
        const allEnergy = 0;
        const otherEnergy = 0;
        const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        result.push([RECHARGE_ENERGY_PASSIVE, '砂だるま式利子', myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        const burstLevel = getCharacterInputValue(character, members, '元素爆発レベル', teamMemberResult);
        const somebodyEnergy = [1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5][burstLevel - 1];
        const messages2 = [
            'ランプの精 近くにいるキャラクターとリンクする。ランプの精とリンクしたキャラクターに下記効果を与える。・持続的に元素エネルギーを回復する。'
        ];
        result.push([RECHARGE_ENERGY_BURST, '', somebodyEnergy, allEnergy, otherEnergy, herEnergies, messages2]);
        return result;
    },
    'レイラ': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 2;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '垂裳凛然の夜が発射した飛星が敵に命中すると、レイラの元素エネルギーを1ポイント回復させる。この方法を通して、各飛星はレイラの元素エネルギーを最大で1回のみ回復できる。',
            ];
            const myEnergy = 1;
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'ファルザン': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 4;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '命中した敵の数に基づき、風圧崩潰のサイクロンはファルザンの元素エネルギーを回復する。1体の敵に命中した場合、ファルザンの元素エネルギーを2ポイント回復する。また、追加で1体の敵に命中するたびに、ファルザンの元素エネルギーが0.5ポイント回復する。この方法により1回のサイクロンで回復できる元素エネルギーは最大4ポイントまで。',
            ];
            const myEnergy = 2 * (constellation >= 6 ? Math.trunc(rotationLength / 3) : Math.min(countE(character, rotationList) * 2, countC(character, rotationList)));
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'ヨォーヨ': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 2;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '玉颗珊々月中落の桂子仙機状態にある時、白玉大根の爆発が敵に命中すると、ヨォーヨの元素エネルギーを3ポイント回復する。この方法による元素エネルギーの回復は、0.8秒毎に1回のみ可能。',
            ];
            const myEnergy = 3;
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'ミカ': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 4;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                'ミカ自身によるスカイフェザーソングの鷹の羽状態がチームにいるキャラクターのHPを回復した時、ミカの元素エネルギーを3回復する。1回のスカイフェザーソングの鷹の羽状態で、元素エネルギーは最大5回まで回復できる。',
            ];
            const myEnergy = 3 * 5 * countQ(character, rotationList);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'フレミネ': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 2;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                'プレッシャー·フロウ·高圧粉砕を発動すると、フレミネの元素エネルギーが2ポイント回復する。ランク4の高圧粉砕を発動すると、元素エネルギーの回復量が3ポイントに変わる。',
            ];
            const myEnergy = 2 * countE(character, rotationList);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'ジン': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const messages: string[] = [
            '蒲公英の風発動後、元素エネルギーが20%回復する。',
        ];
        const myEnergy = 80 * 0.2 * countQ(character, rotationList);
        const allEnergy = 0;
        const otherEnergy = 0;
        const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        result.push([RECHARGE_ENERGY_PASSIVE, '風の導くままに', myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        return result;
    },
    '七七': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 1;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '度厄のお札マークがついている敵に寒病鬼差が命中した時、七七の元素エネルギーを2回復する。',
            ];
            const myEnergy = 1;
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'ウェンティ': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const messages: string[] = [
            '風神の詩効果終了後、ウェンティの元素エネルギーを15回復する。元素変化があった場合、該当元素のチームメンバーの元素エネルギーを15回復する。',
        ];
        const qCount = countQ(character, rotationList);
        const myEnergy = 15 * qCount;
        const allEnergy = 0;
        const otherEnergy = 0;
        const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        for (const element of ['炎', '水', '雷', '氷']) {
            let doBreak = false;
            for (let herIndex = 0; herIndex < members.length; herIndex++) {
                const herCm = getCharacterMaster(members[herIndex].name);
                if (herCm?.元素 == element) {
                    herEnergies[herIndex] = myEnergy;
                    doBreak = true;
                }
            }
            if (doBreak) break;
        }
        result.push([RECHARGE_ENERGY_PASSIVE, '暴風の目', myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        return result;
    },
    'クレー': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const messages: string[] = [
            'クレーの重撃が会心を発生すると、チーム全員の元素エネルギーが2回復する。',
        ];
        const myEnergy = 2;
        const allEnergy = 0;
        const otherEnergy = 0;
        const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        result.push([RECHARGE_ENERGY_PASSIVE, '無限花火', myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        const constellationLevel = 6;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                'ドッカン花火状態中、クレーは3秒毎にチーム全員（クレー自身を除く）の元素エネルギーを3回復する。',
            ];
            const myEnergy = 0;
            const allEnergy = 0;
            const otherEnergy = 3;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'アルベド': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 1;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                'アルベドの創生術·擬似陽華の刹那の花が放たれた時、アルベド自身の元素エネルギーが1.2回復する。',
            ];
            const myEnergy = 1.2 * (countE(character, rotationList) ? Math.trunc(rotationLength / 2) : 1);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    '甘雨': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 1;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '二段チャージ重撃の霜華の矢または霜華満開が命中した時、敵の氷元素耐性-15%、継続時間6秒。命中時に甘雨の元素エネルギーを2回復。二段チャージの重撃による元素エネルギーの回復効果は、1回の重撃で1度のみ発動可能。',
            ];
            const myEnergy = 2 * countC(character, rotationList);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    '楓原万葉': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 4;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '楓原万葉の元素エネルギーが45以下の時、下記の効果を獲得する。・一回押し/長押しで千早振るを発動した時、元素エネルギーを3/4回復する。・滑翔状態の時、1秒毎に元素エネルギーを2回復する。',
            ];
            const myEnergy = 3;
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    '雷電将軍': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const messages: string[] = [
            '攻撃が敵に命中すると、周囲のチーム全員の元素エネルギーを回復する。この方式での元素エネルギー回復は1秒毎に1回のみ可能で、継続時間内に最大5回まで発動可能。',
            '元素チャージ効率が100%を超えている場合、超えた分1%につき、雷電将軍は下記の効果を獲得する。・夢想の一心状態で提供する元素エネルギー回復+0.6%。',
        ];
        const er = getStatsInputValue(character, members, '元素チャージ効率', teamMemberResult);
        let unit = 2.3 * (1 + (er - 100) * 0.006);
        let unit2 = 0;
        const memberResult = getMemberResult(character, members, teamMemberResult);
        memberResult.damageResult.元素爆発.forEach(entry => {
            if (entry[0] === '夢想の一心エネルギー回復') {
                unit = entry[2];
            } else if (entry[0] === '非表示_夢想の一心エネルギー回復') {
                unit2 = entry[2];
            }
        })
        if (memberResult.characterInput.weapon === '草薙の稲光') {
            unit2 *= [30, 35, 40, 45, 50][memberResult.characterInput.武器精錬ランク - 1] * 0.006;
        }
        const myEnergy = 0;
        const allEnergy = (unit + unit2) * 5 * countQ(character, rotationList);
        const otherEnergy = 0;
        const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        result.push([RECHARGE_ENERGY_BURST, '', myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        return result;
    },
    '珊瑚宮心海': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 4;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '海人の羽衣による儀来羽衣状態の時、珊瑚宮心海の通常攻撃の攻撃速度+10%。そして通常攻撃が敵に命中すると、元素エネルギーを0.8ポイント回復する。この効果は0.2秒毎に1回のみ発動可能。',
            ];
            const myEnergy = 0.8 * countN(character, rotationList, true);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    '荒瀧一斗': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 2;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '最凶鬼王·一斗轟臨！！を発動した後、チーム内に岩元素タイプキャラクターが1人いる毎に、クールタイム-1.5秒、荒瀧一斗の元素エネルギーを6ポイント回復する。この方式で短縮できるクールタイムは4.5秒までとなり、回復できる元素エネルギーは18ポイントまでとなる。',
            ];
            const geoCount = members.filter(member => getCharacterMaster(member.name)?.元素 === '岩').length;
            const myEnergy = Math.min(18, 6 * geoCount) * countQ(character, rotationList);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    '八重神子': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 1;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '大密法·天狐顕現で天狐雷霆を1回発生させるたびに、八重神子自身の元素エネルギーを8ポイント回復する。',
            ];
            const myEnergy = 3 * 8 * countQ(character, rotationList);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    '神里綾人': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const messages: string[] = [
            '神里綾人が待機中の時、元素エネルギーが40未満の場合、1秒毎に元素エネルギーを2回復する。',
        ];
        const myEnergy = 2;
        const allEnergy = 0;
        const otherEnergy = 0;
        const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        result.push([RECHARGE_ENERGY_PASSIVE, '神里流·満ちゆく破月', myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        return result;
    },
    'セノ': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 4;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '聖儀·狼駆憑走の啓途誓使状態の時、感電、超電導、過負荷、原激化、超激化、超開花または雷元素拡散反応を起こすと、周囲のチーム全員（セノ自身を除く）の元素エネルギーを3回復する。この効果は一回の聖儀·狼駆憑走で、最大5回まで発動できる。',
            ];
            const myEnergy = 0;
            const allEnergy = 0;
            const otherEnergy = 3 * 5 * countQ(character, rotationList);
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'ニィロウ': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 4;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '七域のダンスのピルエット状態の3段目のステップが敵に命中すると、ニィロウの元素エネルギーが15回復する。',
            ];
            const myEnergy = 15 * countE(character, rotationList);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    '放浪者': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const messages: string[] = [
            '拾玉得花(雷元素)：通常攻撃および重撃が敵に命中した後、元素エネルギーが0.8ポイント回復する。この方式による元素エネルギー回復は、0.2秒毎に1回のみ可能。',
        ];
        const electroCount = members.filter(member => getCharacterDetail(member.name)?.元素 === '雷').length;
        const myEnergy = electroCount > 0 ? 0.8 * (countN(character, rotationList) + countC(character, rotationList)) : 0;
        const allEnergy = 0;
        const otherEnergy = 0;
        const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        result.push([RECHARGE_ENERGY_PASSIVE, '拾玉得花', myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        return result;
    },
    'ディシア': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 4;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '炎哮獅子咬の熾鬣拳、または残火蹴が敵に命中した時、ディシアの元素エネルギーを1.5回復。この効果は0.2秒毎に1回のみ発動可能。',
            ];
            const myEnergy = 1.5;
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'リネ': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const messages: string[] = [
            'リネがプロップアローを発射することでHPを消費した時、そのプロップアローによって召喚されたファニーキャット·ハットが敵に命中すると、リネの元素エネルギーが3ポイント回復',
        ];
        const myEnergy = 3;
        const allEnergy = 0;
        const otherEnergy = 0;
        const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        result.push([RECHARGE_ENERGY_PASSIVE, '息を呑むパフォーマンス', myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        return result;
    },
    'フリーナ': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 4;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                'サロン·ソリティアの「サロンメンバー」が攻撃を敵に命中させたり、「衆の水の歌い手」が周囲のフィールド上にいるキャラクターのHPを回復したりすると、フリーナは元素エネルギーを4ポイント獲得する。この効果は5秒毎に1回のみ発動可能。',
            ];
            const myEnergy = 4 * Math.trunc(rotationLength / 5);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'シャルロット': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 4;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                'スチルフォト·多角的立証が「スナップシルエット」、または「フォーカスインプレッション」マークが付いている敵に命中したとき、与えるダメージ+10%。また、シャルロットが元素エネルギーを2ポイント回復する。この方法での元素エネルギー回復は20秒毎に5回のみ可能。',
            ];
            const myEnergy = 2;
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
    'ナヴィア': (character, constellation, members, rotationLength, rotationList, teamMemberResult) => { // eslint-disable-line
        const result: TCharacterEnergyRet[] = [];
        const constellationLevel = 1;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                'セレモニアル·クリスタルショット発動時、「裂晶の欠片」を1個消費するごとに、ナヴィアは元素エネルギーを3ポイント回復し、晴天を衝く霰弾のサルートのクールタイムｰ1秒。この方法による元素エネルギー回復は最大9ポイント、短縮できるクールタイムは最大3秒まで。',
            ];
            const myEnergy = 3 * 3 * countE(character, rotationList);
            const allEnergy = 0;
            const otherEnergy = 0;
            const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            result.push([RECHARGE_ENERGY_CONSTELLATION, String(constellationLevel), myEnergy, allEnergy, otherEnergy, herEnergies, messages]);
        }
        return result;
    },
}

export const CHARACTER_PARTICLE_EXTRA_FUNC: {
    [key: string]: (
        character: string,
        constellation: number,
        members: TMember[],
        rotationLength: number,
        rotationList: TActionItem[] | undefined,
        onFields: number[],
    ) => TCharacterParticleRet | undefined
} = {
    'ガイア': (character, constellation, members, rotationLength, rotationList, onFields) => { // eslint-disable-line
        let result: TCharacterParticleRet | undefined = undefined;
        const messages: string[] = [
            '霜の襲撃が敵を凍結状態にした場合、凍結された敵から追加の元素粒子が落ちる。1回の霜襲は2つの元素粒子が追加で発生する。',
        ];
        const hydroCount = members.filter(member => getCharacterMaster(member.name)?.元素 === '水').length;
        const myParticle = hydroCount > 0 ? 2 * countE(character, rotationList) : 2;
        const allParticle = 0;
        result = [RECHARGE_PARTICLE_PASSIVE, '', '氷', myParticle, allParticle, [], messages];
        return result;
    },
    'フィッシュル': (character, constellation, members, rotationLength, rotationList, onFields) => { // eslint-disable-line
        let result: TCharacterParticleRet | undefined = undefined;
        const constellationLevel = 6;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                'オズは出場している自身のキャラクターと共に攻撃し、攻撃力30%分の雷元素ダメージを与える。',
            ];
            const myParticle = 0;
            const allParticle = rotationList?.length ? (2 / 3) * countN(undefined, rotationList) : 1;
            result = [RECHARGE_PARTICLE_CONSTELLATION, String(constellationLevel), '雷', myParticle, allParticle, [], messages];
        }
        return result;
    },
    '刻晴': (character, constellation, members, rotationLength, rotationList, onFields) => { // eslint-disable-line
        let result: TCharacterParticleRet | undefined = undefined;
        const constellationLevel = 2;
        if (constellation >= constellationLevel) {
            const messages: string[] = [
                '刻晴の通常攻撃と重撃が雷元素の影響を受けた敵に命中した時、50%の確率で元素粒子を1個生成する。5秒毎に1回のみ発動可能。',
            ];
            const myParticle = 0;
            const allParticle = 0;
            const herParticles = _.fill(Array(NUMBER_OF_MEMBERS), 0);
            let triggerCnt = 1;
            if (rotationList?.length) {
                const ct = 5;
                const rindexArr: number[] = [];
                let isRecorded = false;
                for (let i = 0; i < rotationList.length; i++) {
                    const rotation = rotationList[i];
                    if (rotation.member == character) {
                        if (rotation.action.startsWith('N') && !isRecorded) {
                            rindexArr.push(i);
                            isRecorded = true;
                        }
                    } else {
                        isRecorded = false;
                    }
                }
                const memberNameArr = members.map(member => member.name);
                const onField = onFields[memberNameArr.indexOf(character)];
                triggerCnt = Math.min(Math.trunc(rotationLength / ct), rindexArr.length + Math.max(0, Math.trunc(rotationLength * onField / 100 / ct) - 1));
                for (let i = 0; i < triggerCnt; i++) {
                    let nxtCharacter = character;
                    if (i < rindexArr.length && (rindexArr[i] + 1) < rotationList.length) {
                        nxtCharacter = rotationList[rindexArr[i] + 1].member;
                    }
                    const toIndex = memberNameArr.indexOf(nxtCharacter);
                    herParticles[toIndex] += 1;
                }
            }
            result = [RECHARGE_PARTICLE_CONSTELLATION, String(constellationLevel), '雷', myParticle, allParticle, herParticles, messages];
        }
        return result;
    },
}
