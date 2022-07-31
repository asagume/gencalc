<template>
    <div v-if="visible">
        <fieldset>
            <legend>{{ displayName('聖遺物詳細') }}</legend>
            <label>
                {{ displayName('生の花') }}
                <select v-model="mainstat[0]" @change="updateMainstat">
                    <option value=""></option>
                    <option v-for="item in mainstat1List" :value="item" :key="item"> {{ displayName(item) }} </option>
                </select>
            </label>
            <label>
                {{ displayName('死の羽') }}
                <select v-model="mainstat[1]" @change="updateMainstat">
                    <option value=""></option>
                    <option v-for="item in mainstat2List" :value="item" :key="item"> {{ displayName(item) }} </option>
                </select>
            </label>
            <label>
                {{ displayName('時の砂') }}
                <select v-model="mainstat[2]" @change="updateMainstat">
                    <option value=""></option>
                    <option v-for="item in mainstat3List" :value="item" :key="item"> {{ displayName(item) }} </option>
                </select>
            </label>
            <label>
                {{ displayName('空の杯') }}
                <select v-model="mainstat[3]" @change="updateMainstat">
                    <option value=""></option>
                    <option v-for="item in mainstat4List" :value="item" :key="item"> {{ displayName(item) }} </option>
                </select>
            </label>
            <label>
                {{ displayName('理の冠') }}
                <select v-model="mainstat[4]" @change="updateMainstat">
                    <option value=""></option>
                    <option v-for="item in mainstat5List" :value="item" :key="item"> {{ displayName(item) }} </option>
                </select>
            </label>
            <table>
                <tr>
                    <th>{{ displayName('HP') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="stat.HP">
                        <span v-else>{{ stat.HP }}</span>
                    </td>
                    <th>{{ displayName('HP%') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="stat['HP%']">
                        <span v-else>{{ stat['HP%'] }}</span>
                    </td>
                </tr>
                <tr>
                    <th>{{ displayName('攻撃力') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="stat.攻撃力">
                        <span v-else>{{ stat.攻撃力 }}</span>
                    </td>
                    <th>{{ displayName('攻撃力%') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="stat['攻撃力%']">
                        <span v-else>{{ stat['攻撃力%'] }}</span>
                    </td>
                </tr>
                <tr>
                    <th>{{ displayName('防御力') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="stat.防御力">
                        <span v-else>{{ stat.防御力 }}</span>
                    </td>
                    <th>{{ displayName('防御力%') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="stat['防御力%']">
                        <span v-else>{{ stat['防御力%'] }}</span>
                    </td>
                </tr>
                <tr>
                    <th>{{ displayName('元素熟知') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="stat.元素熟知">
                        <span v-else>{{ stat.元素熟知 }}</span>
                    </td>
                </tr>
                <tr>
                    <th>{{ displayName('会心率') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="stat.会心率">
                        <span v-else>{{ stat.会心率 }}</span>
                    </td>
                </tr>
                <tr>
                    <th>{{ displayName('会心ダメージ') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="stat.会心ダメージ">
                        <span v-else>{{ stat.会心ダメージ }}</span>
                    </td>
                </tr>
                <tr>
                    <th>{{ displayName('元素チャージ効率') }}</th>
                    <td>
                        <input v-if="editable" type="number" v-model="stat.元素チャージ効率">
                        <span v-else>{{ stat.元素チャージ効率 }}</span>
                    </td>
                </tr>
            </table>
        </fieldset>
        <fieldset>
            <legend>{{ displayName('簡易設定') }}</legend>
            <table>
                <tr>
                    <th>{{ displayName('優先するサブ効果') }}</th>
                    <th>{{ displayName('上昇値') }}</th>
                    <th>{{ displayName('初期+強化') }}</th>
                    <td></td>
                </tr>
                <tr v-for="i in [0, 1, 2]" :key="i">
                    <td>
                        <select v-model="prioritySubstat[i]" @change="updatePrioritySubstat">
                            <option value=""></option>
                            <option v-for="item in prioritySubstatList" :value="item" :key="item">
                                {{ displayName(item) }} </option>
                        </select>
                    </td>
                    <td>
                        <select v-model="prioritySubstatValue[i]" @change="updatePrioritySubstat">
                            <option v-for="item, index in prioritySubstatValueList(i)" :value="index" :key="index">
                                {{ Math.round(item * 10) / 10 }} </option>
                        </select>
                    </td>
                    <td>
                        <select v-model="prioritySubstatCount[i]" @change="updatePrioritySubstat">
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
import { 聖遺物ステータスTEMPLATE, 聖遺物メイン効果_時の砂ARRAY, 聖遺物メイン効果_死の羽ARRAY, 聖遺物メイン効果_理の冠ARRAY, 聖遺物メイン効果_生の花ARRAY, 聖遺物メイン効果_空の杯ARRAY, 聖遺物優先するサブ効果ARRAY } from '@/input';
import { ARTIFACT_SUB_MASTER, TArtifactMainStat } from '@/master';
import { computed, defineComponent, reactive, ref } from 'vue';

export default defineComponent({
    name: 'ArtifactDetailInput',
    props: {
        visible: Boolean,
        artifactDetailInput: Object,
    },
    emits: ['update:artifact-detail'],
    setup(props, context) {
        const displayName = (name: string | number) => name;

        let artifactDetailInput = ref(props.artifactDetailInput);

        let mainstat = ref(props.artifactDetailInput!.聖遺物メイン効果);
        let prioritySubstat = ref(props.artifactDetailInput!.聖遺物優先するサブ効果);
        let prioritySubstatValue = ref(props.artifactDetailInput!.聖遺物優先するサブ効果上昇値);
        let prioritySubstatCount = ref(props.artifactDetailInput!.聖遺物優先するサブ効果上昇回数);
        let stat = reactive(props.artifactDetailInput!.聖遺物ステータス);

        let editable = ref(false);

        const prioritySubstatValueList = (index: number) => {
            const result = [];
            if (prioritySubstat.value[index]) {
                const substat = prioritySubstat.value[index] as keyof typeof ARTIFACT_SUB_MASTER;
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

        const updateMainstat = () => {
            context.emit('update:artifact-detail', artifactDetailInput.value);
        };
        const updatePrioritySubstat = () => {
            context.emit('update:artifact-detail', artifactDetailInput.value);
        };

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
            mainstat, prioritySubstat, prioritySubstatValue, prioritySubstatCount,
            stat,
            editable,
            updateMainstat, updatePrioritySubstat,
        }
    }
});
</script>

<style scoped>
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
}
</style>
