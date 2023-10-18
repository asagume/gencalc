import _ from "lodash";

// 継続時間が存在かつ2以上の場合、元素粒子数は1秒あたりの元素粒子数とみなす
export type TParticleInfo = number | number[];
export type TParticleEntry = {
    [key: string]: TParticleInfo,
};
export type TParticleMaster = {
    [key: string]: TParticleEntry,
};

// 元素粒子数
// [元素粒子数, 拾得ディレイ]
// [元素粒子数, 拾得ディレイ, 継続時間, クールタイム]
// [元素粒子数, 拾得ディレイ, 継続時間, クールタイム, 命ノ星座, 元素粒子数, 拾得ディレイ, 継続時間, クールタイム]
export const PARTICLE_MASTER: TParticleMaster = {
    'ヌヴィレット': {
        'E': [4, 1, 0, 12],
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
        'E': [4 / 6, 0, 6, 12],
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
        'E': [4 / 10, 0, 10, 18],
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
        'E': [5 / 9, 0, 9, 16],
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
        'E': [2 / 3, -1, 10, 24, 6, 2 / 3, -1, 12, 24],
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

export function getElementalSkillActions(character: string) {
    const particleMaster = PARTICLE_MASTER[character];
    return particleMaster ? Object.keys(particleMaster).filter(action => action.startsWith('E') && action.indexOf('(burst)') == -1) : ['E'];
}

export function getParticleInfo(character: string, action: string, constellation = 0, isBursting = false) {
    let result;
    const particleMaster = PARTICLE_MASTER[character];
    if (particleMaster) {
        const postfix = isBursting ? '(burst)' : '';
        for (const workAction of [action + postfix, action]) {
            result = particleMaster[workAction];
            if (_.isArray(result) && result.length > 4) {
                if (result[4] >= constellation) {
                    result = result.slice(5);       // 5,6,7,8
                } else {
                    result = result.slice(0, 4);    // 1,2,3,4
                }
            }
            if (result !== undefined) break;
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
        let duration = getDurationFromInfo(particleInfo);
        if (duration > 0) {
            if (leftTime !== undefined && duration > leftTime) {
                duration = Math.max(0, leftTime);
            }
            result *= duration;
        }
    }
    return result;
}

export function getReceiverFromInfo(particleInfo: TParticleInfo) {
    return (_.isArray(particleInfo) && particleInfo.length > 1) ? particleInfo[1] : 1;
}

export function getDurationFromInfo(particleInfo: TParticleInfo) {
    return (_.isArray(particleInfo) && particleInfo.length > 2) ? particleInfo[2] : 0;
}
