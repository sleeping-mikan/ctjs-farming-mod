
import { renderBoxFromCorners} from "../BloomCore/RenderUtils";
import { commands, syntax_color, SendChat } from "./utils/text";
import Mouse from "./utils/mouse";
import { deepCopyObject } from "../BloomCore/utils/Utils";
import { profile, profileData, setProfileCallFunc } from "../MI";

let data = profileData.data;

const initData = () => {
    if ("pos" in data) {
        data.farming = deepCopyObject(data);
        delete data.pos;
        delete data.bind;
        delete data.idcfg;
        data.save();
    }
    
    if (!("farming" in data)) data.farming = {};
    const farmingData = data.farming;
    
    if ( !("idcfg" in farmingData) ){
        farmingData.idcfg = {}
        data.save();
    }
    return farmingData
}

let farmingData = initData();
// プロフィール変更時に呼ばれる
function profileCallFunc (profileData) {
    data = profileData.data;
    farmingData = initData();
};
setProfileCallFunc(profileCallFunc);

const create_help_msg = ((item) => {
    // commands.loc.help は配列なので、forEach を使って処理
    let helpMessage = ""; // 結果を格納する文字列

    // 配列に対して forEach を使う
    commands[item].help.forEach((value) => {
        // cmd, sub, args を取り出し、syntax を再構成
        const cmd = value.syntax.split(" ")[0];
        const sub = value.syntax.split(" ")[1] || ""; // サブコマンドを取り出す（存在すれば）
        const args = value.syntax.split(" ").slice(2).join(" ") || ""; // 引数を取り出す（存在すれば）

        // 新しい構造に基づいて新しい syntax を作成
        const newSyntax = `${syntax_color.cmd}${cmd} ${syntax_color.sub}${sub} ${syntax_color.arg}${args}`;


        // coloredSyntax に色をつけて表示する
        helpMessage += `${newSyntax}\n${value.description}\n`;
    });

    return helpMessage; // 最終的な文字列を返す
})

const loc_help_msg = create_help_msg("loc");

const bind_help_msg = create_help_msg("bind");

const util_help_msg = create_help_msg("util");

// Skyblockエリアの取得
let isInGarden = false;
function getSkyblockArea() {
    const line = TabList.getNames().find(it => /^(Area|Garden): ([\w ]+)$/.test(it.removeFormatting()));
    if (line) {
        const match = line.removeFormatting().match(/^(Area|Garden): ([\w ]+)$/);
        if (match) return match[2];
    }
    return null;
}

// isInGarden
register("worldload", () => {
    let retryCount = 0; // リトライ回数のカウント
    const maxRetries = 3; // 最大リトライ回数
    const retryDelay = 5000; // 再試行までの遅延時間（ミリ秒）

    const reworldload = () => {
        const area = getSkyblockArea();

        // エリアが取得できた場合
        if (area) {
            isInGarden = area === "Garden";
            if (isInGarden) {
                SendChat("Gardenを検知しました。");
            }
            return; // 処理終了
        }

        // エリアが取得できなかった場合
        retryCount++;
        if (retryCount <= maxRetries) {
            setTimeout(reworldload, retryDelay); // 再試行
        }
    };

    reworldload(); // 初回呼び出し
});

const minecraft = Client.getMinecraft(); //mc instance
const settings = minecraft.field_71474_y; //game settings

//key config [forward, back, left, right]
const keyConfigs = [settings.field_74351_w, settings.field_74368_y, settings.field_74370_x, settings.field_74366_z];

const attackKey = settings.field_74312_F;

// console.log(settings);

register("renderWorld", () => {
    if (!isInGarden) return;
    if (farmingData.pos) {
        for (let id in farmingData.pos) {
            for (let item in farmingData.pos[id]) {
                let x = farmingData.pos[id][item].x;
                let y = farmingData.pos[id][item].y;
                let z = farmingData.pos[id][item].z;
                let p = id;
                if (isNaN(id)){
                    p = 0
                    for (var i = 0; i < id.length; i ++)
                        p += id[i].charCodeAt(0);
                }
                // 色設定
                let r = p * 47 % 256, g = 255 - (p * 61 % 256), b = p * 125 % 256, alpha = 0.5;
                
                let [dx, dy, dz] = [1, 1, 1];
                // サイズ
                if (id in farmingData.idcfg) {
                    if ("size" in farmingData.idcfg[id]){
                        [dx, dy, dz] = [farmingData.idcfg[id].size.dx, farmingData.idcfg[id].size.dy, farmingData.idcfg[id].size.dz];
                        if (dx < 0) x += 1;
                        if (dy < 0) y += 1;
                        if (dz < 0) z += 1;
                    }
                }
                // 描画
                renderBoxFromCorners(x, y, z, x + dx, y + dy, z + dz, r / 255, g / 255, b / 255, alpha, true, 2, true);
                renderBoxFromCorners(x, y, z, x + dx, y + dy, z + dz, r / 255, g / 255, b / 255, alpha, true, 2, false);
                const color = Renderer.color(r, g, b, alpha);
                Tessellator.drawString(id, x + dx / 2, dy > 0 ? y + dy + 0.5 : y + 0.5, z + dz / 2, color, false, 0.03, false);
            }
        }
    }
});

const update_settings = () => {
    settings.func_74303_b();
    settings.func_74300_a(); // 設定を保存
}

const get_player_pos = () => {
    x = Math.floor(Player.getX());
    y = Math.floor(Player.getY());
    z = Math.floor(Player.getZ());
    return [x,y,z];
}

const _append_marker = (x, y, z, id) => {
    const newPos = { x: x, y: y, z: z};

    // console.log(JSON.stringify(newPos));

    if (!farmingData.pos) farmingData.pos = {};
    if (!farmingData.pos[id]) farmingData.pos[id] = [];
    farmingData.pos[id].push(newPos);

    // console.log(JSON.stringify(farmingData));

    data.save();
}

const append_marker = (x, y, z, id) => {
    // console.log(`call append_marker(${x}, ${y}, ${z}, ${id})`);
    if (id === undefined) {
        SendChat("&c引数が不足しています。/loc append <id> [X] [Y] [Z] の形式で入力してください。");
        return;
    }
    if (x !== undefined && (y === undefined || z === undefined)) {
        SendChat("&c座標が無効です。/loc append <id> [X] [Y] [Z] の形式で入力してください。");
        return;
    }
    if (x === undefined) {
        [x, y, z] = get_player_pos();
    }
    _append_marker(x, y, z, id);

    SendChat(`現在の座標を保存しました: X = ${x}, Y = ${y}, Z = ${z}, id = ${id}`);
}

const _pop_marker = (...args) => {
    const pop_marker_by_pos = (x, y, z, _id) => {
        for (let id in farmingData.pos) {
            element = farmingData.pos[id];
            // console.log("run" + element);
            if (_id !== undefined && id !== _id) continue;
            // console.log("run2" + element);
            for (let i = 0; i < element.length; i++) {
                let marker = element[i];
                if (marker.x === x && marker.y === y && marker.z === z) {
                    SendChat(`座標を削除しました: X = ${x}, Y = ${y}, Z = ${z}, id = ${id}`);
                    element.splice(i, 1);
                    data.save();
                    --i;
                }
            }
        }
    }
    if (args.length === 4) {
        (() => {
            const [x, y, z, id] = args;
            pop_marker_by_pos(x, y, z, id);
        })();
    }
    if (args.length === 3){
        (() => {
            const [x, y, z] = args;
            pop_marker_by_pos(x, y, z);
        })();
    }
    if (args.length === 1 && args[0] !== undefined) {
        (() => {
            const del_id = args[0];
            for (let id in farmingData.pos) {
                // del_id == idなら削除
                if (id === del_id) {
                    delete farmingData.pos[id];
                    data.save();
                } 
            }
        })();
    }
    if (args.length === 1 && args[0] === undefined) {
        (() => {
            [x, y, z] = get_player_pos();
            pop_marker_by_pos(x, y, z);
        })();
    }
}


const pop_marker = (x, y, z, id) => {
    // console.log(JSON.stringify(farmingData));
    if (x !== undefined && y !== undefined && z !== undefined && id !== undefined) {
        _pop_marker(x, y, z, id);
    }
    else if (x === undefined && id !== undefined) {
        _pop_marker(id);
    }
    else if (id === undefined && x === undefined) {
        _pop_marker(undefined);
    }
    else {
        SendChat("&c引数が不足しています。/loc pop [id] [X] [Y] [Z] の形式で入力してください。");
    }
    // console.log(JSON.stringify(farmingData));
}

const list_markers = () => {
    if (!farmingData.pos) farmingData.pos = {};
    //中身をひとつづつ回す
    // console.dir(farmingData.pos, {depth: null});
    // console.log(JSON.stringify(farmingData));
    for (let id in farmingData.pos) {
        element = farmingData.pos[id];

        for (let i = 0; i < element.length; i++) {
            let marker = element[i];
            SendChat(`id: ${id}, X: ${marker.x}, Y: ${marker.y}, Z: ${marker.z}`);
        }
    }; 
}

const ChangeSize = ( id, dx, dy, dz) => {
    if (!isInGarden) return;
    if (isNaN(dx) || isNaN(dy) || isNaN(dz)){
        SendChat(`&c引数が無効です。/${commands.loc.name} size <id> <dx(float)> <dy(float)> <dz(float)> の形式で入力して下さい。`);
        return;
    }
    if (dz === undefined) {
        SendChat(`&c引数が不足しています。/${commands.loc.name} size <id> <dx> <dy> <dz> の形式で入力して下さい。`);
        return;
    }
    const [idx, idy, idz] = [Number(dx), Number(dy), Number(dz)];
    if (!(id in farmingData.idcfg)){
        farmingData.idcfg[id] = {}
    }
    // データを保存する
    farmingData.idcfg[id].size = {dx: idx,dy: idy,dz: idz};

    data.save();
}

const MovePlace = (id, x, y, z) => {
    if (!isInGarden) return;
    if (isNaN(x) || isNaN(y) || isNaN(z)){
        SendChat(`&c引数が無効です。/${commands.loc.name} move <id> <dx(int)> <dy(int)> <dz(int)> の形式で入力して下さい。`);
        return;
    }
    if (z === undefined) {
        SendChat(`&c引数が不足しています。/${commands.loc.name} move <id> <dx> <dy> <dz> の形式で入力して下さい。`);
        return;
    }
    for (let i = 0; i < farmingData.pos[id].length; i ++){
        farmingData.pos[id][i].x += Number(x);
        farmingData.pos[id][i].y += Number(y);
        farmingData.pos[id][i].z += Number(z);
    }
    data.save();
    SendChat(`座標を移動しました: id = ${id}, X += ${x}, Y += ${y}, Z += ${z}`);
}


// 座標保存コマンド
register("command", (subcommand ,arg1, arg2, arg3, arg4) => {
    if (subcommand === undefined) {
        SendChat(
`§csubcommandが選択されていません
§f==============================
${loc_help_msg}
`
        );
    }
    if (subcommand === "append") {
        append_marker(arg2, arg3, arg4, arg1);
    }
    if (subcommand === "list") {
        list_markers();
    }
    if (subcommand === "pop") {
        pop_marker(arg2, arg3, arg4, arg1);
    }
    if (subcommand === "help") {
        SendChat(help_msg);
    }
    if (subcommand === "size") {
        ChangeSize(arg1, arg2, arg3, arg4);
    }
    if (subcommand === "move") {
        MovePlace(arg1, arg2, arg3, arg4);
    }
}).setName(commands.loc.name);


const parse_key = (key) => {
    switch (key) {
        case "w":
            return 0;
        case "s":
            return 1;
        case "a":
            return 2;
        case "d":
            return 3;
        default:
            return -1;
    }
}

// if /swap then
const _bind_change = (id, key) => {
    if (key === undefined) {
        SendChat("&c引数が不足しています。/bind set <id> <w|a|s|d> の形式で入力してください。");
        return;
    }
    if (key !== "w" && key !== "a" && key !== "s" && key !== "d") {
        SendChat("&c引数が無効です。/bind set <id> <w|a|s|d> の形式で入力してください。");
        return;
    }
    // idのブロックを踏んだら発火するように記憶
    if (!farmingData.bind) farmingData.bind = {};
    // 進む方向に変換
    key = parse_key(key);
    //id を踏んだ時、keyの動作をDに設定
    farmingData.bind[id] = key;

    data.save();

    SendChat(`bindを保存しました: id = ${id}, key = ${key}`);

    // keyConfigs[0].func_151462_b(Keyboard.KEY_W)
    // keyConfigs[0].func_151462_b(Keyboard.KEY_S)
    // keyConfigs[0].func_151462_b(Keyboard.KEY_A)
    // keyConfigs[0].func_151462_b(Keyboard.KEY_D)
    // eval(`keyConfigs[0].func_151462_b(Keyboard.KEY_${key})`); // キーコードを変更
    // // update keybind
    // update_settings();
}

const _list_bind = () => {
    if (!farmingData.bind) farmingData.bind = {};
    for (let id in farmingData.bind) {
        let key = farmingData.bind[id];
        switch (key) {
            case 0:
                key = "w";
                break;
            case 1:
                key = "s";
                break;
            case 2:
                key = "a";
                break;
            case 3:
                key = "d";
                break;
        }
        SendChat(`id: ${id}, key: ${key}`);
    }
}

const _config_reset = () => {
    keyConfigs[0].func_151462_b(Keyboard.KEY_W);
    keyConfigs[1].func_151462_b(Keyboard.KEY_S);
    keyConfigs[2].func_151462_b(Keyboard.KEY_A);
    keyConfigs[3].func_151462_b(Keyboard.KEY_D);

    update_settings();

    SendChat("設定をリセットしました。");
}



const _pop_bind = (id) => {
    if (!farmingData.bind) farmingData.bind = {};
    if (farmingData.bind[id] === undefined) {
        SendChat(`id: ${id} は登録されていません`);
        return;
    }
    delete farmingData.bind[id];
    data.save();

    SendChat(`bindを削除しました: id = ${id}`);
}

register("command", (subcommand, arg1, arg2) => {
    if (subcommand === undefined) {
        SendChat(
`§csubcommandが選択されていません
==============================
${bind_help_msg}
`
        );
    }
    else if (subcommand === "help") {
        SendChat(bind_help_msg);
    }
    else if (subcommand === "list") {
        _list_bind();
    }
    else if (subcommand === "set") {
        _bind_change(arg1, arg2);
    }
    else if (subcommand === "cnfrst") {
        _config_reset();
    }
    else if (subcommand === "pop") {
        _pop_bind(arg1);
    }
}).setName(commands.bind.name);

const _edfm = () => {
    attackKey.func_151462_b(Mouse.left);
    _config_reset();
}

register("command", (subcommand) => {
    if (subcommand === undefined) {
        SendChat(
`§csubcommandが選択されていません
==============================
${util_help_msg}
`
        );
    }
    else if (subcommand === "help") {
        SendChat(util_help_msg);
    }
    else if (subcommand === "stfm") {
        attackKey.func_151462_b(Keyboard.KEY_F);
        update_settings();
        SendChat("Fキーに攻撃をセットしました。");
    }
    else if (subcommand === "edfm") {
        _edfm();
    }
}).setName(commands.util.name);



// register("clicked", (x,y,button, isDown) => {
//     if (isDown) {
//         SendChat(`Button: ${button}`);
//     }
// });

const _help = () => {
    SendChat(
        "\n" +
        loc_help_msg +
        bind_help_msg +
        util_help_msg
    )
}

register("command", () => {
    _help();
}).setName(commands.help.name);

register("command", () => {
    _help();
}).setName(commands.base.name);

const _change_key_if_id = (id) => {
    if (!isInGarden) return;
    if (!farmingData.bind) farmingData.bind = {};
    //farmingData.bind[id]が存在するか
    if (farmingData.bind[id] === undefined) {
        return false;
    }
    else{
        // 押し終えたらキーを置き換える(そうでなければ、それまで待つ)
        // (どれか一つがtrueならreturn)
        if (!keyConfigs.every(config => !config.func_151470_d())) {
            return;
        }
        key = farmingData.bind[id];
        // 他のキーを無効に
        keyConfigs.forEach(config => config.func_151462_b(Keyboard.KEY_NONE));

        // fowardをDに設定
        keyConfigs[key].func_151462_b(Keyboard.KEY_D);
        update_settings();


        // console.log(`bindを変更しました: id = ${id}, key = ${key}`);
    }
}


const isPlayerInBox = (boxPos, playerPos,size) => {
    // console.log(JSON.stringify(size));
    if (size.dx < 0) {boxPos.x += size.dx + 1; size.dx -= size.dx * 2};
    if (size.dy < 0) {boxPos.y += size.dy + 1; size.dy -= size.dy * 2};
    if (size.dz < 0) {boxPos.z += size.dz + 1; size.dz -= size.dz * 2};
    return ((boxPos.x <= playerPos.x && boxPos.y <= playerPos.y && boxPos.z <= playerPos.z) && 
            (boxPos.x + size.dx > playerPos.x && boxPos.y + size.dy > playerPos.y && boxPos.z + size.dz > playerPos.z));
}

// オーバーレイ描画イベント
register("renderOverlay", () => {
    if (!isInGarden || !farmingData.pos) return;
    const playerPos = {x: (Player.getX()),y: (Player.getY()),z: (Player.getZ())};
    for (let id in farmingData.pos) {
        element = farmingData.pos[id];
        size = {dx: 1, dy: 1, dz: 1}
        if (id in farmingData.idcfg){
            if ("size" in farmingData.idcfg[id]){
                size = farmingData.idcfg[id].size;
            }
        }
        for (let i = 0; i < element.length; i++) {
            let pos = element[i];
            if (isPlayerInBox(deepCopyObject(pos), playerPos, deepCopyObject(size))) {
                let sound_in_pos = 'random.orb'; // 音の設定
                if (_change_key_if_id(id) === false){
                    sound_in_pos = 'note.pling'
                }
                try{
                    World.playSound(sound_in_pos, 2, 1);
                }catch(e){
                    SendChat(`§cFailed to play sound: ${sound_in_pos}`);
                }
            }
        }
    }
});

const resetKey = new KeyBind("reset keybind config", Keyboard.KEY_R,"Mi");

resetKey.registerKeyPress(() => {
    _edfm();
});