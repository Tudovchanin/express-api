import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET!;



export function generateToken(userId: number, role: string) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
}

export function verifyToken(token: string){
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}