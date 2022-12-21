<template>
  <div class="artifact">
    <table class="artifact">
      <tr>
        <td style="width: 45%">
          <div class="with-tooltip">
            <img class="artifact-icon" :src="artifactImgSrc" :alt="displayName(workArtifact.name)">
            <div class="tooltip">{{ displayName(workArtifact.name) }}</div>
          </div>
          <div v-if="isEditing">
            <select v-model="editMainStat" @change="mainStatOnChange">
              <option v-for="option in mainStatOptions" :key="option" :value="option">
                {{ displayName(option) }}
              </option>
            </select>
          </div>
          <div v-else>
            {{ displayName(workArtifact.mainStat).replace(/%$/, '') + '+' + displayStatValue(workArtifact.mainStat,
                workArtifact.mainStatValue)
            }}
          </div>
          <div style="margin-top: 5px">
            <button v-show="controls?.includes('edit')" class="control" type="button" @click="isEditing = !isEditing">
              <span v-if="isEditing" class="material-symbols-outlined"> edit_off </span>
              <span v-else class="material-symbols-outlined"> edit </span>
            </button>
            <button v-show="controls?.includes('change')" class="control" type="button">
              <span class="material-symbols-outlined"> change_circle </span>
            </button>
            <div v-show="controls?.includes('remove')">
              <button class="control" type="button">
                <span class="material-symbols-outlined"> delete </span>
              </button>
            </div>
          </div>
        </td>
        <td style="width: 55%">
          <table class="artifact-substat">
            <tr v-for="(subStat, index) in workArtifact.subStats" :key="index">
              <template v-if="isEditing">
                <td class="right">
                  <select v-if="isEditing" v-model="subStat.name" @change="onChange">
                    <option v-for="option in subStatOptions" :key="option" :value="option"
                      :disabled="subStatOptionDisabled(option, subStat.name)">
                      {{ displayName(option) }}
                    </option>
                  </select>
                  <span v-else>
                    {{ displayName(subStat.name) }}
                  </span>
                </td>
                <td class="right">
                  <input type="number" v-model="subStat.value" min="0" @change="onChange">
                </td>
              </template>
              <td v-else>
                {{ displayName(subStat.name).replace(/%$/, '') + '+' + displayStatValue(subStat.name, subStat.value) }}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { overwriteObject } from "@/common";
import { TArtifact, 聖遺物サブ効果ARRAY, 聖遺物メイン効果_時の砂ARRAY, 聖遺物メイン効果_死の羽ARRAY, 聖遺物メイン効果_理の冠ARRAY, 聖遺物メイン効果_生の花ARRAY, 聖遺物メイン効果_空の杯ARRAY } from "@/input";
import { ARTIFACT_MAIN_MASTER, getArtifactIconUrl } from "@/master";
import { computed, defineComponent, PropType, reactive, ref, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
  name: 'ArtifactItem',
  props: {
    artifact: { type: Object as PropType<TArtifact>, required: true },
    id: { type: Number },
    controls: { type: Array as PropType<string[]> }
  },
  emits: ['change:article'],
  setup(props, context) {
    const { displayName, displayStatValue } = CompositionFunction();

    const workArtifact = reactive(props.artifact);
    const editMainStat = ref(makeEditMainStat(props.artifact));
    const isEditing = ref(false);

    function makeEditMainStat(artifact: TArtifact) {
      return artifact.rarity + '_' + artifact.mainStat;
    }

    const artifactImgSrc = computed(() => {
      return getArtifactIconUrl(workArtifact.setname, workArtifact.cat_id);
    });

    const MAINSTAT_CAT_ARR = {
      '1': 聖遺物メイン効果_生の花ARRAY,
      '2': 聖遺物メイン効果_死の羽ARRAY,
      '3': 聖遺物メイン効果_時の砂ARRAY,
      '4': 聖遺物メイン効果_空の杯ARRAY,
      '5': 聖遺物メイン効果_理の冠ARRAY,
    };

    const mainStatOptions = computed(() => {
      return (MAINSTAT_CAT_ARR as any)[workArtifact.cat_id];
    });

    const subStatOptions = computed(() => {
      return 聖遺物サブ効果ARRAY;
    });

    const subStatOptionDisabled = ((value: string, selected: string) => {
      if (value == selected) return false;
      const work = workArtifact.subStats.map(s => s.name);
      return work.includes(value);
    });

    const onChange = () => {
      context.emit('change:article', props.id, workArtifact);
    };

    const mainStatOnChange = () => {
      if (workArtifact.mainStat) {
        const work = workArtifact.mainStat.split('_');
        const rarity = work[0];
        const stat = work[1];
        workArtifact.mainStatValue = (ARTIFACT_MAIN_MASTER as any)[rarity][stat];
      }
      onChange();
    };

    watch(props, (newVal) => {
      overwriteObject(workArtifact, newVal.artifact);
      editMainStat.value = makeEditMainStat(workArtifact);
    });

    return {
      displayName, displayStatValue,

      workArtifact,
      isEditing,
      editMainStat,

      artifactImgSrc,
      mainStatOptions,
      subStatOptions,
      subStatOptionDisabled,

      onChange,
      mainStatOnChange,
    }
  }
});
</script>

<style scoped>
div.artifact {
  display: inline-block;
  width: 45%;
  min-width: 60rem;
  margin: 2px;
}

table.artifact {
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  table-layout: fixed;
  border-spacing: 0;
}

table.artifact thead th {
  color: orange;
  border-bottom: 2px solid whitesmoke;
}

table.artifact-substat {
  width: 100%;
  border-spacing: 0;
}

table.artifact tr td {
  vertical-align: top;
  border-bottom: 2px solid whitesmoke;
  padding: 3px;
  white-space: nowrap;
}

table.artifact-substat tr td {
  vertical-align: middle;
  border-bottom: 1px solid gray;
  padding: 0px 3px;
  line-height: 3.4rem;
  text-align: left;
}

table.artifact-substat tr:last-child td {
  border-bottom: none;
}

table.artifact-substat td.right {
  text-align: right;
}

input[type="number"] {
  width: 10rem;
  margin: auto;
  padding: 0 1px;
}

img.artifact-icon {
  width: 7.2rem;
  height: 7.2rem;
}

button.control {
  display: inline-block;
  width: calc(100% / 6);
  padding: 1px;
  margin: 1px;
  border: none;
  background-color: transparent;
  color: gray;
}

button.control span {
  font-size: 2.4rem;
}
</style>