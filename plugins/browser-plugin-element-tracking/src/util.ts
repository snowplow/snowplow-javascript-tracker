export function nodeIsElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}

export function defineBoundaries(boundaryPixels: number | [number, number] | [number, number, number, number]) {
  let boundTop: number, boundRight: number, boundBottom: number, boundLeft: number;
  if (typeof boundaryPixels === 'number') {
    boundTop = boundRight = boundBottom = boundLeft = boundaryPixels;
  } else if (Array.isArray(boundaryPixels)) {
    if (boundaryPixels.length === 2) {
      boundTop = boundBottom = boundaryPixels[0];
      boundRight = boundLeft = boundaryPixels[1];
    } else if (boundaryPixels.length === 4) {
      [boundTop, boundRight, boundBottom, boundLeft] = boundaryPixels;
    } else {
      boundTop = boundRight = boundBottom = boundLeft = 0;
    }
  } else {
    boundTop = boundRight = boundBottom = boundLeft = 0;
  }

  return { boundTop, boundRight, boundBottom, boundLeft };
}
