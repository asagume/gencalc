import _ from "lodash";
import { NUMBER_OF_MEMBERS, TActionItem } from "./team";
import { RECHARGE_ENERGY_WEAPON, countN, countQ } from "./ERCalculatorCommon";

export type TWeaponEnergyRet = [string, string, number, number, number, number[], string[]];

export const WEAPON_ENERGY_FUNC: {
    [key: string]: (
        character: string,
        weapon: string,
        weaponRefine: number,
        members: string[],
        rotationLength: number,
        rotationList: TActionItem[] | undefined,
    ) => TWeaponEnergyRet
} = {
    '金珀·試作': (character, weapon, weaponRefine, members, rotationLength, rotationList) => { // eslint-disable-line
        const messages = [
            '元素爆発を発動した後の6秒間、2秒毎に元素エネルギーを4/4.5/5/5.5/6回復し、チーム全員のHPを2秒毎に4%/4.5%/5%/5.5%/6%回復する。',
        ];
        const myEnergy = [4, 4.5, 5, 5.5, 6][weaponRefine - 1] * 3 * countQ(character, rotationList);
        const allEnergy = 0;
        const otherEnergy = 0;
        const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        return [RECHARGE_ENERGY_WEAPON, weapon, myEnergy, allEnergy, otherEnergy, herEnergies, messages];
    },
    '桂木斬長正': (character, weapon, weaponRefine, members, rotationLength, rotationList) => {
        return weaponEnergySub_名士の振舞(character, weapon, weaponRefine, members, rotationLength, rotationList);
    },
    '喜多院十文字槍': (character, weapon, weaponRefine, members, rotationLength, rotationList) => {
        return weaponEnergySub_名士の振舞(character, weapon, weaponRefine, members, rotationLength, rotationList);
    },
    '不滅の月華': (character, weapon, weaponRefine, members, rotationLength, rotationList) => { // eslint-disable-line
        const messages = [
            '元素爆発を発動した後の12秒間、通常攻撃が敵に命中すると元素エネルギーが0.6ポイント回復する。この方式での元素エネルギー回復は、0.1秒毎に1回のみ可能。',
        ];
        const myEnergy = 0.6 * countN(character, rotationList, true);
        const allEnergy = 0;
        const otherEnergy = 0;
        const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        return [RECHARGE_ENERGY_WEAPON, weapon, myEnergy, allEnergy, otherEnergy, herEnergies, messages];
    },
    '碧落の瓏': (character, weapon, weaponRefine, members, rotationLength, rotationList) => { // eslint-disable-line
        const messages = [
            '元素爆発を起動、またはシールドを生成した後の3秒間、「定土玉圭」効果を発動する。2.5秒毎に元素エネルギーを4.5/5/5.5/6/6.5回復',
        ];
        const myEnergy = [4.5, 5, 5.5, 6, 6.5][weaponRefine - 1];
        const allEnergy = 0;
        const otherEnergy = 0;
        const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        return [RECHARGE_ENERGY_WEAPON, weapon, myEnergy, allEnergy, otherEnergy, herEnergies, messages];
    },
    '正義の報酬': (character, weapon, weaponRefine, members, rotationLength, rotationList) => { // eslint-disable-line
        const messages = [
            '治療を受けた時、元素エネルギーを8/10/12/14/16ポイント回復する。この効果は10秒毎に1回のみ発動可能。キャラクターが待機中でも発動できる。',
        ];
        const myEnergy = [8, 10, 12, 14, 16][weaponRefine - 1] * Math.trunc(rotationLength / 10);
        const allEnergy = 0;
        const otherEnergy = 0;
        const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        return [RECHARGE_ENERGY_WEAPON, weapon, myEnergy, allEnergy, otherEnergy, herEnergies, messages];
    },
    '久遠流転の大典': (character, weapon, weaponRefine, members, rotationLength, rotationList) => { // eslint-disable-line
        const messages = [
            '現在のHPが増える、または減る時、継続時間4秒、最大3層まで。0.3秒毎に1回のみ発動可能。3層まで重ねた時、または3層の継続時間がリセットされた時、元素エネルギーを8/9/10/11/12ポイント回復する。この方法による元素エネルギーの回復は、12秒に1回のみ。',
        ];
        const myEnergy = [8, 9, 10, 11, 12][weaponRefine - 1];
        const allEnergy = 0;
        const otherEnergy = 0;
        const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
        return [RECHARGE_ENERGY_WEAPON, weapon, myEnergy, allEnergy, otherEnergy, herEnergies, messages];
    },
    '船渠剣': (character, weapon, weaponRefine, members, rotationLength, rotationList) => {
        return weaponEnergySub_船工の唄(character, weapon, weaponRefine, members, rotationLength, rotationList);
    },
    '携帯型チェーンソー': (character, weapon, weaponRefine, members, rotationLength, rotationList) => {
        return weaponEnergySub_船工の唄(character, weapon, weaponRefine, members, rotationLength, rotationList);
    },
}

 function weaponEnergySub_名士の振舞(
    character: string,
    weapon: string,
    weaponRefine: number,
    members: string[],  // eslint-disable-line
    rotationLength: number,  // eslint-disable-line
    rotationList: TActionItem[] | undefined,
): TWeaponEnergyRet {
    const messages = [
        '元素スキルが命中した時、キャラクターは元素エネルギーを3失う。その後の6秒間、2秒毎に元素エネルギーを3/3.5/4/4.5/5獲得する。この効果は10秒毎に1回のみ発動でき、待機中のキャラクターも発動できる。',
    ];
    let myEnergy = 0;
    const unit = [3, 3.5, 4, 4.5, 5][weaponRefine - 1];
    if (rotationList?.length) {
        let isInCt = false;
        for (let i = 0; i < rotationList.length; i++) {
            const rotation = rotationList[i];
            if (rotation.member == character) {
                if (rotation.action.startsWith('E')) {
                    if (!isInCt) {
                        myEnergy += unit * 3;
                        if (i === 0 || rotationList[i - 1].member != character || rotationList[i - 1].action !== 'Q') {
                            myEnergy -= 3;
                        }
                    }
                    isInCt = true;
                }
            } else {
                isInCt = false;
            }
        }
    } else {
        myEnergy = unit * 3 - 3;
    }
    const allEnergy = 0;
    const otherEnergy = 0;
    const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
    return [RECHARGE_ENERGY_WEAPON, weapon, myEnergy, allEnergy, otherEnergy, herEnergies, messages];
}

 function weaponEnergySub_船工の唄(
    character: string,  // eslint-disable-line
    weapon: string,
    weaponRefine: number,
    members: string[],  // eslint-disable-line
    rotationLength: number,
    rotationList: TActionItem[] | undefined,  // eslint-disable-line
): TWeaponEnergyRet {
    const messages = [
        '治療効果を受ける、または治療効果を与える時、強靭マークが1枚付与される。継続時間30秒、最大3枚まで。元素スキル、または元素爆発を発動する時、すべての強靭マークを消費し、継続時間10秒の「奮起」効果を獲得する。「奮起」効果を獲得した2秒後、消費した強靭マーク1枚につき、装備者の元素エネルギーを2/2.5/3/3.5/4ポイント回復する。「奮起」効果は15秒に1回のみ発動可能。キャラクターが待機中でも強靭マークを獲得できる。',
    ];
    const myEnergy = [2, 2.5, 3, 3.5, 4][weaponRefine - 1] * 3 * Math.trunc(rotationLength / 15);
    const allEnergy = 0;
    const otherEnergy = 0;
    const herEnergies = _.fill(Array(NUMBER_OF_MEMBERS), 0);
    return [RECHARGE_ENERGY_WEAPON, weapon, myEnergy, allEnergy, otherEnergy, herEnergies, messages];
}
