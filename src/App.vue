<template>
  <div class="base-container">
    <div class="pane1">
      <TitleAndHeader />
    </div>

    <div class="pane2">
      <CharacterSelect :character="characterInputRea.character" :visible="characterSelectVisibleRef"
        @update:character="updateCharacter($event)" />
    </div>

    <div class="pane3" style="margin-bottom: 15px">
      <CharacterInput ref="characterInputVmRef" :characterInput="characterInputRea"
        :recommendation-list="recommendationListRea" :recommendation="recommendationRef"
        :builddata-savable="builddataSavable" :artifact-set-select-visible="artifactSetSelectVisibleRef"
        :artifact-score="artifactScore" @open:character-select="openCharacterSelect"
        @save-to-storage="saveToStorage($event)" @remove-from-storage="removeFromStorage($event)"
        @update:recommendation="updateRecommendation($event)" @open:weapon-select="openWeaponSelect"
        @open:artifact-set-select="openArtifactSetSelect($event)" @open:artifact-detail-input="openArtifactDetailInput"
        @update:character-input-character="updateCharacterInputCharacter($event)"
        @update:character-input-weapon="updateCharacterInputWeapon($event)"
        @open:character-info="openCharacterInfo($event)" />
    </div>

    <div class="pane4">
      <CharacterInfo :visible="characterInfoVisibleRef" :mode="characterInfoModeRef"
        :character-master="characterInputRea.characterMaster" :ascension="characterInputRea.突破レベル"
        :level="characterInputRea.レベル" :normal-attack-level="characterInputRea.通常攻撃レベル"
        :elemental-skill-level="characterInputRea.元素スキルレベル" :elemental-burst-level="characterInputRea.元素爆発レベル"
        :normal-attack-replacing="normalAttackReplacing" />
      <WeaponSelect :visible="weaponSelectVisibleRef" :weapon="characterInputRea.weapon" :weapon-type="weaponType"
        :weapon-master="characterInputRea.weaponMaster" :ascension="characterInputRea.武器突破レベル"
        :level="characterInputRea.武器レベル" @update:weapon="updateWeapon($event)" />
      <ArtifactSetSelect :visible="artifactSetSelectVisibleRef" :index="artifactSetIndexRef"
        :artifact-set="artifactSets[artifactSetIndexRef]" :artifact-set-masters="characterInputRea.artifactSetMasters"
        @update:artifact-set="updateArtifactSet($event)" />
      <ArtifactDetailInput ref="artifactDetailInputVmRef" :visible="artifactDetailInputVisibleRef"
        :artifact-detail-input="artifactDetailInputRea" :is-sub-stat-only="isSubStatOnly" :next-stat-rows="nextStatRows"
        @update:artifact-detail="updateArtifactDetail($event)" />
      <ArtifactScoreFormula ref="artifactScoreFormulaVmRef" :visible="artifactDetailInputVisibleRef"
        @apply:formula="applyArtifactScoreFormula" />
    </div>

    <div class="pane6">
      <div>
        <input class="hidden" id="pane6-toggle-1" type="checkbox" v-model="pane6Toggle1Ref" />
        <label class="toggle-switch" for="pane6-toggle-1">
          {{ displayName('オプション条件') }}
        </label>
        <input class="hidden" id="pane6-toggle-2" type="checkbox" v-model="pane6Toggle2Ref" />
        <label class="toggle-switch" for="pane6-toggle-2">
          {{ displayName('ステータス') }}
        </label>
        <input class="hidden" id="pane6-toggle-3" type="checkbox" v-model="pane6Toggle3Ref" />
        <label class="toggle-switch" for="pane6-toggle-3">
          {{ displayName('バフ/デバフ') }}
        </label>
      </div>
      <div v-if="pane6Toggle1Ref" style="margin-bottom: 10px">
        <ConditionInput ref="conditionInputVmRef" :character-input="characterInputRea"
          @update:condition="updateCondition" />
      </div>
      <div v-if="pane6Toggle2Ref" style="margin-bottom: 10px">
        <div class="tab-switch">
          <input id="status-input-tab-1" type="radio" value="1" v-model="statInputTabRef" />
          <label for="status-input-tab-1"> {{ displayName('ステータス1') }} </label>
          <input id="status-input-tab-2" type="radio" value="2" v-model="statInputTabRef" />
          <label for="status-input-tab-2"> {{ displayName('ステータス2') }} </label>
          <input id="status-input-tab-3" type="radio" value="3" v-model="statInputTabRef" />
          <label for="status-input-tab-3"> {{ displayName('敵') }} </label>
        </div>
        <div v-show="statInputTabRef == 1">
          <StatsInput :stats-input="statsInput" :category1-list="CHARACTER_STATS_CATEGORY1_LIST"
            :category2List="CHARACTER_STATS_CATEGORY2_LIST" @update:stat-adjustments="updateStatAdjustments" />
        </div>
        <div v-show="statInputTabRef == 2">
          <StatsInput :stats-input="statsInput" :category1-list="CHARACTER_STATS2_CATEGORY1_LIST"
            :category2-list="CHARACTER_STATS2_CATEGORY2_LIST" @update:stat-adjustments="updateStatAdjustments" />
        </div>
        <div v-show="statInputTabRef == 3">
          <label class="enemy">
            <select v-model="selectedEnemyRef" @change="updateEnemy">
              <option v-for="item in ENEMY_LIST" :value="item" :key="item.key">
                {{ displayName(item.key) }}
              </option>
            </select>
          </label>
          <label class="enemy-level">Lv.
            <input type="number" v-model="statsInput.statAdjustments['敵レベル']" min="1"
              @change="updateStatAdjustments()" />
          </label>
          <StatsInput :stats-input="statsInput" :category1-list="ENEMY_STATS_CATEGORY1_LIST"
            :category2-list="ENEMY_STATS_CATEGORY2_LIST" @update:stat-adjustments="updateStatAdjustments" />
        </div>
        <div>
          <NextStat ref="nextStatVmRef" :visible="true" :character-input="characterInputRea"
            :artifact-detail-input="artifactDetailInputRea" :condition-input="conditionInputRea"
            :option-input="optionInputRea" :stats-input="statsInput" :damage-result="damageResult"
            :rotation-damage-info="rotationDamageInfo" @update:stat-adjustments="updateNextStatAdjustments"
            @update:next-stat-rows="updateNextStatRows" />
        </div>
      </div>
      <div v-if="pane6Toggle3Ref" style="margin-bottom: 10px">
        <div class="tab-switch">
          <input id="option-input-tab-1" type="radio" value="1" v-model="optionInputTabRef" />
          <label for="option-input-tab-1"> {{ displayName('チーム強化') }} </label>
          <input id="option-input-tab-2" type="radio" value="2" v-model="optionInputTabRef" />
          <label for="option-input-tab-2"> {{ displayName('チーム') }} </label>
          <input id="option-input-tab-3" type="radio" value="3" v-model="optionInputTabRef" />
          <label for="option-input-tab-3"> {{ displayName('その他') }} </label>
        </div>
        <EasyTeamInput :character="characterInputRea.character" :team-members="optionInputRea.teamMembers"
          @update:team-members="updateTeamMembers" />
        <div v-show="optionInputTabRef == 1">
          <ElementalResonanceInput ref="elementalResonanceInputVmRef" :option-input="optionInputRea"
            :character="characterInputRea.character" :team-members="optionInputRea.teamMembers"
            @update:elemental-resonance="updateElementalResonance" />
        </div>
        <div v-if="optionInputTabRef == 2">
          <TeamOptionInput ref="teamOptionInputVmRef" :character="characterInputRea.character"
            :team-members="optionInputRea.teamMembers" :condition-input="optionInputRea.teamOption"
            @update:team-option="updateTeamOption" @update:buildname-selection="updateBuildnameSelection"
            @update:team-members="updateTeamMembers" />
        </div>
        <div v-if="optionInputTabRef == 3">
          <MiscOptionInput ref="miscOptionInputVmRef" :condition-input="optionInputRea.miscOption"
            @update:misc-option="updateMiscOption" />
        </div>
      </div>
    </div>

    <div class="result-pane">
      <DamageResult ref="damageResultVmRef" :damage-result="damageResult" />
    </div>

    <div class="pane5">
      <RotationDamage :character-master="characterInputRea.characterMaster" :damage-result="damageResult"
        @update:rotation-damage="updateRotationDamage" />

      <ShareSns @share:twitter="openTwitter" />
    </div>

    <div class="bottom-pane">
      <h2>
        <input class="hidden" id="own-list-toggle-1" type="checkbox" v-model="ownListToggle1Ref" />
        <label class="toggle-switch no-border" for="own-list-toggle-1">
          {{ displayName('キャラクター所持状況') }}
        </label>
      </h2>
      <CharacterOwnList v-if="ownListToggle1Ref" />
      <h2>
        <input class="hidden" id="own-list-toggle-2" type="checkbox" v-model="ownListToggle2Ref" />
        <label class="toggle-switch no-border" for="own-list-toggle-2">
          {{ displayName('武器所持状況') }}
        </label>
      </h2>
      <WeaponOwnList v-if="ownListToggle2Ref" />
      <h2>
        <input class="hidden" id="own-list-toggle-3" type="checkbox" v-model="ownListToggle3Ref" />
        <label class="toggle-switch no-border" for="own-list-toggle-3">
          {{ displayName('聖遺物所持状況') }}
        </label>
      </h2>
      <ArtifactOwnList v-if="ownListToggle3Ref" />

      <hr />
      <label>
        <input type="checkbox" v-model="enableClearLocalStorage" />
        <span>{{ displayName('ローカルストレージをクリアする') }}</span>
      </label>
      <button type="button" @click="clearLocalStorage" :disabled="!enableClearLocalStorage">
        {{ displayName('実行') }}
      </button>
      <p>{{ displayName('全ての保存データを削除します') }}</p>
    </div>

    <div class="pane7">
      <AboutMyApp />
      <ConfigurationInput :configuration-input="configurationInputRea"
        @update:configuration-input="updateConfigurationInput"
        @order:initialize-artifact-stats-sub="orderInitializeArtifactStatsSub" />
    </div>

    <hr />

    <div class="footer">
      <hr />
      <p>© 2021 asagume</p>
      <p class="left">
        本サイト内の画像はHoYoverse/COGNOSPHEREの著作物です。 Copyright © COGNOSPHERE. All
        Rights Reserved.
      </p>
    </div>
  </div>

  <div id="debug-info" v-if="false">
    <hr />
    <h2>DEBUG</h2>
    <template v-if="characterInputRea">
      <dl v-for="(dd, index) in myDamageDatailArr.filter((s) => s)" :key="index">
        <template v-for="key in objectKeys(dd)" :key="key">
          <template v-if="getValue(dd, key)">
            <dt>{{ key }}</dt>
            <dd>
              <ol v-if="Array.isArray(getValue(dd, key))">
                <li v-for="item in getValue(dd, key)" :key="item">
                  {{ item }}
                </li>
              </ol>
              <div v-else>
                {{ getValue(dd, key) }}
              </div>
            </dd>
          </template>
        </template>
      </dl>
    </template>
    <hr />
    <template v-if="statsInput">
      <table>
        <tbody>
          <tr v-for="stat in Object.keys(statsInput.statsObj)" :key="stat">
            <th style="text-align: right">{{ stat }}</th>
            <td style="text-align: right">{{ statsInput.statsObj[stat] }}</td>
          </tr>
        </tbody>
      </table>
    </template>
    <hr />
    <template v-if="conditionInput">
      <table>
        <tbody>
          <tr v-for="condition in Object.keys(conditionInput.conditionValues)" :key="condition">
            <th style="text-align: right">{{ condition }}</th>
            <td style="text-align: right">{{ conditionInput.conditionValues[condition] }}</td>
          </tr>
        </tbody>
      </table>
    </template>
    <hr />
    {{ HTML_LOGGER }}
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { computed, defineComponent, nextTick, onMounted, PropType, reactive, ref } from 'vue';
import TitleAndHeader from '@/components/TitleAndHeader.vue';
import CharacterSelect from '@/components/CharacterSelect.vue';
import CharacterInput from '@/components/CharacterInput.vue';
import CharacterInfo from '@/components/CharacterInfo.vue';
import WeaponSelect from '@/components/WeaponSelect.vue';
import ArtifactSetSelect from '@/components/ArtifactSetSelect.vue';
import ArtifactDetailInput from '@/components/ArtifactDetailInput.vue';
import ConditionInput from '@/components/ConditionInput.vue';
import StatsInput from '@/components/StatsInput.vue';
import NextStat from '@/components/NextStat.vue';
import EasyTeamInput from '@/components/EasyTeamInput.vue';
import ElementalResonanceInput from '@/components/ElementalResonanceInput.vue';
import TeamOptionInput from '@/components/TeamOptionInput.vue';
import MiscOptionInput from '@/components/MiscOptionInput.vue';
import DamageResult from '@/components/DamageResult.vue';
import RotationDamage from '@/components/RotationDamage.vue';
import ShareSns from '@/components/ShareSns.vue';
import AboutMyApp from '@/components/AboutMyApp.vue';
import ConfigurationInput from '@/components/ConfigurationInput.vue';
import CharacterOwnList from '@/components/CharacterOwnList.vue';
import WeaponOwnList from '@/components/WeaponOwnList.vue';
import ArtifactOwnList from '@/components/ArtifactOwnList.vue';
import {
  getDefaultArtifactDetailInput,
  getDefaultCharacterInput,
  getDefaultConditionInput,
  getDefaultDamageResultInput,
  getDefaultOptionInput,
  getDefaultStatsInput,
  getMaxConstellation,
  loadRecommendation,
  makeArtifactScoringStorageKey,
  makeBuildStorageKey,
  makeDamageDetailObjArrObjArtifactSets,
  makeDamageDetailObjArrObjCharacter,
  makeDamageDetailObjArrObjElementalResonance,
  makeDamageDetailObjArrObjWeapon,
  makeDefaultBuildname,
  makeOptionStorageKey,
  makeOptionsSavedata,
  makePrioritySubstatValueList,
  makeRecommendationList,
  makeSavedata,
  setupConditionValues,
  setupTeamOption,
  shareByTwitter,
  TArtifact,
  TArtifactDetailInput,
  TCharacterInput,
  TConditionInput,
  TConditionValues,
  TRecommendation,
  TStats,
  updateConditionsByTeam,
  updateNumberConditionValues,
  updateOptionsElementalResonanceByTeam,
  ステータスチーム内最高ARRAY,
  setupMiscOption,
  TOptionInput,
} from '@/input';
import {
  ARTIFACT_SCORE_FORMULA_TEMPLATE,
  ARTIFACT_SET_MASTER,
  CHARACTER_MASTER,
  ENEMY_MASTER_LIST,
  getCharacterMasterDetail,
  getWeaponMasterDetail,
  TAnyObject,
  TArtifactScoreFormula,
  TArtifactSet,
  TArtifactSetEntry,
  TArtifactSetKey,
  TCharacterKey,
  TWeaponKey,
} from '@/master';
import {
  calculateArtifactScore,
  calculateArtifactStats,
  calculateArtifactStatsMain,
  calculateArtifactSubStatByPriority,
  calculateElementalResonance,
  calculateMiscStatsAdjustments,
  calculateStats,
  setupTeamOptionSupporter,
  calculateTeamStatsAdjustments,
  TRotationDamageInfo,
  calculateDamageResultLunarReaction,
} from '@/calculate';
import { overwriteObject } from '@/common';
import { calculateDamageResult } from '@/calculate';
import CompositionFunction from '@/components/CompositionFunction.vue';
import ArtifactScoreFormula from './components/ArtifactScoreFormula.vue';

type TSavedSupporter = {
  key: string,
  value: string,
  buildname: string,
}

export default defineComponent({
  name: 'App',
  props: {
    characterInput: { type: Object as PropType<TCharacterInput>, required: true, },
    artifactDetailInput: { type: Object as PropType<TArtifactDetailInput>, required: true, },
    conditionInput: { type: Object as PropType<TConditionInput>, required: true, },
    recommendationList: { type: Array as PropType<TRecommendation[]>, required: true, },
    recommendation: { type: Object as PropType<TRecommendation>, required: true, },
    urldata: { type: Object as PropType<TAnyObject>, },
    teamMembers: { type: Array as PropType<string[]>, }
  },
  components: {
    AboutMyApp,
    ArtifactDetailInput,
    ArtifactOwnList,
    ArtifactScoreFormula,
    ArtifactSetSelect,
    CharacterInfo,
    CharacterInput,
    CharacterOwnList,
    CharacterSelect,
    ConditionInput,
    ConfigurationInput,
    DamageResult,
    EasyTeamInput,
    ElementalResonanceInput,
    MiscOptionInput,
    NextStat,
    RotationDamage,
    ShareSns,
    StatsInput,
    TeamOptionInput,
    TitleAndHeader,
    WeaponOwnList,
    WeaponSelect,
  },
  setup(props) {
    const { setI18nLanguage, displayName } = CompositionFunction();

    const HTML_LOGGER = ref([] as any[]);

    const CHARACTER_KEYS = Object.keys(CHARACTER_MASTER);
    const CHARACTER_STATS_CATEGORY1_LIST = ['基本ステータス', '高級ステータス'];
    const CHARACTER_STATS_CATEGORY2_LIST = ['元素ステータス·ダメージ', 'ダメージバフ', '実数ダメージ加算', '元素反応バフ'];
    const CHARACTER_STATS2_CATEGORY1_LIST = ['基礎ステータス', '元素ステータス·耐性'];
    const CHARACTER_STATS2_CATEGORY2_LIST = ['その他', 'ステータス連動', 'チーム内最高値'];
    const ENEMY_STATS_CATEGORY1_LIST = ['敵ステータス·元素耐性'];
    const ENEMY_STATS_CATEGORY2_LIST = ['敵ステータス·その他'];
    const ENEMY_LIST = ENEMY_MASTER_LIST;

    const characterSelectVmRef = ref();
    const characterInputVmRef = ref();
    const artifactDetailInputVmRef = ref();
    const conditionInputVmRef = ref();
    const elementalResonanceInputVmRef = ref();
    const teamOptionInputVmRef = ref();
    const miscOptionInputVmRef = ref();
    const artifactScoreFormulaVmRef = ref();
    const damageResultVmRef = ref();
    const nextStatVmRef = ref();

    const characterInputRea = reactive(getDefaultCharacterInput());
    const artifactDetailInputRea = reactive(getDefaultArtifactDetailInput());
    const conditionInputRea = reactive(getDefaultConditionInput());
    const optionInputRea = reactive(getDefaultOptionInput());
    const statsInput = reactive(getDefaultStatsInput());
    const selectedEnemyRef = ref(ENEMY_LIST[0]);  // 選択中の敵
    const damageResult = reactive(getDefaultDamageResultInput());
    const recommendationListRea = reactive([] as TRecommendation[]);  // おすすめセットの候補
    const recommendationRef = ref({} as TRecommendation); // おすすめセット
    const buildnameSelectionRea = reactive({} as TAnyObject);
    const configurationInputRea = reactive({
      全武器解放: false,
      聖遺物詳細サブ効果オンリー: false,
      聖遺物サブ効果計算停止: false,
    } as TAnyObject);
    const artifactScoringStats = reactive(_.cloneDeep(ARTIFACT_SCORE_FORMULA_TEMPLATE[0]) as TArtifactScoreFormula);
    const savedSupporters = reactive([] as TSavedSupporter[]);
    const defaultSupporterOptionInput = getDefaultOptionInput();
    const nextStatRows = reactive([] as any[]);
    const rotationDamageInfo = reactive({
      totalDamage: 0,
      rotationDamages: [],
    } as TRotationDamageInfo);

    overwriteObject(characterInputRea, props.characterInput);
    overwriteObject(artifactDetailInputRea, props.artifactDetailInput);
    overwriteObject(conditionInputRea, props.conditionInput);
    recommendationListRea.splice(0, recommendationListRea.length, ...props.recommendationList);
    overwriteObject(recommendationRef, props.recommendation);
    statsInput.statAdjustments['敵レベル'] = 90;
    statsInput.statAdjustments['敵防御力'] = 0;

    const characterInfoVisibleRef = ref(false);           // true:キャラクター情報表示, false:非表示
    const characterInfoModeRef = ref(0);                  // キャラクター情報モード
    const characterSelectVisibleRef = ref(false);         // true:キャラクター選択表示, false:非表示
    const weaponSelectVisibleRef = ref(false);            // true:武器選択表示, false:非表示

    const artifactSetSelectVisibleRef = ref(false);       // true:聖遺物セット効果選択表示, false:非表示
    const artifactSetIndexRef = ref(0);
    const artifactSets = characterInputRea.artifactSets;
    const artifactDetailInputVisibleRef = ref(true);

    const pane6Toggle1Ref = ref(true);          // true:オプション条件表示, false:非表示
    const pane6Toggle2Ref = ref(true);          // true:ステータス条件表示, false:非表示
    const pane6Toggle3Ref = ref(true);          // true:バフ/デバフ条件表示, false:非表示
    const statInputTabRef = ref(1);             // 1:ステータス1, 2:ステータス2, 3:敵
    const optionInputTabRef = ref(1);           // 1:元素共鳴, 2:チーム, 3:その他
    const ownListToggle1Ref = ref(false);       // true:キャラクター所持状況表示, false:非表示
    const ownListToggle2Ref = ref(false);       // true:武器所持状況表示, false:非表示
    const ownListToggle3Ref = ref(false);       // true:聖遺物所持状況表示, false:非表示
    const enableClearLocalStorage = ref(false);
    const evalCount = ref(0);

    onMounted(async () => {
      setI18nLanguage('en-us');
      setI18nLanguage('ja-jp');

      if (props.recommendation.build?.artifactScoring) {
        applyArtifactScoreFormula(props.recommendation.build.artifactScoring);
      }
      setupMiscOption(optionInputRea);

      await nextTick();

      await Promise.all(CHARACTER_KEYS.map(key => setupTeamOptionSupporter(defaultSupporterOptionInput, key as TCharacterKey)));
      await _setupSupporters();
      await updateCharacter(characterInputRea.character, props.teamMembers);
    })

    const weaponType = computed(() => configurationInputRea.全武器解放 ? undefined : characterInputRea.characterMaster.武器)
    const artifactScore = computed(() => calculateArtifactScore(characterInputRea, artifactDetailInputRea, artifactScoringStats))
    const isSubStatOnly = computed(() => configurationInputRea['聖遺物詳細サブ効果オンリー'])
    const normalAttackReplacing = computed((): boolean[] => {
      const KEY_ARR = ['特殊通常攻撃', '特殊重撃', '特殊落下攻撃'];
      const result = [false, false, false];
      const talentObjArr = Object.keys(characterInputRea.characterMaster).filter((s) => KEY_ARR.includes(s))
        .map((s) => [s, (characterInputRea.characterMaster as any)[s]]);
      if (talentObjArr.length > 0) {
        for (const entry of talentObjArr) {
          const index = KEY_ARR.indexOf(entry[0]);
          const talentObj = entry[1];
          if (talentObj.条件 in conditionInputRea.conditionValues && conditionInputRea.conditionValues[talentObj.条件]) {
            result[index] = true;
          }
        }
      }
      return result;
    })
    const myDamageDatailArr = computed(() =>
      [characterInputRea.damageDetailMyCharacter, characterInputRea.damageDetailMyWeapon, characterInputRea.damageDetailMyArtifactSets]
    )
    const topStats = computed(() => {
      const result: TStats = {};
      ステータスチーム内最高ARRAY.forEach(stat => {
        result[stat] = statsInput.statsObj[stat];
      })
      return result;
    })
    const savedata = computed(() => {
      const build = makeSavedata(characterInputRea, artifactDetailInputRea, conditionInputRea);
      const option = makeOptionsSavedata(characterInputRea.character, optionInputRea);
      return [build, option];
    })
    const builddataSavable = computed(() => {
      evalCount.value;
      const [build, option] = savedata.value;
      const buildKey = makeBuildStorageKey(characterInputRea.character, characterInputRea.buildname);
      const optionKey = makeOptionStorageKey(characterInputRea.character, characterInputRea.buildname);
      let result = false;
      if (!_.isEqual(JSON.stringify(build), localStorage.getItem(buildKey))
        || !_.isEqual(JSON.stringify(option), localStorage.getItem(optionKey))) {
        result = true;
      }
      return result;
    })

    /** キャラクター選択画面を開きます/閉じます */
    const openCharacterSelect = async () => {
      characterSelectVisibleRef.value = !characterSelectVisibleRef.value;
      if (characterSelectVisibleRef.value) {
        await nextTick();
        document.querySelector('.pane2')?.scrollIntoView({ block: 'nearest' });
      }
    }

    /** 武器選択画面を開きます/閉じます */
    const openWeaponSelect = async () => {
      weaponSelectVisibleRef.value = !weaponSelectVisibleRef.value;
      if (weaponSelectVisibleRef.value) {
        artifactSetSelectVisibleRef.value = false;
        artifactDetailInputVisibleRef.value = false;
        characterInfoVisibleRef.value = false;
        await nextTick();
        document.querySelector('.pane4')?.scrollIntoView({ block: 'nearest' });
      }
    }

    /** 聖遺物セット効果選択画面を開きます/閉じます */
    const openArtifactSetSelect = async (index: number) => {
      if (index == artifactSetIndexRef.value) {
        artifactSetSelectVisibleRef.value = !artifactSetSelectVisibleRef.value;
      } else {
        artifactSetIndexRef.value = index;
        artifactSetSelectVisibleRef.value = true;
      }
      if (artifactSetSelectVisibleRef.value) {
        weaponSelectVisibleRef.value = false;
        artifactDetailInputVisibleRef.value = false;
        characterInfoVisibleRef.value = false;
        await nextTick();
        document.querySelector('.pane4')?.scrollIntoView({ block: 'nearest' });
      }
    }

    /** 聖遺物詳細画面を開きます/閉じます */
    const openArtifactDetailInput = () => {
      artifactDetailInputVisibleRef.value = !artifactDetailInputVisibleRef.value;
      if (artifactDetailInputVisibleRef.value) {
        weaponSelectVisibleRef.value = false;
        artifactSetSelectVisibleRef.value = false;
        characterInfoVisibleRef.value = false;
      }
    }

    /** キャラクター情報を開きます */
    const openCharacterInfo = (mode: number) => {
      if (characterInfoModeRef.value == mode) {
        characterInfoVisibleRef.value = !characterInfoVisibleRef.value;
      } else {
        characterInfoModeRef.value = mode;
        characterInfoVisibleRef.value = true;
      }
      if (characterInfoVisibleRef.value) {
        weaponSelectVisibleRef.value = false;
        artifactSetSelectVisibleRef.value = false;
        artifactDetailInputVisibleRef.value = false;
      }
    }

    /** 聖遺物スコア計算式を更新します */
    const applyArtifactScoreFormula = (formula: TArtifactScoreFormula) => {
      artifactScoringStats.splice(0, artifactScoringStats.length, ...formula);
    }

    /** サポーターをセットアップします */
    async function _setupSupporters() {
      const buildnameKeys = Object.keys(buildnameSelectionRea);
      const newSavedSupporters: TSavedSupporter[] = [];
      CHARACTER_KEYS.forEach((character) => {
        const keyPrefix = makeBuildStorageKey(character);
        let key = keyPrefix;
        let buildname = makeDefaultBuildname(character);
        if (buildnameKeys.includes(character)) {
          buildname = buildnameSelectionRea[character];
          key = makeBuildStorageKey(character, buildname);
        }
        let value = localStorage[key];
        if (value) {
          newSavedSupporters.push({ key: character, value: value, buildname: buildname });
        } else {
          const workKeyArr = Object.keys(localStorage).filter(s => s.startsWith(keyPrefix));
          if (workKeyArr.length) {
            key = workKeyArr.sort()[0];
            value = localStorage[key];
            buildname = key.replace(new RegExp('^' + keyPrefix + '_'), '');
            newSavedSupporters.push({ key: character, value: value, buildname: buildname });
            buildnameSelectionRea[character] = buildname;
          }
        }
      })

      const newOrUpdateArr: TSavedSupporter[] = [];
      newSavedSupporters.forEach(obj => {
        const workArr = savedSupporters.filter(s => s.key == obj.key);
        if (workArr.length) {
          if (!_.isEqual(workArr[0].value, obj.value) || ['雷電将軍'].includes(obj.key)) {  // 雷電将軍は毎回更新します
            newOrUpdateArr.push(obj);
          }
        } else {
          newOrUpdateArr.push(obj);
        }
      })
      const newKeyArr = newSavedSupporters.map(s => s.key);
      const deleteKeyArr = savedSupporters.filter(a => !newKeyArr.includes(a.key)).map(s => s.key);
      savedSupporters.splice(0, savedSupporters.length, ...newSavedSupporters);
      if (newOrUpdateArr.length) {
        const list = newOrUpdateArr.map(s =>
          setupTeamOptionSupporter(optionInputRea, s.key as TCharacterKey, s.value, characterInputRea.character as TCharacterKey));
        await Promise.all(list);
      }
      CHARACTER_KEYS.filter(key => !savedSupporters.map(s => s.key).includes(key)).forEach(key => {
        optionInputRea.supporters[key] = defaultSupporterOptionInput.supporters[key];
      })

      setupTeamOption(optionInputRea);

      if (teamOptionInputVmRef.value) {
        console.log('App', 'supporters', newKeyArr, deleteKeyArr);
        teamOptionInputVmRef.value.initializeSupporters(optionInputRea.supporters);
      }
    }

    function _calculateStatsAndDamageResult() {
      // ステータスを計算します
      calculateStats(statsInput, characterInputRea, artifactDetailInputRea, conditionInputRea, optionInputRea);
      // ステータス計算後、numberタイプの条件入力を更新します
      updateNumberConditionValues(conditionInputRea, characterInputRea, statsInput.statsObj);
      if (conditionInputVmRef.value) {
        conditionInputVmRef.value.initialize(conditionInputRea);
      }
      // ステータスを計算します
      calculateStats(statsInput, characterInputRea, artifactDetailInputRea, conditionInputRea, optionInputRea);
      // ダメージ計算を実行します
      calculateDamageResult(damageResult, characterInputRea, conditionInputRea, statsInput);
      calculateDamageResultLunarReaction(damageResult, characterInputRea, optionInputRea);
      // NEXT STEPを更新します
      if (nextStatVmRef.value) {
        nextStatVmRef.value.setupNextStatRows();
      }
      evalCount.value++;
    }

    /** キャラクターを選択しました。もろもろのデータを再作成、ステータスおよびダメージを再計算します */
    const updateCharacter = async function (character: TCharacterKey, teamMembers?: string[]) {
      console.debug('updateCharacter', character, teamMembers);
      if (damageResultVmRef.value) {
        damageResultVmRef.value.clearCopiedDamageResult();
      }
      characterSelectVisibleRef.value = false;
      characterInputRea.character = character;
      characterInputRea.characterMaster = await getCharacterMasterDetail(character);
      let constellation = 0;
      if ('キャラクター所持状況' in localStorage) {
        const myCharacterOwnObj = JSON.parse(localStorage['キャラクター所持状況']);
        if (character in myCharacterOwnObj && myCharacterOwnObj[character]) {
          constellation = Number(myCharacterOwnObj[character]);
        }
      }
      const maxConstellation = getMaxConstellation(characterInputRea.characterMaster);
      if (constellation > maxConstellation) {
        constellation = maxConstellation;
      }
      characterInputRea.命ノ星座 = constellation;
      characterInputRea.通常攻撃レベル = 8;
      characterInputRea.元素スキルレベル = 8;
      characterInputRea.元素爆発レベル = 8;
      const eName = characterInputRea.characterMaster.元素スキル.名前;
      const qName = characterInputRea.characterMaster.元素爆発.名前;
      for (let i = 1; i <= constellation; i++) {
        if (i != 3 && i != 5) continue;
        const constellationObj = characterInputRea.characterMaster.命ノ星座[String(i)];
        if (constellationObj && constellationObj.説明) {
          if (eName && constellationObj.説明.indexOf(eName) != -1) {
            characterInputRea.元素スキルレベル += 3;
          } else if (qName && constellationObj.説明.indexOf(qName) != -1) {
            characterInputRea.元素爆発レベル += 3;
          }
        }
      }
      const opt_buildData = props.urldata && props.urldata.キャラクター == character ? props.urldata : undefined;
      recommendationListRea.splice(
        0,
        recommendationListRea.length,
        ...makeRecommendationList(characterInputRea.characterMaster, opt_buildData)
      );
      recommendationRef.value = recommendationListRea[0];
      characterInputRea.recommendationSelectedIndex = 0;
      if (teamMembers) {
        optionInputRea.teamMembers.splice(0, optionInputRea.teamMembers.length, ...teamMembers);
      } else {
        optionInputRea.teamMembers.splice(0, optionInputRea.teamMembers.length);  // チーム編成を初期化します（解散）
      }
      applyArtifactScoreFormula(ARTIFACT_SCORE_FORMULA_TEMPLATE[0]);
      await _setupSupporters();
      calculateTeamStatsAdjustments(optionInputRea, topStats.value, character);
      await updateRecommendation(recommendationRef.value);
      if (teamOptionInputVmRef.value) {
        teamOptionInputVmRef.value.initializeSupporters(optionInputRea.supporters);
      }
      await nextTick();
      document.querySelector('.pane3')?.scrollIntoView({ block: 'nearest' });
    }

    /** おすすめセットを選択しました。もろもろのデータを再作成、ステータスおよびダメージを再計算します */
    const updateRecommendation = async (recommendation: TRecommendation) => {
      console.log('App', 'recommendation', recommendation);
      await loadRecommendation(characterInputRea, artifactDetailInputRea, conditionInputRea, optionInputRea, recommendation.build, recommendation.name);
      if (!('精錬ランク' in recommendation.build)) {
        const weapon = characterInputRea.weapon;
        let refine = [1, 1, 1, 5, 3, 1][characterInputRea.weaponMaster.レアリティ];
        let savedRefine;
        if ('武器所持状況' in localStorage) {
          const myWeaponOwnObj = JSON.parse(localStorage['武器所持状況']);
          if (weapon in myWeaponOwnObj && myWeaponOwnObj[weapon]) {
            savedRefine = Number(myWeaponOwnObj[weapon]);
          }
        }
        if (savedRefine) {
          refine = savedRefine;
        } else if (characterInputRea.weaponMaster.精錬ランク !== undefined) {
          refine = characterInputRea.weaponMaster.精錬ランク;
        }
        const maxRefine = characterInputRea.weaponMaster.レアリティ < 3 ? 1 : 5;
        if (refine > maxRefine) {
          refine = maxRefine;
        }
        characterInputRea.武器精錬ランク = Number(refine);
      }
      // キャラクターのダメージ計算式を再抽出します
      makeDamageDetailObjArrObjCharacter(characterInputRea);
      // 武器のダメージ計算式を再抽出します
      makeDamageDetailObjArrObjWeapon(characterInputRea);
      // 聖遺物セット効果のダメージ計算式を再抽出します
      makeDamageDetailObjArrObjArtifactSets(characterInputRea);
      // 元素共鳴のダメージ計算式を再抽出します
      makeDamageDetailObjArrObjElementalResonance(characterInputRea);
      setupConditionValues(conditionInputRea, characterInputRea, optionInputRea);
      // チーム編成を反映します
      await _updateConditionByTeamMembers();
      // 聖遺物ステータスを計算します
      calculateArtifactStatsMain(artifactDetailInputRea.聖遺物ステータスメイン効果, artifactDetailInputRea.聖遺物メイン効果);
      let doCalculate = !artifactDetailInputRea.聖遺物優先するサブ効果Disabled;
      if ('聖遺物サブ効果計算停止' in configurationInputRea && configurationInputRea.聖遺物サブ効果計算停止) {
        doCalculate = false;
      }
      if (doCalculate) {
        const prioritySubstatValueArr = [];
        for (let i = 0; i < artifactDetailInputRea.聖遺物優先するサブ効果.length; i++) {
          prioritySubstatValueArr.push(makePrioritySubstatValueList(artifactDetailInputRea.聖遺物優先するサブ効果, i));
        }
        calculateArtifactSubStatByPriority(
          artifactDetailInputRea.聖遺物ステータスサブ効果,
          artifactDetailInputRea.聖遺物メイン効果,
          artifactDetailInputRea.聖遺物優先するサブ効果,
          artifactDetailInputRea.聖遺物優先するサブ効果上昇値,
          prioritySubstatValueArr,
          artifactDetailInputRea.聖遺物優先するサブ効果上昇回数
        );
      }
      calculateArtifactStats(artifactDetailInputRea);
      const conditionAdjustments = calculateElementalResonance(optionInputRea, conditionInputRea, characterInputRea, statsInput);
      overwriteObject(optionInputRea.elementalResonance.conditionAdjustments, conditionAdjustments);
      // ステータスとダメージを計算します
      _calculateStatsAndDamageResult();
      if (recommendation.overwrite) {
        characterInputRea.buildname = recommendation.name;
      } else {
        characterInputRea.buildname = '';
      }
      characterInputRea.removeDisabled = !recommendation.overwrite;
      await nextTick();
      // 元素共鳴
      if (elementalResonanceInputVmRef.value) {
        elementalResonanceInputVmRef.value.initializeValues(optionInputRea);
      }
      // チーム
      if (teamOptionInputVmRef.value) {
        teamOptionInputVmRef.value.initializeValues(optionInputRea.teamOption);
      }
      // その他
      if (miscOptionInputVmRef.value) {
        miscOptionInputVmRef.value.initializeValues(optionInputRea.miscOption);
      }
      // NEXT STEP
      if (nextStatVmRef.value) {
        nextStatVmRef.value.initializeEvaluationItem();
        nextStatVmRef.value.setupNextStatRows();
      }
      if ('artifactScoring' in recommendation.build) {
        const work = recommendation.build.artifactScoring;
        applyArtifactScoreFormula(work);
        if (artifactScoreFormulaVmRef.value) {
          artifactScoreFormulaVmRef.value.initialize(artifactScoringStats);
        }
      }
    }

    /** キャラクターのパラメータ（突破レベル、レベル、命ノ星座、通常攻撃レベル、元素スキルレベル、元素爆発レベル）を更新します */
    const updateCharacterInputCharacter = (argCharacterInput: any) => {
      Object.keys(argCharacterInput).forEach((key) => {
        if (key in characterInputRea) {
          (characterInputRea as any)[key] = argCharacterInput[key];
        }
      })
      // キャラクターのダメージ計算式を再抽出します
      makeDamageDetailObjArrObjCharacter(characterInputRea);
      setupConditionValues(conditionInputRea, characterInputRea, optionInputRea);
      // ステータスとダメージを計算します
      _calculateStatsAndDamageResult();
    }

    /** 武器を選択しました */
    const updateWeapon = async (weapon: TWeaponKey) => {
      characterInputRea.weapon = weapon;
      characterInputRea.weaponMaster = await getWeaponMasterDetail(weapon);
      const maxAscension = [4, 4, 4, 6, 6, 6][characterInputRea.weaponMaster.レアリティ];
      if (characterInputRea.武器突破レベル > maxAscension) {
        characterInputRea.武器突破レベル = maxAscension;
        characterInputRea.武器レベル = [20, 40, 50, 60, 70, 80, 90][maxAscension];
      }
      let refine = [1, 1, 1, 5, 3, 1][characterInputRea.weaponMaster.レアリティ];
      let savedRefine;
      if ('武器所持状況' in localStorage) {
        const myWeaponOwnObj = JSON.parse(localStorage['武器所持状況']);
        if (weapon in myWeaponOwnObj && myWeaponOwnObj[weapon]) {
          savedRefine = Number(myWeaponOwnObj[weapon]);
        }
      }
      if (savedRefine) {
        refine = savedRefine;
      } else if (characterInputRea.weaponMaster.精錬ランク !== undefined) {
        refine = characterInputRea.weaponMaster.精錬ランク;
      }
      const maxRefine = characterInputRea.weaponMaster.レアリティ < 3 ? 1 : 5;
      if (refine > maxRefine) {
        refine = maxRefine;
      }
      characterInputRea.武器精錬ランク = Number(refine);
      // 武器のダメージ計算式を再抽出します
      makeDamageDetailObjArrObjWeapon(characterInputRea);
      setupConditionValues(conditionInputRea, characterInputRea, optionInputRea);
      // ステータスとダメージを計算します
      _calculateStatsAndDamageResult();
      await nextTick();
      document.querySelector('.pane3')?.scrollIntoView({ block: 'nearest' });
    }

    /** 武器のパラメータ（突破レベル、レベル、精錬ランク）を更新します */
    const updateCharacterInputWeapon = (argCharacterInput: any) => {
      Object.keys(argCharacterInput).forEach((key) => {
        if (characterInputRea && key in characterInputRea) {
          (characterInputRea as any)[key] = argCharacterInput[key];
        }
      })
      // 武器のダメージ計算式を再抽出します
      makeDamageDetailObjArrObjWeapon(characterInputRea);
      setupConditionValues(conditionInputRea, characterInputRea, optionInputRea);
      // ステータスとダメージを計算します
      _calculateStatsAndDamageResult();
    }

    /** 聖遺物セット効果を選択しました */
    const updateArtifactSet = async (artifactSet: TArtifactSetKey) => {
      artifactSets[artifactSetIndexRef.value] = artifactSet;
      const tempMaster = ARTIFACT_SET_MASTER[artifactSet] as TArtifactSet;
      characterInputRea.artifactSetMasters.splice(
        artifactSetIndexRef.value,
        1,
        tempMaster as TArtifactSetEntry
      );
      // 聖遺物セット効果のダメージ計算式を再抽出します
      makeDamageDetailObjArrObjArtifactSets(characterInputRea);
      setupConditionValues(conditionInputRea, characterInputRea, optionInputRea);
      // ステータスとダメージを計算します
      _calculateStatsAndDamageResult();
      await nextTick();
      document.querySelector('.pane3')?.scrollIntoView({ block: 'nearest' });
    }

    /** 聖遺物ステータスが変更されました。ステータスおよびダメージを再計算します */
    const updateArtifactDetail = (argArtifactDetailInput: TArtifactDetailInput) => {
      artifactDetailInputRea.聖遺物メイン効果.splice(0, artifactDetailInputRea.聖遺物メイン効果.length, ...argArtifactDetailInput.聖遺物メイン効果);
      artifactDetailInputRea.聖遺物優先するサブ効果.splice(0, artifactDetailInputRea.聖遺物優先するサブ効果.length, ...argArtifactDetailInput.聖遺物優先するサブ効果);
      artifactDetailInputRea.聖遺物優先するサブ効果上昇値.splice(0, artifactDetailInputRea.聖遺物優先するサブ効果上昇値.length, ...argArtifactDetailInput.聖遺物優先するサブ効果上昇値);
      artifactDetailInputRea.聖遺物優先するサブ効果上昇回数.splice(0, artifactDetailInputRea.聖遺物優先するサブ効果上昇回数.length, ...argArtifactDetailInput.聖遺物優先するサブ効果上昇回数);
      for (const stat of Object.keys(argArtifactDetailInput.聖遺物ステータス)) {
        (artifactDetailInputRea.聖遺物ステータス as any)[stat] = (argArtifactDetailInput.聖遺物ステータス as any)[stat];
      }
      artifactDetailInputRea.artifact_list.splice(0, artifactDetailInputRea.artifact_list.length, ...argArtifactDetailInput.artifact_list);
      // ステータスとダメージを計算します
      _calculateStatsAndDamageResult();
      configurationInputRea.聖遺物サブ効果計算停止 = argArtifactDetailInput.聖遺物優先するサブ効果Disabled;
    }

    /** 敵が変更されました。ステータスおよびダメージを再計算します */
    const updateEnemy = () => {
      (statsInput.enemyMaster as any) = selectedEnemyRef.value;
      _calculateStatsAndDamageResult();
    }

    /** ステータス補正値が変更されました。ステータスおよびダメージを再計算します */
    const updateStatAdjustments = (argStatAdjustments?: TStats) => {
      if (argStatAdjustments) {
        Object.keys(argStatAdjustments).forEach((key) => {
          statsInput.statAdjustments[key] = argStatAdjustments[key];
        })
      }
      // ステータスとダメージを計算します
      _calculateStatsAndDamageResult();
    }

    /** オプション条件が変更されました。ステータスおよびダメージを再計算します */
    const updateCondition = (conditionValues: TConditionValues) => {
      overwriteObject(conditionInputRea.conditionValues, conditionValues);
      const conditionAdjustments = calculateElementalResonance(optionInputRea, conditionInputRea, characterInputRea, statsInput);
      overwriteObject(optionInputRea.elementalResonance.conditionAdjustments, conditionAdjustments);
      // ステータスとダメージを計算します
      _calculateStatsAndDamageResult();
    }

    /** チーム強化が変更されました。ステータスおよびダメージを再計算します */
    const updateElementalResonance = (optionInput: TOptionInput, forceUpdate = false) => {
      let isChanged = false;
      // 元素共鳴
      if (optionInput?.elementalResonance?.conditionValues && Object.keys(optionInput.elementalResonance.conditionValues).length) {
        if (!_.isEqual(optionInputRea.elementalResonance.conditionValues, optionInput.elementalResonance.conditionValues)) {
          overwriteObject(optionInputRea.elementalResonance.conditionValues, optionInput.elementalResonance.conditionValues);
          isChanged = true;
        }
      }
      // 月兆
      if (optionInput?.moonsign && !_.isEqual(optionInputRea.moonsign, optionInput.moonsign)) {
        optionInputRea.moonsign.nascentGleam = optionInput.moonsign.nascentGleam;
        optionInputRea.moonsign.ascendantGleam = optionInput.moonsign.ascendantGleam;
        optionInputRea.moonsign.otherCharacter = optionInput.moonsign.otherCharacter;
        optionInputRea.moonsign.lunarDmgBonus = optionInput.moonsign.lunarDmgBonus;
        isChanged = true;
      }
      // 魔導
      if (optionInput?.hexerei && !_.isEqual(optionInputRea.hexerei, optionInput.hexerei)) {
        optionInputRea.hexerei.hexerei = optionInput.hexerei.hexerei;
        isChanged = true;
      }
      if (!isChanged && !forceUpdate) {
        return;
      }
      setupConditionValues(conditionInputRea, characterInputRea, optionInputRea);
      const conditionAdjustments = calculateElementalResonance(optionInputRea, conditionInputRea, characterInputRea, statsInput);
      overwriteObject(optionInputRea.elementalResonance.conditionAdjustments, conditionAdjustments);
      // ステータスとダメージを計算します
      _calculateStatsAndDamageResult();
    }

    /** その他オプションが変更されました。ステータスおよびダメージを再計算します */
    const updateMiscOption = (conditionValues: TConditionValues) => {
      if (conditionValues) {
        if (!_.isEqual(optionInputRea.miscOption.conditionValues, conditionValues)) {
          overwriteObject(optionInputRea.miscOption.conditionValues, conditionValues);
        }
        calculateMiscStatsAdjustments(optionInputRea);
        // ステータスとダメージを計算します
        _calculateStatsAndDamageResult();
      }
    }

    /** チームオプションが変更されました。ステータスおよびダメージを再計算します */
    const updateTeamOption = (conditionValues: TConditionValues) => {
      if (conditionValues) {
        if (!_.isEqual(optionInputRea.teamOption.conditionValues, conditionValues)) {
          overwriteObject(optionInputRea.teamOption.conditionValues, conditionValues);
        }
        calculateTeamStatsAdjustments(optionInputRea, topStats.value, characterInputRea.character);
        // ステータスとダメージを計算します
        _calculateStatsAndDamageResult();
      }
    }
    const updateBuildnameSelection = async (argBuildnameSelection: TAnyObject) => {
      overwriteObject(buildnameSelectionRea, argBuildnameSelection);
      await _setupSupporters();
      calculateTeamStatsAdjustments(optionInputRea, topStats.value, characterInputRea.character);
      // ステータスとダメージを計算します
      _calculateStatsAndDamageResult();
    }
    const updateTeamMembers = async (teamMembers: string[]) => {
      optionInputRea.teamMembers.splice(0, optionInputRea.teamMembers.length, ...teamMembers);
      await _updateConditionByTeamMembers();
      calculateTeamStatsAdjustments(optionInputRea, topStats.value, characterInputRea.character);
      // ステータスとダメージを計算します
      _calculateStatsAndDamageResult();
    }
    /** チーム編成に依存するオプションの値を調整します */
    async function _updateConditionByTeamMembers() {
      await updateConditionsByTeam(characterInputRea, conditionInputRea, optionInputRea);
      if (await updateOptionsElementalResonanceByTeam(characterInputRea, optionInputRea)) {
        if (elementalResonanceInputVmRef.value) {
          elementalResonanceInputVmRef.value.initializeValues(optionInputRea);
        }
      }
      console.log('App', 'conditionValues', conditionInputRea.conditionValues);
    }

    const updateNextStatAdjustments = (argStatAdjustments?: TStats) => {
      if (argStatAdjustments) {
        statsInput.statAdjustmentsEx = argStatAdjustments;
        updateStatAdjustments();
      }
    }

    const updateNextStatRows = (argNextStatRows: any[]) => {
      if (Array.isArray(argNextStatRows)) {
        nextStatRows.splice(0, nextStatRows.length, ...argNextStatRows);
      }
    }

    const updateRotationDamage = (argRotationDamageInfo: TRotationDamageInfo) => {
      rotationDamageInfo.totalDamage = argRotationDamageInfo.totalDamage;
      rotationDamageInfo.rotationDamages.splice(0, rotationDamageInfo.rotationDamages.length, ...argRotationDamageInfo.rotationDamages);
    }

    /** コンフィグレーションが変更されました */
    const updateConfigurationInput = (argConfigurationInput: TAnyObject) => {
      console.debug(argConfigurationInput);
      if (argConfigurationInput.全武器解放) {
        console.log('全武器解放');
      }
      if (argConfigurationInput.聖遺物サブ効果計算停止) {
        artifactDetailInputRea.聖遺物優先するサブ効果Disabled = true;
      }
    }

    /** 聖遺物ステータス（サブ効果）をクリアします*/
    const orderInitializeArtifactStatsSub = () => {
      if (artifactDetailInputVmRef.value) {
        artifactDetailInputVmRef.value.initializeArtifactStatsSub();
      }
    }

    const openTwitter = () => {
      shareByTwitter(characterInputRea, artifactDetailInputRea, conditionInputRea);
    }

    /** 構成情報をローカルストレージに保存します */
    const saveToStorage = async (buildname: string) => {
      const [build, option] = savedata.value;
      const buildKey = makeBuildStorageKey(characterInputRea.character, buildname);
      const optionKey = makeOptionStorageKey(characterInputRea.character, buildname);
      localStorage.setItem(buildKey, JSON.stringify(build));
      localStorage.setItem(optionKey, JSON.stringify(option));
      const artifactScoringSavedata = artifactScoringStats;
      const storageKey3 = makeArtifactScoringStorageKey(characterInputRea.character, buildname);
      localStorage.setItem(storageKey3, JSON.stringify(artifactScoringSavedata));
      // おすすめセットのリストを更新します
      const opt_buildData = props.urldata && props.urldata.キャラクター == characterInputRea.character ? props.urldata : undefined;
      recommendationListRea.splice(
        0,
        recommendationListRea.length,
        ...makeRecommendationList(characterInputRea.characterMaster, opt_buildData)
      );
      // サポーター情報を更新します
      await _setupSupporters();
      if (buildKey == makeBuildStorageKey(characterInputRea.character)) {
        characterInputRea.buildname = makeDefaultBuildname(characterInputRea.character);
      }
      // 聖遺物所持状況を更新します
      const storageKey4 = 'artifact_list';
      if (artifactDetailInputRea.artifact_list && artifactDetailInputRea.artifact_list.length) {
        let savedArtifactList: TArtifact[] = [];
        let savedValue = localStorage.getItem(storageKey4);
        if (savedValue) {
          savedArtifactList = JSON.parse(savedValue);
        }
        let isChanged = false;
        for (const artifact of artifactDetailInputRea.artifact_list) {
          if (savedArtifactList.filter(s => _.isEqual(s, artifact)).length == 0) {
            savedArtifactList.push(artifact);
            isChanged = true;
          }
        }
        if (isChanged) {
          localStorage.setItem(storageKey4, JSON.stringify(savedArtifactList));
        }
      }
      characterInputRea.removeDisabled = false;
      evalCount.value++;
    }

    /** ローカルストレージの構成情報を削除します */
    const removeFromStorage = async (buildname: string) => {
      let identifier = characterInputRea.character;
      const defaultBuildname = [makeDefaultBuildname(characterInputRea.character)];
      if (buildname && !defaultBuildname.includes(buildname)) {
        identifier += '_' + buildname;
      }
      const storageKey = '構成_' + identifier;
      localStorage.removeItem(storageKey);
      const storageKey2 = 'オプション構成_' + identifier;
      localStorage.removeItem(storageKey2);
      const storageKey3 = 'ArtifactScoring_' + identifier;
      localStorage.removeItem(storageKey3);
      // おすすめセットのリストを更新します
      const opt_buildData = props.urldata && props.urldata.キャラクター == characterInputRea.character ? props.urldata : undefined;
      recommendationListRea.splice(
        0,
        recommendationListRea.length,
        ...makeRecommendationList(characterInputRea.characterMaster, opt_buildData)
      );
      // サポーター情報を更新します
      await _setupSupporters();
      characterInputRea.removeDisabled = true;
      evalCount.value++;
    };

    /** ローカルストレージを全削除します */
    const clearLocalStorage = () => {
      localStorage.clear();
      enableClearLocalStorage.value = false;
    }

    const objectKeys = (obj: any) => obj && _.isPlainObject(obj) ? Object.keys(obj) : [];
    const getValue = (obj: any, key: any) => obj && _.isPlainObject(obj) ? obj[key] : undefined;

    return {
      displayName,

      HTML_LOGGER,

      CHARACTER_STATS_CATEGORY1_LIST,
      CHARACTER_STATS_CATEGORY2_LIST,
      CHARACTER_STATS2_CATEGORY1_LIST,
      CHARACTER_STATS2_CATEGORY2_LIST,
      ENEMY_STATS_CATEGORY1_LIST,
      ENEMY_STATS_CATEGORY2_LIST,
      ENEMY_LIST,

      characterSelectVmRef,
      characterInputVmRef,
      artifactDetailInputVmRef,
      conditionInputVmRef,
      elementalResonanceInputVmRef,
      teamOptionInputVmRef,
      miscOptionInputVmRef,
      artifactScoreFormulaVmRef,
      damageResultVmRef,
      nextStatVmRef,

      characterInputRea,
      artifactDetailInputRea,
      conditionInputRea,
      optionInputRea,
      statsInput,
      selectedEnemyRef,
      damageResult,
      recommendationListRea,
      recommendationRef,
      configurationInputRea,
      artifactScoringStats,
      savedSupporters,
      nextStatRows,
      rotationDamageInfo,
      characterInfoVisibleRef,
      characterInfoModeRef,
      characterSelectVisibleRef,
      weaponSelectVisibleRef,
      artifactSetSelectVisibleRef,
      artifactSetIndexRef,
      artifactSets,
      artifactDetailInputVisibleRef,
      pane6Toggle1Ref,
      pane6Toggle2Ref,
      pane6Toggle3Ref,
      statInputTabRef,
      optionInputTabRef,
      ownListToggle1Ref,
      ownListToggle2Ref,
      ownListToggle3Ref,
      enableClearLocalStorage,
      builddataSavable,

      weaponType,
      artifactScore,
      isSubStatOnly,
      normalAttackReplacing,
      myDamageDatailArr,
      topStats,

      openCharacterSelect,
      openWeaponSelect,
      openArtifactSetSelect,
      openArtifactDetailInput,
      openCharacterInfo,
      applyArtifactScoreFormula,
      updateCharacter,
      updateRecommendation,
      updateCharacterInputCharacter,
      updateWeapon,
      updateCharacterInputWeapon,
      updateArtifactSet,
      updateArtifactDetail,
      updateEnemy,
      updateStatAdjustments,
      updateCondition,
      updateElementalResonance,
      updateMiscOption,
      updateTeamOption,
      updateBuildnameSelection,
      updateTeamMembers,
      updateNextStatAdjustments,
      updateNextStatRows,
      updateRotationDamage,
      updateConfigurationInput,
      orderInitializeArtifactStatsSub,

      openTwitter,

      saveToStorage,
      removeFromStorage,
      clearLocalStorage,

      objectKeys,
      getValue,
    };
  },
});
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

/* 3 Columns */
@media all and (min-width: 1152px) {
  .base-container {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: auto auto max(400px) auto auto auto auto;
    grid-template-areas:
      "pane1 pane1 pane1"
      "pane2 pane2 pane2"
      "pane3 pane6 result-pane"
      "pane4 pane6 result-pane"
      "pane4 pane6 pane5"
      "bottom-pane bottom-pane pane7"
      "footer footer footer";
  }
}

/* 2 Columns */
@media all and (min-width: 720px) and (max-width: 1151px) {
  .base-container {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: auto auto auto auto auto auto auto auto auto auto;
    grid-template-areas:
      "pane1 pane1"
      "pane2 pane2"
      "pane3 pane4"
      "pane3 result-pane"
      "pane6 result-pane"
      "pane6 result-pane"
      "pane6 pane5"
      "bottom-pane bottom-pane"
      "pane7 pane7"
      "footer footer";
  }
}

/* 1 Column */
@media all and (max-width: 719px) {
  .base-container {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: auto auto auto auto auto auto auto auto auto auto;
    grid-template-areas:
      "pane1"
      "pane2"
      "pane3"
      "pane4"
      "pane6"
      "result-pane"
      "pane5"
      "bottom-pane"
      "pane7"
      "footer";
  }

  .pane1 fieldset {
    padding-bottom: 2.4rem;
  }

  ul.select-list {
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
<style scoped>
.toggle-switch {
  width: calc(100% / 3 - 16px);
}

label.enemy {
  display: inline-block;
  width: calc(100% / 2 - 8px);
  margin: inherit 10px;
}

label.enemy-level {
  display: inline-block;
  width: calc(100% / 2 - 10px);
  margin: inherit 10px;
}

label.enemy-level input {
  width: 10rem;
}

h2 label.toggle-switch {
  min-width: 75% !important;
}

p.left {
  text-align: left;
}

#debug-info dl dt,
#debug-info dl dt,
#debug-info ol li {
  text-align: left;
}

#debuf-info dt {
  color: orangered;
}

#debuf-info ol {
  padding-block-start: 0;
  margin-block-start: 0;
}
</style>
