import { useEffect, useState } from 'react';
import { projectById as projectFromId } from '../api/projects/byId';
import useSize from '@/utils/useSize';
import PostData from '../../components/posts/PostData';
import fs from 'fs';
import path from 'path';
import { worker as fetchMd } from '../api/projects/md';
import { parseMd } from '@/utils/parseMd';
import PostLayout from '@/layouts/PostLayout';

interface ProjectParams {
    params: {
        projectId: string;
    }
}

export async function getStaticPaths() {
    const projectsPath = path.join(process.cwd(), "public", 'projects')
    const paths = fs.readdirSync(projectsPath)
        .filter(projectId => projectId !== "projects.json")
        .map(projectId => ({ params: { projectId: projectId } }))
    return { paths: paths, fallback: false }
}

export async function getStaticProps({ params: { projectId } }: ProjectParams) {
    return {
        props: {
            projectId: projectId,
            projectData: projectFromId(projectId),
            projectMd: fetchMd(projectId)
        }
    }
}

interface ProjectProps {
    projectId: string;
    projectData: PostData;
    projectMd: string;
}

const Project = ({ projectId, projectData, projectMd }: ProjectProps) => {
    const [ parsedProjectMd, setParsedProjectMd ] = useState('Loading...')
    const windowSize = useSize()

    useEffect(() => {
        setParsedProjectMd(
            parseMd(projectMd, projectId, windowSize[0])
        )
    }, [ projectMd, projectId, windowSize[0] ])

    return (
        <PostLayout
            header={ projectData.name }
            md={ parsedProjectMd }
            summary={ projectData.description }
            icon={ projectData.cover }
        />
    );
}

export default Project;
