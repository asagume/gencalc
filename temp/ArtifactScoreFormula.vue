<template>
    <input id="artifact-score-formula" type="checkbox" class="hidden" v-model="visible">
    <label for="artifact-score-formula" class="toggle-switch header">
        {{displayName('聖遺物スコア計算式')}}
    </label>
    <div v-show="visible">
        <select v-model="selectedIndex" @change="selectOnChange">
            <option value="-1">
                {{artifactScoreFormulaName(currentFormula)}}
            </option>
            <option v-for="(item, index) in artifactScoreFormulaList" :key="index" :value="index">
                &nbsp; {{artifactScoreFormulaName(item)}}
            </option>
        </select>

        <div class="formula-detail">
            <div class="right" v-for="(item, index) in currentFormula" :key="index">
                <label>
                    {{item[0]}} ×
                    <input type="number" min="0" v-model="item[1]" @change="changed = true" />
                </label>
            </div>
        </div>

        <div class="formula-detail">
            <button type="button" :disabled="!changed" @click="applyFormula">Apply</button>
        </div>
    </div>
</template>
<script lang="ts">
import { ARTIFACT_SCORE_FORMULA_TEMPLATE, TArtifactScoreFormula } from "@/calculate";
import { defineComponent, reactive, ref } from "vue";
import { deepcopy } from "@/common";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
    name: 'ArtifactScoreFormula',
    emits: ['apply:formula'],
    setup(props, context) {
        const { displayName } = CompositionFunction();
        const visible = ref(false);
        const changed = ref(false);

        const artifactScoreFormulaList = reactive([] as TArtifactScoreFormula[]);
        ARTIFACT_SCORE_FORMULA_TEMPLATE.forEach(formula => {
            artifactScoreFormulaList.push(formula);
        });

        const selectedIndex = ref(-1);
        const currentFormula = reactive(deepcopy(artifactScoreFormulaList[0]) as TArtifactScoreFormula);

        const selectOnChange = () => {
            if (selectedIndex.value == -1) return;
            const newFormula = deepcopy(artifactScoreFormulaList[selectedIndex.value]);
            currentFormula.splice(0, currentFormula.length, ...newFormula);
            changed.value = true;
        };

        const artifactScoreFormulaName = (formula: TArtifactScoreFormula) => {
            let result: string[] = [];
            formula.forEach(e => {
                let work = displayName(e[0]);
                if (e[1] != 1) work += '*' + e[1];
                result.push(work);
            });
            return result.join('+');
        };

        const applyFormula = () => {
            context.emit('apply:formula', currentFormula);
            changed.value = false;
        };

        const initialize = (formula: TArtifactScoreFormula) => {
            currentFormula.splice(0, currentFormula.length, ...deepcopy(formula));
            selectedIndex.value = -1;
            changed.value = false;
        };

        return {
            displayName,

            visible,

            artifactScoreFormulaList,
            artifactScoreFormulaName,
            selectedIndex,
            currentFormula,
            selectOnChange,

            changed,
            applyFormula,
            initialize,
        }
    }
});
</script>
<style scoped>
label.header {
    width: 30rem;
    border: none;
    background: transparent;
}

.formula-detail {
    display: inline-block;
    vertical-align: top;
    margin-top: 10px;
}

input[type="number"] {
    width: 12rem;
    padding-left: 1rem;
}

button {
    width: 12rem;
    margin-left: 10px;
}
</style>
