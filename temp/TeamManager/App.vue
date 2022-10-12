<template>
  <div class="base-container">
    <div class="pane1">
      <fieldset>
        <div class="display-stat-select">
          <label class="display-stat" v-for="item in DISPLAY_STAT_LIST" :key="item[1]">
            <input
              class="hidden"
              type="radio"
              name="display-stat"
              v-model="displayStat"
              :value="item[0]"
            />
            <span>{{ item[1] }}</span>
          </label>
        </div>
        <label class="number-of-teams">
          Number of teams
          <input
            type="number"
            :min="NUMBER_OF_TEAMS"
            v-model="numberOfTeams"
            @change="numberOfTeamsOnChange"
          />
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
      <div v-show="!characterSelectVisible">
        <draggable :list="teams" item-key="id" :sort="true" handle=".handle">
          <template #item="{ element }">
            <TeamItem
              :team="element"
              :selected="teamSelected(element.id)"
              :displayStat="displayStat"
              @click="teamOnClick(element.id)"
              @change:name="teamNameOnChange"
              @change:buildname="buildnameOnChange"
              @click:character="characterOnClick(element)"
            />
          </template>
        </draggable>
      </div>
      <div v-show="characterSelectVisible">
        <CharacterSelectModal
          :visible="characterSelectVisible"
          :members="forcusedMembers"
          @click:cancel="characterSelectVisible = false"
          @click:ok="updateCharacters"
        />
      </div>
    </div>

    <div class="pane3">
      <hr />
      <TeamRotation v-if="teams[selectedTeamId]" :team="teams[selectedTeamId]" />
    </div>

    <div class="pane4"></div>

    <div class="footer">
      <hr />
      <h2>チーム編成 Ver.0.1.1</h2>
      <ul class="usage">
        <li>右上の◆のドラッグ＆ドロップでチームの並べ替えができます。</li>
      </ul>
      <p>
        <a href="./">げんかるく - 原神ダメージシミュレーター</a>
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import draggable from "vuedraggable";
import { computed, defineComponent, reactive, ref } from "vue";
import CompositionFunction from "@/components/CompositionFunction.vue";
import { deepcopy } from "@/common";
import { NUMBER_OF_MEMBERS, NUMBER_OF_TEAMS, TMember, TTeam } from "./team";
import TeamItem from "./TeamItem.vue";
import CharacterSelectModal from "./CharacterSelectModal.vue";
import TeamRotation from "./TeamRotation.vue";

let memberId = 1;

export default defineComponent({
  name: "TeamManager",
  components: {
    draggable,
    TeamItem,
    CharacterSelectModal,
    TeamRotation,
  },
  setup() {
    const { displayName } = CompositionFunction();

    const characterSelectVisible = ref(false);
    const numberOfTeams = ref(NUMBER_OF_TEAMS);
    const DISPLAY_STAT_LIST = [
      ["", "None"],
      ["レベル", "Lv."],
      ["HP上限", "Max HP"],
      ["攻撃力", "ATK"],
      ["防御力", "DEF"],
      ["元素熟知", "EM"],
      ["会心率/ダメージ", "CRIT"],
      ["元素チャージ効率", "ER"],
    ];
    const displayStat = ref("");

    const selectedTeamId = ref(0);
    const teamSelected = (index: number) => index == selectedTeamId.value;

    function makeBlankMember(index: number): TMember {
      return {
        id: index,
        name: "",
        buildname: undefined,
        savedata: undefined,
        tags: [],
      };
    }

    function makeBlankTeam(index: number) {
      const team: TTeam = {
        id: index,
        name: "チーム" + (index + 1),
        members: [] as TMember[],
      };
      for (let i = 0; i < NUMBER_OF_MEMBERS; i++) {
        team.members.push(makeBlankMember(memberId++));
      }
      return team;
    }

    function initializeMember(member: TMember) {
      member.name = "";
      member.buildname = undefined;
      member.savedata = undefined;
    }

    function initializeTeam(team: TTeam) {
      team.name = "チーム" + (team.id + 1);
      team.members.forEach((member) => {
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

    const clearOnClick = () => {
      teams.forEach((team) => {
        initializeTeam(team);
      });
    };

    const savedataStr = computed(() => {
      const work: TTeam[] = deepcopy(teams);
      work.forEach((team) => {
        team.members.forEach((member) => {
          member.savedata = undefined;
        });
      });
      return JSON.stringify(work);
    });
    const saveddataStr = ref("");

    const saveOnClick = () => {
      localStorage.setItem("teams", savedataStr.value);
      saveddataStr.value = savedataStr.value;
    };

    const saveDisabled = computed(() => savedataStr.value == saveddataStr.value);

    const loadOnClick = () => {
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
                if (work[i].members[j].buildname) {
                  members[j].buildname = work[i].members[j].buildname;
                } else {
                  members[j].buildname = undefined;
                }
                members[j].savedata = undefined; // TODO
                if (work[i].members[j].tags) {
                  members[j].tags = work[i].members[j].tags;
                } else {
                  members[j].tags = [] as string[];
                }
              }
            }
          }
        }
      }
    };
    loadOnClick();

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

    const forcusedMembers = computed(() => teams[selectedTeamId.value].members);

    const updateCharacters = (newMembers: TMember[]) => {
      if (selectedTeamId.value != -1) {
        const team = teams.filter((s) => s.id == selectedTeamId.value)[0];
        if (team) {
          const workMembers: TMember[] = [];
          for (let i = 0; i < newMembers.length; i++) {
            const workMember = makeBlankMember(team.members[i].id);
            workMember.name = newMembers[i].name;
            workMember.buildname = newMembers[i].buildname;
            workMember.savedata = undefined; // TODO
            workMember.tags.splice(0, workMember.tags.length, ...newMembers[i].tags);
            workMembers.push(workMember);
          }
          team.members.splice(0, team.members.length, ...workMembers);
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
      const team = teams.filter((s) => s.id == id)[0];
      if (team) {
        team.name = name;
      }
    };

    const buildnameOnChange = (teamId: number, memberId: number, buildname: string) => {
      const team = teams.filter((s) => s.id == teamId)[0];
      if (team) {
        const member = team.members.filter((s) => s.id == memberId)[0];
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

      clearOnClick,
      saveOnClick,
      loadOnClick,
      saveDisabled,

      selectedTeamId,
      teamSelected,
      teams,
      forcusedMembers,

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

div.team {
  width: calc(100% - 4px);
  margin: 3px 2px;
}

.footer {
  padding-bottom: 20px;
}
</style>
<style scoped>
input[type="radio"] + span {
  display: inline-block;
  width: 45px;
  font-size: 11px;
  color: black;
  background-color: gray;
  border-radius: 5px;
  padding: 2px 0;
  margin: 2px 1px;
}

input[type="radio"]:checked + span {
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
</style>
