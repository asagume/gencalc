<template>
  <table>
    <template v-for="category in categoryList" :key="category">
      <tr>
        <th :colspan="editable ? 3 : 2">
          <label class="open-close">
            <input class="hidden" type="checkbox" v-model="categoryOpenClose[category]" />
            <span> {{ displayName(category) }} </span>
          </label>
        </th>
      </tr>
      <tr v-for="stat in visibleStatList(category)" :key="stat">
        <th>{{ displayName(stat) }}</th>
        <td v-if="editable">
          <input type="number" v-model="statAdjustments[stat]" @change="adjustmentsOnChange" />
        </td>
        <td class="stat-value">{{ displayStatValue(stat, statsObj[stat]) }}</td>
      </tr>
    </template>
    <tr>
      <td>
        <label>
          <input type="checkbox" v-model="editable" />
          {{ displayName("補正値入力モード") }}
        </label>
      </td>
      <td :colspan="editable ? 2 : 1">
        <label>
          <input type="checkbox" v-model="initializable" />
          {{ displayName("補正値0初期化") }}
        </label>
        <button type="button" :disabled="!initializable" @click="initializeAdjustments">
          {{ displayName("実行") }}
        </button>
      </td>
    </tr>
  </table>
</template>

<script lang="ts">
import { TStatsInput, ステータスARRAY_MAP } from "@/input";
import { defineComponent, PropType, reactive, ref } from "vue";
import CompositionFunction from './CompositionFunction.vue';

export default defineComponent({
  name: "StatsInput",
  props: {
    statsInput: { type: Object as PropType<TStatsInput>, required: true },
    categoryList: { type: Array as PropType<Array<string>>, required: true },
  },
  emits: ["update:stat-adjustments"],
  setup(props, context) {
    const { displayName, displayStatValue } = CompositionFunction();

    const statsInputRea = reactive(props.statsInput);

    const editable = ref(false);
    const initializable = ref(false);

    const statList = (category: string) => ステータスARRAY_MAP.get(category);
    const statsObj = statsInputRea.statsObj;
    const statAdjustments = statsInputRea.statAdjustments;

    const categoryOpenClose = ref({} as any);
    if (props.categoryList) {
      for (const category of props.categoryList) {
        categoryOpenClose.value[category] = false;
      }
    }
    const visibleStatList = (category: string) =>
      statList(category)?.filter(
        (stat) =>
          categoryOpenClose.value[category] ||
          (statsInputRea.statsObj && statsInputRea.statsObj[stat])
      ) ?? [];

    //
    const adjustmentsOnChange = () => {
      console.log(statsInputRea.statAdjustments);
      context.emit("update:stat-adjustments", statsInputRea.statAdjustments);
    };

    // 補正値を0クリアします
    const initializeAdjustments = () => {
      if (!props.categoryList) return;
      for (const category of props.categoryList) {
        const list = statList(category);
        if (!list) continue;
        for (const stat of list) {
          statsInputRea.statAdjustments[stat] = 0;
        }
      }
    };
    initializeAdjustments();

    return {
      displayName, displayStatValue,

      statList,
      visibleStatList,
      statsObj,
      statAdjustments,
      categoryOpenClose,

      adjustmentsOnChange,
      editable,
      initializable,
      initializeAdjustments,
    };
  },
});
</script>

<style scoped>
label {
  display: inline-block;
}

table {
  width: 100%;
  table-layout: fixed;
  border-top: 2px solid gray;
  margin-top: 10px;
}

th,
td {
  text-align: right;
  white-space: nowrap;
  border-bottom: 2px solid gray;
  padding-right: 4px;
}

th {
  color: #df8f37;
}

th[colspan="2"],
th[colspan="3"] {
  text-align: center;
  color: #e8d14e;
  background-color: #333;
}

input[type="number"] {
  width: calc(100% - 6px);
}

button {
  width: 10rem;
}

.stat-value {
  padding-right: 1rem;
}
</style>
