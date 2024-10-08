<template>
  <div v-if="visible">
    <table>
      <thead>
        <tr>
          <th class="title">{{ displayName(weaponMaster.名前) }}</th>
          <th class="stat">{{ displayName("基礎攻撃力") }}</th>
          <td class="stat-value">{{ displayStatValue("基礎攻撃力", stats[0].value) }}</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <img v-for="i in Array.from({ length: weaponMaster.レアリティ }, (_, i) => i)" class="star" src="images/star.png"
              alt="star" :key="i" />
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
        <template v-if="weaponMaster.武器スキル">
          <tr>
            <th class="title" colspan="3">{{ weaponMaster.武器スキル.名前 }}</th>
          </tr>
          <tr>
            <td colspan="3" class="description" v-html="weaponMaster.武器スキル.説明"></td>
          </tr>
        </template>
      </tbody>
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
import { defineComponent, computed, ref, PropType, nextTick } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
  name: "WeaponSelect",
  props: {
    visible: { type: Boolean, required: true },
    weapon: { type: String as PropType<TWeaponKey>, required: true },
    weaponType: { type: String as PropType<TWeaponTypeKey> },
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

    const stats = computed(() => {
      const result = [] as { key: string; value: number }[];
      if (
        props.weaponMaster &&
        props.weaponMaster.ステータス &&
        props.ascension !== undefined &&
        props.level !== undefined
      ) {
        for (const statName of Object.keys(props.weaponMaster.ステータス)) {
          result.push({
            key: statName,
            value: getStatValueByLevel(
              props.weaponMaster.ステータス[statName],
              props.ascension,
              props.level
            ),
          });
        }
      }
      return result;
    });

    const filteredList = computed(() => {
      if (props.weaponType) {
        return WEAPON_MASTER_LIST[props.weaponType] as TWeaponEntry[];
      }
      const result: TWeaponEntry[] = [];
      (Object.keys(WEAPON_MASTER_LIST) as TWeaponTypeKey[]).forEach((weaponType) => {
        const list = WEAPON_MASTER_LIST[weaponType] as TWeaponEntry[];
        result.push(...list);
      });
      return result;
    });

    const updateWeapon = async (key: TWeaponKey) => {
      weaponRef.value = key;
      await nextTick();
      context.emit("update:weapon", key);
    };

    return {
      displayName,
      displayStatValue,

      bgImageClass,
      selectedClass,
      filteredList,
      updateWeapon,
      stats,
    };
  },
});
</script>

<style scoped>
img.weapon {
  width: 60px;
  height: 60px;
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
