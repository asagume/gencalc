<template>
    <h2>げんかるく</h2>
    <fieldset>
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

    <fieldset>
        <legend>NEXT STEP</legend>
        <div class="description">
            選択したダメージアクションについて、現在のステータスから聖遺物サブ効果1回上昇分ステータスが変化した場合のダメージの上昇率を計算します。
            次にどのステータスを伸ばすべきかの参考情報となります。<br>
            比較的高い計算力を要求する機能のため、動作が重い場合は下部の停止ボタンから機能を止めて下さい。
        </div>
    </fieldset>

    <fieldset>
        <legend>内部リンク</legend>
        <p>
            <a href="GoogleDrive.html">Google Drive連携 (テスト中)</a>
        </p>
        <p>
            <a href="StatList.html">キャラクターステータス一覧</a>
        </p>
        <p>
            <a href="TeamOptionList.html">強化・弱体効果一覧</a>
        </p>
        <p>
            <a href="CritTarget.html">会心目標</a>
        </p>
        <p>
            <a href="RecommendationList.html">おすすめセット一覧</a>
        </p>
        <p>
            <a href="index2.html">旧バージョン(V2)</a>
        </p>
        <p>
            <a href="RotationVisualizer.html">げんろーて</a>
        </p>
    </fieldset>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: 'AboutMyApp',
});
</script>
<style scoped>
fieldset {
    margin-bottom: 15px;
    padding: 1rem 1.5rem;
}

legend {
    padding-left: 10px;
    padding-right: 10px;
    color: orange;
}

.description {
    text-align: left;
}
</style>
