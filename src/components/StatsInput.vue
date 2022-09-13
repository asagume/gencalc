<template>
  <fieldset>
    <table class="stats" v-if="editable">
      <template v-for="category in categoryList" :key="category">
        <tr>
          <th colspan="3">
            <label class="open-close">
              <input
                class="hidden"
                type="checkbox"
                v-model="categoryOpenClose[category]"
              />
              <span> {{ displayName(category) }} </span>
            </label>
          </th>
        </tr>
        <tr v-for="stat in visibleStatList(category)" :key="stat">
          <th>{{ displayStatAbbrev(stat) }}</th>
          <td>
            <input
              type="number"
              v-model="statAdjustments[stat]"
              @change="adjustmentsOnChange"
            />
          </td>
          <td class="stat-value">{{ displayStatValue(stat, statsObj[stat]) }}</td>
        </tr>
      </template>
      <tr>
        <td class="left">
          <label>
            <input type="checkbox" v-model="editable" />
            {{ displayName("補正値入力モード") }}
          </label>
        </td>
        <td colspan="2" class="right">
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

    <table class="two-table" v-if="!editable">
      <tr>
        <td>
          <table class="stats">
            <template v-for="category in category1List" :key="category">
              <tr>
                <th colspan="2">
                  <label class="open-close">
                    <input
                      class="hidden"
                      type="checkbox"
                      v-model="categoryOpenClose[category]"
                    />
                    <span> {{ displayName(category) }} </span>
                  </label>
                </th>
              </tr>
              <tr v-for="stat in visibleStatList(category)" :key="stat">
                <th>{{ displayStatAbbrev(stat) }}</th>
                <td class="stat-value">
                  {{ displayStatValue(stat, statsObj[stat]) }}
                </td>
              </tr>
            </template>
          </table>
        </td>
        <td>
          <table class="stats">
            <template v-for="category in category2List" :key="category">
              <tr>
                <th colspan="2">
                  <label class="open-close">
                    <input
                      class="hidden"
                      type="checkbox"
                      v-model="categoryOpenClose[category]"
                    />
                    <span> {{ displayName(category) }} </span>
                  </label>
                </th>
              </tr>
              <tr v-for="stat in visibleStatList(category)" :key="stat">
                <th>{{ displayStatAbbrev(stat) }}</th>
                <td class="stat-value">
                  {{ displayStatValue(stat, statsObj[stat]) }}
                </td>
              </tr>
            </template>
          </table>
        </td>
      </tr>
      <tr>
        <td class="left">
          <label>
            <input type="checkbox" v-model="editable" />
            {{ displayName("補正値入力モード") }}
          </label>
        </td>
      </tr>
    </table>
  </fieldset>
</template>

<script lang="ts">
import { TStatsInput, ステータスARRAY_MAP } from "@/input";
import { defineComponent, nextTick, PropType, reactive, ref } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
  name: "StatsInput1",
  props: {
    statsInput: { type: Object as PropType<TStatsInput>, required: true },
    category1List: { type: Array as PropType<Array<string>>, required: true },
    category2List: { type: Array as PropType<Array<string>>, required: true },
  },
  emits: ["update:stat-adjustments"],
  setup(props, context) {
    const { displayName, displayStatAbbrev, displayStatValue } = CompositionFunction();

    const statsInputRea = reactive(props.statsInput);

    const editable = ref(false);
    const initializable = ref(false);

    const statList = (category: string) => ステータスARRAY_MAP.get(category);
    const statsObj = statsInputRea.statsObj;
    const statAdjustments = statsInputRea.statAdjustments;

    const categoryList = [...props.category1List, ...props.category2List];

    const categoryOpenClose = ref({} as any);
    for (const category of categoryList) {
      categoryOpenClose.value[category] = false;
    }
    const visibleStatList = (category: string) =>
      statList(category)?.filter(
        (stat) =>
          categoryOpenClose.value[category] ||
          (statsInputRea.statsObj && statsInputRea.statsObj[stat])
      ) ?? [];

    /** 補正値が変更されました */
    const adjustmentsOnChange = async () => {
      await nextTick();
      context.emit("update:stat-adjustments", statsInputRea.statAdjustments);
    };

    /** 補正値を0クリアします */
    const initializeAdjustments = () => {
      for (const category of categoryList) {
        const list = statList(category);
        if (!list) continue;
        for (const stat of list) {
          statsInputRea.statAdjustments[stat] = 0;
        }
      }
      adjustmentsOnChange();
    };
    initializeAdjustments();

    return {
      displayName,
      displayStatAbbrev,
      displayStatValue,

      categoryList,
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
  margin-left: 15px;
}

table.two-table {
  width: 100%;
  table-layout: fixed;
  border: none;
  border-spacing: 0;
}

table.two-table td {
  vertical-align: top;
}

table.stats {
  width: 100%;
  margin: 1px auto;
  table-layout: fixed;
  border-spacing: 1px;
  border-collapse: collapse;
}

table.stats tr {
  border-bottom: 1px solid gray;
}

table.stats th,
table.stats td {
  text-align: right;
  white-space: nowrap;
  padding-right: 4px;
  line-height: 3.3rem;
}

table.stats th {
  color: #df8f37;
}

table.stats th[colspan="2"],
table.stats th[colspan="3"] {
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
