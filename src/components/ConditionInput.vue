<template>
    <fieldset>
        <label v-for="item in checkboxList" :key="item">
            <input type="checkbox" v-model="conditionValues[item]" :value="item">
            <span>{{ item }}</span>
        </label>
        <label v-for="item in selectList" :key="item.key">
            <span>{{ item.key }}</span>
            <select v-model="conditionValues[item.key]">
                <option v-if="!item.require" value=""></option>
                <option v-for="option, index in item.options" :value="index" :key="index">
                    {{ displayOptionName(option) }}</option>
            </select>
        </label>
    </fieldset>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue';

type TCheckboxEntry = string;
type TSelectEntry = {
    key: string,
    options: string[],
    require: boolean,
};


export default defineComponent({
    name: 'ConditionInput',
    props: {
        conditionInput: { type: Object, require: true }
    },
    setup(props) {
        const displayName = (name: string) => name;
        const displayOptionName = (name: string) => name.replace(/^required_/, '');

        const checkboxList = computed((): TCheckboxEntry[] => {
            const result = [] as string[];
            if (props.conditionInput) {
                [props.conditionInput.damageDetailMyCharacter, props.conditionInput.damageDetailMyWeapon].filter(s => s).forEach(damageDetail => {
                    damageDetail.条件.forEach((value: string[] | null, key: string) => {
                        if (value) return;
                        result.push(key);
                    })
                });
            }
            return result;
        });
        const selectList = computed((): TSelectEntry[] => {
            const result = [] as TSelectEntry[];
            if (props.conditionInput) {
                [props.conditionInput.damageDetailMyCharacter, props.conditionInput.damageDetailMyWeapon].filter(s => s).forEach(damageDetail => {
                    damageDetail.条件.forEach((value: string[] | null, key: string) => {
                        if (!value) return;
                        result.push({ key: key, options: value, require: value[0].startsWith('required_') });
                    })
                });
            }
            return result;
        });

        const conditionValues = ref(props.conditionInput?.conditionValues ?? {});

        return {
            displayName, displayOptionName,
            checkboxList, selectList,
            conditionValues,
        }
    }
});
</script>

<style scoped>
label {
    display: inline-block;
    margin: 2px 1rem;
}

label input,
label select {
    margin: 0 0.5rem;
}

:checked+span {
    color: palevioletred;
}
</style>