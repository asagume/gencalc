// <script lang="ts">
// import { defineComponent, ref } from 'vue';
// import { isString } from './common';


// export default defineComponent({
//   name: 'GlobalMixin',
//   setup() {
//     const lang = ref('ja-jp');

//     console.log('GlobalMixin');

//     const targetValue = function (event: Event) {
//       if (event.target instanceof HTMLInputElement) return event.target.value;
//       if (event.target instanceof HTMLSelectElement) return event.target.value;
//       return undefined;
//     }

//     const langOnChange = (lang: string | undefined) => {
//       if (lang) {
//         document.getElementsByName('html')[0].lang = lang;
//       }
//     }

//     const displayName = (name: string | number) => {
//       if (isString(name)) return String(name);
//       return String(name);
//     }

//     return {
//       lang,
//       langList: [
//         { name: '日本語', value: 'ja-jp' },
//         { name: 'English', value: 'en-us' },
//         { name: '简体中文', value: 'zh-cn' },
//         { name: '繁體中文', value: 'zh-tw' },
//         { name: '한국어', value: 'ko-kr' },
//         { name: 'Deutsch', value: 'de-de' },
//         { name: 'Español', value: 'es-es' },
//         { name: 'Français', value: 'fr-fr' },
//         { name: 'Indonesia', value: 'id-id' },
//         { name: 'Português', value: 'pt-pt' },
//         { name: 'Pусский', value: 'ru-ru' },
//         { name: 'Tiếng Việt', value: 'vi-vn' }
//       ],
//       targetValue,
//       langOnChange,
//       displayName,
//     }
//   },
// });

// </script>