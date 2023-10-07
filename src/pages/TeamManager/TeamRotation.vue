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
              <div class="with-tooltip" @touchend="rotationActionOnClick(element)">
                <img :class="'action-icon handle' + bgColorClass(element.member)" :src="getActionDetail(element).icon_url"
                  :alt="displayName(getActionDetail(element).名前)" @click="rotationActionOnClick(element)" />
                <span class="tooltip"> {{ displayName(getActionDetail(element).名前) }} </span>
              </div>
              <div class="action-attribute">
                {{ actionAttribute(element) }}
              </div>
              <div class="control">
                <button type="button" @click="removeItemOnClick(element)">×</button>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </fieldset>
    <!-- {{ memberParticles }}
    {{ memberEnergyRecharge }} -->
  </div>
</template>
<script lang="ts">
import draggable from "vuedraggable";
import { computed, defineComponent, onMounted, PropType, reactive, ref, watch } from "vue";
import CompositionFunction from "@/components/CompositionFunction.vue";
import { TMember, TTeam } from "./team";
import { CHARACTER_MASTER, ELEMENT_BG_COLOR_CLASS, ELEMENT_COLOR_CLASS, getCharacterMasterDetail, IMG_SRC_DUMMY, TAnyObject, TCharacterDetail, TCharacterEntry, TCharacterKey } from "@/master";

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
    const normalAttackDanMap = new Map(); // 通常攻撃の段数
    const elementalSkillActionsMap = new Map(); // 元素スキル 一回押し 長押し
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
            normalAttackDanMap.set(member.name, getNormalAttackDan(member.name));
            elementalSkillActionsMap.set(member.name, getElementalSkillActions(member.name));
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

    function getNormalAttackDan(name: string) {
      let dan = 1;
      const master = getCharacterDetail(name);
      if (master) {
        for (const detail of [master.特殊通常攻撃?.詳細, master.通常攻撃?.詳細]) {
          if (!detail) continue;
          detail.forEach((dmgDetail: any) => {
            if (dmgDetail.名前) {
              const ret = dmgDetail.名前.match(/.*(\d)段.+/);
              if (!ret) return;
              const tempDan = Number(ret[1]);
              if (tempDan > dan) {
                dan = tempDan;
              }
            }
          })
          break;
        }
      }
      return dan;
    }

    function getElementalSkillActions(name: string) {
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

    const actionAttribute = (item: TActionItem) => {
      let result = '';
      if (isActionNormalAttack(item.action)) { // 通常攻撃, 重撃, 落下攻撃
        result = item.action;
      } else if (item.action.startsWith('E')) { // 元素スキル
        result = item.action.replace(/^E\./, '');
      } else if (item.action == 'Q') { // 元素爆発
        //const master = getCharacterDetail(item.member);
        //result = 'Q' + master?.元素爆発?.元素エネルギー ?? '';
        result = 'Q';
      }
      return result;
    }

    // 初期粒子数, 継続粒子数, CT, 継続時間
    function getParticleInfo(name: string): [string, number, number, number, number] {
      let result: [string, number, number, number, number] = ['', 0, 0, 0, 0];
      const master = getCharacterDetail(name);
      if (master) {
        result = [(master.元素 as string), 3, 0, 0, 0];
      } else {
        result = ['白', 3, 0, 0, 0];
      }
      return result;
    }

    const memberParticles = computed(() => {
      const result: TAnyObject = {};
      for (let i = 0; i < rotationList.length; i++) {
        const rotation = rotationList[i];
        if (rotation.action.startsWith('E')) {
          const info = getParticleInfo(rotation.member);
          if (info[1]) {
            const nextRotation = (i + 1) < rotationList.length ? rotationList[i + 1] : rotationList[0];
            if (!(nextRotation.member in result)) {
              result[nextRotation.member] = {};
            }
            const color = info[0];
            const currentNum = result[nextRotation.member][color] ?? 0;
            result[nextRotation.member][color] = currentNum + info[1];
          }
        }
      }
      return result;
    })

    const memberEnergyRecharge = computed(() => {
      const result: TAnyObject = {};
      props.team.members.forEach(member => {
        let energy = 0;
        const master = getCharacterDetail(member.name);
        Object.keys(memberParticles.value).forEach(name2 => {
          Object.keys(memberParticles.value[name2]).forEach(color => {
            let work = memberParticles.value[name2][color];
            if (color === '白') {
              work *= 2;
            } else if (color == master?.元素) {
              work *= 3;
            }
            if (member.name != name2) {
              work *= 0.6;
            }
            energy += work;
          })
        })
        result[member.name] = energy;
      })
      return result;
    })

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
          action = elementalSkillActionsMap.get(member.name)[0];
        }
      }
      rotationList.push({
        id: ++actionId,
        member: member.name,
        action: action,
      });
    }

    const rotationActionOnClick = (item: TActionItem) => {
      if (isActionNormalAttack(item.action)) {
        if (item.action.startsWith('N')) { // 通常攻撃
          const work = item.action.substring(1);
          let n = work ? Number(work) : 1;
          const dan = normalAttackDanMap.get(item.member) ?? 1;
          item.action = ++n > dan ? 'C' : 'N' + n;
        } else { // 重撃, 落下攻撃
          let index = NORMAL_ATTACK_ACTION_LIST.indexOf(item.action);
          index = index < (NORMAL_ATTACK_ACTION_LIST.length - 1) ? index + 1 : 0;
          item.action = NORMAL_ATTACK_ACTION_LIST[index];
        }
      } else if (item.action.startsWith('E')) { // 元素スキル
        const actions = elementalSkillActionsMap.get(item.member);
        if (actions.length > 1) {
          let index = actions.indexOf(item.action);
          index = index < (actions.length - 1) ? index + 1 : 0;
          item.action = actions[index];
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
      memberParticles,
      memberEnergyRecharge,

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
  height: 50px;
  object-position: top;
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
  background-color: transparent;
  border-color: silver;
  border-style: none;
}
</style>
