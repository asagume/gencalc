<template></template>

<script lang="ts">
import GlobalMixin from "@/GlobalMixin.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "TeamOptionInput",
  mixins: [GlobalMixin],
  props: {
    characterInput: { type: Object, require: true },
    conditionInput: { type: Object, require: true },
  },
  setup(props) {},
});
</script>
<style scoped></style>
