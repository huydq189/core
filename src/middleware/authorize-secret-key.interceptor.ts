import { Next } from '@heronjs/express';
import { HttpRequest as Request, HttpResponse as Response } from '@heronjs/express/types/express.types';
import { MismatchedTokenError, UnauthorizedError } from './errors';

export const AuthorizeSecretKeyInterceptor =
    (secretKey: string) => (req: Request, res: Response, next: Next) => {
        const token = req.headers['internal-api-key'] as string;
        if (!token) {
            throw new UnauthorizedError();
        }
        if (token !== secretKey) throw new MismatchedTokenError();
        return next();
    };
