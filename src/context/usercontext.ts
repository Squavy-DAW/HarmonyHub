import React from "react";

interface UserContextProps {
    usernames: { [id: string]: string };
    setUsernames: React.Dispatch<React.SetStateAction<{ [id: string]: string }>>;
}

const UserContext = React.createContext<UserContextProps>(undefined!);
export default UserContext;