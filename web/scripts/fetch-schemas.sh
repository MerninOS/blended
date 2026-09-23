#!/usr/bin/env bash
# Pull Shopify's published GraphQL schemas (from their npm packages) into .schemas/
# for scripts/validate-graphql.mjs. Admin 2026-07, Storefront, Customer Account.
set -euo pipefail
cd "$(dirname "$0")/.."
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
mkdir -p .schemas
( cd "$tmp" && npm pack @shopify/dev-mcp @shopify/hydrogen-react --silent >/dev/null )
tar -xzf "$tmp"/shopify-dev-mcp-*.tgz -C "$tmp" package/dist/data/admin_2026-07.json.gz
gunzip -c "$tmp"/package/dist/data/admin_2026-07.json.gz > .schemas/admin-2026-07.json
tar -xzf "$tmp"/shopify-hydrogen-react-*.tgz -C "$tmp" package/storefront.schema.json package/customer-account.schema.json
cp "$tmp"/package/storefront.schema.json .schemas/storefront.json
cp "$tmp"/package/customer-account.schema.json .schemas/customer-account.json
echo "Schemas saved to .schemas/"
