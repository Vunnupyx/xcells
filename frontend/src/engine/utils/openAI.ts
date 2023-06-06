import {Configuration, OpenAIApi} from 'openai'
import {ChatCompletionRequestMessage} from 'openai/api'

export async function createChatCompletion(
  messages: ChatCompletionRequestMessage[],
  apiKey: string,
): Promise<string | undefined> {
  const response = await new OpenAIApi(
    new Configuration({
      apiKey,
    }),
  ).createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
  })
  return response.data.choices[0].message?.content
}
