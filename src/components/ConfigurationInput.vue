<template>
    <fieldset>
        <legend>おまけ</legend>
        <label>
            <input type="checkbox" v-model="configurationInput['全武器解放']"
                @change="$emit('update:configuration-input', configurationInput)">
            <span>全ての武器が選択可能になる</span>
        </label>
        <div class="notice">
            キャラクター再選択後に有効になります
        </div>
        <hr>
        <label>
            <input type="checkbox" v-model="configurationInput['聖遺物サブ効果計算停止']"
                @change="$emit('update:configuration-input', configurationInput)">
            <span>聖遺物サブ効果の自動計算を止める</span>
        </label>
        <div class="notice">
            聖遺物サブ効果が自動計算されなくなります。<br>
            手動で入力して下さい
        </div>
        <hr>
        <label>
            <input type="checkbox" v-model="initializeArtifactStatsSubClickable">
            <span>聖遺物サブ効果0初期化</span>
        </label>
        <button type="button" :disabled="!initializeArtifactStatsSubClickable" @click="initializeArtifactStatsSub">
            {{ displayName('実行') }}
        </button>
    </fieldset>
</template>
<script lang="ts">
import { TAnyObject } from "@/master";
import { defineComponent, reactive, ref } from "vue";
import CompositionFunction from './CompositionFunction.vue';

export default defineComponent({
    name: 'ConfigurationInput',
    emits: ['update:configuration-input', 'order:initialize-artifact-stats-sub'],
    setup(props, context) {
        const { displayName } = CompositionFunction();

        const configurationInput = reactive({} as TAnyObject);
        configurationInput['全武器解放'] = false;
        configurationInput['聖遺物サブ効果計算停止'] = false;
        const initializeArtifactStatsSubClickableRef = ref(false);

        const initializeArtifactStatsSub = () => {
            context.emit('order:initialize-artifact-stats-sub');
            initializeArtifactStatsSubClickableRef.value = false;
        }

        return {
            displayName,
            configurationInput,
            initializeArtifactStatsSubClickable: initializeArtifactStatsSubClickableRef,
            initializeArtifactStatsSub,
        }
    },
});
</script>
<style scoped>
.description {
    text-align: left;
    padding: 0.5rem 1rem;
}

.notice {
    text-align: left;
    padding: 0.5rem 1rem;
    color: chocolate;
}
</style>
