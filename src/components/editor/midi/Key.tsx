interface KeyProps extends React.HTMLAttributes<HTMLLIElement> {
    keyName: string,
    frequency: number
}

export default function Key({ keyName, frequency, ...rest }: KeyProps) {

    function getClassName(kname: string) {
        if (kname.endsWith("#"))
            return "black-key";
        return "white-key";
    }

    return (
        <li className={
            getClassName(keyName) + " key " + ((keyName.charAt(0) == 'C' || keyName.charAt(0) == 'F') ? "c-f" :
                (keyName.charAt(0) == 'E' || keyName.charAt(0) == 'B') ? "e-b" : "general")}
            id={"freq:" + frequency} {...rest}>
            {/* TODO: Change to data-id */}
        </li>
    )
}
