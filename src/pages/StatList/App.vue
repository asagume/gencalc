<template>
  <div class="base-container">
    <div class="pane1">
      <p class="left-top"><a href="./">げんかるく</a></p>
      <p>&nbsp;</p>
      <h2>ステータス一覧</h2>
    </div>

    <div class="pane2">
      <div>
        <label v-for="key in Object.keys(ELEMENT_IMG_SRC)" :key="key">
          <input class="hidden" type="checkbox" v-model="visionChecked[key]">
          <img class="vision" :src="(ELEMENT_IMG_SRC as any)[key]" :alt="key">
        </label>
      </div>
      <div>
        <label v-for="key in Object.keys(WEAPON_IMG_SRC)" :key="key">
          <input class="hidden" type="checkbox" v-model="weaponChecked[key]">
          <img class="weapon" :src="(WEAPON_IMG_SRC as any)[key]" :alt="key">
        </label>
      </div>
      <div>
        <select v-model="level">
          <option v-for="key in LEVEL_LIST" :key="key" :value="key">{{ 'Lv.' + key }}</option>
        </select>
      </div>
      <br />
      <vue-good-table :columns="columns" :rows="rows" />
    </div>

    <div class="footer">
    </div>
  </div>
</template>
<script lang="ts">
import 'vue-good-table-next/dist/vue-good-table-next.css'
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import {
  getCharacterMasterDetail,
  CHARACTER_MASTER,
  ELEMENT_IMG_SRC,
  TCharacterDetail,
  TCharacterKey,
  WEAPON_IMG_SRC,
} from "@/master";
import CompositionFunction from "@/components/CompositionFunction.vue";

export default defineComponent({
  name: "TeamOptionList",
  components: {
    'vue-good-table': require('vue-good-table-next').VueGoodTable,
  },
  setup() {
    const { displayName } = CompositionFunction();

    const columns = [
      { label: displayName('キャラクター'), field: 'name', },
      { label: displayName('基礎HP'), field: 'baseHp', type: 'number', },
      { label: displayName('基礎攻撃力'), field: 'baseAtk', type: 'number', },
      { label: displayName('基礎防御力'), field: 'baseDef', type: 'number', },
      { label: displayName('突破ステータス'), field: 'addStat', html: true, },
    ];

    const LEVEL_LIST = ['1+', '20', '20+', '40', '40+', '50', '50+', '60', '60+', '70', '70+', '80', '80+', '90'];
    const level = ref(LEVEL_LIST[LEVEL_LIST.length - 1]);
    const characterMasterMap = reactive(new Map<string, TCharacterDetail>());
    const visionChecked = reactive({} as { [key: string]: boolean });
    Object.keys(ELEMENT_IMG_SRC).forEach(key => {
      visionChecked[key] = false;
    });
    const weaponChecked = reactive({} as { [key: string]: boolean });
    Object.keys(WEAPON_IMG_SRC).forEach(key => {
      weaponChecked[key] = false;
    });

    const rows = computed(() => {
      const result: any[] = [];
      characterMasterMap.forEach((value, key) => {
        if (Object.keys(visionChecked).filter(s => visionChecked[s]).length > 0) {
          if (!visionChecked[value.元素]) {
            return;
          }
        }
        if (Object.keys(weaponChecked).filter(s => weaponChecked[s]).length > 0) {
          if (!weaponChecked[value.武器]) {
            return;
          }
        }
        const addStat = Object.keys(value.ステータス).filter(s => !['基礎HP', '基礎攻撃力', '基礎防御力'].includes(s))[0].replace(/バフ$/, '');
        result.push({
          name: key,
          baseHp: value.ステータス['基礎HP'][level.value],
          baseAtk: value.ステータス['基礎攻撃力'][level.value],
          baseDef: value.ステータス['基礎防御力'][level.value],
          addStat: displayName(addStat),
        })
      })
      return result;
    })

    onMounted(() => {
      const promiseValues = Object.keys(CHARACTER_MASTER).map(key => getCharacterMasterDetail(key as TCharacterKey));
      Promise.all(promiseValues).then((responses) => {
        responses.forEach(response => {
          characterMasterMap.set(response.名前, response);
        })
      });
    })

    return {
      displayName,

      ELEMENT_IMG_SRC,
      WEAPON_IMG_SRC,
      visionChecked,
      weaponChecked,
      LEVEL_LIST,
      level,

      columns,
      rows,
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

.pane2 div {
  width: 94%;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

img.vision {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

img.weapon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

input:checked+img {
  background-color: gold;
}
</style>
