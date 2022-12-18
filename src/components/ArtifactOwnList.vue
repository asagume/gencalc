<template>
  <div class="tab-switch part-select">
    <input class="hidden" id="part-select-tab-1" type="radio" value="1" v-model="artifactPartSelectTab">
    <label for="part-select-tab-1">
      {{ displayName('生の花') }}
    </label>
    <input class="hidden" id="part-select-tab-2" type="radio" value="2" v-model="artifactPartSelectTab">
    <label for="part-select-tab-2">
      {{ displayName('死の羽') }}
    </label>
    <input class="hidden" id="part-select-tab-3" type="radio" value="3" v-model="artifactPartSelectTab">
    <label for="part-select-tab-3">
      {{ displayName('時の砂') }}
    </label>
    <input class="hidden" id="part-select-tab-4" type="radio" value="4" v-model="artifactPartSelectTab">
    <label for="part-select-tab-4">
      {{ displayName('空の杯') }}
    </label>
    <input class="hidden" id="part-select-tab-5" type="radio" value="5" v-model="artifactPartSelectTab">
    <label for="part-select-tab-5">
      {{ displayName('理の冠') }}
    </label>
  </div>
  <table class="artifact">
    <thead>
      <tr>
        <th></th>
        <th></th>
        <th>{{ displayName('メイン効果') }}</th>
        <th>{{ displayName('サブ効果') }}</th>
      </tr>
    </thead>
    <tr v-for="(artifact, index) in getArtifactList(artifactPartSelectTab)" :key="index">
      <td>{{ displayName(artifact.name) }}</td>
      <td>
        <img class="artifact-icon" :src="artifactSetIconSrc(artifact.set)">
      </td>
      <td>{{ displayName(artifact.mainStat) }}</td>
      <td style="width: 50%">
        <table class="artifact-substat">
          <tr v-for="(subStat, index2) in artifact.subStats" :key="index2">
            <td>{{ displayName(subStat.name) }}</td>
            <td>{{ subStat.value }}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</template>

<script lang="ts">
import {
  ARTIFACT_SET_MASTER,
} from "@/master";
import { defineComponent, reactive, ref } from "vue";
import CompositionFunction from "./CompositionFunction.vue";
import { TArtifact } from "@/input";

export default defineComponent({
  name: "ArtifactOwnList",
  setup() {
    const { displayName, targetValue } = CompositionFunction();

    const artifactPartSelectTab = ref('1');
    const artifactList = reactive([] as TArtifact[]);

    const getArtifactList = (index: any) => {
      console.log(index, artifactList.filter(s => s.cat_id == Number(index)));
      return artifactList.filter(s => s.cat_id == Number(index));
    };

    const artifactSetIconSrc = (setname: string) => {
      return (ARTIFACT_SET_MASTER as any)[setname].icon_url;
    };

    const onLoad = () => {
      const storageKey = 'artifact_list';
      if (storageKey in localStorage) {
        const value = JSON.parse(localStorage[storageKey]);
        artifactList.splice(0, artifactList.length, ...value);
      }
      console.log(artifactList);
    };
    onLoad();

    return {
      displayName,
      targetValue,

      artifactPartSelectTab,
      getArtifactList,

      artifactSetIconSrc,
    };
  },
});
</script>

<style scoped>
.tab-switch.part-select label {
  width: calc(100% / 5 - 20px);
  max-width: 16rem;
  background: linear-gradient(to top, #55290b, black);
}

table.artifact {
  margin-left: auto;
  margin-right: auto;
  width: 90%;
  table-layout: auto;
  border-spacing: 0;
}

table.artifact thead th {
  color: orange;
  border-bottom: 2px solid whitesmoke;
}

table.artifact-substat {
  width: 100%;
  border-spacing: 0;
  table-layout: fixed;
}

table.artifact tr td {
  vertical-align: top;
  border-bottom: 2px solid whitesmoke;
  padding: 3px;
}

table.artifact-substat tr td {
  border-bottom: 1px solid gray;
  padding: 3px;
  text-align: right;
}

img.artifact-icon {
  width: 24px;
  height: 24px;
}
</style>
