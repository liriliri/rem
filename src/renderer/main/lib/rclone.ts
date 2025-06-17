import axios from 'axios'

export async function listRemotes(): Promise<string[]> {
  const response = await axios.get('/config/listremotes')

  return response.data.remotes
}
