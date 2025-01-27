import { data } from "./utils/data"; // データのインポート
import { renderBoxOutline, renderFilledBox } from "../BloomCore/RenderUtils";
import { commands, syntax_color } from "./utils/text";




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
            // ChatLib.chat(`エリアの取得に成功しました: ${area}`);
            isInGarden = area === "Garden";
            if (isInGarden) {
                ChatLib.chat("Gardenを検知しました。");
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

console.log(settings);

register("renderWorld", () => {
    if (!isInGarden) return;
    if (data.pos) {
        for (let id in data.pos) {
            for (let item in data.pos[id]) {
                let x = data.pos[id][item].x;
                let y = data.pos[id][item].y;
                let z = data.pos[id][item].z;
                // 色設定
                let r = id * 47 % 256, g = 255 - (id * 61 % 256), b = id * 125 % 256, alpha = 0.5;

                // 描画
                renderFilledBox(x + 0.5, y - 0.005, z + 0.5, 1.005, 1.01, r / 255, g / 255, b / 255, alpha, true);
                renderBoxOutline(x + 0.5, y - 0.005, z + 0.5, 1.005, 1.01, r / 255, g / 255, b / 255, 1, 2, true);
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

    console.log(JSON.stringify(newPos));

    if (!data.pos) data.pos = {};
    if (!data.pos[id]) data.pos[id] = [];
    data.pos[id].push(newPos);

    console.log(JSON.stringify(data));

    data.save();
}

const append_marker = (x, y, z, id) => {
    console.log(`call append_marker(${x}, ${y}, ${z}, ${id})`);
    if (id === undefined) {
        ChatLib.chat("&c引数が不足しています。/loc append <id> [X] [Y] [Z] の形式で入力してください。");
        return;
    }
    if (x !== undefined && (y === undefined || z === undefined)) {
        ChatLib.chat("&c座標が無効です。/loc append <id> [X] [Y] [Z] の形式で入力してください。");
        return;
    }
    if (x === undefined) {
        [x, y, z] = get_player_pos();
    }
    _append_marker(x, y, z, id);

    ChatLib.chat(`現在の座標を保存しました: X = ${x}, Y = ${y}, Z = ${z}, id = ${id}`);
}

const _pop_marker = (...args) => {
    const pop_marker_by_pos = (x, y, z, _id) => {
        for (let id in data.pos) {
            element = data.pos[id];
            console.log("run" + element);
            if (_id !== undefined && id !== _id) continue;
            console.log("run2" + element);
            for (let i = 0; i < element.length; i++) {
                let marker = element[i];
                if (marker.x === x && marker.y === y && marker.z === z) {
                    ChatLib.chat(`座標を削除しました: X = ${x}, Y = ${y}, Z = ${z}, id = ${id}`);
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
            for (let id in data.pos) {
                // del_id == idなら削除
                if (id === del_id) {
                    delete data.pos[id];
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
    console.log(JSON.stringify(data));
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
        ChatLib.chat("&c引数が不足しています。/loc pop [id] [X] [Y] [Z] の形式で入力してください。");
    }
    console.log(JSON.stringify(data));
}

const list_markers = () => {
    if (!data.pos) data.pos = {};
    //中身をひとつづつ回す
    // console.dir(data.pos, {depth: null});
    console.log(JSON.stringify(data));
    for (let id in data.pos) {
        element = data.pos[id];

        for (let i = 0; i < element.length; i++) {
            let marker = element[i];
            ChatLib.chat(`id: ${id}, X: ${marker.x}, Y: ${marker.y}, Z: ${marker.z}`);
        }
    }; 
}


const loc_help_msg = (() => {
    // commands.loc.help は配列なので、forEach を使って処理
    let helpMessage = ""; // 結果を格納する文字列

    // 配列に対して forEach を使う
    commands.loc.help.forEach((value) => {
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
})()

// 座標保存コマンド
register("command", (subcommand ,arg1, arg2, arg3, arg4) => {
    if (subcommand === undefined) {
        ChatLib.chat(
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
        ChatLib.chat(help_msg);
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
        ChatLib.chat("&c引数が不足しています。/bind set <id> <w|a|s|d> の形式で入力してください。");
        return;
    }
    if (key !== "w" && key !== "a" && key !== "s" && key !== "d") {
        ChatLib.chat("&c引数が無効です。/bind set <id> <w|a|s|d> の形式で入力してください。");
        return;
    }
    // idのブロックを踏んだら発火するように記憶
    if (!data.bind) data.bind = {};
    // 進む方向に変換
    key = parse_key(key);
    //id を踏んだ時、keyの動作をDに設定
    data.bind[id] = key;

    data.save();

    ChatLib.chat(`bindを保存しました: id = ${id}, key = ${key}`);

    // keyConfigs[0].func_151462_b(Keyboard.KEY_W)
    // keyConfigs[0].func_151462_b(Keyboard.KEY_S)
    // keyConfigs[0].func_151462_b(Keyboard.KEY_A)
    // keyConfigs[0].func_151462_b(Keyboard.KEY_D)
    // eval(`keyConfigs[0].func_151462_b(Keyboard.KEY_${key})`); // キーコードを変更
    // // update keybind
    // update_settings();
}

const _list_bind = () => {
    if (!data.bind) data.bind = {};
    for (let id in data.bind) {
        let key = data.bind[id];
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
        ChatLib.chat(`id: ${id}, key: ${key}`);
    }
}

const _config_reset = () => {
    keyConfigs[0].func_151462_b(Keyboard.KEY_W);
    keyConfigs[1].func_151462_b(Keyboard.KEY_S);
    keyConfigs[2].func_151462_b(Keyboard.KEY_A);
    keyConfigs[3].func_151462_b(Keyboard.KEY_D);

    update_settings();

    ChatLib.chat("設定をリセットしました。");
}

const bind_help_msg = (() => {
    let helpMessage = "";

    commands.bind.help.forEach((value) => {
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
})()

const _pop_bind = (id) => {
    if (!data.bind) data.bind = {};
    if (data.bind[id] === undefined) {
        ChatLib.chat(`id: ${id} は登録されていません`);
        return;
    }
    delete data.bind[id];
    data.save();

    ChatLib.chat(`bindを削除しました: id = ${id}`);
}

register("command", (subcommand, arg1, arg2) => {
    if (subcommand === undefined) {
        ChatLib.chat(
`§csubcommandが選択されていません
==============================
${bind_help_msg}
`
        );
    }
    else if (subcommand === "help") {
        ChatLib.chat(bind_help_msg);
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

const _help = () => {
    ChatLib.chat(
        loc_help_msg +
        bind_help_msg
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
    if (!data.bind) data.bind = {};
    //data.bind[id]が存在するか
    if (data.bind[id] === undefined) {
        return;
    }
    else{
        // 押し終えたらキーを置き換える(そうでなければ、それまで待つ)
        // (どれか一つがtrueならreturn)
        if (!keyConfigs.every(config => !config.func_151470_d())) {
            return;
        }
        key = data.bind[id];
        // 他のキーを無効に
        keyConfigs.forEach(config => config.func_151462_b(Keyboard.KEY_NONE));

        // fowardをDに設定
        keyConfigs[key].func_151462_b(Keyboard.KEY_D);
        update_settings();


        console.log(`bindを変更しました: id = ${id}, key = ${key}`);
    }
}




// オーバーレイ描画イベント
register("renderOverlay", () => {
    if (!isInGarden || !data.pos) return;
    const sound_in_pos = 'random.orb'; // 音の設定
    const playerX = Math.floor(Player.getX());
    const playerY = Math.floor(Player.getY());
    const playerZ = Math.floor(Player.getZ());
    for (let id in data.pos) {
        element = data.pos[id];
        for (let i = 0; i < element.length; i++) {
            let pos = element[i];
            if (pos.x === playerX && pos.y === playerY && pos.z === playerZ) {
                _change_key_if_id(id);
                try{
                    World.playSound(sound_in_pos, 2, 1);
                }catch(e){
                    ChatLib.chat(`§cFailed to play sound: ${sound_in_pos}`);
                }
            }
        }
    }
});

const resetKey = new KeyBind("reset movement config", Keyboard.KEY_R,"Mi");

resetKey.registerKeyPress(() => {
    console.log("run")
    _config_reset();
});