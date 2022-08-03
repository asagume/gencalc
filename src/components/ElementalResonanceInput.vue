<template>
  <div></div>
</template>

<script lang="ts">
import GlobalMixin from "@/GlobalMixin.vue";
import { ELEMENTAL_RESONANCE_MASTER_LIST } from "@/master";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  name: "ElementalResonanceInput",
  mixins: [GlobalMixin],
  props: {
    characterInput: { type: Object, require: true },
    conditionInput: { type: Object, require: true },
  },
  setup(props) {
    const characterInputRef = ref(props.characterInput);
    const conditionInputRef = ref(props.conditionInput);

    const elementalResonanceList = computed(() => ELEMENTAL_RESONANCE_MASTER_LIST);

    return {
      characterInputRef, conditionInputRef,
      elementalResonanceList,
    };
  },
});
</script>
<style scoped>
</style>
