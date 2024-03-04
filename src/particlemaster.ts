import _ from "lodash";

// 継続時間が存在かつ2以上の場合、元素粒子数は1秒あたりの元素粒子数とみなす
export type TParticleInfo = number | (number | undefined)[];
export type TParticleEntry = {
    [key: string]: TParticleInfo,
};
export type TParticleMaster = {
    [key: string]: TParticleEntry,
};

export const SP_SELF = 0x1000;      // 元素粒子数=[0]       アクション実行者
export const SP_NEXT = 0x1001;      // 元素粒子数=[0]       次のアクション実行者
export const SP_LONG = 0x1002;      // 元素粒子数=[0]*[2]   出場時間で分配
export const SP_SHRT = 0x1003;      // 元素粒子数=[0]       出場時間で分配
const C0 = 0x2000;
const C1 = 0x2001;
const C2 = 0x2002;
const C4 = 0x2004;
const C6 = 0x2006;
// 粒子数
// 粒子数, 粒子発生ポイント
// 粒子数, 受取タイプ, 粒子発生ポイント
// 粒子数, 受取タイプ, 継続時間, クールタイム, 粒子生成クールタイム, 粒子発生ポイント
// 粒子数, 受取タイプ, 継続時間, クールタイム, 粒子生成クールタイム, 命ノ星座, 粒子数, 受取タイプ, 継続時間, クールタイム, 粒子生成クールタイム, 粒子発生ポイント
const PARTICLE_MASTER: TParticleMaster = {
    '嘉明': {
        'E': 2,
    },
    '閑雲': {
        'E': 5,
    },
    'シュヴルーズ': {
        'E.Press': [4, SP_NEXT, 0, 15, 10],
        'E.Hold': [4, SP_NEXT, 0, 15, 10],
    },
    'ナヴィア': {
        'E.Press': 3.5,
        'E.Hold': 3.5,
    },
    'シャルロット': {
        'E.Press': 3,
        'E.Hold': 5,
    },
    'フリーナ': {
        'E': [1, SP_LONG, 30, 20, 2.5],   // CT2.5s
    },
    'リオセスリ': {
        'E': [3, SP_SELF, 10, 16, 2, C1, 3, SP_SELF, 14, 16, 2],    // CT2s
    },
    'ヌヴィレット': {
        'E': [4, SP_NEXT, 0, 12, undefined],
    },
    'リネ': {
        'E': 5,
    },
    '白朮': {
        'E': 3.5,
    },
    'ディシア': {
        'E': [1, SP_LONG, 12, 20, 2.5, C2, 1, SP_LONG, 18, 20, 2.5],    // フィールドダメージ CT2.5s
    },
    'アルハイゼン': {
        'E.Press': [6, SP_SELF],   // 光幕攻撃1回あたり1個 CT1.6s
        'E.Hold': [6, SP_SELF],    // 光幕攻撃1回あたり1個 CT1.6s
    },
    '放浪者': {
        'E': [5, SP_SELF, 10, 16, 2, C6, 5, SP_SELF, 12, 18, 2],
    },
    'ナヒーダ': {
        'E.Press': [3, SP_LONG, 25, 5, 7],     // CT7s
        'E.Hold': [3, SP_LONG, 25, 6, 7],      // CT7s
    },
    'ニィロウ': {
        'E': [1.5 + 1 + 1 + 1, SP_SELF]
    },
    'セノ': {
        'E': 3,
        'E(burst)': 1 + 1 / 3,
    },
    'ティナリ': {
        'E': 3.5,
    },
    '夜蘭': {
        'E.Press': [4, SP_NEXT, 0, 10, undefined],
        'E.Hold': [4, SP_NEXT, 0, 10, undefined],
    },
    '神里綾人': {
        'E': [4, SP_SELF, 6, 12, 0],
    },
    '八重神子': {
        'E': [1, SP_LONG, 14, 4, 2.5],    // CT2.5s
    },
    '申鶴': {
        'E.Press': [3, SP_NEXT, 10, 10, undefined],
        'E.Hold': [4, SP_NEXT, 15, 15, undefined],
    },
    '荒瀧一斗': {
        'E': 3.5,
    },
    '珊瑚宮心海': {
        'E': [0.67, SP_LONG, 12, 20, 2],    // per damage CT2s
    },
    '雷電将軍': {
        'E': [0.5, SP_LONG, 25, 10, 0.9],   // per damage CT0.9s
    },
    'アーロイ': {
        'E': 5,
    },
    '宵宮': {
        'E': [4, SP_SELF, 10, 18, 2],   // CT2s
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
        'E': [2.5 * 2, SP_SELF, 9, 16, undefined],
    },
    '魈': {
        'E': 3,
        'E(burst)': 0,
    },
    '甘雨': {
        'E': [2 * 2, SP_SHRT, 6, 10, undefined]
    },
    'アルベド': {
        'E.Press': [0.67, SP_LONG, 30, 4, 2],   // 刹那の花ダメージ1回あたり0.67個 CT2s
        'E.Hold': [0.67, SP_LONG, 30, 4, 2],    // 刹那の花ダメージ1回あたり0.67個 CT2s
    },
    '鍾離': {
        'E.Press': [0.5, SP_LONG, 20, 4, 1.5],  // CT1.5s
        'E.Hold': [0.5, SP_LONG, 20, 12, 1.5],  // CT1.5s
    },
    'タルタリヤ': {
        'E': [1 / 3 * 9, SP_SELF],              // とりあえず居座り時間9sとする。運用次第すぎて計算できない
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
        'E.Press': [3.33, SP_SHRT, 5, 12, undefined],
        'E.Hold': [3.33, SP_SHRT, 5, 12, undefined],
    },
    '七七': {
        'E': 0,
    },
    'ディルック': {
        'E': 4,
    },
    'ジン': {
        'E': 2.67,
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
        'E.Press': [1, SP_LONG, 10, 15, 1.5],
        'E.Hold': [1, SP_LONG, 10, 15, 1.5]
    },
    'ファルザン': {
        'E': [2, SP_NEXT, 18, 6, 5.5],      // CT5.5s
    },
    'レイラ': {
        'E': [1.33, SP_LONG, 12, 12, 3]     // CT3s
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
        'E': 4,     // 2:変格0-1/2.5:変格2-3/3:変格4=正論
    },
    '久岐忍': {
        'E': [0.45, SP_LONG, 12, 15, 1.5, C2, 0.45, SP_LONG, 15, 15, 1.5],  // CT1.5s
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
        'E': 3.5,
    },
    '九条裟羅': {
        'E': 3,
    },
    '早柚': {
        'E.Press': 2,
        'E.Hold': 3,
    },
    '煙緋': {
        'E': 3,
    },
    'ロサリア': {
        'E': 3,
    },
    '辛炎': {
        'E': 4,
    },
    'ディオナ': {
        'E.Press': 0.8 * 2,
        'E.Hold': 0.8 * 5,
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
        'E.Press': 2.25,
        'E.Hold': 3,
    },
    'フィッシュル': {
        'E': [0.67, SP_LONG, 10, 25, 1, C6, 0.67, SP_LONG, 12, 25, 1],
    },
    '凝光': {
        'E': 3.33,
    },
    '行秋': {
        'E': [4.5, SP_NEXT, 15, 21, undefined],
    },
    '北斗': {
        'E.Press': 2,
        'E.Hold': 4,
    },
    '香菱': {
        'E': [4, SP_SHRT, 8, 12, undefined],
    },
    'レザー': {
        'E.Press': 3,
        'E.Hold': 4,
        'E.Press(burst)': 0,
    },
    'バーバラ': {
        'E': [0, SP_NEXT, 15, 32, undefined, C2, 0, SP_NEXT, 15, 27.2, undefined],
    },
    'リサ': {
        'E.Press': 0,
        'E.Hold': 5,
    },
    'ガイア': {
        'E': 2.67,
    },
    'アンバー': {
        'E.Press': [4, SP_SHRT, 8, 15, undefined],
        'E.Hold': [4, SP_SHRT, 8, 15, undefined],
    },
    '旅人(水)': {
        'E.Press': 3.33,
        'E.Hold': 3.33,
    },
    '旅人(草)': {
        'E': 2.5,
    },
    '旅人(雷)': {
        'E': 1,
    },
    '旅人(岩)': {
        'E.Press': 3.33,
        'E.Hold': 3.33,
    },
    '旅人(風)': {
        'E.Press': 2,
        'E.Hold': 3.33,
    },
}

Object.keys(PARTICLE_MASTER).forEach(key => {
    const pentry = PARTICLE_MASTER[key];
    Object.keys(pentry).forEach(key2 => {
        const pinfo = pentry[key2];
        if (_.isNumber(pinfo)) {
            return;
        }
        if (_.isArray(pinfo)) {
            if (pinfo.length === 2 || pinfo.length === 5 || pinfo.length === 11) {
                const receiveTypeArr: (number | undefined)[] = [];
                receiveTypeArr.push(pinfo[1]);
                if (pinfo.length === 11) {
                    receiveTypeArr.push(pinfo[7]);
                }
                if (pinfo.filter(s => s !== undefined && !_.isNumber(s)).length === 0
                    && receiveTypeArr.filter(s => s === undefined || ![SP_SELF, SP_NEXT, SP_LONG, SP_SHRT].includes(s)).length === 0
                    && (pinfo.length !== 11 || (pinfo[5] !== undefined && [C1, C2, C4, C6].includes(pinfo[5])))) {
                    return;
                }
            }
        }
        console.error(key, key2, pinfo);
    })
})

/** 元素爆発で元素スキル再発動 または 継続時間延長するキャラクターたち */
export const CHARACTER_Q_TO_E_ARR = ['フィッシュル', '珊瑚宮心海'];

/** 元素スキル後に特定のアクションを実行するキャラクターとそのアクションと回数 */
export const CHARACTER_E_UNTIL_MAP = new Map<string, Map<string[], number>>();
CHARACTER_E_UNTIL_MAP.set('ディルック', new Map([[['E'], 2],]));            // EEE
CHARACTER_E_UNTIL_MAP.set('刻晴', new Map([[['E', 'C'], 1],]));             // E(E|C)
CHARACTER_E_UNTIL_MAP.set('ニィロウ', new Map([[['E', 'N'], 3],]));         // E(E|N){3}
CHARACTER_E_UNTIL_MAP.set('フレミネ', new Map([[['E'], 1], [['N'], 4],]));  // E(E|N{4})

/** 元素スキルのあとに特定のアクションを実行した時に元素粒子が発生するキャラクターとそのアクション */
export const CHARACTER_E_DELAY_MAP = new Map<string, string[]>();
CHARACTER_E_DELAY_MAP.set('九条裟羅', ['C']);
CHARACTER_E_DELAY_MAP.set('ファルザン', ['C']);
CHARACTER_E_DELAY_MAP.set('閑雲', ['P']);
CHARACTER_E_DELAY_MAP.set('嘉明', ['P']);

/** 元素爆発カットイン中に元素粒子を受け取らないキャラクターたち */
export const CHARACTER_Q_NOT_RECHARGEABLE = ['ウェンティ', 'エウルア'];

export function getElementalSkillActions(character: string) {
    const particleMaster = PARTICLE_MASTER[character];
    return particleMaster ? Object.keys(particleMaster).filter(action => action.startsWith('E') && action.indexOf('(burst)') == -1) : ['E'];
}

export function getParticleInfo(character: string, action: string, constellation = 0, isBursting = false) {
    const result: TParticleInfo = [0, SP_NEXT, 0, undefined, undefined];    // 粒子数, 受取タイプ, 継続時間, クールタイム, 粒子生成CT
    const particleMaster = PARTICLE_MASTER[character];
    if (particleMaster) {
        const keyArr: string[] = [];
        if (isBursting) {
            keyArr.push(action + '(burst)');
        }
        keyArr.push(action);
        for (const key of keyArr) {
            if (key in particleMaster) {
                const work = particleMaster[key];
                if (_.isNumber(work)) {
                    result[0] = work;
                } else if (_.isArray(work)) {
                    let start = 0;
                    if (work.length > 5 && work[5] !== undefined && work[5] <= (constellation + C0)) {
                        start = 6;
                    }
                    for (let i = 0; i < 5; i++) {
                        if (work.length > (i + start)) {
                            result[i] = work[i + start];
                        }
                    }
                }
                break;
            }
        }
    }
    return result;
}

export function getParticleNumFromInfo(particleInfo: TParticleInfo, leftTime?: number) {
    let result = 0;
    if (_.isNumber(particleInfo)) {
        result = particleInfo;
    } else {
        result = particleInfo[0] ?? 0;
        const receiveType = getReceiveTypeFromInfo(particleInfo);
        if ([SP_LONG].includes(receiveType)) {
            const particleCt = getParticleCooltimeFromInfo(particleInfo);
            if (particleCt) {
                result /= particleCt;
            }
            let duration = getDurationFromInfo(particleInfo);
            if (duration > 0) {
                if (leftTime !== undefined && duration > leftTime) {
                    duration = Math.max(0, leftTime);
                }
                result *= duration;
            }
        }
    }
    return result;
}

export function getReceiveTypeFromInfo(particleInfo: TParticleInfo) {
    return (_.isArray(particleInfo) && particleInfo.length > 1) ? particleInfo[1] ?? SP_NEXT : SP_NEXT;
}

/** 元素スキルの継続時間を取得します */
export function getDurationFromInfo(particleInfo: TParticleInfo) {
    return (_.isArray(particleInfo) && particleInfo.length > 2) ? particleInfo[2] ?? 0 : 0;
}

/** 元素スキルのクールタイムを取得します */
export function getCooltimeFromInfo(particleInfo: TParticleInfo) {
    return (_.isArray(particleInfo) && particleInfo.length > 3) ? particleInfo[3] : undefined;
}

/** 粒子生成クールタイムを取得します */
export function getParticleCooltimeFromInfo(particleInfo: TParticleInfo) {
    return (_.isArray(particleInfo) && particleInfo.length > 4) ? particleInfo[4] : undefined;
}
