<template>
  <div class="pane2">
    <CharacterSelect :character="character" :visible="characterSelectVisible"
      @update:character="characterSelected($event)" />
  </div>
  <div class="pane3">
    <CharacterInput :initialCharacterInput="initialCharacterInput" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue';
import CharacterSelect from './components/CharacterSelect.vue';
import CharacterInput from './components/CharacterInput.vue';
import { makeRecommendationList } from './input';

const Master = require('./master.ts');
const Input = require('./input.ts');


export default defineComponent({
  name: 'App',
  props: {
    initialCharacterInput: { type: Object, require: true }
  },
  setup(props) {
    let characterInput = ref(props.initialCharacterInput);
    let characterSelectVisible = true;
    let character = computed(() => characterInput.value!.character);


    return {
      characterInput,
      characterSelectVisible,
      character,

    }
  },
  methods: {
    async characterSelected(character: string) {
      this.characterInput!.character = character;
      // this.characterSelectVisible = false;
      this.characterInput!.characterMaster = await Master.getCharacterMasterDetail(character);
      const recommendationList = makeRecommendationList(this.characterInput!.characterMaster);
      const recommendation = recommendationList[0];
    }
  },
  components: {
    CharacterSelect, CharacterInput,
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.hidden {
  display: none;
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

span.tooltip {
  display: none;
  position: absolute;
  left: 15px;
  top: 5px;
  z-index: 100;
  color: bisque;
  text-shadow: 1px 1px 2px black, 0 0 1em orange, 0 0 0.2em orange;
}

:hover+span.tooltip {
  display: block;
}
</style>
