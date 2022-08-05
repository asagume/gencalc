<template>
    <div></div>
</template>

<script lang="ts">
import GlobalMixin from '@/GlobalMixin';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'MiscOptionInput',
    mixins: [GlobalMixin],
    props: {
        characterInput: { type: Object, require: true },
        conditionInput: { type: Object, require: true },
    }
})
</script>