// 聖遺物サブ効果
// 組み合わせ
function resolvePartitionPattern(n, p) {
    if (p == 0) return [];
    if (p == 1) return [[n]];
    let ans = [];
    for (let x0 = 0; x0 <= n; x0++) {
        resolvePartitionPattern(n - x0, p - 1).forEach(sub => {
            if (sub.length > 0) {
                ans.push([x0].concat(sub));
            }
        });
    }
    return ans;
}

self.addEventListener('message', function (e) {
    const ARTIFACT_SUB_PATTERN_ARR_MAP = new Map();
    const my上昇回数Arr = e.data;
    my上昇回数Arr.forEach(n => {
        if (n == 0) {
            ARTIFACT_SUB_PATTERN_ARR_MAP.set(n, [[0, 0, 0, 0]]);
        } else {
            ARTIFACT_SUB_PATTERN_ARR_MAP.set(n, resolvePartitionPattern(n, 4));
        }
        console.debug(n, new Date(), ARTIFACT_SUB_PATTERN_ARR_MAP.get(n));
    });
    self.postMessage(ARTIFACT_SUB_PATTERN_ARR_MAP);
}, false);
