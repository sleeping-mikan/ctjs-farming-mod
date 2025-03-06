import { config } from "../../../MI/utils/config.js";
import { hud } from "../../../MI/gui";
import { getMikanGraphics } from "../../../MiGui/ObjectMove";
import { gui } from "../../../MI/gui";
import { alarm } from "../jacobalarm/feature";

const END_POINT = "https://jacobs.strassburger.dev/api/jacobcontests"

function get(path, callback) {
    var Runnable = Java.type("java.lang.Runnable");
    var Thread = Java.type("java.lang.Thread");

    var task = new Runnable({
        run: function() {
            try {
                var URL = Java.type("java.net.URL");
                var BufferedReader = Java.type("java.io.BufferedReader");
                var InputStreamReader = Java.type("java.io.InputStreamReader");
                var StringBuilder = Java.type("java.lang.StringBuilder");

                var url = new URL(END_POINT + path);
                var connection = url.openConnection();
                connection.setRequestMethod("GET");

                var reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                var response = new StringBuilder();
                var line;

                while ((line = reader.readLine()) !== null) {
                    response.append(line);
                }
                reader.close();

                var result = JSON.parse(response.toString());
                callback(null, result);
            } catch (error) {
                callback(error, null);
            }
        }
    });

    new Thread(task).start(); // 別スレッドで実行
}

const nextContests = [];
let isSearched = false;
let isFirstDrew = false;
register("step", () => {
    const minutes = new Date().getUTCMinutes();
    
    if (minutes % 10 === 0 && !isSearched || !isFirstDrew) {
        get("", (error, data) => {
            if (error) {
                console.error("Fetch error:", error);
                return;
            }
            isSearched = true;
            isFirstDrew = true;
            // 描写にセット
            nextContests.splice(0, nextContests.length);
            nextContests.push(...data);
            // 必要に応じてalarmを呼び出す
            const nowUTC = new Date();
            alarm(nowUTC.getTime(), nextContests[0].timestamp, nextContests[0].crops);
        });
    }else if(minutes % 10 !== 0 && isSearched){
        isSearched = false;
    }
}).setFps(0.5);

// cactus 0
// Carrot 1
// cocoa bean 2
// melon 3
// mushroom 4
// nether wart 5
// sugar cane 8
// wheat 9
// 392 potato

// 最後尾はnull
const cropToId = [81,391,357,360,40,372,392,86,338,296, 4];
const itemSpace = 20;
const baseHudSize = [100, 60];
const jacobTrackerHud = getMikanGraphics(config.MiFm.JacobContestTracker.offsetX, config.MiFm.JacobContestTracker.offsetY, baseHudSize[0], baseHudSize[1], 
() => {
    if (!config.MiFm.JacobContestTracker.enabled) {
        return;
    }
    let ContestsCount = 0;
    const maxContests = config.MiFm.JacobContestTracker.maxContests? config.MiFm.JacobContestTracker.maxContests: 3;
    const scale = config.MiFm.JacobContestTracker.scale;
    // 描写
    const x = config.MiFm.JacobContestTracker.offsetX;
    const y = config.MiFm.JacobContestTracker.offsetY;
    jacobTrackerHud.setScale(config.MiFm.JacobContestTracker.scale);
    // 画面に描写を行う
    if (nextContests.length === 0) {
        //nullで埋める
        for (let i = 0 ; i < 10 ; i++) nextContests.push({crops: [10,10,10]});
    }

    // 画面にコンテストを描写
    let nowPlaceOffsetY = 0;
    
    const text = [
        new Text("Next  ").setScale(1).setShadow(true).setAlign("CENTER").setColor(Renderer.color(255, 255, 220)),
        new Text("Second").setScale(1).setShadow(true).setAlign("CENTER").setColor(Renderer.color(255, 255, 220)),
        new Text("Third ").setScale(1).setShadow(true).setAlign("CENTER").setColor(Renderer.color(255, 255, 220)),
    ]
    let i = 0;
    nextContests.map((contest) => {
        
        if (gui.isOpenGui()) return;
        if (ContestsCount >= maxContests) return;
        text[i].draw(x + 20, y + nowPlaceOffsetY + 5);
        ++i;
        let nowPlaceOffsetX = 20;
        // contestを分解
        const crops = contest.crops;

        // cropsを画像に変換
        const images = [];
        crops.map((crop) => {
            try{
                images.push(new Item(cropToId[crop]));
            }
            catch(e){
            }
        });


        images.map((image) => {
            nowPlaceOffsetX += itemSpace;
            image.draw(x + nowPlaceOffsetX, y + nowPlaceOffsetY, scale, 0)
        });

        nowPlaceOffsetY += itemSpace;
        ContestsCount++;

        if (hud.getMode() === "moving") {
            const opacity = 0.5;
            const color = Renderer.color(0, 0, 0, 200);
            // 線で操作範囲を明示化
            Renderer.drawLine(color,x                 ,y                 ,x + baseHudSize[0],y                 ,opacity);
            Renderer.drawLine(color,x + baseHudSize[0],y                 ,x + baseHudSize[0],y + baseHudSize[1],opacity);
            Renderer.drawLine(color,x + baseHudSize[0],y + baseHudSize[1],x                 ,y + baseHudSize[1],opacity);
            Renderer.drawLine(color,x                 ,y + baseHudSize[1],x                 ,y                 ,opacity);
        }
    })
}, 
(dx, dy, x, y, xOnGui, yOnGui) => {
    config.MiFm.JacobContestTracker.offsetX += dx;
    config.MiFm.JacobContestTracker.offsetY += dy;
    jacobTrackerHud.setPosition(config.MiFm.JacobContestTracker.offsetX, config.MiFm.JacobContestTracker.offsetY);
    config.save();
});

hud.appendObj(jacobTrackerHud);