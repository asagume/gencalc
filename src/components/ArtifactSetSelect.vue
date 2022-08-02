<template>
    <div v-if="visible">
        <ul class="select-list">
            <li v-for="item in filteredList" :key="item.key">
                <img :class="'artifact-set with-tooltip' + bgImageClass(item) + selectedClass(item)"
                    :src="item.icon_url" :alt="item.key" @click="$emit('update:artifact-set', item.key)">
                <div class="tooltip">{{ displayName(item.key) }}</div>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { ARTIFACT_SET_MASTER_LIST, STAR_BACKGROUND_IMAGE_CLASS, TArtifactSetEntry, } from '@/master';
import { computed, defineComponent } from 'vue';

export default defineComponent({
    name: 'ArtifactSetSelect',
    props: {
        visible: Boolean,
        index: Number,
        artifactSet: String,
    },
    emits: ['update:artifact-set'],
    setup(props) {
        const bgImageClass = (item: TArtifactSetEntry) => ' ' + STAR_BACKGROUND_IMAGE_CLASS[item.レアリティ] as string;
        const selectedClass = (item: TArtifactSetEntry) => { return item.key == props.artifactSet ? ' selected' : '' };

        const filteredList = computed(() => {
            return ARTIFACT_SET_MASTER_LIST as TArtifactSetEntry[];
        });

        return {
            bgImageClass, selectedClass,
            filteredList,
        }
    }
});
</script>

<style scoped>
img.artifact-set {
    width: 75px;
    height: 75px;
    background-size: contain;
}

.selected {
    background-color: gold;
}

:checked+img {
    background-color: gold;
}
</style>
