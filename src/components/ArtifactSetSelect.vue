<template>
  <div v-if="visible">
    <table>
      <template v-for="item in artifactSetEffects" :key="item">
        <tr>
          <th class="title">{{ displayName(item.key) }}</th>
        </tr>
        <tr>
          <td class="description">{{ item.value }}</td>
        </tr>
      </template>
    </table>

    <ul class="select-list">
      <li v-for="item in filteredList" :key="item.key">
        <img
          :class="'artifact-set with-tooltip' + bgImageClass(item) + selectedClass(item)"
          :src="item.icon_url"
          :alt="item.key"
          @click="$emit('update:artifact-set', item.key)"
        />
        <div class="tooltip">{{ displayName(item.key) }}</div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import GlobalMixin from "@/GlobalMixin.vue";
import {
  ARTIFACT_SET_MASTER_LIST,
  STAR_BACKGROUND_IMAGE_CLASS,
  TArtifactSetEntry,
} from "@/master";
import { computed, defineComponent, PropType, reactive } from "vue";

export default defineComponent({
  name: "ArtifactSetSelect",
  mixins: [GlobalMixin],
  props: {
    visible: { type: Boolean, required: true },
    index: { type: Number, required: true },
    artifactSet: { type: String, required: true },
    artifactSetMasters: { type: Array as PropType<TArtifactSetEntry[]>, required: true },
  },
  emits: ["update:artifact-set"],
  setup(props) {
    const bgImageClass = (item: TArtifactSetEntry) =>
      (" " + STAR_BACKGROUND_IMAGE_CLASS[item.レアリティ]) as string;
    const selectedClass = (item: TArtifactSetEntry) => {
      return item.key == props.artifactSet ? " selected" : "";
    };
    const artifactSetMastersRea = reactive(
      props.artifactSetMasters ?? ([] as TArtifactSetEntry[])
    );

    const filteredList = computed(() => {
      return ARTIFACT_SET_MASTER_LIST as TArtifactSetEntry[];
    });

    const artifactSetEffects = computed(() => {
      const result = [] as any;
      if (artifactSetMastersRea) {
        if (artifactSetMastersRea.length > 0) {
          if ("2セット効果" in artifactSetMastersRea[0]) {
            result.push({
              key: artifactSetMastersRea[0].key + " " + "2セット効果",
              value: artifactSetMastersRea[0]["2セット効果"]?.説明,
            });
          }
          if (artifactSetMastersRea.length > 1) {
            if (artifactSetMastersRea[0].key == artifactSetMastersRea[1].key) {
              if ("4セット効果" in artifactSetMastersRea[0]) {
                result.push({
                  key: artifactSetMastersRea[0].key + " " + "4セット効果",
                  value: artifactSetMastersRea[0]["4セット効果"]?.説明,
                });
              }
            } else {
              if ("2セット効果" in artifactSetMastersRea[1]) {
                result.push({
                  key: artifactSetMastersRea[1].key + " " + "2セット効果",
                  value: artifactSetMastersRea[1]["2セット効果"]?.説明,
                });
              }
            }
          }
        }
      }
      return result;
    });

    return {
      bgImageClass,
      selectedClass,
      filteredList,
      artifactSetEffects,
    };
  },
});

function reaction(artifactSetMasters: unknown[] | undefined) {
  throw new Error("Function not implemented.");
}
</script>

<style scoped>
img.artifact-set {
  width: 75px;
  height: 75px;
  background-size: contain;
}

.selected {
  background-color: gold;
}

:checked + img {
  background-color: gold;
}

table {
  width: calc(100% - 1rem);
  margin-left: auto;
  margin-right: auto;
  border: 2px solid gray;
  border-spacing: 0;
}

th,
td {
  padding: 2px 8px;
  border: 1px solid gray;
  border-spacing: 0;
}

th.title {
  color: burlywood;
}

.description {
  text-align: left;
}
</style>
