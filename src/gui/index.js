import { gui, hud } from '../../../MI/gui/index.js'
import { config } from '../../../MI/utils/config.js'
import { getGUIInstance } from '../../../MiGui/index.js';
import { SendChat } from '../../utils/text.js';


const configGen = () => {
    if (config.MiFm === undefined) config.MiFm = {};

    // Jacob Contest Tracker
    if (config.MiFm.JacobContestTracker === undefined) config.MiFm.JacobContestTracker = {};
    if (config.MiFm.JacobContestTracker.enabled === undefined) config.MiFm.JacobContestTracker.enabled = true;
    if (config.MiFm.JacobContestTracker.scale === undefined) config.MiFm.JacobContestTracker.scale = 1.0;
    if (config.MiFm.JacobContestTracker.offsetX === undefined) {config.MiFm.JacobContestTracker.offsetX = 0.0;}
    if (config.MiFm.JacobContestTracker.offsetY === undefined) config.MiFm.JacobContestTracker.offsetY = 0.0;

    // Jacob Contest Alert
    if (config.MiFm.JacobContestAlert === undefined) config.MiFm.JacobContestAlert = {};
    if (config.MiFm.JacobContestAlert.enabled === undefined) config.MiFm.JacobContestAlert.enabled = false;

    // Jacob Contest Melon Alert
    if (config.MiFm.JacobContestMelonAlert === undefined) config.MiFm.JacobContestMelonAlert = {};
    if (config.MiFm.JacobContestMelonAlert.enabled === undefined) config.MiFm.JacobContestMelonAlert.enabled = false;

    config.save();
    console.log(JSON.stringify(config));
}

configGen();

gui.appendCategory("MiFm");

gui.appendItemWithSwitch("MiFm", "Jacob Contest Tracker", config.MiFm.JacobContestTracker.enabled, (isOn) => {
    // ボタンを押したことの確認
    config.MiFm.JacobContestTracker.enabled = isOn;
    config.save();
});

gui.appendItemWithSwitch("MiFm", "Jacob Contest Alert", config.MiFm.JacobContestAlert.enabled, (isOn) => {
    config.MiFm.JacobContestAlert.enabled = isOn;
    config.save();
});

gui.appendItemWithSwitch("MiFm", "Jacob Contest Melon Alert", config.MiFm.JacobContestMelonAlert.enabled, (isOn) => {
    config.MiFm.JacobContestMelonAlert.enabled = isOn;
    config.save();
});

// console.log(JSON.stringify(gui.categoryItems));