<template>
  <div :class="'team' + selectedClass">
    <div class="title">
      <label class="name">
        <span class="handle">◆</span>
        <span>{{ team.name }}</span>
        <span v-if="editable && selected" class="button material-symbols-outlined" @click="editOnClick"> edit_square
        </span>
      </label>
      <div class="elemental-resonance">
        <template v-for="index in [0, 1, 2, 3]" :key="index">
          <img v-if="resonanceElementImgSrcs[index]" class="elemental-resonance" :src="resonanceElementImgSrcs[index]"
            alt="resonance" />
        </template>
      </div>
    </div>
    <div class="members">
      <table>
        <tr>
          <td v-for="member in team.members" :key="member.id">
            <MemberItem :member="member" :statsObj="memberStats[member.id]" :displayStat="displayStat"
              :showEquipment="showEquipment" :viewable="true" :members="team.members.map(s => s.name)"
              :elementalResonance="elementalResonance" />
          </td>
        </tr>
      </table>
    </div>
    <table class="res" v-if="displayRes">
      <tr>
        <td v-for="key in resKey" :key="key" :class="resBgClass(key)">{{ res[key] }}</td>
      </tr>
    </table>
    <div style="text-align: left;">
      <span class="material-symbols-outlined control-button" @click="jumpToRotation">stat_minus_2</span>
      <div class="description">
        {{ description }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import _ from 'lodash';
import { computed, defineComponent, onMounted, PropType, reactive, ref, watch } from "vue";
import { calculateFormulaArray } from "@/calculate";
import { TStats } from "@/input";
import { CHARACTER_MASTER, ELEMENT_IMG_SRC, TAnyObject, TCharacterKey, ELEMENT_BG_COLOR_CLASS } from "@/master";
import CompositionFunction from "@/components/CompositionFunction.vue";
import { calculateMemberResult, getElementalResonance, TConstellation, TTeam, TTeamMemberResult } from "./team";
import MemberItem from "./MemberItem.vue";

export default defineComponent({
  name: 'TeamItem',
  props: {
    team: { type: Object as PropType<TTeam>, required: true },
    selected: { type: Boolean, requied: true },
    editable: { type: Boolean },
    showEquipment: { type: Boolean },
    displayStat: { type: String },
    displayRes: { type: Boolean },
    constellations: { type: Object as PropType<TConstellation> },
  },
  emits: ['click:edit', 'click:jump-to-rotation', 'update:member-result'],
  components: {
    MemberItem,
  },
  setup(props, context) {
    const { displayName } = CompositionFunction();

    const memberStats = reactive({} as TAnyObject);
    const memberResults = reactive({} as TTeamMemberResult);
    const res = reactive({} as TAnyObject);
    const resKey = ['炎', '水', '風', '雷', '草', '氷', '岩', '物理'];
    function initializeRes() {
      resKey.forEach(key => {
        res[key] = 0;
      });
    }
    initializeRes();

    const watchCount = ref(0);
    watch(props, async (newVal) => {
      watchFunc(newVal.team);
      watchCount.value++;
    });

    onMounted(() => {
      watchFunc(props.team);
    })

    const elementalResonance = computed(() => getElementalResonance(props.team));
    const resonanceElementImgSrcs = computed(() => {
      const result: string[] = [];
      elementalResonance.value.forEach((entry) => {
        if (entry == "元素共鳴なし") {
          const members = props.team.members.filter((s) => s.name);
          if (members.length == 4) {
            members.forEach((member) => {
              const master = CHARACTER_MASTER[member.name as TCharacterKey];
              const src = (ELEMENT_IMG_SRC as any)[master.元素];
              result.push(src);
            });
          }
        } else {
          const src = (ELEMENT_IMG_SRC as any)[entry.replace("元素共鳴", "")];
          result.push(src);
          result.push(src);
        }
      });
      return result;
    })
    const description = computed(() => props.team.description ?? '')
    const selectedClass = computed(() => (props.selected ? ' selected' : ''));

    async function watchFunc(team: TTeam) {
      const list = [];
      for (const member of team.members) {
        list.push({
          key: member.id,
          value: await calculateMemberResult(member, team),
        });
      }
      await Promise.all(list).then(results => {
        results.forEach(entry => {
          memberStats[entry.key] = entry.value?.statsInput?.statsObj;
          memberResults[entry.key] = entry.value;
        });
      });
      calculateStat();
      calculateRes();
      context.emit('update:member-result', team.id, memberResults);
    }

    function calculateStat() {
      const teamAdjustments: { [key: string]: TStats } = {};
      Object.keys(memberStats).forEach(key => {
        teamAdjustments[key] = {};
      })
      Object.keys(memberStats).forEach(key => {
        const memberResult = memberResults[key];
        const characterMaster = memberResult?.characterInput?.characterMaster;
        const weaponMaster = memberResult?.characterInput?.weaponMaster;
        if (characterMaster && characterMaster.チームバフ) {
          for (const damageDetail of characterMaster.チームバフ) {
            if (damageDetail.条件) continue;
            const value = calculateFormulaArray(damageDetail.数値, memberResult.statsInput.statsObj, memberResult.damageResult, damageDetail.最大値, damageDetail.最小値);
            const toStat = damageDetail.種類.replace(/V[1-3]$/, '');
            Object.keys(memberResults).forEach(key2 => {
              if (key2 != key) { // チームバフは本人対象外とします
                if (toStat in teamAdjustments) {
                  teamAdjustments[key2][toStat] += value;
                } else {
                  teamAdjustments[key2][toStat] = value;
                }
              }
            })
          }
        }
        if (weaponMaster && weaponMaster.チームバフ) {
          for (const damageDetail of weaponMaster.チームバフ) {
            if (damageDetail.条件) continue;
            const value = calculateFormulaArray(damageDetail.数値, memberResult.statsInput.statsObj, memberResult.damageResult, damageDetail.最大値, damageDetail.最小値);
            const toStat = damageDetail.種類.replace(/V[1-3]$/, '');
            Object.keys(memberResults).forEach(key2 => {
              if (key2 != key) { // チームバフは本人対象外とします
                if (toStat in teamAdjustments) {
                  teamAdjustments[key2][toStat] += value;
                } else {
                  teamAdjustments[key2][toStat] = value;
                }
              }
            })
          }
        }
      })
      for (const key of Object.keys(memberStats)) {
        if (key in teamAdjustments) {
          for (const stat of Object.keys(teamAdjustments[key])) {
            if (!memberStats[key]) continue;
            if (stat in memberStats[key]) {
              memberStats[key][stat] += teamAdjustments[key][stat];
            } else {
              memberStats[key][stat] = teamAdjustments[key][stat];
            }
          }
        }
      }
    }

    // 元素耐性
    function calculateRes() {
      initializeRes();
      const dmgElements: string[] = [];
      const artifactSet4s: string[] = [];
      Object.keys(memberResults).forEach(key => {
        const memberResult = memberResults[key];
        const characterMaster = memberResult?.characterInput?.characterMaster;
        const artifactSetMasters = memberResult?.characterInput?.artifactSetMasters;
        if (characterMaster) {
          if (characterMaster) {
            dmgElements.push(characterMaster.元素);
          }
          if (characterMaster.元素スキル?.詳細) {
            for (const damageDetail of characterMaster.元素スキル?.詳細) {
              if (damageDetail.種類 && damageDetail.種類.startsWith('敵') && damageDetail.種類.endsWith('耐性') && damageDetail.数値) {
                const element = damageDetail.種類.replace(/^敵/, '').replace(/元素耐性$/, '').replace(/耐性$/, '');
                let value = 0;
                if (_.isNumber(damageDetail.数値)) {
                  value = damageDetail.数値;
                } else if (_.isPlainObject(damageDetail.数値)) {
                  const level = memberResult.characterInput?.元素スキルレベル;
                  if (level && level in damageDetail.数値) {
                    value = damageDetail.数値[level];
                  }
                }
                if (element === '全') {
                  resKey.filter(s => s !== '物理').forEach(key => {
                    res[key] -= value;
                  })
                } else {
                  res[element] -= value;
                }
              }
            }
          }
          if (characterMaster.元素爆発?.詳細) {
            for (const damageDetail of characterMaster.元素爆発?.詳細) {
              if (damageDetail.種類 && damageDetail.種類.startsWith('敵') && damageDetail.種類.endsWith('耐性') && damageDetail.数値) {
                const element = damageDetail.種類.replace(/^敵/, '').replace(/元素耐性$/, '').replace(/耐性$/, '');
                let value = 0;
                if (_.isNumber(damageDetail.数値)) {
                  value = damageDetail.数値;
                } else if (_.isPlainObject(damageDetail.数値)) {
                  const level = memberResult.characterInput?.元素爆発レベル;
                  if (level && level in damageDetail.数値) {
                    value = damageDetail.数値[level];
                  }
                }
                if (element === '全') {
                  resKey.filter(s => s !== '物理').forEach(key => {
                    res[key] -= value;
                  })
                } else {
                  res[element] -= value;
                }
              }
            }
          }
          if (characterMaster.固有天賦) {
            for (const damageDetail of characterMaster.固有天賦) {
              if (damageDetail.種類 && damageDetail.種類.startsWith('敵') && damageDetail.種類.endsWith('耐性') && damageDetail.数値) {
                const element = damageDetail.種類.replace(/^敵/, '').replace(/元素耐性$/, '').replace(/耐性$/, '');
                let value = 0;
                if (_.isNumber(damageDetail.数値)) {
                  value = damageDetail.数値;
                }
                if (element === '全') {
                  resKey.filter(s => s !== '物理').forEach(key => {
                    res[key] -= value;
                  })
                } else {
                  res[element] -= value;
                }
              }
            }
          }
          const constellation = memberResult.characterInput?.命ノ星座 ?? (props.constellations ? props.constellations[characterMaster.名前] ?? 0 : 0);
          if (characterMaster.命ノ星座) {
            for (let i = 1; i <= constellation; i++) {
              const constellationObj = characterMaster.命ノ星座[String(i)];
              if (constellationObj.詳細) {
                for (const damageDetail of constellationObj.詳細) {
                  if (damageDetail.種類 && damageDetail.種類.startsWith('敵') && damageDetail.種類.endsWith('耐性') && damageDetail.数値) {
                    const element = damageDetail.種類.replace(/^敵/, '').replace(/元素耐性$/, '').replace(/耐性$/, '');
                    if (_.isNumber(damageDetail.数値)) {
                      if (element === '全') {
                        resKey.filter(s => s !== '物理').forEach(key => {
                          res[key] -= damageDetail.数値;
                        })
                      } else {
                        res[element] -= damageDetail.数値;
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (artifactSetMasters && artifactSetMasters.length == 2) {
          if (artifactSetMasters[0].key == artifactSetMasters[1].key) {
            if (!artifactSet4s.includes(artifactSetMasters[0].key)) {
              artifactSet4s.push(artifactSetMasters[0].key);
              if (artifactSetMasters[0]['4セット効果']?.詳細) {
                artifactSetMasters[0]['4セット効果']?.詳細.forEach(damageDetail => {
                  if (damageDetail.種類.startsWith('敵') && damageDetail.種類.endsWith('耐性') && damageDetail.数値) {
                    const element = damageDetail.種類.replace(/^敵/, '').replace(/元素耐性$/, '').replace(/耐性$/, '');
                    res[element] -= Number(damageDetail.数値);
                  }
                })
              }
            }
          }
        }
      })
      if (dmgElements.filter(s => s === '岩').length >= 2) { // 岩元素共鳴
        res['岩'] -= -20;
      }
      if (dmgElements.includes('雷') && dmgElements.includes('氷')) { // 超電導
        res['物理'] -= -40;
      }
      resKey.forEach(key => {
        if (key !== '物理' && !dmgElements.includes(key)) {
          res[key] = 0;
        }
      })
    }

    const resBgClass = (key: string) => {
      if (res[key] !== 0) {
        return key in ELEMENT_BG_COLOR_CLASS ? (ELEMENT_BG_COLOR_CLASS as any)[key] : 'physical';
      } else {
        return '';
      }
    }

    const editOnClick = () => {
      context.emit('click:edit', props.team.id);
    }

    const jumpToRotation = () => {
      context.emit('click:jump-to-rotation');
    }

    return {
      displayName,

      selectedClass,
      memberStats,
      elementalResonance,
      resonanceElementImgSrcs,
      description,
      res,
      resKey,
      resBgClass,

      editOnClick,
      jumpToRotation,
    };
  },
});
</script>
<style>
div.team {
  display: inline-block;
  max-width: 322px;
  padding: 4px 4px 0 4px;
  border: 4px double silver;
  border-radius: 10px;
  margin-bottom: 10px;
}

div.title {
  position: relative;
  text-align: left;
  height: 4.5rem;
}

.handle {
  color: darkorange;
}

div.team.selected {
  border-color: gold;
}

label.name {
  font-size: 2.6rem;
}

label.name span {
  margin-left: 0.5rem;
}

label.name span.button {
  display: inline-block;
  position: absolute;
  left: 217px;
  top: 0;
  font-size: 3rem;
}

label.name span.button {
  display: inline-block;
  position: absolute;
  right: 0px;
  top: 1px;
}

label.name input {
  width: 180px;
  padding-top: 0;
  padding-bottom: 0;
}

div.elemental-resonance {
  position: absolute;
  right: 0;
  top: 0;
}

img.elemental-resonance {
  width: 20px;
}

.members table {
  width: 100%;
  table-layout: fixed;
  border-spacing: 0;
  text-align: center;
}

div.description {
  display: inline-block;
  margin-top: 3px;
  font-size: 2rem;
  height: 2.4rem;
  text-align: center;
  vertical-align: top;
  white-space: nowrap;
  overflow: hidden;
}

span.control-button {
  display: inline-block;
  margin-left: 4px;
  margin-right: 4px;
  vertical-align: baseline;
  color: orange;
  font-size: 3rem;
  padding-bottom: 0;
}

table.res {
  width: 100%;
  table-layout: fixed;
  color: black;
  font-size: 2rem;
}

.physical {
  background-color: silver;
}
</style>
