import React from "react";

interface PlaybackContextProps {
    time: number;
    setTime: React.Dispatch<React.SetStateAction<number>>;
    isPlaying: boolean;
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

const PlaybackContext = React.createContext<PlaybackContextProps>(undefined!);
export default PlaybackContext;