import {EditorResource} from "@/pages/posts/[type]/[postId]/editor";
import Resource from "@/components/posts/editor/resources/Resource";
import {useCallback} from "react";
import {DropEvent, FileRejection, useDropzone} from "react-dropzone";
import FakeResource from "./FakeResource";
import ensureLength from "@/utils/ensureLength";
import {resourceUrl} from "@/utils/aws";
import sanitize from "sanitize-filename";

interface ResourcesProps {
    resources: EditorResource[];
    covers: string[];
    setResources: (resources: EditorResource[]) => void;
    setCovers: (covers: string[]) => void;
    postId: string;
    setMarkdown: (markdownData: string, markdownId: string) => void;
}

const Resources = ({
                       resources,
                       covers,
                       setResources,
                       setCovers,
                       postId,
                       setMarkdown,
                   }: ResourcesProps) => {
    const addResource = useCallback(
        async (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
            const newResources: EditorResource[] = [];
            for (const file of acceptedFiles) {
                let [filename, filetype] = file.name.split(".");

                // Doesn't include file extension
                const resourceName = sanitize(filename).replace("%20", "_").replace(/\s/g, "_");

                const makeId = (counter: number) =>
                    `${resourceName}_${ensureLength(String(counter), 4)}`;

                let resourceNumber = 1;
                while (
                    (await fetch("/api/resources/exists", {
                        headers: {id: makeId(resourceNumber)},
                    })
                        .then((resp) => resp.json())
                        .then((exists) => exists.exists)) === "true"
                    ) {
                    resourceNumber++;
                }
                const resourceId = makeId(resourceNumber);

                filename = `${resourceId}.${filetype}`;

                const newResource = {
                    id: resourceId,
                    title: resourceName,
                    filename: filename,
                    type: file.type.split("/")[0],
                    description: "",
                    mimetype: file.type,
                    postId: postId,
                };
                await fetch(`/api/resources/${resourceId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newResource),
                })
                    .then(async (addResp) => {
                        const addRespJson = await addResp.json();
                        console.log(addRespJson);
                        const uploadResp = await fetch(addRespJson.uploadUrl, {
                            method: "PUT",
                            headers: {
                                "Content-Type": file.type,
                                "Content-Length": file.size.toString(),
                            },
                            body: await file.arrayBuffer(),
                        });
                        if (uploadResp.ok) {
                            console.log(resourceUrl(filename));
                            newResources.push({
                                ...newResource,
                                url: resourceUrl(filename),
                            });
                        } else {
                            console.log(await uploadResp.json());
                        }
                    })
                    .catch((e) => console.log(e));
            }

            setResources(
                [...resources, ...newResources].filter(
                    (resource) => resource !== null && resource !== undefined
                )
            );
        },
        [resources, postId]
    );

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop: addResource,
    });

    const removeResource = useCallback(
        (index: number) => {
            fetch(`/api/resources/${resources[index].id}`, {
                method: "DELETE",
            }).then((resp) => {
                if (resp.ok || resp.status === 404) {
                    const slicedResources = [...resources];
                    delete slicedResources[index];
                    setResources(slicedResources);
                }
            });
        },
        [resources, postId]
    );

    const updateResource = useCallback(
        async (index: number, newResource: EditorResource) => {
            const oldResource = resources[index];

            await fetch(`/api/resources/${oldResource.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newResource),
            }).then((resp) => {
                if (resp.ok) {
                    const newResources = [...resources];
                    newResources[index] = newResource;

                    setResources(newResources);
                }
            });
            return oldResource;
        },
        [resources, postId]
    );

    const setIsCover = useCallback(
        (coverId: string, newIsCover: boolean) => {
            let newCovers: string[] | undefined;

            if (newIsCover) {
                if (covers.includes(coverId)) return;
                else {
                    newCovers = [...covers, coverId];
                }
            } else {
                if (!covers.includes(coverId)) return;
                else {
                    newCovers = covers.filter((cover) => cover !== coverId);
                }
            }

            if (newCovers) {
                fetch(`/api/posts/${postId}/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        covers: newCovers,
                    }),
                }).then((resp) => {
                    if (resp.ok) {
                        setCovers(newCovers as string[]);
                        console.log("Made image a cover image")
                    } else console.log("Failed to change cover")
                });
            }
        },
        [covers, postId]
    );
    return (
        <div className="grid grid-cols-2 gap-3 mt-4 justify-stretch relative">
            {resources.map((resource, index) => {
                return (
                    <Resource
                        index={index}
                        remove={() => removeResource(index)}
                        resource={resource}
                        isCover={(resourceId) => covers.includes(resourceId)}
                        setIsCover={setIsCover}
                        updateResource={updateResource}
                        setMarkdown={setMarkdown}
                        postId={postId}
                        key={index}
                    />
                );
            })}
            <div
                {...getRootProps()}
                className={`relative cursor-pointer ${
                    isDragActive ? "brightness-90" : "brightness-100"
                }`}
            >
                <FakeResource placeholderId={null}></FakeResource>
            </div>
        </div>
    );
};

export default Resources;
