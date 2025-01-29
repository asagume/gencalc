<template>
  <div class="base-container">
    <div class="pane1">
      <p class="left-top"><a href="./">げんかるく</a></p>
      <p>&nbsp;</p>
      <h2>元素粒子</h2>
    </div>

    <div class="pane2">
      <vue-good-table :columns="columns" :rows="rows" theme="nocturnal" styleClass="vgt-table striped" :sort-options="{
        enabled: true,
        // initialSortBy: [
        //   { field: 'character', type: 'asc' },
        // ]
      }" :search-options="{
        enabled: true,
      }" />
    </div>

    <div class="pane3">
    </div>

    <div class="footer">
      <hr />
    </div>
  </div>
</template>
<script lang="ts">
import 'vue-good-table-next/dist/vue-good-table-next.css';
import { computed, defineComponent, onMounted, reactive } from "vue";
import CompositionFunction from "@/components/CompositionFunction.vue";
import { CHARACTER_MASTER, getCharacterMasterDetail, TCharacterDetail, TCharacterKey } from '@/master';
import { CT_AFTER_DURATION, getCooltimeFromInfo, getCooltimeTypeFromInfo, getDurationFromInfo, getElementalSkillActions, getParticleCooltimeFromInfo, getParticleGenerateCountFromInfo, getParticleInfo, getParticleNumFromInfo, getReceiveTypeFromInfo, SP_LONG, SP_NEXT, SP_SELF, SP_SHRT, TParticleInfo } from '@/particlemaster';
import _ from 'lodash';

export default defineComponent({
  name: "EnergyList",
  components: {
    'vue-good-table': require('vue-good-table-next').VueGoodTable,
  },
  setup() {
    const { displayName } = CompositionFunction();

    const characterMasterMap = reactive(new Map<string, TCharacterDetail>());

    const formatConstellation = (value: any) => {
      return value ? displayName('第' + value + '重') : '';
    };
    const formatActionKey = (value: any) => {
      let result = '';
      if (value.endsWith('(burst)')) {
        result = '元素爆発継続中'
      } else if (value.endsWith('(skill)')) {
        result = '元素スキル継続中'
      }
      if (value.endsWith('.Press')) {
        result = '一回押し'
      } else if (value.endsWith('.Hold')) {
        result = '長押し'
      }
      return displayName(result);
    };
    const fieldParticleNum = (row: any) => {
      return [row.particleNum, row.receiveType, row.duration, row.particleCooltime, row.generateCount];
    };
    const formatParticleNum = (value: any) => {
      const particleNum = value[0];
      const receiveType = value[1];
      const duration = value[2];
      const particleCooltime = value[3];
      const generateCount = value[4];
      let result = (particleNum ?? '0') + displayName('個');
      switch (receiveType) {
        case SP_NEXT:
          if (particleCooltime) {
            result += ' / ' + particleCooltime + displayName('秒');
          }
          break;
        case SP_SELF:
          if (particleCooltime) {
            result += ' / ' + particleCooltime + displayName('秒');
          }
          if (generateCount) {
            result += ' (' + generateCount + displayName('回') + ')';
          } else if (duration) {
            result += ' (' + Math.ceil(duration / particleCooltime) + displayName('回') + ')';
          }
          break;
        case SP_SHRT:
          if (particleCooltime) {
            result += ' / ' + particleCooltime + displayName('秒');
          }
          if (generateCount) {
            result += ' (' + generateCount + displayName('回') + ')';
          }
          break;
        case SP_LONG:
          if (particleCooltime) {
            result += ' / ' + particleCooltime + displayName('秒');
          }
          break;
      }
      return result;
    };
    const formatReceiveType = (value: any) => {
      let result = '';
      switch (value) {
        case SP_NEXT:
          result = '一括';
          break;
        case SP_SELF:
          result = '分割';
          break;
        case SP_SHRT:
          result = '継続(短)';
          break;
        case SP_LONG:
          result = '継続(長)';
          break;
      }
      return result;
    };
    const formatDuration = (value: any) => {
      return value ? value + displayName('秒') : '';
    };
    const formatCooltime = (value: any) => {
      return value ? value + displayName('秒') : '';
    };
    const formatTotalParticleNum = (value: any) => {
      return value ? value + displayName('個') : '';
    };

    const columns = [
      {
        label: displayName('キャラクター'),
        field: 'character',
      },
      {
        label: displayName('命ノ星座'),
        field: 'constellation',
        formatFn: formatConstellation,
      },
      {
        label: displayName('元素スキル'),
        field: 'skillName',
      },
      {
        label: displayName('区分'),
        field: 'actionKey',
        formatFn: formatActionKey,
      },
      {
        label: displayName('粒子数'),
        field: fieldParticleNum,
        formatFn: formatParticleNum,
        thClass: 'text-center',
        tdClass: 'text-center',
      },
      {
        label: displayName('発生種別'),
        field: 'receiveType',
        formatFn: formatReceiveType,
        thClass: 'text-center',
        tdClass: 'text-center',
      },
      {
        label: displayName('継続時間'),
        field: 'duration',
        formatFn: formatDuration,
        thClass: 'text-center',
        tdClass: 'text-center',
      },
      {
        label: displayName('クールタイム'),
        field: 'cooltime',
        formatFn: formatCooltime,
        thClass: 'text-center',
        tdClass: 'text-center',
      },
      // {
      //   label: displayName('粒子数 / 秒'),
      //   field: 'particlePerCooltime',
      //   formatFn: formatTotalParticleNum,
      //   thClass: 'text-center',
      //   tdClass: 'text-center',
      // },
      {
        label: displayName('総粒子数'),
        field: 'totalParticleNum',
        formatFn: formatTotalParticleNum,
        thClass: 'text-center',
        tdClass: 'text-center',
      },
    ];
    const rows = computed(() => {
      const result: any[] = [];
      characterMasterMap.forEach((characterDetail, character) => {
        const actions = getElementalSkillActions(character);
        for (let action of actions) {
          const particleInfoMap = new Map<[number, boolean, boolean], TParticleInfo>();
          for (let constellation = 0; constellation <= 6; constellation++) {
            for (let isBursting of [false, true]) {
              for (let isSkilling of [false, true]) {
                const particleInfo = getParticleInfo(character, action, constellation, isBursting, isSkilling);
                if (Array.from(particleInfoMap.values()).filter(s => _.isEqual(s, particleInfo)).length == 0) {
                  particleInfoMap.set([constellation, isBursting, isSkilling], particleInfo);
                }
              }
            }
          }
          particleInfoMap.forEach((particleInfo, key) => {
            const constellation = key[0];
            const actionKey = action + (key[1] ? '(burst)' : '') + (key[2] ? '(skill)' : '');
            const particleNum = _.round(_.isNumber(particleInfo) ? particleInfo : _.isArray(particleInfo) ? particleInfo[0] ? particleInfo[0] : 0 : 0, 2);
            const receiveType = getReceiveTypeFromInfo(particleInfo);
            let duration = getDurationFromInfo(particleInfo);
            if (!duration) {
              if (actionKey.endsWith('Press')) {
                duration = characterDetail?.元素スキル?.一回押し継続時間;
              } else if (actionKey.endsWith('Hold')) {
                duration = characterDetail?.元素スキル?.長押し継続時間;
              }
              if (!duration) {
                duration = characterDetail?.元素スキル?.継続時間;
              }
            }
            if (_.isPlainObject(duration)) {
              duration = 0;
            }
            const cooltime = getCooltimeFromInfo(particleInfo) ?? characterDetail?.元素スキル?.クールタイム;
            const cooltimeType = getCooltimeTypeFromInfo(particleInfo);
            const particleCooltime = getParticleCooltimeFromInfo(particleInfo);
            const generateCount = getParticleGenerateCountFromInfo(particleInfo);
            let particlePerCooltime = particleNum;
            let workCooltime = cooltime ?? 1;
            if (cooltimeType == CT_AFTER_DURATION) {
              workCooltime += duration ?? 0;
            }
            switch (receiveType) {
              case SP_NEXT:
                break;
              case SP_SELF:
                if (generateCount) {
                  particlePerCooltime *= generateCount;
                } else if (particleCooltime) {
                  particlePerCooltime /= particleCooltime;
                  particlePerCooltime *= Math.min(duration ?? 1, workCooltime ?? 1);
                }
                break;
              case SP_SHRT:
                if (generateCount) {
                  particlePerCooltime *= generateCount;
                } else if (particleCooltime) {
                  particlePerCooltime /= particleCooltime;
                  particlePerCooltime *= Math.min(duration ?? 1, workCooltime ?? 1);
                }
                break;
              case SP_LONG:
                if (particleCooltime) {
                  particlePerCooltime /= particleCooltime;
                }
                particlePerCooltime *= Math.min(duration ?? 1, workCooltime ?? 1);
                break;
            }
            particlePerCooltime /= workCooltime ?? 1;
            particlePerCooltime = _.floor(particlePerCooltime, 2);
            const row = {
              character: character,
              skillName: characterDetail?.元素スキル?.名前,
              actionKey: actionKey,
              constellation: constellation,
              particleNum: particleNum,
              receiveType: receiveType,
              duration: duration,
              cooltime: cooltime,
              cooltimeType: cooltimeType,
              particleCooltime: particleCooltime,
              generateCount: generateCount,
              particlePerCooltime: particlePerCooltime,
              totalParticleNum: getParticleNumFromInfo(particleInfo),
            }
            result.push(row);
          })
        }
      })
      return result;
    })

    onMounted(() => {
      const promiseValues = Object.keys(CHARACTER_MASTER).map(key => getCharacterMasterDetail(key as TCharacterKey));
      Promise.all(promiseValues).then((responses) => {
        responses.forEach(response => {
          characterMasterMap.set(response.名前, response);
        })
      });
    })

    return {
      displayName,

      columns,
      rows,
    };
  },
});
</script>
<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

.base-container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto auto;
  grid-template-areas:
    "pane1"
    "pane2"
    "pane3"
    "footer";
}

.text-center {
  text-align: center;
}
</style>
<style scoped>
.pane1 {
  position: relative;
}

.left-top {
  position: absolute;
  left: 5px;
  top: 0;
}

.pane3 {
  width: 100%;
  text-align: center;
}
</style>