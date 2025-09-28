import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { OnSchemaBreak, OnUpdate } from '@algorandfoundation/algokit-utils/types/app'
import { RealestateClient } from './RealestateClient'

export class RealestateFactory {
  private readonly client: AlgorandClient
  private readonly sender?: string
  constructor(options: { algorand: AlgorandClient; defaultSender?: string }) {
    this.client = options.algorand
    this.sender = options.defaultSender
  }

  public async deploy(options: { onSchemaBreak: OnSchemaBreak; onUpdate: OnUpdate }) {
    const appClient = new RealestateClient()
    const deployResult = await appClient.deploy({
      onSchemaBreak: options.onSchemaBreak,
      onUpdate: options.onUpdate,
    })
    return { appClient, appId: deployResult.appId }
  }
}
