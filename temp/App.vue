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
        :recommendationList="recommendationListRea" :recommendation="recommendationRef"
        :artifactSetSelectVisible="artifactSetSelectVisibleRef" :artifactScore="artifactScore"
        @open:character-select="characterSelectVisibleRef = !characterSelectVisibleRef"
        @saveToStorage="saveToStorage($event)" @removeFromStorage="removeFromStorage($event)"
        @update:recommendation="updateRecommendation($event)" @open:weapon-select="openWeaponSelect"
        @open:artifact-set-select="openArtifactSetSelect($event)" @open:artifact-detail-input="openArtifactDetailInput"
        @update:character-input-character="updateCharacterInputCharacter($event)"
        @update:character-input-weapon="updateCharacterInputWeapon($event)"
        @open:character-info="openCharacterInfo($event)" />
    </div>

    <div class="pane4">
      <CharacterInfo :visible="characterInfoVisibleRef" :mode="characterInfoModeRef"
        :characterMaster="characterInputRea.characterMaster" :ascension="characterInputRea.突破レベル"
        :level="characterInputRea.レベル" :normalAttackLevel="characterInputRea.通常攻撃レベル"
        :elementalSkillLevel="characterInputRea.元素スキルレベル" :elementalBurstLevel="characterInputRea.元素爆発レベル"
        :normalAttackReplacing="normalAttackReplacing" />
      <WeaponSelect :visible="weaponSelectVisibleRef" :weapon="characterInputRea.weapon" :weaponType="weaponType"
        :weaponMaster="characterInputRea.weaponMaster" :ascension="characterInputRea.武器突破レベル"
        :level="characterInputRea.武器レベル" @update:weapon="updateWeapon($event)" />
      <ArtifactSetSelect :visible="artifactSetSelectVisibleRef" :index="artifactSetIndexRef"
        :artifactSet="artifactSets[artifactSetIndexRef]" :artifactSetMasters="characterInputRea.artifactSetMasters"
        @update:artifact-set="updateArtifactSet($event)" />
      <ArtifactDetailInput ref="artifactDetailInputVmRef" :visible="artifactDetailInputVisibleRef"
        :artifactDetailInput="artifactDetailInputRea" @update:artifact-detail="updateArtifactDetail($event)" />
      <ArtifactScoreFormula ref="artifactScoreFormulaVmRef" :visible="artifactDetailInputVisibleRef"
        @apply:formula="applyArtifactScoreFormula" />
    </div>

    <div class="pane6">
      <div>
        <input class="hidden" id="pane6-toggle-1" type="checkbox" v-model="pane6Toggle1Ref" />
        <label class="toggle-switch" for="pane6-toggle-1">
          {{ displayName("オプション条件") }}
        </label>
        <input class="hidden" id="pane6-toggle-2" type="checkbox" v-model="pane6Toggle2Ref" />
        <label class="toggle-switch" for="pane6-toggle-2">
          {{ displayName("ステータス") }}
        </label>
        <input class="hidden" id="pane6-toggle-3" type="checkbox" v-model="pane6Toggle3Ref" />
        <label class="toggle-switch" for="pane6-toggle-3">
          {{ displayName("バフ/デバフ") }}
        </label>
      </div>
      <div v-if="pane6Toggle1Ref" style="margin-bottom: 10px">
        <ConditionInput ref="conditionInputVmRef" :characterInput="characterInputRea"
          :conditionInput="conditionInputRea" :conditionAdjustments="conditionInputRea.conditionAdjustments"
          @update:condition="updateCondition" />
      </div>
      <div v-if="pane6Toggle2Ref" style="margin-bottom: 10px">
        <div class="tab-switch">
          <input id="status-input-tab-1" type="radio" value="1" v-model="statInputTabRef" />
          <label for="status-input-tab-1">
            {{ displayName("ステータス1") }}
          </label>
          <input id="status-input-tab-2" type="radio" value="2" v-model="statInputTabRef" />
          <label for="status-input-tab-2">
            {{ displayName("ステータス2") }}
          </label>
          <input id="status-input-tab-3" type="radio" value="3" v-model="statInputTabRef" />
          <label for="status-input-tab-3"> {{ displayName("敵") }} </label>
        </div>
        <div v-show="statInputTabRef == 1">
          <StatsInput :statsInput="statsInput" :category1List="characterStats1Category1List"
            :category2List="characterStats1Category2List" @update:stat-adjustments="updateStatAdjustments($event)" />
        </div>
        <div v-show="statInputTabRef == 2">
          <StatsInput :statsInput="statsInput" :category1List="characterStats2Category1List"
            :category2List="characterStats2Category2List" @update:stat-adjustments="updateStatAdjustments($event)" />
        </div>
        <div v-show="statInputTabRef == 3">
          <label class="enemy">
            <select v-model="selectedEnemyRef" @change="updateEnemy">
              <option v-for="item in enemyList" :value="item" :key="item.key">
                {{ displayName(item.key) }}
              </option>
            </select>
          </label>
          <label class="enemy-level">Lv.
            <input type="number" v-model="statsInput.statAdjustments['敵レベル']" min="1" />
          </label>
          <StatsInput :statsInput="statsInput" :category1List="enemyStatsCategory1List"
            :category2List="enemyStatsCategory2List" @update:stat-adjustments="updateStatAdjustments($event)" />
        </div>
      </div>
      <div v-if="pane6Toggle3Ref" style="margin-bottom: 10px">
        <div class="tab-switch">
          <input id="option-input-tab-1" type="radio" value="1" v-model="optionInputTabRef" />
          <label for="option-input-tab-1">
            {{ displayName("元素共鳴") }}
          </label>
          <input id="option-input-tab-2" type="radio" value="2" v-model="optionInputTabRef" />
          <label for="option-input-tab-2"> {{ displayName("チーム") }} </label>
          <input id="option-input-tab-3" type="radio" value="3" v-model="optionInputTabRef" />
          <label for="option-input-tab-3"> {{ displayName("その他") }} </label>
        </div>
        <div v-show="optionInputTabRef == 1">
          <ElementalResonanceInput ref="elementalResonanceInputVmRef"
            @update:elemental-resonance="updateElementalResonance" />
        </div>
        <div v-show="optionInputTabRef == 2">
          <TeamOptionInput ref="teamOptionInputVmRef" :character="characterInputRea.character"
            :savedSupporters="savedSupporters" @update:team-option="updateTeamOption"
            @update:buildname-selection="updateBuildnameSelection" />
        </div>
        <div v-show="optionInputTabRef == 3">
          <MiscOptionInput ref="miscOptionInputVmRef" @update:misc-option="updateMiscOption" />
        </div>
      </div>
    </div>

    <div class="result-pane">
      <DamageResult :damageResult="damageResult" />
    </div>

    <div class="pane5">
      <RotationDamage :characterMaster="characterInputRea.characterMaster" :damageResult="damageResult" />

      <ShareSns @share:twitter="openTwitter" />
    </div>

    <div class="bottom-pane">
      <h2>
        <input class="hidden" id="own-list-toggle-1" type="checkbox" v-model="ownListToggle1Ref" />
        <label class="toggle-switch no-border" for="own-list-toggle-1">
          {{ displayName("キャラクター所持状況") }}
        </label>
      </h2>
      <CharacterOwnList v-if="ownListToggle1Ref" />
      <h2>
        <input class="hidden" id="own-list-toggle-2" type="checkbox" v-model="ownListToggle2Ref" />
        <label class="toggle-switch no-border" for="own-list-toggle-2">
          {{ displayName("武器所持状況") }}
        </label>
      </h2>
      <WeaponOwnList v-if="ownListToggle2Ref" />

      <hr />
      <label>
        <input type="checkbox" v-model="enableClearLocalStorage" />
        <span>{{ displayName("ローカルストレージをクリアする") }}</span>
      </label>
      <button type="button" @click="clearLocalStorage" :disabled="!enableClearLocalStorage">
        {{ displayName("実行") }}
      </button>
      <p>{{ displayName("全ての保存データを削除します") }}</p>
    </div>

    <div class="pane7">
      <AboutMyApp />
      <ConfigurationInput :configurationInput="configurationInputRea"
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
        <tr v-for="stat in Object.keys(statsInput.statsObj)" :key="stat">
          <th style="text-align: right">{{ stat }}</th>
          <td style="text-align: right">{{ statsInput.statsObj[stat] }}</td>
        </tr>
      </table>
    </template>
    <hr />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, ref } from "vue";
import TitleAndHeader from "@/components/TitleAndHeader.vue";
import CharacterSelect from "@/components/CharacterSelect.vue";
import CharacterInput from "@/components/CharacterInput.vue";
import CharacterInfo from "@/components/CharacterInfo.vue";
import WeaponSelect from "@/components/WeaponSelect.vue";
import ArtifactSetSelect from "@/components/ArtifactSetSelect.vue";
import ArtifactDetailInput from "@/components/ArtifactDetailInput.vue";
import ConditionInput from "@/components/ConditionInput.vue";
import StatsInput from "@/components/StatsInput.vue";
import ElementalResonanceInput from "@/components/ElementalResonanceInput.vue";
import TeamOptionInput from "@/components/TeamOptionInput.vue";
import MiscOptionInput from "@/components/MiscOptionInput.vue";
import DamageResult from "@/components/DamageResult.vue";
import RotationDamage from "@/components/RotationDamage.vue";
import ShareSns from "@/components/ShareSns.vue";
import AboutMyApp from "@/components/AboutMyApp.vue";
import ConfigurationInput from "@/components/ConfigurationInput.vue";
import CharacterOwnList from "@/components/CharacterOwnList.vue";
import WeaponOwnList from "@/components/WeaponOwnList.vue";
import {
  TRecommendation,
  makeRecommendationList,
  makePrioritySubstatValueList,
  loadRecommendation,
  makeDamageDetailObjArrObjCharacter,
  makeDamageDetailObjArrObjWeapon,
  makeDamageDetailObjArrObjArtifactSets,
  TConditionInput,
  TCharacterInput,
  TArtifactDetailInput,
  STATS_INPUT_TEMPLATE,
  DAMAGE_RESULT_TEMPLATE,
  TDamageResult,
  setupConditionValues,
  OPTION_INPUT_TEMPLATE,
  TOptionInput,
  TStatsInput,
  CHARACTER_INPUT_TEMPLATE,
  ARTIFACT_DETAIL_INPUT_TEMPLATE,
  CONDITION_INPUT_TEMPLATE,
  makeSavedata,
  shareByTwitter,
  getMaxTalentLevel,
  getMaxConstellation,
  TConditionValues,
  makeOptionsSavedata,
  makeDefaultBuildname,
} from "@/input";
import {
  ARTIFACT_SET_MASTER,
  CHARACTER_MASTER,
  ENEMY_MASTER_LIST,
  getCharacterMasterDetail,
  getWeaponMasterDetail,
  TAnyObject,
  TArtifactSet,
  TArtifactSetEntry,
  TArtifactSetKey,
  TArtifactSubKey,
  TCharacterKey,
  TWeaponKey,
} from "@/master";
import {
  ARTIFACT_SCORE_FORMULA_TEMPLATE,
  calculateArtifactScore,
  calculateArtifactStats,
  calculateArtifactStatsMain,
  calculateArtifactSubStatByPriority,
  calculateStats,
  TArtifactScoreFormula,
} from "@/calculate";
import { deepcopy, isPlainObject, overwriteObject } from "@/common";
import { calculateDamageResult } from "@/calculate";
import CompositionFunction from "@/components/CompositionFunction.vue";
import ArtifactScoreFormula from "./components/ArtifactScoreFormula.vue";

export default defineComponent({
  name: "App",
  props: {
    characterInput: {
      type: Object as PropType<TCharacterInput>,
      required: true,
    },
    artifactDetailInput: {
      type: Object as PropType<TArtifactDetailInput>,
      required: true,
    },
    conditionInput: {
      type: Object as PropType<TConditionInput>,
      required: true,
    },
    recommendationList: {
      type: Array as PropType<TRecommendation[]>,
      required: true,
    },
    recommendation: {
      type: Object as PropType<TRecommendation>,
      required: true,
    },
    urldata: { type: Object as PropType<TAnyObject> },
  },
  components: {
    TitleAndHeader,
    CharacterSelect,
    CharacterInput,
    CharacterInfo,
    WeaponSelect,
    ArtifactSetSelect,
    ArtifactDetailInput,
    ConditionInput,
    StatsInput,
    ElementalResonanceInput,
    TeamOptionInput,
    MiscOptionInput,
    DamageResult,
    RotationDamage,
    ShareSns,
    AboutMyApp,
    ConfigurationInput,
    CharacterOwnList,
    WeaponOwnList,
    ArtifactScoreFormula
  },
  setup(props) {
    const { setI18nLanguage, displayName } = CompositionFunction();

    const characterInputVmRef = ref();
    const artifactDetailInputVmRef = ref();
    const conditionInputVmRef = ref();
    const elementalResonanceInputVmRef = ref();
    const teamOptionInputVmRef = ref();
    const miscOptionInputVmRef = ref();
    const artifactScoreFormulaVmRef = ref();

    const characterInputRea = reactive(
      overwriteObject(deepcopy(CHARACTER_INPUT_TEMPLATE), props.characterInput)
    );
    const artifactDetailInputRea = reactive(
      overwriteObject(deepcopy(ARTIFACT_DETAIL_INPUT_TEMPLATE), props.artifactDetailInput)
    );
    const conditionInputRea = reactive(
      overwriteObject(deepcopy(CONDITION_INPUT_TEMPLATE), props.conditionInput)
    );
    const recommendationListRea = reactive([...props.recommendationList]);
    const recommendationRef = ref(props.recommendation);

    /** 聖遺物スコアを計算します（簡易版） */
    const artifactScoringStats = reactive(deepcopy(ARTIFACT_SCORE_FORMULA_TEMPLATE[0]) as TArtifactScoreFormula);
    if (props.recommendation?.build?.artifactScoring) {
      artifactScoringStats.splice(0, artifactScoringStats.length, ...props.recommendation.build.artifactScoring);
    }
    const applyArtifactScoreFormula = (formula: TArtifactScoreFormula) => {
      artifactScoringStats.splice(0, artifactScoringStats.length, ...formula);
    }
    const artifactScore = computed(() => {
      return calculateArtifactScore(characterInputRea, artifactDetailInputRea, artifactScoringStats);
    });

    const characterSelectVisibleRef = ref(false);
    const weaponSelectVisibleRef = ref(false);

    const artifactSetSelectVisibleRef = ref(false);
    const artifactSetIndexRef = ref(0);
    const artifactSets = characterInputRea.artifactSets;
    const artifactDetailInputVisibleRef = ref(true);

    const characterKeys = Object.keys(CHARACTER_MASTER);
    const buildnameSelectionRea = reactive({} as TAnyObject);

    const characterInfoVisibleRef = ref(false);
    const characterInfoModeRef = ref(0);

    const configurationInputRea = reactive({
      全武器解放: false,
      聖遺物サブ効果計算停止: false,
    } as TAnyObject);

    setI18nLanguage("en-us");
    setI18nLanguage("ja-jp");

    // ステータス1, ステータス2, 敵
    const statsInput = reactive(deepcopy(STATS_INPUT_TEMPLATE) as TStatsInput);
    const characterStats1Category1List = [
      "基本ステータス",
      "高級ステータス",
    ];
    const characterStats1Category2List = [
      "元素ステータス·ダメージ",
      "ダメージバフ",
      "実数ダメージ加算",
      "元素反応バフ",
    ];
    const characterStats2Category1List = [
      "元素ステータス·耐性",
    ];
    const characterStats2Category2List = [
      "基礎ステータス",
      "その他",
    ];
    const enemyStatsCategory1List = ["敵元素ステータス·耐性"];
    const enemyStatsCategory2List = [] as string[];
    const enemyList = ENEMY_MASTER_LIST;
    const selectedEnemyRef = ref(enemyList[0]);
    statsInput.statAdjustments["敵レベル"] = 90;
    statsInput.statAdjustments["敵防御力"] = 0;

    const savedSupporters = reactive([] as { key: string; value: string }[]);
    const setupSavedSupporters = () => {
      const buildnameKeys = Object.keys(buildnameSelectionRea);
      const work: any[] = [];
      characterKeys.forEach(character => {
        let key = '構成_' + character;
        if (buildnameKeys.includes(character)) {
          key += '_' + buildnameSelectionRea[character];
        }
        const value = localStorage[key];
        if (value) {
          work.push({ key: character, value });
        }
      });
      savedSupporters.splice(0, savedSupporters.length, ...work);
    };
    setupSavedSupporters();
    console.log("App", "savedSupporters", savedSupporters);

    // 元素共鳴, チーム, その他
    const optionInputRea = reactive(deepcopy(OPTION_INPUT_TEMPLATE) as TOptionInput);

    // ダメージ計算結果
    const damageResult = reactive(deepcopy(DAMAGE_RESULT_TEMPLATE) as TDamageResult);

    const normalAttackReplacing = computed((): boolean[] => {
      const KEY_ARR = ["特殊通常攻撃", "特殊重撃", "特殊落下攻撃"];
      const result = [false, false, false];
      const talentObjArr = Object.keys(characterInputRea.characterMaster)
        .filter((s) => KEY_ARR.includes(s))
        .map((s) => [s, characterInputRea.characterMaster[s]]);
      if (talentObjArr.length > 0) {
        for (const entry of talentObjArr) {
          const index = KEY_ARR.indexOf(entry[0]);
          const talentObj = entry[1];
          if (
            talentObj.条件 in conditionInputRea.conditionValues &&
            conditionInputRea.conditionValues[talentObj.条件]
          ) {
            result[index] = true;
          }
        }
      }
      return result;
    });

    const pane6Toggle1Ref = ref(true);
    const pane6Toggle2Ref = ref(true);
    const pane6Toggle3Ref = ref(true);
    const statInputTabRef = ref(1);
    const optionInputTabRef = ref(1);
    const ownListToggle1Ref = ref(false);
    const ownListToggle2Ref = ref(false);

    /** 敵が変更されました。ステータスおよびダメージを再計算します */
    const updateEnemy = () => {
      (statsInput.enemyMaster as any) = selectedEnemyRef.value;
      // ステータスを計算します
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      // ダメージ計算を実行します
      calculateDamageResult(
        damageResult,
        characterInputRea as any,
        conditionInputRea as any,
        statsInput
      );
    };
    updateEnemy();

    /** 構成情報をローカルストレージに保存します */
    const saveToStorage = (buildname: string) => {
      let identifier = characterInputRea.character;
      const defaultBuildname = [makeDefaultBuildname(characterInputRea.character)];
      if (buildname && !defaultBuildname.includes(buildname)) {
        identifier += "_" + buildname;
      }

      const storageKey = '構成_' + identifier;
      const savedata = makeSavedata(characterInputRea, artifactDetailInputRea, conditionInputRea);
      localStorage.setItem(storageKey, JSON.stringify(savedata));

      const optionsSavedata = makeOptionsSavedata(characterInputRea.character, optionInputRea);
      const storageKey2 = 'オプション構成_' + identifier;
      localStorage.setItem(storageKey2, JSON.stringify(optionsSavedata));

      const artifactScoringSavedata = artifactScoringStats;
      const storageKey3 = 'ArtifactScoring_' + identifier;
      localStorage.setItem(storageKey3, JSON.stringify(artifactScoringSavedata));

      // おすすめセットのリストを更新します
      let opt_buildData;
      if (props.urldata && props.urldata.キャラクター == characterInputRea.character)
        opt_buildData = props.urldata;
      recommendationListRea.splice(
        0,
        recommendationListRea.length,
        ...makeRecommendationList(characterInputRea.characterMaster, opt_buildData)
      );

      // サポーター情報を更新します
      setupSavedSupporters();

      if (storageKey == "構成_" + characterInputRea.character) {
        characterInputRea.buildname = defaultBuildname[0];
      }

      characterInputRea.saveDisabled = true;
      characterInputRea.removeDisabled = false;
    };

    /** ローカルストレージの構成情報を削除します */
    const removeFromStorage = (buildname: string) => {
      let identifier = characterInputRea.character;
      const defaultBuildname = [makeDefaultBuildname(characterInputRea.character)];
      if (buildname && !defaultBuildname.includes(buildname)) {
        identifier += "_" + buildname;
      }

      const storageKey = '構成_' + identifier;
      localStorage.removeItem(storageKey);

      const storageKey2 = 'オプション構成_' + identifier;
      localStorage.removeItem(storageKey2);

      const storageKey3 = 'ArtifactScoring_' + identifier;
      localStorage.removeItem(storageKey3);

      // おすすめセットのリストを更新します
      let opt_buildData;
      if (props.urldata && props.urldata.キャラクター == characterInputRea.character)
        opt_buildData = props.urldata;
      recommendationListRea.splice(
        0,
        recommendationListRea.length,
        ...makeRecommendationList(characterInputRea.characterMaster, opt_buildData)
      );

      // サポーター情報を更新します
      setupSavedSupporters();

      characterInputRea.saveDisabled = false;
      characterInputRea.removeDisabled = true;
    };

    /** おすすめセットを選択しました。もろもろのデータを再作成、ステータスおよびダメージを再計算します */
    const updateRecommendation = async (recommendation: TRecommendation) => {
      console.debug("updateRecommendation", recommendation);
      if (!characterInputRea || !artifactDetailInputRea || !conditionInputRea) return;
      await loadRecommendation(
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea,
        recommendation.build
      );
      if (recommendation.overwrite) {
        characterInputRea.buildname = recommendation.name;
      } else {
        characterInputRea.buildname = "";
      }
      console.debug("updateRecommendation", characterInputRea);
      if (!("精錬ランク" in recommendation.build)) {
        const weapon = characterInputRea.weapon;
        let refine = [1, 1, 1, 5, 3, 1][characterInputRea.weaponMaster.レアリティ];
        let savedRefine;
        if ("武器所持状況" in localStorage) {
          const myWeaponOwnObj = JSON.parse(localStorage["武器所持状況"]);
          if (weapon in myWeaponOwnObj && myWeaponOwnObj[weapon]) {
            savedRefine = Number(myWeaponOwnObj[weapon]);
          }
        }
        if (savedRefine) {
          refine = savedRefine;
        } else if ("精錬ランク" in characterInputRea.weaponMaster) {
          refine = characterInputRea.weaponMaster.精錬ランク;
        }
        const maxRefine = characterInputRea.weaponMaster.レアリティ < 3 ? 1 : 5;
        if (refine > maxRefine) refine = maxRefine;
        characterInputRea.武器精錬ランク = Number(refine);
      }
      if ('artifactScoring' in recommendation.build) {
        const work = recommendation.build.artifactScoring;
        artifactScoringStats.splice(0, artifactScoringStats.length, ...work);
        artifactScoreFormulaVmRef.value.initialize(artifactScoringStats);
      }
      // キャラクターのダメージ計算式を再抽出します
      makeDamageDetailObjArrObjCharacter(characterInputRea);
      // 武器のダメージ計算式を再抽出します
      makeDamageDetailObjArrObjWeapon(characterInputRea);
      // 聖遺物セット効果のダメージ計算式を再抽出します
      makeDamageDetailObjArrObjArtifactSets(characterInputRea);
      setupConditionValues(conditionInputRea, characterInputRea);
      // 聖遺物ステータスを計算します
      calculateArtifactStatsMain(
        artifactDetailInputRea.聖遺物ステータスメイン効果,
        artifactDetailInputRea.聖遺物メイン効果
      );
      let doCalculate = !artifactDetailInputRea.聖遺物優先するサブ効果Disabled;
      if (
        "聖遺物サブ効果計算停止" in configurationInputRea &&
        configurationInputRea.聖遺物サブ効果計算停止
      ) {
        doCalculate = false;
      }
      if (doCalculate) {
        const prioritySubstatValueArr = [
          makePrioritySubstatValueList(
            artifactDetailInputRea.聖遺物優先するサブ効果 as TArtifactSubKey[],
            0
          ),
          makePrioritySubstatValueList(
            artifactDetailInputRea.聖遺物優先するサブ効果 as TArtifactSubKey[],
            1
          ),
          makePrioritySubstatValueList(
            artifactDetailInputRea.聖遺物優先するサブ効果 as TArtifactSubKey[],
            2
          ),
        ];
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
      conditionInputVmRef.value.initialize(conditionInputRea);
      // ステータスを計算します
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      // ダメージ計算を実行します
      calculateDamageResult(
        damageResult,
        characterInputRea as any,
        conditionInputRea as any,
        statsInput
      );

      characterInputRea.saveDisabled = false;
      characterInputRea.removeDisabled = !recommendation.overwrite;

      if ('options' in recommendation.build) {
        // 元素共鳴
        elementalResonanceInputVmRef.value.initializeValues(optionInputRea.elementalResonance);
        // チーム
        teamOptionInputVmRef.value.initializeValues(optionInputRea.teamOption);
        // その他
        miscOptionInputVmRef.value.initializeValues(optionInputRea.miscOption);
      }
    };

    /** キャラクターを選択しました。もろもろのデータを再作成、ステータスおよびダメージを再計算します */
    const updateCharacter = async function (character: TCharacterKey) {
      if (
        !characterInputRea ||
        !recommendationListRea ||
        !artifactDetailInputRea ||
        !conditionInputRea
      )
        return;
      console.debug("updateCharacter", character);
      characterSelectVisibleRef.value = false;
      characterInputRea.character = character;
      characterInputRea.characterMaster = await getCharacterMasterDetail(character);
      let constellation = 0;
      if ("キャラクター所持状況" in localStorage) {
        const myCharacterOwnObj = JSON.parse(localStorage["キャラクター所持状況"]);
        if (character in myCharacterOwnObj && myCharacterOwnObj[character]) {
          constellation = Number(myCharacterOwnObj[character]);
        }
      }
      const maxConstellation = getMaxConstellation(characterInputRea.characterMaster);
      if (constellation > maxConstellation) {
        constellation = maxConstellation;
      }
      characterInputRea.命ノ星座 = constellation;
      const maxNormalAttack = getMaxTalentLevel(
        characterInputRea.characterMaster,
        "通常攻撃"
      );
      if (characterInputRea.通常攻撃レベル > maxNormalAttack) {
        characterInputRea.通常攻撃レベル = maxNormalAttack;
      }
      const maxElementalSkill = getMaxTalentLevel(
        characterInputRea.characterMaster,
        "元素スキル"
      );
      if (characterInputRea.元素スキルレベル > maxElementalSkill) {
        characterInputRea.元素スキルレベル = maxElementalSkill;
      }
      const maxElementalBurst = getMaxTalentLevel(
        characterInputRea.characterMaster,
        "元素爆発"
      );
      if (characterInputRea.元素爆発レベル > maxElementalBurst) {
        characterInputRea.元素爆発レベル = maxElementalBurst;
      }
      let opt_buildData;
      if (props.urldata && props.urldata.キャラクター == character)
        opt_buildData = props.urldata;
      recommendationListRea.splice(
        0,
        recommendationListRea.length,
        ...makeRecommendationList(characterInputRea.characterMaster, opt_buildData)
      );
      recommendationRef.value = recommendationListRea[0];
      characterInputRea.recommendationSelectedIndex = 0;
      await updateRecommendation(recommendationRef.value);
    };

    /** キャラクターのパラメータ（突破レベル、レベル、命ノ星座、通常攻撃レベル、元素スキルレベル、元素爆発レベル）を更新します */
    const updateCharacterInputCharacter = (characterInput: any) => {
      if (!characterInputRea) return;
      Object.keys(characterInput).forEach((key) => {
        if (key in characterInputRea) {
          (characterInputRea as any)[key] = characterInput[key];
        }
      });
      // キャラクターのダメージ計算式を再抽出します
      makeDamageDetailObjArrObjCharacter(characterInputRea);
      setupConditionValues(conditionInputRea, characterInputRea);
      conditionInputVmRef.value.initialize(conditionInputRea);
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      calculateDamageResult(
        damageResult,
        characterInputRea as any,
        conditionInputRea as any,
        statsInput
      );

      characterInputRea.saveDisabled = false;
    };

    const weaponType = computed(() => {
      let result = characterInputRea.characterMaster.武器;
      if (configurationInputRea.全武器解放) {
        result = undefined;
      }
      return result;
    });

    /** 武器選択画面を開きます/閉じます */
    const openWeaponSelect = () => {
      weaponSelectVisibleRef.value = !weaponSelectVisibleRef.value;
      if (weaponSelectVisibleRef.value) {
        artifactSetSelectVisibleRef.value = false;
        artifactDetailInputVisibleRef.value = false;
        characterInfoVisibleRef.value = false;
      }
    };

    /** 武器を選択しました */
    const updateWeapon = async (weapon: TWeaponKey) => {
      if (!characterInputRea) return;
      weaponSelectVisibleRef.value = false;
      characterInputRea.weapon = weapon;
      characterInputRea.weaponMaster = await getWeaponMasterDetail(
        weapon
        // characterInputRea.characterMaster.武器
      );
      let refine = [1, 1, 1, 5, 3, 1][characterInputRea.weaponMaster.レアリティ];
      let savedRefine;
      if ("武器所持状況" in localStorage) {
        const myWeaponOwnObj = JSON.parse(localStorage["武器所持状況"]);
        if (weapon in myWeaponOwnObj && myWeaponOwnObj[weapon]) {
          savedRefine = Number(myWeaponOwnObj[weapon]);
        }
      }
      if (savedRefine) {
        refine = savedRefine;
      } else if ("精錬ランク" in characterInputRea.weaponMaster) {
        refine = characterInputRea.weaponMaster.精錬ランク;
      }
      const maxRefine = characterInputRea.weaponMaster.レアリティ < 3 ? 1 : 5;
      if (refine > maxRefine) refine = maxRefine;
      characterInputRea.武器精錬ランク = Number(refine);
      // 武器のダメージ計算式を再抽出します
      makeDamageDetailObjArrObjWeapon(characterInputRea);
      setupConditionValues(conditionInputRea, characterInputRea);
      conditionInputVmRef.value.initialize(conditionInputRea);
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      calculateDamageResult(
        damageResult,
        characterInputRea as any,
        conditionInputRea as any,
        statsInput
      );

      characterInputRea.saveDisabled = false;
    };

    /** 武器のパラメータ（突破レベル、レベル、精錬ランク）を更新します */
    const updateCharacterInputWeapon = (characterInput: any) => {
      Object.keys(characterInput).forEach((key) => {
        if (characterInputRea && key in characterInputRea) {
          (characterInputRea as any)[key] = characterInput[key];
        }
      });
      // 武器のダメージ計算式を再抽出します
      makeDamageDetailObjArrObjWeapon(characterInputRea);
      setupConditionValues(conditionInputRea, characterInputRea);
      conditionInputVmRef.value.initialize(conditionInputRea);
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      calculateDamageResult(
        damageResult,
        characterInputRea as any,
        conditionInputRea as any,
        statsInput
      );

      characterInputRea.saveDisabled = false;
    };

    /** 聖遺物セット効果選択画面を開きます/閉じます */
    const openArtifactSetSelect = (index: number) => {
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
      }
    };

    /** 聖遺物セット効果を選択しました */
    const updateArtifactSet = (artifactSet: TArtifactSetKey) => {
      if (!characterInputRea) return;
      artifactSets[artifactSetIndexRef.value] = artifactSet;
      const tempMaster = ARTIFACT_SET_MASTER[artifactSet] as TArtifactSet;
      characterInputRea.artifactSetMasters.splice(
        artifactSetIndexRef.value,
        1,
        tempMaster as TArtifactSetEntry
      );
      artifactSetSelectVisibleRef.value = false;
      // 聖遺物セット効果のダメージ計算式を再抽出します
      makeDamageDetailObjArrObjArtifactSets(characterInputRea);
      setupConditionValues(conditionInputRea, characterInputRea);
      conditionInputVmRef.value.initialize(conditionInputRea);
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      calculateDamageResult(
        damageResult,
        characterInputRea as any,
        conditionInputRea as any,
        statsInput
      );

      characterInputRea.saveDisabled = false;
    };

    /** 聖遺物詳細画面を開きます/閉じます */
    const openArtifactDetailInput = () => {
      artifactDetailInputVisibleRef.value = !artifactDetailInputVisibleRef.value;
      if (artifactDetailInputVisibleRef.value) {
        weaponSelectVisibleRef.value = false;
        artifactSetSelectVisibleRef.value = false;
        characterInfoVisibleRef.value = false;
      }
    };

    /** 聖遺物ステータスが変更されました。ステータスおよびダメージを再計算します */
    const updateArtifactDetail = (artifactDetailInput: TArtifactDetailInput) => {
      if (!artifactDetailInputRea) return;
      for (const stat of Object.keys(artifactDetailInput.聖遺物ステータス)) {
        artifactDetailInputRea.聖遺物ステータス[stat] =
          artifactDetailInput.聖遺物ステータス[stat];
      }
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      calculateDamageResult(
        damageResult,
        characterInputRea,
        conditionInputRea,
        statsInput
      );

      configurationInputRea.聖遺物サブ効果計算停止 =
        artifactDetailInput.聖遺物優先するサブ効果Disabled;

      characterInputRea.saveDisabled = false;
    };

    /** キャラクター情報を開きます */
    const openCharacterInfo = (mode: number) => {
      console.log(mode, characterInfoModeRef.value, characterInfoVisibleRef.value);
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
    };

    /** オプション条件が変更されました。ステータスおよびダメージを再計算します */
    const updateCondition = (conditionValues: TConditionValues) => {
      overwriteObject(conditionInputRea.conditionValues, conditionValues);
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      calculateDamageResult(
        damageResult,
        characterInputRea as any,
        conditionInputRea as any,
        statsInput
      );

      characterInputRea.saveDisabled = false;
    };

    const myDamageDatailArr = computed(() => {
      if (characterInputRea) {
        return [
          characterInputRea.damageDetailMyCharacter,
          characterInputRea.damageDetailMyWeapon,
          characterInputRea.damageDetailMyArtifactSets,
        ];
      }
      return [];
    });
    const objectKeys = (obj: any) => {
      if (obj && isPlainObject(obj)) {
        return Object.keys(obj);
      }
      return [];
    };
    const getValue = (obj: any, key: any) => {
      if (obj && isPlainObject(obj)) {
        return obj[key];
      }
      return undefined;
    };

    /** ステータス補正値が変更されました。ステータスおよびダメージを再計算します */
    const updateStatAdjustments = (argStatAdjustments: any) => {
      Object.keys(argStatAdjustments).forEach((key) => {
        statsInput.statAdjustments[key] = argStatAdjustments[key];
      });
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      calculateDamageResult(
        damageResult,
        characterInputRea as any,
        conditionInputRea as any,
        statsInput
      );
    };

    /** 元素共鳴が変更されました。ステータスおよびダメージを再計算します */
    const updateElementalResonance = (conditionInput: TConditionInput) => {
      if (conditionInput && Object.keys(conditionInput).length) {
        overwriteObject(optionInputRea.elementalResonance, conditionInput);
        calculateStats(
          statsInput,
          characterInputRea,
          artifactDetailInputRea,
          conditionInputRea,
          optionInputRea
        );
        calculateDamageResult(
          damageResult,
          characterInputRea as any,
          conditionInputRea as any,
          statsInput
        );
      }
    };

    /** その他オプションが変更されました。ステータスおよびダメージを再計算します */
    const updateMiscOption = (conditionInput: TConditionInput) => {
      if (conditionInput && Object.keys(conditionInput).length) {
        overwriteObject(optionInputRea.miscOption, conditionInput);
        calculateStats(
          statsInput,
          characterInputRea,
          artifactDetailInputRea,
          conditionInputRea,
          optionInputRea
        );
        calculateDamageResult(
          damageResult,
          characterInputRea as any,
          conditionInputRea as any,
          statsInput
        );
      }
    };

    /** チームオプションが変更されました。ステータスおよびダメージを再計算します */
    const updateTeamOption = (conditionInput: TConditionInput) => {
      console.log('updateTeamOption', conditionInput);
      if (conditionInput && Object.keys(conditionInput).length) {
        overwriteObject(optionInputRea.teamOption, conditionInput);
        calculateStats(
          statsInput,
          characterInputRea,
          artifactDetailInputRea,
          conditionInputRea,
          optionInputRea
        );
        calculateDamageResult(
          damageResult,
          characterInputRea as any,
          conditionInputRea as any,
          statsInput
        );
      }
    };

    const updateBuildnameSelection = (buildnameSelection: TAnyObject) => {
      overwriteObject(buildnameSelectionRea, buildnameSelection);
      setupSavedSupporters();
    };

    const openTwitter = () => {
      shareByTwitter(characterInputRea, artifactDetailInputRea, conditionInputRea);
    };

    /** コンフィグレーションが変更されました */
    const updateConfigurationInput = (configurationInput: TAnyObject) => {
      console.debug(configurationInput);
      // overwriteObject(configurationInputRea, configurationInput);
      if (configurationInput.全武器解放) {
        console.log("全武器解放");
      }
      if (configurationInput.聖遺物サブ効果計算停止) {
        artifactDetailInputRea.聖遺物優先するサブ効果Disabled = true;
      }
    };

    /** 聖遺物ステータス（サブ効果）をクリアします*/
    const orderInitializeArtifactStatsSub = () => {
      artifactDetailInputVmRef.value.initializeArtifactStatsSub();

      characterInputRea.saveDisabled = false;
    };

    updateCharacter(characterInputRea.character);

    const enableClearLocalStorage = ref(false);
    const clearLocalStorage = () => {
      localStorage.clear();
      enableClearLocalStorage.value = false;
    };

    return {
      displayName,

      characterInputVmRef,
      artifactDetailInputVmRef,
      conditionInputVmRef,
      elementalResonanceInputVmRef,
      teamOptionInputVmRef,
      miscOptionInputVmRef,
      artifactScoreFormulaVmRef,

      characterInputRea,
      artifactDetailInputRea,
      conditionInputRea,
      recommendationListRea,
      recommendationRef,
      artifactScore,
      artifactScoringStats,
      applyArtifactScoreFormula,

      characterSelectVisibleRef,
      weaponSelectVisibleRef,
      weaponType,
      artifactSetSelectVisibleRef,
      artifactSetIndexRef,
      artifactSets,
      artifactDetailInputVisibleRef,
      characterInfoVisibleRef,
      characterInfoModeRef,
      updateCondition,
      statsInput,
      characterStats1Category1List,
      characterStats1Category2List,
      characterStats2Category1List,
      characterStats2Category2List,
      enemyStatsCategory1List,
      enemyStatsCategory2List,
      enemyList,
      selectedEnemyRef,
      updateEnemy,
      optionInputRea,
      damageResult,
      savedSupporters,
      normalAttackReplacing,

      openTwitter,

      configurationInputRea,

      pane6Toggle1Ref,
      pane6Toggle2Ref,
      pane6Toggle3Ref,
      statInputTabRef,
      optionInputTabRef,
      ownListToggle1Ref,
      ownListToggle2Ref,

      saveToStorage,
      removeFromStorage,
      updateRecommendation,
      updateCharacter,
      openWeaponSelect,
      updateWeapon,
      openArtifactSetSelect,
      updateArtifactSet,
      openArtifactDetailInput,
      updateCharacterInputCharacter,
      updateCharacterInputWeapon,
      updateArtifactDetail,
      openCharacterInfo,
      updateStatAdjustments,
      updateElementalResonance,
      updateMiscOption,
      updateTeamOption,
      updateBuildnameSelection,

      updateConfigurationInput,
      orderInitializeArtifactStatsSub,

      myDamageDatailArr,
      objectKeys,
      getValue,

      enableClearLocalStorage,
      clearLocalStorage,
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
@media all and (min-width: 1251px) {
  .base-container {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: auto auto auto auto auto auto auto;
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
@media all and (min-width: 769px) and (max-width: 1250px) {
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
@media all and (max-width: 768px) {
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
