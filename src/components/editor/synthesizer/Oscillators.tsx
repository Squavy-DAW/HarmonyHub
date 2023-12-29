import { AudioNodes, setGain, setWaveform, setPan, setDetune } from "@synth/engineOLD";

export default function Oscillators() {
    return (
        <section className="oscillators">
            <div>
                <label htmlFor="mastervolume">MasterVolume</label>
                <input type="range" className="mastervolume" name="mastervolume" min={0} max={2} step={0.01} defaultValue={0.2} onChange={e => setGain(+e.target.value, AudioNodes.Master)} />
                <div className="Osc1">
                    <h2>Osc1: </h2>
                    <ul>
                        <li>
                            <label htmlFor="waveformsosc1">Waveform</label>
                            <select className="waveformsosc1" name="waveformsosc1" defaultValue="sine" onChange={e => setWaveform(e.target.value, AudioNodes.Osc1)}>
                                <option value="sawtooth">Sawtooth</option>
                                <option value="sine">Sine</option>
                                <option value="square">square</option>
                                <option value="triangle">Triangle</option>
                            </select>
                        </li>
                        <li>
                            <label htmlFor="gainOsc1">Gain</label>
                            <input type="range" className="gainOsc1" name="gainOsc1" min={0} max={0.4} step={0.01} defaultValue={0.1} onChange={e => setGain(+e.target.value, AudioNodes.Osc1)} />
                        </li>
                        <li>
                            <label htmlFor="panOsc1">Pan</label>
                            <input type="range" className="panOsc1" name="panOsc1" min={-1} max={1} step={0.01} defaultValue={0} onChange={e => setPan(+e.target.value, AudioNodes.Osc1)} />
                        </li>
                        <li>
                            <label htmlFor="detuneOsc1">Detune</label>
                            <input type="range" className="detuneOsc1" name="detuneOsc1" min={-1200} max={1200} step={1} defaultValue={0} onChange={e => setDetune(+e.target.value, AudioNodes.Osc1)} />
                        </li>
                    </ul>
                </div>
                <div className="Osc2">
                    <h2>Osc2: </h2>
                    <ul>
                        <li>
                            <label htmlFor="waveformsosc2">Waveform</label>
                            <select className="waveformsosc2" name="waveformsosc2" defaultValue="sine" onChange={e => setWaveform(e.target.value, AudioNodes.Osc2)}>
                                <option value="sawtooth">Sawtooth</option>
                                <option value="sine">Sine</option>
                                <option value="square">square</option>
                                <option value="triangle">Triangle</option>
                            </select>
                        </li>
                        <li>
                            <label htmlFor="gainOsc2">Gain</label>
                            <input type="range" className="gainOsc2" name="gainOsc2" min={0} max={0.4} step={0.01} defaultValue={0.1} onChange={e => setGain(+e.target.value, AudioNodes.Osc2)} />
                        </li>
                        <li>
                            <label htmlFor="panOsc2">Pan</label>
                            <input type="range" className="panOsc2" name="panOsc2" min={-1} max={1} step={0.01} defaultValue={0} onChange={e => setPan(+e.target.value, AudioNodes.Osc2)} />
                        </li>
                        <li>
                            <label htmlFor="detuneOsc2">Detune</label>
                            <input type="range" className="detuneOsc2" name="detuneOsc2" min={-1200} max={1200} step={1} defaultValue={0} onChange={e => setDetune(+e.target.value, AudioNodes.Osc2)} />
                        </li>
                    </ul>
                </div>
                <div className="Osc3">
                    <h2>Osc3: </h2>
                    <ul>
                        <li>
                            <label htmlFor="waveformsosc3">Waveform</label>
                            <select className="waveformsosc3" name="waveformsosc3" defaultValue="sine" onChange={e => setWaveform(e.target.value, AudioNodes.Osc3)}>
                                <option value="sawtooth">Sawtooth</option>
                                <option value="sine">Sine</option>
                                <option value="square">square</option>
                                <option value="triangle">Triangle</option>
                            </select>
                        </li>
                        <li>
                            <label htmlFor="gainOsc3">Gain</label>
                            <input type="range" className="gainOsc3" name="gainOsc3" min={0} max={0.4} step={0.01} defaultValue={0.1} onChange={e => setGain(+e.target.value, AudioNodes.Osc3)} />
                        </li>
                        <li>
                            <label htmlFor="panOsc3">Pan</label>
                            <input type="range" className="panOsc3" name="panOsc3" min={-1} max={1} step={0.01} defaultValue={0} onChange={e => setPan(+e.target.value, AudioNodes.Osc3)} />
                        </li>
                        <li>
                            <label htmlFor="detuneOsc3">Detune</label>
                            <input type="range" className="detuneOsc3" name="detuneOsc3" min={-1200} max={1200} step={1} defaultValue={0} onChange={e => setDetune(+e.target.value, AudioNodes.Osc3)} />
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    )
}
