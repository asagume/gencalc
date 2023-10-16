import _ from "lodash";
import { TActionItem, TTeam, TTeamMemberResult, getCharacterDetail, getCharacterMaster } from "./team";

export const RECHARGE_DIRECT = "0";
export const RECHARGE_PARTICLE_SKILL = "1";
export const RECHARGE_PARTICLE_TURRET = "2";
export const RECHARGE_PARTICLE_FAVONIUS = "6";
export const RECHARGE_PARTICLE_RESONANCE = "8";
export const RECHARGE_PARTICLE_ENEMY = "9";

export const CHARACTER_ENERGY = 'CHARACTER_ENERGY';
export const WEAPON_ENERGY = 'WEAPON_ENERGY';
export const CHARACTER_PARTICLE = 'CHARACTER_PARTICLE';
export const WEAPON_PARTICLE = 'WEAPON_PARTICLE'; // 西風
export const RESONANCE_PARTICLE = 'RESONANCE_PARTICLE'; // 雷元素共鳴
export const ENEMY_PARTICLE = 'ENEMY_PARTICLE';

export type TEREnergy = [number, number, number, number, string[]];
export type TERParticle = [string, string, number, number, number, number];

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

export function getOnFieldRate(team: TTeam, rotationLength: number, rotationList: TActionItem[]) {
    let result = [0, 0, 0, 0];
    const memberNameArr = team.members.map(member => member.name);
    if (rotationList?.length) {
        result = [0, 0, 0, 0];
        const multiple = Math.ceil(100 / rotationLength);
        const lengthList = [0, 0, 0, 0];
        let curCharacter;
        let length = 0;
        for (let i = 0; i < rotationList.length; i++) {
            const rotation = rotationList[i];
            const characterMaster = getCharacterMaster(rotation.member);
            if (curCharacter && rotation.member != curCharacter) {
                lengthList[memberNameArr.indexOf(curCharacter)] += (length > 1 ? length : 1);
                length = 0;
            }
            if (rotation.action === 'Q') {
                length += 1;
                if (characterMaster?.レアリティ && characterMaster.レアリティ === 5) {
                    length += 0.5;
                }
            } else if (rotation.action === 'E.Hold') {
                length += 1;
            } else if (['E', 'E.Press'].includes(rotation.action)) {
                length += 0.5;
            } else if (rotation.action.startsWith('N')) {
                const dan = Number(rotation.action.substring(1, 2)) ?? 1;
                const withC = rotation.action.endsWith('C');
                if (characterMaster?.武器 === '片手剣') {
                    if (rotation.action == 'N' && rotation.member === '神里綾人') {
                        length += 6;
                    } else {
                        length += dan * 0.3 + (withC ? 0.5 : 0);
                    }
                } else if (characterMaster?.武器 === '長柄武器') {
                    length += dan * 0.3 + (withC ? 0.5 : 0);
                } else if (characterMaster?.武器 === '両手剣') {
                    length += dan * 0.5;
                } else if (characterMaster?.武器 === '弓') {
                    length += dan * 0.3;
                } else if (characterMaster?.武器 === '法器') {
                    length += dan * 0.5;
                }
            } else if (rotation.action == 'C') {
                if (characterMaster?.武器 === '両手剣') {
                    length += 3;
                } else if (characterMaster?.武器 === '弓') {
                    length += 1.5;
                } else if (characterMaster?.武器 === '法器') {
                    if (rotation.member === 'ヌヴィレット') {
                        length += 3;
                    } else {
                        length += 1;
                    }
                }
            }
            curCharacter = rotation.member;
        }
        if (curCharacter && length > 0) {
            lengthList[memberNameArr.indexOf(curCharacter)] += (length > 1 ? length : 1);
        }
        const lengthSum = _.sum(lengthList);
        for (let i = 0; i < result.length; i++) {
            if (lengthSum && i < lengthList.length) {
                result[i] = Math.ceil(lengthList[i] / lengthSum * 100 / multiple) * multiple;
            } else {
                result[i] = 25;
            }
        }
        const sumVal = _.sum(result);
        if (sumVal > 100) {
            const maxVal = _.max(result);
            for (let i = 0; i < result.length; i++) {
                if (result[i] == maxVal) {
                    result[i] -= sumVal - 100;
                    break;
                }
            }
        }
    } else {
        const memberNum = memberNameArr.filter(name => name).length;
        if (memberNum) {
            for (const name of memberNameArr.filter(name => name)) {
                result[memberNameArr.indexOf(name)] = 100 / memberNum;
            }
        }
    }
    return result;
}

export function getEnergyByCharacter(
    character: string,
    constellation: number,
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[] | undefined,
    teamMemberResult: TTeamMemberResult | undefined,
): TEREnergy | undefined {
    const energies = [0, 0, 0, 0];
    const messages: string[] = [];
    const memberNameArr = team.members.map(member => member.name);
    const myIndex = memberNameArr.indexOf(character);
    const member = team.members[myIndex];
    const eCount = rotationList ? getECount(character, rotationList) : 1;
    const qCount = rotationList ? getQCount(character, rotationList) : 1;
    const memberResult = teamMemberResult ? teamMemberResult[member.id] : undefined;
    let myEnergy = 0; // 自分の元素エネルギー
    let allEnergy = 0; // 全員の元素エネルギー
    let otherEnergy = 0; // 自分以外全員の元素エネルギー
    const herEnergies: number[] = []; // 誰かの元素エネルギー
    const herIndeces: number[] = []; // 誰かのインデックス
    otherEnergy = 0;
    if (!character) {
        return undefined;
    } else if (character === 'ヌヴィレット') {
        myEnergy = 0;
    } else if (character === 'リネ') {
        messages.push('リネがプロップアローを発射することでHPを消費した時、そのプロップアローによって召喚されたファニーキャット·ハットが敵に命中すると、リネの元素エネルギーが3ポイント回復');
        myEnergy = 3;
    } else if (character === '白朮') {
        myEnergy = 0;
    } else if (character === 'ディシア' && constellation >= 4) {
        messages.push('炎哮獅子咬の熾鬣拳、または残火蹴が敵に命中した時、ディシアの元素エネルギーを1.5回復。この効果は0.2秒毎に1回のみ発動可能。');
        myEnergy = 1.5;
    } else if (character === 'アルハイゼン') {
        myEnergy = 0;
    } else if (character === '放浪者') {
        messages.push('・雷元素：通常攻撃および重撃が敵に命中した後、元素エネルギーが0.8ポイント回復する。この方式による元素エネルギー回復は、0.2秒毎に1回のみ可能。');
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
        messages.push('七域のダンスのピルエット状態の3段目のステップが敵に命中すると、ニィロウの元素エネルギーが15回復する。');
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
    } else if (character === 'セノ' && constellation >= 4) {
        messages.push('聖儀·狼駆憑走の啓途誓使状態の時、感電、超電導、過負荷、原激化、超激化、超開花または雷元素拡散反応を起こすと、周囲のチーム全員（セノ自身を除く）の元素エネルギーを3回復する。この効果は一回の聖儀·狼駆憑走で、最大5回まで発動できる。');
        if (team.members.filter(member => ['水', '氷', '炎', '草'].includes(getCharacterMaster(member.name)?.元素 ?? '--')).length) {
            otherEnergy = 3 * 5 * qCount;
        }
    } else if (character === 'ティナリ') {
        myEnergy = 0;
    } else if (character === '夜蘭') {
        myEnergy = 0;
    } else if (character === '神里綾人') {
        messages.push('神里綾人が待機中の時、元素エネルギーが40未満の場合、1秒毎に元素エネルギーを2回復する。');
        myEnergy = 2;
    } else if (character === '八重神子' && constellation >= 1) {
        messages.push('大密法·天狐顕現で天狐雷霆を1回発生させるたびに、八重神子自身の元素エネルギーを8ポイント回復する。');
        myEnergy = 8 * 3 * qCount;
    } else if (character === '申鶴') {
        myEnergy = 0;
    } else if (character === '荒瀧一斗' && constellation >= 2) {
        messages.push('最凶鬼王·一斗轟臨！！を発動した後、チーム内に岩元素タイプキャラクターが1人いる毎に、クールタイム-1.5秒、荒瀧一斗の元素エネルギーを6ポイント回復する。この方式で短縮できるクールタイムは4.5秒までとなり、回復できる元素エネルギーは18ポイントまでとなる。');
        const geoCount = team.members.filter(member => getCharacterMaster(member.name)?.元素 === '岩').length;
        myEnergy = Math.min(18, 6 * geoCount) * qCount;
    } else if (character === '珊瑚宮心海' && constellation >= 4) {
        messages.push('海人の羽衣による儀来羽衣状態の時、珊瑚宮心海の通常攻撃の攻撃速度+10%。そして通常攻撃が敵に命中すると、元素エネルギーを0.8ポイント回復する。この効果は0.2秒毎に1回のみ発動可能。');
        myEnergy = 0.8;
    } else if (character === '雷電将軍') {
        messages.push('攻撃が敵に命中すると、周囲のチーム全員の元素エネルギーを回復する。この方式での元素エネルギー回復は1秒毎に1回のみ可能で、継続時間内に最大5回まで発動可能。');
        messages.push('元素チャージ効率が100%を超えている場合、超えた分1%につき、雷電将軍は下記の効果を獲得する。・夢想の一心状態で提供する元素エネルギー回復+0.6%。');
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
    } else if (character === '楓原万葉' && constellation >= 4) {
        messages.push('楓原万葉の元素エネルギーが45以下の時、下記の効果を獲得する。・一回押し/長押しで千早振るを発動した時、元素エネルギーを3/4回復する。・滑翔状態の時、1秒毎に元素エネルギーを2回復する。');
        myEnergy = 0;
    } else if (character === 'エウルア') {
        myEnergy = 0;
    } else if (character === '胡桃') {
        myEnergy = 0;
    } else if (character === '魈') {
        myEnergy = 0;
    } else if (character === '甘雨' && constellation >= 1) {
        messages.push('二段チャージ重撃の霜華の矢または霜華満開が命中した時、敵の氷元素耐性-15%、継続時間6秒。命中時に甘雨の元素エネルギーを2回復。二段チャージの重撃による元素エネルギーの回復効果は、1回の重撃で1度のみ発動可能。');
        const cCount = rotationList ? getCCount(character, rotationList) : 1;
        myEnergy = 2 * cCount;
    } else if (character === 'アルベド' && constellation >= 1) {
        messages.push('アルベドの創生術·擬似陽華の刹那の花が放たれた時、アルベド自身の元素エネルギーが1.2回復する。');
        myEnergy = 1.2;
    } else if (character === '鍾離') {
        myEnergy = 0;
    } else if (character === 'タルタリヤ') {
        myEnergy = 0;
    } else if (character === 'クレー') {
        messages.push('クレーの重撃が会心を発生すると、チーム全員の元素エネルギーが2回復する。');
        const cCount = rotationList ? getCCount(character, rotationList) : 1;
        const critRate = memberResult?.statsInput.statsObj.会心率 ?? 100;
        allEnergy = 2 * critRate / 100 * cCount;
        if (constellation >= 6) {
            messages.push('ドッカン花火状態中、クレーは3秒毎にチーム全員（クレー自身を除く）の元素エネルギーを3回復する。');
            otherEnergy = 3;
        }
    } else if (character === 'ウェンティ') {
        messages.push('風神の詩効果終了後、ウェンティの元素エネルギーを15回復する。元素変化があった場合、該当元素のチームメンバーの元素エネルギーを15回復する。');
        myEnergy = 15 * qCount;
        const herEnergy = myEnergy;
        for (const elmt of ['炎', '水', '雷', '氷']) {
            for (let herIndex = 0; herIndex < team.members.length; herIndex++) {
                const herCm = getCharacterMaster(team.members[herIndex].name);
                if (herCm?.元素 == elmt) {
                    herIndeces.push(herIndex);
                    herEnergies.push(herEnergy);
                }
            }
            if (herIndeces.length) {
                break;
            }
        }
    } else if (character === '刻晴') {
        myEnergy = 0;
    } else if (character === 'モナ') {
        myEnergy = 0;
    } else if (character === '七七' && constellation >= 1) {
        messages.push('度厄のお札マークがついている敵に寒病鬼差が命中した時、七七の元素エネルギーを2回復する。');
        myEnergy = 2;
    } else if (character === 'ディルック') {
        myEnergy = 0;
    } else if (character === 'ジン') {
        myEnergy = 80 * 0.2 * qCount;
    } else if (character === 'フレミネ' && constellation >= 2) {
        messages.push('プレッシャー·フロウ·高圧粉砕を発動すると、フレミネの元素エネルギーが2ポイント回復する。ランク4の高圧粉砕を発動すると、元素エネルギーの回復量が3ポイントに変わる。');
        myEnergy = 2;
    } else if (character === 'リネット') {
        myEnergy = 0;
    } else if (character === '綺良々') {
        myEnergy = 0;
    } else if (character === 'カーヴェ') {
        myEnergy = 0;
    } else if (character === 'ミカ' && constellation >= 4) {
        messages.push('ミカ自身によるスカイフェザーソングの鷹の羽状態がチームにいるキャラクターのHPを回復した時、ミカの元素エネルギーを3回復する。1回のスカイフェザーソングの鷹の羽状態で、元素エネルギーは最大5回まで回復できる。');
        myEnergy = 3 * 5 * qCount;
    } else if (character === 'ヨォーヨ' && constellation >= 2) {
        messages.push('玉颗珊々月中落の桂子仙機状態にある時、白玉大根の爆発が敵に命中すると、ヨォーヨの元素エネルギーを3ポイント回復する。この方法による元素エネルギーの回復は、0.8秒毎に1回のみ可能。');
        myEnergy = 3;
    } else if (character === 'ファルザン' && constellation >= 4) {
        messages.push('命中した敵の数に基づき、風圧崩潰のサイクロンはファルザンの元素エネルギーを回復する。1体の敵に命中した場合、ファルザンの元素エネルギーを2ポイント回復する。また、追加で1体の敵に命中するたびに、ファルザンの元素エネルギーが0.5ポイント回復する。この方法により1回のサイクロンで回復できる元素エネルギーは最大4ポイントまで。');
        myEnergy = 2 * Math.trunc(rotationLength / 3);
    } else if (character === 'レイラ' && constellation >= 2) {
        messages.push('垂裳凛然の夜が発射した飛星が敵に命中すると、レイラの元素エネルギーを1ポイント回復させる。この方法を通して、各飛星はレイラの元素エネルギーを最大で1回のみ回復できる。');
        myEnergy = 1;
    } else if (character === 'キャンディス') {
        myEnergy = 0;
    } else if (character === 'ドリー') {
        messages.push('ジンニーランプ·トラブルシューターのトラブルシューター砲またはアフターサービス弾が敵に命中すると、ドリーの元素チャージ効率を基準にし、その100%の元素チャージ効率毎にドリーの元素エネルギーを5回復する。ジンニーランプ·トラブルシューター1回につき、この方式で回復できる元素エネルギーは15まで。');
        const er = memberResult?.statsInput.statsObj.元素チャージ効率 ?? 100;
        myEnergy = Math.min(15, 5 * er / 100 * eCount);
    } else if (character === 'コレイ') {
        myEnergy = 0;
    } else if (character === '鹿野院平蔵') {
        messages.push('一回の廻風蹴で発生した「廻風真眼」が初めて爆発する時、鹿野院平蔵自身の元素エネルギーを9回復する。その後、爆発するたびに追加で元素エネルギーを1.5回復する。この方法により一回の廻風蹴で回復できる元素エネルギーは、最大13.5まで。');
        myEnergy = 9 * qCount;
    } else if (character === '久岐忍') {
        myEnergy = 0;
    } else if (character === '雲菫') {
        myEnergy = 0;
    } else if (character === 'ゴロー') {
        myEnergy = 0;
    } else if (character === 'トーマ' && constellation >= 4) {
        messages.push('真紅熾炎の大鎧を発動すると、トーマの元素エネルギーを15ポイント回復する。');
        myEnergy = 15 * qCount;
    } else if (character === '九条裟羅') {
        messages.push('天狗呪雷·伏は敵に命中すると、九条裟羅の元素チャージ効率を基準にし、その100%の元素チャージ効率毎に、チーム全員の元素エネルギーを1.2回復する。この効果は3秒毎に1回のみ発動可能。');
        const er = memberResult?.statsInput.statsObj.元素チャージ効率 ?? 100;
        allEnergy = 1.2 * er / 100 * eCount;
    } else if (character === '早柚') {
        messages.push('早柚がフィールド上で拡散反応を起こした時、元素エネルギーを1.2ポイント回復する。この効果は2秒毎に1回のみ発動可能。');
        myEnergy = 1.2;
    } else if (character === '煙緋') {
        myEnergy = 0;
    } else if (character === 'ロサリア' && constellation >= 4) {
        messages.push('罪喰いの懺悔で会心が発生すると、ロサリア自身の元素エネルギーが5回復する。この効果は、1回の罪喰いの懺悔で1度のみ発動可能。');
        const critRate = memberResult?.statsInput.statsObj.会心率 ?? 100;
        myEnergy = 5 * critRate / 100 * eCount;
    } else if (character === '辛炎') {
        myEnergy = 0;
    } else if (character === 'ディオナ' && constellation >= 1) {
        messages.push('特製スピリッツの効果終了時、ディオナの元素エネルギーを15回復する。');
        myEnergy = 15 * qCount;
    } else if (character === 'スクロース') {
        myEnergy = 0;
    } else if (character === '重雲' && constellation >= 4) {
        messages.push('重雲の攻撃が氷元素の影響を受けた敵に命中した時、自身の元素エネルギーを1回復する。この効果は2秒毎に1回のみ発動可能。');
        myEnergy = 1;
    } else if (character === 'ノエル') {
        myEnergy = 0;
    } else if (character === 'ベネット') {
        myEnergy = 0;
    } else if (character === 'フィッシュル') {
        myEnergy = 0;
    } else if (character === '凝光') {
        myEnergy = 0;
    } else if (character === '行秋' && constellation >= 6) {
        messages.push('古華剣·裁雨留虹が剣雨攻撃を2回発動する度に、次の剣雨攻撃が大幅に強化され、敵に命中する時行秋の元素エネルギーを3回復する。');
        myEnergy = 3;
    } else if (character === '北斗') {
        myEnergy = 0;
    } else if (character === '香菱') {
        myEnergy = 0;
    } else if (character === 'レザー') {
        messages.push('無形の雷狼を召喚して自身を守り、周囲の敵に雷元素ダメージを与える。同時に、雷の印を消耗して自身の元素エネルギーを回復する。退場時、残り時間を基準に、元素エネルギーを最大10まで回復する。');
        myEnergy = 0;
    } else if (character === 'バーバラ') {
        if (constellation >= 1) {
            messages.push('10秒毎に元素エネルギーを1回復する。');
            myEnergy = Math.trunc(1 * rotationLength / 10);
        }
        if (constellation >= 4) {
            messages.push('重撃が敵に命中する度に、バーバラの元素エネルギーが1回復する。一回で最大元素エネルギーが5まで回復できる。');
            if (rotationList) {
                const cCount = rotationList.filter(rotation => rotation.member == character && rotation.action.indexOf('C') != -1).length;
                myEnergy = 1 * cCount;
            }
        }
    } else if (character === 'リサ' && constellation >= 1) {
        messages.push('蒼雷を長押しで発動した後、敵に命中する度にリサの元素エネルギーが2回復する。一回で最大10まで回復可能。');
        if (rotationList) {
            const eHoldCount = rotationList.filter(rotation => rotation.member == character && rotation.action == 'E.Hold').length;
            myEnergy = 2 * eHoldCount;
        }
    } else if (character === 'ガイア' && constellation >= 6) {
        messages.push('凛冽なる輪舞の氷柱が1本追加され、発動時に元素エネルギーが15回復する。');
        myEnergy = 15 * qCount;
    } else if (character === 'アンバー') {
        myEnergy = 0;
    } else if (character === '旅人(水)') {
        myEnergy = 0;
    } else if (character === '旅人(草)' && constellation >= 1) {
        messages.push('草縁剣が敵に命中すると、旅人の元素エネルギーが3.5回復する。');
        myEnergy = 3.5 * eCount;
    } else if (character === '旅人(雷)') {
        messages.push('豊穰の勾玉 ·元素エネルギーが回復する。');
        messages.push('旅人自身の元素チャージ効率の10%を基準に、雷影剣が生成した豊穰の勾玉による元素チャージ効率をアップする。');
        myEnergy = 0;
        if (constellation >= 4) {
            messages.push('キャラクターが雷影剣で生成した豊穰の勾玉を獲得した時、該当キャラクターの元素エネルギーが35%未満の場合、豊穰の勾玉で回復できる元素エネルギー+100%。');
            myEnergy = 0;
        }
    } else if (character === '旅人(岩)' && constellation >= 4) {
        messages.push('岩潮幾重が引き起こす振動波が敵に命中する度に、元素エネルギーが5回復する。この方法で一回で最大25まで回復可能。');
        myEnergy = 5 * qCount;
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
    if (herEnergies.length && herIndeces.length) {
        for (let i = 0; i < herEnergies.length; i++) {
            energies[herIndeces[i]] += herEnergies[i];
        }
    }

    if (energies.filter(e => e > 0).length || messages.length) {
        return [energies[0], energies[1], energies[2], energies[3], messages];
    }
    return undefined;
}

export function getEnergyByWeapon(
    character: string,
    weapon: string,
    weaponRefine: number,
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[] | undefined,
): TEREnergy | undefined {
    const energies = [0, 0, 0, 0];
    const messages: string[] = [];
    const memberNameArr = team.members.map(member => member.name);
    const myIndex = memberNameArr.indexOf(character);
    let unit = 1;
    const eCount = rotationList ? getECount(character, rotationList) : 1;
    const qCount = rotationList ? getQCount(character, rotationList) : 1;
    let myEnergy = 0;
    if (weapon === '金珀·試作') {
        messages.push('元素爆発を発動した後の6秒間、2秒毎に元素エネルギーを4/4.5/5/5.5/6回復し、チーム全員のHPを2秒毎に4%/4.5%/5%/5.5%/6%回復する。');
        unit = [4, 4.5, 5, 5.5, 6][weaponRefine - 1];
        myEnergy = unit * 3 * qCount;
    } else if (weapon === '天目影打') {
        messages.push('元素スキルを発動した後、継続時間30秒の継承の印を1つ獲得する。この効果は5秒毎に1回のみ発動可能で、継承の印は同時に最大3つまで存在可能。元素爆発を発動すると、所持している継承の印を全て消費し、消費した継承の印1つにつき、2秒後に該当キャラクターの元素エネルギーを6/7.5/9/10.5/12ポイント回復する。');
        unit = [6, 7.5, 9, 10.5, 12][weaponRefine - 1];
        if (qCount) {
            myEnergy = unit * eCount;
        }
    } else if (weapon === '桂木斬長正' || weapon === '喜多院十文字槍') {
        messages.push('元素スキルが命中した時、キャラクターは元素エネルギーを3失う。その後の6秒間、2秒毎に元素エネルギーを3/3.5/4/4.5/5獲得する。この効果は10秒毎に1回のみ発動でき、待機中のキャラクターも発動できる。');
        unit = [3, 3.5, 4, 4.5, 5][weaponRefine - 1];
        if (rotationList?.length) {
            let next = Number.MIN_SAFE_INTEGER;
            for (let i = 0; i < rotationList.length; i++) {
                if (i < next) continue; // 10秒毎に1回のみ発動可能
                const rotation = rotationList[i];
                if (rotation.member == character && rotation.action.startsWith('E')) {
                    if (i === 0 || rotationList[i - 1].member != character && rotationList[i - 1].action !== 'Q') {
                        myEnergy -= 3;
                    }
                    myEnergy += unit * 3;
                    next = i + 5;
                }
            }
        }
    } else if (weapon === '不滅の月華') {
        messages.push('元素爆発を発動した後の12秒間、通常攻撃が敵に命中すると元素エネルギーが0.6ポイント回復する。この方式での元素エネルギー回復は、0.1秒毎に1回のみ可能。');
        unit = 0.6;
        if (rotationList?.length) {
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
        } else {
            myEnergy += unit * 1;
        }
    } else if (weapon === '碧落の瓏') {
        messages.push('元素爆発を起動、またはシールドを生成した後の3秒間、「定土玉圭」効果を発動する。2.5秒毎に元素エネルギーを4.5/5/5.5/6/6.5回復');
        unit = [4.5, 5, 5.5, 6, 6.5][weaponRefine - 1];
        myEnergy = unit * qCount * 12 / 2.5;
    } else if (weapon === '正義の報酬') {
        messages.push('治療を受けた時、元素エネルギーを8/10/12/14/16ポイント回復する。この効果は10秒毎に1回のみ発動可能。キャラクターが待機中でも発動できる。');
        unit = [8, 10, 12, 14, 16][weaponRefine - 1];
        myEnergy = unit * qCount;
    } else if (weapon === '久遠流転の大典') {
        messages.push('HP上限+16%/20%/24%/28%/32%。現在のHPが増える、または減る時、重撃ダメージ+14%/18%/22%/26%/30%。継続時間4秒、最大3層まで。0.3秒毎に1回のみ発動可能。3層まで重ねた時、または3層の継続時間がリセットされた時、元素エネルギーを8/9/10/11/12ポイント回復する。この方法による元素エネルギーの回復は、12秒に1回のみ。');
        unit = [8, 9, 10, 11, 12][weaponRefine - 1];
        myEnergy = unit * qCount;
    } else if (weapon === '船渠剣' || weapon === '携帯型チェーンソー') {
        messages.push('治療効果を受ける、または治療効果を与える時、強靭マークが1枚付与される。継続時間30秒、最大3枚まで。元素スキル、または元素爆発を発動する時、すべての強靭マークを消費し、継続時間10秒の「奮起」効果を獲得する。消費した強靭マーク1枚につき、元素熟知+40/50/60/70/80、さらに「奮起」効果を獲得した2秒後、消費した強靭マーク1枚につき、装備者の元素エネルギーを2/2.5/3/3.5/4ポイント回復する。「奮起」効果は15秒に1回のみ発動可能。キャラクターが待機中でも強靭マークを獲得できる。');
        unit = [2, 2.5, 3, 3.5, 4][weaponRefine - 1];
        if (eCount || qCount) {
            myEnergy = unit * 3 * qCount;
        }
    }
    if (myEnergy) {
        energies[myIndex] += myEnergy;
    }
    if (energies.filter(e => e > 0).length || messages.length) {
        return [energies[0], energies[1], energies[2], energies[3], messages];
    }
    return undefined;
}

export function getParticleByCharacter(
    character: string,
    constellation: number,
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[] | undefined,
    onFields: number[],
): TERParticle[] | undefined {
    const resultMap = new Map<string, number[]>();
    if (!character) return undefined;
    const cpmv = CHARACTER_PARTICLE_MAP[character];
    if (!cpmv) return undefined;
    if (!rotationList?.length) {
        rotationList = [{
            id: 0,
            member: character,
            action: Object.keys(cpmv)[0],
        }];
    }
    let curCharacter;
    let isBursting = false;
    for (let i = 0; i < rotationList.length; i++) {
        const rotation = rotationList[i];
        if (rotation.member != curCharacter) {
            isBursting = false;
        }
        if (rotation.member == character) {
            const action = rotation.action;
            if (action === 'Q') {
                isBursting = true; // キャラチェンするまでずっと元素爆発中判定とする
            } else if (action.startsWith('E')) {
                if (['ディルック', 'ニィロウ'].includes(character) && curCharacter == character) { // 連続使用される元素スキルはキャラチェンするまで1回分判定
                    continue;
                }
                const resultVal = resultMap.get(action) ?? [0, 0, 0, 0];
                const ret = setSkillParticleNumToArr(resultVal, character, constellation, team, rotationLength, rotationList, i, onFields, isBursting);
                resultMap.set(action, resultVal);
                if (ret) break;
            }
        }
        curCharacter = rotation.member;
    }
    const result: TERParticle[] = [];
    const characterMaster = getCharacterMaster(character);
    const element = characterMaster?.元素 ?? '無色';
    resultMap.forEach((value, key) => {
        result.push([element, key, value[0], value[1], value[2], value[3]]);
    })
    return result;
}

export function getParticleByCharacterExtra(
    character: string,
    constellation: number,
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[] | undefined,
    onFields: number[],
): TERParticle[] | undefined {
    let element;
    let num;
    const eCount = rotationList ? getECount(character, rotationList) : 1;
    if (character === '刻晴' && constellation >= 2) {
        // 刻晴の通常攻撃と重撃が雷元素の影響を受けた敵に命中した時、50%の確率で元素粒子を1個生成する。5秒毎に1回のみ発動可能。
        const ct = 5;
        element = '雷';
        num = rotationLength / ct;
    } else if (character === 'ガイア') {
        // 霜の襲撃が敵を凍結状態にした場合、凍結された敵から追加の元素粒子が落ちる。1回の霜襲は2つの元素粒子が追加で発生する。
        if (team.members.filter(member => getCharacterMaster(member.name)?.元素 === '水').length) {
            element = '氷';
            num = 2 * eCount;
        }
    } else if (character === 'フィッシュル' && constellation >= 6) {
        element = '雷';
        num = 1;
    }
    let result: TERParticle[] | undefined;
    if (num && element) {
        result = [[element, '', 0, 0, 0, 0]];
    }
    return result;
}

export function getParticleByWeapon(
    character: string,
    weapon: string,
    weaponRefine: number,
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[] | undefined,
    onFields: number[],
): TERParticle | undefined {
    let result: TERParticle | undefined;
    const memberNameArr = team.members.map(member => member.name);
    if (['西風剣', '西風大剣', '西風長槍', '西風猟弓', '西風秘典'].includes(weapon)) {
        result = ['無色', '', 0, 0, 0, 0];
        const ct = [12, 10.5, 9, 7.5, 6][weaponRefine - 1];
        let triggerCnt = 1;
        if (rotationLength && rotationList && onFields) {
            const rindexArr: number[] = [];
            let fieldCnt = 0;
            for (let i = 0; i < rotationList.length; i++) {
                if (rotationList[i].member == character) {
                    fieldCnt += (i === 0 || rotationList[i - 1].member != character) ? 1 : 0;
                }
            }
            const onField = onFields[memberNameArr.indexOf(character)];
            triggerCnt = Math.max(Math.round(rotationLength * onField / 100 / ct), fieldCnt);
            triggerCnt = Math.min(Math.round(rotationLength / ct), triggerCnt);
            let curCharacter = undefined;
            for (let i = 0; i < rotationList.length; i++) {
                const rotation = rotationList[i];
                if (rotation.member == character && rotation.member != curCharacter) {
                    rindexArr.push(i);
                }
                curCharacter = rotation.member;
            }
            for (let i = 0; i < triggerCnt; i++) {
                let nxtCharacter = character;
                if (i < rindexArr.length) {
                    const rindex = rindexArr[i];
                    const nxtRotation = (rindex + 1) < rotationList.length ? rotationList[rindex + 1] : rotationList[0];
                    nxtCharacter = nxtRotation.member;
                }
                const toIndex = memberNameArr.indexOf(nxtCharacter);
                result[2 + toIndex] = 3;
            }
        } else {
            const toIndex = memberNameArr.indexOf(character);
            result[2 + toIndex] = 3 * triggerCnt;
        }
    }
    return result;
}

export function getParticleByResonance(
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[] | undefined,
    onFields: number[],
): TERParticle | undefined {
    let result: TERParticle | undefined;
    const memberNum = team.members.filter(member => member.name).length;
    if (memberNum !== 4) return result;
    const electroCount = team.members.filter(member => getCharacterMaster(member.name)?.元素 === '雷').length;
    if (electroCount >= 2) { // 雷元素共鳴
        // 超電導、過負荷、感電、原激化、超激化または超開花反応を起こした時、100%の確率で雷元素粒子を生成する。クールタイム5秒。
        if (team.members.filter(member => ['氷', '炎', '水', '草'].includes(getCharacterMaster(member.name)?.元素 ?? '--')).length) {
            const ct = 5;
            const num = 1 * Math.trunc(rotationLength / ct);
            const workArr = [0, 0, 0, 0];
            splitNumToArrByOnFieldRate(workArr, num, team, onFields);
            result = ['雷', '雷元素共鳴', workArr[0], workArr[1], workArr[2], workArr[3]];
        }
    }
    return result;
}

function setSkillParticleNumToArr(
    arr: number[],
    character: string,
    constellation: number,
    team: TTeam,
    rotationLength: number,
    rotationList: TActionItem[],
    index: number,
    onFields: number[],
    isBursting = false,
) {
    let result = false;
    const cpmv = CHARACTER_PARTICLE_MAP[character];
    if (!cpmv) return;
    const rotation = rotationList[index];
    if (!rotation || !rotation.action.startsWith('E')) return;
    const actionArr: string[] = [];
    if (isBursting) {
        actionArr.push(rotation.action + '(burst)');
        if (rotation.action === 'E') {
            actionArr.push('E.Press(burst)');
        } else if (rotation.action === 'E.Press') {
            actionArr.push('E(burst)');
        }
    }
    actionArr.push(rotation.action);
    if (rotation.action === 'E') {
        actionArr.push('E.Press');
    } else if (rotation.action === 'E.Press') {
        actionArr.push('E');
    }
    let particleInfo;
    for (const action of actionArr) {
        particleInfo = cpmv[action];
        if (particleInfo) break;
    }
    if (!particleInfo) return;
    if (_.isNumber(particleInfo)) { // ダイレクト
        addNumToArr(arr, particleInfo, team, rotationList, index);
    } else if (_.isArray(particleInfo)) { // ダイレクト or 設置物
        let num = particleInfo[0];
        let toAdd = particleInfo[1];
        if (particleInfo.length <= 2) { // ダイレクト
            addNumToArr(arr, num, team, rotationList, index, toAdd);
        } else { // 設置物
            let duration = particleInfo[2];
            let ct = particleInfo[3];
            if (particleInfo.length > 4 && particleInfo[4] <= constellation) { // 命ノ星座で性能が変化するケース
                num = particleInfo[5];
                toAdd = particleInfo[6];
                duration = particleInfo[7];
                ct = particleInfo[8];
            }
            if (toAdd >= 0) {
                addNumToArr(arr, particleInfo[0], team, rotationList, index, toAdd);
            } else if (ct <= duration || ['フィッシュル', '珊瑚宮心海'].includes(character)) { // クールタイム≦継続時間は×ローテーション長
                num *= rotationLength;
                splitNumToArrByOnFieldRate(arr, num, team, onFields);
                result = true; // 常時存在し続けるため、元素スキルを何回使用しても変わらないことを通知
            } else { // ×継続時間
                num *= duration;
                splitNumToArrByOnFieldRate(arr, num, team, onFields);
            }
        }
    }
    return result;
}

function addNumToArr(
    arr: number[],
    num: number,
    team: TTeam,
    rotationList: TActionItem[],
    index: number,
    toAdd = 1,
) {
    const memberNameArr = team.members.map(member => member.name);
    const nxtRotation = (index + toAdd) < rotationList.length ? rotationList[index + toAdd] : rotationList[0];
    arr[memberNameArr.indexOf(nxtRotation.member)] += num;
}

function splitNumToArrByOnFieldRate(
    arr: number[],
    num: number,
    team: TTeam,
    onFields: number[],
) {
    for (let i = 0; i < arr.length; i++) {
        if (team.members[i].name) {
            const onField = onFields[i];
            arr[i] += num * onField / 100;
        }
    }
}

// 元素粒子数=[元素粒子数,1]
// [元素粒子数,0]
// [1秒あたりの元素粒子数,-1,継続時間,クールタイム]
// [1秒あたりの元素粒子数,-1,継続時間,クールタイム,命ノ星座,1秒あたりの元素粒子数,-1,継続時間,クールタイム]
const CHARACTER_PARTICLE_MAP: { [key: string]: any } = {
    'ヌヴィレット': {
        'E': 4,
    },
    'リネ': {
        'E': 5,
    },
    '白朮': {
        'E': 3.5,
    },
    'ディシア': {
        'E': [0.33, -1, 12, 20, 2, 0.33, -1, 18, 20],
    },
    'アルハイゼン': {
        'E.Press': [6, 0],
        'E.Hold': [6, 0],
    },
    '放浪者': {
        'E': [4, 0],
    },
    'ナヒーダ': {
        'E.Press': [0.36, -1, 25, 5],
        'E.Hold': [0.36, -1, 25, 6],
    },
    'ニィロウ': {
        'E': 4.5,
    },
    'セノ': {
        'E': 3,
        'E(burst)': 1.5,
    },
    'ティナリ': {
        'E': 3.5,
    },
    '夜蘭': {
        'E.Press': 4,
        'E.Hold': 4,
    },
    '神里綾人': {
        'E': [4, 0, 6, 12],
    },
    '八重神子': {
        'E': [0.36, -1, 14, 4],
    },
    '申鶴': {
        'E.Press': 3,
        'E.Hold': 4,
    },
    '荒瀧一斗': {
        'E': 3.5,
    },
    '珊瑚宮心海': {
        'E': [0.33, -1, 12, 20],
    },
    '雷電将軍': {
        'E': [0.45, -1, 25, 10],
    },
    'アーロイ': {
        'E': 5,
    },
    '宵宮': {
        'E': [4, 0, 10, 18],
    },
    '神里綾華': {
        'E': 4.5,
    },
    '楓原万葉': {
        'E.Press': 3,
        'E.Hold': 4,
    },
    'エウルア': {
        'E.Press': 1.5,
        'E.Hold': 2.5,
    },
    '胡桃': {
        'E': [5, 0, 9, 16],
    },
    '魈': {
        'E': 3,
        'E(burst)': 0,
    },
    '甘雨': {
        'E': [1, -1, 4, 10]
    },
    'アルベド': {
        'E.Press': [0.3, -1, 30, 4],
        'E.Hold': [0.3, -1, 30, 4],
    },
    '鍾離': {
        'E.Press': [0.25, -1, 20, 4],
        'E.Hold': [0.25, -1, 20, 12],
    },
    'タルタリヤ': {
        'E': 3.5,
    },
    'クレー': {
        'E': 3.5,
    },
    'ウェンティ': {
        'E.Press': 3,
        'E.Hold': 4,
    },
    '刻晴': {
        'E.Press': 2.5,
        'E.Hold': 2.5,
    },
    'モナ': {
        'E.Press': [3.33, 5, 5, 12],
        'E.Hold': [3.33, 5, 5, 12],
    },
    '七七': {
        'E': 0,
    },
    'ディルック': {
        'E': 3.75,
    },
    'ジン': {
        'E': 2.5,
    },
    'フレミネ': {
        'E': 2,
        'E(burst)': 1,
    },
    'リネット': {
        'E.Press': 4,
        'E.Hold': 4,
    },
    '綺良々': {
        'E.Press': 3,
        'E.Hold': 3 + 1,
    },
    'カーヴェ': {
        'E': 2,
    },
    'ミカ': {
        'E.Press': 4,
        'E.Hold': 4,
    },
    'ヨォーヨ': {
        'E.Press': [0.5, -1, 10, 15],
        'E.Hold': [0.5, -1, 10, 15]
    },
    'ファルザン': {
        'E': 2,
    },
    'レイラ': {
        'E': [0.11, -1, 12, 12]
    },
    'キャンディス': {
        'E.Press': 2,
        'E.Hold': 3
    },
    'ドリー': {
        'E': 2,
    },
    'コレイ': {
        'E': 3,
    },
    '鹿野院平蔵': {
        'E': 2,
    },
    '久岐忍': {
        'E': [0.3, -1, 12, 15, 2, 0.3, -1, 15, 15],
    },
    '雲菫': {
        'E.Press': 2,
        'E.Hold': 3,
    },
    'ゴロー': {
        'E.Press': 2,
        'E.Hold': 2,
    },
    'トーマ': {
        'E': 3.4,
    },
    '九条裟羅': {
        'E': 0,
    },
    '早柚': {
        'E.Press': 2,
        'E.Hold': 3,
    },
    '煙緋': {
        'E': 3,
    },
    'ロサリア': {
        'E': 2.5,
    },
    '辛炎': {
        'E': 4,
    },
    'ディオナ': {
        'E.Press': 1.6,
        'E.Hold': 4,
    },
    'スクロース': {
        'E': 4,
    },
    '重雲': {
        'E': 4,
    },
    'ノエル': {
        'E': 0,
    },
    'ベネット': {
        'E.Press': 2.5,
        'E.Hold': 3,
    },
    'フィッシュル': {
        'E': [2 / 3, -1, 10, 24],
    },
    '凝光': {
        'E': 3,
    },
    '行秋': {
        'E': 4.5,
    },
    '北斗': {
        'E.Press': 2,
        'E.Hold': 3,
    },
    '香菱': {
        'E': [0.5, -1, 8, 12],
    },
    'レザー': {
        'E.Press': 3,
        'E.Hold': 4,
        'E.Press(burst)': 0,
    },
    'バーバラ': {
        'E': 0,
    },
    'リサ': {
        'E.Press': 0,
        'E.Hold': 5,
    },
    'ガイア': {
        'E': 2.5,
    },
    'アンバー': {
        'E.Press': [4, 8, 0, 15],
        'E.Hold': [4, 8, 0, 15],
    },
    '旅人(水)': {
        'E.Press': 3 + 1 / 3,
        'E.Hold': 3 + 1 / 3,
    },
    '旅人(草)': {
        'E': 2.5,
    },
    '旅人(雷)': {
        'E': 1,
    },
    '旅人(岩)': {
        'E.Press': 3 + 1 / 3,
        'E.Hold': 3 + 1 / 3,
    },
    '旅人(風)': {
        'E.Press': 2,
        'E.Hold': 3 + 1 / 3,
    },
}
