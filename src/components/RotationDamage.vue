<template>
  <fieldset>
    <table class="total-damage">
      <tbody>
        <tr>
          <th class="damage-name">{{ displayNameV("ローテーション合計ダメージ") }}</th>
          <td class="total-damage-value">{{ Math.round(totalDamage) }}</td>
        </tr>
      </tbody>
    </table>
    <hr />
    <ul class="action-list">
      <li v-for="item in itemList" :key="item.id">
        <div class="add-item" @click="addItem(item)">
          <img :class="'action' + itemImgClass(item)" :src="item.src" :alt="displayName(item.name)" />
        </div>
        <div>{{ displayName(item.name) }}</div>
      </li>
    </ul>
    <hr />
    <table class="customized-result">
      <draggable :list="rotationDamageCustomList" item-key="id" group="action" :sort="true" handle=".handle">
        <template #item="{ element, index }">
          <tr>
            <th class="category handle with-tooltip">
              <img :class="'action' + itemImgClass(element)" :src="element.src" :alt="displayName(element.name)" />
              <div class="tooltip">{{ displayName(element.name) }}</div>
            </th>
            <td class="damage" style="vertical-align: middle;">
              <table>
                <tr v-for="(entry, index2) in getDamageResultArr(element, selectDamageResult(element))" :key="index2">
                  <th class="damage-name">{{ displayNameV(entry[0]) }}</th>
                  <td class="reaction-list">
                    <div class="reaction with-tooltip" v-for="reaction in amplifyingReactionList(element, index2)"
                      :key="reaction[0]" @click="reactionOnClick(element, index2, reaction)">
                      <span> {{ reactionCount(element, index2, reaction) }}</span>
                      <img :class="'reaction' + reactionUnselectedClass(element, index2, reaction)" :src="reaction[1]"
                        :alt="displayName(reaction[0])" />
                      <div class="tooltip">{{ displayName(reaction[0]) }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="reaction with-tooltip" @click="statChangeOnClick(element)">
                      <img :class="'stat-change' + statChangeUnselectedClass(element)" :src="instructorImg"
                        :alt="displayName('教官')" />
                      <div class="tooltip">{{ displayName('教官') }}</div>
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
  </fieldset>

  <div class="savedata">
    <select v-model="savedataIndex" @change="load">
      <option v-for="savedata in savedataList" :value="savedata[0]" :key="savedata[0]">
        {{ savedata[1] }}
      </option>
    </select>
    <button type="button" @click="save">Save</button>
    <button type="button" @click="remove">Remove</button>
  </div>

  <p class="notice">
    天賦アイコンまたは元素反応アイコンをクリックしてスキルローテーションを設定してください。
  </p>
</template>
<script lang="ts">
import _ from "lodash";
import draggable from "vuedraggable";
import { getDamageResultArr, TRotationDamageEntry, REACTION_DMG_ARR, REACTION_DMG_ELEMENT_MAP, calculateRotationTotalDamage, TRotationDamageInfo, calculateRotationDamageEntry, getAmplifyingReactionElement } from "@/calculate";
import {
  TDamageResult,
  TDamageResultElementalReactionKey,
  TDamageResultEntry,
} from "@/input";
import {
  ARTIFACT_SET_MASTER,
  ELEMENT_COLOR_CLASS,
  ELEMENT_IMG_SRC,
  IMG_SRC_DUMMY,
  TCharacterDetail,
  TElementColorClassKey,
  TElementImgSrcKey,
} from "@/master";
import { computed, defineComponent, PropType, reactive, ref, toRefs, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";
import i18n from "@/i18n";

type TRotationDamageEntryCustom = TRotationDamageEntry & {
  id: number;
  src: string;
  resultIndex: number;
};

let id = 1;

export default defineComponent({
  name: 'RotationDamage',
  components: {
    draggable,
  },
  props: {
    characterMaster: { type: Object as PropType<TCharacterDetail>, required: true, },
    damageResult: { type: Object as PropType<TDamageResult>, required: true },
    damageResult2: { type: Object as PropType<TDamageResult>, required: true }, // +教官
  },
  emits: ['update:rotation-damage'],
  setup(props, context) {
    const { displayName, targetValue } = CompositionFunction();

    const { characterMaster } = toRefs(props);
    const rotationDamageCustomList = reactive([] as TRotationDamageEntryCustom[]);

    const totalDamage = computed(() => calculateRotationTotalDamage(rotationDamageList.value, props.damageResult));

    const selectDamageResult = (customizedEntry: TRotationDamageEntryCustom) => {
      return customizedEntry.resultIndex === 1 ? props.damageResult : props.damageResult2;
    };

    const displayNameV = (key: any): string => {
      if (key && i18n.global.locale.value == 'ja-jp' && key.length > 10) {
        let work = key;
        work = work.replace(/の攻撃ダメージ$/, '').replace(/のダメージ$/, '').replace(/ダメージ$/, '');
        return work;
      }
      return displayName(key);
    }

    const rotationDamageList = computed(() => {
      let result: TRotationDamageEntry[] = [];
      for (const entry of rotationDamageCustomList) {
        result.push({
          name: entry.name,
          category: entry.category,
          reactions: entry.reactions,
          counts: entry.counts,
        });
      }
      return result;
    });

    function updateRotationDamage() {
      const rotationDamageInfo: TRotationDamageInfo = {
        totalDamage: totalDamage.value,
        rotationDamages: rotationDamageList.value,
      };
      context.emit('update:rotation-damage', rotationDamageInfo);
    }

    const itemList = computed(() => {
      const result = [] as TRotationDamageEntryCustom[];
      ['通常攻撃', '落下攻撃', '重撃', '元素スキル', '元素爆発', 'その他'].forEach((category) => {
        if (!(category in props.damageResult)) {
          return;
        }
        const customizedEntry = {} as TRotationDamageEntryCustom;
        customizedEntry.category = category;
        customizedEntry.id = id++;
        customizedEntry.name = category;
        if (category == 'その他') {
          customizedEntry.src = IMG_SRC_DUMMY;
        } else {
          const iconCategory = ['重撃', '落下攻撃'].includes(category) ? '通常攻撃' : category;
          customizedEntry.src = (characterMaster.value as any)[iconCategory].icon_url;
        }
        customizedEntry.reactions = [] as object[];
        customizedEntry.counts = [] as number[];
        customizedEntry.resultIndex = 1;
        const list = getDamageResultArr(customizedEntry, selectDamageResult(customizedEntry));
        if (list.length == 0) {
          return;
        }
        for (let i = 0; i < list.length; i++) {
          customizedEntry.reactions.push({});
          if (['落下期間のダメージ'].includes(list[i][0])) {
            customizedEntry.counts.push(0);
          } else if (characterMaster.value.武器 == '弓' && category == '重撃') {
            if (list.length > 3 && i < 2) {
              customizedEntry.counts.push(0);
            } else {
              customizedEntry.counts.push(1);
            }
          } else {
            customizedEntry.counts.push(1);
          }
        }
        result.push(customizedEntry);
      });
      REACTION_DMG_ARR.forEach((reactionDmg) => {
        if (
          props.damageResult.元素反応[reactionDmg as TDamageResultElementalReactionKey]
        ) {
          const reaction = reactionDmg.replace(/反応ダメージ$/, '');
          let dmgElement;
          if (reactionDmg == '拡散ダメージ') {
            dmgElement = props.damageResult.元素反応.拡散元素;
          } else {
            dmgElement = REACTION_DMG_ELEMENT_MAP.get(reactionDmg) as string;
          }
          const customizedEntry = {} as TRotationDamageEntryCustom;
          customizedEntry.id = id++;
          customizedEntry.name = reaction;
          customizedEntry.src = ELEMENT_IMG_SRC[dmgElement as TElementImgSrcKey];
          customizedEntry.category = reactionDmg;
          customizedEntry.reactions = [{}];
          customizedEntry.counts = [1] as number[];
          customizedEntry.resultIndex = 1;
          result.push(customizedEntry);
        }
      });
      return result;
    });
    const itemImgClass = (item: TRotationDamageEntryCustom) => {
      return REACTION_DMG_ARR.includes(item.category) ? ' reaction ' : '';
    };

    const storageKey = (index: number) => {
      const character = characterMaster.value.名前;
      const key = 'ROTATION_' + character + '_' + index;
      return key;
    };

    const savedataIndex = ref(1);

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
      const keys = Object.keys(localStorage).filter((s) =>
        s.startsWith('ROTATION_' + character + '_')
      );
      const indices = keys.map((key) =>
        Number(key.replace('ROTATION_' + character + '_', ''))
      );
      let maxIndex = Math.max(0, ...indices);
      for (let index = 1; index <= maxIndex; index++) {
        const key = storageKey(index);
        let nickname = index + ' : ';
        if (key in localStorage) {
          const valueStr = localStorage.getItem(key) as string;
          const value = JSON.parse(valueStr);
          if (Array.isArray(value)) {
            value.forEach((element) => {
              if (SAVEDATA_NICKNAME_MAP.has(element.name)) {
                const c = SAVEDATA_NICKNAME_MAP.get(element.name) as string;
                nickname += c;
                if (['N', 'C', 'P'].includes(c)) {
                  const n = Math.max(...element.counts);
                  if (n) {
                    nickname += n;
                  }
                }
              } else {
                nickname += '*';
              }
            });
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
      if (rotationDamageCustomList.length > 0) {
        const key = storageKey(savedataIndex.value);
        const value = JSON.stringify(rotationDamageCustomList);
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
          rotationDamageCustomList.splice(0, rotationDamageCustomList.length, ...value);
        }
        updateRotationDamage();
      }
    };
    load();

    const remove = () => {
      const key = storageKey(savedataIndex.value);
      if (key in localStorage) {
        localStorage.removeItem(key);
        localStorageUpdatedRef.value++;
      }
    };

    const clone = ({ id }: { id: number }) => {
      const org = itemList.value.filter((s) => s.id == id)[0];
      const dst = _.cloneDeep(org);
      dst.id = id++;
      return dst;
    };

    const addItem = (element: TRotationDamageEntryCustom) => {
      rotationDamageCustomList.push(clone(element));
    };

    function getReactionImgSrc(reaction: string, dmgElement: string) {
      const reactionElement = getAmplifyingReactionElement(reaction, dmgElement);
      return reactionElement ? ELEMENT_IMG_SRC[reactionElement as TElementImgSrcKey] : IMG_SRC_DUMMY;
    }

    const amplifyingReactionList = (
      customizedEntry: TRotationDamageEntryCustom,
      index: number
    ) => {
      const result = [] as [string, string][];
      const list = getDamageResultArr(customizedEntry, selectDamageResult(customizedEntry));
      const entry = list[index];
      const dmgElement = entry[1];
      if (dmgElement) {
        const reactionArr: string[] = [];
        if (dmgElement === '炎') {
          if (props.damageResult.元素反応.蒸発倍率_炎 > 0) {
            reactionArr.push('蒸発');
          }
          if (props.damageResult.元素反応.溶解倍率_炎 > 0) {
            reactionArr.push('溶解');
          }
        } else if (dmgElement === '水') {
          if (props.damageResult.元素反応.蒸発倍率_水 > 0) {
            reactionArr.push('蒸発');
          }
        } else if (dmgElement === '氷') {
          if (props.damageResult.元素反応.溶解倍率_氷 > 0) {
            reactionArr.push('溶解');
          }
        } else if (dmgElement === '雷') {
          if (props.damageResult.元素反応.超激化反応ダメージ > 0) {
            reactionArr.push('超激化');
          }
        } else if (dmgElement === '草') {
          if (props.damageResult.元素反応.草激化反応ダメージ > 0) {
            reactionArr.push('草激化');
          }
        }
        reactionArr.forEach(reaction => {
          result.push([reaction, getReactionImgSrc(reaction, dmgElement)]);
        })
      }
      return result;
    };

    const reactionCount = (
      customizedEntry: TRotationDamageEntryCustom,
      index: number,
      reaction: [string, string]
    ) => {
      let result = '';
      const reactionObj: any = customizedEntry.reactions[index];
      if (reaction[0] in reactionObj && reactionObj[reaction[0]]) {
        result = reactionObj[reaction[0]];
      }
      return result;
    };

    const reactionUnselectedClass = (
      customizedEntry: TRotationDamageEntryCustom,
      index: number,
      reaction: [string, string]
    ) => {
      let result;
      if (reactionCount(customizedEntry, index, reaction)) result = '';
      else result = ' unselected ';
      return result;
    };

    const reactionOnClick = (
      customizedEntry: TRotationDamageEntryCustom,
      index: number,
      reaction: [string, string]
    ) => {
      const reactionObj: any = customizedEntry.reactions[index];
      let count = customizedEntry.counts[index];
      const damageResultEntry = getDamageResultArr(customizedEntry, selectDamageResult(customizedEntry))[index];
      if (['超激化', '草激化'].includes(reaction[0]) && damageResultEntry[6]) {
        count *= damageResultEntry[6];
      }
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
      customizedEntry: TRotationDamageEntryCustom,
      index: number
    ) => {
      const reactionObj: any = customizedEntry.reactions[index];
      const count = customizedEntry.counts[index];
      Object.keys(reactionObj).forEach((key) => {
        if (count < reactionObj[key]) {
          reactionObj[key] = count;
        }
      });
    };

    const damageValue = (
      customizedEntry: TRotationDamageEntryCustom,
      index: number
    ) => calculateRotationDamageEntry(customizedEntry, index, selectDamageResult(customizedEntry));

    const elementColorClass = (
      customizedEntry: TRotationDamageEntryCustom,
      index: number
    ) => {
      const list = getDamageResultArr(customizedEntry, selectDamageResult(customizedEntry));
      const entry = list[index];
      return entry[1] ? ' ' + ELEMENT_COLOR_CLASS[entry[1] as TElementColorClassKey] + ' ' : '';
    };

    const instructorImg = ARTIFACT_SET_MASTER['教官'].image;
    const statChangeOnClick = (
      customizedEntry: TRotationDamageEntryCustom,
    ) => {
      if (customizedEntry) {
        customizedEntry.resultIndex = customizedEntry.resultIndex === 1 ? 2 : 1;
      }
    };
    const statChangeUnselectedClass = (
      customizedEntry: TRotationDamageEntryCustom,
    ) => {
      return customizedEntry.resultIndex === 1 ? ' unselected' : '';
    };

    const doDelete = (index: number) => {
      rotationDamageCustomList.splice(index, 1);
    };

    watch(rotationDamageCustomList, () => {
      updateRotationDamage();
    });

    watch(characterMaster, () => {
      rotationDamageCustomList.splice(0, rotationDamageCustomList.length);
      savedataIndex.value = 1;
      load();
    });

    return {
      displayName,
      targetValue,
      displayNameV,

      itemList,
      itemImgClass,
      addItem,

      selectDamageResult,
      getDamageResultArr,
      clone,
      rotationDamageCustomList,
      amplifyingReactionList,
      reactionCount,
      reactionUnselectedClass,
      reactionOnClick,
      countOnChange,
      instructorImg,
      statChangeOnClick,
      statChangeUnselectedClass,
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
  margin-block-start: 0;
  margin-block-end: 0;
  padding-inline-start: 0;
  padding-inline-end: 0;
}

ul.action-list li {
  display: inline-block;
  margin: 0;
  position: relative;
  width: calc(100% / 5);
  white-space: nowrap;
  font-size: 2rem;
}

img.action {
  width: 40px;
  object-fit: fill;
  border: none;
}

img.action.reaction {
  width: 30px;
  margin: 5px;
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
  border-spacing: 0;
}

table.customized-result {
  padding: 5px 0;
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
  width: 40%;
  white-space: nowrap;
}

td.reaction-list {
  width: 6rem;
}

div.reaction {
  position: relative;
  display: inline-block;
}

img.reaction {
  width: 3rem;
}

img.stat-change {
  width: 4rem;
}

div.reaction span {
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  font-size: 2.4rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 3px #000;
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

table.total-damage {
  width: 100%;
  table-layout: fixed;
}

table.total-damage th,
table.total-damage td {
  padding: 2px;
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
