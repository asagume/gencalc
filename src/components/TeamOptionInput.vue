<template>
  <fieldset class="team-option">
    <template v-for="supporter in SUPPORTER_KEY_LIST" :key="supporter">
      <fieldset v-if="supporterOpenClose[supporter]" class="supporter" v-show="supporterVisible(supporter)">
        <div class="left">
          <div :class="'supporter' + supporterOptionSelectedClass(supporter)">
            <input class="hidden" :id="'supporter-' + supporter" type="checkbox"
              v-model="supporterOpenClose[supporter]" />
            <label class="fold with-tooltip" :for="'supporter-' + supporter">
              <div class="character">
                <img class="character" :src="characterIconSrc(supporter)" :alt="displayName(supporter)">
                <img class="vision" :src="characterVisionIconSrc(supporter)" alt="vision">
              </div>
              <span class="tooltip"> {{ displayName(supporter) }} </span>
            </label>
            <button type="button" v-if="teamMembers.includes(supporter)" @click="removeFromTeamOnClick(supporter)">
              <span class="material-symbols-outlined remove"> person_remove </span>
            </button>
            <button type="button" v-else :disabled="teamMembers.length >= 3" @click="addToTeamOnClick(supporter)">
              <span class="material-symbols-outlined add"> person_add </span>
            </button>
          </div>
          <div class="builddata-selector" v-if="buildnameList(supporter).length">
            <label>
              <select v-model="selectedBuildname[supporter]" @change="buildnameSelectionOnChange">
                <option v-for="item in buildnameList(supporter)" :value="item" :key="item">
                  {{ item }}
                </option>
              </select>
            </label>
          </div>
          <div class="equipment">
            <div class="with-tooltip">
              <img :src="weaponIconSrc(supporter)" alt="weapon" />
              <span class="tooltip">{{ weaponName(supporter) }}</span>
            </div>
            <div class="with-tooltip">
              <img :src="artifactSetIconSrc(supporter, 0)" alt="artifact set" />
              <span class="tooltip">{{ artifactSetName(supporter, 0) }}</span>
            </div>
            <div class="with-tooltip">
              <img :src="artifactSetIconSrc(supporter, 1)" alt="artifact set" />
              <span class="tooltip">{{ artifactSetName(supporter, 1) }}</span>
            </div>
          </div>
          <label class="condition" v-for="item in supporterCheckboxList(supporter)" :key="item.name">
            <input type="checkbox" v-model="conditionValues[item.name]" :disabled="conditionDisabled(item)"
              @change="valueOnChange($event, item)" />
            <span> {{ displayName(item.displayName) }}</span>
          </label>
          <label class="condition" v-for="item in supporterSelectList(supporter)" :key="item.name">
            <span> {{ displayName(item.displayName) }} </span>
            <select v-model="conditionValues[item.name]" :disabled="conditionDisabled(item)"
              @change="valueOnChange($event, item)">
              <option v-for="(option, index) in item.options" :value="index" :key="option">
                {{ displayOptionName(option) }}
              </option>
            </select>
          </label>
          <label class="condition" v-for="item in supporterNumberList(supporter)" :key="item.name">
            <span> {{ displayName(item.displayName) }}</span>
            <input type="number" v-model="conditionValues[item.name]" :min="item.min" :max="item.max" :step="item.step"
              :disabled="conditionDisabled(item)" @blur="valueOnChange($event, item)" />
          </label>
        </div>
      </fieldset>
      <template v-else>
        <div v-show="supporterVisible(supporter)"
          :class="'supporter-else' + elementBgClass(supporter) + supporterOptionSelectedClass(supporter)">
          <input class="hidden" :id="'supporter-else-' + supporter" type="checkbox"
            v-model="supporterOpenClose[supporter]" />
          <label class="fold with-tooltip" :for="'supporter-else-' + supporter">
            <div class="character">
              <img class="character" :src="characterIconSrc(supporter)" :alt="displayName(supporter)">
              <img class="vision" :src="characterVisionIconSrc(supporter)" alt="vision">
            </div>
            <span class="tooltip"> {{ displayName(supporter) }} </span>
          </label>
          <button type="button" v-if="teamMembers.includes(supporter)" @click="removeFromTeamOnClick(supporter)">
            <span class="material-symbols-outlined remove"> person_remove </span>
          </button>
          <button type="button" v-else :disabled="teamMembers.length >= 3" @click="addToTeamOnClick(supporter)">
            <span class="material-symbols-outlined add"> person_add </span>
          </button>
        </div>
      </template>
    </template>

    <hr />

    <ul class="option-description">
      <li v-for="item in displayStatAjustmentList" :key="item">{{ item }}</li>
    </ul>

    <label>
      {{ displayName("すべて閉じる") }}
      <button class="execute" type="button" @click="closeAllSupporters">{{ displayName("実行") }}</button>
    </label>
    <label>
      {{ displayName("すべてクリア") }}
      <button class="execute" type="button" @click="clearAllSupporterOptions">
        {{ displayName("実行") }}
      </button>
    </label>
  </fieldset>

  <p class="notice">
    キャラクターの天賦レベルやステータスによって効果量が変動する種類のオプションはデフォルト名称の構成保存データが存在する場合に選択可能になります。
    <br />
    構成保存データのデフォルト名称：あなたの{キャラクターの名前}
  </p>
</template>

<script lang="ts">
import _ from 'lodash';
import { isNumeric } from "@/common";
import {
  makeBuildStorageKey,
  makeDefaultBuildname,
  TConditionInput,
  TConditionValues,
  TSupporters,
} from "@/input";
import {
  ALL_ELEMENTS,
  CHARACTER_MASTER,
  ELEMENT_BG_COLOR_CLASS,
  ELEMENT_IMG_SRC,
  IMG_SRC_DUMMY,
  TAnyObject,
  TCharacterKey,
} from "@/master";
import { computed, defineComponent, nextTick, onMounted, PropType, reactive, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
  name: 'TeamOptionInput',
  props: {
    character: { type: String as PropType<TCharacterKey>, required: true, },
    teamMembers: { type: Array as PropType<string[]>, required: true, },
    conditionInput: { type: Object as PropType<TConditionInput>, required: true, },
  },
  emits: ['update:team-option', 'update:buildname-selection', 'update:team-members'],
  setup(props, context) {
    const {
      displayName,
      displayStatName,
      displayStatValue,
      displayOptionName,
    } = CompositionFunction();

    const SUPPORTER_KEY_LIST = Object.keys(CHARACTER_MASTER);
    SUPPORTER_KEY_LIST.sort((a, b) => ALL_ELEMENTS.indexOf((CHARACTER_MASTER as any)[a].元素) - ALL_ELEMENTS.indexOf((CHARACTER_MASTER as any)[b].元素));
    const supporterOpenClose = reactive({} as { [key: string]: boolean });  // true:開, false:閉
    for (const key of SUPPORTER_KEY_LIST) {
      supporterOpenClose[key] = false;
    }
    const builddataSelectorVisible = reactive({} as { [key: string]: boolean });  // true:表示, false:非表示
    const selectedBuildname = reactive({} as TAnyObject);
    const teamMembers = reactive([] as string[]);

    const supporters = reactive({} as TSupporters);
    const conditionValues = reactive({} as TConditionValues);

    const teamOptionDetails1 = computed(() => props.conditionInput.optionDetails1);
    const teamOptionDetails2 = computed(() => props.conditionInput.optionDetails2);
    const conditionMap = computed(() => props.conditionInput.conditionMap);
    const exclusionMap = computed(() => props.conditionInput.exclusionMap)
    const checkboxList = computed(() => props.conditionInput.checkboxList);
    const selectList = computed(() => props.conditionInput.selectList);
    const numberList = computed(() => props.conditionInput.numberList);

    const supporterCheckboxList = (supporter: any) => checkboxList.value.filter((s) => s.name.startsWith(supporter + '*'));
    const supporterSelectList = (supporter: any) => selectList.value.filter((s) => s.name.startsWith(supporter + '*'));
    const supporterNumberList = (supporter: any) => numberList.value.filter((s) => s.name.startsWith(supporter + '*'));
    /** 選択中のキャラクターのオプションは表示しません */
    const supporterVisible = (supporter: any) => supporter != props.character;
    const supporterOptionSelectedClass = (supporter: any) => {
      return (supporterCheckboxList(supporter).filter(s => conditionValues[s.name]).length > 0
        || supporterSelectList(supporter).filter(s => !s.required && conditionValues[s.name]).length > 0)
        ? ' selected' : '';
    }

    const elementBgClass = (supporter: string) => {
      return ' ' + (ELEMENT_BG_COLOR_CLASS as any)[(CHARACTER_MASTER as any)[supporter].元素];
    }
    const characterIconSrc = (character: string) => (CHARACTER_MASTER as any)[character].icon_url;
    const characterVisionIconSrc = (character: string) => (ELEMENT_IMG_SRC as any)[(CHARACTER_MASTER as any)[character].元素];
    const weaponIconSrc = (character: string) => {
      const work = supporters[character];
      return work?.characterInput?.weaponMaster?.icon_url ?? IMG_SRC_DUMMY;
    }
    const weaponName = (character: string) => {
      const work = supporters[character];
      return work?.characterInput?.weapon ?? '';
    }
    const artifactSetIconSrc = (character: string, index: number) => {
      const work = supporters[character]?.characterInput?.artifactSetMasters;
      return _.isArray(work) ? work[index].icon_url ?? IMG_SRC_DUMMY : IMG_SRC_DUMMY;
    }
    const artifactSetName = (character: string, index: number) => {
      const work = supporters[character]?.characterInput?.artifactSetMasters;
      return _.isArray(work) ? work[index].key ?? '' : '';
    }

    function convertBuildname(character: string, storageKey: string) {
      const prefix = makeBuildStorageKey(character);
      if (storageKey == prefix) return makeDefaultBuildname(character);
      return storageKey.replace(new RegExp('^' + prefix + '_'), '');
    }
    const buildnameList = (character: string) => {
      const re = new RegExp('^構成_' + character.replace('(', '\\(').replace(')', '\\)') + '(_|$)');
      const storageKeys = Object.keys(localStorage).filter((s) => re.test(s));
      const list = storageKeys.map((s) => convertBuildname(character, s));
      const defaultBuildname = makeDefaultBuildname(character);
      const result = list.filter((s) => s != defaultBuildname).sort();
      if (list.includes(defaultBuildname)) {
        result.unshift(defaultBuildname);
      }
      return result;
    }
    const builddataSelectable = (character: string) => buildnameList(character).length > 0;

    /** サポーターのステータス（天賦レベル）を参照するオプションには保存データが必要です */
    const conditionDisabled = (item: any) => {
      const supporter = item.name.split('*')[0];
      if (buildnameList(supporter).length === 0) {
        for (const myDetailObj of teamOptionDetails1.value) {
          if (_.isString(myDetailObj.条件) && myDetailObj.条件.startsWith(item.name)) {
            if (myDetailObj.数値?.includes('$')) {
              return true;
            }
          }
        }
        for (const myDetailObj of teamOptionDetails2.value) {
          if (_.isString(myDetailObj.条件) && myDetailObj.条件.startsWith(item.name)) {
            if (myDetailObj.数値?.includes('$')) {
              return true;
            }
          }
        }
      }
      return false;
    }

    /** ステータス補正値を表示用の形式に編集します */
    const displayStatAjustmentList = computed(() => {
      const result: string[] = [];
      for (const stat of Object.keys(props.conditionInput.conditionAdjustments)) {
        let work = displayStatName(stat).replace('%', '');
        const value = props.conditionInput.conditionAdjustments[stat];
        if (value !== null) {
          if (isNumeric(value)) {
            if (value >= 0) {
              work += ['別枠乗算'].includes(stat.split('.')[0]) ? '=' : '+';
            }
            work += displayStatValue(stat, value);
          } else if (value) {
            work += "=" + value;
          }
        }
        result.push(work);
      }
      return result;
    })

    SUPPORTER_KEY_LIST.forEach((supporter) => {
      builddataSelectorVisible[supporter] = false;
      const list = buildnameList(supporter);
      if (list.length > 0) {
        selectedBuildname[supporter] = list[0];
      }
    })

    /** オプションの値が変更されたことを上位に通知します */
    const updateOption = async () => {
      await nextTick();
      context.emit('update:team-option', conditionValues);
    }

    const valueOnChange = async (event: Event, item: any) => {
      let exclusionArr: string[] | undefined = undefined;
      if (event.currentTarget instanceof HTMLInputElement) {
        if (event.currentTarget.checked) {
          exclusionArr = exclusionMap.value.get(item.name);
        }
      } else if (event.currentTarget instanceof HTMLSelectElement) {
        if (event.currentTarget.value) {
          exclusionArr = exclusionMap.value.get(item.name);
        }
      }
      if (exclusionArr) {
        exclusionArr.forEach((exclusion) => {
          if (checkboxList.value.filter((s) => s.name == exclusion).length > 0) {
            conditionValues[exclusion] = false;
          }
          if (selectList.value.filter((s) => s.name == exclusion).length > 0) {
            conditionValues[exclusion] = 0;
          }
        })
      }
      updateOption();
    }

    /** 構成保存名が変更されたことを上位に通知します */
    const buildnameSelectionOnChange = () => {
      context.emit('update:buildname-selection', selectedBuildname);
    }

    /** チームメンバーが変更されたことを上位に通知します */
    function updateTeamMembers(teamMembers: string[]) {
      context.emit('update:team-members', teamMembers);
    }
    const addToTeamOnClick = (member: string) => {
      updateTeamMembers([...props.teamMembers, member]);
    }
    const removeFromTeamOnClick = (member: string) => {
      updateTeamMembers(props.teamMembers.filter(s => s != member));
    }

    const closeAllSupporters = () => {
      for (const supporter of Object.keys(supporterOpenClose)) {
        supporterOpenClose[supporter] = false;
      }
    }
    const clearAllSupporterOptions = () => {
      for (const item of checkboxList.value) {
        conditionValues[item.name] = false;
      }
      for (const item of selectList.value) {
        conditionValues[item.name] = 0;
      }
      for (const item of numberList.value) {
        conditionValues[item.name] = item.initial;
      }
      updateOption();
    }

    function updateConditionValues() {
      conditionMap.value.forEach((value, key) => {
        if (value === null) { // checkbox
          if (!(key in conditionValues)) {
            conditionValues[key] = false;
          }
        } else if (_.isArray(value)) {  // select
          if (!(key in conditionValues)) {
            conditionValues[key] = 0;
          }
        } else if (_.isPlainObject(value)) {  // number
          if (!(key in conditionValues)) {
            conditionValues[key] = (value as any).initial;
          }
        }
      })
      updateOption();
    }

    const initializeSupporters = (argSupporters: TSupporters) => {
      for (const key of SUPPORTER_KEY_LIST) {
        if (buildnameList(key).length) {
          if (!selectedBuildname[key]) {
            selectedBuildname[key] = buildnameList(key)[0];
          }
        } else {
          selectedBuildname[key] = undefined;
        }
      }
      Object.keys(argSupporters).forEach(supporter => {
        if (!_.isEqual(supporters[supporter], argSupporters[supporter])) {
          supporters[supporter] = argSupporters[supporter];
        }
      })
      updateConditionValues();
    }

    const initializeValues = (input: TConditionInput) => {
      checkboxList.value.forEach(item => {
        if (input.conditionValues[item.name] !== undefined) {
          conditionValues[item.name] = input.conditionValues[item.name];
        } else if (conditionValues[item.name] === undefined) {
          conditionValues[item.name] = false;
        }
      })
      selectList.value.forEach(item => {
        if (input.conditionValues[item.name] !== undefined) {
          conditionValues[item.name] = input.conditionValues[item.name];
        } else if (conditionValues[item.name] === undefined) {
          conditionValues[item.name] = 0;
        }
      })
      numberList.value.forEach(item => {
        if (input.conditionValues[item.name] !== undefined) {
          conditionValues[item.name] = input.conditionValues[item.name];
        } else if (conditionValues[item.name] === undefined) {
          conditionValues[item.name] = Number(item.initial);
        }
      })
      updateOption();
    }

    onMounted(() => {
      if (_.isEqual(teamMembers, props.teamMembers)) {
        teamMembers.splice(0, teamMembers.length, ...props.teamMembers);
      }
      updateConditionValues();
    })

    watch(props, () => {
      if (_.isEqual(teamMembers, props.teamMembers)) {
        teamMembers.splice(0, teamMembers.length, ...props.teamMembers);
      }
      updateConditionValues();
    })

    return {
      displayName,
      displayOptionName,

      SUPPORTER_KEY_LIST,
      supporterCheckboxList,
      supporterSelectList,
      supporterNumberList,
      conditionValues,
      supporterVisible,
      supporterOptionSelectedClass,
      conditionDisabled,
      supporterOpenClose,
      closeAllSupporters,
      clearAllSupporterOptions,
      builddataSelectable,
      builddataSelectorVisible,
      buildnameList,
      selectedBuildname,

      elementBgClass,
      characterIconSrc,
      characterVisionIconSrc,
      weaponIconSrc,
      weaponName,
      artifactSetIconSrc,
      artifactSetName,

      displayStatAjustmentList,

      valueOnChange,
      buildnameSelectionOnChange,
      addToTeamOnClick,
      removeFromTeamOnClick,

      initializeSupporters,
      initializeValues,
    };
  },
});
</script>
<style scoped>
div.left {
  text-align: left;
  width: 100%;
}

fieldset.supporter {
  margin-bottom: 10px;
  padding-top: 0;
}

legend.supporter {
  border-width: 0 0 2px 0;
  border-radius: 0;
}

label {
  display: inline-block;
  margin: 2px 3px;
  text-align: left;
}

.unfold {
  text-align: center;
  padding: 0;
  background-color: transparent;
  border: none;
  width: 20rem;
}

.fold {
  text-align: center;
  width: 36px;
}

span.remove {
  color: goldenrod;
}

button:disabled span.add {
  color: gray;
}

label.condition {
  min-width: calc(100% / 3 - 1rem - 6px);
}

:disabled+label {
  color: gray;
}

.supporter-else.selected {
  border: 1px solid white;
  background-color: darkgoldenrod;
}

p.notice {
  text-align: left;
  color: chocolate;
}

div.supporter-else,
div.supporter {
  display: inline-block;
  min-width: 72px;
  white-space: nowrap;
  margin-right: 1px;
  border-radius: 10px;
  margin-bottom: 1px;
}

div.supporter-else {
  border: 1px solid black;
}

div.supporter label.fold {
  padding: 0;
  margin: 2px 3px;
}

div.supporter button,
div.supporter-else button {
  display: inline-block;
  padding: 0;
  margin: 0 3px;
  border: none;
  background: transparent;
  vertical-align: middle;
  color: blanchedalmond;
}

div.supporter button span,
div.supporter-else button span {
  width: 20px;
  height: 20px;
  font-size: 20px;
}

.builddata-selector {
  display: inline-block;
  margin-right: 5px;
  width: calc(100% - 194px);
}

.builddata-selector label {
  width: 100%;
}

.builddata-selector label select,
.builddata-selector label select option {
  width: 100%;
  background: black;
  color: blanchedalmond;
}

.builddata-selector label select option:focus {
  background: linear-gradient(red, red);
  color: blanchedalmond;
}


span.builddata-selector .material-symbols-outlined {
  font-size: 2.4rem;
}

div.character {
  position: relative;
  display: inline-block;
  margin-left: 4px;
  margin-right: 4px;
}

div.character img.character {
  width: 36px;
  height: 36px;
}

div.character img.vision {
  width: 12px;
  height: 12px;
  position: absolute;
  left: 2px;
  top: 2px;
}

div.equipment,
div.with-tooltip {
  display: inline-block;
}

div.equipment img {
  width: 36px;
  height: 36px;
}

.pyro-bg {
  background: rgba(204, 98, 98, 0.7);
}

.hydro-bg {
  background: rgba(80, 138, 204, 0.7);
}

.anemo-bg {
  background: rgba(80, 204, 162, 0.7);
}

.electro-bg {
  background: rgba(204, 110, 204, 0.7);
}

.dendro-bg {
  background: rgba(110, 204, 88, 0.7);
}

.cryo-bg {
  background: rgba(99, 204, 204, 0.7);
}

.geo-bg {
  background: rgba(204, 166, 99, 0.7);
}

button.execute {
  padding-left: 1rem;
  padding-right: 1rem;
}

input[type="number"] {
  text-align: right;
}
</style>
