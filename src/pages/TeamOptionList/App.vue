<template>
  <div class="base-container">
    <div class="pane1">
      <p class="left-top"><a href="./">げんかるく</a></p>
      <p>&nbsp;</p>
      <h2>原神 強化・弱体効果一覧</h2>
      <p>&nbsp;</p>
    </div>
    []
    <div class="pane2">
      <template v-for="filterKey in Object.keys(FILTER_OBJ)" :key="filterKey">
        <h3>{{ displayName('強化効果') + '・' + displayName(filterKey) }}</h3>
        <vue-good-table :columns="columns" :rows="characterBuffRowsFiltered((FILTER_OBJ as any)[filterKey])"
          theme="nocturnal" :search-options="{
            enabled: true,
            trigger: 'enter',
            skipDiacritics: true,
            placeholder: 'Search this table',
          }" />
      </template>

      <h3>{{ displayName('弱体効果') }}</h3>
      <vue-good-table :columns="columns" :rows="characterDebuffRows" theme="nocturnal" :search-options="{
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
  ARTIFACT_SET_MASTER,
  CHARACTER_MASTER,
  getCharacterMasterDetail,
  getWeaponMasterDetail,
  OPTION1_MASTER,
  OPTION2_MASTER,
  TCharacterDetail,
  TCharacterKey,
  TEAM_OPTION_MASTER,
  TWeaponKey,
  WEAPON_MASTER,
} from "@/master";
import CompositionFunction from "@/components/CompositionFunction.vue";

type TTeamOption = {
  source: string,
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

    const FILTER_OBJ = {
      'HP': ['HP', 'HP%', 'HP上限'],
      '攻撃力': ['攻撃力', '攻撃力%'],
      '防御力': ['防御力', '防御力%'],
      '元素熟知': ['元素熟知'],
      '会心率, 会心ダメージ': ['会心率', '会心ダメージ'],
      '与える治療効果, 受ける治療効果': ['与える治療効果', '受ける治療効果'],
      '元素チャージ効率, 元素エネルギー': ['元素チャージ効率', '元素エネルギー'],
      'ダメージバフ': [
        '通常攻撃ダメージバフ',
        '重撃ダメージバフ',
        '落下攻撃ダメージバフ',
        '元素スキルダメージバフ',
        '元素爆発ダメージバフ',
        '与えるダメージバフ',
      ],
      '元素ダメージバフ': [
        '炎元素ダメージバフ',
        '水元素ダメージバフ',
        '風元素ダメージバフ',
        '雷元素ダメージバフ',
        '草元素ダメージバフ',
        '氷元素ダメージバフ',
        '岩元素ダメージバフ',
        '物理ダメージバフ',
      ],
      '実数ダメージ加算': [
        '通常攻撃ダメージアップ',
        '重撃ダメージアップ',
        '落下攻撃ダメージアップ',
        '元素スキルダメージアップ',
        '元素爆発ダメージアップ',
        '炎元素ダメージアップ',
        '水元素ダメージアップ',
        '風元素ダメージアップ',
        '雷元素ダメージアップ',
        '草元素ダメージアップ',
        '氷元素ダメージアップ',
        '岩元素ダメージアップ',
        '物理ダメージアップ',
      ],
      '攻撃速度, 移動速度': [
        '攻撃速度',
        '移動速度',
        '通常攻撃速度',
      ],
      '元素付与': [
        '炎元素付与',
        '水元素付与',
        '風元素付与',
        '雷元素付与',
        '草元素付与',
        '氷元素付与',
        '岩元素付与',
      ],
    };

    const columns = [
      { label: 'ソース', field: 'source', },
      { label: '名称', field: 'nameWithCategory', html: true, },
      { label: '説明', field: 'description', html: true, width: '50%', },
      { label: '関連ステータス', field: 'stats', html: true, },
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

    async function makeRowsByCharacter() {
      const result: TTeamOption[] = [];
      for (const source of Object.keys(CHARACTER_MASTER)) {
        const characterDetail = await getCharacterMasterDetail(source as TCharacterKey);
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
              const stat = obj.種類;
              if (!statArr.includes(stat)) statArr.push(stat);
            }
            [category, name, description] = find(name, characterDetail);
            result.push({
              source: displayName(source),
              category: category,
              name: displayName(name),
              nameWithCategory: category + '<br>' + name,
              statArr: statArr,
              stats: statArr.map(s => displayStatName(s)).join('<br>'),
              description: description,
            });
          }
        }
        for (const key of Object.keys(TEAM_OPTION_MASTER).filter(key => key.startsWith(source + '_'))) {
          const teamOptionMaster = (TEAM_OPTION_MASTER as any)[key];
          const workArr = key.split('_');
          name = workArr.slice(1).join('_');
          statArr = [];
          [category, name, description] = find(name.replace(/｜.+/, ''), characterDetail);
          for (const obj of teamOptionMaster.詳細) {
            const stat = obj.種類;
            if (!statArr.includes(stat)) statArr.push(stat);
          }
          result.push({
            source: displayName(source),
            category: category,
            name: displayName(name),
            nameWithCategory: category + '<br>' + name,
            statArr: statArr,
            stats: statArr.map(s => displayStatName(s)).join('<br>'),
            description: description,
          });
        }
      }
      return result;
    }

    async function makeRowsByWeapon() {
      const result: TTeamOption[] = [];
      for (const weaponMasterKey of Object.keys(WEAPON_MASTER)) {
        const weaponMaster = (WEAPON_MASTER as any)[weaponMasterKey];
        for (const weapon of Object.keys(weaponMaster)) {
          const weaponDetail = await getWeaponMasterDetail(weapon as TWeaponKey);
          if (!weaponDetail) continue;
          let source: string = weapon;
          const category = '武器';
          let name = weaponDetail.武器スキル?.名前 ?? '';
          let description = weaponDetail.武器スキル?.説明 ?? '';
          let statArr: string[] = [];
          if (weaponDetail.チームバフ) {
            for (const obj of weaponDetail.チームバフ) {
              const stat = obj.種類;
              if (!statArr.includes(stat)) statArr.push(stat);
            }
            result.push({
              source: displayName(source),
              category: category,
              name: displayName(name),
              nameWithCategory: category + '<br>' + name,
              statArr: statArr,
              stats: statArr.map(s => displayStatName(s)).join('<br>'),
              description: description,
            });
          }
          console.log(source);
          for (const key of Object.keys(OPTION2_MASTER).filter(s => s == source)) {
            const optionMaster = (OPTION2_MASTER as any)[key];
            statArr = [];
            for (const obj of optionMaster.詳細) {
              const stat = obj.種類;
              if (!statArr.includes(stat)) statArr.push(stat);
            }
            result.push({
              source: displayName(source),
              category: category,
              name: displayName(name),
              nameWithCategory: category + '<br>' + name,
              statArr: statArr,
              stats: statArr.map(s => displayStatName(s)).join('<br>'),
              description: description,
            });
          }
        }
      }
      return result;
    }

    async function makeRowsByArtifactSet() {
      const result: TTeamOption[] = [];
      for (const artifactSetKey of Object.keys(ARTIFACT_SET_MASTER)) {
        const artifactSetEntry = (ARTIFACT_SET_MASTER as any)[artifactSetKey];
        let source: string = artifactSetKey;
        const category = '聖遺物';
        let name = '';
        let description = artifactSetEntry['4セット効果'].説明 ?? '';
        let statArr: string[] = [];
        for (const key of Object.keys(OPTION1_MASTER).filter(s => s == source)) {
          const optionMaster = (OPTION1_MASTER as any)[key];
          statArr = [];
          for (const obj of optionMaster.詳細) {
            const stat = obj.種類;
            if (!statArr.includes(stat)) statArr.push(stat);
          }
          result.push({
            source: displayName(source),
            category: category,
            name: displayName(name),
            nameWithCategory: category + '<br>' + name,
            statArr: statArr,
            stats: statArr.map(s => displayStatName(s)).join('<br>'),
            description: description,
          });
        }
      }
      return result;
    }

    async function initialize() {
      const rowsByCharacter = await makeRowsByCharacter();
      const rowsByWeapon = await makeRowsByWeapon();
      const rowsByArtifactSet = await makeRowsByArtifactSet();
      TEAM_OPTION_LIST.push(...rowsByCharacter);
      TEAM_OPTION_LIST.push(...rowsByWeapon);
      TEAM_OPTION_LIST.push(...rowsByArtifactSet);
      initialized.value = true;
    }
    initialize();

    const characterBuffRows = computed(() => {
      initialized.value;
      const result = TEAM_OPTION_LIST.filter(s => s.statArr.filter(stat => !stat.startsWith('敵')).length);
      return result;
    });

    const characterDebuffRows = computed(() => {
      initialized.value;
      const result = TEAM_OPTION_LIST.filter(s => s.statArr.filter(stat => stat.startsWith('敵')).length);
      return result;
    });

    const characterBuffRowsFiltered = (statArr: string[]) => {
      const result: TTeamOption[] = [];
      for (const entry of characterBuffRows.value) {
        for (const stat of statArr) {
          if (entry.statArr.filter(s => s.endsWith(stat)).length > 0) {
            result.push(entry);
            break;
          }
        }
      }
      return result;
    }

    return {
      displayName,

      columns,
      characterBuffRows,
      characterDebuffRows,

      FILTER_OBJ,
      characterBuffRowsFiltered,
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
</style>
