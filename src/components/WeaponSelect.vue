<template>
  <div v-if="visible">
    <table>
      <tr>
        <th class="title">{{ displayName(weaponMasterRef.名前) }}</th>
        <th class="stat">{{ displayName("基礎攻撃力") }}</th>
        <td class="stat-value">{{ displayStatValue("基礎攻撃力", stats[0].value) }}</td>
      </tr>
      <tr>
        <td>
          <img v-for="i in Array.from({ length: weaponMasterRef.レアリティ }, (_, i) => i)" class="star"
            src="images/star.png" alt="star" :key="i" />
        </td>
        <th class="stat">
          <template v-if="stats[1]"> {{ displayName(stats[1].key) }} </template>
        </th>
        <td class="stat-value">
          <template v-if="stats[1]">
            {{ displayStatValue(stats[1].key, stats[1].value) }}
          </template>
        </td>
      </tr>
      <template v-if="weaponMasterRef.武器スキル">
        <tr>
          <th class="title" colspan="3">{{ weaponMasterRef.武器スキル.名前 }}</th>
        </tr>
        <tr>
          <td colspan="3" class="description" v-html="weaponMasterRef.武器スキル.説明"></td>
        </tr>
      </template>
    </table>

    <ul class="select-list">
      <li class="icon" v-for="item in filteredList" :key="item.key">
        <img :class="'weapon' + bgImageClass(item) + selectedClass(item)" :src="item.icon_url" :alt="item.key"
          @click="updateWeapon(item.key)" />
        <div class="tooltip">{{ displayName(item.key) }}</div>
      </li>
    </ul>
  </div>
</template>
displayName

<script lang="ts">
import { getStatValueByLevel } from "@/calculate";
import {
  STAR_BACKGROUND_IMAGE_CLASS,
  TWeaponDetail,
  TWeaponEntry,
  TWeaponKey,
  TWeaponTypeKey,
  WEAPON_MASTER_LIST,
} from "@/master";
import { defineComponent, computed, ref, PropType } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
  name: "WeaponSelect",
  props: {
    visible: { type: Boolean, required: true },
    weapon: { type: String as PropType<TWeaponKey>, required: true },
    weaponType: { type: String as PropType<TWeaponTypeKey>, required: true },
    weaponMaster: { type: Object as PropType<TWeaponDetail>, required: true },
    ascension: { type: Number, required: true },
    level: { type: Number, required: true },
  },
  emits: ["update:weapon"],
  setup(props, context) {
    const { displayName, displayStatValue } = CompositionFunction();

    const bgImageClass = (item: TWeaponEntry) =>
      (" " + STAR_BACKGROUND_IMAGE_CLASS[item.レアリティ]) as string;
    const selectedClass = (item: TWeaponEntry) => {
      return item.key == props.weapon ? " selected" : "";
    };
    const weaponRef = ref(props.weapon);
    const weaponTypeRef = ref(props.weaponType);
    const weaponMasterRef = ref(props.weaponMaster);

    const stats = computed(() => {
      const result = [] as { key: string; value: number }[];
      if (
        weaponMasterRef.value &&
        weaponMasterRef.value.ステータス &&
        props.ascension !== undefined &&
        props.level !== undefined
      ) {
        for (const statName of Object.keys(weaponMasterRef.value.ステータス)) {
          result.push({
            key: statName,
            value: getStatValueByLevel(
              weaponMasterRef.value.ステータス[statName],
              props.ascension,
              props.level
            ),
          });
        }
      }
      return result;
    });

    const filteredList = computed(() => {
      if (weaponTypeRef.value) {
        return WEAPON_MASTER_LIST[weaponTypeRef.value] as TWeaponEntry[];
      }
      const result: TWeaponEntry[] = [];
      (Object.keys(WEAPON_MASTER_LIST) as TWeaponTypeKey[]).forEach((weaponType) => {
        const list = WEAPON_MASTER_LIST[weaponType] as TWeaponEntry[];
        result.push(...list);
      });
      return result;
    });

    const updateWeapon = (key: TWeaponKey) => {
      weaponRef.value = key;
      context.emit("update:weapon", key);
    };

    return {
      displayName, displayStatValue,

      bgImageClass,
      selectedClass,
      weaponMasterRef,
      filteredList,
      updateWeapon,
      stats,
    };
  },
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

table {
  width: calc(100% - 1rem);
  margin-left: auto;
  margin-right: auto;
  border: 2px solid gray;
  border-spacing: 0;
}

th,
td {
  padding: 2px 8px;
  border: 1px solid gray;
  border-spacing: 0;
}

th.title {
  color: burlywood;
}

th.stat,
td.stat-value {
  text-align: right;
}

.description {
  text-align: left;
}
</style>
