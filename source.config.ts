import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema
} from "fumadocs-mdx/config";
import { z } from "zod";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      product: z.string().optional(),
      related: z.array(z.string()).optional(),
      prerequisites: z.array(z.string()).optional(),
      summary: z.string().optional(),
      type: z.string().optional(),
      url: z.string().optional()
    }),
    postprocess: {
      includeProcessedMarkdown: true
    }
  },
  meta: {
    schema: metaSchema
  }
});

export default defineConfig({});
