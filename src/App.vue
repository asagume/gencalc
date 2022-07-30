<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <CharacterSelect :character="character" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CharacterSelect from './components/CharacterSelect.vue';

const Master = require('./master.js');

function getCharacterByBirthday(): string {
  const today = new Date();
  let curDiff = Number.MAX_SAFE_INTEGER;
  let result = Master.CHARACTER_MASTER_LIST[0].key;
  for (let entry of Master.CHARACTER_MASTER_LIST) {
    if ('誕生日' in entry) {
      const birthdayStrArr = entry['誕生日'].split('/');
      const birthday = new Date(today.getFullYear(), Number(birthdayStrArr[0]) - 1, Number(birthdayStrArr[1]), 0, 0, 0, 0);
      const diff = today.getTime() - birthday.getTime();
      if (diff < 0) continue;
      if (diff < curDiff) {
        curDiff = diff;
        result = entry.key;
      }
    }
  }
  return result;
}

export default defineComponent({
  name: 'App',
  setup(props) {
    const character = getCharacterByBirthday();

    return {
      character,
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
