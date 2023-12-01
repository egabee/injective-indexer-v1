import { CosmosBlock, CosmosTransaction } from '@subql/types-cosmos'
import isBase64 from 'is-base64'
import * as fs from 'fs'
import { UnknownMessageType } from '../mappings/interfaces'

export function getTimestamp(block: CosmosBlock): bigint {
  return BigInt(block.header.time.valueOf())
}

export function toJson(o: any): string {
  return JSON.stringify(o, (_, v) => (typeof v === 'bigint' ? v.toString() : v)).replace(/\\/g, '')
}

export function isTransactionSuccessful(tx: CosmosTransaction): boolean {
  return tx.tx.code === 0
}

/**
 * Decodes a string if it's Base64 encoded; otherwise, returns the original string.
 *
 * @param {string} input - The input string to decode if it's Base64 encoded.
 * @returns {string} - The decoded string or the original input string.
 */
export function decodeBase64IfEncoded(input: string): string {
  return isBase64(input) ? Buffer.from(input, 'base64').toString() : input
}

const jsonFilePath = '/app/unknown_types/unknown_types.json'

export function addToUnknownMessageTypes(newEntry: UnknownMessageType): void {
  logger.info(`this is ========>> ${toJson(newEntry)}`)
  let data: any = []
  const jsonData = fs.readFileSync(jsonFilePath, 'utf-8')
  if (jsonData) {
    data = JSON.parse(jsonData)
  }
  logger.info('File exists. Existing data:', toJson(data))

  try {
    const existingEntryIndex = data.findIndex((entry: any) => entry['type'] === newEntry['type'])

    logger.info(`Entry to be added: ${toJson(newEntry)}`)

    if (existingEntryIndex === -1) {
      // Entry doesn't exist, create a new entry
      data.push({
        type: newEntry.type,
        heights: newEntry.blocks,
      })

      logger.info('New entry added successfully.')
    } else {
      if (data[existingEntryIndex]['heights']) {
        const existingHeights = data[existingEntryIndex]['heights']
        
        const newHeights = newEntry.blocks
        const uniqueHeights = Array.from(new Set([...existingHeights, ...newHeights]))

        data[existingEntryIndex]['heights'] = uniqueHeights
      } else {
        data[existingEntryIndex]['heights'] = newEntry.blocks
      }
    }

    // Write the updated data back to the JSON file
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    logger.error('Error during processing:', error)
    throw error // Rethrow the error to stop the indexer if there is an issue
  }
}
