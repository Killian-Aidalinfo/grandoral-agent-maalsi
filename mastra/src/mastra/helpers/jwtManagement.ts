import jwt from 'jsonwebtoken';

export const verifyToken = (token: string) => {
  try {
    if(token.startsWith('Bearer ')) token = token.substring(7);
    return jwt.verify(token, process.env.GOTRUE_JWT_SECRET!);
  } catch (error) {
    console.error(error);
    throw new Error('Invalid token');
  }
};