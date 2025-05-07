/** SQL comparison operators */
type Operator = "=" | "!=" | "<" | ">" | "<=" | ">=" | "LIKE" | "NOT LIKE";

/**
 * QueryBuilder provides an expressive and chainable interface for building SQL queries.
 */
export default class QueryBuilder {
  /**
   * Creates a new QueryBuilder instance.
   * @param prop - Initial configuration or model.
   * @param isModel - Indicates if the builder is tied to a model.
   */
  constructor(prop: any, isModel?: boolean);

  /**
   * Specifies the columns to select.
   */
  select(...fields: string[]): this;

  /** Adds a basic WHERE condition. */
  where(...args: any): this;

  /** Adds a basic OR WHERE condition. */
  orWhere(...args: any): this;

  /** Adds a WHERE BETWEEN condition. */
  whereBetween(...args: any): this;
  /** Adds an OR WHERE BETWEEN condition. */
  orWhereBetween(...args: any): this;
  /** Adds a WHERE NOT BETWEEN condition. */
  whereNotBetween(...args: any): this;
  /** Adds an OR WHERE NOT BETWEEN condition. */
  orWhereNotBetween(...args: any): this;

  /** Adds a WHERE IN condition. */
  whereIn(column: string, values: any[]): this;
  /** Adds an OR WHERE IN condition. */
  orWhereIn(column: string, values: any[]): this;
  /** Adds a WHERE NOT IN condition. */
  whereNotIn(column: string, values: any[]): this;
  /** Adds an OR WHERE NOT IN condition. */
  orWhereNotIn(column: string, values: any[]): this;

  /** Adds a WHERE NULL condition. */
  whereNull(column: string): this;
  /** Adds an OR WHERE NULL condition. */
  orWhereNull(column: string): this;
  /** Adds a WHERE NOT NULL condition. */
  whereNotNull(column: string): this;
  /** Adds an OR WHERE NOT NULL condition. */
  orWhereNotNull(column: string): this;

  /** Orders the results by a column. */
  orderBy(column: string, direction?: string): this;

  /** Groups the results by the given columns. */
  groupBy(...columns: string[]): this;

  /** Limits the number of results returned. */
  limit(value: number): this;

  /** Offsets the results by a given number. */
  offset(value: number): this;

  /** Adds an INNER JOIN clause. */
  join(table: string, ...conditions: any[]): this;
  /** Adds a LEFT JOIN clause. */
  leftJoin(table: string, ...conditions: any[]): this;
  /** Adds a RIGHT JOIN clause. */
  rightJoin(table: string, ...conditions: any[]): this;
  /** Adds a FULL JOIN clause. */
  fullJoin(table: string, ...conditions: any[]): this;
  /** Adds a CROSS JOIN clause. */
  crossJoin(table: string, ...conditions: any[]): this;

  /**
   * Executes the query and returns the results.
   */
  get(): Promise<any[]>;

  /**
   * Executes the query and returns a single result.
   */
  first(): Promise<any>;

  /**
   * Executes the query and returns the count of results.
   */
  count(): Promise<number>;

  /**
   * Executes the query and return the insert ID.
   */
  insert(data: Object | Object[]): Promise<number>;

  /**
   * Executes the query and returns the number of affected rows.
   */
  update(data: Object): Promise<number>;

  /**
   * Executes the query and returns the number of deleted rows.
   */
  delete(): Promise<number>;
}
