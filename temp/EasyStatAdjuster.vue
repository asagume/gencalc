<template>
    <div v-if="visible">
        <template v-if="toggleSwitch">
            <fieldset>
                <legend @click="toggleSwitch = !toggleSwitch">{{ displayName("ステータス 簡易調整") }}</legend>
                <table class="easy-input-substat">
                    <draggable :list="statAdjustmentArr" item-key="id" :sort="true" handle=".handle">
                        <template #item="{ element }">
                            <tr>
                                <th class="handle">{{ displayName(element) }}</th>
                                <td>
                                    <select v-model="statAdjustmentIndices[element]" @change="statAdjustmentOnChange">
                                        <option v-for="(item, index) in statAdjustmentDatalist[element]" :key="index"
                                            :value="index">
                                            {{ Math.round(item * 10) / 10 }}
                                        </option>
                                    </select>
                                </td>
                                <td>
                                    <input type="range" min="-5" max="5" v-model="statAdjustmentCounts[element]"
                                        @change="statAdjustmentOnChange">
                                </td>
                                <td>
                                    {{ (statAdjustmentValue(element) > 0 ? '+' : '') + displayStatValue(element,
                                            statAdjustmentValue(element))
                                    }}
                                </td>
                            </tr>
                        </template>
                    </draggable>
                </table>
                <button type="button" @click="resetButtonOnClick"> Reset </button>
            </fieldset>
        </template>
        <template v-else>
            <label @click="toggleSwitch = !toggleSwitch">{{ displayName("ステータス 簡易調整") }}</label>
        </template>
    </div>
</template>
  
<script lang="ts">
import draggable from "vuedraggable";
import {
    makeEasyInputSubstatValueList, TStats,
} from "@/input";
import { TAnyObject, TArtifactSubKey } from "@/master";
import { defineComponent, nextTick, reactive, ref } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
    name: "EasyStatAdjuster",
    props: {
        visible: Boolean,
    },
    components: {
        draggable,
    },
    emits: ["update:stat-adjustments"],
    setup(props, context) {
        const { displayName, displayStatValue } = CompositionFunction();

        const toggleSwitch = ref(false);

        const statAdjustmentArr = reactive([] as string[]);
        const statAdjustmentDatalist = {} as { [key: string]: number[] };
        const statAdjustmentIndices = reactive({} as TAnyObject);
        const statAdjustmentCounts = reactive({} as TAnyObject);

        function onLoad() {
            statAdjustmentArr.splice(0, statAdjustmentArr.length, ...['HP%', '攻撃力%', '防御力%', '会心率', '会心ダメージ', '元素チャージ効率']);
            statAdjustmentArr.forEach(stat => {
                statAdjustmentDatalist[stat] = makeEasyInputSubstatValueList(stat as TArtifactSubKey);
                statAdjustmentIndices[stat] = 3;
                statAdjustmentCounts[stat] = 0;
            });
        }
        onLoad();

        const statAdjustmentValue = (stat: string) => {
            let result = statAdjustmentCounts[stat];
            result *= statAdjustmentDatalist[stat][statAdjustmentIndices[stat]];
            result = Math.round(result * 10) / 10;
            return result;
        };

        const statAdjustmentOnChange = async () => {
            await nextTick();
            const statAdjustments: TStats = {};
            statAdjustmentArr.forEach(stat => {
                if (statAdjustmentCounts[stat]) {
                    statAdjustments[stat] = statAdjustmentValue(stat);
                }
            });
            context.emit('update:stat-adjustments', statAdjustments);
        };

        const resetButtonOnClick = async () => {
            onLoad();
            await statAdjustmentOnChange();
        };

        return {
            displayName,
            displayStatValue,

            toggleSwitch,

            statAdjustmentArr,
            statAdjustmentIndices,
            statAdjustmentCounts,
            statAdjustmentValue,

            statAdjustmentDatalist,

            statAdjustmentOnChange,
            resetButtonOnClick,
        };
    },
});
</script>
  
<style scoped>
label {
    width: 20rem;
}

fieldset {
    margin-top: 10px;
    margin-bottom: 10px;
}

table {
    width: 100%;
}

th,
td {
    white-space: nowrap;
    padding-right: 4px;
    line-height: 3.3rem;
}

th {
    color: #df8f37;
    text-align: right;
}

td {
    text-align: left;
    padding-left: 5px;
    padding-right: 5px;
}

input[type="range"] {
    width: 100px;
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
    width: 12rem;
}
</style>
  