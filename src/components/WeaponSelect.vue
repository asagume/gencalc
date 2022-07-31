<template>
    <div v-if="visible">
        <ul class="select-list">
            <li v-for="item in filteredList" :key="item.key">
                <img :class="'weapon with-tooltip ' + selectedClass(item)" :src="item.icon_url" :alt="item.key"
                    :style="'background-image: url(' + backgroundUrl(item) + ')'"
                    @click="$emit('update:weapon', item.key)">
                <div class="tooltip">{{ displayName(item.key) }}</div>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { CHARACTER_MASTER_LIST, ELEMENT_IMG_SRC, STAR_BACKGROUND_URL, TCharacterEntry, TVisionKey, TWeaponEntry, TWeaponTypeKey, WEAPON_IMG_SRC, WEAPON_MASTER_LIST } from '@/master';
import { defineComponent, reactive, computed, ref } from 'vue';

interface ICheckList {
    [key: string]: boolean
}

export default defineComponent({
    name: 'WeaponSelect',
    props: {
        weapon: String,
        weaponType: String,
        visible: Boolean,
    },
    emits: ['update:weapon'],
    setup(props) {
        const displayName = (name: string) => name;

        const backgroundUrl = (item: TWeaponEntry) => STAR_BACKGROUND_URL[item.レアリティ] as string;
        const selectedClass = (item: TWeaponEntry) => { return item.key == props.weapon ? 'selected' : '' };

        let weaponType = ref(props.weaponType as TWeaponTypeKey);

        const filteredList = computed(() => {
            return WEAPON_MASTER_LIST[weaponType.value!] as TWeaponEntry[];
        });

        return {
            displayName,
            backgroundUrl, selectedClass,
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
    background-color: gold;
}
</style>
