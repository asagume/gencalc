<template>
  <fieldset>
    <div v-for="item in optionList" :key="item.key">
      {{ item.key }}
    </div>
  </fieldset>
</template>

<script lang="ts">
import GlobalMixin from "@/GlobalMixin.vue";
import { OPTION1_MASTER_LIST, OPTION2_MASTER, OPTION2_MASTER_LIST } from "@/master";
import { computed, defineComponent } from "vue";

export default defineComponent({
  name: "MiscOptionInput",
  mixins: [GlobalMixin],
  props: {
    characterInput: { type: Object, require: true },
    conditionInput: { type: Object, require: true },
  },
  setup() {
    const optionList = computed(() => {
      const result = [] as any;
      for (const optionMaster of [OPTION1_MASTER_LIST, OPTION2_MASTER_LIST]) {
        for (const entry of optionMaster) {
          result.push({ key: entry.key });
        }
      }
      return result;
    });

    return {
      optionList,
    };
  },
});
</script>
