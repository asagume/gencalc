<template>
    <table>
        <tr>
            <td colspan="3" rowspan="3" style="width: 40%; max-width: 200px; position: relative;">
                <img class="character" :src="characterMaster.icon_url" :alt="characterMaster.名前"
                    :style="'background-image: url(' + backgroundUrl(characterMaster) + ')'"
                    @click="$emit('open:character-select')">
                <img class="vision" :src="visionSrc(characterMaster)" :alt="characterMaster.元素">
            </td>
            <td :class="'title ' + colorClass((characterMaster))" colspan="3" style="position: relative;">
                {{ displayName(characterMaster.名前) }}
                <span class="material-symbols-outlined" style="position: absolute; right: 0;"
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
                    <input class="save-name" type="text" v-model="buildname" maxlength="20" @change="buildOnChange">
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
                <select v-model="level" @change="buildOnChange">
                    <option v-for="item in levelRange" :value="item" :key="item"> Lv.{{ item }} </option>
                </select>
            </td>
            <td>
                <select v-model="constellation" @change="buildOnChange">
                    <option v-for="item in constellationRange" :value="item" :key="item"> C{{ item }} </option>
                </select>
            </td>
            <td colspan="3">
                <label class="button open-close">
                    <input class="hidden" type="checkbox" v-model="recommendationListVisible">
                    <span>{{ displayName('おすすめセット') }}</span>
                </label>
            </td>
        </tr>
        <tr v-if="recommendationListVisible">
            <td colspan="6">
                <select v-model="recommendation" @change="$emit('update:recommendation', recommendation)">
                    <option v-for="item in recommendationList" :value="item" :key="item.name">
                        {{ displayBuildName(item) }}</option>
                </select>
            </td>
        </tr>
    </table>
    <table>
        <tr>
            <td colspan="3" rowspan="3" class="icon" style="width: 40%; max-width: 200px;">
                <img class="weapon with-tooltip" :src="weaponMaster['icon_url']" :alt="weaponMaster.名前"
                    :style="'background-image: url(' + backgroundUrl(weaponMaster) + ')'"
                    @click="$emit('open:weapon-select')">
                <div class="tooltip">{{ displayName(weaponMaster.名前) }}</div>
            </td>
            <td class="icon">
                <img :class="'talent with-tooltip ' + bgColorClass(characterMaster)"
                    :src="characterMaster['通常攻撃']['icon_url']" :alt="characterMaster['通常攻撃']['名前']" @click="false">
                <div class="tooltip">{{ displayName(characterMaster['通常攻撃']['名前']) }}</div>
            </td>
            <td class="icon">
                <img :class="'talent with-tooltip ' + bgColorClass(characterMaster)"
                    :src="characterMaster['元素スキル']['icon_url']" :alt="characterMaster['元素スキル']['名前']" @click="false">
                <div class="tooltip">{{ displayName(characterMaster['元素スキル']['名前']) }}</div>
            </td>
            <td class="icon">
                <img :class="'talent with-tooltip ' + bgColorClass(characterMaster)"
                    :src="characterMaster['元素爆発']['icon_url']" :alt="characterMaster['元素爆発']['名前']" @click="false">
                <div class="tooltip">{{ displayName(characterMaster['元素爆発']['名前']) }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <select v-model="normalAttackLevel" @change="buildOnChange">
                    <option v-for="item in normalAttackLevelRange" :value="item" :key="item"> Lv.{{ item }}
                    </option>
                </select>
            </td>
            <td>
                <select v-model="elementalSkillLevel" @change="buildOnChange">
                    <option v-for="item in elementalSkillLevelRange" :value="item" :key="item"> Lv.{{ item }}
                    </option>
                </select>
            </td>
            <td>
                <select v-model="elementalBurstLevel" @change="buildOnChange">
                    <option v-for="item in elementalBurstLevelRange" :value="item" :key="item"> Lv.{{ item }}
                    </option>
                </select>
            </td>
        </tr>
        <tr>
            <td rowspan="2" class="icon">
                <label class="with-tooltip" @click="false">
                    <img :class="'artifact-set ' + ''" :src="artifactSetMaster[0].image"
                        :alt="artifactSetMaster[0].key">
                </label>
                <div class="tooltip">{{ displayName(artifactSetMaster[0].key) }}</div>
            </td>
            <td rowspan="2" class="icon">
                <label class="with-tooltip" @click="false">
                    <img :class="'artifact-set ' + ''" :src="artifactSetMaster[1].image"
                        :alt="artifactSetMaster[1].key">
                </label>
                <div class="tooltip">{{ displayName(artifactSetMaster[1].key) }}</div>
            </td>
            <td rowspan="2">
                <button type="button" class="artifact-detail-button">
                    <img class="artifact-set" :src="IMG_SRC_DUMMY" :alt="displayName('聖遺物ステータス')"
                        @click="$emit('open-artifact-detail-input')">
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
                <select v-model="weaponLevel" @change="buildOnChange">
                    <option v-for="item in weaponLevelRange" :value="item" :key="item"> Lv.{{ item }} </option>
                </select>
            </td>
            <td>
                <select v-model="weaponRefine" @change="buildOnChange">
                    <option v-for="item in weaponRefineRange" :value="item" :key="item"> R{{ item }} </option>
                </select>
            </td>
        </tr>
    </table>
</template>

<script lang="ts">
import { TRecommendation, 突破レベルレベルARRAY } from '@/input';
import { ELEMENT_BG_COLOR_CLASS, ELEMENT_COLOR_CLASS, ELEMENT_IMG_SRC, IMG_SRC_DUMMY, STAR_BACKGROUND_URL, TCharacterDetail } from '@/master';
import { computed, defineComponent, PropType, ref } from 'vue';

export default defineComponent({
    name: 'CharacterInput',
    props: {
        characterInput: { type: Object, require: true },
        recommendationList: { type: Array as PropType<TRecommendation[]>, require: true },
    },
    emits: ['open:character-select', 'open:character-info', 'update:recommendation', 'open:weapon-select', 'open-artifact-detail-input'],
    setup(props) {
        const characterInput: { [key: string]: any } = ref(props.characterInput);
        let ascension = ref(props.characterInput!.突破レベル);
        let level = ref(props.characterInput!.レベル);
        let constellation = ref(props.characterInput!.命ノ星座);
        let normalAttackLevel = ref(props.characterInput!.通常攻撃レベル);
        let elementalSkillLevel = ref(props.characterInput!.元素スキルレベル);
        let elementalBurstLevel = ref(props.characterInput!.元素爆発レベル);
        let weaponAscension = ref(props.characterInput!.武器突破レベル);
        let weaponLevel = ref(props.characterInput!.武器レベル);
        let weaponRefine = ref(props.characterInput!.武器精錬ランク);

        let recommendationListVisible = ref(false);
        // let recommendationList = ref(props.recommendationList as TRecommendation[]);
        let recommendation = ref(props.recommendationList![0]);

        const displayName = (name: string) => name;
        const displayBuildName = (item: TRecommendation) => item.name;

        const characterMaster = computed(() => characterInput.value!.characterMaster);
        const weaponMaster = computed(() => characterInput.value!.weaponMaster);

        const artifactSetMaster = computed(() => characterInput.value!.artifactSetMaster);

        const visionSrc = (item: TCharacterDetail) => ELEMENT_IMG_SRC[item.元素] as string;
        const backgroundUrl = (item: TCharacterDetail) => STAR_BACKGROUND_URL[item.レアリティ] as string;
        const colorClass = (item: TCharacterDetail) => ELEMENT_COLOR_CLASS[item.元素] as string;
        const bgColorClass = (item: TCharacterDetail) => ELEMENT_BG_COLOR_CLASS[item.元素] as string;
        let saveDisabled = false;
        let removeDisabled = false;
        let buildname = ref('');
        const saveOnClick = () => {
            if (buildname.value) {
                console.log(buildname);
            }
        };
        const removeOnClick = () => {
            if (buildname.value) {
                localStorage.removeItem('構成_' + characterInput.value!.character + '_' + buildname.value);
            }
        };
        const ascensionRange = computed(() => {
            return [0, 1, 2, 3, 4, 5, 6];
        });
        const levelRange = computed(() => {
            return 突破レベルレベルARRAY[ascension.value];
        });
        const constellationRange = computed(() => {
            let max = 0;
            if ('命ノ星座' in characterMaster.value) {
                max = Object.keys(characterMaster.value['命ノ星座']).length;
            }
            return Array.from({ length: max + 1 }, (_, i) => i);
        });
        const ascensionOnChange = () => {
            if (level.value < levelRange.value[0]) {
                level.value = levelRange.value[0];
            } else if (level.value > levelRange.value[levelRange.value.length - 1]) {
                level.value = levelRange.value[levelRange.value.length - 1];
            }
            buildOnChange();
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
            return 突破レベルレベルARRAY[weaponAscension.value];
        });
        const weaponRefineRange = computed(() => {
            return [1, 2, 3, 4, 5];
        });
        const weaponAscensionOnChange = () => {
            if (weaponLevel.value < weaponLevelRange.value[0]) {
                weaponLevel.value = weaponLevelRange.value[0];
            } else if (weaponLevel.value > weaponLevelRange.value[weaponLevelRange.value.length - 1]) {
                weaponLevel.value = weaponLevelRange.value[weaponLevelRange.value.length - 1];
            }
            buildOnChange();
        };
        const buildOnChange = () => {
            if (characterInput.value) {
                characterInput!.突破レベル = ascension;
                characterInput!.レベル = level;
                characterInput!.命ノ星座 = constellation;
            }
            console.log(characterInput);
        };

        return {
            displayName,
            displayBuildName,
            visionSrc, backgroundUrl, colorClass, bgColorClass,
            characterMaster, weaponMaster, artifactSetMaster,
            ascension, level, constellation,
            normalAttackLevel, elementalSkillLevel, elementalBurstLevel,
            weaponAscension, weaponLevel, weaponRefine,
            saveDisabled, removeDisabled, buildname,
            saveOnClick, removeOnClick,
            ascensionRange, levelRange, constellationRange,
            ascensionOnChange,
            weaponAscensionRange, weaponLevelRange, weaponRefineRange,
            weaponAscensionOnChange,
            recommendationListVisible, recommendation,
            normalAttackLevelRange, elementalSkillLevelRange, elementalBurstLevelRange,
            buildOnChange,
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
</style>
