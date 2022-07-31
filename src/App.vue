<template>
  <div class="pane2">
    <CharacterSelect :character="character" :visible="characterSelectVisible"
      @update:character="characterSelected($event)" />
  </div>
  <div class="pane3">
    <CharacterInput :characterInput="characterInput" :recommendationList="recommendationList"
      @open:character-select="characterSelectVisible = !characterSelectVisible" @open:weapon-select="openWeaponSelect"
      @open:artifact-set-select="openArtifactSetSelect($event)" />
  </div>
  <div class="pane4">
    <WeaponSelect :visible="weaponSelectVisible" :weapon="weapon" :weaponType="weaponType"
      @update:weapon="weaponSelected($event)" />
    <ArtifactSetSelect :visible="artifactSetSelectVisible" :artifactSet="artifactSet[artifactSetIndex]"
      :index="artifactSetIndex" @update:artifact-set="artifactSetSelected($event)" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, ref } from 'vue';
import CharacterSelect from './components/CharacterSelect.vue';
import CharacterInput from './components/CharacterInput.vue';
import WeaponSelect from './components/WeaponSelect.vue';
import ArtifactSetSelect from './components/ArtifactSetSelect.vue';
import { TRecommendation, makeRecommendationList, loadRecommendation } from '@/input';
import { ARTIFACT_SET_MASTER, getCharacterMasterDetail, getWeaponMasterDetail, TArtifactSetKey, TCharacterKey, TWeaponKey } from '@/master';


export default defineComponent({
  name: 'App',
  props: {
    initialCharacterInput: { type: Object, require: true },
    initialArtifactDetailInput: { type: Object, require: true },
    initialConditionInput: { type: Object, require: true },
    initialRecommendationList: { type: Array as PropType<TRecommendation[]>, require: true },
  },
  components: {
    CharacterSelect, CharacterInput, WeaponSelect, ArtifactSetSelect,
  },
  setup(props) {
    let characterInput = ref(props.initialCharacterInput);
    let artifactDetailInput = ref(props.initialArtifactDetailInput);
    let conditionInput = ref(props.initialConditionInput);

    let characterSelectVisible = ref(false);
    let character = computed(() => characterInput.value ? characterInput.value.character : undefined);

    let recommendationList = ref(props.initialRecommendationList);

    let weaponSelectVisible = ref(false);
    let weapon = computed(() => characterInput.value ? characterInput.value.weapon : undefined);
    let weaponType = computed(() => characterInput.value ? characterInput.value.characterMaster.武器 : undefined);

    let artifactSetSelectVisible = ref(false);
    let artifactSetIndex = ref(0);
    let artifactSet = ref(['NONE', 'NONE']);
    let artifactDetailVisivle = ref(false);


    return {
      characterInput,
      artifactDetailInput,
      conditionInput,
      characterSelectVisible, character,
      recommendationList,
      weaponSelectVisible, weapon, weaponType,
      artifactSetSelectVisible, artifactSetIndex, artifactSet,
      artifactDetailVisivle,
    }
  },
  methods: {
    /** キャラクターを選択しました */
    async characterSelected(character: TCharacterKey) {
      this.characterInput!.character = character;
      this.characterSelectVisible = false;
      this.characterInput!.characterMaster = await getCharacterMasterDetail(character);
      this.recommendationList!.splice(0, this.recommendationList!.length, ...makeRecommendationList(this.characterInput!.characterMaster));
      const recommendation = this.recommendationList![0];
      await loadRecommendation(this.characterInput!, this.artifactDetailInput!, this.conditionInput!, recommendation.build);
      console.log(recommendation.name, this.characterInput!.weaponMaster.名前);
    },
    openWeaponSelect() {
      this.weaponSelectVisible = !this.weaponSelectVisible;
      if (this.weaponSelectVisible) {
        this.artifactSetSelectVisible = false;
      }
    },
    /** 武器を選択しました */
    async weaponSelected(weapon: TWeaponKey) {
      this.characterInput!.weapon = weapon;
      this.weaponSelectVisible = false;
      this.characterInput!.weaponMaster = await getWeaponMasterDetail(weapon, this.characterInput!.characterMaster.武器);

    },
    openArtifactSetSelect(index: number) {
      if (index == this.artifactSetIndex) {
        this.artifactSetSelectVisible = !this.artifactSetSelectVisible;
      } else {
        this.artifactSetIndex = index;
        this.artifactSetSelectVisible = true;
      }
      if (this.artifactSetSelectVisible) {
        this.weaponSelectVisible = false;
      }
    },
    /** 聖遺物セット効果を選択しました */
    artifactSetSelected(artifactSet: TArtifactSetKey) {
      this.artifactSet[this.artifactSetIndex] = artifactSet;
      this.characterInput!.artifactSetMaster[this.artifactSetIndex] = ARTIFACT_SET_MASTER[artifactSet];
      this.artifactSetSelectVisible = false;
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
</style>
