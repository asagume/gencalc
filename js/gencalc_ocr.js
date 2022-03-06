const { createWorker } = Tesseract;

var artifactDetailText = null;

function readImage(image) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = function () { resolve(reader.result); }
        reader.onerror = function (e) { reject(e); }
        reader.readAsDataURL(image);
    });
}

function loadImage(src) {
    return new Promise(function (resolve, reject) {
        const img = new Image();
        img.onload = function () { resolve(img); }
        img.onerror = function (e) { reject(e); }
        img.src = src;
    });
}

function imageToCanvas(imageFile) {
    return new Promise(function (resolve, reject) {
        readImage(imageFile).then(function (src) {
            loadImage(src).then(function (image) {
                const canvas = document.getElementById('artifactDetailCanvas');
                const ctx = canvas.getContext('2d');
                const scale = 2;
                canvas.width = image.width * scale;
                canvas.height = image.height * scale;
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                let imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
                for (let y = 0; y < imgPixels.height; y++) {
                    for (let x = 0; x < imgPixels.width; x++) {
                        let i = (y * 4) * imgPixels.width + x * 4;
                        let avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
                        imgPixels.data[i] = 255 - (avg < 64 ? 0 : imgPixels.data[i]);
                        imgPixels.data[i + 1] = 255 - (avg < 64 ? 0 : imgPixels.data[i + 1]);
                        imgPixels.data[i + 2] = 255 - (avg < 64 ? 0 : imgPixels.data[i + 2]);
                    }
                }
                ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
                resolve(canvas);
            }).catch(function (error) {
                reject(error);
            });
        }).catch(function (error) {
            reject(error);
        });
    })
}

function setArtifactDetail(text) {
    artifactDetailText = text;

    text = text.replace(/[,\s]/g, '');
    text = text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    text = text.replace(/[①②③④⑤⑥⑦⑧⑨]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - ('①'.charCodeAt(0) - '1'.charCodeAt(0)));
    });
    console.log(text);

    let subStatusObj = {};
    ['HP上限', '攻撃力', '防御力', '元素熟知', '会心率', '会心ダメージ', '元素チャージ効率'].forEach(statusName => {
        let re = new RegExp(statusName + '\\+([0-9\\.]+)');
        let reRet = re.exec(text);
        if (reRet) {
            if (['HP上限', '攻撃力', '防御力', '元素熟知'].includes(statusName)) {
                subStatusObj[statusName] = Number(reRet[1].replace('.', ''));
            } else {
                subStatusObj[statusName] = Number(reRet[1]);
            }
            console.log(statusName, subStatusObj[statusName]);
        } else {
            subStatusObj[statusName] = 0;
        }
    });

    $('#聖遺物メイン効果1Input').val(null);
    $('#聖遺物メイン効果2Input').val(null);
    $('#聖遺物メイン効果3Input').val(null);
    if (!$('#聖遺物メイン効果4Input').val().endsWith('バフ')) {
        $('#聖遺物メイン効果4Input').val(null);
    }
    if (!$('#聖遺物メイン効果5Input').val().endsWith('バフ')) {
        $('#聖遺物メイン効果5Input').val(null);
    }

    $('#聖遺物優先するサブ効果1Input').val(null);
    $('#聖遺物優先するサブ効果2Input').val(null);
    $('#聖遺物優先するサブ効果3Input').val(null);

    $('#聖遺物サブ効果HPPInput').val(0);
    $('#聖遺物サブ効果攻撃力PInput').val(0);
    $('#聖遺物サブ効果防御力PInput').val(0);
    $('#聖遺物サブ効果HPInput').val(subStatusObj['HP上限']);
    $('#聖遺物サブ効果攻撃力Input').val(subStatusObj['攻撃力']);
    $('#聖遺物サブ効果防御力Input').val(subStatusObj['防御力']);
    $('#聖遺物サブ効果元素熟知Input').val(subStatusObj['元素熟知']);
    $('#聖遺物サブ効果会心率Input').val(subStatusObj['会心率']);
    $('#聖遺物サブ効果会心ダメージInput').val(subStatusObj['会心ダメージ']);
    $('#聖遺物サブ効果元素チャージ効率Input').val(subStatusObj['元素チャージ効率']);

    $('#loading').hide();
    inputOnChangeStatusUpdate();
}

function resize(file) {
    imageToCanvas(file).then(function (canvas) {
        $('#loading').show();

        (async function () {
            const worker = createWorker({
                langPath: 'tessdata/4.0.0_fast',
                logger: m => console.debug(m)
            });
            await worker.load();
            await worker.loadLanguage('jpn');
            await worker.initialize('jpn');
            //await worker.setParameters({
            //    tessedit_char_blacklist: '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳',
            //});
            //await worker.setParameters({
            //    tessedit_char_whitelist: '0123456789+,.%HP上限攻撃力防御元素熟知会心率ダメージチャ効',
            //});
            // 基本ステータス
            // 元素熟知が高いほど、強力な元素の力を発動できる。
            // 蒸発、溶解反応によるダメージ+10.7%。
            // 過負荷、超電導、感電、氷砕き拡散反応によるダメージ+43.5%。
            // 結晶反応が結晶シールドを生成し、ダメージ吸収量+17.1%。
            // スタミナ上限
            // 高級ステータス
            // 元素ステータス
            await worker.setParameters({
                preserve_interword_spaces: '1'
            });
            const { data: { text } } = await worker.recognize(canvas);
            setArtifactDetail(text);
            await worker.terminate();
        })();
    });
}

function resizePinnedImage(e) {
    const file = e.target.files[0];
    if (!file.type.match('image.*')) { return; }
    resize(file);
    e.currentTarget.files = null;
    e.currentTarget.value = null;
    enable構成保存Button();
}