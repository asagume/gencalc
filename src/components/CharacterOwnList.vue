<template>
  <ul class="own-list">
    <li v-for="item in characterList" :key="item.key">
      <img :class="'character' + bgImageClass(item) + notOwnedClass(item)" :src="item.icon_url" :alt="item.key"
        @click="onClick(item)" />
      <div class="tooltip">{{ displayName(item.key) }}</div>
      <img class="vision" :src="visionSrc(item)" :alt="item.元素" />
      <div class="constellation">{{ constellationObj[item.key] }}</div>
    </li>
  </ul>
  <label>
    <input type="checkbox" v-model="savable" :disabled="!changed" />
    <span>{{ displayName("キャラクター所持状況を保存する") }}</span>
  </label>
  <button type="button" @click="save" :disabled="!savable">
    {{ displayName("実行") }}
  </button>
</template>

<script lang="ts">
import { isNumber } from "@/common";
import {
  TCharacterEntry,
  ELEMENT_IMG_SRC,
  CHARACTER_MASTER_LIST,
  STAR_BACKGROUND_IMAGE_CLASS,
} from "@/master";
import { defineComponent, reactive, ref } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
  name: "CharacterOwnList",
  setup() {
    const { displayName } = CompositionFunction();

    const visionSrc = (item: TCharacterEntry) => ELEMENT_IMG_SRC[item.元素];
    const bgImageClass = (item: TCharacterEntry) =>
      (" " + STAR_BACKGROUND_IMAGE_CLASS[item.レアリティ]) as string;

    const characterList = CHARACTER_MASTER_LIST;
    const constellationObj = reactive({} as { [key: string]: number | null });
    for (const item of characterList) {
      constellationObj[item.key] = null;
    }
    if (localStorage["キャラクター所持状況"]) {
      const savedObj = JSON.parse(localStorage["キャラクター所持状況"]);
      Object.keys(savedObj).forEach((key) => {
        if (isNumber(savedObj[key])) {
          constellationObj[key] = Number(savedObj[key]);
        }
      });
    }
    const changed = ref(false);
    const savable = ref(false);

    const notOwnedClass = (item: TCharacterEntry) =>
      constellationObj[item.key] == null ? " not-owned" : "";

    const onClick = (item: TCharacterEntry) => {
      if (constellationObj[item.key] === null) {
        constellationObj[item.key] = 0;
      } else if (constellationObj[item.key] == 6) {
        constellationObj[item.key] = null;
      } else {
        let current = constellationObj[item.key] as number;
        constellationObj[item.key] = current + 1;
      }
      changed.value = true;
    };

    const save = () => {
      const saveObj = {} as { [key: string]: number | null };
      Object.keys(constellationObj)
        .filter((s) => constellationObj[s] !== null)
        .forEach((key) => {
          saveObj[key] = constellationObj[key];
        });
      localStorage.setItem("キャラクター所持状況", JSON.stringify(saveObj));
      savable.value = false;
      changed.value = false;
    };

    return {
      displayName,

      visionSrc,
      bgImageClass,
      characterList,
      constellationObj,
      onClick,
      changed,
      savable,
      save,
      notOwnedClass,
    };
  },
});
</script>

<style scoped>
img.character {
  width: 80px;
  height: 80px;
  background-size: contain;
}

img.vision {
  width: 25px;
  height: 25px;
  position: absolute;
  left: 3px;
  top: 3px;
}

div.constellation {
  font-size: 25px;
  text-shadow: 0 0 3px black;
  position: absolute;
  right: 10px;
  top: 3px;
}

.not-owned {
  opacity: 50%;
}

.tooltip {
  top: unset;
  bottom: 0.5rem;
}
</style>
