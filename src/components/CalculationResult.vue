<template>
  <div class="elemental-reaction">
    <input id="増幅反応-なし" type="radio" v-model="増幅反応" value="なし" name="増幅反応-name" />
    <label for="増幅反応-なし">
      {{ displayName("反応なし") }}
    </label>
    <input id="増幅反応-蒸発" type="radio" v-model="増幅反応" value="蒸発" name="増幅反応-name" />
    <label for="増幅反応-蒸発" v-if="元素反応.蒸発倍率" :class="elementClass(元素反応.元素)">
      {{ displayName("蒸発") }} * {{ Math.round(元素反応.蒸発倍率 * 100) / 100 }}
    </label>
    <input id="増幅反応-溶解" type="radio" v-model="増幅反応" value="溶解" name="増幅反応-name" />
    <label for="増幅反応-溶解" v-if="元素反応.溶解倍率" :class="elementClass(元素反応.元素)">
      {{ displayName("溶解") }} * {{ Math.round(元素反応.溶解倍率 * 100) / 100 }}
    </label>
    <span></span>
    <label v-if="元素反応.過負荷ダメージ" class="pyro">
      {{ displayName("過負荷") }} {{ Math.round(元素反応.過負荷ダメージ) }}
    </label>
    <label v-if="元素反応.感電ダメージ" class="electro">
      {{ displayName("感電") }} {{ Math.round(元素反応.感電ダメージ) }}
    </label>
    <label v-if="元素反応.超電導ダメージ" class="cryo">
      {{ displayName("超電導") }} {{ Math.round(元素反応.超電導ダメージ) }}
    </label>
    <label v-if="元素反応.拡散ダメージ" :class="elementClass(元素反応.拡散元素)">
      {{ displayName("拡散") }} {{ Math.round(元素反応.拡散ダメージ) }}
    </label>
    <label v-if="元素反応.結晶吸収量" :class="elementClass(元素反応.結晶元素)">
      {{ displayName("結晶") }} {{ Math.round(元素反応.結晶吸収量) }}
    </label>
    <label v-if="元素反応.燃焼ダメージ" class="pyro">
      {{ displayName("燃焼") }} {{ Math.round(元素反応.燃焼ダメージ) }}
    </label>
    <label v-if="元素反応.開花ダメージ">
      {{ displayName("開花") }} {{ Math.round(元素反応.開花ダメージ) }}
    </label>
    <label v-if="元素反応.激化ダメージ">
      {{ displayName("激化") }} {{ Math.round(元素反応.激化ダメージ) }}
    </label>
  </div>
  <template v-for="category in CATEGORY_LIST">
    <table class="result" v-if="calculationResultObj[category] && calculationResultObj[category].length > 0"
      :key="category">
      <thead>
        <tr>
          <th>{{ displayName(category) }}</th>
          <th>{{ displayName("期待値") }}</th>
          <th>{{ displayName("会心") }}</th>
          <th>{{ displayName("非会心") }}</th>
        </tr>
      </thead>
      <tr v-for="item in itemList(category)" :key="item[0]">
        <th>{{ displayName(item[0]) }}</th>
        <td :class="elementClass(item[1])">{{ displayDamageValue(item[2]) }}</td>
        <td :class="elementClass(item[1])">{{ displayDamageValue(item[3]) }}</td>
        <td :class="elementClass(item[1])">{{ displayDamageValue(item[4]) }}</td>
      </tr>
    </table>
  </template>
</template>
<script lang="ts">
import GlobalMixin from '@/GlobalMixin.vue';
import { 元素反応TEMPLATE } from "@/input";
import { ELEMENT_COLOR_CLASS, TElementColorClassKey } from "@/master";
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "CalculationResult",
  mixins: [GlobalMixin],
  props: {
    resultObj: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const 元素反応 = props.resultObj?.元素反応 ?? 元素反応TEMPLATE;
    const 増幅反応 = ref("なし");
    const elementClass = (item: string) =>
      ELEMENT_COLOR_CLASS[item as TElementColorClassKey];
    const calculationResultObj = props.resultObj ?? {};

    const displayDamageValue = (value: number) => {
      if (!value) return "-";
      if (value < 10) value = Math.round(value * 100) / 100;
      else if (value < 100) value = Math.round(value * 10) / 10;
      else value = Math.round(value);
      return value;
    };

    console.log(元素反応);

    const CATEGORY_LIST = [
      "通常攻撃",
      "重撃",
      "落下攻撃",
      "元素スキル",
      "元素爆発",
      "その他",
    ];
    const itemList = (category: string) => {
      return calculationResultObj[category].filter(
        (s: any[]) => !s[0].startsWith("非表示")
      );
    };

    return {
      元素反応,
      増幅反応,
      elementClass,
      displayDamageValue,
      CATEGORY_LIST,
      itemList,
      calculationResultObj,
    };
  },
});
</script>
