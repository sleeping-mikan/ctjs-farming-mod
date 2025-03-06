// ここの関数をjacobtrackerから呼ぶ
import { config } from "../../../MI/utils/config.js";
import { SendChat } from "../../utils/text.js";
// cactus 0
// Carrot 1
// cocoa bean 2
// melon 3
// mushroom 4
// nether wart 5
// sugar cane 8
// wheat 9
// 392 potato
const CropToString = (crop) => {
    switch(crop){
        case 0:
            return "cactus";
        case 1:
            return "carrot";
        case 2:
            return "cocoa bean";
        case 3:
            return "melon";
        case 4:
            return "mushroom";
        case 5:
            return "nether wart";
        case 6:
            return "potato";
        case 7:
            return "pumpkin";
        case 8:
            return "sugar cane";
        case 9:
            return "wheat";
    }
}

export const alarm = (nowTimestamp, nextContestsTime, Crops) => {
    console.log(`alarm: ${nowTimestamp}, ${nextContestsTime}`);
    // アラート系設定がオフなら
    if (!config.MiFm.JacobContestAlert.enabled && !config.MiFm.JacobContestMelonAlert.enabled) {
        return;
    }
    // メロンがオンで、全体がオフ、メロンが存在しないなら
    if (config.MiFm.JacobContestMelonAlert.enabled && !config.MiFm.JacobContestAlert.enabled && !Crops.includes("melon")) {
        return;
    }
    // 次のコンテストまでの時間が15分未満ならアラーム
    if ((nextContestsTime < nowTimestamp + 900000 && nextContestsTime > nowTimestamp)) {
        const crops = config.MiFm.JacobContestMelonAlert.enabled && Crops.includes(3) ? "&k&e!i!&r&aMelon&k&e!i!&r" : "&a"+Crops.map(CropToString).join(", ")+"&r";
        // アラーム音
        try{
            World.playSound("random.levelup", 2, 0.5);
            // showTitle
            SendChat(`\n=============================================\n>> &cNext ${crops} &cContest in ${Math.floor((nextContestsTime - nowTimestamp) / 60000)}min &r<<\n=============================================`);
        }
        catch(e){
            ChatLib.chat(`§cFailed to play sound`);
            console.log(e);
        }
    }
}