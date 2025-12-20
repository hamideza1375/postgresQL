import { NextRequest } from "next/server";



type userType = {
  email: string;
  username: string;
  userId: string;
  products: object[];
  isAdmin: boolean;
};

export default function getUser(req: NextRequest): userType {
    return JSON.parse(req.headers.get('user') ||'{}');
}
