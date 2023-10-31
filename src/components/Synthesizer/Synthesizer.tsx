import Split from "react-split";
import { AudioNodes,init, setGain, setWaveform, setPan, setDetune, setPitch}  from "@src/synth/engine";
import PianoRoll from "./Keyboard";
import "@styles/synthesizer.css"

export default function Synthesizer() { //TODO: Stop Synthesizer on Tab-Change
    init(); //initialize the synthesizer (AudioContext, Oscillators, etc.)
    return (
        <Split
            id="synthesizer-layout"
            sizes={[50, 50]}
            minSize={100}
            gutterSize={1}
            snapOffset={20}
            gutterAlign=''
            direction="vertical"
            cursor="row-resize">
                <section id="piano-roll">
                    <PianoRoll/>
                </section>
                <section id="oscillators">
                    <div>
                        <label htmlFor="mastervolume">MasterVolume</label>
                        <input type="range" id="mastervolume" name="mastervolume" min={0} max={2} step={0.01} defaultValue={0.2} onChange={e => setGain(+e.target.value, AudioNodes.Master)}/>
                        <div id="Osc1">
                            <h2>Osc1: </h2>
                            <ul>
                                <li>
                                    <label htmlFor="waveformsosc1">Waveform</label>
                                    <select id="waveformsosc1" name="waveformsosc1" defaultValue="sine" onChange={e => setWaveform(e.target.value,AudioNodes.Osc1)}>
                                        <option value="sawtooth">Sawtooth</option>
                                        <option value="sine">Sine</option>
                                        <option value="square">square</option>
                                        <option value="triangle">Triangle</option>
                                    </select>
                                </li>
                                <li>
                                    <label htmlFor="gainOsc1">Gain</label>
                                    <input type="range" id="gainOsc1" name="gainOsc1" min={0} max={0.4} step={0.01} defaultValue={0.1} onChange={e => setGain(+e.target.value, AudioNodes.Osc1)}/>
                                </li>
                                <li>
                                    <label htmlFor="panOsc1">Pan</label>
                                    <input type="range" id="panOsc1" name="panOsc1" min={-1} max={1} step={0.01} defaultValue={0} onChange={e => setPan(+e.target.value, AudioNodes.Osc1)}/>
                                </li>
                                <li>
                                    <label htmlFor="pitchOsc1">Pitch</label>
                                    <input type="range" id="pitchOsc1" name="pitchOsc1" min={0.5} max={2} step={0.01} defaultValue={1} onChange={e => setPitch(+e.target.value, AudioNodes.Osc1)}/>
                                </li>
                                <li>
                                    <label htmlFor="detuneOsc1">Detone</label>
                                    <input type="range" id="detuneOsc1" name="detuneOsc1" min={-100} max={100} step={1} defaultValue={0} onChange={e => setDetune(+e.target.value, AudioNodes.Osc1)}/>
                                </li>
                            </ul>
                        </div>
                        <div id="Osc2">
                            <h2>Osc2: </h2>
                            <ul>
                                <li>
                                    <label htmlFor="waveformsosc2">Waveform</label>
                                    <select id="waveformsosc2" name="waveformsosc2" defaultValue="sine" onChange={e => setWaveform(e.target.value,AudioNodes.Osc2)}>
                                        <option value="sawtooth">Sawtooth</option>
                                        <option value="sine">Sine</option>
                                        <option value="square">square</option>
                                        <option value="triangle">Triangle</option>
                                    </select>
                                </li>
                                <li>
                                    <label htmlFor="gainOsc2">Gain</label>
                                    <input type="range" id="gainOsc2" name="gainOsc2" min={0} max={0.4} step={0.01} defaultValue={0.1} onChange={e => setGain(+e.target.value, AudioNodes.Osc2)}/>
                                </li>
                                <li>
                                    <label htmlFor="panOsc2">Pan</label>
                                    <input type="range" id="panOsc2" name="panOsc2" min={-1} max={1} step={0.01} defaultValue={0} onChange={e => setPan(+e.target.value, AudioNodes.Osc2)}/>
                                </li>
                                <li>
                                    <label htmlFor="pitchOsc2">Pitch</label>
                                    <input type="range" id="pitchOsc2" name="pitchOsc2" min={0.5} max={2} step={0.01} defaultValue={1} onChange={e => setPitch(+e.target.value, AudioNodes.Osc2)}/>
                                </li>
                                <li>
                                    <label htmlFor="detuneOsc2">Detone</label>
                                    <input type="range" id="detuneOsc2" name="detuneOsc2" min={-100} max={100} step={1} defaultValue={0} onChange={e => setDetune(+e.target.value, AudioNodes.Osc2)}/>
                                </li>
                            </ul>
                        </div>
                        <div id="Osc3">
                            <h2>Osc3: </h2>
                            <ul>
                                <li>
                                    <label htmlFor="waveformsosc3">Waveform</label>
                                    <select id="waveformsosc3" name="waveformsosc3" defaultValue="sine" onChange={e => setWaveform(e.target.value,AudioNodes.Osc3)}>
                                        <option value="sawtooth">Sawtooth</option>
                                        <option value="sine">Sine</option>
                                        <option value="square">square</option>
                                        <option value="triangle">Triangle</option>
                                    </select>
                                </li>
                                <li>
                                    <label htmlFor="gainOsc3">Gain</label>
                                    <input type="range" id="gainOsc3" name="gainOsc3" min={0} max={0.4} step={0.01} defaultValue={0.1} onChange={e => setGain(+e.target.value, AudioNodes.Osc3)}/>
                                </li>
                                <li>
                                    <label htmlFor="panOsc3">Pan</label>
                                    <input type="range" id="panOsc3" name="panOsc3" min={-1} max={1} step={0.01} defaultValue={0} onChange={e => setPan(+e.target.value, AudioNodes.Osc3)}/>
                                </li>
                                <li>
                                    <label htmlFor="pitchOsc3">Pitch</label>
                                    <input type="range" id="pitchOsc3" name="pitchOsc3" min={0.5} max={2} step={0.01} defaultValue={1} onChange={e => setPitch(+e.target.value, AudioNodes.Osc3)}/>
                                </li>
                                <li>
                                    <label htmlFor="detuneOsc3">Detone</label>
                                    <input type="range" id="detuneOsc3" name="detuneOsc3" min={-100} max={100} step={1} defaultValue={0} onChange={e => setDetune(+e.target.value, AudioNodes.Osc3)}/>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
        </Split>
    )
}
