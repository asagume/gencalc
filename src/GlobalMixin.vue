<script lang="ts">
// グローバルになっていないので名前とあっていないが、
// グローバルにするとtypescriptやリンターでエラーが多発するので仕方がないのです...

import i18n from "./i18n";
import { STAT_PERCENT_LIST } from "./input";

// const GlobalMixin = defineComponent({
//   setup() {
//     const locale = ref('ja-jp');

//     const localeList = [
//       { name: "日本語", value: "ja-jp" },
//       { name: "English", value: "en-us" },
//       { name: "简体中文", value: "zh-cn" },
//       { name: "繁體中文", value: "zh-tw" },
//       { name: "한국어", value: "ko-kr" },
//       { name: "Deutsch", value: "de-de" },
//       { name: "Español", value: "es-es" },
//       { name: "Français", value: "fr-fr" },
//       { name: "Indonesia", value: "id-id" },
//       { name: "Português", value: "pt-pt" },
//       { name: "Pусский", value: "ru-ru" },
//       // { name: 'ภาษาไทย', value: 'th-th' },
//       { name: "Tiếng Việt", value: "vi-vn" },
//     ];

//     const displayName = (name: string | number): string => {
//       // return i18n.global.t(String(name));
//       return String(name);
//     };

//     const percent = (stat: string) => {
//       if (stat.endsWith("%") || STAT_PERCENT_LIST.includes(stat)) return "%";
//       if (stat.endsWith("会心率") || stat.endsWith("会心ダメージ")) return "%";
//       return "";
//     };

//     const displayStatValue = (stat: string, value: number, opt_s?: number): string => {
//       const myPercent = percent(stat);
//       let p = myPercent ? 10 : 1;
//       if (opt_s) p = Math.pow(10, opt_s);
//       return String(Math.round(value * p) / p) + myPercent;
//     };

//     /** $event.target.valueでのtypescriptエラー回避のために */
//     const targetValue = (event: Event) => {
//       if (event.target instanceof HTMLInputElement) return event.target.value;
//       if (event.target instanceof HTMLSelectElement) return event.target.value;
//       return undefined;
//     };

//     const localeOnChange = (locale: string | undefined) => {
//       if (locale) {
//         console.log('localeOnChange', locale);
//         // document.getElementsByName('html')[0].lang = lang;
//         i18n.global.locale.value = locale;
//       }
//     };

//     const displayOptionName = (name: string) => {
//       return name.replace(/^required_/, "");
//     };

//     return {
//       locale,
//       localeList,

//       displayName,
//       percent,
//       displayStatValue,
//       targetValue,
//       localeOnChange,
//       displayOptionName,
//     }
//   }
// });
// export default GlobalMixin;


const GlobalMixin = {
  data() {
    return {
      locale: "ja-jp",
      localeList: [
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
    percent(stat: string) {
      if (stat.endsWith("%") || STAT_PERCENT_LIST.includes(stat)) return "%";
      if (stat.endsWith("会心率") || stat.endsWith("会心ダメージ")) return "%";
      return "";
    },
    displayStatValue(stat: string, value: number, opt_s?: number): string {
      const percent = this.percent(stat);
      let p = percent ? 10 : 1;
      if (opt_s) p = Math.pow(10, opt_s);
      return String(Math.round(value * p) / p) + percent;
    },
    /** $event.target.valueでのtypescriptエラー回避のために */
    targetValue(event: Event) {
      if (event.target instanceof HTMLInputElement) return event.target.value;
      if (event.target instanceof HTMLSelectElement) return event.target.value;
      return undefined;
    },
    localeOnChange(locale: string | undefined) {
      if (locale) {
        console.log('localeOnChange', locale);
        // document.getElementsByName('html')[0].lang = lang;
        i18n.global.locale.value = locale;
      }
    },
    displayOptionName(name: string) {
      return name.replace(/^required_/, "");
    },
  },
};
export default GlobalMixin;
</script>
