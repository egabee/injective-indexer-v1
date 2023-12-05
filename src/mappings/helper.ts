import { CosmosTransaction } from '@subql/types-cosmos'
import { TextDecoder } from 'util'

import { Any as ProtoAny } from '../types/proto-interfaces/google/protobuf/any'
import { addToUnknownMessageTypes, decodeBase64IfEncoded, getTimestamp, toJson } from '../common/utils'
import { DecodedMessage, EventLog, GenericMessage, TransactionObject } from './interfaces'

const textDecoder = new TextDecoder('utf-8')

export function createTransactionObject(cosmosTx: CosmosTransaction): TransactionObject {
  const { tx, block } = cosmosTx

  const events: EventLog[] = tx.events.map(({ type, attributes }: any) => ({
    type,
    attributes: attributes.map(({ key, value }: any) => ({
      key: decodeBase64IfEncoded(key),
      value: decodeBase64IfEncoded(value),
    })),
  }))

  return {
    id: cosmosTx.hash,
    events,
    messages: [],
    gasUsed: BigInt(tx.gasUsed),
    gasWanted: BigInt(tx.gasWanted),
    success: tx.code === 0,
    blockNumber: block.header.height,
    timestamp: getTimestamp(block),
    log: tx.log || '',
  }
}

/**
 * Helper function to decode messages
 * @param value
 * @param typeUrl
 * @returns
 */
export function decodeMessage(value: Uint8Array, typeUrl: string, block?: number): DecodedMessage {
  const msgType = registry.lookupType(typeUrl)

  if (!msgType) {
    addToUnknownMessageTypes({ type: typeUrl, blocks: [block!] })
    logger.info(`Detect a not registered proto type ${typeUrl}`)
    return { type: typeUrl }
  }

  return { type: typeUrl, ...msgType.decode(value) }
}

/**
 * function to decode and handle different types of messages
 * @param decodedMsg
 * @param message
 * @returns
 */
export function handleMessageType(decodedMsg: any, message: ProtoAny): GenericMessage {
  const hasMessageProperty = Boolean(decodedMsg.msg || decodedMsg.msgs || decodedMsg.clientMessage)

  const { clientMessage, msgs, msg, ...meta } = decodedMsg

  let genericMessage: GenericMessage = { type: message.typeUrl }

  if (msgs) {
    const messageList = msgs as ProtoAny[]
    const decodedMsgs = messageList.map(({ typeUrl, value }) => decodeMessage(value, typeUrl))
    genericMessage = { msgs: decodedMsgs, ...meta, ...genericMessage }
  } else if (msg) {
    try {
      const parsedJson = textDecoder.decode(msg)
      genericMessage = { msg: parsedJson, ...meta, ...genericMessage }
      // logger.info(`+++++++++++++++>> ${toJson(genericMessage)}`)
    } catch (error) {
      genericMessage = { msg, ...meta, ...genericMessage }
      // logger.info(`this is ${toJson(genericMessage)}`)
    }
  } else if (clientMessage) {
    const { typeUrl, value } = clientMessage
    genericMessage = { clientMessage: decodeMessage(value, typeUrl), ...meta, ...genericMessage }
  } else if (!hasMessageProperty) {
    genericMessage = { ...decodedMsg, ...genericMessage }
  } else {
    genericMessage = { type: 'unknown' }
  }

  return genericMessage
}
