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
    </fieldset>
    <fieldset class="rotation-list">
      <draggable :list="rotationList" item-key="id" :sort="true" handle=".handle">
        <template #item="{ element }">
          <div class="rotation-item">
            <img v-if="previousRotation(element)?.member != element.member" class="character-icon"
              :src="getCharacterMaster(element.member).icon_url" :alt="displayName(element.member)" />
            <div :class="'action-item ' + colorClass(element.member)">
              <div class="with-tooltip">
                <img :class="'action-icon handle' + bgColorClass(element.member)" :src="getActionDetail(element).icon_url"
                  :alt="displayName(getActionDetail(element).名前)" @click="rotationActionOnClick(element)" />
                <span class="tooltip"> {{ displayName(getActionDetail(element).名前) }} </span>
              </div>
              <div class="action-attribute">{{ actionAttribute(element) }}</div>
              <div class="control">
                <button type="button" @click="removeItemOnClick(element)">×</button>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </fieldset>
  </div>
</template>
<script lang="ts">
import draggable from "vuedraggable";
import { defineComponent, onMounted, PropType, reactive, ref, watch } from "vue";
import CompositionFunction from "@/components/CompositionFunction.vue";
import { TMember, TTeam } from "./team";
import { CHARACTER_MASTER, ELEMENT_BG_COLOR_CLASS, ELEMENT_COLOR_CLASS, getCharacterMasterDetail, IMG_SRC_DUMMY, TCharacterDetail, TCharacterEntry, TCharacterKey } from "@/master";

type TActionItem = {
  id: number;
  member: string;
  action: string;
};

let actionId = 0;

export default defineComponent({
  name: "TeamRotation",
  components: {
    draggable,
  },
  props: {
    team: { type: Object as PropType<TTeam>, required: true },
  },
  setup(props) {
    const { displayName } = CompositionFunction();
    const NORMAL_ATTACK_ACTION_LIST = ['N', 'C', 'P']; // 通常攻撃, 重撃, 落下攻撃
    const characterDetailMap = new Map();
    const rotationList = reactive([] as TActionItem[]);

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
          }
        }
        rotationList.splice(0, rotationList.length);
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

    const getNormalAttackDetail = (member: TMember) => {
      const master = getCharacterDetail(member.name);
      return master ? master.通常攻撃 : undefined;
    };

    const getElementalSkillDetail = (member: TMember) => {
      const master = getCharacterDetail(member.name);
      return master ? master.元素スキル : undefined;
    };

    const getElementalBurstDetail = (member: TMember) => {
      const master = getCharacterDetail(member.name);
      return master ? master.元素爆発 : undefined;
    };

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

    function getElementalSkillCode(name: string) {
      const result = [];
      const master = getCharacterDetail(name);
      if (master && master?.元素スキル?.説明) {
        const description = master?.元素スキル?.説明;
        if (description.indexOf('>一回押し<') !== -1 && description.indexOf('>長押し<') !== -1) {
          result.push('E.Press');
          result.push('E.Hold');
        }
        if (result.length == 0) {
          result.push('E');
        }
      }
      return result;
    }

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

    const actionAttribute = (item: TActionItem) => {
      let result = '';
      if (NORMAL_ATTACK_ACTION_LIST.includes(item.action) || item.action.startsWith('N')) { // 通常攻撃, 重撃, 落下攻撃
        result = item.action;
      } else if (item.action.startsWith('E')) { // 元素スキル
        result = item.action.replace(/^E\./, '');
      } else if (item.action == 'Q') { // 元素爆発
        const master = getCharacterDetail(item.member);
        result = 'Q' + master?.元素爆発?.元素エネルギー ?? '';
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

    const listActionOnClick = (member: TMember, actionKey: string) => {
      rotationList.push({
        id: ++actionId,
        member: member.name,
        action: actionKey === 'E' ? getElementalSkillCode(member.name)[0] : actionKey,
      });
    }

    const rotationActionOnClick = (item: TActionItem) => {
      if (NORMAL_ATTACK_ACTION_LIST.includes(item.action) || item.action.startsWith('N')) { // 通常攻撃, 重撃, 落下攻撃
        let index = NORMAL_ATTACK_ACTION_LIST.indexOf(item.action);
        index = index < (NORMAL_ATTACK_ACTION_LIST.length - 1) ? index + 1 : 0;
        item.action = NORMAL_ATTACK_ACTION_LIST[index];
      } else if (item.action.startsWith('E')) { // 元素スキル
        const codeArr = getElementalSkillCode(item.member);
        if (codeArr.length > 1) {
          let index = codeArr.indexOf(item.action);
          index = index < (codeArr.length - 1) ? index + 1 : 0;
          item.action = codeArr[index];
        }
      }
    }

    const removeItemOnClick = (item: TActionItem) => {
      rotationList.splice(0, rotationList.length, ...rotationList.filter(s => s != item));
    }

    return {
      displayName,
      IMG_SRC_DUMMY,

      colorClass,
      bgColorClass,

      getCharacterMaster,

      getNormalAttackDetail,
      getElementalSkillDetail,
      getElementalBurstDetail,

      rotationList,
      previousRotation,
      getCharacterDetail,
      getActionDetail,
      actionAttribute,

      listActionOnClick,
      rotationActionOnClick,
      removeItemOnClick,
    };
  },
});
</script>
<style>
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
  height: 45px;
  object-position: 0 0;
  object-fit: cover;
}

fieldset.rotation-list {
  text-align: left;
  background-color: whitesmoke;
}

div.rotation-item {
  display: inline-block;
  position: relative;
  vertical-align: top;
  font-size: 14px;
  padding-left: 4px;
}

div.action-item {
  display: inline-block;
  text-align: center;
}

div.action-attribute {
  text-align: center;
}

div.control {
  display: block;
  width: 100%;
  text-align: center;
}

div.control button {
  font-size: 12px;
}
</style>
