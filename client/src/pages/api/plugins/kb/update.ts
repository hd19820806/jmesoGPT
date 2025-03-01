import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase, KB } from '@/service/mongo';
import { authUser } from '@/service/utils/auth';
import type { KbUpdateParams } from '@/api/request/kb';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { id, name, avatar, tags = '' } = req.body as KbUpdateParams;

    if (!id || !name) {
      throw new Error('缺少参数');
    }

    // 凭证校验
    const { userId } = await authUser({ req, authToken: true });

    await connectToDatabase();

    await KB.findOneAndUpdate(
      {
        _id: id,
        userId
      },
      {
        ...(name && { name }),
        ...(avatar && { avatar }),
        tags: tags.split(' ').filter((item) => item)
      }
    );

    jsonRes(res);
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
