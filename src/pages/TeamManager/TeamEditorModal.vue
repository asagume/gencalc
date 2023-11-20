<template>
  <template v-if="!characterSelectMode">
    <CharacterSelect :visible="true" :characters="characters" @update:characters="updateCharacters" />
  </template>
  <template v-else>
    <CharacterSelect :visible="true" :characters="replacements" @update:characters="updateReplacements" />
  </template>
  <hr />
  <table>
    <tr>
      <th>Team Name</th>
      <td>
        <input v-model="workTeam.name" type="text" minlength="1" maxlength="16" placeholder="INPUT TEAM NAME" />
      </td>
    </tr>
    <tr>
      <th>Character Select Mode</th>
      <td>
        <button class="character-select-mode" @click="characterSelectModeOnClick">
          {{ characterSelectMode ? 'REPLACEMENTS' : 'MEMBERS' }}
        </button>
      </td>
    </tr>
    <tr>
      <td colspan="2" class="character-select-mode">
        <span v-if="!characterSelectMode">
          チームメンバーを選択して下さい
        </span>
        <span v-else>
          {{ selectedMemberName() + 'の代替キャラクターを選択して下さい' }}
        </span>
      </td>
    </tr>
    <tr class="member-tags">
      <td colspan="2">
        <span :class="'tag' + tagSelectedClass(tag)" v-for="tag in MEMBER_TAG_LIST" :key="tag" @click="tagOnClick(tag)">{{
          tag
        }}</span>
      </td>
    </tr>
    <tr class="members">
      <td colspan="2">
        <div :class="'member' + memberSelectedClass(member.id)" v-for="member in workTeam.members" :key="member.id">
          <MemberItem :member="member" @click="memberOnClick(member.id)" />
        </div>

        <div class="buildname-select">
          <select v-show="buildnames.length" v-model="selectedMemberBuildname" @change="buildnameOnChange">
            <option v-for="value in buildnames" :key="value" :value="value">{{ value }}</option>
          </select>
        </div>
      </td>
    </tr>
    <tr>
      <th>Short Note</th>
      <td>
        <input class="description" v-model="workTeam.description" type="text" maxlength="40" placeholder="INPUT NOTE" />
      </td>
    </tr>
    <tr class="team-tags">
      <td colspan="2">
        <span :class="teamTagSelected(tag) ? 'tag selected' : 'tag'" v-for="tag in workTeamTags" :key="tag"
          @click="teamTagOnClick(tag)">{{ tag }}</span>
      </td>
    </tr>
    <tr>
      <th>Tags</th>
      <td>
        <input class="team-tags" v-model="txtTeamTags" type="text" maxlength="40" placeholder="INPUT TAGS"
          @change="txtTeamTagsOnChange" />
      </td>
    </tr>
  </table>

  <div class="buttons">
    <button type="button" @click="cancelOnClick">cancel</button>
    <button type="button" @click="okOnClick">ok</button>
  </div>
</template>
<script lang="ts">
import _ from 'lodash';
import { computed, defineComponent, PropType, reactive, ref, watch } from 'vue';
import { makeDefaultBuildname } from '@/input';
import CharacterSelect from '@/components/CharacterSelect.vue';
import { getBuildnameFromStorageKey, getBuildStorageKeys, TMember, TTeam } from './team';
import MemberItem from './MemberItem.vue';

export default defineComponent({
  name: 'TeamEditorModal',
  components: {
    CharacterSelect,
    MemberItem,
  },
  props: {
    visible: { type: Boolean, required: true },
    team: { type: Object as PropType<TTeam>, required: true },
    teamTags: { type: Array as PropType<string[]> },
  },
  emits: ['click:cancel', 'click:ok'],
  setup(props, context) {
    const characterSelectMode = ref(false); // キャラクター選択モード=メンバー選択
    const workTeam = reactive({
      id: -1,
      name: '',
      members: [],
      description: '',
      rotation: [],
      rotationDescription: '',
      tags: [],
    } as TTeam);
    const selectedMemberId = ref(-1);
    const MEMBER_TAG_LIST = ['Main-DPS', 'Sub-DPS', 'Support', 'Carry', 'Driver', 'Enabler', 'Healer', 'Shielder', 'Battery', 'Free', 'Flex'];
    const selectedMemberBuildname = ref('' as string | undefined);
    const replacementIndex = ref(-1);
    const txtTeamTags = ref('');
    const workTeamTags = reactive([] as string[]);

    function duplicateTeam() {
      workTeam.id = props.team.id;
      workTeam.name = props.team.name;
      const work: TMember[] = [];
      for (let i = 0; i < props.team.members.length; i++) {
        work.push({
          id: i,
          name: props.team.members[i].name,
          buildname: props.team.members[i].buildname,
          builddata: props.team.members[i].builddata,
          tags: _.cloneDeep(props.team.members[i].tags.filter(s => MEMBER_TAG_LIST.includes(s))),
          replacements: props.team.members[i].replacements ? [...props.team.members[i].replacements] : [],
        });
      }
      workTeam.members.splice(0, workTeam.members.length, ...work);
      workTeam.description = props.team.description;
      workTeam.rotation = _.cloneDeep(props.team.rotation);
      workTeam.tags = _.clone(props.team.tags);
    }
    duplicateTeam();
    setupTxtTeamTags();

    watch(props, (newVal) => {
      if (newVal.team.members) {
        duplicateTeam();
        if (selectedMemberId.value >= 0 && selectedMemberId.value < workTeam.members.length) {
          selectedMemberBuildname.value = workTeam.members[selectedMemberId.value].buildname;
        }
      }
      if (newVal.teamTags) {
        workTeamTags.splice(0, workTeamTags.length, ...newVal.teamTags);
      }
      setupTxtTeamTags();
      characterSelectMode.value = false;
    });

    const characters = computed(() => workTeam.members.map((s) => s.name));

    const replacements = computed(() => {
      let result = [] as string[];
      if (selectedMemberId.value >= 0 && selectedMemberId.value < workTeam.members.length) {
        const member = workTeam.members[selectedMemberId.value];
        result = [...member.replacements];
        for (let i = result.length; i < 2; i++) {
          result.push('');
        }
      }
      return result;
    });

    const updateCharacters = (newCharacters: string[]) => {
      for (let i = 0; i < newCharacters.length; i++) {
        if (workTeam.members[i].name != newCharacters[i]) {
          workTeam.members[i].tags = [];
          workTeam.members[i].replacements = [];
        }
        workTeam.members[i].name = newCharacters[i];
        if (workTeam.members[i].name) {
          const workBuildnames = getBuildStorageKeys(workTeam.members[i].name).map(s => getBuildnameFromStorageKey(s));
          if (workBuildnames.length) {
            if (!workTeam.members[i].buildname || !workBuildnames.includes(workTeam.members[i].buildname as string)) {
              workTeam.members[i].buildname = makeDefaultBuildname(workTeam.members[i].name);
            }
            if (i == selectedMemberId.value) {
              selectedMemberBuildname.value = workTeam.members[i].buildname;
            }
          } else {
            workTeam.members[i].buildname = undefined;
          }
        }
      }
    };

    const characterSelectModeOnClick = () => {
      if (selectedMemberId.value >= 0 && selectedMemberId.value < workTeam.members.length && workTeam.members[selectedMemberId.value].name) {
        characterSelectMode.value = !characterSelectMode.value;
      }
    };

    const memberOnClick = (id: number) => {
      selectedMemberId.value = id;
      if (selectedMemberId.value >= 0 && selectedMemberId.value < workTeam.members.length) {
        const member = workTeam.members[selectedMemberId.value];
        selectedMemberBuildname.value = member.buildname;
        replacementIndex.value = -1;
      }
      characterSelectMode.value = false;  // メンバー選択
    };
    const memberSelectedClass = (id: number) =>
      id == selectedMemberId.value ? ' selected' : '';
    const selectedMemberName = () => {
      if (selectedMemberId.value >= 0 && selectedMemberId.value < workTeam.members.length) {
        return workTeam.members[selectedMemberId.value].name;
      }
      return '';
    };

    const tagOnClick = (tag: string) => {
      if (selectedMemberId.value < 0 || selectedMemberId.value >= workTeam.members.length)
        return;
      const member = workTeam.members[selectedMemberId.value];
      if (member && member.name) {
        const tags = member.tags;
        if (tags) {
          if (tags.includes(tag)) {
            tags.splice(0, tags.length, ...tags.filter((s) => s != tag));
          } else {
            tags.push(tag);
          }
        }
      }
    };
    const tagSelectedClass = (tag: string) => {
      let result = false;
      if (selectedMemberId.value >= 0 || selectedMemberId.value < workTeam.members.length) {
        const member = workTeam.members[selectedMemberId.value];
        if (member && member.name) {
          result = member.tags.includes(tag);
        }
      }
      return result ? ' selected' : '';
    };

    const buildnames = computed(() => {
      let result: string[] = [];
      if (selectedMemberId.value >= 0 && selectedMemberId.value < workTeam.members.length) {
        const member = workTeam.members[selectedMemberId.value];
        const character = member.name;
        if (character) {
          result = getBuildStorageKeys(character).map((s) =>
            getBuildnameFromStorageKey(s)
          );
          const defaultBuildname = makeDefaultBuildname(character);
          if (result.includes(defaultBuildname)) {
            const others = result.filter((s) => s != defaultBuildname).sort();
            if (others.length) {
              result = [defaultBuildname, ...others];
            }
          }
        }
      }
      return result;
    });

    const buildnameOnChange = () => {
      if (selectedMemberId.value < 0 || selectedMemberId.value >= workTeam.members.length) return;
      const member = workTeam.members[selectedMemberId.value];
      member.buildname = selectedMemberBuildname.value;
    };

    const updateReplacements = (newCharacters: string[]) => {
      const member = workTeam.members[selectedMemberId.value];
      member.replacements = [...newCharacters];
    };

    function setupTxtTeamTags() {
      txtTeamTags.value = workTeam.tags.join(' ');
    }

    const txtTeamTagsOnChange = () => {
      let result: string[] = [];
      if (txtTeamTags.value) {
        result = txtTeamTags.value.split(/\s+/).filter(tag => tag);
      }
      workTeam.tags = result;
    }

    const teamTagSelected = (tag: string) => workTeam.tags.includes(tag);

    const teamTagOnClick = (tag: string) => {
      if (teamTagSelected(tag)) {
        workTeam.tags.splice(0, workTeam.tags.length, ...workTeam.tags.filter(s => s != tag));
      } else {
        workTeam.tags.push(tag);
      }
      setupTxtTeamTags();
    }

    const cancelOnClick = () => {
      context.emit('click:cancel');
    };

    const okOnClick = () => {
      context.emit('click:ok', workTeam);
    };

    return {
      characterSelectMode,
      characters,
      replacements,
      MEMBER_TAG_LIST,

      characterSelectModeOnClick,
      selectedMemberId,
      selectedMemberName,

      tagOnClick,
      tagSelectedClass,

      workTeam,
      workTeamTags,
      txtTeamTags,
      txtTeamTagsOnChange,
      teamTagSelected,
      teamTagOnClick,
      memberOnClick,
      memberSelectedClass,
      selectedMemberBuildname,
      buildnames,
      buildnameOnChange,
      updateReplacements,

      updateCharacters,
      cancelOnClick,
      okOnClick,
    };
  },
});
</script>
<style scoped>
.modal {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  /* background-color: rgba(0, 0, 0, .5); */
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: transparent;
  justify-content: center;
  width: 100%;
  height: calc(100vh);
  vertical-align: top;
}

.modal-content {
  height: 100vh;
  padding: 20px 10px;
  width: calc(100% - 26px);
  background-color: rgb(63, 10, 10);
  border: 3px double gold;
  border-radius: 20px;
  z-index: 1000;
  overflow-y: auto;
}

table {
  width: 100%;
  table-layout: fixed;
}

table th {
  font-size: 3rem;
  font-weight: bold;
  color: rgb(225, 144, 56);
  text-align: right;
  width: 40%;
}

table td {
  text-align: left;
}

table td[colspan="2"] {
  text-align: center;
}

table tr.member-tags td,
table tr.team-tags td {
  padding: 10px;
}

button {
  font-size: 3rem;
  width: 20rem;
  margin: 5px;
}

input {
  padding-left: 1rem;
}

td input[type="text"] {
  font-size: 3rem;
  width: 63rem;
}

.tags {
  margin: 5px 3px;
}

span.tag {
  display: inline-block;
  height: 12px;
  font-size: 10px;
  background: linear-gradient(to top, #3d3d3b, #141414);
  border: 1px solid whitesmoke;
  border-radius: 3px;
  margin: 3px 3px;
  vertical-align: middle;
  padding-top: 1px;
}

span.tag.selected {
  border-color: gold;
}

.member-tags span.tag {
  width: 70px;
}

.team-tags span.tag {
  width: auto;
  padding-left: 5px;
  padding-right: 5px;
}

div.member {
  display: inline-block;
  width: 80px;
}

div.member.selected {
  background-color: gold;
}

div.buildname-select {
  height: 40px;
  padding-top: 10px;
}

div.buildname-select select {
  width: 220px;
}

button.character-select-mode {
  min-width: 30rem;
}

td.character-select-mode {
  font-size: 2.5rem;
  font-weight: bold;
  color: rgb(225, 144, 56);
}

div.buttons {
  margin: 20px;
}
</style>
