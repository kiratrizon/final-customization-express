// query-builder.d.ts

/**
 * QueryBuilder is a class that allows dynamic building of SQL queries.
 * It supports operations like selecting fields, applying conditions, joins, ordering, and limiting the query results.
 */
declare class QueryBuilder {
  /**
   * Creates a new instance of the QueryBuilder class.
   * @param prop - The initial property or function to set the query.
   * @param isModel - Optional flag to specify if the query is for a model.
   */
  constructor(prop: string | Function, isModel?: boolean);

  /**
   * Specifies the fields to be selected in the query.
   * @param fields - The list of columns to select.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  select(...fields: string[]): this;

  /**
   * Adds a "where" condition to the query.
   * @param conditions - The conditions to apply, can be in various formats.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  where(...conditions: Array<any | string | [string, string, any]>): this;

  /**
   * Adds an "or where" condition to the query.
   * @param conditions - The conditions to apply, can be in various formats.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  orWhere(...conditions: Array<any | string | [string, string, any]>): this;

  /**
   * Adds a "where between" condition to the query.
   * @param column - The column to apply the "between" condition to.
   * @param values - The range of values to filter between.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  whereBetween(column: string, values: [any, any]): this;

  /**
   * Adds an "or where between" condition to the query.
   * @param column - The column to apply the "between" condition to.
   * @param values - The range of values to filter between.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  orWhereBetween(column: string, values: [any, any]): this;

  /**
   * Adds a "where not between" condition to the query.
   * @param column - The column to apply the "not between" condition to.
   * @param values - The range of values to exclude.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  whereNotBetween(column: string, values: [any, any]): this;

  /**
   * Adds an "or where not between" condition to the query.
   * @param column - The column to apply the "not between" condition to.
   * @param values - The range of values to exclude.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  orWhereNotBetween(column: string, values: [any, any]): this;

  /**
   * Adds a "where in" condition to the query.
   * @param column - The column to apply the "in" condition to.
   * @param values - The list of values to match.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  whereIn(column: string, values: any[]): this;

  /**
   * Adds an "or where in" condition to the query.
   * @param column - The column to apply the "in" condition to.
   * @param values - The list of values to match.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  orWhereIn(column: string, values: any[]): this;

  /**
   * Adds a "where not in" condition to the query.
   * @param column - The column to apply the "not in" condition to.
   * @param values - The list of values to exclude.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  whereNotIn(column: string, values: any[]): this;

  /**
   * Adds an "or where not in" condition to the query.
   * @param column - The column to apply the "not in" condition to.
   * @param values - The list of values to exclude.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  orWhereNotIn(column: string, values: any[]): this;

  /**
   * Adds a "where is null" condition to the query.
   * @param column - The column to apply the "is null" condition to.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  whereNull(column: string): this;

  /**
   * Adds an "or where is null" condition to the query.
   * @param column - The column to apply the "is null" condition to.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  orWhereNull(column: string): this;

  /**
   * Adds a "where is not null" condition to the query.
   * @param column - The column to apply the "is not null" condition to.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  whereNotNull(column: string): this;

  /**
   * Adds an "or where is not null" condition to the query.
   * @param column - The column to apply the "is not null" condition to.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  orWhereNotNull(column: string): this;

  /**
   * Adds an inner join to the query.
   * @param table - The table to join.
   * @param conditions - The conditions for the join.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  join(table: string, ...conditions: any[]): this;

  /**
   * Adds a left join to the query.
   * @param table - The table to join.
   * @param conditions - The conditions for the join.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  leftJoin(table: string, ...conditions: any[]): this;

  /**
   * Adds a right join to the query.
   * @param table - The table to join.
   * @param conditions - The conditions for the join.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  rightJoin(table: string, ...conditions: any[]): this;

  /**
   * Adds a full join to the query.
   * @param table - The table to join.
   * @param conditions - The conditions for the join.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  fullJoin(table: string, ...conditions: any[]): this;

  /**
   * Adds a cross join to the query.
   * @param table - The table to join.
   * @param conditions - The conditions for the join.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  crossJoin(table: string, ...conditions: any[]): this;

  /**
   * Specifies the columns to group the results by.
   * @param columns - The list of columns to group by.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  groupBy(...columns: string[]): this;

  /**
   * Specifies the order in which to sort the results.
   * @param column - The column to order by.
   * @param direction - The direction to sort in ('ASC' or 'DESC').
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  orderBy(column: string, direction?: "ASC" | "DESC"): this;

  /**
   * Specifies the maximum number of results to return.
   * @param value - The maximum number of results.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  limit(value: number): this;

  /**
   * Specifies the number of results to skip.
   * @param value - The number of results to skip.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  offset(value: number): this;

  /**
   * Adds a "having" condition to the query.
   * @param conditions - The conditions to apply, can be in various formats.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  having(...conditions: Array<any | string | [string, string, any]>): this;

  /**
   * Adds a "having between" condition to the query.
   * @param column - The column to apply the "between" condition to.
   * @param values - The range of values to filter between.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  havingBetween(column: string, values: [any, any]): this;

  /**
   * Adds a "having in" condition to the query.
   * @param column - The column to apply the "in" condition to.
   * @param values - The list of values to match.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  havingIn(column: string, values: any[]): this;

  /**
   * Adds a "having not in" condition to the query.
   * @param column - The column to apply the "not in" condition to.
   * @param values - The list of values to exclude.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  havingNotIn(column: string, values: any[]): this;

  /**
   * Adds a "having is null" condition to the query.
   * @param column - The column to apply the "is null" condition to.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  havingNull(column: string): this;

  /**
   * Adds a "having is not null" condition to the query.
   * @param column - The column to apply the "is not null" condition to.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  havingNotNull(column: string): this;

  /**
   * Adds an "or having" condition to the query.
   * @param conditions - The conditions to apply, can be in various formats.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  orHaving(...conditions: Array<any | string | [string, string, any]>): this;

  /**
   * Adds an "or having between" condition to the query.
   * @param column - The column to apply the "between" condition to.
   * @param values - The range of values to filter between.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  orHavingBetween(column: string, values: [any, any]): this;

  /**
   * Adds an "or having in" condition to the query.
   * @param column - The column to apply the "in" condition to.
   * @param values - The list of values to match.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  orHavingIn(column: string, values: any[]): this;

  /**
   * Private method for handling the validation of "or" conditions.
   * @returns void
   */
  private orValidator(): void;

  /**
   * Private method to add a join condition.
   * @param type - The type of join (e.g., INNER JOIN, LEFT JOIN).
   * @param table - The table to join.
   * @param conditions - The conditions for the join.
   * @returns void
   */
  private joinAdd(type: string, table: string, conditions: any[]): void;

  /**
   * Private method to check if the where conditions are empty.
   * @returns A boolean indicating whether there are any where conditions.
   */
  private isWhereEmpty(): boolean;

  /**
   * Private method to get the current conditions and values for the query.
   * @returns An object containing the "where" conditions and their values.
   */
  private getConditions(): { where: any[]; values: any[] };

  /**
   * Retrieves all the properties for the current query.
   * This includes table name, fields, join conditions, where conditions, and other query parameters.
   * @returns An object containing the query properties like table, fields, where, join, etc.
   */
  getAllProps(): {
    table: string;
    fields: string[];
    join: any[];
    where: any[];
    values: any[];
    orWhere: any[];
    orValues: any[];
    groupBy: string[];
    having: any[];
    havingValues: any[];
    orHaving: any[];
    orHavingValues: any[];
    orderBy: string[];
    limit: number | null;
    offset: number | null;
    useIndex: string[];
  };

  /**
   * Specifies the indexes to use for the query.
   * This is used to optimize query performance by defining specific indexes.
   * @param indexes - One or more index names.
   * @throws Error if no index is provided or if any index is invalid.
   * @returns The instance of the QueryBuilder class for method chaining.
   */
  useIndex(...indexes: string[]): this;

  /**
   * Converts the current query into a raw SQL string.
   * @returns The SQL query as a string.
   */
  toSql(): string;

  /**
   * Converts the current query into a raw SQL string with the associated values for placeholders.
   * Escapes the values and generates the final SQL query string.
   * @returns The SQL query string with escaped values.
   */
  toSqlWithValues(): string;

  /**
   * Executes the query and retrieves all results.
   * This method runs the query and returns the data as an array, optionally mapped to model instances.
   * @returns A promise that resolves to the result set, either as raw data or model instances.
   */
  async get(): Promise<any[]>;

  /**
   * Executes the query and retrieves the first result.
   * This method runs the query and returns the first matching result, or null if no result is found.
   * @returns A promise that resolves to the first result, or null if no result is found.
   */
  async first(): Promise<any | null>;

  /**
   * Inserts data into the table.
   * This method inserts a single record or multiple records into the database.
   * @param data - The data to insert, either as an array of objects or a single object.
   * @throws Error if the data is invalid.
   * @returns A promise that resolves to the result of the insert operation.
   */
  async insert(data: object | object[]): Promise<any>;
}

export = QueryBuilder;
