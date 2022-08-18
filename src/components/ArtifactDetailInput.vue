<template>
  <div v-if="visible">
    <fieldset>
      <legend>{{ displayName("聖遺物詳細") }}</legend>
      <label class="two">
        {{ displayName("生の花") }}
        <select v-model="mainstats[0]" @change="updateMainstats">
          <option value=""></option>
          <option v-for="item in mainstat1List" :value="item" :key="item">
            {{ displayName(item) }}
          </option>
        </select>
      </label>
      <label class="two">
        {{ displayName("死の羽") }}
        <select v-model="mainstats[1]" @change="updateMainstats">
          <option value=""></option>
          <option v-for="item in mainstat2List" :value="item" :key="item">
            {{ displayName(item) }}
          </option>
        </select>
      </label>
      <label class="three">
        {{ displayName("時の砂") }}
        <select v-model="mainstats[2]" @change="updateMainstats">
          <option value=""></option>
          <option v-for="item in mainstat3List" :value="item" :key="item">
            {{ displayName(item) }}
          </option>
        </select>
      </label>
      <label class="three">
        {{ displayName("空の杯") }}
        <select v-model="mainstats[3]" @change="updateMainstats">
          <option value=""></option>
          <option v-for="item in mainstat4List" :value="item" :key="item">
            {{ displayName(item) }}
          </option>
        </select>
      </label>
      <label class="three">
        {{ displayName("理の冠") }}
        <select v-model="mainstats[4]" @change="updateMainstats">
          <option value=""></option>
          <option v-for="item in mainstat5List" :value="item" :key="item">
            {{ displayName(item) }}
          </option>
        </select>
      </label>
      <table class="detail">
        <tr>
          <th>{{ displayName("HP") }}</th>
          <td class="stat-value">
            <input v-if="editableRef" type="number" v-model="artifactStats.HP" :min="substatMin('HP')"
              :step="substatStep('HP')" @change="artifactStatsOnChange('HP', targetValue($event))" />
            <span v-else>{{ displayStatValue("HP", artifactStats.HP) }}</span>
          </td>
          <th>{{ displayName("HP%") }}</th>
          <td class="stat-value">
            <input v-if="editableRef" type="number" v-model="artifactStats['HP%']" :min="substatMin('HP%')"
              :step="substatStep('HP%')" @change="artifactStatsOnChange('HP%', targetValue($event))" />
            <span v-else>{{ displayStatValue("HP%", artifactStats["HP%"]) }}</span>
          </td>
        </tr>
        <tr>
          <th>{{ displayName("攻撃力") }}</th>
          <td class="stat-value">
            <input v-if="editableRef" type="number" v-model="artifactStats.攻撃力" :min="substatMin('攻撃力')"
              :step="substatStep('攻撃力')" @change="artifactStatsOnChange('攻撃力', targetValue($event))" />
            <span v-else>{{ displayStatValue("攻撃力", artifactStats.攻撃力) }}</span>
          </td>
          <th>{{ displayName("攻撃力%") }}</th>
          <td class="stat-value">
            <input v-if="editableRef" type="number" v-model="artifactStats['攻撃力%']" :min="substatMin('攻撃力%')"
              :step="substatStep('攻撃力%')" @change="artifactStatsOnChange('攻撃力%', targetValue($event))" />
            <span v-else>{{
                displayStatValue("攻撃力%", artifactStats["攻撃力%"])
            }}</span>
          </td>
        </tr>
        <tr>
          <th>{{ displayName("防御力") }}</th>
          <td class="stat-value">
            <input v-if="editableRef" type="number" v-model="artifactStats.防御力" :min="substatMin('防御力')"
              :step="substatStep('防御力')" @change="artifactStatsOnChange('防御力', targetValue($event))" />
            <span v-else>{{ displayStatValue("防御力", artifactStats.防御力) }}</span>
          </td>
          <th>{{ displayName("防御力%") }}</th>
          <td class="stat-value">
            <input v-if="editableRef" type="number" v-model="artifactStats['防御力%']" :min="substatMin('防御力%')"
              :step="substatStep('防御力%')" @change="artifactStatsOnChange('防御力%', targetValue($event))" />
            <span v-else>{{
                displayStatValue("防御力%", artifactStats["防御力%"])
            }}</span>
          </td>
        </tr>
        <tr>
          <th>{{ displayName("元素熟知") }}</th>
          <td class="stat-value">
            <input v-if="editableRef" type="number" v-model="artifactStats.元素熟知" :min="substatMin('元素熟知')"
              :step="substatStep('元素熟知')" @change="artifactStatsOnChange('元素熟知', targetValue($event))" />
            <span v-else>{{ displayStatValue("元素熟知", artifactStats.元素熟知) }}</span>
          </td>
        </tr>
        <tr>
          <th>{{ displayName("会心率") }}</th>
          <td class="stat-value">
            <input v-if="editableRef" type="number" v-model="artifactStats.会心率" :min="substatMin('会心率')"
              :step="substatStep('会心率')" @change="artifactStatsOnChange('会心率', targetValue($event))" />
            <span v-else>{{ displayStatValue("会心率", artifactStats.会心率) }}</span>
          </td>
        </tr>
        <tr>
          <th>{{ displayName("会心ダメージ") }}</th>
          <td class="stat-value">
            <input v-if="editableRef" type="number" v-model="artifactStats.会心ダメージ" :min="substatMin('会心ダメージ')"
              :step="substatStep('会心ダメージ')" @change="artifactStatsOnChange('会心ダメージ', targetValue($event))" />
            <span v-else>{{
                displayStatValue("会心ダメージ", artifactStats.会心ダメージ)
            }}</span>
          </td>
          <td colspan="2" style="border-color: transparent">
            <label>
              <input type="checkbox" v-model="editableRef" />
              {{ displayName("直接入力モード") }}
            </label>
          </td>
        </tr>
        <tr>
          <th>{{ displayName("元素チャージ効率") }}</th>
          <td class="stat-value">
            <input v-if="editableRef" type="number" v-model="artifactStats.元素チャージ効率" :min="substatMin('元素チャージ効率')"
              :step="substatStep('元素チャージ効率')" @change="artifactStatsOnChange('元素チャージ効率', targetValue($event))" />
            <span v-else>{{
                displayStatValue("元素チャージ効率", artifactStats.元素チャージ効率)
            }}</span>
          </td>
          <td colspan="2" style="border-color: transparent">
            <button type="button" @click="loadArtifactStatsByOcrOnClick"> {{ displayName('聖遺物詳細画面OCR') }} </button>
          </td>
        </tr>
      </table>
    </fieldset>
    <fieldset>
      <legend>{{ displayName("聖遺物サブ効果 簡易設定") }}</legend>
      <table class="priority-substat">
        <tr>
          <th>{{ displayName("優先するサブ効果") }}</th>
          <th>{{ displayName("上昇値") }}</th>
          <th>{{ displayName("初期+強化") }}</th>
          <td style="border-color: transparent">合計 {{ upTotalCount }} 回</td>
        </tr>
        <tr v-for="i in [0, 1, 2]" :key="i">
          <td>
            <select v-model="prioritySubstats[i]" @change="updatePrioritySubstats">
              <option value=""></option>
              <option v-for="item in prioritySubstatList" :value="item" :key="item">
                {{ displayName(item) }}
              </option>
            </select>
          </td>
          <td>
            <select v-model="prioritySubstatIndices[i]" @change="updatePrioritySubstats">
              <option v-for="(item, index) in prioritySubstatValueList(i)" :value="index" :key="index">
                {{ Math.round(item * 10) / 10 }}
              </option>
            </select>
          </td>
          <td>
            <select v-model="prioritySubstatCounts[i]" @change="updatePrioritySubstats">
              <option v-for="item in prioritySubstatCountList" :value="item" :key="item">
                {{ " × " + item }}
              </option>
            </select>
          </td>
          <td v-show="i == 0" style="border-color: transparent">
            <label>
              <input type="checkbox" v-model="gensenEnabledRef" />
              {{ displayName("一括変更") }}
            </label>
          </td>
          <td v-show="i == 1" style="border-color: transparent">
            <select class="gensen" v-model="gensenRef" @change="gensenOnChange" :disabled="!gensenEnabledRef">
              <option v-for="item in gensenMasterList" :value="item" :key="item.key">
                {{ displayName(item.key) }}
              </option>
            </select>
          </td>
        </tr>
      </table>
    </fieldset>
  </div>
  <div style="display: none">
    <input type="file" id="artifact-stats-image" />
  </div>
</template>

<script lang="ts">
import {
  TArtifactDetailInput,
  聖遺物メイン効果_時の砂ARRAY,
  聖遺物メイン効果_死の羽ARRAY,
  聖遺物メイン効果_理の冠ARRAY,
  聖遺物メイン効果_生の花ARRAY,
  聖遺物メイン効果_空の杯ARRAY,
  聖遺物優先するサブ効果ARRAY,
} from "@/input";
import {
  calculateArtifactStats,
  calculateArtifactStatsMain,
  calculateArtifactSubStatByPriority,
  makePrioritySubstatValueList,
} from "@/calculate";
import {
  GENSEN_MASTER_LIST,
  TArtifactSubKey,
  TGensen,
} from "@/master";
import { computed, defineComponent, PropType, reactive, ref } from "vue";
import CompositionFunction from './CompositionFunction.vue';
const resizePinnedImage = require('../gencalc_ocr.js');

export default defineComponent({
  name: "ArtifactDetailInput",
  props: {
    visible: Boolean,
    artifactDetailInput: { type: Object as PropType<TArtifactDetailInput>, required: true },
  },
  emits: ["update:artifact-detail"],
  setup(props, context) {
    const { displayName, targetValue, displayStatValue } = CompositionFunction();

    const artifactDetailInputRea = reactive(props.artifactDetailInput);

    const mainstats = reactive(artifactDetailInputRea.聖遺物メイン効果);
    const prioritySubstats = reactive(
      artifactDetailInputRea.聖遺物優先するサブ効果 as TArtifactSubKey[]
    );
    const prioritySubstatIndices = reactive(artifactDetailInputRea.聖遺物優先するサブ効果上昇値);
    const prioritySubstatCounts = reactive(artifactDetailInputRea.聖遺物優先するサブ効果上昇回数);
    const artifactStats = reactive(artifactDetailInputRea.聖遺物ステータス);
    const artifactStatsMain = reactive(artifactDetailInputRea.聖遺物ステータスメイン効果);
    const artifactStatsSub = reactive(artifactDetailInputRea.聖遺物ステータスサブ効果);
    const prioritySubstatsDisabledRef = ref(
      artifactDetailInputRea.聖遺物優先するサブ効果Disabled
    );

    const editableRef = ref(false);
    const gensenEnabledRef = ref(false);
    const gensenMasterList = GENSEN_MASTER_LIST;
    const gensenRef = ref(GENSEN_MASTER_LIST[2] as TGensen);

    const upTotalCount = computed(() => {
      let work = 0;
      for (let count of prioritySubstatCounts) {
        work += count;
      }
      return Math.min(45, 40 + Math.round(Math.max(0, (work - 12) / 4)));
    });

    /** 優先するサブ効果上昇値のオプション値のリストを作成します */
    const prioritySubstatValueList = (index: number, opt_substat?: TArtifactSubKey) =>
      makePrioritySubstatValueList(prioritySubstats, index, opt_substat);
    const substatMin = (substat: string) =>
      substat in artifactStatsMain ? artifactStatsMain[substat] : 0;
    const substatStep = (substat: string) =>
      ["HP", "攻撃力", "防御力", "元素熟知"].includes(substat) ? 1 : 0.1;

    /** 聖遺物ステータスを計算します（メイン効果） */
    const _calculateArtifactStatsMain = () => {
      calculateArtifactStatsMain(artifactStatsMain, mainstats);
    };

    /** 聖遺物ステータスを計算します（優先するサブ効果） */
    const _calculateArtifactStatsPrioritySub = () => {
      if (prioritySubstatsDisabledRef.value) return;
      const prioritySubstatValues = [
        prioritySubstatValueList(0),
        prioritySubstatValueList(1),
        prioritySubstatValueList(2),
      ];
      calculateArtifactSubStatByPriority(
        artifactStatsSub,
        mainstats,
        prioritySubstats,
        prioritySubstatIndices,
        prioritySubstatValues,
        prioritySubstatCounts
      );
    };

    /** 聖遺物ステータスを計算します */
    _calculateArtifactStatsMain();
    _calculateArtifactStatsPrioritySub();
    calculateArtifactStats(artifactDetailInputRea);

    /** メイン効果が更新されました */
    const updateMainstats = () => {
      _calculateArtifactStatsMain();
      calculateArtifactStats(artifactDetailInputRea);
      context.emit("update:artifact-detail", artifactDetailInputRea);
    };

    /** サブ効果が更新されました */
    const artifactStatsOnChange = (opt_stat?: any, opt_value?: string) => {
      Object.keys(artifactStats)
        .filter((s) => !opt_stat || s == opt_stat)
        .forEach((key) => {
          if (key == opt_stat && opt_value !== undefined)
            artifactStatsSub[key] = Number(opt_value);
          artifactStatsSub[key] = artifactStats[key] - artifactStatsMain[key];
          if (artifactStatsSub[key] < 0) {
            artifactStatsSub[key] = 0;
            artifactStats[key] = artifactStatsMain[key];
          }
        });
      calculateArtifactStats(artifactDetailInputRea);
      context.emit("update:artifact-detail", artifactDetailInputRea);
    };

    /** 優先するサブ効果が更新されました */
    const updatePrioritySubstats = () => {
      prioritySubstatsDisabledRef.value = false;
      _calculateArtifactStatsPrioritySub();
      calculateArtifactStats(artifactDetailInputRea);
      context.emit("update:artifact-detail", artifactDetailInputRea);
    };

    /** 厳選目安が選択されました */
    const gensenOnChange = () => {
      prioritySubstatsDisabledRef.value = false;
      gensenEnabledRef.value = false;
      if (!gensenRef.value) return;
      if (!gensenRef.value.key) return;
      prioritySubstatsDisabledRef.value = false;
      prioritySubstatIndices.splice(
        0,
        prioritySubstatIndices.length,
        ...gensenRef.value.values
      );
      prioritySubstatCounts.splice(
        0,
        prioritySubstatCounts.length,
        ...gensenRef.value.counts
      );
      _calculateArtifactStatsPrioritySub();
      calculateArtifactStats(artifactDetailInputRea);
      context.emit("update:artifact-detail", artifactDetailInputRea);
    };

    /** 聖遺物ステータスサブ効果をクリアします */
    const initializeArtifactStatsSub = () => {
      prioritySubstatsDisabledRef.value = true;
      for (const stat of Object.keys(artifactStatsSub)) {
        artifactStatsSub[stat] = 0;
      }
      calculateArtifactStats(artifactDetailInputRea);
      context.emit("update:artifact-detail", artifactDetailInputRea);
    }

    /** 聖遺物詳細OCR機能 */
    const loadArtifactStatsByOcr = async (event: Event) => {
      resizePinnedImage(event);
    }
    document.getElementById('artifact-stats-image')?.addEventListener('click', loadArtifactStatsByOcr);
    const loadArtifactStatsByOcrOnClick = async () => {
      document.getElementById('artifact-stats-image')?.click();
    }

    // watch(
    //   mainstats,
    //   (newVal, oldVal) => {
    //     for (const val of oldVal as any[]) {
    //       if (!val) continue;
    //       const stat: [TArtifactMainRarity, TArtifactMainStat] = val.split("_");
    //       const statValue = ARTIFACT_MAIN_MASTER[stat[0]][stat[1]];
    //       artifactStats[stat[1]] -= statValue;
    //       if (artifactStats[stat[1]] < 0) artifactStats[stat[1]] = 0;
    //     }
    //     for (const val of newVal as any[]) {
    //       if (!val) continue;
    //       const stat: [TArtifactMainRarity, TArtifactMainStat] = val.split("_");
    //       const statValue = ARTIFACT_MAIN_MASTER[stat[0]][stat[1]];
    //       artifactStats[stat[1]] += statValue;
    //     }
    //   },
    //   { deep: true }
    // );
    // watch(
    //   [prioritySubstats, prioritySubstatIndices, prioritySubstatCounts],
    //   ([newVal, newValuesVal, newCountsVal], [oldVal, oldValuesVal, oldCountsVal]) => {
    //     if (prioritySubstatsDisabledRef.value) return;
    //     for (let i = 0; i < 3; i++) {
    //       if (!oldVal || !oldValuesVal || !oldCountsVal) continue;
    //       const stat = oldVal[i] as TArtifactSubKey;
    //       const valueList = prioritySubstatValueList(i, stat);
    //       const statValue = valueList[oldValuesVal[i]] * oldCountsVal[i];
    //       artifactStats[stat] -= statValue;
    //       if (artifactStats[stat] < 0) artifactStats[stat] = 0;
    //     }
    //     for (let i = 0; i < 3; i++) {
    //       if (!newVal || !newValuesVal || !newCountsVal) continue;
    //       const stat = newVal[i] as TArtifactSubKey;
    //       const valueList = prioritySubstatValueList(i, stat);
    //       const statValue = valueList[newValuesVal[i]] * newCountsVal[i];
    //       artifactStats[stat] += statValue;
    //     }
    //   },
    //   { deep: true }
    // );

    return {
      displayName, targetValue, displayStatValue,

      mainstat1List: 聖遺物メイン効果_生の花ARRAY,
      mainstat2List: 聖遺物メイン効果_死の羽ARRAY,
      mainstat3List: 聖遺物メイン効果_時の砂ARRAY,
      mainstat4List: 聖遺物メイン効果_空の杯ARRAY,
      mainstat5List: 聖遺物メイン効果_理の冠ARRAY,
      substatMin,
      substatStep,
      prioritySubstatList: 聖遺物優先するサブ効果ARRAY,
      prioritySubstatValueList,
      prioritySubstatCountList: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      mainstats,
      prioritySubstats,
      prioritySubstatIndices,
      prioritySubstatCounts,
      artifactStats,
      prioritySubstatsDisabledRef,
      upTotalCount,
      editableRef,
      gensenEnabledRef,
      gensenRef,
      gensenMasterList,
      gensenOnChange,
      artifactStatsOnChange,
      updateMainstats,
      updatePrioritySubstats,

      loadArtifactStatsByOcrOnClick,
      initializeArtifactStatsSub,
    };
  },
});
</script>

<style scoped>
fieldset {
  margin-bottom: 10px;
}

label {
  display: inline-block;
  color: #df8f37;
}

.two {
  width: calc(100% / 2 - 6px);
}

.three {
  width: calc(100% / 3 - 6px);
}

.two select {
  width: 50%;
}

.three select {
  width: 100%;
}

table {
  width: 100%;
  table-layout: fixed;
  border-top: 2px solid gray;
  margin-top: 10px;
}

table.priority-substat {
  table-layout: auto;
  margin-top: 0;
  border: none;
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

table.priority-substat th {
  text-align: center;
  border: none;
}

table.priority-substat td {
  border: none;
}

table.priority-substat td select {
  width: 100%;
}

input[type="number"] {
  width: calc(100% - 6px);
}

select.gensen {
  display: inline-block;
  margin-left: 5px;
}
</style>
