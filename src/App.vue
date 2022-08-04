<template>
  <div class="base-container">
    <div class="pane1">
      <fieldset>
        <legend>げんかるく - 原神ダメージシミュレーター Ver.3.0.0</legend>
        <p>
          <a href="ArtifactSetList.html">聖遺物セット効果一覧</a>
          <a href="BirthdayCalendar.html">誕生日カレンダー</a>
        </p>
        <p>
          <a href="WeaponList.html?kind=Sword">片手剣一覧</a>
          <a href="WeaponList.html?kind=Claymore">両手剣一覧</a>
          <a href="WeaponList.html?kind=Polearm">長柄武器一覧</a>
          <a href="WeaponList.html?kind=Bow">弓一覧</a>
          <a href="WeaponList.html?kind=Catalyst">法器一覧</a>
        </p>
        <p>
          <a href="RandomTeam.html">ランダムチーム編成メーカー</a>
          <a href="HoYoDictionary.html">原神の辞書</a>
        </p>
        <div>&emsp;</div>
        <div style="position: absolute; right: 1rem; top: 0">
          <a
            href="https://zawazawa.jp/gencalc/topic/1"
            target="_blank"
            rel="noopener noreferrer"
            >バグ報告·要望</a
          >
        </div>
        <div style="position: absolute; left: 1rem; top: 0">
          <a href="history.html">更新履歴</a>
        </div>
        <div style="position: absolute; left: 1rem; bottom: 1rem">
          <a href="RotationVisualizer.html">げんろーて</a>
        </div>
        <label style="position: absolute; right: 1rem; bottom: 1rem">
          Language:
          <select v-model="lang" @change="langOnChange(targetValue($event))">
            <option v-for="item in langList" :value="item.value" :key="item.value">
              {{ item.name }}
            </option>
          </select>
        </label>
      </fieldset>
    </div>
    <div class="pane2">
      <CharacterSelect
        :character="character"
        :visible="characterSelectVisibleRef"
        @update:character="updateCharacter($event)"
      />
    </div>
    <div class="pane3" style="margin-bottom: 15px">
      <CharacterInput
        :characterInput="characterInputRef"
        :recommendationList="recommendationList"
        :artifactSetSelectVisible="artifactSetSelectVisibleRef"
        @open:character-select="characterSelectVisibleRef = !characterSelectVisibleRef"
        @update:recommendation="updateRecommendation($event)"
        @open:weapon-select="openWeaponSelect"
        @open:artifact-set-select="openArtifactSetSelect($event)"
        @open:artifact-detail-input="openArtifactDetailInput"
        @update:character-input-character="updateCharacterInputCharacter($event)"
        @update:character-input-weapon="updateCharacterInputWeapon($event)"
      />
    </div>
    <div class="pane4">
      <WeaponSelect
        :visible="weaponSelectVisibleRef"
        :weapon="weapon"
        :weaponType="weaponType"
        @update:weapon="updateWeapon($event)"
      />
      <ArtifactSetSelect
        :visible="artifactSetSelectVisibleRef"
        :artifactSet="artifactSets[artifactSetIndexRef]"
        :index="artifactSetIndexRef"
        @update:artifact-set="updateArtifactSet($event)"
      />
      <ArtifactDetailInput
        :visible="artifactDetailInputVisibleRef"
        :artifactDetailInput="artifactDetailInputRef"
        @update:artifact-detail="updateArtifactDetail($event)"
      />
    </div>
    <div class="pane6">
      <div>
        <input
          class="hidden"
          id="pane6-toggle-1"
          type="checkbox"
          v-model="pane6Toggle1Ref"
        />
        <label class="toggle-switch" for="pane6-toggle-1">
          {{ displayName("オプション条件") }}
        </label>
        <input
          class="hidden"
          id="pane6-toggle-2"
          type="checkbox"
          v-model="pane6Toggle2Ref"
        />
        <label class="toggle-switch" for="pane6-toggle-2">
          {{ displayName("ステータス") }}
        </label>
        <input
          class="hidden"
          id="pane6-toggle-3"
          type="checkbox"
          v-model="pane6Toggle3Ref"
        />
        <label class="toggle-switch" for="pane6-toggle-3">
          {{ displayName("バフ/デバフ") }}
        </label>
      </div>
      <div v-if="pane6Toggle1Ref" style="margin-bottom: 10px">
        <ConditionInput
          :characterInput="characterInputRef"
          :conditionInput="conditionInputRef"
        />
      </div>
      <div v-if="pane6Toggle2Ref" style="margin-bottom: 10px">
        <div class="tab-switch">
          <input
            id="status-input-tab-1"
            type="radio"
            v-model="statInputTabRef"
            name="stat-input-tab"
            value="1"
          />
          <label for="status-input-tab-1"> {{ displayName("ステータス1") }} </label>
          <input
            id="status-input-tab-2"
            type="radio"
            v-model="statInputTabRef"
            name="stat-input-tab"
            value="2"
          />
          <label for="status-input-tab-2"> {{ displayName("ステータス2") }} </label>
          <input
            id="status-input-tab-3"
            type="radio"
            v-model="statInputTabRef"
            name="stat-input-tab"
            value="3"
          />
          <label for="status-input-tab-3"> {{ displayName("敵") }} </label>
        </div>
        <template v-if="statInputTabRef == 1">
          <StatsInput
            :statsObj="statsInput.statsObj"
            :categoryList="characterStats1CategoryList"
            @update:stat-adjustments="updateStatAdjustments($event)"
          />
        </template>
        <template v-if="statInputTabRef == 2">
          <StatsInput
            :statsObj="statsInput.statsObj"
            :categoryList="characterStats2CategoryList"
            @update:stat-adjustments="updateStatAdjustments($event)"
          />
        </template>
        <template v-if="statInputTabRef == 3">
          <label class="enemy"
            >{{ displayName("敵") }}
            <select>
              <option v-for="item in enemyList" :value="item" :key="item.key">
                {{ displayName(item.key) }}
              </option>
            </select>
          </label>
          <label class="enemy-level"
            >Lv.
            <input type="number" min="1" />
          </label>
          <StatsInput
            :statsObj="statsInput.statsObj"
            :categoryList="enemyStatsCategoryList"
            @update:stat-adjustments="updateStatAdjustments($event)"
          />
        </template>
      </div>
      <div v-if="pane6Toggle3Ref" style="margin-bottom: 10px">
        <div class="tab-switch">
          <input
            id="option-input-tab-1"
            type="radio"
            v-model="optionInputTabRef"
            name="option-input-tab"
            value="1"
          />
          <label for="option-input-tab-1"> {{ displayName("元素共鳴") }} </label>
          <input
            id="option-input-tab-2"
            type="radio"
            v-model="optionInputTabRef"
            name="option-input-tab"
            value="2"
          />
          <label for="option-input-tab-2"> {{ displayName("チーム") }} </label>
          <input
            id="option-input-tab-3"
            type="radio"
            v-model="optionInputTabRef"
            name="option-input-tab"
            value="3"
          />
          <label for="option-input-tab-3"> {{ displayName("その他") }} </label>
        </div>
        <template v-if="optionInputTabRef == 1">
          <ElementalResonanceInput
            @update:elemental-resonance="updateElementalResonance($event)"
          />
        </template>
      </div>
    </div>
    <div class="result-pane">
      <CalculationResult :resultObj="resultObj" />
    </div>
    <div class="bottom-pane">
      <h2>
        <input
          class="hidden"
          id="own-list-toggle-1"
          type="checkbox"
          v-model="ownListToggle1Ref"
        />
        <label class="toggle-switch no-border" for="own-list-toggle-1">
          {{ displayName("キャラクター所持状況") }}
        </label>
      </h2>
      <CharacterOwnList v-if="ownListToggle1Ref" />
      <h2>
        <input
          class="hidden"
          id="own-list-toggle-2"
          type="checkbox"
          v-model="ownListToggle2Ref"
        />
        <label class="toggle-switch no-border" for="own-list-toggle-2">
          {{ displayName("武器所持状況") }}
        </label>
      </h2>
      <WeaponOwnList v-if="ownListToggle2Ref" />
    </div>
    <div class="pane7">
      <p>本サイトの説明とか</p>
    </div>
    <hr />
    <div class="footer">
      <p>© 2021 asagume</p>
      <p>
        本サイト内の画像はHoYoverse/COGNOSPHEREの著作物です。Copyright © COGNOSPHERE. All
        Rights Reserved.
      </p>
    </div>
  </div>
  <div id="debug-info" v-if="true">
    <hr />
    <h2>DEBUG</h2>
    <template v-if="characterInputRef">
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
import CharacterSelect from "./components/CharacterSelect.vue";
import CharacterInput from "./components/CharacterInput.vue";
import WeaponSelect from "./components/WeaponSelect.vue";
import ArtifactSetSelect from "./components/ArtifactSetSelect.vue";
import ArtifactDetailInput from "./components/ArtifactDetailInput.vue";
import ConditionInput from "./components/ConditionInput.vue";
import StatsInput from "./components/StatsInput.vue";
import ElementalResonanceInput from "./components/ElementalResonanceInput.vue";
import CalculationResult from "./components/CalculationResult.vue";
import CharacterOwnList from "./components/CharacterOwnList.vue";
import WeaponOwnList from "./components/WeaponOwnList.vue";
import {
  TRecommendation,
  makeRecommendationList,
  loadRecommendation,
  makeDamageDetailObjArrObjCharacter,
  makeDamageDetailObjArrObjWeapon,
  makeDamageDetailObjArrObjArtifactSets,
  元素反応TEMPLATE,
  TConditionInput,
  TCharacterInput,
  TArtifactDetailInput,
  CHARACTER_INPUT_TEMPLATE,
  CONDITION_INPUT_TEMPLATE,
  ARTIFACT_DETAIL_INPUT_TEMPLATE,
  STATS_INPUT_TEMPLATE,
} from "@/input";
import {
  ARTIFACT_SET_MASTER,
  ENEMY_MASTER_LIST,
  getCharacterMasterDetail,
  getWeaponMasterDetail,
  TArtifactSet,
  TArtifactSetKey,
  TCharacterKey,
  TWeaponKey,
} from "@/master";
import { calculateStats } from "@/calculate";
import { useI18n } from "vue-i18n";
import GlobalMixin from "./GlobalMixin.vue";
import { deepcopy, isPlainObject } from "./common";
import { calculateResult } from "./calculate";

export default defineComponent({
  name: "App",
  mixins: [GlobalMixin],
  props: {
    characterInput: { type: Object as PropType<TCharacterInput>, require: true },
    artifactDetailInput: {
      type: Object as PropType<TArtifactDetailInput>,
      require: true,
    },
    conditionInput: { type: Object as PropType<TConditionInput>, require: true },
    recommendationList: {
      type: Array as PropType<TRecommendation[]>,
      require: true,
    },
  },
  components: {
    CharacterSelect,
    CharacterInput,
    WeaponSelect,
    ArtifactSetSelect,
    ArtifactDetailInput,
    ConditionInput,
    StatsInput,
    ElementalResonanceInput,
    CalculationResult,
    CharacterOwnList,
    WeaponOwnList,
  },
  setup(props) {
    const { t } = useI18n({
      inheritLocale: true,
      useScope: "local",
    });

    const characterInputRef = ref(
      props.characterInput ?? deepcopy(CHARACTER_INPUT_TEMPLATE)
    ); // undefinedを許容しない
    const artifactDetailInputRef = ref(
      props.artifactDetailInput ?? deepcopy(ARTIFACT_DETAIL_INPUT_TEMPLATE)
    ); // undefinedを許容しない
    const conditionInputRef = ref(
      props.conditionInput ?? deepcopy(CONDITION_INPUT_TEMPLATE)
    ); // undefinedを許容しない

    const characterSelectVisibleRef = ref(false);
    const character = characterInputRef.value?.character ?? "アンバー";

    const recommendationListRea = reactive(props.recommendationList ?? []);

    const weaponSelectVisibleRef = ref(false);
    const weapon = computed(() =>
      characterInputRef.value ? characterInputRef.value.weapon : undefined
    );
    const weaponType = computed(() =>
      characterInputRef.value ? characterInputRef.value.characterMaster.武器 : undefined
    );

    const artifactSetSelectVisibleRef = ref(false);
    const artifactSetIndexRef = ref(0);
    const artifactSets = reactive(
      characterInputRef.value?.artifactSets ?? ["NONE", "NONE"]
    );
    const artifactDetailInputVisibleRef = ref(true);

    const statsInput = reactive(deepcopy(STATS_INPUT_TEMPLATE));
    Object.keys(statsInput.statsAdjustments).forEach((key) => {
      statsInput.statsAdjustments[key] = 0;
    });
    const characterStats1CategoryList = [
      "基礎ステータス",
      "基本ステータス",
      "高級ステータス",
      "元素ステータス·ダメージ",
      "ダメージバフ",
      "実数ダメージ加算",
      "元素反応バフ",
    ];
    const characterStats2CategoryList = ["元素ステータス·耐性", "その他"];
    const enemyStatsCategoryList = ["敵元素ステータス·耐性"];
    const enemyList = ENEMY_MASTER_LIST;
    const elementalResonanceInputRef = ref({ 元素共鳴なし: true } as any);

    const resultObj = reactive(deepcopy(元素反応TEMPLATE) as any);

    const pane6Toggle1Ref = ref(true);
    const pane6Toggle2Ref = ref(true);
    const pane6Toggle3Ref = ref(true);
    const statInputTabRef = ref(1);
    const optionInputTabRef = ref(1);
    const ownListToggle1Ref = ref(false);
    const ownListToggle2Ref = ref(false);

    // おすすめセットを更新します
    const updateRecommendation = async (recommendation: TRecommendation) => {
      if (
        !characterInputRef.value ||
        !artifactDetailInputRef.value ||
        !conditionInputRef.value
      )
        return;
      await loadRecommendation(
        characterInputRef.value,
        artifactDetailInputRef.value,
        conditionInputRef.value,
        recommendation.build
      );

      makeDamageDetailObjArrObjCharacter(
        characterInputRef.value,
        conditionInputRef.value
      ); // キャラクター
      makeDamageDetailObjArrObjWeapon(characterInputRef.value, conditionInputRef.value); // 武器
      makeDamageDetailObjArrObjArtifactSets(
        characterInputRef.value,
        conditionInputRef.value
      ); // 聖遺物セット効果

      calculateStats(
        statsInput.statsObj,
        statsInput.statsAdjustments,
        characterInputRef.value as any,
        artifactDetailInputRef.value as any,
        conditionInputRef.value as any
      );
      calculateResult(
        resultObj,
        characterInputRef.value as any,
        conditionInputRef.value as any,
        statsInput
      );
    };
    /** キャラクターを選択します */
    const updateCharacter = async function (character: TCharacterKey) {
      if (
        !characterInputRef.value ||
        !recommendationListRea ||
        !artifactDetailInputRef.value ||
        !conditionInputRef.value
      )
        return;
      characterSelectVisibleRef.value = false;
      characterInputRef.value.character = character;
      characterInputRef.value.characterMaster = await getCharacterMasterDetail(character);
      recommendationListRea.splice(
        0,
        recommendationListRea.length,
        ...makeRecommendationList(characterInputRef.value.characterMaster)
      );
      const recommendation = recommendationListRea[0];
      await updateRecommendation(recommendation);
    };
    // 武器選択画面を開きます/閉じます
    const openWeaponSelect = () => {
      weaponSelectVisibleRef.value = !weaponSelectVisibleRef.value;
      if (weaponSelectVisibleRef.value) {
        artifactSetSelectVisibleRef.value = false;
      }
    };
    /** 武器を選択しました */
    const updateWeapon = async (weapon: TWeaponKey) => {
      if (!characterInputRef.value) return;
      weaponSelectVisibleRef.value = false;
      characterInputRef.value.weapon = weapon;
      characterInputRef.value.weaponMaster = await getWeaponMasterDetail(
        weapon,
        characterInputRef.value.characterMaster.武器
      );
      makeDamageDetailObjArrObjWeapon(characterInputRef.value, conditionInputRef.value); // 武器
      calculateStats(
        statsInput.statsObj,
        statsInput.statsAdjustments,
        characterInputRef.value as any,
        artifactDetailInputRef.value as any,
        conditionInputRef.value as any
      );
      calculateResult(
        resultObj,
        characterInputRef.value as any,
        conditionInputRef.value as any,
        statsInput
      );
    };
    // 聖遺物セット効果選択画面を開きます/閉じます
    const openArtifactSetSelect = (index: number) => {
      if (index == artifactSetIndexRef.value) {
        artifactSetSelectVisibleRef.value = !artifactSetSelectVisibleRef.value;
      } else {
        artifactSetIndexRef.value = index;
        artifactSetSelectVisibleRef.value = true;
      }
      if (artifactSetSelectVisibleRef.value) {
        weaponSelectVisibleRef.value = false;
      }
    };
    /** 聖遺物セット効果を選択しました */
    const updateArtifactSet = (artifactSet: TArtifactSetKey) => {
      if (!characterInputRef.value) return;
      artifactSets[artifactSetIndexRef.value] = artifactSet;
      const tempMaster = ARTIFACT_SET_MASTER[artifactSet] as TArtifactSet;
      characterInputRef.value.artifactSetMasters.splice(
        artifactSetIndexRef.value,
        1,
        tempMaster
      );
      artifactSetSelectVisibleRef.value = false;
      makeDamageDetailObjArrObjArtifactSets(
        characterInputRef.value,
        conditionInputRef.value
      ); // 聖遺物セット効果
      calculateStats(
        statsInput.statsObj,
        statsInput.statsAdjustments,
        characterInputRef.value as any,
        artifactDetailInputRef.value as any,
        conditionInputRef.value as any
      );
      calculateResult(
        resultObj,
        characterInputRef.value as any,
        conditionInputRef.value as any,
        statsInput
      );
    };
    // 聖遺物詳細画面を開きます/閉じます
    const openArtifactDetailInput = () => {
      artifactDetailInputVisibleRef.value = !artifactDetailInputVisibleRef.value;
      if (artifactDetailInputVisibleRef.value) {
        weaponSelectVisibleRef.value = false;
        artifactSetSelectVisibleRef.value = false;
      }
    };
    //
    const updateCharacterInputCharacter = (characterInput: any) => {
      Object.keys(characterInput).forEach((key) => {
        if (characterInputRef.value && key in characterInputRef.value) {
          [key] = characterInput[key];
        }
      });
      makeDamageDetailObjArrObjCharacter(
        characterInputRef.value,
        conditionInputRef.value
      ); // キャラクター
      calculateStats(
        statsInput.statsObj,
        statsInput.statsAdjustments,
        characterInputRef.value as any,
        artifactDetailInputRef.value as any,
        conditionInputRef.value as any
      );
      calculateResult(
        resultObj,
        characterInputRef.value as any,
        conditionInputRef.value as any,
        statsInput
      );
    };
    const updateCharacterInputWeapon = (characterInput: any) => {
      Object.keys(characterInput).forEach((key) => {
        if (characterInputRef.value && key in characterInputRef.value) {
          [key] = characterInput[key];
        }
      });
      makeDamageDetailObjArrObjWeapon(characterInputRef.value, conditionInputRef.value); // 武器
      calculateStats(
        statsInput.statsObj,
        statsInput.statsAdjustments,
        characterInputRef.value as any,
        artifactDetailInputRef.value as any,
        conditionInputRef.value as any
      );
      calculateResult(
        resultObj,
        characterInputRef.value as any,
        conditionInputRef.value as any,
        statsInput
      );
    };
    // 聖遺物ステータスを更新しました
    const updateArtifactDetail = (artifactDetailInput: any) => {
      console.debug(artifactDetailInput);
      calculateStats(
        statsInput.statsObj,
        statsInput.statsAdjustments,
        characterInputRef.value as any,
        artifactDetailInputRef.value as any,
        conditionInputRef.value as any
      );
      calculateResult(
        resultObj,
        characterInputRef.value as any,
        conditionInputRef.value as any,
        statsInput
      );
    };

    updateCharacter(character);

    const myDamageDatailArr = computed(() => {
      if (characterInputRef.value) {
        return [
          characterInputRef.value.damageDetailMyCharacter,
          characterInputRef.value.damageDetailMyWeapon,
          characterInputRef.value.damageDetailMyArtifactSets,
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
    const updateStatAdjustments = (argStatsAdjustments: any) => {
      Object.keys(statsInput.argStatsAdjustments).forEach((key) => {
        statsInput.statsAdjustments[key] = argStatsAdjustments[key];
      });
      calculateStats(
        statsInput.statsObj,
        statsInput.statsAdjustments,
        characterInputRef.value as any,
        artifactDetailInputRef.value as any,
        conditionInputRef.value as any
      );
      calculateResult(
        resultObj,
        characterInputRef.value as any,
        conditionInputRef.value as any,
        statsInput
      );
    };
    /** 元素共鳴を更新しました */
    const updateElementalResonance = (checked: any) => {
      elementalResonanceInputRef.value = checked;
      //
      calculateStats(
        statsInput.statsObj,
        statsInput.statsAdjustments,
        characterInputRef.value as any,
        artifactDetailInputRef.value as any,
        conditionInputRef.value as any
      );
      calculateResult(
        resultObj,
        characterInputRef.value as any,
        conditionInputRef.value as any,
        statsInput
      );
    };

    return {
      t,
      characterInputRef,
      artifactDetailInputRef,
      conditionInputRef,
      characterSelectVisibleRef,
      character,
      recommendationListRea,
      weaponSelectVisibleRef,
      weapon,
      weaponType,
      artifactSetSelectVisibleRef,
      artifactSetIndexRef,
      artifactSets,
      artifactDetailInputVisibleRef,
      statsInput,
      characterStats1CategoryList,
      characterStats2CategoryList,
      enemyStatsCategoryList,
      enemyList,
      resultObj,

      pane6Toggle1Ref,
      pane6Toggle2Ref,
      pane6Toggle3Ref,
      statInputTabRef,
      optionInputTabRef,
      ownListToggle1Ref,
      ownListToggle2Ref,

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
      updateStatAdjustments,
      updateElementalResonance,

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

h2 label {
  min-width: 50% !important;
}
</style>
<style scoped>
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
