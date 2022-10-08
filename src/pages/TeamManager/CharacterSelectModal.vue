<template>
    <teleport to="body">
        <div class="modal character-select" v-show="visible">
            <div class="modal-content">
                <CharacterSelect :visible="true" :characters="characters" @update:characters="updateCharacters" />
                <button type="button" @click="cancelOnClick">cancel</button>
                <button type="button" @click="okOnClick">ok</button>
            </div>
        </div>
    </teleport>
</template>
<script lang="ts">
import { defineComponent, PropType, reactive, watch } from 'vue'
import CharacterSelect from '@/components/CharacterSelect.vue'

export default defineComponent({
    name: "CharacterSelectModal",
    components: {
        CharacterSelect,
    },
    props: {
        visible: { type: Boolean, required: true },
        memberNames: { type: Array as PropType<string[]>, required: true }
    },
    emits: ['click:cancel', 'click:ok'],
    setup(props, context) {
        const characters = reactive(props.memberNames);

        watch(props, (newVal) => {
            if (newVal.memberNames) {
                const newValStr = JSON.stringify(newVal.memberNames);
                const oldValStr = JSON.stringify(characters);
                if (newValStr != oldValStr) {
                    characters.splice(0, characters.length, ...newVal.memberNames);
                }
            }
        });

        const updateCharacters = (newCharacters: string[]) => {
            characters.splice(0, characters.length, ...newCharacters);
        }

        const cancelOnClick = () => {
            context.emit('click:cancel');
        };

        const okOnClick = () => {
            context.emit('click:ok', characters);
        };

        return {
            characters,

            updateCharacters,
            cancelOnClick,
            okOnClick,
        }
    },
})
</script>
<style scoped>
.modal {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    /* background-color: rgba(0, 0, 0, .5); */
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: transparent;
    justify-content: center;
    width: 100%;
    height: calc(100vh);
    vertical-align: top;
}

.modal-content {
    height: 100vh;
    padding: 20px 10px;
    width: calc(100% - 26px);
    background-color: rgb(63, 10, 10);
    border: 3px double gold;
    border-radius: 20px;
    z-index: 1000;
}

button {
    font-size: 3rem;
    width: 20rem;
    margin: 5px;
}
</style>