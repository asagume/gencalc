<template>
  <div class="artifact">
    <table class="artifact">
      <tr>
        <td>
          <img class="artifact-icon" :src="artifactImgSrc" :alt="displayName(artifact.name)">
          <br />
          {{ displayName(artifact.mainStat).replace(/%$/, '') + '+' + displayStatValue(artifact.mainStat,
              artifact.mainStatValue)
          }}
        </td>
        <td>
          <table class="artifact-substat">
            <tr v-for="(subStat, index) in artifact.subStats" :key="index">
              <td>
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
import { computed, defineComponent, PropType } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
  name: 'ArtifactItem',
  props: {
    artifact: { type: Object as PropType<TArtifact>, required: true, },
    editable: { type: Boolean },
  },
  setup(props) {
    const { displayName, displayStatValue } = CompositionFunction();

    const artifactImgSrc = computed(() => {
      return getArtifactIconUrl(props.artifact.setname, props.artifact.cat_id);
    });

    return {
      displayName, displayStatValue,

      artifactImgSrc,
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
}

table.artifact-substat tr td {
  border-bottom: 1px solid gray;
  padding: 3px;
  text-align: left;
}

table.artifact-substat tr:last-child td {
  border-bottom: none;
}

img.artifact-icon {
  width: 7.2rem;
  height: 7.2rem;
}
</style>