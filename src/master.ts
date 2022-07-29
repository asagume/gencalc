import CHARACTER_MASTER from '../data/CharacterMaster.json' assert {type: 'json'}

import SWORD_MASTER from '../data/SwordMaster.json' assert {type: 'json'}
import CLAYMORE_MASTER from '../data/ClaymoreMaster.json' assert {type: 'json'}
import POLEARM_MASTER from '../data/PolearmMaster.json' assert {type: 'json'}
import BOW_MASTER from '../data/BowMaster.json' assert {type: 'json'}
import CATALYST_MASTER from '../data/CatalystMaster.json' assert {type: 'json'}

import ARTIFACT_SET_MASTER from '../data/ArtifactSetMaster.json' assert {type: 'json'}
import ARTIFACT_MAIN_MASTER from '../data/ArtifactMainMaster.json' assert {type: 'json'}
import ARTIFACT_SUB_MASTER from '../data/ArtifactSubMaster.json' assert {type: 'json'}

import ENEMY_MASTER from '../data/EnemyMaster.json' assert {type: 'json'}

import ELEMENTAL_RESONANCE_MASTER from '../data/ElementalResonanceMaster.json' assert {type: 'json'}
import TEAM_OPTION_MASTER from '../data/TeamOptionMaster.json' assert {type: 'json'}
import OPTION1_MASTER from '../data/OptionMaster1.json' assert {type: 'json'}
import OPTION2_MASTER from '../data/OptionMaster2.json' assert {type: 'json'}

import ELEMENTAL_REACTION_MASTER from '../data/ElementalReactionMaster.json' assert {type: 'json'}

import HOYO_DICTIONARY2 from '../data/HoYoDictionary2.json' assert {type: 'json'}
import HOYO_DICTIONARY4 from '../data/HoYoDictionary4.json' assert {type: 'json'}
import HOYO_DICTIONARY5 from '../data/HoYoDictionary5.json' assert {type: 'json'}
import LOCAL_DICTIONARY from '../data/LocalDictionary.json' assert {type: 'json'}

interface ICharacter {
    [key: string]: number | string,
}
interface ICharacterEntry extends ICharacter {
    key: string,
}
const CHARACTER_MASTER_KEYLIST = [] as Array<string>;
const CHARACTER_MASTER_LIST = [] as Array<ICharacterEntry>;
(Object.keys(CHARACTER_MASTER) as (keyof typeof CHARACTER_MASTER)[]).forEach(key => {
    CHARACTER_MASTER_KEYLIST.push(key);
    CHARACTER_MASTER_LIST.push({ key: key, ...CHARACTER_MASTER[key] });
});

interface IWeapon {
    [key: string]: number | string,
}
interface IWeaponEntry extends IWeapon {
    key: string,
}
const WEAPON_MASTER = {
    片手剣: SWORD_MASTER,
    両手剣: CLAYMORE_MASTER,
    長柄武器: POLEARM_MASTER,
    弓: BOW_MASTER,
    法器: CATALYST_MASTER,
};
const WEAPON_MASTER_KEYLIST = {
    片手剣: [] as Array<string>,
    両手剣: [] as Array<string>,
    長柄武器: [] as Array<string>,
    弓: [] as Array<string>,
    法器: [] as Array<string>,
};
const WEAPON_MASTER_LIST = {
    片手剣: [] as Array<IWeaponEntry>,
    両手剣: [] as Array<IWeaponEntry>,
    長柄武器: [] as Array<IWeaponEntry>,
    弓: [] as Array<IWeaponEntry>,
    法器: [] as Array<IWeaponEntry>,
};
(Object.keys(WEAPON_MASTER) as (keyof typeof WEAPON_MASTER)[]).forEach(weaponType => {
    const myTypeWeapon = WEAPON_MASTER[weaponType];
    (Object.keys(myTypeWeapon) as (keyof typeof myTypeWeapon)[]).forEach(key => {
        const myWeapon = myTypeWeapon[key] as IWeapon;
        WEAPON_MASTER_KEYLIST[weaponType].push(key);
        WEAPON_MASTER_LIST[weaponType].push({ key: key, ...myWeapon });
    })
});

interface IArtifactSet {
    [key: string]: number | string | object
}
interface IArtifactSetEntry extends IArtifactSet{
    key: string
}
const ARTIFACT_SET_MASTER_KEYLIST = [] as Array<string>;
const ARTIFACT_SET_MASTER_LIST = [] as Array<IArtifactSetEntry>;
(Object.keys(ARTIFACT_SET_MASTER) as (keyof typeof ARTIFACT_SET_MASTER)[]).forEach(key => {
    ARTIFACT_SET_MASTER_KEYLIST.push(key);
    ARTIFACT_SET_MASTER_LIST.push({ key: key, ...ARTIFACT_SET_MASTER[key]});
});

const ARTIFACT_MAIN_MASTER_KEYLIST = [] as Array<string>;
(Object.keys(ARTIFACT_MAIN_MASTER) as (keyof typeof ARTIFACT_MAIN_MASTER)[]).forEach(key => {
    ARTIFACT_MAIN_MASTER_KEYLIST.push(key);
});


const DICTIONARY_MASTER: { [key: string]: any } = {};
[HOYO_DICTIONARY2, HOYO_DICTIONARY4, HOYO_DICTIONARY5, LOCAL_DICTIONARY].forEach(dict => {
    (Object.keys(dict) as (keyof typeof dict)[]).forEach(key => {
        DICTIONARY_MASTER[key] = dict[key];
    })
});

export {
    CHARACTER_MASTER,
    CHARACTER_MASTER_KEYLIST,
    CHARACTER_MASTER_LIST,
    WEAPON_MASTER,
    WEAPON_MASTER_KEYLIST,
    WEAPON_MASTER_LIST,
    ARTIFACT_SET_MASTER,
    ARTIFACT_MAIN_MASTER,
    ARTIFACT_SUB_MASTER,
    ENEMY_MASTER,
    ELEMENTAL_RESONANCE_MASTER,
    TEAM_OPTION_MASTER,
    OPTION1_MASTER,
    OPTION2_MASTER,
    ELEMENTAL_REACTION_MASTER
};
