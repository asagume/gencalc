<template>
    <div class="er-calculator">
        <div>
            <p>実験中<br />
                うまく仕上げられなければ消えます
            </p>
        </div>
        <div>
            <label>ROTATION LENGTH
                <input type="number" v-model="rotationLength" min="10" max="180" @change="inputOnChange">
            </label>
        </div>
        <br />
        <table class="er-calculator">
            <tr>
                <th colspan="2"></th>
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="bgColorClass(index)">
                    <img :src="characterImgSrc(element.character)" :alt="element.character" class="character">
                </td>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('元素爆発') }}</th>
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="bgColorClass(index)">
                    <input type="number" v-model="element.energyCost">
                </td>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('命ノ星座') }}</th>
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="bgColorClass(index)">
                    <select v-model="element.constellation" @change="inputOnChange">
                        <option v-for="constellation in [0, 1, 2, 3, 4, 5, 6]" :key="constellation" :value="constellation">
                            {{ 'C' + constellation }}
                        </option>
                    </select>
                </td>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('武器') }}</th>
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="'weapon' + bgColorClass(index)">
                    <img :src="weaponImgSrc(element.character, element.weapon)" :alt="element.weapon" class="input-item">
                    <select v-model="element.weaponRefine" @change="inputOnChange">
                        <option v-for="refine in [1, 2, 3, 4, 5]" :key="refine" :value="refine">
                            {{ 'R' + refine }}
                        </option>
                    </select>
                </td>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('元素チャージ効率') }}</th>
                <td v-for="(value, index) in energyRechargeGls" :key="index" :class="bgColorClass(index)">
                    {{ value + '%' }}
                </td>
            </tr>
            <tr class="label-row">
                <th colspan="6"></th>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('出場時間(%)') }}</th>
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="bgColorClass(index)">
                    <input type="number" v-model="element.onField" min="0" max="100" @change="inputOnChange">
                </td>
            </tr>
            <tr class="label-row">
                <th>元素粒子</th>
                <th>{{ displayName('生成数') }}</th>
                <th colspan="4">{{ displayName('拾得数') }}</th>
            </tr>
            <tr v-for="(row, rowIndex) in  calculatorInputEnemy" :key="rowIndex" :class="bgColorClass2(row)">
                <th>
                    {{ displayName('敵') }}
                </th>
                <td>{{ Math.round(row.currents.reduce((p, c) => p + c, 0) * 10) / 10 }}</td>
                <td v-for="columnIndex in [0, 1, 2, 3]" :key="columnIndex">
                    <input type="number" v-model="row.currents[columnIndex]" min="0">
                </td>
            </tr>
            <tr v-for="(row, rowIndex) in  calculatorInputParticle" :key="rowIndex" :class="bgColorClass2(row)">
                <th>
                    <img :src="characterImgSrc(row.character)" :alt="row.character" class="input-item-character">
                    <img :src="triggeredBy3ImgSrc(row)" :alt="row.category3" class="input-item">
                </th>
                <td>{{ Math.round(row.currents.reduce((p, c) => p + c, 0) * 10) / 10 }}</td>
                <td v-for="columnIndex in [0, 1, 2, 3]" :key="columnIndex">
                    <input type="number" v-model="row.currents[columnIndex]" min="0">
                </td>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('元素チャージ') }}</th>
                <td v-for="(value, index) in particleRecharges" :key="index" class="result">
                    {{ value }}
                </td>
            </tr>
            <tr class="label-row">
                <th colspan="2">元素エネルギー</th>
                <th colspan="4">{{ displayName('獲得量') }}</th>
            </tr>
            <tr v-for="(row, rowIndex) in  calculatorInputEnergy" :key="rowIndex" :class="bgColorClass2(row)">
                <th>
                    <img :src="characterImgSrc(row.character)" :alt="row.character" class="input-item-character">
                    <img :src="triggeredBy3ImgSrc(row)" :alt="row.category3" class="input-item">
                </th>
                <td></td>
                <td v-for="columnIndex in [0, 1, 2, 3]" :key="columnIndex">
                    <input type="number" v-model="row.currents[columnIndex]" min="0">
                </td>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('元素爆発(回数)') }}</th>
                <td v-for="index in [0, 1, 2, 3]" :key="index" :class="bgColorClass(index)">
                    <input type="number" v-model="burstCounts[index]" min="0">
                </td>
            </tr>
        </table>
        <br />
        <div>
            <table class="supply-from-enemy">
                <caption @click="isOpenSupplyFromEnemy = !isOpenSupplyFromEnemy">
                    {{ displayName('敵') }}
                </caption>
                <tr>
                    <th></th>
                    <th>元素オーブ</th>
                    <th>元素粒子</th>
                </tr>
                <tr v-for="(element, index) in supplyFromEnemy" :key="index"
                    v-show="isOpenSupplyFromEnemy || element[1] || element[2]">
                    <td>{{ displayName(element[0]) }}</td>
                    <td>
                        <input type="number" v-model="element[1]" min="0" @change="inputOnChange">
                    </td>
                    <td>
                        <input type="number" v-model="element[2]" min="0" @change="inputOnChange">
                    </td>
                </tr>
            </table>
        </div>
        <div class="message-area">
            <p v-for="message of messages" :key="message">{{ message }}</p>
        </div>
        <div>
            <dl>
                <dt>元素スキル</dt>
                <dd></dd>
                <dt>雷元素共鳴</dt>
                <dd></dd>
                <dt>西風武器</dt>
                <dd></dd>
                <dt>刻晴とガイア</dt>
                <dd></dd>
            </dl>
        </div>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, PropType, reactive, ref, watch } from "vue";
import { CHARACTER_ENERGY, CHARACTER_PARTICLE, ENEMY_PARTICLE, getEnergyByCharacter, getEnergyByWeapon, getOnFieldRate, getParticleByCharacter, getParticleByCharacterExtra, getParticleByWeapon, RECHARGE_DIRECT, RECHARGE_PARTICLE_ENEMY, RECHARGE_PARTICLE_FAVONIUS, RECHARGE_PARTICLE_SKILL, RESONANCE_PARTICLE, WEAPON_ENERGY, WEAPON_PARTICLE } from "./energyrecharge";
import { getCharacterDetail, getCharacterMaster, getWeaponMaster, setupCharacterDetailMap, TActionItem, TTeam, TTeamMemberResult } from "./team";
import { ELEMENT_BG_COLOR_CLASS, IMG_SRC_DUMMY } from "@/master";
import CompositionFunction from "@/components/CompositionFunction.vue";
import _ from "lodash";

type TCalculatorInput = {
    character: string,          // キャラクター名
    energyCost: number,         // 元素爆発 元素エネルギー
    constellation: number,      // 命ノ星座
    weapon: string | undefined, // 武器名
    weaponRefine: number,       // 武器精錬ランク
    onField: number,            // 出場率
}

type TCalculatorInputSub = {
    character: string,      // キャラクター名
    triggeredBy: string,    // [CHARACTER|WEAPON|ARTIFACT]_PARTICLE,[CHARACTER|WEAPON|ARTIFACT]_ENERGY
    category3: string,      // キャラクター名,武器名,聖遺物名
    rechargeType: string,   // リチャージ種別
    element: string,        // 元素粒子の元素
    initials: number[],     // 初期値
    currents: number[],     // 現在値
    sum: number,            // 現在値の合計値
    unit: number,           // 単位
}

export default defineComponent({
    name: "ERCalculator",
    props: {
        team: { type: Object as PropType<TTeam>, required: true },
        rotationList: { type: Array as PropType<TActionItem[]>, required: true },
        teamMemberResult: { type: Object as PropType<TTeamMemberResult>, required: true },
    },
    setup(props) {
        const { displayName } = CompositionFunction();
        const calculatorInput = reactive([] as TCalculatorInput[]);
        const calculatorInputParticle = reactive([] as TCalculatorInputSub[]);
        const calculatorInputEnergy = reactive([] as TCalculatorInputSub[]);
        const calculatorInputEnemy = reactive([] as TCalculatorInputSub[]);
        const messages = reactive([] as string[]);
        const rotationLength = ref(20);
        const supplyFromEnemy = reactive([
            ['無色', 3, 0],
            ['炎', 0, 0],
            ['水', 0, 0],
            ['雷', 0, 0],
            ['草', 0, 0],
            ['氷', 0, 0],
            ['岩', 0, 0],
        ] as [string, number, number][]);
        const isOpenSupplyFromEnemy = ref(false);

        onMounted(async () => {
            await setupCharacterDetailMap(props.team);
            setupInput(props.team, props.rotationList, props.teamMemberResult);
        })

        const watchCount = ref(0);
        watch(props, (newVal, oldVal) => {
            setupCharacterDetailMap(newVal.team).then(() => {
                setupInput(newVal.team, newVal.rotationList, newVal.teamMemberResult);
                setupInputSub(newVal.team, newVal.rotationList, newVal.teamMemberResult);
            });
            watchCount.value++;
        });

        const setupInput = (team: TTeam, rotationList: TActionItem[], teamMemberResult: TTeamMemberResult) => {
            if (!team) return;
            const newCalculatorInput: TCalculatorInput[] = [];
            const onFields = getOnFieldRate(team, rotationLength.value, rotationList);
            for (let i = 0; i < team.members.length; i++) {
                const member = team.members[i];
                const characterDetail = getCharacterDetail(member.name);
                const memberResult = teamMemberResult[member.id];
                const constellation = memberResult?.characterInput.命ノ星座 ?? 0;
                const weapon = memberResult?.characterInput.weapon;
                const weaponRefine = memberResult?.characterInput.武器精錬ランク ?? 1;
                newCalculatorInput.push({
                    character: member.name,
                    energyCost: characterDetail?.元素爆発.元素エネルギー ?? 0,
                    constellation: constellation,
                    weapon: weapon,
                    weaponRefine: weaponRefine,
                    onField: onFields[i],
                });
            }
            calculatorInput.splice(0, calculatorInput.length, ...newCalculatorInput);

            setupInputSub(team, rotationList, teamMemberResult);
        }

        const setupInputSub = (team: TTeam, rotationList: TActionItem[], teamMemberResult: TTeamMemberResult) => {
            if (!team) return;
            const newCalculatorInputPacticle1: TCalculatorInputSub[] = [];
            const newCalculatorInputPacticle2: TCalculatorInputSub[] = [];
            const newCalculatorInputEnergy1: TCalculatorInputSub[] = [];
            const newCalculatorInputEnemy: TCalculatorInputSub[] = [];
            const newMessages: string[] = [];
            const onFields = calculatorInput.map(s => s.onField);
            for (let i = 0; i < calculatorInput.length; i++) {
                const character = calculatorInput[i].character;
                const constellation = calculatorInput[i].constellation;
                const weapon = calculatorInput[i].weapon;
                const weaponRefine = calculatorInput[i].weaponRefine;

                const particleByCharacter = getParticleByCharacter(character, constellation, team, rotationLength.value, rotationList, onFields);
                if (particleByCharacter?.length) {
                    const triggeredBy = CHARACTER_PARTICLE;
                    particleByCharacter.forEach(entry => {
                        const category3 = entry[1];
                        const initials = [0, 0, 0, 0];
                        for (let i = 0; i < initials.length; i++) {
                            initials[i] = Math.round(Number(entry[2 + i]) * 100) / 100;
                        }
                        const currents = _.cloneDeep(initials);
                        newCalculatorInputPacticle1.push({
                            character: character,
                            triggeredBy: triggeredBy,
                            category3: category3,
                            rechargeType: RECHARGE_PARTICLE_SKILL,
                            element: entry[0],
                            initials: initials,
                            currents: currents,
                            sum: currents.reduce((a, c) => a + c, 0),
                            unit: entry[2],
                        })
                    })
                }

                const energyByCharacter = getEnergyByCharacter(character, constellation, team, rotationLength.value, rotationList, teamMemberResult);
                if (energyByCharacter?.length) {
                    const triggeredBy = CHARACTER_ENERGY;
                    const category3 = character;
                    const initials = [0, 0, 0, 0];
                    for (let i = 0; i < initials.length; i++) {
                        initials[i] = Math.round(Number(energyByCharacter[i]) * 100) / 100;
                    }
                    const currents = _.cloneDeep(initials);
                    newCalculatorInputEnergy1.push({
                        character: character,
                        triggeredBy: triggeredBy,
                        category3: category3,
                        rechargeType: RECHARGE_DIRECT,
                        element: '',
                        initials: initials,
                        currents: currents,
                        sum: currents.reduce((a, c) => a + c, 0),
                        unit: 0.1,
                    })
                    if (energyByCharacter[4].length) {
                        newMessages.push(...energyByCharacter[4].map(s => category3 + '\n' + s));
                    }
                }

                if (weapon) {
                    const particleByWeapon = getParticleByWeapon(character, weapon, weaponRefine, team, rotationLength.value, rotationList, onFields);
                    if (particleByWeapon?.length) {
                        const triggeredBy = WEAPON_PARTICLE;
                        const category3 = weapon;
                        const entry = particleByWeapon;
                        const initials = [0, 0, 0, 0];
                        for (let i = 0; i < initials.length; i++) {
                            initials[i] = Math.round(Number(entry[2 + i]) * 100) / 100;
                        }
                        const currents = _.cloneDeep(initials);
                        newCalculatorInputPacticle2.push({
                            character: character,
                            triggeredBy: triggeredBy,
                            category3: category3,
                            rechargeType: RECHARGE_PARTICLE_FAVONIUS,
                            element: entry[0],
                            initials: initials,
                            currents: currents,
                            sum: currents.reduce((a, c) => a + c, 0),
                            unit: entry[2],
                        })
                    }

                    const energyFromWeapon = getEnergyByWeapon(character, weapon, weaponRefine, team, rotationLength.value, rotationList);
                    if (energyFromWeapon?.length) {
                        const triggeredBy = WEAPON_ENERGY;
                        const category3 = weapon;
                        const initials = [0, 0, 0, 0];
                        for (let i = 0; i < initials.length; i++) {
                            initials[i] = Math.round(Number(energyFromWeapon[i]) * 100) / 100;
                        }
                        const currents = _.cloneDeep(initials);
                        newCalculatorInputEnergy1.push({
                            character: character,
                            triggeredBy: triggeredBy,
                            category3: category3,
                            rechargeType: RECHARGE_DIRECT,
                            element: '',
                            initials: initials,
                            currents: currents,
                            sum: currents.reduce((a, c) => a + c, 0),
                            unit: 0.1,
                        })
                        if (energyFromWeapon[4].length) {
                            newMessages.push(...energyFromWeapon[4].map(s => category3 + '\n' + s));
                        }
                    }
                }
            }

            supplyFromEnemy.filter(s => s[1] || s[2]).forEach(entry => {
                const character = '';
                const triggeredBy = ENEMY_PARTICLE;
                const category3 = '';
                const element = entry[0];
                const sum = entry[1] * 3 + entry[2];
                const initials = [0, 0, 0, 0];
                for (let i = 0; i < onFields.length; i++) {
                    initials[i] = rotationLength.value / 90 * sum * onFields[i] / 100;
                }
                const currents = _.cloneDeep(initials);
                newCalculatorInputEnemy.push({
                    character: character,
                    triggeredBy: triggeredBy,
                    category3: category3,
                    rechargeType: RECHARGE_PARTICLE_ENEMY,
                    element: element,
                    initials: initials,
                    currents: currents,
                    sum: sum,
                    unit: element === '無色' ? 2 : 3,
                })
            })

            calculatorInputParticle.splice(0, calculatorInputParticle.length, ...newCalculatorInputPacticle1, ...newCalculatorInputPacticle2);
            calculatorInputEnergy.splice(0, calculatorInputEnergy.length, ...newCalculatorInputEnergy1);
            calculatorInputEnemy.splice(0, calculatorInputEnemy.length, ...newCalculatorInputEnemy);
            messages.splice(0, messages.length, ...newMessages);
        }

        /** 元素爆発(回数) */
        const burstCounts = computed(() => {
            const result: { [key: number]: number } = { 0: 1, 1: 1, 2: 1, 3: 1 };
            if (props.rotationList && props.rotationList.length) {
                const memberNameArr = props.team.members.map(member => member.name);
                props.team.members.forEach(member => {
                    if (member.name) {
                        const count = props.rotationList.filter(rotation => rotation.member == member.name && rotation.action === 'Q').length;
                        const index = memberNameArr.indexOf(member.name);
                        result[index] = count > 0 ? count : 1;
                    }
                })
            }
            return result;
        })

        /** 元素粒子による獲得元素エネルギー量(元素チャージ効率未反映) */
        const particleRecharges = computed(() => {
            const result: number[] = [0, 0, 0, 0];
            for (let i = 0; i < props.team.members.length; i++) {
                const member = props.team.members[i];
                if (!member.name) continue;
                const characterMaster = getCharacterMaster(member.name);
                const myElement = characterMaster?.元素;
                if (!myElement) continue;
                [calculatorInputParticle, calculatorInputEnemy].forEach(input => {
                    input.filter(s => [CHARACTER_PARTICLE, WEAPON_PARTICLE, RESONANCE_PARTICLE, ENEMY_PARTICLE].includes(s.triggeredBy)).forEach(entry => {
                        let energy = 0;
                        for (let j = 0; j < entry.currents.length; j++) {
                            if (j == i) {
                                energy += entry.currents[j];
                            } else {
                                energy += entry.currents[j] * 0.6;
                            }
                        }
                        if (entry.element == myElement) {
                            energy *= 3;
                        } else if (entry.element == '無色') {
                            energy *= 2;
                        }
                        result[i] = Math.round((result[i] + energy) * 10) / 10;
                    })
                })
            }
            return result;
        })

        /** 元素チャージ効率の目安 */
        const energyRechargeGls = computed(() => {
            const result = [100, 100, 100, 100];
            for (let i = 0; i < props.team.members.length; i++) {
                if (i >= calculatorInput.length) continue;
                let energyCost = calculatorInput[i]?.energyCost;
                if (!energyCost) continue;
                calculatorInputEnergy.filter(s => [CHARACTER_ENERGY, WEAPON_ENERGY].includes(s.triggeredBy)).forEach(entry => {
                    energyCost -= entry.currents[i];
                })
                const burstCount = burstCounts.value[i] > 0 ? burstCounts.value[i] : 1;
                const particleEnergy = particleRecharges.value[i] / burstCount;
                if (energyCost > 0 && particleEnergy) {
                    const er = Math.ceil(energyCost * 100 / particleEnergy);
                    result[i] = Math.max(100, er);
                }
            }
            return result;
        })

        const characterImgSrc = (character: string) => getCharacterMaster(character)?.icon_url ?? IMG_SRC_DUMMY;
        const weaponImgSrc = (character: string, weapon?: string) => {
            let result = IMG_SRC_DUMMY;
            if (weapon) {
                const weaponType = getCharacterMaster(character)?.武器;
                if (weaponType) {
                    const weaponMaster = getWeaponMaster(weaponType, weapon);
                    if (weaponMaster) {
                        result = weaponMaster.icon_url;
                    }
                }
            }
            return result;
        }
        const triggeredBy3ImgSrc = (element: TCalculatorInputSub) => {
            let result = IMG_SRC_DUMMY;
            if (element.triggeredBy && element.category3) {
                if ([CHARACTER_PARTICLE].includes(element.triggeredBy)) { // キャラクター
                    const characterDetail = getCharacterDetail(element.character);
                    result = characterDetail?.元素スキル.icon_url ?? IMG_SRC_DUMMY;
                }
                if ([WEAPON_ENERGY, WEAPON_PARTICLE].includes(element.triggeredBy)) { // 武器
                    const characterMater = getCharacterMaster(element.character);
                    if (characterMater) {
                        const weaponType = characterMater.武器;
                        const weaponMaster = getWeaponMaster(weaponType, element.category3);
                        if (weaponMaster) {
                            result = weaponMaster.icon_url;
                        }
                    }
                }
            }
            return result;
        }

        const bgColorClass = (index: number) => {
            let result = 'white';
            if (index < props.team.members.length) {
                const character = props.team.members[index].name;
                const master = getCharacterMaster(character);
                if (master) {
                    result = (ELEMENT_BG_COLOR_CLASS as any)[master.元素];
                }
            }
            return ' ' + result;
        }
        const bgColorClass2 = (row: TCalculatorInputSub) => {
            let result = 'white';
            if (row.element) {
                result = (ELEMENT_BG_COLOR_CLASS as any)[row.element];
            }
            return ' ' + result;
        }

        const inputOnChange = () => {
            setupInputSub(props.team, props.rotationList, props.teamMemberResult);
        }

        return {
            displayName,

            rotationLength,
            supplyFromEnemy,
            isOpenSupplyFromEnemy,
            calculatorInput,
            calculatorInputParticle,
            calculatorInputEnergy,
            calculatorInputEnemy,
            burstCounts,
            messages,
            characterImgSrc,
            weaponImgSrc,
            triggeredBy3ImgSrc,
            bgColorClass,
            bgColorClass2,
            particleRecharges,
            energyRechargeGls,

            inputOnChange,
        }
    }
});

</script>
<style scoped>
table {
    margin-left: auto;
    margin-right: auto;
    background-color: white;
    color: black;
    border: double 4px white;
    border-spacing: 0;
    vertical-align: middle;
}

caption {
    vertical-align: middle;
    background-color: white;
    padding: 4px;
}

tr,
th,
td {
    border: solid 1px gray;
}

th,
td {
    max-width: 100px;
    min-width: 35px;
    height: 22px;
}

th {
    font-size: 1.8rem;
    font-weight: bold;
    padding: 2px 4px;
}

input[type="number"] {
    margin-left: auto;
    margin-right: auto;
    padding: 0 0 0 4px;
    height: 25px;
}

td select,
td input[type="number"] {
    width: calc(100% - 4px);
    text-align: center;
    padding-block: 0;
    padding-inline: 0;
    border: none;
    background-color: transparent;
}

img.character {
    width: 60px;
    height: 45px;
    object-position: top;
    object-fit: cover;
}

img.input-item-character {
    width: 35px;
    height: 25px;
    object-position: top;
    object-fit: cover;
}

img.input-item {
    width: 27px;
    height: 21px;
}

.white {
    background-color: whitesmoke;
}

tr.label-row {
    background-color: silver;
}

td.weapon {
    position: relative;
}

td.weapon img.input-item {
    border: none;
    position: absolute;
    left: 0;
    top: 0;
}

div.message-area {
    margin-left: auto;
    margin-right: auto;
    max-width: 120rem;
    text-align: left;
}
</style>
