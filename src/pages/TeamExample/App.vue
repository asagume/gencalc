<template>
  <div class="base-container">
    <div class="header">
      <table style="width: 100%;">
        <tbody>
          <tr>
            <td style="text-align: left;">&nbsp; <a href="./"> {{ displayName('げんかるく') }} </a></td>
            <td style="text-align: right;"><a href="./TeamManager.html"> {{ displayName('チーム編成') }}</a> &nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pane1">
      <h4>EXAMPLE</h4>
      <label class="bottom-right" v-if="false">
        Language
        <select v-model="locale" @change="localeOnChange(targetValue($event))">
          <option v-for="item in localeList" :value="item.value" :key="item.value">
            {{ item.name }}
          </option>
        </select>
      </label>
    </div>

    <div class="pane2">
      <div v-show="!teamEditorVisible">
        <div class="team-tags-area">
          <input class="search" type="search" v-model="searchWord" list="search-datalist">
          <datalist id="search-datalist">
            <option v-for="value in searchDatalist" :key="value" :value="displayName(value)"></option>
          </datalist>
          <label v-for="tag in teamTagList" :key="tag">
            <input class="hidden" type="checkbox" v-model="teamTagChecked[tag]">
            <span>{{ tag }}</span>
          </label>
        </div>

        <draggable :list="filteredTeams" item-key="id" :sort="true" handle=".handle">
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
        <TeamEditorModal v-if="forcusedTeam" :visible="true" :team="forcusedTeam" :team-tags="teamTagList"
          @click:cancel="teamEditorOnClickCancel" @click:ok="teamEditorOnClickOk" />
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
      <textarea v-if="true" v-model="builddataStr" style="width: 90%; height: 100px;"></textarea>
    </div>

    <div class="footer">
    </div>
  </div>
</template>
<script lang="ts">
import _ from 'lodash';
import draggable from 'vuedraggable';
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import { useI18n } from "vue-i18n";
import CompositionFunction from '@/components/CompositionFunction.vue';
import { NUMBER_OF_TEAMS, TActionItem, TTeam, copyTeams, makeBlankTeam, makeTeamsStr } from '../TeamManager/team';
import TeamEditorModal from '../TeamManager/TeamEditorModal.vue';
import TeamItem from '../TeamManager/TeamItem.vue';
import TeamRotation from '../TeamManager/TeamRotation.vue';
import teamexample from './teamexample.json';
import { CHARACTER_MASTER_LIST } from '@/master';

export default defineComponent({
  name: 'TeamExample',
  components: {
    draggable,
    TeamItem,
    TeamEditorModal,
    TeamRotation,
  },
  setup() {
    const { locale } = useI18n({
      useScope: "global",
    });
    const { displayName, localeList, targetValue, setI18nLanguage } = CompositionFunction();
    const isViewOnly = ref(false);
    const teamEditorVisible = ref(false);
    const numberOfTeams = ref(NUMBER_OF_TEAMS);
    const teams = reactive([] as TTeam[]);
    for (let i = 0; i < numberOfTeams.value; i++) {
      teams.push(makeBlankTeam(i));
    }
    const selectedTeamId = ref(0);
    const searchWord = ref('');
    const teamTagChecked = reactive({} as { [key: string]: boolean });

    onMounted(() => {
      loadOnClick();
    })

    const searchDatalist = computed(() => {
      return CHARACTER_MASTER_LIST.map(s => [s.key, s.icon_url]).sort((a, b) => {
        const a1 = a[1].split('/');
        const a2 = a1[a1.length - 1].split('_');
        const a3 = a2[a2.length - 1];
        const b1 = b[1].split('/');
        const b2 = b1[b1.length - 1].split('_');
        const b3 = b2[b2.length - 1];
        return a3.localeCompare(b3);
      }).map(s => s[0]);
    })
    const teamTagList = computed(() => {
      const result: string[] = [];
      teams.forEach(team => {
        result.push(...team.tags);
      })
      return [...new Set(result)].sort();
    })
    const forcusedTeam = computed(() => teams.filter(s => s.id == selectedTeamId.value).length ? teams.filter(s => s.id == selectedTeamId.value)[0] : undefined);
    const builddataStr = computed(() => makeTeamsStr(teams));
    const teamSelected = (index: number) => index == selectedTeamId.value;

    const filteredTeams = computed(() => {
      let result = teams;
      if (searchWord.value) {
        const word = searchWord.value;
        result = result.filter(team => team.name.includes(word) || team.members.filter(member => member.name.includes(word) || member.replacements.filter(replacement => replacement.includes(word)).length > 0).length > 0);
      }
      const checkedTags = Object.keys(teamTagChecked).filter(tag => teamTagList.value.includes(tag) && teamTagChecked[tag]);
      if (checkedTags.length) {
        result = result.filter(team => team.tags.filter(tag => checkedTags.includes(tag)).length > 0);
      }
      return result;
    })

    const setupTeamTagChecked = () => {
      teams.forEach(team => {
        team.tags.forEach(tag => {
          if (teamTagChecked[tag] === undefined) {
            teamTagChecked[tag] = false;
          }
        })
      })
    }

    const localeOnChange = (locale: string | undefined) => {
      if (locale) setI18nLanguage(locale);
    };

    const loadOnClick = () => {
      const srcTeams: any[] = teamexample;
      const newTeams: TTeam[] = [];
      for (let i = 0; i < numberOfTeams.value; i++) {
        newTeams.push(makeBlankTeam(i));
      }
      copyTeams(newTeams, srcTeams, true);
      numberOfTeams.value = newTeams.length;
      teams.splice(0, teams.length, ...newTeams);
      setupTeamTagChecked();
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
      team.tags = newTeam.tags;
      setupTeamTagChecked();
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
      locale,
      localeList,
      localeOnChange,
      targetValue,

      isViewOnly,
      NUMBER_OF_TEAMS,
      numberOfTeams,
      teams,
      teamEditorVisible,
      teamSelected,
      forcusedTeam,
      searchWord,
      searchDatalist,
      teamTagList,
      teamTagChecked,
      filteredTeams,

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

.pane1 {
  margin-bottom: 5px;
}

.pane2 {
  margin-bottom: 5px;
}

.footer {
  padding-bottom: 20px;
}
</style>
<style scoped>
input[type="radio"]+span,
input[type="checkbox"]+span {
  display: inline-block;
  width: 45px;
  font-size: 11px;
  color: black;
  background-color: gray;
  border-radius: 5px;
  padding: 2px 0;
  margin: 2px 1px;
}

input[type="radio"]:checked+span,
input[type="checkbox"]:checked+span {
  background-color: whitesmoke;
}

label.number-of-teams input[type="number"] {
  padding-left: 1rem;
  width: 6rem;
}

.data-control button {
  width: 11rem;
}

input.search {
  margin-right: 10px;
  padding-left: 4px;
}

ul.usage {
  text-align: left;
}

dl.history {
  text-align: left;
}

div.team-tags-area {
  margin: 8px;
}

div.team-tags-area label input[type="checkbox"]+span {
  display: inline-block;
  width: auto;
  margin: 2px 3px;
  padding: 2px 8px;
  font-size: 2rem;
  color: black;
  background-color: whitesmoke;
  border: 1px solid gray;
  border-radius: 5px;
}

div.team-tags-area label input[type="checkbox"]:checked+span {
  background-color: gold;
}
</style>
