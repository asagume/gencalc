<template>
  <div class="base-container">
    <div class="pane1">
      <div class="display-stat-select">
        <label>
          <input class="hidden" type="radio" name="display-stat" value="HP上限" />
          <span>MaxHP</span>
        </label>
        <label>
          <input class="hidden" type="radio" name="display-stat" value="攻撃力" />
          <span>ATK</span>
        </label>
        <label>
          <input class="hidden" type="radio" name="display-stat" value="防御力" />
          <span>DEF</span>
        </label>
        <label>
          <input class="hidden" type="radio" name="display-stat" value="元素熟知" />
          <span>EM</span>
        </label>
        <label>
          <input class="hidden" type="radio" name="display-stat" value="会心" />
          <span>CRIT</span>
        </label>
        <label>
          <input
            class="hidden"
            type="radio"
            name="display-stat"
            value="元素チャージ効率"
          />
          <span>ER</span>
        </label>
      </div>
      <label>
        Number of teams
        <input type="number" :min="NUMBER_OF_TEAMS" v-model="numberOfTeams" />
      </label>
    </div>

    <div class="pane2">
      <div class="character-select" v-show="characterSelectVisible">
        <CharacterSelect
          :visible="true"
          :characters="memberNames"
          @update:characters="updateCharacters"
        />
        <button type="button" @click="characterSelectVisible = false">hide</button>
      </div>
    </div>

    <div class="pane3">
      <draggable :list="teams" item-key="index" :sort="true" handle=".handle">
        <template #item="{ element }">
          <div :class="'team' + teamSelected(element.id)">
            <div class="title">
              <label class="name handle" @click="teamOnClick(element.id)">
                <span>◇</span>
                <span class="name" v-if="teamNameEditable[element.id]">
                  <input
                    type="text"
                    v-model="element.name"
                    placeholder="input team name"
                  />
                  <span
                    class="button material-symbols-outlined"
                    @click="teamNameEditable[element.id] = false"
                  >
                    edit_off
                  </span>
                </span>
                <span class="name" v-else>
                  <span>{{ element.name }}</span>
                  <span
                    class="button material-symbols-outlined"
                    @click="teamNameEditable[element.id] = true"
                  >
                    edit
                  </span>
                </span>
              </label>
              <div class="element-resonance">
                <img
                  class="element-resonance"
                  v-for="src in resonanceElementImgSrcs(element)"
                  :key="src"
                  :src="src"
                  alt="resonance"
                />
              </div>
            </div>
            <table class="team-members">
              <tr>
                <td
                  class="team-member"
                  v-for="member in element.members"
                  :key="member.id"
                >
                  <div class="member-img" @click="memberOnClick(element.id)">
                    <img
                      :class="'character' + characterImgClass(member)"
                      :src="characterImgSrc(member)"
                      :alt="displayName(member.name)"
                    />
                    <img class="vision" :src="visionImgSrc(member)" alt="vision" />
                    <div class="constellation" v-show="constellation(member)">
                      {{ constellation(member) }}
                    </div>
                  </div>
                  <div>
                    {{ 0 }}
                  </div>
                  <div>
                    <img class="weapon" :src="imgWeaponSrc(member)" alt="weapon" />
                    <img
                      class="artifact-set"
                      :src="imgArtifactSetSrc(member, 0)"
                      alt="artifact-set"
                    />
                    <img
                      class="artifact-set"
                      :src="imgArtifactSetSrc(member, 1)"
                      alt="artifact-set"
                    />
                  </div>
                  <!-- <div>
                    <span class="button material-symbols-outlined"> manage_accounts </span>
                    <span class="button material-symbols-outlined"> edit_note </span>
                  </div>
                  <div>
                    <select v-model="member.buildname" @change="buildnameOnChange(member)">
                      <option v-for="buildname in buildnames(member)" :key="buildname" :value="buildname">
                        {{buildname}}
                      </option>
                    </select>
                  </div> -->
                  <div>
                    <button type="button" @click="locate(member)">open</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td :colspan="NUMBER_OF_MEMBERS"></td>
              </tr>
            </table>
          </div>
        </template>
      </draggable>
    </div>

    <div class="pane4">
      <button type="button" @click="save">Save</button>
      <button type="button" @click="load">Reset</button>
      <button type="button" @click="clear">Clear</button>
    </div>

    <div class="footer"></div>
  </div>
</template>
<script lang="ts">
import draggable from "vuedraggable";
import { computed, defineComponent, reactive, ref } from "vue";
import {
  ARTIFACT_SET_MASTER,
  CHARACTER_MASTER,
  ELEMENT_IMG_SRC,
  IMG_SRC_DUMMY,
  STAR_BACKGROUND_IMAGE_CLASS,
  TAnyObject,
  TCharacterKey,
  WEAPON_MASTER,
} from "@/master";
import CompositionFunction from "@/components/CompositionFunction.vue";
import CharacterSelect from "@/components/CharacterSelect.vue";
import { makeDefaultBuildname } from "@/input";
import { deepcopy } from "@/common";

type TMember = {
  id: number;
  name: string;
  buildname: string | undefined;
  savedata: any | undefined;
};

type TTeam = {
  id: number;
  name: string;
  members: TMember[];
};

const NUMBER_OF_TEAMS = 10;
const NUMBER_OF_MEMBERS = 4;

let memberId = 1;

export default defineComponent({
  name: "TeamManager",
  components: {
    draggable,
    CharacterSelect,
  },
  setup() {
    const { displayName } = CompositionFunction();

    const teamNameEditable = reactive([] as boolean[]);
    for (let i = 0; i < NUMBER_OF_TEAMS; i++) {
      teamNameEditable.push(false);
    }
    const characterSelectVisible = ref(false);
    const numberOfTeams = ref(NUMBER_OF_TEAMS);

    const teams = reactive([] as TTeam[]);
    for (let i = 0; i < NUMBER_OF_TEAMS; i++) {
      const team: TTeam = {
        id: i,
        name: "待機状態のチーム",
        members: [] as TMember[],
      };
      for (let j = 0; j < NUMBER_OF_MEMBERS; j++) {
        const member: TMember = {
          id: memberId++,
          name: "",
          buildname: undefined,
          savedata: undefined,
        };
        team.members.push(member);
      }
      teams.push(team);
    }

    const selectedTeamId = ref(0);
    const memberNames = computed(() => {
      let result = Array(NUMBER_OF_MEMBERS).fill(0);
      if (selectedTeamId.value != -1) {
        const team = teams.filter((s) => s.id == selectedTeamId.value)[0];
        if (team) {
          result = team.members.map((s) => s.name);
        }
      }
      return result;
    });

    const teamSelected = (index: number) => {
      if (index == selectedTeamId.value) return " selected";
      return "";
    };

    const teamOnClick = (index: number) => {
      selectedTeamId.value = index;
    };

    const memberOnClick = (index: number) => {
      if (selectedTeamId.value == index) {
        characterSelectVisible.value = true;
      }
      selectedTeamId.value = index;
    };

    function getSavedata(member: TMember) {
      let result = undefined;
      if (member.name) {
        let storageKey = "構成_" + member.name;
        if (member.buildname != makeDefaultBuildname(member.name)) {
          storageKey += "_" + member.buildname;
        }
        const storageValue = localStorage.getItem(storageKey);
        if (storageValue) {
          result = JSON.parse(storageValue);
        }
      }
      return result;
    }

    const updateCharacters = (characters: string[]) => {
      console.log(characters);
      if (selectedTeamId.value != -1) {
        const team = teams.filter((s) => s.id == selectedTeamId.value)[0];
        if (team) {
          const members = team.members;
          for (let i = 0; i < characters.length; i++) {
            if (members[i].name != characters[i]) {
              members[i].name = characters[i];
              members[i].buildname = makeDefaultBuildname(members[i].name);
              members[i].savedata = getSavedata(members[i]);
            }
          }
          console.log(members);
        }
      }
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
    };

    const characterImgClass = (member: TMember) => {
      const master = characterMaster(member);
      if (master) {
        return " " + (STAR_BACKGROUND_IMAGE_CLASS as any)[String(master.レアリティ)];
      }
      return "";
    };

    const visionImgSrc = (member: TMember) => {
      const master = characterMaster(member);
      if (master) {
        const vision = master.元素;
        return (ELEMENT_IMG_SRC as any)[vision];
      }
      return IMG_SRC_DUMMY;
    };

    const constellation = (member: TMember) => {
      return member.savedata ? member.savedata.命ノ星座 : "";
    };

    const resonanceElementImgSrcs = (team: TTeam) => {
      const result: string[] = [];
      const work: TAnyObject = {};
      const members = team.members.filter((s) => s.name);
      if (members.length == 4) {
        members.forEach((member) => {
          const master = characterMaster(member);
          if (master) {
            if (master.元素 in work) {
              work[master.元素]++;
            } else {
              work[master.元素] = 1;
            }
          }
        });
        if (Object.keys(work).length == 4) {
          Object.keys(work).forEach((key) => {
            result.push((ELEMENT_IMG_SRC as any)[key]);
          });
        } else {
          Object.keys(work).forEach((key) => {
            if (work[key] >= 2) {
              result.push((ELEMENT_IMG_SRC as any)[key]);
              result.push((ELEMENT_IMG_SRC as any)[key]);
            }
          });
        }
      }
      return result;
    };

    const buildnames = (member: TMember) => {
      const result: string[] = [];
      const storageKeys = Object.keys(localStorage).filter((s) =>
        s.startsWith("構成_" + member.name)
      );
      storageKeys.forEach((storageKey) => {
        const defaultBuildname = makeDefaultBuildname(member.name);
        if (storageKey == "構成_" + member.name) {
          result.push(defaultBuildname);
        }
      });
      return result;
    };

    const buildnameOnChange = (member: TMember) => {
      member.savedata = getSavedata(member);
    };

    const imgWeaponSrc = (member: TMember) => {
      let result = IMG_SRC_DUMMY;
      if (member.savedata) {
        const master = characterMaster(member);
        if (master) {
          result = (WEAPON_MASTER as any)[master.武器][member.savedata.武器].icon_url;
        }
      }
      return result;
    };
    const imgArtifactSetSrc = (member: TMember, index: number) => {
      let result = IMG_SRC_DUMMY;
      if (member.savedata) {
        let key;
        if (index == 0) key = "聖遺物セット効果1";
        if (index == 1) key = "聖遺物セット効果2";
        if (key) {
          result = (ARTIFACT_SET_MASTER as any)[member.savedata[key]].icon_url;
        }
      }
      return result;
    };

    const locate = (member: TMember) => {
      sessionStorage.setItem("character", member.name);
      if (member.buildname) {
        sessionStorage.setItem("buildname", member.buildname);
      } else {
        sessionStorage.removeItem("buildname");
      }
      window.open("./", "_blank");
    };

    const clear = () => {
      teams.forEach((team) => {
        team.name = "";
        team.members.forEach((member) => {
          member.name = "";
          member.buildname = "";
          member.savedata = undefined;
        });
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
                members[j].savedata = getSavedata(members[j]);
              }
            }
          }
        }
      }
    };
    load();

    return {
      displayName,

      teamNameEditable,
      characterSelectVisible,
      NUMBER_OF_TEAMS,
      NUMBER_OF_MEMBERS,
      numberOfTeams,

      teams,
      memberNames,

      teamOnClick,
      memberOnClick,
      updateCharacters,

      teamSelected,
      characterImgSrc,
      characterImgClass,
      visionImgSrc,
      constellation,
      imgWeaponSrc,
      imgArtifactSetSrc,
      resonanceElementImgSrcs,

      buildnameOnChange,
      buildnames,

      locate,

      clear,
      save,
      load,
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
  grid-template-rows: auto auto auto auto;
  grid-template-areas:
    "pane1 pane1"
    "pane2 pane3"
    "pane4 pane4"
    "footer footer";
}

div.team {
  width: calc(100% - 6px);
  margin: 3px 3px;
}

@media all and (max-width: 768px) {
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
    width: 100%;
    margin: 3px 0;
  }
}
</style>
<style scoped>
.character-select {
  min-width: 360px;
  overflow-y: scroll;
}

div.team {
  margin-bottom: 10px;
  text-align: left;
}

label.name {
  height: 35px;
}

span.name {
  display: inline-block;
  width: 220px;
  height: 4.5rem;
  position: relative;
  margin-left: 5px;
}

span.name span.button {
  display: inline-block;
  position: absolute;
  right: 0px;
  top: 0px;
}

input.name {
  width: 180px;
}

div.member-img {
  position: relative;
  width: 100%;
}

img.character {
  width: calc(100%);
  background-size: contain;
}

img.vision {
  width: calc(100% / 3);
  position: absolute;
  left: 0;
  top: 0;
}

img.weapon,
img.artifact-set {
  width: calc(100% / 3 - 4px);
  height: calc(100% / 3 - 4px);
  border: 2px solid whitesmoke;
  border-radius: 50%;
}

div.element-resonance {
  position: absolute;
  right: 0;
  top: 0;
}

img.element-resonance {
  width: 20px;
}

div.constellation {
  position: absolute;
  font-size: 20px;
  padding: 2px 5px;
  right: 2px;
  top: 2px;
  background-color: black;
  opacity: 50%;
}

.selected {
  color: gold;
  border-bottom: 3px gold solid;
}

div.team {
  display: inline-block;
  max-width: 342px;
  padding: 5px;
  border: 4px double whitesmoke;
}

div.team div.title {
  position: relative;
}

div.team.selected {
  border-color: gold;
}

table.team-members {
  width: 100%;
  table-layout: fixed;
  border-spacing: 0;
  text-align: center;
}

input[type="radio"] + span {
  display: inline-block;
  width: 8rem;
  font-size: 2rem;
  color: black;
  background-color: gray;
  border-radius: 5px;
  margin: 2px;
}

input[type="radio"]:checked + span {
  background-color: whitesmoke;
}
</style>
