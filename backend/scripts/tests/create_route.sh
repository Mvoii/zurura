#!/usr/bin/env bash
curl -X POST http://localhost:8080/a/v1/op/routes \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  -d '{
    "name": "CBD to Westlands",
    "description": "Main commuter route"
}'
