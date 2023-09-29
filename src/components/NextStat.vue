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
                    <div class="reaction-area">
                        <div class="reaction with-tooltip" v-for="reaction in amplifyingReactionList" :key="reaction">
                            <img :class="'reaction' + (selectedAmplifyingReaction == reaction ? ' selected' : '')"
                                :src="reactionImgSrc(reaction)" :alt="reaction" @click="reactionImgOnClick(reaction)">
                            <div class="tooltip">{{ displayName(reaction) }}</div>
                        </div>
                    </div>
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
                                <input type="range" min="-3" max="5" v-model="row[3]" @change="nextStatOnChange">
                            </td>
                            <td>
                                {{ displayNextStatValue(row) }}
                            </td>
                        </tr>
                    </template>
                    <tr>
                        <th class="damage">
                            {{ isStop ? displayName('停止中') : displayName('稼働中') }}
                            <button type="button" @click="stopButtonOnClick">
                                {{ isStop ? displayName('再開') : displayName('停止') }}
                            </button>
                        </th>
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
import _, { isTypedArray } from 'lodash';
import {
    DAMAGE_RESULT_TEMPLATE,
    makeEasyInputSubstatValueList, TArtifactDetailInput, TCharacterInput, TConditionInput, TDamageResult, TDamageResultEntry, TOptionInput, TStats, TStatsInput,
} from "@/input";
import { ELEMENT_IMG_SRC, ELEMENTAL_REACTION_MASTER, IMG_SRC_DUMMY, TArtifactSubKey, TElementalReactionKey, TElementImgSrcKey } from "@/master";
import { computed, defineComponent, nextTick, PropType, reactive, ref, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";
import { calculateDamageResult, calculateReactedDamage, calculateRotationTotalDamage, calculateStats, getAmplifyingReactionElement, TRotationDamageInfo } from "@/calculate";

type TStatRow = [
    string,     // stat
    number[],   // datalist
    number,     // index
    number,     // count
    number,     // evaluation value
];

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
    emits: ['update:stat-adjustments', 'update:next-stat-rows'],
    setup(props, context) {
        const { displayName, displayStatValue } = CompositionFunction();

        const ROTATION_TOTAL_DMG_NAME = 'ローテーション合計ダメージ';
        const NEXT_STAT_ARR = ['HP%', '攻撃力%', '防御力%', '元素熟知', '会心率', '会心ダメージ', '元素チャージ効率', 'HP', '攻撃力', '防御力'];
        const toggleSwitch = ref(props.visible);
        const evaluationItem = ref('');
        const nextStatRows = reactive([] as TStatRow[]); // 0:stat, 1:datalist, 2:index, 3:count, 4:evaluation value
        const selectedAmplifyingReaction = ref('');
        const STORAGE_KEY_NEXT_STEP_STOP = 'nextStepStopFlg';
        const isStop = ref(false);

        if (localStorage.getItem(STORAGE_KEY_NEXT_STEP_STOP)) {
            isStop.value = Boolean(localStorage.getItem(STORAGE_KEY_NEXT_STEP_STOP));
        }

        const evaluationItemList = computed(() => {
            let result: string[] = [];
            if (props.rotationDamageInfo?.rotationDamages) {
                result.push(ROTATION_TOTAL_DMG_NAME);
            }
            for (const key1 of ['通常攻撃', '落下攻撃', '重撃', '元素スキル', '元素爆発', 'その他']) {
                const damageResultValue = props.damageResult[key1];
                if (Array.isArray(damageResultValue)) {
                    for (const key2 of damageResultValue) {
                        if (!key2) continue;
                        if (key2[0].endsWith('合計ダメージ')) continue; // 名前
                        if (!key2[5]?.endsWith('ダメージ')) continue; // 種類
                        const name = key1 + '.' + key2[0];
                        result.push(name);
                    }
                }
            }
            return result;
        });

        const dmgElement = computed(() => {
            let result = '物理';
            if (props.damageResult && evaluationItem.value) {
                const keyArr = evaluationItem.value.split('.');
                if (keyArr.length == 2) {
                    const dmgCategory = keyArr[0];
                    const dmgName = keyArr[1];
                    if (dmgCategory in props.damageResult) {
                        const dmgResultEntryArr = (props.damageResult[dmgCategory] as TDamageResultEntry[]).filter((s) => s[0] == dmgName);
                        if (dmgResultEntryArr.length) {
                            const dmgResultEntry = dmgResultEntryArr[0];
                            if (dmgResultEntry[1]) {
                                result = dmgResultEntry[1];
                            }
                        }
                    }
                }
            }
            return result;
        })

        const amplifyingReactionList = computed(() => {
            const result: string[] = [];
            if (dmgElement.value && dmgElement.value in ELEMENTAL_REACTION_MASTER) {
                result.push(...Object.keys(ELEMENTAL_REACTION_MASTER[dmgElement.value as TElementalReactionKey]).filter(s => ['蒸発', '溶解', '超激化', '草激化'].includes(s)));
            }
            return result;
        })

        const reactionImgSrc = (reaction: string) => {
            const reactionElement = getAmplifyingReactionElement(reaction, dmgElement.value);
            return reactionElement ? ELEMENT_IMG_SRC[reactionElement as TElementImgSrcKey] : IMG_SRC_DUMMY;
        }

        const nextStatValue = (row: TStatRow) => (row && row[3] ? row[3] * row[1][row[2]] : 0);

        const displayNextStatValue = (row: TStatRow) => {
            let result = '';
            const valueNum = nextStatValue(row);
            if (valueNum > 0) {
                result += '+';
            }
            result += displayStatValue(row[0], valueNum);
            return result;
        }

        function initializeNextStat() {
            const newRows: TStatRow[] = [];
            for (const stat of NEXT_STAT_ARR) {
                const row: TStatRow = [stat, makeEasyInputSubstatValueList(stat as TArtifactSubKey), 2, 0, 0];
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
                    result = calculateReactedDamage(work[0], 2, damageResult.元素反応, selectedAmplifyingReaction.value);
                }
            }
            return result;
        }

        function setupNextStatRow(row: TStatRow, workDamageResult?: TDamageResult, workStatsInput?: TStatsInput) {
            if (isStop.value) return;
            if (!workDamageResult) {
                workDamageResult = _.cloneDeep(DAMAGE_RESULT_TEMPLATE);
            }
            if (!workStatsInput) {
                workStatsInput = _.cloneDeep(props.statsInput);
            }
            let evaluationValue = 0;
            const stat = row[0] != 'HP' ? row[0] : 'HP+';
            const step = row[1][row[2]];
            if (step && props.rotationDamageInfo) {
                const baseValue = getDamageValue(evaluationItem.value, props.damageResult);
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
            context.emit('update:next-stat-rows', nextStatRows);
        }

        function initializeEvaluationItem() {
            if (evaluationItemList.value.length) {
                let item;
                if (evaluationItemList.value.length > 1) {
                    if (props.characterInput?.characterMaster['NEXT STEP']) {
                        const work = props.characterInput.characterMaster['NEXT STEP'];
                        if (evaluationItemList.value.includes(work)) {
                            item = work;
                        } else {
                            console.warn(work, evaluationItemList.value);
                        }
                    }
                }
                if (!item) {
                    if (evaluationItemList.value.includes(evaluationItem.value)) {
                        item = evaluationItem.value;
                    } else {
                        if (evaluationItemList.value.includes(ROTATION_TOTAL_DMG_NAME)) {
                            item = ROTATION_TOTAL_DMG_NAME;
                        } else {
                            item = evaluationItemList.value[evaluationItemList.value.length - 1];
                        }
                    }
                }
                evaluationItem.value = item;
            }
        }

        const evaluationItemOnChange = () => {
            setupNextStatRows();
        };

        const reactionImgOnClick = (name: string) => {
            if (selectedAmplifyingReaction.value == name) {
                selectedAmplifyingReaction.value = '';
            } else {
                selectedAmplifyingReaction.value = name;
            }
            setupNextStatRows();
        }

        const nextStatStepOnChange = (row: TStatRow) => {
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

        const stopButtonOnClick = () => {
            isStop.value = !isStop.value;
            localStorage.setItem(STORAGE_KEY_NEXT_STEP_STOP, String(isStop.value));
            if (!isStop.value) {
                setupNextStatRows();
            }
        }

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
            amplifyingReactionList,
            reactionImgSrc,
            selectedAmplifyingReaction,
            evaluationItemOnChange,
            reactionImgOnClick,

            nextStatRows,
            nextStatStepOnChange,
            displayNextStatValue,

            nextStatOnChange,
            resetButtonOnClick,
            isStop,
            stopButtonOnClick,
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

div.reaction-area {
    display: inline-block;
    width: 48px;
    text-align: right;
}

div.reaction {
    display: inline-block;
}

img.reaction {
    width: 22px;
    height: 22px;
    margin-left: 1px;
    border-radius: 75%;
    background-color: transparent;
    z-index: 10;
}

img.selected {
    background-color: darkorange;
}

.tooltip {
    top: -2rem;
}
</style>