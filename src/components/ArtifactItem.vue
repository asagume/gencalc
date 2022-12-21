<template>
  <div class="artifact">
    <table class="artifact">
      <tr>
        <td style="width: 45%">
          <div class="with-tooltip">
            <img class="artifact-icon" :src="artifactImgSrc" :alt="displayName(copiedArtifact.name)">
            <div class="tooltip">{{ displayName(copiedArtifact.name) }}</div>
          </div>
          <table class="edit-mainstat" v-if="isEditing">
            <tr>
              <td style="width: 60%">
                <select v-model="copiedArtifact.mainStat" @change="onChange">
                  <option v-for="option in mainStatOptions" :key="option" :value="option">
                    {{ displayName(option) }}
                  </option>
                </select>
              </td>
              <td>
                <input type="number" v-model="copiedArtifact.mainStatValue" min="0" @change="onChange">
              </td>
            </tr>
          </table>
          <div v-else>
            {{ displayName(copiedArtifact.mainStat).replace(/%$/, '') + '+' + displayStatValue(copiedArtifact.mainStat,
                copiedArtifact.mainStatValue)
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
            <tr v-for="(subStat, index) in copiedArtifact.subStats" :key="index">
              <template v-if="isEditing">
                <td class="right">
                  <select v-model="subStat.name" @change="onChange">
                    <option v-for="option in subStatOptions" :key="option" :value="option"
                      :disabled="subStatOptionDisabled(option, subStat.name)">
                      {{ displayName(option) }}
                    </option>
                  </select>
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
import _ from 'lodash';
import { overwriteObject } from "@/common";
import { TArtifact, 聖遺物サブ効果ARRAY, 聖遺物メイン効果_時の砂ARRAY, 聖遺物メイン効果_死の羽ARRAY, 聖遺物メイン効果_理の冠ARRAY, 聖遺物メイン効果_生の花ARRAY, 聖遺物メイン効果_空の杯ARRAY } from "@/input";
import { getArtifactIconUrl } from "@/master";
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

    const copiedArtifact = reactive(_.cloneDeep(props.artifact));
    const isEditing = ref(false);

    const artifactImgSrc = computed(() => {
      return getArtifactIconUrl(copiedArtifact.setname, copiedArtifact.cat_id);
    });

    const MAINSTAT_CAT_ARR = {
      '1': Array.from(new Set(聖遺物メイン効果_生の花ARRAY.map(s => s.replace(/^\d_/, '')))),
      '2': Array.from(new Set(聖遺物メイン効果_死の羽ARRAY.map(s => s.replace(/^\d_/, '')))),
      '3': Array.from(new Set(聖遺物メイン効果_時の砂ARRAY.map(s => s.replace(/^\d_/, '')))),
      '4': Array.from(new Set(聖遺物メイン効果_空の杯ARRAY.map(s => s.replace(/^\d_/, '')))),
      '5': Array.from(new Set(聖遺物メイン効果_理の冠ARRAY.map(s => s.replace(/^\d_/, '')))),
    };

    const mainStatOptions = computed(() => {
      return (MAINSTAT_CAT_ARR as any)[copiedArtifact.cat_id];
    });

    const subStatOptions = computed(() => {
      return 聖遺物サブ効果ARRAY;
    });

    const subStatOptionDisabled = ((value: string, selected: string) => {
      if (value == selected) return false;
      const work = copiedArtifact.subStats.map(s => s.name);
      return work.includes(value);
    });

    const onChange = () => {
      context.emit('change:article', props.id, copiedArtifact);
    };

    watch(props, (newVal) => {
      overwriteObject(copiedArtifact, newVal.artifact);
    });

    return {
      displayName, displayStatValue,

      copiedArtifact,
      isEditing,

      artifactImgSrc,
      mainStatOptions,
      subStatOptions,
      subStatOptionDisabled,

      onChange,
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

table.edit-mainstat {
  width: 100%;
  table-layout: fixed;
  border-spacing: 0;
}

table.edit-mainstat tr td {
  border: none;
}

select {
  margin: auto;
  padding: 0 1px;
  border: none;
}

input[type="number"] {
  width: 10rem;
  margin: auto;
  padding: 0 1px;
  border: none;
}

table.edit-mainstat select {
  width: calc(100% - 2px);
}

table.edit-mainstat input[type="number"] {
  width: calc(100% - 2px);
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