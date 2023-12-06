import React from "react";

interface PlaybackContextProps {
    time: number;
    setTime: (value: number) => void;
    isPlaying: boolean;
}

const PlaybackContext = React.createContext<PlaybackContextProps>(undefined!);
export default PlaybackContext;