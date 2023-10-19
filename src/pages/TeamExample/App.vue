<template>
  <div class="base-container">
    <div class="header">
      &nbsp; <a href="./">げんかるく</a>
    </div>

    <div class="pane1">
    </div>

    <div class="pane2">
      <draggable :list="teams" item-key="id" :sort="true" handle=".handle">
        <template #item="{ element }">
          <div style="display: inline-block;" :id="'team-' + element.id">
            <TeamItem :team="element" :selected="teamSelected(element.id)" @click="teamOnClick(element.id)"
              @click:jump-to-rotation="jumpToRotation" />
          </div>
        </template>
      </draggable>
    </div>

    <div class="pane3">
      <hr />
      <div id="team-rotation">
        <TeamRotation v-if="teams[selectedTeamId]" :team="teams[selectedTeamId]" @update:rotation="updateRotation"
          @click:jump-to-team="jumpToTeam" />
      </div>
    </div>

    <div class="pane4"></div>

    <div class="footer">
      <hr />
      <h2>チーム編成例 Ver.0.1.0</h2>
      <ul class="usage">
        <li>右上の◆のドラッグ＆ドロップでチームの並べ替えができます。</li>
      </ul>
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
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import CompositionFunction from '@/components/CompositionFunction.vue';
import { NUMBER_OF_MEMBERS, TActionItem, TMember, TTeam } from '../TeamManager/team';
import TeamItem from '../TeamManager/TeamItem.vue';
import TeamRotation from '../TeamManager/TeamRotation.vue';
import teamexample from './teamexample.json';

let memberId = 1;

export default defineComponent({
  name: 'TeamExample',
  components: {
    draggable,
    TeamItem,
    TeamRotation,
  },
  setup() {
    const { displayName } = CompositionFunction();
    const teams = reactive([] as TTeam[]);
    const selectedTeamId = ref(-1);

    onMounted(() => {
      const newTeams: TTeam[] = [];
      if (teamexample) {
        let actionId = 1;
        for (let i = 0; i < teamexample.length; i++) {
          const example = teamexample[i] as any;
          if (example) {
            const team = makeBlankTeam(i);
            team.name = example.name;
            const members = team.members;
            for (let j = 0; j < members.length; j++) {
              if (example.members[j]) {
                members[j].name = example.members[j].name;
                members[j].buildname = undefined;
                members[j].builddata = undefined;
                if (example.members[j].tags) {
                  members[j].tags = example.members[j].tags;
                } else {
                  members[j].tags = [];
                }
                if (example.members[j].replacements) {
                  members[j].replacements = example.members[j].replacements;
                } else {
                  members[j].replacements = [];
                }
              }
            }
            team.description = example.description;
            if (example.rotation?.length) {
              team.rotation = example.rotation;
              team.rotation.forEach(action => {
                action.id = actionId++;
              })
            } else {
              team.rotation = [];
            }
            team.rotationDescription = example.rotationDescription ?? '';
            newTeams.push(team);
          }
        }
      }
      teams.splice(0, teams.length, ...newTeams);
      if (teams.length) {
        selectedTeamId.value = 0;
      }
    })

    const forcusedTeam = computed(() => teams.filter(s => s.id == selectedTeamId.value)[0]);
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

    const teamOnClick = (index: number) => {
      selectedTeamId.value = index;
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

    return {
      displayName,

      selectedTeamId,
      teamSelected,
      teams,
      forcusedTeam,

      updateRotation,
      teamOnClick,
      jumpToRotation,
      jumpToTeam,
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
