<template>
    <div id="character-select" v-if="visible">
        <ul>
            <li v-for="item in elementList" :key="item">
                <label>
                    <input class="hidden" type="checkbox" v-model="elementCheckList[item]"
                        @change="checkListOnChange(item, elementCheckList)">
                    <img class="filter" :src="elementSrc(item)" :alt="item">
                </label>
            </li>
        </ul>
        <ul>
            <li v-for="item in weaponList" :key="item">
                <label>
                    <input class="hidden" type="checkbox" v-model="weaponCheckList[item]"
                        @change="checkListOnChange(item, weaponCheckList)">
                    <img class="filter" :src="weaponSrc(item)" :alt="item">
                </label>
            </li>
        </ul>
        <ul>
            <li v-for="item in filteredList" :key="item.key">
                <label>
                    <input class="hidden" type="radio" name="character-select" :value="item.key"
                        @change="$emit('update:character', item.key)">
                    <img :class="'character ' + selectedClass(item)" :src="item.icon_url" :alt="item.key"
                        :style="'background-image: url(' + backgroundUrl(item) + ')'">
                    <span class="tooltip">{{ displayName(item.key) }}</span>
                    <img class="vision" :src="visionSrc(item)" :alt="item.元素">
                </label>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from 'vue';

const Master = require('../master.js');

interface ICharacter {
    レアリティ: number,
    元素: string,
    武器: string,
    誕生日?: string,
    import: string,
    key: string,
    icon_url: string,
}

interface ICheckList {
    [key: string]: boolean
}

export default defineComponent({
    name: 'CharacterSelect',
    props: {
        character: String,
        visible: Boolean,
    },
    emits: ['update:character'],
    setup(props, context) {
        const displayName = (name: string) => name;

        const visionSrc = (item: ICharacter) => Master.ELEMENT_IMG_SRC[item.元素] as string;
        const backgroundUrl = (item: ICharacter) => Master.STAR_BACKGROUND_URL[item.レアリティ] as string;
        const selectedClass = (item: ICharacter) => { return item.key == props.character ? 'selected' : '' };

        const elementList = Object.keys(Master.ELEMENT_IMG_SRC);
        const elementSrc = (element: string) => Master.ELEMENT_IMG_SRC[element] as string;
        const elementCheckList = reactive({}) as ICheckList;
        for (let key of elementList) {
            elementCheckList[key] = false;
        }

        const weaponList = Object.keys(Master.WEAPON_IMG_SRC);
        const weaponSrc = (weapon: string) => Master.WEAPON_IMG_SRC[weapon] as string;
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
            for (let entry of (Master.CHARACTER_MASTER_LIST as ICharacter[])) {
                if (elementChecked && !elementCheckList[entry.元素]) continue;
                if (weaponChecked && !weaponCheckList[entry.武器]) continue;
                result.push(entry);
            }
            return result;
        });

        return {
            displayName,
            visionSrc,
            backgroundUrl,
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
ul {
    list-style-type: none;
    padding: 0;
    font-size: 0;
}

li {
    display: inline-block;
    margin: 0;
    position: relative;
}

img.character {
    width: 90px;
    height: 90px;
    background-size: contain;
}

.character.selected {
    background-color: gold;
}

span.tooltip {
    display: none;
    position: absolute;
    left: 15px;
    top: 5px;
    z-index: 100;
    color: bisque;
    text-shadow: 1px 1px 2px black, 0 0 1em orange, 0 0 0.2em orange;
}

:hover+span.tooltip {
    display: block;
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
    background-color: gold;
}
</style>
