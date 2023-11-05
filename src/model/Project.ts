import Pattern from "@models/pattern";

export default interface Project {
    name: string,
    description: string,
    editDate: Date,
    createDate: Date,
    data: {
        patterns: Pattern[]
    },
}