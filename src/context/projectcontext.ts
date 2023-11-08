import Project from "@models/project";
import React from "react";

interface ProjectContextProps {
    project: Project,
    setProject: (project: Project) => void
}

const ProjectContext = React.createContext<ProjectContextProps>(undefined!);
export default ProjectContext;