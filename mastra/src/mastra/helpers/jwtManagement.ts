import jwt from "jsonwebtoken";

export const verifyToken = (token: string) => {
  try {
    if (token.startsWith("Bearer ")) token = token.substring(7);
    return jwt.verify(token, process.env.GOTRUE_JWT_SECRET!);
  } catch (error) {
    console.log("Error verifying token:", error);
    return false;
  }
};

export const userInfoToken = (token: string): { userId: string } => {
  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }
  try {
    const decoded = jwt.verify(token, process.env.GOTRUE_JWT_SECRET!) as {
      sub: string;
    };
    console.log("decoded", decoded);
    return { userId: decoded.sub };
  } catch (error) {
    console.error("Invalid token:", error);
    throw new Error("Invalid token");
  }
};
