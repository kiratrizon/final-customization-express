declare class ExpressClosure {
  // Placeholder for the next function
  // This should be implemented to call the next middleware in the stack
  next(param: Record<string, any>): boolean;
}
export default ExpressClosure;
