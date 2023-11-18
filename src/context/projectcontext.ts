import Project from "@models/project";
import React from "react";

interface ProjectContextProps {
    project: Project,
    setProject: React.Dispatch<React.SetStateAction<Project>>
}

const ProjectContext = React.createContext<ProjectContextProps>(undefined!);
export default ProjectContext;