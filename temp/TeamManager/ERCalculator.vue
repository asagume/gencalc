<template>
    <div class="er-calculator">
        <div>
            <label>{{ displayName('ローテーションの長さ(秒)') }}
                <input type="number" v-model="rotationLength" min="10" max="180" @change="inputOnChange">
            </label>
        </div>
        <table class="er-calculator">
            <tr>
                <th colspan="2"></th>
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="bgColorClass(index)">
                    <div class="with-tooltip">
                        <img :src="characterImgSrc(element.character)" :alt="displayName(element.character)"
                            class="character">
                        <span class="tooltip">{{ displayName(element.character) }}</span>
                    </div>
                </td>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('元素爆発') }}</th>
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="bgColorClass(index)">
                    <input type="number" v-model="element.energyCost">
                </td>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('命ノ星座') }}</th>
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="bgColorClass(index)">
                    <select v-model="element.constellation" @change="inputOnChange">
                        <option v-for="constellation in [0, 1, 2, 3, 4, 5, 6]" :key="constellation" :value="constellation">
                            {{ 'C' + constellation }}
                        </option>
                    </select>
                </td>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('武器') }}</th>
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="'weapon' + bgColorClass(index)">
                    <img :src="weaponImgSrc(element.character, element.currentWeapon)"
                        :alt="displayName(element.currentWeapon)" class="input-item">
                    <select v-model="element.weaponRefine" @change="inputOnChange">
                        <option v-for="refine in [1, 2, 3, 4, 5]" :key="refine" :value="refine">
                            {{ 'R' + refine }}
                        </option>
                    </select>
                </td>
            </tr>
            <tr class="result-row">
                <th colspan="2">{{ displayName('元素チャージ効率') }}</th>
                <td v-for="(value, index) in energyRechargeGls" :key="index" :class="bgColorClass(index)">
                    {{ value + '%' }}
                </td>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('出場時間(%)') }}</th>
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="bgColorClass(index)">
                    <input type="number" v-model="element.onField" min="0" max="100" @change="inputOnChange">
                </td>
            </tr>
            <tr class="label-row">
                <th colspan="2">{{ displayName('元素粒子') }}</th>
                <th colspan="4">{{ displayName('獲得数') }}</th>
            </tr>
            <tr v-for="(row, rowIndex) in  inputRowParticleEnemy" :key="rowIndex" :class="bgColorClass2(row)">
                <th>
                    {{ displayName('敵') }}
                </th>
                <td>{{ Math.round(row.currentValues.reduce((p, c) => p + c, 0) * 10) / 10 }}</td>
                <td v-for="columnIndex in Array.from({ length: row.currentValues.length }, (_, i) => i)" :key="columnIndex">
                    <input type="number" v-model="row.currentValues[columnIndex]" min="0">
                </td>
            </tr>
            <tr v-for="(row, rowIndex) in inputRowParticle" :key="rowIndex" :class="bgColorClass2(row)">
                <th class="with-tooltip">
                    <span>
                        <img :src="rowImgSrc1(row)" :alt="displayName(row.character)" :class="rowImgSrc1Class(row)">
                        <img :src="rowImgSrc2(row)" :alt="displayName(row.triggerName)" class="input-item">
                    </span>
                    <span class="tooltip">{{ displayName(row.character) + ' ' + displayName(triggerName(row)) }}</span>
                </th>
                <td>{{ Math.round(row.currentValues.reduce((p, c) => p + c, 0) * 10) / 10 }}</td>
                <td v-for="columnIndex in Array.from({ length: row.currentValues.length }, (_, i) => i)" :key="columnIndex">
                    <input type="number" v-model="row.currentValues[columnIndex]" min="0">
                </td>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('元素チャージ') }}</th>
                <td v-for="(value, index) in particleRecharges" :key="index" class="result">
                    {{ value }}
                </td>
            </tr>
            <tr class="label-row">
                <th colspan="2">{{ displayName('元素エネルギー') }}</th>
                <th colspan="4">{{ displayName('獲得量') }}</th>
            </tr>
            <tr v-for="(row, rowIndex) in  inputRowEnergy" :key="rowIndex" :class="bgColorClass2(row)">
                <th class="with-tooltip">
                    <span>
                        <img :src="rowImgSrc1(row)" :alt="displayName(row.character)" :class="rowImgSrc1Class(row)">
                        <img :src="rowImgSrc2(row)" :alt="displayName(row.triggerName)" class="input-item">
                    </span>
                    <span class="tooltip">{{ displayName(row.character) + ' ' + displayName(triggerName(row)) }}</span>
                </th>
                <td></td>
                <td v-for="columnIndex in Array.from({ length: row.currentValues.length }, (_, i) => i)" :key="columnIndex">
                    <input type="number" v-model="row.currentValues[columnIndex]" min="0">
                </td>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('元素爆発(回数)') }}</th>
                <td v-for="index in [0, 1, 2, 3]" :key="index" :class="bgColorClass(index)">
                    <input type="number" v-model="burstCounts[index]" min="0">
                </td>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('武器変更') }}</th>
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="bgColorClass(index)">
                    <span v-for="(weapon, weaponIndex) in element.replaceWeapons" :key="weaponIndex" class="with-tooltip">
                        <img :src="replaceWeaponImgSrc(element, weapon)" :alt="displayName(weapon)"
                            :class="'input-item' + replaceWeaponClass(element, weapon)"
                            @click="replaceWeaponOnClick(element, weapon)">
                        <span class="tooltip">{{ displayName(weapon) }}</span>
                    </span>
                </td>
            </tr>
        </table>
        <br />
        <div>
            <label>{{ displayName('戦闘の長さ(秒)') }}
                <input type="number" v-model="combatLength" min="1" @change="inputOnChange">
            </label>
            <table class="supply-from-enemy">
                <caption @click="isOpenSupplyFromEnemy = !isOpenSupplyFromEnemy">
                    {{ isOpenSupplyFromEnemy ? '-' : '+' }}
                    {{ displayName('敵') }}
                    {{ isOpenSupplyFromEnemy ? '-' : '+' }}
                </caption>
                <tr>
                    <th></th>
                    <th>{{ displayName('元素オーブ') }} </th>
                    <th>{{ displayName('元素粒子') }} </th>
                </tr>
                <tr v-for="(element, index) in supplyFromEnemy" :key="index"
                    v-show="isOpenSupplyFromEnemy || element[1] || element[2]">
                    <th>{{ displayName(element[0]) }}</th>
                    <td><input type="number" v-model="element[1]" min="0"></td>
                    <td><input type="number" v-model="element[2]" min="0"></td>
                </tr>
            </table>
        </div>
        <div class="message-area">
            <hr />
            <p v-for="(message, index) in messages" :key="index">
                <span class="character">{{ message[0] }}</span> &nbsp;
                <span>{{ message[1] }}</span>
                <br v-if="message[0] || message[1]" />
                &nbsp; {{ message[2] }}
            </p>
        </div>
        <div class="message-area">
            <hr />
            <fieldset>
                <ol>
                    <li>元素チャージ効率が変化するタイプの天賦や命ノ星座は考慮しない。
                    </li>
                    <li>天賦および命ノ星座によって獲得できる元素エネルギーを計算する際に、キャラクターの天賦レベルやステータスを参照することがある。
                        この時のキャラクターのステータス、天賦レベル、武器、聖遺物はげんかるくのセーブデータを参照する。
                        セーブデータが存在しない場合は、天賦レベルを8、武器と聖遺物はなしとして計算する。<br>
                    </li>
                </ol>
                元素粒子の獲得ルール
                <ol>
                    <li>大部分のキャラクター<br>
                        元素スキル使用時に元素粒子が発生するタイプの元素スキルは、
                        直後のアクション実行者が元素粒子を獲得する。
                    </li>
                    <li>胡桃、宵宮、神里綾人、アルハイゼン、放浪者 等<br>
                        元素スキル使用時に元素粒子が発生せず、
                        その後の通常攻撃または重撃命中時に元素粒子が発生するタイプの元素スキルは、
                        継続時間一杯攻撃した場合に発生するであろう数の元素粒子を使用者自身が獲得する。
                    </li>
                    <li>フィッシュル、鍾離、アルベド、珊瑚宮心海、八重神子 等<br>
                        存在時間の長い設置物からの攻撃命中時に元素粒子が発生するタイプの元素スキルは、
                        ローテーションまたは継続時間の間ずっと攻撃し続けた場合に発生するであろう数の元素粒子を出場時間を基準に全員に按分する。
                    </li>
                    <li>アンバー、香菱、モナ、甘雨 等<br>
                        存在時間の短い設置物からの攻撃命中または設置物が破壊された時に元素粒子が発生するタイプの元素スキルについても
                        同様に出場時間を基準に全員に按分するが、存在時間の短さから実戦との乖離が大きくなる。（妥協）
                    </li>
                    <li>雷元素共鳴が生成する元素粒子<br>
                        ローテーションの間クールタイムの5秒間隔で雷元素関連反応が起き続けた場合に発生するであろう数の元素粒子を出場時間を基準に全員に按分する。
                    </li>
                    <li>西風武器が生成する元素粒子<br>
                        使用者の出場回数および出場時間(%)、ローテーションの長さから武器効果をトリガーする回数を決定する。
                        トリガー回数はローテーションの長さを武器効果のクールタイムで割った数を超えない。<br>
                        元素粒子は基本的に使用者が獲得するが、使用者が1アクションだけで退場する場合は次のアクション実行者が獲得する。
                    </li>
                </ol>
            </fieldset>
        </div>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, PropType, reactive, ref, watch } from "vue";
import { countQ, getEnergyByCharacter, getEnergyByWeapon, getOnFieldRate, getParticleByCharacter, getParticleByCharacterExtra, getParticleByResonance, getParticleByWeapon, isRechargeKindEnergy, isRechargeKindParticle, RECHARGE_ENERGY_BURST, RECHARGE_ENERGY_CONSTELLATION, RECHARGE_ENERGY_PASSIVE, RECHARGE_ENERGY_SKILL, RECHARGE_ENERGY_WEAPON, RECHARGE_PARTICLE_CONSTELLATION, RECHARGE_PARTICLE_ENEMY, RECHARGE_PARTICLE_FAVONIUS, RECHARGE_PARTICLE_PASSIVE, RECHARGE_PARTICLE_RESONANCE, RECHARGE_PARTICLE_SKILL, TEREnergy, TERParticle } from "./energyrecharge";
import { getCharacterDetail, getCharacterMaster, getWeaponMaster, setupCharacterDetailMap, TConstellation, TTeam, TTeamMemberResult } from "./team";
import { ELEMENT_BG_COLOR_CLASS, ELEMENT_IMG_SRC, IMG_SRC_DUMMY } from "@/master";
import CompositionFunction from "@/components/CompositionFunction.vue";
import _ from "lodash";
import { getCtFromInfo, getParticleInfo } from "@/particlemaster";

type TCalculatorInput = {
    character: string,                  // キャラクター名
    energyCost: number,                 // 元素爆発 元素エネルギー 40-90
    constellation: number,              // 命ノ星座 0-6
    initialWeapon: string | undefined,  // 初期武器名
    currentWeapon: string | undefined,  // 現在武器名
    weaponRefine: number,               // 武器精錬ランク 1-5
    onField: number,                    // 出場率
    replaceWeapons: string[],           // 置き換え武器名    
}

type TCalculatorInputRow = {
    character: string,          // キャラクター名
    rechargeKind: string,       // リチャージ種別
    triggerName: string,        // アクション識別子,武器名,固有天賦名,命ノ星座
    element: string,            // 元素粒子の元素
    initialValues: number[],    // 初期値
    currentValues: number[],    // 現在値
    unit: number,               // 単位
}

export default defineComponent({
    name: "ERCalculator",
    props: {
        team: { type: Object as PropType<TTeam>, required: true },
        teamMemberResult: { type: Object as PropType<TTeamMemberResult> },
        constellations: { type: Object as PropType<TConstellation> },
    },
    setup(props) {
        const { displayName } = CompositionFunction();
        const calculatorInput = reactive([] as TCalculatorInput[]);
        const inputRowParticle = reactive([] as TCalculatorInputRow[]);
        const inputRowEnergy = reactive([] as TCalculatorInputRow[]);
        const inputRowParticleEnemy = reactive([] as TCalculatorInputRow[]);
        const messages = reactive([] as string[][]);
        const DEFAULT_ROTATION_LENGTH = 20;
        const DEFAULT_COMBAT_LENGTH = 90;
        const rotationLength = ref(DEFAULT_ROTATION_LENGTH); // ローテーション長
        const combatLength = ref(DEFAULT_COMBAT_LENGTH);   // 戦闘時間
        const supplyFromEnemy = reactive([
            ['無色', 3, 0],
            ['炎', 0, 0],
            ['水', 0, 0],
            ['雷', 0, 0],
            ['草', 0, 0],
            ['氷', 0, 0],
            ['岩', 0, 0],
        ] as [string, number, number][]);
        const isOpenSupplyFromEnemy = ref(false);
        const REPLACE_WEAPON_MAP = {
            '片手剣': ['西風剣', '天目影打'],
            '両手剣': ['西風大剣', '桂木斬長正'],
            '長柄武器': ['西風長槍', '喜多院十文字槍', '正義の報酬'],
            '弓': ['西風猟弓'],
            '法器': ['西風秘典', '金珀·試作'],
        };

        onMounted(() => {
            setupCharacterDetailMap().then(() => {
                setupInput(props.team, props.teamMemberResult);
            });
        })

        const watchCount = ref(0);
        watch(() => _.cloneDeep(props), (newVal, oldVal) => {
            updateRotationLength(newVal.team);
            if (!_.isEqual(newVal.team.members, oldVal.team.members) || !_.isEqual(newVal.teamMemberResult, oldVal.teamMemberResult)) {
                setupInput(newVal.team, newVal.teamMemberResult);
                watchCount.value++;
            } else {
                setupInputRows(newVal.team, newVal.teamMemberResult);
                watchCount.value++;
            }
        }, { deep: true })

        function getConstellation(character: string, team: TTeam, teamMemberResult?: TTeamMemberResult) {
            if (teamMemberResult) {
                const workArr = team.members.filter(member => member.name == character);
                if (workArr.length) {
                    return teamMemberResult[workArr[0].id]?.characterInput.命ノ星座 ?? (props.constellations ? props.constellations[character] ?? 0 : 0);
                }
            }
            return props.constellations ? props.constellations[character] ?? 0 : 0;
        }

        function updateRotationLength(team: TTeam) {
            const memberNameArr = team.members.map(member => member.name);
            const eLength = [0, 0, 0, 0];
            const qLength = [0, 0, 0, 0];
            if (team.rotation.length) {
                for (let i = 0; i < team.rotation.length; i++) {
                    const rotation = team.rotation[i];
                    const memberIndex = memberNameArr.indexOf(rotation.member);
                    if (memberIndex == -1) continue;
                    if (rotation.action === 'Q' || rotation.action.startsWith('E')) {
                        const characterDetail = getCharacterDetail(rotation.member);
                        if (rotation.action === 'Q') {
                            let ct = characterDetail?.元素爆発.クールタイム ?? 0;
                            if (memberNameArr.includes('重雲') && rotation.member != '重雲') {
                                const constellation = getConstellation('重雲', props.team, props.teamMemberResult);
                                if (constellation >= 2) {
                                    ct *= 0.85;
                                }
                            } else if (memberNameArr.includes('雷電将軍') && rotation.member != '雷電将軍') {
                                const constellation = getConstellation('雷電将軍', props.team, props.teamMemberResult);
                                if (constellation >= 6) {
                                    ct -= 5;
                                }
                            }
                            qLength[memberIndex] += ct;
                        } else {
                            const constellation = getConstellation(rotation.member, props.team, props.teamMemberResult);
                            const particleInfo = getParticleInfo(rotation.member, rotation.action, constellation);
                            let ct = 0;
                            if (particleInfo) {
                                ct = getCtFromInfo(particleInfo) ?? 0;
                                if (memberNameArr.includes('重雲') && rotation.member != '重雲') {
                                    const constellation = getConstellation('重雲', props.team, props.teamMemberResult);
                                    if (constellation >= 2) {
                                        ct *= 0.85;
                                    }
                                }
                            }
                            if (ct > eLength[memberIndex]) {
                                eLength[memberIndex] = ct;
                            }
                        }
                    }
                }
            }
            let newLength = Math.max(...eLength, ...qLength);
            if (newLength == 0) {
                newLength = DEFAULT_ROTATION_LENGTH;
            }
            rotationLength.value = newLength;
        }

        function updateOnFields(team: TTeam, teamMemberResult?: TTeamMemberResult) {
            const constellations = team.members.map(member => getConstellation(member.name, team, teamMemberResult));
            const onFields = getOnFieldRate(team, rotationLength.value, team.rotation, constellations);
            for (let i = 0; i < calculatorInput.length; i++) {
                calculatorInput[i].onField = onFields[i];
            }
        }

        const setupInput = (team: TTeam, teamMemberResult?: TTeamMemberResult) => {
            const newInput: TCalculatorInput[] = [];
            const constellations = team.members.map(member => getConstellation(member.name, team, teamMemberResult));
            const onFields = getOnFieldRate(team, rotationLength.value, team.rotation, constellations);
            for (let i = 0; i < team.members.length; i++) {
                const member = team.members[i];
                const characterDetail = getCharacterDetail(member.name);
                const constellation = constellations[i];
                const memberResult = teamMemberResult ? teamMemberResult[member.id] : undefined;
                const weapon = memberResult?.characterInput.weapon;
                const weaponRefine = memberResult?.characterInput.武器精錬ランク ?? 1;
                let replaceWeapons: string[] = [];
                if (characterDetail) {
                    replaceWeapons = REPLACE_WEAPON_MAP[characterDetail.武器];
                }
                newInput.push({
                    character: member.name,
                    energyCost: characterDetail?.元素爆発.元素エネルギー ?? 0,
                    constellation: constellation,
                    initialWeapon: weapon,
                    currentWeapon: weapon,
                    weaponRefine: weaponRefine,
                    onField: onFields[i],
                    replaceWeapons: replaceWeapons,
                });
            }
            calculatorInput.splice(0, calculatorInput.length, ...newInput);

            setupInputRows(team, teamMemberResult);
        }

        function pushInputRowParticle(inputRows: TCalculatorInputRow[], newMessages: string[][], character: string, particle: TERParticle) {
            const initialValues = [0, 0, 0, 0];
            for (let i = 0; i < initialValues.length; i++) {
                initialValues[i] = Math.round(Number(particle[3 + i]) * 100) / 100;
            }
            inputRows.push({
                character: character,
                rechargeKind: particle[0],
                triggerName: particle[1],
                element: particle[2],
                initialValues: initialValues,
                currentValues: _.cloneDeep(initialValues),
                unit: 1,
            })
            if (particle[7].length) {
                particle[7].forEach(message => {
                    let work = '';
                    if (particle[0] === RECHARGE_PARTICLE_SKILL) {
                        work = '元素スキル';
                    } else {
                        work = particle[1];
                    }
                    newMessages.push([character, work, message]);
                })
            }
        }
        function pushInputRowEnergy(inputRows: TCalculatorInputRow[], newMessages: string[][], character: string, energy: TEREnergy) {
            const initialValues = [0, 0, 0, 0];
            for (let i = 0; i < initialValues.length; i++) {
                initialValues[i] = Math.round(Number(energy[2 + i]) * 100) / 100;
            }
            inputRows.push({
                character: character,
                rechargeKind: energy[0],
                triggerName: energy[1],
                element: '',
                initialValues: initialValues,
                currentValues: _.cloneDeep(initialValues),
                unit: 0.1,
            })
            if (energy[6].length) {
                energy[6].forEach(message => {
                    let work = '';
                    if (energy[0] === RECHARGE_ENERGY_SKILL) {
                        work = '元素スキル';
                    } else if (energy[0] === RECHARGE_ENERGY_BURST) {
                        work = '元素爆発';
                    } else if (energy[0] === RECHARGE_ENERGY_CONSTELLATION) {
                        if (energy[1]) {
                            work = 'C' + energy[1];
                        }
                    } else {
                        work = energy[1];
                    }
                    newMessages.push([character, work, message]);
                })
            }
        }

        const setupInputRows = (team: TTeam, teamMemberResult?: TTeamMemberResult) => {
            updateOnFields(team, teamMemberResult);
            const newInputRowPacticle1: TCalculatorInputRow[] = [];
            const newInputRowPacticle2: TCalculatorInputRow[] = [];
            const newInputRowEnergy: TCalculatorInputRow[] = [];
            const newInputRowResonance: TCalculatorInputRow[] = [];
            const newinputRowParticleEnemy: TCalculatorInputRow[] = [];
            const newMessages: string[][] = [];
            const onFields = calculatorInput.map(s => s.onField);
            for (let i = 0; i < calculatorInput.length; i++) {
                const character = calculatorInput[i].character;
                const constellation = calculatorInput[i].constellation;
                const weapon = calculatorInput[i].currentWeapon;
                const weaponRefine = calculatorInput[i].weaponRefine;
                // キャラクターの元素粒子
                [
                    getParticleByCharacter(character, constellation, team, rotationLength.value, team.rotation, onFields),
                    getParticleByCharacterExtra(character, constellation, team, rotationLength.value, team.rotation, onFields),
                ].forEach(result => {
                    if (result) {
                        result.forEach(entry => {
                            pushInputRowParticle(newInputRowPacticle1, newMessages, character, entry);
                        })
                    }
                })
                // キャラクターの元素エネルギー
                const energyByCharacter = getEnergyByCharacter(character, constellation, team, rotationLength.value, team.rotation, teamMemberResult);
                energyByCharacter.forEach(entry => {
                    pushInputRowEnergy(newInputRowEnergy, newMessages, character, entry);
                })
                // 武器
                if (weapon) {
                    // 西風武器の元素粒子
                    const particleByWeapon = getParticleByWeapon(character, weapon, weaponRefine, team, rotationLength.value, team.rotation, onFields);
                    if (particleByWeapon) {
                        pushInputRowParticle(newInputRowPacticle2, newMessages, character, particleByWeapon);
                    }
                    // 武器の元素エネルギー
                    const energyByWeapon = getEnergyByWeapon(character, weapon, weaponRefine, team, rotationLength.value, team.rotation);
                    if (energyByWeapon) {
                        pushInputRowEnergy(newInputRowEnergy, newMessages, character, energyByWeapon);
                    }
                }
            }
            // 元素共鳴の元素粒子
            const particleByResonance = getParticleByResonance(team, rotationLength.value, team.rotation, onFields);
            if (particleByResonance) {
                pushInputRowParticle(newInputRowResonance, newMessages, '', particleByResonance);
            }
            // 敵の元素粒子
            supplyFromEnemy.filter(s => s[1] || s[2]).forEach(entry => {
                const sum = entry[1] * 3 + entry[2]; // 元素オーブは元素粒子3個に相当
                const initialValues = [0, 0, 0, 0];
                for (let i = 0; i < onFields.length; i++) {
                    initialValues[i] = rotationLength.value / combatLength.value * sum * onFields[i] / 100;
                }
                pushInputRowParticle(newinputRowParticleEnemy, newMessages, '', [
                    RECHARGE_PARTICLE_ENEMY, '', entry[0], initialValues[0], initialValues[1], initialValues[2], initialValues[3], []
                ]);
            })
            inputRowParticle.splice(0, inputRowParticle.length, ...newInputRowPacticle1, ...newInputRowPacticle2, ...newInputRowResonance);
            inputRowEnergy.splice(0, inputRowEnergy.length, ...newInputRowEnergy);
            inputRowParticleEnemy.splice(0, inputRowParticleEnemy.length, ...newinputRowParticleEnemy);
            messages.splice(0, messages.length, ...newMessages);
        }

        /** 元素爆発(回数) */
        const burstCounts = computed(() => {
            const result: { [key: number]: number } = { 0: 1, 1: 1, 2: 1, 3: 1 };
            if (props.team.rotation?.length) {
                for (let i = 0; i < props.team.members.length; i++) {
                    const member = props.team.members[i];
                    if (member.name) {
                        result[i] = countQ(member.name, props.team.rotation);
                    }
                }
            }
            return result;
        })

        /** 元素粒子による獲得元素エネルギー量(元素チャージ効率未反映) */
        const particleRecharges = computed(() => {
            const result: number[] = [0, 0, 0, 0];
            for (let i = 0; i < props.team.members.length; i++) {
                const member = props.team.members[i];
                if (!member.name) continue;
                const characterMaster = getCharacterMaster(member.name);
                const myElement = characterMaster?.元素;
                if (!myElement) continue;
                [inputRowParticle, inputRowParticleEnemy].forEach(input => {
                    input.filter(s => isRechargeKindParticle(s.rechargeKind)).forEach(entry => {
                        let energy = 0;
                        for (let j = 0; j < entry.currentValues.length; j++) {
                            if (j == i) {
                                energy += entry.currentValues[j];
                            } else {
                                energy += entry.currentValues[j] * 0.6;
                            }
                        }
                        if (entry.element == myElement) {
                            energy *= 3;
                        } else if (entry.element == '無色') {
                            energy *= 2;
                        }
                        result[i] = Math.round((result[i] + energy) * 10) / 10;
                    })
                })
            }
            return result;
        })

        /** 元素チャージ効率の目安 */
        const energyRechargeGls = computed(() => {
            const result = [100, 100, 100, 100];
            for (let i = 0; i < props.team.members.length; i++) {
                if (!props.team.members[i].name) continue;
                let energyCost = calculatorInput[i]?.energyCost;
                if (!energyCost) continue;
                inputRowEnergy.filter(s => isRechargeKindEnergy(s.rechargeKind)).forEach(entry => {
                    energyCost -= entry.currentValues[i];
                })
                const burstCount = burstCounts.value[i] > 0 ? burstCounts.value[i] : 1;
                const particleEnergy = particleRecharges.value[i] / burstCount;
                if (energyCost > 0 && particleEnergy > 0) {
                    const er = Math.ceil(energyCost * 100 / particleEnergy);
                    result[i] = Math.max(100, er);
                }
            }
            return result;
        })

        const characterImgSrc = (character: string) => getCharacterMaster(character)?.icon_url ?? IMG_SRC_DUMMY;
        const weaponImgSrc = (character: string, weapon?: string) => {
            const characterMater = getCharacterMaster(character);
            return weapon ? characterMater ? getWeaponMaster(characterMater.武器, weapon)?.icon_url ?? IMG_SRC_DUMMY : IMG_SRC_DUMMY : IMG_SRC_DUMMY;
        }
        const replaceWeaponImgSrc = (input: TCalculatorInput, weapon: string) => {
            let result = IMG_SRC_DUMMY;
            if (input.character && input.replaceWeapons.length && input.replaceWeapons.includes(weapon)) {
                const characterMaster = getCharacterMaster(input.character);
                if (characterMaster) {
                    result = getWeaponMaster(characterMaster.武器, weapon)?.icon_url ?? IMG_SRC_DUMMY;
                }
            }
            return result;
        }
        const rowImgSrc1 = (row: TCalculatorInputRow) => {
            let result = IMG_SRC_DUMMY;
            if (row.rechargeKind) {
                if ([RECHARGE_PARTICLE_RESONANCE].includes(row.rechargeKind)) { // 元素共鳴
                    result = (ELEMENT_IMG_SRC as any)[row.element] ?? IMG_SRC_DUMMY
                } else {
                    result = getCharacterMaster(row.character)?.icon_url ?? IMG_SRC_DUMMY;
                }
            }
            return result;
        }
        const rowImgSrc1Class = (row: TCalculatorInputRow) =>
            (row.rechargeKind && row.rechargeKind == RECHARGE_PARTICLE_RESONANCE) ? 'input-item' : 'input-item-character';
        const rowImgSrc2 = (row: TCalculatorInputRow) => {
            let result = IMG_SRC_DUMMY;
            if (row.rechargeKind) {
                if ([RECHARGE_PARTICLE_RESONANCE].includes(row.rechargeKind)) { // 元素共鳴
                    result = (ELEMENT_IMG_SRC as any)[row.element] ?? IMG_SRC_DUMMY
                } else if ([RECHARGE_ENERGY_SKILL, RECHARGE_PARTICLE_SKILL].includes(row.rechargeKind)) { // 元素スキル
                    const characterDetail = getCharacterDetail(row.character);
                    result = characterDetail?.元素スキル.icon_url ?? IMG_SRC_DUMMY;
                } else if ([RECHARGE_ENERGY_BURST].includes(row.rechargeKind)) { // 元素爆発
                    const characterDetail = getCharacterDetail(row.character);
                    result = characterDetail?.元素爆発.icon_url ?? IMG_SRC_DUMMY;
                } else if ([RECHARGE_ENERGY_CONSTELLATION, RECHARGE_PARTICLE_CONSTELLATION].includes(row.rechargeKind)) { // 命ノ星座
                    const characterDetail = getCharacterDetail(row.character);
                    const constellationObj = characterDetail?.命ノ星座[row.triggerName];
                    result = constellationObj?.icon_url ?? IMG_SRC_DUMMY;
                } else if ([RECHARGE_PARTICLE_FAVONIUS, RECHARGE_ENERGY_WEAPON].includes(row.rechargeKind) && row.triggerName) { // 武器
                    const characterMater = getCharacterMaster(row.character);
                    if (characterMater) {
                        const weaponType = characterMater.武器;
                        const weaponMaster = getWeaponMaster(weaponType, row.triggerName);
                        if (weaponMaster) {
                            result = weaponMaster.icon_url;
                        }
                    }
                }
            }
            return result;
        }
        const bgColorClass = (index: number) => {
            const master = index < props.team.members.length ? getCharacterMaster(props.team.members[index].name) : undefined;
            return ' ' + (master ? (ELEMENT_BG_COLOR_CLASS as any)[master.元素] : 'white');
        }
        const bgColorClass2 = (row: TCalculatorInputRow) =>
            ' ' + (row.element ? (ELEMENT_BG_COLOR_CLASS as any)[row.element] : 'white');
        const replaceWeaponClass = (input: TCalculatorInput, weapon: string) =>
            input.currentWeapon == weapon ? ' disabled' : '';
        const triggerName = (row: TCalculatorInputRow) => {
            let result = '';
            if (row.rechargeKind) {
                if ([RECHARGE_ENERGY_SKILL, RECHARGE_PARTICLE_SKILL].includes(row.rechargeKind)) {
                    result = row.triggerName;
                } else if ([RECHARGE_ENERGY_BURST].includes(row.rechargeKind)) {
                    result = row.triggerName;
                } else if ([RECHARGE_ENERGY_PASSIVE, RECHARGE_PARTICLE_PASSIVE].includes(row.rechargeKind)) {
                    result = '固有天賦';
                } else if ([RECHARGE_ENERGY_CONSTELLATION, RECHARGE_PARTICLE_CONSTELLATION].includes(row.rechargeKind)) {
                    result = '命ノ星座 第' + row.triggerName + '重';
                } else if ([RECHARGE_ENERGY_WEAPON, RECHARGE_PARTICLE_FAVONIUS].includes(row.rechargeKind)) {
                    result = row.triggerName;
                } else if ([RECHARGE_PARTICLE_RESONANCE].includes(row.rechargeKind)) {
                    result = row.triggerName;
                }
            }
            return result;
        }

        const inputOnChange = () => {
            setupInputRows(props.team, props.teamMemberResult);
        }

        const replaceWeaponOnClick = (input: TCalculatorInput, weapon: string) => {
            if (input.replaceWeapons.length && input.replaceWeapons.includes(weapon)) {
                if (input.currentWeapon == weapon) {
                    input.currentWeapon = input.initialWeapon;
                } else {
                    input.currentWeapon = weapon;
                }
                inputOnChange();
            }
        }

        const resetInput = () => {
            inputRowParticleEnemy.forEach(inputRow => {
                inputRow.currentValues.splice(0, inputRow.currentValues.length, ...inputRow.initialValues);
            })
            inputRowParticle.forEach(inputRow => {
                inputRow.currentValues.splice(0, inputRow.currentValues.length, ...inputRow.initialValues);
            })
            inputRowEnergy.forEach(inputRow => {
                inputRow.currentValues.splice(0, inputRow.currentValues.length, ...inputRow.initialValues);
            })
        }

        return {
            displayName,

            rotationLength,
            combatLength,
            supplyFromEnemy,
            isOpenSupplyFromEnemy,
            calculatorInput,
            inputRowParticle,
            inputRowEnergy,
            inputRowParticleEnemy,
            burstCounts,
            messages,
            characterImgSrc,
            weaponImgSrc,
            replaceWeaponImgSrc,
            rowImgSrc1,
            rowImgSrc1Class,
            rowImgSrc2,
            bgColorClass,
            bgColorClass2,
            replaceWeaponClass,
            particleRecharges,
            energyRechargeGls,
            triggerName,

            inputOnChange,
            replaceWeaponOnClick,
            resetInput,
        }
    }
});
</script>
<style scoped>
table {
    margin: 5px auto;
    background-color: white;
    color: black;
    border: double 4px white;
    border-spacing: 0;
    vertical-align: middle;
}

caption {
    vertical-align: middle;
    background-color: white;
    padding: 4px;
}

tr,
th,
td {
    border: solid 1px gray;
}

th,
td {
    min-width: 35px;
    height: 22px;
}

th {
    font-size: 1.6rem;
    font-weight: bold;
    padding: 0;
    white-space: nowrap;
}

input[type="number"] {
    margin-left: auto;
    margin-right: auto;
    padding: 0 0 0 4px;
    max-width: 15rem;
}

td select,
td input[type="number"] {
    width: calc(100% - 4px);
    text-align: center;
    padding-block: 0;
    padding-inline: 0;
    border: none;
    background-color: transparent;
}

img.character {
    width: 60px;
    height: 45px;
    object-position: top;
    object-fit: cover;
}

img.input-item-character {
    width: 30px;
    height: 22px;
    object-position: top;
    object-fit: cover;
}

img.input-item {
    width: 20px;
    height: 20px;
}

img.disabled {
    opacity: 0.3;
    background-color: black;
    border-radius: 5px;
}

.white {
    background-color: whitesmoke;
}

tr.label-row {
    background-color: silver;
}

tr.result-row th,
tr.result-row td {
    border-top: 2px solid yellow;
    border-bottom: 2px solid yellow;
    font-weight: bold;
}

td.weapon {
    position: relative;
}

td.weapon img.input-item {
    border: none;
    position: absolute;
    left: 0;
    top: 0;
}

caption {
    padding-top: 2px;
    padding-bottom: 0;
}

ol {
    padding-left: 4rem;
}

div.message-area {
    margin-left: auto;
    margin-right: auto;
    padding-left: 1rem;
    padding-right: 1rem;
    max-width: 120rem;
    text-align: left;
}

span.character {
    font-weight: bold;
    color: yellow;
}
</style>