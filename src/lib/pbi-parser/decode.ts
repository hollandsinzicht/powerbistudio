// Power BI schrijft DataModelSchema als UTF-16LE; .bim/.tmdl zijn meestal
// UTF-8 (al dan niet met BOM). BOM-detectie + heuristiek voor BOM-loze UTF-16LE.
export function decodeBytes(data: Uint8Array): string {
    if (data[0] === 0xff && data[1] === 0xfe) {
        return new TextDecoder('utf-16le').decode(data.subarray(2));
    }
    if (data[0] === 0xfe && data[1] === 0xff) {
        return new TextDecoder('utf-16be').decode(data.subarray(2));
    }
    if (data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf) {
        return new TextDecoder('utf-8').decode(data.subarray(3));
    }
    if (data.length >= 2 && data[1] === 0) {
        return new TextDecoder('utf-16le').decode(data);
    }
    return new TextDecoder('utf-8').decode(data);
}
