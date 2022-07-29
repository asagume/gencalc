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

const WEAPON_MASTER = {
    片手剣: SWORD_MASTER,
    両手剣: CLAYMORE_MASTER,
    長柄武器: POLEARM_MASTER,
    弓: BOW_MASTER,
    法器: CATALYST_MASTER,
};

const DICTIONARY_MASTER: { [key: string]: any } = {};
[HOYO_DICTIONARY2, HOYO_DICTIONARY4, HOYO_DICTIONARY5, LOCAL_DICTIONARY].forEach(dict => {
    (Object.keys(dict) as (keyof typeof dict)[]).forEach(key => {
        DICTIONARY_MASTER.set(key, dict[key]);
    })
});

export {
    CHARACTER_MASTER,
    WEAPON_MASTER,
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
