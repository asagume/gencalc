<template>
    <div :class="'team'+selectedClass">
        <div class="title handle">
            <label class="name">
                <span>◇</span>
                <span v-if="editable">
                    <input type="text" v-model="name" placeholder="INPUT TEAM NAME" @change="nameOnChange" />
                    <span class="button material-symbols-outlined" @click="editable=false">
                        edit_off
                    </span>
                </span>
                <span v-else>
                    <span>{{ name }}</span>
                    <span class="button material-symbols-outlined" @click="editable=true">
                        edit
                    </span>
                </span>
            </label>
            <div class="element-resonance">
                <img class="element-resonance" v-for="src in resonanceElementImgSrcs" :key="src" :src="src"
                    alt="resonance" />
            </div>
        </div>
        <div class="members">
            <table>
                <tr>
                    <td v-for="member in team.members" :key="member.id">
                        <MemberItem :member="member" @click:character="characterOnClick"
                            @change:buildname="changeBuildname" />
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>
<script lang="ts">
import CompositionFunction from '@/components/CompositionFunction.vue';
import { CHARACTER_MASTER, ELEMENT_IMG_SRC, TAnyObject, TCharacterKey } from '@/master';
import { computed, defineComponent, PropType, ref } from 'vue';
import { characterMaster, TTeam } from './team';
import MemberItem from './MemberItem.vue';
import { TStats } from '@/input';
import { ALL_ELEMENTS } from '@/calculate';

export default defineComponent({
    name: "TeamItem",
    props: {
        team: { type: Object as PropType<TTeam>, required: true },
        selected: { type: Boolean, requied: true },
        displayStat: { type: String },
    },
    emits: ['change:name', 'click:character', 'change:buildname'],
    components: {
        MemberItem,
    },
    setup(props, context) {
        const { displayName } = CompositionFunction();

        const selectedClass = computed(() => props.selected ? ' selected' : '');
        const editable = ref(false);
        const name = ref(props.team.name);
        const nameOnChange = () => {
            context.emit('change:name', name);
        };

        const elementalResonance = computed(() => {
            const result: string[] = [];
            const work: TAnyObject = {};
            const members = props.team.members.filter((s) => s.name);
            if (members.length == 4) {
                members.forEach((member) => {
                    const master = characterMaster(member);
                    if (master) {
                        if (master.元素 in work) {
                            work[master.元素]++;
                        } else {
                            work[master.元素] = 1;
                        }
                    }
                });
                if (Object.keys(work).length == 4) {
                    result.push('元素共鳴なし');
                } else {
                    Object.keys(work).forEach((key) => {
                        if (work[key] >= 2) {
                            result.push(key + '元素共鳴');
                        }
                    });
                }
            }
            return result;
        });

        const resonanceElementImgSrcs = computed(() => {
            const result: string[] = [];
            elementalResonance.value.forEach(entry => {
                if (entry == '元素共鳴なし') {
                    const members = props.team.members.filter((s) => s.name);
                    members.forEach(member => {
                        const master = CHARACTER_MASTER[member.name as TCharacterKey];
                        const src = (ELEMENT_IMG_SRC as any)[master.元素];
                        result.push(src);
                    });
                } else {
                    const src = (ELEMENT_IMG_SRC as any)[entry.replace('元素共鳴', '')];
                    result.push(src);
                    result.push(src);
                }
            });
            return result;
        });

        const elementalResonanceAdjustments = computed(() => {
            const result: TStats = {};
            elementalResonance.value.forEach(entry => {
                switch (entry) {
                    case '炎元素共鳴':
                        result['攻撃力%'] = 25;
                        break;
                    case '水元素共鳴':
                        result['HP%'] = 25;
                        break;
                    case '草元素共鳴':
                        result['元素熟知'] = 50;
                        break;
                    case '元素共鳴なし':
                        ALL_ELEMENTS.forEach(element => {
                            result[element + '元素耐性'] = 15;
                        });
                        result['物理耐性'] = 15;
                        break;
                }
            });
            return result;
        });

        const characterOnClick = () => {
            context.emit('click:character');
        };

        const changeBuildname = (memberId: number, buildname: string) => {
            context.emit('change:buildname', props.team.id, memberId, buildname);
        };

        return {
            displayName,

            selectedClass,
            editable,
            name,
            resonanceElementImgSrcs,
            elementalResonanceAdjustments,

            nameOnChange,
            characterOnClick,
            changeBuildname,
        }
    }
});
</script>
<style>
div.team {
    display: inline-block;
    max-width: 342px;
    padding: 5px;
    border: 4px double whitesmoke;
    margin-bottom: 10px;
}

div.title {
    position: relative;
    text-align: left;
}

div.team.selected {
    border-color: gold;
}

div.title span.button {
    display: inline-block;
    position: absolute;
    left: 220px;
    top: 0;
}

label.name {
    height: 35px;
}

span.name {
    display: inline-block;
    width: 220px;
    height: 4.5rem;
    position: relative;
    margin-left: 5px;
}

span.name span.button {
    display: inline-block;
    position: absolute;
    right: 0px;
    top: 0px;
}

input.name {
    width: 180px;
}

div.element-resonance {
    position: absolute;
    right: 0;
    top: 0;
}

img.element-resonance {
    width: 20px;
}

.members table {
    width: 100%;
    table-layout: fixed;
    border-spacing: 0;
    text-align: center;
}
</style>