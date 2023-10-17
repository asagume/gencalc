<template>
    <table>
        <tr v-for="(key, index) in SHIELD_BREAK_MAP.keys()" :key="index">
            <th>
                <img :src="imgSrc(key)" :alt="key" class="element-icon">
            </th>
            <td v-for="(column, colIndex) in SHIELD_BREAK_MAP.get(key)" :key="colIndex">
                <img v-for="(item, itemIndex) in column" :key="itemIndex" :src="imgSrc(item)" :alt="item"
                    class="element-icon">
            </td>
        </tr>
    </table>
</template>
<script lang="ts">
import { ELEMENT_IMG_SRC, IMG_SRC_DUMMY } from '@/master';
import { defineComponent } from 'vue';

export default defineComponent({
    name: "ElementShieldInfo",
    setup() {
        const SHIELD_BREAK_MAP = new Map<string, string[][]>([
            ['炎', [['水'], [], ['氷', '風', '岩']]],
            ['水', [['草'], ['雷', '氷'], ['炎', '風', '岩']]],
            ['雷', [[], ['炎', '氷', '草'], ['風', '岩']]],
            ['氷', [['炎'], [], ['風', '岩']]],
        ]);

        const imgSrc = (element: string) => {
            return (ELEMENT_IMG_SRC as any)[element] ?? IMG_SRC_DUMMY;
        }

        return {
            SHIELD_BREAK_MAP,
            imgSrc,
        }
    }
});
</script>
<style scoped>
table {
    margin-left: auto;
    margin-right: auto;
    min-width: 300px;
    width: 50%;
    table-layout: fixed;
}

th {
    width: 40px;    
}

td {
    text-align: left;
}

.element-icon {
    width: 30px;
    height: 30px;
}
</style>