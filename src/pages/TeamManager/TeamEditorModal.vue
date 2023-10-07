<template>
  <template v-if="!characterSelectMode">
    <CharacterSelect :visible="true" :characters="characters" @update:characters="updateCharacters" />
  </template>
  <template v-else>
    <CharacterSelect :visible="true" :characters="replacements" @update:characters="updateReplacements" />
  </template>

  <hr />

  <div class="input-name">
    Team Name:
    <input v-model="workTeam.name" type="text" minlength="1" maxlength="16" placeholder="INPUT TEAM NAME" />
  </div>

  <div class="character-select-mode">
    Character Select Mode:
    <button class="character-select-mode" @click="characterSelectModeOnClick">
      {{ characterSelectMode ? 'REPLACEMENTS' : 'MEMBERS' }}
    </button>
    <div>
      <span v-if="!characterSelectMode">
        チームメンバーを選択して下さい
      </span>
      <span v-else>
        {{ selectedMemberName() + 'の代替キャラクターを選択して下さい' }}
      </span>
    </div>
  </div>

  <div class="tags">
    <span :class="'tag' + tagSelectedClass(tag)" v-for="tag in TAG_LIST" :key="tag" @click="tagOnClick(tag)">{{
      tag
    }}</span>
  </div>

  <div>
    <div :class="'member' + memberSelectedClass(member.id)" v-for="member in workTeam.members" :key="member.id">
      <MemberItem :member="member" @click="memberOnClick(member.id)" />
    </div>

    <div class="buildname-select">
      <select v-show="buildnames.length" v-model="selectedMemberBuildname" @change="buildnameOnChange">
        <option v-for="value in buildnames" :key="value" :value="value">{{ value }}</option>
      </select>
    </div>
  </div>

  <div class="input-description">
    Short Note:
    <input class="description" v-model="workTeam.description" type="text" maxlength="40" placeholder="INPUT NOTE" />
  </div>

  <div class="buttons">
    <button type="button" @click="cancelOnClick">cancel</button>
    <button type="button" @click="okOnClick">ok</button>
  </div>
</template>
<script lang="ts">
import _ from 'lodash';
import { computed, defineComponent, PropType, reactive, ref, watch } from 'vue';
import CharacterSelect from '@/components/CharacterSelect.vue';
import { getBuildnameFromStorageKey, getBuildStorageKeys, TMember, TTeam } from './team';
import MemberItem from './MemberItem.vue';
import { makeDefaultBuildname } from '@/input';

export default defineComponent({
  name: 'TeamEditorModal',
  components: {
    CharacterSelect,
    MemberItem,
  },
  props: {
    visible: { type: Boolean, required: true },
    team: { type: Object as PropType<TTeam>, required: true },
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
    } as TTeam);
    const selectedMemberId = ref(-1);
    const TAG_LIST = ['Main-DPS', 'Carry', 'Sub-DPS', 'Support', 'Driver', 'Enabler', 'Battery', 'Free'];
    const selectedMemberBuildname = ref('' as string | undefined);
    const replacementIndex = ref(-1);

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
          tags: _.cloneDeep(props.team.members[i].tags.filter(s => TAG_LIST.includes(s))),
          replacements: props.team.members[i].replacements ? [...props.team.members[i].replacements] : [],
        });
      }
      workTeam.members.splice(0, workTeam.members.length, ...work);
      workTeam.description = props.team.description;
      workTeam.rotation = props.team.rotation;
    }
    duplicateTeam();

    watch(props, (newVal) => {
      if (newVal.team.members) {
        duplicateTeam();
        if (selectedMemberId.value >= 0 && selectedMemberId.value < workTeam.members.length) {
          selectedMemberBuildname.value = workTeam.members[selectedMemberId.value].buildname;
        }
      }
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
      TAG_LIST,

      characterSelectModeOnClick,
      selectedMemberId,
      selectedMemberName,

      tagOnClick,
      tagSelectedClass,

      workTeam,
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

button {
  font-size: 3rem;
  width: 20rem;
  margin: 5px;
}

div.input-name,
div.input-description {
  font-size: 3rem;
  font-weight: bold;
  color: rgb(225, 144, 56);
}

input {
  padding-left: 1rem;
}

input.description {
  width: 63rem;
}

div.tags {
  margin: 5px 3px;
}

span.tag {
  display: inline-block;
  width: 70px;
  height: 12px;
  font-size: 10px;
  background: linear-gradient(to top, #3d3d3b, #141414);
  border: 1px solid whitesmoke;
  border-radius: 3px;
  margin: 3px 3px;
}

span.tag.selected {
  border-color: gold;
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

div.character-select-mode {
  font-size: 3rem;
  font-weight: bold;
  color: rgb(225, 144, 56);
}

button.character-select-mode {
  min-width: 30rem;
}

div.character-select-mode span {
  font-size: 2.5rem;
}

div.buttons {
  margin: 20px;
}
</style>
