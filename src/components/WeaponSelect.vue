<template>
    <div v-if="visible">
        <ul class="select-list">
            <li class="icon" v-for="item in filteredList" :key="item.key">
                <img :class="'weapon' + bgImageClass(item) + selectedClass(item)" :src="item.icon_url" :alt="item.key"
                    @click="$emit('update:weapon', item.key)">
                <div class="tooltip">{{ displayName(item.key) }}</div>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { STAR_BACKGROUND_IMAGE_CLASS, TWeaponEntry, TWeaponTypeKey, WEAPON_MASTER_LIST } from '@/master';
import { defineComponent, computed, ref } from 'vue';

export default defineComponent({
    name: 'WeaponSelect',
    props: {
        visible: Boolean,
        weapon: String,
        weaponType: String,
    },
    emits: ['update:weapon'],
    setup(props) {
        const bgImageClass = (item: TWeaponEntry) => ' ' + STAR_BACKGROUND_IMAGE_CLASS[item.レアリティ] as string;
        const selectedClass = (item: TWeaponEntry) => { return item.key == props.weapon ? ' selected' : '' };

        let weaponType = ref(props.weaponType as TWeaponTypeKey);

        const filteredList = computed(() => {
            if (weaponType.value) {
                return WEAPON_MASTER_LIST[weaponType.value] as TWeaponEntry[];
            }
            const result: TWeaponEntry[] = [];
            (Object.keys(WEAPON_MASTER_LIST) as TWeaponTypeKey[]).forEach(weaponType => {
                const list = WEAPON_MASTER_LIST[weaponType] as TWeaponEntry[];
                result.push(...list);
            })
            return result;
        });

        return {
            bgImageClass, selectedClass,
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
</style>
