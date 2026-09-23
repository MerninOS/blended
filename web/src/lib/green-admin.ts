import "server-only";
// Green catalog, admin side: CRUD on `green_lot` metaobjects. Listing a lot
// publishes it (ACTIVE); hiding sets it to DRAFT so the Storefront API stops
// returning it, while existing orders keep their snapshotted recipe.
import type { GreenLot } from "@/lib/domain/types";
import { isDemo } from "@/lib/env";
import { admin, assertNoUserErrors, gql } from "@/lib/shopify/client";
import { GREEN_LOT_TYPE, lotFromFields, lotToFields, type MetaField } from "@/lib/shopify/mapping";
import { demoStore } from "@/lib/demo-store";

const LIST = gql`
  query AdminGreenLots($type: String!) {
    metaobjects(type: $type, first: 250) {
      nodes {
        id
        handle
        capabilities { publishable { status } }
        fields {
          key
          value
          reference { ... on MediaImage { image { url } } }
        }
      }
    }
  }
`;
const CREATE = gql`
  mutation GreenLotCreate($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id handle }
      userErrors { field message }
    }
  }
`;
const UPDATE = gql`
  mutation GreenLotUpdate($id: ID!, $metaobject: MetaobjectUpdateInput!) {
    metaobjectUpdate(id: $id, metaobject: $metaobject) {
      metaobject { id handle }
      userErrors { field message }
    }
  }
`;
const DELETE = gql`
  mutation GreenLotDelete($id: ID!) {
    metaobjectDelete(id: $id) {
      deletedId
      userErrors { field message }
    }
  }
`;

type Node = { id: string; handle: string; capabilities: { publishable: { status: string } | null } | null; fields: MetaField[] };

export async function listGreenLotsAdmin(): Promise<GreenLot[]> {
  if (isDemo()) return demoStore.green();
  const r = await admin<{ metaobjects: { nodes: Node[] } }>(LIST, { variables: { type: GREEN_LOT_TYPE } });
  return r.metaobjects.nodes.map(lotFromFields).sort((a, b) => a.name.localeCompare(b.name));
}

const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").slice(0, 60) || "lot";

/** imageFileId: a MediaImage GID from an upload, "" to clear, undefined to keep. */
export async function saveGreenLot(lot: GreenLot, imageFileId?: string): Promise<GreenLot> {
  if (isDemo()) {
    const saved = { ...lot, id: lot.gid ? lot.id : lot.id || slug(lot.name) };
    demoStore.saveLot(saved);
    return saved;
  }
  const fields = lotToFields(lot);
  if (imageFileId !== undefined) fields.push({ key: "image", value: imageFileId });
  const capabilities = { publishable: { status: lot.listed ? "ACTIVE" : "DRAFT" } };
  if (lot.gid) {
    const r = await admin<{ metaobjectUpdate: { metaobject: { id: string; handle: string } | null; userErrors: { message: string }[] } }>(UPDATE, {
      variables: { id: lot.gid, metaobject: { fields, capabilities } },
    });
    assertNoUserErrors(r.metaobjectUpdate, "Could not save");
    return lot;
  }
  const r = await admin<{ metaobjectCreate: { metaobject: { id: string; handle: string } | null; userErrors: { message: string }[] } }>(CREATE, {
    variables: { metaobject: { type: GREEN_LOT_TYPE, handle: slug(lot.name), fields, capabilities } },
  });
  assertNoUserErrors(r.metaobjectCreate, "Could not add coffee");
  return { ...lot, gid: r.metaobjectCreate.metaobject!.id, id: r.metaobjectCreate.metaobject!.handle };
}

export async function deleteGreenLot(lot: GreenLot) {
  if (isDemo()) { demoStore.deleteLot(lot.id); return; }
  if (!lot.gid) return;
  const r = await admin<{ metaobjectDelete: { userErrors: { message: string }[] } }>(DELETE, { variables: { id: lot.gid } });
  assertNoUserErrors(r.metaobjectDelete, "Could not delete");
}

// ---------- green on-hand drawdown when a blend order is paid ----------
const LOT_BY_HANDLE = gql`
  query LotByHandle($handle: MetaobjectHandleInput!) {
    metaobjectByHandle(handle: $handle) { id field(key: "on_hand_lb") { value } }
  }
`;
const SET_ON_HAND = gql`
  mutation SetOnHand($id: ID!, $metaobject: MetaobjectUpdateInput!) {
    metaobjectUpdate(id: $id, metaobject: $metaobject) { userErrors { field message } }
  }
`;
export async function drawDownGreen(usage: Map<string, number>) {
  for (const [handle, greenLb] of usage) {
    const r = await admin<{ metaobjectByHandle: { id: string; field: { value: string | null } | null } | null }>(LOT_BY_HANDLE, { variables: { handle: { type: GREEN_LOT_TYPE, handle } } });
    const m = r.metaobjectByHandle; if (!m) continue;
    const next = Math.max(0, Math.round((Number(m.field?.value) || 0) - greenLb));
    await admin(SET_ON_HAND, { variables: { id: m.id, metaobject: { fields: [{ key: "on_hand_lb", value: String(next) }] } } });
  }
}
