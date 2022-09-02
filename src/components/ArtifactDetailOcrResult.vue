<template>
    <teleport to="body">
        <div class="modal" v-show="visible">
            <div class="modal-content">
                <table class="ocr-result">
                    <caption>OCR RESULT</caption>
                    <tr v-for="item in items" :key="item.key">
                        <th>{{ displayStatName(item.key) }}</th>
                        <td>{{ displayStatValue(item.key, item.value) }}</td>
                    </tr>
                </table>
                <br />
                <button type="button" @click="ok"> OK </button>
                <button type="button" @click="cancel"> CANCEL </button>
            </div>
        </div>
    </teleport>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
    name: 'ArtifactDetailOcrResult',
    props: {
        visible: { type: Boolean, required: true, default: false },
        ocrResult: { type: Object, required: true }
    },
    emits: ['cancel:artifact-detail-ocr-result', 'accept:artifact-detail-ocr-result'],
    setup(props, context) {
        const { displayStatName, displayStatValue, } = CompositionFunction();

        const items = computed((): { key: string, value: number }[] => {
            return Object.keys(props.ocrResult).map(s => ({ key: s, value: props.ocrResult[s] }));
        });

        const cancel = () => {
            context.emit('cancel:artifact-detail-ocr-result');
        };

        const ok = () => {
            context.emit('accept:artifact-detail-ocr-result');
        }

        return {
            displayStatName, displayStatValue,
            items,

            cancel, ok,
        }
    }
});
</script>
<style scoped>
.modal {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, .5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.modal-content {
    background-color: rgb(63, 10, 10);
    height: auto;
    border-radius: 20px;
    padding: 20px;
}

table.ocr-result {
    table-layout: fixed;
    width: 40rem;
}

caption {
    font-size: 3rem;
}

th,
td {
    text-align: right;
}

button {
    width: 15rem;
    margin: 10px;
}
</style>
