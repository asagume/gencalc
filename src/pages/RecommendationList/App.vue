<template>
  <div class="base-container">
    <div class="pane1">
      <p class="left-top"><a href="./">げんかるく</a></p>
      <p>&nbsp;</p>
      <h2>おすすめセット一覧</h2>
      <p>&nbsp;</p>
    </div>
    []
    <div class="pane2">
      <vue-good-table :columns="columns" :rows="recommendationList" theme="nocturnal" :line-numbers="true" />
    </div>

    <div class="footer">
    </div>
  </div>
</template>
<script lang="ts">
import 'vue-good-table-next/dist/vue-good-table-next.css'
import { computed, defineComponent, ref } from "vue";
import {
  ARTIFACT_SET_MASTER,
  CHARACTER_MASTER,
  NUMBER_OF_PRIORITY_SUBSTATS,
  TCharacterDetail,
  WEAPON_MASTER,
} from "@/master";
import CompositionFunction from "@/components/CompositionFunction.vue";

export default defineComponent({
  name: "RecommendationList",
  components: {
    'vue-good-table': require('vue-good-table-next').VueGoodTable,
  },
  setup() {
    const { displayName } = CompositionFunction();

    const columns = [
      { label: 'キャラクター', field: 'character', },
      { label: 'ICON', field: 'icon', html: true, },
      { label: '武器', field: 'weapon', html: true, },
      { label: '聖遺物セット効果', field: 'artifactSet', html: true, },
      { label: '時の砂', field: 'artifactMain3', html: true, },
      { label: '空の杯', field: 'artifactMain4', html: true, },
      { label: '理の冠', field: 'artifactMain5', html: true, },
    ];

    const initialized = ref(false);

    const characterMasterMap: Map<string, TCharacterDetail> = new Map();

    const recommendationList = computed(() => {
      initialized.value;
      const result: any[] = [];
      for (const character of Object.keys(CHARACTER_MASTER)) {
        const characterMasterDetail = characterMasterMap.get(character);
        if (!characterMasterDetail) continue;
        const recommendationArr = characterMasterDetail.おすすめセット;
        for (const recommendation of recommendationArr) {
          const weaponMaster = (WEAPON_MASTER as any)[characterMasterDetail.武器][recommendation.武器];
          const artifactSetMaster1 = (ARTIFACT_SET_MASTER as any)[recommendation.聖遺物セット効果1];
          const artifactSetMaster2 = (ARTIFACT_SET_MASTER as any)[recommendation.聖遺物セット効果2];
          if (!weaponMaster || !artifactSetMaster1 || !artifactSetMaster2) continue;
          let iconHtml = '<img src="' + weaponMaster.icon_url + '" alt="' + recommendation.武器 + '" width="32" height="32">';
          iconHtml += '<img src="' + artifactSetMaster1.icon_url + '" alt="' + recommendation.聖遺物セット効果1 + '" width="32" height="32">';
          iconHtml += '<img src="' + artifactSetMaster2.icon_url + '" alt="' + recommendation.聖遺物セット効果2 + '" width="32" height="32">';
          let artifactSetText = recommendation.聖遺物セット効果1;
          if (recommendation.聖遺物セット効果1 != recommendation.聖遺物セット効果2) {
            artifactSetText += ' / ';
            artifactSetText += recommendation.聖遺物セット効果2;
          }
          const artifactMain3Text = recommendation.聖遺物メイン効果3.replace(/^\d_/, '');
          const artifactMain4Text = recommendation.聖遺物メイン効果4.replace(/^\d_/, '').replace(/バフ$/, "");
          const artifactMain5Text = recommendation.聖遺物メイン効果5.replace(/^\d_/, '');
          const entry = {
            character: character,
            icon: iconHtml,
            weapon: recommendation.武器,
            artifactMain3: artifactMain3Text,
            artifactMain4: artifactMain4Text,
            artifactMain5: artifactMain5Text,
            artifactSet: artifactSetText,
          } as { [key: string]: any };
          for (let i = 1; i <= NUMBER_OF_PRIORITY_SUBSTATS; i++) {
            const fromKey = '聖遺物優先するサブ効果' + i;
            const toKey = 'artifactPriority' + i;
            entry[toKey] = recommendation[fromKey];
          }
          result.push(entry);
        }
      }
      return result;
    });

    async function initialize() {
      characterMasterMap.clear();
      const promiseValues1 = Object.keys(CHARACTER_MASTER).map(key => fetch((CHARACTER_MASTER as any)[key].import)
        .then(resp => resp.json())
        .then(json => {
          characterMasterMap.set(key, json);
        }));
      Promise.all([...promiseValues1]).then(() => {
        initialized.value = true;
      });
    }
    initialize();

    return {
      displayName,

      columns,
      recommendationList,
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
.pane1 {
  position: relative;
}

.left-top {
  position: absolute;
  left: 5px;
  top: 0;
}

.pane2 {
  text-align: left;
}

h3 {
  padding-left: 10px;
}

table.vgt-table td {
  vertical-align: middle;
}
</style>
