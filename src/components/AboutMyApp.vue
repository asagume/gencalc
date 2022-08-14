<template>
    <h2>げんかるく</h2>
    <fieldset style="text-align: center; margin: 1rem; padding: 1rem;">
        <legend>構成保存の対象範囲</legend>
        <button type="button">キャラクター</button>
        <button type="button">武器</button>
        <button type="button">聖遺物セット効果</button>
        <button type="button">聖遺物メイン効果</button>
        <button type="button">聖遺物サブ効果</button>
        <button type="button">オプション条件</button>
        <hr>
        <a href="SavedataList.html">保存構成リンク集</a>
    </fieldset>

    <fieldset>
        <legend>聖遺物詳細画面OCR</legend>
        <div class="description">
            キャラクター＞聖遺物＞聖遺物詳細のスクリーンショットから聖遺物のステータスを設定する機能です。
            読み取り精度はいまひとつなので、実行後に目視にて確認、修正願います。
            本機能はすべてブラウザ内で処理されます。外部へのデータ送信などはありません。
        </div>
    </fieldset>

    <fieldset>
        <legend>被ダメージ表示</legend>
        <div class="description">
            基礎ダメージ10000に対する被ダメージ(推定値)を表示します。<br>
            基礎ダメージはざっくり防御力0の場合の被ダメージです。
        </div>
    </fieldset>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: 'AboutMyApp',
});
</script>
<style scoped>
.description {
    text-align: left;
}
</style>
