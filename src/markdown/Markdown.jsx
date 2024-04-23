import ReactMarkdown from "react-markdown";
import remarkImageBlock from "./remark-imageBlock.js";
import ImageBlock from "@/markdown/ImageBlock";
import MdImage from "@/markdown/Image";
import { imgBlockHandler, imgHandler } from "./hast-handlers.js";
import CodeBlock from "@/markdown/CodeBlock";
import remarkToc from "remark-toc";
import remarkSlug from "remark-slug";
import remarkMath from "remark-math";

const Markdown = ({ markdown, resourceMap = {}, textClasses = "" }) => {
    return (
        <ReactMarkdown
            children={markdown}
            className="markdown"
            remarkPlugins={[
                [remarkSlug],
                [remarkMath, {}],
                [
                    remarkToc,
                    {
                        tight: false,
                        ordered: true,
                        maxDepth: 5,
                        heading: "Contents|Table of Contents",
                    },
                ],
                [remarkImageBlock],
            ]}
            remarkRehypeOptions={{
                handlers: { imgBlock: imgBlockHandler, image: imgHandler },
            }}
            components={{
                img: ({ node, ...props }) => (
                    <MdImage
                        alt={props.alt}
                        title={props.title}
                        src={props.src}
                        width={props.width}
                        float={props.float}
                        label={props.alt}
                        autoplay={props.autoPlay && props.autoPlay == "true"}
                        resourceMap={resourceMap}
                    />
                ),
                imgBlock: ({ node, ...props }) => (
                    <ImageBlock
                        alts={props.alts}
                        titles={props.titles}
                        srcs={props.srcs}
                        resourceMap={resourceMap}
                    />
                ),
                code: ({ node, inline, className, children, ...props }) => (
                    <CodeBlock
                        inline={inline}
                        className={className + "my-12"}
                        children={children}
                        {...props}
                    />
                ),
                a: ({ ...props }) => {
                    if (!props.href.includes("#"))
                        return <a {...props} target="_blank" rel="noreferrer noopener" />;
                    return <a {...props} />;
                },
                h1: ({ node, ...props }) => (
                    <h1 className={`text-4xl font-bold ${textClasses}`}>{props.children}</h1>
                ),
                h2: ({ node, ...props }) => (
                    <h2 className={`text-3xl font-bold ${textClasses}`}>{props.children}</h2>
                ),
                h3: ({ node, ...props }) => (
                    <h3 className={`text-2xl font-bold ${textClasses}`}>{props.children}</h3>
                ),
                h4: ({ node, ...props }) => (
                    <h4 className={`text-xl font-bold ${textClasses}`}>{props.children}</h4>
                ),
                h5: ({ node, ...props }) => (
                    <h5 className={`text-lg font-bold ${textClasses}`}>{props.children}</h5>
                ),
                h6: ({ node, ...props }) => (
                    <h6 className={`text-base font-bold ${textClasses}`}>{props.children}</h6>
                ),
                p: ({ node, ...props }) => <p className={`text-base ${textClasses}`}>{props.children}</p>,
            }}
        />
    );
};

export default Markdown;
