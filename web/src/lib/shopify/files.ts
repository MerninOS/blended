import "server-only";
import { admin, assertNoUserErrors, gql } from "@/lib/shopify/client";

const STAGE = gql`
  mutation StageUpload($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets { url resourceUrl parameters { name value } }
      userErrors { field message }
    }
  }
`;
const FILE_CREATE = gql`
  mutation CreateFile($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files { id fileStatus alt }
      userErrors { field message }
    }
  }
`;

export type StagedTarget = { url: string; resourceUrl: string; parameters: { name: string; value: string }[] };

/** Ask Shopify for a signed upload target the browser can POST the file to. */
export async function stageUpload(filename: string, mimeType: string, size: number, resource: "FILE" | "IMAGE" = "FILE"): Promise<StagedTarget> {
  const r = await admin<{ stagedUploadsCreate: { stagedTargets: StagedTarget[]; userErrors: { message: string }[] } }>(STAGE, {
    variables: { input: [{ filename, mimeType, fileSize: String(size), resource, httpMethod: "POST" }] },
  });
  assertNoUserErrors(r.stagedUploadsCreate, "Upload failed");
  return r.stagedUploadsCreate.stagedTargets[0];
}

/** Turn an uploaded staged resource into a permanent Shopify File. */
export async function finalizeUpload(resourceUrl: string, filename: string, alt: string, contentType: "FILE" | "IMAGE" = "FILE") {
  const r = await admin<{ fileCreate: { files: { id: string }[]; userErrors: { message: string }[] } }>(FILE_CREATE, {
    variables: { files: [{ originalSource: resourceUrl, filename, alt, contentType }] },
  });
  assertNoUserErrors(r.fileCreate, "Upload failed");
  return { fileId: r.fileCreate.files[0]?.id ?? null };
}
