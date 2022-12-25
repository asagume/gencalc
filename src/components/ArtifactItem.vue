<template>
  <div class="artifact">
    <table v-if="control == 'editable'" class="artifact">
      <tr>
        <td class="left-column" style="width: 45%;">
          <div class="control">
            <button type="button" @click="isEditing = !isEditing">
              <span v-if="isEditing" class="material-symbols-outlined"> edit_off </span>
              <span v-else class="material-symbols-outlined"> edit </span>
            </button>
          </div>
          <div class="with-tooltip">
            <img class="artifact-icon" :src="artifactImgSrc" :alt="displayName(copiedArtifact.name)"
              @click="artifactIconOnClick()">
            <div class="tooltip">{{ displayName(copiedArtifact.name) }}</div>
          </div>
          <div class="edit-mainstat" v-if="isEditing">
            <select v-model="copiedArtifact.mainStat" @change="onChange">
              <option v-for="option in mainStatOptions" :key="option" :value="option">
                {{ displayName(option) }}
              </option>
            </select>
            <input type="number" v-model="copiedArtifact.mainStatValue" :step="statStep(copiedArtifact.mainStat)"
              min="0" @change="onChange">
          </div>
          <div v-else class="mainstat" style="margin: 1px 0">
            {{ displayName(copiedArtifact.mainStat).replace(/%$/, '') + '+' + displayStatValue(copiedArtifact.mainStat,
                copiedArtifact.mainStatValue)
            }}
          </div>
          <div v-if="isEditing">
            <select class="star" v-model="copiedArtifact.rarity" @change="starOnChange">
              <option value="5"> ★5 </option>
              <option value="4"> ★4 </option>
            </select>
          </div>
          <div v-else>
            <img class="star" v-for="dummy in new Array(copiedArtifact.rarity)" src="images/star.png" :key="dummy">
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
                  <input type="number" v-model="subStat.value" :step="statStep(subStat.name)" min="0"
                    @change="onChange">
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
    <table v-else class="artifact" @click="selectOnClick()">
      <tr>
        <td class="left-column" style="width: 45%;">
          <div class="control">
            <template v-if="control == 'selectable'">
              <button type="button">
                <span v-if="selected" class="material-symbols-outlined" style="color: yellow"> select_check_box
                </span>
                <span v-else class="material-symbols-outlined"> check_box_outline_blank </span>
              </button>
            </template>
          </div>
          <div class="with-tooltip">
            <img class="artifact-icon" :src="artifactImgSrc" :alt="displayName(copiedArtifact.name)">
            <div class="tooltip">{{ displayName(copiedArtifact.name) }}</div>
          </div>
          <div class="mainstat" style="margin: 1px 0">
            {{ displayName(copiedArtifact.mainStat).replace(/%$/, '') + '+' + displayStatValue(copiedArtifact.mainStat,
                copiedArtifact.mainStatValue)
            }}
          </div>
          <div>
            <img class="star" v-for="dummy in new Array(copiedArtifact.rarity)" src="images/star.png" :key="dummy">
          </div>
        </td>
        <td style="width: 55%">
          <table class="artifact-substat">
            <tr v-for="(subStat, index) in copiedArtifact.subStats" :key="index">
              <td>
                {{ displayName(subStat.name).replace(/%$/, '') + '+' + displayStatValue(subStat.name, subStat.value) }}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <div v-show="isListShow">
      <ArtifactSetSelect :visible="true" :index="1" :artifact-set="artifact.setname"
        :artifact-set-masters="artifactSetMasters" :cat_id="artifact.cat_id" @update:artifact-set="updateArtifactSet" />
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { overwriteObject } from "@/common";
import { ARTIFACT_SET_MASTER_DUMMY, TArtifact, 聖遺物サブ効果ARRAY, 聖遺物メイン効果_時の砂ARRAY, 聖遺物メイン効果_死の羽ARRAY, 聖遺物メイン効果_理の冠ARRAY, 聖遺物メイン効果_生の花ARRAY, 聖遺物メイン効果_空の杯ARRAY } from "@/input";
import { ARTIFACT_SET_MASTER, TArtifactSetEntry, TArtifactSetKey, getArtifactIconUrl } from "@/master";
import { computed, defineComponent, PropType, reactive, ref, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";
import ArtifactSetSelect from "./ArtifactSetSelect.vue";

export default defineComponent({
  name: 'ArtifactItem',
  props: {
    artifact: { type: Object as PropType<TArtifact>, required: true },
    id: { type: Number },
    control: String,
    initial: Boolean,
    selected: Boolean,
  },
  components: {
    ArtifactSetSelect,
  },
  emits: ['update:artifact', 'select:artifact'],
  setup(props, context) {
    const { displayName, displayStatValue, percent } = CompositionFunction();

    const copiedArtifact = reactive(_.cloneDeep(props.artifact));
    const artifactSetMasters = reactive([ARTIFACT_SET_MASTER_DUMMY, ARTIFACT_SET_MASTER_DUMMY] as TArtifactSetEntry[]);
    const isEditing = ref(false);
    const isSelected = ref(false);
    const isListShow = ref(false);

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

    const statStep = (stat: string) => {
      return percent(stat) ? 0.1 : 1;
    };

    const subStatOptionDisabled = ((value: string, selected: string) => {
      if (value == selected) return false;
      const work = copiedArtifact.subStats.map(s => s.name);
      return work.includes(value);
    });

    const onChange = () => {
      context.emit('update:artifact', props.id, copiedArtifact);
    };

    const starOnChange = () => {
      copiedArtifact.rarity = Number(copiedArtifact.rarity);
    }

    const artifactIconOnClick = () => {
      if (isEditing.value) {
        isListShow.value = !isListShow.value;
      } else {
        isListShow.value = false;
      }
    };

    const selectOnClick = () => {
      if (props.control === 'selectable') {
        context.emit('select:artifact', props.id);
      }
    };

    const updateArtifactSet = (artifactSet: TArtifactSetKey) => {
      copiedArtifact.setname = artifactSet;
      const master = ARTIFACT_SET_MASTER[artifactSet];
      copiedArtifact.rarity = master.レアリティ;
      if ('artifact_list' in master) {
        copiedArtifact.name = master.artifact_list[copiedArtifact.cat_id - 1];
      }
      isListShow.value = false;
      onChange();
    };

    function onLoad() {
      if (props.initial !== undefined) {
        if (props.control === 'editable') {
          isEditing.value = props.initial;
        } else if (props.control === 'selectable') {
          isSelected.value = props.initial;
        }
      }
    }
    onLoad();

    watch(props, (newVal, oldVal) => {
      overwriteObject(copiedArtifact, newVal.artifact);
      if (newVal.initial != oldVal.initial) {
        onLoad();
      }
    });

    return {
      displayName, displayStatValue,

      copiedArtifact,
      artifactSetMasters,
      isEditing,
      isSelected,
      isListShow,

      artifactImgSrc,
      mainStatOptions,
      subStatOptions,
      subStatOptionDisabled,
      statStep,

      onChange,
      starOnChange,
      artifactIconOnClick,
      updateArtifactSet,
      selectOnClick,
    }
  }
});
</script>

<style scoped>
div.artifact {
  display: inline-block;
  width: calc(25% - 10px);
  min-width: 44rem;
  margin: 2px;
  font-size: 1.8rem;
  background-color: rgb(26, 79, 109);
  border-radius: 10px 10px 0 0;
}

table.artifact {
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  table-layout: fixed;
  border-spacing: 0;
}

table.artifact td.left-column {
  position: relative;
}

table.artifact td.left-column div.control {
  position: absolute;
  left: -5px;
  bottom: -5px;
}

table.artifact td.left-column div.control button {
  background-color: transparent;
  border: none;
}

table.artifact td.left-column div.control span {
  font-size: 2.4rem;
  color: blanchedalmond;
}

div.mainstat {
  margin: 1px 0;
}

table.artifact-substat {
  width: 100%;
  border-spacing: 0;
}

table.artifact tr td {
  vertical-align: top;
  border-bottom: 2px solid whitesmoke;
  padding: 2px 1px;
  white-space: nowrap;
}

table.artifact-substat tr td {
  vertical-align: middle;
  border-bottom: 1px solid gray;
  padding: 0px 1px;
  line-height: 2.8rem;
  text-align: left;
}

table.artifact-substat tr:last-child td {
  border-bottom: none;
}

table.artifact-substat td.right {
  text-align: right;
}

select {
  width: 100%;
  margin: auto 1px;
  padding: 0 1px;
  border: none;
  border-radius: 2px;
}

input[type="number"] {
  width: 9rem;
  margin: auto;
  padding: 0 1px;
  border: none;
}

div.edit-mainstat {
  margin: 1px 0;
}

div.edit-mainstat select {
  width: calc(100% - 9rem - 2px);
}

table.edit-mainstat input[type="number"] {
  width: calc(100% - 2px);
}

img.artifact-icon {
  width: calc(6rem - 2px);
  height: calc(6rem - 2px);
  border: 1px solid gray;
  border-radius: 50%;
}

img.star {
  width: 1.6rem;
  height: 1.6rem;
  margin: 0;
  padding: 0;
}

select.star {
  width: 8rem;
}
</style>