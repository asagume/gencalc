<template>
  <fieldset>
    <ul class="action-list">
      <li v-for="item in itemList" :key="item.id">
        <div class="add-item" @click="addItem(item)">
          <img class="action" :src="item.src" :alt="displayName(item.name)" />
        </div>
        <div>{{ displayName(item.name) }}</div>
      </li>
    </ul>
    <table class="customized-result">
      <draggable :list="customizedResultList" item-key="id" group="action" :sort="true" handle=".handle">
        <template #item="{ element, index }">
          <tr>
            <th class="category handle">
              <img class="action" :src="element.src" :alt="displayName(element.name)" />
            </th>
            <td class="damage">
              <table>
                <tr v-for="(entry, index2) in damageResultEntryList(element)" :key="index2">
                  <th class="damage-name">{{ displayName(entry[0]) }}</th>
                  <td class="reaction-list">
                    <div class="reaction" v-for="reaction in amplifyingReactionList(element, index2)" :key="reaction[0]"
                      @click="reactionOnClick(element, index2, reaction)">
                      <span> {{ reactionCount(element, index2, reaction) }}</span>
                      <img :class="'reaction' + reactionUnselectedClass(element, index2, reaction)" :src="reaction[1]"
                        :alt="displayName(reaction[0])">
                    </div>
                  </td>
                  <td>
                    ×
                    <input type="number" v-model="element.counts[index2]" min="0"
                      @change="countOnChange(element, index2)" />
                  </td>
                  <td :class="'damage-value' + elementColorClass(element, index2)">
                    {{ Math.round(damageValue(element, index2)) }}
                  </td>
                </tr>
              </table>
            </td>
            <td>
              <button type="button" @click="doDelete(index)">
                <span class="material-symbols-outlined"> close </span>
              </button>
            </td>
          </tr>
        </template>
      </draggable>
    </table>
    <table class="total-damage">
      <tr>
        <th class="damage-name">{{ displayName("合計ダメージ") }}</th>
        <td class="total-damage-value">{{ Math.round(totalDamage) }}</td>
      </tr>
    </table>
  </fieldset>

  <div class="savedata">
    <select v-model="savedataIndex" @change="load">
      <option v-for="savedata in savedataList" :value="savedata[0]" :key="savedata[0]"> {{savedata[1]}} </option>
    </select>
    <button type="button" @click="save">Save</button>
    <button type="button" @click="remove">Remove</button>
  </div>

  <p class="notice">
    天賦アイコンまたは元素反応アイコンをクリックしてスキルローテーションを設定してください。
  </p>
</template>
<script lang="ts">
import draggable from "vuedraggable";
import { TDamageResult, TDamageResultElementalReactionKey, TDamageResultEntry } from "@/input";
import {
  DAMAGE_CATEGORY_ARRAY,
  ELEMENTAL_REACTION_MASTER,
  ELEMENT_COLOR_CLASS,
  ELEMENT_IMG_SRC,
  TCharacterDetail,
  TElementColorClassKey,
} from "@/master";
import { computed, defineComponent, PropType, reactive, ref, toRefs, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";
import { deepcopy } from "@/common";

type TCustomizedDamageResultEntry = {
  id: number;
  name: string;
  src: string;
  category: string;
  reactions: object[];
  counts: number[];
};

let id = 1;

export default defineComponent({
  name: "RotationDamage",
  components: {
    draggable,
  },
  props: {
    characterMaster: {
      type: Object as PropType<TCharacterDetail>,
      required: true,
    },
    damageResult: { type: Object as PropType<TDamageResult>, required: true },
  },
  setup(props) {
    const { displayName, targetValue } = CompositionFunction();

    const { characterMaster } = toRefs(props);
    const REACTION_DMG_ARR = [
      "過負荷ダメージ",
      "感電ダメージ",
      "超電導ダメージ",
      "拡散ダメージ",
      "燃焼ダメージ",
      "開花ダメージ",
      "烈開花ダメージ",
      "超開花ダメージ",
    ];

    const reactionDmgElementMap = computed(() => {
      const result = new Map();
      REACTION_DMG_ARR.forEach((reactionDmg) => {
        const reaction = reactionDmg.replace(/ダメージ$/, "");
        Object.keys(ELEMENTAL_REACTION_MASTER).forEach((element) => {
          const reactionMaster = (ELEMENTAL_REACTION_MASTER as any)[element];
          const workArr = Object.keys(reactionMaster);
          if (workArr.includes(reaction)) {
            if ("元素" in reactionMaster[reaction]) {
              result.set(reactionDmg, reactionMaster[reaction].元素);
            }
          }
        });
      });
      return result;
    });

    const damageResultEntryList = (
      customizedEntry: TCustomizedDamageResultEntry
    ): TDamageResultEntry[] => {
      let result = [] as TDamageResultEntry[];
      const category = customizedEntry.category;
      if (REACTION_DMG_ARR.includes(category)) {
        result.push([
          category,
          reactionDmgElementMap.value.get(category),
          (props.damageResult.元素反応 as any)[category],
          null,
          (props.damageResult.元素反応 as any)[category],
          null,
          1,
          null,
          null,
        ]);
      } else if (category == "通常攻撃") {
        result = props.damageResult[category].filter(
          (s: TDamageResultEntry) => !s[0].startsWith('非表示') && !s[0].endsWith("合計ダメージ")
        );
      } else {
        result = (props.damageResult[category] as any).filter(
          (s: TDamageResultEntry) =>
            !s[0].startsWith("非表示") && !s[0].endsWith("合計ダメージ") && s[5]?.endsWith("ダメージ")
        );
      }
      return result;
    };

    const itemList = computed(() => {
      const result = [] as TCustomizedDamageResultEntry[];
      DAMAGE_CATEGORY_ARRAY.forEach(categoryDmg => {
        const category = categoryDmg.replace(/ダメージ$/, '');
        const iconCategory = ['重撃', '落下攻撃'].includes(category) ? '通常攻撃' : category;
        const entry = {} as TCustomizedDamageResultEntry;
        entry.id = id++;
        entry.name = category;
        entry.src = (characterMaster.value as any)[iconCategory].icon_url;
        entry.category = category;
        entry.reactions = [] as object[];
        entry.counts = [] as number[];
        const list = damageResultEntryList(entry);
        for (let i = 0; i < list.length; i++) {
          entry.reactions.push({});
          if (['落下期間のダメージ'].includes(list[i][0])) {
            entry.counts.push(0);
          } else if (characterMaster.value.武器 == '弓' && category == '重撃') {
            if (list.length > 3 && i < 2) {
              entry.counts.push(0);
            } else {
              entry.counts.push(1);
            }
          } else {
            entry.counts.push(1);
          }
        }
        result.push(entry);
      });
      REACTION_DMG_ARR.forEach(reactionDmg => {
        if (props.damageResult.元素反応[reactionDmg as TDamageResultElementalReactionKey]) {
          const reaction = reactionDmg.replace(/ダメージ$/, '');
          let dmgElement;
          if (reactionDmg == '拡散ダメージ') {
            dmgElement = props.damageResult.元素反応.拡散元素;
          } else {
            dmgElement = reactionDmgElementMap.value.get(reactionDmg);
          }
          const entry = {} as TCustomizedDamageResultEntry;
          entry.id = id++;
          entry.name = reaction;
          entry.src = (ELEMENT_IMG_SRC as any)[dmgElement];
          entry.category = reactionDmg;
          entry.reactions = [{}];
          entry.counts = [1] as number[];
          result.push(entry);
        }
      });
      return result;
    });

    const customizedResultList = reactive([] as TCustomizedDamageResultEntry[]);

    const storageKey = (index: number) => {
      const character = characterMaster.value.名前;
      const key = 'ROTATION_' + character + '_' + index;
      return key;
    }

    const savedataIndex = ref(0);

    const SAVEDATA_NICKNAME_MAP = new Map([
      ['通常攻撃', 'N'],
      ['重撃', 'C'],
      ['落下攻撃', 'P'],
      ['元素スキル', 'E'],
      ['元素爆発', 'Q'],
    ]);
    const NO_DATA_NICKNAME = '**** NEW DATA ****';
    const localStorageUpdatedRef = ref(0);

    const savedataList = computed(() => {
      const result = [] as [number, string, number][];
      const character = characterMaster.value.名前;
      const keys = Object.keys(localStorage).filter(s => s.startsWith('ROTATION_' + character + '_'));
      const indices = keys.map(key => Number(key.replace('ROTATION_' + character + '_', '')));
      let maxIndex = Math.max(...indices);
      for (let index = 0; index <= maxIndex; index++) {
        const key = storageKey(index);
        let nickname = index + ' : ';
        if (key in localStorage) {
          const valueStr = localStorage.getItem(key) as string;
          const value = JSON.parse(valueStr);
          if (Array.isArray(value)) {
            value.forEach(element => {
              if (SAVEDATA_NICKNAME_MAP.has(element.name)) {
                const c = SAVEDATA_NICKNAME_MAP.get(element.name) as string;
                nickname += c;
                if (['N', 'C', 'P'].includes(c)) {
                  const n = Math.max(element.counts);
                  if (n) {
                    nickname += n;
                  }
                }
              } else {
                nickname += '*';
              }
            })
          }
        } else {
          nickname += NO_DATA_NICKNAME;
        }
        result.push([index, nickname, localStorageUpdatedRef.value]);
      }
      const index = maxIndex + 1;
      const nickname = index + ' : ' + NO_DATA_NICKNAME;
      result.push([index, nickname, localStorageUpdatedRef.value]);
      return result;
    });

    const save = () => {
      if (customizedResultList.length > 0) {
        const key = storageKey(savedataIndex.value);
        const value = JSON.stringify(customizedResultList);
        localStorage.setItem(key, value);
        localStorageUpdatedRef.value++;
      }
    };

    const load = () => {
      const key = storageKey(savedataIndex.value);
      if (key in localStorage) {
        const valueStr = localStorage.getItem(key) as string;
        const value = JSON.parse(valueStr);
        if (Array.isArray(value)) {
          customizedResultList.splice(0, customizedResultList.length, ...value);
        }
      }
    };

    const remove = () => {
      const key = storageKey(savedataIndex.value);
      if (key in localStorage) {
        localStorage.removeItem(key);
        localStorageUpdatedRef.value++;
      }
    };

    watch(characterMaster, () => {
      customizedResultList.splice(0, customizedResultList.length);
      savedataIndex.value = 0;
      load();
    });

    const clone = ({ id }: { id: number }) => {
      const org = itemList.value.filter((s) => s.id == id)[0];
      const dst = deepcopy(org);
      dst.id = id++;
      return dst;
    };

    const addItem = (element: TCustomizedDamageResultEntry) => {
      customizedResultList.push(clone(element));
    }

    const amplifyingReactionList = (
      customizedEntry: TCustomizedDamageResultEntry,
      index: number
    ) => {
      const result = [] as [string, string][];
      const list = damageResultEntryList(customizedEntry);
      const entry = list[index];
      const dmgElement = entry[1];
      if (dmgElement) {
        if (
          ["炎", "水"].includes(dmgElement) &&
          props.damageResult.元素反応.蒸発倍率 > 0
        ) {
          result.push(["蒸発", (ELEMENT_IMG_SRC as any)[["炎", "水"].filter(s => s != dmgElement)[0]]]);
        }
        if (
          ["炎", "氷"].includes(dmgElement) &&
          props.damageResult.元素反応.溶解倍率 > 0
        ) {
          result.push(["溶解", (ELEMENT_IMG_SRC as any)[["炎", "氷"].filter(s => s != dmgElement)[0]]]);
        }
        if (
          ["雷"].includes(dmgElement) &&
          props.damageResult.元素反応.超激化ダメージ > 0
        ) {
          result.push(["超激化", (ELEMENT_IMG_SRC as any)['草']]);
        }
        if (
          ["草"].includes(dmgElement) &&
          props.damageResult.元素反応.草激化ダメージ > 0
        ) {
          result.push(["草激化", (ELEMENT_IMG_SRC as any)['雷']]);
        }
      }
      return result;
    };

    const reactionCount = (
      customizedEntry: TCustomizedDamageResultEntry,
      index: number,
      reaction: [string, string]
    ) => {
      let result = '';
      const reactionObj: any = customizedEntry.reactions[index];
      if (reaction[0] in reactionObj && reactionObj[reaction[0]]) {
        result = reactionObj[reaction[0]];
      }
      return result;
    }

    const reactionUnselectedClass = (
      customizedEntry: TCustomizedDamageResultEntry,
      index: number,
      reaction: [string, string]
    ) => {
      let result;
      if (reactionCount(customizedEntry, index, reaction)) result = '';
      else result = ' unselected ';
      return result;
    }

    const reactionOnClick = (
      customizedEntry: TCustomizedDamageResultEntry,
      index: number,
      reaction: [string, string]
    ) => {
      const reactionObj: any = customizedEntry.reactions[index];
      const count = customizedEntry.counts[index];
      if (reaction[0] in reactionObj) {
        if (reactionObj[reaction[0]] < count) {
          reactionObj[reaction[0]]++;
        } else {
          reactionObj[reaction[0]] = 0;
        }
      } else {
        reactionObj[reaction[0]] = 1;
      }
    };

    const countOnChange = (
      customizedEntry: TCustomizedDamageResultEntry,
      index: number,
    ) => {
      const reactionObj: any = customizedEntry.reactions[index];
      const count = customizedEntry.counts[index];
      Object.keys(reactionObj).forEach(key => {
        if (count < reactionObj[key]) {
          reactionObj[key] = count;
        }
      })
    }

    const damageValue = (
      customizedEntry: TCustomizedDamageResultEntry,
      index: number
    ) => {
      const list = damageResultEntryList(customizedEntry);
      const entry = list[index];
      let result = 0;
      const reactionObj: any = customizedEntry.reactions[index];
      const count = customizedEntry.counts[index];
      for (let n = 0; n < count; n++) {
        let workDmg = entry[2]; // 期待値
        ["蒸発", "溶解"].forEach(reaction => {
          if (reaction in reactionObj && n < reactionObj[reaction]) {
            workDmg *= (props.damageResult.元素反応 as any)[reaction + "倍率"];
          }
        });
        ["超激化", "草激化"].forEach(reaction => {
          if (reaction in reactionObj && n < reactionObj[reaction]) {
            let reactionDmg = (props.damageResult.元素反応 as any)[reaction + "ダメージ"];
            if (entry[2]) {
              reactionDmg *= entry[2] / entry[4]; // 期待値 ÷ 非会心
            }
            if (entry[7]) {
              reactionDmg *= entry[7]; // ダメージバフ
            }
            if (entry[8]) {
              reactionDmg *= entry[8];  // 敵の防御補正
            }
            workDmg += reactionDmg;
          }
        });
        result += workDmg;
      }
      return result;
    };

    const elementColorClass = (
      customizedEntry: TCustomizedDamageResultEntry,
      index: number
    ) => {
      const list = damageResultEntryList(customizedEntry);
      const entry = list[index];
      return entry[1]
        ? " " + ELEMENT_COLOR_CLASS[entry[1] as TElementColorClassKey] + " "
        : "";
    };

    const totalDamage = computed(() => {
      let result = 0;
      customizedResultList.forEach((customizedEntry) => {
        const list = damageResultEntryList(customizedEntry);
        for (let i = 0; i < list.length; i++) {
          result += damageValue(customizedEntry, i);
        }
      });
      return result;
    });

    const doDelete = (index: number) => {
      customizedResultList.splice(index, 1);
    };

    return {
      displayName,
      targetValue,

      itemList,
      addItem,

      clone,
      damageResultEntryList,
      customizedResultList,
      amplifyingReactionList,
      reactionCount,
      reactionUnselectedClass,
      reactionOnClick,
      countOnChange,
      damageValue,
      elementColorClass,
      doDelete,

      totalDamage,

      savedataIndex,
      savedataList,
      save,
      load,
      remove,
    };
  },
});
</script>
<style scoped>
ul.action-list {
  width: 100%;
  list-style-type: none;
  padding: 0;
}

ul.action-list li {
  display: inline-block;
  margin: 0;
  position: relative;
  width: calc(100% / 6);
  white-space: nowrap;
  font-size: 2rem;
}

img.action {
  width: 40px;
  object-fit: fill;
  border: none;
}

.add-item {
  position: relative;
  display: inline-block;
}

/* .add-item::before,
.add-item::after {
  content: '';
  width: 12px;
  height: 4px;
  background: #333;
  position: absolute;
  top: 50%;
  left: calc(50% - 6px);
  transform: translateY(-50%);
  z-index: 100;
}

.add-item::after {
  transform: translateY(-50%) rotate(90deg);
} */

table {
  width: 100%;
}

table.customized-result {
  border: 2px solid gray;
  padding: 10px 0;
  font-size: 2rem;
}

.category {
  width: 40px;
  text-align: left;
}

select {
  width: 100%;
}

.damage table {
  width: 100%;
  table-layout: fixed;
}

.damage-name {
  text-align: right;
  width: 45%;
  white-space: nowrap;
}

td.reaction-list {
  width: 40px;
}

div.reaction {
  position: relative;
  display: inline-block;
}

img.reaction {
  width: 20px;
}

div.reaction span {
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  color: #333;
  text-shadow: 0 0 1px black;
}

.unselected {
  opacity: 50%;
}

.damage-value {
  text-align: right;
  white-space: nowrap;
}

input[type="number"] {
  width: calc(100% - 3rem);
}

table.total-damage th,
table.total-damage td {
  padding: 5px;
}

.total-damage-value {
  text-align: left;
  font-size: 2.8rem;
  color: gold;
}

button {
  padding: 2px;
}

button span {
  font-size: 2rem;
}

.savedata {
  padding-left: 10px;
  padding-right: 10px;
}

.savedata button {
  width: calc(20% - 15px);
  max-width: 12rem;
  margin: 10px 5px;
}

.savedata select {
  display: inline-block;
  width: 60%;
  margin: 10px 5px;
}

p.notice {
  padding-left: 10px;
  padding-right: 10px;
  text-align: left;
  color: chocolate;
}
</style>
