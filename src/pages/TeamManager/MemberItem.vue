<template>
    <div class="member">
        <div class="member-img" @click="characterOnClick">
            <img :class="'character' + characterImgClass" :src="characterImgSrc" :alt="displayName(member.name)" />
            <img class="vision" :src="visionImgSrc" alt="vision" />
            <div class="constellation" v-show="constellation">
                {{ constellation }}
            </div>
        </div>
        <div>
            {{ statValue }}
        </div>
        <div>
            <img class="weapon" :src="imgWeaponSrc" alt="weapon" />
            <img class="artifact-set" :src="imgArtifactSetSrc(0)" alt="artifact-set" />
            <img class="artifact-set" :src="imgArtifactSetSrc(1)" alt="artifact-set" />
        </div>
        <div>
            <span class="button material-symbols-outlined" @click="extraControl='buildname'">
                manage_accounts </span>
            <span class="button material-symbols-outlined" @click="extraControl='locate'">
                edit_note </span>
        </div>
        <div class="extra-control">
            <div v-if="extraControl=='buildname'">
                <select v-model="buildname" @change="buildnameOnChange">
                    <option v-for="value in buildnames" :key="value" :value="value">
                        {{value}}
                    </option>
                </select>
            </div>
            <div v-if="extraControl=='locate'">
                <button type="button" @click="locate">open</button>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import CompositionFunction from '@/components/CompositionFunction.vue';
import { deepcopy, overwriteObject } from "@/common";
import { ARTIFACT_DETAIL_INPUT_TEMPLATE, CHARACTER_INPUT_TEMPLATE, CONDITION_INPUT_TEMPLATE, makeDefaultBuildname, OPTION_INPUT_TEMPLATE, STATS_INPUT_TEMPLATE, TArtifactDetailInput, TCharacterInput, TConditionInput, TOptionInput, TStatsInput, loadRecommendation, makeDamageDetailObjArrObjCharacter, makeDamageDetailObjArrObjWeapon, makeDamageDetailObjArrObjArtifactSets, setupConditionValues } from '@/input';
import { ARTIFACT_SET_MASTER, CHARACTER_MASTER, ELEMENT_IMG_SRC, getCharacterMasterDetail, IMG_SRC_DUMMY, STAR_BACKGROUND_IMAGE_CLASS, TCharacterDetail, TCharacterEntry, TCharacterKey, TWeaponDetail } from '@/master';
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import { getBuilddataFromStorage, getBuildnameFromStorageKey, getBuildStorageKeys, TMember } from './team';
import { calculateArtifactStats, calculateArtifactStatsMain, calculateStats } from '@/calculate';

export default defineComponent({
    name: "MemberItem",
    props: {
        member: { type: Object as PropType<TMember>, required: true },
        displayStat: { type: String },
    },
    emits: ['click:character', 'change:buildname'],
    setup(props, context) {
        const { displayName, displayStatValue } = CompositionFunction();

        const buildname = ref(props.member.buildname);
        const buildnameOnChange = () => {
            context.emit('change:buildname', props.member.id, buildname.value);
        };

        const characterInput = deepcopy(CHARACTER_INPUT_TEMPLATE) as TCharacterInput;
        const artifactDetailInput = deepcopy(ARTIFACT_DETAIL_INPUT_TEMPLATE) as TArtifactDetailInput;
        const conditionInput = deepcopy(CONDITION_INPUT_TEMPLATE) as TConditionInput;
        const optionInput = deepcopy(OPTION_INPUT_TEMPLATE) as TOptionInput;
        const statsInput = deepcopy(STATS_INPUT_TEMPLATE) as TStatsInput;

        const extraControl = ref('locate');

        watch(props, (newVal) => {
            buildname.value = newVal.member.buildname;
            setupMemberStats();
        });

        const setupMemberStats = async () => {
            overwriteObject(characterInput, CHARACTER_INPUT_TEMPLATE);
            overwriteObject(artifactDetailInput, ARTIFACT_DETAIL_INPUT_TEMPLATE);
            overwriteObject(conditionInput, CONDITION_INPUT_TEMPLATE);
            overwriteObject(optionInput, OPTION_INPUT_TEMPLATE);
            overwriteObject(statsInput, STATS_INPUT_TEMPLATE);

            if (props.member.name) {
                characterInput.character = props.member.name as TCharacterKey;
                characterInput.characterMaster = await getCharacterMasterDetail(
                    characterInput.character
                );
            } else {
                characterInput.characterMaster = {} as TCharacterDetail;
                characterInput.weaponMaster = {} as TWeaponDetail;
                return;
            }

            const builddata = savedata.value;
            if (!builddata) {
                characterInput.weaponMaster = {} as TWeaponDetail;
                return;
            }

            await loadRecommendation(
                characterInput,
                artifactDetailInput,
                conditionInput,
                optionInput,
                builddata
            );
            makeDamageDetailObjArrObjCharacter(characterInput);
            makeDamageDetailObjArrObjWeapon(characterInput);
            makeDamageDetailObjArrObjArtifactSets(characterInput);
            setupConditionValues(conditionInput, characterInput);
            calculateArtifactStatsMain(
                artifactDetailInput.聖遺物ステータスメイン効果,
                artifactDetailInput.聖遺物メイン効果
            );
            calculateArtifactStats(artifactDetailInput);
            calculateStats(
                statsInput,
                characterInput,
                artifactDetailInput,
                conditionInput,
                optionInput
            );

            return statsInput.statsObj;
        }

        const characterMaster = computed(() =>
            props.member.name ? CHARACTER_MASTER[props.member.name as TCharacterKey] as TCharacterEntry ?? undefined : undefined
        );
        const characterImgSrc = computed(() => characterMaster.value?.icon_url ?? IMG_SRC_DUMMY);
        const characterImgClass = computed(() => {
            const rarity = characterMaster.value?.レアリティ;
            return rarity ? " " + (STAR_BACKGROUND_IMAGE_CLASS as any)[String(rarity)] : '';
        });
        const visionImgSrc = computed(() =>
            characterMaster.value?.元素 ? (ELEMENT_IMG_SRC as any)[characterMaster.value.元素] : IMG_SRC_DUMMY
        );
        const constellation = computed(() => characterInput.命ノ星座);
        const imgWeaponSrc = computed(() => characterInput.weaponMaster?.icon_url ?? IMG_SRC_DUMMY);
        const imgArtifactSetSrc = (index: number) => {
            let result = IMG_SRC_DUMMY;
            const artifactSet = characterInput.artifactSets[index];
            if (artifactSet && artifactSet in ARTIFACT_SET_MASTER) {
                result = (ARTIFACT_SET_MASTER as any)[artifactSet].icon_url;
            }
            return result;
        };

        const characterOnClick = () => {
            context.emit('click:character');
        }

        const buildnames = computed(() => {
            const character = props.member.name;
            let result = getBuildStorageKeys(character).map(s => getBuildnameFromStorageKey(s));
            const defaultBuildname = makeDefaultBuildname(character);
            if (result.includes(defaultBuildname)) {
                const others = result.filter(s => s != defaultBuildname).sort();
                if (others.length) {
                    result = [defaultBuildname, ...others];
                }
            }
            return result;
        });

        const savedata = computed(() => {
            let result = undefined;
            const character = props.member.name;
            if (character && buildname.value) {
                result = getBuilddataFromStorage(character, buildname.value);
            }
            return result;
        });

        const statValue = computed(() => {
            let result = '';
            let stat = props.displayStat;
            if (stat) {
                if (stat === '会心率/ダメージ') {
                    result += displayStatValue('会心率', statsInput.statsObj['会心率']);
                    result += '/';
                    result += displayStatValue('会心ダメージ', statsInput.statsObj['会心ダメージ']);
                } else {
                    result += displayStatValue(stat, statsInput.statsObj[stat]);
                }
            }
            return result;
        });

        const locate = () => {
            const member = props.member;
            sessionStorage.setItem("character", member.name);
            if (buildname.value) {
                sessionStorage.setItem("buildname", buildname.value);
            } else {
                sessionStorage.removeItem("buildname");
            }
            window.open("./", "_blank");
        };

        return {
            displayName,

            characterImgSrc,
            characterImgClass,
            visionImgSrc,
            constellation,
            imgWeaponSrc,
            imgArtifactSetSrc,

            statValue,

            extraControl,

            buildname,
            buildnameOnChange,
            buildnames,
            locate,

            characterOnClick,
        }
    }
});
</script>
<style>
div.member-img {
    position: relative;
    width: 100%;
}

img.character {
    width: calc(100%);
    background-size: contain;
}

img.vision {
    width: calc(100% / 3);
    position: absolute;
    left: 0;
    top: 0;
}

div.constellation {
    position: absolute;
    font-size: 20px;
    padding: 2px 5px;
    right: 2px;
    top: 2px;
    background-color: black;
    opacity: 50%;
}

img.weapon,
img.artifact-set {
    width: calc(100% / 3 - 4px);
    height: calc(100% / 3 - 4px);
    border: 2px solid whitesmoke;
    border-radius: 50%;
}
</style>
