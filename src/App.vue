<template>
  <div class="pane2">
    <CharacterSelect :character="character" :visible="characterSelectVisible"
      @update:character="characterSelected($event)" />
  </div>
  <div class="pane3">
    <CharacterInput :initialCharacterInput="initialCharacterInput" :initialRecommendationList="recommendationList"
      @open:character-select="characterSelectVisible = !characterSelectVisible" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, ref } from 'vue';
import CharacterSelect from './components/CharacterSelect.vue';
import CharacterInput from './components/CharacterInput.vue';
import { TRecommendation, makeRecommendationList, loadRecommendation } from './input';

const Master = require('./master.ts');
const Input = require('./input.ts');


export default defineComponent({
  name: 'App',
  props: {
    initialCharacterInput: { type: Object, require: true },
    initialArtifactDetailInput: { type: Object, require: true },
    initialConditionInput: { type: Object, require: true },
    initialRecommendationList: { type: Array as PropType<TRecommendation[]>, require: true },
  },
  components: {
    CharacterSelect, CharacterInput,
  },
  setup(props) {
    let characterInput = ref(props.initialCharacterInput);
    let artifactDetailInput = ref(props.initialArtifactDetailInput);
    let conditionInput = ref(props.initialConditionInput);

    let characterSelectVisible = ref(false);
    let character = computed(() => characterInput.value!.character);

    let recommendationList = ref(props.initialRecommendationList);

    let weaponSelectVisible = ref(false);
    let weapon = computed(() => characterInput.value!.weapon);
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
      weaponSelectVisible, weapon,
      artifactSetSelectVisible, artifactSetIndex, artifactSet,
      artifactDetailVisivle,
    }
  },
  methods: {
    async characterSelected(character: string) {
      this.characterInput!.character = character;
      this.characterSelectVisible = false;
      this.characterInput!.characterMaster = await Master.getCharacterMasterDetail(character);
      this.recommendationList!.splice(0, this.recommendationList!.length, ...makeRecommendationList(this.characterInput!.characterMaster));
      const recommendation = this.recommendationList![0];
      await loadRecommendation(this.characterInput!, this.artifactDetailInput!, this.conditionInput!, recommendation.build);
      console.log(recommendation.name, this.characterInput!.weaponMaster.名前);
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

.hidden {
  display: none;
}

.pyro {
  color: #d2655a;
}

.hydro {
  color: #559cc9;
}

.anemo {
  color: #3aaf7a;
}

.electro {
  color: #b681df;
}

.cryo {
  color: #63beb4;
}

.geo {
  color: #df8f37;
}

.pyro-bg {
  background-color: #d2655a;
}

.hydro-bg {
  background-color: #559cc9;
}

.anemo-bg {
  background-color: #3aaf7a;
}

.electro-bg {
  background-color: #b681df;
}

.cryo-bg {
  background-color: #63beb4;
}

.geo-bg {
  background-color: #df8f37;
}

ul.select-list {
  list-style-type: none;
  padding: 0;
  font-size: 0;
}

ul.select-list li {
  display: inline-block;
  margin: 0;
  position: relative;
}

.tooltip {
  display: none;
  position: absolute;
  left: 15px;
  top: 5px;
  z-index: 100;
  color: bisque;
  text-shadow: 1px 1px 2px black, 0 0 1em orange, 0 0 0.2em orange;
}

:hover+.tooltip {
  display: block;
}
</style>
