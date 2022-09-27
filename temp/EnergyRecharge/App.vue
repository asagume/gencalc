<template>
    <div class="base-container">
        <div class="pane1">
        </div>
        <div class="pane2">
            <ul class="select-list">
                <li class="item" v-for="item in characterMasterList" :key="item.名前" @click="addMember(item.名前)">
                    <img :class="'character ' + characterImgClass(item)" :src="item.icon_url"
                        :alt="displayName(item.名前)">
                    <img class="vision" :src="visionImgSrc(item)" :alt="displayName(item.元素)">
                    <p class="member-index">{{memberIndex(item.名前)}}</p>
                </li>
            </ul>
        </div>
        <div class="pane3">
        </div>
        <div class="pane4">
            <fieldset>
                <ul class="select-list">
                    <draggable :list="memberList" item-key="id" :sort="true" handle=".handle">
                        <template #item="{ element }">
                            <li class="member">
                                <div class="item handle">
                                    <img :class="'character ' + characterImgClass(element.detail)"
                                        :src="element.detail.icon_url" :alt="displayName(element.character)">
                                    <img class="vision" :src="visionImgSrc(element.detail)"
                                        :alt="displayName(element.detail.元素)">
                                </div>
                                <div>
                                    <img class="elemental-skill" :src="element.detail.元素スキル.icon_url"
                                        :alt="displayName(element.detail.元素スキル.名前)" @click="addAction(element, 'E')">
                                    {{element.eCount}}
                                </div>
                                <div>
                                    <img class="elemental-burst" :src="element.detail.元素爆発.icon_url"
                                        :alt="displayName(element.detail.元素爆発.名前)" @click="addAction(element, 'Q')">
                                    {{element.qCount}}
                                </div>
                                <div>
                                    <img class="weapon" :src="favoniusImgSrc(element)" alt="favonius weapon">
                                    {{element.favoniusCount}}
                                </div>
                            </li>
                        </template>
                    </draggable>
                </ul>

            </fieldset>

            <fieldset>
                <ol>
                    <draggable :list="actionList" item-key="id" :sort="true" handle=".handle">
                        <template #item="{ element, index }">
                            <li :class="'action' + actionClass(index)">
                                <img class="action" :src="actionImgSrc(element)" @click="actionOnClick(index)">
                                <span>{{ displayName(actionName(element)) }}</span>
                                <button type="button" @click="deleteAction(index)">
                                    <span class="material-symbols-outlined"> close </span>
                                </button>
                            </li>
                        </template>
                    </draggable>
                </ol>
            </fieldset>
        </div>
        <div class="pane5">
            <table>
                <tr>
                    <th>Name</th>
                    <th>Vision</th>
                    <th>Rarity</th>
                    <th>Elemental SKill</th>
                    <th>Energy Cost</th>
                    <th>Elemental SKill CD</th>
                </tr>
                <tr v-for="item in characterMasterList" :key="item.名前">
                    <th>{{item.名前}}</th>
                    <td>{{item.元素}}</td>
                    <td>{{item.レアリティ}}</td>
                    <td>{{item.元素スキル.名前}}</td>
                    <td>{{energyCost(item.名前)}}</td>
                    <td>{{elementalSKillCd(item.名前)}}</td>
                </tr>
            </table>
        </div>
        <div class="footer">
        </div>
    </div>
</template>
<script lang="ts">
import draggable from "vuedraggable";
import { computed, defineComponent, reactive, ref } from "vue";
import { CHARACTER_MASTER, CHARACTER_MASTER_LIST, ELEMENT_IMG_SRC, getCharacterMasterDetail, IMG_SRC_DUMMY, STAR_BACKGROUND_IMAGE_CLASS, TCharacterDetail, TCharacterKey, TWeapon, TWeaponEntry, TWeaponTypeKey, WEAPON_IMG_SRC, WEAPON_MASTER } from "@/master";
import CompositionFunction from "@/components/CompositionFunction.vue";

type TMember = {
    id: number,
    character: TCharacterKey,
    detail: TCharacterDetail,
    eCount: number,
    qCount: number,
    favoniusCount: number,
}

type TAction = {
    id: number,
    member: TMember | undefined,
    symbol: string,
}

let memberId = 0;
let actionId = 0;

export default defineComponent({
    name: "EnergyRecharge",
    components: {
        draggable,
    },
    setup() {
        const { displayName } = CompositionFunction();

        const characterMasterList: TCharacterDetail[] = reactive([]);
        const CHARACTER_MASTER_DETAIL_MAP = new Map();
        Promise.all(
            Object.keys(CHARACTER_MASTER).map(s => getCharacterMasterDetail(s as TCharacterKey))
        ).then(rets => {
            rets.forEach(ret => {
                characterMasterList.push(ret);
                CHARACTER_MASTER_DETAIL_MAP.set(ret.名前, ret);
            })
        });

        const visionImgSrc = (item: TCharacterDetail) => ELEMENT_IMG_SRC[item.元素];
        const characterImgClass = (item: TCharacterDetail) => STAR_BACKGROUND_IMAGE_CLASS[item.レアリティ];

        const weaponTypeList = reactive(Object.keys(WEAPON_MASTER) as TWeaponTypeKey[]);
        const favoniusWeaponMap = computed((): Map<TWeaponTypeKey, TWeaponEntry> => {
            const result = new Map();
            for (const type of weaponTypeList) {
                const weapon = Object.keys(WEAPON_MASTER[type]).filter(s => s.startsWith('西風'))[0];
                result.set(type, (WEAPON_MASTER[type] as any)[weapon]);
            }
            return result;
        });

        const favoniusImgSrc = (member: TMember) => {
            const weaponMaster = favoniusWeaponMap.value.get(member.detail.武器);
            return weaponMaster?.icon_url;
        };

        const memberList = reactive([] as TMember[]);
        function createMember(character: string, eCount?: number, qCount?: number, favoniusCount?: number) {
            const member: TMember = {
                id: ++memberId,
                character: character as TCharacterKey,
                detail: CHARACTER_MASTER_DETAIL_MAP.get(character),
                eCount: eCount ?? 1,
                qCount: qCount ?? 1,
                favoniusCount: favoniusCount ?? 0,
            };
            return member;
        }
        const addMember = (newMember: string) => {
            if (memberList.length < 4) {
                if (memberList.filter(s => s.character == newMember).length == 0) {
                    memberList.push(createMember(newMember));
                }
            }
        };
        const clearMemberList = () => {
            memberList.splice(0, memberList.length);
        };
        const selectedMember = ref('');
        const memberIndex = (character: TCharacterKey) => {
            let result = undefined;
            for (let i = 0; i < memberList.length; i++) {
                if (memberList[i].character == character) {
                    result = i + 1;
                    break;
                }
            }
            return result;
        };

        const actionList = reactive([] as TAction[]);
        function createAction(member: TMember | undefined, symbol: string) {
            return {
                id: ++actionId,
                member: member,
                symbol: symbol
            };
        }
        const actionIndex = ref(-1);
        const clearActionList = () => {
            actionList.splice(0, actionList.length);
            actionIndex.value = -1;
        };
        const addAction = (member: TMember, symbol: string) => {
            const element = createAction(member, symbol);
            let index = ++actionIndex.value;
            if (index < actionList.length) {
                actionList.splice(actionIndex.value, 0, element);
            } else {
                actionList.push(element);
            }
        };
        const deleteAction = (index: number) => {
            actionList.splice(index, 1);
            if (actionIndex.value == index) actionIndex.value--;
        };
        function getActionTalent(action: TAction) {
            if (action.member) {
                const detail = action.member.detail;
                if (action.symbol == 'E') return detail.元素スキル;
                if (action.symbol == 'Q') return detail.元素爆発;
            }
            return undefined;
        }
        const actionImgSrc = (action: TAction): string => {
            const talent = getActionTalent(action);
            if (talent) return talent.icon_url;
            return IMG_SRC_DUMMY;
        };
        const actionName = (action: TAction): string => {
            const talent = getActionTalent(action);
            if (talent) return talent.名前;
            return '';
        };
        const actionOnClick = (index: number) => {
            actionIndex.value = index;
        };
        const actionClass = (index: number) => {
            if (index == actionIndex.value) return ' selected';
            return '';
        };

        const elementalSKillCd = (character: TCharacterKey) => {
            const characterDetail = CHARACTER_MASTER_DETAIL_MAP.get(character);
            const talentObj = characterDetail.元素スキル;
            let result: any = undefined;
            Object.keys(talentObj).filter(s => s.endsWith('クールタイム')).forEach(key => {
                if (result === undefined) result = talentObj[key];
            });
            return result;
        }

        const energyCost = (character: TCharacterKey) => {
            const characterDetail = CHARACTER_MASTER_DETAIL_MAP.get(character);
            const talentObj = characterDetail.元素爆発;
            let result: any = undefined;
            Object.keys(talentObj).filter(s => s.endsWith('元素エネルギー')).forEach(key => {
                if (result === undefined) result = talentObj[key];
            });
            return result;
        }


        return {
            displayName,

            characterMasterList,
            visionImgSrc,
            characterImgClass,
            memberIndex,

            weaponTypeList,
            favoniusWeaponMap,
            favoniusImgSrc,

            memberList,
            addMember,
            clearMemberList,
            selectedMember,

            actionList,
            clearActionList,
            addAction,
            deleteAction,
            actionImgSrc,
            actionName,
            actionOnClick,
            actionClass,

            energyCost,
            elementalSKillCd,
        };
    },
});
</script>
<style>
.base-container {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto auto auto auto;
    grid-template-areas:
        "pane1 pane1"
        "pane2 pane3"
        "pane4 pane4"
        "pane5 pane5"
        "footer footer";
}
</style>
<style scoped>
.item {
    position: relative;
    display: inline-block;
}

img.character {
    width: 90px;
    height: 90px;
    background-size: contain;
}

img.vision {
    width: 30px;
    height: 30px;
    position: absolute;
    left: 0;
    top: 0;
}

img.elemental-skill,
img.elemental-burst,
img.weapon {
    width: 45px;
    height: 45px;
}

img.action {
    width: 45px;
    height: 45px;
}

img.no-action {
    width: 45px;
    height: 5px;
    background-color: blueviolet;
}

.selected {
    border-bottom: 3px gold solid;
}

ol li {
    text-align: left;
}

p.member-index {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateY(-50%);
}

table {
    width: calc(100% - 8px);
    table-layout: auto;
    border: 4px gray solid;
    border-spacing: 0;
}

tr,
th,
td {
    border: 2px gray solid;
    line-height: 4rem;
}
</style>