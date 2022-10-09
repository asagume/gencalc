<template>
    <div class="team-rotation">
        <fieldset class="icon-list">
            <template v-for="member in team.members" :key="member.id">
                <img v-if="elementalSkill(member)" class="action-icon" :src="elementalSkill(member).icon_url"
                    :alt="displayName(elementalSkill(member).名前)" @click="actionOnClick(member, 'E')" />
                <img v-if="elementalBurst(member)" class="action-icon" :src="elementalBurst(member).icon_url"
                    :alt="displayName(elementalBurst(member).名前)" @click="actionOnClick(member, 'Q')" />
            </template>
        </fieldset>
        <fieldset class="rotation-list">
            <draggable :list="rotationList" item-key="id" :sort="true" handle=".handle">
                <template #item="{ element }">
                    <div v-if="actionIcon(element)" class="rotation-item">
                        <img class="character-icon" :src="characterMasterDetail(element.member).icon_url"
                            :alt="displayName(characterMasterDetail(element.member).key)" />
                        <img class="action-icon" :src="actionIcon(element).icon_url"
                            :alt="displayName(actionIcon(element).名前)" />
                        {{ displayName(actionIcon(element).名前) }}
                    </div>
                </template>
            </draggable>
        </fieldset>
    </div>
</template>
<script lang="ts">
import draggable from "vuedraggable";
import { defineComponent, PropType, reactive, ref, watch } from "vue";
import CompositionFunction from "@/components/CompositionFunction.vue";
import { TMember, TTeam } from "./team";
import { getCharacterMasterDetail, TCharacterKey } from "@/master";

type TAction = {
    id: number;
    member: string;
    action: string;
};

let actionId = 0;

export default defineComponent({
    name: "TeamRotation",
    components: {
        draggable,
    },
    props: {
        team: { type: Object as PropType<TTeam>, required: true },
    },
    setup(props, context) {
        const { displayName } = CompositionFunction();

        const characterMasterDetailMap = new Map();
        const rotationList = reactive([] as TAction[]);

        const watchCount = ref(0);
        watch(props, async () => {
            if (props.team) {
                for (const member of props.team.members) {
                    if (member.name) {
                        const characterMasterDetail = await getCharacterMasterDetail(
                            member.name as TCharacterKey
                        );
                        characterMasterDetailMap.set(member.name, characterMasterDetail);
                    }
                }
                rotationList.splice(0, rotationList.length);
                watchCount.value++;
            }
        });

        const characterMasterDetail = (character: string) => {
            watchCount.value;
            return characterMasterDetailMap.get(character) ?? undefined;
        };

        const elementalSkill = (member: TMember) => {
            const master = characterMasterDetail(member.name);
            return master ? master.元素スキル : undefined;
        };

        const elementalBurst = (member: TMember) => {
            const master = characterMasterDetail(member.name);
            return master ? master.元素爆発 : undefined;
        };

        const actionOnClick = (member: TMember, actionKey: string) => {
            rotationList.push({
                id: ++actionId,
                member: member.name,
                action: actionKey,
            });
        };

        const actionIcon = (action: TAction) => {
            const master = characterMasterDetail(action.member);
            return master
                ? action.action == "E"
                    ? master.元素スキル
                    : action.action == "Q"
                        ? master.元素爆発
                        : undefined
                : undefined;
        };

        return {
            displayName,

            elementalSkill,
            elementalBurst,
            actionOnClick,

            rotationList,
            characterMasterDetail,
            actionIcon,
        };
    },
});
</script>
<style>
img.action-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
}

img.character-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
}

fieldset.rotation-list {
    text-align: left;
}

div.rotation-item {
    font-size: 15px;
}
</style>
