<template>
    <div v-if="visible">
        <ul class="select-list">
            <li v-for="item in elementList" :key="item">
                <label>
                    <input class="hidden" type="checkbox" v-model="elementCheckList[item]"
                        @change="checkListOnChange(item, elementCheckList)">
                    <img class="filter" :src="elementSrc(item)" :alt="item">
                </label>
            </li>
        </ul>
        <ul class="select-list">
            <li v-for="item in weaponList" :key="item">
                <label>
                    <input class="hidden" type="checkbox" v-model="weaponCheckList[item]"
                        @change="checkListOnChange(item, weaponCheckList)">
                    <img class="filter" :src="weaponSrc(item)" :alt="item">
                </label>
            </li>
        </ul>
        <ul class="select-list">
            <li v-for="item in filteredList" :key="item.key">
                <img :class="'character with-tooltip' + bgImageClass(item) + selectedClass(item)" :src="item.icon_url"
                    :alt="item.key" @click="$emit('update:character', item.key)">
                <div class="tooltip">{{ displayName(item.key) }}</div>
                <img class="vision" :src="visionSrc(item)" :alt="item.元素">
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { TCharacterEntry, ELEMENT_IMG_SRC, TVisionKey, WEAPON_IMG_SRC, TWeaponTypeKey, CHARACTER_MASTER_LIST, STAR_BACKGROUND_IMAGE_CLASS } from '@/master';
import { defineComponent, reactive, computed } from 'vue';
import CompositionFunction from './CompositionFunction.vue';

interface ICheckList {
    [key: string]: boolean
}

export default defineComponent({
    name: 'CharacterSelect',
    props: {
        character: { type: String, required: true },
        visible: { type: Boolean, required: true },
    },
    emits: ['update:character'],
    setup(props) {
        const { displayName } = CompositionFunction();

        const visionSrc = (item: TCharacterEntry) => ELEMENT_IMG_SRC[item.元素];
        const bgImageClass = (item: TCharacterEntry) => ' ' + STAR_BACKGROUND_IMAGE_CLASS[item.レアリティ] as string;
        const selectedClass = (item: TCharacterEntry) => { return item.key == props.character ? ' selected' : '' };

        const elementList = Object.keys(ELEMENT_IMG_SRC) as TVisionKey[];
        const elementSrc = (element: TVisionKey) => ELEMENT_IMG_SRC[element] as string;
        const elementCheckList = reactive({}) as ICheckList;
        for (let key of elementList) {
            elementCheckList[key] = false;
        }

        const weaponList = Object.keys(WEAPON_IMG_SRC) as TWeaponTypeKey[];
        const weaponSrc = (weapon: TWeaponTypeKey) => WEAPON_IMG_SRC[weapon] as string;
        const weaponCheckList = reactive({}) as ICheckList;
        for (let key of weaponList) {
            weaponCheckList[key] = false;
        }

        const checkListOnChange = function (item: string, checkList: ICheckList) {
            if (!checkList[item]) return;
            Object.keys(checkList).filter(s => s != item).forEach(key => {
                checkList[key] = false;
            })
        }

        const filteredList = computed(() => {
            const result = [];
            const elementChecked = Object.keys(elementCheckList).filter(s => elementCheckList[s]).length > 0;
            const weaponChecked = Object.keys(weaponCheckList).filter(s => weaponCheckList[s]).length > 0;
            for (let entry of (CHARACTER_MASTER_LIST as TCharacterEntry[])) {
                if (elementChecked && !elementCheckList[entry.元素]) continue;
                if (weaponChecked && !weaponCheckList[entry.武器]) continue;
                result.push(entry);
            }
            return result;
        });

        return {
            displayName,

            visionSrc,
            bgImageClass,
            selectedClass,
            elementList,
            elementSrc,
            elementCheckList,
            weaponList,
            weaponSrc,
            weaponCheckList,
            checkListOnChange,
            filteredList,
        }
    }
});
</script>

<style scoped>
img.character {
    width: 90px;
    height: 90px;
    background-size: contain;
}

.character.selected {
    background-color: gold;
}

img.vision {
    width: 30px;
    height: 30px;
    position: absolute;
    left: 3px;
    top: 3px;
}

img.filter {
    width: 45px;
    height: 45px;
    border-radius: 50%;
}

:checked+img {
    background-color: rgb(156, 140, 49);
}
</style>
