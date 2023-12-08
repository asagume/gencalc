<template>
  <div v-if="visible">
    <fieldset>
      <legend>{{ displayName('聖遺物詳細') }}</legend>
      <label class="two">
        {{ displayName('生の花') }}
        <select v-model="mainstats[0]" @change="updateMainstats">
          <option value=""></option>
          <option v-for="item in mainstat1List" :value="item" :key="item">
            {{ displayName(item) }}
          </option>
        </select>
      </label>
      <label class="two">
        {{ displayName('死の羽') }}
        <select v-model="mainstats[1]" @change="updateMainstats">
          <option value=""></option>
          <option v-for="item in mainstat2List" :value="item" :key="item">
            {{ displayName(item) }}
          </option>
        </select>
      </label>
      <label class="three">
        {{ displayName('時の砂') }}
        <select v-model="mainstats[2]" @change="updateMainstats">
          <option value=""></option>
          <option v-for="item in mainstat3List" :value="item" :key="item">
            {{ displayName(item) }}
          </option>
        </select>
      </label>
      <label class="three">
        {{ displayName('空の杯') }}
        <select v-model="mainstats[3]" @change="updateMainstats">
          <option value=""></option>
          <option v-for="item in mainstat4List" :value="item" :key="item">
            {{ displayName(item) }}
          </option>
        </select>
      </label>
      <label class="three">
        {{ displayName('理の冠') }}
        <select v-model="mainstats[4]" @change="updateMainstats">
          <option value=""></option>
          <option v-for="item in mainstat5List" :value="item" :key="item">
            {{ displayName(item) }}
          </option>
        </select>
      </label>
      <table class="detail">
        <tr>
          <th>{{ displayName('HP') }}</th>
          <td class="stat-value">
            <template v-if="isSubStatOnly">
              <input v-if="editableRef" type="number" v-model="artifactStatsSub['HP']" :min="0" :step="substatStep('HP')"
                @change="artifactStatsSubOnChange" />
              <span v-else>{{ displayStatValue('HP', artifactStatsSub['HP']) }}</span>
            </template>
            <template v-else>
              <input v-if="editableRef" type="number" v-model="artifactStats['HP']" :min="substatMin('HP')"
                :step="substatStep('HP')" @change="artifactStatsOnChange('HP', targetValue($event))" />
              <span v-else>{{ displayStatValue('HP', artifactStats['HP']) }}</span>
            </template>
          </td>
          <th>{{ displayName('HP%') }}</th>
          <td class="stat-value">
            <template v-if="isSubStatOnly">
              <input v-if="editableRef" type="number" v-model="artifactStatsSub['HP%']" :min="0"
                :step="substatStep('HP%')" @change="artifactStatsSubOnChange" />
              <span v-else>{{ displayStatValue('HP%', artifactStatsSub['HP%']) }}</span>
            </template>
            <template v-else>
              <input v-if="editableRef" type="number" v-model="artifactStats['HP%']" :min="substatMin('HP%')"
                :step="substatStep('HP%')" @change="artifactStatsOnChange('HP%', targetValue($event))" />
              <span v-else>{{ displayStatValue('HP%', artifactStats['HP%']) }}</span>
            </template>
          </td>
        </tr>
        <tr>
          <th>{{ displayName('攻撃力') }}</th>
          <td class="stat-value">
            <template v-if="isSubStatOnly">
              <input v-if="editableRef" type="number" v-model="artifactStatsSub['攻撃力']" :min="0"
                :step="substatStep('攻撃力')" @change="artifactStatsSubOnChange" />
              <span v-else>{{ displayStatValue('攻撃力', artifactStatsSub['攻撃力']) }}</span>
            </template>
            <template v-else>
              <input v-if="editableRef" type="number" v-model="artifactStats['攻撃力']" :min="substatMin('攻撃力')"
                :step="substatStep('攻撃力')" @change="artifactStatsOnChange('攻撃力', targetValue($event))" />
              <span v-else>{{ displayStatValue('攻撃力', artifactStats['攻撃力']) }}</span>
            </template>
          </td>
          <th>{{ displayName('攻撃力%') }}</th>
          <td class="stat-value">
            <template v-if="isSubStatOnly">
              <input v-if="editableRef" type="number" v-model="artifactStatsSub['攻撃力%']" :min="0"
                :step="substatStep('攻撃力%')" @change="artifactStatsSubOnChange" />
              <span v-else>{{ displayStatValue('攻撃力%', artifactStatsSub['攻撃力%']) }}</span>
            </template>
            <template v-else>
              <input v-if="editableRef" type="number" v-model="artifactStats['攻撃力%']" :min="substatMin('攻撃力%')"
                :step="substatStep('攻撃力%')" @change="artifactStatsOnChange('攻撃力%', targetValue($event))" />
              <span v-else>{{ displayStatValue('攻撃力%', artifactStats['攻撃力%']) }}</span>
            </template>
          </td>
        </tr>
        <tr>
          <th>{{ displayName('防御力') }}</th>
          <td class="stat-value">
            <template v-if="isSubStatOnly">
              <input v-if="editableRef" type="number" v-model="artifactStatsSub['防御力']" :min="0"
                :step="substatStep('防御力')" @change="artifactStatsSubOnChange" />
              <span v-else>{{ displayStatValue('防御力', artifactStatsSub['防御力']) }}</span>
            </template>
            <template v-else>
              <input v-if="editableRef" type="number" v-model="artifactStats['防御力']" :min="substatMin('防御力')"
                :step="substatStep('防御力')" @change="artifactStatsOnChange('防御力', targetValue($event))" />
              <span v-else>{{ displayStatValue('防御力', artifactStats['防御力']) }}</span>
            </template>
          </td>
          <th>{{ displayName('防御力%') }}</th>
          <td class="stat-value">
            <template v-if="isSubStatOnly">
              <input v-if="editableRef" type="number" v-model="artifactStatsSub['防御力%']" :min="0"
                :step="substatStep('防御力%')" @change="artifactStatsSubOnChange" />
              <span v-else>{{ displayStatValue('防御力%', artifactStatsSub['防御力%']) }}</span>
            </template>
            <template v-else>
              <input v-if="editableRef" type="number" v-model="artifactStats['防御力%']" :min="substatMin('防御力%')"
                :step="substatStep('防御力%')" @change="artifactStatsOnChange('防御力%', targetValue($event))" />
              <span v-else>{{ displayStatValue('防御力%', artifactStats['防御力%']) }}</span>
            </template>
          </td>
        </tr>
        <tr>
          <th>{{ displayName('元素熟知') }}</th>
          <td class="stat-value">
            <template v-if="isSubStatOnly">
              <input v-if="editableRef" type="number" v-model="artifactStatsSub['元素熟知']" :min="0"
                :step="substatStep('元素熟知')" @change="artifactStatsSubOnChange" />
              <span v-else>{{ displayStatValue('元素熟知', artifactStatsSub['元素熟知']) }}</span>
            </template>
            <template v-else>
              <input v-if="editableRef" type="number" v-model="artifactStats['元素熟知']" :min="substatMin('元素熟知')"
                :step="substatStep('元素熟知')" @change="artifactStatsOnChange('元素熟知', targetValue($event))" />
              <span v-else>{{ displayStatValue('元素熟知', artifactStats['元素熟知']) }}</span>
            </template>
          </td>
          <td rowspan="4" colspan="2" style="border-color: transparent">
            <div>
              <label>
                <input type="checkbox" v-model="editableRef" />
                {{ displayName('直接入力モード') }}
              </label>
            </div>
            <div>
              <label class="button">
                {{ displayName('聖遺物詳細画面OCR') }}
                <input class="hidden" type="file" id="artifact-stats-image" @change="loadArtifactStatsByOcr($event)" />
              </label>
            </div>
            <div style="position: relative">
              <img class="wait-icon" src="images/icon_loader_f_ww_01_s1.gif" width="25" height="25" v-if="isScanning" />
            </div>
            <div>
              <label><input type="checkbox" v-model="canInitializeStats">
                {{ displayName('全てクリア') }}
              </label>
              <button @click="initializeAll" :disabled="!canInitializeStats">
                {{ displayName('実行') }}
              </button>
            </div>
          </td>
        </tr>
        <tr>
          <th>{{ displayName('会心率') }}</th>
          <td class="stat-value">
            <template v-if="isSubStatOnly">
              <input v-if="editableRef" type="number" v-model="artifactStatsSub['会心率']" :min="0"
                :step="substatStep('会心率')" @change="artifactStatsSubOnChange" />
              <span v-else>{{ displayStatValue('会心率', artifactStatsSub['会心率']) }}</span>
            </template>
            <template v-else>
              <input v-if="editableRef" type="number" v-model="artifactStats['会心率']" :min="substatMin('会心率')"
                :step="substatStep('会心率')" @change="artifactStatsOnChange('会心率', targetValue($event))" />
              <span v-else>{{ displayStatValue('会心率', artifactStats['会心率']) }}</span>
            </template>
          </td>
        </tr>
        <tr>
          <th>{{ displayName('会心ダメージ') }}</th>
          <td class="stat-value">
            <template v-if="isSubStatOnly">
              <input v-if="editableRef" type="number" v-model="artifactStatsSub['会心ダメージ']" :min="0"
                :step="substatStep('会心ダメージ')" @change="artifactStatsSubOnChange" />
              <span v-else> {{ displayStatValue('会心ダメージ', artifactStatsSub['会心ダメージ']) }}</span>
            </template>
            <template v-else>
              <input v-if="editableRef" type="number" v-model="artifactStats['会心ダメージ']" :min="substatMin('会心ダメージ')"
                :step="substatStep('会心ダメージ')" @change="artifactStatsOnChange('会心ダメージ', targetValue($event))" />
              <span v-else> {{ displayStatValue('会心ダメージ', artifactStats['会心ダメージ']) }}</span>
            </template>
          </td>
        </tr>
        <tr>
          <th>{{ displayName('元素チャージ効率') }}</th>
          <td class="stat-value">
            <template v-if="isSubStatOnly">
              <input v-if="editableRef" type="number" v-model="artifactStatsSub['元素チャージ効率']" :min="0"
                :step="substatStep('元素チャージ効率')" @change="artifactStatsSubOnChange" />
              <span v-else>{{ displayStatValue('元素チャージ効率', artifactStatsSub['元素チャージ効率']) }}</span>
            </template>
            <template v-else>
              <input v-if="editableRef" type="number" v-model="artifactStats['元素チャージ効率']" :min="substatMin('元素チャージ効率')"
                :step="substatStep('元素チャージ効率')" @change="artifactStatsOnChange('元素チャージ効率', targetValue($event))" />
              <span v-else>{{ displayStatValue('元素チャージ効率', artifactStats['元素チャージ効率']) }}</span>
            </template>
          </td>
        </tr>
      </table>
    </fieldset>

    <div class="tab-switch">
      <input class="hidden" id="input-mode-tab-1" type="radio" value="1" v-model="artifactInputModeTab">
      <label for="input-mode-tab-1">
        {{ displayName('簡易設定') }}
      </label>
      <input class="hidden" id="input-mode-tab-2" type="radio" value="2" v-model="artifactInputModeTab">
      <label for="input-mode-tab-2">
        {{ displayName('個別設定') }}
      </label>
    </div>

    <div class="sub-input" id="artifact-sub-input">
      <fieldset v-if="artifactInputModeTab == '1'">
        <table class="priority-substat">
          <tr>
            <th>{{ displayName('優先するサブ効果') }}</th>
            <th>{{ displayName('上昇値') }}</th>
            <th>{{ displayName('初期+強化') }}</th>
            <td style="border-color: transparent">合計 {{ upTotalCount }} 回</td>
          </tr>
          <tr v-for="i in [...Array(prioritySubstats.length)].map((_, i) => i)" :key="i">
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
                {{ displayName('一括変更') }}
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

      <div class="artifact-cat-select" v-if="artifactInputModeTab == '2'">
        <div class="cat-select">
          <label>
            <input class="hidden" type="radio" value="1" v-model="artifactCatTabSelected"
              @change="artifactCatTabOnChange">
            <img src="images/flower_of_life.png" :alt="displayName('生の花')">
          </label>
          <label>
            <input class="hidden" type="radio" value="2" v-model="artifactCatTabSelected"
              @change="artifactCatTabOnChange">
            <img src="images/plume_of_death.png" :alt="displayName('死の羽')">
          </label>
          <label>
            <input class="hidden" type="radio" value="3" v-model="artifactCatTabSelected"
              @change="artifactCatTabOnChange">
            <img src="images/sands_of_eon.png" :alt="displayName('時の砂')">
          </label>
          <label>
            <input class="hidden" type="radio" value="4" v-model="artifactCatTabSelected"
              @change="artifactCatTabOnChange">
            <img src="images/goblet_of_eonothem.png" :alt="displayName('空の杯')">
          </label>
          <label>
            <input class="hidden" type="radio" value="5" v-model="artifactCatTabSelected"
              @change="artifactCatTabOnChange">
            <img src="images/circlet_of_logos.png" :alt="displayName('理の冠')">
          </label>
        </div>
        <div v-if="!isArtifactSelectListShow && !isNewArtifactInputShow && !isArtifactChangeInputShow">
          <template v-for="(artifact, index) in artifactListCat" :key="index">
            <ArtifactItem :artifact="artifact" />
          </template>
          <div>
            <button type="button" @click="artifactSelectOnClick">
              {{ displayName('選択') }}
            </button>
            <button type="button" @click="artifactNewOnClick">
              {{ displayName('新規') }}
            </button>
            <template v-if="artifactListCat.length">
              <button type="button" @click="artifactRemoveOnClick">
                {{ displayName('解除') }}
              </button>
            </template>
          </div>
        </div>
        <!-- 聖遺物選択リスト -->
        <div v-if="isArtifactSelectListShow" class="artifact-select-list">
          <div>
            <button type="button" @click="isArtifactSelectListShow = !isArtifactSelectListShow">
              {{ displayName('閉じる') }}
            </button>
          </div>
          <template v-for="item in artifactOwnArrCatId(artifactCatTabSelected)" :key="item.id">
            <ArtifactItem :artifact="item.artifact" :id="item.id" :score="item.score" control="selectable"
              :selected="artifactSelected(item.artifact)" @select:artifact="selectArtifact" />
          </template>
        </div>
        <!-- 新規聖遺物入力 -->
        <div v-if="isNewArtifactInputShow">
          <ArtifactItem :artifact="newArtifact" :id="0" control="editable" :initial="true"
            @update:artifact="updateNewArtifact" />
          <div>
            <button type="button" @click="newArtifactAddOnClick" :disabled="!isNewArtifactAddable">
              {{ displayName('適用') }}
            </button>
            <button type="button" @click="isNewArtifactInputShowEndProc">
              {{ displayName('キャンセル') }}
            </button>
          </div>
        </div>
        <!-- 聖遺物換装入力 -->
        <div v-if="isArtifactChangeInputShow">
          <ArtifactChangeInput :before="artifactBefore" :after="artifactAfter"
            @apply:artifact-change="applyArtifactChange" @cancel:artifact-change="cancelArtifactChange" />
        </div>
        <p>
          聖遺物の入れ替えではなく、0から設定する場合は、「全てクリア」を実行してから行ってください。
        </p>
      </div>
    </div>
  </div>
  <div>
    <ArtifactDetailOcrResult :visible="ocrResultVisible" :ocrResult="ocrResult"
      @cancel:artifact-detail-ocr-result="cancelArtifactDetailOcrResult"
      @accept:artifact-detail-ocr-result="acceptArtifactDetailOcrResult" />
  </div>
  <div v-show="false">
    <canvas id="artifact-stats-canvas" />
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import ArtifactDetailOcrResult from "@/components/ArtifactDetailOcrResult.vue";
import ArtifactItem from "@/components/ArtifactItem.vue";
import ArtifactChangeInput from "@/components/ArtifactChangeInput.vue";
import {
  TArtifactDetailInput,
  聖遺物メイン効果_時の砂ARRAY,
  聖遺物メイン効果_死の羽ARRAY,
  聖遺物メイン効果_理の冠ARRAY,
  聖遺物メイン効果_生の花ARRAY,
  聖遺物メイン効果_空の杯ARRAY,
  聖遺物優先するサブ効果ARRAY,
  makePrioritySubstatValueList,
  TArtifact,
  ARTIFACT_TEMPLATE,
} from "@/input";
import {
  calculateArtifactStats,
  calculateArtifactStatsMain,
  calculateArtifactSubStatByPriority,
} from "@/calculate";
import { GENSEN_MASTER_LIST, TArtifactSubKey, TGensen } from "@/master";
import { computed, defineComponent, nextTick, PropType, reactive, ref, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";
import { resizePinnedImage } from "@/gencalc_ocr";
import { TKeyValue, overwriteObject } from "@/common";

type TArtifactWithId = {
  id: number,
  artifact: TArtifact,
  score: number,
};

var nextId = 1;

export default defineComponent({
  name: 'ArtifactDetailInput',
  props: {
    visible: Boolean,
    artifactDetailInput: { type: Object as PropType<TArtifactDetailInput>, required: true, },
    isSubStatOnly: Boolean,
    nextStatRows: Array as PropType<any[]>,
  },
  components: {
    ArtifactDetailOcrResult,
    ArtifactItem,
    ArtifactChangeInput,
  },
  emits: ['update:artifact-detail'],
  setup(props, context) {
    const { displayName, targetValue, displayStatValue } = CompositionFunction();

    const STORAGE_KEY = 'artifact_list';

    const artifactDetailInputRea = reactive(props.artifactDetailInput as TArtifactDetailInput);

    const mainstats = reactive(artifactDetailInputRea.聖遺物メイン効果);
    const prioritySubstats = reactive(artifactDetailInputRea.聖遺物優先するサブ効果 as TArtifactSubKey[]);
    const prioritySubstatIndices = reactive(artifactDetailInputRea.聖遺物優先するサブ効果上昇値);
    const prioritySubstatCounts = reactive(artifactDetailInputRea.聖遺物優先するサブ効果上昇回数);
    const artifactStats = reactive(artifactDetailInputRea.聖遺物ステータス);
    const artifactStatsMain = reactive(artifactDetailInputRea.聖遺物ステータスメイン効果);
    const artifactStatsSub = reactive(artifactDetailInputRea.聖遺物ステータスサブ効果);
    const artifactList = reactive(artifactDetailInputRea.artifact_list);

    const artifactAfter = reactive(_.cloneDeep(ARTIFACT_TEMPLATE) as TArtifact);
    const artifactOwnArr = reactive([] as TArtifactWithId[]);
    const newArtifact = reactive(_.cloneDeep(ARTIFACT_TEMPLATE));

    const editableRef = ref(false);
    const gensenEnabledRef = ref(false);
    const gensenMasterList = GENSEN_MASTER_LIST;
    const gensenRef = ref(GENSEN_MASTER_LIST[2] as TGensen);
    const isArtifactSelectListShow = ref(false);
    const isArtifactChangeInputShow = ref(false);
    const isNewArtifactInputShow = ref(false);

    const artifactInputModeTab = ref('1');
    const artifactCatTabSelected = ref(1);
    const canInitializeStats = ref(false);

    const upTotalCount = computed(() => {
      let work = 0;
      for (let count of prioritySubstatCounts) {
        work += count;
      }
      return Math.min(45, 40 + Math.round(Math.max(0, (work - 12) / 4)));
    });

    const isNewArtifactAddable = computed(() => {
      if (!newArtifact.name) return false;
      if (!newArtifact.rarity) return false;
      if (!newArtifact.setname) return false;
      if (!newArtifact.cat_id) return false;
      if (!newArtifact.mainStat) return false;
      if (!newArtifact.mainStatValue) return false;
      for (const subStat of newArtifact.subStats) {
        if (!subStat.name) return false;
        if (!subStat.value) return false;
      }
      return true;
    });

    /** 優先するサブ効果上昇値のオプション値のリストを作成します */
    const prioritySubstatValueList = (index: number, opt_substat?: TArtifactSubKey) =>
      makePrioritySubstatValueList(prioritySubstats, index, opt_substat);
    const substatMin = (substat: string) =>
      substat in artifactStatsMain ? (artifactStatsMain as any)[substat] : 0;
    const substatStep = (substat: string) =>
      ['HP', '攻撃力', '防御力', '元素熟知'].includes(substat) ? 1 : 0.1;

    const artifactCatTabOnChange = () => {
      clearArtifactAfter();
      isArtifactSelectListShow.value = false;
    };

    const artifactListCat = computed(() => {
      const cat_id = Number(artifactCatTabSelected.value);
      const result = artifactList.filter((s: any) => s.cat_id == cat_id);
      return result;
    });

    const artifactBefore = computed(() => {
      const arr = artifactListCat.value;
      return arr.length > 0 ? arr[0] : undefined;
    });

    const artifactSelected = (artifact: TArtifact) => {
      return _.isEqual(artifact, artifactBefore.value);
    };

    function getEvaluationValue(artifactAfter: TArtifact) {
      let result = 0;
      if (props.nextStatRows) {
        props.nextStatRows.forEach(row => {
          artifactAfter.subStats.forEach(subStat => {
            if (subStat.name == row[0]) {
              result += subStat.value * row[4] / row[1][row[2]];
            }
          });
        });
      }
      return result;
    }

    function setScoreToArtifactOwnArr() {
      artifactOwnArr.forEach(e => {
        e.score = getEvaluationValue(e.artifact);
      });
    }

    const artifactOwnArrCatId = (cat_id: any) => {
      cat_id = Number(cat_id);
      const result = artifactOwnArr.filter(s => s.artifact.cat_id == cat_id);
      const tempArr = artifactList.filter((s: TArtifact) => s.cat_id == cat_id);
      const curArtifact = tempArr.length > 0 ? tempArr[0] : undefined;
      return result.sort((a, b) => {
        if (a.artifact.setname != b.artifact.setname) {
          if (curArtifact) {
            if (a.artifact.setname == curArtifact.setname) return -1;
            if (b.artifact.setname == curArtifact.setname) return 1;
            if (a.artifact.mainStat != b.artifact.mainStat) {
              if (a.artifact.mainStat == curArtifact.mainStat) return -1;
              if (b.artifact.mainStat == curArtifact.mainStat) return 1;
            }
          }
        } else if (a.artifact.mainStat != b.artifact.mainStat) {
          if (curArtifact) {
            if (a.artifact.mainStat == curArtifact.mainStat) return -1;
            if (b.artifact.mainStat == curArtifact.mainStat) return 1;
          }
        }
        return b.score - a.score;
      });
    };

    /** 個別設定：選択ボタンクリックイベント  */
    const artifactSelectOnClick = () => {
      isArtifactChangeInputShow.value = false;
      isNewArtifactInputShow.value = false;
      isArtifactSelectListShow.value = true;
    };

    /** 個別設定：新規ボタンクリックイベント  */
    const artifactNewOnClick = () => {
      overwriteObject(newArtifact, ARTIFACT_TEMPLATE);
      newArtifact.cat_id = Number(artifactCatTabSelected.value);
      isArtifactSelectListShow.value = false;
      isArtifactChangeInputShow.value = false;
      isNewArtifactInputShow.value = true;
    };

    /** 個別設定：解除ボタンクリックイベント  */
    const artifactRemoveOnClick = () => {
      clearArtifactAfter();
      isArtifactSelectListShow.value = false;
      isNewArtifactInputShow.value = false;
      isArtifactChangeInputShow.value = true;
    };

    /** 聖遺物リスト：選択イベント */
    const selectArtifact = (id: number) => {
      isArtifactSelectListShow.value = false;
      const selected = artifactOwnArr.filter(s => s.id == id);
      if (selected.length > 0) {
        overwriteObject(artifactAfter, selected[0].artifact);
        isArtifactChangeInputShow.value = true;
      }
      document.getElementById('artifact-sub-input')?.scrollIntoView({ behavior: 'smooth' });
    };

    /** 新規聖遺物：更新イベント */
    const updateNewArtifact = (id: number, artifact: TArtifact) => {
      console.log(artifact);
      if (id == 0) {
        overwriteObject(newArtifact, artifact);
      }
    };

    /** 新規聖遺物：適用ボタンクリックイベント */
    const newArtifactAddOnClick = () => {
      if (isNewArtifactInputShow.value) {
        overwriteObject(artifactAfter, newArtifact);
        isArtifactChangeInputShow.value = true;
      }
      isNewArtifactInputShowEndProc();
    };

    /** 新規聖遺物：キャンセルボタンクリックイベント */
    const isNewArtifactInputShowEndProc = () => {
      isNewArtifactInputShow.value = false;
    };

    /** 聖遺物換装：適用ボタンクリックイベント */
    const applyArtifactChange = async (isStatsChange: boolean, subStatArr: TKeyValue[]) => {
      isArtifactChangeInputShow.value = false;
      if (isStatsChange) {
        const mainStatBefore = artifactBefore.value?.mainStat;
        const mainStatValueBefore = artifactBefore.value?.mainStatValue;
        const mainStatAfter = artifactAfter?.mainStat;
        const mainStatValueAfter = artifactAfter?.mainStatValue;
        const rarityAfter = artifactAfter?.rarity;
        if (mainStatBefore && mainStatValueBefore) {
          (artifactStatsMain as any)[mainStatBefore] -= mainStatValueBefore;
        }
        if (mainStatAfter && mainStatValueAfter) {
          if (rarityAfter) {
            mainstats[Number(artifactCatTabSelected.value) - 1] = rarityAfter + '_' + mainStatAfter;
          }
          (artifactStatsMain as any)[mainStatAfter] += mainStatValueAfter;
        }
        for (const subStat of subStatArr) {
          (artifactStatsSub as any)[subStat.key] += subStat.value;
        }
      }
      if (artifactAfter?.name) {
        const exists = artifactList.filter(s => s.cat_id == Number(artifactCatTabSelected.value)).length;
        if (exists > 0) {
          for (let i = 0; i < artifactList.length; i++) {
            if (artifactList[i].cat_id == Number(artifactCatTabSelected.value)) {
              artifactList.splice(i, 1, _.cloneDeep(artifactAfter));
              break;
            }
          }
        } else {
          artifactList.push(_.cloneDeep(artifactAfter));
        }
      } else {
        for (let i = 0; i < artifactList.length; i++) {
          if (artifactList[i].cat_id == Number(artifactCatTabSelected.value)) {
            artifactList.splice(i, 1);
            break;
          }
        }
      }
      clearArtifactAfter();
      _calculateArtifactStatsMain();
      calculateArtifactStats(artifactDetailInputRea);
      await nextTick();
      context.emit('update:artifact-detail', artifactDetailInputRea);
    };

    /** 聖遺物換装：キャンセルボタンクリックイベント */
    const cancelArtifactChange = () => {
      clearArtifactAfter();
      isArtifactChangeInputShow.value = false;
    };

    const clearArtifactAfter = () => {
      overwriteObject(artifactAfter, ARTIFACT_TEMPLATE);
    };

    /** 聖遺物ステータスを計算します（メイン効果） */
    const _calculateArtifactStatsMain = () => {
      calculateArtifactStatsMain(artifactStatsMain, mainstats);
    };

    /** 聖遺物ステータスを計算します（優先するサブ効果） */
    const _calculateArtifactStatsPrioritySub = () => {
      if (artifactDetailInputRea.聖遺物優先するサブ効果Disabled) return;
      const prioritySubstatValues = [];
      for (let i = 0; i < artifactDetailInputRea.聖遺物優先するサブ効果.length; i++) {
        prioritySubstatValues.push(prioritySubstatValueList(i));
      }
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
    const updateMainstats = async () => {
      _calculateArtifactStatsMain();
      calculateArtifactStats(artifactDetailInputRea);
      await nextTick();
      context.emit('update:artifact-detail', artifactDetailInputRea);
    };

    /** サブ効果が更新されました */
    const artifactStatsOnChange = async (opt_stat?: any, opt_value?: string) => {
      Object.keys(artifactStats)
        .filter((s) => !opt_stat || s == opt_stat)
        .forEach((key) => {
          if (key == opt_stat && opt_value !== undefined)
            (artifactStatsSub as any)[key] = Number(opt_value);
          (artifactStatsSub as any)[key] = (artifactStats as any)[key] - (artifactStatsMain as any)[key];
          if ((artifactStatsSub as any)[key] < 0) {
            (artifactStatsSub as any)[key] = 0;
            (artifactStats as any)[key] = (artifactStatsMain as any)[key];
          }
        });
      calculateArtifactStats(artifactDetailInputRea);
      await nextTick();
      context.emit('update:artifact-detail', artifactDetailInputRea);
    };

    /** サブ効果が更新されました */
    const artifactStatsSubOnChange = async () => {
      calculateArtifactStats(artifactDetailInputRea);
      await nextTick();
      context.emit('update:artifact-detail', artifactDetailInputRea);
    };

    /** 優先するサブ効果が更新されました */
    const updatePrioritySubstats = async () => {
      artifactDetailInputRea.聖遺物優先するサブ効果Disabled = false;
      _calculateArtifactStatsPrioritySub();
      calculateArtifactStats(artifactDetailInputRea);
      await nextTick();
      context.emit('update:artifact-detail', artifactDetailInputRea);
    };

    /** 厳選目安が選択されました */
    const gensenOnChange = async () => {
      artifactDetailInputRea.聖遺物優先するサブ効果Disabled = false;
      gensenEnabledRef.value = false;
      if (!gensenRef.value) return;
      if (!gensenRef.value.key) return;
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
      await nextTick();
      context.emit('update:artifact-detail', artifactDetailInputRea);
    };

    /** 聖遺物ステータスサブ効果をクリアします */
    const initializeArtifactStatsSub = async () => {
      artifactDetailInputRea.聖遺物優先するサブ効果Disabled = true;
      for (const stat of Object.keys(artifactStatsSub)) {
        (artifactStatsSub as any)[stat] = 0;
      }
      calculateArtifactStats(artifactDetailInputRea);
      await nextTick();
      context.emit('update:artifact-detail', artifactDetailInputRea);
    };

    /** 聖遺物詳細OCR機能 */
    const isScanning = ref(false);
    const ocrResultVisible = ref(false);
    const ocrResult = reactive({} as { [key: string]: number });
    const loadArtifactStatsByOcr = async (event: Event) => {
      isScanning.value = true;
      const workOcrResult = await resizePinnedImage(event);
      isScanning.value = false;
      if (workOcrResult) {
        overwriteObject(ocrResult, workOcrResult);
        ocrResultVisible.value = true;
      }
    };
    const cancelArtifactDetailOcrResult = () => {
      ocrResultVisible.value = false;
    };
    const acceptArtifactDetailOcrResult = () => {
      cancelArtifactDetailOcrResult();
      if (ocrResult) {
        artifactDetailInputRea.聖遺物優先するサブ効果Disabled = true;
        for (const stat of Object.keys(artifactStatsSub)) {
          if (stat in ocrResult) (artifactStatsSub as any)[stat] = ocrResult[stat];
          else (artifactStatsSub as any)[stat] = 0;
        }
        for (const [index, stat] of mainstats.entries()) {
          if (stat.endsWith('ダメージバフ') || stat == '与える治療効果') continue;
          mainstats.splice(index, 1, '');
        }
        updateMainstats();
      }
    };

    const initializeAll = async () => {
      canInitializeStats.value = false;
      for (let i = 0; i < mainstats.length; i++) {
        mainstats[i] = '';
      }
      _calculateArtifactStatsMain();
      await initializeArtifactStatsSub();
      artifactList.splice(0, artifactList.length);
    }

    const onLoad = () => {
      if (STORAGE_KEY in localStorage) {
        const value: any[] = JSON.parse(localStorage[STORAGE_KEY]);
        const newArr = value.filter(s => 'setname' in s).map(s => ({ id: nextId++, artifact: s, score: 0 }));
        artifactOwnArr.splice(0, artifactOwnArr.length, ...newArr);
        setScoreToArtifactOwnArr();
      }
    };
    onLoad();

    watch(props, (newVal) => {
      if (newVal.nextStatRows) {
        setScoreToArtifactOwnArr();
      }
    });

    return {
      displayName,
      targetValue,
      displayStatValue,

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
      artifactStatsSub,
      upTotalCount,
      editableRef,
      gensenEnabledRef,
      gensenRef,
      gensenMasterList,
      gensenOnChange,
      artifactStatsOnChange,
      artifactStatsSubOnChange,
      updateMainstats,
      updatePrioritySubstats,

      isArtifactSelectListShow,
      isArtifactChangeInputShow,
      isNewArtifactInputShow,
      artifactListCat,
      artifactOwnArrCatId,
      newArtifact,
      isNewArtifactAddable,

      artifactCatTabOnChange,
      artifactSelectOnClick,
      artifactNewOnClick,
      artifactRemoveOnClick,

      artifactInputModeTab,
      artifactCatTabSelected,
      artifactBefore,
      artifactAfter,
      selectArtifact,
      artifactSelected,
      updateNewArtifact,
      applyArtifactChange,
      cancelArtifactChange,
      newArtifactAddOnClick,
      isNewArtifactInputShowEndProc,

      loadArtifactStatsByOcr,
      isScanning,
      ocrResultVisible,
      ocrResult,
      cancelArtifactDetailOcrResult,
      acceptArtifactDetailOcrResult,
      initializeArtifactStatsSub,

      canInitializeStats,
      initializeAll,
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

table.detail {
  width: 100%;
  table-layout: fixed;
  margin-top: 10px;
  border-collapse: collapse;
}

table.detail tr {
  border-bottom: 1px solid gray;
}

table.priority-substat {
  width: 100%;
  table-layout: auto;
  margin-top: 0;
  border: none;
}

table.detail th,
table.detail td {
  text-align: right;
  white-space: nowrap;
  padding-right: 4px;
  line-height: 3.3rem;
}

table.detail th,
table.priority-substat th {
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

.wait-icon {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 100;
}

label.button {
  color: #222;
  background-color: #ddd;
  padding: 2px 5px;
  border-radius: 5px;
  border: 2px gray solid;
}

.tab-switch label {
  color: blanchedalmond;
}

.sub-input {
  margin-bottom: 10px;
}

.cat-select {
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 10px;
}

.cat-select label {
  margin-left: 3px;
  margin-right: 3px;
}

.cat-select img {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
}

:checked+img {
  background-color: rgb(156, 140, 49);
}

label+button {
  width: 10rem;
}
</style>
