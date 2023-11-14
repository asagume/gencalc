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
          <button type="button" :disabled="saveDisabled" @click="saveOnClick"> Save </button>
          <button type="button" @click="loadOnClick"> Load </button>
          <button type="button" @click="clearOnClick"> Clear </button>
        </div>
      </fieldset>
    </div>

    <div class="pane2" id="team-list-and-editor">
      <div v-show="!teamEditorVisible">
        <draggable :list="teams" item-key="id" :sort="true" handle=".handle">
          <template #item="{ element }">
            <div style="display: inline-block;" :id="'team-' + element.id">
              <TeamItem :team="element" :selected="teamSelected(element.id)" :display-stat="displayStat"
                :display-res="displayRes" :constellations="constellations" :editable="true" :show-equipment="true"
                @click="teamOnClick(element.id)" @click:edit="editOnClick" @click:jump-to-rotation="jumpToRotation"
                @update:member-result="updateMemberResult" />
            </div>
          </template>
        </draggable>
      </div>
      <div v-show="teamEditorVisible">
        <TeamEditorModal :visible="teamEditorVisible" :team="forcusedTeam" @click:cancel="teamEditorOnClickCancel"
          @click:ok="teamEditorOnClickOk" />
      </div>
    </div>

    <div class="pane3">
      <hr />
      <h3>ROTATION</h3>
      <div id="team-rotation">
        <TeamRotation v-if="forcusedTeam" :team="forcusedTeam" :team-member-result="teamMemberResult"
          :constellations="constellations" @update:rotation="updateRotation" @click:jump-to-team="jumpToTeam" />
      </div>
    </div>

    <div class="pane4"></div>

    <div class="footer">
      <hr />
      <h2>チーム編成 Ver.1.0.0</h2>
      <ul class="usage">
        <li>右上の◆のドラッグ＆ドロップでチームの並べ替えができます。</li>
      </ul>
      <dl class="history">
        <dt>1.0.0</dt>
        <dd>
          元素チャージ効率計算機能が（ひとまず）完成しました。
        </dd>
        <dt>0.5.0</dt>
        <dd>
          ローテーションが保存されるようになりました。チームデータの一部として記憶します。
        </dd>
      </dl>
      <p><a href="./TeamExample.html">EXAMPLE</a></p>
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
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import CompositionFunction from '@/components/CompositionFunction.vue';
import { overwriteObject } from '@/common';
import { NUMBER_OF_TEAMS, TActionItem, TConstellation, TTeam, TTeamMemberResult, copyTeams, getBuilddataFromStorage, getDefaultMemberResult, initializeTeam, makeBlankTeam, makeTeamsStr } from './team';
import TeamEditorModal from './TeamEditorModal.vue';
import TeamItem from './TeamItem.vue';
import TeamRotation from './TeamRotation.vue';

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
    for (let i = 0; i < numberOfTeams.value; i++) {
      teams.push(makeBlankTeam(i));
    }
    const teamMemberResultMap = reactive({} as { [key: number]: TTeamMemberResult });
    const displayStat = ref('');
    const displayRes = ref(true);
    const selectedTeamId = ref(0);
    const saveddataStr = ref('');
    const constellations = reactive({} as TConstellation);

    onMounted(() => {
      loadOnClick();
    })

    const forcusedTeam = computed(() => teams.filter(s => s.id == selectedTeamId.value)[0]);
    const builddataStr = computed(() => makeTeamsStr(teams));
    const saveDisabled = computed(() => builddataStr.value == saveddataStr.value);
    const teamSelected = (index: number) => index == selectedTeamId.value;

    const teamMemberResult = computed(() => {
      let result = {} as TTeamMemberResult;
      if (selectedTeamId.value in teamMemberResultMap) {
        result = teamMemberResultMap[selectedTeamId.value] as TTeamMemberResult;
      } else {
        if (selectedTeamId.value != -1) {
          const team = teams.filter(team => team.id == selectedTeamId.value)[0];
          team.members.forEach(member => {
            if (result) {
              result[member.id] = getDefaultMemberResult();
            }
          })
        }
      }
      return result;
    })

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
      const characterOwnListStr = localStorage.getItem('キャラクター所持状況');
      if (characterOwnListStr) {
        const newConstellations: TConstellation = {};
        const savedObj = JSON.parse(characterOwnListStr);
        Object.keys(savedObj).forEach((key) => {
          const value = Number(savedObj[key]);
          if (Number.isNaN(value)) {
            newConstellations[key] = value;
          }
        });
        overwriteObject(constellations, newConstellations);
      }
      const teamsStr = localStorage.getItem('teams');
      const newTeams: TTeam[] = [];
      for (let i = 0; i < numberOfTeams.value; i++) {
        newTeams.push(makeBlankTeam(i));
      }
      if (teamsStr) {
        const srcTeams: any[] = JSON.parse(teamsStr);
        copyTeams(newTeams, srcTeams, true);
        numberOfTeams.value = newTeams.length;
        saveddataStr.value = teamsStr;
      }
      teams.splice(0, teams.length, ...newTeams);
    };

    const clearOnClick = () => {
      teams.forEach((team) => {
        initializeTeam(team);
      });
    };

    const teamOnClick = (id: number) => {
      selectedTeamId.value = id;
    };

    const editOnClick = (id: number) => {
      if (id == selectedTeamId.value) {
        teamEditorVisible.value = true;
        nextTick().then(() => {
          document.getElementById('team-list-and-editor')?.scrollIntoView({ behavior: 'smooth' });
        });
      } else {
        selectedTeamId.value = id;
      }
    };

    const teamEditorOnClickOk = (newTeam: TTeam) => {
      teamEditorVisible.value = false;
      if (selectedTeamId.value < 0) return;
      jumpToTeam();
      const team = teams.filter((s) => s.id == selectedTeamId.value)[0];
      if (!team) return;
      team.name = newTeam.name;
      for (let i = 0; i < newTeam.members.length; i++) {
        const newMember = newTeam.members[i];
        const member = team.members[i];
        if (member.name != newMember.name || member.buildname != newTeam.members[i].buildname) {
          member.name = newTeam.members[i].name;
          member.buildname = newTeam.members[i].buildname;
          member.builddata = member.buildname ? getBuilddataFromStorage(member.name, member.buildname) : undefined;
        }
        if (!_.isEqual(member.tags, newMember.tags)) {
          member.tags.splice(0, member.tags.length, ...newMember.tags);
        }
        if (!_.isEqual(member.replacements, newMember.replacements)) {
          member.replacements.splice(0, member.replacements.length, ...newMember.replacements);
        }
      }
      team.description = newTeam.description;
      if (!_.isEqual(team.rotation, newTeam.rotation)) {
        team.rotation.splice(0, team.rotation.length, ...newTeam.rotation);
      }
    };

    const teamEditorOnClickCancel = () => {
      teamEditorVisible.value = false;
      jumpToTeam();
    }

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
      nextTick().then(() => {
        document.getElementById('team-rotation')?.scrollIntoView({ behavior: 'smooth' });
      });
    }

    const jumpToTeam = () => {
      if (selectedTeamId.value != -1) {
        nextTick().then(() => {
          document.getElementById('team-' + selectedTeamId.value)?.scrollIntoView({ behavior: 'smooth' });
        });
      }
    }

    const updateMemberResult = (id: number, teamMmberResult: TTeamMemberResult) => {
      teamMemberResultMap[id] = teamMmberResult;
      if (id == selectedTeamId.value) {
        teamMemberResult.value;
      }
    }

    return {
      displayName,

      DISPLAY_STAT_LIST,
      NUMBER_OF_TEAMS,
      numberOfTeams,
      displayStat,
      displayRes,
      teams,
      constellations,
      teamEditorVisible,
      teamSelected,
      forcusedTeam,
      saveDisabled,
      teamMemberResult,

      numberOfTeamsOnChange,
      saveOnClick,
      loadOnClick,
      clearOnClick,
      teamOnClick,
      editOnClick,
      teamEditorOnClickOk,
      teamEditorOnClickCancel,
      updateRotation,
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
  grid-template-columns: auto auto;
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

.pane2 {
  margin-bottom: 5px;
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
  width: 8rem;
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
