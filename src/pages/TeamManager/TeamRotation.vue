<template>
  <div class="team-rotation">
    <fieldset class="icon-list">
      <template v-for="member in team.members" :key="member.id">
        <div class="action with-tooltip" v-if="getElementalSkillDetail(member)">
          <img class="action-icon" :src="getElementalSkillDetail(member).icon_url"
            :alt="displayName(getElementalSkillDetail(member).名前)" @click="actionOnClick(member, 'E')" />
          <span class="tooltip">
            {{ displayName(member.name) }}
            {{ displayName("元素スキル") }}
          </span>
        </div>
        <div class="action with-tooltip" v-if="getElementalBurstDetail(member)">
          <img class="action-icon" :src="getElementalBurstDetail(member).icon_url"
            :alt="displayName(getElementalBurstDetail(member).名前)" @click="actionOnClick(member, 'Q')" />
          <span class="tooltip">
            {{ displayName(member.name) }}
            {{ displayName("元素爆発") }}
          </span>
        </div>
      </template>
    </fieldset>
    <fieldset class="rotation-list">
      <draggable :list="rotationList" item-key="id" :sort="true" handle=".handle">
        <template #item="{ element, index }">
          <div v-if="actionDetail(element)" :class="'rotation-item'+colorClass(element.member)">
            <span class="index"> {{ ('00' + (index + 1)).slice(-2) }} </span>
            <img class="character-icon handle" :src="getCharacterMaster(element.member).icon_url"
              :alt="displayName(element.member)" />
            <img :class="'action-icon handle'+bgColorClass(element.member)" :src="actionDetail(element).icon_url"
              :alt="displayName(actionDetail(element).名前)" />
            <span> {{ displayName(actionDetail(element).名前) }} </span>

            <div class="information">
              {{ actionEnergyFluctuation(element) }}
            </div>
            <div class="control">
              <button type="button" @click="removeItemOnClick(element)">×</button>
            </div>
          </div>
        </template>
      </draggable>
    </fieldset>
  </div>
</template>
<script lang="ts">
import draggable from "vuedraggable";
import { defineComponent, PropType, reactive, ref, watch } from "vue";
import CompositionFunction from "@/components/CompositionFunction.vue";
import { TMember, TTeam } from "./team";
import { CHARACTER_MASTER, ELEMENT_BG_COLOR_CLASS, ELEMENT_COLOR_CLASS, getCharacterMasterDetail, TCharacterDetail, TCharacterEntry, TCharacterKey } from "@/master";

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
  setup(props, context) {
    const { displayName } = CompositionFunction();

    const characterDetailMap = new Map();
    const rotationList = reactive([] as TActionItem[]);

    const watchCount = ref(0);
    watch(props, async () => {
      if (props.team) {
        for (const member of props.team.members) {
          if (member.name) {
            const characterMasterDetail = await getCharacterMasterDetail(
              member.name as TCharacterKey
            );
            characterDetailMap.set(member.name, characterMasterDetail);
          }
        }
        rotationList.splice(0, rotationList.length);
        watchCount.value++;
      }
    });

    const getCharacterMaster = (character: string): TCharacterEntry => {
      return (CHARACTER_MASTER as any)[character];
    };

    const getCharacterDetail = (character: string): TCharacterDetail | undefined => {
      watchCount.value;
      return characterDetailMap.get(character) ?? undefined;
    };

    const getElementalSkillDetail = (member: TMember) => {
      const master = getCharacterDetail(member.name);
      return master ? master.元素スキル : undefined;
    };

    const getElementalBurstDetail = (member: TMember) => {
      const master = getCharacterDetail(member.name);
      return master ? master.元素爆発 : undefined;
    };

    const colorClass = (character: string) => {
      const master = getCharacterMaster(character);
      return master ? ' ' + (ELEMENT_COLOR_CLASS as any)[master.元素] : '';
    }

    const bgColorClass = (character: string) => {
      const master = getCharacterMaster(character);
      return master ? ' ' + (ELEMENT_BG_COLOR_CLASS as any)[master.元素] : '';
    }

    const actionOnClick = (member: TMember, actionKey: string) => {
      rotationList.push({
        id: ++actionId,
        member: member.name,
        action: actionKey,
      });
    };

    const actionDetail = (item: TActionItem) => {
      let result = undefined;
      const master = getCharacterDetail(item.member);
      if (master) {
        result = item.action.startsWith('E') ? master.元素スキル : item.action == "Q" ? master.元素爆発 : undefined;
      }
      return result;
    };

    const actionEnergyFluctuation = (item: TActionItem) => {
      let result = '';
      const master = getCharacterDetail(item.member);
      const detail = actionDetail(item);
      if (master && detail) {
        if (detail.名前 == master.元素スキル.名前) {
          result = '';
        } else if (detail.名前 == master.元素爆発.名前) {
          result += detail.元素エネルギー ? '-' + detail.元素エネルギー : '';
        }
      }
      return result;
    }

    const removeItemOnClick = (item: TActionItem) => {
      rotationList.splice(0, rotationList.length, ...rotationList.filter(s => s != item));
    }

    return {
      displayName,

      colorClass,
      bgColorClass,

      getCharacterMaster,

      getElementalSkillDetail,
      getElementalBurstDetail,
      actionOnClick,

      rotationList,
      getCharacterDetail,
      actionDetail,
      actionEnergyFluctuation,

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
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

img.character-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

fieldset.rotation-list {
  text-align: left;
}

div.rotation-item {
  position: relative;
  font-size: 14px;
  padding-left: 4px;
}

div.rotation-item span.index {
  color: orange;
}

div.rotation-item span {
  display: inline-block;
  padding-left: 4px;
  padding-right: 4px;
}

div.particle {
  position: absolute;
  left: 240px;
  top: 0;
}

div.information {
  position: absolute;
  left: 300px;
  top: 5px;
  height: 30px;
}

div.rotation-item div.control {
  position: absolute;
  left: 320px;
  top: 5px;
  height: 30px;
}

div.control button {
  font-size: 12px;
  padding: 1px 5px;
  vertical-align: baseline;
}
</style>
