<template>
    <ul class="select-list">
        <li v-for="item in weaponTypeList" :key="item">
            <label>
                <input class="hidden" type="radio" v-model="selectedWeaponType" name="weapon-own-list-type"
                    :value="item">
                <img class="filter" :src="weaponSrc(item)" :alt="item">
            </label>
        </li>
    </ul>
    <div v-for="weaponType in weaponTypeList" :key="weaponType">
        <ul class="select-list" v-if="weaponType == selectedWeaponType">
            <li v-for="item in weaponList(weaponType)" :key="item.key">
                <img :class="'weapon' + bgImageClass(item) + notOwnedClass(item)" :src="item.icon_url" :alt="item.key"
                    @click="onClick(item)">
                <div class="tooltip">{{ displayName(item.key) }}</div>
                <div class="refine">{{ refineObj[item.key] }}</div>
            </li>
        </ul>
    </div>
    <label>
        <input type="checkbox" v-model="savable" :disabled="!changed">
        <span>{{ displayName('武器所持状況を保存する') }}</span>
    </label>
    <button type="button" @click="save" :disabled="!savable">{{ displayName('実行') }}</button>
</template>

<script lang="ts">
import { STAR_BACKGROUND_IMAGE_CLASS, TWeaponEntry, WEAPON_MASTER_LIST, TWeaponTypeKey, WEAPON_IMG_SRC } from '@/master';
import { computed, defineComponent, reactive, ref } from 'vue';
import CompositionFunction from './CompositionFunction.vue';


export default defineComponent({
    name: 'WeaponOwnList',
    setup() {
        const { displayName } = CompositionFunction();

        const bgImageClass = (item: TWeaponEntry) => ' ' + STAR_BACKGROUND_IMAGE_CLASS[item.レアリティ] as string;

        const weaponTypeList = computed(() => Object.keys(WEAPON_IMG_SRC) as TWeaponTypeKey[]);
        const weaponSrc = (weapon: TWeaponTypeKey) => WEAPON_IMG_SRC[weapon] as string;
        const weaponList = (weaponType: TWeaponTypeKey) => WEAPON_MASTER_LIST[weaponType] as any[];
        const selectedWeaponType = ref(weaponTypeList.value[0]);

        const refineObj = reactive({} as { [key: string]: number | null });
        for (const weaponType of weaponTypeList.value) {
            for (const item of weaponList(weaponType)) {
                refineObj[item.key] = null;
            }
        }
        if (localStorage['武器所持状況']) {
            const savedObj = JSON.parse(localStorage['武器所持状況']);
            Object.keys(savedObj).forEach(key => {
                refineObj[key] = savedObj[key];
            });
        }
        const changed = ref(false);
        const savable = ref(false);

        const notOwnedClass = (item: TWeaponEntry) => refineObj[item.key] == null ? ' not-owned' : '';

        const onClick = (item: TWeaponEntry) => {
            if (refineObj[item.key] === null) {
                refineObj[item.key] = 1;
            } else if (refineObj[item.key] == 5) {
                refineObj[item.key] = null;
            } else {
                let current = refineObj[item.key] as number;
                refineObj[item.key] = current + 1;
            }
            changed.value = true;
        };

        const save = () => {
            const saveObj = {} as { [key: string]: number | null };
            Object.keys(refineObj).filter(s => refineObj[s] !== null).forEach(key => {
                saveObj[key] = refineObj[key];
            });
            localStorage.setItem('武器所持状況', JSON.stringify(saveObj));
            savable.value = false;
            changed.value = false;
        };

        return {
            displayName,

            bgImageClass,
            weaponTypeList,
            weaponSrc,
            weaponList,
            selectedWeaponType,
            refineObj,
            onClick,
            changed, savable, save,
            notOwnedClass,
        }
    }
});
</script>

<style scoped>
img.weapon {
    width: 90px;
    height: 90px;
    background-size: contain;
}

.weapon.selected {
    background-color: gold;
}

img.filter {
    width: 45px;
    height: 45px;
    border-radius: 50%;
}

:checked+img {
    background-color: rgb(156, 140, 49);
}

div.refine {
    font-size: 28px;
    text-shadow: 0 0 3px black;
    position: absolute;
    right: 10px;
    top: 3px;
}

.not-owned {
    opacity: 50%;
}
</style>
