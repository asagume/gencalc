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
          <input type="number" v-model="statsAdjustments[stat]" @change="adjustmentsOnChange" />
        </td>
        <td>{{ displayStatValue(stat, statValue(stat)) }}</td>
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
import GlobalMixin from "@/GlobalMixin.vue";
import { TStats, ステータスARRAY_MAP } from "@/input";
import { defineComponent, PropType, reactive, ref } from "vue";

export default defineComponent({
  name: "StatsInput",
  mixins: [GlobalMixin],
  props: {
    statsObj: { type: Object as PropType<TStats>, require: true },
    categoryList: { type: Array as PropType<Array<string>>, require: true },
  },
  emits: ["update:stat-adjustments"],
  setup(props, context) {
    const editable = ref(false);
    const initializable = ref(false);

    const statList = (category: string) => ステータスARRAY_MAP.get(category);
    const statsAdjustments = reactive({} as any);
    if (props.categoryList) {
      for (const category of props.categoryList) {
        const workList = statList(category);
        if (!workList) continue;
        for (const stat of workList) {
          statsAdjustments[stat] = 0;
        }
      }
    }

    const categoryOpenClose = ref({} as any);
    if (props.categoryList) {
      for (const category of props.categoryList) {
        categoryOpenClose.value[category] = false;
      }
    }
    const visibleStatList = (category: string) =>
      statList(category)?.filter(
        (stat) =>
          categoryOpenClose.value[category] || (props.statsObj && props.statsObj[stat])
      ) ?? [];
    const statValue = (stat: string) => (props.statsObj ? props.statsObj[stat] : 0);

    //
    const adjustmentsOnChange = () => {
      context.emit("update:stat-adjustments", statsAdjustments);
      console.log(statsAdjustments);
    };

    // 補正値を0クリアします
    const initializeAdjustments = () => {
      if (!props.categoryList) return;
      for (const category of props.categoryList) {
        const list = statList(category);
        if (!list) continue;
        for (const stat of list) {
          statsAdjustments[stat] = 0;
        }
      }
    };
    initializeAdjustments();

    return {
      statList,
      visibleStatList,
      statValue,
      categoryOpenClose,

      statsAdjustments,
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
</style>
