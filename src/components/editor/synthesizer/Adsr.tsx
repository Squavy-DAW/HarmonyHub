import styles from "@styles/synthesizer/Adsr.module.css";
import Knob from "./Knob";
import bres from "bresenham-line-algorithm";
import { createRef, useEffect, useState } from "react";

interface AdsrValues {
    attack: number,
    delay: number,
    sustain: number,
    release: number,
}

interface AdsrProps extends Partial<AdsrValues>, Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    onChange?: (value: AdsrValues) => void
}

export default function Adsr(props: AdsrProps) {

    // visual multipliers
    const a_m = 10;
    const d_m = 10;
    const s_m = 20;
    const r_m = 10;

    // sustain length
    const s_l = 16;

    const [adsrValues, setAdsrValues] = useState<AdsrValues>({
        attack: props.attack ?? 1.0,
        delay: props.delay ?? 0.5,
        sustain: props.sustain ?? 0.5,
        release: props.release ?? 0.8,
    });

    useEffect(() => {
        props.onChange?.(adsrValues);
    }, [adsrValues])

    const canvasRef = createRef<HTMLCanvasElement>();

    function drawPoints(ctx: CanvasRenderingContext2D, points: object[]) {
        for (let i = 0; i < points.length; i++) {
            const { x, y } = points[i] as { x: number, y: number };
            ctx.fillRect(x, y, 1, 1);
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas!.getContext("2d")!;
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        ctx.reset();

        const a_x = adsrValues.attack*a_m;
        const a_y = 0;

        const d_x = a_x + adsrValues.delay*d_m;
        const d_y = h - adsrValues.sustain*s_m;

        const s_x = d_x + s_l;
        const s_y = d_y;

        const r_x = s_x + adsrValues.release*r_m;
        const r_y = h;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(a_x+1, a_y);
        ctx.lineTo(d_x+1, d_y);
        ctx.lineTo(s_x+1, s_y);
        ctx.lineTo(r_x+1, r_y);
        ctx.clip();

        const adsrGradient = ctx.createLinearGradient(0, 0, 0, h);
        adsrGradient.addColorStop(0.0, '#03e503');
        adsrGradient.addColorStop(1.0, '#1a2519');
        ctx.fillStyle = adsrGradient;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();

        ctx.fillStyle = '#0cbc0c';
        drawPoints(ctx, bres.bresenhamLinePoints(0, h, a_x, a_y));
        drawPoints(ctx, bres.bresenhamLinePoints(Math.ceil(a_x), a_y, d_x, Math.ceil(d_y) - 1));
        drawPoints(ctx, bres.bresenhamLinePoints(Math.ceil(d_x), Math.ceil(d_y) - 1, Math.ceil(s_x), Math.ceil(d_y) - 1));
        drawPoints(ctx, bres.bresenhamLinePoints(Math.ceil(s_x), Math.ceil(s_y) - 1, Math.ceil(r_x), r_y));
    }, [adsrValues])

    return (
        <div className={styles.container}>
            <canvas className={styles.graph} width={46} height={21} ref={canvasRef} />
            <div className={styles.knobs}>
                {Object.keys(adsrValues).map(prop => (
                    // @ts-ignore
                    <Knob key={prop} className={styles.knob} value={props[prop] ? props[prop] : adsrValues[prop]} min={0} max={1} stepping={false} onChange={(value) => {
                        setAdsrValues(prev => ({ ...prev, [prop]: value }))
                    }} />
                ))}
            </div>
        </div>
    )
}