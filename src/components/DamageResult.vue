<template>
  <div class="elemental-reaction">
    <input
      id="増幅反応-なし"
      type="radio"
      value="なし"
      name="増幅反応-name"
      @change="増幅反応 = 'なし'"
      checked
    />
    <label for="増幅反応-なし"> {{ displayName("反応なし") }} </label>
    <template v-if="damageResult.元素反応.蒸発倍率">
      <input
        id="増幅反応-蒸発"
        type="radio"
        value="蒸発"
        name="増幅反応-name"
        @change="増幅反応 = '蒸発'"
      />
      <label for="増幅反応-蒸発">
        {{ displayName("蒸発") }}×<span>{{
          Math.round(damageResult.元素反応.蒸発倍率 * 100) / 100
        }}</span>
      </label>
    </template>
    <template v-if="damageResult.元素反応.溶解倍率">
      <input
        id="増幅反応-溶解"
        type="radio"
        value="溶解"
        name="増幅反応-name"
        @change="増幅反応 = '溶解'"
      />
      <label for="増幅反応-溶解">
        {{ displayName("溶解") }}×<span>{{
          Math.round(damageResult.元素反応.溶解倍率 * 100) / 100
        }}</span>
      </label>
    </template>
    <template v-if="damageResult.元素反応.超激化ダメージ">
      <input
        id="増幅反応-超激化"
        type="radio"
        value="超激化"
        name="増幅反応-name"
        @change="増幅反応 = '超激化'"
      />
      <label for="増幅反応-超激化">
        {{ displayName("超激化") }}
        <span>{{ Math.round(damageResult.元素反応.超激化ダメージ) }}</span>
      </label>
    </template>
    <template v-if="damageResult.元素反応.草激化ダメージ">
      <input
        id="増幅反応-草激化"
        type="radio"
        value="草激化"
        name="増幅反応-name"
        @change="増幅反応 = '草激化'"
      />
      <label for="増幅反応-草激化">
        {{ displayName("草激化") }}
        <span>{{ Math.round(damageResult.元素反応.草激化ダメージ) }}</span>
      </label>
    </template>
    <label v-if="damageResult.元素反応.過負荷ダメージ" class="pyro">
      {{ displayName("過負荷") }}
      <span>{{ Math.round(damageResult.元素反応.過負荷ダメージ) }}</span>
    </label>
    <label v-if="damageResult.元素反応.感電ダメージ" class="electro">
      {{ displayName("感電") }}
      <span>{{ Math.round(damageResult.元素反応.感電ダメージ) }}</span>
    </label>
    <label v-if="damageResult.元素反応.超電導ダメージ" class="cryo">
      {{ displayName("超電導") }}
      <span>{{ Math.round(damageResult.元素反応.超電導ダメージ) }}</span>
    </label>
    <label
      v-if="damageResult.元素反応.拡散ダメージ"
      :class="elementClass(元素反応.拡散元素)"
    >
      {{ displayName("拡散") }}
      <span>{{ Math.round(damageResult.元素反応.拡散ダメージ) }}</span>
    </label>
    <label v-if="damageResult.元素反応.結晶吸収量">
      {{ displayName("結晶") }}
      <span>{{ Math.round(damageResult.元素反応.結晶吸収量) }}</span>
    </label>
    <label v-if="damageResult.元素反応.燃焼ダメージ" class="pyro">
      {{ displayName("燃焼") }}
      <span>{{ Math.round(damageResult.元素反応.燃焼ダメージ) }}</span>
    </label>
    <label v-if="damageResult.元素反応.開花ダメージ" class="dendro">
      {{ displayName("開花") }}
      <span>{{ Math.round(damageResult.元素反応.開花ダメージ) }}</span>
    </label>
    <label v-if="damageResult.元素反応.烈開花ダメージ" class="dendro">
      {{ displayName("烈開花") }}
      <span>{{ Math.round(damageResult.元素反応.烈開花ダメージ) }}</span>
    </label>
    <label v-if="damageResult.元素反応.超開花ダメージ" class="dendro">
      {{ displayName("超開花") }}
      <span>{{ Math.round(damageResult.元素反応.超開花ダメージ) }}</span>
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
            <th v-if="item[item.length - 1]" :rowspan="item[item.length - 1]">
              {{ displayNameV(item[0]) }}
            </th>
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
              <th v-if="item[item.length - 1]" :colspan="item[item.length - 1]">
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
      <td class="damage-value" v-for="item in damageTakenList" :key="item.key">
        <span :class="elementClass(item.key)">
          {{ Math.round(item.value) }}
        </span>
      </td>
    </tr>
    <tr>
      <th>{{ displayName("耐久スコア") }}</th>
      <td class="damage-value" v-for="item in resScoreList" :key="item.key">
        <span :class="elementClass(item.key)">
          {{ Math.round(item.value) }}
        </span>
      </td>
    </tr>
  </table>
  <div v-if="damageResult.キャラクター注釈.length > 0">
    <ul class="notes">
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
import { computed, defineComponent, reactive, ref, watch } from "vue";
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

    watch(元素反応, () => {
      if (
        (増幅反応.value == "蒸発" && 元素反応.蒸発倍率 == 0) ||
        (増幅反応.value == "溶解" && 元素反応.溶解倍率 == 0) ||
        (増幅反応.value == "超激化" && 元素反応.超激化ダメージ == 0) ||
        (増幅反応.value == "草激化" && 元素反応.草激化ダメージ == 0)
      ) {
        増幅反応.value = "なし";
        (document.getElementById("増幅反応-なし") as HTMLInputElement).checked = true;
      }
    });

    const displayDamageValue = (item: any, index: number) => {
      let value = item[index];
      if (!value) return "-";
      if (!["シールド"].includes(item[5])) {
        if (増幅反応.value == "蒸発" && ["炎", "水"].includes(item[1])) {
          value *= 元素反応.蒸発倍率;
        } else if (増幅反応.value == "溶解" && ["炎", "氷"].includes(item[1])) {
          value *= 元素反応.溶解倍率;
        } else if (増幅反応.value == "超激化" && ["雷"].includes(item[1])) {
          let addValue = 元素反応.超激化ダメージ;
          // if (item[6]) addValue *= item[6]; // HIT数 ※天賦倍率に+や*が含まれる攻撃で元素付着CDなしのものはない気がするのでコメントアウトします
          if (item[7]) addValue *= item[7]; // ダメージバフ補正
          if (item[8]) addValue *= item[8]; // 敵の防御補正
          addValue *= item[index] / item[4]; // 2:期待値/3:会心/4:非会心
          value += addValue;
        } else if (増幅反応.value == "草激化" && ["草"].includes(item[1])) {
          let addValue = 元素反応.草激化ダメージ;
          // if (item[6]) addValue *= item[6]; // HIT数 ※天賦倍率に+や*が含まれる攻撃で元素付着CDなしのものはない気がするのでコメントアウトします
          if (item[7]) addValue *= item[7]; // ダメージバフ補正
          if (item[8]) addValue *= item[8]; // 敵の防御補正
          addValue *= item[index] / item[4]; // 2:期待値/3:会心/4:非会心
          value += addValue;
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
      if (item[item.length - 1] > 1) {
        for (let i = 1; i < item[item.length - 1]; i++) {
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
      if (key && i18n.global.locale.value == "ja-jp" && key.length > 10) {
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
      for (const entry of props.damageResult.被ダメージ.filter(
        (s: any) => s.key != "物理"
      )) {
        const valueArr = result.map((s: any) => s.value);
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
      for (const entry of props.damageResult.耐久スコア.filter(
        (s: any) => s.key != "物理"
      )) {
        const valueArr = result.map((s: any) => s.value);
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
.elemental-reaction {
  margin-top: 5px;
  margin-bottom: 5px;
}

.elemental-reaction label {
  margin-top: 2px;
  margin-bottom: 2px;
}

.elemental-reaction [type="radio"] + label {
  background-color: black;
}

.elemental-reaction label span {
  white-space: nowrap;
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

ul.notes {
  list-style-type: none;
  text-align: left;
}
</style>
