<template>
    <div class="er-calculator">
        <div>
            <p>実験中<br />
                うまく仕上げられなければ消えます
            </p>
        </div>
        <div>
            <label>ROTATION LENGTH
                <input type="number" v-model="rotationLength" min="10" max="180" @change="inputOnChange">
            </label>
        </div>
        <br />
        <table class="er-calculator">
            <tr>
                <th colspan="2"></th>
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="bgColorClass(index)">
                    <img :src="characterImgSrc(element.character)" :alt="element.character" class="character">
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
                    <img :src="weaponImgSrc(element.character, element.weapon)" :alt="element.weapon" class="input-item">
                    <select v-model="element.weaponRefine" @change="inputOnChange">
                        <option v-for="refine in [1, 2, 3, 4, 5]" :key="refine" :value="refine">
                            {{ 'R' + refine }}
                        </option>
                    </select>
                </td>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('元素チャージ効率') }}</th>
                <td v-for="(value, index) in energyRechargeGls" :key="index" :class="bgColorClass(index)">
                    {{ value + '%' }}
                </td>
            </tr>
            <tr class="label-row">
                <th colspan="6"></th>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('出場時間(%)') }}</th>
                <td v-for="(element, index) in  calculatorInput" :key="index" :class="bgColorClass(index)">
                    <input type="number" v-model="element.onField" min="0" max="100" @change="inputOnChange">
                </td>
            </tr>
            <tr class="label-row">
                <th>元素粒子</th>
                <th>{{ displayName('生成数') }}</th>
                <th colspan="4">{{ displayName('拾得数') }}</th>
            </tr>
            <tr v-for="(row, rowIndex) in  inputRowParticleEnemy" :key="rowIndex" :class="bgColorClass2(row)">
                <th>
                    {{ displayName('敵') }}
                </th>
                <td>{{ Math.round(row.currents.reduce((p, c) => p + c, 0) * 10) / 10 }}</td>
                <td v-for="columnIndex in Array.from({ length: row.currents.length }, (_, i) => i)" :key="columnIndex">
                    <input type="number" v-model="row.currents[columnIndex]" min="0">
                </td>
            </tr>
            <tr v-for="(row, rowIndex) in inputRowParticle" :key="rowIndex" :class="bgColorClass2(row)">
                <th>
                    <img :src="rowImgSrc1(row)" :alt="row.character" :class="rowImgSrc1Class(row)">
                    <img :src="rowImgSrc2(row)" :alt="row.category3" class="input-item">
                </th>
                <td>{{ Math.round(row.currents.reduce((p, c) => p + c, 0) * 10) / 10 }}</td>
                <td v-for="columnIndex in Array.from({ length: row.currents.length }, (_, i) => i)" :key="columnIndex">
                    <input type="number" v-model="row.currents[columnIndex]" min="0">
                </td>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('元素チャージ') }}</th>
                <td v-for="(value, index) in particleRecharges" :key="index" class="result">
                    {{ value }}
                </td>
            </tr>
            <tr class="label-row">
                <th colspan="2">元素エネルギー</th>
                <th colspan="4">{{ displayName('獲得量') }}</th>
            </tr>
            <tr v-for="(row, rowIndex) in  inputRowEnergy" :key="rowIndex" :class="bgColorClass2(row)">
                <th>
                    <img :src="rowImgSrc1(row)" :alt="row.character" :class="rowImgSrc1Class(row)">
                    <img :src="rowImgSrc2(row)" :alt="row.category3" class="input-item">
                </th>
                <td></td>
                <td v-for="columnIndex in Array.from({ length: row.currents.length }, (_, i) => i)" :key="columnIndex">
                    <input type="number" v-model="row.currents[columnIndex]" min="0">
                </td>
            </tr>
            <tr>
                <th colspan="2">{{ displayName('元素爆発(回数)') }}</th>
                <td v-for="index in [0, 1, 2, 3]" :key="index" :class="bgColorClass(index)">
                    <input type="number" v-model="burstCounts[index]" min="0">
                </td>
            </tr>
        </table>
        <br />
        <div>
            <table class="supply-from-enemy">
                <caption @click="isOpenSupplyFromEnemy = !isOpenSupplyFromEnemy">
                    {{ displayName('敵') }}
                </caption>
                <tr>
                    <th></th>
                    <th>元素オーブ</th>
                    <th>元素粒子</th>
                </tr>
                <tr v-for="(element, index) in supplyFromEnemy" :key="index"
                    v-show="isOpenSupplyFromEnemy || element[1] || element[2]">
                    <td>{{ displayName(element[0]) }}</td>
                    <td> <input type="number" v-model="element[1]" min="0"> </td>
                    <td> <input type="number" v-model="element[2]" min="0"> </td>
                </tr>
            </table>
        </div>
        <div class="message-area">
            <p v-for="message of messages" :key="message">{{ message }}</p>
        </div>
        <div class="message-area">
            <dl>
                <dt>元素スキルが生成する元素粒子</dt>
                <dd>
                    <ol>
                        <li>大部分のキャラクター<br>
                            元素スキル使用時に元素粒子が発生するタイプの元素スキルは、
                            直後のアクション実行者が元素粒子を拾得する。
                        </li>
                        <li>胡桃、宵宮、神里綾人、アルハイゼン、放浪者 等<br>
                            元素スキル使用時に元素粒子が発生せず、
                            その後の通常攻撃または重撃命中時に元素粒子が発生するタイプの元素スキルは、
                            継続時間一杯攻撃した場合に発生するであろう数の元素粒子を使用者自身が拾得する。
                        </li>
                        <li>フィッシュル、鍾離、アルベド、珊瑚宮心海、八重神子 等<br>
                            継続時間の長い設置物からの攻撃命中時に元素粒子が発生するタイプの元素スキルは、
                            ローテーションまたは継続時間の間ずっと攻撃し続けた場合に発生するであろう数の元素粒子を出場時間を基準に全員に按分する。
                        </li>
                        <li>アンバー、香菱、モナ、甘雨 等<br>
                            継続時間の短い設置物からの攻撃命中時または設置物破壊時に元素粒子が発生するタイプの元素スキルは、
                            …
                        </li>
                    </ol>
                </dd>
                <dt>雷元素共鳴が生成する元素粒子</dt>
                <dd>
                    ローテーションの間ずっと5秒間隔で雷元素関連反応が起き続けた場合に発生するであろう数の元素粒子を出場時間を基準に全員に按分する。
                </dd>
                <dt>西風武器が生成する元素粒子</dt>
                <dd>
                    使用者の出場回数および出場時間(%)、ローテーション長から武器効果をトリガーする回数を決定する。
                    トリガー回数はローテーション長をクールタイムで割った数を超えない。<br>
                    元素粒子は基本的に使用者が拾得するが、使用者が1アクションだけで退場する場合は次のアクション実行者が拾得する。
                </dd>
                <dt>刻晴とガイアとフィッシュル</dt>
                <dd></dd>
            </dl>
        </div>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, PropType, reactive, ref, watch } from "vue";
import { CHARACTER_ENERGY, CHARACTER_PARTICLE, ENEMY_PARTICLE, getEnergyByCharacter, getEnergyByWeapon, getOnFieldRate, getParticleByCharacter, getParticleByCharacterExtra, getParticleByResonance, getParticleByWeapon, RECHARGE_DIRECT, RECHARGE_PARTICLE_ENEMY, RECHARGE_PARTICLE_FAVONIUS, RECHARGE_PARTICLE_RESONANCE, RECHARGE_PARTICLE_SKILL, RESONANCE_PARTICLE, WEAPON_ENERGY, WEAPON_PARTICLE } from "./energyrecharge";
import { getCharacterDetail, getCharacterMaster, getWeaponMaster, setupCharacterDetailMap, TActionItem, TTeam, TTeamMemberResult } from "./team";
import { ELEMENT_BG_COLOR_CLASS, ELEMENT_IMG_SRC, IMG_SRC_DUMMY } from "@/master";
import CompositionFunction from "@/components/CompositionFunction.vue";
import _ from "lodash";

type TCalculatorInput = {
    character: string,          // キャラクター名
    energyCost: number,         // 元素爆発 元素エネルギー
    constellation: number,      // 命ノ星座
    weapon: string | undefined, // 武器名
    weaponRefine: number,       // 武器精錬ランク
    onField: number,            // 出場率
}

type TCalculatorInputRow = {
    character: string,          // キャラクター名
    kind: string,               // [CHARACTER|WEAPON|RESONANCE]_PARTICLE,[CHARACTER|WEAPON]_ENERGY
    category3: string,          // キャラクター名,武器名
    rechargeType: string,       // リチャージ種別
    element: string,            // 元素粒子の元素
    initials: number[],         // 初期値
    currents: number[],         // 現在値
    sum: number,                // 現在値の合計値
    unit: number,               // 単位
}

export default defineComponent({
    name: "ERCalculator",
    props: {
        team: { type: Object as PropType<TTeam>, required: true },
        rotationList: { type: Array as PropType<TActionItem[]>, required: true },
        teamMemberResult: { type: Object as PropType<TTeamMemberResult>, required: true },
    },
    setup(props) {
        const { displayName } = CompositionFunction();
        const calculatorInput = reactive([] as TCalculatorInput[]);
        const inputRowParticle = reactive([] as TCalculatorInputRow[]);
        const inputRowEnergy = reactive([] as TCalculatorInputRow[]);
        const inputRowParticleEnemy = reactive([] as TCalculatorInputRow[]);
        const messages = reactive([] as string[]);
        const rotationLength = ref(20);
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

        onMounted(async () => {
            await setupCharacterDetailMap(props.team);
            setupInput(props.team, props.rotationList, props.teamMemberResult);
        })

        const watchCount = ref(0);
        watch(props, (newVal, oldVal) => {
            setupCharacterDetailMap(newVal.team).then(() => {
                setupInput(newVal.team, newVal.rotationList, newVal.teamMemberResult);
                setupInputRows(newVal.team, newVal.rotationList, newVal.teamMemberResult);
            });
            watchCount.value++;
        });

        const setupInput = (team: TTeam, rotationList: TActionItem[], teamMemberResult: TTeamMemberResult) => {
            if (!team) return;
            const newInput: TCalculatorInput[] = [];
            const onFields = getOnFieldRate(team, rotationLength.value, rotationList);
            for (let i = 0; i < team.members.length; i++) {
                const member = team.members[i];
                const characterDetail = getCharacterDetail(member.name);
                const memberResult = teamMemberResult[member.id];
                const constellation = memberResult?.characterInput.命ノ星座 ?? 0;
                const weapon = memberResult?.characterInput.weapon;
                const weaponRefine = memberResult?.characterInput.武器精錬ランク ?? 1;
                newInput.push({
                    character: member.name,
                    energyCost: characterDetail?.元素爆発.元素エネルギー ?? 0,
                    constellation: constellation,
                    weapon: weapon,
                    weaponRefine: weaponRefine,
                    onField: onFields[i],
                });
            }
            calculatorInput.splice(0, calculatorInput.length, ...newInput);

            setupInputRows(team, rotationList, teamMemberResult);
        }

        const setupInputRows = (team: TTeam, rotationList: TActionItem[], teamMemberResult: TTeamMemberResult) => {
            if (!team) return;
            const newInputRowPacticle1: TCalculatorInputRow[] = [];
            const newInputRowPacticle2: TCalculatorInputRow[] = [];
            const newInputRowEnergy1: TCalculatorInputRow[] = [];
            const newInputRowResonance: TCalculatorInputRow[] = [];
            const newinputRowParticleEnemy: TCalculatorInputRow[] = [];
            const newMessages: string[] = [];
            const onFields = calculatorInput.map(s => s.onField);
            for (let i = 0; i < calculatorInput.length; i++) {
                const character = calculatorInput[i].character;
                const constellation = calculatorInput[i].constellation;
                const weapon = calculatorInput[i].weapon;
                const weaponRefine = calculatorInput[i].weaponRefine;

                // キャラクターの元素粒子
                [
                    getParticleByCharacter(character, constellation, team, rotationLength.value, rotationList, onFields),
                    getParticleByCharacterExtra(character, constellation, team, rotationLength.value, rotationList, onFields),
                ].forEach(result => {
                    if (result?.length) {
                        const kind = CHARACTER_PARTICLE;
                        result.forEach(entry => {
                            const category3 = entry[1];
                            const initials = [0, 0, 0, 0];
                            for (let i = 0; i < initials.length; i++) {
                                initials[i] = Math.round(Number(entry[2 + i]) * 100) / 100;
                            }
                            const currents = _.cloneDeep(initials);
                            newInputRowPacticle1.push({
                                character: character,
                                kind: kind,
                                category3: category3,
                                rechargeType: RECHARGE_PARTICLE_SKILL,
                                element: entry[0],
                                initials: initials,
                                currents: currents,
                                sum: currents.reduce((a, c) => a + c, 0),
                                unit: entry[2],
                            })
                        })
                    }
                })

                // キャラクターの元素エネルギー
                const energyByCharacter = getEnergyByCharacter(character, constellation, team, rotationLength.value, rotationList, teamMemberResult);
                if (energyByCharacter?.length) {
                    const kind = CHARACTER_ENERGY;
                    const category3 = character;
                    const initials = [0, 0, 0, 0];
                    for (let i = 0; i < initials.length; i++) {
                        initials[i] = Math.round(Number(energyByCharacter[i]) * 100) / 100;
                    }
                    const currents = _.cloneDeep(initials);
                    newInputRowEnergy1.push({
                        character: character,
                        kind: kind,
                        category3: category3,
                        rechargeType: RECHARGE_DIRECT,
                        element: '',
                        initials: initials,
                        currents: currents,
                        sum: currents.reduce((a, c) => a + c, 0),
                        unit: 0.1,
                    })
                    if (energyByCharacter[4].length) {
                        newMessages.push(...energyByCharacter[4].map(s => character + '\n' + s));
                    }
                }

                if (weapon) {
                    // 武器の元素粒子（西風）
                    const particleByWeapon = getParticleByWeapon(character, weapon, weaponRefine, team, rotationLength.value, rotationList, onFields);
                    if (particleByWeapon?.length) {
                        const kind = WEAPON_PARTICLE;
                        const category3 = weapon;
                        const entry = particleByWeapon;
                        const initials = [0, 0, 0, 0];
                        for (let i = 0; i < initials.length; i++) {
                            initials[i] = Math.round(Number(entry[2 + i]) * 100) / 100;
                        }
                        const currents = _.cloneDeep(initials);
                        newInputRowPacticle2.push({
                            character: character,
                            kind: kind,
                            category3: category3,
                            rechargeType: RECHARGE_PARTICLE_FAVONIUS,
                            element: entry[0],
                            initials: initials,
                            currents: currents,
                            sum: currents.reduce((a, c) => a + c, 0),
                            unit: entry[2],
                        })
                    }

                    // 武器の元素エネルギー
                    const energyByWeapon = getEnergyByWeapon(character, weapon, weaponRefine, team, rotationLength.value, rotationList);
                    if (energyByWeapon?.length) {
                        const kind = WEAPON_ENERGY;
                        const category3 = weapon;
                        const initials = [0, 0, 0, 0];
                        for (let i = 0; i < initials.length; i++) {
                            initials[i] = Math.round(Number(energyByWeapon[i]) * 100) / 100;
                        }
                        const currents = _.cloneDeep(initials);
                        newInputRowEnergy1.push({
                            character: character,
                            kind: kind,
                            category3: category3,
                            rechargeType: RECHARGE_DIRECT,
                            element: '',
                            initials: initials,
                            currents: currents,
                            sum: currents.reduce((a, c) => a + c, 0),
                            unit: 0.1,
                        })
                        if (energyByWeapon[4].length) {
                            newMessages.push(...energyByWeapon[4].map(s => category3 + '\n' + s));
                        }
                    }
                }
            }

            // 元素共鳴の元素粒子
            const particleByResonance = getParticleByResonance(team, rotationLength.value, rotationList, onFields);
            if (particleByResonance?.length) {
                const character = '';
                const kind = RESONANCE_PARTICLE;
                const entry = particleByResonance;
                const category3 = entry[1];
                const initials = [0, 0, 0, 0];
                for (let i = 0; i < initials.length; i++) {
                    initials[i] = Math.round(Number(entry[2 + i]) * 100) / 100;
                }
                const currents = _.cloneDeep(initials);
                newInputRowResonance.push({
                    character: character,
                    kind: kind,
                    category3: category3,
                    rechargeType: RECHARGE_PARTICLE_RESONANCE,
                    element: entry[0],
                    initials: initials,
                    currents: currents,
                    sum: currents.reduce((a, c) => a + c, 0),
                    unit: entry[2],
                })
            }

            // 敵の元素粒子
            supplyFromEnemy.filter(s => s[1] || s[2]).forEach(entry => {
                const character = '';
                const kind = ENEMY_PARTICLE;
                const category3 = '';
                const element = entry[0];
                const sum = entry[1] * 3 + entry[2];
                const initials = [0, 0, 0, 0];
                for (let i = 0; i < onFields.length; i++) {
                    initials[i] = rotationLength.value / 90 * sum * onFields[i] / 100;
                }
                const currents = _.cloneDeep(initials);
                newinputRowParticleEnemy.push({
                    character: character,
                    kind: kind,
                    category3: category3,
                    rechargeType: RECHARGE_PARTICLE_ENEMY,
                    element: element,
                    initials: initials,
                    currents: currents,
                    sum: sum,
                    unit: element === '無色' ? 2 : 3,
                })
            })

            inputRowParticle.splice(0, inputRowParticle.length, ...newInputRowPacticle1, ...newInputRowPacticle2, ...newInputRowResonance);
            inputRowEnergy.splice(0, inputRowEnergy.length, ...newInputRowEnergy1);
            inputRowParticleEnemy.splice(0, inputRowParticleEnemy.length, ...newinputRowParticleEnemy);
            messages.splice(0, messages.length, ...newMessages);
        }

        /** 元素爆発(回数) */
        const burstCounts = computed(() => {
            const result: { [key: number]: number } = { 0: 1, 1: 1, 2: 1, 3: 1 };
            if (props.rotationList && props.rotationList.length) {
                const memberNameArr = props.team.members.map(member => member.name);
                props.team.members.forEach(member => {
                    if (member.name) {
                        const count = props.rotationList.filter(rotation => rotation.member == member.name && rotation.action === 'Q').length;
                        const index = memberNameArr.indexOf(member.name);
                        result[index] = count > 0 ? count : 1;
                    }
                })
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
                    input.filter(s => [CHARACTER_PARTICLE, WEAPON_PARTICLE, RESONANCE_PARTICLE, ENEMY_PARTICLE].includes(s.kind)).forEach(entry => {
                        let energy = 0;
                        for (let j = 0; j < entry.currents.length; j++) {
                            if (j == i) {
                                energy += entry.currents[j];
                            } else {
                                energy += entry.currents[j] * 0.6;
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
                if (i >= calculatorInput.length) continue;
                let energyCost = calculatorInput[i]?.energyCost;
                if (!energyCost) continue;
                inputRowEnergy.filter(s => [CHARACTER_ENERGY, WEAPON_ENERGY].includes(s.kind)).forEach(entry => {
                    energyCost -= entry.currents[i];
                })
                const burstCount = burstCounts.value[i] > 0 ? burstCounts.value[i] : 1;
                const particleEnergy = particleRecharges.value[i] / burstCount;
                if (energyCost > 0 && particleEnergy) {
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
        const rowImgSrc1 = (row: TCalculatorInputRow) => {
            let result = IMG_SRC_DUMMY;
            if (row.kind) {
                if ([CHARACTER_PARTICLE, CHARACTER_ENERGY, WEAPON_PARTICLE, WEAPON_ENERGY].includes(row.kind)) {
                    result = getCharacterMaster(row.character)?.icon_url ?? IMG_SRC_DUMMY;
                } else if ([RESONANCE_PARTICLE].includes(row.kind)) { // 元素共鳴
                    result = (ELEMENT_IMG_SRC as any)[row.element] ?? IMG_SRC_DUMMY
                }
            }
            return result;
        }
        const rowImgSrc1Class = (row: TCalculatorInputRow) =>
            (row.kind && [CHARACTER_PARTICLE, CHARACTER_ENERGY].includes(row.kind)) ? 'input-item-character' : 'input-item';
        const rowImgSrc2 = (row: TCalculatorInputRow) => {
            let result = IMG_SRC_DUMMY;
            if (row.kind) {
                if ([CHARACTER_PARTICLE].includes(row.kind)) { // 元素スキル
                    const characterDetail = getCharacterDetail(row.character);
                    result = characterDetail?.元素スキル.icon_url ?? IMG_SRC_DUMMY;
                } else if ([WEAPON_ENERGY, WEAPON_PARTICLE].includes(row.kind) && row.category3) { // 武器
                    const characterMater = getCharacterMaster(row.character);
                    if (characterMater) {
                        const weaponType = characterMater.武器;
                        const weaponMaster = getWeaponMaster(weaponType, row.category3);
                        if (weaponMaster) {
                            result = weaponMaster.icon_url;
                        }
                    }
                } else if ([RESONANCE_PARTICLE].includes(row.kind)) { // 元素共鳴
                    result = (ELEMENT_IMG_SRC as any)[row.element] ?? IMG_SRC_DUMMY
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

        const inputOnChange = () => {
            setupInputRows(props.team, props.rotationList, props.teamMemberResult);
        }

        return {
            displayName,

            rotationLength,
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
            rowImgSrc1,
            rowImgSrc1Class,
            rowImgSrc2,
            bgColorClass,
            bgColorClass2,
            particleRecharges,
            energyRechargeGls,

            inputOnChange,
        }
    }
});

</script>
<style scoped>
table {
    margin-left: auto;
    margin-right: auto;
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
    max-width: 100px;
    min-width: 35px;
    height: 22px;
}

th {
    font-size: 1.8rem;
    font-weight: bold;
    padding: 2px 4px;
}

input[type="number"] {
    margin-left: auto;
    margin-right: auto;
    padding: 0 0 0 4px;
    height: 25px;
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
    width: 35px;
    height: 25px;
    object-position: top;
    object-fit: cover;
}

img.input-item {
    width: 27px;
    height: 21px;
}

.white {
    background-color: whitesmoke;
}

tr.label-row {
    background-color: silver;
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

div.message-area {
    margin-left: auto;
    margin-right: auto;
    max-width: 120rem;
    text-align: left;
}
</style>
