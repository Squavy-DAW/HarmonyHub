import Pattern from "@models/pattern";

export default interface Project {
    name: string,
    description: string,
    editDate: Date,
    createDate: Date,
    data: {
        patterns: { [id: string]: Pattern }
    },
}

export const defaultProject: Project = {
    name: 'New Project',
    description: '',
    editDate: new Date(),
    createDate: new Date(),
    data: {
        patterns: {}
    }
}