# Updating Types in CosmosMessageTypes.ts

In the `types/CosmosMessageTypes.ts` file, two duplications are caused by similar message names. Below is the suggested update:

## Changes Made

1. Update the import and type definition for `MsgVoteBeta`:

    ```
    import { MsgVote as MsgVoteBeta } from './proto-interfaces/cosmos/gov/v1beta1/tx';
    ...
    export type MsgVoteBetaMessage = CosmosMessage<MsgVoteBeta>;
    ```

2. Update the import and type definition for `ValidatorStacking`:

    ```
    import { ValidatorSet, Validator as ValidatorStacking } from './proto-interfaces/cosmos/tendermint/types/validator';
    ...
    export type ValidatorStackingMessage = CosmosMessage<ValidatorStacking>;
    ```

Ensure to replace 'path-to-cosmos-message' with the actual path to your `CosmosMessage` interface or type.

## Explanation

These changes address the duplications caused by similar message names in the `types/CosmosMessageType.ts` file. By updating the import statements and type definitions, the code is now cleaner and more maintainable.

Feel free to adjust the paths and types based on your project structure.

