import {Configuration, OpenAIApi} from 'openai'
import {ChatCompletionRequestMessage} from 'openai/api'

export const CHATGPT_QUERY = '/chatgpt'
export const CHATGPT_SINGLE_LINE = '--join'
export const CHATGPT_TABLE = '--table'
export const NARRATIVE_REGEX = '@+([\\w-]+)'

export const serializeChatGPT = (content: string): string => {
  return content
    .replace(new RegExp(`${CHATGPT_QUERY}|${CHATGPT_SINGLE_LINE}|${CHATGPT_TABLE}|${NARRATIVE_REGEX}`, 'g'), '')
    .trim()
}

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
