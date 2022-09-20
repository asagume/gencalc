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
            let result = String(key);
            if (['ダメージバフ', 'ダメージアップ', '反応ボーナス', '敵'].includes(result)) {
                return result;
            }
            result = result.replace(/ダメージバフ$/, 'ダメージ');
            result = result.replace(/ダメージアップ$/, 'ダメージ');
            result = result.replace('凍結反応ボーナス', '凍結反応の継続時間');
            result = result.replace(/反応ボーナス$/, '反応ダメージ');
            result = result.replace(/^敵/, '敵の');
            return result;
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
        const tempArr = stat.split('.');
        let work = tempArr[0];
        let hasPercent = work.endsWith("%") || STAT_PERCENT_LIST.includes(work);
        if (!hasPercent) {
            ['会心率', '会心ダメージ', 'クールタイム'].forEach(postfix => {
                if (work.endsWith(postfix)) hasPercent = true;
            })
        }
        return hasPercent ? '%' : '';
    }

    const displayStatName = function (stat: string) {
        let result = stat;
        const tempArr = stat.split('.');
        if (tempArr.length == 1) {
            result = displayName(stat);
        } else if (i18n.global.locale.value === 'ja-jp') {
            result = tempArr[tempArr.length - 1] + 'の' + displayName(tempArr[0]);
        } else {
            result = displayName(tempArr[tempArr.length - 1]) + ' ' + displayName(tempArr[0]);
        }
        return result;
    }

    const displayStatValue = function (stat: string, value: number, opt_s?: number): string {
        const myPercent = percent(stat);
        let p = myPercent ? 10 : 1;
        if (opt_s) p = Math.pow(10, opt_s);
        return String(Math.round(value * p) / p) + myPercent;
    }

    const displayStatAbbrev = function (stat: string) {
        let result = stat;
        const tempArr = stat.split('.');
        if (tempArr.length == 1) {
            if (stat.startsWith('敵')) stat = stat.replace(/^敵/, '');
            if (stat.endsWith('ダメージバフ')) stat = stat.replace(/ダメージバフ$/, '');
            else if (stat.endsWith('ダメージアップ')) stat = stat.replace(/ダメージアップ$/, '');
            else if (stat.endsWith('元素ダメージ')) stat = stat.replace(/元素ダメージ$/, '');
            else if (stat.endsWith('物理ダメージ')) stat = stat.replace(/ダメージ$/, '');
            else if (stat.endsWith('反応ボーナス')) stat = stat.replace(/反応ボーナス$/, '');
            else if (stat.endsWith('耐性')) stat = stat.replace(/耐性$/, '');
            result = displayName(stat);
        } else {
            result = displayStatName(stat);
        }
        return result;
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
        setI18nLanguage,
        loadLocaleMessages,
        displayName,
        displayStatName,
        displayStatValue,
        displayStatAbbrev,
        targetValue,
        displayOptionName,
    }
}
</script>
