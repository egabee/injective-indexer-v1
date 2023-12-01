type Any = Record<string, any>

export interface GenericMessage {
  [key: string]: any
  type: string
  msg?: Any[]
  msgs?: Any[]
  clientMessage?: Any
}

// Represents a type that is not know by this indexer
export interface UnknownMessageType {
  // Message type name
  type: string
  // List of blocks that this message was found in
  blocks: number[]
}

export interface DecodedMessage {
  type: string
  [key: string]: any
}

export interface EventLog {
  type: string
  attributes: { key: string; value: string }[]
}

export interface TransactionObject {
  id: string
  //Events emitted from the transaction
  events: EventLog[]
  //" Messages included in transaction body - saved as json string "
  messages: GenericMessage[]
  log: string
  success: boolean
  gasUsed: bigint
  gasWanted: bigint
  //" Block number in which the balance was last modified "
  blockNumber: number
  // "Timestamp in which the balance was last modified "
  timestamp: bigint
}