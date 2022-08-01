<template>
  <div class="base-container">
    <div class="pane2">
      <CharacterSelect :character="character" :visible="characterSelectVisible"
        @update:character="updateCharacter($event)" />
    </div>
    <div class="pane3">
      <CharacterInput :characterInput="characterInput" :recommendationList="recommendationList"
        @open:character-select="characterSelectVisible = !characterSelectVisible"
        @update:recommendation="updateRecommendation($event)" @open:weapon-select="openWeaponSelect"
        @open:artifact-set-select="openArtifactSetSelect($event)"
        @open:artifact-detail-input="openArtifactDetailInput" />
    </div>
    <div class="pane4">
      <WeaponSelect :visible="weaponSelectVisible" :weapon="weapon" :weaponType="weaponType"
        @update:weapon="updateWeapon($event)" />
      <ArtifactSetSelect :visible="artifactSetSelectVisible" :artifactSet="artifactSets[artifactSetIndex]"
        :index="artifactSetIndex" @update:artifact-set="updateArtifactSet($event)" />
      <ArtifactDetailInput :visible="artifactDetailInputVisible" :artifactDetailInput="artifactDetailInput"
        @update:artifact-detail="updateArtifactDetail($event)" />
    </div>
    <div class="pane6">
      <div>
        <input class="hidden" id="pane6-toggle-1" type="checkbox" v-model="pane6Toggle1">
        <label class="toggle-switch" for="pane6-toggle-1"> {{ displayName('オプション条件') }} </label>
        <input class="hidden" id="pane6-toggle-2" type="checkbox" v-model="pane6Toggle2">
        <label class="toggle-switch" for="pane6-toggle-2"> {{ displayName('ステータス') }} </label>
        <input class="hidden" id="pane6-toggle-3" type="checkbox" v-model="pane6Toggle3">
        <label class="toggle-switch" for="pane6-toggle-3"> {{ displayName('バフ/デバフ') }} </label>
      </div>
      <template v-if="pane6Toggle1">
        <ConditionInput :conditionInput="conditionInput" />
      </template>
      <template v-if="pane6Toggle2">
        <div class="tab-switch">
          <input id="status-input-tab-1" type="radio" v-model="statInputTab" name="stat-input-tab" value="1">
          <label for="status-input-tab-1"> {{ displayName('ステータス1') }} </label>
          <input id="status-input-tab-2" type="radio" v-model="statInputTab" name="stat-input-tab" value="2">
          <label for="status-input-tab-2"> {{ displayName('ステータス2') }} </label>
          <input id="status-input-tab-3" type="radio" v-model="statInputTab" name="stat-input-tab" value="3">
          <label for="status-input-tab-3"> {{ displayName('敵') }} </label>
        </div>
        <template v-if="statInputTab == 1">
          <StatsInput :statsObj="statsObj" :categoryList="characterStats1CategoryList" />
        </template>
        <template v-if="statInputTab == 2">
          <StatsInput :statsObj="statsObj" :categoryList="characterStats2CategoryList" />
        </template>
        <template v-if="statInputTab == 3">
          <label>{{ displayName('敵') }}
            <select>
              <option v-for="item in enemyList" :value="item" :key="item.key">{{ displayName(item.key) }}</option>
            </select>
          </label>
          <label>Lv.
            <input type="number" min="1">
          </label>
          <StatsInput :statsObj="statsObj" :categoryList="enemyStatsCategoryList" />
        </template>
      </template>
      <template v-if="pane6Toggle3">
        バフ/デバフ
      </template>
    </div>
    <div class="result-pane">
      <p>計算結果</p>
    </div>
    <div class="bottom-pane">
      <h2>
        <input class="hidden" id="own-list-toggle-1" type="checkbox" v-model="ownListToggle1">
        <label class="toggle-switch no-border" for="own-list-toggle-1"> {{ displayName('キャラクター所持リスト') }} </label>
      </h2>
      <CharacterOwnList v-if="ownListToggle1" />
      <h2>
        <input class="hidden" id="own-list-toggle-2" type="checkbox" v-model="ownListToggle2">
        <label class="toggle-switch no-border" for="own-list-toggle-2"> {{ displayName('武器所持リスト') }} </label>
      </h2>
      <WeaponOwnList v-if="ownListToggle2" />
    </div>
    <div class="pane7">
      <p>本サイトの説明とか</p>
    </div>
    <hr>
    <div class="footer">
      <p>© 2021 asagume</p>
      <p>
        本サイト内の画像はHoYoverse/COGNOSPHEREの著作物です。Copyright © COGNOSPHERE. All Rights Reserved.
      </p>
    </div>
  </div>
  <div id="debug-info" v-if="true">
    <hr>
    <h2>DEBUG</h2>
    <template v-if="conditionInput">
      <dl v-for="dd in [conditionInput.damageDetailMyCharacter, conditionInput.damageDetailMyWeapon].filter(s => s)"
        :key="dd">
        <template v-for="key in Object.keys(dd)" :key="key">
          <template v-if="dd[key]">
            <dt>{{ key }}</dt>
            <dd>
              <ol v-if="Array.isArray(dd[key])">
                <li v-for="item in dd[key]" :key="item">{{ item }}</li>
              </ol>
              <div v-else>
                {{ dd[key] }}
              </div>
            </dd>
          </template>
        </template>
      </dl>
    </template>
    <hr>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import CharacterSelect from './components/CharacterSelect.vue';
import CharacterInput from './components/CharacterInput.vue';
import WeaponSelect from './components/WeaponSelect.vue';
import ArtifactSetSelect from './components/ArtifactSetSelect.vue';
import ArtifactDetailInput from './components/ArtifactDetailInput.vue';
import ConditionInput from './components/ConditionInput.vue';
import StatsInput from './components/StatsInput.vue';
import CharacterOwnList from './components/CharacterOwnList.vue';
import WeaponOwnList from './components/WeaponOwnList.vue';
import { TRecommendation, makeRecommendationList, loadRecommendation, makeDamageDetailObjArrObjCharacter, makeDamageDetailObjArrObjWeapon, ステータスTEMPLATE } from '@/input';
import { ARTIFACT_SET_MASTER, ENEMY_MASTER_LIST, getCharacterMasterDetail, getWeaponMasterDetail, TArtifactSetKey, TCharacterKey, TWeaponKey } from '@/master';


export default defineComponent({
  name: 'App',
  props: {
    initialCharacterInput: { type: Object, require: true },
    initialArtifactDetailInput: { type: Object, require: true },
    initialConditionInput: { type: Object, require: true },
    initialRecommendationList: { type: Array as PropType<TRecommendation[]>, require: true },
  },
  components: {
    CharacterSelect,
    CharacterInput,
    WeaponSelect,
    ArtifactSetSelect,
    ArtifactDetailInput,
    ConditionInput, StatsInput,
    CharacterOwnList, WeaponOwnList,
  },
  setup(props) {
    const characterInput = ref(props.initialCharacterInput);
    const artifactDetailInput = ref(props.initialArtifactDetailInput);
    const conditionInput = ref(props.initialConditionInput);

    const characterSelectVisible = ref(false);
    const character = computed(() => characterInput.value ? characterInput.value.character : undefined);

    const recommendationList = ref(props.initialRecommendationList);

    const weaponSelectVisible = ref(false);
    const weapon = computed(() => characterInput.value ? characterInput.value.weapon : undefined);
    const weaponType = computed(() => characterInput.value ? characterInput.value.characterMaster.武器 : undefined);

    const artifactSetSelectVisible = ref(false);
    const artifactSetIndex = ref(0);
    const artifactSets = ref(characterInput.value?.artifactSets ?? ['NONE', 'NONE']);
    const artifactDetailInputVisible = ref(false);

    const statsObj = ref(JSON.parse(JSON.stringify(ステータスTEMPLATE)));
    const characterStats1CategoryList = ['基礎ステータス', '基本ステータス', '高級ステータス', '元素ステータス·ダメージ', 'ダメージバフ', '実数ダメージ加算', '元素反応バフ'];
    const characterStats2CategoryList = ['元素ステータス·耐性', 'その他'];
    const enemyStatsCategoryList = ['敵元素ステータス·耐性'];
    const enemyList = ENEMY_MASTER_LIST;

    const pane6Toggle1 = ref(true);
    const pane6Toggle2 = ref(true);
    const pane6Toggle3 = ref(true);
    const statInputTab = ref(1);
    const ownListToggle1 = ref(false);
    const ownListToggle2 = ref(false);

    const displayName = (name: string) => name;

    // おすすめセットを更新します
    const updateRecommendation = async (recommendation: TRecommendation) => {
      if (!characterInput.value || !artifactDetailInput.value || !conditionInput.value) return;
      await loadRecommendation(characterInput.value, artifactDetailInput.value, conditionInput.value, recommendation.build);

      conditionInput.value.damageDetailMyCharacter = makeDamageDetailObjArrObjCharacter(characterInput.value, conditionInput.value);
      conditionInput.value.damageDetailMyWeapon = makeDamageDetailObjArrObjWeapon(characterInput.value, conditionInput.value);

      Object.keys(ステータスTEMPLATE).forEach(key => {
        statsObj[key] = ステータスTEMPLATE[key];
      });
    };
    /** キャラクターを選択します */
    const updateCharacter = async function (character: TCharacterKey) {
      if (!characterInput.value || !recommendationList.value || !artifactDetailInput.value || !conditionInput.value) return;
      characterSelectVisible.value = false;
      characterInput.value.character = character;
      characterInput.value.characterMaster = await getCharacterMasterDetail(character);
      recommendationList.value.splice(0, recommendationList.value.length, ...makeRecommendationList(characterInput.value.characterMaster));
      const recommendation = recommendationList.value[0];
      await updateRecommendation(recommendation);
    };
    // 武器選択画面を開きます/閉じます
    const openWeaponSelect = () => {
      weaponSelectVisible.value = !weaponSelectVisible.value;
      if (weaponSelectVisible.value) {
        artifactSetSelectVisible.value = false;
      }
    };
    /** 武器を選択しました */
    const updateWeapon = async (weapon: TWeaponKey) => {
      if (!characterInput.value) return;
      weaponSelectVisible.value = false;
      characterInput.value.weapon = weapon;
      characterInput.value.weaponMaster = await getWeaponMasterDetail(weapon, characterInput.value.characterMaster.武器);
    };
    // 聖遺物セット効果選択画面を開きます/閉じます
    const openArtifactSetSelect = (index: number) => {
      if (index == artifactSetIndex.value) {
        artifactSetSelectVisible.value = !artifactSetSelectVisible.value;
      } else {
        artifactSetIndex.value = index;
        artifactSetSelectVisible.value = true;
      }
      if (artifactSetSelectVisible.value) {
        weaponSelectVisible.value = false;
      }
    };
    /** 聖遺物セット効果を選択しました */
    const updateArtifactSet = (artifactSet: TArtifactSetKey) => {
      if (!characterInput.value) return;
      artifactSets.value[artifactSetIndex.value] = artifactSet;
      characterInput.value.artifactSetMasters[artifactSetIndex.value] = ARTIFACT_SET_MASTER[artifactSet];
      artifactSetSelectVisible.value = false;
    };
    // 聖遺物詳細画面を開きます/閉じます
    const openArtifactDetailInput = () => {
      artifactDetailInputVisible.value = !artifactDetailInputVisible.value;
      if (artifactDetailInputVisible.value) {
        weaponSelectVisible.value = false;
        artifactSetSelectVisible.value = false;
      }
    };
    // 聖遺物ステータスを更新しました
    const updateArtifactDetail = (artifactDetailInput: any) => {
      console.log(artifactDetailInput.value);
    }

    updateCharacter(character.value);


    return {
      characterInput,
      artifactDetailInput,
      conditionInput,
      characterSelectVisible, character,
      recommendationList,
      weaponSelectVisible, weapon, weaponType,
      artifactSetSelectVisible, artifactSetIndex, artifactSets,
      artifactDetailInputVisible,
      statsObj, characterStats1CategoryList, characterStats2CategoryList, enemyStatsCategoryList,
      enemyList,

      pane6Toggle1, pane6Toggle2, pane6Toggle3, statInputTab, ownListToggle1, ownListToggle2,

      displayName,
      updateRecommendation, updateCharacter,
      openWeaponSelect, updateWeapon,
      openArtifactSetSelect, updateArtifactSet,
      openArtifactDetailInput, updateArtifactDetail,
    }
  }
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