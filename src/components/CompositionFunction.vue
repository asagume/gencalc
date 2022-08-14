<script lang="ts">
import i18n from "@/i18n";
import { STAT_PERCENT_LIST } from "@/input";
import { nextTick } from "vue";
import { useI18n } from "vue-i18n";

export default function CompositionFunction() {
    const { t, te } = useI18n({
        useScope: "global",
    });

    const localeList = [
        { name: "日本語", value: "ja-jp" },
        { name: "English", value: "en-us" },
        { name: "简体中文", value: "zh-cn" },
        { name: "繁體中文", value: "zh-tw" },
        { name: "한국어", value: "ko-kr" },
        { name: "Deutsch", value: "de-de" },
        { name: "Español", value: "es-es" },
        { name: "Français", value: "fr-fr" },
        { name: "Indonesia", value: "id-id" },
        { name: "Português", value: "pt-pt" },
        { name: "Pусский", value: "ru-ru" },
        { name: 'ภาษาไทย', value: 'th-th' },
        { name: "Tiếng Việt", value: "vi-vn" },
    ];

    const setI18nLanguage = function (locale: string) {
        i18n.global.locale.value = locale;
        loadLocaleMessages(locale);
        document.querySelector('html')?.setAttribute('lang', locale)
    }

    const loadLocaleMessages = async function (locale: string) {
        if (locale != 'ja-jp') {
            const messages = await fetch(`./locales/${locale}.json`).then(resp => resp.json());
            i18n.global.setLocaleMessage(locale, messages);
        }
        return nextTick();
    }

    const displayName = function (key: any): string {
        if (!key) return key;
        if (i18n.global.locale.value === 'ja-jp') { // 日本語はtranslateしません
            return String(key).replace(/ダメージバフ$/, 'ダメージ');
        }
        if (te(key)) return t(key);
        const re = new RegExp('(.*?)([\\s_\\(\\)/]+)(.*)');
        let result = '';
        let work = key;
        while (work) {
            const reRet = re.exec(work);
            if (!reRet) {
                result += t(work);
                break;
            }
            if (reRet[1]) result += t(reRet[1]);
            result += reRet[2];
            work = reRet[3];
        }
        return result;
    }

    const percent = function (stat: string) {
        if (stat.endsWith("%") || STAT_PERCENT_LIST.includes(stat)) return "%";
        return "";
    }

    const displayStatValue = function (stat: string, value: number, opt_s?: number): string {
        const myPercent = percent(stat);
        let p = myPercent ? 10 : 1;
        if (opt_s) p = Math.pow(10, opt_s);
        return String(Math.round(value * p) / p) + myPercent;
    }

    /** $event.target.valueでのtypescriptエラー回避のために */
    const targetValue = function (event: Event) {
        if (event.target instanceof HTMLInputElement) return event.target.value;
        if (event.target instanceof HTMLSelectElement) return event.target.value;
        return undefined;
    }

    const displayOptionName = function (name: string) {
        return displayName(name.replace(/^required_/, ""));
    }

    return {
        localeList,
        setI18nLanguage, loadLocaleMessages,
        displayName, displayStatValue, targetValue, displayOptionName,
    }
}
</script>
