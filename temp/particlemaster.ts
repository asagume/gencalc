import _ from "lodash";

// 継続時間が存在かつ2以上の場合、元素粒子数は1秒あたりの元素粒子数とみなす
export type TParticleInfo = number | number[];
export type TParticleEntry = {
    [key: string]: TParticleInfo,
};
export type TParticleMaster = {
    [key: string]: TParticleEntry,
};

export const SP_SELF = 0;      // 元素粒子数=[0]       アクション実行者
export const SP_NEXT = 1;      // 元素粒子数=[0]       次のアクション実行者
export const SP_LONG = -1;     // 元素粒子数=[0]*[2]   出場時間で分配
export const SP_SHRT = -2;     // 元素粒子数=[0]       出場時間で分配
const C1 = 1;
const C2 = 2;
// const C4 = 4;
const C6 = 6;
export const PARTICLE_MASTER: TParticleMaster = {
    'リオセスリ': {
        'E': [3, SP_SELF, 10, 16, C1, 3, SP_SELF, 14, 16],  // CT2s
    },
    'ヌヴィレット': {
        'E': [4, SP_NEXT, 0, 12],
    },
    'リネ': {
        'E': 5,
    },
    '白朮': {
        'E': 3.5,
    },
    'ディシア': {
        'E': [1 / 2.5, SP_LONG, 12, 20, C2, 1 / 2.5, SP_LONG, 18, 20],  // フィールドダメージ CT2.5s
    },
    'アルハイゼン': {
        'E.Press': [6, SP_SELF],    // 光幕攻撃1回あたり1個 CT1.6s
        'E.Hold': [6, SP_SELF],     // 光幕攻撃1回あたり1個 CT1.6s
    },
    '放浪者': {
        'E': [5, SP_SELF, 10, 16, C6, 5, SP_SELF, 12, 18],
    },
    'ナヒーダ': {
        'E.Press': [3 / 7, SP_LONG, 25, 5],     // CT7s
        'E.Hold': [3 / 7, SP_LONG, 25, 6],      // CT7s
    },
    'ニィロウ': {
        'E': [1.5 + 1 + 1 + 1, SP_SELF]
    },
    'セノ': {
        'E': 3,
        'E(burst)': 1.333,
    },
    'ティナリ': {
        'E': 3.5,
    },
    '夜蘭': {
        'E.Press': [4, SP_NEXT, 0, 10],
        'E.Hold': [4, SP_NEXT, 0, 10],
    },
    '神里綾人': {
        'E': [4, SP_SELF, 6, 12],
    },
    '八重神子': {
        'E': [1 / 2.5, SP_LONG, 14, 4],     // CT2.5s
    },
    '申鶴': {
        'E.Press': [3, SP_NEXT, 10, 10],
        'E.Hold': [4, SP_NEXT, 15, 15],
    },
    '荒瀧一斗': {
        'E': 3.5,
    },
    '珊瑚宮心海': {
        'E': [0.67 / 2, SP_LONG, 12, 20],   // per damage CT2s
    },
    '雷電将軍': {
        'E': [0.5 / 0.9, SP_LONG, 25, 10],  // per damage CT0.9s
    },
    'アーロイ': {
        'E': 5,
    },
    '宵宮': {
        'E': [4, SP_SELF, 10, 18],          // CT2s
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
        'E': [2.5 * 2, SP_SELF, 9, 16],
    },
    '魈': {
        'E': 3,
        'E(burst)': 0,
    },
    '甘雨': {
        'E': [2 * 2, SP_SHRT, 6, 10]
    },
    'アルベド': {
        'E.Press': [0.67 / 2, SP_LONG, 30, 4],      // 刹那の花ダメージ1回あたり0.67個 CT2s
        'E.Hold': [0.67 / 2, SP_LONG, 30, 4],       // 刹那の花ダメージ1回あたり0.67個 CT2s
    },
    '鍾離': {
        'E.Press': [0.5 / 1.5, SP_LONG, 20, 4],     // CT1.5s
        'E.Hold': [0.5 / 1.5, SP_LONG, 20, 12],     // CT1.5s
    },
    'タルタリヤ': {
        'E': [1 / 3 * 9, SP_SELF],                  // とりあえず居座り時間9sとする。運用次第すぎて計算できない
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
        'E.Press': [3.33, SP_SHRT, 5, 12],
        'E.Hold': [3.33, SP_SHRT, 5, 12],
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
        'E.Press': [1 / 1.5, SP_LONG, 10, 15],
        'E.Hold': [1 / 1.5, SP_LONG, 10, 15]
    },
    'ファルザン': {
        'E': [2, SP_NEXT, 18, 6],   // CT5.5s
    },
    'レイラ': {
        'E': [1.33 / 3, SP_LONG, 12, 12]    // CT3s
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
        'E': [0.45 / 1.5, SP_LONG, 12, 15, C2, 0.45 / 1.5, SP_LONG, 15, 15],    // CT1.5s
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
        'E': [0.67, SP_LONG, 10, 25, C6, 0.67, SP_LONG, 12, 25],
    },
    '凝光': {
        'E': 3,
    },
    '行秋': {
        'E': [4.5, SP_NEXT, 15, 21],
    },
    '北斗': {
        'E.Press': 2,
        'E.Hold': 4,
    },
    '香菱': {
        'E': [4, SP_SHRT, 8, 12],
    },
    'レザー': {
        'E.Press': 3,
        'E.Hold': 4,
        'E.Press(burst)': 0,
    },
    'バーバラ': {
        'E': [0, SP_NEXT, 15, 32, C2, 0, SP_NEXT, 15, 27.2],
    },
    'リサ': {
        'E.Press': 0,
        'E.Hold': 5,
    },
    'ガイア': {
        'E': 2.67,
    },
    'アンバー': {
        'E.Press': [4, SP_SHRT, 8, 15],
        'E.Hold': [4, SP_SHRT, 8, 15],
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
            if (pinfo.length == 2 || pinfo.length == 4 || pinfo.length == 9) {
                if (pinfo.filter(s => !_.isNumber(s)).length == 0) {
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

export function getElementalSkillActions(character: string) {
    const particleMaster = PARTICLE_MASTER[character];
    return particleMaster ? Object.keys(particleMaster).filter(action => action.startsWith('E') && action.indexOf('(burst)') == -1) : ['E'];
}

export function getParticleInfo(character: string, action: string, constellation = 0, isBursting = false) {
    let result: TParticleInfo = 0;
    const particleMaster = PARTICLE_MASTER[character];
    if (particleMaster) {
        const keyArr: string[] = [];
        if (isBursting) {
            keyArr.push(action + '(burst)');
        }
        keyArr.push(action);
        for (const key of keyArr) {
            if (key in particleMaster) {
                result = particleMaster[key];
                if (_.isArray(result) && result.length > 4) {
                    if (result[4] >= constellation) {
                        result = result.slice(5);       // 5,6,7,8
                    } else {
                        result = result.slice(0, 4);    // 1,2,3,4
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
        result = particleInfo[0];
        const receiveType = getReceiveTypeFromInfo(particleInfo);
        if ([SP_LONG].includes(receiveType)) {
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
    return (_.isArray(particleInfo) && particleInfo.length > 1) ? particleInfo[1] : SP_NEXT;
}

export function getDurationFromInfo(particleInfo: TParticleInfo) {
    return (_.isArray(particleInfo) && particleInfo.length > 2) ? particleInfo[2] : 0;
}

export function getCooltimeFromInfo(particleInfo: TParticleInfo) {
    return (_.isArray(particleInfo) && particleInfo.length > 3) ? particleInfo[3] : undefined;
}