<template>
    <table>
        <tr>
            <td colspan="3" rowspan="3" style="width: 40%; max-width: 200px; position: relative;">
                <img :class="'character' + bgImageClass(characterMaster)" :src="characterMaster.icon_url"
                    :alt="characterMaster.名前" @click="$emit('open:character-select')">
                <img class="vision" :src="visionSrc(characterMaster)" :alt="characterMaster.元素">
            </td>
            <td :class="'title ' + colorClass((characterMaster))" colspan="3" style="position: relative;">
                {{ displayName(characterMaster.名前) }}
                <span class="material-symbols-outlined" style="position: absolute; right: 1rem;"
                    @click="$emit('open:character-info')"> info </span>
            </td>
        </tr>
        <tr>
            <td>
                <button type="button" :disabled="saveDisabled" @click="saveOnClick">
                    Save<br>
                    <span class="material-symbols-outlined"> save </span>
                </button>
            </td>
            <td> &emsp; </td>
            <td>
                <button type="button" :disabled="removeDisabled" @click="removeOnClick">
                    Remove<br>
                    <span class="material-symbols-outlined"> delete </span>
                </button>
            </td>
        </tr>
        <tr>
            <td colspan="3" style="text-align: left;">
                <label>
                    build name:
                    <input class="save-name" type="text" v-model="buildname" maxlength="20"
                        @change="saveDisabled = false">
                </label>
            </td>
        </tr>
        <tr>
            <td>
                <select v-model="ascension" @change="ascensionOnChange">
                    <option v-for="item in ascensionRange" :value="item" :key="item"> A{{ item }} </option>
                </select>
            </td>
            <td>
                <select v-model="level" @change="characterOnChange">
                    <option v-for="item in levelRange" :value="item" :key="item"> Lv.{{ item }} </option>
                </select>
            </td>
            <td>
                <select v-model="constellation" @change="characterOnChange">
                    <option v-for="item in constellationRange" :value="item" :key="item"> C{{ item }} </option>
                </select>
            </td>
            <th colspan="3">
                <label class="open-close">
                    <input class="hidden" type="checkbox" v-model="recommendationListVisible">
                    <span>{{ displayName('おすすめセット') }}</span>
                </label>
            </th>
        </tr>
        <tr v-if="recommendationListVisible">
            <td colspan="6">
                <select v-model="selectedRecommendation" @change="$emit('update:recommendation', targetValue($event))">
                    <option v-for="item in recommendationList" :value="item" :key="item.name">
                        {{ displayBuildName(item) }}</option>
                </select>
            </td>
        </tr>
    </table>
    <table>
        <tr>
            <td colspan="3" rowspan="3" class="icon" style="width: 40%; max-width: 200px;">
                <img :class="'weapon' + bgImageClass(weaponMaster)" :src="weaponMaster['icon_url']"
                    :alt="weaponMaster.名前" @click="$emit('open:weapon-select')">
                <div class="tooltip">{{ displayName(weaponMaster.名前) }}</div>
            </td>
            <td class="icon">
                <img :class="'talent ' + bgColorClass(characterMaster)" :src="characterMaster['通常攻撃']['icon_url']"
                    :alt="characterMaster['通常攻撃']['名前']" @click="false">
                <div class="tooltip">{{ displayName(characterMaster['通常攻撃']['名前']) }}</div>
            </td>
            <td class="icon">
                <img :class="'talent ' + bgColorClass(characterMaster)" :src="characterMaster['元素スキル']['icon_url']"
                    :alt="characterMaster['元素スキル']['名前']" @click="false">
                <div class="tooltip">{{ displayName(characterMaster['元素スキル']['名前']) }}</div>
            </td>
            <td class="icon">
                <img :class="'talent ' + bgColorClass(characterMaster)" :src="characterMaster['元素爆発']['icon_url']"
                    :alt="characterMaster['元素爆発']['名前']" @click="false">
                <div class="tooltip">{{ displayName(characterMaster['元素爆発']['名前']) }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <select v-model="normalAttackLevel" @change="characterOnChange">
                    <option v-for="item in normalAttackLevelRange" :value="item" :key="item"> Lv.{{ item }}
                    </option>
                </select>
            </td>
            <td>
                <select v-model="elementalSkillLevel" @change="characterOnChange">
                    <option v-for="item in elementalSkillLevelRange" :value="item" :key="item"> Lv.{{ item }}
                    </option>
                </select>
            </td>
            <td>
                <select v-model="elementalBurstLevel" @change="characterOnChange">
                    <option v-for="item in elementalBurstLevelRange" :value="item" :key="item"> Lv.{{ item }}
                    </option>
                </select>
            </td>
        </tr>
        <tr>
            <td rowspan="2" class="icon">
                <label @click="$emit('open:artifact-set-select', 0)">
                    <img :class="'artifact-set ' + ''" :src="artifactSetMasters[0].image"
                        :alt="artifactSetMasters[0].key">
                </label>
                <div class="tooltip">{{ displayName(artifactSetMasters[0].key) }}</div>
            </td>
            <td rowspan="2" class="icon">
                <label @click="$emit('open:artifact-set-select', 1)">
                    <img :class="'artifact-set ' + ''" :src="artifactSetMasters[1].image"
                        :alt="artifactSetMasters[1].key">
                </label>
                <div class="tooltip">{{ displayName(artifactSetMasters[1].key) }}</div>
            </td>
            <td rowspan="2">
                <button type="button" class="artifact-detail-button" @click="$emit('open:artifact-detail-input')">
                    <img class="artifact-set" :src="IMG_SRC_DUMMY" :alt="displayName('聖遺物ステータス')">
                    <img class="left-icon" src="images/artifact.png" alt="artifact">
                    <img class="right-icon" src="images/artifact.png" alt="artifact">
                    <div class="absolute-center">{{ 'artifactScore' }}</div>
                </button>
            </td>
        </tr>
        <tr>
            <td>
                <select v-model="weaponAscension" @change="weaponAscensionOnChange">
                    <option v-for="item in weaponAscensionRange" :value="item" :key="item"> A{{ item }}
                    </option>
                </select>
            </td>
            <td>
                <select v-model="weaponLevel" @change="weaponOnChange">
                    <option v-for="item in weaponLevelRange" :value="item" :key="item"> Lv.{{ item }} </option>
                </select>
            </td>
            <td>
                <select v-model="weaponRefine" @change="weaponOnChange">
                    <option v-for="item in weaponRefineRange" :value="item" :key="item"> R{{ item }} </option>
                </select>
            </td>
        </tr>
    </table>
</template>

<script lang="ts">
import GlobalMixin from '@/GlobalMixin.vue';
import { ARTIFACT_SET_MASTER_DUMMY, TRecommendation, 突破レベルレベルARRAY } from '@/input';
import { ELEMENT_BG_COLOR_CLASS, ELEMENT_COLOR_CLASS, ELEMENT_IMG_SRC, IMG_SRC_DUMMY, STAR_BACKGROUND_IMAGE_CLASS, TCharacterDetail } from '@/master';
import { computed, defineComponent, PropType, ref } from 'vue';

export default defineComponent({
    name: 'CharacterInput',
    mixins: [GlobalMixin],
    props: {
        characterInput: { type: Object, require: true },
        recommendationList: { type: Array as PropType<TRecommendation[]>, require: true },
        recommendation: { type: Object as PropType<TRecommendation>, require: true },
    },
    emits: [
        'open:character-select',
        'open:character-info',
        'update:recommendation',
        'open:weapon-select',
        'open:artifact-set-select',
        'open:artifact-detail-input',
        'update:character-input',
    ],
    setup(props, context) {
        const ascensionRef = ref(props.characterInput?.突破レベル ?? 6);
        const levelRef = ref(props.characterInput?.レベル ?? 90);
        const constellationRef = ref(props.characterInput?.命ノ星座 ?? 0);
        const normalAttackLevelRef = ref(props.characterInput?.通常攻撃レベル ?? 8);
        const elementalSkillLevelRef = ref(props.characterInput?.元素スキルレベル ?? 8);
        const elementalBurstLevelRef = ref(props.characterInput?.元素爆発レベル ?? 8);
        const weaponAscensionRef = ref(props.characterInput?.武器突破レベル ?? 6);
        const weaponLevelRef = ref(props.characterInput?.武器レベル ?? 90);
        const weaponRefineRef = ref(props.characterInput?.武器精錬ランク ?? 1);

        const recommendationListVisibleRef = ref(false);

        const displayBuildName = (item: TRecommendation) => item.name;

        const selectedRecommendationRef = ref(props.recommendation);
        const characterMaster = computed(() => props.characterInput?.characterMaster ?? {});
        const weaponMaster = computed(() => props.characterInput?.weaponMaster ?? {});
        const artifactSetMasters = computed(() => props.characterInput?.artifactSetMasters ?? [ARTIFACT_SET_MASTER_DUMMY, ARTIFACT_SET_MASTER_DUMMY]);

        const visionSrc = (item: TCharacterDetail) => ELEMENT_IMG_SRC[item.元素] as string;
        const bgImageClass = (item: TCharacterDetail) => ' ' + STAR_BACKGROUND_IMAGE_CLASS[item.レアリティ] as string;
        const colorClass = (item: TCharacterDetail) => ELEMENT_COLOR_CLASS[item.元素] as string;
        const bgColorClass = (item: TCharacterDetail) => ELEMENT_BG_COLOR_CLASS[item.元素] as string;
        let saveDisabled = false;
        let removeDisabled = false;
        const buildnameRef = ref(props.recommendation?.name ?? '');
        const saveOnClick = () => {
            if (buildnameRef.value) {
                console.log(buildnameRef.value);
            }
        };
        const removeOnClick = () => {
            if (props.characterInput && buildnameRef.value) {
                localStorage.removeItem('構成_' + props.characterInput.character + '_' + buildnameRef.value);
            }
        };
        const ascensionRange = computed(() => {
            return [0, 1, 2, 3, 4, 5, 6];
        });
        const levelRange = computed(() => {
            return 突破レベルレベルARRAY[ascensionRef.value];
        });
        const constellationRange = computed(() => {
            let max = 0;
            if ('命ノ星座' in characterMaster.value) {
                max = Object.keys(characterMaster.value['命ノ星座']).length;
            }
            return Array.from({ length: max + 1 }, (_, i) => i);
        });
        const ascensionOnChange = () => {
            if (levelRef.value < levelRange.value[0]) {
                levelRef.value = levelRange.value[0];
            } else if (levelRef.value > levelRange.value[levelRange.value.length - 1]) {
                levelRef.value = levelRange.value[levelRange.value.length - 1];
            }
            characterOnChange();
        };
        const recommendationOnChange = (event: Event) => {
            if (!props.recommendationList) return;
            if (event.target instanceof HTMLSelectElement) {
                context.emit('update:recommendation', props.recommendationList[event.target.selectedIndex]);
            }
        };
        const normalAttackLevelRange = computed(() => {
            return Array.from({ length: 10 }, (_, i) => i + 1);
        });
        const elementalSkillLevelRange = computed(() => {
            return Array.from({ length: 13 }, (_, i) => i + 1);
        });
        const elementalBurstLevelRange = computed(() => {
            return Array.from({ length: 13 }, (_, i) => i + 1);
        });
        const weaponAscensionRange = computed(() => {
            return [0, 1, 2, 3, 4, 5, 6];
        });
        const weaponLevelRange = computed(() => {
            return 突破レベルレベルARRAY[weaponAscensionRef.value];
        });
        const weaponRefineRange = computed(() => {
            return [1, 2, 3, 4, 5];
        });
        const weaponAscensionOnChange = () => {
            if (weaponLevelRef.value < weaponLevelRange.value[0]) {
                weaponLevelRef.value = weaponLevelRange.value[0];
            } else if (weaponLevelRef.value > weaponLevelRange.value[weaponLevelRange.value.length - 1]) {
                weaponLevelRef.value = weaponLevelRange.value[weaponLevelRange.value.length - 1];
            }
            weaponOnChange();
        };
        const characterOnChange = () => {
            const workInput = {} as any;
            workInput.突破レベル = ascensionRef.value;
            workInput.レベル = levelRef.value;
            workInput.命ノ星座 = constellationRef.value;
            workInput.通常攻撃レベル = normalAttackLevelRef.value;
            workInput.元素スキルレベル = elementalSkillLevelRef.value;
            workInput.元素爆発レベル = elementalBurstLevelRef.value;
            context.emit('update:character-input', workInput);
        }
        const weaponOnChange = () => {
            const workInput = {} as any;
            workInput.武器突破レベル = weaponAscensionRef.value;
            workInput.武器レベル = weaponLevelRef.value;
            workInput.武器精錬ランク = weaponRefineRef.value;
            context.emit('update:character-input', workInput);
        }

        return {
            displayBuildName,
            visionSrc, bgImageClass, colorClass, bgColorClass,
            selectedRecommendation: selectedRecommendationRef,
            characterMaster, weaponMaster, artifactSetMasters,
            ascension: ascensionRef, level: levelRef, constellation: constellationRef,
            recommendationOnChange,
            normalAttackLevel: normalAttackLevelRef, elementalSkillLevel: elementalSkillLevelRef, elementalBurstLevel: elementalBurstLevelRef,
            weaponAscension: weaponAscensionRef, weaponLevel: weaponLevelRef, weaponRefine: weaponRefineRef,
            saveDisabled, removeDisabled, buildname: buildnameRef,
            saveOnClick, removeOnClick,
            ascensionRange, levelRange, constellationRange,
            ascensionOnChange,
            weaponAscensionRange, weaponLevelRange, weaponRefineRange,
            weaponAscensionOnChange,
            recommendationListVisible: recommendationListVisibleRef,
            normalAttackLevelRange, elementalSkillLevelRange, elementalBurstLevelRange,
            characterOnChange, weaponOnChange,
            IMG_SRC_DUMMY: IMG_SRC_DUMMY,
        }
    }
});
</script>

<style scoped>
table {
    width: 100%;
    min-width: 360px;
    margin-left: auto;
    margin-right: auto;
    border: none;
    table-layout: fixed;
}

tr,
td {
    border: none;
}

td.title {
    font-size: 3rem;
    text-align: left;
    text-shadow: 0 0 2px black;
}

td select,
td input,
td label {
    width: 100%;
}

input.save-name {
    width: calc(100% - 1rem);
}

img.character {
    width: 100%;
    background-size: contain;
}

img.vision {
    width: 60px;
    height: 60px;
    position: absolute;
    left: 6px;
    top: 6px;
}

:checked+img {
    background-color: gold;
}

img.weapon {
    width: 150px;
    height: 150px;
    background-size: contain;
}

img.talent,
img.artifact-set {
    width: 100%;
    max-width: 72px;
    border-radius: 50%;
    border: none;
}

th[colspan="3"] {
    color: #e8d14e;
    background-color: #333;
    border: 2px solid gray;
    border-radius: 10px;
    padding: 2px;
}
</style>
