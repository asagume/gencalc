import { createApp } from 'vue'
import VueTest from './VueTest.vue'
import i18n from '@/i18n';

async function main() {
    createApp(VueTest, {
    }).use(i18n).mount('#app')
}

main();
