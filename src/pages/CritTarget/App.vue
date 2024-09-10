<template>
  <div class="base-container">
    <div class="pane1">
      <p class="left-top"><a href="./">げんかるく</a></p>
      <p>&nbsp;</p>
      <h2>会心率と会心ダメージの目標値</h2>
      <p>&nbsp;</p>
      会心率とダメージの比率と聖遺物のみ（キャラクターと武器の双方に会心系の突破ステータスなし）の場合の基準値を設定すると、
      キャラクターや武器に会心系の突破ステータスがある場合に同レベルの会心スコアを持つ聖遺物を装備した時の会心率と会心ダメージの目安を計算します。
    </div>

    <div class="pane2">
      <vue-good-table :columns="columns" :rows="rows" theme="nocturnal" styleClass="vgt-table striped" :sort-options="{
        enabled: true,
        initialSortBy: [
          { field: 'characterCritScore', type: 'asc' },
          { field: 'weaponRarity', type: 'asc' },
          { field: 'weaponCritScore', type: 'asc' },
        ]
      }" />
    </div>

    <div class="pane3">
      <h3>{{ displayName('設定') }}</h3>
      <table>
        <tbody>
          <tr>
            <th>比率</th>
            <td>
              <label>{{ displayName('会心率') }}
                <input type="number" v-model="critRateRatio" min="0" skip="0.01" @change="calculateCritTarget">
              </label>
            </td>
            <td>:</td>
            <td>
              <label>{{ displayName('会心ダメージ') }}
                <input type="number" v-model="critDmgRatio" min="0" skip="0.01" @change="calculateCritTarget">
              </label>
            </td>
          </tr>
          <tr>
            <th rowspan="2">聖遺物のみの目標値</th>
            <td colspan="3">
              <template v-for="(item, index) in TARGET_PRESET" :key="item[0]">
                <label>
                  <input type="radio" v-model="targetPresetSelected" :value="index" @change="targetPresetOnChange">
                  {{ 'Lv.' + index }}
                </label>
              </template>
            </td>
          </tr>
          <tr>
            <td>
              <label>{{ displayName('会心率') }}
                <input type="number" v-model="critRateTarget" min="0" @change="calculateCritTarget">
              </label>
            </td>
            <td></td>
            <td>
              <label>{{ displayName('会心ダメージ') }}
                <input type="number" v-model="critDmgTarget" min="0" @change="calculateCritTarget">
              </label>
            </td>
          </tr>
          <tr>
            <th>上限</th>
            <td>
              <label>{{ displayName('会心率') }}
                <input type="number" v-model="critRateLimit" min="0" max="100" @change="calculateCritTarget">
              </label>
            </td>
          </tr>
          <tr>
            <th>{{ displayName('氷元素共鳴') }}</th>
            <td>
              <label>{{ displayName('会心率') }}
                <select v-model="cryoResonance" @change="calculateCritTarget">
                  <option value="0"></option>
                  <option value="15">+15%</option>
                </select>
              </label>
            </td>
          </tr>
          <tr>
            <th>{{ displayName('氷風を彷徨う勇士') }}</th>
            <td>
              <label>{{ displayName('会心率') }}
                <select v-model="artifact4BS" @change="calculateCritTarget">
                  <option value="0"></option>
                  <option value="20">+20%</option>
                  <option value="40">+40%</option>
                </select>
              </label>
            </td>
          </tr>
          <tr>
            <th>{{ displayName('ファントムハンター') }}</th>
            <td>
              <label>{{ displayName('会心率') }}
                <select v-model="artifact4PH" @change="calculateCritTarget">
                  <option value="0"></option>
                  <option value="12">+12%</option>
                  <option value="24">+24%</option>
                  <option value="36">+36%</option>
                </select>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      <hr />
    </div>
  </div>
</template>
<script lang="ts">
import 'vue-good-table-next/dist/vue-good-table-next.css';
import { defineComponent, reactive, ref } from "vue";
import CompositionFunction from "@/components/CompositionFunction.vue";

export default defineComponent({
  name: "CritTarget",
  components: {
    'vue-good-table': require('vue-good-table-next').VueGoodTable,
  },
  setup() {
    const { displayName } = CompositionFunction();

    const formatHasCrit = (value: any) => {
      return value ? 'あり' : 'なし';
    };

    const columns = [
      {
        label: displayName('キャラ会心'),
        field: 'characterCritScore',
        formatFn: formatHasCrit,
        thClass: 'text-center',
        tdClass: 'text-center',
      },
      {
        label: displayName('武器会心'),
        field: 'weaponCritScore',
        formatFn: formatHasCrit,
        thClass: 'text-center',
        tdClass: 'text-center',
      },
      {
        label: displayName('武器レアリティ'),
        field: 'weaponRarity',
        thClass: 'text-center',
        tdClass: 'text-center',
      },
      {
        label: displayName('武器会心スコア'),
        field: 'weaponCritScore',
        thClass: 'text-center',
        tdClass: 'text-center',
      },
      {
        label: displayName('会心率'),
        field: 'targetCritRate',
        width: '15%',
        thClass: 'text-center',
        tdClass: 'text-center',
      },
      {
        label: displayName('会心ダメージ'),
        field: 'targetCritDmg',
        width: '15%',
        thClass: 'text-center',
        tdClass: 'text-center',
      },
      {
        label: displayName('期待値'),
        field: 'expectedDmg',
        width: '15%',
        thClass: 'text-center',
        tdClass: 'text-center',
      }
    ];
    const rows = reactive([
      {
        characterCritScore: 0,
        weaponCritScore: 0,
        weaponRarity: null,
        weaponBaseAtk: null,
        targetCritRate: '',
        targetCritDmg: '',
        expectedDmg: '',
      },
      {
        characterCritScore: 38.4,
        weaponCritScore: 0,
        weaponRarity: null,
        weaponBaseAtk: null,
        targetCritRate: '',
        targetCritDmg: '',
        expectedDmg: '',
      },
      {
        characterCritScore: 0,
        weaponCritScore: 36.8,
        weaponRarity: 4,
        weaponBaseAtk: 44,
        targetCritRate: '',
        targetCritDmg: '',
        expectedDmg: '',
      },
      {
        characterCritScore: 0,
        weaponCritScore: 55.1,
        weaponRarity: 4,
        weaponBaseAtk: 42,
        targetCritRate: '',
        targetCritDmg: '',
        expectedDmg: '',
      },
      {
        characterCritScore: 0,
        weaponCritScore: 73.6,
        weaponRarity: 4,
        weaponBaseAtk: 41,
        targetCritRate: '',
        targetCritDmg: '',
        expectedDmg: '',
      },
      {
        characterCritScore: 38.4,
        weaponCritScore: 36.8,
        weaponRarity: 4,
        weaponBaseAtk: 44,
        targetCritRate: '',
        targetCritDmg: '',
        expectedDmg: '',
      },
      {
        characterCritScore: 38.4,
        weaponCritScore: 55.1,
        weaponRarity: 4,
        weaponBaseAtk: 42,
        targetCritRate: '',
        targetCritDmg: '',
        expectedDmg: '',
      },
      {
        characterCritScore: 38.4,
        weaponCritScore: 73.6,
        weaponRarity: 4,
        weaponBaseAtk: 41,
        targetCritRate: '',
        targetCritDmg: '',
        expectedDmg: '',
      },
      {
        characterCritScore: 0,
        weaponCritScore: 44.1,
        weaponRarity: 5,
        weaponBaseAtk: 48,
        targetCritRate: '',
        targetCritDmg: '',
        expectedDmg: '',
      },
      {
        characterCritScore: 0,
        weaponCritScore: 66.2,
        weaponRarity: 5,
        weaponBaseAtk: 46,
        targetCritRate: '',
        targetCritDmg: '',
        expectedDmg: '',
      },
      {
        characterCritScore: 0,
        weaponCritScore: 88.2,
        weaponRarity: 5,
        weaponBaseAtk: 44,
        targetCritRate: '',
        targetCritDmg: '',
        expectedDmg: '',
      },
      {
        characterCritScore: 38.4,
        weaponCritScore: 44.1,
        weaponRarity: 5,
        weaponBaseAtk: 48,
        targetCritRate: '',
        targetCritDmg: '',
        expectedDmg: '',
      },
      {
        characterCritScore: 38.4,
        weaponCritScore: 66.2,
        weaponRarity: 5,
        weaponBaseAtk: 46,
        targetCritRate: '',
        targetCritDmg: '',
        expectedDmg: '',
      },
      {
        characterCritScore: 38.4,
        weaponCritScore: 88.2,
        weaponRarity: 5,
        weaponBaseAtk: 44,
        targetCritRate: '',
        targetCritDmg: '',
        expectedDmg: '',
      }
    ]);

    const TARGET_PRESET = [
      [50, 100],
      [55, 110],
      [60, 120],
      [65, 130],
      [70, 140],
      [75, 150],
      [80, 160],
      [85, 170],
    ];
    const targetPresetSelected = ref(2);
    if (localStorage.getItem('CritTarget') != null) {
      targetPresetSelected.value = Number(localStorage.getItem('CritTarget'));
    }
    const critRateRatio = ref(1);     // 率ダメ比率の率
    const critDmgRatio = ref(2);      // 率ダメ比率のダメ
    const critRateTarget = ref(TARGET_PRESET[targetPresetSelected.value][0]);   // 会心率目標値
    const critDmgTarget = ref(TARGET_PRESET[targetPresetSelected.value][1]);   // 会心ダメージ目標値
    const critRateLimit = ref(100);   // 会心率上限
    const cryoResonance = ref(0);     // 氷元素共鳴 会心率+15
    const artifact4BS = ref(0);       // 氷風を彷徨う勇士 4セット効果
    const artifact4PH = ref(0);       // ファントムハンター 4セット効果

    const calculateCritTarget = () => {
      rows.forEach(row => {
        let workRate = critRateTarget.value;
        let workDmg = critDmgTarget.value;
        let workAdd = row.characterCritScore + row.weaponCritScore;
        if (cryoResonance.value) {
          workAdd += Number(cryoResonance.value) * 2;
        }
        if (artifact4BS.value) {
          workAdd += Number(artifact4BS.value) * 2;
        }
        if (artifact4PH.value) {
          workAdd += Number(artifact4PH.value) * 2;
        }
        const ratioDenominator = critRateRatio.value * 2 + critDmgRatio.value;
        workRate += workAdd * (critRateRatio.value / ratioDenominator);
        workDmg += workAdd * (critDmgRatio.value / ratioDenominator);
        let workRateLimit = critRateLimit.value;
        if (workRate > workRateLimit) {
          workDmg += (workRate - workRateLimit) * 2;
          workRate = workRateLimit;
        }
        row.targetCritRate = Math.round(workRate * 10) / 10 + '%';
        row.targetCritDmg = Math.round(workDmg * 10) / 10 + '%';
        // 期待値を計算します
        let expectedDmg = 0;
        expectedDmg += workRate / 100 * (100 + workDmg);
        expectedDmg += (100 - workRate) / 100 * 100;
        expectedDmg = Math.round(expectedDmg * 10) / 10;
        row.expectedDmg = expectedDmg + '%';
      });
    };
    calculateCritTarget();

    const targetPresetOnChange = () => {
      critRateTarget.value = TARGET_PRESET[targetPresetSelected.value][0];
      critDmgTarget.value = TARGET_PRESET[targetPresetSelected.value][1];
      calculateCritTarget();
      localStorage.setItem('CritTarget', String(targetPresetSelected.value));
    };

    return {
      displayName,

      columns,
      rows,

      critRateRatio,
      critDmgRatio,
      critRateTarget,
      critDmgTarget,
      critRateLimit,
      cryoResonance,
      artifact4BS,
      artifact4PH,
      TARGET_PRESET,
      targetPresetSelected,

      calculateCritTarget,
      targetPresetOnChange,
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

table {
  table-layout: fixed;
  margin-left: auto;
  margin-right: auto;
  border-spacing: 0;
}

th {
  text-align: right;
  padding-right: 10px;
  border-bottom: 1px solid gray;
  padding: 5px;
}

td {
  text-align: left;
  padding-left: 10px;
  border-bottom: 1px solid gray;
  padding: 5px;
}

td input[type="number"] {
  width: 12rem;
}

label+label {
  margin-left: 10px;
}

td select {
  width: 12rem;
}

.expected-value {
  color: gold;
}
</style>
