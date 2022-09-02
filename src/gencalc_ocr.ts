import Tesseract from 'tesseract.js'

const { createWorker } = Tesseract;

let WHITELIST = '0123456789.%+';
[
    'HP上限', '攻撃力', '防御力', '元素熟知', '会心率', '会心ダメージ', '元素チャージ効率',
    '基本ステータス', '高級ステータス', '元素ステータス',
    'スタミナ上限', '与える治療効果', '受ける治療効果', 'クールタイム短縮', 'シールド強化',
    '炎元素ダメージ', '水元素ダメージ', '風元素ダメージ', '雷元素ダメージ', '草元素ダメージ', '氷元素ダメージ', '岩元素ダメージ', '物理ダメージ',
    '元素熟知が高いほど、強力な元素の力を発動できる。',
    '蒸発、溶解反応によるダメージ',
    '過負荷、超電導、感電、氷砕き拡散反応によるダメージ',
    '結晶反応が結晶シールドを生成し、ダメージ吸収量'
].forEach(stat => {
    stat.split('').forEach(ch => {
        if (WHITELIST.indexOf(ch) == -1) WHITELIST += ch;
    })
})

function readImage(image: any) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = function () { resolve(reader.result); }
        reader.onerror = function (e) { reject(e); }
        reader.readAsDataURL(image);
    });
}

function loadImage(src: any) {
    return new Promise(function (resolve, reject) {
        const img = new Image();
        img.onload = function () { resolve(img); }
        img.onerror = function (e) { reject(e); }
        img.src = src.toString();
    });
}

async function imageToCanvas(imageFile: File) {
    const src = await readImage(imageFile);
    const image = await loadImage(src) as any;
    const canvas = document.getElementById('artifact-stats-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const scale = 2;
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < imgPixels.height; y++) {
        for (let x = 0; x < imgPixels.width; x++) {
            const i = (y * 4) * imgPixels.width + x * 4;
            const avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
            imgPixels.data[i] = 255 - (avg < 64 ? 0 : imgPixels.data[i]);
            imgPixels.data[i + 1] = 255 - (avg < 64 ? 0 : imgPixels.data[i + 1]);
            imgPixels.data[i + 2] = 255 - (avg < 64 ? 0 : imgPixels.data[i + 2]);
        }
    }
    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
    return canvas;
}

function setArtifactDetail(text: string) {
    console.log(text);
    text = text.replace(/[,\s]/g, '');
    text = text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    text = text.replace(/[①②③④⑤⑥⑦⑧⑨]/g, function (s: string) {
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

    const artifactStats = {} as { [key: string]: number };
    ['HP上限', '攻撃力', '防御力', '元素.*?知', '会心率', '会心ダメージ', '元素チャージ効率'].forEach(stat => {
        let toStat = stat;
        if (stat == 'HP上限') {
            toStat = 'HP';
        }
        if (stat == '元素.*?知') {
            toStat = '元素熟知';
        }
        const re = new RegExp(stat + '\\+([0-9\\.]+)');
        const reRet = re.exec(text);
        if (reRet) {
            if (['HP', '攻撃力', '防御力', '元素熟知'].includes(toStat)) {
                artifactStats[toStat] = Number(reRet[1].replace('.', ''));
            } else {
                artifactStats[toStat] = Number(reRet[1]);
            }
            console.log(toStat, artifactStats[toStat]);
        } else {
            artifactStats[toStat] = 0;
        }
    });

    return artifactStats;
}

async function resize(file: File) {
    const canvas = await imageToCanvas(file);
    const worker = createWorker({
        // langPath: 'tessdata/4.0.0_best',
        logger: m => console.debug(m)
    });
    await worker.load();
    await worker.loadLanguage('jpn');
    await worker.initialize('jpn');
    //await worker.setParameters({
    //    tessedit_char_blacklist: '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳',
    //});
    // await worker.setParameters({
    //     tessedit_char_whitelist: WHITELIST,
    // });
    // 基本ステータス
    // 元素熟知が高いほど、強力な元素の力を発動できる。
    // 蒸発、溶解反応によるダメージ+10.7%。
    // 過負荷、超電導、感電、氷砕き拡散反応によるダメージ+43.5%。
    // 結晶反応が結晶シールドを生成し、ダメージ吸収量+17.1%。
    // スタミナ上限
    // 高級ステータス
    // 元素ステータス
    await worker.setParameters({
        tessedit_char_whitelist: WHITELIST,
        preserve_interword_spaces: '1'
    });
    const { data: { text } } = await worker.recognize(canvas);
    await worker.terminate();
    const result = setArtifactDetail(text);
    return result;
}

export async function resizePinnedImage(ev: Event): Promise<{ [key: string]: number } | undefined> {
    let result = undefined;
    const target = ev.currentTarget as HTMLInputElement;
    const fileList = target.files;
    if (fileList && fileList[0]) {
        const file = fileList[0];
        if (file.type.match('image.*')) {
            target.files = null;
            target.value = '';
            result = await resize(file);
        }
    }
    console.log('resizePinnedImage', result);
    return result;
}