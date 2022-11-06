<template>
    <fieldset>
        <legend>おまけ</legend>

        <div class="left">
            <article>
                <label>
                    <input type="checkbox" v-model="configurationInputRea['全武器解放']"
                        @change="$emit('update:configuration-input', configurationInputRea)">
                    <span>全ての武器が選択可能になる</span>
                </label>
                <div class="notice">
                    ※正規の武器タイプ以外の武器を選択した場合、構成保存できなくなります。
                </div>
            </article>

            <article>
                <label>
                    <input type="checkbox" v-model="configurationInputRea['聖遺物サブ効果計算停止']"
                        @change="$emit('update:configuration-input', configurationInputRea)">
                    <span>聖遺物サブ効果の自動計算を止める</span>
                </label>
                <div class="notice">
                    聖遺物サブ効果が自動計算されなくなります。<br>
                    手動で入力して下さい。
                </div>
            </article>

            <article>
                <label>
                    <input type="checkbox" v-model="initializeArtifactStatsSubClickableRef">
                    <span>聖遺物サブ効果0初期化</span>
                </label>
                <button type="button" :disabled="!initializeArtifactStatsSubClickableRef"
                    @click="initializeArtifactStatsSub">
                    {{ displayName('実行') }}
                </button>
            </article>
        </div>
    </fieldset>

    <div>
        {{ screen.width }} , {{ screen.height }}
    </div>
</template>
<script lang="ts">
import { TAnyObject } from "@/master";
import { defineComponent, PropType, reactive, ref } from "vue";
import CompositionFunction from './CompositionFunction.vue';

export default defineComponent({
    name: 'ConfigurationInput',
    props: {
        configurationInput: { type: Object as PropType<TAnyObject>, required: true },
    },
    emits: ['update:configuration-input', 'order:initialize-artifact-stats-sub'],
    setup(props, context) {
        const { displayName } = CompositionFunction();

        const configurationInputRea = reactive(props.configurationInput);
        // configurationInputRea['全武器解放'] = false;
        // configurationInputRea['聖遺物サブ効果計算停止'] = false;
        const initializeArtifactStatsSubClickableRef = ref(false);

        const initializeArtifactStatsSub = () => {
            context.emit('order:initialize-artifact-stats-sub');
            initializeArtifactStatsSubClickableRef.value = false;
        }

        return {
            displayName,
            configurationInputRea,
            initializeArtifactStatsSubClickableRef,
            initializeArtifactStatsSub,

            screen,
        }
    },
});
</script>
<style scoped>
fieldset {
    margin-bottom: 15px;
    padding: 1rem 1.5rem;
}

legend {
    padding-left: 10px;
    padding-right: 10px;
    color: orange;
}

.left {
    text-align: left;
}

article {
    display: inline-block;
    min-width: calc(50% - 4px);
    text-align: left;
    vertical-align: top;
    border-width: 2px;
    border-top-style: dotted;
    border-color: gray;
    padding: 10px 0;
}

.notice {
    margin-top: 1rem;
    color: chocolate;
}
</style>
