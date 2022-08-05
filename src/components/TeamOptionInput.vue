<template>
  <fieldset>
    <div v-for="item in supporterList" :key="item.key">
      {{ item.key }}
    </div>
  </fieldset>
</template>

<script lang="ts">
import GlobalMixin from "@/GlobalMixin.vue";
import { TEAM_OPTION_MASTER_LIST } from "@/master";
import { computed, defineComponent } from "vue";

export default defineComponent({
  name: "TeamOptionInput",
  mixins: [GlobalMixin],
  props: {
    characterInput: { type: Object, require: true },
    conditionInput: { type: Object, require: true },
  },
  setup() {
    const supporterList = computed(() => {
      const result = [] as any;
      for (const entry of TEAM_OPTION_MASTER_LIST) {
        result.push({ key: entry.key });
      }
      return result;
    });

    return {
      supporterList,
    };
  },
});
</script>
<style scoped></style>
