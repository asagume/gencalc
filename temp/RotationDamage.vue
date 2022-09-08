<template>
    <fieldset>
        <ul class="action-list">
            <draggable :list="actionList" item-key="id" :group="{ name: 'action', pull: 'clone', put: false, }"
                :sort="false">
                <template #item="{ element }">
                    <li>
                        <img class="action" :src="element.src" :alt="displayName(element.name)" />
                        <div>{{ displayName(element.name) }}</div>
                    </li>
                </template>
            </draggable>
        </ul>
        <table class="customized-result">
            <draggable :list="customizedResultList" item-key="id" group="action" :sort="true">
                <template #item="{ element, index }">
                    <tr>
                        <th class="category">
                            <img class="action" :src="element.src" :alt="displayName(element.name)" />
                        </th>
                        <td class="damage">
                            <table>
                                <tr v-for="(entry, index2) in damageResultEntryList(element)" :key="index2">
                                    <th class="damage-name"> {{ displayName(entry[0]) }} </th>
                                    <td>
                                        <select v-model="element.reactions[index2]">
                                            <option value=""></option>
                                            <option v-for="reaction in amplifyingReactionList(element, index2)"
                                                :value="reaction" :key="reaction"> {{ displayName(reaction) }} </option>
                                        </select>
                                    </td>
                                    <td><input type="number" v-model="element.counts[index2]" min="0"></td>
                                    <td :class="'damage-value' + elementColorClass(element, index2)"> {{
                                    Math.round(damageValue(element, index2)) }} </td>
                                </tr>
                            </table>
                        </td>
                        <td>
                            <button type="button" @click="doDelete(index)">
                                <span class="material-symbols-outlined"> delete </span>
                            </button>
                        </td>
                    </tr>
                </template>
            </draggable>
        </table>
        <table class="total-damage">
            <tr>
                <th class="damage-name"> {{ displayName('合計ダメージ') }} </th>
                <td class="total-damage-value"> {{ Math.round(totalDamage) }} </td>
            </tr>
        </table>
    </fieldset>
    <p>天賦アイコンをドラッグ&amp;ドロップしてスキルローテーションを設定してください。</p>
</template>
<script lang="ts">
import draggable from "vuedraggable";
import { TDamageResult, TDamageResultEntry } from "@/input";
import { ELEMENTAL_REACTION_MASTER, ELEMENT_COLOR_CLASS, ELEMENT_IMG_SRC, TCharacterDetail, TElementColorClassKey, } from "@/master";
import { computed, defineComponent, PropType, reactive, } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

type TCustomizedDamageResultEntry = {
    id: number,
    name: string,
    src: string,
    category: string,
    reactions: string[],
    counts: number[],
};

export default defineComponent({
    name: "RotationDamage",
    components: {
        draggable,
    },
    props: {
        characterMaster: { type: Object as PropType<TCharacterDetail>, required: true },
        damageResult: { type: Object as PropType<TDamageResult>, required: true, },
    },
    setup(props) {
        const { displayName } = CompositionFunction();

        const reactionDmgArr = [
            '過負荷ダメージ',
            '感電ダメージ',
            '超電導ダメージ',
            '拡散ダメージ',
            '燃焼ダメージ',
            '開花ダメージ',
            '烈開花ダメージ',
            '超開花ダメージ',
            '超激化ダメージ',
            '草激化ダメージ',
        ];

        const reactionDmgElementMap = computed(() => {
            const result = new Map();
            reactionDmgArr.forEach(reactionDmg => {
                const reaction = reactionDmg.replace(/ダメージ$/, '');
                Object.keys(ELEMENTAL_REACTION_MASTER).forEach(element => {
                    const reactionMaster = (ELEMENTAL_REACTION_MASTER as any)[element];
                    const workArr = Object.keys(reactionMaster);
                    if (workArr.includes(reaction)) {
                        if ('元素' in reactionMaster[reaction]) {
                            result.set(reactionDmg, reactionMaster[reaction].元素);
                        }
                    }
                });
            });
            return result;
        });

        const damageResultEntryList = (customizedEntry: TCustomizedDamageResultEntry): TDamageResultEntry[] => {
            let result = [] as TDamageResultEntry[];
            const category = customizedEntry.category;
            if (reactionDmgArr.includes(category)) {
                result.push([
                    category,
                    reactionDmgElementMap.value.get(category),
                    (props.damageResult.元素反応 as any)[category],
                    null,
                    (props.damageResult.元素反応 as any)[category],
                    null,
                    1,
                    null,
                    null,
                ]);
            } else if (category == '通常攻撃') {
                result = props.damageResult[category].filter((s: TDamageResultEntry) => s[0] != '合計ダメージ');
            } else {
                result = props.damageResult[category] as TDamageResultEntry[];
            }
            return result;
        };

        const actionList = computed(() => {
            const result = [] as TCustomizedDamageResultEntry[];
            let id = 1;
            ['通常攻撃', '重撃', '落下攻撃', '元素スキル', '元素爆発'].forEach((category, index) => {
                const reactions = [] as string[];
                const counts = [] as number[];
                const customizedEntry = {
                    id: id++,
                    name: category,
                    src: [
                        props.characterMaster.通常攻撃.icon_url,
                        props.characterMaster.通常攻撃.icon_url,
                        props.characterMaster.通常攻撃.icon_url,
                        props.characterMaster.元素スキル.icon_url,
                        props.characterMaster.元素爆発.icon_url,
                    ][index],
                    category: category,
                    reactions: reactions,
                    counts: counts,
                };
                for (let i = 0; i < damageResultEntryList(customizedEntry).length; i++) {
                    reactions.push('');
                    counts.push(1);
                }
                result.push(customizedEntry);
            });
            reactionDmgArr.forEach(reactionDmg => {
                if ((props.damageResult.元素反応 as any)[reactionDmg]) {
                    let dmgElement;
                    if (reactionDmg == '拡散') {
                        dmgElement = props.damageResult.元素反応.拡散元素;
                    } else {
                        dmgElement = reactionDmgElementMap.value.get(reactionDmg);
                    }
                    const reactions = [] as string[];
                    const counts = [] as number[];
                    const customizedEntry = {
                        id: id++,
                        name: reactionDmg.replace(/ダメージ$/, ''),
                        src: (ELEMENT_IMG_SRC as any)[dmgElement],
                        category: reactionDmg,
                        reactions: reactions,
                        counts: counts,
                    };
                    for (let i = 0; i < damageResultEntryList(customizedEntry).length; i++) {
                        reactions.push('');
                        counts.push(1);
                    }
                    result.push(customizedEntry);
                }
            });
            return result;
        });

        const customizedResultList = reactive([] as TCustomizedDamageResultEntry[]);

        const amplifyingReactionList = (customizedEntry: TCustomizedDamageResultEntry, index: number) => {
            const result = [] as string[];
            const list = damageResultEntryList(customizedEntry);
            const entry = list[index];
            const dmgElement = entry[1];
            if (dmgElement) {
                if (['炎', '水'].includes(dmgElement) && props.damageResult.元素反応.蒸発倍率 > 0) {
                    result.push('蒸発');
                }
                if (['炎', '氷'].includes(dmgElement) && props.damageResult.元素反応.溶解倍率 > 0) {
                    result.push('溶解');
                }
                if (['雷'].includes(dmgElement) && props.damageResult.元素反応.超激化ダメージ > 0) {
                    result.push('超激化');
                }
                if (['草'].includes(dmgElement) && props.damageResult.元素反応.草激化ダメージ > 0) {
                    result.push('草激化');
                }
            }
            return result;
        };

        const damageValue = (customizedEntry: TCustomizedDamageResultEntry, index: number) => {
            const list = damageResultEntryList(customizedEntry);
            const entry = list[index];
            let result = entry[2];
            const reaction = customizedEntry.reactions[index];
            const count = customizedEntry.counts[index];
            if (reaction) {
                if (['蒸発', '溶解'].includes(reaction)) {
                    result *= (props.damageResult.元素反応 as any)[reaction + '倍率'];
                } else if (['超激化', '草激化'].includes(reaction)) {
                    let reactionDmg = (props.damageResult.元素反応 as any)[reaction + 'ダメージ'];
                    if (entry[3]) {
                        reactionDmg *= entry[3] / entry[4];
                    }
                    if (entry[7]) {
                        reactionDmg *= entry[7];
                    }
                    if (entry[8]) {
                        reactionDmg *= entry[8];
                    }
                    result += reactionDmg;
                }
            }
            result *= count;
            return result;
        };

        const elementColorClass = (customizedEntry: TCustomizedDamageResultEntry, index: number) => {
            const list = damageResultEntryList(customizedEntry);
            const entry = list[index];
            return entry[1] ? ' ' + ELEMENT_COLOR_CLASS[entry[1] as TElementColorClassKey] + ' ' : '';
        }

        const totalDamage = computed(() => {
            let result = 0;
            customizedResultList.forEach(customizedEntry => {
                const list = damageResultEntryList(customizedEntry);
                for (let i = 0; i < list.length; i++) {
                    result += damageValue(customizedEntry, i);
                }
            });
            return result;
        });

        const doDelete = (index: number) => {
            customizedResultList.splice(index, 1);
        };

        return {
            displayName,

            actionList,
            damageResultEntryList,
            customizedResultList,
            amplifyingReactionList,
            damageValue,
            elementColorClass,
            doDelete,

            totalDamage,
        }
    },
});
</script>
<style scoped>
ul.action-list {
    width: 100%;
    list-style-type: none;
    padding: 0;
}

ul.action-list li {
    display: inline-block;
    margin: 0;
    position: relative;
    width: calc(100% / 6);
    white-space: nowrap;
    font-size: 2rem;
}

img.action {
    width: 60px;
    object-fit: fill;
    border: none;
}

table {
    width: 100%;
}

table.customized-result {
    border: 2px solid gray;
    padding: 10px 0;
    font-size: 2rem;
}

.category {
    width: 60px;
    text-align: left;
}

select {
    width: 100%;
}

.damage table {
    width: 100%;
    table-layout: fixed;
}

.damage-name {
    text-align: right;
    width: 50%;
}

.damage-value {
    text-align: right;
}

input[type="number"] {
    width: 100%;
}

table.total-damage th,
table.total-damage td {
    padding: 5px;
}

.total-damage-value {
    text-align: left;
}
</style>
