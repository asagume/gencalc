<template>
  <template v-if="visible">
    <template v-if="mode == 1">
      <table class="character-info status">
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
            <td rowspan="2">
              <img class="icon" :src="item.icon_url" :alt="item.名前" />
            </td>
            <th class="title">
              {{ displayName("第" + (index + 1) + "重") }} {{ displayName(item.名前) }}
            </th>
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
            <td rowspan="2">
              <img class="icon" :src="item.icon_url" :alt="item.名前" />
            </td>
            <th class="title">{{ displayName(item.名前) }}</th>
          </tr>
          <tr>
            <td class="description" v-html="item.説明"></td>
          </tr>
        </template>
      </table>
    </template>
    <template v-if="mode == 2">
      <table class="character-info">
        <caption></caption>
        <tr>
          <th colspan="2" class="title">
            {{ displayName(characterMaster.通常攻撃.名前) }}
          </th>
        </tr>
        <tr>
          <td colspan="2" class="description" v-html="characterMaster.通常攻撃.説明"></td>
        </tr>
        <template v-for="(item, index) in characterMaster.通常攻撃.詳細" :key="index">
          <tr>
            <th class="title">{{ displayName(item.名前) }}</th>
            <td>{{ talentValue(item.数値, normalAttackLevel) }}</td>
          </tr>
        </template>
        <template v-for="(item, index) in characterMaster.重撃.詳細" :key="index">
          <tr>
            <th class="title">{{ displayName(item.名前) }}</th>
            <td>{{ talentValue(item.数値, normalAttackLevel) }}</td>
          </tr>
        </template>
        <template v-for="(item, index) in characterMaster.落下攻撃.詳細" :key="index">
          <tr>
            <th class="title">{{ displayName(item.名前) }}</th>
            <td>{{ talentValue(item.数値, normalAttackLevel) }}</td>
          </tr>
        </template>
      </table>
    </template>
    <template v-if="mode == 3">
      <table class="character-info">
        <caption></caption>
        <tr>
          <th colspan="2" class="title">
            {{ displayName(characterMaster.元素スキル.名前) }}
          </th>
        </tr>
        <tr>
          <td colspan="2" class="description" v-html="characterMaster.元素スキル.説明"></td>
        </tr>
        <template v-for="(item, index) in characterMaster.元素スキル.詳細" :key="index">
          <tr>
            <th class="title">{{ displayName(item.名前) }}</th>
            <td>{{ talentValue(item.数値, elementalSkillLevel) }}</td>
          </tr>
        </template>
      </table>
    </template>
    <template v-if="mode == 4">
      <table class="character-info">
        <caption></caption>
        <tr>
          <th colspan="2" class="title">
            {{ displayName(characterMaster.元素爆発.名前) }}
          </th>
        </tr>
        <tr>
          <td colspan="2" class="description" v-html="characterMaster.元素爆発.説明"></td>
        </tr>
        <template v-for="(item, index) in characterMaster.元素爆発.詳細" :key="index">
          <tr>
            <th class="title">{{ displayName(item.名前) }}</th>
            <td>{{ talentValue(item.数値, elementalBurstLevel) }}</td>
          </tr>
        </template>
      </table>
    </template>
  </template>
</template>

<script lang="ts">
import { getStatValueByLevel } from "@/calculate";
import { isPlainObject } from "@/common";
import { TCharacterDetail } from "@/master";
import { computed, defineComponent, PropType } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

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

export default defineComponent({
  name: "CharacterInfo",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    mode: {
      type: Number,
      required: true,
    },
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
    normalAttackLevel: {
      type: Number,
      required: true,
    },
    elementalSkillLevel: {
      type: Number,
      required: true,
    },
    elementalBurstLevel: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const { displayName, displayStatValue } = CompositionFunction();

    const statsInfoList = computed((): any[] => {
      const result = [] as any[];
      if ("ステータス" in props.characterMaster) {
        for (const key of Object.keys((props.characterMaster as any).ステータス)) {
          const valueObj = (props.characterMaster as any).ステータス[key];
          const value = getStatValueByLevel(valueObj, props.ascension, props.level);
          result.push({ key: key, value: value });
        }
      }
      return result;
    });

    const constellationInfoList = computed((): TConstellationInfo[] => {
      const result = [] as TConstellationInfo[];
      if ("命ノ星座" in props.characterMaster) {
        for (const key of Object.keys((props.characterMaster as any).命ノ星座)) {
          result.push((props.characterMaster as any).命ノ星座[key]);
        }
      }
      return result;
    });

    const passiveTalentInfoList = computed((): TTalentInfo[] => {
      const result = [] as TTalentInfo[];
      if ("固有天賦" in props.characterMaster) {
        for (const entry of (props.characterMaster as any).固有天賦) {
          result.push(entry);
        }
      }
      return result;
    });
    const talentValue = (valueObj: any, level: number) => {
      if (isPlainObject(valueObj)) {
        console.log(valueObj, level);
        return valueObj[String(level)];
      }
      return valueObj;
    };

    return {
      displayName, displayStatValue,

      statsInfoList,
      constellationInfoList,
      passiveTalentInfoList,
      talentValue,
    };
  },
});
</script>

<style scoped>
table {
  width: calc(100% - 1rem);
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 10px;
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
