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
                <template #item="{ element, index }">
                    <div v-if="actionDetail(element)" :class="'rotation-item'+colorClass(element.member)">
                        <span class="index"> {{ ('00' + (index + 1)).slice(-2) }} </span>
                        <img class="character-icon handle" :src="characterMasterDetail(element.member).icon_url"
                            :alt="displayName(characterMasterDetail(element.member).key)" />
                        <img :class="'action-icon handle'+bgColorClass(element.member)" :src="actionDetail(element).icon_url"
                            :alt="displayName(actionDetail(element).名前)" />
                        <span> {{ displayName(actionDetail(element).名前) }} </span>

                        <div class="information">
                            {{ actionEnergyFluctuation(element) }}
                        </div>
                        <div class="control">
                            <button type="button" @click="removeItemOnClick(element)">×</button>
                        </div>
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
import { ELEMENT_BG_COLOR_CLASS, ELEMENT_COLOR_CLASS, getCharacterMasterDetail, TCharacterKey } from "@/master";

type TActionItem = {
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
        const rotationList = reactive([] as TActionItem[]);

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

        const colorClass = (character: string) => {
            const master = characterMasterDetail(character);
            return master ? ' ' + (ELEMENT_COLOR_CLASS as any)[master.元素] : '';
        }

        const bgColorClass = (character: string) => {
            const master = characterMasterDetail(character);
            return master ? ' ' + (ELEMENT_BG_COLOR_CLASS as any)[master.元素] : '';
        }

        const actionOnClick = (member: TMember, actionKey: string) => {
            rotationList.push({
                id: ++actionId,
                member: member.name,
                action: actionKey,
            });
        };

        const actionDetail = (item: TActionItem) => {
            const master = characterMasterDetail(item.member);
            return master
                ? item.action == "E"
                    ? master.元素スキル
                    : item.action == "Q"
                        ? master.元素爆発
                        : undefined
                : undefined;
        };

        const actionEnergyFluctuation = (item: TActionItem) => {
            let result = '';
            const master = characterMasterDetail(item.member);
            const detail = actionDetail(item);
            if (master && detail) {
                if (detail.名前 == master.元素スキル.名前) {
                    result = '';
                } else if (detail.名前 == master.元素爆発.名前) {
                    result += detail.元素エネルギー ? '-' + detail.元素エネルギー : '';
                }
            }
            return result;
        }

        const removeItemOnClick = (item: TActionItem) => {
            rotationList.splice(0, rotationList.length, ...rotationList.filter(s => s != item));
        }

        return {
            displayName,

            colorClass,
            bgColorClass,

            elementalSkill,
            elementalBurst,
            actionOnClick,

            rotationList,
            characterMasterDetail,
            actionDetail,
            actionEnergyFluctuation,

            removeItemOnClick,
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
    position: relative;
    font-size: 14px;
    padding-left: 4px;
}

div.rotation-item span.index {
    color: orange;
}

div.rotation-item span {
    display: inline-block;
    padding-left: 4px;
    padding-right: 4px;
}

div.particle {
    position: absolute;
    left: 240px;
    top: 0;
}

div.information {
    position: absolute;
    left: 300px;
    top: 5px;
    height: 30px;
}

div.rotation-item div.control {
    position: absolute;
    left: 320px;
    top: 5px;
    height: 30px;
}

div.control button {
    font-size: 12px;
    padding: 1px 5px;
    vertical-align: baseline;
}
</style>
