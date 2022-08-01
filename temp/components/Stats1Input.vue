<template>
    <table>
        <template v-for="category in categoryList" :key="category">
            <tr>
                <th :colspan="editable ? 3 : 2">
                    <label class="open-close">
                        <input class="hidden" type="checkbox" v-model="categoryOpenClose[category]">
                        <span> {{ displayName(category) }} </span>
                    </label>
                </th>
            </tr>
            <tr v-for="stat in visibleStatList(category)" :key="stat">
                <th>{{ displayName(stat) }}</th>
                <td v-if="editable">
                    <input type="number" v-model="statusAdjustments[stat]" @change="adjustmentsOnChange">
                </td>
                <td>{{ displayStatValue(stat) }}</td>
            </tr>
        </template>
        <tr>
            <td>
                <label>
                    <input type="checkbox" v-model="editable">
                    {{ displayName('補正値入力モード') }}
                </label>
            </td>
            <td :colspan="editable ? 2 : 1">
                <label>
                    <input type="checkbox" v-model="initializable">
                    {{ displayName('補正値0初期化') }}
                </label>
                <button type="button" :disabled="!initializable" @click="initializeAdjustments">
                    {{ displayName('実行') }}
                </button>
            </td>
        </tr>
    </table>
</template>

<script lang="ts">
import { ステータスARRAY_MAP, ステータスTEMPLATE } from '@/input';
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
    name: 'Stats1Input',
    props: {
        visible: Boolean,
        lang: String,
        statusObj: Object,
    },
    emits: ['update:stat-adjustment'],
    setup(props) {
        const displayName = (name: string | number) => name;
        const displayStatValue = (stat: string) => {
            if (props.statusObj && props.statusObj[stat]) {
                return props.statusObj[stat];
            }
            return 0;
        };

        const editable = ref(false);
        const initializable = ref(false);

        const excludeCategory = ['元素ステータス·耐性', 'その他'];
        const categoryList = computed(() => ([...ステータスARRAY_MAP.keys()]).filter(s => !excludeCategory.includes(s)));
        const statList = (category: string) => ステータスARRAY_MAP.get(category);
        const categoryOpenClose = ref({} as any);
        for (const category of categoryList.value) {
            categoryOpenClose.value[category] = false;
        }
        const visibleStatList = (category: string) => statList(category)?.filter(stat => categoryOpenClose.value[category] || (props.statusObj && props.statusObj[stat])) ?? [];

        const statusAdjustments = JSON.parse(JSON.stringify(ステータスTEMPLATE));

        //
        const adjustmentsOnChange = () => {
            console.log(statusAdjustments.value);
        };

        // 補正値を0クリアします
        const initializeAdjustments = () => {
            Object.keys(statusAdjustments).forEach(key => {
                statusAdjustments[key] = 0;
            });
        };

        return {
            displayName, displayStatValue,

            categoryList, statList, visibleStatList, categoryOpenClose,

            statusAdjustments,
            adjustmentsOnChange,
            editable, initializable, initializeAdjustments,
        }
    }
});
</script>

<style scoped>
label {
    display: inline-block;
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

th[colspan="2"],
th[colspan="3"] {
    text-align: center;
}

input[type="number"] {
    width: calc(100% - 6px);
}
</style>
