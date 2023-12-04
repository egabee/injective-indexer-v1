import { CosmosTransaction } from '@subql/types-cosmos'
import { toJson, addToUnknownMessageTypes } from '../common/utils'
import { createTransactionObject, handleMessageType } from './helper'

export async function handleTx(tx: CosmosTransaction): Promise<void> {
  const height = tx.block.header.height
  logger.info(`-------- ${height} -----------`)

  const txMessages = []

  for (const { typeUrl, value } of tx.decodedTx.body.messages) {
    const knownType = registry.lookupType(typeUrl)

    if (!knownType) {
      const unknownMsgType = { type: typeUrl, blocks: [height] }
      addToUnknownMessageTypes(unknownMsgType)

      logger.info(`%%%%%%%%%% UnknownType detected %%%%%%%%% ${toJson(unknownMsgType)} `)

      continue
    }

    try {
      const decodedMsg = knownType.decode(value)
      const fullMsg = handleMessageType(decodedMsg, { typeUrl, value })
      txMessages.push(fullMsg)
    } catch (error) {
      throw error // throw the error to stop the indexer
    }
  }

  const transaction = createTransactionObject(tx)
  transaction.messages = txMessages
}
