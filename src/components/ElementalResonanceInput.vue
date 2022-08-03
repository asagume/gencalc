<template>
  <div>
    <label v-for="item in elementalResonanceList" :key="item.key">
      <input
        type="checkbox"
        v-model="elementalResonanceChecked[item.key]"
        @change="onChange(item.key)"
      />
      <span>{{ displayName(item.名前) }}</span>
    </label>
  </div>
</template>

<script lang="ts">
import GlobalMixin from "@/GlobalMixin.vue";
import { ELEMENTAL_RESONANCE_MASTER_LIST } from "@/master";
import { defineComponent, reactive } from "vue";

export default defineComponent({
  name: "ElementalResonanceInput",
  mixins: [GlobalMixin],
  emits: ["update:elemental-resonance"],
  setup(props, context) {
    const elementalResonanceList = ELEMENTAL_RESONANCE_MASTER_LIST;
    const elementalResonanceChecked = reactive({} as any);
    for (const elementalResonance of elementalResonanceList) {
      elementalResonanceChecked[elementalResonance.key] = false;
    }
    elementalResonanceChecked["元素共鳴なし"] = true;

    const onChange = (key: string) => {
      const count = Object.keys(elementalResonanceChecked).filter(
        (s) => s != "元素共鳴なし" && elementalResonanceChecked[s]
      ).length;
      if (count > 0) {
        elementalResonanceChecked["元素共鳴なし"] = false;
        if (count > 2) {
          elementalResonanceChecked[key] = false;
        }
      } else {
        elementalResonanceChecked["元素共鳴なし"] = true;
      }
      context.emit("update:elemental-resonance", elementalResonanceChecked);
    };

    return {
      elementalResonanceList,
      elementalResonanceChecked,
      onChange,
    };
  },
});
</script>
<style scoped>
label {
  display: inline-block;
}
</style>
