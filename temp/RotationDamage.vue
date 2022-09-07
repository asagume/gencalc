<template>
    <table>
        <tr v-for="(entry, index) in rotationDmgList" :key="index">
            <th>
                <select v-model="entry[0]">
                    <option v-for="(item, index) in damageResultEntryList" :key="index" :value="item[0]">
                        {{ displayName(item[0]) }}
                    </option>
                </select>
            </th>
            <td>
                <select v-model="entry[1]">
                    <option v-for="item in elementalReactionList(entry[0])" :key="item" :value="item">
                        {{ displayName(item) }}
                    </option>
                </select>
            </td>
            <td>×
                <input type="number" min="0" v-model="entry[2]">
            </td>
            <td>
                {{ rotationDmgValue(index) }}
            </td>
        </tr>
        <tr>
            <th>
                <select v-model="newRotationDmg[0]">
                    <option v-for="(item, index) in damageResultEntryList" :key="index" :value="item[0]">
                        {{ displayName(item[0]) }}
                    </option>
                </select>
            </th>
            <td>
                <select>
                    <option v-for="item in elementalReactionList(newRotationDmg[0])" :key="item" :value="item">
                        {{ displayName(item) }}
                    </option>
                </select>
            </td>
            <td>×
                <input type="number">
            </td>
        </tr>
    </table>
</template>
<script lang="ts">
import { deepcopy } from "@/common";
import { TDamageResultEntry } from "@/input";
import { ELEMENT_COLOR_CLASS, TElementColorClassKey } from "@/master";
import { computed, defineComponent, reactive, ref } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
    name: "RotationDamage",
    props: {
        damageResult: {
            type: Object,
            required: true,
        },
    },
    setup(props) {
        const { displayName } = CompositionFunction();

        const 元素反応 = reactive(props.damageResult.元素反応);
        const 増幅反応 = ref("なし");
        const elementClass = (item: string) =>
            ELEMENT_COLOR_CLASS[item as TElementColorClassKey];

        const rotationDmgList = ref([] as [string, string, number][]);
        const newRotationDmg = ref(['', '', 1] as [string, string, number]);

        const damageResultEntryList = computed(() => {
            const result = [] as TDamageResultEntry[];
            ['通常攻撃', '重撃', '落下攻撃', '元素スキル', '元素爆発'].forEach(category => {
                props.damageResult[category].forEach((entry: TDamageResultEntry) => {
                    const newEntry = deepcopy(entry);
                    newEntry[0] = category + ' ' + newEntry[0];
                    result.push(newEntry);
                })
            });
            ['過負荷ダメージ', '感電ダメージ', '超電導ダメージ', '拡散ダメージ', '燃焼ダメージ', '開花ダメージ', '烈開花ダメージ', '超開花ダメージ'].forEach((value, index) => {
                if (元素反応[value] > 0) {
                    const dmgName = '元素反応 ' + value;
                    const dmgElement = ['炎', '雷', '氷', 元素反応.拡散元素, '炎', '草', '草', '草'][index];
                    result.push([dmgName, dmgElement, 元素反応[value], null, 元素反応[value], null, null, null, null]);
                }
            });
            return result;
        })

        const elementalReactionList = ((dmgName: string) => {
            const result = [] as string[];
            result.push('なし');
            if (dmgName) {
                const dmgElement = damageResultEntryList.value.filter(s => s[0] == dmgName)[0][1];
                if (dmgElement) {
                    if (['炎', '水'].includes(dmgElement) && props.damageResult.元素反応.蒸発倍率) {
                        result.push('蒸発');
                    }
                    if (['炎', '氷'].includes(dmgElement) && props.damageResult.元素反応.溶解倍率) {
                        result.push('溶解');
                    }
                    if (['雷'].includes(dmgElement) && props.damageResult.元素反応.超激化ダメージ) {
                        result.push('超激化');
                    }
                    if (['草'].includes(dmgElement) && props.damageResult.元素反応.草激化ダメージ) {
                        result.push('草激化');
                    }
                }
            }
            return result;
        });

        const rotationDmgValue = ((index: number) => {
            let result = 0;
            if (rotationDmgList.value[index]) {
                const dmgName = rotationDmgList.value[index][0];
                let workArr = dmgName.split(' ');
                const category = workArr[0];
                workArr = workArr.slice(1);
                const workName = workArr.join(' ');
                const damegeResultEntry = props.damageResult[category].filter((s: TDamageResultEntry) => s[0] == workName)[0];
                result = damegeResultEntry[2];
            }
            return result;
        })

        return {
            displayName,

            damageResultEntryList,
            elementalReactionList,

            rotationDmgList,
            rotationDmgValue,
            newRotationDmg,

            元素反応,
            増幅反応,
            elementClass,
        };
    },
});
</script>
<style scoped>
.elemental-reaction {
    margin-top: 5px;
    margin-bottom: 5px;
}

.elemental-reaction label {
    margin-top: 2px;
    margin-bottom: 2px;
}

.elemental-reaction [type="radio"]+label {
    background-color: black;
}

.elemental-reaction label span {
    white-space: nowrap;
}

table.result.h-style th {
    white-space: normal;
    text-align: center;
}

table.result.h-style td {
    text-align: center;
}

table.result.h-style th:first-child {
    width: 13rem;
    text-align: right;
}

table.result.h-style thead th:first-child {
    text-align: left;
    padding-left: 1rem;
}

.right {
    text-align: right;
    margin: 1rem;
}

ul.notes {
    list-style-type: none;
    text-align: left;
}
</style>
