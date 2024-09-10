<template>
  <div class="artifact">
    <table class="artifact">
      <tbody>
        <tr>
          <td>
            <table v-if="before" class="artifact-before-after">
              <tbody>
                <tr>
                  <th colspan="2">{{ displayName('現在装備') }}</th>
                </tr>
                <tr>
                  <th>
                    <img class="artifact-icon" :src="artifactImgSrc(before)" :alt="displayName(before.name)">
                  </th>
                  <td>
                    {{ displayStatStr(before.mainStat, before.mainStatValue) }}
                    <br />
                    <img class="star" v-for="dummy in new Array(before.rarity)" src="images/star.png" :key="dummy">
                  </td>
                </tr>
                <tr v-for="item in before.subStats" :key="item.name">
                  <td colspan="2">{{ displayStatStr(item.name, item.value) }}</td>
                </tr>
              </tbody>
            </table>
          </td>
          <td>
            <table v-if="after" class="artifact-before-after">
              <tbody>
                <tr>
                  <th colspan="2">{{ displayName('変更後') }}</th>
                </tr>
                <tr>
                  <th>
                    <img class="artifact-icon" :src="artifactImgSrc(after)" :alt="displayName(after.name)">
                  </th>
                  <td>
                    {{ displayStatStr(after.mainStat, after.mainStatValue) }}
                    <br />
                    <img class="star" v-for="dummy in new Array(after.rarity)" src="images/star.png" :key="dummy">
                  </td>
                </tr>
                <tr v-for="item in after.subStats" :key="item.name">
                  <td colspan="2">{{ displayStatStr(item.name, item.value) }}</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr v-if="isStatsChange">
          <td colspan="2">
            <table class="artifact-stat">
              <tbody>
                <tr>
                  <th colspan="2">{{ displayName('ステータス変化') }}</th>
                </tr>
                <tr v-for="item in mainStatDiffList" :key="item.key">
                  <td>{{ displayName(item.key) }}</td>
                  <td :class="'value ' + statValueClass(item.value)">
                    {{ (item.value >= 0 ? '+' : '') + displayStatValue(item.key, item.value) }}
                  </td>
                </tr>
                <tr v-for="item in subStatDiffList" :key="item.key">
                  <td>{{ displayName(item.key) }}</td>
                  <td :class="'value ' + statValueClass(item.value)">
                    {{ (item.value >= 0 ? '+' : '') + displayStatValue(item.key, item.value) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 5px">
      <label>
        <input type="checkbox" v-model="isStatsChange">
        {{ displayName('ステータス変化分を適用する') }}
      </label>
      <br />
      <br />
      <button type="button" @click="applyOnClick"> {{ displayName('適用') }} </button>
      <button type="button" @click="cancelOnClick"> {{ displayName('キャンセル') }} </button>
    </div>
  </div>
</template>

<script lang="ts">
import { TKeyValue } from "@/common";
import { TArtifact, 聖遺物サブ効果ARRAY } from "@/input";
import { computed, defineComponent, PropType, ref } from "vue";
import CompositionFunction from "./CompositionFunction.vue";
import { IMG_SRC_DUMMY, getArtifactIconUrl } from "@/master";

export default defineComponent({
  name: 'ArtifactChangeInput',
  props: {
    before: { type: Object as PropType<TArtifact> },
    after: { type: Object as PropType<TArtifact> },
  },
  emits: ['apply:artifact-change', 'cancel:artifact-change'],
  setup(props, context) {
    const { displayName, displayStatValue } = CompositionFunction();

    const isStatsChange = ref(true);

    const artifactImgSrc = ((artifact?: TArtifact) => {
      if (artifact?.setname) {
        return getArtifactIconUrl(artifact.setname, artifact.cat_id);
      }
      return IMG_SRC_DUMMY;
    });

    function displayStatStr(name: string, value: number) {
      let result = name.replace(/%$/, '');
      if (value >= 0) {
        result += '+';
      }
      result += displayStatValue(name, value);
      return result;
    }

    const mainStatDiffList = computed(() => {
      const result: TKeyValue[] = [];
      if (props.after) {
        const name = props.after.mainStat;
        let value = props.after.mainStatValue;
        if (props.before) {
          if (name == props.before.mainStat && props.before.mainStatValue) {
            value -= props.before.mainStatValue;
          } else {
            result.push({ key: props.before.mainStat, value: -props.before.mainStatValue });
          }
        }
        if (name && value) {
          result.push({ key: name, value: value });
        }
      }
      return result;
    });

    const subStatDiffList = computed(() => {
      const result: TKeyValue[] = [];
      for (const stat of 聖遺物サブ効果ARRAY) {
        const name = stat;
        let value = 0;
        if (props.after) {
          for (const subStat of props.after.subStats) {
            if (name == subStat.name) {
              value += subStat.value;
            }
          }
        }
        if (props.before) {
          for (const subStat of props.before.subStats) {
            if (name == subStat.name) {
              value -= subStat.value;
            }
          }
        }
        if (value != 0) {
          result.push({ key: name, value: value });
        }
      }
      return result;
    });

    const statValueClass = (value: number) => {
      return value >= 0 ? 'plus' : 'minus';
    };

    const applyOnClick = () => {
      if (isStatsChange.value) {
        context.emit('apply:artifact-change', isStatsChange.value, subStatDiffList.value);
      } else {
        context.emit('apply:artifact-change', isStatsChange.value, []);
      }
    };

    const cancelOnClick = () => {
      context.emit('cancel:artifact-change');
    };

    return {
      displayName, displayStatValue,

      isStatsChange,
      artifactImgSrc,
      mainStatDiffList,
      subStatDiffList,
      displayStatStr,
      statValueClass,

      applyOnClick,
      cancelOnClick,
    }
  }
});
</script>
<style scoped>
div.artifact {
  margin-left: auto;
  margin-right: auto;
  width: calc(100% - 4px);
}

th {
  color: orange;
}

table.artifact {
  margin-left: auto;
  margin-right: auto;
  font-size: 2rem;
  width: 100%;
  border-spacing: 0;
  table-layout: fixed;
}

table.artifact tr td {
  border-bottom: 2px solid whitesmoke;
}

table.artifact-before-after {
  margin-left: auto;
  margin-right: auto;
  background-color: rgb(26, 79, 109);
  border-spacing: 0;
  min-width: 80%;
  border-radius: 10px 10px 0 0;
  padding-left: 5px;
  padding-right: 5px;
}

table.artifact-stat {
  margin-left: auto;
  margin-right: auto;
  border-spacing: 0;
  min-width: 50%;
}

img.artifact-icon {
  width: calc(6rem - 4px);
  height: calc(6rem - 4px);
  border: 1px solid gray;
  border-radius: 50%;
}

table.artifact-before-after tr th,
table.artifact-before-after tr td,
table.artifact-stat tr th,
table.artifact-stat tr td {
  border-bottom: 1px solid gray;
  line-height: 2.8rem;
}

table.artifact-before-after tr td,
table.artifact-stat tr td {
  text-align: left;
}

table.artifact-stat tr td {
  min-width: 20rem;
}

table.artifact-stat tr:last-child td,
table.artifact-before-after tr:last-child td {
  border-bottom: none;
}

td.plus {
  color: lightgreen;
}

td.minus {
  color: violet;
}
</style>