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
          <img
            v-for="i in Array.from({ length: weaponMasterRef.レアリティ }, (_, i) => i)"
            class="star"
            src="../../public/images/star.png"
            alt="star"
            :key="i"
          />
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
          <td
            colspan="3"
            class="description"
            v-html="weaponMasterRef.武器スキル.説明"
          ></td>
        </tr>
      </template>
    </table>

    <ul class="select-list">
      <li class="icon" v-for="item in filteredList" :key="item.key">
        <img
          :class="'weapon' + bgImageClass(item) + selectedClass(item)"
          :src="item.icon_url"
          :alt="item.key"
          @click="updateWeapon(item.key)"
        />
        <div class="tooltip">{{ displayName(item.key) }}</div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { getPropertyValueByLevel, getStatValueByLevel } from "@/calculate";
import { deepcopy } from "@/common";
import GlobalMixin from "@/GlobalMixin.vue";
import {
  getWeaponMasterDetail,
  STAR_BACKGROUND_IMAGE_CLASS,
  TWeaponEntry,
  TWeaponKey,
  TWeaponTypeKey,
  WEAPON_DETAIL_TEMPLATE,
  WEAPON_MASTER_LIST,
} from "@/master";
import { defineComponent, computed, ref, PropType, watch } from "vue";

export default defineComponent({
  name: "WeaponSelect",
  mixins: [GlobalMixin],
  props: {
    visible: { type: Boolean, require: true },
    weapon: { type: String as PropType<TWeaponKey>, require: true },
    weaponType: { type: String as PropType<TWeaponTypeKey>, require: true },
    ascension: { type: Number, require: true },
    level: { type: Number, require: true },
  },
  emits: ["update:weapon"],
  setup(props, context) {
    const bgImageClass = (item: TWeaponEntry) =>
      (" " + STAR_BACKGROUND_IMAGE_CLASS[item.レアリティ]) as string;
    const selectedClass = (item: TWeaponEntry) => {
      return item.key == props.weapon ? " selected" : "";
    };
    const weaponRef = ref(props.weapon ?? "西風猟弓");
    const weaponMasterRef = ref(deepcopy(WEAPON_DETAIL_TEMPLATE));

    const setupWeaponMaster = () => {
      if (weaponRef.value && props.weaponType) {
        getWeaponMasterDetail(weaponRef.value, props.weaponType).then((ret) => {
          weaponMasterRef.value = ret;
        });
      }
    };
    setupWeaponMaster();

    const stats = computed(() => {
      const result = [] as any;
      if (
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

    let weaponType = ref(props.weaponType as TWeaponTypeKey);
    const filteredList = computed(() => {
      if (weaponType.value) {
        return WEAPON_MASTER_LIST[weaponType.value] as TWeaponEntry[];
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

    watch(weaponRef, () => {
      setupWeaponMaster();
    });

    return {
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
