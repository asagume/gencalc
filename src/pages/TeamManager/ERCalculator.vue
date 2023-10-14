<template>
    <div class="er-calculator">
        <label>ROTATION TIME
            <input type="number" v-model="rotationTime" min="0" max="99">
        </label>
        <table class="er-calculator">
            <tr>
                <th></th>
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="bgColorClass(element.character)">
                    <img :src="characterImgSrc(element.character)" :alt="element.character" class="character">
                </td>
            </tr>
            <tr>
                <th>{{ displayName('元素エネルギー') }}</th>
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="bgColorClass(element.character)">
                    <input type="number" v-model="element.energyCost" :class="bgColorClass(element.character)">
                </td>
            </tr>
            <tr>
                <th>{{ displayName('命ノ星座') }}</th>
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="bgColorClass(element.character)">
                    <select v-model="element.constellation" :class="bgColorClass(element.character)"
                        @change="inputOnChange">
                        <option v-for="constellation in [0, 1, 2, 3, 4, 5, 6]" :key="constellation" :value="constellation">
                            {{ 'C' + constellation }}
                        </option>
                    </select>
                </td>
            </tr>
            <tr>
                <th>{{ displayName('武器') }}</th>
                <td v-for="(element, index) in  calculatorInput" :key="index"
                    :class="'weapon' + bgColorClass(element.character)">
                    <img :src="weaponImgSrc(element.character, element.weapon)" :alt="element.weapon" class="input-item">
                    <select v-model="element.weaponRefine" :class="bgColorClass(element.character)" @change="inputOnChange">
                        <option v-for="refine in [1, 2, 3, 4, 5]" :key="refine" :value="refine">
                            {{ 'R' + refine }}
                        </option>
                    </select>
                </td>
            </tr>
            <tr v-for="(row, rowIndex) in  calculatorInputSub" :key="rowIndex">
                <th :class="bgColorClass2(row)">
                    <img :src="characterImgSrc(row.category1)" :alt="row.category1"
                        :class="'input-item-character' + bgColorClass2(row)">
                    <img :src="category23ImgSrc(row)" :alt="row.category3" :class="'input-item' + bgColorClass2(row)">
                </th>
                <td v-for="columnIndex in [0, 1, 2, 3]" :key="columnIndex" :class="bgColorClass2(row)">
                    <input type="number" v-model="row.currentValues[columnIndex]" :class="bgColorClass2(row)"
                        @change="inputOnChange">
                </td>
            </tr>
            <tr>
                <th>{{ displayName('元素粒子エネルギー') }}</th>
                <td v-for="result in particleEnergies" :key="result" class="result">
                    {{ result }}
                </td>
            </tr>
            <tr>
                <th colspan="5">RESULT</th>
            </tr>
            <tr>
                <th>{{ displayName('元素チャージ効率') }}</th>
                <td v-for="result in calculatorResult" :key="result" class="result">
                    {{ result + '%' }}
                </td>
            </tr>
        </table>
        <ul>
            <li v-for="message of messages" :key="message">{{ message }}</li>
        </ul>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, PropType, reactive, ref, watch } from "vue";
import _ from "lodash";
import { ARTIFACT_ENERGY, ARTIFACT_PARTICLE, CHARACTER_ENERGY, CHARACTER_PARTICLE, getEnergyByCharacter, getEnergyByWeapon, getParticleByCharacter, getParticleByCharacterExtra, RESONANCE_PARTICLE, WEAPON_ENERGY, WEAPON_PARTICLE } from "./energyrecharge";
import { getCharacterDetail, getCharacterMaster, getWeaponMaster, setupCharacterDetailMap, TActionItem, TTeam, TTeamMemberResult } from "./team";
import { ELEMENT_BG_COLOR_CLASS, IMG_SRC_DUMMY } from "@/master";
import CompositionFunction from "@/components/CompositionFunction.vue";

type TCalculatorInput = {
    character: string,
    energyCost: number,
    constellation: number,
    weapon: string | undefined,
    weaponRefine: number,
}

type TCalculatorInputSub = {
    category1: string,          // キャラクター名
    category2: string,          // [CHARACTER|WEAPON|ARTIFACT]_PARTICLE,[CHARACTER|WEAPON|ARTIFACT]_ENERGY
    category3: string,          // キャラクター名,武器名,聖遺物名
    element: string,            // 元素
    currentValues: number[],    // 現在値
    initialValues: number[],    // 初期値
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
        const skillCount = reactive([] as number[]);
        const burstCount = reactive([] as number[]);
        const calculatorInputSub = reactive([] as TCalculatorInputSub[]);
        const messages = reactive([] as string[]);
        const rotationTime = ref(20);
        const ARTIFACT_IMG_SRC_MAP: { [key: string]: string } = {
            '雷のような怒り': 'images/artifacts/5_ThunderingFury.png',
        }

        onMounted(() => {
            watchFunc(props.team, props.rotationList, props.teamMemberResult);
        })

        const watchCount = ref(0);
        watch(props, async () => {
            await watchFunc(props.team, props.rotationList, props.teamMemberResult);
            watchCount.value++;
        });

        async function watchFunc(team: TTeam, rotationList: TActionItem[], teamMemberResult: TTeamMemberResult) {
            await setupCharacterDetailMap(team);

            const newCalculatorInput: TCalculatorInput[] = [];
            const newSkillCount: number[] = [];
            const newBurstCount: number[] = [];
            const newCalculatorInputSub1: TCalculatorInputSub[] = [];
            const newCalculatorInputSub2: TCalculatorInputSub[] = [];
            const newMessages: string[] = [];

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
                });

                const particleByCharacter = getParticleByCharacter(member.name, constellation, team, rotationTime.value, rotationList, teamMemberResult);
                if (particleByCharacter?.length) {
                    const category1 = member.name;
                    const category2 = CHARACTER_PARTICLE;
                    particleByCharacter.forEach(entry => {
                        const category3 = entry[1];
                        const initialValues = [entry[3], entry[4], entry[5], entry[6]];
                        const currentValues = _.cloneDeep(initialValues);
                        newCalculatorInputSub1.push({
                            category1: category1,
                            category2: category2,
                            category3: category3,
                            element: entry[0],
                            initialValues: initialValues,
                            currentValues: currentValues,
                        })
                        console.log(category1, entry, initialValues);
                    })
                }

                const energyByCharacter = getEnergyByCharacter(member.name, constellation, team, rotationTime.value, rotationList, teamMemberResult);
                if (energyByCharacter?.length) {
                    const category1 = member.name;
                    const category2 = CHARACTER_ENERGY;
                    const category3 = member.name;
                    const initialValues = [energyByCharacter[0], energyByCharacter[1], energyByCharacter[2], energyByCharacter[3]];
                    const currentValues = _.cloneDeep(initialValues);
                    newCalculatorInputSub2.push({
                        category1: category1,
                        category2: category2,
                        category3: category3,
                        element: '',
                        initialValues: initialValues,
                        currentValues: currentValues,
                    })
                    console.log(energyByCharacter[4]);
                    if (energyByCharacter[4].length) {
                        newMessages.push(...energyByCharacter[4]);
                    }
                }

                const energyFromWeapon = getEnergyByWeapon(member.name, weapon, weaponRefine, team, rotationTime.value, rotationList);
                if (energyFromWeapon?.length) {
                    const category1 = member.name;
                    const category2 = WEAPON_ENERGY;
                    const category3 = weapon;
                    const initialValues = [energyFromWeapon[0], energyFromWeapon[1], energyFromWeapon[2], energyFromWeapon[3]];
                    const currentValues = _.cloneDeep(initialValues);
                    newCalculatorInputSub2.push({
                        category1: category1,
                        category2: category2,
                        category3: category3,
                        element: '',
                        initialValues: initialValues,
                        currentValues: currentValues,
                    })
                    if (energyFromWeapon[4].length) {
                        newMessages.push(...energyFromWeapon[4]);
                    }
                }
            }

            calculatorInput.splice(0, calculatorInput.length, ...newCalculatorInput);
            calculatorInputSub.splice(0, calculatorInputSub.length, ...newCalculatorInputSub1, ...newCalculatorInputSub2);
            messages.splice(0, messages.length, ...newMessages);
            console.log(messages);
        }

        const particleEnergies = computed(() => {
            const result: number[] = [0, 0, 0, 0];
            for (let i = 0; i < props.team.members.length; i++) {
                const member = props.team.members[i];
                if (!member.name) continue;
                const characterMaster = getCharacterMaster(member.name);
                const myElement = characterMaster?.元素;
                if (!myElement) continue;
                calculatorInputSub.filter(s => [CHARACTER_PARTICLE, RESONANCE_PARTICLE].includes(s.category2)).forEach(entry => {
                    let energy = 0;
                    for (let j = 0; j < entry.currentValues.length; j++) {
                        if (j == i) {
                            energy += entry.currentValues[j];
                        } else {
                            energy += entry.currentValues[j] * 0.6;
                        }
                    }
                    if (entry.element == myElement) {
                        energy *= 3;
                    } else if (entry.element === '白') {
                        energy *= 2;
                    }
                    result[i] = Math.round((result[i] + energy) * 10) / 10;
                })
            }
            return result;
        })

        const calculatorResult = computed(() => {
            const result = [100, 100, 100, 100];
            for (let i = 0; i < props.team.members.length; i++) {
                if (i >= calculatorInput.length) continue;
                let energyCost = calculatorInput[i]?.energyCost;
                if (!energyCost) continue;
                calculatorInputSub.filter(s => [CHARACTER_ENERGY, WEAPON_ENERGY].includes(s.category2)).forEach(entry => {
                    energyCost -= entry.currentValues[i];
                })
                const particleEnergy = particleEnergies.value[i];
                if (energyCost > 0 && particleEnergy) {
                    const er = Math.ceil(energyCost * 100 / particleEnergy);
                    result[i] = er;
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
        const category23ImgSrc = (element: TCalculatorInputSub) => {
            let result = IMG_SRC_DUMMY;
            if (element.category2 && element.category3) {
                if ([CHARACTER_PARTICLE].includes(element.category2)) { // キャラクター
                    const characterDetail = getCharacterDetail(element.category1);
                    result = characterDetail?.元素スキル.icon_url ?? IMG_SRC_DUMMY;
                }
                if ([WEAPON_ENERGY, WEAPON_PARTICLE].includes(element.category2)) { // 武器
                    const characterMater = getCharacterMaster(element.category1);
                    if (characterMater) {
                        const weaponType = characterMater.武器;
                        const weaponMaster = getWeaponMaster(weaponType, element.category3);
                        if (weaponMaster) {
                            result = weaponMaster.icon_url;
                        }
                    }
                } else if ([ARTIFACT_ENERGY, ARTIFACT_PARTICLE].includes(element.category2)) { // 聖遺物
                    if (element.category3 in ARTIFACT_IMG_SRC_MAP) {
                        result = ARTIFACT_IMG_SRC_MAP[element.category3];
                    }
                }
            }
            return result;
        }

        const bgColorClass = (character: string) => {
            const master = getCharacterMaster(character);
            return master ? ' ' + (ELEMENT_BG_COLOR_CLASS as any)[master.元素] : '';
        }
        const bgColorClass2 = (row: TCalculatorInputSub) => {
            if ([CHARACTER_ENERGY, WEAPON_ENERGY, ARTIFACT_ENERGY].includes(row.category2)) {
                return ' white';
            }
            const master = getCharacterMaster(row.category1);
            return master ? ' ' + (ELEMENT_BG_COLOR_CLASS as any)[master.元素] : '';
        }

        const inputOnChange = () => {
            console.log('inputOnChange');
        }

        return {
            displayName,

            rotationTime,
            calculatorInput,
            calculatorInputSub,
            messages,
            characterImgSrc,
            weaponImgSrc,
            category23ImgSrc,
            bgColorClass,
            bgColorClass2,
            particleEnergies,
            calculatorResult,

            inputOnChange,
        }
    }
});

</script>
<style scoped>
table.er-calculator {
    margin-left: auto;
    margin-right: auto;
    background-color: white;
    color: black;
    border: double 4px gold;
    border-spacing: 0;
    vertical-align: middle;
}

table.er-calculator tr,
table.er-calculator th,
table.er-calculator td {
    border: solid 1px gray;
}

table.er-calculator th {
    font-size: 2rem;
    padding: 2px 4px;
}

table.er-calculator select,
table.er-calculator input[type="number"] {
    width: calc(100% - 4px);
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    padding: 0;
    padding-block: 0;
    padding-inline: 0;
    height: 25px;
    border: none;
}

img.character {
    width: 65px;
    height: 50px;
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

table.er-calculator td.weapon {
    position: relative;
}

table.er-calculator td.weapon img.input-item {
    border: none;
    position: absolute;
    left: 0;
    top: 0;
}
</style>
