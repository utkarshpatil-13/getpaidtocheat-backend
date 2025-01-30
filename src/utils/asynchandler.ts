import { Context } from 'hono';

const asyncHandler = (handler: (c: Context) => Promise<Response>) => {
  return async (c: Context): Promise<Response> => {
    try {
      return await handler(c);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
};

export { asyncHandler };
