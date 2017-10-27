namespace RideStylerShowcase{
    export type Guid = number[];
    export namespace GUIDHelper {
        // Maps for number <-> hex string conversion
        let byteToHex:string[] = [];
        let hexToByte:{[hex:string]:number} = {};
        
        for (let i = 0; i < 256; i++) {
            byteToHex[i] = (i + 0x100).toString(16).substr(1);
            hexToByte[byteToHex[i]] = i;
        }

        /**
         * Parse a Guid into a common format
         * @param id The ID to parse
         * @param buffer An existing Guid/array to write to
         * @param offset The offset to begin writing at
         */
        export function parse(id:string, buffer?:Guid, offset?:number):Guid {
            const i = (buffer && offset) || 0;
            let j = 0;
          
            buffer = buffer || [];

            id.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
                if (j < 16) // Don't overflow!
                    buffer[i + j++] = hexToByte[oct];

                return '';
            });
          
            // Zero out remaining bytes if string was short
            while (j < 16) buffer[i + j++] = 0;
          
            return buffer;
        }

        /**
         * Convert a parsed Guid back into a string
         * @param id A parsed Guid to unparse
         * @param offset Starting index in the id to begin reading from
         */
        export function unparse(id:Guid, offset?:number):string {
            let i = offset || 0;
            const bth = byteToHex;

            return  bth[id[i++]] + bth[id[i++]] +
                    bth[id[i++]] + bth[id[i++]] + '-' +
                    bth[id[i++]] + bth[id[i++]] + '-' +
                    bth[id[i++]] + bth[id[i++]] + '-' +
                    bth[id[i++]] + bth[id[i++]] + '-' +
                    bth[id[i++]] + bth[id[i++]] +
                    bth[id[i++]] + bth[id[i++]] +
                    bth[id[i++]] + bth[id[i++]];
        }

        /**
         * Compare two Guids to determine if they are equal
         * @param idA The first ID to parse and then compare
         * @param idB The second ID to parse and then compare
         */
        export function areEqual(idA:string, idB:string):boolean;
        /**
         * Compare two Guids to determine if they are equal
         * @param idA The first ID to compare
         * @param idB The second ID to compare
         */
        export function areEqual(idA:Guid,   idB:Guid):boolean;
        export function areEqual(idA:string|Guid, idB:string|Guid):boolean {
            // Handle undefined/unspecified parameters
            {
                if (!idA) {
                    if (!idB) return true;
                    return false;
                }
                if (!idB) return false;
            }

            let guidA:Guid;
            let guidB:Guid;

            if (typeof idA === 'string') guidA = parse(idA);
            else guidA = idA;

            if (typeof idB === 'string') guidB = parse(idB);
            else guidB = idB;

            for (let i = 0; i < guidA.length; i++) {
                let byteA:number = guidA[i];
                let byteB:number = guidB[i]

                if (byteA !== byteB) return false;
            }

            return true;
        }
    }
}