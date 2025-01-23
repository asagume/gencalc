<template>
  <div class="rotation-box" v-if="watchCount">
    <div class="pane1">
      <fieldset class="icon-list">
        <template v-for="member in team.members " :key="member.id">
          <span v-if="member.name">
            <div class="action with-tooltip">
              <img :class="'action-icon' + bgColorClass(member.name)" :src="normalAttackIconSrc(member.name)"
                :alt="displayName(member.name) + ' ' + displayName('通常攻撃')" @click="listActionOnClick(member, 'N')" />
              <span class="tooltip">
                {{ displayName(member.name) + ' ' + displayName('通常攻撃') }}
              </span>
            </div>
            <div class="action with-tooltip">
              <img :class="'action-icon' + bgColorClass(member.name)" :src="elementalSkillIconSrc(member.name)"
                :alt="displayName(member.name) + ' ' + displayName('元素スキル')" @click="listActionOnClick(member, 'E')" />
              <span class="tooltip">
                {{ displayName(member.name) + ' ' + displayName("元素スキル") }}
              </span>
            </div>
            <div class="action with-tooltip">
              <img :class="'action-icon' + bgColorClass(member.name)" :src="elementalBurstIconSrc(member.name)"
                :alt="displayName(member.name) + ' ' + displayName('元素爆発')" @click="listActionOnClick(member, 'Q')" />
              <span class="tooltip">
                {{ displayName(member.name) + ' ' + displayName('元素爆発') }}
              </span>
            </div>
          </span>
        </template>
        <table class="control-button">
          <tbody>
            <tr>
              <td>
                <span class="material-symbols-outlined control-button"
                  @click="$emit('click:jump-to-team')">stat_2</span>
              </td>
              <td>
                <label :class="removeMode ? 'checked' : ''">
                  <input type="checkbox" v-model="removeMode">
                  <span class="material-symbols-outlined">delete</span>
                </label>
              </td>
              <td>
                <div v-if="selectedAction">
                  <img :class="'action-icon handle' + bgColorClass(selectedAction.member)"
                    :src="getActionDetail(selectedAction).icon_url"
                    :alt="displayName(getActionDetail(selectedAction).名前)"
                    @click="selectedActionOnClick(selectedAction)" />
                </div>
                <div class="action-attribute" v-if="selectedAction">
                  {{ actionDisplay(selectedAction) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </fieldset>
      <fieldset class="rotation-list">
        <draggable :list="rotationList" item-key="id" :sort="true" handle=".handle" :delay="100" :animation="200"
          @change="rotationListOnChange">
          <template #item="{ element }">
            <div class="rotation-item">
              <img v-if="previousRotation(element)?.member != element.member" class="character-icon"
                :src="getCharacterMaster(element.member)?.icon_url ?? IMG_SRC_DUMMY"
                :alt="displayName(element.member)" />
              <div v-if="getActionDetail(element)" :class="'action-item ' + colorClass(element.member)">
                <div class="with-tooltip handle">
                  <img :class="'action-icon' + bgColorClass(element.member) + selectedActionClass(element)"
                    :src="getActionDetail(element).icon_url" :alt="displayName(getActionDetail(element).名前)"
                    @click="rotationActionOnClick(element)" />
                  <div v-if="removeMode" class="remove-mark" @click="removeItemOnClick(element)"></div>
                </div>
                <div class="action-attribute">
                  {{ actionDisplay(element) }}
                </div>
              </div>
            </div>
          </template>
        </draggable>
        <br />
        <textarea class="rotation-description" v-model="rotationDescription" rows="10" maxlength="400"
          @change="updateRotation"></textarea>
      </fieldset>
      <br /> <br />
      <br /> <br />
      <table class="guide">
        <tbody>
          <tr>
            <th>N</th>
            <td>通常攻撃1段</td>
            <th>N2</th>
            <td>通常攻撃2段</td>
            <th>NX</th>
            <td>通常攻撃X段</td>
          </tr>
          <tr>
            <th>N1C</th>
            <td>通常攻撃1段+重撃</td>
            <th>N2C</th>
            <td>通常攻撃2段+重撃</td>
            <th>NXC</th>
            <td>通常攻撃X段+重撃</td>
          </tr>
          <tr>
            <th>C</th>
            <td>重撃</td>
            <td colspan="4"></td>
          </tr>
          <tr>
            <th>P</th>
            <td>落下攻撃</td>
            <td colspan="4"></td>
          </tr>
          <tr>
            <th>E</th>
            <td>元素スキル</td>
            <th>E.Press</th>
            <td>元素スキル(一回押し)</td>
            <th>E.Hold</th>
            <td>元素スキル(長押し)</td>
          </tr>
          <tr>
            <th>Q</th>
            <td>元素爆発</td>
            <td colspan="4"></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pane2" v-if="true">
      <ERCalculator :team="team" :rotationList="rotationList" :teamMemberResult="teamMemberResult"
        :constellations="constellations" />
    </div>
  </div>
</template>
<script lang="ts">
import _ from "lodash";
import draggable from "vuedraggable";
import { computed, defineComponent, onMounted, PropType, reactive, ref, watch } from "vue";
import { ELEMENT_BG_COLOR_CLASS, ELEMENT_COLOR_CLASS, IMG_SRC_DUMMY } from "@/master";
import { getElementalSkillActions } from "@/particlemaster";
import CompositionFunction from "@/components/CompositionFunction.vue";
import { CHARGED_ONLY_CHARACTER, CHARGED_WITH_NORMAL_CHARACTER, CHARGED_WITH_NORMAL_WEAPON, getCharacterDetail, getCharacterMaster, getNormalAttackDan, setupCharacterDetailMap, TActionItem, TConstellation, TMember, TTeam, TTeamMemberResult } from "./team";
import ERCalculator from './ERCalculator.vue';

export default defineComponent({
  name: "TeamRotation",
  components: {
    draggable,
    ERCalculator,
  },
  props: {
    team: { type: Object as PropType<TTeam>, required: true },
    teamMemberResult: { type: Object as PropType<TTeamMemberResult> },
    constellations: { type: Object as PropType<TConstellation> },
  },
  emit: ['update:rotation', 'click:jump-to-team'],
  setup(props, context) {
    const { displayName } = CompositionFunction();
    const removeMode = ref(false);
    const normalAttackActions = reactive({} as { [key: string]: string[] }); // 通常攻撃/重撃/落下攻撃
    const elementalSkillActions = reactive({} as { [key: string]: string[] }); // 元素スキル
    const rotationList = reactive([] as TActionItem[]);
    const actionId = ref(0);
    const rotationDescription = ref('');
    const selectedActionId = ref(-1);

    const watchCount = ref(0);
    watch(props, async () => {
      await initializeTeam(props.team);
    });

    const initializeTeam = async (team: TTeam) => {
      await setupCharacterDetailMap();
      for (const member of team.members) {
        if (member.name) {
          const characterMaster = getCharacterMaster(member.name);
          if (characterMaster) {
            const isCWith = (CHARGED_WITH_NORMAL_WEAPON.includes(characterMaster?.武器) || CHARGED_WITH_NORMAL_CHARACTER.includes(member.name)) && !CHARGED_ONLY_CHARACTER.includes(member.name);
            const workArr: string[] = [];
            for (let i = 0; i < getNormalAttackDan(member.name); i++) {
              const work = 'N' + (i > 0 ? String(i + 1) : '');
              workArr.push(work);
              if (isCWith) {
                workArr.push(work + (work === 'N' ? '1C' : 'C'));
              }
            }
            if (!isCWith) {
              workArr.push('C');
            }
            workArr.push('P');
            normalAttackActions[member.name] = workArr;
          }
          elementalSkillActions[member.name] = getElementalSkillActions(member.name);
        }
      }
      const isSameMember = team.rotation.filter(rotation => !team.members.filter(member => member.name).map(member => member.name).includes(rotation.member)).length == 0;
      if (isSameMember) {
        if (team.rotation.length) {
          const workArr = _.cloneDeep(team.rotation);
          workArr.forEach(rotation => {
            if (rotation.action === 'NC') {
              rotation.action = 'N1C';
            } else if (rotation.action.startsWith('E')) {
              const actions = elementalSkillActions[rotation.member];
              if (actions && actions.length > 0 && !actions.includes(rotation.action)) {
                rotation.action = actions[0];
              }
            }
          })
          rotationList.splice(0, rotationList.length, ...workArr);
          actionId.value = Math.max(...rotationList.map(s => s.id)) ?? rotationList.length;
        } else {
          rotationList.splice(0, rotationList.length);
          actionId.value = 0;
        }
      } else {
        rotationList.splice(0, rotationList.length);
        actionId.value = 0;
        updateRotation();
      }
      rotationDescription.value = team.rotationDescription;
      watchCount.value++;
    } 

    onMounted(() => {
      initializeTeam(props.team);
      props.team.members.forEach(member => {
        normalAttackIconSrc(member.name);
      })
    })

    const selectedAction = computed((): TActionItem | undefined => {
      const actionArr = rotationList.filter(rotation => rotation.id == selectedActionId.value);
      return actionArr.length > 0 ? actionArr[0] : undefined;
    })

    const getActionDetail = (item: TActionItem) => {
      let result;
      const master = getCharacterDetail(item.member);
      if (master) {
        if (normalAttackActions[item.member].includes(item.action)) { // 通常攻撃, 重撃, 落下攻撃
          result = master.通常攻撃;
        } else if (elementalSkillActions[item.member].includes(item.action)) { // 元素スキル
          result = master.元素スキル;
        } else if (item.action == 'Q') { // 元素爆発
          result = master.元素爆発;
        }
      }
      return result;
    };

    const previousRotation = (item: TActionItem) => {
      let result;
      for (const rotation of rotationList) {
        if (item.id == rotation.id) {
          break;
        }
        result = rotation;
      }
      return result;
    }

    const normalAttackIconSrc = (character: string) => getCharacterDetail(character)?.通常攻撃.icon_url ?? IMG_SRC_DUMMY;
    const elementalSkillIconSrc = (character: string) => getCharacterDetail(character)?.元素スキル.icon_url ?? IMG_SRC_DUMMY;
    const elementalBurstIconSrc = (character: string) => getCharacterDetail(character)?.元素爆発.icon_url ?? IMG_SRC_DUMMY;
    const colorClass = (character: string) => {
      const master = getCharacterMaster(character);
      return master ? ' ' + (ELEMENT_COLOR_CLASS as any)[master.元素] : '';
    }
    const bgColorClass = (character: string) => {
      const master = getCharacterMaster(character);
      return master ? ' ' + (ELEMENT_BG_COLOR_CLASS as any)[master.元素] : '';
    }

    const actionDisplay = (item: TActionItem) =>
      item.action.startsWith('E') ? item.action.replace(/^E\./, '') : item.action;

    const selectedActionClass = (item: TActionItem) =>
      selectedActionId.value == item.id ? ' selected' : '';

    const updateRotation = () => {
      context.emit('update:rotation', rotationList, rotationDescription.value);
    }

    const rotationListOnChange = () => {
      updateRotation();
    }

    const listActionOnClick = (member: TMember, actionKey: string) => {
      if (!normalAttackActions[member.name] || !elementalSkillActions[member.name]) {
        return;
      }
      let action = actionKey;
      if (normalAttackActions[member.name].includes(action)) {
        const workArr = rotationList.filter(s => s.member == member.name && normalAttackActions[member.name].includes(s.action));
        if (workArr.length > 0) {
          action = workArr[workArr.length - 1].action;
        }
      } else if (action.startsWith('E')) {
        const workArr = rotationList.filter(s => s.member == member.name && elementalSkillActions[member.name].includes(s.action));
        if (workArr.length > 0) {
          action = workArr[workArr.length - 1].action;
        } else {
          const actions = elementalSkillActions[member.name];
          if (actions && actions.length > 0) {
            action = actions[0];
          }
        }
      }
      rotationList.push({
        id: ++actionId.value,
        member: member.name,
        action: action,
      });
      updateRotation();
    }

    const rotationActionOnClick = (item: TActionItem) => {
      if (removeMode.value) {
        removeItemOnClick(item);
      } else if (selectedActionId.value == item.id) {
        selectedActionId.value = -1;
      } else if (normalAttackActions[item.member].includes(item.action)) {
        selectedActionId.value = item.id;
      } else if (item.action.startsWith('E') && elementalSkillActions[item.member].length > 1) {
        selectedActionId.value = item.id;
      } else {
        selectedActionId.value = -1;
      }
    }

    const selectedActionOnClick = (item: TActionItem | undefined) => {
      if (item) {
        for (const actionArr of [normalAttackActions[item.member], elementalSkillActions[item.member]]) {
          if (actionArr?.length) {
            const index = actionArr.indexOf(item.action);
            if (index != -1) {
              item.action = (index + 1) < actionArr.length ? actionArr[index + 1] : actionArr[0];
              break;
            }
          }
        }
      }
      updateRotation();
    }

    const removeItemOnClick = (item: TActionItem) => {
      rotationList.splice(0, rotationList.length, ...rotationList.filter(s => s != item));
      updateRotation();
    }

    return {
      displayName,
      IMG_SRC_DUMMY,
      removeMode,

      watchCount,
      normalAttackIconSrc,
      elementalSkillIconSrc,
      elementalBurstIconSrc,
      colorClass,
      bgColorClass,

      getCharacterMaster,

      rotationList,
      rotationDescription,
      previousRotation,
      getCharacterDetail,
      getActionDetail,
      actionDisplay,
      selectedAction,
      selectedActionClass,

      rotationListOnChange,
      listActionOnClick,
      rotationActionOnClick,
      removeItemOnClick,
      selectedActionOnClick,
      updateRotation,

      initializeTeam,
    };
  },
});
</script>
<style scoped>
@media all and (min-width: 720px) {
  .rotation-box {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    grid-template-areas: "pane1 pane2";
  }
}

@media all and (max-width: 719px) {
  .rotation-box {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: auto auto;
    grid-template-areas:
      "pane1"
      "pane2";
  }
}

.pane1 {
  grid-area: pane1;
}

.pane2 {
  grid-area: pane2;
}

fieldset.icon-list {
  padding-bottom: 0px;
}

div.action {
  display: inline-block;
}

img.action-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
}

img.character-icon {
  vertical-align: top;
  width: 65px;
  height: 50px;
  object-position: top;
  object-fit: cover;
}

fieldset.rotation-list {
  text-align: left;
  background-color: whitesmoke;
}

table.control-button {
  table-layout: fixed;
  width: 100%;
  margin-top: 0;
  margin-bottom: 0;
  border: none;
}

table.control-button td {
  height: 62px;
  vertical-align: bottom;
}

table.control-button td:first-child,
table.control-button td:last-child {
  width: 45px;
}

table.control-button button {
  font-size: 12px;
  background-color: transparent;
  border-color: silver;
  border-style: none;
}

span.control-button {
  color: orange;
  font-size: 3rem;
}

table.control-button input[type="checkbox"] {
  display: none;
}

.control-button label.checked {
  color: orange;
}

div.rotation-item {
  display: inline-block;
  position: relative;
  vertical-align: top;
  font-size: 14px;
  padding-left: 4px;
  padding-bottom: 4px;
}

div.action-item {
  display: inline-block;
  text-align: center;
}

div.action-attribute {
  text-align: center;
  text-shadow: 0px 1px 0px #003366;
  font-size: 14px;
}

.selected {
  opacity: 0.5;
  border-radius: 5px;
}

.tooltip {
  top: -3rem;
}

div.remove-mark {
  display: block;
  position: absolute;
  top: 50%;
  left: calc(50% - 15px);
}

.remove-mark::before,
.remove-mark::after {
  content: '';
  width: 30px;
  height: 3px;
  background: black;
  position: absolute;
  transform: translateY(-50%) rotate(45deg);
}

.remove-mark::after {
  transform: translateY(-50%) rotate(135deg);
}

textarea.rotation-description {
  display: block;
  width: calc(100% - 20px);
  margin-left: auto;
  margin-right: auto;
  padding: 3px 5px;
}

table.guide {
  width: calc(100% - 15px);
  margin-left: auto;
  margin-right: auto;
  text-align: left;
  table-layout: fixed;
  border-spacing: 0;
  border-radius: 10px;
  border: 1px solid silver;
  padding: 4px 4px 2px 4px;
}

.guide th {
  width: 9rem;
}

.guide th,
.guide td {
  border-bottom: 1px solid silver;
  border-right: 1px solid silver;
  vertical-align: top;
  padding-left: 3px;
}

.guide tr:last-child th,
.guide tr:last-child td {
  border-bottom: none;
}

.guide td:last-child {
  border-right: none;
}
</style>
