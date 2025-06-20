import _ from "lodash";

// 継続時間が存在かつ2以上の場合、元素粒子数は1秒あたりの元素粒子数とみなす
export type TParticleInfo = number | (number | undefined)[];
export type TParticleEntry = {
    [key: string]: TParticleInfo,
};
export type TParticleMaster = {
    [key: string]: TParticleEntry,
};

export const SP_SELF = 0x1000;  // 元素粒子数=[0] or [0]*回数 or [0]/[4]*[2]    アクション実行者
export const SP_NEXT = 0x1001;  // 元素粒子数=[0]                               次のアクション実行者
export const SP_LONG = 0x1002;  // 元素粒子数=[0]/[4]*[2]                       出場時間で分配
export const SP_SHRT = 0x1003;  // 元素粒子数=[0] or [0]*回数 or [0]/[4]*[2]    出場時間で分配
const C0 = 0x2000;  // 命ノ星座 第0重
const C1 = 0x2001;  // 命ノ星座 第1重
const C2 = 0x2002;  // 命ノ星座 第2重
const C4 = 0x2004;  // 命ノ星座 第4重
const C6 = 0x2006;  // 命ノ星座 第6重
export const CT_AFTER_DURATION = 0x1000;    // 継続時間終了後にクールタイムに入るタイプ
const PARTICLE_GENERATE_1 = 0x1000; // 1アクションで元素粒子を生成する回数=1回
const PARTICLE_GENERATE_2 = 0x2000; // 1アクションで元素粒子を生成する回数=2回
const PARTICLE_GENERATE_3 = 0x3000; // 1アクションで元素粒子を生成する回数=3回
const PARTICLE_GENERATE_4 = 0x4000; // 1アクションで元素粒子を生成する回数=4回
const PARTICLE_GENERATE_5 = 0x5000; // 1アクションで元素粒子を生成する回数=5回
const PARTICLE_GENERATE_6 = 0x6000; // 1アクションで元素粒子を生成する回数=6回
// [0]粒子数
// [0]粒子数,[1]受取タイプ
// [0]粒子数,[1]受取タイプ,[2]継続時間,[3]クールタイム,[4]粒子生成クールタイム
// [0]粒子数,[1]受取タイプ,[2]継続時間,[3]クールタイム,[4]粒子生成クールタイム,[5]命ノ星座,[6]粒子数,[7]受取タイプ,[8]継続時間,[9]クールタイム,[10]粒子生成クールタイム
const PARTICLE_MASTER: TParticleMaster = {
    'ダリア': {
        'E.Press': [3, SP_NEXT, undefined, 9, undefined],
        'E.Hold': [3, SP_NEXT, undefined, 9, undefined],
    },
    'スカーク': {
        'E.Press': [4, SP_NEXT, undefined, 8 + CT_AFTER_DURATION, 15],
        'E.Hold': [4, SP_NEXT, undefined, 8 + CT_AFTER_DURATION, 15],
    },
    'イファ': {
        'E': [4, SP_SELF, undefined, 7.5 + CT_AFTER_DURATION, undefined],
    },
    'エスコフィエ': {
        'E': [4, SP_NEXT, 20, 15, undefined],
    },
    'イアンサ': {
        'E': [4, SP_NEXT, undefined, 16, undefined],
    },
    'ヴァレサ': {
        'E': [2.3, SP_NEXT, undefined, 9, undefined],
    },
    '夢見月瑞希': {
        'E': [1, SP_SELF, 5, 15, 0.5 + PARTICLE_GENERATE_4],
    },
    '藍硯': {
        'E': [3, SP_NEXT, 12.5, 16, undefined],
    },
    'シトラリ': {
        'E': [5, SP_NEXT, 20, 16, undefined],
    },
    'マーヴィカ': {
        'E.Press': [5, SP_NEXT, undefined, 15, undefined],  // 継続時間は夜魂値に依存
        'E.Hold': [5, SP_NEXT, undefined, 15, undefined],   // 継続時間は夜魂値に依存
    },
    'チャスカ': {
        'E': [5, SP_SELF, undefined, 6.5 + CT_AFTER_DURATION, undefined],   // 継続時間は夜魂値に依存
    },
    'オロルン': {
        'E': [3, SP_NEXT, undefined, 15, undefined],    // 継続時間は夜魂値に依存
    },
    'シロネン': {
        'E': [4, SP_NEXT, 1, 7 + CT_AFTER_DURATION, undefined], // 継続時間はEN2の場合を記載、それ以外は夜魂値に依存
    },
    'キィニチ': {
        'E': [5, SP_NEXT, undefined, 18, undefined],    // 継続時間は夜魂値に依存
        'E(skill)': 0,
    },
    'カチーナ': {
        'E': [0.67, SP_SHRT, undefined, 20, 2 + PARTICLE_GENERATE_6],  // 0.667 * 6回、攻撃回数は夜魂値に依存
    },
    'ムアラニ': {
        'E': [4.5, SP_NEXT, undefined, 6 + CT_AFTER_DURATION, undefined],   // 継続時間は夜魂値に依存
    },
    'エミリエ': {
        'E': [1, SP_LONG, 22, 14, 2.5],
    },
    'セトス': {
        'E': 2,
    },
    'シグウィン': {
        'E.Press': [4, SP_NEXT, undefined, 18, undefined],
        'E.Hold': [4, SP_NEXT, undefined, 18, undefined],
    },
    'クロリンデ': {
        'E': [1, SP_SELF, 7.5, 16, 2],
        'E(skill)': 0,
    },
    'アルレッキーノ': {
        'E': [5, SP_NEXT, 30, 30, undefined],
    },
    '千織': {
        'E.Press': [1.2, SP_LONG, 17, 15, 3.6],
        'E.Hold': [1.2, SP_LONG, 17, 15, 3.6],
    },
    '嘉明': {
        'E': [2, SP_NEXT, undefined, 6, 3], // CT3s
    },
    '閑雲': {
        'E': [5, SP_NEXT, undefined, 12, undefined],
    },
    'シュヴルーズ': {
        'E.Press': [4, SP_NEXT, 12, 15, 10],
        'E.Hold': [4, SP_NEXT, 12, 15, 10, C4, 4, SP_NEXT, 12, 15, 10],   // CT10s
    },
    'ナヴィア': {
        'E.Press': [3.5, SP_NEXT, undefined, 9, undefined],
        'E.Hold': [3.5, SP_NEXT, undefined, 9, undefined],
    },
    'シャルロット': {
        'E.Press': [3, SP_NEXT, 6, 12, undefined],  // スナップシルエット
        'E.Hold': [5, SP_NEXT, 12, 18, undefined],  // フォーカスインプレッション 最大画角まで2秒かかる
    },
    'フリーナ': {
        'E': [1, SP_LONG, 30, 20, 2.5],   // CT2.5s
    },
    'リオセスリ': {
        'E': [1, SP_SELF, 10, 16, 2, C1, 1, SP_SELF, 14, 16, 2],    // CT2s
    },
    'ヌヴィレット': {
        'E': [4, SP_NEXT, undefined, 12, undefined],
    },
    'リネ': {
        'E': [5, SP_NEXT, undefined, 15, undefined],
    },
    '白朮': {
        'E': [3.5, SP_NEXT, undefined, 10, undefined],
    },
    'ディシア': {
        'E': [1, SP_LONG, 12, 20, 2.5, C2, 1, SP_LONG, 18, 20, 2.5],    // フィールドダメージ CT2.5s
    },
    'アルハイゼン': {
        'E.Press': [1, SP_SELF, 0, 18, 1.6 + PARTICLE_GENERATE_6],   // 光幕攻撃1回あたり1個 CT1.6s
        'E.Hold': [1, SP_SELF, 0, 18, 1.6 + PARTICLE_GENERATE_6],    // 光幕攻撃1回あたり1個 CT1.6s
    },
    '放浪者': {
        'E': [1, SP_SELF, 10, 6 + CT_AFTER_DURATION, 2 + PARTICLE_GENERATE_5, C6, 1, SP_SELF, 12, 6 + CT_AFTER_DURATION, 2 + PARTICLE_GENERATE_5],
    },
    'ナヒーダ': {
        'E.Press': [3, SP_LONG, 25, 5, 7],     // CT7s
        'E.Hold': [3, SP_LONG, 25, 6, 7],      // CT7s
    },
    'ニィロウ': {
        'E': [1.5 + 1 + 1 + 1, SP_SELF, 8, 18, undefined],  // 祈月継続時間8秒 天を滌う水環の継続時間12秒
    },
    'セノ': {
        'E': [3, SP_NEXT, undefined, 7.5, undefined],
        'E(burst)': [1.33, SP_NEXT, undefined, 3, undefined],  // 冥祭クールタイム3s
    },
    'ティナリ': {
        'E': [3.5, SP_NEXT, 8, 12, undefined],
    },
    '夜蘭': {
        'E.Press': [4, SP_NEXT, undefined, 10, undefined],
        'E.Hold': [4, SP_NEXT, undefined, 10, undefined],
    },
    '神里綾人': {
        'E': [1.5, SP_SELF, 6, 12, 2.5 + PARTICLE_GENERATE_3],
    },
    '八重神子': {
        'E': [1, SP_LONG, 14, 4, 2.5],    // CT2.5s
    },
    '申鶴': {
        'E.Press': [3, SP_NEXT, 10, 10, undefined],
        'E.Hold': [4, SP_NEXT, 15, 15, undefined],
    },
    '荒瀧一斗': {
        'E': [3.5, SP_NEXT, 6, 10, undefined],
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
        'E': [1, SP_SELF, 10, 18, 2 + PARTICLE_GENERATE_4],   // CT2s 4回まで
    },
    '神里綾華': {
        'E': [4.5, SP_NEXT, undefined, 10, undefined],
    },
    '楓原万葉': {
        'E.Press': [3, SP_NEXT, undefined, 6, undefined],
        'E.Hold': [4, SP_NEXT, undefined, 9, undefined],
    },
    'エウルア': {
        'E.Press': [1.5, SP_NEXT, undefined, 4, undefined],
        'E.Hold': [2.5, SP_NEXT, undefined, 10, undefined],
    },
    '胡桃': {
        'E': [2.5, SP_SELF, 9, 16, 5 + PARTICLE_GENERATE_2], // CT5s 2回まで
    },
    '魈': {
        'E': [3, SP_NEXT, undefined, 10, undefined],
        'E(burst)': [0, SP_NEXT, undefined, 10, undefined],
    },
    '甘雨': {
        'E': [2, SP_SHRT, 6, 10, 0 + PARTICLE_GENERATE_2]
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
        'E': [3.5, SP_NEXT, undefined, 20, undefined],
    },
    'ウェンティ': {
        'E.Press': [3, SP_NEXT, undefined, 6, undefined],
        'E.Hold': [4, SP_NEXT, undefined, 15, undefined],
    },
    '刻晴': {
        'E.Press': [2.5, SP_NEXT, undefined, 7.5, undefined],
        'E.Hold': [2.5, SP_NEXT, undefined, 7.5, undefined],
    },
    'モナ': {
        'E.Press': [3.33, SP_SHRT, 5, 12, undefined],
        'E.Hold': [3.33, SP_SHRT, 5, 12, undefined],
    },
    '七七': {
        'E': [0, SP_NEXT, 15, 30, undefined],
    },
    'ディルック': {
        'E': [1.33, SP_SELF, undefined, 10, 0 + PARTICLE_GENERATE_3],
    },
    'ジン': {
        'E.Press': [2.67, SP_NEXT, undefined, 6, undefined],
        'E.Hold': [2.67, SP_NEXT, 1, 6 + CT_AFTER_DURATION, undefined], // 長押し最大5秒
    },
    'フレミネ': {
        'E': [2, SP_NEXT, undefined, 10, undefined],
        'E(burst)': [1, SP_NEXT, undefined, 10, undefined], // 潜猟モード
    },
    'リネット': {
        'E.Press': [4, SP_NEXT, undefined, 12, undefined],
        'E.Hold': [4, SP_NEXT, undefined, 12, undefined],
    },
    '綺良々': {
        'E.Press': [3, SP_NEXT, 12, 8, undefined],
        'E.Hold': [3 + 1, SP_NEXT, 12, 12, undefined],
    },
    'カーヴェ': {
        'E': [2, SP_NEXT, undefined, 6, undefined],
    },
    'ミカ': {
        'E.Press': [4, SP_NEXT, 12, 15, undefined],
        'E.Hold': [4, SP_NEXT, 12, 15, undefined],
    },
    'ヨォーヨ': {
        'E.Press': [1, SP_LONG, 10, 15, 1.5],
        'E.Hold': [1, SP_LONG, 10, 15, 1.5]
    },
    'ファルザン': {
        'E': [2, SP_NEXT, 18, 6, 5.5, C6, 2, SP_LONG, 18, 20, 5.5], // CT5.5s
    },
    'レイラ': {
        'E': [1.33, SP_LONG, 12, 12, 3]     // CT3s
    },
    'キャンディス': {
        'E.Press': [2, SP_NEXT, undefined, 6, undefined],
        'E.Hold': [3, SP_NEXT, undefined, 9, undefined],
    },
    'ドリー': {
        'E': [2, SP_NEXT, undefined, 9, undefined],
    },
    'コレイ': {
        'E': [3, SP_NEXT, undefined, 12, undefined],
    },
    '鹿野院平蔵': {
        'E': 4,     // 2:変格0-1/2.5:変格2-3/3:変格4=正論
    },
    '久岐忍': {
        'E': [0.45, SP_LONG, 12, 15, 1.5, C2, 0.45, SP_LONG, 15, 15, 1.5],  // CT1.5s
    },
    '雲菫': {
        'E.Press': [2, SP_NEXT, undefined, 9, undefined],
        'E.Hold': [3, SP_NEXT, undefined, 9, undefined],
    },
    'ゴロー': {
        'E.Press': [2, SP_NEXT, 10, 10, undefined],
        'E.Hold': [2, SP_NEXT, 10, 10, undefined],
    },
    'トーマ': {
        'E': [3.5, SP_NEXT, 8, 15, undefined],
    },
    '九条裟羅': {
        'E': [3, SP_NEXT, 10, 6, undefined],
    },
    '早柚': {
        'E.Press': [2, SP_NEXT, undefined, 6, undefined],
        'E.Hold': [3, SP_NEXT, 10, 10 + CT_AFTER_DURATION, undefined], // 最大10秒継続可能
    },
    '煙緋': {
        'E': [3, SP_NEXT, undefined, 9, undefined],
    },
    'ロサリア': {
        'E': [3, SP_NEXT, undefined, 6, undefined],
    },
    '辛炎': {
        'E': [4, SP_NEXT, 12, 18, undefined],
    },
    'ディオナ': {
        'E.Press': [0.8 * 2, SP_NEXT, 4.8, 6, undefined], // 継続時間は天賦レベルに依存 Lv.7以降は命中したフリーズキャッツクローの数×2.4秒
        'E.Hold': [0.8 * 5, SP_NEXT, 12, 15, undefined], // 継続時間は天賦レベルに依存 Lv.7以降は命中したフリーズキャッツクローの数×2.4秒
    },
    'スクロース': {
        'E': [4, SP_NEXT, undefined, 15, undefined],
    },
    '重雲': {
        'E': [4, SP_NEXT, 10, 15, undefined],
    },
    'ノエル': {
        'E': [0, SP_NEXT, 12, 24, undefined],
    },
    'ベネット': {
        'E.Press': [2.25, SP_NEXT, undefined, 6, undefined],
        'E.Hold': [3, SP_NEXT, undefined, 7.5, undefined],  // 1段チャージの上に2段チャージ（CT10）があるが省略
    },
    'フィッシュル': {
        'E': [0.67, SP_LONG, 10, 25, 1, C6, 0.67, SP_LONG, 12, 25, 1],
    },
    '凝光': {
        'E': [3.33, SP_NEXT, undefined, 12, undefined],
    },
    '行秋': {
        'E': [4.5, SP_NEXT, 15, 21, undefined],
    },
    '北斗': {
        'E.Press': [2, SP_NEXT, undefined, 7.5, undefined],
        'E.Hold': [4, SP_NEXT, undefined, 7.5, undefined],  // 最大
    },
    '香菱': {
        'E': [1, SP_SHRT, 8, 12, 2 + PARTICLE_GENERATE_4],
    },
    'レザー': {
        'E.Press': [3, SP_NEXT, undefined, 6, undefined],
        'E.Hold': [4, SP_NEXT, undefined, 10, undefined],
        'E.Press(burst)': 0,
    },
    'バーバラ': {
        'E': [0, SP_NEXT, 15, 32, undefined, C2, 0, SP_NEXT, 15, 27.2, undefined],
    },
    'リサ': {
        'E.Press': [0, SP_NEXT, undefined, 1, undefined],
        'E.Hold': [5, SP_NEXT, undefined, 16, undefined],
    },
    'ガイア': {
        'E': [2.67, SP_NEXT, undefined, 6, undefined],
    },
    'アンバー': {
        'E.Press': [4, SP_SHRT, 8, 15, undefined],
        'E.Hold': [4, SP_SHRT, 8, 15, undefined],
    },
    '旅人(炎)': {
        'E.Press': [1, SP_SHRT, 12, 18, 2.9],   // 継続時間は夜魂値に依存。最大12秒、補充なしなら6秒
        'E.Hold': [1, SP_SHRT, 12, 18, 2.9],    // 継続時間は夜魂値に依存。最大12秒、補充なしなら6秒
    },
    '旅人(水)': {
        'E.Press': [3.33, SP_NEXT, undefined, 10, undefined],
        'E.Hold': [3.33, SP_NEXT, 6, 10, undefined],            // 長押しの継続時間は最大6秒
    },
    '旅人(草)': {
        'E': [2.5, SP_NEXT, undefined, 8, undefined],
    },
    '旅人(雷)': {
        'E': [1, SP_NEXT, 6, 13.5, undefined],
    },
    '旅人(岩)': {
        'E.Press': [3.33, SP_NEXT, 30, 6, undefined],   // 固有天賦1でCT-2
        'E.Hold': [3.33, SP_NEXT, 30, 6, undefined],    // 固有天賦1でCT-2
    },
    '旅人(風)': {
        'E.Press': [2, SP_NEXT, undefined, 5, undefined],
        'E.Hold': [3.33, SP_NEXT, undefined, 8, undefined], // 最大チャージ
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
export const CHARACTER_Q_TO_E_ARR = ['フィッシュル', '珊瑚宮心海', 'エミリエ'];
/** 元素爆発で元素スキルCTリセットするキャラクターたち */
export const CHARACTER_E_CT_RESET_BY_Q_ARR = ['フレミネ', 'アルレッキーノ'];

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

/** 元素スキル継続中に元素スキルボタンを何度も押せるキャラクターたち */
export const CHARACTER_E_FIRST_ARR = ['シュヴルーズ', 'クロリンデ', 'キィニチ'];

/** 元素爆発カットイン中に元素粒子を受け取らないキャラクターたち */
export const CHARACTER_Q_NOT_RECHARGEABLE = ['ウェンティ', 'エウルア'];

export function getElementalSkillActions(character: string) {
    const particleMaster = PARTICLE_MASTER[character];
    return particleMaster ? Object.keys(particleMaster).filter(action => action.startsWith('E') && !action.includes('(burst)') && !action.includes('(skill)')) : ['E'];
}

export function getParticleInfo(character: string, action: string, constellation = 0, isBursting = false, isSkilling = false) {
    const result: TParticleInfo = [0, SP_NEXT, 0, undefined, undefined];    // 粒子数, 受取タイプ, 継続時間, クールタイム, 粒子生成CT
    const particleMaster = PARTICLE_MASTER[character];
    if (particleMaster) {
        const keyArr: string[] = [];
        if (isBursting) {
            keyArr.push(action + '(burst)');
        }
        if (isSkilling) {
            keyArr.push(action + '(skill)');
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
        const particleCooltime = getParticleCooltimeFromInfo(particleInfo);
        const generateCount = getParticleGenerateCountFromInfo(particleInfo);
        let duration = getDurationFromInfo(particleInfo);
        switch (receiveType) {
            case SP_SELF:   // 分割
            case SP_SHRT:   // 継続(短)
                if (generateCount) {
                    result *= generateCount;
                } else if (particleCooltime && duration) {
                    result *= Math.ceil(duration / particleCooltime);
                }
                break;
            case SP_NEXT:   // 一括
                break;
            case SP_LONG:   // 継続(長)
                if (particleCooltime) {
                    result /= particleCooltime;
                }
                if (duration > 0) {
                    if (leftTime !== undefined && duration > leftTime) {
                        duration = Math.max(0, leftTime);
                    }
                    result *= duration;
                }
                break;
        }
    }
    return _.round(result, 2);
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
    let result = (_.isArray(particleInfo) && particleInfo.length > 3) ? particleInfo[3] : undefined;
    if (result) {
        if (result > CT_AFTER_DURATION) {
            result -= CT_AFTER_DURATION;
        }
    }
    return result;
}

/** 元素スキルのクールタイムのタイプを取得します */
export function getCooltimeTypeFromInfo(particleInfo: TParticleInfo) {
    let result = (_.isArray(particleInfo) && particleInfo.length > 3) ? particleInfo[3] : undefined;
    if (result) {
        if (result > CT_AFTER_DURATION) {
            result = CT_AFTER_DURATION;
        } else {
            result = 0;
        }
    }
    return result;
}

/** 粒子生成クールタイムを取得します */
export function getParticleCooltimeFromInfo(particleInfo: TParticleInfo) {
    let result = (_.isArray(particleInfo) && particleInfo.length > 4) ? particleInfo[4] : undefined;
    if (result) {
        while (result >= PARTICLE_GENERATE_1) {
            result -= PARTICLE_GENERATE_1;
        }
        result = _.round(result, 2);
    }
    return result;
}

/** 粒子生成可能回数を取得します */
export function getParticleGenerateCountFromInfo(particleInfo: TParticleInfo) {
    let result = (_.isArray(particleInfo) && particleInfo.length > 4) ? particleInfo[4] : undefined;
    if (result) {
        result = Math.trunc(result / PARTICLE_GENERATE_1);
    }
    return result;
}
