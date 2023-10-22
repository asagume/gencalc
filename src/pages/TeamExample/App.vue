<template>
  <div class="base-container">
    <div class="header">
      &nbsp; <a href="./">げんかるく</a>
    </div>

    <div class="pane1">
      <h4>EXAMPLE</h4>
    </div>

    <div class="pane2">
      <div v-show="!teamEditorVisible">
        <draggable :list="teams" item-key="id" :sort="true" handle=".handle">
          <template #item="{ element }">
            <div style="display: inline-block;" :id="'team-' + element.id">
              <TeamItem :team="element" :selected="teamSelected(element.id)" :editable="!isViewOnly"
                :show-equipment="false" @click="teamOnClick(element.id)" @click:edit="editOnClick"
                @click:jump-to-rotation="jumpToRotation" />
            </div>
          </template>
        </draggable>
      </div>
      <div v-show="teamEditorVisible">
        <TeamEditorModal :visible="true" :team="forcusedTeam" @click:cancel="teamEditorOnClickCancel"
          @click:ok="teamEditorOnClickOk" />
      </div>
    </div>

    <div class="pane3">
      <hr />
      <div id="team-rotation">
        <TeamRotation v-if="forcusedTeam" :team="forcusedTeam" @update:rotation="updateRotation"
          @click:jump-to-team="jumpToTeam" />
      </div>
    </div>

    <div class="pane4">
      <textarea v-if="!isViewOnly" v-model="builddataStr" style="width: 90%; height: 100px;"></textarea>
    </div>

    <div class="footer">
      <hr />
      <h2>チーム編成例 Ver.0.1.0</h2>
      <dl class="history">
        <dt>0.1.0</dt>
        <dd>
        </dd>
      </dl>
    </div>
  </div>
</template>
<script lang="ts">
import _ from 'lodash';
import draggable from 'vuedraggable';
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import CompositionFunction from '@/components/CompositionFunction.vue';
import { NUMBER_OF_TEAMS, TActionItem, TTeam, copyTeams, makeBlankTeam, makeTeamsStr } from '../TeamManager/team';
import TeamEditorModal from '../TeamManager/TeamEditorModal.vue';
import TeamItem from '../TeamManager/TeamItem.vue';
import TeamRotation from '../TeamManager/TeamRotation.vue';
import teamexample from './teamexample.json';

export default defineComponent({
  name: 'TeamExample',
  components: {
    draggable,
    TeamItem,
    TeamEditorModal,
    TeamRotation,
  },
  setup() {
    const { displayName } = CompositionFunction();
    const isViewOnly = ref(true);
    const teamEditorVisible = ref(false);
    const numberOfTeams = ref(NUMBER_OF_TEAMS);
    const teams = reactive([] as TTeam[]);
    for (let i = 0; i < numberOfTeams.value; i++) {
      teams.push(makeBlankTeam(i));
    }
    const selectedTeamId = ref(0);

    onMounted(() => {
      loadOnClick();
    })

    const forcusedTeam = computed(() => teams.filter(s => s.id == selectedTeamId.value)[0]);
    const builddataStr = computed(() => makeTeamsStr(teams));
    const teamSelected = (index: number) => index == selectedTeamId.value;

    const loadOnClick = () => {
      const srcTeams: any[] = teamexample;
      const newTeams: TTeam[] = [];
      for (let i = 0; i < numberOfTeams.value; i++) {
        newTeams.push(makeBlankTeam(i));
      }
      copyTeams(newTeams, srcTeams, true);
      numberOfTeams.value = newTeams.length;
      teams.splice(0, teams.length, ...newTeams);
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
          member.buildname = undefined;
          member.builddata = undefined;
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

    return {
      displayName,

      isViewOnly,
      NUMBER_OF_TEAMS,
      numberOfTeams,
      teams,
      teamEditorVisible,
      teamSelected,
      forcusedTeam,

      teamOnClick,
      editOnClick,
      teamEditorOnClickOk,
      teamEditorOnClickCancel,
      updateRotation,
      jumpToRotation,
      jumpToTeam,

      builddataStr,
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
