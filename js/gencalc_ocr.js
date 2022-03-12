// @ts-check

// @ts-ignore
const { createWorker } = Tesseract;

var artifactDetailText = null;

/**
 * 
 * @param {File} image 
 * @returns {Promise<string | ArrayBuffer>}
 */
function readImage(image) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = function () { resolve(reader.result); }
        reader.onerror = function (e) { reject(e); }
        reader.readAsDataURL(image);
    });
}

/**
 * 
 * @param {string | ArrayBuffer} src 
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(src) {
    return new Promise(function (resolve, reject) {
        const img = new Image();
        img.onload = function () { resolve(img); }
        img.onerror = function (e) { reject(e); }
        img.src = src.toString();
    });
}

/**
 * 
 * @param {File} imageFile 
 * @returns {Promise}
 */
function imageToCanvas(imageFile) {
    return new Promise(function (resolve, reject) {
        readImage(imageFile).then(function (src) {
            loadImage(src).then(function (image) {
                const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('artifactDetailCanvas'));
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

    console.log(text);
    text = text.replace(/[,\s]/g, '');
    text = text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    text = text.replace(/[①②③④⑤⑥⑦⑧⑨]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - ('①'.charCodeAt(0) - '1'.charCodeAt(0)));
    });
    [
        ['⑪', '11'],
        ['⑫', '12'],
        ['⑬', '13'],
        ['⑭', '14'],
        ['⑮', '15'],
        ['⑯', '16'],
        ['⑰', '17'],
        ['⑱', '18'],
        ['⑲', '19'],
        ['⑳', '20']
    ].forEach(entry => {
        text = text.replace(new RegExp(entry[0], 'g'), entry[1]);
    });
    console.log(text);

    let subStatusObj = {};
    ['HP上限', '攻撃力', '防御力', '元素.知', '会心率', '会心ダメージ', '元素チャージ効率'].forEach(statusName => {
        let toKey = statusName;
        if (statusName == '元素.知') {
            toKey = '元素熟知';
        }
        let re = new RegExp(statusName + '\\+([0-9\\.]+)');
        let reRet = re.exec(text);
        if (reRet) {
            if (['HP上限', '攻撃力', '防御力', '元素熟知'].includes(toKey)) {
                subStatusObj[toKey] = Number(reRet[1].replace('.', ''));
            } else {
                subStatusObj[toKey] = Number(reRet[1]);
            }
            console.log(toKey, subStatusObj[toKey]);
        } else {
            subStatusObj[toKey] = 0;
        }
    });

    $('#聖遺物メイン効果1Input').val(null);
    $('#聖遺物メイン効果2Input').val(null);
    $('#聖遺物メイン効果3Input').val(null);
    if ($('#聖遺物メイン効果4Input').val()) {
        if (!$('#聖遺物メイン効果4Input').val().toString().endsWith('バフ')) {
            $('#聖遺物メイン効果4Input').val(null);
        }
    }
    if ($('#聖遺物メイン効果5Input').val()) {
        if (!$('#聖遺物メイン効果5Input').val().toString().endsWith('バフ')) {
            $('#聖遺物メイン効果5Input').val(null);
        }
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

/**
 * 
 * @param {File} file 
 */
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

/**
 * 
 * @param {Event} e イベント
 */
function resizePinnedImage(e) {
    const target = /** @type {HTMLInputElement} */ (e.currentTarget);
    const file = target.files[0];
    if (!file.type.match('image.*')) { return; }
    resize(file);
    target.files = null;
    target.value = null;
    enable構成保存Button();
}