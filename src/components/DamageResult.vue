<template>
  <div class="elemental-reaction">
    <input id="増幅反応-なし" type="radio" value="なし" name="増幅反応-name" @change="増幅反応 = 'なし'" checked />
    <label for="増幅反応-なし"> {{ displayName("反応なし") }} </label>
    <template v-if="damageResult.元素反応.蒸発倍率_炎">
      <input id="増幅反応-蒸発_炎" type="radio" value="蒸発_炎" name="増幅反応-name" @change="増幅反応 = '蒸発_炎'" />
      <label for="増幅反応-蒸発_炎" class="pyro">
        {{ displayName("蒸発") }}×<span>{{
          Math.round(damageResult.元素反応.蒸発倍率_炎 * 100) / 100
        }}</span>
        <span class="savepoint" v-if="copiedDamageResult?.元素反応?.蒸発倍率_炎">
          <br />
          {{ displayName("蒸発") }}×<span>{{
            Math.round(copiedDamageResult.元素反応.蒸発倍率_炎 * 100) / 100
          }}</span>
        </span>
      </label>
    </template>
    <template v-if="damageResult.元素反応.蒸発倍率_水">
      <input id="増幅反応-蒸発_水" type="radio" value="蒸発_水" name="増幅反応-name" @change="増幅反応 = '蒸発_水'" />
      <label for="増幅反応-蒸発_水" class="hydro">
        {{ displayName("蒸発") }}×<span>{{
          Math.round(damageResult.元素反応.蒸発倍率_水 * 100) / 100
        }}</span>
        <span class="savepoint" v-if="copiedDamageResult?.元素反応?.蒸発倍率_水">
          <br />
          {{ displayName("蒸発") }}×<span>{{
            Math.round(copiedDamageResult.元素反応.蒸発倍率_水 * 100) / 100
          }}</span>
        </span>
      </label>
    </template>
    <template v-if="damageResult.元素反応.溶解倍率_氷">
      <input id="増幅反応-溶解_氷" type="radio" value="溶解_氷" name="増幅反応-name" @change="増幅反応 = '溶解_氷'" />
      <label for="増幅反応-溶解_氷" class="cryo">
        {{ displayName("溶解") }}×<span>{{
          Math.round(damageResult.元素反応.溶解倍率_氷 * 100) / 100
        }}</span>
        <span class="savepoint" v-if="copiedDamageResult?.元素反応?.溶解倍率_氷">
          <br />
          {{ displayName("溶解") }}×<span>{{
            Math.round(copiedDamageResult.元素反応.溶解倍率_氷 * 100) / 100
          }}</span>
        </span>
      </label>
    </template>
    <template v-if="damageResult.元素反応.溶解倍率_炎">
      <input id="増幅反応-溶解_炎" type="radio" value="溶解_炎" name="増幅反応-name" @change="増幅反応 = '溶解_炎'" />
      <label for="増幅反応-溶解_炎" class="pyro">
        {{ displayName("溶解") }}×<span>{{
          Math.round(damageResult.元素反応.溶解倍率_炎 * 100) / 100
        }}</span>
        <span class="savepoint" v-if="copiedDamageResult?.元素反応?.溶解倍率_炎">
          <br />
          {{ displayName("溶解") }}×<span>{{
            Math.round(copiedDamageResult.元素反応.溶解倍率_炎 * 100) / 100
          }}</span>
        </span>
      </label>
    </template>
    <template v-if="damageResult.元素反応.超激化ダメージ">
      <input id="増幅反応-超激化" type="radio" value="超激化" name="増幅反応-name" @change="増幅反応 = '超激化'" />
      <label for="増幅反応-超激化">
        {{ displayName("超激化") }}
        <span>{{ Math.round(damageResult.元素反応.超激化ダメージ) }}</span>
        <span class="savepoint" v-if="copiedDamageResult?.元素反応?.超激化ダメージ">
          <br />
          {{ displayName("超激化") }}
          <span>{{ Math.round(copiedDamageResult.元素反応.超激化ダメージ) }}</span>
        </span>
      </label>
    </template>
    <template v-if="damageResult.元素反応.草激化ダメージ">
      <input id="増幅反応-草激化" type="radio" value="草激化" name="増幅反応-name" @change="増幅反応 = '草激化'" />
      <label for="増幅反応-草激化">
        {{ displayName("草激化") }}
        <span>{{ Math.round(damageResult.元素反応.草激化ダメージ) }}</span>
        <span class="savepoint" v-if="copiedDamageResult?.元素反応?.草激化ダメージ">
          <br />
          {{ displayName("草激化") }}
          <span>{{ Math.round(copiedDamageResult.元素反応.草激化ダメージ) }}</span>
        </span>
      </label>
    </template>
    <label v-if="damageResult.元素反応.過負荷ダメージ" class="pyro">
      {{ displayName("過負荷") }}
      <span>{{ Math.round(damageResult.元素反応.過負荷ダメージ) }}</span>
      <span class="savepoint" v-if="copiedDamageResult?.元素反応?.過負荷ダメージ">
        <br />
        {{ displayName("過負荷") }}
        <span>{{ Math.round(copiedDamageResult.元素反応.過負荷ダメージ) }}</span>
      </span>
    </label>
    <label v-if="damageResult.元素反応.感電ダメージ" class="electro">
      {{ displayName("感電") }}
      <span>{{ Math.round(damageResult.元素反応.感電ダメージ) }}</span>
      <span class="savepoint" v-if="copiedDamageResult?.元素反応?.感電ダメージ">
        <br />
        {{ displayName("感電") }}
        <span>{{ Math.round(copiedDamageResult.元素反応.感電ダメージ) }}</span>
      </span>
    </label>
    <label v-if="damageResult.元素反応.超電導ダメージ" class="cryo">
      {{ displayName("超電導") }}
      <span>{{ Math.round(damageResult.元素反応.超電導ダメージ) }}</span>
      <span class="savepoint" v-if="copiedDamageResult?.元素反応?.超電導ダメージ">
        <br />
        {{ displayName("超電導") }}
        <span>{{ Math.round(copiedDamageResult.元素反応.超電導ダメージ) }}</span>
      </span>
    </label>
    <label v-if="damageResult.元素反応.拡散ダメージ" :class="elementClass(damageResult.元素反応.拡散元素)">
      {{ displayName("拡散") }}
      <span>{{ Math.round(swirlDmg) }}</span>
    </label>
    <label v-if="damageResult.元素反応.結晶吸収量">
      {{ displayName("結晶") }}
      <span>{{ Math.round(damageResult.元素反応.結晶吸収量) }}</span>
      <span class="savepoint" v-if="copiedDamageResult?.元素反応?.結晶吸収量">
        <br />
        {{ displayName("結晶") }}
        <span>{{ Math.round(copiedDamageResult.元素反応.結晶吸収量) }}</span>
      </span>
    </label>
    <label v-if="damageResult.元素反応.燃焼ダメージ" class="pyro">
      {{ displayName("燃焼") }}
      <span>{{ Math.round(reactionDmg('燃焼ダメージ')) }}</span>
      <span class="savepoint" v-if="copiedDamageResult?.元素反応?.燃焼ダメージ">
        <br />
        {{ displayName("燃焼") }}
        <span>{{ Math.round(copiedDamageResult.元素反応.燃焼ダメージ) }}</span>
      </span>
    </label>
    <label v-if="damageResult.元素反応.開花ダメージ" class="dendro">
      {{ displayName("開花") }}
      <span>{{ Math.round(reactionDmg('開花ダメージ')) }}</span>
      <span class="savepoint" v-if="copiedDamageResult?.元素反応?.開花ダメージ">
        <br />
        {{ displayName("開花") }}
        <span>{{ Math.round(copiedDamageResult.元素反応.開花ダメージ) }}</span>
      </span>
    </label>
    <label v-if="damageResult.元素反応.烈開花ダメージ" class="dendro">
      {{ displayName("烈開花") }}
      <span>{{ Math.round(reactionDmg('烈開花ダメージ')) }}</span>
      <span class="savepoint" v-if="copiedDamageResult?.元素反応?.烈開花ダメージ">
        <br />
        {{ displayName("烈開花") }}
        <span>{{ Math.round(copiedDamageResult.元素反応.烈開花ダメージ) }}</span>
      </span>
    </label>
    <label v-if="damageResult.元素反応.超開花ダメージ" class="dendro">
      {{ displayName("超開花") }}
      <span>{{ Math.round(reactionDmg('超開花ダメージ')) }}</span>
      <span class="savepoint" v-if="copiedDamageResult?.元素反応?.超開花ダメージ">
        <br />
        {{ displayName("超開花") }}
        <span>{{ Math.round(copiedDamageResult.元素反応.超開花ダメージ) }}</span>
      </span>
    </label>
    <label v-if="damageResult.元素反応.氷砕きダメージ">
      {{ displayName("氷砕き") }}
      <span>{{ Math.round(reactionDmg('氷砕きダメージ')) }}</span>
      <span class="savepoint" v-if="copiedDamageResult?.元素反応?.氷砕きダメージ">
        <br />
        {{ displayName("氷砕き") }}
        <span>{{ Math.round(copiedDamageResult.元素反応.氷砕きダメージ) }}</span>
      </span>
    </label>
  </div>
  <fieldset>
    <template v-for="category in CATEGORY_LIST" :key="category">
      <template v-if="damageResult[category] && itemList(category).length > 0">
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
            <tr v-for="(item, index) in itemList(category)" :key="index">
              <th class="with-tooltip" v-if="item[item.length - 1]" :rowspan="item[item.length - 1]">
                <span> {{ displayNameV(item[0]) }} </span>
                <span class="tooltip" v-html="displayDamageParam(item)" v-if="displayDamageParam(item)"></span>
              </th>
              <td :class="'damage-value ' + elementClass(item[1], item[5])">
                {{ displayDamageValue(item, 2, category) }}
                <span class="savepoint" v-if="displayCopiedDamageValue(index, 2, category)">
                  <br /> {{ displayCopiedDamageValue(index, 2, category) }}
                </span>
              </td>
              <td :class="'damage-value ' + elementClass(item[1], item[5])">
                {{ displayDamageValue(item, 3, category) }}
                <span class="savepoint" v-if="displayCopiedDamageValue(index, 3, category)">
                  <br /> {{ displayCopiedDamageValue(index, 3, category) }}
                </span>
              </td>
              <td :class="'damage-value ' + elementClass(item[1], item[5])">
                {{ displayDamageValue(item, 4, category) }}
                <span class="savepoint" v-if="displayCopiedDamageValue(index, 4, category)">
                  <br /> {{ displayCopiedDamageValue(index, 4, category) }}
                </span>
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
            <td v-for="item in itemList(category)" :key="item[0]"
              :class="'damage-value ' + elementClass(item[1], item[5])">
              {{ displayDamageValue(item, 2, category) }}
            </td>
          </tr>
          <template v-if="categoryOpenClose[category]">
            <tr>
              <th>{{ displayName("会心") }}</th>
              <td v-for="item in itemList(category)" :key="item[0]"
                :class="'damage-value ' + elementClass(item[1], item[5])">
                {{ displayDamageValue(item, 3, category) }}
              </td>
            </tr>
            <tr>
              <th>{{ displayName("非会心") }}</th>
              <td v-for="item in itemList(category)" :key="item[0]"
                :class="'damage-value ' + elementClass(item[1], item[5])">
                {{ displayDamageValue(item, 4, category) }}
              </td>
            </tr>
          </template>
        </table>
      </template>
    </template>
    <hr />
    <table class="result damage-result">
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
  </fieldset>
  <div>
    <button type="button" @click="copyDamageResult">{{ displayName('比較用に現在値を記憶') }}</button>
    <button type="button" @click="clearCopiedDamageResult">{{ displayName('削除') }}</button>
  </div>
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
import _ from "lodash";
import i18n from "@/i18n";
import { overwriteObject } from "@/common";
import { TDamageResult, TDamageResultElementalReactionKey, TDamageResultEntry } from "@/input";
import { ELEMENT_COLOR_CLASS, TElementColorClassKey } from "@/master";
import { PropType, computed, defineComponent, reactive, ref, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";
import { calculateReactedDamage } from "@/calculate";

export default defineComponent({
  name: 'DamageResult',
  props: {
    damageResult: { type: Object as PropType<TDamageResult>, required: true, },
  },
  setup(props) {
    const { displayName } = CompositionFunction();

    const CATEGORY_LIST = ['通常攻撃', '重撃', '落下攻撃', '元素スキル', '元素爆発', 'その他'];
    const 増幅反応 = ref('なし');
    const resultStyleRef = ref('1');
    const copiedDamageResult = reactive({} as TDamageResult);
    const categoryOpenClose = reactive({} as { [key: string]: boolean });

    watch(props.damageResult, (damageResult) => {
      if (
        (増幅反応.value == '蒸発_炎' && damageResult.元素反応.蒸発倍率_炎 === 0) ||
        (増幅反応.value == '蒸発_水' && damageResult.元素反応.蒸発倍率_水 === 0) ||
        (増幅反応.value == '溶解_氷' && damageResult.元素反応.溶解倍率_氷 === 0) ||
        (増幅反応.value == '溶解_炎' && damageResult.元素反応.溶解倍率_炎 === 0) ||
        (増幅反応.value == '超激化' && damageResult.元素反応.超激化ダメージ === 0) ||
        (増幅反応.value == '草激化' && damageResult.元素反応.草激化ダメージ === 0)
      ) {
        増幅反応.value = 'なし';
        (document.getElementById('増幅反応-なし') as HTMLInputElement).checked = true;
      }
    })

    const swirlDmg = computed(() => {
      let result = props.damageResult.元素反応.拡散ダメージ;
      if (増幅反応.value == '蒸発_炎' && props.damageResult.元素反応.拡散元素 == '炎') {
        result *= props.damageResult.元素反応.蒸発倍率_炎;
      } else if (増幅反応.value == '蒸発_水' && props.damageResult.元素反応.拡散元素 == '水') {
        result *= props.damageResult.元素反応.蒸発倍率_水;
      } else if (増幅反応.value == '溶解_氷' && props.damageResult.元素反応.拡散元素 == '氷') {
        result *= props.damageResult.元素反応.溶解倍率_氷;
      } else if (増幅反応.value == '溶解_炎' && props.damageResult.元素反応.拡散元素 == '炎') {
        result *= props.damageResult.元素反応.溶解倍率_炎;
      } else if (増幅反応.value == '超激化' && props.damageResult.元素反応.拡散元素 == '雷') {
        result += props.damageResult.元素反応.超激化ダメージ;
      }
      return result;
    })

    /** 被ダメージのリストを作成します（同値を省略したリスト） */
    const damageTakenList = computed(() => {
      const result = props.damageResult.被ダメージ.filter(
        (s: any) => s.key == '物理'
      ) as any;
      for (const entry of props.damageResult.被ダメージ.filter(
        (s: any) => s.key != '物理'
      )) {
        const valueArr = result.map((s: any) => s.value);
        if (!valueArr.includes(entry.value)) {
          result.push(entry);
        }
      }
      return result;
    })

    /** 耐久スコアのリストを作成します（同値を省略したリスト） */
    const resScoreList = computed(() => {
      const result = props.damageResult.耐久スコア.filter(
        (s: any) => s.key == '物理'
      ) as any;
      for (const entry of props.damageResult.耐久スコア.filter(
        (s: any) => s.key != '物理'
      )) {
        const valueArr = result.map((s: any) => s.value);
        if (!valueArr.includes(entry.value)) {
          result.push(entry);
        }
      }
      return result;
    })

    const elementClass = (item: string, opt_kind?: string) => {
      let result = '';
      if (opt_kind === 'HP回復') {
        result = 'healing';
      } else if (opt_kind === 'HP消費') {
        result = 'hpcost';
      } else if (item) {
        result = ELEMENT_COLOR_CLASS[item as TElementColorClassKey];
      }
      return result;
    }

    const reactionDmg = (reaction: string): number => {
      let result = props.damageResult.元素反応[reaction as TDamageResultElementalReactionKey];
      if (result && _.isNumber(result)) {
        const critRate = props.damageResult.元素反応[(reaction + '会心率') as TDamageResultElementalReactionKey];
        if (critRate && _.isNumber(critRate)) {
          const critDmg = props.damageResult.元素反応[(reaction + '会心ダメージ') as TDamageResultElementalReactionKey];
          if (critDmg && _.isNumber(critDmg)) {
            result *= ((100 + critDmg) / 100 * critRate + (100 - critRate)) / 100;
          }
        }
      } else {
        result = 0;
      }
      return result;
    }

    function getAmplifyingReaction(dmgElement: string | null) {
      let reaction = ''; // 元素反応
      if (増幅反応.value === '蒸発_炎' && dmgElement === '炎') {
        reaction = '蒸発';
      } else if (増幅反応.value === '蒸発_水' && dmgElement === '水') {
        reaction = '蒸発';
      } else if (増幅反応.value === '溶解_氷' && dmgElement === '氷') {
        reaction = '溶解';
      } else if (増幅反応.value === '溶解_炎' && dmgElement === '炎') {
        reaction = '溶解';
      } else if (増幅反応.value === '超激化' && dmgElement === '雷') {
        reaction = '超激化';
      } else if (増幅反応.value === '草激化' && dmgElement === '草') {
        reaction = '草激化';
      }
      return reaction;
    }

    const displayDamageValue = (dmgResultEntry: TDamageResultEntry, index: number, category: string) => {
      let value = Number(dmgResultEntry[index]);
      if (!value) return '-';
      if (!dmgResultEntry[5] || !['シールド'].includes(dmgResultEntry[5])) {
        const dmgElement = dmgResultEntry[1]; // 攻撃元素
        const reaction = getAmplifyingReaction(dmgElement);
        const reactionTimes = category === '通常攻撃' && dmgResultEntry[0] === '合計ダメージ' ? danCount.value : 1;
        value = calculateReactedDamage(dmgResultEntry, index, props.damageResult.元素反応, reaction, reactionTimes);
      }
      if (value < 10) value = Math.round(value * 100) / 100;
      else if (value < 100) value = Math.round(value * 10) / 10;
      else value = Math.round(value);
      return value;
    }

    const displayCopiedDamageValue = (listIndex: any, index: number, category: string) => {
      let value = 0;
      if (category in copiedDamageResult) {
        const copied元素反応 = copiedDamageResult.元素反応;

        let dmgResultEntry;
        const workResultEntryArr: TDamageResultEntry[] = (copiedDamageResult as any)[category];
        const curItem = itemList(category)[listIndex];
        if (listIndex < workResultEntryArr.length && curItem[0] == workResultEntryArr[listIndex][0]) {
          dmgResultEntry = workResultEntryArr[listIndex];
        } else {
          const workList = workResultEntryArr.filter((s: any[]) => s[0] == curItem[0]);
          if (workList.length == 0) return undefined;
          dmgResultEntry = workList[0];
          if (workList.length > 1) {
            for (let i = 0; i < itemList(category).length; i++) {
              if (itemList(category)[i][0] == curItem[0]) {
                if (i < listIndex) {
                  dmgResultEntry = workList[1];
                }
              }
            }
          }
        }

        if (dmgResultEntry === undefined) {
          return 0;
        }

        value = Number(dmgResultEntry[index]);
        if (!value) return '-';
        if (!dmgResultEntry[5] || !['シールド'].includes(dmgResultEntry[5])) {
          const dmgElement = dmgResultEntry[1]; // 攻撃元素
          let reaction = getAmplifyingReaction(dmgElement);
          const reactionTimes = category === '通常攻撃' && dmgResultEntry[0] === '合計ダメージ' ? danCount.value : 1;
          value = calculateReactedDamage(dmgResultEntry, index, copied元素反応, reaction, reactionTimes);
        }
        if (value < 10) value = Math.round(value * 100) / 100;
        else if (value < 100) value = Math.round(value * 10) / 10;
        else value = Math.round(value);
      }
      return value;
    }

    const itemList = (category: string) => {
      const result = [] as any[];
      const workList = (props.damageResult[category] as any[]).filter((s: any[]) => s[0] && !s[0].startsWith('非表示'));
      for (let i = 0; i < workList.length; i++) {
        let span = 1;
        if (i > 0 && workList[i][0] == workList[i - 1][0]) span = 0;
        else {
          span = workList.slice(i).filter((s: any) => s[0] == workList[i][0]).length;
        }
        result.push([...workList[i], span]);
      }
      return result;
    }
    const danCount = computed(() => {
      return itemList('通常攻撃').filter(item => item[0].endsWith('段ダメージ') && !item[0].startsWith('非表示_')).length;
    })

    for (const key of CATEGORY_LIST) {
      categoryOpenClose[key] = true;
    }

    const categoryOnClick = (category: string) => {
      categoryOpenClose[category] = !categoryOpenClose[category];
    }

    const displayNameV = (key: any): string => {
      if (key && i18n.global.locale.value == 'ja-jp' && key.length > 10) {
        let work = key;
        work = work.replace(/のダメージ$/, '').replace(/ダメージ$/, '');
        return work;
      }
      return displayName(key);
    }

    const displayNameH = (key: any, category: string): string => {
      if (key && i18n.global.locale.value == 'ja-jp' && itemList(category).length > 2) {
        let work = key;
        work = work.replace(/のダメージ$/, '').replace(/ダメージ$/, '');
        return work;
      }
      return displayName(key);
    }

    const displayDamageParam = (item: any): string => {
      let result = '';
      if (!item || !item[5] || ['HP回復', 'シールド', '表示', 'HP消費'].includes(item[5])) return '';
      result += displayName('ダメージバフ');
      result += ':&nbsp;';
      result += Math.round((item[7] - 1) * 1000) / 10;
      result += '%<br>';
      if (item[2] && item[3] && item[4]) {
        let critRate = item[2] - item[4]; // 期待値 - 非会心
        critRate /= item[3] - item[4]; // 会心 - 非会心
        critRate = Math.round(critRate * 1000) / 10;
        const critDmg = Math.round((item[3] / item[4] - 1) * 1000) / 10;
        result += displayName('会心');
        result += ':&nbsp;';
        result += critRate;
        result += '%/';
        result += critDmg;
        result += '%<br>';
      }
      if (item[6]) {
        result += item[6];
        result += 'Hit' + (item[6] > 1 ? 's' : '');
        result += '<br>';
      }
      return result;
    }

    const copyDamageResult = () => {
      overwriteObject(copiedDamageResult, _.cloneDeep(props.damageResult));
    }

    const clearCopiedDamageResult = () => {
      overwriteObject(copiedDamageResult, {});
    }

    return {
      displayName,
      displayNameV,
      displayNameH,

      増幅反応,
      swirlDmg,
      reactionDmg,
      elementClass,
      displayDamageValue,
      displayDamageParam,
      CATEGORY_LIST,
      itemList,
      categoryOpenClose,
      categoryOnClick,
      resultStyleRef,
      displayCopiedDamageValue,
      copiedDamageResult,

      damageTakenList,
      resScoreList,

      copyDamageResult,
      clearCopiedDamageResult,
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

.elemental-reaction [type="radio"]+label {
  background-color: black;
}

.elemental-reaction label span {
  white-space: nowrap;
}

table.result {
  width: 100%;
  margin: 1px auto;
  table-layout: fixed;
  border-spacing: 1px;
  border-collapse: collapse;
}

table.result tr {
  border-bottom: 1px solid gray;
}

table.result th,
table.result td {
  text-align: right;
  white-space: nowrap;
  padding-right: 4px;
  line-height: 3.3rem;
}

table.result th:first-child {
  width: 24rem;
  text-align: right;
  color: #df8f37;
  white-space: nowrap;
}

table.result thead th {
  color: #df8f37;
  background-color: #333;
}

table.result thead th:first-child {
  color: gold;
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

table.damage-result tr:last-child {
  border-bottom: none;
}

.right {
  text-align: right;
  margin: 1rem;
}

ul.notes {
  list-style-type: none;
  text-align: left;
  padding-inline-start: 0;
}

.tooltip {
  left: calc(100% - 10px);
  padding: 5px;
  border: 2px solid gray;
  border-radius: 10px;
  background-color: black;
}

span.savepoint {
  opacity: 60%;
}

button {
  margin-top: 5px;
  padding-left: 5px;
  padding-right: 5px;
}

.healing {
  color: #d0f8a8;
}

.hpcost {
  color: lightgray;
}
</style>
