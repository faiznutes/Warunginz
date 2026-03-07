"use strict";

function sanitizePath(pathValue) {
  return String(pathValue || "")
    .replace(/\?.*$/, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

function splitSegments(pathValue) {
  const clean = sanitizePath(pathValue);
  if (!clean) return [];
  return clean.split("/").filter(Boolean);
}

function isDynamicSegment(segment) {
  return segment.includes("${") || segment.startsWith(":");
}

function scoreEndpointMatch(callEndpoint, backendPath) {
  const callSeg = splitSegments(callEndpoint);
  const backSeg = splitSegments(backendPath);
  if (callSeg.length !== backSeg.length) return Number.NEGATIVE_INFINITY;

  let score = 0;

  for (let i = 0; i < callSeg.length; i += 1) {
    const callPart = callSeg[i];
    const backendPart = backSeg[i];
    const callDynamic = isDynamicSegment(callPart);
    const backendDynamic = backendPart.startsWith(":");

    if (!callDynamic && !backendDynamic) {
      if (callPart !== backendPart) return Number.NEGATIVE_INFINITY;
      score += 4;
      continue;
    }

    if (callDynamic && backendDynamic) {
      score += 3;
      continue;
    }

    if (!callDynamic && backendDynamic) {
      score += 2;
      continue;
    }

    // Dynamic call segment mapped to backend static segment is allowed,
    // but intentionally scored lowest to avoid shadowing static routes.
    score += 0;
  }

  return score;
}

function findBestEndpoint(endpoints, method, callEndpoint) {
  let best = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const endpoint of endpoints) {
    if (endpoint.method !== method) continue;
    const score = scoreEndpointMatch(callEndpoint, endpoint.path);
    if (score > bestScore) {
      best = endpoint;
      bestScore = score;
    }
  }

  return best;
}

module.exports = {
  sanitizePath,
  scoreEndpointMatch,
  findBestEndpoint,
};
