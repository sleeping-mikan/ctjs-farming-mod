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
        description: "§a設定を初期化します。(w,a,s,d)に移動を割り当てます。§r"
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
