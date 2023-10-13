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
    const herEnergies: number[] = []; // 誰かの元素エネルギー
    const herIndeces: number[] = []; // 誰かのインデックス
    otherEnergy = 0;
    if (!character) {
        return undefined;
    } else if (character === 'ヌヴィレット') {
        myEnergy = 0;
    } else if (character === 'リネ') {
        // リネがプロップアローを発射することでHPを消費した時、そのプロップアローによって召喚されたファニーキャット·ハットが敵に命中すると、リネの元素エネルギーが3ポイント回復
        myEnergy = 0;
    } else if (character === '白朮') {
        myEnergy = 0;
    } else if (character === 'ディシア' && constellation >= 4) {
        // 炎哮獅子咬の熾鬣拳、または残火蹴が敵に命中した時、ディシアの元素エネルギーを1.5回復。この効果は0.2秒毎に1回のみ発動可能。
        myEnergy = 0;
    } else if (character === 'アルハイゼン') {
        myEnergy = 0;
    } else if (character === '放浪者') {
        // ・雷元素：通常攻撃および重撃が敵に命中した後、元素エネルギーが0.8ポイント回復する。この方式による元素エネルギー回復は、0.2秒毎に1回のみ可能。
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
        // 七域のダンスのピルエット状態の3段目のステップが敵に命中すると、ニィロウの元素エネルギーが15回復する。
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
        // 聖儀·狼駆憑走の啓途誓使状態の時、感電、超電導、過負荷、原激化、超激化、超開花または雷元素拡散反応を起こすと、周囲のチーム全員（セノ自身を除く）の元素エネルギーを3回復する。この効果は一回の聖儀·狼駆憑走で、最大5回まで発動できる。
        if (team.members.filter(member => ['水', '氷', '炎', '草'].includes(getCharacterMaster(member.name)?.元素 ?? '--')).length) {
            otherEnergy = 3 * 5 * qCount;
        }
    } else if (character === 'ティナリ') {
        myEnergy = 0;
    } else if (character === '夜蘭') {
        myEnergy = 0;
    } else if (character === '神里綾人') {
        // 神里綾人が待機中の時、元素エネルギーが40未満の場合、1秒毎に元素エネルギーを2回復する。
        myEnergy = 0;
    } else if (character === '八重神子' && constellation >= 1) {
        // 大密法·天狐顕現で天狐雷霆を1回発生させるたびに、八重神子自身の元素エネルギーを8ポイント回復する。
        myEnergy = 8 * 3 * qCount;
    } else if (character === '申鶴') {
        myEnergy = 0;
    } else if (character === '荒瀧一斗' && constellation >= 2) {
        // 最凶鬼王·一斗轟臨！！を発動した後、チーム内に岩元素タイプキャラクターが1人いる毎に、クールタイム-1.5秒、荒瀧一斗の元素エネルギーを6ポイント回復する。この方式で短縮できるクールタイムは4.5秒までとなり、回復できる元素エネルギーは18ポイントまでとなる。
        const geoCount = team.members.filter(member => getCharacterMaster(member.name)?.元素 === '岩').length;
        myEnergy = Math.min(18, 6 * geoCount) * qCount;
    } else if (character === '珊瑚宮心海') {
        // 海人の羽衣による儀来羽衣状態の時、珊瑚宮心海の通常攻撃の攻撃速度+10%。そして通常攻撃が敵に命中すると、元素エネルギーを0.8ポイント回復する。この効果は0.2秒毎に1回のみ発動可能。
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
    } else if (character === '楓原万葉' && constellation >= 4) {
        // 楓原万葉の元素エネルギーが45以下の時、下記の効果を獲得する。・一回押し/長押しで千早振るを発動した時、元素エネルギーを3/4回復する。・滑翔状態の時、1秒毎に元素エネルギーを2回復する。
        myEnergy = 0;
    } else if (character === 'エウルア') {
        myEnergy = 0;
    } else if (character === '胡桃') {
        myEnergy = 0;
    } else if (character === '魈') {
        myEnergy = 0;
    } else if (character === '甘雨' && constellation >= 1) {
        // 二段チャージ重撃の霜華の矢または霜華満開が命中した時、敵の氷元素耐性-15%、継続時間6秒。命中時に甘雨の元素エネルギーを2回復。二段チャージの重撃による元素エネルギーの回復効果は、1回の重撃で1度のみ発動可能。
        myEnergy = 0;
    } else if (character === 'アルベド' && constellation >= 1) {
        // アルベドの創生術·擬似陽華の刹那の花が放たれた時、アルベド自身の元素エネルギーが1.2回復する。
        myEnergy = 0;
    } else if (character === '鍾離') {
        myEnergy = 0;
    } else if (character === 'タルタリヤ') {
        myEnergy = 0;
    } else if (character === 'クレー') {
        // クレーの重撃が会心を発生すると、チーム全員の元素エネルギーが2回復する。
        myEnergy = 0;
        if (constellation >= 6) {
            // ドッカン花火状態中、クレーは3秒毎にチーム全員（クレー自身を除く）の元素エネルギーを3回復する。
            otherEnergy = 0;
        }
    } else if (character === 'ウェンティ') {
        // 風神の詩効果終了後、ウェンティの元素エネルギーを15回復する。元素変化があった場合、該当元素のチームメンバーの元素エネルギーを15回復する。
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
        // 度厄のお札マークがついている敵に寒病鬼差が命中した時、七七の元素エネルギーを2回復する。
        myEnergy = 0;
    } else if (character === 'ディルック') {
        myEnergy = 0;
    } else if (character === 'ジン') {
        myEnergy = 80 * 0.2 * qCount;
    } else if (character === 'フレミネ' && constellation >= 2) {
        // プレッシャー·フロウ·高圧粉砕を発動すると、フレミネの元素エネルギーが2ポイント回復する。ランク4の高圧粉砕を発動すると、元素エネルギーの回復量が3ポイントに変わる。
        myEnergy = 0;
    } else if (character === 'リネット') {
        myEnergy = 0;
    } else if (character === '綺良々') {
        myEnergy = 0;
    } else if (character === 'カーヴェ') {
        myEnergy = 0;
    } else if (character === 'ミカ' && constellation >= 4) {
        // ミカ自身によるスカイフェザーソングの鷹の羽状態がチームにいるキャラクターのHPを回復した時、ミカの元素エネルギーを3回復する。1回のスカイフェザーソングの鷹の羽状態で、元素エネルギーは最大5回まで回復できる。
        myEnergy = 0;
    } else if (character === 'ヨォーヨ' && constellation >= 2) {
        // 玉颗珊々月中落の桂子仙機状態にある時、白玉大根の爆発が敵に命中すると、ヨォーヨの元素エネルギーを3ポイント回復する。この方法による元素エネルギーの回復は、0.8秒毎に1回のみ可能。
        myEnergy = 0;
    } else if (character === 'ファルザン' && constellation >= 4) {
        // 命中した敵の数に基づき、風圧崩潰のサイクロンはファルザンの元素エネルギーを回復する。1体の敵に命中した場合、ファルザンの元素エネルギーを2ポイント回復する。また、追加で1体の敵に命中するたびに、ファルザンの元素エネルギーが0.5ポイント回復する。この方法により1回のサイクロンで回復できる元素エネルギーは最大4ポイントまで。
        myEnergy = 0;
    } else if (character === 'レイラ' && constellation >= 2) {
        // 垂裳凛然の夜が発射した飛星が敵に命中すると、レイラの元素エネルギーを1ポイント回復させる。この方法を通して、各飛星はレイラの元素エネルギーを最大で1回のみ回復できる。
        myEnergy = 0;
    } else if (character === 'キャンディス') {
        myEnergy = 0;
    } else if (character === 'ドリー') {
        // ジンニーランプ·トラブルシューターのトラブルシューター砲またはアフターサービス弾が敵に命中すると、ドリーの元素チャージ効率を基準にし、その100%の元素チャージ効率毎にドリーの元素エネルギーを5回復する。ジンニーランプ·トラブルシューター1回につき、この方式で回復できる元素エネルギーは15まで。
        const er = memberResult?.statsInput.statsObj.元素チャージ効率 ?? 100;
        myEnergy = Math.min(15, 5 * er / 100 * eCount);
    } else if (character === 'コレイ') {
        myEnergy = 0;
    } else if (character === '鹿野院平蔵') {
        // 一回の廻風蹴で発生した「廻風真眼」が初めて爆発する時、鹿野院平蔵自身の元素エネルギーを9回復する。その後、爆発するたびに追加で元素エネルギーを1.5回復する。この方法により一回の廻風蹴で回復できる元素エネルギーは、最大13.5まで。
        myEnergy = 9 * qCount;
    } else if (character === '久岐忍') {
        myEnergy = 0;
    } else if (character === '雲菫') {
        myEnergy = 0;
    } else if (character === 'ゴロー') {
        myEnergy = 0;
    } else if (character === 'トーマ' && constellation >= 4) {
        // 真紅熾炎の大鎧を発動すると、トーマの元素エネルギーを15ポイント回復する。
        myEnergy = 15 * qCount;
    } else if (character === '九条裟羅') {
        // 天狗呪雷·伏は敵に命中すると、九条裟羅の元素チャージ効率を基準にし、その100%の元素チャージ効率毎に、チーム全員の元素エネルギーを1.2回復する。この効果は3秒毎に1回のみ発動可能。
        myEnergy = 0;
    } else if (character === '早柚') {
        // 早柚がフィールド上で拡散反応を起こした時、元素エネルギーを1.2ポイント回復する。この効果は2秒毎に1回のみ発動可能。
        myEnergy = 0;
    } else if (character === '煙緋') {
        myEnergy = 0;
    } else if (character === 'ロサリア' && constellation >= 4) {
        // 罪喰いの懺悔で会心が発生すると、ロサリア自身の元素エネルギーが5回復する。この効果は、1回の罪喰いの懺悔で1度のみ発動可能。
        myEnergy = 0;
    } else if (character === '辛炎') {
        myEnergy = 0;
    } else if (character === 'ディオナ' && constellation >= 1) {
        // 特製スピリッツの効果終了時、ディオナの元素エネルギーを15回復する。
        myEnergy = 15 * qCount;
    } else if (character === 'スクロース') {
        myEnergy = 0;
    } else if (character === '重雲' && constellation >= 4) {
        // 重雲の攻撃が氷元素の影響を受けた敵に命中した時、自身の元素エネルギーを1回復する。この効果は2秒毎に1回のみ発動可能。
        myEnergy = 0;
    } else if (character === 'ノエル') {
        myEnergy = 0;
    } else if (character === 'ベネット') {
        myEnergy = 0;
    } else if (character === 'フィッシュル') {
        myEnergy = 0;
    } else if (character === '凝光') {
        myEnergy = 0;
    } else if (character === '行秋' && constellation >= 6) {
        // 古華剣·裁雨留虹が剣雨攻撃を2回発動する度に、次の剣雨攻撃が大幅に強化され、敵に命中する時行秋の元素エネルギーを3回復する。
        myEnergy = 0;
    } else if (character === '北斗') {
        myEnergy = 0;
    } else if (character === '香菱') {
        myEnergy = 0;
    } else if (character === 'レザー') {
        // 無形の雷狼を召喚して自身を守り、周囲の敵に雷元素ダメージを与える。同時に、雷の印を消耗して自身の元素エネルギーを回復する。退場時、残り時間を基準に、元素エネルギーを最大10まで回復する。
        myEnergy = 0;
    } else if (character === 'バーバラ') {
        if (constellation >= 1) {
            // 10秒毎に元素エネルギーを1回復する。
            myEnergy = 0;
        }
        if (constellation >= 4) {
            // 重撃が敵に命中する度に、バーバラの元素エネルギーが1回復する。一回で最大元素エネルギーが5まで回復できる。
            myEnergy = 0;
        }
    } else if (character === 'リサ' && constellation >= 1) {
        // 蒼雷を長押しで発動した後、敵に命中する度にリサの元素エネルギーが2回復する。一回で最大10まで回復可能。
        myEnergy = 0;
    } else if (character === 'ガイア' && constellation >= 6) {
        // 凛冽なる輪舞の氷柱が1本追加され、発動時に元素エネルギーが15回復する。
        myEnergy = 0;
    } else if (character === 'アンバー') {
        myEnergy = 0;
    } else if (character === '旅人(水)') {
        myEnergy = 0;
    } else if (character === '旅人(草)' && constellation >= 1) {
        // 草縁剣が敵に命中すると、旅人の元素エネルギーが3.5回復する。
        myEnergy = 3.5 * eCount;
    } else if (character === '旅人(雷)') {
        // 豊穰の勾玉 ·元素エネルギーが回復する。
        // 旅人自身の元素チャージ効率の10%を基準に、雷影剣が生成した豊穰の勾玉による元素チャージ効率をアップする。
        myEnergy = 0;
        if (constellation >= 4) {
            // キャラクターが雷影剣で生成した豊穰の勾玉を獲得した時、該当キャラクターの元素エネルギーが35%未満の場合、豊穰の勾玉で回復できる元素エネルギー+100%。
            myEnergy = 0;
        }
    } else if (character === '旅人(岩)' && constellation >= 4) {
        // 岩潮幾重が引き起こす振動波が敵に命中する度に、元素エネルギーが5回復する。この方法で一回で最大25まで回復可能。
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
    if (herEnergies.length && herIndeces.length) {
        for (let i = 0; i < herEnergies.length; i++) {
            energies[herIndeces[i]] += herEnergies[i];
        }
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
