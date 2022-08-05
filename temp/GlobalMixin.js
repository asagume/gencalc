import { STAT_PERCENT_LIST } from "./input";


const GlobalMixin = {
    data() {
        return {
            lang: "en-us",
            langList: [
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
                // { name: 'ภาษาไทย', value: 'th-th' },
                { name: "Tiếng Việt", value: "vi-vn" },
            ],
        };
    },
    methods: {
        displayName(name) {
            if (!name) return name;
            return String(name);
        },
        percent(stat) {
            return (stat.endsWith('%') || STAT_PERCENT_LIST.includes(stat)) ? '%' : '';
        },
        displayStatValue(stat, value, opt_s = null) {
            const percent = this.percent(stat);
            let p = percent ? 10 : 1;
            if (opt_s) p = Math.pow(10, opt_s);
            return String(Math.round(value * p) / p) + percent;
        },
        /** $event.target.valueでのtypescriptエラー回避のために */
        targetValue(event) {
            if (event.target instanceof HTMLInputElement) return event.target.value;
            if (event.target instanceof HTMLSelectElement) return event.target.value;
            return undefined;
        },
        langOnChange(lang) {
            if (lang) {
                // document.getElementsByName('html')[0].lang = lang;
                this.lang = lang;
            }
        },
    },
};
export default GlobalMixin;
