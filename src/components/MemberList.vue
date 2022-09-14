<template>
    <div>
        <draggable :list="characterMasterList" item-key="id">
            <template #item="{ element, index }">
                <div class="member">
                    <img :class="'character with-tooltip' + bgImageClass(element.data) + selectedClass(index)"
                        :src="element.data.icon_url" :alt="element.data.key" @click="openCharacterSelect(index)">
                    <div class="tooltip">{{ displayName(element.data.key) }}</div>
                    <img class="vision" :src="visionSrc(element.data)" :alt="element.data.元素">
                </div>
            </template>
        </draggable>
    </div>
</template>

<script lang="ts">
import draggable from "vuedraggable";
import { CHARACTER_MASTER_LIST, ELEMENT_IMG_SRC, IMG_SRC_DUMMY, STAR_BACKGROUND_IMAGE_CLASS, TCharacterEntry } from "@/master";
import { defineComponent, reactive, ref, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
    name: "MemberList",
    components: {
        draggable,
    },
    props: {
        character: { type: String, required: true, }
    },
    emits: ['open:character-select'],
    setup(props, context) {
        const { displayName } = CompositionFunction();

        const CHARACTER_DUMMY = {
            key: 'dummy',
            icon_url: IMG_SRC_DUMMY,
            レアリティ: 1,
            元素: '',
            武器: '',
            import: '',
        };

        const characterMasterList = reactive([
            { id: 1, data: CHARACTER_DUMMY },
            { id: 2, data: CHARACTER_DUMMY },
            { id: 3, data: CHARACTER_DUMMY },
            { id: 4, data: CHARACTER_DUMMY },
        ]);
        if (props.character) {
            const work = CHARACTER_MASTER_LIST.filter(s => s.key == props.character);
            if (work.length > 0) {
                characterMasterList[0].data = work[0];
            }
        }

        watch(props, (newVal, oldVal) => {
            let newEntry = CHARACTER_DUMMY;
            if (newVal.character) {
                const newKey = String(newVal.character);
                const work = CHARACTER_MASTER_LIST.filter(s => s.key == newKey);
                if (work.length > 0) {
                    newEntry = work[0];
                }
            }
            let index = -1;
            if (oldVal.character) {
                const key = String(oldVal.character);
                for (let i = 0; i < characterMasterList.length; i++) {
                    if (key == characterMasterList[i].data.key) {
                        index = i;
                        break;
                    }
                }
            }
            if (index == -1) index = 0;
            characterMasterList[index].data = newEntry;
        });

        const visionSrc = (item: TCharacterEntry): string => {
            if (item.元素) return ELEMENT_IMG_SRC[item.元素];
            return IMG_SRC_DUMMY;
        };

        const bgImageClass = (item: TCharacterEntry) => {
            let result = ' ';
            if (item.レアリティ) result += (STAR_BACKGROUND_IMAGE_CLASS as any)[String(item.レアリティ)];
            else result += STAR_BACKGROUND_IMAGE_CLASS['1'];
            return result
        };

        const characterSelectedIndex = ref(-1);

        const openCharacterSelect = (index: number) => {
            if (index == 0) return;
            characterSelectedIndex.value = index;
            context.emit('open:character-select', index);
        }

        const selectedClass = (index: number) => { return index == characterSelectedIndex.value ? ' selected' : '' };

        return {
            displayName,

            characterMasterList,
            visionSrc,
            bgImageClass,

            openCharacterSelect,
            characterSelectedIndex,
            selectedClass,
        }
    }
});
</script>

<style scoped>
div.member {
    display: inline-block;
}


img.character {
    width: 60px;
    height: 60px;
    background-size: contain;
}

img.vision {
    width: 15px;
    height: 15px;
    position: absolute;
    left: 3px;
    top: 3px;
}

.character.selected {
    background-color: gold;
}
</style>