let cache;

// Skyblockエリアの取得
function getSkyblockArea() {
    const line = TabList.getNames().find(it => /^(Area|Garden): ([\w ]+)$/.test(it.removeFormatting()));
    if (line) {
        const match = line.removeFormatting().match(/^(Area|Garden): ([\w ]+)$/);
        if (match) return match[2];
    }
    return null;
}


export const getArea = () => {
    if (cache) return cache;
    const item = getSkyblockArea();
    cache = item;
    return item;
}

register("worldload", () => {
    cache = null;
});