<template>
  <div class="base-container">
    <div class="pane1">
    </div>

    <div class="pane2">
      <h3>CHARACTER: BUFF</h3>
      <vue-good-table :columns="columns" :rows="characterBuffRows" :line-numbers="true" theme="nocturnal"
        :search-options="{
          enabled: true,
          trigger: 'enter',
          skipDiacritics: true,
          placeholder: 'Search this table',
        }" />

      <h3>CHARACTER: DEBUFF</h3>
      <vue-good-table :columns="columns" :rows="characterDebuffRows" :line-numbers="true" theme="nocturnal"
        :search-options="{
          enabled: true,
          trigger: 'enter',
          skipDiacritics: true,
          placeholder: 'Search this table',
        }" />
    </div>

    <div class="footer">
    </div>
  </div>
</template>
<script lang="ts">
import 'vue-good-table-next/dist/vue-good-table-next.css'
import { computed, defineComponent, reactive, ref } from "vue";
import {
  CHARACTER_MASTER,
  getCharacterMasterDetail,
  TCharacterDetail,
  TCharacterKey,
  TEAM_OPTION_MASTER,
} from "@/master";
import CompositionFunction from "@/components/CompositionFunction.vue";

type TTeamOption = {
  character: string,
  category: string,
  name: string,
  nameWithCategory: string,
  statArr: string[],
  stats: string,
  description: string,
};

export default defineComponent({
  name: "TeamOptionList",
  components: {
    'vue-good-table': require('vue-good-table-next').VueGoodTable,
  },
  setup() {
    const { displayName, displayStatName } = CompositionFunction();

    const columns = [
      { label: 'キャラ', field: 'character', },
      { label: '名称', field: 'nameWithCategory', html: true, },
      { label: '説明', field: 'description', html: true, width: '50%', },
      { label: 'ステータス', field: 'stats', html: true, },
    ];

    const initialized = ref(false);
    const TEAM_OPTION_LIST = reactive([] as TTeamOption[]);

    function find(name: string, characterDetail: TCharacterDetail) {
      let category = '';
      let description = '';
      if (/^第\d重 /.test(name)) {
        category = '命ノ星座 ';
        name = name.replace(/^第\d重 /, '');
        for (const key of Object.keys(characterDetail.命ノ星座)) {
          const obj = characterDetail.命ノ星座[key];
          if (obj && name == obj.名前) {
            category += '第' + key + '重'
            description = obj.説明;
          }
        }
      } else {
        ['元素スキル', '元素爆発'].forEach(entry => {
          const obj = (characterDetail as any)[entry];
          if (obj && name == obj.名前) {
            category = entry;
            description = obj.説明;
          }
        });
        if (!category) {
          ['固有天賦'].forEach(entry => {
            for (const obj of (characterDetail as any)[entry]) {
              if (obj && name == obj.名前) {
                category = entry;
                description = obj.説明;
              }
            }
          });
        }
        if (!category) {
          for (const entry of ['元素スキル', '元素爆発']) {
            const obj = (characterDetail as any)[entry];
            if (obj) {
              if (obj.説明.indexOf('>' + name + '<') != -1 || obj.説明.indexOf('「' + name + '」') != -1) {
                category = entry;
                name = obj.名前;
                description = obj.説明;
                break;
              }
            }
          }
        }
        if (!category) {
          for (const entry of ['元素スキル', '元素爆発']) {
            const obj = (characterDetail as any)[entry];
            if (obj) {
              if (obj.説明.indexOf(name) != -1) {
                category = entry;
                name = obj.名前;
                description = obj.説明;
                break;
              }
            }
          }
        }
      }
      return [category, name, description];
    }

    async function initialize() {
      for (const character of Object.keys(CHARACTER_MASTER)) {
        const characterDetail = await getCharacterMasterDetail(character as TCharacterKey);
        if (!characterDetail) continue;
        let category: string;
        let name: string;
        let description: string;
        let statArr: string[];
        if (characterDetail.チームバフ) {
          let teamBuffArr = characterDetail.チームバフ;
          for (let i = 0; i < teamBuffArr.length; i++) {
            if (!teamBuffArr[i].名前 && !teamBuffArr[i].条件) continue;
            statArr = [];
            name = teamBuffArr[i].名前 ?? teamBuffArr[i].条件;
            const sameNameObjArr = teamBuffArr.slice(i).filter(s => (s.名前 ?? s.条件) == name);
            i += sameNameObjArr.length - 1;
            for (const obj of sameNameObjArr) {
              const stat = displayStatName(obj.種類);
              if (!statArr.includes(stat)) statArr.push(stat);
            }
            [category, name, description] = find(name, characterDetail);
            TEAM_OPTION_LIST.push({
              character: displayName(character),
              category: category,
              name: displayName(name),
              nameWithCategory: category + '<br>' + name,
              statArr: statArr,
              stats: statArr.join('<br>'),
              description: description,
            });
          }
        }
        for (const key of Object.keys(TEAM_OPTION_MASTER).filter(key => key.startsWith(character + '_'))) {
          const teamOptionMaster = (TEAM_OPTION_MASTER as any)[key];
          const workArr = key.split('_');
          name = workArr.slice(1).join('_');
          statArr = [];
          [category, name, description] = find(name.replace(/｜.+/, ''), characterDetail);
          for (const obj of teamOptionMaster.詳細) {
            const stat = displayStatName(obj.種類);
            if (!statArr.includes(stat)) statArr.push(stat);
          }
          TEAM_OPTION_LIST.push({
            character: displayName(character),
            category: category,
            name: displayName(name),
            nameWithCategory: category + '<br>' + name,
            statArr: statArr,
            stats: statArr.join('<br>'),
            description: description,
          });
        }
      }
      initialized.value = true;
    }
    initialize();

    const characterBuffRows = computed(() => {
      initialized.value;
      return TEAM_OPTION_LIST.filter(s => s.statArr.filter(stat => !stat.startsWith('敵')).length);
    });

    const characterDebuffRows = computed(() => {
      initialized.value;
      return TEAM_OPTION_LIST.filter(s => s.statArr.filter(stat => stat.startsWith('敵')).length);
    });

    return {
      displayName,

      columns,
      characterBuffRows,
      characterDebuffRows,
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

.base-container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: autoauto auto;
  grid-template-areas:
    "pane1"
    "pane2"
    "footer";
}
</style>
<style scoped>
.pane2 {
  text-align: left;
}
</style>
