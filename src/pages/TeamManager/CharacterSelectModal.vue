<template>
  <CharacterSelect :visible="true" :characters="characters" @update:characters="updateCharacters" />

  <hr />

  <div class="tags">
    <span class="tag">MAIN DPS</span>
    <span class="tag">SUB DPS</span>
    <span class="tag">SUPPORTER</span>
    <span class="tag">FREE</span>
  </div>

  <div>
    <div class="member" v-for="member in members" :key="member.id">
      <MemberItem :member="member" />
    </div>
  </div>

  <div>
    <button type="button" @click="cancelOnClick">cancel</button>
    <button type="button" @click="okOnClick">ok</button>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, reactive, watch } from "vue";
import CharacterSelect from "@/components/CharacterSelect.vue";
import { TMember } from "./team";
import MemberItem from "./MemberItem.vue";

export default defineComponent({
  name: "CharacterSelectModal",
  components: {
    CharacterSelect,
    MemberItem
},
  props: {
    visible: { type: Boolean, required: true },
    memberNames: { type: Array as PropType<string[]>, required: true },
  },
  emits: ["click:cancel", "click:ok"],
  setup(props, context) {
    const characters = reactive(props.memberNames);

    watch(props, (newVal) => {
      if (newVal.memberNames) {
        const newValStr = JSON.stringify(newVal.memberNames);
        const oldValStr = JSON.stringify(characters);
        if (newValStr != oldValStr) {
          characters.splice(0, characters.length, ...newVal.memberNames);
        }
      }
    });

    const updateCharacters = (newCharacters: string[]) => {
      characters.splice(0, characters.length, ...newCharacters);
    };

    const members = computed(() => {
      const result: TMember[] = [];
      let id = 0;
      characters.forEach(character => {
        result.push({
          id: id++,
          name: character,
          buildname: undefined,
          savedata: undefined,
        });
      });
      return result;
    });

    const cancelOnClick = () => {
      context.emit("click:cancel");
    };

    const okOnClick = () => {
      context.emit("click:ok", characters);
    };

    return {
      characters,
      members,

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
  background-color: dimgray;
  border: 2px solid whitesmoke;
  border-radius: 3px;
  margin: 1px 3px;
}

div.member {
  display: inline-block;
  width: 90px;
}
</style>
