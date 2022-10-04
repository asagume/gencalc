<template>
  <div class="base-container">
    <div class="pane1">

    </div>

    <div class="pane2">
      <CharacterSelect :visible="true" :characters="memberNames" @update:characters="updateCharacters" />
    </div>

    <div class="pane3">
      <draggable :list="teams" item-key="index" :sort="true" handle=".handle">
        <template #item="{ element }">
          <div class="team" @click="teamOnClick(element.index)">
            <label class="name handle">
              <span>◇</span>
              <span class="selected">◆</span>
              <span class="name" v-if="teamNameEditable[element.index]">
                <input type="text" v-model="element.name" placeholder="input team name" />
                <span class="button material-symbols-outlined" @click="teamNameEditable[element.index]=false"> edit_off </span>
              </span>
              <span class="name" v-else>
                <span>{{ element.name }}</span>
                <span class="button material-symbols-outlined" @click="teamNameEditable[element.index]=true"> edit </span>
              </span>
            </label>
            <table class="team-members">
              <tr>
                <td class="team-member" v-for="member in element.members" :key="member.id">
                  <div class="member-img">
                    <img :class="'character'+characterImgClass(member)" :src="characterImgSrc(member)"
                      :alt="displayName(member.name)">
                    <img class="vision" :src="visionImgSrc(member)" alt="vision">
                  </div>
                  <div>
                    <select v-model="member.buildname">
                      <option v-for="buildname in buildnames(member)" :key="buildname">
                        {{buildname}}
                      </option>
                    </select>
                  </div>
                  <div>
                    <button type="button">GO GENCALC</button>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </template>
      </draggable>
    </div>

    <div class="pane4">

    </div>

    <div class="pane5">

    </div>

    <div class="footer">

    </div>
  </div>
</template>
<script lang="ts">
import draggable from "vuedraggable";
import { defineComponent, reactive, ref } from "vue";
import {
  CHARACTER_MASTER,
  ELEMENT_IMG_SRC,
  IMG_SRC_DUMMY,
  STAR_BACKGROUND_IMAGE_CLASS,
  TCharacterKey,
} from "@/master";
import CompositionFunction from "@/components/CompositionFunction.vue";
import CharacterSelect from "@/components/CharacterSelect.vue";
import { makeDefaultBuildname } from "@/input";

type TMember = {
  id: number,
  name: string,
};

type TTeam = {
  index: number,
  name: string,
  members: TMember[],
};

const NUMBER_OF_TEAMS = 10;
const NUMBER_OF_MEMBERS = 4;

let memberId = 1;

export default defineComponent({
  name: "TeamManager",
  components: {
    draggable,
    CharacterSelect
  },
  setup() {
    const { displayName } = CompositionFunction();

    const memberNames = reactive(['', '', '', ''] as string[]);

    const teamNameEditable = reactive([] as boolean[]);
    for (let i = 0; i < NUMBER_OF_TEAMS; i++) {
      teamNameEditable.push(false);
    }

    const teams = reactive([] as TTeam[]);
    for (let i = 0; i < NUMBER_OF_TEAMS; i++) {
      const team: TTeam = {
        index: i,
        name: '待機中のチーム',
        members: [] as TMember[],
      };
      for (let j = 0; j < NUMBER_OF_MEMBERS; j++) {
        const member: TMember = {
          id: memberId++,
          name: '',
        };
        team.members.push(member);
      }
      teams.push(team);
    }

    const selectedTeamId = ref(1);

    const teamOnClick = (teamId: number) => {
      console.log(teamId);
      selectedTeamId.value = teamId;
      teams.forEach(team => {
        if (team.index == selectedTeamId.value) {
          const work = team.members.map(s => s.name);
          memberNames.splice(0, memberNames.length, ...work);
        }
      });
    };

    const updateCharacters = (characters: string[]) => {
      console.log(characters);
      teams.forEach(team => {
        if (team.index == selectedTeamId.value) {
          for (let i = 0; i < characters.length; i++) {
            team.members[i].name = characters[i];
          }
        }
      });
      memberNames.splice(0, memberNames.length, ...characters);
    };

    function characterMaster(member: TMember) {
      if (member.name && member.name in CHARACTER_MASTER) {
        return CHARACTER_MASTER[member.name as TCharacterKey];
      }
      return undefined;
    }

    const characterImgSrc = (member: TMember) => {
      const master = characterMaster(member);
      if (master) {
        return (master as any).icon_url;
      }
      return IMG_SRC_DUMMY;
    }

    const characterImgClass = (member: TMember) => {
      const master = characterMaster(member);
      if (master) {
        return ' ' + (STAR_BACKGROUND_IMAGE_CLASS as any)[String(master.レアリティ)];
      }
      return '';
    }

    const visionImgSrc = (member: TMember) => {
      const master = characterMaster(member);
      if (master) {
        const vision = master.元素;
        return (ELEMENT_IMG_SRC as any)[vision];
      }
      return IMG_SRC_DUMMY;
    };

    const buildnames = (member: TMember) => {
      const result: string[] = [];
      const storageKeys = Object.keys(localStorage).filter(s => s.startsWith('構成_' + member.name));
      storageKeys.forEach(storageKey => {
        const defaultBuildname = makeDefaultBuildname(member.name);
        if (storageKey == '構成_' + member.name) {
          result.push(defaultBuildname);
        }
      });
      return result;
    };

    return {
      displayName,

      teamNameEditable,
      memberNames,
      teams,

      teamOnClick,
      updateCharacters,

      characterImgSrc,
      characterImgClass,
      visionImgSrc,
      buildnames,
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
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 330px auto auto auto;
  grid-template-areas:
    "pane1 pane1"
    "pane2 pane3"
    "pane4 pane3"
    "pane5 pane5"
    "footer footer";
}
</style>
<style scoped>
.pane2 {
  overflow-y: scroll;
}

div.team {
  margin-bottom: 20px;
  text-align: left;
}

label.name {
  height: 40px;
}

span.name {
  display: inline-block;
  width: 240px;
  height: 5rem;
  position: relative;
  font-size: 2.6rem;
  margin-left: 5px;
}

span.name span.button {
  display: inline-block;
  position: absolute;
  right: 0px;
  top: 0px;
  font-size: 2.6rem;
}

input.name {
  width: 180px;
  font-size: 2.4rem;
}

div.member-img {
  position: relative;
}

img.character {
  width: 90px;
  height: 90px;
  background-size: contain;
}

img.vision {
  width: 30px;
  height: 30px;
  position: absolute;
  left: 0;
  top: 0;
}

.selected {
  border-bottom: 3px gold solid;
}

table.team-members {
  table-layout: fixed;
}

table {
  width: calc(100% - 8px);
  table-layout: auto;
  border: 4px gray solid;
  border-spacing: 0;
  text-align: center;
}

tr,
th,
td {
  border: 2px gray solid;
  line-height: 4rem;
}

td select {
  width: 100%;
}
</style>
  