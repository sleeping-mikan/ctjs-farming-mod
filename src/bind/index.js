
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
export const _bind_change = (id, cmd) => {
    if (cmd === undefined || cmd.length === 0) {
        SendChat("&c引数が不足しています。/bind set <id> <w|a|s|d> の形式で入力してください。");
        return;
    }
    if (cmd !== "w" && cmd !== "a" && cmd !== "s" && cmd !== "d" && !cmd[0].startsWith("/")) {
        SendChat("&c引数が無効です。/bind set <id> <w|a|s|d> の形式で入力してください。");
        return;
    }
    // idのブロックを踏んだら発火するように記憶
    if (!farmingData.bind) farmingData.bind = {};
    if (!cmd[0].startsWith("/")){
        // 進む方向に変換
        cmd = parse_key(cmd[0]);
        //id を踏んだ時、keyの動作をDに設定
        farmingData.bind[id] = cmd;
    }
    else{
        const command = cmd;
        farmingData.bind[id] = command.join(" ");
    }

    data.save();

    SendChat(`bindを保存しました: id = ${id}, key = ${cmd}`);

    // keyConfigs[0].func_151462_b(Keyboard.KEY_W)
    // keyConfigs[0].func_151462_b(Keyboard.KEY_S)
    // keyConfigs[0].func_151462_b(Keyboard.KEY_A)
    // keyConfigs[0].func_151462_b(Keyboard.KEY_D)
    // eval(`keyConfigs[0].func_151462_b(Keyboard.KEY_${key})`); // キーコードを変更
    // // update keybind
    // update_settings();
}

export const _list_bind = () => {
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





export const _pop_bind = (id) => {
    if (!farmingData.bind) farmingData.bind = {};
    if (farmingData.bind[id] === undefined) {
        SendChat(`id: ${id} は登録されていません`);
        return;
    }
    delete farmingData.bind[id];
    data.save();

    SendChat(`bindを削除しました: id = ${id}`);
}