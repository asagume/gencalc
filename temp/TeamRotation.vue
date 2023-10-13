<template>
  <div class="team-rotation">
    <fieldset class="icon-list">
      <template v-for="member in team.members" :key="member.id">
        <div class="action with-tooltip" v-if="getNormalAttackDetail(member)">
          <img :class="'action-icon' + bgColorClass(member.name)"
            :src="getNormalAttackDetail(member).icon_url ?? IMG_SRC_DUMMY"
            :alt="displayName(getNormalAttackDetail(member).名前)" @click="listActionOnClick(member, 'N')" />
          <span class="tooltip">
            {{ displayName(member.name) }}
            {{ displayName("通常攻撃") }}
          </span>
        </div>
        <div class="action with-tooltip" v-if="getElementalSkillDetail(member)">
          <img :class="'action-icon' + bgColorClass(member.name)" :src="getElementalSkillDetail(member).icon_url"
            :alt="displayName(getElementalSkillDetail(member).名前)" @click="listActionOnClick(member, 'E')" />
          <span class="tooltip">
            {{ displayName(member.name) }}
            {{ displayName("元素スキル") }}
          </span>
        </div>
        <div class="action with-tooltip" v-if="getElementalBurstDetail(member)">
          <img :class="'action-icon' + bgColorClass(member.name)" :src="getElementalBurstDetail(member).icon_url"
            :alt="displayName(getElementalBurstDetail(member).名前)" @click="listActionOnClick(member, 'Q')" />
          <span class="tooltip">
            {{ displayName(member.name) }}
            {{ displayName("元素爆発") }}
          </span>
        </div>
      </template>
      <table class="control-button">
        <tr>
          <td style="width: 30px;">
            <span class="material-symbols-outlined control-button" @click="$emit('click:jump-to-team')">stat_2</span>
          </td>
          <td>
            <label :class="removeMode ? 'checked' : ''">
              <input type="checkbox" v-model="removeMode">
              <span class="material-symbols-outlined">delete</span>
            </label>
          </td>
          <td style="width: 30px;">
          </td>
        </tr>
      </table>
    </fieldset>
    <fieldset class="rotation-list">
      <draggable :list="rotationList" item-key="id" :sort="true" handle=".handle" @change="rotationListOnChange">
        <template #item="{ element }">
          <div class="rotation-item">
            <img v-if="previousRotation(element)?.member != element.member" class="character-icon"
              :src="getCharacterMaster(element.member).icon_url" :alt="displayName(element.member)" />
            <div :class="'action-item ' + colorClass(element.member)">
              <div class="with-tooltip" @touchend="rotationActionOnClick(element)">
                <img :class="'action-icon handle' + bgColorClass(element.member)" :src="getActionDetail(element).icon_url"
                  :alt="displayName(getActionDetail(element).名前)" @click="rotationActionOnClick(element)" />
                <span class="tooltip"> {{ displayName(getActionDetail(element).名前) }} </span>
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
    <br />
    <div v-if="true">
      <ERCalculator :team="team" :rotationList="rotationList" :teamMemberResult="teamMemberResult" />
    </div>
  </div>
</template>
<script lang="ts">
import draggable from "vuedraggable";
import { defineComponent, onMounted, PropType, reactive, ref, watch } from "vue";
import CompositionFunction from "@/components/CompositionFunction.vue";
import { TActionItem, TMember, TTeam, TTeamMemberResult } from "./team";
import { CHARACTER_MASTER, ELEMENT_BG_COLOR_CLASS, ELEMENT_COLOR_CLASS, getCharacterMasterDetail, IMG_SRC_DUMMY, TCharacterDetail, TCharacterEntry, TCharacterKey } from "@/master";
import _ from "lodash";
import ERCalculator from './ERCalculator.vue';

export default defineComponent({
  name: "TeamRotation",
  components: {
    draggable,
    ERCalculator,
  },
  props: {
    team: { type: Object as PropType<TTeam>, required: true },
    teamMemberResult: { type: Object as PropType<TTeamMemberResult>, required: true },
  },
  emit: ['update:rotation', 'click:jump-to-team'],
  setup(props, context) {
    const { displayName } = CompositionFunction();
    const removeMode = ref(false);
    const NORMAL_ATTACK_ACTION_LIST = ['N', 'C', 'P']; // 通常攻撃, 重撃, 落下攻撃
    const characterDetailMap = new Map();
    const normalAttackDanMap = new Map(); // 通常攻撃の段数
    const elementalSkillActionsMap = new Map<string, string[]>(); // 元素スキル 一回押し 長押し
    const rotationList = reactive([] as TActionItem[]);
    const actionId = ref(0);
    const rotationDescription = ref('');

    // 重撃の前に通常が挟まる武器、キャラクター
    const CHARGED_WITH_NORMAL_WEAPON = ['片手剣', '長柄武器'];
    const CHARGED_WITH_NORMAL_CHARACTER = ['鹿野院平蔵', 'リオセスリ'];

    const CT_KEY = 'クールタイム';
    const E_PRESS_CT_KEY = ['一回押しクールタイム', '基本クールタイム'];
    const E_HOLD_CT_KEY = ['長押しクールタイム', '最大チャージクールタイム', '1段チャージクールタイム', '2段チャージクールタイム'];

    const watchCount = ref(0);
    watch(props, async () => {
      await watchFunc(props.team);
      watchCount.value++;
    });

    async function watchFunc(team: TTeam) {
      if (team) {
        for (const member of team.members) {
          if (member.name) {
            const characterMasterDetail = await getCharacterMasterDetail(
              member.name as TCharacterKey
            );
            characterDetailMap.set(member.name, characterMasterDetail);
            normalAttackDanMap.set(member.name, getNormalAttackDan(member.name));
            elementalSkillActionsMap.set(member.name, getElementalSkillActions(member.name));
          }
        }
        if (team.rotation && team.rotation.length) {
          const workArr = _.cloneDeep(team.rotation);
          workArr.forEach(e => {
            if (e.action.startsWith('E')) {
              const actions = elementalSkillActionsMap.get(e.member);
              if (actions && actions.length > 0 && !actions.includes(e.action)) {
                e.action = actions[0];
              }
            }
          })
          rotationList.splice(0, rotationList.length, ...workArr);
          actionId.value = Math.max(...rotationList.map(s => s.id));
        } else {
          rotationList.splice(0, rotationList.length);
          actionId.value = 0;
        }
        rotationDescription.value = team.rotationDescription;
      }
    }

    onMounted(() => {
      watchFunc(props.team);

    })

    const getCharacterMaster = (character: string): TCharacterEntry => {
      return (CHARACTER_MASTER as any)[character];
    };

    const getCharacterDetail = (character: string): TCharacterDetail | undefined => {
      watchCount.value;
      return characterDetailMap.get(character) ?? undefined;
    };

    function getNormalAttackDan(name: string) {
      let dan = 1;
      const master = getCharacterDetail(name);
      if (master) {
        for (const detail of [master.特殊通常攻撃?.詳細, master.通常攻撃?.詳細]) {
          if (!detail) continue;
          let workDan = 1;
          detail.forEach((dmgDetail: any) => {
            if (dmgDetail.名前) {
              const ret = dmgDetail.名前.match(/.*(\d)段.+/);
              if (!ret) return;
              const tempDan = Number(ret[1]);
              if (tempDan > workDan) {
                workDan = tempDan;
              }
            }
          })
          if (dan < workDan) { // 元素スキル、元素爆発で通常攻撃が変化する場合は、段数の多い方を採用します
            dan = workDan;
          }
        }
      }
      return dan;
    }

    function getElementalSkillActions(name: string) {
      const result = [];
      let hasPressHold = false;
      const master = getCharacterDetail(name);
      if (master?.元素スキル) {
        Object.keys(master.元素スキル).filter(key => key.endsWith(CT_KEY)).forEach(key => {
          if (hasPressHold) return;
          if (E_PRESS_CT_KEY.includes(key) || E_HOLD_CT_KEY.includes(key)) {
            hasPressHold = true;
          } else {
            hasPressHold = !_.isNumber(master.元素スキル[key]);
          }
        })
        if (!hasPressHold) {
          const description = master.元素スキル.説明;
          hasPressHold = description.indexOf('>一回押し<') !== -1 || description.indexOf('>長押し<') !== -1;
        }
      }
      if (hasPressHold) {
        result.push('E.Press');
        result.push('E.Hold');
      } else {
        result.push('E');
      }
      return result;
    }

    const getNormalAttackDetail = (member: TMember) => getCharacterDetail(member.name)?.通常攻撃;
    const getElementalSkillDetail = (member: TMember) => getCharacterDetail(member.name)?.元素スキル;
    const getElementalBurstDetail = (member: TMember) => getCharacterDetail(member.name)?.元素爆発;

    const getActionDetail = (item: TActionItem) => {
      let result;
      const master = getCharacterDetail(item.member);
      if (master) {
        if (NORMAL_ATTACK_ACTION_LIST.includes(item.action) || item.action.startsWith('N')) { // 通常攻撃, 重撃, 落下攻撃
          result = master.通常攻撃;
        } else if (item.action.startsWith('E')) { // 元素スキル
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

    const colorClass = (character: string) => {
      const master = getCharacterMaster(character);
      return master ? ' ' + (ELEMENT_COLOR_CLASS as any)[master.元素] : '';
    }

    const bgColorClass = (character: string) => {
      const master = getCharacterMaster(character);
      return master ? ' ' + (ELEMENT_BG_COLOR_CLASS as any)[master.元素] : '';
    }

    function isActionNormalAttack(action: string) {
      return NORMAL_ATTACK_ACTION_LIST.includes(action) || action.startsWith('N');
    }

    const actionDisplay = (item: TActionItem) =>
      item.action.startsWith('E') ? item.action.replace(/^E\./, '') : item.action;

    const updateRotation = () => {
      context.emit('update:rotation', rotationList, rotationDescription.value);
    }

    const rotationListOnChange = () => {
      updateRotation();
    }

    const listActionOnClick = (member: TMember, actionKey: string) => {
      let action = actionKey;
      if (isActionNormalAttack(action)) {
        const workArr = rotationList.filter(s => s.member == member.name && isActionNormalAttack(s.action));
        if (workArr.length > 0) {
          action = workArr[workArr.length - 1].action;
        }
      } else if (action.startsWith('E')) {
        const workArr = rotationList.filter(s => s.member == member.name && s.action.startsWith('E'));
        if (workArr.length > 0) {
          action = workArr[workArr.length - 1].action;
        } else {
          const actions = elementalSkillActionsMap.get(member.name);
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
        return;
      }
      if (isActionNormalAttack(item.action)) {
        if (item.action.startsWith('N')) { // 通常攻撃
          const master = getCharacterDetail(item.member);
          const work = item.action.substring(1, 2);
          let n = work ? Number(work) : 1;
          const dan = normalAttackDanMap.get(item.member) ?? 1;
          if (master && (CHARGED_WITH_NORMAL_WEAPON.includes(master.武器) || CHARGED_WITH_NORMAL_CHARACTER.includes(item.member))) {
            if (item.action.length < 3) {
              item.action = 'N' + n + 'C';
            } else {
              item.action = ++n > dan ? 'P' : 'N' + n;
            }
          } else {
            item.action = ++n > dan ? 'C' : 'N' + n;
          }
        } else { // 重撃, 落下攻撃
          let index = NORMAL_ATTACK_ACTION_LIST.indexOf(item.action);
          index = index < (NORMAL_ATTACK_ACTION_LIST.length - 1) ? index + 1 : 0;
          item.action = NORMAL_ATTACK_ACTION_LIST[index];
        }
      } else if (item.action.startsWith('E')) { // 元素スキル
        const actions = elementalSkillActionsMap.get(item.member);
        if (actions && actions.length > 1) {
          let index = actions.indexOf(item.action);
          index = index < (actions.length - 1) ? index + 1 : 0;
          item.action = actions[index];
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

      colorClass,
      bgColorClass,

      getCharacterMaster,
      getNormalAttackDetail,
      getElementalSkillDetail,
      getElementalBurstDetail,

      rotationList,
      rotationDescription,
      previousRotation,
      getCharacterDetail,
      getActionDetail,
      actionDisplay,

      rotationListOnChange,
      listActionOnClick,
      rotationActionOnClick,
      removeItemOnClick,
      updateRotation,
    };
  },
});
</script>
<style scoped>
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
  margin-top: 5px;
  margin-bottom: 0px;
  border: none;
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
  text-shadow:
    0px 1px 0px #003366;
}

.tooltip {
  top: -2rem;
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
  width: calc(100% - 30px);
  margin-left: auto;
  margin-right: auto;
  padding: 3px 5px;
}
</style>
