<template>
    <fieldset>
        <legend>げんかるく - 原神ダメージシミュレーター Ver.{{ version }}</legend>
        <p>
            <a href="ArtifactSetList.html">聖遺物セット効果一覧</a>
            <a href="BirthdayCalendar.html">誕生日カレンダー</a>
        </p>
        <p>
            <a href="WeaponList.html?kind=Sword">片手剣一覧</a>
            <a href="WeaponList.html?kind=Claymore">両手剣一覧</a>
            <a href="WeaponList.html?kind=Polearm">長柄武器一覧</a>
            <a href="WeaponList.html?kind=Bow">弓一覧</a>
            <a href="WeaponList.html?kind=Catalyst">法器一覧</a>
        </p>
        <p>
            <a href="RandomTeam.html">ランダムチーム編成メーカー</a>
            <a href="HoYoDictionary.html">原神の辞書</a>
        </p>
        <div>&emsp;</div>
        <div style="position: absolute; right: 1rem; top: 0">
            <a href="https://zawazawa.jp/gencalc/topic/1" target="_blank" rel="noopener noreferrer">バグ報告·要望</a>
        </div>
        <div style="position: absolute; left: 1rem; top: 0">
            <a href="history.html">更新履歴</a>
        </div>
        <div style="position: absolute; left: 1rem; bottom: 1rem">
            <a href="RotationVisualizer.html">げんろーて</a>
        </div>
        <label style="position: absolute; right: 1rem; bottom: 1rem">
            Language:
            <select v-model="locale" @change="localeOnChange(targetValue($event))">
                <option v-for="item in localeList" :value="item.value" :key="item.value">
                    {{ item.name }}
                </option>
            </select>
        </label>
    </fieldset>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useI18n } from 'vue-i18n';
import CompositionFunction from './CompositionFunction.vue';

export default defineComponent({
    name: "TitleAndHeader",
    setup() {
        const { locale } = useI18n({
            useScope: "global",
        });
        const { localeList, setI18nLanguage, displayName, targetValue } = CompositionFunction();

        const localeOnChange = (locale: string | undefined) => {
            if (locale) setI18nLanguage(locale);
        }

        return {
            locale,
            localeList, displayName, targetValue,
            localeOnChange,

            version: require('../../package.json').version,
        }
    }
});
</script>