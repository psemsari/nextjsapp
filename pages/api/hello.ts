// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
const cookieParse = require('cookie');
type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const init = await fetch('https://www.vinted.fr/')
  const cookie : string = await init.headers.get('set-cookie') as string
  const auth = cookieParse.parse(cookie)['secure, _vinted_fr_session'];
  const recu = await fetch('https://www.vinted.fr/api/v2/users/71550545/items', {headers: {cookie: '_vinted_fr_session=' + auth}});
  const posts = await recu.json()
  console.log(posts);
  res.status(200).json(posts)
}
