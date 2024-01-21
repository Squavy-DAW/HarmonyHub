interface KeyProps extends React.HTMLAttributes<HTMLLIElement> {
    keyName: string,
    frequency: number
}

export default function Key({ keyName, frequency, ...rest }: KeyProps) {

    /**
     *  getClassName(keyName) + " key " + )
     */

    return (
        <li {...rest} className={["key", keyName.endsWith("#") ? "black-key" : "white-key", 
            (keyName.charAt(0) == 'C' || keyName.charAt(0) == 'F') ? "c-f" :
            (keyName.charAt(0) == 'E' || keyName.charAt(0) == 'B') ? "e-b" : "general", rest.className].join(' ')}>
            {/* Display label when enabled */}
        </li>
    )
}
