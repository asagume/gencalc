<template>
  <div class="elemental-reaction">
    <input
      id="増幅反応-なし"
      type="radio"
      v-model="増幅反応"
      value="なし"
      name="増幅反応-name"
    />
    <label for="増幅反応-なし">
      {{ displayName("反応なし") }}
    </label>
    <input
      id="増幅反応-蒸発"
      type="radio"
      v-model="増幅反応"
      value="蒸発"
      name="増幅反応-name"
    />
    <label for="増幅反応-蒸発" v-if="damageResult.元素反応.蒸発倍率">
      {{ displayName("蒸発") }}×{{
        Math.round(damageResult.元素反応.蒸発倍率 * 100) / 100
      }}
    </label>
    <input
      id="増幅反応-溶解"
      type="radio"
      v-model="増幅反応"
      value="溶解"
      name="増幅反応-name"
    />
    <label for="増幅反応-溶解" v-if="damageResult.元素反応.溶解倍率">
      {{ displayName("溶解") }}×{{
        Math.round(damageResult.元素反応.溶解倍率 * 100) / 100
      }}
    </label>
    <span></span>
    <label v-if="damageResult.元素反応.過負荷ダメージ" class="pyro">
      {{ displayName("過負荷") }}
      {{ Math.round(damageResult.元素反応.過負荷ダメージ) }}
    </label>
    <label v-if="damageResult.元素反応.感電ダメージ" class="electro">
      {{ displayName("感電") }} {{ Math.round(damageResult.元素反応.感電ダメージ) }}
    </label>
    <label v-if="damageResult.元素反応.超電導ダメージ" class="cryo">
      {{ displayName("超電導") }}
      {{ Math.round(damageResult.元素反応.超電導ダメージ) }}
    </label>
    <label
      v-if="damageResult.元素反応.拡散ダメージ"
      :class="elementClass(元素反応.拡散元素)"
    >
      {{ displayName("拡散") }} {{ Math.round(damageResult.元素反応.拡散ダメージ) }}
    </label>
    <label
      v-if="damageResult.元素反応.結晶吸収量"
      :class="elementClass(damageResult.元素反応.結晶元素)"
    >
      {{ displayName("結晶") }} {{ Math.round(damageResult.元素反応.結晶吸収量) }}
    </label>
    <label v-if="damageResult.元素反応.燃焼ダメージ" class="pyro">
      {{ displayName("燃焼") }} {{ Math.round(damageResult.元素反応.燃焼ダメージ) }}
    </label>
    <label v-if="damageResult.元素反応.開花ダメージ" class="dendro">
      {{ displayName("開花") }} {{ Math.round(damageResult.元素反応.開花ダメージ) }}
    </label>
    <label v-if="damageResult.元素反応.烈開花ダメージ" class="dendro">
      {{ displayName("烈開花") }} {{ Math.round(damageResult.元素反応.烈開花ダメージ) }}
    </label>
    <label v-if="damageResult.元素反応.ヴァインショットダメージ" class="dendro">
      {{ displayName("ヴァインショット") }}
      {{ Math.round(damageResult.元素反応.ヴァインショットダメージ) }}
    </label>
    <label v-if="damageResult.元素反応.超激化ダメージ" class="dendro">
      {{ displayName("超激化") }} {{ Math.round(damageResult.元素反応.超激化ダメージ) }}
    </label>
    <label v-if="damageResult.元素反応.草激化ダメージ" class="dendro">
      {{ displayName("草激化") }} {{ Math.round(damageResult.元素反応.草激化ダメージ) }}
    </label>
  </div>
  <template v-for="category in CATEGORY_LIST" :key="category">
    <template v-if="damageResult[category] && damageResult[category].length > 0">
      <table v-if="resultStyleRef == '1'" class="result v-style">
        <thead>
          <tr @click="categoryOnClick(category)">
            <th>{{ displayName(category) }}</th>
            <th>{{ displayName("期待値") }}</th>
            <th>{{ displayName("会心") }}</th>
            <th>{{ displayName("非会心") }}</th>
          </tr>
        </thead>
        <template v-if="categoryOpenClose[category]">
          <tr v-for="item in itemList(category)" :key="item[0]">
            <th v-if="item[6]" :rowspan="item[6]">{{ displayNameV(item[0]) }}</th>
            <td :class="'damage-value ' + elementClass(item[1])">
              {{ displayDamageValue(item, 2) }}
            </td>
            <td :class="'damage-value ' + elementClass(item[1])">
              {{ displayDamageValue(item, 3) }}
            </td>
            <td :class="'damage-value ' + elementClass(item[1])">
              {{ displayDamageValue(item, 4) }}
            </td>
          </tr>
        </template>
      </table>
      <table v-if="resultStyleRef == '0'" class="result h-style">
        <thead>
          <tr @click="categoryOnClick(category)">
            <th>{{ displayName(category) }}</th>
            <template v-for="item in itemList(category)" :key="item[0]">
              <th v-if="item[6]" :colspan="item[6]">
                {{ displayNameH(item[0], category) }}
              </th>
            </template>
          </tr>
        </thead>
        <tr>
          <th>{{ displayName("期待値") }}</th>
          <td
            v-for="item in itemList(category)"
            :key="item[0]"
            :class="'damage-value ' + elementClass(item[1])"
          >
            {{ displayDamageValue(item, 2) }}
          </td>
        </tr>
        <template v-if="categoryOpenClose[category]">
          <tr>
            <th>{{ displayName("会心") }}</th>
            <td
              v-for="item in itemList(category)"
              :key="item[0]"
              :class="'damage-value ' + elementClass(item[1])"
            >
              {{ displayDamageValue(item, 3) }}
            </td>
          </tr>
          <tr>
            <th>{{ displayName("非会心") }}</th>
            <td
              v-for="item in itemList(category)"
              :key="item[0]"
              :class="'damage-value ' + elementClass(item[1])"
            >
              {{ displayDamageValue(item, 4) }}
            </td>
          </tr>
        </template>
      </table>
    </template>
  </template>
  <table class="result">
    <tr>
      <th>{{ displayName("被ダメージ") }}</th>
      <td v-for="item in damageTakenList" :key="item.key">
        <span :class="elementClass(item.key)">
          {{ Math.round(item.value) }}
        </span>
      </td>
    </tr>
    <tr>
      <th>{{ displayName("耐久スコア") }}</th>
      <td v-for="item in resScoreList" :key="item.key">
        <span :class="elementClass(item.key)">
          {{ Math.round(item.value) }}
        </span>
      </td>
    </tr>
  </table>
  <div v-if="damageResult.キャラクター注釈.length > 0">
    <ul>
      <li v-for="(item, index) in damageResult.キャラクター注釈" :key="index">
        {{ item }}
      </li>
    </ul>
  </div>
  <div class="right">
    <label>
      <select v-model="resultStyleRef">
        <option value="1">V-style</option>
        <option value="0">H-style</option>
      </select>
    </label>
  </div>
</template>
<script lang="ts">
import i18n from "@/i18n";
import { ELEMENT_COLOR_CLASS, TElementColorClassKey } from "@/master";
import { computed, defineComponent, reactive, ref } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
  name: "DamageResult",
  props: {
    damageResult: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { displayName } = CompositionFunction();

    const 元素反応 = reactive(props.damageResult.元素反応);
    const 増幅反応 = ref("なし");
    const elementClass = (item: string) =>
      ELEMENT_COLOR_CLASS[item as TElementColorClassKey];
    const resultStyleRef = ref("1");

    const displayDamageValue = (item: any, index: number) => {
      let value = item[index];
      if (!value) return "-";
      if (!["シールド"].includes(item[5])) {
        if (増幅反応.value == "蒸発" && ["炎", "水", "氷"].includes(item[1])) {
          value *= 元素反応.蒸発倍率;
        } else if (増幅反応.value == "溶解" && ["炎", "水", "氷"].includes(item[1])) {
          value *= 元素反応.溶解倍率;
        }
      }
      if (value < 10) value = Math.round(value * 100) / 100;
      else if (value < 100) value = Math.round(value * 10) / 10;
      else value = Math.round(value);
      return value;
    };

    const CATEGORY_LIST = [
      "通常攻撃",
      "重撃",
      "落下攻撃",
      "元素スキル",
      "元素爆発",
      "その他",
    ];
    const itemList = (category: string) => {
      const result = [] as any[];
      const workList = props.damageResult[category].filter(
        (s: any[]) => !s[0].startsWith("非表示")
      );
      for (let i = 0; i < workList.length; i++) {
        let span = 1;
        if (i > 0 && workList[i][0] == workList[i - 1][0]) span = 0;
        else {
          span = workList.slice(i).filter((s: any) => s[0] == workList[i][0]).length;
        }
        result.push([...workList[i], span]);
      }
      return result;
    };
    const displayDamageValueH = (
      category: string,
      itemIndex: number,
      damageIndex: number
    ) => {
      const item = itemList(category)[itemIndex];
      let result = displayDamageValue(item, damageIndex);
      if (item[6] > 1) {
        for (let i = 1; i < item[6]; i++) {
          result +=
            "/" + displayDamageValue(itemList(category)[itemIndex + i], damageIndex);
        }
      }
      return result;
    };

    const categoryOpenClose = reactive({} as { [key: string]: boolean });
    for (const key of CATEGORY_LIST) {
      if (["落下攻撃"].includes(key)) categoryOpenClose[key] = false;
      else categoryOpenClose[key] = true;
    }

    const categoryOnClick = (category: string) => {
      categoryOpenClose[category] = !categoryOpenClose[category];
    };

    const displayNameV = (key: any): string => {
      if (key && i18n.global.locale.value == "ja-jp" && key.length > 9) {
        let work = key;
        work = work.replace(/のダメージ$/, "").replace(/ダメージ$/, "");
        return work;
      }
      return displayName(key);
    };

    const displayNameH = (key: any, category: string): string => {
      if (key && i18n.global.locale.value == "ja-jp" && itemList(category).length > 2) {
        let work = key;
        work = work.replace(/のダメージ$/, "").replace(/ダメージ$/, "");
        return work;
      }
      return displayName(key);
    };

    /** 被ダメージのリストを作成します（同値を省略したリスト） */
    const damageTakenList = computed(() => {
      const result = props.damageResult.被ダメージ.filter(
        (s: any) => s.key == "物理"
      ) as any;
      const valueArr = result.map((s: any) => s.value);
      for (const entry of props.damageResult.被ダメージ.filter(
        (s: any) => s.key != "物理"
      )) {
        if (!valueArr.includes(entry.value)) {
          result.push(entry);
        }
      }
      return result;
    });

    /** 耐久スコアのリストを作成します（同値を省略したリスト） */
    const resScoreList = computed(() => {
      const result = props.damageResult.耐久スコア.filter(
        (s: any) => s.key == "物理"
      ) as any;
      const valueArr = result.map((s: any) => s.value);
      for (const entry of props.damageResult.耐久スコア.filter(
        (s: any) => s.key != "物理"
      )) {
        if (!valueArr.includes(entry.value)) {
          result.push(entry);
        }
      }
      return result;
    });

    return {
      displayName,
      displayNameV,
      displayNameH,

      元素反応,
      増幅反応,
      elementClass,
      displayDamageValue,
      CATEGORY_LIST,
      itemList,
      categoryOpenClose,
      categoryOnClick,
      displayDamageValueH,
      resultStyleRef,

      damageTakenList,
      resScoreList,
    };
  },
});
</script>
<style scoped>
.elemental-reaction [type="radio"] + label {
  background-color: black;
}

table.result.h-style th {
  white-space: normal;
  text-align: center;
}

table.result.h-style td {
  text-align: center;
}

table.result.h-style th:first-child {
  width: 13rem;
  text-align: right;
}

table.result.h-style thead th:first-child {
  text-align: left;
  padding-left: 1rem;
}

.right {
  text-align: right;
  margin: 1rem;
}
</style>
