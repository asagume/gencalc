<template>
    <div class="member-area" v-if="teamMembers.length">
        <div class="member">
            <img class="character" :src="characterIconSrc(character)" :alt="displayName(character)">
            <img class="vision" :src="characterVisionIconSrc(character)" alt="vision">
        </div>
        <div class="member" v-for="member in teamMembers" :key="member">
            <img class="character" :src="characterIconSrc(member)" :alt="displayName(member)"
                @click="removeFromTeamOnClick(member)">
            <img class="vision" :src="characterVisionIconSrc(member)" alt="vision">
        </div>
    </div>
</template>

<script lang="ts">
import {
    CHARACTER_MASTER,
    ELEMENT_IMG_SRC,
    TCharacterKey,
} from "@/master";
import { defineComponent, PropType } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
    name: "EasyTeamInput",
    props: {
        character: { type: String as PropType<TCharacterKey>, required: true },
        teamMembers: {
            type: Array as PropType<string[]>,
            required: true,
        }
    },
    emits: ['update:team-members'],
    setup(props, context) {
        const {
            displayName,
            displayOptionName,
        } = CompositionFunction();

        function updateTeamMembers(teamMembers: string[]) {
            context.emit("update:team-members", teamMembers);
        }

        const addToTeamOnClick = (supporer: string) => {
            updateTeamMembers([...props.teamMembers, supporer]);
        };

        const removeFromTeamOnClick = (member: string) => {
            updateTeamMembers(props.teamMembers.filter(s => s != member));
        };

        const characterIconSrc = (member: string) => {
            return (CHARACTER_MASTER as any)[member].icon_url;
        };

        const characterVisionIconSrc = (member: string) => {
            return (ELEMENT_IMG_SRC as any)[(CHARACTER_MASTER as any)[member].元素];
        };

        return {
            displayName,
            displayOptionName,

            addToTeamOnClick,
            removeFromTeamOnClick,

            characterIconSrc,
            characterVisionIconSrc,
        };
    },
});
</script>
<style scoped>
.member-area .member {
    position: relative;
    display: inline-block;
    margin-left: 4px;
    margin-right: 4px;
}

.member img.character {
    width: 36px;
    height: 36px;
}

.member img.vision {
    width: 12px;
    height: 12px;
    position: absolute;
    left: 2px;
    top: 2px;
}
</style>
  