<template>
  <div class="elemental-resonance">
    <label v-for="item in elementalResonanceList" :key="item.key">
      <input
        type="checkbox"
        v-model="elementalResonanceCheckedRea[item.key]"
        @change="onChange(item.key)"
      />
      <span>{{ displayName(item.名前) }}</span>
    </label>
  </div>
</template>

<script lang="ts">
import GlobalMixin from "@/GlobalMixin.vue";
import { ELEMENTAL_RESONANCE_MASTER_LIST } from "@/master";
import { defineComponent, PropType, reactive } from "vue";

export default defineComponent({
  name: "ElementalResonanceInput",
  mixins: [GlobalMixin],
  emits: ["update:elemental-resonance"],
  props: {
    elementalResonanceChecked: {
      type: Object as PropType<{ [key: string]: boolean }>,
      require: true,
    },
  },
  setup(props, context) {
    const elementalResonanceList = ELEMENTAL_RESONANCE_MASTER_LIST;
    const elementalResonanceCheckedRea = reactive(
      props.elementalResonanceChecked ?? ({} as { [key: string]: boolean })
    );

    const onChange = (key: string) => {
      if (elementalResonanceCheckedRea[key]) {
        if (key == "元素共鳴なし") {
          for (const name of Object.keys(elementalResonanceCheckedRea).filter(
            (s) => s != "元素共鳴なし"
          )) {
            elementalResonanceCheckedRea[name] = false;
          }
        } else {
          if (
            Object.keys(elementalResonanceCheckedRea).filter(
              (s) => s != "元素共鳴なし" && elementalResonanceCheckedRea[s]
            ).length > 2
          ) {
            elementalResonanceCheckedRea[key] = false;
          }
          elementalResonanceCheckedRea["元素共鳴なし"] = false;
        }
      }
      context.emit("update:elemental-resonance", elementalResonanceCheckedRea);
    };

    return {
      elementalResonanceList,
      elementalResonanceCheckedRea,
      onChange,
    };
  },
});
</script>
<style scoped>
div.elemental-resonance {
  margin-top: 10px;
}

label {
  display: inline-block;
}
</style>
