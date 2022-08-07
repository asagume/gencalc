<template>
  <table class="character-info">
    <caption>
      {{
        displayName("ステータス")
      }}
    </caption>
    <template v-for="(item, index) in statsInfoList" :key="index">
      <tr>
        <th>{{ displayName(item.key) }}</th>
        <td>{{ displayStatValue(item.key, item.value) }}</td>
      </tr>
    </template>
  </table>
  <table class="character-info">
    <caption>
      {{
        displayName("命ノ星座")
      }}
    </caption>
    <template v-for="(item, index) in constellationInfoList" :key="index">
      <tr>
        <td rowspan="2"><img class="icon" :src="item.icon_url" :alt="item.名前" /></td>
        <th>{{ displayName("第" + (index + 1) + "重") }} {{ displayName(item.名前) }}</th>
      </tr>
      <tr>
        <td class="description" v-html="item.説明"></td>
      </tr>
    </template>
  </table>
  <table class="character-info">
    <caption>
      {{
        displayName("固有天賦")
      }}
    </caption>
    <template v-for="(item, index) in passiveTalentInfoList" :key="index">
      <tr>
        <td rowspan="2"><img class="icon" :src="item.icon_url" :alt="item.名前" /></td>
        <th>{{ displayName(item.名前) }}</th>
      </tr>
      <tr>
        <td class="description" v-html="item.説明"></td>
      </tr>
    </template>
  </table>
  <table class="character-info">
    <caption></caption>
    <tr>
      <td rowspan="2">
        <img
          class="icon"
          :src="characterMaster.元素スキル.icon_url"
          :alt="characterMaster.元素スキル.名前"
        />
      </td>
      <td>
        {{ displayName(characterMaster.元素スキル.名前) }}
      </td>
    </tr>
    <tr>
      <td class="description" v-html="characterMaster.元素スキル.説明"></td>
    </tr>
    <template v-for="(item, index) in characterMaster.元素スキル.詳細" :key="index">
      <tr>
        <th>{{ displayName(item.名前) }}</th>
      </tr>
    </template>
  </table>
</template>

<script lang="ts">
import { getStatValueByLevel } from "@/calculate";
import GlobalMixin from "@/GlobalMixin.vue";
import { TCharacterDetail } from "@/master";
import { computed, defineComponent, PropType, reactive } from "vue";

type TConstellationInfo = {
  名前: string;
  説明: string;
  icon_url: string;
  [key: string]: any;
};

type TTalentInfo = {
  名前: string;
  説明: string;
  icon_url: string;
  [key: string]: any;
};

const CHARACTER_TALENT_DETAIL_TEMPLATE = {
  名前: "",
  数値: 0,
};

const CHARACTER_TALENT_TEMPLATE = {
  名前: "",
  説明: "",
  詳細: [CHARACTER_TALENT_DETAIL_TEMPLATE],
};

const CHARACTER_DETAIL_TEMPLATE = {
  名前: "",
  説明: "",
  通常攻撃: CHARACTER_TALENT_TEMPLATE,
  重撃: CHARACTER_TALENT_TEMPLATE,
  落下攻撃: CHARACTER_TALENT_TEMPLATE,
  元素スキル: CHARACTER_TALENT_TEMPLATE,
  元素爆発: CHARACTER_TALENT_TEMPLATE,
};

export default defineComponent({
  name: "CharacterInfo",
  mixins: [GlobalMixin],
  props: {
    characterMaster: {
      type: Object as PropType<TCharacterDetail>,
      required: true,
    },
    ascension: {
      type: Number,
      required: true,
    },
    level: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const statsInfoList = computed((): any[] => {
      const result = [] as any[];
      if (
        props.characterMaster &&
        props.ascension !== undefined &&
        props.level !== undefined
      ) {
        if ("ステータス" in props.characterMaster) {
          for (const key of Object.keys((props.characterMaster as any).ステータス)) {
            const valueObj = (props.characterMaster as any).ステータス[key];
            const value = getStatValueByLevel(valueObj, props.ascension, props.level);
            result.push({ key: key, value: value });
          }
        }
      }
      return result;
    });

    const constellationInfoList = computed((): TConstellationInfo[] => {
      const result = [] as TConstellationInfo[];
      if (props.characterMaster) {
        if ("命ノ星座" in props.characterMaster) {
          for (const key of Object.keys((props.characterMaster as any).命ノ星座)) {
            result.push((props.characterMaster as any).命ノ星座[key]);
          }
        }
      }
      return result;
    });

    const passiveTalentInfoList = computed((): TTalentInfo[] => {
      const result = [] as TTalentInfo[];
      if (props.characterMaster) {
        if ("固有天賦" in props.characterMaster) {
          for (const entry of (props.characterMaster as any).固有天賦) {
            result.push(entry);
          }
        }
      }
      return result;
    });

    return {
      statsInfoList,
      constellationInfoList,
      passiveTalentInfoList,
    };
  },
});
</script>

<style scoped>
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

img.icon {
  width: 60px;
  height: 60px;
}
</style>
