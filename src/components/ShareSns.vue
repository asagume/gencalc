<template>
    <div>
        <button type="button" @click="$emit('share:twitter')">
            <img width="32" height="32" src="images/Twitter social icons - rounded square - blue.png" alt="Twitter">
        </button>
    </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "ShareSns",
    emits: ['share:twitter'],
});
</script>
<style scoped>
button {
    border: none;
    background-color: transparent;
}
</style>