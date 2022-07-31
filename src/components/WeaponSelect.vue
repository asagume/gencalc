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
import { STAR_BACKGROUND_URL, TWeaponEntry, TWeaponTypeKey, WEAPON_MASTER_LIST } from '@/master';
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
img.weapon {
    width: 75px;
    height: 75px;
    background-size: contain;
}

.selected {
    background-color: gold;
}

:checked+img {
    background-color: gold;
}
</style>
