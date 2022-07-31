<template>
    <table>
        <tr>
            <td colspan="3" rowspan="3" style="width: 180px; position: relative;">
                <img class="character" :src="characterMaster.icon_url" :alt="characterMaster.名前"
                    :style="'background-image: url(' + backgroundUrl(characterMaster) + ')'"
                    @click="$emit('open:character-select')">
                <img class="vision" :src="visionSrc(characterMaster)" :alt="characterMaster.元素">
            </td>
            <td :class="'title ' + colorClass" colspan="3" style="position: relative;">
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
            <td>
                &emsp;
            </td>
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
                <!-- <label class="button open-close">
                    <input class="hidden" type="checkbox" v-model="おすすめセットOption.isOpen">
                    <span>{{ displayName('おすすめセット') }}</span>
                </label> -->
            </td>
        </tr>
        <!-- <tr v-if="おすすめセットOption.isOpen">
            <td colspan="6">
                <select v-model="おすすめセット" @change="recommendationOnChange">
                    <option v-for="item in おすすめセットOption.list" :value="item">
                        {{ displayBuildName(item) }}</option>
                </select>
            </td>
        </tr> -->
    </table>
    <!-- <table>
        <tr>
            <td colspan="3" rowspan="3" class="icon" style="width: 180px;">
                <img class="weapon with-tooltip" :src="weaponMaster['icon_url']" :alt="weaponMaster.key"
                    :style="'background-image: url(' + weaponStarBackgroundUrl + ')'" @click="weaponOnClick">
                <div class="tooltip">{{ displayName(weaponMaster.key) }}</div>
            </td>
            <td class="icon">
                <img :class="'talent with-tooltip ' + bgColorClass" :src="characterMaster['通常攻撃']['icon_url']"
                    :alt="characterMaster['通常攻撃']['名前']" @click="normalAttackOnClick">
                <div class="tooltip">{{ displayName(characterMaster['通常攻撃']['名前']) }}</div>
            </td>
            <td class="icon">
                <img :class="'talent with-tooltip ' + bgColorClass" :src="characterMaster['元素スキル']['icon_url']"
                    :alt="characterMaster['元素スキル']['名前']" @click="elementalSkillOnClick">
                <div class="tooltip">{{ displayName(characterMaster['元素スキル']['名前']) }}</div>
            </td>
            <td class="icon">
                <img :class="'talent with-tooltip ' + bgColorClass" :src="characterMaster['元素爆発']['icon_url']"
                    :alt="characterMaster['元素爆発']['名前']" @click="elementalBurstOnClick">
                <div class="tooltip">{{ displayName(characterMaster['元素爆発']['名前']) }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <select v-model="通常攻撃レベル" @change="buildOnChange">
                    <option v-for="item in normalAttackLevelRange" :value="item"> Lv.{{ item }}
                    </option>
                </select>
            </td>
            <td>
                <select v-model="元素スキルレベル" @change="buildOnChange">
                    <option v-for="item in elementalSkillLevelRange" :value="item"> Lv.{{ item }}
                    </option>
                </select>
            </td>
            <td>
                <select v-model="元素爆発レベル" @change="buildOnChange">
                    <option v-for="item in elementalBurstLevelRange" :value="item"> Lv.{{ item }}
                    </option>
                </select>
            </td>
        </tr>
        <tr>
            <td rowspan="2" class="icon">
                <label class="with-tooltip" @click="artifactSetOnClick(0)">
                    <img :class="'artifact-set ' + classArtifactSetSelected(0)" :src="聖遺物セット効果[0].master.image"
                        :alt="聖遺物セット効果[0]['名前']">
                </label>
                <div class="tooltip">{{ displayName(聖遺物セット効果[0]['名前']) }}</div>
            </td>
            <td rowspan="2" class="icon">
                <label class="with-tooltip" @click="artifactSetOnClick(1)">
                    <img :class="'artifact-set ' + classArtifactSetSelected(1)" :src="聖遺物セット効果[1].master.image"
                        :alt="聖遺物セット効果[1]['名前']">
                </label>
                <div class="tooltip">{{ displayName(聖遺物セット効果[1]['名前']) }}</div>
            </td>
            <td rowspan="2">
                <button type="button" class="artifact-detail-button">
                    <img class="artifact-set" :src="IMG_SRC_DUMMY" :alt="displayName('聖遺物ステータス')"
                        @click="artifactDetailOnClick">
                    <img class="left-icon" src="public/images/artifact.png" alt="artifact">
                    <img class="right-icon" src="public/images/artifact.png" alt="artifact">
                    <div class="absolute-center">{{ artifactScore }}</div>
                </button>
            </td>
        </tr>
        <tr>
            <td>
                <select v-model="武器突破レベル" @change="weaponAscensionOnChange">
                    <option v-for="item in weaponAscensionRange" :value="item"> A{{ item }}
                    </option>
                </select>
            </td>
            <td>
                <select v-model="武器レベル" @change="buildOnChange">
                    <option v-for="item in weaponLevelRange" :value="item"> Lv.{{ item }} </option>
                </select>
            </td>
            <td>
                <select v-model="武器精錬ランク" @change="buildOnChange">
                    <option v-for="item in weaponRefineRange" :value="item"> R{{ item }} </option>
                </select>
            </td>
        </tr>
    </table> -->
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

const Master = require('../master.ts');
const Input = require('../input.ts');

export default defineComponent({
    name: 'CharacterInput',
    props: {
        initialCharacterInput: { type: Object, require: true }
    },
    emits: ['open:character-select', 'open:character-info'],
    setup(props) {
        const characterInput: { [key: string]: any } = ref(props.initialCharacterInput);
        let ascension = ref(props.initialCharacterInput!.突破レベル);
        let level = ref(props.initialCharacterInput!.レベル);
        let constellation = ref(props.initialCharacterInput!.命ノ星座);
        let normalAttackLevel = ref(props.initialCharacterInput!.通常攻撃レベル);
        let elementalSkillLevel = ref(props.initialCharacterInput!.元素スキルレベル);
        let elementalBurstLevel = ref(props.initialCharacterInput!.元素爆発レベル);

        const displayName = (name: string) => name;

        const characterMaster = computed(() => characterInput.value!.characterMaster);
        const weaponMaster = computed(() => characterInput.value!.weaponMaster);

        const visionSrc = (item: any) => Master.ELEMENT_IMG_SRC[item.元素] as string;
        const backgroundUrl = (item: any) => Master.STAR_BACKGROUND_URL[item.レアリティ] as string;
        const colorClass = (item: any) => Master.ELEMENT_COLOR_CLASS[item.元素] as string;
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
            return Input.突破レベルレベルARRAY[ascension.value];
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
                level.
                    value = levelRange.value[levelRange.value.length - 1];
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
            visionSrc, backgroundUrl, colorClass,
            characterMaster,
            weaponMaster,
            ascension, level, constellation,
            normalAttackLevel, elementalSkillLevel, elementalBurstLevel,
            saveDisabled, removeDisabled, buildname,
            saveOnClick, removeOnClick,
            ascensionRange, levelRange, constellationRange,
            ascensionOnChange,
            buildOnChange,
        }
    }
});
</script>

<style scoped>
img.character {
    width: 180px;
    height: 180px;
    background-size: contain;
}

img.vision {
    width: 30px;
    height: 30px;
    position: absolute;
    left: 3px;
    top: 3px;
}

img.filter {
    width: 45px;
    height: 45px;
    border-radius: 50%;
}

:checked+img {
    background-color: gold;
}
</style>
