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
        @open:character-select="openCharacterSelect" @saveToStorage="saveToStorage($event)"
        @removeFromStorage="removeFromStorage($event)" @update:recommendation="updateRecommendation($event)"
        @open:weapon-select="openWeaponSelect" @open:artifact-set-select="openArtifactSetSelect($event)"
        @open:artifact-detail-input="openArtifactDetailInput"
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
          :statsObj="statsInput.statsObj" @update:condition="updateCondition" />
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
            :category2List="characterStats1Category2List" @update:stat-adjustments="updateStatAdjustments" />
        </div>
        <div v-show="statInputTabRef == 2">
          <StatsInput :statsInput="statsInput" :category1List="characterStats2Category1List"
            :category2List="characterStats2Category2List" @update:stat-adjustments="updateStatAdjustments" />
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
            <input type="number" v-model="statsInput.statAdjustments['敵レベル']" min="1"
              @change="updateStatAdjustments()" />
          </label>
          <StatsInput :statsInput="statsInput" :category1List="enemyStatsCategory1List"
            :category2List="enemyStatsCategory2List" @update:stat-adjustments="updateStatAdjustments" />
        </div>
        <div>
          <NextStat :visible="true" :characterInput="characterInputRea" :artifactDetailInput="artifactDetailInputRea"
            :conditionInput="conditionInputRea" :optionInput="optionInputRea" :statsInput="statsInput"
            :damageResult="damageResult" :rotationDamageInfo="rotationDamageInfo"
            @update:stat-adjustments="updateNextStatAdjustments" />
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
        <EasyTeamInput :character="characterInputRea.character" :teamMembers="optionInputRea.teamMembers"
          @update:team-members="updateTeamMembers" />
        <div v-show="optionInputTabRef == 1">
          <ElementalResonanceInput ref="elementalResonanceInputVmRef"
            :elementalResonance="optionInputRea.elementalResonance"
            @update:elemental-resonance="updateElementalResonance" />
        </div>
        <div v-show="optionInputTabRef == 2">
          <TeamOptionInput ref="teamOptionInputVmRef" :character="characterInputRea.character" :topStats="topStats"
            :savedSupporters="savedSupporters" :calculatedSupporters="optionInputRea.supporters"
            :teamMembers="optionInputRea.teamMembers" @update:team-option="updateTeamOption"
            @update:buildname-selection="updateBuildnameSelection" @update:team-members="updateTeamMembers" />
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
      <RotationDamage :characterMaster="characterInputRea.characterMaster" :damageResult="damageResult"
        @update:rotation-damage="updateRotationDamage" />

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
    {{ HTML_LOGGER }}
  </div>
</template>

<script lang="ts">
import _ from "lodash";
import { computed, defineComponent, nextTick, PropType, reactive, ref } from "vue";
import TitleAndHeader from "@/components/TitleAndHeader.vue";
import CharacterSelect from "@/components/CharacterSelect.vue";
import CharacterInput from "@/components/CharacterInput.vue";
import CharacterInfo from "@/components/CharacterInfo.vue";
import WeaponSelect from "@/components/WeaponSelect.vue";
import ArtifactSetSelect from "@/components/ArtifactSetSelect.vue";
import ArtifactDetailInput from "@/components/ArtifactDetailInput.vue";
import ConditionInput from "@/components/ConditionInput.vue";
import StatsInput from "@/components/StatsInput.vue";
import NextStat from "@/components/NextStat.vue";
import EasyTeamInput from "@/components/EasyTeamInput.vue";
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
  makeOptionStorageKey,
  makeArtifactScoringStorageKey,
  makeBuildStorageKey,
  makeDamageDetailObjArrObjElementalResonance,
  updateNumberConditionValues,
  ステータスチーム内最高ARRAY,
  TStats,
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
  ALL_ELEMENTS,
  ARTIFACT_SCORE_FORMULA_TEMPLATE,
  calculateArtifactScore,
  calculateArtifactStats,
  calculateArtifactStatsMain,
  calculateArtifactSubStatByPriority,
  calculateElementalResonance,
  calculateStats,
  calculateSupporter,
  TArtifactScoreFormula,
  TRotationDamageInfo,
} from "@/calculate";
import { deepcopy, overwriteObject } from "@/common";
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
    teamMembers: { type: Array as PropType<string[]>, }
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
    NextStat,
    EasyTeamInput,
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
    ArtifactScoreFormula,
  },
  setup(props) {
    const { setI18nLanguage, displayName } = CompositionFunction();

    const HTML_LOGGER = ref([] as any[]);

    const characterSelectVmRef = ref();
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
    const artifactScoringStats = reactive(
      deepcopy(ARTIFACT_SCORE_FORMULA_TEMPLATE[0]) as TArtifactScoreFormula
    );
    if (props.recommendation?.build?.artifactScoring) {
      artifactScoringStats.splice(
        0,
        artifactScoringStats.length,
        ...props.recommendation.build.artifactScoring
      );
    }
    const applyArtifactScoreFormula = (formula: TArtifactScoreFormula) => {
      artifactScoringStats.splice(0, artifactScoringStats.length, ...formula);
    };
    const artifactScore = computed(() => {
      return calculateArtifactScore(
        characterInputRea,
        artifactDetailInputRea,
        artifactScoringStats
      );
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
    const characterStats1Category1List = ["基本ステータス", "高級ステータス"];
    const characterStats1Category2List = [
      "元素ステータス·ダメージ",
      "ダメージバフ",
      "実数ダメージ加算",
      "元素反応バフ",
    ];
    const characterStats2Category1List = ["基礎ステータス", "元素ステータス·耐性"];
    const characterStats2Category2List = ["その他", 'ステータス連動', 'チーム内最高値'];
    const enemyStatsCategory1List = ["敵ステータス·元素耐性"];
    const enemyStatsCategory2List = ["敵ステータス·その他"];
    const enemyList = ENEMY_MASTER_LIST;
    const selectedEnemyRef = ref(enemyList[0]);
    statsInput.statAdjustments["敵レベル"] = 90;
    statsInput.statAdjustments["敵防御力"] = 0;

    // 元素共鳴, チーム, その他
    const optionInputRea = reactive(_.cloneDeep(OPTION_INPUT_TEMPLATE) as TOptionInput);
    const savedSupporters = reactive([] as { key: string, value: string, buildname: string }[]);

    // ダメージ計算結果
    const damageResult = reactive(_.cloneDeep(DAMAGE_RESULT_TEMPLATE) as TDamageResult);

    const rotationDamageInfo = reactive({
      totalDamage: 0,
      rotationDamages: [],
    } as TRotationDamageInfo);

    const pane6Toggle1Ref = ref(true);
    const pane6Toggle2Ref = ref(true);
    const pane6Toggle3Ref = ref(true);
    const statInputTabRef = ref(1);
    const optionInputTabRef = ref(1);
    const ownListToggle1Ref = ref(false);
    const ownListToggle2Ref = ref(false);
    const enableClearLocalStorage = ref(false);

    async function updateOptionInputSupporter(key: string) {
      const savedSupporter = savedSupporters.filter(s => s.key == key);
      if (savedSupporter.length) {
        await calculateSupporter(optionInputRea, savedSupporter[0].key as TCharacterKey, savedSupporter[0].value, characterInputRea.character as TCharacterKey);
      }
    }

    async function setupSavedSupporters() {
      const buildnameKeys = Object.keys(buildnameSelectionRea);
      const work: any[] = [];
      characterKeys.forEach((character) => {
        const keyPrefix = makeBuildStorageKey(character);
        let key = keyPrefix;
        let buildname = makeDefaultBuildname(character);
        if (buildnameKeys.includes(character)) {
          buildname = buildnameSelectionRea[character];
          key = makeBuildStorageKey(character, buildname);
        }
        let value = localStorage[key];
        if (value) {
          work.push({ key: character, value: value, buildname: buildname });
        } else {
          const workKeyArr = Object.keys(localStorage).filter(s => s.startsWith(keyPrefix));
          if (workKeyArr.length) {
            key = workKeyArr.sort()[0];
            value = localStorage[key];
            buildname = key.replace(new RegExp('^' + keyPrefix + '_'), '');
            work.push({ key: character, value: value, buildname: buildname });
            buildnameSelectionRea[character] = buildname;
          }
        }
      });
      savedSupporters.splice(0, savedSupporters.length, ...work);
      console.log("App", "savedSupporters", savedSupporters);

      const list: Promise<void>[] = [];
      savedSupporters.forEach(savedSupporter => {
        list.push(updateOptionInputSupporter(savedSupporter.key as TCharacterKey));
      });
      await Promise.all(list);
      teamOptionInputVmRef.value.initializeSupporters(optionInputRea.supporters);
    }
    setupSavedSupporters();

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
      const storageKey = makeBuildStorageKey(characterInputRea.character, buildname);
      const savedata = makeSavedata(
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea
      );
      localStorage.setItem(storageKey, JSON.stringify(savedata));

      const optionsSavedata = makeOptionsSavedata(
        characterInputRea.character,
        optionInputRea
      );
      const storageKey2 = makeOptionStorageKey(characterInputRea.character, buildname);
      localStorage.setItem(storageKey2, JSON.stringify(optionsSavedata));

      const artifactScoringSavedata = artifactScoringStats;
      const storageKey3 = makeArtifactScoringStorageKey(
        characterInputRea.character,
        buildname
      );
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
      const workArr = savedSupporters.filter(s => s.key == characterInputRea.character);
      if (workArr.length === 0 || workArr[0].buildname == buildname) {
        setupSavedSupporters();
        updateOptionInputSupporter(characterInputRea.character);
      }

      if (storageKey == makeBuildStorageKey(characterInputRea.character)) {
        characterInputRea.buildname = makeDefaultBuildname(characterInputRea.character);
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

      const storageKey = "構成_" + identifier;
      localStorage.removeItem(storageKey);

      const storageKey2 = "オプション構成_" + identifier;
      localStorage.removeItem(storageKey2);

      const storageKey3 = "ArtifactScoring_" + identifier;
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

    /** チーム編成に依存するオプションの値を調整します */
    async function updateConditionByTeamMembers() {
      const teamMembers = optionInputRea?.teamMembers;
      if (!teamMembers || teamMembers.length === 0) return;

      const character = characterInputRea.character;
      const myVision = CHARACTER_MASTER[character as TCharacterKey].元素;
      const teamElements: TAnyObject = {};
      teamElements[myVision] = 1;
      teamMembers.forEach(entry => {
        const vision = CHARACTER_MASTER[entry as TCharacterKey].元素;
        if (vision in teamElements) {
          teamElements[vision]++;
        } else {
          teamElements[vision] = 1;
        }
      });

      // 武器のオプションを調整します
      if (['千岩古剣', '千岩長槍'].includes(characterInputRea.weapon)) {
        let liyueCount = 0;
        if (['璃月港'].includes(characterInputRea.characterMaster.region)) {
          liyueCount++;
        }
        for (const entry of teamMembers.filter(s => s)) {
          const characterDetail = await getCharacterMasterDetail(entry as TCharacterKey);
          if (characterDetail.region) {
            if (['璃月港'].includes(characterDetail.region)) {
              liyueCount++;
            }
          }
        }
        const conditionKey = '[' + characterInputRea.weapon + ']璃月キャラ1人毎に攻撃力と会心率+';
        conditionInputRea.conditionValues[conditionKey] = liyueCount;
      } else if (['惡王丸', '斬波のひれ長', '曚雲の月'].includes(characterInputRea.weapon)) {
        let totalEnergyCost = 0;
        for (const entry of teamMembers.filter(s => s)) {
          const characterDetail = await getCharacterMasterDetail(entry as TCharacterKey);
          if ('元素エネルギー' in characterDetail.元素爆発) {
            totalEnergyCost += characterDetail.元素爆発.元素エネルギー;
          }
        }
        if (totalEnergyCost) {
          conditionInputRea.conditionValues['チーム全員の元素エネルギー上限の合計'] = totalEnergyCost;
        }
      }

      const sameCount = teamElements[myVision] - 1;
      const otherElements = Object.keys(teamElements).filter(s => s != myVision);
      const otherCount = otherElements.length ? otherElements.map(s => teamElements[s]).reduce((a, b) => a + b) : 0;
      conditionInputRea.conditionValues['[チーム]同じ元素のキャラクター'] = sameCount;
      conditionInputRea.conditionValues['[チーム]異なる元素のキャラクター'] = otherCount;
      conditionInputRea.conditionValues['[チーム]キャラクターの元素タイプ'] = Object.keys(teamElements).length - 1; // requiredなので1減らします
      ALL_ELEMENTS.forEach(vision => {
        const key1 = '[チーム]' + vision + '元素キャラクター';
        conditionInputRea.conditionValues[key1] = teamElements[vision] ?? 0;
        const key2 = '[チーム]' + vision + '元素キャラクター(自分以外)';
        conditionInputRea.conditionValues[key2] = (teamElements[vision] ?? 0) - (vision == myVision ? 1 : 0);
      });
      if (character === 'ゴロー') {
        const key = '[チーム]岩元素キャラクター';
        let count = conditionInputRea.conditionValues[key];
        conditionInputRea.conditionValues[key] = Math.min(3, count);
      } else if (character === 'ナヒーダ') {
        ['炎', '水', '雷'].forEach(vision => {
          const key1 = '[チーム]' + vision + '元素キャラクター';
          let count1 = conditionInputRea.conditionValues[key1];
          if (characterInputRea.命ノ星座 >= 1) {
            count1++;
          }
          conditionInputRea.conditionValues[key1] = Math.min(2, count1);
          const key2 = '[チーム]' + vision + '元素キャラクター(自分以外)';
          let count2 = conditionInputRea.conditionValues[key2];
          if (characterInputRea.命ノ星座 >= 1) {
            count2++;
          }
          conditionInputRea.conditionValues[key2] = Math.min(2, count2);
        });
      }

      // 元素共鳴を調整します
      const newElementResonance: TConditionValues = {};
      const resonanceElementArr: string[] = Object.keys(teamElements).filter(s => teamElements[s] >= 2);
      if (optionInputRea.teamMembers.length == 3) {
        if (resonanceElementArr.length > 1) {
          newElementResonance[resonanceElementArr[0] + '元素共鳴'] = true;
          newElementResonance[resonanceElementArr[1] + '元素共鳴'] = true;
        } else if (resonanceElementArr.length > 0) {
          newElementResonance[resonanceElementArr[0] + '元素共鳴'] = true;
        } else {
          newElementResonance['元素共鳴なし'] = true;
        }
      } else if (resonanceElementArr.length > 0) {
        const tempArr: string[] = [resonanceElementArr[0] + '元素共鳴'];
        const restMemberElementArr = Object.keys(teamElements).filter(s => teamElements[s] == 1);
        const currentElementArr = Object.keys(optionInputRea.elementalResonance.conditionValues).filter(s => optionInputRea.elementalResonance.conditionValues[s] && s != '元素共鳴なし').map(s => s.replace(/元素共鳴$/, ''));
        currentElementArr.forEach(element => {
          if (restMemberElementArr.includes(element)) {
            tempArr.push(element + '元素共鳴');
          }
        });
        if (tempArr.length < 2) {
          ALL_ELEMENTS.forEach(element => {
            const resonance = element + '元素共鳴';
            if (optionInputRea.elementalResonance.conditionValues[resonance]) {
              if (!tempArr.includes(resonance)) {
                tempArr.push(resonance);
              }
            }
          });
        }
        tempArr.forEach(resonance => {
          newElementResonance[resonance] = true;
        })
      }
      if (!_.isEqual(newElementResonance, optionInputRea.elementalResonance.conditionValues)) {
        overwriteObject(optionInputRea.elementalResonance.conditionValues, newElementResonance);
        elementalResonanceInputVmRef.value.initializeValues(optionInputRea.elementalResonance);
      }

      console.log(characterInputRea.characterMaster, conditionInputRea.conditionValues);
    }

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
      if ("artifactScoring" in recommendation.build) {
        const work = recommendation.build.artifactScoring;
        artifactScoringStats.splice(0, artifactScoringStats.length, ...work);
        artifactScoreFormulaVmRef.value.initialize(artifactScoringStats);
      }
      // チーム編成を反映します
      updateConditionByTeamMembers();
      // キャラクターのダメージ計算式を再抽出します
      makeDamageDetailObjArrObjCharacter(characterInputRea);
      // 武器のダメージ計算式を再抽出します
      makeDamageDetailObjArrObjWeapon(characterInputRea);
      // 聖遺物セット効果のダメージ計算式を再抽出します
      makeDamageDetailObjArrObjArtifactSets(characterInputRea);
      // 元素共鳴のダメージ計算式を再抽出します
      makeDamageDetailObjArrObjElementalResonance(characterInputRea);
      setupConditionValues(conditionInputRea, characterInputRea, optionInputRea);
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
      const conditionAdjustments = calculateElementalResonance(optionInputRea.elementalResonance.conditionValues, conditionInputRea);
      overwriteObject(optionInputRea.elementalResonance.conditionAdjustments, conditionAdjustments);
      // ステータスを計算します
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      // ステータス計算後、numberタイプの条件入力を更新します
      updateNumberConditionValues(conditionInputRea, characterInputRea, statsInput.statsObj);
      conditionInputVmRef.value.initialize(conditionInputRea);
      // 再度、ステータスを計算します
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

      if ("options" in recommendation.build) {
        // 元素共鳴
        elementalResonanceInputVmRef.value.initializeValues(
          optionInputRea.elementalResonance
        );
        // チーム
        teamOptionInputVmRef.value.initializeValues(optionInputRea.teamOption);
        // その他
        miscOptionInputVmRef.value.initializeValues(optionInputRea.miscOption);
      }
    };

    /** キャラクターを選択しました。もろもろのデータを再作成、ステータスおよびダメージを再計算します */
    const updateCharacter = async function (character: TCharacterKey, teamMembers?: string[]) {
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
      if (teamMembers) {
        optionInputRea.teamMembers.splice(0, optionInputRea.teamMembers.length, ...teamMembers);
      } else {
        optionInputRea.teamMembers.splice(0, optionInputRea.teamMembers.length);  // チーム編成を初期化します（解散）
      }
      await updateRecommendation(recommendationRef.value);

      await nextTick();
      document.querySelector('.pane3')?.scrollIntoView({ block: 'nearest' });
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
      setupConditionValues(conditionInputRea, characterInputRea, optionInputRea);
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      // ステータス計算後、numberタイプの条件入力を更新します
      updateNumberConditionValues(conditionInputRea, characterInputRea, statsInput.statsObj);
      conditionInputVmRef.value.initialize(conditionInputRea);
      // 再度、ステータスを計算します
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

    /** キャラクター選択画面を開きます/閉じます */
    const openCharacterSelect = async () => {
      characterSelectVisibleRef.value = !characterSelectVisibleRef.value;
      if (characterSelectVisibleRef.value) {
        await nextTick();
        document.querySelector('.pane2')?.scrollIntoView({ block: 'nearest' });
      }
    };

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
    };

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
      setupConditionValues(conditionInputRea, characterInputRea, optionInputRea);
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      // ステータス計算後、numberタイプの条件入力を更新します
      updateNumberConditionValues(conditionInputRea, characterInputRea, statsInput.statsObj);
      conditionInputVmRef.value.initialize(conditionInputRea);
      // 再度、ステータスを計算します
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

      await nextTick();
      document.querySelector('.pane3')?.scrollIntoView({ block: 'nearest' });
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
      setupConditionValues(conditionInputRea, characterInputRea, optionInputRea);
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      // ステータス計算後、numberタイプの条件入力を更新します
      updateNumberConditionValues(conditionInputRea, characterInputRea, statsInput.statsObj);
      conditionInputVmRef.value.initialize(conditionInputRea);
      // 再度、ステータスを計算します
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

    /** 聖遺物セット効果を選択しました */
    const updateArtifactSet = async (artifactSet: TArtifactSetKey) => {
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
      setupConditionValues(conditionInputRea, characterInputRea, optionInputRea);
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      // ステータス計算後、numberタイプの条件入力を更新します
      updateNumberConditionValues(conditionInputRea, characterInputRea, statsInput.statsObj);
      conditionInputVmRef.value.initialize(conditionInputRea);
      // 再度、ステータスを計算します
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

      await nextTick();
      document.querySelector('.pane3')?.scrollIntoView({ block: 'nearest' });
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
      // ステータス計算後、numberタイプの条件入力を更新します
      updateNumberConditionValues(conditionInputRea, characterInputRea, statsInput.statsObj);
      conditionInputVmRef.value.updateNumberList(conditionInputRea);
      // 再度、ステータスを計算します
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
      const conditionAdjustments = calculateElementalResonance(optionInputRea.elementalResonance.conditionValues, conditionInputRea);
      overwriteObject(optionInputRea.elementalResonance.conditionAdjustments, conditionAdjustments);
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      // ステータス計算後、numberタイプの条件入力を更新します
      updateNumberConditionValues(conditionInputRea, characterInputRea, statsInput.statsObj);
      conditionInputVmRef.value.updateNumberList(conditionInputRea);
      // 再度、ステータスを計算します
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
      if (obj && _.isPlainObject(obj)) {
        return Object.keys(obj);
      }
      return [];
    };
    const getValue = (obj: any, key: any) => {
      if (obj && _.isPlainObject(obj)) {
        return obj[key];
      }
      return undefined;
    };

    const topStats = computed(() => {
      const result: TStats = {};
      ステータスチーム内最高ARRAY.forEach(stat => {
        result[stat] = statsInput.statsObj[stat];
      });
      return result;
    });

    /** ステータス補正値が変更されました。ステータスおよびダメージを再計算します */
    const updateStatAdjustments = (argStatAdjustments?: TStats) => {
      if (argStatAdjustments) {
        Object.keys(argStatAdjustments).forEach((key) => {
          statsInput.statAdjustments[key] = argStatAdjustments[key];
        });
      }
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      // ステータス計算後、numberタイプの条件入力を更新します
      updateNumberConditionValues(conditionInputRea, characterInputRea, statsInput.statsObj);
      conditionInputVmRef.value.updateNumberList(conditionInputRea);
      // 再度、ステータスを計算します
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

    const updateNextStatAdjustments = (argStatAdjustments?: TStats) => {
      if (argStatAdjustments) {
        statsInput.statAdjustmentsEx = argStatAdjustments;
        updateStatAdjustments();
      }
    };

    const updateRotationDamage = (argRotationDamageInfo: TRotationDamageInfo) => {
      rotationDamageInfo.totalDamage = argRotationDamageInfo.totalDamage;
      rotationDamageInfo.rotationDamages.splice(0, rotationDamageInfo.rotationDamages.length, ...argRotationDamageInfo.rotationDamages);
    };

    /** 元素共鳴が変更されました。ステータスおよびダメージを再計算します */
    const updateElementalResonance = (conditionValues: TConditionValues) => {
      if (conditionValues && Object.keys(conditionValues).length) {
        overwriteObject(optionInputRea.elementalResonance.conditionValues, conditionValues);
        setupConditionValues(conditionInputRea, characterInputRea, optionInputRea);
        const conditionAdjustments = calculateElementalResonance(optionInputRea.elementalResonance.conditionValues, conditionInputRea);
        overwriteObject(optionInputRea.elementalResonance.conditionAdjustments, conditionAdjustments);
        calculateStats(
          statsInput,
          characterInputRea,
          artifactDetailInputRea,
          conditionInputRea,
          optionInputRea
        );
        // ステータス計算後、numberタイプの条件入力を更新します
        updateNumberConditionValues(conditionInputRea, characterInputRea, statsInput.statsObj);
        conditionInputVmRef.value.updateNumberList(conditionInputRea);
        // 再度、ステータスを計算します
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
        conditionInputVmRef.value.initialize(conditionInputRea);
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
        // ステータス計算後、numberタイプの条件入力を更新します
        updateNumberConditionValues(conditionInputRea, characterInputRea, statsInput.statsObj);
        conditionInputVmRef.value.updateNumberList(conditionInputRea);
        // 再度、ステータスを計算します
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
      if (conditionInput && Object.keys(conditionInput).length) {
        overwriteObject(optionInputRea.teamOption, conditionInput);
        calculateStats(
          statsInput,
          characterInputRea,
          artifactDetailInputRea,
          conditionInputRea,
          optionInputRea
        );
        // ステータス計算後、numberタイプの条件入力を更新します
        updateNumberConditionValues(conditionInputRea, characterInputRea, statsInput.statsObj);
        conditionInputVmRef.value.updateNumberList(conditionInputRea);
        // 再度、ステータスを計算します
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
      Object.keys(buildnameSelection).forEach(key => {
        updateOptionInputSupporter(key);
      })
    };

    const updateTeamMembers = async (teamMembers: string[]) => {
      optionInputRea.teamMembers.splice(0, optionInputRea.teamMembers.length, ...teamMembers);

      await updateConditionByTeamMembers();

      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      // ステータス計算後、numberタイプの条件入力を更新します
      updateNumberConditionValues(conditionInputRea, characterInputRea, statsInput.statsObj);
      conditionInputVmRef.value.updateNumberList(conditionInputRea);
      // 再度、ステータスを計算します
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

    const openTwitter = () => {
      shareByTwitter(characterInputRea, artifactDetailInputRea, conditionInputRea);
    };

    /** コンフィグレーションが変更されました */
    const updateConfigurationInput = (argConfigurationInput: TAnyObject) => {
      console.debug(argConfigurationInput);
      if (argConfigurationInput.全武器解放) {
        console.log("全武器解放");
      }
      if (argConfigurationInput.聖遺物サブ効果計算停止) {
        artifactDetailInputRea.聖遺物優先するサブ効果Disabled = true;
      }
    };

    /** 聖遺物ステータス（サブ効果）をクリアします*/
    const orderInitializeArtifactStatsSub = () => {
      artifactDetailInputVmRef.value.initializeArtifactStatsSub();

      characterInputRea.saveDisabled = false;
    };

    const clearLocalStorage = () => {
      localStorage.clear();
      enableClearLocalStorage.value = false;
    };

    updateCharacter(characterInputRea.character, props.teamMembers);

    return {
      displayName,

      HTML_LOGGER,

      characterSelectVmRef,
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
      topStats,
      rotationDamageInfo,

      openTwitter,

      configurationInputRea,

      pane6Toggle1Ref,
      pane6Toggle2Ref,
      pane6Toggle3Ref,
      statInputTabRef,
      optionInputTabRef,
      ownListToggle1Ref,
      ownListToggle2Ref,

      openCharacterSelect,

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
      updateNextStatAdjustments,
      updateRotationDamage,
      updateElementalResonance,
      updateMiscOption,
      updateTeamOption,
      updateBuildnameSelection,
      updateTeamMembers,

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
