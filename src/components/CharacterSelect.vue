<template>
    <div id="character-select">
        <ul>
            <li v-for="item in characterList" :key="item.key">
                <img :src="item.icon_url" :alt="item.key">
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

const Master = require('../master.js');

interface ICharacter {
    key: string,
    icon_url: string,
    レアリティ: number,
    [key: string]: number | string,
}

export default defineComponent({
    name: 'CharacterSelect',
    props: {
        character: String,
    },
    setup(props) {
        const displayName = (name: string) => {name};

        return {
            characterList: Master.CHARACTER_MASTER_LIST,
        }
    }
});
</script>
