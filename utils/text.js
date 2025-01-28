const meta = {
    name : "mifm",
}

export const commands = {
    base: {
        name: "mifm",
        help: []
    },
    loc: {
        name: "mifm-loc",
        help: []
    },
    bind: {
        name: "mifm-bind",
        help: []
    },
    util: {
        name: "mifm-util",
        help: []
    },
    help: {
        name: "mifm-help",
        help: []
    }
};

export const syntax_color = {
    "cmd": "§3",
    "sub": "§b",
    "arg": "§9"
}

// commands.loc.help を後から定義
commands.loc.help = [
    {
        syntax: `/${commands.loc.name} append <id> [X] [Y] [Z]`,
        description: "§a登録座標を追加します。座標を選択しない場合は現在の座標を追加します。§r"
    },
    {
        syntax: `/${commands.loc.name} pop [id] [X] [Y] [Z]`,
        description: "§a登録座標を削除します。何も指定しない場合現在座標を、idのみを指定する場合そのidを持つ座標全てを対象に取ります。§r"
    },
    {
        syntax: `/${commands.loc.name} list`,
        description: "§a登録座標を表示します。§r"
    }
];

// syntax color にcolorを付ける


// commands.bind.help を後から定義
commands.bind.help = [
    {
        syntax: `/${commands.bind.name} set <id> <key>`,
        description: "§a特定のidを踏んだ時、そのkeyの動作をDに割り当てます。§r"
    },
    {
        syntax: `/${commands.bind.name} cnfrst`,
        description: "§aバインド設定を初期化します。(w,a,s,d)に移動を割り当てます。§r"
    },
    {
        syntax: `/${commands.bind.name} list`,
        description: "§aキー情報を表示します§r"
    },
    {
        syntax: `/${commands.bind.name} pop <id>`,
        description: "§a特定のidのキー割り当て情報を削除します。§r"
    }
];

commands.util.help = [
    {
        syntax: `/${commands.util.name} stfm`,
        description: "§aFキーに破壊/攻撃を割り当てます。§r"
    },
    {
        syntax: `/${commands.util.name} edfm`,
        description: "§a設定を初期化します。(w,a,s,d)に移動を割り当て、左クリックに破壊/攻撃を割り当てます。§r"
    }
];


export const SendChat = (msg) => {
    ChatLib.chat(`&6[&e${meta.name}&r&6]&r ${msg}`);
}