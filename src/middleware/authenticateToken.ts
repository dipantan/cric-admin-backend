import jwt from 'jsonwebtoken';

const authenticateToken = (req: any, res: any, next: () => void) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET as string;

  if (!token) return res.sendStatus(401);

  jwt.verify(token, secret, (err: any, user: string | jwt.JwtPayload | undefined) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export default authenticateToken;
