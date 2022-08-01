<template>
    <div v-if="visible">
        <fieldset>
            <legend>{{ displayName('聖遺物詳細') }}</legend>
            <label class="two">
                {{ displayName('生の花') }}
                <select v-model="mainstats[0]" @change="updateMainstats">
                    <option value=""></option>
                    <option v-for="item in mainstat1List" :value="item" :key="item"> {{ displayName(item) }} </option>
                </select>
            </label>
            <label class="two">
                {{ displayName('死の羽') }}
                <select v-model="mainstats[1]" @change="updateMainstats">
                    <option value=""></option>
                    <option v-for="item in mainstat2List" :value="item" :key="item"> {{ displayName(item) }} </option>
                </select>
            </label>
            <label class="three">
                {{ displayName('時の砂') }}
                <select v-model="mainstats[2]" @change="updateMainstats">
                    <option value=""></option>
                    <option v-for="item in mainstat3List" :value="item" :key="item"> {{ displayName(item) }} </option>
                </select>
            </label>
            <label class="three">
                {{ displayName('空の杯') }}
                <select v-model="mainstats[3]" @change="updateMainstats">
                    <option value=""></option>
                    <option v-for="item in mainstat4List" :value="item" :key="item"> {{ displayName(item) }} </option>
                </select>
            </label>
            <label class="three">
                {{ displayName('理の冠') }}
                <select v-model="mainstats[4]" @change="updateMainstats">
                    <option value=""></option>
                    <option v-for="item in mainstat5List" :value="item" :key="item"> {{ displayName(item) }} </option>
                </select>
            </label>
            <table>
                <tr>
                    <th>{{ displayName('HP') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="artifactStats.HP">
                        <span v-else>{{ artifactStats.HP }}</span>
                    </td>
                    <th>{{ displayName('HP%') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="artifactStats['HP%']">
                        <span v-else>{{ artifactStats['HP%'] }}</span>
                    </td>
                </tr>
                <tr>
                    <th>{{ displayName('攻撃力') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="artifactStats.攻撃力">
                        <span v-else>{{ artifactStats.攻撃力 }}</span>
                    </td>
                    <th>{{ displayName('攻撃力%') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="artifactStats['攻撃力%']">
                        <span v-else>{{ artifactStats['攻撃力%'] }}</span>
                    </td>
                </tr>
                <tr>
                    <th>{{ displayName('防御力') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="artifactStats.防御力">
                        <span v-else>{{ artifactStats.防御力 }}</span>
                    </td>
                    <th>{{ displayName('防御力%') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="artifactStats['防御力%']">
                        <span v-else>{{ artifactStats['防御力%'] }}</span>
                    </td>
                </tr>
                <tr>
                    <th>{{ displayName('元素熟知') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="artifactStats.元素熟知">
                        <span v-else>{{ artifactStats.元素熟知 }}</span>
                    </td>
                </tr>
                <tr>
                    <th>{{ displayName('会心率') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="artifactStats.会心率">
                        <span v-else>{{ artifactStats.会心率 }}</span>
                    </td>
                    <td colspan="2" style="border-color: transparent;">
                        <label>
                            <input type="checkbox" v-model="editable">
                            {{ displayName('直接入力モード') }}
                        </label>
                    </td>
                </tr>
                <tr>
                    <th>{{ displayName('会心ダメージ') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="artifactStats.会心ダメージ">
                        <span v-else>{{ artifactStats.会心ダメージ }}</span>
                    </td>
                    <td colspan="2" style="border-color: transparent;">
                        <label>
                            <input type="checkbox" v-model="gensenEnabled">
                            {{ displayName('一括変更') }}
                        </label>
                    </td>
                </tr>
                <tr>
                    <th>{{ displayName('元素チャージ効率') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="artifactStats.元素チャージ効率">
                        <span v-else>{{ artifactStats.元素チャージ効率 }}</span>
                    </td>
                    <td colspan="2" style="border-color: transparent;">
                        <select v-model="gensen" @change="gensenOnChange" :disabled="!gensenEnabled">
                            <option v-for="item in gensenList" :value="item" :key="item">{{ displayName(item) }}
                            </option>
                        </select>
                    </td>
                </tr>
            </table>
        </fieldset>
        <fieldset>
            <legend>{{ displayName('聖遺物サブ効果 簡易設定') }}</legend>
            <table style="margin-top: 0;">
                <tr>
                    <th>{{ displayName('優先するサブ効果') }}</th>
                    <th>{{ displayName('上昇値') }}</th>
                    <th>{{ displayName('初期+強化') }}</th>
                    <td></td>
                </tr>
                <tr v-for="i in [0, 1, 2]" :key="i">
                    <td>
                        <select v-model="prioritySubstats[i]" @change="updatePrioritySubstats">
                            <option value=""></option>
                            <option v-for="item in prioritySubstatList" :value="item" :key="item">
                                {{ displayName(item) }} </option>
                        </select>
                    </td>
                    <td>
                        <select v-model="prioritySubstatValues[i]" @change="updatePrioritySubstats">
                            <option v-for="item, index in prioritySubstatValueList(i)" :value="index" :key="index">
                                {{ Math.round(item * 10) / 10 }} </option>
                        </select>
                    </td>
                    <td>
                        <select v-model="prioritySubstatCounts[i]" @change="updatePrioritySubstats">
                            <option v-for="item in prioritySubstatCountList" :value="item" :key="item">
                                {{ ' × ' + displayName(item) }} </option>
                        </select>
                    </td>
                    <td></td>
                </tr>
            </table>
        </fieldset>
    </div>
</template>

<script lang="ts">
import { ARTIFACT_DETAIL_INPUT_TEMPLATE, 聖遺物ステータスTEMPLATE, 聖遺物メイン効果_時の砂ARRAY, 聖遺物メイン効果_死の羽ARRAY, 聖遺物メイン効果_理の冠ARRAY, 聖遺物メイン効果_生の花ARRAY, 聖遺物メイン効果_空の杯ARRAY, 聖遺物優先するサブ効果ARRAY } from '@/input';
import { ARTIFACT_MAIN_MASTER, ARTIFACT_SUB_MASTER, TArtifactMainRarity, TArtifactMainStat } from '@/master';
import { computed, defineComponent, reactive, ref } from 'vue';

export default defineComponent({
    name: 'ArtifactDetailInput',
    props: {
        visible: Boolean,
        lang: String,
        artifactDetailInput: { type: Object, default: JSON.parse(JSON.stringify(ARTIFACT_DETAIL_INPUT_TEMPLATE)) },
    },
    emits: ['update:artifact-detail'],
    setup(props, context) {
        const displayName = (name: string | number) => name;

        let artifactDetailInput = ref(props.artifactDetailInput);

        // 配列およびオブジェクトの更新は親コンポーネントに影響があります
        let mainstats = ref(props.artifactDetailInput?.聖遺物メイン効果 ?? [null, null, null]);
        let prioritySubstats = ref(props.artifactDetailInput?.聖遺物優先するサブ効果 ?? [null, null, null]);
        let prioritySubstatValues = ref(props.artifactDetailInput?.聖遺物優先するサブ効果上昇値 ?? [-1, -1, -1]);
        let prioritySubstatCounts = ref(props.artifactDetailInput?.聖遺物優先するサブ効果上昇回数 ?? [0, 0, 0]);
        let artifactStats = reactive(props.artifactDetailInput?.聖遺物ステータス ?? JSON.parse(JSON.stringify(聖遺物ステータスTEMPLATE)));

        let editable = ref(false);
        let gensenEnabled = ref(false);
        const gensenList = ['', '厳選初心者', '厳選1ヶ月', '厳選3ヶ月', '日々石割'];
        let gensen = ref("");

        const upTotalCount = computed(() => {
            let result = 0;
            for (let count of prioritySubstatCounts.value) {
                result += count;
            }
            return result;
        });


        /** 優先するサブ効果上昇値のオプション値のリストを作成します */
        const prioritySubstatValueList = (index: number) => {
            const result = [];
            if (prioritySubstats.value[index]) {
                const substat = prioritySubstats.value[index] as keyof typeof ARTIFACT_SUB_MASTER;
                const valueArr = ARTIFACT_SUB_MASTER[substat];
                for (let i = 0; i < valueArr.length; i++) {
                    result.push(valueArr[i]);
                    if (i < valueArr.length - 1) {
                        let diff = valueArr[i + 1] - valueArr[i];
                        result.push(valueArr[i] + diff / 2);
                    }
                }
            }
            return result;
        };

        /** メイン効果が更新されました */
        const updateMainstats = () => {
            calculateArtifactStats();
            context.emit('update:artifact-detail', artifactDetailInput.value);
        };
        /** 優先するサブ効果が更新されました */
        const updatePrioritySubstats = () => {
            calculateArtifactStats();
            context.emit('update:artifact-detail', artifactDetailInput.value);
        };
        /** 厳選目安が選択されました */
        const gensenOnChange = () => {
            gensenEnabled.value = false;
            console.log(gensen.value);
            context.emit('update:artifact-detail', artifactDetailInput.value);
        };

        /** 聖遺物ステータスを計算します */
        const calculateArtifactStats = () => {
            (Object.keys(artifactStats) as (keyof typeof artifactStats)[]).forEach(key => {
                artifactStats[key] = 0;
            });
            for (const statWithRarity of mainstats.value) {
                if (!statWithRarity) continue;
                const stat: [TArtifactMainRarity, TArtifactMainStat] = statWithRarity.split('_');
                artifactStats[stat[1]] += ARTIFACT_MAIN_MASTER[stat[0]][stat[1]];
            }
        };

        calculateArtifactStats();

        return {
            displayName,
            mainstat1List: 聖遺物メイン効果_生の花ARRAY,
            mainstat2List: 聖遺物メイン効果_死の羽ARRAY,
            mainstat3List: 聖遺物メイン効果_時の砂ARRAY,
            mainstat4List: 聖遺物メイン効果_空の杯ARRAY,
            mainstat5List: 聖遺物メイン効果_理の冠ARRAY,
            prioritySubstatList: 聖遺物優先するサブ効果ARRAY,
            prioritySubstatValueList,
            prioritySubstatCountList: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            mainstats, prioritySubstats, prioritySubstatValues, prioritySubstatCounts,
            artifactStats, upTotalCount,
            editable,
            gensenEnabled, gensen, gensenList, gensenOnChange,
            updateMainstats, updatePrioritySubstats,
        }
    }
});
</script>

<style scoped>
label {
    display: inline-block;
    color: #df8f37;
}

.two {
    width: calc(100% / 2 - 6px);
}

.three {
    width: calc(100% / 3 - 6px);
}

.two select {
    width: 50%;
}

.three select {
    width: 100%;
}

table {
    width: 100%;
    table-layout: fixed;
    border-top: 2px solid gray;
    margin-top: 10px;
}

th,
td {
    text-align: right;
    white-space: nowrap;
    border-bottom: 2px solid gray;
    padding-right: 4px;
}

th {
    color: #df8f37;
}

input[type="number"] {
    width: calc(100% - 6px);
}
</style>
