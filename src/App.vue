<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <div class="pane2">
    <CharacterSelect :character="character" :visible="characterSelectVisible"
      @update:character="characterSelected($event)" />
  </div>
  <div class="pane3">
    {{ characterMaster }}
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue';
import CharacterSelect from './components/CharacterSelect.vue';

const Master = require('./master.js');
const Input = require('./input.ts');


export default defineComponent({
  name: 'App',
  props: {
    characterInput: Object,
},
  setup(props) {
  let characterSelectVisible = true;
  let character = ref(props.characterInput!.character);
  let characterMaster;
  let characterDetail = reactive(Input.CHARACTER_INPUT_TEMPLATE);


  return {
    characterSelectVisible,
    character,
    characterMaster,
    characterDetail,

  }
},
  methods: {
  async characterSelected(character: string) {
    this.character = character;
    this.characterSelectVisible = false;
    this.characterMaster = await Master.getCharacterMasterDetail(character);
  }
},
  components: {
  CharacterSelect
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
</style>
