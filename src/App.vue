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


export default defineComponent({
  name: 'App',
  setup() {
    let characterSelectVisible = true;
    let character = ref(getCharacterByBirthday());
    let characterMaster;
    let characterDetail = reactive({
      突破レベル: 6,
      レベル: 90,
      命ノ星座: 0,
      通常攻撃レベル: 8,
      元素スキルレベル: 8,
      元素爆発レベル: 8,
      武器: null,
      武器突破レベル: 6,
      武器レベル: 90,
      武器精錬ランク: 1,
    });


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
