<template>
  <table>
    <tbody>
      <tr>
        <td :class="'name ' + colorClass(characterMaster)" colspan="2">
          <span @click="$emit('open:character-info', 1)">
            {{ displayName(characterMaster.名前) }}
            <span class="material-symbols-outlined"> info </span>
          </span>
        </td>
        <td colspan="2" :class="'title ' + colorClass(characterMaster)">
          <span v-show="characterMaster.baseInfo.称号">
            {{ displayName(characterMaster.baseInfo.称号) }}</span>
        </td>
      </tr>
      <tr>
        <td style="width: 20%">
          <select v-model="characterInputRea.突破レベル" @change="ascensionOnChange">
            <option v-for="item in ascensionRange" :value="item" :key="item">
              A{{ item }}
            </option>
          </select>
          <select v-model="characterInputRea.レベル" @change="characterOnChange">
            <option v-for="item in levelRange" :value="item" :key="item">
              Lv.{{ item }}
            </option>
          </select>
          <select v-model="characterInputRea.命ノ星座" @change="characterOnChange">
            <option v-for="item in constellationRange" :value="item" :key="item">
              C{{ item }}
            </option>
          </select>
        </td>
        <td style="position: relative; width: 30%">
          <img :class="'character' + bgImageClass(characterMaster)" :src="characterMaster.icon_url"
            :alt="characterMaster.名前" @click="$emit('open:character-select')" />
          <img class="vision" :src="visionSrc(characterMaster)" :alt="characterMaster.元素" />
        </td>
        <td class="icon">
          <img :class="'weapon' + bgImageClass(weaponMaster)" :src="weaponMaster['icon_url']" :alt="weaponMaster.名前"
            @click="$emit('open:weapon-select')" />
          <div class="tooltip">{{ displayName(weaponMaster.名前) }}</div>
        </td>
        <td style="width: 20%">
          <select v-model="characterInputRea.武器突破レベル" @change="weaponAscensionOnChange">
            <option v-for="item in weaponAscensionRange" :value="item" :key="item">
              A{{ item }}
            </option>
          </select>
          <select v-model="characterInputRea.武器レベル" @change="weaponOnChange">
            <option v-for="item in weaponLevelRange" :value="item" :key="item">
              Lv.{{ item }}
            </option>
          </select>
          <select v-model="characterInputRea.武器精錬ランク" @change="weaponOnChange">
            <option v-for="item in weaponRefineRange" :value="item" :key="item">
              R{{ item }}
            </option>
          </select>
        </td>
      </tr>
    </tbody>
  </table>
  <table class="talent-and-artifact">
    <tbody>
      <tr>
        <td class="icon">
          <img :class="'talent ' + bgColorClass(characterMaster)" :src="characterMaster['通常攻撃']['icon_url']"
            :alt="characterMaster['通常攻撃']['名前']" @click="$emit('open:character-info', 2)" />
          <div class="tooltip">
            {{ displayName(characterMaster["通常攻撃"]["名前"]) }}
          </div>
        </td>
        <td class="icon">
          <img :class="'talent ' + bgColorClass(characterMaster)" :src="characterMaster['元素スキル']['icon_url']"
            :alt="characterMaster['元素スキル']['名前']" @click="$emit('open:character-info', 3)" />
          <div class="tooltip">
            {{ displayName(characterMaster["元素スキル"]["名前"]) }}
          </div>
        </td>
        <td class="icon">
          <img :class="'talent ' + bgColorClass(characterMaster)" :src="characterMaster['元素爆発']['icon_url']"
            :alt="characterMaster['元素爆発']['名前']" @click="$emit('open:character-info', 4)" />
          <div class="tooltip">
            {{ displayName(characterMaster["元素爆発"]["名前"]) }}
          </div>
        </td>
        <td class="icon">
          <label @click="openArtifactSetSelect(0)">
            <img :class="'artifact-set' + artifactSetSelectClass(0)"
              :src="getArtifactIconUrl(artifactSetMasters[0].key)" :alt="artifactSetMasters[0].key" />
          </label>
          <div class="tooltip">{{ displayName(artifactSetMasters[0].key) }}</div>
        </td>
        <td class="icon">
          <label @click="openArtifactSetSelect(1)">
            <img :class="'artifact-set' + artifactSetSelectClass(1)"
              :src="getArtifactIconUrl(artifactSetMasters[1].key)" :alt="artifactSetMasters[1].key" />
          </label>
          <div class="tooltip">{{ displayName(artifactSetMasters[1].key) }}</div>
        </td>
        <td class="artifact-detail-button icon">
          <label @click="$emit('open:artifact-detail-input')">
            <img class="artifact-set" :src="IMG_SRC_DUMMY" :alt="displayName('聖遺物ステータス')" />
            <img class="left-icon" src="images/artifact.png" alt="artifact" />
            <img class="right-icon" src="images/artifact.png" alt="artifact" />
            <div class="artifact-score">
              score <br />
              {{ Math.round(artifactScore * 10) / 10 }}
            </div>
          </label>
          <div class="tooltip">{{ displayName("聖遺物詳細") }}</div>
        </td>
      </tr>
      <tr>
        <td>
          <select v-model="characterInputRea.通常攻撃レベル" @change="characterOnChange">
            <option v-for="item in normalAttackLevelRange" :value="item" :key="item">
              Lv.{{ item }}
            </option>
          </select>
        </td>
        <td>
          <select v-model="characterInputRea.元素スキルレベル" @change="characterOnChange">
            <option v-for="item in elementalSkillLevelRange" :value="item" :key="item">
              Lv.{{ item }}
            </option>
          </select>
        </td>
        <td>
          <select v-model="characterInputRea.元素爆発レベル" @change="characterOnChange">
            <option v-for="item in elementalBurstLevelRange" :value="item" :key="item">
              Lv.{{ item }}
            </option>
          </select>
        </td>
      </tr>
    </tbody>
  </table>

  <table style="table-layout: fixed">
    <tbody>
      <tr>
        <td>buildname</td>
        <td colspan="3">
          <input class="save-name" type="text" v-model="characterInputRea.buildname" maxlength="20"
            placeholder="input build name" />
        </td>
        <td>
          <button type="button" :disabled="saveDisabled" @click="saveOnClick">
            Save
            <!-- <span class="material-symbols-outlined"> save </span> -->
          </button>
        </td>
        <td>
          <button type="button" :disabled="characterInputRea.removeDisabled" @click="removeOnClick">
            Remove
            <!-- <span class="material-symbols-outlined"> delete </span> -->
          </button>
        </td>
      </tr>
      <tr>
        <td colspan="6">
          <select v-model="characterInputRea.recommendationSelectedIndex"
            @change="recommendationOnChange(targetValue($event))" placeholder="select preset or saved build">
            <option v-for="(item, index) in recommendationList" :value="index" :key="index">
              {{ displayBuildName(item) }}
            </option>
          </select>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import i18n from '@/i18n';
import {
  ARTIFACT_SET_MASTER_DUMMY,
  TCharacterInput,
  TRecommendation,
  突破レベルレベルARRAY,
  getMaxConstellation,
  getMaxTalentLevel,
} from '@/input';
import {
  ELEMENT_BG_COLOR_CLASS,
  ELEMENT_COLOR_CLASS,
  ELEMENT_IMG_SRC,
  getArtifactIconUrl,
  IMG_SRC_DUMMY,
  RECOMMEND_ABBREV_EN_MAP,
  STAR_BACKGROUND_IMAGE_CLASS,
  TCharacterDetail,
  TWeaponDetail,
} from '@/master';
import {
  computed,
  defineComponent,
  nextTick,
  PropType,
  reactive,
  ref,
} from 'vue';
import CompositionFunction from './CompositionFunction.vue';

export default defineComponent({
  name: 'CharacterInput',
  props: {
    characterInput: { type: Object as PropType<TCharacterInput>, required: true, },
    recommendationList: { type: Array as PropType<TRecommendation[]>, required: true, },
    recommendation: { type: Object as PropType<TRecommendation>, required: true, },
    builddataSavable: { type: Boolean, required: true, },
    artifactSetSelectVisible: { type: Boolean },
    artifactScore: { type: Number, required: true },
  },
  emits: [
    'open:character-select',
    'open:character-info',
    'update:recommendation',
    'save-to-storage',
    'remove-from-storage',
    'open:weapon-select',
    'open:artifact-set-select',
    'open:artifact-detail-input',
    'update:character-input-character',
    'update:character-input-weapon',
    'open:character-info',
  ],
  setup(props, context) {
    const { displayName, targetValue } = CompositionFunction();

    const characterInputRea = reactive(props.characterInput);
    const storageOrRecommendationRef = ref('0');
    const artifactSetIndexRef = ref(0);

    /** 突破レベルの範囲 */
    const ascensionRange = computed((): number[] => [0, 1, 2, 3, 4, 5, 6])
    /** レベルの範囲 */
    const levelRange = computed((): number[] => {
      if (characterInputRea.突破レベル < 6) {
        return 突破レベルレベルARRAY[characterInputRea.突破レベル];
      } else {
        return [...突破レベルレベルARRAY[6], 95, 100];
      }
    })

    const characterMaster = computed(() => characterInputRea.characterMaster);
    const weaponMaster = computed(() => characterInputRea.weaponMaster);
    const artifactSetMasters = computed(() => characterInputRea.artifactSetMasters ?? [
      ARTIFACT_SET_MASTER_DUMMY,
      ARTIFACT_SET_MASTER_DUMMY,
    ]);
    const saveDisabled = computed(() => characterInputRea.characterMaster.武器 != characterInputRea.weaponMaster.種類 ? true : !props.builddataSavable);
    /** 命ノ星座の範囲 */
    const constellationRange = computed((): number[] => Array.from({ length: getMaxConstellation(characterMaster.value) + 1 }, (_, i) => i));
    /** 通常攻撃レベルの範囲 */
    const normalAttackLevelRange = computed(() => {
      return Array.from({ length: getMaxTalentLevel(characterMaster.value, '通常攻撃') }, (_, i) => i + 1);
    });
    /** 元素スキルレベルの範囲 命ノ星座は考慮しません */
    const elementalSkillLevelRange = computed(() => {
      return Array.from({ length: getMaxTalentLevel(characterMaster.value, '元素スキル') }, (_, i) => i + 1);
    });
    /** 元素爆発レベルの範囲 命ノ星座は考慮しません */
    const elementalBurstLevelRange = computed(() => {
      return Array.from({ length: getMaxTalentLevel(characterMaster.value, '元素爆発') }, (_, i) => i + 1);
    });
    /** 武器突破レベルの範囲 */
    const weaponAscensionRange = computed(() => {
      const max = weaponMaster.value.レアリティ < 3 ? 4 : 6;
      return Array.from({ length: max + 1 }, (_, i) => i); // 0-
    });
    /** 武器レベルの範囲 */
    const weaponLevelRange = computed((): number[] => 突破レベルレベルARRAY[characterInputRea.武器突破レベル]);
    /** 武器精錬ランクの範囲 */
    const weaponRefineRange = computed((): number[] => {
      const max = weaponMaster.value.レアリティ < 3 ? 1 : 5;
      return Array.from({ length: max }, (_, i) => i + 1);
    });

    const displayBuildName = (item: TRecommendation) => {
      if (i18n.global.locale.value == 'ja-jp') return item.name;
      // if (item.name == 'あなたの' + item.build['キャラクター']) {
      //   return 'Your ' + displayName(item.build['キャラクター']);
      // }
      if (item.overwrite) return item.name;
      let result = '';
      result += displayName(item.build['武器']);
      result += ' - ';
      if (item.build['聖遺物セット効果1']) {
        result += displayName(item.build['聖遺物セット効果1']);
      }
      if (item.build['聖遺物セット効果2'] && item.build['聖遺物セット効果2'] != item.build['聖遺物セット効果1']) {
        result += '/';
        result += displayName(item.build['聖遺物セット効果2']);
      }
      result += '[';
      for (const key of ['聖遺物メイン効果3', '聖遺物メイン効果4', '聖遺物メイン効果5']) {
        const statAndRarity = item.build[key].split('_');
        result += RECOMMEND_ABBREV_EN_MAP.get(statAndRarity[1]);
      }
      result += ']';
      return result;
    }

    const visionSrc = (item: TCharacterDetail) => ELEMENT_IMG_SRC[item.元素] as string;
    const bgImageClass = (item: TCharacterDetail | TWeaponDetail) => (' ' + STAR_BACKGROUND_IMAGE_CLASS[item.レアリティ]) as string;
    const colorClass = (item: TCharacterDetail) => ELEMENT_COLOR_CLASS[item.元素] as string;
    const bgColorClass = (item: TCharacterDetail) => ELEMENT_BG_COLOR_CLASS[item.元素] as string;

    /** 構成データを保存します */
    const saveOnClick = async () => {
      characterInputRea.removeDisabled = true; // 削除可能
      await nextTick();
      context.emit('save-to-storage', characterInputRea.buildname);
    };

    /** 構成データを削除します */
    const removeOnClick = async () => {
      characterInputRea.removeDisabled = false; // 削除不可
      await nextTick();
      context.emit('remove-from-storage', characterInputRea.buildname);
    };

    /** 突破レベルが変更されました */
    const ascensionOnChange = async () => {
      const minLevel = levelRange.value[0];
      const maxLevel = levelRange.value[levelRange.value.length - 1];
      if (characterInputRea.レベル < minLevel) {
        characterInputRea.レベル = minLevel;
      } else if (characterInputRea.レベル > maxLevel) {
        characterInputRea.レベル = maxLevel;
      }
      await nextTick();
      characterOnChange();
    };

    /** おすすめセットが選択されました */
    const recommendationOnChange = async (value: string | undefined) => {
      if (!props.recommendationList || !value) return;
      await nextTick();
      const recommendation = props.recommendationList[Number(value)];
      context.emit('update:recommendation', recommendation);
    };

    /** 武器突破レベルが変更されました */
    const weaponAscensionOnChange = async () => {
      const minLevel = weaponLevelRange.value[0];
      const maxLevel = weaponLevelRange.value[weaponLevelRange.value.length - 1];
      if (characterInputRea.武器レベル < minLevel) {
        characterInputRea.武器レベル = minLevel;
      } else if (characterInputRea.武器レベル > maxLevel) {
        characterInputRea.武器レベル = maxLevel;
      }
      await nextTick();
      weaponOnChange();
    };

    const artifactSetSelectClass = (index: number) => props.artifactSetSelectVisible && index == artifactSetIndexRef.value ? ' selected' : '';
    const openArtifactSetSelect = (index: number) => {
      artifactSetIndexRef.value = index;
      context.emit('open:artifact-set-select', index);
    };

    /** キャラクター情報を変更しました */
    const characterOnChange = async () => {
      const workInput = {} as any;
      workInput.突破レベル = characterInputRea.突破レベル;
      workInput.レベル = characterInputRea.レベル;
      workInput.命ノ星座 = characterInputRea.命ノ星座;
      workInput.通常攻撃レベル = characterInputRea.通常攻撃レベル;
      workInput.元素スキルレベル = characterInputRea.元素スキルレベル;
      workInput.元素爆発レベル = characterInputRea.元素爆発レベル;
      await nextTick();
      context.emit('update:character-input-character', workInput);
    };

    /** 武器情報を変更しました */
    const weaponOnChange = async () => {
      const workInput = {} as any;
      workInput.武器突破レベル = characterInputRea.武器突破レベル;
      workInput.武器レベル = characterInputRea.武器レベル;
      workInput.武器精錬ランク = characterInputRea.武器精錬ランク;
      await nextTick();
      context.emit('update:character-input-weapon', workInput);
    };

    return {
      displayName,
      targetValue,
      getArtifactIconUrl,

      displayBuildName,
      visionSrc,
      bgImageClass,
      colorClass,
      bgColorClass,

      characterInputRea,
      characterMaster,
      weaponMaster,
      artifactSetMasters,
      recommendationOnChange,
      saveDisabled,
      saveOnClick,
      removeOnClick,
      ascensionRange,
      levelRange,
      constellationRange,
      ascensionOnChange,
      weaponAscensionRange,
      weaponLevelRange,
      weaponRefineRange,
      weaponAscensionOnChange,
      storageOrRecommendationRef,
      normalAttackLevelRange,
      elementalSkillLevelRange,
      elementalBurstLevelRange,
      openArtifactSetSelect,
      artifactSetSelectClass,
      characterOnChange,
      weaponOnChange,
      IMG_SRC_DUMMY,
    };
  },
});
</script>

<style scoped>
table {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 10px;
  border: none;
}

tr,
td {
  border: none;
}

td.name {
  padding-bottom: 5px;
  text-align: right;
  vertical-align: middle;
}

td.name span {
  font-size: 3rem;
  font-weight: bold;
  text-shadow: 0 0 2px black;
}

td.title {
  text-align: right;
  text-shadow: 0 0 2px black;
  padding: 0 1rem;
}

td select,
td input,
td label {
  width: calc(100% - 6px);
}

input.save-name {
  width: calc(100% - 16px);
}

img.character {
  width: 100%;
  background-size: contain;
}

img.vision {
  width: 30%;
  position: absolute;
  left: 5%;
  top: 5%;
}

:checked+img {
  background-color: gold;
}

img.weapon {
  width: 90%;
  background-size: contain;
}

img.talent,
img.artifact-set {
  width: 100%;
  aspect-ratio: 1;
  object-fit: fill;
  border-radius: 50%;
  border: none;
}

img.selected {
  background-color: rgb(156, 140, 49);
}

th.recommendation {
  color: #e8d14e;
  background-color: #333;
  border: 2px solid gray;
  border-radius: 10px;
  padding: 2px;
  margin: 10px;
}

td.artifact-detail-button {
  border: 2px solid gray;
}

input[type="text"] {
  padding-left: 1rem;
}

table.talent-and-artifact {
  table-layout: fixed;
}

table.talent-and-artifact td {
  table-layout: fixed;
  background-color: #333;
  border-radius: 10px;
}

.artifact-score {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
}
</style>
