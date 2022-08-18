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
        :artifactSetSelectVisible="artifactSetSelectVisibleRef"
        @open:character-select="characterSelectVisibleRef = !characterSelectVisibleRef"
        @saveToStorage="saveToStorage($event)" @removeFromStorage="removeFromStorage($event)"
        @update:recommendation="updateRecommendation($event)" @open:weapon-select="openWeaponSelect"
        @open:artifact-set-select="openArtifactSetSelect($event)" @open:artifact-detail-input="openArtifactDetailInput"
        @update:character-input-character="updateCharacterInputCharacter($event)"
        @update:character-input-weapon="updateCharacterInputWeapon($event)"
        @open:character-info="openCharacterInfo($event)" />
      <CharacterInfo :visible="characterInfoVisibleRef" :mode="characterInfoModeRef"
        :characterMaster="characterInputRea.characterMaster" :ascension="characterInputRea.突破レベル"
        :level="characterInputRea.レベル" :normalAttackLevel="characterInputRea.通常攻撃レベル"
        :elementalSkillLevel="characterInputRea.元素スキルレベル" :elementalBurstLevel="characterInputRea.元素爆発レベル" />
      <WeaponSelect :visible="weaponSelectVisibleRef" :weapon="weapon" :weaponType="weaponType"
        :weaponMaster="characterInputRea.weaponMaster" :ascension="characterInputRea.武器突破レベル"
        :level="characterInputRea.武器レベル" @update:weapon="updateWeapon($event)" />
      <ArtifactSetSelect :visible="artifactSetSelectVisibleRef" :index="artifactSetIndexRef"
        :artifactSet="artifactSets[artifactSetIndexRef]" :artifactSetMasters="characterInputRea.artifactSetMasters"
        @update:artifact-set="updateArtifactSet($event)" />
      <ArtifactDetailInput ref="artifactDetailInputVmRef" :visible="artifactDetailInputVisibleRef"
        :artifactDetailInput="artifactDetailInputRea" @update:artifact-detail="updateArtifactDetail($event)" />
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
          :conditionInput="conditionInputRea" @update:condition="updateCondition" />
      </div>
      <div v-if="pane6Toggle2Ref" style="margin-bottom: 10px">
        <div class="tab-switch">
          <input id="status-input-tab-1" type="radio" v-model="statInputTabRef" name="stat-input-tab" value="1" />
          <label for="status-input-tab-1"> {{ displayName("ステータス1") }} </label>
          <input id="status-input-tab-2" type="radio" v-model="statInputTabRef" name="stat-input-tab" value="2" />
          <label for="status-input-tab-2"> {{ displayName("ステータス2") }} </label>
          <input id="status-input-tab-3" type="radio" v-model="statInputTabRef" name="stat-input-tab" value="3" />
          <label for="status-input-tab-3"> {{ displayName("敵") }} </label>
        </div>
        <template v-if="statInputTabRef == 1">
          <StatsInput :statsInput="statsInput" :categoryList="characterStats1CategoryList"
            @update:stat-adjustments="updateStatAdjustments($event)" />
        </template>
        <template v-if="statInputTabRef == 2">
          <StatsInput :statsInput="statsInput" :categoryList="characterStats2CategoryList"
            @update:stat-adjustments="updateStatAdjustments($event)" />
        </template>
        <template v-if="statInputTabRef == 3">
          <label class="enemy">{{ displayName("敵") }}
            <select v-model="selectedEnemyRef" @change="updateEnemy">
              <option v-for="item in enemyList" :value="item" :key="item.key">
                {{ displayName(item.key) }}
              </option>
            </select>
          </label>
          <label class="enemy-level">Lv.
            <input type="number" v-model="statsInput.statAdjustments['敵レベル']" min="1" />
          </label>
          <StatsInput :statsInput="statsInput" :categoryList="enemyStatsCategoryList"
            @update:stat-adjustments="updateStatAdjustments($event)" />
        </template>
      </div>
      <div v-if="pane6Toggle3Ref" style="margin-bottom: 10px">
        <div class="tab-switch">
          <input id="option-input-tab-1" type="radio" v-model="optionInputTabRef" name="option-input-tab" value="1" />
          <label for="option-input-tab-1"> {{ displayName("元素共鳴") }} </label>
          <input id="option-input-tab-2" type="radio" v-model="optionInputTabRef" name="option-input-tab" value="2" />
          <label for="option-input-tab-2"> {{ displayName("チーム") }} </label>
          <input id="option-input-tab-3" type="radio" v-model="optionInputTabRef" name="option-input-tab" value="3" />
          <label for="option-input-tab-3"> {{ displayName("その他") }} </label>
        </div>
        <template v-if="optionInputTabRef == 1">
          <ElementalResonanceInput :elementalResonanceChecked="optionInputRea.elementalResonanceChecked"
            @update:elemental-resonance="updateElementalResonance($event)" />
        </template>
        <template v-if="optionInputTabRef == 2">
          <TeamOptionInput :character="characterInputRea.character" :savedSupporters="savedSupporters"
            @update:team-option="updateTeamOption" />
        </template>
        <template v-if="optionInputTabRef == 3">
          <MiscOptionInput @update:misc-option="updateMiscOption" />
        </template>
      </div>
    </div>

    <div class="result-pane">
      <DamageResult :damageResult="damageResult" />
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
    </div>

    <div class="pane7">
      <AboutMyApp />
      <ConfigurationInput @update:configuration-input="updateConfigurationInput"
        @order:initialize-artifact-stats-sub="orderInitializeArtifactStatsSub" />
    </div>

    <hr />

    <div class="footer">
      <hr />
      <p>© 2021 asagume</p>
      <p>
        本サイト内の画像はHoYoverse/COGNOSPHEREの著作物です。
        Copyright © COGNOSPHERE. All Rights Reserved.
      </p>
    </div>

  </div>

  <div id="debug-info" v-if="true">
    <hr />
    <h2>DEBUG</h2>
    <template v-if="characterInputRea">
      <dl v-for="(dd, index) in myDamageDatailArr.filter((s) => s)" :key="index">
        <template v-for="key in objectKeys(dd)" :key="key">
          <template v-if="getValue(dd, key)">
            <dt>{{ key }}</dt>
            <dd>
              <ol v-if="Array.isArray(getValue(dd, key))">
                <li v-for="item in getValue(dd, key)" :key="item">{{ item }}</li>
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
import AboutMyApp from "@/components/AboutMyApp.vue";
import ConfigurationInput from "@/components/ConfigurationInput.vue";
import CharacterOwnList from "@/components/CharacterOwnList.vue";
import WeaponOwnList from "@/components/WeaponOwnList.vue";
import {
  TRecommendation,
  makeRecommendationList,
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
  TStats,
  CHARACTER_INPUT_TEMPLATE,
  ARTIFACT_DETAIL_INPUT_TEMPLATE,
  CONDITION_INPUT_TEMPLATE,
  makeSavedata,
} from "@/input";
import {
  ARTIFACT_SET_MASTER,
  ELEMENTAL_RESONANCE_MASTER,
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
  calculateArtifactStats,
  calculateArtifactStatsMain,
  calculateArtifactSubStatByPriority,
  calculateStats,
  makePrioritySubstatValueList,
} from "@/calculate";
import { deepcopy, isPlainObject, overwriteObject } from "./common";
import { calculateResult } from "./calculate";
import CompositionFunction from "./components/CompositionFunction.vue";

export default defineComponent({
  name: "App",
  props: {
    characterInput: { type: Object as PropType<TCharacterInput>, required: true },
    artifactDetailInput: { type: Object as PropType<TArtifactDetailInput>, required: true, },
    conditionInput: { type: Object as PropType<TConditionInput>, required: true },
    recommendationList: { type: Array as PropType<TRecommendation[]>, required: true, },
    recommendation: { type: Object as PropType<TRecommendation>, required: true, },
    urldata: { type: Object as PropType<TAnyObject>, },
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
    AboutMyApp,
    ConfigurationInput,
    CharacterOwnList,
    WeaponOwnList,
  },
  setup(props) {
    const { setI18nLanguage, displayName } = CompositionFunction();

    const characterInputVmRef = ref();
    const artifactDetailInputVmRef = ref();
    const conditionInputVmRef = ref();

    const characterInputRea = reactive(overwriteObject(deepcopy(CHARACTER_INPUT_TEMPLATE), props.characterInput));
    const artifactDetailInputRea = reactive(overwriteObject(deepcopy(ARTIFACT_DETAIL_INPUT_TEMPLATE), props.artifactDetailInput));
    const conditionInputRea = reactive(overwriteObject(deepcopy(CONDITION_INPUT_TEMPLATE), props.conditionInput));
    const recommendationListRea = reactive([...props.recommendationList]);
    const recommendationRef = ref(props.recommendation);

    const characterSelectVisibleRef = ref(false);

    const weaponSelectVisibleRef = ref(false);
    const weapon = characterInputRea.weapon;
    const weaponType = characterInputRea.characterMaster.武器;

    const artifactSetSelectVisibleRef = ref(false);
    const artifactSetIndexRef = ref(0);
    const artifactSets = characterInputRea.artifactSets;
    const artifactDetailInputVisibleRef = ref(true);

    const characterInfoVisibleRef = ref(false);
    const characterInfoModeRef = ref(0);

    // Englishの辞書データをロードします
    setI18nLanguage('en-us');
    setI18nLanguage('ja-jp');

    // ステータス1, ステータス2, 敵
    const statsInput = reactive(deepcopy(STATS_INPUT_TEMPLATE) as TStatsInput);
    const characterStats1CategoryList = [
      "基本ステータス",
      "高級ステータス",
      "元素ステータス·ダメージ",
      "ダメージバフ",
      "実数ダメージ加算",
      "元素反応バフ",
    ];
    const characterStats2CategoryList = [
      "元素ステータス·耐性",
      "基礎ステータス",
      "その他",
    ];
    const enemyStatsCategoryList = ["敵元素ステータス·耐性"];
    const enemyList = ENEMY_MASTER_LIST;
    const selectedEnemyRef = ref(enemyList[0]);
    statsInput.statAdjustments["敵レベル"] = 90;
    statsInput.statAdjustments["敵防御力"] = 0;

    const savedSupporters = reactive([] as { key: string; value: string }[]);
    const setupSavedSupporters = () => {
      const work = Object.keys(localStorage)
        .filter((s) => s.startsWith("構成_") && s.split("_").length == 2)
        .map((s) => ({ key: s, value: localStorage[s] }));
      savedSupporters.splice(0, savedSupporters.length, ...work);
    };
    setupSavedSupporters();

    // 元素共鳴, チーム, その他
    const optionInputRea = reactive(deepcopy(OPTION_INPUT_TEMPLATE) as TOptionInput);
    // 元素共鳴
    for (const name of Object.keys(ELEMENTAL_RESONANCE_MASTER)) {
      optionInputRea.elementalResonanceChecked[name] = false;
    }

    // ダメージ計算結果
    const damageResult = reactive(deepcopy(DAMAGE_RESULT_TEMPLATE) as TDamageResult);

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
      calculateResult(
        damageResult,
        characterInputRea as any,
        conditionInputRea as any,
        statsInput
      );
    };
    updateEnemy();

    /** 構成情報をローカルストレージに保存します */
    const saveToStorage = (buildname: string) => {
      let storageKey = '構成_' + characterInputRea.character;
      if (buildname && buildname != 'あなたの' + characterInputRea.character) {
        storageKey += '_' + buildname;
      }
      const savedata = makeSavedata(characterInputRea, artifactDetailInputRea, conditionInputRea);
      localStorage.setItem(storageKey, JSON.stringify(savedata));

      // おすすめセットのリストを更新します
      let opt_buildData;
      if (props.urldata && props.urldata.キャラクター == characterInputRea.character) opt_buildData = props.urldata;
      recommendationListRea.splice(
        0,
        recommendationListRea.length,
        ...makeRecommendationList(characterInputRea.characterMaster, opt_buildData)
      );

      // サポーター情報を更新します
      setupSavedSupporters();

      characterInputRea.saveDisabled = true;
      characterInputRea.removeDisabled = false;
    }

    /** ローカルストレージの構成情報を削除します */
    const removeFromStorage = (buildname: string) => {
      let storageKey = '構成_' + characterInputRea.character;
      if (buildname && buildname != 'あなたの' + characterInputRea.character) {
        storageKey += '_' + buildname;
      }
      localStorage.removeItem(storageKey);

      // おすすめセットのリストを更新します
      let opt_buildData;
      if (props.urldata && props.urldata.キャラクター == characterInputRea.character) opt_buildData = props.urldata;
      recommendationListRea.splice(
        0,
        recommendationListRea.length,
        ...makeRecommendationList(characterInputRea.characterMaster, opt_buildData)
      );

      // サポーター情報を更新します
      setupSavedSupporters();

      characterInputRea.saveDisabled = false;
      characterInputRea.removeDisabled = true;
    }

    /** おすすめセットを選択しました。もろもろのデータを再作成、ステータスおよびダメージを再計算します */
    const updateRecommendation = async (recommendation: TRecommendation) => {
      console.debug('updateRecommendation', recommendation);
      if (!characterInputRea || !artifactDetailInputRea || !conditionInputRea) return;
      await loadRecommendation(
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        recommendation.build
      );
      if (recommendation.overwrite) {
        characterInputRea.buildname = recommendation.name;
      } else {
        characterInputRea.buildname = '';
      }
      console.debug('updateRecommendation', characterInputRea);
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
      if (!artifactDetailInputRea.聖遺物優先するサブ効果Disabled) {
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
      // ステータスを計算します
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      // ダメージ計算を実行します
      calculateResult(
        damageResult,
        characterInputRea as any,
        conditionInputRea as any,
        statsInput
      );

      characterInputRea.saveDisabled = false;
      characterInputRea.removeDisabled = !recommendation.overwrite;
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
      console.debug('updateCharacter', character);
      characterSelectVisibleRef.value = false;
      characterInputRea.character = character;
      characterInputRea.characterMaster = await getCharacterMasterDetail(character);
      let opt_buildData;
      if (props.urldata && props.urldata.キャラクター == character) opt_buildData = props.urldata;
      recommendationListRea.splice(
        0,
        recommendationListRea.length,
        ...makeRecommendationList(characterInputRea.characterMaster, opt_buildData)
      );
      recommendationRef.value = recommendationListRea[0];
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
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      calculateResult(
        damageResult,
        characterInputRea as any,
        conditionInputRea as any,
        statsInput
      );

      characterInputRea.saveDisabled = false;
    };

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
        weapon,
        characterInputRea.characterMaster.武器
      );
      // 武器のダメージ計算式を再抽出します
      makeDamageDetailObjArrObjWeapon(characterInputRea);
      setupConditionValues(conditionInputRea, characterInputRea);
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      calculateResult(
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
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      calculateResult(
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
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      calculateResult(
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
      calculateResult(damageResult, characterInputRea, conditionInputRea, statsInput);

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
    const updateCondition = () => {
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      calculateResult(
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
      calculateResult(
        damageResult,
        characterInputRea as any,
        conditionInputRea as any,
        statsInput
      );
    };

    /** 元素共鳴が変更されました。ステータスおよびダメージを再計算します */
    const updateElementalResonance = (statAdjustments: TStats) => {
      overwriteObject(optionInputRea.elementalResonanceStatAdjustments, statAdjustments);
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      calculateResult(
        damageResult,
        characterInputRea as any,
        conditionInputRea as any,
        statsInput
      );
    };

    /** その他オプションが変更されました。ステータスおよびダメージを再計算します */
    const updateMiscOption = (statAdjustments: TStats) => {
      overwriteObject(optionInputRea.miscOptionStatAdjustments, statAdjustments);
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      calculateResult(
        damageResult,
        characterInputRea as any,
        conditionInputRea as any,
        statsInput
      );
    };

    /** チームオプションが変更されました。ステータスおよびダメージを再計算します */
    const updateTeamOption = (statAdjustments: TStats) => {
      overwriteObject(optionInputRea.teamOptionStatAdjustments, statAdjustments);
      console.log(statAdjustments);
      calculateStats(
        statsInput,
        characterInputRea,
        artifactDetailInputRea,
        conditionInputRea,
        optionInputRea
      );
      calculateResult(
        damageResult,
        characterInputRea as any,
        conditionInputRea as any,
        statsInput
      );
    };

    /** コンフィグレーションが変更されました */
    const updateConfigurationInput = (configurationInput: TAnyObject) => {
      console.log(configurationInput);
      if ('全武器解放' in configurationInput && configurationInput.全武器解放) {
        console.log('全武器解放');
      }
      if ('聖遺物サブ効果計算停止' in configurationInput && configurationInput.聖遺物サブ効果計算停止) {
        artifactDetailInputRea.聖遺物優先するサブ効果Disabled = true;
      }
    }

    /** 聖遺物ステータス（サブ効果）をクリアします*/
    const orderInitializeArtifactStatsSub = () => {
      artifactDetailInputVmRef.value.initializeArtifactStatsSub();

      characterInputRea.saveDisabled = false;
    }

    updateCharacter(characterInputRea.character);

    return {
      displayName,

      characterInputVmRef,
      artifactDetailInputVmRef,
      conditionInputVmRef,

      characterInputRea,
      artifactDetailInputRea,
      conditionInputRea,
      recommendationListRea,
      recommendationRef,

      characterSelectVisibleRef,
      weaponSelectVisibleRef,
      weapon,
      weaponType,
      artifactSetSelectVisibleRef,
      artifactSetIndexRef,
      artifactSets,
      artifactDetailInputVisibleRef,
      characterInfoVisibleRef,
      characterInfoModeRef,
      updateCondition,
      statsInput,
      characterStats1CategoryList,
      characterStats2CategoryList,
      enemyStatsCategoryList,
      enemyList,
      selectedEnemyRef,
      updateEnemy,
      optionInputRea,
      damageResult,
      savedSupporters,

      pane6Toggle1Ref,
      pane6Toggle2Ref,
      pane6Toggle3Ref,
      statInputTabRef,
      optionInputTabRef,
      ownListToggle1Ref,
      ownListToggle2Ref,

      saveToStorage, removeFromStorage,
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

      updateConfigurationInput,
      orderInitializeArtifactStatsSub,

      myDamageDatailArr,
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
