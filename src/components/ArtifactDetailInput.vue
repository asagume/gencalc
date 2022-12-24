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
              <input v-if="editableRef" type="number" v-model="artifactStatsSub['HP']" :min="0"
                :step="substatStep('HP')" @change="artifactStatsSubOnChange" />
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

    <div class="sub-input">
      <fieldset v-if="artifactInputModeTab == '1'">
        <table class="priority-substat">
          <tr>
            <th>{{ displayName('優先するサブ効果') }}</th>
            <th>{{ displayName('上昇値') }}</th>
            <th>{{ displayName('初期+強化') }}</th>
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
        <template v-for="(artifact, index) in artifactListCat(artifactCatTabSelected)" :key="index">
          <ArtifactItem :artifact="artifact" />
          <div>
            <button type="button" @click="artifactEquipOnClick">
              {{ displayName('変更') }}
            </button>
            <button v-if="artifact.name" type="button" @click="artifactRemoveOnClick">
              {{ displayName('解除') }}
            </button>
          </div>
        </template>
        <template v-if="artifactListCat(artifactCatTabSelected).length == 0">
          <button type="button" @click="artifactReplaceOnClick">
            {{ displayName('装備') }}
          </button>
        </template>
        <div v-if="isArtifactSelectListShow" class="artifact-select-list">
          <template v-for="item in artifactOwnArrCatId(artifactCatTabSelected)" :key="item.id">
            <ArtifactItem :artifact="item.artifact" :id="item.id" :controls="['select']"
              @select:artifact="selectArtifact" />
          </template>
        </div>
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
  聖遺物ステータスTEMPLATE,
} from "@/input";
import {
  calculateArtifactStats,
  calculateArtifactStatsMain,
  calculateArtifactSubStatByPriority,
} from "@/calculate";
import { ARTIFACT_SET_MASTER, GENSEN_MASTER_LIST, TArtifactSubKey, TGensen } from "@/master";
import { computed, defineComponent, nextTick, PropType, reactive, ref, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";
import { resizePinnedImage } from "@/gencalc_ocr";
import { overwriteObject } from "@/common";

type TArtifactWithId = {
  id: number,
  artifact: TArtifact,
};

var nextId = 1;

export default defineComponent({
  name: 'ArtifactDetailInput',
  props: {
    visible: Boolean,
    artifactDetailInput: {
      type: Object as PropType<TArtifactDetailInput>,
      required: true,
    },
    isSubStatOnly: { type: Boolean },
  },
  components: {
    ArtifactDetailOcrResult,
    ArtifactItem,
  },
  emits: ['update:artifact-detail'],
  setup(props, context) {
    const { displayName, targetValue, displayStatValue } = CompositionFunction();

    const STORAGE_KEY = 'artifact_list';

    const artifactDetailInputRea = reactive(props.artifactDetailInput as TArtifactDetailInput);

    const mainstats = reactive(artifactDetailInputRea.聖遺物メイン効果);
    const prioritySubstats = reactive(
      artifactDetailInputRea.聖遺物優先するサブ効果 as TArtifactSubKey[]
    );
    const prioritySubstatIndices = reactive(
      artifactDetailInputRea.聖遺物優先するサブ効果上昇値
    );
    const prioritySubstatCounts = reactive(
      artifactDetailInputRea.聖遺物優先するサブ効果上昇回数
    );
    const artifactStats = reactive(artifactDetailInputRea.聖遺物ステータス);
    const artifactStatsMain = reactive(artifactDetailInputRea.聖遺物ステータスメイン効果);
    const artifactStatsSub = reactive(artifactDetailInputRea.聖遺物ステータスサブ効果);
    const artifactList = reactive(artifactDetailInputRea.artifact_list);

    const artifactOwnArr = reactive([] as TArtifactWithId[]);

    const editableRef = ref(false);
    const gensenEnabledRef = ref(false);
    const gensenMasterList = GENSEN_MASTER_LIST;
    const gensenRef = ref(GENSEN_MASTER_LIST[2] as TGensen);
    const isArtifactSelectListShow = ref(false);

    const artifactInputModeTab = ref('1');
    const artifactCatTabSelected = ref(1);

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
      substat in artifactStatsMain ? (artifactStatsMain as any)[substat] : 0;
    const substatStep = (substat: string) =>
      ['HP', '攻撃力', '防御力', '元素熟知'].includes(substat) ? 1 : 0.1;

    const artifactCatTabOnChange = () => {
      isArtifactSelectListShow.value = false;
    };

    const artifactListCat = (cat_id: any) => {
      const result = artifactList.filter(s => s.cat_id == Number(cat_id));
      return result;
    };

    const artifactEquipOnClick = () => {
      isArtifactSelectListShow.value = true;
    };

    const artifactRemoveOnClick = () => {
      const cat_id = artifactCatTabSelected.value;
      const newArtifactList = artifactList.filter(s => s.cat_id != Number(cat_id));
      artifactList.splice(0, artifactList.length, ...newArtifactList);
      context.emit('update:artifact-detail', artifactDetailInputRea);
    };

    const artifactReplaceOnClick = () => {
      isArtifactSelectListShow.value = true;
    };

    const selectArtifact = (id: number) => {
      const selected = artifactOwnArr.filter(s => s.id == id);
      if (selected.length > 0) {
        const exists = artifactList.filter(s => s.cat_id == artifactCatTabSelected.value).length;
        if (exists) {
          for (let i = 0; i < artifactList.length; i++) {
            if (artifactList[i].cat_id == artifactCatTabSelected.value) {
              artifactList.splice(i, 1, _.cloneDeep(selected[0].artifact));
              break;
            }
          }
        } else {
          artifactList.push(_.cloneDeep(selected[0].artifact));
        }
        context.emit('update:artifact-detail', artifactDetailInputRea);
      }
      isArtifactSelectListShow.value = false;
    };

    const artifactOwnArrCatId = (cat_id: any) => {
      const result = artifactOwnArr.filter(s => s.artifact.cat_id == Number(cat_id))
      return result.sort((a, b) => {
        if (a.artifact.setname != b.artifact.setname) {
          const setNameArr = Object.keys(ARTIFACT_SET_MASTER);
          const aIndex = setNameArr.indexOf(a.artifact.setname);
          const bIndex = setNameArr.indexOf(b.artifact.setname);
          return aIndex - bIndex;
        }
        if (a.artifact.mainStat != b.artifact.mainStat) {
          const statNameArr = Object.keys(聖遺物ステータスTEMPLATE);
          const aIndex = a.artifact.mainStat ? statNameArr.indexOf(a.artifact.mainStat) : -1;
          const bIndex = b.artifact.mainStat ? statNameArr.indexOf(b.artifact.mainStat) : -1;
          return aIndex - bIndex;
        }
        return 0;
      });
    };

    /** 聖遺物ステータスを計算します（メイン効果） */
    const _calculateArtifactStatsMain = () => {
      calculateArtifactStatsMain(artifactStatsMain, mainstats);
    };

    /** 聖遺物ステータスを計算します（優先するサブ効果） */
    const _calculateArtifactStatsPrioritySub = () => {
      if (artifactDetailInputRea.聖遺物優先するサブ効果Disabled) return;
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

    const onLoad = () => {
      if (STORAGE_KEY in localStorage) {
        const value: any[] = JSON.parse(localStorage[STORAGE_KEY]);
        const newArr = value.filter(s => 'setname' in s).map(s => ({ id: nextId++, artifact: s }));
        artifactOwnArr.splice(0, artifactOwnArr.length, ...newArr);
      }
    };
    onLoad();

    watch(props, (newVal, oldVal) => {
      if (!_.isEqual(newVal.artifactDetailInput.artifact_list, oldVal?.artifactDetailInput?.artifact_list)) {
        for (let i = 1; i <= 5; i++) {
          artifactListCat(i);
        }
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

      artifactCatTabOnChange,
      artifactListCat,
      artifactEquipOnClick,
      artifactRemoveOnClick,
      artifactReplaceOnClick,
      isArtifactSelectListShow,
      artifactOwnArrCatId,
      selectArtifact,

      artifactInputModeTab,
      artifactCatTabSelected,

      loadArtifactStatsByOcr,
      isScanning,
      ocrResultVisible,
      ocrResult,
      cancelArtifactDetailOcrResult,
      acceptArtifactDetailOcrResult,
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
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
}

:checked+img {
  background-color: rgb(156, 140, 49);
}
</style>
