<template>
    <div class="next-step" v-if="visible">
        <template v-if="toggleSwitch">
            <fieldset>
                <legend @click="toggleSwitch = !toggleSwitch">&nbsp; {{ displayName("NEXT STEP") }} &nbsp;</legend>
                <div class="right">
                    <select class="evaluation-item" v-model="evaluationItem" @change="evaluationItemOnChange">
                        <option v-for="(item, index) in evaluationItemList" :key="index" :value="item">
                            {{ item.replace('.', ' ') }}
                        </option>
                    </select>
                </div>
                <table class="next-stat">
                    <template v-for="row in nextStatRows" :key="row[0]">
                        <tr v-if="row[3] || row[4]">
                            <th class="name">{{ displayName(row[0]) }}</th>
                            <td class="step">
                                <select v-model="row[2]" @change="nextStatStepOnChange(row)">
                                    <option v-for="(data, index) in row[1]" :key="index" :value="index">
                                        {{ Math.round(data * 10) / 10 }}
                                    </option>
                                </select>
                            </td>
                            <td>
                                {{ Math.round(row[4] * 1000) / 1000 + '%' }}
                            </td>
                            <td class="count">
                                <input type="range" min="0" max="5" v-model="row[3]" @change="nextStatOnChange">
                            </td>
                            <td>
                                {{ displayNextStatValue(row) }}
                            </td>
                        </tr>
                    </template>
                    <tr>
                        <th class="damage"></th>
                        <td></td>
                        <td></td>
                        <td>
                            <button type="button" @click="resetButtonOnClick"> Reset </button>
                        </td>
                    </tr>
                </table>
            </fieldset>
        </template>
        <div v-else>
            <label @click="toggleSwitch = !toggleSwitch">{{ displayName("+ NEXT STEP +") }}</label>
        </div>
    </div>
</template>
  
<script lang="ts">
import _ from 'lodash';
import {
    DAMAGE_RESULT_TEMPLATE,
    makeEasyInputSubstatValueList, TArtifactDetailInput, TCharacterInput, TConditionInput, TDamageResult, TOptionInput, TStats, TStatsInput,
} from "@/input";
import { TArtifactSubKey } from "@/master";
import { computed, defineComponent, nextTick, PropType, reactive, ref, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";
import { calculateDamageResult, calculateRotationTotalDamage, calculateStats, TRotationDamageInfo } from "@/calculate";

export default defineComponent({
    name: "NextStat",
    props: {
        visible: Boolean,
        characterInput: { type: Object as PropType<TCharacterInput>, required: true, },
        artifactDetailInput: { type: Object as PropType<TArtifactDetailInput>, required: true, },
        conditionInput: { type: Object as PropType<TConditionInput>, required: true, },
        optionInput: { type: Object as PropType<TOptionInput>, required: true, },
        statsInput: { type: Object as PropType<TStatsInput>, required: true, },
        damageResult: { type: Object as PropType<TDamageResult>, required: true, },
        rotationDamageInfo: { type: Object as PropType<TRotationDamageInfo> },
    },
    emits: ["update:stat-adjustments"],
    setup(props, context) {
        const { displayName, displayStatValue } = CompositionFunction();

        const ROTATION_TOTAL_DMG_NAME = 'ローテーション合計ダメージ';
        const NEXT_STAT_ARR = ['HP%', '攻撃力%', '防御力%', '元素熟知', '会心率', '会心ダメージ', '元素チャージ効率', 'HP', '攻撃力', '防御力'];
        const toggleSwitch = ref(false);
        const evaluationItem = ref('');
        const nextStatRows = reactive([] as any[]); // 0:stat, 1:datalist, 2:index, 3:count, 4:evaluation value

        const evaluationItemList = computed(() => {
            let result: string[] = [];
            if (props.rotationDamageInfo?.rotationDamages) {
                result.push(ROTATION_TOTAL_DMG_NAME);
            }
            for (const key1 of ['通常攻撃', '落下攻撃', '重撃', '元素スキル', '元素爆発', 'その他']) {
                const damageResultValue = props.damageResult[key1];
                if (Array.isArray(damageResultValue)) {
                    for (const key2 of damageResultValue) {
                        if (key2[0].endsWith('合計ダメージ')) continue;
                        if (!key2[5]?.endsWith('ダメージ')) continue;
                        const name = key1 + '.' + key2[0];
                        result.push(name);
                    }
                }
            }
            return result;
        });

        const nextStatValue = (row: any[]) => {
            let result = 0;
            if (row && row[3]) {
                result = row[3] * row[1][row[2]];
            }
            return result;
        };

        const displayNextStatValue = (row: any[]) => {
            let result = '';
            const valueNum = nextStatValue(row);
            if (valueNum > 0) {
                result += '+';
            }
            result += displayStatValue(row[0], valueNum);
            return result;
        }

        function initializeNextStat() {
            const newRows: any[] = [];
            for (const stat of NEXT_STAT_ARR) {
                const row: any[] = [];
                row.push(stat);
                row.push(makeEasyInputSubstatValueList(stat as TArtifactSubKey));
                row.push(2);
                row.push(0);
                row.push(0);
                newRows.push(row);
            }
            nextStatRows.splice(0, nextStatRows.length, ...newRows);
        }

        function getDamageValue(itemName: string, damageResult: TDamageResult) {
            let result = 0;
            if (itemName == ROTATION_TOTAL_DMG_NAME) {
                if (props.rotationDamageInfo) {
                    result = calculateRotationTotalDamage(props.rotationDamageInfo.rotationDamages, damageResult);
                }
            } else {
                const keyArr = itemName.split('.');
                const work = (damageResult as any)[keyArr[0]].filter((s: any[]) => s[0] == keyArr[1]);
                if (work.length) {
                    result = work[0][2];
                }
            }
            return result;
        }

        const currentDamageValue = computed(() => {
            return getDamageValue(evaluationItem.value, props.damageResult);
        });

        function setupNextStatRow(row: any[], workDamageResult?: TDamageResult, workStatsInput?: TStatsInput) {
            if (!workDamageResult) {
                workDamageResult = _.cloneDeep(DAMAGE_RESULT_TEMPLATE);
            }
            if (!workStatsInput) {
                workStatsInput = _.cloneDeep(props.statsInput);
            }
            let evaluationValue = 0;
            const stat = row[0];
            const step = row[1][row[2]];
            if (step && props.rotationDamageInfo) {
                const baseValue = currentDamageValue.value;
                if (stat in workStatsInput.statAdjustmentsEx) {
                    workStatsInput.statAdjustmentsEx[stat] += step;
                } else {
                    workStatsInput.statAdjustmentsEx[stat] = step;
                }
                calculateStats(workStatsInput, props.characterInput, props.artifactDetailInput, props.conditionInput, props.optionInput);
                calculateDamageResult(workDamageResult, props.characterInput, props.conditionInput, workStatsInput);
                const newValue = getDamageValue(evaluationItem.value, workDamageResult);
                if (newValue && baseValue) {
                    evaluationValue = (newValue / baseValue) - 1;
                    evaluationValue *= 100;
                }
                workStatsInput.statAdjustmentsEx[stat] -= step;
            }
            row[4] = evaluationValue;
        }

        function setupNextStatRows() {
            if (evaluationItem.value) {
                const workDamageResult = _.cloneDeep(DAMAGE_RESULT_TEMPLATE);
                const workStatsInput = _.cloneDeep(props.statsInput);
                for (const row of nextStatRows) {
                    setupNextStatRow(row, workDamageResult, workStatsInput);
                }
            }
            nextStatRows.sort((a, b) => b[4] - a[4]);
        }

        function initializeEvaluationItem() {
            if (evaluationItemList.value.length) {
                if (!evaluationItemList.value.includes(evaluationItem.value)) {
                    if (evaluationItemList.value.includes(ROTATION_TOTAL_DMG_NAME)) {
                        evaluationItem.value = ROTATION_TOTAL_DMG_NAME;
                    } else {
                        evaluationItem.value = evaluationItemList.value[evaluationItemList.value.length - 1];
                    }
                }
            }
        }

        const evaluationItemOnChange = () => {
            setupNextStatRows();
        };

        const nextStatStepOnChange = (row: any[]) => {
            setupNextStatRow(row);
            nextStatRows.sort((a, b) => b[4] - a[4]);
        };

        const nextStatOnChange = async () => {
            await nextTick();
            const nextStats: TStats = {};
            nextStatRows.forEach(row => {
                if (row[3]) {
                    nextStats[row[0]] = nextStatValue(row);
                }
            });
            context.emit('update:stat-adjustments', nextStats);
        };

        const resetButtonOnClick = async () => {
            initializeNextStat();
            await nextStatOnChange();
        };

        watch([props.characterInput, props.statsInput, props.rotationDamageInfo], async (newVal, oldVal) => {
            const newCharacterInput = newVal[0] as TCharacterInput;
            if (newCharacterInput) {
                const oldCharacterInput = oldVal[0] as TCharacterInput;
                if (newCharacterInput.character != oldCharacterInput?.character) {
                    await resetButtonOnClick();
                    return;
                }
            }
            setupNextStatRows();
        });

        watch(evaluationItemList, () => {
            initializeEvaluationItem();
        });

        initializeNextStat();
        initializeEvaluationItem();
        setupNextStatRows();

        return {
            displayName,
            displayStatValue,

            toggleSwitch,

            evaluationItem,
            evaluationItemList,
            evaluationItemOnChange,

            nextStatRows,
            nextStatStepOnChange,
            displayNextStatValue,
            currentDamageValue,

            nextStatOnChange,
            resetButtonOnClick,
        };
    },
});
</script>
  
<style scoped>
div.next-step {
    margin-top: 10px;
}

label {
    width: 20rem;
}

select.evaluation-item {
    width: auto;
}

table {
    width: 100%;
    font-size: 2rem;
    margin-top: 10px;
}

th,
td {
    white-space: nowrap;
    padding-right: 4px;
    line-height: 3.3rem;
}

th.name {
    color: #df8f37;
    text-align: right;
}

td {
    text-align: right;
    padding-left: 2px;
    padding-right: 2px;
}

td select {
    min-width: 8rem;
}

td.count {
    width: calc(100% / 4);
    min-width: 100px;
}

td:last-child {
    width: 6rem;
}

th.damage {
    text-align: right;
    color: gold;
}

input[type="range"]+span {
    font-size: smaller;
}

label {
    display: inline-block;
    color: #df8f37;
    width: calc(100px + 3rem);
}

select {
    width: 100%;
}

button {
    padding: 2px 10px;
}
</style>