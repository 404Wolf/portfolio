import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { visit } from "unist-util-visit";
import { Root } from "remark-parse/lib";

/**
 * Combines frontmatter properties from an object and appends markdown to create a complete markdown string with frontmatter.
 * @param frontmatter Object containing key/value pairs for the frontmatter.
 * @param markdown The markdown content to combine with the frontmatter.
 * @returns A string combining frontmatter and markdown content.
 */

export function createMarkdownWithFrontmatter(
  frontmatter: Record<string, any>,
  markdown: string
): string {
  const frontmatterString = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");

  return `---\n${frontmatterString}\n---\n${markdown}`;
}

interface MarkdownWithFrontmatter {
  frontmatter: string;
  markdown: string;
}

/**
 * Extracts frontmatter and markdown content from a markdown string.
 * @param input The markdown content to parse.
 * @returns An object containing frontmatter and markdown content.
 */
export function parseMarkdownWithFrontmatter(
  input: string
): MarkdownWithFrontmatter {
  // Regular expression to extract frontmatter
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = input.match(frontmatterRegex);

  let frontmatter = "";
  let markdown = input;

  if (match) {
    frontmatter = match[1];
    markdown = input.slice(match[0].length);
  }

  return { frontmatter, markdown };
}

/**
 * Unified plugin to substitute all image links with corresponding links.
 * This function must be called to retreive the unified transformer.
 * @param {{ [key: string]: string }} idToFilenames A dictionary mapping image IDs to filenames.
 * @returns A unified plugin.
 */
export const updateImageLinks = (idToFilenames: {
  [key: string]: string;
}) => () => {
  return (tree: Root) => {
    visit(tree, "image", node => {
      if (node.url) {
        const id = node.url.split("|")[0];
        node.url = node.url.replace(id, idToFilenames[id] || id);
      }
    });
  };
};

/** Unified plugin to prepend a header and body below it to markdown.
 * @param {number} headerLevel The level of header. 1 is the highest level.
 * @param {string} headerText The content of the header.
 * @param {string} bodyText The content of the body below the header.
 * @param {boolean} lineBelow Whether to add a line below the body.
 * @returns A unified plugin.
 */
export function prependHeading(
  headerLevel: 1 | 2 | 3 | 4 | 5 | 6,
  headerText: string,
  bodyText: string,
  lineBelow: boolean = false
) {
  return () => {
    return (tree: Root) => {
      lineBelow &&
        tree.children.unshift({
          type: "thematicBreak"
        });

      tree.children.unshift({
        type: "paragraph",
        children: [{ type: "text", value: bodyText }]
      });

      tree.children.unshift({
        type: "heading",
        depth: headerLevel,
        children: [{ type: "text", value: headerText }]
      });
    };
  };
}
