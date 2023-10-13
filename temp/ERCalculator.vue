<template>
    <div class="er-calculator">
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
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="bgColorClass(element.character)">
                    {{ element.weapon }}
                    <select v-model="element.weaponRefine" :class="bgColorClass(element.character)" @change="inputOnChange">
                        <option v-for="refine in [1, 2, 3, 4, 5]" :key="refine" :value="refine">
                            {{ 'R' + refine }}
                        </option>
                    </select>
                </td>
            </tr>
            <tr v-for="(row, rowIndex) in  calculatorInputSub" :key="rowIndex">
                <th>
                    <img :src="characterImgSrc(row.category1)" :alt="row.category1"
                        :class="'input-item-character' + bgColorClass(row.category1)">
                    <img :src="category23ImgSrc(row)" :alt="row.category3"
                        :class="'input-item' + bgColorClass(row.category1)">
                </th>
                <td v-for="columnIndex in [0, 1, 2, 3]" :key="columnIndex">
                    <input type="number" v-model="row.currentValues[columnIndex]" :class="bgColorClass(row.category1)"
                        @change="inputOnChange">
                </td>
            </tr>
            <tr>
                <th colspan="5">RESULT</th>
            </tr>
            <tr>
                <th>{{ displayName('元素チャージ効率') }}</th>
                <td v-for="result in calculatorResult" :key="result" class="result">
                    {{ result }}
                </td>
            </tr>
        </table>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, PropType, reactive, ref, watch } from "vue";
import _ from "lodash";
import { ARTIFACT_ENERGY, ARTIFACT_PARTICLE, CHARACTER_ENERGY, CHARACTER_PARTICLE, getEnergyFromWeapon, WEAPON_ENERGY, WEAPON_PARTICLE } from "./energyrecharge";
import { getCharacterMaster, getWeaponMaster, setupCharacterDetailMap, TActionItem, TTeam, TTeamMemberResult } from "./team";
import { ELEMENT_BG_COLOR_CLASS, getCharacterMasterDetail, IMG_SRC_DUMMY, TCharacterKey } from "@/master";
import CompositionFunction from "@/components/CompositionFunction.vue";

type TCalculatorInput = {
    character: string,
    energyCost: number,
    constellation: number,
    weapon: string | undefined,
    weaponRefine: number,
}

type TCalculatorInputSub = {
    category1: string,
    category2: string,
    category3: string,
    currentValues: number[],
    initialValues: number[],
    minValue: number | undefined,
    maxValue: number | undefined,
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
        const calculatorInputSub = reactive([] as TCalculatorInputSub[]);
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
            setupCharacterDetailMap(team);

            const newCalculatorInput: TCalculatorInput[] = [];
            const newCalculatorInputSub: TCalculatorInputSub[] = [];

            for (let i = 0; i < team.members.length; i++) {
                const member = team.members[i];
                const characterDetail = await getCharacterMasterDetail(member.name as TCharacterKey);
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

                const energyFromWeapon = getEnergyFromWeapon(member.name, team, rotationList, teamMemberResult);
                if (energyFromWeapon) {
                    const category1 = member.name;
                    const category2 = WEAPON_ENERGY;
                    const category3 = weapon;
                    const initialValues = [0, 0, 0, 0];
                    initialValues[i] = energyFromWeapon;
                    const currentValues = _.cloneDeep(initialValues);
                    const minValue = undefined;
                    const maxValue = undefined;
                    newCalculatorInputSub.push({
                        category1: category1,
                        category2: category2,
                        category3: category3,
                        initialValues: initialValues,
                        currentValues: currentValues,
                        minValue: minValue,
                        maxValue: maxValue,
                    })
                }
            }

            calculatorInput.splice(0, calculatorInput.length, ...newCalculatorInput);
            calculatorInputSub.splice(0, calculatorInputSub.length, ...newCalculatorInputSub);
        }

        const calculatorResult = computed(() => {
            const result: number[] = [];
            result.push(100);
            result.push(100);
            result.push(100);
            result.push(100);
            return result;
        })

        const characterImgSrc = (character: string) => getCharacterMaster(character)?.icon_url ?? IMG_SRC_DUMMY;
        const category23ImgSrc = (element: TCalculatorInputSub) => {
            let result = IMG_SRC_DUMMY;
            if (element.category2 && element.category3) {
                if ([CHARACTER_ENERGY, CHARACTER_PARTICLE].includes(element.category2)) { // キャラクター
                    result = IMG_SRC_DUMMY;
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

        const inputOnChange = () => {
            console.log('inputOnChange');
        }

        return {
            displayName,

            calculatorInput,
            calculatorInputSub,
            characterImgSrc,
            category23ImgSrc,
            bgColorClass,
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
    border: double 3px gold;
    border-spacing: 0;
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

table.er-calculator td select,
table.er-calculator td input[type="number"] {
    width: calc(100% - 4px);
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    padding: 0;
    padding-block: 0;
    padding-inline: 0;
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
    width: 25px;
    height: 25px;
    object-fit: contain;
}
</style>
