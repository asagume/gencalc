<template></template>

<script lang="ts">
import GlobalMixin from "@/GlobalMixin.vue";
import { computed, defineComponent } from "vue";

export default defineComponent({
  name: "ElementalResonanceInput",
  mixins: [GlobalMixin],
  props: {
    characterInput: { type: Object, require: true },
    conditionInput: { type: Object, require: true },
  },
  setup(props) {
    const elementalResonanceList = computed(() => ELEMENTAL_RESONANCE_MASTER_LIST);

    return {
      elementalResonanceList,
    };
  },
});
</script>
<style scoped></style>
