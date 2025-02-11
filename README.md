# MiFarming Mod

## How to Use

> [!note]
> このmodの導入にはChatTriggersの導入とmiの導入が必要です。

(起動構成のパス)\config\ChatTriggers\modulesにリポジトリを解凍し、配置してください

> [!note]
> このパスはゲーム内で/ct filesを実行することで開けることができます。

## Use it

|コマンド|実行結果|
|----|----|
|mifm|helpを表示します|
|mifm-help|helpを表示します|
|mifm-loc append [id] [X(optional)] [Y(optional)] [Z(optional)]|登録座標を追加します。座標を選択しない場合は現在の座標を追加します。|
|mifm-loc pop [id(optional)] [X(optional)] [Y(optional)] [Z(optional)]|登録座標を削除します。何も指定しない場合現在座標を、idのみを指定する場合そのidを持つ座標全てを対象に取ります。|
|mifm-loc list|登録座標を全て表示します|
|mifm-loc size [id] [dx] [dy] [dz]|idに該当する座標のboxサイズをdx,dy,dzに変更します。|
|mifm-bind set [id] [key]|特定のidを踏んだ時、そのkeyの動作をDに割り当てます。|
|mifm-bind pop [id]|特定のidのキー割り当て情報を削除します。|
|mifm-bind cnfrst|設定を初期化します。(w,a,s,d)に移動を割り当てます。|
|mifm-bind list|現在のキー割り当て情報を表示します。|
|mifm-util stfm|攻撃をFに設定します|
|mifm-util edfm|攻撃をマウスに割り当て、移動をWASDに割り当てます。|

|キー|実行結果|
|----|----|
|R|攻撃をマウスに割り当て、移動をWASDに割り当てます。|