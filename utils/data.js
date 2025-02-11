import PogObject from "../../PogData";


export const profile = new PogObject("MI", {
    profile: "main"
},".profile.json")

export const data = new PogObject("MI", {
    pos: {}
},`${profile.profile === "main" ? "" : profile.profile}.data.json`)

