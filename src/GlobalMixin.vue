<script lang="ts">
// グローバルになっていないので名前とあっていないが、
// グローバルにするとtypescriptやリンターでエラーが多発するので仕方がないのです...

// import { defineComponent, ref } from 'vue';
// import { isString } from './common';
import i18n from "./i18n";

const GlobalMixin = {
  data() {
    return {
      lang: "ja-jp",
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
    displayName: function (name: string | number): string {
      // return i18n.global.t(String(name));
      return String(name);
    },
    targetValue: function (event: Event) {
      if (event.target instanceof HTMLInputElement) return event.target.value;
      if (event.target instanceof HTMLSelectElement) return event.target.value;
      return undefined;
    },
    langOnChange: function (lang: string | undefined) {
      if (lang) {
        // document.getElementsByName('html')[0].lang = lang;
        i18n.global.locale.value = lang;
      }
    },
  },
};
export default GlobalMixin;
</script>
