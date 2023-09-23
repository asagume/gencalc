<template>
  <template v-if="!characterSelectMode">
    <CharacterSelect :visible="true" :characters="characters" @update:characters="updateCharacters" />
  </template>
  <template v-else>
    <CharacterSelect :visible="true" :characters="replacements" @update:characters="updateReplacements" />
  </template>

  <hr />

  <div class="character-select-mode">
    Character Select Mode:
    <button class="character-select-mode" @click="characterSelectModeOnClick">
      {{ characterSelectMode ? 'REPLACEMENTS' : 'MEMBER' }}
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
    <div :class="'member' + memberSelectedClass(member.id)" v-for="member in workMembers" :key="member.id">
      <MemberItem :member="member" @click="memberOnClick(member.id)" />
    </div>

    <div class="buildname-select">
      <select v-show="buildnames.length" v-model="selectedMemberBuildname" @change="buildnameOnChange">
        <option v-for="value in buildnames" :key="value" :value="value">{{ value }}</option>
      </select>
    </div>
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
import { getBuildnameFromStorageKey, getBuildStorageKeys, TMember } from './team';
import MemberItem from './MemberItem.vue';
import { makeDefaultBuildname } from '@/input';

export default defineComponent({
  name: 'CharacterSelectModal',
  components: {
    CharacterSelect,
    MemberItem,
  },
  props: {
    visible: { type: Boolean, required: true },
    members: { type: Array as PropType<TMember[]>, required: true },
  },
  emits: ['click:cancel', 'click:ok'],
  setup(props, context) {
    const characterSelectMode = ref(false); // キャラクター選択モード=メンバー選択
    const workMembers = reactive([] as TMember[]);
    const selectedMemberId = ref(-1);
    const TAG_LIST = ['Main-DPS', 'Carry', 'Sub-DPS', 'Support', 'Driver', 'Enabler', 'Battery', 'Free'];
    const selectedMemberBuildname = ref('' as string | undefined);
    const replacementIndex = ref(-1);

    function duplicateMembers() {
      const work: TMember[] = [];
      for (let i = 0; i < props.members.length; i++) {
        work.push({
          id: i,
          name: props.members[i].name,
          buildname: props.members[i].buildname,
          builddata: props.members[i].builddata,
          tags: _.cloneDeep(props.members[i].tags.filter(s => TAG_LIST.includes(s))),
          replacements: props.members[i].replacements ? [...props.members[i].replacements] : [],
        });
      }
      workMembers.splice(0, workMembers.length, ...work);
    }
    duplicateMembers();

    watch(props, (newVal) => {
      if (newVal.members) {
        duplicateMembers();
        if (selectedMemberId.value >= 0 && selectedMemberId.value < workMembers.length) {
          selectedMemberBuildname.value = workMembers[selectedMemberId.value].buildname;
        }
      }
      characterSelectMode.value = false;
    });

    const characters = computed(() => workMembers.map((s) => s.name));

    const replacements = computed(() => {
      let result = [] as string[];
      if (selectedMemberId.value >= 0 && selectedMemberId.value < workMembers.length) {
        const member = workMembers[selectedMemberId.value];
        result = [...member.replacements];
        for (let i = result.length; i < 2; i++) {
          result.push('');
        }
      }
      return result;
    });

    const updateCharacters = (newCharacters: string[]) => {
      for (let i = 0; i < newCharacters.length; i++) {
        if (workMembers[i].name != newCharacters[i]) {
          workMembers[i].replacements = [];
        }
        workMembers[i].name = newCharacters[i];
        if (workMembers[i].name) {
          const workBuildnames = getBuildStorageKeys(workMembers[i].name).map(s => getBuildnameFromStorageKey(s));
          if (workBuildnames.length) {
            if (!workMembers[i].buildname || !workBuildnames.includes(workMembers[i].buildname as string)) {
              workMembers[i].buildname = makeDefaultBuildname(workMembers[i].name);
            }
            if (i == selectedMemberId.value) {
              selectedMemberBuildname.value = workMembers[i].buildname;
            }
          } else {
            workMembers[i].buildname = undefined;
          }
        }
      }
    };

    const characterSelectModeOnClick = () => {
      if (selectedMemberId.value >= 0 && selectedMemberId.value < workMembers.length && workMembers[selectedMemberId.value].name) {
        characterSelectMode.value = !characterSelectMode.value;
      }
    };

    const memberOnClick = (id: number) => {
      selectedMemberId.value = id;
      if (selectedMemberId.value >= 0 && selectedMemberId.value < workMembers.length) {
        const member = workMembers[selectedMemberId.value];
        selectedMemberBuildname.value = member.buildname;
        replacementIndex.value = -1;
      }
      characterSelectMode.value = false;  // メンバー選択
    };
    const memberSelectedClass = (id: number) =>
      id == selectedMemberId.value ? ' selected' : '';
    const selectedMemberName = () => {
      if (selectedMemberId.value >= 0 && selectedMemberId.value < workMembers.length) {
        return workMembers[selectedMemberId.value].name;
      }
      return '';
    };

    const tagOnClick = (tag: string) => {
      if (selectedMemberId.value < 0 || selectedMemberId.value >= workMembers.length)
        return;
      const member = workMembers[selectedMemberId.value];
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
      if (selectedMemberId.value >= 0 || selectedMemberId.value < workMembers.length) {
        const member = workMembers[selectedMemberId.value];
        if (member && member.name) {
          result = member.tags.includes(tag);
        }
      }
      return result ? ' selected' : '';
    };

    const buildnames = computed(() => {
      let result: string[] = [];
      if (selectedMemberId.value >= 0 && selectedMemberId.value < workMembers.length) {
        const member = workMembers[selectedMemberId.value];
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
      if (selectedMemberId.value < 0 || selectedMemberId.value >= workMembers.length) return;
      const member = workMembers[selectedMemberId.value];
      member.buildname = selectedMemberBuildname.value;
    };

    const updateReplacements = (newCharacters: string[]) => {
      const member = workMembers[selectedMemberId.value];
      member.replacements = [...newCharacters];
    };

    const cancelOnClick = () => {
      context.emit('click:cancel');
    };

    const okOnClick = () => {
      context.emit('click:ok', workMembers);
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

      workMembers,
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

span.tag {
  display: inline-block;
  width: 70px;
  height: 12px;
  font-size: 10px;
  background: linear-gradient(to top, #3d3d3b, #141414);
  border: 1px solid whitesmoke;
  border-radius: 3px;
  margin: 10px 3px;
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
