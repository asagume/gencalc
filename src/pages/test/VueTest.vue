<template>
    <div class="base-container">
        <div class="pane1">
        </div>
        <div class="pane2">
            <CharacterSelect :visible="true" @update:character="updateCharacter" />
        </div>
        <div class="pane3">
            <ul>
                <draggable :list="characters" :sort="true">
                    <template #item="{ element, index }">
                        <div @click="boxSelected(index)">
                            {{ index }}
                            {{ element }}
                        </div>
                    </template>
                </draggable>
            </ul>
        </div>
        <div class="pane4">
        </div>
        <div class="footer">
        </div>
    </div>
</template>
<script lang="ts">
import draggable from "vuedraggable";
import { defineComponent, reactive, ref } from "vue";
import CharacterSelect from "@/components/CharacterSelect.vue";
import { CHARACTER_MASTER } from "@/master";

export default defineComponent({
    name: "VueTest",
    components: {
        draggable,
        CharacterSelect
    },
    setup() {
        const characters = reactive(['', '', '', '']);
        const characterIndex = ref(0);

        const updateCharacter = (character: string) => {
            if (characterIndex.value != -1) {
                characters.splice(characterIndex.value, 1, character);
                if (characterIndex.value < 3) {
                    characterIndex.value++;
                } else {
                    characterIndex.value = -1;
                }
            }
        }

        const characterMaster = (character: string) => {
            if (character) {
                return (CHARACTER_MASTER as any)[character];
            } else {
                return {};
            }
        }

        const boxSelected = (index: number) => {
            characterIndex.value = index;
        }

        return {
            characters,

            updateCharacter,
            characterMaster,
            boxSelected,
        };
    },
});
</script>
<style>
.base-container {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto auto;
    grid-template-areas:
        "pane1 pane1"
        "pane2 pane3"
        "pane2 pane4"
        "footer footer";
}
</style>
<style scoped>

</style>