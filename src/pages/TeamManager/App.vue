<template>
  <div class="base-container">
    <div class="header">
      &nbsp; <a href="./">げんかるく</a>
    </div>

    <div class="pane1">
      <fieldset>
        <div class="display-stat-select">
          <label class="display-stat" v-for="item in DISPLAY_STAT_LIST" :key="item[1]">
            <input class="hidden" type="radio" name="display-stat" v-model="displayStat" :value="item[0]" />
            <span>{{ item[1] }}</span>
          </label>
        </div>
        <label class="number-of-teams">
          Number of teams
          <input type="number" :min="NUMBER_OF_TEAMS" :max="999" v-model="numberOfTeams"
            @change="numberOfTeamsOnChange" />
        </label>
        <div class="data-control">
          <button type="button" :disabled="saveDisabled" @click="saveOnClick">
            Save
          </button>
          <button type="button" @click="clearOnClick">Clear</button>
        </div>
      </fieldset>
    </div>

    <div class="pane2">
      <div v-show="!teamEditorVisible">
        <draggable :list="teams" item-key="id" :sort="true" handle=".handle">
          <template #item="{ element }">
            <div style="display: inline-block;" :id="'team-' + element.id">
              <TeamItem :team="element" :selected="teamSelected(element.id)" :displayStat="displayStat"
                @click="teamOnClick(element.id)" @click:edit="editOnClick" @click:jump-to-rotation="jumpToRotation"
                @update:member-result="updateMemberResult" />
            </div>
          </template>
        </draggable>
      </div>
      <div v-show="teamEditorVisible">
        <TeamEditorModal :visible="teamEditorVisible" :team="forcusedTeam" @click:cancel="teamEditorVisible = false"
          @click:ok="updateTeam" />
      </div>
    </div>

    <div class="pane3">
      <hr />
      <div id="team-rotation">
        <TeamRotation v-if="teams[selectedTeamId]" :team="teams[selectedTeamId]" :teamMemberResult="teamMemberResult"
          @update:rotation="updateRotation" @click:jump-to-team="jumpToTeam" />
      </div>
    </div>

    <div class="pane4"></div>

    <div class="footer">
      <hr />
      <h2>チーム編成 Ver.0.6.0</h2>
      <ul class="usage">
        <li>右上の◆のドラッグ＆ドロップでチームの並べ替えができます。</li>
      </ul>
      <dl class="history">
        <dt>0.5.0</dt>
        <dd>
          ローテーションが保存されるようになりました。チームデータの一部として記憶します。
        </dd>
      </dl>
      <p>
        <a href="./">げんかるく - 原神ダメージシミュレーター</a>
        &nbsp;
        <a href="./TeamOptionList.html">強化・弱体効果一覧</a>
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import _ from 'lodash';
import draggable from 'vuedraggable';
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import CompositionFunction from '@/components/CompositionFunction.vue';
import { MEMBER_RESULT_DUMMY, NUMBER_OF_MEMBERS, NUMBER_OF_TEAMS, TActionItem, TMember, TMemberResult, TTeam, TTeamMemberResult, getBuilddataFromStorage } from './team';
import TeamItem from './TeamItem.vue';
import TeamEditorModal from './TeamEditorModal.vue';
import TeamRotation from './TeamRotation.vue';

let memberId = 1;

export default defineComponent({
  name: 'TeamManager',
  components: {
    draggable,
    TeamItem,
    TeamEditorModal,
    TeamRotation,
  },
  setup() {
    const { displayName } = CompositionFunction();
    const teamEditorVisible = ref(false);
    const DISPLAY_STAT_LIST = [
      ['', 'None'],
      ['レベル', 'Lv.'],
      ['HP上限', 'Max HP'],
      ['攻撃力', 'ATK'],
      ['防御力', 'DEF'],
      ['元素熟知', 'EM'],
      ['会心率/ダメージ', 'CRIT'],
      ['元素チャージ効率', 'ER'],
    ];
    const numberOfTeams = ref(NUMBER_OF_TEAMS);
    const teams = reactive([] as TTeam[]);
    const teamMemberResultMap = new Map<number, TTeamMemberResult>();
    const displayStat = ref('');
    const selectedTeamId = ref(0);
    const saveddataStr = ref('');

    onMounted(() => {
      loadOnClick();
    })

    const forcusedTeam = computed(() => teams.filter(s => s.id == selectedTeamId.value)[0]);

    const builddataStr = computed(() => {
      const work: TTeam[] = _.cloneDeep(teams);
      work.forEach((team) => {
        team.members.forEach(member => {
          member.builddata = undefined;
        })
        if (team.rotation && team.rotation.length) {
          team.rotation.forEach(e => {
            e.id = 0;
          })
        }
      });
      return JSON.stringify(work);
    });

    const saveDisabled = computed(() => builddataStr.value == saveddataStr.value);

    const teamSelected = (index: number) => index == selectedTeamId.value;

    function makeBlankMember(index: number): TMember {
      return {
        id: index,
        name: '',
        buildname: undefined,
        builddata: undefined,
        tags: [],
        replacements: [],
      };
    }

    function makeBlankTeam(index: number) {
      const team: TTeam = {
        id: index,
        name: 'チーム' + (index + 1),
        members: [] as TMember[],
        description: '',
        rotation: [],
        rotationDescription: '',
      };
      for (let i = 0; i < NUMBER_OF_MEMBERS; i++) {
        team.members.push(makeBlankMember(memberId++));
      }
      return team;
    }

    function initializeMember(member: TMember) {
      member.name = '';
      member.buildname = undefined;
      member.builddata = undefined;
      member.tags = [];
      member.replacements = [];
    }

    function initializeTeam(team: TTeam) {
      team.name = 'チーム' + (team.id + 1);
      team.members.forEach((member) => {
        initializeMember(member);
      });
    }

    for (let i = 0; i < numberOfTeams.value; i++) {
      teams.push(makeBlankTeam(i));
    }

    const teamOnClick = (index: number) => {
      selectedTeamId.value = index;
    };

    const memberOnClick = (index: number) => {
      if (selectedTeamId.value == index) {
        teamEditorVisible.value = true;
      }
      selectedTeamId.value = index;
    };

    const numberOfTeamsOnChange = () => {
      if (numberOfTeams.value > teams.length) {
        for (let i = teams.length; i < numberOfTeams.value; i++) {
          teams.push(makeBlankTeam(i));
        }
      } else if (numberOfTeams.value < teams.length) {
        if (selectedTeamId.value > numberOfTeams.value) {
          selectedTeamId.value = 0;
        }
        teams.splice(numberOfTeams.value);
      }
    };

    const saveOnClick = () => {
      localStorage.setItem('teams', builddataStr.value);
      saveddataStr.value = builddataStr.value;
    };

    const loadOnClick = () => {
      const storageValue = localStorage.getItem('teams');
      if (storageValue) {
        const work = JSON.parse(storageValue);
        numberOfTeams.value = work.length;
        numberOfTeamsOnChange();
        let actionId = 1;
        for (let i = 0; i < teams.length; i++) {
          const team = teams[i];
          if (work[i]) {
            team.name = work[i].name;
            const members = team.members;
            for (let j = 0; j < members.length; j++) {
              if (work[i].members[j]) {
                members[j].name = work[i].members[j].name;
                if (work[i].members[j].buildname) {
                  members[j].buildname = work[i].members[j].buildname;
                  members[j].builddata = getBuilddataFromStorage(members[j].name, members[j].buildname);
                } else {
                  members[j].buildname = undefined;
                  members[j].builddata = undefined;
                }
                if (work[i].members[j].tags) {
                  members[j].tags = work[i].members[j].tags;
                } else {
                  members[j].tags = [] as string[];
                }
                if (work[i].members[j].replacements) {
                  members[j].replacements = work[i].members[j].replacements;
                } else {
                  members[j].replacements = [] as string[];
                }
              }
            }
            team.description = work[i].description;
            if (work[i].rotation && work[i].rotation.length) {
              team.rotation = work[i].rotation;
              team.rotation.forEach(e => {
                e.id = actionId++;
              })
            } else {
              team.rotation = [];
            }
            team.rotationDescription = work[i].rotationDescription ?? '';
          }
        }
      }
    };

    const clearOnClick = () => {
      teams.forEach((team) => {
        initializeTeam(team);
      });
    };

    const editOnClick = (id: number) => {
      if (id == selectedTeamId.value) {
        teamEditorVisible.value = true;
      } else {
        selectedTeamId.value = id;
      }
    };

    const updateTeam = (newTeam: TTeam) => {
      if (selectedTeamId.value != -1) {
        const team = teams.filter((s) => s.id == selectedTeamId.value)[0];
        if (team) {
          team.name = newTeam.name;
          const workMembers: TMember[] = [];
          for (let i = 0; i < newTeam.members.length; i++) {
            const workMember = makeBlankMember(team.members[i].id);
            workMember.name = newTeam.members[i].name;
            workMember.buildname = newTeam.members[i].buildname;
            workMember.builddata = getBuilddataFromStorage(workMember.name, workMember.buildname);
            workMember.tags.splice(0, workMember.tags.length, ...newTeam.members[i].tags);
            workMember.replacements.splice(0, workMember.replacements.length, ...newTeam.members[i].replacements);
            workMembers.push(workMember);
          }
          team.members.splice(0, team.members.length, ...workMembers);
        }
        team.description = newTeam.description;
        const teamMembers = newTeam.members.map(s => s.name);
        if (newTeam.rotation.filter(s => !teamMembers.includes(s.member)).length) {
          team.rotation = [];
        } else {
          team.rotation = newTeam.rotation;
        }
      }
      teamEditorVisible.value = false;
    };

    const updateRotation = (rotationList: TActionItem[], rotationDescription: string) => {
      if (selectedTeamId.value != -1) {
        const team = teams.filter((s) => s.id == selectedTeamId.value)[0];
        if (team) {
          team.rotation.splice(0, team.rotation.length, ...rotationList);
          team.rotationDescription = rotationDescription;
        }
      }
    }

    const jumpToRotation = () => {
      document.getElementById('team-rotation')?.scrollIntoView({ behavior: 'smooth' });
    }

    const jumpToTeam = () => {
      if (selectedTeamId.value != -1) {
        document.getElementById('team-' + selectedTeamId.value)?.scrollIntoView({ behavior: 'smooth' });
      }
    }

    const resultCount = ref(0);
    const updateMemberResult = (memberResults: { [key: string]: TMemberResult }) => {
      if (selectedTeamId.value != -1) {
        teamMemberResultMap.set(selectedTeamId.value, memberResults);
      }
      resultCount.value++;
    }

    const teamMemberResult = computed(() => {
      let result = {} as TTeamMemberResult;
      if (teamMemberResultMap.has(selectedTeamId.value)) {
        result = teamMemberResultMap.get(selectedTeamId.value) as TTeamMemberResult;
      } else {
        if (selectedTeamId.value != -1) {
          const team = teams.filter(team => team.id == selectedTeamId.value)[0];
          team.members.forEach(member => {
            if (result) {
              result[member.name] = MEMBER_RESULT_DUMMY;
            }
          })
        }
      }
      return result;
    })

    return {
      displayName,

      teamEditorVisible,
      NUMBER_OF_TEAMS,
      NUMBER_OF_MEMBERS,
      numberOfTeams,
      numberOfTeamsOnChange,
      DISPLAY_STAT_LIST,
      displayStat,

      clearOnClick,
      saveOnClick,
      loadOnClick,
      saveDisabled,

      selectedTeamId,
      teamSelected,
      teams,
      teamMemberResult,
      forcusedTeam,

      updateTeam,
      updateRotation,
      teamOnClick,
      editOnClick,
      memberOnClick,
      jumpToRotation,
      jumpToTeam,
      updateMemberResult,
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
  grid-template-columns: auto;
  grid-template-rows: auto auto auto auto auto auto;
  grid-template-areas:
    "header"
    "pane1"
    "pane2"
    "pane3"
    "pane4"
    "footer";
}

div.team {
  width: calc(100% - 4px);
  margin: 3px 2px;
}

.header {
  padding-top: 5px;
  padding-bottom: 5px;
  text-align: left;
}

.footer {
  padding-bottom: 20px;
}
</style>
<style scoped>
input[type="radio"]+span {
  display: inline-block;
  width: 45px;
  font-size: 11px;
  color: black;
  background-color: gray;
  border-radius: 5px;
  padding: 2px 0;
  margin: 2px 1px;
}

input[type="radio"]:checked+span {
  background-color: whitesmoke;
}

label.number-of-teams input[type="number"] {
  padding-left: 1rem;
  width: 6rem;
}

.data-control button {
  width: 11rem;
}

ul.usage {
  text-align: left;
}

dl.history {
  text-align: left;
}
</style>
