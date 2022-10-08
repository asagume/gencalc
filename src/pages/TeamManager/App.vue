<template>
  <div class="base-container">
    <div class="pane1">
      <div class="display-stat-select">
        <label v-for="item in DISPLAY_STAT_LIST" :key="item[1]">
          <input class="hidden" type="radio" name="display-stat" v-model="displayStat" :value="item[0]" />
          <span>{{item[1]}}</span>
        </label>
      </div>
      <label class="number-of-teams">
        Number of teams
        <input type="number" :min="NUMBER_OF_TEAMS" v-model="numberOfTeams" @change="numberOfTeamsOnChange" />
      </label>
      <div>
        <button type="button" @click="save">Save</button>
        <button type="button" @click="load">Reset</button>
        <button type="button" @click="clear">Clear</button>
      </div>
    </div>

    <div class="pane2">
      <draggable :list="teams" item-key="id" :sort="true" handle=".handle">
        <template #item="{ element }">
          <TeamItem :team="element" :selected="teamSelected(element.id)" :displayStat="displayStat"
            @click="teamOnClick(element.id)" @change:name="teamNameOnChange" @change:buildname="buildnameOnChange"
            @click:character="characterOnClick(element)" />
        </template>
      </draggable>
    </div>

    <CharacterSelectModal :visible="characterSelectVisible" :memberNames="memberNames"
      @click:cancel="characterSelectVisible=false" @click:ok="updateCharacters" />

    <div class="pane3">
    </div>

    <div class="pane4">
    </div>

    <div class="footer"></div>
  </div>
</template>
<script lang="ts">
import draggable from "vuedraggable";
import { computed, defineComponent, reactive, ref } from "vue";
import CompositionFunction from "@/components/CompositionFunction.vue";
import { makeDefaultBuildname } from "@/input";
import { deepcopy } from "@/common";
import { NUMBER_OF_MEMBERS, NUMBER_OF_TEAMS, TMember, TTeam } from "./team";
import TeamItem from "./TeamItem.vue";
import CharacterSelectModal from "./CharacterSelectModal.vue";

let memberId = 1;

export default defineComponent({
  name: "TeamManager",
  components: {
    draggable,
    TeamItem,
    CharacterSelectModal
  },
  setup() {
    const { displayName } = CompositionFunction();

    const characterSelectVisible = ref(false);
    const numberOfTeams = ref(NUMBER_OF_TEAMS);
    const DISPLAY_STAT_LIST = [
      ['レベル', 'Lv.'],
      ['HP上限', 'Max HP'],
      ['攻撃力', 'ATK'],
      ['防御力', 'DEF'],
      ['元素熟知', 'EM'],
      ['会心率/ダメージ', 'CRIT'],
      ['元素チャージ効率', 'ER'],
    ];
    const displayStat = ref('元素チャージ効率');

    const selectedTeamId = ref(0);
    const teamSelected = (index: number) => index == selectedTeamId.value;

    function makeBlankMember(index: number) {
      return {
        id: index,
        name: "",
        buildname: undefined,
        savedata: undefined,
      }
    }

    function makeBlankTeam(index: number) {
      const team: TTeam = {
        id: index,
        name: 'チーム' + (index + 1),
        members: [] as TMember[],
      };
      for (let i = 0; i < NUMBER_OF_MEMBERS; i++) {
        team.members.push(makeBlankMember(memberId++));
      }
      return team;
    }

    function initializeMember(member: TMember) {
      member.name = '';
      member.buildname = undefined;
      member.savedata = undefined;
    }

    function initializeTeam(team: TTeam) {
      team.name = '';
      team.members.forEach(member => {
        initializeMember(member);
      });
    }

    const teams = reactive([] as TTeam[]);
    for (let i = 0; i < numberOfTeams.value; i++) {
      teams.push(makeBlankTeam(i));
    }

    const teamOnClick = (index: number) => {
      selectedTeamId.value = index;
    };

    const memberOnClick = (index: number) => {
      if (selectedTeamId.value == index) {
        characterSelectVisible.value = true;
      }
      selectedTeamId.value = index;
    };

    const clear = () => {
      teams.forEach((team) => {
        initializeTeam(team);
      });
    };

    const save = () => {
      const work: TTeam[] = deepcopy(teams);
      work.forEach((team) => {
        team.members.forEach((member) => {
          member.savedata = undefined;
        });
      });
      localStorage.setItem("teams", JSON.stringify(work));
    };

    const load = () => {
      const storageValue = localStorage.getItem("teams");
      if (storageValue) {
        const work = JSON.parse(storageValue);
        for (let i = 0; i < teams.length; i++) {
          const team = teams[i];
          if (work[i]) {
            team.name = work[i].name;
            const members = team.members;
            for (let j = 0; j < members.length; j++) {
              if (work[i].members[j]) {
                members[j].name = work[i].members[j].name;
                members[j].buildname = work[i].members[j].buildname;
                members[j].savedata = undefined; // TODO
              }
            }
          }
        }
      }
    };
    load();

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

    const memberNames = computed(() => {
      let result = Array(NUMBER_OF_MEMBERS).fill('');
      const team = teams.filter(s => s.id == selectedTeamId.value)[0];
      if (team) result = team.members.map(s => s.name);
      return result;
    });

    const updateCharacters = (characters: string[]) => {
      if (selectedTeamId.value != -1) {
        const team = teams.filter((s) => s.id == selectedTeamId.value)[0];
        if (team) {
          const members = team.members;
          for (let i = 0; i < characters.length; i++) {
            if (members[i].name != characters[i]) {
              members[i].name = characters[i];
              members[i].buildname = makeDefaultBuildname(members[i].name);
              members[i].savedata = undefined;  // TODO
            }
          }
        }
      }
      characterSelectVisible.value = false;
    };

    const characterOnClick = (team: TTeam) => {
      if (teamSelected(team.id)) {
        characterSelectVisible.value = true;
      } else {
        selectedTeamId.value = team.id;
      }
    };

    const teamNameOnChange = (id: number, name: string) => {
      const team = teams.filter(s => s.id == id)[0];
      if (team) {
        team.name = name;
      }
    }

    const buildnameOnChange = (teamId: number, memberId: number, buildname: string) => {
      const team = teams.filter(s => s.id == teamId)[0];
      if (team) {
        const member = team.members.filter(s => s.id == memberId)[0];
        if (member) {
          member.buildname = buildname;
        }
      }
    };

    return {
      displayName,

      characterSelectVisible,
      NUMBER_OF_TEAMS,
      NUMBER_OF_MEMBERS,
      numberOfTeams,
      numberOfTeamsOnChange,
      DISPLAY_STAT_LIST,
      displayStat,

      clear,
      save,
      load,

      teamSelected,
      teams,
      memberNames,

      teamOnClick,
      characterOnClick,

      memberOnClick,
      updateCharacters,

      teamNameOnChange,
      buildnameOnChange,
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
  grid-template-rows: auto auto auto auto auto;
  grid-template-areas:
    "pane1"
    "pane2"
    "pane3"
    "pane4"
    "footer";
}

.modals {
  position: relative;
}

div.team {
  width: calc(100% - 4px);
  margin: 3px 2px;
}
</style>
<style scoped>
input[type="radio"]+span {
  display: inline-block;
  width: 8rem;
  font-size: 2rem;
  color: black;
  background-color: gray;
  border-radius: 5px;
  margin: 2px;
}

input[type="radio"]:checked+span {
  background-color: whitesmoke;
}

label.number-of-teams input[type="number"] {
  width: 5rem;
}
</style>
