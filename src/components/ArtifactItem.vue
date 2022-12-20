<template>
  <div class="artifact">
    <table class="artifact">
      <tr>
        <td style="width: 45%">
          <div class="with-tooltip">
            <img class="artifact-icon" :src="artifactImgSrc" :alt="displayName(artifact.name)">
            <div class="tooltip">{{ displayName(artifact.name) }}</div>
          </div>
          {{ displayName(artifact.mainStat).replace(/%$/, '') + '+' + displayStatValue(artifact.mainStat,
              artifact.mainStatValue)
          }}
          <div v-show="editable" style="margin-top: 5px">
            <button class="control" type="button" @click="isEditing = !isEditing">
              <span v-if="isEditing" class="material-symbols-outlined"> edit_off </span>
              <span v-else class="material-symbols-outlined"> edit </span>
            </button>
            <!-- <button class="control" type="button">
              <span class="material-symbols-outlined"> delete </span>
            </button> -->
          </div>
        </td>
        <td style="width: 55%">
          <table class="artifact-substat">
            <tr v-for="(subStat, index) in artifact.subStats" :key="index">
              <template v-if="isEditing">
                <td class="right">
                  {{ displayName(subStat.name) }}
                </td>
                <td class="right">
                  <input type="number" v-model="subStat.value" @change="onChange">
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
import { TArtifact } from "@/input";
import { getArtifactIconUrl } from "@/master";
import { computed, defineComponent, PropType, ref } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
  name: 'ArtifactItem',
  props: {
    artifact: { type: Object as PropType<TArtifact>, required: true, },
    editable: { type: Boolean },
  },
  emits: ['change:article'],
  setup(props, context) {
    const { displayName, displayStatValue } = CompositionFunction();

    const isEditing = ref(false);

    const artifactImgSrc = computed(() => {
      return getArtifactIconUrl(props.artifact.setname, props.artifact.cat_id);
    });

    const onChange = () => {
      context.emit('change:article');
    };

    return {
      displayName, displayStatValue,

      isEditing,

      artifactImgSrc,
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