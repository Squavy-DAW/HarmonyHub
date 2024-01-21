import React from "react";

interface FileContextProps {
    fileHandle?: FileSystemFileHandle
    setFileHandle: React.Dispatch<React.SetStateAction<FileSystemFileHandle | undefined>>;
}

const FileContext = React.createContext<FileContextProps>(undefined!);
export default FileContext;